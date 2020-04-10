import copy 
import json
import random
with open('more.csv', 'r') as f:
    tas = {}
    for line in f:
        taName, ta142, ta143, ta143x, quarter = line.split(',')
        tas[taName] = { "parent142" : ta142,
                        "parent143" : ta143,
                        "parent143x" : ta143x,
                        "quarter" : random.randint(0, 3),
                        "year" : random.randint(1998, 2020),
                        "num_quarters" : random.randint(1, 15),
                        "img" : taName.replace(" ", "_").lower(),
                        "children" : [] }
    links = []

    def addEdge(parent, child, relation):
        if parent not in tas and parent != "":
            tas[parent] = { "parent142" : "",
                        "parent143" : "",
                        "parent143x" : "",
                        "quarter" : random.randint(0, 3),
                        "year" : random.randint(1998, 2020),
                        "img" : parent.replace(" ", "_").lower(),
                        "children" : [] }
        if parent != "":
            links.append({"source" : parent, "target" : child, "type": relation, "info_src": tas[parent], "info_child" :tas[child]})
            tas[parent]["children"].append(tas[child])
    taNames = set(tas.keys())
    
    for taName in taNames:
        addEdge(tas[taName]["parent142"], taName, "parent142")
        addEdge(tas[taName]["parent143"], taName, "parent143")
        addEdge(tas[taName]["parent143x"], taName, "parent143x")

    nodes = []
    for taName in tas.keys():
        nextNode = copy.copy(tas[taName])
        nextNode["id"] = taName
        nodes.append(nextNode)
    
    out = { "nodes" : nodes, "links": links}

    print(json.dumps(out))
    
    


