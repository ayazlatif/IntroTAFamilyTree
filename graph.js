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
        YEAR_GAP,
        QUARTER_GAP
    } from './index.js';
import { Queue } from './Queue.js';
import { autocomplete } from './autocomplete.js';

const QUARTERS = ['wi', 'sp', 'su', 'au'];
const HEIGHT_ADJUST = 50;
const COLOR = d3.scaleOrdinal(d3.schemeCategory10);

let separateQuarters = false;
let width = document.getElementById("vizContainer").clientWidth;
let height = window.innerHeight - HEIGHT_ADJUST;
let filterSet = new Set();
let quarterFilter = new Set();
let focusNodes = new Set();
let lightNodes = new Set();

let allData;
let data;
let simulation;
let node;
let link;

let svg = d3.select("#viz");
let graphContainer = svg.append("g").attr("id", "graph");
let linkData = graphContainer.append("g").attr("class", "links");
let nodeData = graphContainer.append("g").attr("class", "nodes");

document.getElementById("separateQuarters").onclick = function() {
    this.innerHTML = `${separateQuarters ? "Separate" : "Collapse"} Quarters`;
    separateQuarters = !separateQuarters;
    renderGraph();
}

// sets up zoom
let zoom = d3.zoom()
    .on("zoom", function() {
        let b = d3.select("#graph").node().getBBox();
        let x0 = b.x;
        let x1 = b.x + b.width;
        let t = d3.event.transform;
        if (t.invertX(0) > x0) t.x = -x0 * t.k;
        else if (t.invertX(width) < x1) t.x = width - x1 * t.k;
        graphContainer.attr("transform", t);
    });

zoom.scaleExtent([.1, 1]);

window.onresize = resizeWindow;

function resizeWindow() {
    width = document.getElementById("vizContainer").clientWidth;
    height = window.innerHeight - HEIGHT_ADJUST;
    d3.select("#viz").attr("viewBox", `0 0 ${width} ${height}`);
}

// Arrow heads marker designs
let defs = svg.append('defs');
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

export function loadGraphFromJson(graph) {
    allData = graph;

    simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id((d) => d.id)
            .distance(25).strength(LINK_STRENGTH))
        .force("charge", d3.forceManyBody().strength(ATTRACTION_FORCE))
        .force("x", d3.forceX(function(d) { return width / 2; }).strength(1))
        .on("tick", ticked);
    
    let cohorts = [...new Set(graph.nodes.map((d) => d.cohort))];
    autocomplete(document.getElementById("cohortList"), cohorts);
    setUpYears(cohorts);
    setUpQuartersOnClick();

    resizeWindow();
    svg.call(zoom);

    function setUpQuartersOnClick() {
        let collection = document.getElementsByClassName("quarterButton");
        for (var i = 0; i < collection.length; i++) {
            collection[i].onclick = (d) => {
                let quarter = d.target.innerText
                console.log(quarter);
                if (quarterFilter.has(quarter)) {
                    quarterFilter.delete(quarter);
                    d.target.classList.add("selected");
                    d.target.classList.remove("unselected");
                } else {
                    quarterFilter.add(quarter);
                    d.target.classList.add("unselected");
                    d.target.classList.remove("selected");
                }
                console.log(d);
                filter()
            }
        }
    }

    function setUpYears(cohorts) {
        function renderYearButtons() {
            let button = d3.select("#filter")
            .selectAll("button")
            .data(years)
            .enter();

            button.append("button")
                .style("background-color", (d) => colorCohort(maxCohortCountInYear(cohortCounts, d)))
                .style("opacity", 0.3)
                .attr("type", "button")
                .attr("id", (d) => d)
                .text(function(d) { return "20" + d; })
                .on("click", function(d) {
                    if (filterSet.has(d)) {
                        filterSet.delete(d);
                        d3.select(this).style("opacity", 1);
                    } else {
                        filterSet.add(d);
                        d3.select(this).style("opacity", 0.3);
                    }
                    filter()
                })
                .on("mouseover", function() {
                    d3.select(this).style("opacity", "0.5");
                })
                .on("mouseout", function() {
                    d3.select(this).style("opacity", (d) => filterSet.has(d) ? 0.3 : 1);
                });
        }

        function maxCohortCountInYear(cohortCounts, year) {
            let maxQuarter = '';
            let max = -Infinity;
            QUARTERS.forEach(function(elm) {
                elm = `${year}${elm}`;
                let currentCount = cohortCounts[elm];
                if (cohortCounts[elm] > max) {
                    max = currentCount;
                    maxQuarter = elm;
                }
            })
            return maxQuarter;
        }

        function getRandomYear(years) {
            const minYear = 6;
            return Math.max(6, Math.floor(Math.random() * years.length))
                .toString().padStart(2, 0);
        }

        let years = [...new Set(cohorts.map((d) => d.substring(0, 2)))];
        let cohortCounts = {};
        cohorts.forEach(function(coh) {
            if (!(coh in cohortCounts)) {
                cohortCounts[coh] = 0;
            }
            cohortCounts[coh] += 1;
        });

        years.sort();
        years.forEach((y) => filterSet.add(y));
        renderYearButtons();

        document.getElementById(getRandomYear(years)).click();
    }

    function filter() {

        let filteredNodes = allData.nodes.filter((d) => !filterSet.has(d.cohort.substring(0, 2))).filter((d) => !quarterFilter.has(d.cohort.substring(2)));
        let filteredLinks = allData.links
            .filter((d) => !filterSet.has(d.src_cohort.substring(0, 2)) &&
                    !filterSet.has(d.child_cohort.substring(0, 2))
            ).filter((d) => !quarterFilter.has(d.src_cohort.substring(2)) && !quarterFilter.has(d.child_cohort.substring(2)));

        data = {nodes : filteredNodes, links : filteredLinks};
        console.log(data);
        console.log(filterSet);
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
    let ids = data.nodes.map((d) => d.id);
    let removeThese = Array.from(focusNodes).filter(function(id) {
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

    let transition = nodeData.exit().transition().duration(DURATION)

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
        let datum = d3.select(this).datum();
        let nodeSize;
        let opacity = 1;
        let yText;
        let display = "show";
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
        let quarter = d.cohort.substring(2);
        let minYear = parseInt(Math.min(...data.nodes.map((d) => d.cohort.substring(0, 2))));
        let space = separateQuarters ? QUARTER_GAP : YEAR_GAP;

        let forceY = height / 2 + (((parseInt(d.cohort.substring(0, 2)) - minYear) * space));
        if (separateQuarters) {
            let adjust = QUARTERS.indexOf(quarter) + 1;
            forceY -= (space / adjust);
        }
        return forceY;

    }).strength(1));

    simulation.alphaTarget(0.05).restart();
    unfocus();

    document.getElementById("searchBtn").onclick = function() {
        let name = document.getElementById("myInput").value;
        let personDatum = findData(name, allData);
        buildInfoPanel(personDatum, colorCohort(personDatum.cohort), getLineage(name, allData));
        let person;
        d3.select(".nodes").selectAll("g").each(function(d) {
            if (d.id === name) {
                person = this;
            }
        });

        if (!person) {
            let person = allData.nodes.filter((d) => d.id === name)[0];
            let cohort = person.cohort;
            let year = cohort.substring(0, 2);
            let quarter = cohort.substring(2);
            focusNodes.add(name);
            if (filterSet.has(year)) {
                document.getElementById(year).click();
            }
            if (quarterFilter.has(quarter)) {
                document.getElementById(quarter).click();
            }
            return;
        }

        focusNodes.add(name);
        getLineageSet(getLineage(name, data)).forEach((a) => lightNodes.add(a));

        d3.select(person).dispatch("mouseout"); // focus on this
        console.log(focusNodes);
    };

    document.getElementById("reset").onclick = resetSearch;
    autocomplete(document.getElementById("myInput"), allData.nodes.map((el) => el.id));

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
        let elements = [...document.getElementsByClassName("radio")]
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
    let people = data.nodes.filter((d) => d.cohort === cohort);

    if (people.length == 0) {
        people = allData.nodes.filter((d) => d.cohort === cohort);
        people.forEach((a) => focusNodes.add(a.id));
        let year = people[0].cohort.substring(0, 2);
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
    let result = targetData.nodes.filter((d) => d.id === id);
    return result ? result[0] : undefined;
}

function searchBfs(start, childrenFn) {
    let explore = new Queue();
    explore.add(start);
    let visited = new Set();
    while (!explore.isEmpty()) {
        let next = explore.remove()
        if (visited.has(next)) {
            continue;
        }
        visited.add(next);
        childrenFn(next).forEach((child) => { if (!visited.has(child)) explore.add(child) });
    }
    return visited;
}

// startId for the search
// targetData for where you want to find lineage
// give it data for filtering and allData to get full lineage
function getLineage(startId, targetData) {
    let familyFilter = getCheckedRadioValue("familySelection");
    let lineage = new Set();
    if (familyFilter === "single") {
        lineage.add(startId);
    }
    let children = []
    let parents = []
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
            let result = [elm.parent142, elm.parent143, elm.parent143x];
            return result.filter((d) => d).map((d) => findData(d, targetData)).filter((d) => d);
        });
    }
    return {children : children, parents : parents};
}

function unfocus() {
    let nodeSize = (d) => focusNodes.has(d.id) ? LARGE_NODE_SIZE : NODE_SIZE;
    let opacity = (d) => lightNodes.has(d.id) || lightNodes.size == 0 ? 1 : LIGHT_OPACITY;
    let yText = (d) => focusNodes.has(d.id) ? Y_TEXT_LARGE : Y_TEXT_SMALL;
    let display = (d) => lightNodes.has(d.id) ? "show" : "none"

    animateNode(node, nodeSize, opacity, yText, display);

    let linkOpacity = (d) => lightNodes.has(d.source.id) && lightNodes.has(d.target.id) ? 1 : LIGHT_OPACITY;
    let strokeWidth = (d) => lightNodes.has(d.source.id) && lightNodes.has(d.target.id) ? "2px" : "1px";
    animateLinks(linkOpacity, strokeWidth);
}

function getLineageSet(parentsAndChildren) {
    let lineage = new Set()
    parentsAndChildren.children.forEach((a) => lineage.add(a.id));
    parentsAndChildren.parents.forEach((a) => lineage.add(a.id));
    return lineage;
}

function focus(person) {

    buildInfoPanel(person, colorCohort(person.cohort), getLineage(person.id, allData));
    let id = person.id;
    let parentsAndChildren = getLineage(person.id, data);
    let lineage = getLineageSet(parentsAndChildren);

    let nodeSize = function(d) {
        if (focusNodes.has(d.id)) {
            return LARGE_NODE_SIZE;
        } else if (d.id == id) {
            return MEDIUM_NODE_SIZE;
        } else {
            return NODE_SIZE;
        }
    };

    let opacity = function(d) { return lineage.has(d.id) ? 1 : LIGHT_OPACITY; };
    let yText = (d) => focusNodes.has(d.id) ? Y_TEXT_LARGE : Y_TEXT_SMALL;
    let display = (d) => lineage.has(d.id) ? "show" : "none";

    animateNode(node, nodeSize, opacity, yText, display);

    let linkOpacity = (d) => lineage.has(d.source.id) && lineage.has(d.target.id) ? 1 : LIGHT_OPACITY;
    let strokeWidth = (d) => lineage.has(d.source.id) && lineage.has(d.target.id) ? "2px" : "1px";
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
    let elements = document.getElementsByName(name);
    for (let i=0; i<elements.length; i++) {
        if (elements[i].checked) return elements[i].value;
    }
}

function colorCohort(cohort) {
    return COLOR(parseInt(cohort.substring(0, 2))
            + QUARTERS.indexOf(cohort.substring(2)));
}