export function filter(graph, filterSet) {

    // removes nodes
    for (let i = graph.nodes.length - 1 ; i >= 0; i--) {
        if (!filterSet.has(graph.nodes[i].cohort)) {
            graph.nodes.splice(i, 1);
        }
    }

    // removes links
    for (let i = graph.links.length - 1; i >= 0; i--) {
        if (!filterSet.has(graph.links[i].info_src.cohort) || !filterSet.has(graph.links[i].info_child.cohort)) {
            graph.links.splice(i, 1);
        }
    }
}

export function findData(nodes, id) {
    let data = nodes.data();
    for (let i = 0; i < data.length; i++) {
        if (data[i].id === id) {
            return data[i];
        }
    }
    return null;
}

export function searchBfs(start, childrenFn) {
    let explore = new Queue();
    explore.add(start);
    let visited = new Set();
    let count = 0;
    while (!explore.isEmpty()) {
        let next = explore.remove()
        if (visited.has(next)) {
            continue;
        }
        visited.add(next);
        count += 1;
        for (let i = 0; i < childrenFn(next).length; i++) {
            let child = childrenFn(next)[i];
            if (!visited.has(child)) {
                explore.add(child);
            }
        }
    }
    return visited;
}