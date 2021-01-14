const COHORT_IMGS = new Set(["15sp", "16sp", "17au", "18au", "18sp", "18wi", "19au", "19sp", "19wi"])
const VETERAN_COUNT = 3;

export let buildInfoPanel = ((data, color, lineage) => {
    function getImageURL(data) {
        if (data.img) {
            return data.img;
        }
        let taName = data.id;
        taName = taName
            .toLowerCase()
            .replace(" ", "_");
        return `https://gradeit.cs.washington.edu/uwcse/resources/${taName}.jpg`
    }

    function createDisplayPicture(data) {
        let imgUrl = getImageURL(data);
        let img = document.createElement("img");
        img.id = "displayPic";
        img.src = imgUrl;
        img.onerror = (source) => {
            source.target.src='resources/error_pics/dubs.jpg';
        };
        document.getElementById("pic").appendChild(img);
    }

    function createNumQuartersElement(numQuarters, course) {
        if (numQuarters > 0) {
            document.getElementById(`num${course}`).innerHTML = `${course} quarters: ${numQuarters}`;
        }
        document.getElementById(`num${course}`).style.color = "#242323";
    }

    function createLineageCountDiv() {
        function createLineageElement(count, message) {
            if (count > 0) {
                let ancestors = document.createElement("h3");
                ancestors.innerHTML = `${count} ${message}`;
                countInfo.appendChild(ancestors);
                ancestors.style.color = "#242323";
                ancestors.style.margin = "0px";
            }
        }

        let countInfo = document.createElement("div");
        countInfo.style.margin = "0px";
        countInfo.style.marginTop = "10px";
        countInfo.id = "countInfo";
        document.getElementById("infoPanel").appendChild(countInfo);

        createLineageElement(
            lineage.parents.size - 1,
            lineage.parents.size - 1 == 1 ? "ancestor" : "ancestors"
        );

        createLineageElement(
            lineage.children.size - 1,
            lineage.children.size - 1 == 1 ? "descendant" : "descendants"
        );

        createLineageElement(
            data.children.length,
            data.children.length == 1 ? "child" : "children"
        );
    }

    function createExpandableList(listName, list, decorator = '') {
        let button = document.createElement("button");
        button.id = `${listName}Button`;
        button.className = "collapsible";
        button.addEventListener("click", () => {
            this.classList.toggle("active");
            let content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
        button.type = "button";
        button.innerHTML = `<i class="fas fa-address-card"></i> ${listName}`;
        let content = document.createElement("div");
        content.id = `${listName}Content`;
        content.className = "content";

        list.forEach(function (elm) {
            let p = document.createElement("p");
            p.innerHTML = `${decorator}${elm}`;
            content.appendChild(p);
        });

        document.getElementById("infoPanel").appendChild(button);
        document.getElementById("infoPanel").appendChild(content);
    }

    resetInfoPanel({clearAll : true});

    document.getElementById("infoPanel").style.backgroundColor = color;

    createDisplayPicture(data);

    document.getElementById("name").innerHTML = data.id;
    document.getElementsByTagName("h2")[0].innerHTML = `Started ${data.cohort}`;
    document.getElementsByTagName("h2")[0].style.color = "#242323";

    createNumQuartersElement(data.num_142_quarters, '142');
    createNumQuartersElement(data.num_143_quarters, '143');
    createNumQuartersElement(data.num_143x_quarters, '143x');
    createNumQuartersElement(data.num_14x_quarters, '14x');

    let totalQuarters = sumQuarters(data);
    document.getElementById("total").innerHTML = `Quarters TA'd: ${totalQuarters}`;
    document.getElementById("total").style.color = "#242323";

    createLineageCountDiv();

    if (data.kudos || totalQuarters >= VETERAN_COUNT) {
        let kudosList = totalQuarters >= VETERAN_COUNT ? ['Veteran TA'] : [];
        if (data.kudos) {
            kudosList.push(...data.kudos.split(","));
        }
        createExpandableList("Kudos", kudosList, '<i class="fa fa-award"></i> ');
    }

    if (data.nicknames) {
        createExpandableList("Nicknames", data.nicknames.split(","));
    }
});

export let resetInfoPanel = ((clearAll=false) => {
    if (document.contains(document.getElementById("countInfo"))) {
        document.getElementById("countInfo").remove();
    }
    if (document.contains(document.getElementById("KudosButton"))) {
        document.getElementById("KudosButton").remove();
        document.getElementById("KudosContent").remove();
    }

    if (document.contains(document.getElementById("NicknamesButton"))) {
        document.getElementById("NicknamesButton").remove();
        document.getElementById("NicknamesContent").remove();
    }

    if (document.contains(document.getElementById("dipslayPic"))) {
        document.getElementById("displayPic").remove();
    }

    document.getElementById("pic").innerHTML = clearAll ? '' : `<img style="width:100%; height:100px;border-radius: 10%;background: none;"  src="resources/error_pics/no_cohort.svg"/>`;
    document.getElementById("name").innerHTML = clearAll ? '' : "TA Family Tree Viz"
    document.getElementsByTagName("h2")[0].innerHTML = "";
    document.getElementById("num142").innerHTML = "";
    document.getElementById("num143").innerHTML = "";
    document.getElementById("num143x").innerHTML = "";
    document.getElementById("num14x").innerHTML = "";
    document.getElementById("total").innerHTML = "";
    document.getElementById("cohortTAs").innerHTML = clearAll ? '' : `<p style="color:#232424;">Welcome to the TA "family" tree!</p>

    <p style="font-size:11pt;color:#232424;width:100%;">This displays the hiring data and the 
        "family" relationships between the TAs at the University of Washington starting from the year 2000.
    </p>

    <p><a href="https://www.youtube.com/watch?v=6x9Osruma38">Learn more about intro at UW </a></p>`;
});

export let displayCohort = ((cohort, people) => {
    resetInfoPanel();
    let avgQuarters = 0;
    let lis = "<ul>";
    people.forEach(element => {
        avgQuarters += sumQuarters(element);
        lis += `<li>${element.id}</li>`;
    });
    lis += "</ul>";
    avgQuarters = avgQuarters / people.length;
    let imgUrl = `"resources/cohort_pics/${cohort}.jpg"`;
    imgUrl = COHORT_IMGS.has(cohort) ? imgUrl : "resources/error_pics/no_cohort.svg";
    let img = `<img src=${imgUrl} >`;
    let pic = document.getElementById("pic");
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