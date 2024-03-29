const VETERAN_COUNT = 3;

export let initInfoPanel = () => {
    function createTagWithId(tag, id) {
        let element = document.createElement(tag);
        element.id = id;
        infoPanel.appendChild(element);
    }
    let infoPanel = document.getElementById("infoPanel");
    createTagWithId("h1", "pic");
    let img = document.createElement("img");
    img.id = "displayPic";
    document.getElementById("pic").appendChild(img);
    createTagWithId("h1", "name");
    createTagWithId("div", "shareMe");
    createTagWithId("h2", "cohortInfo");
    createTagWithId("div", "cohortTAs");
    createTagWithId("h3", "num142");
    createTagWithId("h3", "num143");
    createTagWithId("h3", "num143x");
    createTagWithId("h3", "num14x");
    createTagWithId("h3", "num121");
    createTagWithId("h3", "num122");
    createTagWithId("h3", "num123");
    createTagWithId("h3", "total");
    resetInfoPanel();
}

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

    function createExpandableList(listName, list, icon) {
        let button = document.createElement("button");
        button.className = "collapsible";
        button.addEventListener("click", function() {
            this.classList.toggle("active");
            let content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
        button.type = "button";
        button.innerHTML = `<i class="fas ${icon}"></i> ${listName}`;
        let content = document.createElement("ul");
        content.className = "expandleList"
        content.className = "content";

        list.forEach(function (elm) {
            let p = document.createElement("li");
            p.appendChild(elm);
            content.appendChild(p);
        });

        document.getElementById("infoPanel").appendChild(button);
        document.getElementById("infoPanel").appendChild(content);
        listName = listName.replaceAll(' ', '');
        listName = listName.replaceAll('!', '');
        button.id = `${listName}Button`;
        content.id = `${listName}Content`;
        button.click()
        return button
    }

    function createConnectionDiv() {
        let connections = document.createElement("div")
        if (data.linkedin.length > 0) {
            let a = document.createElement("a");
            let i = document.createElement("i");
            a.href = data.linkedin
            i.className = "fa fa-linkedin"
            a.appendChild(i);
            connections.appendChild(a);
        }

        if (data.github.length > 0) {
            let a = document.createElement("a");
            let i = document.createElement("i");
            a.href = data.github
            i.className = "fa fa-github"
            a.appendChild(i);
            connections.appendChild(a)
        }
        createExpandableList("Connect With Me!", [connections], 'fa-link')
    }

    resetInfoPanel({clearAll : true});

    document.getElementById("infoPanel").style.backgroundColor = color;

    createDisplayPicture(getImageURL(data), 'dubs.jpg');
    document.getElementById("displayPic").className = "";

    document.getElementById("name").innerHTML = data.id;
    document.getElementById("cohortInfo").textContent = `Started ${data.cohort}`;
    document.getElementById("cohortInfo").style.color = "#242323";

    createNumQuartersElement(data.num_142_quarters, '142');
    createNumQuartersElement(data.num_143_quarters, '143');
    createNumQuartersElement(data.num_143x_quarters, '143x');
    createNumQuartersElement(data.num_14x_quarters, '14x');
    createNumQuartersElement(data.num_121_quarters, '121');
    createNumQuartersElement(data.num_122_quarters, '122');
    createNumQuartersElement(data.num_123_quarters, '123');



    let totalQuarters = sumQuarters(data);
    document.getElementById("total").innerHTML = `Quarters TA'd: ${totalQuarters}`;
    document.getElementById("total").style.color = "#242323";

    createLineageCountDiv();

    if (data.linkedin.length !== 0 || data.github.length !== 0) {
        createConnectionDiv()
    }

    let share = document.getElementById("shareMe");
    let button = document.createElement("button");
    button.textContent = 'Share this TA'
    button.onclick = function() {
        let name = data.id.replaceAll(' ', '%20');
        let link = `https://ayazlatif.github.io/IntroTAFamilyTree/?name=${name}`;
        navigator.clipboard.writeText(link).then(() => {
            alert(`Content copied to clipboard ${link}`);
        });
    };
    share.appendChild(button);

    if (data.kudos || totalQuarters >= VETERAN_COUNT) {
        let kudosList = totalQuarters >= VETERAN_COUNT ? ['Veteran TA'] : [];
        if (data.kudos) {
            kudosList.push(...data.kudos.split(","));
        }

        kudosList = kudosList.map(x => {
            let p = document.createElement("p");
            p.textContent = x;
            p.style.display = 'inline';
            p.style.textAlign = 'right';
            return p;
        })
        createExpandableList("Kudos", kudosList, 'fa-fire');
    }

    if (data.nicknames) {
        createExpandableList("Nicknames", data.nicknames.split(",").map(x => {
            let p = document.createElement("p");
            p.textContent = x;
            return p;
        }), 'fa-address-card');
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

    if (document.contains(document.getElementById("ConnectWithMeButton"))) {
        document.getElementById("ConnectWithMeButton").remove();
        document.getElementById("ConnectWithMeContent").remove();
    }

    document.getElementById("displayPic").src = "resources/error_pics/no_cohort.svg";
    document.getElementById("displayPic").className = "cohortPic";
    document.getElementById("name").innerHTML = clearAll ? '' : "TA Family Tree Viz"
    document.getElementById("cohortInfo").innerHTML = "";
    document.getElementById("num142").innerHTML = "";
    document.getElementById("num143").innerHTML = "";
    document.getElementById("num143x").innerHTML = "";
    document.getElementById("num14x").innerHTML = "";
    document.getElementById("num121").innerHTML = "";
    document.getElementById("num122").innerHTML = "";
    document.getElementById("num123").innerHTML = "";
    document.getElementById("total").innerHTML = "";
    document.getElementById("shareMe").innerText = "";
    document.getElementById("cohortTAs").innerHTML = clearAll ? '' : `<p style="color:#232424;">Welcome to the TA "family" tree!</p>

    <p style="font-size:11pt;color:#232424;width:100%;">This displays the hiring data and the 
        "family" relationships between the TAs at the University of Washington starting from the year 2000.
    </p>

    <p><a href="https://www.youtube.com/watch?v=6x9Osruma38">Learn more about intro at UW </a></p>

    <p><a href="https://github.com/ayazlatif/IntroTAFamilyTree">Contribute to the source code for this project!</p>`;
});

export let displayCohort = ((cohort, people) => {
    resetInfoPanel(true);
    let avgQuarters = 0;
    let peopleInCohortList = document.createElement("ul");
    people.forEach(person => {
        let li = document.createElement("li");
        avgQuarters += sumQuarters(person);
        li.textContent = person.id;
        peopleInCohortList.appendChild(li);
    });
    createDisplayPicture(`resources/cohort_pics/${cohort}.jpg`, 'no_cohort.svg');
    document.getElementById("displayPic").className = "cohortPic";

    avgQuarters = avgQuarters / people.length;

    document.getElementById("displayPic").className = "cohortPic";
    document.getElementById("name").textContent = `${cohort} Cohort`;
    document.getElementById("num142").textContent = `Avg # Quarters TA'd: ${avgQuarters.toFixed(2)}`;
    document.getElementById("num143").textContent = `Cohort size: ${people.length}`
    document.getElementById("cohortTAs").appendChild(peopleInCohortList);
});

function sumQuarters(taData) {
    return parseInt(taData.num_142_quarters) +
        parseInt(taData.num_143_quarters) + parseInt(taData.num_143x_quarters) +
        parseInt(taData.num_14x_quarters) + parseInt(taData.num_121_quarters) +
        parseInt(taData.num_122_quarters) + parseInt(taData.num_123_quarters);
}

function createDisplayPicture(imgUrl, errorPic) {
    let img = document.getElementById("displayPic");
    img.id = "displayPic";
    img.src = imgUrl;
    img.onerror = (source) => {
        source.target.src=`resources/error_pics/${errorPic}`;
    };
    document.getElementById("pic").appendChild(img);
}