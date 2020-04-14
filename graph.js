import { buildInfoPanel, resetInfoPanel, displayCohort } from './info_panel.js';
import { NODE_SIZE,
        MEDIUM_NODE_SIZE,
        LARGE_NODE_SIZE,
        LIGHT_OPACITY,
        ATTRACTION_FORCE,
        LINK_STRENGTH,
        DURATION } from './index.js';
import { Queue } from './Queue.js';
import { autocomplete } from './autocomplete.js';

var HEIGHT_ADJUST = 50;
var allData;
var simulation;
var node;
var link;
var color = d3.scaleOrdinal(d3.schemeCategory10);

var width = document.getElementById("controls").clientWidth;//document.getElementById("viz").width.baseVal.value;
var height = window.innerHeight - HEIGHT_ADJUST;
var filterSet = new Set();
filterSet.add("05");
filterSet.add("06");
filterSet.add("07");
filterSet.add("08");
filterSet.add("09");
filterSet.add("10");
filterSet.add("11");
filterSet.add("12");
filterSet.add("13");
filterSet.add("14");
filterSet.add("15");
filterSet.add("16");
filterSet.add("17");
filterSet.add("18");
filterSet.add("19");





var focusNodes = new Set();
var lightNodes = new Set();

var svg = d3.select("#viz");
var graphContainer = svg.append("g").attr("id", "graph");
var linkData = graphContainer.append("g").attr("class", "links");
var nodeData = graphContainer.append("g").attr("class", "nodes");
var zoom = d3.zoom()
       // .extent([0, 0], [width, height])
        .on("zoom", function() { var trans = d3.event.transform;
            var b = d3.select("#graph").node().getBBox();
            // var width = b.width;
            var x0 = b.x;
            var y0 = b.y;
            var x1 = b.x + b.width;
            var y1 = b.y + b.height;
            var t = d3.event.transform;
            if (t.invertX(0) > x0) t.x = -x0 * t.k;
            else if (t.invertX(width) < x1) t.x = width - x1 * t.k;
           // if (t.invertY(0) > y0) t.y = -y0 * t.k;
           // else if (t.invertY(height) < y1) t.y = height - y1 * t.k;
            graphContainer.attr("transform", t);
        });
zoom.scaleExtent([.1, 1]);//([1, Math.min(width / (x1 - x0), height / (y1 - y0))])

function setZoom(svg, x, y, k) {
    svg.call(zoom).call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(k));
}

// setZoom(svg, width / 4, height / 3, 1);

window.onresize = resizeWindow;

function resizeWindow() {
    width = document.getElementById("viz").width.baseVal.value;
    height = window.innerHeight - HEIGHT_ADJUST;
    d3.select("#viz").attr("viewBox", `0 0 ${width} ${height}`);
    // setZoom(svg, width / 4, height / 3, 1);
}

// Arrow heads marker designs
var defs = svg.append('defs');
buildArrowHeads(defs);

function buildArrowHeads(def) {
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


export function getNames() {
    return allData.nodes.map((el) => el.id);
}

export function loadGraphFromJson(file) {
    d3.json(file).then(function(graph) {
        allData = graph;

        simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id((d) => d.id)
                .distance(25).strength(LINK_STRENGTH))
            .force("charge", d3.forceManyBody().strength(ATTRACTION_FORCE))
            .force("x", d3.forceX(function(d) { return width / 2; }).strength(1))
            .on("tick", ticked);
        
        setUpYears(allData);

        filterYears("20");

        // buildGraph(allData);

        resizeWindow();
        // set up cohorts
        function setUpYears(graph) {
            var years = [];
            var cohortCounts = {};
            for (var i = 0; i < graph.nodes.length; i++) {
                var year = graph.nodes[i].cohort.substring(0, 2);
                var coh = graph.nodes[i].cohort;
                if (!years.includes(year)) {
                    years.push(year);
                }
                if (!(coh in cohortCounts)) {
                    cohortCounts[coh] = 0;
                }
                cohortCounts[coh] += 1;
            }
            var button = d3.select("#filter")
                .selectAll("button")
                .data(years)
                .enter();

            button.append("button")
                .style("background-color", (d) => color(d))
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
            buildGraph({nodes : filteredNodes, links : filteredLinks});

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
                    return "translate(" + Math.max(0, fixNaN(d.x)) + "," + fixNaN(d.y) + ")";
                });
            }

            node.call(updateNode);
            link.call(updateLink);
        }
    });
    setTimeout(function() {
        console.log('fire');
        svg.call(zoom).call(zoom.scaleTo(0.1));

    }, 3000);
}

function buildGraph(data) {

    simulation.alpha(0.5);
    var removeThese = Array.from(focusNodes).filter(function(id) {
        return !data.nodes.map((d) => d.id).includes(id);
        // console.log(!data.nodes.map((d) => d.id).includes(id));
    });

    console.log(removeThese);
    
    removeThese.forEach((id) => focusNodes.delete(id));
    console.log(focusNodes);

    lightNodes.clear();
    addLightNodes();

    function addLightNodes() {
        focusNodes.forEach((id) => getLineage(id)
            .forEach((a) => lightNodes.add(a)));
    }

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
        // .attr("y", 0)
        // .attr("y", (d) => (parseInt(d.cohort.substring(0, 2)) - 5) * 100)
        .on("mouseover", focus).on("mouseout", unfocus)
    
    // node.selectAll("g").attr("y", (d) => (parseInt(d.cohort.substring(0, 2)) - 5) * 100);
    node.append("circle")
        .attr("r", NODE_SIZE)
        .attr("fill", function(d) { return color(d.cohort); });

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
            yText = 2 * MEDIUM_NODE_SIZE;
            focusNodes.delete(datum.id);
            getLineage(datum.id).forEach(function(a) {
                if (focusNodes.has(a)) {
                    return;
                }
                lightNodes.delete(a);
            });
        } else {
            nodeSize = LARGE_NODE_SIZE;
            yText = 1.8 * LARGE_NODE_SIZE;
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
    );;

    simulation.nodes(data.nodes);
    simulation.force("link").links(data.links);
    simulation.force("y", d3.forceY(function (d) { 
        var minYear = parseInt(Math.min(...data.nodes.map((d) => d.cohort.substring(0, 2))));
        return (parseInt(d.cohort.substring(0, 2)) - minYear + 5) * 100; 
    }).strength(1));

    simulation.alphaTarget(0.05).restart();
    unfocus();
    // setZoom(svg, width / 2, height / 2, 0.4);

    
    

    function animateNode(node, nodeSize, opacity, yText, display) {
        node.select("circle")
            .transition()
            .duration(DURATION)
            .attr("r", nodeSize)
            .attr("opacity", opacity);

        node.select("text")
            .transition()
            .duration(DURATION)
            .attr("y", yText)
            .attr("display", display);
    }

    document.getElementById("searchBtn").onclick = function() {
        var name = document.getElementById("myInput").value;

        var person;
        d3.select(".nodes").selectAll("g").each(function(d) {
            if (d.id === name) {
                person = this;
            }
        });


        focusNodes.add(name);
        getLineage(name).forEach((a) => lightNodes.add(a));

        d3.select(person).dispatch("mouseover"); // focus on this
    };

    document.getElementById("reset").onclick = resetSearch;
    autocomplete(document.getElementById("myInput"), getNames());

    function resetSearch() {
        console.log("resetting!");
        focusNodes.clear();
        lightNodes.clear();
        unfocus();
        resetInfoPanel();
        document.getElementById("cohortList").value = "";
        document.getElementById("myInput").value = "";
    }

    document.getElementById("cohortSearchBtn").onclick = searchCohort;

    function searchCohort() {
        let cohort = document.getElementById("cohortList").value;
        var people = data.nodes.filter((d) => d.cohort === cohort);

        var nodeSize = (d) => cohort === d.cohort ? MEDIUM_NODE_SIZE : NODE_SIZE;
        var opacity = (d) => cohort === d.cohort ? 1 : LIGHT_OPACITY;
        var yText = 2 * MEDIUM_NODE_SIZE;
        var display = (d) => cohort === d.cohort ? "show" : "none";;

        animateNode(node, nodeSize, opacity, yText, display);
        link.style("opacity", LIGHT_OPACITY);

        displayCohort(cohort, people);
    }

    function searchBfs(start, childrenFn) {
        var explore = new Queue();
        explore.add(start);
        var visited = new Set();
        var count = 0;
        while (!explore.isEmpty()) {
            var next = explore.remove()
            if (visited.has(next)) {
                continue;
            }
            visited.add(next);
            count += 1;
            for (var i = 0; i < childrenFn(next).length; i++) {
                var child = childrenFn(next)[i];
                if (!visited.has(child)) {
                    explore.add(child);
                }
            }
        }
        return visited;
    }

    function findData(id) {
        var result = data.nodes.filter((d) => d.id === id);
        return result ? result[0] : null;
    }

    function getLineage(startId) {
        var children = searchBfs(findData(startId), function(elm) {
            return elm.children.map((d) => findData(d.id)).filter((d) => d);
        });
        var parents = searchBfs(findData(startId), function(elm) {
            if (!elm) {
                return [];
            }
            var result = [elm.parent142, elm.parent143, elm.parent143x];
            return result.filter((d) => d).map((d) => findData(d)).filter((d) => d);
        });

        var lineage = new Set();
        children.forEach(a => lineage.add(a.id));
        parents.forEach(a => lineage.add(a.id));
        return lineage;
    }

    function focus(d) {
        buildInfoPanel(d, d3.select(this).select("circle").attr("fill"));
        var id = d3.select(this).datum().id;
        var lineage = getLineage(id);

        var nodeSize = function(d) {
            if (focusNodes.has(d.id)) {
                return LARGE_NODE_SIZE;
            } else if (d.id == id) {
                return MEDIUM_NODE_SIZE;
            } else {
                return NODE_SIZE;
            }
        };
        var opacity = (d) => lineage.has(d.id) ? 1 : LIGHT_OPACITY;
        var yText = 2 * MEDIUM_NODE_SIZE;
        var display = (d) => lineage.has(d.id) ? "show" : "none";

        animateNode(node, nodeSize, opacity, yText, display);

        var linkOpacity = (d) =>
                lineage.has(d.source.id) && lineage.has(d.target.id) ? 1 : LIGHT_OPACITY;
        var strokeWidth = (d) => lineage.has(d.source.id) && lineage.has(d.target.id) ? "2px" : "1px";
        animateLinks(linkOpacity, strokeWidth);
    }

    function animateLinks(opacity, strokeWidth) {
        d3.select(".links").selectAll("line").style("opacity", opacity)
            .style("stroke-width", strokeWidth);
    }

    function unfocus() {
        var nodeSize = (d) => focusNodes.has(d.id) ? LARGE_NODE_SIZE : NODE_SIZE;
        var opacity = (d) => lightNodes.has(d.id) || lightNodes.size == 0 ? 1 : LIGHT_OPACITY;
        var yText = (d) => focusNodes.has(d.id) ? 1.8 * LARGE_NODE_SIZE : 3 * NODE_SIZE;
        var display = (d) => lightNodes.has(d.id) ? "show" : "none"

        animateNode(node, nodeSize, opacity, yText, display);

        var linkOpacity = (d) => lightNodes.has(d.source.id) && lightNodes.has(d.target.id) ? 1 : LIGHT_OPACITY;
        var strokeWidth = (d) => lightNodes.has(d.source.id) && lightNodes.has(d.target.id) ? "2px" : "1px";
        animateLinks(linkOpacity, strokeWidth);
    }

    function dragstarted(d) {
        d3.event.sourceEvent.stopPropagation();
        if (!d3.event.active) simulation.alphaTarget(0.5).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0.5);
        d.fx = null;
        d.fy = null;
    }

    var cohorts = [];

    for (var i = 0; i < data.nodes.length; i++) {
        var coh = data.nodes[i].cohort;
        if (!cohorts.includes(coh)) {
            cohorts.push(coh);
        }
    }
    autocomplete(document.getElementById("cohortList"), cohorts);
}