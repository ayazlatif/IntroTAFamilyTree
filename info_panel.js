let COHORT_IMGS = new Set(["15sp", "16sp", "17au", "18au", "18sp", "18wi", "19au", "19sp", "19wi"])

export var buildInfoPanel = (function(data, color, lineage) {
    resetInfoPanel();
    document.getElementById("cohortTAs").innerHTML = "";
    document.getElementById("infoPanel").style.backgroundColor = color;
    let imgUrl = data.img ? data.img :`"https://gradeit.cs.washington.edu/uwcse/resources/${data.id.toLowerCase().replace(" ","_")}.jpg"`;
    var img = `<img src=${imgUrl} onerror="this.src='resources/error_pics/dubs.jpg';" >`
    var totalQuarters = sumQuarters(data);
    var veteran = totalQuarters >= 3 ? `<i class="fa fa-trophy" aria-hidden="true"></i> ` : "";
    document.getElementById("pic").innerHTML = img;
    document.getElementById("name").innerHTML = /*veteran +*/ data.id;
    document.getElementsByTagName("h2")[0].innerHTML = `Started ${data.cohort}`;
    document.getElementsByTagName("h2")[0].style.color = "#242323";
    if (data.num_142_quarters > 0) {
        document.getElementById("num142").innerHTML = `142 quarters: ${data.num_142_quarters}`;
    } else {
        document.getElementById("num142").innerHTML = "";

    }
    document.getElementById("num142").style.color = "#242323";
    document.getElementById("num143").style.color = "#242323";
    document.getElementById("num143x").style.color = "#242323";
    document.getElementById("num14x").style.color = "#242323";
    document.getElementById("total").style.color = "#242323";


    if (data.num_143_quarters > 0) {
        document.getElementById("num143").innerHTML = `143 quarters: ${data.num_143_quarters}`;
    }

    if (data.num_143x_quarters > 0) {
        document.getElementById("num143x").innerHTML = `143x quarters: ${data.num_143x_quarters}`;
    }

    if (data.num_14x_quarters > 0) {
        document.getElementById("num14x").innerHTML = `14x quarters: ${data.num_14x_quarters}`;
    }
    document.getElementById("total").innerHTML = `Quarters TA'd: ${totalQuarters}`;

    var countInfo = document.createElement("div");
    countInfo.style.margin = "0px";
    countInfo.style.marginTop = "10px";
    countInfo.id = "countInfo";
    document.getElementById("infoPanel").appendChild(countInfo);

    function addCount(count, message) {
        if (count > 0) {
            var ancestors = document.createElement("h3");
            ancestors.innerHTML = `${count} ${message}`;
            countInfo.appendChild(ancestors);
            ancestors.style.color = "#242323";
            ancestors.style.margin = "0px";
        }
    }

    addCount(lineage.parents.size - 1, lineage.parents.size - 1 == 1 ? "ancestor" : "ancestors");
    addCount(lineage.children.size - 1, lineage.children.size - 1 == 1 ? "descendant" : "descendants");
    addCount(data.children.length, data.children.length == 1 ? "child" : "children");

    

    // Kudos
    var button = document.createElement("button");
    button.id = "achieveButton"
    button.className = "collapsible";
    button.type = "button";
    button.innerHTML = `<i class="fa fa-trophy" aria-hidden="true"></i> Kudos`;
    var content = document.createElement("div");
    content.id = "achieveContent"
    content.className = "content";
    if (totalQuarters >= 3) {
        var p = document.createElement("p");
        p.innerHTML = `<i class="fa fa-award"></i> Veteran TA`;
        content.appendChild(p);
    }

    var listAchievements = data.kudos.split(",");
    var added = false;
    listAchievements.forEach(function (achievement) {
        if (achievement) {
            added = true;
            var p = document.createElement("p");
            p.innerHTML = `<i class="fa fa-award"></i> ${achievement}`;
            content.appendChild(p);
        }
    });

    if (totalQuarters >= 3 || added) {
        document.getElementById("infoPanel").appendChild(button);
        document.getElementById("infoPanel").appendChild(content);
    }

    // Nicknames
    var button = document.createElement("button");
    button.id = "nicknamesButton"
    button.className = "collapsible";
    button.type = "button";
    button.innerHTML = `<i class="fas fa-address-card"></i> Nicknames`;
    var content = document.createElement("div");
    content.id = "nicknamesContent"
    content.className = "content";

    var listNames = data.nicknames.split(",");
    listNames.forEach(function (name) {
        var p = document.createElement("p");
        p.innerHTML = `${name}`;
        content.appendChild(p);
    });

    if (data.nicknames) {
        document.getElementById("infoPanel").appendChild(button);
        document.getElementById("infoPanel").appendChild(content);
    }

    var coll = document.getElementsByClassName("collapsible");
    var i;
    
    for (i = 0; i < coll.length; i++) {
      coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.maxHeight){
          content.style.maxHeight = null;
        } else {
          content.style.maxHeight = content.scrollHeight + "px";
        }
      });
    }
});

export var resetInfoPanel = (function resetInfoPanel() {
    if (document.contains(document.getElementById("countInfo"))) {
        document.getElementById("countInfo").remove();
    }
    if (document.contains(document.getElementById("achieveButton"))) {
        document.getElementById("achieveButton").remove();
        document.getElementById("achieveContent").remove();
    }

    if (document.contains(document.getElementById("nicknamesButton"))) {
        document.getElementById("nicknamesButton").remove();
        document.getElementById("nicknamesContent").remove();
    }

    document.getElementById("pic").innerHTML = `<img style="width:100%; height:100px;border-radius: 10%;background: none;"  src="resources/error_pics/no_cohort.svg"/>`;
    document.getElementById("name").innerHTML = "TA Family Tree Viz"
    document.getElementsByTagName("h2")[0].innerHTML = "";
    document.getElementById("num142").innerHTML = "";
    document.getElementById("num143").innerHTML = "";
    document.getElementById("num143x").innerHTML = "";
    document.getElementById("num14x").innerHTML = "";
    document.getElementById("total").innerHTML = "";
    document.getElementById("cohortTAs").innerHTML = `<p style="color:#232424;">Welcome to the TA "family" tree!</p>

    <p style="font-size:11pt;color:#232424;width:100%;">This displays the hiring data and the 
        "family" relationships between the TAs at the University of Washington starting from the year 2000.
    </p>

    <p><a href="https://www.youtube.com/watch?v=6x9Osruma38">Learn more about intro at UW </a></p>`;
});

export var displayCohort = (function (cohort, people) {
    resetInfoPanel();
    var avgQuarters = 0;
    var lis = "<ul>";
    people.forEach(element => {
        avgQuarters += sumQuarters(element);
        lis += `<li>${element.id}</li>`;
    });
    lis +="</ul>";
    avgQuarters = avgQuarters / people.length;
    var imgUrl = `"resources/cohort_pics/${cohort}.jpg"`;
    imgUrl = COHORT_IMGS.has(cohort) ? imgUrl : "resources/error_pics/no_cohort.svg";
    var img = `<img src=${imgUrl} >`;
    var pic = document.getElementById("pic");
    pic.innerHTML = img;
    document.getElementsByTagName("img")[0].style.borderRadius = "10%";
    document.getElementsByTagName("img")[0].style.width = "80%";
    document.getElementsByTagName("img")[0].style.height = "100%";
    document.getElementsByTagName("img")[0].style.background = "none";
    document.getElementById("name").innerHTML = `${cohort} Cohort`;
    document.getElementById("num142").innerHTML = `Avg # Quarters TA'd: ${avgQuarters.toFixed(2)}`;
    document.getElementById("num143").innerHTML = `Cohort size: ${people.length}`
    document.getElementById("cohortTAs").innerHTML = lis;
});

function sumQuarters(taData) {
    return parseInt(taData.num_142_quarters) + 
            parseInt(taData.num_143_quarters) + parseInt(taData.num_143x_quarters) +
            parseInt(taData.num_14x_quarters);
}