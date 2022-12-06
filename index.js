import { loadGraphFromJson } from './graph.js'
import { initInfoPanel } from './info_panel.js';
import { makeDraggable } from './draggable_div.js'

export const NODE_SIZE = 15;
export const MEDIUM_NODE_SIZE = 25;
export const LARGE_NODE_SIZE = 35;
export const LIGHT_OPACITY = 0.2;
export const ATTRACTION_FORCE = -2000;
export const DURATION = 500;
export const LINK_STRENGTH = 0;
export const Y_TEXT_SMALL = 3 * NODE_SIZE;
export const Y_TEXT_MEDIUM = 2 * MEDIUM_NODE_SIZE;
export const Y_TEXT_LARGE = 1.8 * LARGE_NODE_SIZE;
export const YEAR_GAP = 200;
export const QUARTER_GAP = 500;
export const QUARTERS = ['wi', 'sp', 'su', 'au'];

const API_ENDPOINT = 'https://intro-ta-family-tree.onrender.com';

window.onload = () => {
    initInfoPanel();
    makeDraggable("controlpanel");
    QUARTERS.forEach((quarter) => {
        let button = document.createElement("button");
        button.className = "quarterButton";
        button.id = quarter;
        button.textContent = quarter;
        document.getElementById("quarterFilter").appendChild(button);
    });
    fetch(`${API_ENDPOINT}/api/getTas`)
        .then(response => response.json())
        .then(spreadsheet_data => {
            function addEdge(parent, child, relation) {
                if ((!(parent in tas)) && parent !== "") {
                    taNames.push(parent);
                    tas[parent] = { "id" : parent,
                        "parent142" : "",
                        "parent143" : "",
                        "parent143x" : "",
                        "num_142_quarters" : 0,
                        "num_143_quarters" : 0,
                        "num_143x_quarters" : 0,
                        "num_14x_quarters" : 0,
                        "cohort" :  "05au",
                        "img" : '',
                        "children" : [],
                        "kudos" : "" ,
                        "nicknames" : "",
                        "linkedin" : "",
                        "github" : "",
                        "parent121" : "",
                        "parent122" : "",
                        "parent123" : "",
                        "num_121_quarters" : 0,
                        "num_122_quarters" : 0,
                        "num_123_quarters" : 0
                    };
                }
                if (parent !== "") {
                    links.push({
                        "source" : parent,
                        "target" : child,
                        "type": relation,
                        "src_cohort": tas[parent]["cohort"],
                        "child_cohort" : tas[child]["cohort"]
                    });
                    tas[parent]["children"].push(tas[child]);
                }
            }

            let tas = {};
            let results = spreadsheet_data["values"];
            for (let i = 1; i < results.length; i++) {
                let taName;
                let ta142;
                let ta143;
                let ta143x;
                let num142;
                let num143;
                let num143x;
                let num14x;
                let cohort;
                let kudos;
                let nicknames;
                let img;
                let linkedin;
                let github;
                let ta121;
                let ta122;
                let ta123;
                let num121;
                let num122;
                let num123;
                [
                    taName,
                    ta142,
                    ta143,
                    ta143x,
                    num142,
                    num143,
                    num143x,
                    num14x,
                    cohort,
                    kudos,
                    nicknames,
                    img,
                    linkedin,
                    github,
                    ta121,
                    ta122,
                    ta123,
                    num121,
                    num122,
                    num123
                ] = results[i];
                tas[taName] = { "id" : taName,
                                "parent142" : ta142 ? ta142 : '',
                                "parent143" : ta143 ? ta143 : '',
                                "parent143x" : ta143x ? ta143x : '',
                                "num_142_quarters" : num142 ? num142 : 0,
                                "num_143_quarters" : num143 ? num143 : 0,
                                "num_143x_quarters" : num143x ? num143x : 0,
                                "num_14x_quarters" : num14x ? num14x : 0,
                                "cohort" : cohort ? cohort : '05au',
                                "img" : img,
                                "children" : [],
                                "kudos" : kudos ? kudos : '',
                                "nicknames" : nicknames ? nicknames : '',
                                "linkedin" : linkedin ? linkedin : '',
                                "github" : github ? github : '',
                                "parent121" : ta121 ? ta121 : '',
                                "parent122" : ta122 ? ta122 : '',
                                "parent123" : ta123 ? ta123 : '',
                                "num_121_quarters" : num121 ? num121 : 0,
                                "num_122_quarters" : num122 ? num122 : 0,
                                "num_123_quarters" : num123 ? num123 : 0
                            }
            }

            let links = []; // updated in add edge
            let taNames = Array.from(Object.keys(tas)); // updated in add edge
            taNames.forEach(function(taName) {
                addEdge(tas[taName]["parent142"], taName, "parent142")
                addEdge(tas[taName]["parent143"], taName, "parent143")
                addEdge(tas[taName]["parent143x"], taName, "parent143x")
                addEdge(tas[taName]["parent121"], taName, "parent121")
                addEdge(tas[taName]["parent122"], taName, "parent122")
                addEdge(tas[taName]["parent123"], taName, "parent123")
            });

            let nodes = [];
            taNames.forEach(function(taName) {
                nodes.push(tas[taName]);
            });

            loadGraphFromJson({
                "nodes": nodes,
                "links": links
            });
            document.getElementById("loadContainer").remove();
        });
}