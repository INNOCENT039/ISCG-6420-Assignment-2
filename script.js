let allAreas = document.querySelectorAll(".area");
let infoContainer = document.getElementById("info-container");
let selectedAreaId = null;
let selectedAreaInfo = null;
let areaData = {};
let bookingSummary = document.getElementById("bookingSummary");
let summaryContent = document.getElementById("summaryContent");

/* Load the area info from the XML file */
fetch('areas.xml')
  .then(response => response.text())
  .then(str => {
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(str, "text/xml");
    let areas = xmlDoc.getElementsByTagName("area");
    /*  Loop through each area and pull out its details */
    for (let i = 0; i < areas.length; i++) {
      let area = areas[i];
      let id = area.getElementsByTagName("id")[0].textContent;
      let cost = parseFloat(area.getElementsByTagName("cost")[0].textContent);
      let status = area.getElementsByTagName("status")[0].textContent;
      let capacity = parseInt(area.getElementsByTagName("capacity")[0].textContent);
      let image = area.getElementsByTagName("image")[0].textContent;

      /*  Store all this info in areaData object, using the area's ID as the key */
      areaData[id] = { id, cost, status, capacity, image };
    }




    /* hover effects for each area */
    allAreas.forEach(function (area) {
      let areaId = area.getAttribute("data-id");
      let info = areaData[areaId];
      /* Show info panel on mouse enter */
      area.addEventListener("mouseenter", function () {

        infoContainer.classList.remove("hidden");
        infoContainer.innerHTML =
          '<div class="infopanel-content">' +
          '<img src="' + info.image + '">' +
          '<div>' +
          '<strong>Area ' + info.id + '</strong><br>' +
          '<strong>Cost:</strong> $' + info.cost + ' per day<br>' +
          '<strong>Status:</strong> ' + info.status + '<br>' +
          '<strong>Capacity:</strong> ' + info.capacity +
          '</div>' +
          '</div>';

      });

      /* Hide info panel on mouse leave */
      area.addEventListener("mouseleave", function () {
        infoContainer.classList.add("hidden");
      });
    });
  });



/* When the page loads, set up the date pickers with sensible defaults */
document.addEventListener('DOMContentLoaded', function () {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  /* Format date as YYYY-MM-DD for input value */
  const formatDate = (date) => date.toISOString().split('T')[0];

  /*  Set today as the check-in date, tomorrow as the check-out, and don't allow earlier dates */
  document.getElementById('checkin').value = formatDate(today);
  document.getElementById('checkout').value = formatDate(tomorrow);
  document.getElementById('checkin').min = formatDate(today);
  document.getElementById('checkout').min = formatDate(tomorrow);
});


/* When the "Search" button is clicked, update which areas can be selected */
document.getElementById("searchButton").addEventListener("click", function () {
  const checkin = document.getElementById("checkin").value;
  const checkout = document.getElementById("checkout").value;
  const people = parseInt(document.getElementById("people").value);


  if (!checkin || !checkout || !people) {
    alert("Please fill all fields.");
    return;
  }


  allAreas.forEach(function (area) {
    const areaId = area.getAttribute("data-id");
    const info = areaData[areaId];
    if (!info) return;

    if (info.status === "Unavailable") {
      area.style.cursor = "not-allowed";
      area.onclick = null;
    } else if (info.capacity < people) {
      area.style.backgroundColor = "rgba(150, 150, 150, 0.5)";
      area.style.cursor = "not-allowed";
      area.onclick = null;
    } else {
      area.style.cursor = "pointer";
      area.style.backgroundColor = "rgba(0, 255, 0, 0.5)";
      area.onclick = function () {
        /* Remove any previous selection highlights */
        allAreas.forEach(a => a.style.boxShadow = "none");
        area.style.boxShadow = "0 0 0 4px #217b7e";
        selectedAreaId = areaId;
        selectedAreaInfo = info;
        bookingSummary.classList.remove("hidden");
        /* Show booking summary */
        updateBookingSummary();
      };
    }
  });
});




/* Update the booking summary with the latest info */
function updateBookingSummary() {
  if (!selectedAreaInfo) return;

  const checkin = document.getElementById("checkin").value;
  const checkout = document.getElementById("checkout").value;

  if (!checkin || !checkout) return;

  /* Calculate how many days the booking is for */
  const checkinDate = new Date(checkin);
  const checkoutDate = new Date(checkout);
  const days = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
  const totalCost = selectedAreaInfo.cost * days;

  /* Update the summary panel with all the details */
  summaryContent.innerHTML = `
        <p><strong>Area:</strong> ${selectedAreaInfo.id}</p>
        <p><strong>Maximum Capacity:</strong> ${selectedAreaInfo.capacity}</p>
        <p><strong>Cost per Day:</strong> $${selectedAreaInfo.cost}</p>
        <p><strong>Check-in:</strong> ${checkin}</p>
        <p><strong>Check-out:</strong> ${checkout}</p>
        <p><strong>Total Days:</strong> ${days}</p>
        <p><strong>Total Cost:</strong> $${totalCost}</p>
    `;
}

/* Update the summary whenever the check-in or check-out dates change */
document.getElementById("checkin").addEventListener("change", updateBookingSummary);
document.getElementById("checkout").addEventListener("change", updateBookingSummary);




/* When the "confirmButton" button is clicked, confirm the booking and reset everything */
document.getElementById("confirmButton").addEventListener("click", function () {

  /* Grab the latest values from the form */
  const checkin = document.getElementById("checkin").value;
  const checkout = document.getElementById("checkout").value;
  const people = parseInt(document.getElementById("people").value);
  const checkinDate = new Date(checkin);
  const checkoutDate = new Date(checkout);
  const days = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
  const totalCost = selectedAreaInfo.cost * days;

  /*Show a confirmation message with all the booking details */
  alert(
    "Booking Confirmed!\n" +
    "Arrival Date: " + checkin + "\n" +
    "Leave Date: " + checkout + "\n" +
    "Selected Area: " + selectedAreaInfo.id + "\n" +
    "Maximum Capacity: " + selectedAreaInfo.capacity + "\n" +
    "Cost per Day: $" + selectedAreaInfo.cost + "\n" +
    "Total Cost: $" + totalCost
  );


  document.getElementById("bookingForm").reset();

  /* Reset all the area selections and styles and hide the booking summary and clear the selected area */
  allAreas.forEach(a => {
    a.style.boxShadow = "none";
    a.style.backgroundColor = a.classList.contains("booked") ? "rgba(255, 0, 0, 0.5)" : "rgba(0, 255, 0, 0.5)";
    a.onclick = null;
  });
  bookingSummary.classList.add("hidden");
  selectedAreaId = null;
  selectedAreaInfo = null;

});





