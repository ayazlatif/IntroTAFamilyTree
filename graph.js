import { buildInfoPanel, resetInfoPanel, displayCohort } from './info_panel.js';
import { NODE_SIZE,
        MEDIUM_NODE_SIZE,
        LARGE_NODE_SIZE,
        LIGHT_OPACITY,
        ATTRACTION_FORCE,
        LINK_STRENGTH,
        DURATION } from './index.js';
import { Queue } from './Queue.js';
import {autocomplete } from './autocomplete.js';

var HEIGHT_ADJUST = 50;
var data;

export function getNames() {
    return data.nodes.map((el) => el.id);
}

// export function filter(graph, filterSet) {

//     // removes nodes
//     for (var i = graph.nodes.length - 1 ; i >= 0; i--) {
//         if (!filterSet.has(graph.nodes[i].cohort)) {
//             graph.nodes.splice(i, 1);
//         }
//     }

//     // removes links
//     for (var i = graph.links.length - 1; i >= 0; i--) {
//         if (!filterSet.has(graph.links[i].info_src.cohort) || !filterSet.has(graph.links[i].info_child.cohort)) {
//             graph.links.splice(i, 1);
//         }
//     }
// }

export function loadGraphFromJson(file) {
    d3.json(file).then(function(graph) {
        data = graph;
        buildGraph(data);
    });
}

function buildGraph(data) {
    var width = document.getElementById("viz").width.baseVal.value;
    var height = window.innerHeight - HEIGHT_ADJUST;
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var focusNodes = new Set();
    var lightNodes = new Set();

    var svg = d3.select("#viz")
    .attr("viewBox", `0 0 ${width} ${height}`);

    var graphContainer = svg.append("g");

    var link = graphContainer
        .append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(data.links)
            .enter()
        .append("line")
            .attr("opacity", LIGHT_OPACITY)
            .attr("class", function(d) { return d.type })
            .attr("stroke", "#aaa")
            .attr("stroke-width", "1px")
            .attr('marker-end',function(d) { return `url(#arrowhead-${d.type})`; });

    var node = graphContainer.append("g").attr("class", "nodes")
        .selectAll("g")
            .data(data.nodes)
            .enter()
        .append("g");

    node.append("circle")
        .attr("r", NODE_SIZE)
        .attr("fill", function(d) { return color(d.cohort); });
    
    node.append("text")
        .attr("display", "none")
        .attr("x", -2*NODE_SIZE)
        .attr("y", 3*NODE_SIZE)
        .text(function(d) { return d.id; });    

    var zoom = d3.zoom()
        .scaleExtent([.4, 1.3])
        .on("zoom", function() { var trans = d3.event.transform;
            graphContainer.attr("transform", trans);
        });

    setZoom(svg, width / 4, height / 3, 0.4);
    function setZoom(svg, x, y, k) {
        svg.call(zoom).call(zoom.transform, d3.zoomIdentity.translate(x, y).scale(k));
    }

    window.onresize = function() {
        width = document.getElementById("viz").width.baseVal.value;
        height = this.innerHeight - HEIGHT_ADJUST;
        d3.select("#viz").attr("viewBox", `0 0 ${width} ${height}`);
        setZoom(svg, width / 4, height / 3, 0.4);
    }
    
    // Arrow heads marker designs
    var defs = svg.append('defs');
    buildArrowHeads(defs);

    function buildArrowHeads(def) {
        function marker(id) {
            defs.append('marker')
                .attr("id", id)
                .attr("viewBox", "-0 -5 10 10")
                .attr("refX", "16")
                .attr("refY", "0")
                .attr("orient", "auto")
                .attr("markerWidth", "13")
                .attr("markerHeight", "13")
                .attr("xoverflow", "visible")
                .append("svg:path")
                .attr("d", 'M 0,-5 L 10 ,0 L 0,5')
                .style('stroke','none');
        }
        marker("arrowhead-parent142");
        marker("arrowhead-parent143");
        marker("arrowhead-parent143x");
    }
    
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

    node.on("mouseover", focus).on("mouseout", unfocus);

    // Select Node onclick callback
    node.on("click", function() {
        var index = d3.select(this).datum().index;
        var nodeSize;
        var opacity = 1;
        var yText;
        var display = "show";
        if (focusNodes.has(index)) {
            nodeSize = MEDIUM_NODE_SIZE;
            yText = 2 * MEDIUM_NODE_SIZE;
            focusNodes.delete(index);
            getIndices(index).forEach(function(a) {
                if (focusNodes.has(a)) {
                    return;
                }
                lightNodes.delete(a);
            });
        } else {
            nodeSize = LARGE_NODE_SIZE;
            yText = 1.8 * LARGE_NODE_SIZE;
            focusNodes.add(index);
            getIndices(index).forEach((a) => lightNodes.add(a));
        }
        animateNode(d3.select(this), nodeSize, opacity, yText, display);

        // handle case when focus and light node select/deselct overlap
        focusNodes.forEach((index) => getIndices(index)
            .forEach((a) => lightNodes.add(a)));
    })
    
    node.call(
        d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
    );
    
    document.getElementById("searchBtn").onclick = function() {
        var name = document.getElementById("myInput").value;
        name = name.toLowerCase();
    
        var person;
        node.each(function(d) {
            if (d.id && d.id.toLowerCase().startsWith(name) && !person) {
                person = this;
            }
        });

        var index = d3.select(person).datum().index;
        focusNodes.add(index);
        getIndices(index).forEach((a) => lightNodes.add(a));

        d3.select(person).dispatch("mouseover"); // focus on this
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
        explore.add(data.nodes[start]);
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
        var result = node.data().filter((d) => d.id === id);
        return result ? result[0] : null;
    }

    function getIndices(targetIndex) {
        var children = searchBfs(targetIndex, function(elm) {
            return elm.children.map((d) => findData(d.id)).filter((d) => d);
        });
        var parents = searchBfs(targetIndex, function(elm) {
            var result = [elm.parent142, elm.parent143, elm.parent143x];
            return result.filter((d) => d).map((d) => findData(d));
        });

        var indicies = new Set();
        children.forEach(a => indicies.add(a.index));
        parents.forEach(a => indicies.add(a.index));
        return indicies; 
    }

    function focus(d) {
        buildInfoPanel(d, d3.select(this).select("circle").attr("fill")); 
        var index = d3.select(this).datum().index;            
        var indicies = getIndices(index);

        var nodeSize = function(d) {
            if (focusNodes.has(d.index)) {
                return LARGE_NODE_SIZE;
            } else if (d.index == index) {
                return MEDIUM_NODE_SIZE;
            } else {
                return NODE_SIZE;
            }
        };
        var opacity = (d) => indicies.has(d.index) ? 1 : LIGHT_OPACITY;
        var yText = 2 * MEDIUM_NODE_SIZE;
        var display = (d) => indicies.has(d.index) ? "show" : "none";

        animateNode(node, nodeSize, opacity, yText, display);

        var linkOpacity = (d) => 
                indicies.has(d.source.index) && indicies.has(d.target.index) ? 1 : LIGHT_OPACITY;
        var strokeWidth = (d) => indicies.has(d.source.index) && indicies.has(d.target.index) ? "2px" : "1px";
        animateLinks(link, linkOpacity, strokeWidth);
    }

    function animateLinks(link, opacity, strokeWidth) {
        link.style("opacity", opacity)
            .style("stroke-width", strokeWidth);
    }

    function unfocus() {
        var nodeSize = (d) => focusNodes.has(d.index) ? LARGE_NODE_SIZE : NODE_SIZE;
        var opacity = (d) => lightNodes.has(d.index) || lightNodes.size == 0 ? 1 : LIGHT_OPACITY;
        var yText = (d) => focusNodes.has(d.index) ? 1.8 * LARGE_NODE_SIZE : 3 * NODE_SIZE;
        var display = (d) => lightNodes.has(d.index) ? "show" : "none"

        animateNode(node, nodeSize, opacity, yText, display);

        var linkOpacity = (d) => lightNodes.has(d.source.index) && lightNodes.has(d.target.index) ? 1 : LIGHT_OPACITY;
        var strokeWidth = (d) => lightNodes.has(d.source.index) && lightNodes.has(d.target.index) ? "2px" : "1px";
        animateLinks(link, linkOpacity, strokeWidth);
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
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
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

        function updateNode(node) {
            node.attr("transform", function(d) {
                return "translate(" + fixNaN(d.x) + "," + fixNaN(d.y) + ")";
            });
        }

        node.call(updateNode);
        link.call(updateLink);
    }

    setUpCohorts(data);

    // set up cohorts
    function setUpCohorts(graph) {

        var cohorts = [];

        for (var i = 0; i < graph.nodes.length; i++) {
            var coh = graph.nodes[i].cohort;
            if (!cohorts.includes(coh)) {
                cohorts.push(coh);
            }
        }
        autocomplete(document.getElementById("cohortList"), cohorts);
        // console.log(cohorts.length);
        // return;
        d3.select("#filter")
            .selectAll("button")
            .data(cohorts)
            .enter()
            .append("button")
            .attr("type", "button")
            .attr("id", (d) => d)
            // .style("background-color", function(d) { return TYPE_COLORS[d];	})
            .classed("type_button", true)
            .classed("selected", true) // start with all types selected
            .text(function(d) { return d; });
            //.on("click", updateTypeFilter);
    }

    var simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.links).id((d) => d.id)
            .distance(25).strength(LINK_STRENGTH))
        .force("charge", d3.forceManyBody().strength(ATTRACTION_FORCE))
        .force("x", d3.forceX(function(d) { return width / 2; }).strength(1))
        .force("y", d3.forceY((d) => (parseInt(d.cohort.substring(0, 2)) - 6) * 100)
            .strength(1))
        .on("tick", ticked);
}