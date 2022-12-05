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
        App._showForm();
      }.bind(this)
    );
    this.map.on("popupopen", function (e) {
      const popup = e.popup;
      myApp._setActive.bind(popup)();
      popup
        .getElement()
        .addEventListener(
          "click",
          myApp._setActive.bind(myApp.activeWorkout.popup)
        );
    });
    this.map.on("popupclose", myApp._hideForm);
  }

  _hideForm() {
    // clear input fields and  go back to map
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        "";
    form.classList.add("hidden");
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
    // const content = L.DomUtil.create("p", "content");
    // content.innerText = "New Workout 💪";
    tempPopUp
      .setContent("New Workout 💪")
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
    const popup = this;
    // console.log(popup.getElement().children[0]);
    App._showForm();
    myApp.activeWorkout = myApp.workouts.find(
      (workout) => workout.popup === popup
    );
    myApp.workouts.forEach((workout) => {
      const popup = workout.popup;
      if (popup.getElement()) {
        popup.getElement().children[0].style.background = colorDark1;
        popup.getElement().children[1].children[0].style.background =
          colorDark1;
      }
    });
    myApp.activeWorkout.setPopupColor(1);
  }
  static _showForm() {
    form.classList.remove("hidden");
    inputDistance.focus();
  }
}

class Workout {
  constructor(distance, duration, coords, popup) {
    this.distance = distance;
    this.duration = duration;
    this.coords = coords;
    this.date = new Date();
    this.popup = popup;
    this.type = undefined;
  }
  setPopupColor(color) {
    this.popup.getElement().children[0].style.background =
      color === 0 ? colorDark1 : colorDark2;
    this.popup.getElement().children[1].children[0].style.background =
      color === 0 ? colorDark1 : colorDark2;
  }
  setType(type) {
    this.type = type
    if(type==="🚴‍♂️"){

      this.popup.options.className = "cycling-popup"
      this.popup.getElement().classList.add("cycling-popup")
      this.popup.getElement().classList.remove("running-popup")
    }
    else
    {
      this.popup.options.className = "running-popup"
      this.popup.getElement().classList.add("running-popup")
      this.popup.getElement().classList.remove("cycling-popup")

    }

  }
}
class Running extends Workout {
  constructor(distance, duration, coords, popup, cadence) {
    super(distance, duration, coords, popup);
    this.cadence = cadence;
  }
}
class Cycling extends Workout {
  constructor(distance, duration, coords, popup, elevationGain) {
    super(distance, duration, coords, popup);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
const myApp = new App();
function updateActive() {
  const popup = this;
  App._showForm();
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

  if(!+inputDistance.value || !+inputDuration.value) return;
  // create content html element and read input
  const content = L.DomUtil.create("p", "content");
  content.innerText = `${woType}${inputDistance.value} km`;
  myApp.activeWorkout.distance = Number(inputDistance.value);

  // show workout info
  myApp.activeWorkout.popup.openOn(myApp.map);
  myApp.activeWorkout.popup.setContent(content);
  myApp.activeWorkout.setPopupColor(0);
  myApp.activeWorkout.setType(woType);
  // add popup click event for later editing

  // clear input fields and  go back to map
  myApp._hideForm();
});
