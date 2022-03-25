// Importing the functions from the needed SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js";
import { getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-storage.js";

// https://firebase.google.com/docs/web/setup#available-libraries

// Web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBU1aZZEBtPTnO0isvYeaSlQG8Bx2GqVu8",
    authDomain: "hackathon-9afac.firebaseapp.com",
    projectId: "hackathon-9afac",
    storageBucket: "gs://hackathon-9afac.appspot.com/",
    messagingSenderId: "105717120536",
    appId: "1:105717120536:web:08b29491ad511ce2048d6d"
};

// Initialize Firebase and other features
const app = initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth();

// If the user has not signed in, take him/her to signin page else proceed
if (localStorage.getItem("uid") == null) {
    window.location.replace("./../index.html");
} else {
    // when logout button is clicked, remove the uid from storage and take user to sign in page
    document.getElementById("logoutButton").addEventListener('click', () => {
        localStorage.removeItem('uid');
        window.location.replace("./../index.html");
    });


    var userID = localStorage.getItem("uid");
    // retrieve data from server
    const docSnap = await getDoc(doc(db, "doctors", userID));

    // show the data in the website
    var dataToShow = ["name",  "specialization", "hospital", "email"];
    for (var i = 0; i < dataToShow.length; i++) {
        var currentProperty = dataToShow[i];
        var currentData = docSnap.get(currentProperty);
        console.log(currentData);
        document.getElementById(currentProperty + "Box").innerHTML = "your " + currentProperty + " is " + currentData;
        if (currentProperty != "email") {
            document.getElementById(currentProperty + "Edit").value = currentData;
        }
    }

    document.getElementById("editButton").addEventListener('click', () => {
        document.getElementById("userProfile").style.display = "none";
        document.getElementById("profileEdit").style.display = "block";
    });

    document.getElementById("submitEditsButton").addEventListener('click',async () => {

        var patientRef = doc(db, 'doctors', userID);
        await setDoc(patientRef, {
            name: document.getElementById('nameEdit').value,
            specialization: document.getElementById('specializationEdit').value,
            hospital: document.getElementById('hospitalEdit').value
        }, {merge: true});

        location.reload();
    });
}