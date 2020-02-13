// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: config.API_KEY_FIREBASE,
    authDomain: "imbdfilms-f8315.firebaseapp.com",
    databaseURL: "https://imbdfilms-f8315.firebaseio.com",
    projectId: "imbdfilms-f8315",
    storageBucket: "imbdfilms-f8315.appspot.com",
    messagingSenderId: "783869864314",
    appId: "1:783869864314:web:6cdd9af30da1d5c67a8ec3"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const ref = firebase.database().ref('films');

document.getElementById('search').addEventListener('click', search);
document.getElementById('seeAllFilms').addEventListener('click', seeAllFilms);

//SEARCH FILMS
function search() {
    var title = document.getElementById('title').value;
    var searchTitle = title.split(' ').join('+');
    OMDbCall(searchTitle);
}

//SEE ALL FILMS I LIKE
function seeAllFilms() {
    return new Promise((ok, no) => {
        document.getElementById('films').innerHTML = '';
        ref.on('value', snapshot => {
            snapshot.forEach(childSnapshot => {
                printFilm(childSnapshot.val(), 'template2');
            });
        })
        ok();
    })
}

function OMDbCall(title) {
    document.getElementById('films').innerHTML = '';

    fetch(`http://www.omdbapi.com/?apikey=${config.API_KEY_OMDb}&s=${title}&page=1`)
    .then(res => res.json())
    .then(data => {
        console.log(data.Search);
        data.Search.forEach(film => {
            printFilm(film, 'template');
        });
        return data;
    })
    .then(data => {
        let films = document.getElementsByClassName("add");
        let arrFilms = Array.from(films);
        
        for(let i=0; i<arrFilms.length; i++) {
            films[i].addEventListener('click', () => addFilm(data.Search[i]));
        }
    })
}

function printFilm(film, template) {
    let rendered = Mustache.render(document.getElementById(template).innerHTML,{film, title: film.Title, img:film.Poster});
    document.getElementById('films').innerHTML += rendered;
}

//ADD FILM
function addFilm(film) {
    ref.push({
        title: film.Title,
        year: film.Year,
        imdbID: film.imdbID,
        Poster: film.Poster
    })
}


