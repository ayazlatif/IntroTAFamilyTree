import { loadGraphFromJson } from './graph.js'

export const NODE_SIZE = 15;
export const MEDIUM_NODE_SIZE = 25;
export const LARGE_NODE_SIZE = 35;
export const LIGHT_OPACITY = 0.2;
export const ATTRACTION_FORCE = -800;
export const ATTRACTION_FORCE_TEXT = -2000;
export const START_YEAR = 10;
export const DURATION = 500;
export const LINK_STRENGTH = 0;
export const Y_TEXT_SMALL = 3 * NODE_SIZE;
export const Y_TEXT_MEDIUM = 2 * MEDIUM_NODE_SIZE;
export const Y_TEXT_LARGE = 1.8 * LARGE_NODE_SIZE;

const DATA = "./resources/data/all.json";

loadGraphFromJson(DATA);