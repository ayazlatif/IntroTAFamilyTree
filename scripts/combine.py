data = []
m = {}
with open("05au-20wi.csv", "r") as f:
    for line in f:
        line = line.strip().split(",")
        indices = [0]
        part2 = list(range(4, len(line)))
        indicies = indices + part2
        line = [line[x] for x in indicies]
        m[line[0].lower()] = line
        data.append(line)


with open("huge_test.csv", "r") as f:
    for line in f:
        line = line.strip().split(",")
        toAdd = [line[x] for x in [1,2,3]]
        if line[0].lower() not in m:
            n = [line[0], "?", "?", "?", "?", "05au"]
            m[line[0].lower()] = n
            data.append(n)
        m[line[0].lower()].insert(1, toAdd[2])
        m[line[0].lower()].insert(1, toAdd[1])
        m[line[0].lower()].insert(1, toAdd[0])

        # m[line[0]]
data = map(lambda x: ','.join(x), data)
res = '\n'.join(data)
out = open("all.csv", "w")
out.write(res)
    