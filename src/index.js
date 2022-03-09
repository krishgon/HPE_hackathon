import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js';
 
const firebaseApp = initializeApp({
    apiKey: "AIzaSyBU1aZZEBtPTnO0isvYeaSlQG8Bx2GqVu8",
    authDomain: "hackathon-9afac.firebaseapp.com",
    projectId: "hackathon-9afac",
    storageBucket: "hackathon-9afac.appspot.com",
    messagingSenderId: "105717120536",
    appId: "1:105717120536:web:08b29491ad511ce2048d6d"
})

const auth = getAuth(firebaseApp);
 
// Detect auth state
onAuthStateChanged(auth, user => {
    if(user != null){
        console.log('logged in');
    }else{
        console.log('No user');
    }
});

var ui = new firebaseui.auth.AuthUI(firebase.auth());
