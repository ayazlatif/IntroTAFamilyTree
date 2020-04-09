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
                        "children" : [] }
    links = []

    def addEdge(parent, child):
        if parent not in tas and parent != "":
            tas[parent] = { "children" : [] }
        if parent != "":
            links.append({"source" : parent, "target" : child})
            tas[parent]["children"].append(child)
    taNames = set(tas.keys())
    
    for taName in taNames:
        addEdge(tas[taName]["parent142"], taName)
        addEdge(tas[taName]["parent143"], taName)
        addEdge(tas[taName]["parent143x"], taName)

    nodes = []
    for taName in tas.keys():
        nextNode = copy.copy(tas[taName])
        nextNode["id"] = taName
        nodes.append(nextNode)
    
    out = { "nodes" : nodes, "links": links}

    print(json.dumps(out))
    
    


