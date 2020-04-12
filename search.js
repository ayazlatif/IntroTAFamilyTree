export function filter(graph, filterSet) {

    // removes nodes
    for (var i = graph.nodes.length - 1 ; i >= 0; i--) {
        if (!filterSet.has(graph.nodes[i].cohort)) {
            graph.nodes.splice(i, 1);
        }
    }

    // removes links
    for (var i = graph.links.length - 1; i >= 0; i--) {
        if (!filterSet.has(graph.links[i].info_src.cohort) || !filterSet.has(graph.links[i].info_child.cohort)) {
            graph.links.splice(i, 1);
        }
    }
}

export function findData(nodes, id) {
    var data = nodes.data();
    for (var i = 0; i < data.length; i++) {
        if (data[i].id === id) {
            return data[i];
        }
    }
    return null;
}

export function searchBfs(start, childrenFn) {
    var explore = new Queue();
    explore.add(start);
    var visited = new Set();
    var count = 0;
    while (!explore.isEmpty()) {
        var next = explore.remove()
        if (visited.has(next)) {
            continue;
        }
        visited.add(next);
        count += 1;
        for (var i = 0; i < childrenFn(next).length; i++) {
            var child = childrenFn(next)[i];
            if (!visited.has(child)) {
                explore.add(child);
            }
        }
    }
    return visited;
}