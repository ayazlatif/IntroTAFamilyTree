import { buildInfoPanel, resetInfoPanel, displayCohort } from './info_panel.js';
import { NODE_SIZE, LARGE_NODE_SIZE, LINK_OPACITY, ATTRACTION_FORCE, LINK_STRENGTH } from './index.js';
import { Queue } from './Queue.js';
var width = window.innerWidth;
var height = window.innerHeight;
var node;
var link;
var focusNodes = new Set();

export function filter(graph, filterSet) {

    // removes nodes
    for (var i = graph.nodes.length - 1 ; i >= 0; i--) {
        if (!filterSet.has(graph.nodes[i].cohort)) {
            graph.nodes.splice(i, 1);
        }
    }

    // removes links
    for (var i = graph.links.length - 1; i >= 0; i--) {
        if (!filterSet.has(graph.links[i].info_src.cohort) || !filterSet.has(graph.links[i].info_child.cohort)) {
            graph.links.splice(i, 1);
        }
    }
}

export function loadGraphFromJson(file, filterSet) {
    width = window.innerWidth;
    height = window.innerHeight;
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    d3.json(file).then(function(graph) {
        
        filter(graph, filterSet);
        
        var simulation = d3.forceSimulation(graph.nodes)
            .force("charge", d3.forceManyBody().strength(ATTRACTION_FORCE))
            .force("x", d3.forceX(function(d) { return width / 2; }).strength(1))
            .force("y", d3.forceY((d) => (parseInt(d.cohort.substring(0, 2)) - 6) * 100)
                    .strength(1))
            .force("link", d3.forceLink(graph.links).id((d) => d.id)
                    .distance(25).strength(LINK_STRENGTH))
            .on("tick", ticked);


        var adjlist = [];

        graph.links.forEach(function(d) {
            adjlist[d.source.index + "-" + d.target.index] = true;
            adjlist[d.target.index + "-" + d.source.index] = true;
        });

        function neigh(a, b) {
            return a == b || adjlist[a + "-" + b];
        }

        var svg = d3.select("#viz").attr("width", width).attr("height", height);
        var container = svg.append("g");

        
        svg.call(
            d3.zoom()
                .scaleExtent([.1, 4])
                .on("zoom", function() { container.attr("transform", d3.event.transform); })
        );

        // Arrow heads marker designs
        var defs = svg.append('defs');
        buildArrowHead(defs, "arrowhead-parent142");
        buildArrowHead(defs, "arrowhead-parent143");
        buildArrowHead(defs, "arrowhead-parent143x");

        function buildArrowHead(defs, id) {
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

        link = container.append("g").attr("class", "links")
            .selectAll("line")
            .data(graph.links)
            .enter()
            .append("line")
            .attr("opacity", "0.2")
            .attr("class", function(d) { return d.type })
            .attr("stroke", "#aaa")
            .attr("stroke-width", "1px")
            .attr('marker-end',function(d) { return `url(#arrowhead-${d.type})`; });

        node = container.append("g").attr("class", "nodes")
            .selectAll("g")
            .data(graph.nodes)
            .enter()
            .append("g");
        
        node.append("circle")
            .attr("r", NODE_SIZE)
            .attr("fill", function(d) { return color(d.cohort); });
        
        node.append("text")
        .attr("display", "none")
        .text(function(d) { return d.id; });
        
        node.on("mouseover", focus).on("mouseout", unfocus);

        node.on("click", function() {
            var index = d3.select(this).datum().index;
            if (focusNodes.has(index)) {
                focusNodes.delete(index);
            } else {
                focusNodes.add(d3.select(this).datum().index);
            }
            console.log(focusNodes);
        })
        
        node.call(
            d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
        );
        
        document.getElementById("searchBtn").onclick = function() {
            resetSearch();
            var name = document.getElementById("fname").value;
            name = name.toLowerCase();
        
            var person;
            node.each(function(d) {
                if (d.id && d.id.toLowerCase().startsWith(name) && !person) {
                    person = this;
                }
            });

            d3.select(person).dispatch("mouseover"); // focus on this
        };

        document.getElementById("reset").onclick = resetSearch;

        function resetSearch() {
            node.select("circle").transition().attr("r", NODE_SIZE).attr("opacity", "1");
            link.transition().attr("opacity", LINK_OPACITY);
            resetInfoPanel();
        }

        document.getElementById("cohortSearchBtn").onclick = searchCohort;

        function searchCohort() {
            var cohortList = document.getElementById("cohortList");
            var cohort = cohortList.options[cohortList.selectedIndex].text;
            var people = [];
            node.select("circle").transition().attr("r", function(d) {
                if (d.cohort) {
                    if (cohort.trim() === d.cohort.trim()) {
                        people.push(d);
                        return LARGE_NODE_SIZE;
                    } else {
                        return NODE_SIZE;
                    }
                }
            }).attr("opacity", function(d) {
                if (d.cohort) {
                    if (cohort.trim() === d.cohort.trim()) {
                        return "1"
                    } else {
                        return "0.1"
                    }
                }
            });

            node.select("text").transition().attr("display", function(d) {
                if (d.cohort) {
                    if (cohort.trim() === d.cohort.trim()) {
                        return "show";
                    } else {
                        return "none";
                    }
                }
            });

            link.each(function(d) {
                this.setAttribute("opacity", LINK_OPACITY);
            });

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
            var data = node.data();
            for (var i = 0; i < data.length; i++) {
                if (data[i].id === id) {
                    return data[i];
                }
            }
            return null;
        }

        function getIndices(target) {
            var children = searchBfs(d3.select(target).datum(), function(elm) {
                var result = []
                elm.children.forEach(function(a) {
                    var item = findData(a.id);
                    if (item) {
                        result.push(item);
                    }
                })
                return result;
            });
            var parents = searchBfs(d3.select(target).datum(), function(elm) {
                var result = []
                var p142 = findData(elm.parent142);
                if (p142) {
                    result.push(p142);
                }

                var p143 = findData(elm.parent143);
                if (p143) {
                    result.push(p143);
                }
                var p143x = findData(elm.parent143x);
                if (p143x) {
                    result.push(p143x);
                }
                return result;
            });

            // parents know the whole family
            children.forEach(a => parents.add(a)); 
            var indicies = new Set();
            parents.forEach(a => indicies.add(a.index));
            return indicies; 
        }

        function focus(d) {
            buildInfoPanel(d); 
            var index = d3.select(this).datum().index;            
            var indicies = getIndices(this);
            
            node.select("circle").transition().attr("r", function(d) {
                if (focusNodes.has(d.index) || d.index == index) {
                    return LARGE_NODE_SIZE;
                } else {
                    return NODE_SIZE;
                }
                
            }).attr("opacity", function(o) {
                return indicies.has(o.index) ? 1 : 0.1;
            });

            node.select("text").transition().attr("display", function(d) {
                if (indicies.has(d.index)) {
                    return "show";
                } else {
                    return "none";
                }
            }
            
            );

            link.style("opacity", function(o) {
                return indicies.has(o.source.index) && indicies.has(o.target.index) ? 1 : LINK_OPACITY;
            });
        }

        function unfocus() {
            node.select("circle").transition().attr("r", NODE_SIZE).attr("opacity", 1);
            node.select("text").attr("display", "none");
            link.style("opacity", LINK_OPACITY);
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

    });
}