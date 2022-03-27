// Importing the functions from the needed SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";
import { getFirestore, doc, setDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-storage.js";

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
const storage = getStorage();
var userID;

// If the user has not signed in, take him/her to signin page else proceed
if (localStorage.getItem("uid") == null) {
    window.location.replace("./../index.html");
} else {
    userID = localStorage.getItem("uid");

    const prescriptionsSnapshot = await getDocs(collection(db, "patients", userID, "prescriptions"));
    prescriptionsSnapshot.forEach(async (prescription) => {
        var list = document.getElementById("prescriptionsList");
        var item = document.createElement("div");
        item.style.border = "1px solid grey";
        item.style.padding = "1rem";
        item.style.width = "max-content";
        item.innerHTML = `<h4 id='prescriptionDetails'>Disease: ${prescription.data().prescFor}<br>Height: ${prescription.data().height}<br>Weight: ${prescription.data().weight}<br>Doctor: ${prescription.data().doctor}</h4><h4>Medicines:-</h4>`;
        var medTable = await getMedTable(prescription);
        item.appendChild(medTable);
        list.appendChild(item);
    });
}

async function getMedTable(record){
    var table = document.createElement("table");
    table.innerHTML = "<tr><th>Name</th><th>Daily</th><th>Duration</th></tr>";
    
    const medicinesSnapshot = await getDocs(collection(db, "patients", userID, "prescriptions", record.id, "medicines"));
 
    medicinesSnapshot.forEach(medicine => {
        var medItem = document.createElement("tr");
        console.log(medicine.data());
        medItem.innerHTML = `<td>${medicine.data().name}</td><td>${medicine.data().dailyDose}</td><td>${medicine.data().doseDuration} days</td>`;
        table.appendChild(medItem);
    });

    return table;
}