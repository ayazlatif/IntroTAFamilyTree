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

// TODO: add filterset to index.html 

loadGraphFromJson(DATA);