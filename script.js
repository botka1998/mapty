"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");
const mapDiv = document.querySelector("#map");
let coords;
const styles = getComputedStyle(document.documentElement);
const colorDark1 = styles.getPropertyValue("--color-dark--1");
const colorDark2 = styles.getPropertyValue("--color-dark--2");
const popups = [];
const markers = [];
let activePopup = undefined;
inputType.addEventListener("change", function () {
  inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
  inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
});
function thisFunction() {
  updateActive(this);
}
class App {
  constructor() {
    this.workouts = [];
    this.map = new L.map("map");
    this.activeWorkout = undefined;
    this._getPosition();
    this.popups = [];
  }
  _getPosition() {
    if (!navigator.geolocation) return false;
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      function () {
        console.log("geoloc problem");
      }
    );
  }
  _loadMap(geoloc) {
    const { latitude, longitude } = geoloc.coords;
    const position = [latitude, longitude];
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.map.setView(position, 13);

    // add new workout by clicking on map
    this.map.on(
      "click",
      function (e) {
        // get clicked location
        const { lat, lng } = e.latlng;
        this.activeWorkout = this._newWorkout([lat, lng]);
        this._showForm();
      }.bind(this)
    );
    this.map.on("popupopen", function (e) {
      updateActive(e.popup);
    });
  }
  _showForm() {
    form.classList.remove("hidden");
    inputDistance.focus();
  }
  _hideForm() {
    // clear input fields and  go back to map
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        "";
    form.classList.add("hidden");
    this.activeWorkout = undefined;
    mapDiv.focus();
  }
  _newWorkout(location) {
    const tempPopUp = new L.popup({
      maxWidth: 250,
      autoClose: false,
      closeOnClick: false,
      interactive: true,
      className: "running-popup",
    });
    // set init text
    const content = L.DomUtil.create("p", "content");
    content.innerText = "New Workout 💪";
    tempPopUp
      .setContent(content)
      .setLatLng(new L.latLng(location[0], location[1]));

    // bring to front on hover
    tempPopUp.on("mouseover", function (e) {
      e.target.bringToFront();
    });
    tempPopUp.on("mouseout", function (e) {
      myApp.activeWorkout.popup.bringToFront();
    });

    const tempWorkout = new Workout();
    tempWorkout.popup = tempPopUp;
    this.workouts.push(tempWorkout);

    const tempMarker = L.marker(location, { riseOnHover: true })
      .addTo(this.map)
      .bindPopup(tempPopUp);
    return tempWorkout;
  }
  _setActive() {
    this._showForm();
    this.activeWorkout = this.workouts.find(
      (workout) => workout.popup === popup
    );
    this.workouts.forEach((workout) => {
      workout.popup.getElement() && workout.setPopupColor(0);
    });
    this.activeWorkout.setPopupColor(1);
  }
}

class Workout {
  constructor(distance, duration, coords, popup) {
    this.distance = distance;
    this.duration = duration;
    this.coords = coords;
    this.date = undefined;
    this.popup = popup;
  }
  setPopupColor(color) {
    this.popup.getElement().children[0].style.background =
      color === 0 ? colorDark1 : colorDark2;
    this.popup.getElement().children[1].children[0].style.background =
      color === 0 ? colorDark1 : colorDark2;
  }
}
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
const myApp = new App();
function updateActive(popup) {
  myApp._showForm();
  myApp.activeWorkout = myApp.workouts.find(
    (workout) => workout.popup === popup
  );
  myApp.workouts.forEach((workout) => {
    const popup = workout.popup;
    if (popup.getElement()) {
      popup.getElement().children[0].style.background = colorDark1;
      popup.getElement().children[1].children[0].style.background = colorDark1;
    }
  });
  myApp.activeWorkout.setPopupColor(1);
}

// ADDING/EDITING a WORKOUT(popup content)
form.addEventListener("submit", function (e) {
  e.preventDefault();
  // GET TYPE OF WORKOUT
  const woType = inputType.value === "running" ? "🏃‍♂️" : "🚴‍♂️";

  // create content html element and read input
  const content = L.DomUtil.create("p", "content");
  content.innerText = `${woType}${inputDistance.value} km`;
  myApp.activeWorkout.distance = Number(inputDistance.value);

  // show workout info
  myApp.activeWorkout.popup.openOn(myApp.map);
  myApp.activeWorkout.popup.setContent(content);
  myApp.activeWorkout.setPopupColor(0);

  // add popup click event for later editing

  myApp.activeWorkout.popup
    .getElement()
    .addEventListener("click", thisFunction.bind(myApp.activeWorkout.popup));
  // clear input fields and  go back to map
  myApp._hideForm();
});
