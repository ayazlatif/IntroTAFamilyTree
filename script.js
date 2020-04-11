import { buildInfoPanel, resetInfoPanel, displayCohort } from './info_panel.js';


var NODE_SIZE = 10;
var LARGE_NODE_SIZE = 30;

window.onresize = function(){ changeData(); }

document.getElementById("dataBtn").onclick = changeData;

var currentData = "./resources/data/beg.json";

function changeData() {
    var datasetList = document.getElementById("datasetList");
    var newData = datasetList.options[datasetList.selectedIndex].text;
    d3.selectAll("svg > *").remove();
    loadJsonFile(`./resources/data/${newData}`);
    currentData = newData;
}

loadJsonFile(currentData);

function loadJsonFile(file) {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    d3.json(file).then(function(graph) {
        var foci = [{x: 150, y: 150}, {x: 350, y: 250}, {x: 700, y: 400}];

        var label = {
            'nodes': [],
            'links': []
        };

        graph.nodes.forEach(function(d, i) {
            label.nodes.push({node: d});
            label.nodes.push({node: d});
            label.links.push({
                source: i * 2,
                target: i * 2 + 1
            });
        });

        var labelLayout = d3.forceSimulation(label.nodes)
            .force("charge", d3.forceManyBody().strength(-50))
            .force("link", d3.forceLink(label.links).distance(0).strength(2));


        var graphLayout = d3.forceSimulation(graph.nodes)
            .force("charge", d3.forceManyBody().strength(-3000))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("x", d3.forceX(width / 2).strength(1))
            .force("y", d3.forceY(height / 2).strength(1))
            .force("link", d3.forceLink(graph.links).id(function(d) {return d.id; }).distance(50).strength(1))
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

        var link = container.append("g").attr("class", "links")
            .selectAll("line")
            .data(graph.links)
            .enter()
            .append("line")
            .attr("class", function(d) { return d.type })
            .attr("stroke", "#aaa")
            .attr("stroke-width", "1px")
            .attr('marker-end',function(d) { return `url(#arrowhead-${d.type})`; });

        var node = container.append("g").attr("class", "nodes")
            .selectAll("g")
            .data(graph.nodes)
            .enter()
            .append("circle")
            .attr("r", NODE_SIZE)
            .attr("fill", function(d) { return color(d.cohort); });

        node.on("mouseover", focus).on("mouseout", unfocus);
        
        node.call(
            d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended)
        );

        var labelNode = container.append("g").attr("class", "labelNodes")
            .selectAll("text")
            .data(label.nodes)
            .enter()
            .append("text")
            .text(function(d, i) { return i % 2 == 0 ? "" : d.node.id; })
            .style("pointer-events", "none"); // to prevent mouseover/drag capture
        
        document.getElementById("searchBtn").onclick = search;

        function search() {
            resetSearch();
            var name = document.getElementById("fname").value;
            name = name.toLowerCase();

            var person;
            node.each(function(d) {
                if (d.id && d.id.toLowerCase().startsWith(name) && !person) {
                    //this.setAttribute("font-size", "32");
                    person = this;
                }
            });
            d3.select(person).dispatch("mouseover");
        };

        document.getElementById("reset").onclick = resetSearch;

        function resetSearch() {
            labelNode.each(function(d) {
                this.setAttribute("font-size", "14pt");
            });
            node.each(function(d) {
                this.setAttribute("r", NODE_SIZE);
                this.setAttribute("opacity", "1");
            });

            link.each(function(d) {
                    this.setAttribute("opacity", "1");
            });

            resetInfoPanel();

        }

        document.getElementById("cohortSearchBtn").onclick = cohortSearch;

        function cohortSearch() {
            resetSearch();
            var cohortList = document.getElementById("cohortList");
            var cohort = cohortList.options[cohortList.selectedIndex].text;

            labelNode.each(function(d) {
                if (d.node.cohort) {
                    if (cohort.trim() === d.node.cohort.trim()) {
                        console.log("hey!")
                        this.setAttribute("font-size", "32");
                    }
                }
            });
            node.each(function(d) {
                if (d.cohort) {
                    if (cohort.trim() === d.cohort.trim()) {
                        this.setAttribute("r", LARGE_NODE_SIZE);
                    } else {
                        this.setAttribute("opacity", "0.1");
                    }
                }
            });

            link.each(function(d) {
                this.setAttribute("opacity", "0.1");
            });

            displayCohort(cohort);
        }

        function ticked() {
            node.call(updateNode);
            // node.each(function(o, i) {
            //     console.log(o);
            // });
            link.call(updateLink);

            labelLayout.alphaTarget(0.3).restart();
            labelNode.each(function(d, i) {
                if(i % 2 == 0) {
                    d.x = d.node.x;
                    d.y = d.node.y;
                } else {
                    var b = this.getBBox();

                    var diffX = d.x - d.node.x;
                    var diffY = d.y - d.node.y;

                    var dist = Math.sqrt(diffX * diffX + diffY * diffY);

                    var shiftX = b.width * (diffX - dist) / (dist * 2);
                    shiftX = Math.max(-b.width, Math.min(0, shiftX));
                    var shiftY = 16;
                    this.setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
                }
            });

            labelNode.call(updateNode);

        }

        function fixna(x) {
            if (isFinite(x)) return x;
            return 0;
        }

        function focus(d) {   
            console.log(d); 
            buildInfoPanel(d);
            var index = d3.select(this).datum().index;
            node.style("opacity", function(o) {
                return neigh(index, o.index) ? 1 : 0.1;
            }).transition().attr("r", function(d) {
                // console.log(d.index);
                if (d.index != index) {
                    return NODE_SIZE;
                } else {
                    return LARGE_NODE_SIZE;

                }
            });
            labelNode.attr("display", function(o) {
                return neigh(index, o.node.index) ? "block": "none";
            });

            link.style("opacity", function(o) {
                return o.source.index == index || o.target.index == index ? 1 : 0.1;
            });
        }

        function unfocus() {
            d3.select(this).transition().attr("r", NODE_SIZE);

            labelNode.attr("display", "block");
            node.style("opacity", 1);
            link.style("opacity", 1);
        }

        function updateLink(link) {
            link.attr("x1", function(d) { return fixna(d.source.x); })
                .attr("y1", function(d) { return fixna(d.source.y); })
                .attr("x2", function(d) { return fixna(d.target.x); })
                .attr("y2", function(d) { return fixna(d.target.y); });
        }

        function updateNode(node) {
            node.attr("transform", function(d) {
                return "translate(" + fixna(d.x) + "," + fixna(d.y) + ")";
            });
        }

        function dragstarted(d) {
            d3.event.sourceEvent.stopPropagation();
            if (!d3.event.active) graphLayout.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) graphLayout.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

    }); // d3.json
}