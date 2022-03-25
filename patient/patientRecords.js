// Importing the functions from the needed SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";
import { getFirestore, doc, setDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js";
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
    var userID = localStorage.getItem("uid");

    var recordsList = await getRecords(userID);
    showRecords(recordsList);
}



// get all records from server and return it as an array
async function getRecords(uid) {
    const allergiesSnapshot = await getDocs(collection(db, "patients", uid, "allergies"));
    const vaccinationsSnapshot = await getDocs(collection(db, "patients", uid, "vaccinations"));
    const pathologicalReportsSnapshot = await getDocs(collection(db, "patients", uid, "pathologicalReports"));

    return [allergiesSnapshot, vaccinationsSnapshot, pathologicalReportsSnapshot];
}

// show the retrieved records in the website
function showRecords(recordsList) {
    recordsList.forEach(recordType => { // for each type of record (allergy, vaccinations, pathological reports)
        recordType.forEach((record) => { // for each record in it's respective type
            var collec; // the variable which stores which type of record is being iterated
            var vaccineItem; // variable which stores elements when vaccine is being iterated since a vaccine record has multiple fields

            // detect which type of record is being iterated by examining the first 3 letters of record id
            switch (record.id.slice(0, 3)) {
                case "all":
                    collec = "allergies";
                    break;
                case "vac":
                    collec = "vaccinations";
                    vaccineItem = document.createElement("ul"); // if the record type is vaccine, then create a ul element to be added under the default list
                    break;
                case "rep":
                    collec = "pathologicalReports";
                    break;
            }

            // collect data of each record
            var data = record.data();
            // collect list under which the data will go
            var list = document.querySelector("#" + collec + "List");

            // for every property in the data of record, create a li element, fill it with the record data and add this li element to the respective list. Exception for vaccines
            for (var property in data) {  
                var toShow = data[property];
                var item = document.createElement("li");


                if (collec == "vaccinations") { // since vaccines have multiple property's create a list inside of the default list listing all the properties of a record and add it to the parent list
                    var vaccineProp = document.createElement("li");
                    vaccineProp.appendChild(document.createTextNode(property + ": " + toShow));
                    vaccineItem.appendChild(vaccineProp); 
                    item.appendChild(vaccineItem);
                } else {
                    item.appendChild(document.createTextNode(toShow));
                }
            }
                
            // add the created item to the respective record type list
            list.appendChild(item);
        });
    });
}