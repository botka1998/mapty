'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const mapDiv = document.querySelector('#map');
let coords;
const styles = getComputedStyle(document.documentElement);
const colorDark1 = styles.getPropertyValue('--color-dark--1');
const colorDark2 = styles.getPropertyValue('--color-dark--2');
const popups = [];
const markers = [];
let activePopup = undefined;
const map = L.map('map');
inputType.addEventListener('change', function () {
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
});
function thisFunction() {
  updateActive(this);
}

function updateActive(popup) {
  //console.log(popups[0].getElement());
  form.classList.remove('hidden');
  inputDistance.focus();
  activePopup = popup;

  popups.forEach(popup => {
    if (popup.getElement()) {
      popup.getElement().children[0].style.background = colorDark1;
      popup.getElement().children[1].children[0].style.background = colorDark1;
    }
  });
  activePopup.getElement().children[0].style.background = colorDark2;
  activePopup.getElement().children[1].children[0].style.background =
    colorDark2;
}

// ADDING/EDITING a WORKOUT(popup content)
form.addEventListener('submit', function (e) {
  // myApp.activeWorkout = ne
  e.preventDefault();
  // if (!activePopup) return;

  // GET TYPE OF WORKOUT
  const woType = inputType.value === 'running' ? '🏃‍♂️' : '🚴‍♂️';

  // create content html element and read input
  const content = L.DomUtil.create('p', 'content');
  content.innerText = `${woType}${inputDistance.value} km`;

  // show workout info
  activePopup.openOn(map);
  activePopup.setContent(content);
  activePopup.getElement().children[0].style.background = colorDark1;
  activePopup.getElement().children[1].children[0].style.background =
    colorDark1;

  // add popup click event for later editing
  activePopup
    .getElement()
    .addEventListener('click', thisFunction.bind(activePopup));
  // clear input fields and  go back to map
  inputCadence.value =
    inputDistance.value =
    inputDuration.value =
    inputElevation.value =
      '';
  form.classList.add('hidden');
  mapDiv.focus();
});
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (geoloc) {
      // get current location
      const { latitude } = geoloc.coords;
      const { longitude } = geoloc.coords;
      coords = [latitude, longitude];
      // set map layer style
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      map.setView(coords, 13);

      // add new workout by clicking on map
      map.on('click', function (e) {
        form.classList.remove('hidden');
        inputDistance.focus();
        // get clicked location
        const { lat, lng } = e.latlng;
        // create new popup
        const tempPopUp = new L.popup({
          maxWidth: 250,
          autoClose: false,
          closeOnClick: false,
          interactive: true,
          className: 'running-popup',
        });
        // set init text
        const content = L.DomUtil.create('p', 'content');
        content.innerText = 'New Workout 💪';
        tempPopUp.setContent(content).setLatLng(new L.latLng(lat, lng));

        // bring to front on hover
        tempPopUp.on('mouseover', function (e) {
          e.target.bringToFront();
        });
        tempPopUp.on('mouseout', function (e) {
          activePopup.bringToFront();
        });
        activePopup = tempPopUp;
        popups.push(tempPopUp);

        const tempMarker = L.marker([lat, lng], { riseOnHover: true })
          .addTo(map)
          .bindPopup(popups[popups.length - 1]);

        markers.push(tempMarker);
        //tempPopUp.openOn(map);
      });
      map.on('popupopen', function (e) {
        updateActive(e.popup);
      });
    },
    function () {
      alert('could not get position');
    }
  );
}
