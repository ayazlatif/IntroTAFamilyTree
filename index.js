import { loadGraphFromJson } from './graph.js'

export const NODE_SIZE = 10;
export const MEDIUM_NODE_SIZE = 20;
export const LARGE_NODE_SIZE = 30;
export const LIGHT_OPACITY = 0.2;
export const ATTRACTION_FORCE = -800;
export const START_YEAR = 10;
export const DURATION = 100;
export const LINK_STRENGTH = 0;

const DATA = "./resources/data/all.json";

var filterSet = new Set();

document.getElementById("infoPanel").onclick = filter;

// TODO: add filterset to index.html 
filterSet.add("14au");
filterSet.add("15wi");
filterSet.add("15sp");
filterSet.add("15au");
filterSet.add("16wi");
filterSet.add("16sp");
filterSet.add("17wi");
filterSet.add("17sp");
filterSet.add("17au");
filterSet.add("18wi");
filterSet.add("18sp");
filterSet.add("18au");

// var tas = ["Ayaz Latif", "Will Ceriale"]
loadGraphFromJson(DATA);