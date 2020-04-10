with open("bigger.txt", "r") as f:
    for line in f:
        print(','.join(list(map(lambda x: "" if x == "- -" else x, line.split(",")[0:-1]))) + ",")