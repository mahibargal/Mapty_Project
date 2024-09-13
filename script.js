'use strict';

// prettier-ignore

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
let map,mapEvent;

// navigator.geolocation.getCurrentPosition(successGetPosition,errorGetPosition);



//workout

class Workout {
    date = new Date();
    id = (Date.now()+ '').slice(-10);
    constructor(coords, distance, duration) {
        this.coords = coords; //[lat.lng]
        this.distance = distance;//km
        this.duration = duration//min
    }
    _createDescription(){
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on  ${months[this.date.getMonth()]} ${this.date.getDate()}`
    }
}

class Running extends Workout{
    type = 'running';
    constructor(coords,distance,duration,cadence){
      super(coords,distance,duration);
      this.cadence = cadence;
      this.calcPace();
      this._createDescription()
    }

    calcPace(){ //duration/dist
        this.pace = this.duration/this.distance;
        return this.pace
    }
}

class Cycling extends Workout {
    type = 'cycling';
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration)
        this.elevationGain = elevationGain;
        this.calSpeed();
        this._createDescription()
    }
    calSpeed(){
        this.speed = this.distance/(this.duration/60)
    }
}





////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//app architecture
class App {
    #map;
    #mapEvent
    #workouts = [];
    constructor() {
        form.addEventListener('submit', this._newWorkOut.bind(this))
        //changing running,cycling dropdown
        inputType.addEventListener('change', this._toggleElevationField)
        this._getPosition();

    }

    _getPosition() {
        navigator.geolocation.getCurrentPosition(
            this._loadMap.bind(this), function () {
                alert('location failed')
            });
    }

    _loadMap(position) {

        const { latitude } = position.coords
        const { longitude } = position.coords
        const coords = [latitude, longitude]

        console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

        this.#map = L.map('map').setView(coords, 13);

        L.tileLayer('https://tile.openstreetmap.fr/hot//{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        //  L.marker(coords).addTo(map)
        //      .bindPopup('A pretty CSS popup.<br> Easily customizable.')
        //      .openPopup();

        console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

        this.#map.on('click', this._showForm.bind(this))


    }
    _showForm(mapE) {

        console.log(mapE);
        this.#mapEvent = mapE;
        const { lat, lng } = this.#mapEvent?.latlng;
        console.log(lat, lng)
        form.classList.remove('hidden');
        inputDistance.focus();

    }

    _hideForm(){
        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(() => {
            form.style.display = 'grid';
        }, 1000);
    }
    _toggleElevationField() {

        inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
    }

    _newWorkOut(e) {

        e.preventDefault();       
        //1)get data from form;
        const workoutType = inputType.value;
        const distance = +inputDistance.value;
        const cadence = +inputCadence.value;
        const elevation = +inputElevation.value;
        const duration = +inputDuration.value;
        let workout;
        const { lat, lng } = this.#mapEvent?.latlng;

        //2)check if data is valid
        const validInputs = (...inputs) => inputs.every((inp) => Number.isFinite(inp));
        const positiveInputs = (...inputs) => inputs.every((inp) => inp > 0);

        //3)If workout running create running object
        if (workoutType == 'running') {
            if (
                // !Number.isFinite(distance) ||
                // !Number.isFinite(duration) ||
                // !Number.isFinite(cadence)
                !validInputs(distance, duration, cadence) || !positiveInputs(distance, duration, cadence)
            ) return alert('Please input positive numbers');
            workout = new Running([lat, lng], distance, duration, cadence)
        }

        //4)If workout Cycling create Cycling object
        if (workoutType == 'cycling') {
            if (!validInputs(distance, duration, elevation) || !positiveInputs(distance, duration)) return alert('Please input positive numbers');
            workout = new Cycling([lat, lng], distance, duration, elevation)
        }

        //5)Add new object to workout array
        this.#workouts.push(workout)
        console.log(this.#workouts)

        //6)Render workout on map marker
        this._renderWorkoutMarker(workout)


        //7)Render Workout on List
        this._renderWorkoutList(workout);

        //hide form
        this._hideForm();
        inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = ''


    }

    _renderWorkoutMarker(workout) {
        console.log(workout.coords) //lat, lng
        L.marker(workout.coords).addTo(this.#map)
            .bindPopup(L.popup({
                maxWidth: 300,
                minWidth: 100,
                closeButton: false,
                className: `${workout.type}-popup`,
                closeOnClick: false,
                autoClose: false
            })).setPopupContent(`${workout.type == 'running' ? '🏃‍♂️' : '🚴‍♀️'}${workout.description}`)
            .openPopup();
    }

    _renderWorkoutList(workout) {
        let html = `<li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${workout.type == 'running' ? '🏃‍♂️' : '🚴‍♀️'} </span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>`;

        if (workout.type == "running") {
            html +=
                `<div class="workout__details">
    <span class="workout__icon">⚡️</span>
    <span class="workout__value">${workout.pace.toFixed(1)}</span>
    <span class="workout__unit">min/km</span>
  </div>
  <div class="workout__details">
    <span class="workout__icon">🦶🏼</span>
    <span class="workout__value">${workout.cadence}</span>
    <span class="workout__unit">spm</span>
  </div>
  </li>`
        }

        if (workout.type == 'cycling') {
            html += ` <div class="workout__details">
    <span class="workout__icon">⚡️</span>
    <span class="workout__value">${workout.speed.toFixed(1)}</span>
    <span class="workout__unit">km/h</span>
  </div>
  <div class="workout__details">
    <span class="workout__icon">⛰</span>
    <span class="workout__value">${workout.elevationGain}</span>
    <span class="workout__unit">m</span>
  </div>
</li>`
        }
        form.insertAdjacentHTML('afterend', html);
    }
}

const map1 = new App();
// map1._getPosition();

// function successGetPosition(position){
//  const {latitude} = position.coords
//  const {longitude} = position.coords
// const coords = [latitude,longitude]




//  map = L.map('map').setView(coords, 13);

//  L.tileLayer('https://tile.openstreetmap.fr/hot//{z}/{x}/{y}.png', {
//      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//  }).addTo(map);
 
// //  L.marker(coords).addTo(map)
// //      .bindPopup('A pretty CSS popup.<br> Easily customizable.')
// //      .openPopup();

//  console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

//     map.on('click', function (mapE) {
//         console.log(mapEvent);
//         mapEvent = mapE;
//         const { lat, lng } = mapEvent?.latlng;
//         console.log(lat, lng)
//         form.classList.remove('hidden');
//         inputDistance.focus();
    

//     })

// }

// form.addEventListener('submit',function(e){
//     e.preventDefault();


// inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = inputType.value = ''

//         //map clicked , get lat lng and setup marker
//         const { lat, lng } = mapEvent?.latlng;
//         console.log(lat, lng)
//     L.marker([lat, lng]).addTo(map)
//             .bindPopup(L.popup({
//                 maxWidth: 100,
//                 minWidth: 50,
//                 closeButton: false,
//                 className: 'running-popup',
//                 closeOnClick: false,
//                 autoClose: false
//             })).setPopupContent('Workout plans will be here!')
//             .openPopup();
// })

// //changing running,cycling dropdown
// inputType.addEventListener('change',function(e){
//     inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
//     inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
// })






