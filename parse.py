import copy 
import json
with open('more.csv', 'r') as f:
    tas = {}
    for line in f:
        taName, ta142, ta143, ta143x, quarter = line.split(',')
        tas[taName] = { "parent142" : ta142,
                        "parent143" : ta143,
                        "parent143x" : ta143x,
                        "group" : quarter,
                        "img" : taName.replace(" ", "_").lower(),
                        "children" : [] }
    links = []

    def addEdge(parent, child, relation):
        if parent not in tas and parent != "":
            tas[parent] = { "children" : [] }
        if parent != "":
            links.append({"source" : parent, "target" : child, "type": relation})
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
    
    


