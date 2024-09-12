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
let map,mapEvent;

// navigator.geolocation.getCurrentPosition(successGetPosition,errorGetPosition);

class App {
    #map;
    #mapEvent

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
    _toggleElevationField() {

        inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
    }

    _newWorkOut(e) {

        e.preventDefault();

        inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = inputType.value = ''

        //map clicked , get lat lng and setup marker
        const { lat, lng } = this.#mapEvent?.latlng;
        console.log(lat, lng)
        L.marker([lat, lng]).addTo(this.#map)
            .bindPopup(L.popup({
                maxWidth: 100,
                minWidth: 50,
                closeButton: false,
                className: 'running-popup',
                closeOnClick: false,
                autoClose: false
            })).setPopupContent('Workout plans will be here!')
            .openPopup();
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






