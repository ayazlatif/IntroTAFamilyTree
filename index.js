import { loadGraphFromJson, filter } from './graph.js'

export const NODE_SIZE = 10;
export const LARGE_NODE_SIZE = 30;
export const LINK_OPACITY = 0.2;
export const ATTRACTION_FORCE = -800;
export const START_YEAR = 10;
export const LINK_STRENGTH = 0;

window.onresize = function(){ changeData(); }

var filterSet = new Set();

document.getElementById("dataBtn").onclick = changeData;
var currentData = "./resources/data/all.json";
function changeData() {
    var datasetList = document.getElementById("datasetList");
    var newData = datasetList.options[datasetList.selectedIndex].text;
    d3.selectAll("svg > *").remove();
    loadGraphFromJson(`./resources/data/${newData}`, filterSet);
    currentData = newData;
}

document.getElementById("infoPanel").onclick = filter;

// TODO: add filterset to index.html 
filterSet.add("14au");
filterSet.add("15wi");
filterSet.add("15sp");
filterSet.add("15au");
filterSet.add("16wi");
filterSet.add("16sp");


loadGraphFromJson(currentData, filterSet);