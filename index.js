import { loadGraphFromJson } from './graph.js'

export const NODE_SIZE = 15;
export const MEDIUM_NODE_SIZE = 25;
export const LARGE_NODE_SIZE = 35;
export const LIGHT_OPACITY = 0.2;
export const ATTRACTION_FORCE = -2000;
export const START_YEAR = 10;
export const DURATION = 500;
export const LINK_STRENGTH = 0;

const DATA = "./resources/data/all.json";

loadGraphFromJson(DATA);

