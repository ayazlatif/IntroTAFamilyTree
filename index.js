import { loadGraphFromJson } from './graph.js'

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

const DATA = "https://cors-anywhere.herokuapp.com/https://docs.google.com/spreadsheets/d/e/2PACX-1vQh1nE1K_4KeNgcCpM5Y0OFEG5hyweGzNP4d0SZBu7VgkZeNjeESvWWAK_CMIlDXqiybLjZkTw371I0/pub?gid=0&single=true&output=csv";

const Http = new XMLHttpRequest();
const url = 'https://nameless-atoll-70309.herokuapp.com/api/getTas';

window.onload = function() {
    Http.onreadystatechange = function() {
        if (this.readyState==4 && this.status==200) {
            let spreadsheet_data = JSON.parse(Http.response);
            var results = spreadsheet_data["values"];
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
                        "nicknames" : ""
                    };
                }
                if (parent !== "") {
                    links.push({"source" : parent, "target" : child, "type": relation, "info_src": tas[parent], "info_child" :tas[child]});
                    tas[parent]["children"].push(tas[child]);
                }
            }

            let tas = {};
            for (var i = 1; i < results.length; i++) {
                let taName, ta142, ta143, ta143x, num142, num143, num143x, num14x, cohort, kudos, nicknames, img;
                [taName, ta142, ta143, ta143x, num142, num143, num143x, num14x, cohort, kudos, nicknames, img] = results[i];
                tas[taName] = { "id" : taName,
                                "parent142" : ta142 ? ta142 : '',
                                "parent143" : ta143 ? ta143 : '',
                                "parent143x" : ta143x ? ta143x : '',
                                "num_142_quarters" : num142 ? num142 : 0,
                                "num_143_quarters" : num143 ? num143 : 0,
                                "num_143x_quarters" : num143x ? num143x : 0,
                                "num_14x_quarters" : num14x ? num14x : 0,
                                "cohort" : cohort ? cohort : 0,
                                "img" : img,
                                "children" : [],
                                "kudos" : kudos ? kudos : '',
                                "nicknames" : nicknames ? nicknames : ''
                            }
            }
            let links = [];

            let taNames = Array.from(Object.keys(tas));
            taNames.forEach(function(taName) {
                addEdge(tas[taName]["parent142"], taName, "parent142")
                addEdge(tas[taName]["parent143"], taName, "parent143")
                addEdge(tas[taName]["parent143x"], taName, "parent143x")
            });
            let nodes = [];
            taNames.forEach(function(taName) {
                nodes.push(tas[taName]);
            });

            loadGraphFromJson({"nodes": nodes, "links": links});
            document.getElementById("testing").classList.remove("loader");
        }
    }
    Http.open("GET", url, true);
    Http.send();
}