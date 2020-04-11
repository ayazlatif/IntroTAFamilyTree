import copy 
import json
import random
import sys

with open(sys.argv[1], 'r') as f:
    cohorts = {}
    tas = {}
    for line in f:
        line = line.strip() + ","
        taName, ta142, ta143, ta143x, num142, num143, num143x, num14x, cohort = line.split(',')
        tas[taName] = { "id" : taName,
                        "parent142" : ta142,
                        "parent143" : ta143,
                        "parent143x" : ta143x,
                        "num_142_quarters" : num142,
                        "num_143_quarters" : num143,
                        "num_143x_quarters" : num143x,
                        "num_14x_quarters" : num14x,
                        "cohort" : random.randint(0, 3),#cohort.strip(),
                        "img" : taName.replace(" ", "_").lower(),
                        "children" : [] }
        if cohort not in cohorts:
            cohorts[cohort] = [tas[taName]]
        else:
            cohorts[cohort].append(tas[taName])
    

        
    # links = []

    # def addEdge(parent, child, relation):
    #     if parent not in tas and parent != "":
    #         tas[parent] = { "id" : parent,
    #             "parent142" : "",
    #             "parent143" : "",
    #             "parent143x" : "",
    #             "num_142_quarters" : 0,
    #             "num_143_quarters" : 0,
    #             "num_143x_quarters" : 0,
    #             "num_14x_quarters" : 0,
    #             "cohort" : random.randint(0, 3),                
    #             "img" : parent.replace(" ", "_").lower(),
    #             "children" : [] }
    #         # print("hmm")
    #         # exit(0)
    #         # tas[parent] = { "parent142" : "",
    #         #             "parent143" : "",
    #         #             "parent143x" : "",
    #         #             "quarter" : random.randint(0, 3),
    #         #             "year" : random.randint(1998, 2020),
    #         #             "img" : parent.replace(" ", "_").lower(),
    #         #             "children" : [] }
    #     if parent != "":
    #         links.append({"source" : parent, "target" : child, "type": relation, "info_src": tas[parent], "info_child" :tas[child]})
    #         tas[parent]["children"].append(tas[child])
    taNames = set(tas.keys())
    
    def addParent(p, c):
        if p == "":
            return
        if p not in tas:
            tas[p] = { "id" : p,
                        "parent142" : "",
                        "parent143" : "",
                        "parent143x" : "",
                        "num_142_quarters" : 0,
                        "num_143_quarters" : 0,
                        "num_143x_quarters" : 0,
                        "num_14x_quarters" : 1,
                        "cohort" : random.randint(0, 3),#cohort.strip(),
                        "img" : taName.replace(" ", "_").lower(),
                        "children" : [] }
        tas[c]['children'].append(tas[p])


    for taName in taNames:
        addParent(tas[taName]["parent142"], taName)
        addParent(tas[taName]["parent143"], taName)
        addParent(tas[taName]["parent143x"], taName)
        

    nodes = []
    for taName in tas.keys():
        nextNode = copy.copy(tas[taName])
        nextNode["id"] = taName
        nodes.append(nextNode)
    
    # out = { "nodes" : nodes, "links": links}

    o = open("alt.json", "w")
    o.write(json.dumps(tas))
    # print(cohorts.keys())
    print(len(tas))
    print(tas)
    
    


