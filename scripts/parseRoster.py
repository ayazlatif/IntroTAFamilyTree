import string
with open('17sp-20wi.csv', 'r') as f:
    out = open("res.csv", 'w')
    for line in f:
        taInfo = line.strip().split(",")
        taName = taInfo[1] + " " + taInfo[2]
        num142 = taInfo[4]
        num143 = taInfo[5]
        num143x = taInfo[6]
        num14x = taInfo[7]
        cohort = taInfo[8]

        out.write('%s,,,,%s,%s,%s,%s,%s\n' % (string.capwords(taName), num142, num143, num143x, num14x, cohort))
        