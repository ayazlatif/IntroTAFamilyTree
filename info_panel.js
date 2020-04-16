let COHORT_IMGS = new Set(["15sp", "16sp", "17au", "18au", "18sp", "18wi", "19au", "19sp", "19wi"])

export var buildInfoPanel = (function(data, color) {
    if (!data.id) {
        return;
    }
    resetInfoPanel();
    document.getElementById("cohortTAs").innerHTML = "";
    document.getElementById("infoPanel").style.backgroundColor = color;
    var imgUrl = `"https://gradeit.cs.washington.edu/uwcse/resources/${data.img}.jpg"`;
    var img = `<img src=${imgUrl} onerror="this.src='resources/error_pics/dubs.jpg';" >`
    var totalQuarters = sumQuarters(data);
    var veteran = totalQuarters >= 3 ? `<i class="fa fa-trophy" aria-hidden="true"></i> ` : "";
    document.getElementById("pic").innerHTML = img;
    document.getElementById("name").innerHTML = veteran + data.id;
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
    // document.getElementsByTagName("h3")[0].innerHTML = `Worked ${data.num_quarters} quarters`;
});

export var resetInfoPanel = (function resetInfoPanel() {
    document.getElementById("pic").innerHTML = `<img style="width:100%; height:100px;border-radius: 10%;background: none;"  src="resources/error_pics/no_cohort.svg"/>`;
    document.getElementById("name").innerHTML = "TA Family Tree Viz"
    document.getElementsByTagName("h2")[0].innerHTML = "";
    document.getElementById("num142").innerHTML = "";
    document.getElementById("num143").innerHTML = "";
    document.getElementById("num143x").innerHTML = "";
    document.getElementById("num14x").innerHTML = "";
    document.getElementById("total").innerHTML = "";
    document.getElementById("cohortTAs").innerHTML = `<p style="color:#232424;">Welcome to the TA "family" tree!</p>
    <p style="font-size:10pt;color:#232424;text-align: left;width:200px;padding-left: 5%;">This displays the hiring data and the 
        "family" relationships between the TAs at the Univerisity of Washington starting from the year 2000.
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
    console.log(avgQuarters);
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