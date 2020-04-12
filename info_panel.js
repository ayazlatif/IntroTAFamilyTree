let COHORT_IMGS = new Set(["15sp", "16sp", "17au", "18au", "18sp", "18wi", "19au", "19sp", "19wi"])

export function buildInfoPanel(data, color) {
    if (!data.id) {
        return;
    }
    resetInfoPanel();
    document.getElementById("infoPanel").style.backgroundColor = color;
    var imgUrl = `"https://gradeit.cs.washington.edu/uwcse/resources/${data.img}.jpg"`;
    var img = `<img src=${imgUrl} onerror="this.src='resources/error_pics/dubs.jpg';" >`
    var totalQuarters = sumQuarters(data);
    var veteran = totalQuarters >= 3 ? `<i class="fa fa-trophy" aria-hidden="true"></i> ` : "";
    document.getElementById("pic").innerHTML = img;
    document.getElementById("name").innerHTML = veteran + data.id;
    document.getElementsByTagName("h2")[0].innerHTML = `Started ${data.cohort}`;
    if (data.num_142_quarters > 0) {
        document.getElementById("num142").innerHTML = `142 quarters: ${data.num_142_quarters}`;
    } else {
        document.getElementById("num142").innerHTML = "";

    }

    if (data.num_143_quarters > 0) {
        document.getElementById("num143").innerHTML = `143 quarters: ${data.num_143_quarters}`;
    }

    if (data.num_143x_quarters > 0) {
        document.getElementById("num143x").innerHTML = `143x quarters: ${data.num_143x_quarters}`;
    }

    if (data.num_14x_quarters > 0) {
        document.getElementById("num14x").innerHTML = `14x quarters: ${data.num_14x_quarters}`;
    }
    document.getElementById("total").innerHTML = `total: ${totalQuarters}`;
    // document.getElementsByTagName("h3")[0].innerHTML = `Worked ${data.num_quarters} quarters`;
}

export function resetInfoPanel() {
    document.getElementById("pic").innerHTML = "TA Family Tree";
    document.getElementById("name").innerHTML = ""
    document.getElementsByTagName("h2")[0].innerHTML = "";
    document.getElementById("num142").innerHTML = "";
    document.getElementById("num143").innerHTML = "";
    document.getElementById("num143x").innerHTML = "";
    document.getElementById("num14x").innerHTML = "";
    document.getElementById("total").innerHTML = "";
    document.getElementById("cohortTAs").innerHTML = "";
}

export function displayCohort(cohort, people) {
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
    document.getElementsByTagName("img")[0].style.width = "300px";
    document.getElementsByTagName("img")[0].style.height = COHORT_IMGS.has(cohort) ? "200px" : "100px";
    document.getElementsByTagName("img")[0].style.background = "none";
    document.getElementById("name").innerHTML = `${cohort} Cohort`;
    document.getElementById("num142").innerHTML = `Avg # Quarters TA'd: ${avgQuarters.toFixed(2)}`;
    document.getElementById("cohortTAs").innerHTML = lis;

    
    // document.getElementById("cohortInfo").innerHTML = 
}

function sumQuarters(taData) {
    return parseInt(taData.num_142_quarters) + 
            parseInt(taData.num_143_quarters) + parseInt(taData.num_143x_quarters) +
            parseInt(taData.num_14x_quarters);
}