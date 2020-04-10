let COHORT_IMGS = new Set(["15sp", "16sp", "17au", "18au", "18sp", "18wi", "19au", "19sp", "19wi"])

export function buildInfoPanel(data) {
    var imgUrl = `"https://gradeit.cs.washington.edu/uwcse/resources/${data.img}.jpg"`;
    var img = `<img src=${imgUrl} onerror="this.src='resources/error_pics/dubs.jpg';" >`
    var veteran = data.num_quarters >= 3 ? `<i class="fa fa-trophy" aria-hidden="true"></i> ` : "";
    document.getElementById("pic").innerHTML = img;
    document.getElementById("name").innerHTML = veteran + data.id;
    document.getElementsByTagName("h2")[0].innerHTML = `Started ${data.cohort}`;
    document.getElementsByTagName("h3")[0].innerHTML = `Worked ${data.num_quarters} quarters`;
}

export function resetInfoPanel() {
    document.getElementById("pic").innerHTML = "TA Family Tree";
    document.getElementById("name").innerHTML = ""
    document.getElementsByTagName("h2")[0].innerHTML = "";
    document.getElementsByTagName("h3")[0].innerHTML = "";
}

export function displayCohort(cohort) {
    resetInfoPanel();
    var imgUrl = `"resources/cohort_pics/${cohort}.jpg"`;
    imgUrl = COHORT_IMGS.has(cohort) ? imgUrl : "resources/error_pics/no_cohort.svg";
    var img = `<img src=${imgUrl} >`;
    var pic = document.getElementById("pic");
    pic.innerHTML = img;
    document.getElementsByTagName("img")[0].style.borderRadius = "0%";
    document.getElementsByTagName("img")[0].style.width = "300px";
    document.getElementsByTagName("img")[0].style.height = "200px";
    document.getElementsByTagName("img")[0].style.background = "none";
    document.getElementById("name").innerHTML = `${cohort} cohort`
}