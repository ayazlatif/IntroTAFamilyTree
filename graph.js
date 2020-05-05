import { buildInfoPanel, resetInfoPanel, displayCohort } from './info_panel.js';
import { NODE_SIZE,
        MEDIUM_NODE_SIZE,
        LARGE_NODE_SIZE,
        LIGHT_OPACITY,
        ATTRACTION_FORCE,
        LINK_STRENGTH,
        DURATION,
        Y_TEXT_SMALL,
        Y_TEXT_MEDIUM,
        Y_TEXT_LARGE,
        YEAR_GAP
    } from './index.js';
import { Queue } from './Queue.js';
import { autocomplete } from './autocomplete.js';

const QUARTERS = ['wi', 'sp', 'su', 'au'];

var separateQuarters = false;
var width = document.getElementById("vizContainer").clientWidth;
var height = window.innerHeight - HEIGHT_ADJUST;
var HEIGHT_ADJUST = 50;
var color = d3.scaleOrdinal(d3.schemeCategory10);
var filterSet = new Set();
var focusNodes = new Set();
var lightNodes = new Set();

var allData;
var data;
var simulation;
var node;
var link;

var svg = d3.select("#viz");
var graphContainer = svg.append("g").attr("id", "graph");
var linkData = graphContainer.append("g").attr("class", "links");
var nodeData = graphContainer.append("g").attr("class", "nodes");

document.getElementById("separateQuarters").onclick = function() {
    this.innerHTML = `${separateQuarters ? "Separate" : "Collapse"} Quarters`;
    separateQuarters = !separateQuarters;
    renderGraph();
}

// sets up zoom
var zoom = d3.zoom()
    .on("zoom", function() {
        var b = d3.select("#graph").node().getBBox();
        var x0 = b.x;
        var x1 = b.x + b.width;
        var t = d3.event.transform;
        if (t.invertX(0) > x0) t.x = -x0 * t.k;
        else if (t.invertX(width) < x1) t.x = width - x1 * t.k;
        graphContainer.attr("transform", t);
    });

zoom.scaleExtent([.1, 1]);

window.onresize = resizeWindow;

function resizeWindow() {
    width = document.getElementById("viz").width.baseVal.value;
    height = window.innerHeight - HEIGHT_ADJUST;
    d3.select("#viz").attr("viewBox", `0 0 ${width} ${height}`);
}

// Arrow heads marker designs
var defs = svg.append('defs');
buildArrowHeads();

function buildArrowHeads() {
    function marker(id) {
        defs.append('marker')
            .attr("id", id)
            .attr("viewBox", "-0 -5 10 10")
            .attr("refX", "15")
            .attr("refY", "0")
            .attr("orient", "auto")
            .attr("markerWidth", "13")
            .attr("markerHeight", "13")
            .attr("xoverflow", "visible")
            .append("svg:path")
            .attr("d", 'M 0,-3 L 10 ,0 L 0,3')
            .style('stroke','none');
    }
    marker("arrowhead-parent142");
    marker("arrowhead-parent143");
    marker("arrowhead-parent143x");
}


function getNames() {
    return allData.nodes.map((el) => el.id);
}

export function loadGraphFromJson(graph) {
    allData = graph;

    simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id((d) => d.id)
            .distance(25).strength(LINK_STRENGTH))
        .force("charge", d3.forceManyBody().strength(ATTRACTION_FORCE))
        .force("x", d3.forceX(function(d) { return width / 2; }).strength(1))
        .on("tick", ticked);
    
    var cohorts = [...new Set(graph.nodes.map((d) => d.cohort))];
    autocomplete(document.getElementById("cohortList"), cohorts);
    setUpYears(cohorts);

    // Randomly show a year
    document.getElementById(Math.floor(Math.random() * 10) + 11).click();

    resizeWindow();
    svg.call(zoom);

    function setUpYears(cohorts) {
        function renderYearButtons() {
            var button = d3.select("#filter")
            .selectAll("button")
            .data(years)
            .enter();

            button.append("button")
                .style("background-color", (d) => colorCohort(maxCohortCountInYear(cohortCounts, d)))
                .style("opacity", 0.3)
                .attr("type", "button")
                .attr("id", (d) => d)
                .text(function(d) { return "20" + d; })
                .on("click", filterYears)
                .on("mouseover", function() {
                    d3.select(this).style("opacity", "0.5");
                })
                .on("mouseout", function() {
                    d3.select(this).style("opacity", (d) => filterSet.has(d) ? 0.3 : 1);
                });
        }

        function maxCohortCountInYear(cohortCounts, year) {
            var maxQuarter = '';
            var max = -Infinity;
            QUARTERS.forEach(function(elm) {
                elm = `${year}${elm}`;
                var currentCount = cohortCounts[elm];
                if (cohortCounts[elm] > max) {
                    max = currentCount;
                    maxQuarter = elm;
                }
            })
            return maxQuarter;
        }

        var years = [...new Set(cohorts.map((d) => d.substring(0, 2)))];
        var cohortCounts = {};
        cohorts.forEach(function(coh) {
            if (!(coh in cohortCounts)) {
                cohortCounts[coh] = 0;
            }
            cohortCounts[coh] += 1;
        });

        years.sort();
        years.forEach((y) => filterSet.add(y));
        renderYearButtons();
    }

    function filterYears(d) {

        if (filterSet.has(d)) {
            filterSet.delete(d);
            d3.select(this).style("opacity", 1);
        } else {
            filterSet.add(d);
            d3.select(this).style("opacity", 0.3);
        }
        var filteredNodes = allData.nodes.filter((d) => !filterSet.has(d.cohort.substring(0, 2)));
        var filteredLinks = allData.links
            .filter((d) => !filterSet.has(d.info_src.cohort.substring(0, 2)) &&
                    !filterSet.has(d.info_child.cohort.substring(0, 2))
            );

        data = {nodes : filteredNodes, links : filteredLinks};
        renderGraph();
    }

    // allows for movement of nodes and links
    function ticked() {
        function updateLink(link) {
            link.attr("x1", function(d) { return fixNaN(d.source.x); })
                .attr("y1", function(d) { return fixNaN(d.source.y); })
                .attr("x2", function(d) { return fixNaN(d.target.x); })
                .attr("y2", function(d) { return fixNaN(d.target.y); });
        }

        // hack for NaN when updating tick
        function fixNaN(n) {
            return isFinite(n) ? n : 0;
        }

        function updateNode(selection) {
            selection.attr("transform", function(d) {
                return "translate(" + fixNaN(d.x) + "," + fixNaN(d.y) + ")";
            });
        }

        node.call(updateNode);
        link.call(updateLink);
    }
}

function renderGraph() {
    simulation.alpha(0.5);
    var ids = data.nodes.map((d) => d.id);
    var removeThese = Array.from(focusNodes).filter(function(id) {
        return !ids.includes(id);
    });

    removeThese.forEach((id) => focusNodes.delete(id));

    lightNodes.clear();
    addLightNodes();

    linkData = graphContainer
        .select(".links")
        .selectAll("line")
        .data(data.links, function(d) { return d.source + "-" + d.target; });

    linkData.exit().remove();

    link = linkData
            .enter()
        .append("line")
            .attr("opacity", LIGHT_OPACITY)
            .attr("class", function(d) { return d.type })
            .attr("stroke", "#aaa")
            .attr("stroke-width", "1px")
            .attr('marker-end',function(d) { return `url(#arrowhead-${d.type})`; })
            .merge(linkData);

    nodeData = graphContainer.select(".nodes")
        .selectAll("g")
            .data(data.nodes, (d) => d.id);

    var transition = nodeData.exit().transition().duration(DURATION)

    transition.select("circle").attr("r", 0)
    nodeData.exit().remove();

    node = nodeData
            .enter()
        .append("g")
        .attr("class", (d) => d.cohort)
        .on("mouseover", focus).on("mouseout", unfocus)

    node.append("circle")
        .attr("r", NODE_SIZE)
        .attr("fill", function(d) { return colorCohort(d.cohort); });

    node.append("text")
        .attr("display", "none")
        .attr("x", -2*NODE_SIZE)
        .attr("y", 3*NODE_SIZE)
        .text(function(d) { return d.id; });

    node = node.merge(nodeData).on("click", function() {
        var datum = d3.select(this).datum();
        var nodeSize;
        var opacity = 1;
        var yText;
        var display = "show";
        if (focusNodes.has(datum.id)) {
            nodeSize = MEDIUM_NODE_SIZE;
            yText = Y_TEXT_MEDIUM;
            focusNodes.delete(datum.id);
            getLineageSet(getLineage(datum.id, data)).forEach(function(a) {
                if (focusNodes.has(a)) {
                    return;
                }
                lightNodes.delete(a);
            });
        } else {
            nodeSize = LARGE_NODE_SIZE;
            yText = Y_TEXT_LARGE;
            focusNodes.add(datum.id);
        }

        animateNode(d3.select(this), nodeSize, opacity, yText, display);
        // handle case when focus and light node select/deselct overlap
        addLightNodes();
    }).call(
        d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
    );

    simulation.nodes(data.nodes);
    simulation.force("link").links(data.links);
    simulation.force("y", d3.forceY(function (d) { 
        height = window.innerHeight - HEIGHT_ADJUST;
        var quarter = d.cohort.substring(2);
        var minYear = parseInt(Math.min(...data.nodes.map((d) => d.cohort.substring(0, 2))));
        var space = separateQuarters ? 300 : 200;

        var forceY = height / 2 + (((parseInt(d.cohort.substring(0, 2)) - minYear) * space));
        if (separateQuarters) {
            var adjust = QUARTERS.indexOf(quarter) + 1;
            forceY -= (space / adjust);
        }
        return forceY;

    }).strength(1));

    simulation.alphaTarget(0.05).restart();
    unfocus();

    document.getElementById("searchBtn").onclick = function() {
        var name = document.getElementById("myInput").value;
        var personDatum = findData(name, allData);
        buildInfoPanel(personDatum, colorCohort(personDatum.cohort), getLineage(name, allData));
        var person;
        d3.select(".nodes").selectAll("g").each(function(d) {
            if (d.id === name) {
                person = this;
            }
        });

        if (!person) {
            var person = allData.nodes.filter((d) => d.id === name)[0];
            var cohort = person.cohort;
            var year = cohort.substring(0, 2);
            focusNodes.add(name);
            document.getElementById(year).click();
            return;
        }
        // var datum = d3.select(person).datum();
        // buildInfoPanel(datum, colorCohort(datum.cohort), getLineage(name, allData));

        focusNodes.add(name);
        getLineageSet(getLineage(name, data)).forEach((a) => lightNodes.add(a));

        d3.select(person).dispatch("mouseout"); // focus on this
    };

    document.getElementById("reset").onclick = resetSearch;
    autocomplete(document.getElementById("myInput"), getNames());

    function resetSearch() {
        focusNodes.clear();
        lightNodes.clear();
        unfocus();
        resetInfoPanel();
        document.getElementById("cohortList").value = "";
        document.getElementById("myInput").value = "";
    }

    document.getElementById("cohortSearchBtn").onclick = searchCohort;

    setOnClickFamilyFilter();

    function setOnClickFamilyFilter() { 
        var elements = [...document.getElementsByClassName("radio")]
        elements.forEach(
            (elm) => elm.onclick = function() {
                lightNodes.clear();
                addLightNodes();
                unfocus();
            }
        );
    }


}

function addLightNodes() {
    focusNodes.forEach((id) => getLineageSet(getLineage(id, data))
        .forEach((d) => lightNodes.add(d)));
}

function searchCohort() {
    let cohort = document.getElementById("cohortList").value;
    var people = data.nodes.filter((d) => d.cohort === cohort);

    if (people.length == 0) {
        people = allData.nodes.filter((d) => d.cohort === cohort);
        people.forEach((a) => focusNodes.add(a.id));
        var year = people[0].cohort.substring(0, 2);
        document.getElementById(year).click();
        displayCohort(cohort, people);
        return;
    }
    people.forEach((a) => focusNodes.add(a.id));
    addLightNodes();

    unfocus()

    displayCohort(cohort, people);
}

function findData(id, targetData) {
    var result = targetData.nodes.filter((d) => d.id === id);
    return result ? result[0] : undefined;
}

function searchBfs(start, childrenFn) {
    var explore = new Queue();
    explore.add(start);
    var visited = new Set();
    while (!explore.isEmpty()) {
        var next = explore.remove()
        if (visited.has(next)) {
            continue;
        }
        visited.add(next);
        for (var i = 0; i < childrenFn(next).length; i++) {
            var child = childrenFn(next)[i];
            if (!visited.has(child)) {
                explore.add(child);
            }
        }
    }
    return visited;
}

// startId for the search
// targetData for where you want to find lineage
// give it data for filtering and allData to get full lineage
function getLineage(startId, targetData) {
    var familyFilter = getCheckedRadioValue("familySelection");
    var lineage = new Set();
    if (familyFilter === "single") {
        lineage.add(startId);
    }
    var children = []
    var parents = []
    if (familyFilter === "children" || familyFilter === "all") {
        children = searchBfs(findData(startId, targetData), function(elm) {
            if (!elm) {
                return [];
            }
            return elm.children.map((d) => findData(d.id, targetData)).filter((d) => d);
        });
    }

    if (familyFilter === "parents" || familyFilter === "all") {
        parents = searchBfs(findData(startId, targetData), function(elm) {
            if (!elm) {
                return [];
            }
            var result = [elm.parent142, elm.parent143, elm.parent143x];
            return result.filter((d) => d).map((d) => findData(d, targetData)).filter((d) => d);
        });
    }
    return {children : children, parents : parents};
}

function unfocus() {
    var nodeSize = (d) => focusNodes.has(d.id) ? LARGE_NODE_SIZE : NODE_SIZE;
    var opacity = (d) => lightNodes.has(d.id) || lightNodes.size == 0 ? 1 : LIGHT_OPACITY;
    var yText = (d) => focusNodes.has(d.id) ? Y_TEXT_LARGE : Y_TEXT_SMALL;
    var display = (d) => lightNodes.has(d.id) ? "show" : "none"

    animateNode(node, nodeSize, opacity, yText, display);

    var linkOpacity = (d) => lightNodes.has(d.source.id) && lightNodes.has(d.target.id) ? 1 : LIGHT_OPACITY;
    var strokeWidth = (d) => lightNodes.has(d.source.id) && lightNodes.has(d.target.id) ? "2px" : "1px";
    animateLinks(linkOpacity, strokeWidth);
}

function getLineageSet(parentsAndChildren) {
    var lineage = new Set()
    parentsAndChildren.children.forEach((a) => lineage.add(a.id));
    parentsAndChildren.parents.forEach((a) => lineage.add(a.id));
    return lineage;
}

function focus(person) {

    buildInfoPanel(person, colorCohort(person.cohort), getLineage(person.id, allData));
    var id = person.id;
    var parentsAndChildren = getLineage(person.id, data);
    var lineage = getLineageSet(parentsAndChildren);

    var nodeSize = function(d) {
        if (focusNodes.has(d.id)) {
            return LARGE_NODE_SIZE;
        } else if (d.id == id) {
            return MEDIUM_NODE_SIZE;
        } else {
            return NODE_SIZE;
        }
    };

    var opacity = function(d) { return lineage.has(d.id) ? 1 : LIGHT_OPACITY; };
    var yText = (d) => focusNodes.has(d.id) ? Y_TEXT_LARGE : Y_TEXT_SMALL;
    var display = (d) => lineage.has(d.id) ? "show" : "none";

    animateNode(node, nodeSize, opacity, yText, display);

    var linkOpacity = (d) =>
            lineage.has(d.source.id) && lineage.has(d.target.id) ? 1 : LIGHT_OPACITY;
    var strokeWidth = (d) => lineage.has(d.source.id) && lineage.has(d.target.id) ? "2px" : "1px";
    animateLinks(linkOpacity, strokeWidth);
}

function dragstarted(d) {
    d3.event.sourceEvent.stopPropagation();
    if (!d3.event.active) simulation.alphaTarget(0.05).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0.05);
    d.fx = null;
    d.fy = null;
}

function animateNode(selection, nodeSize, opacity, yText, display) {
    selection.select("circle")
        .transition()
        .duration(DURATION)
        .attr("r", nodeSize)
        .attr("opacity", opacity);

    selection.select("text")
        .transition()
        .duration(DURATION)
        .attr("y", yText)
        .attr("display", display);
}

function animateLinks(opacity, strokeWidth) {
    d3.select(".links").selectAll("line")
        .transition().duration(DURATION)
        .style("opacity", opacity)
        .style("stroke-width", strokeWidth);
}

function getCheckedRadioValue(name) {
    var elements = document.getElementsByName(name);
    for (var i=0; i<elements.length; i++) {
        if (elements[i].checked) return elements[i].value;
    }
}

function colorCohort(cohort) {
    return color(parseInt(cohort.substring(0, 2))
            + QUARTERS.indexOf(cohort.substring(2)));
}