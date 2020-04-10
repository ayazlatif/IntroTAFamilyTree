export function buildInfoPanel(data) {
    var imgUrl = `"https://gradeit.cs.washington.edu/uwcse/resources/${data.img}.jpg"`;
    var img = `<img src=${imgUrl} onerror="this.src='dubs.jpg';" >`
    var veteran = data.num_quarters >= 3 ? `<i class="fa fa-trophy" aria-hidden="true"></i>` : "";
    document.getElementById("pic").innerHTML = img;
    document.getElementById("name").innerHTML = veteran + " " + data.id;
    document.getElementsByTagName("h2")[0].innerHTML = `Started ${data.year}`;
    document.getElementsByTagName("h3")[0].innerHTML = `Worked ${data.num_quarters} quarters`;
}