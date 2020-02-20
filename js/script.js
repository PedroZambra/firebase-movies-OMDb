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

const sectionFilms = document.getElementById('films');

document.getElementById('search').addEventListener('click', search);
document.getElementById('title').addEventListener('keyup', event => {(event.keyCode === 13) ? search() : null});
document.getElementById('seeAllFilms').addEventListener('click', () => {
    seeAllFilms()
    .then(data => {
        let films = document.getElementsByClassName("delete");
        let arrFilms = Array.from(films);
        
        var ids = [];
        for (let id in data) {
            ids.push(id);
        }

        for(let i=0; i<arrFilms.length; i++) {
            films[i].addEventListener('click', () => deleteFilm(ids[i]));
        }
    })
});

//SEARCH FILMS
function search() {
    var title = document.getElementById('title').value;
    var searchTitle = title.split(' ').join('+');
    OMDbCall(searchTitle);
}

//SEE ALL FILMS I LIKE
function seeAllFilms() {
    return new Promise((resolve, reject) => {
        sectionFilms.innerHTML = '';
        firebase.database().ref(firebase.auth().currentUser.uid).on('value', snapshot => {
            snapshot.forEach(childSnapshot => {
                printFilm(childSnapshot.val(), 'template2');
            });
            resolve(snapshot.val());
        })
    })
}

function OMDbCall(title) {
    sectionFilms.innerHTML = '';

    fetch(`http://www.omdbapi.com/?apikey=${config.API_KEY_OMDb}&s=${title}&page=1`)
    .then(res => res.json())
    .then(data => {
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
    let rendered = Mustache.render(document.getElementById(template).innerHTML,{film, Title: film.Title, img:film.Poster});
    sectionFilms.innerHTML += rendered;
}

//ADD FILM
function addFilm(film) {
    firebase.database().ref(firebase.auth().currentUser.uid).push({
        Title: film.Title,
        year: film.Year,
        imdbID: film.imdbID,
        Poster: film.Poster
    })
    sectionFilms.innerText = 'Añadida '+film.Title+'!';
}

//DELETE FILM
function deleteFilm(id) {
    firebase.database().ref(firebase.auth().currentUser.uid).child(id).remove();
    sectionFilms.innerText = 'Eliminada!';
}

//AUTH
document.getElementById('register').addEventListener('click', register);
document.getElementById('login').addEventListener('click', login);
document.getElementById('out').addEventListener('click', logOut);

function register() {
    let user = document.getElementById('user').value;
    let pass = document.getElementById('pass').value;

    firebase
    .auth()
    .createUserWithEmailAndPassword(user, pass)
    .then(() => console.log("Usuario registrado"))
    .catch(error => alert(error.message));
}

function login() {
    let user = document.getElementById('userLogin').value;
    let pass = document.getElementById('passLogin').value;

    firebase
    .auth()
    .signInWithEmailAndPassword(user, pass)
    .then(() => console.log("Logueado"))
    .catch(error => alert(error.message));
}

function logOut() {
    firebase
    .auth()
    .signOut()
    .then(() => console.log("Deslogueado!"))
    .catch(err => console.log(err))
}

firebase
.auth()
.onAuthStateChanged( user => {
    if (user) {
        sectionFilms.innerHTML = `<h2 class="welcome">Bienvenido ${user.email}!</h2>`;
        document.getElementById('logPanel').style.display = 'none';
        document.getElementById('userPanel').style.display = 'flex';
    } else {
        console.log("User is signed out");
        document.getElementById('logPanel').style.display = 'flex';
        document.getElementById('userPanel').style.display = 'none';
        sectionFilms.innerHTML = '';
    }
});

//UPLOAD FILES
document.getElementById("uploadFiles").addEventListener('click', uploadFiles);
document.getElementById("downloadFiles").addEventListener('click', downloadFiles);

function uploadFiles() {
    const storageRef = firebase.storage().ref();
    let image = document.getElementById('file').files[0];
    console.log(image);
    let ref = storageRef.child(firebase.auth().currentUser.uid+'/images/'+image.name);

    ref
    .put(image)
    .then(() => downloadFiles());
}

function downloadFiles() {
    sectionFilms.innerHTML = '';
    const storageRef = firebase.storage().ref();
    let ref = storageRef.child(firebase.auth().currentUser.uid+'/images/');

    ref
    .listAll()
    .then(res => {
        res.items.forEach(img => {
            img
            .getDownloadURL() 
            .then(url => {
                    sectionFilms.innerHTML +=   `<div data-key="${img.name}" class="upload">
                                                    <img src="${url}" class="imgUploaded">
                                                    <input type="button" data-action="deleteImg" value="Borrar">
                                                </div>`;
                })  
            .catch(err => console.log(err));    
        })
    })
}

sectionFilms.addEventListener('click', event => {
    const target = event.target.getAttribute("data-action");
    const key = event.target.parentElement.getAttribute("data-key");
    if(target === "deleteImg") {
        deleteImage(key);
    }
})

function deleteImage(name) {
    if(confirm("¿Estas seguro?")) {
        const storageRef = firebase.storage().ref();
        let ref = storageRef.child(firebase.auth().currentUser.uid+'/images/'+name);
    
        ref
        .delete()
        .then(() => {sectionFilms.innerText =`Imagen ${name} borrada!`;})
        .catch(err => console.log(err));
    }
}

