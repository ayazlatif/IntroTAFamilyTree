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
const url = 'https://nameless-atoll-70309.herokuapp.com/api/getTaNodes';

window.onload = function() {
    Http.onreadystatechange = function() {
        if (this.readyState==4 && this.status==200) {
            loadGraphFromJson(JSON.parse(Http.response));
            document.getElementById("testing").classList.remove("loader");
        }
    }
    Http.open("GET", url, true);
    Http.send();
}