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

    var recordsList = await getRecords(userID);
    showRecords(recordsList);
}



// get all records from server and return it as an array
async function getRecords(uid) {
    const allergiesSnapshot = await getDocs(collection(db, "patients", uid, "allergies"));
    const vaccinationsSnapshot = await getDocs(collection(db, "patients", uid, "vaccinations"));
    const pathologicalReportsSnapshot = await getDocs(collection(db, "patients", uid, "pathologicalReports"));
    const prescriptionsSnapshot = await getDocs(collection(db, "patients", uid, "prescriptions"));

    return [allergiesSnapshot, vaccinationsSnapshot, pathologicalReportsSnapshot, prescriptionsSnapshot];
}

// show the retrieved records in the website
function showRecords(recordsList) {
    recordsList.forEach(recordType => { // for each type of record (allergy, vaccinations, pathological reports)
        recordType.forEach((record) => { // for each record in it's respective type
            var collec; // the variable which stores which type of record is being iterated

            // detect which type of record is being iterated by examining the first 3 letters of record id and call their respective ui displayers
            switch (record.id.slice(0, 3)) {
                case "all":
                    collec = "allergies";
                    showAllergies(record);
                    break;
                case "vac":
                    collec = "vaccinations";
                    showVaccinations(record);
                    break;
                case "rep":
                    collec = "pathologicalReports";
                    showPathologicalReports(record);
                    break;
                case "pre":
                    collec = "prescriptions";
                    showPrescriptions(record);
            }
        });
    });
}

function showAllergies(record) {
    var allergy = record.data().allergyFrom;
    var list = document.querySelector("#allergiesList");
    var item = document.createElement("li");
    item.appendChild(document.createTextNode(allergy));
    list.appendChild(item);
}

function showVaccinations(record) {
    var list = document.querySelector("#vaccinationsList");
    var item = document.createElement("li");
    var subList = document.createElement("ul");

    for (var property in record.data()) {
        var subListItem = document.createElement("li");
        subListItem.appendChild(document.createTextNode(record.data()[property]));
        subList.appendChild(subListItem);
    }
    item.appendChild(subList);
    list.appendChild(item);
}


async function showPathologicalReports(record) {
    var type = record.data().type;
    var fileName = record.data().fileName;
    var list = document.querySelector("#pathologicalReportsList");
    var item = document.createElement("li");
    item.appendChild(document.createTextNode(type));
    var downButton = document.createElement("button");
    var folder = record.id;

    var url = await getDownloadURL(ref(storage, userID + '/' + folder + '/' + fileName));

    console.log(url);

    downButton.innerHTML = '<a href="' + url + '" target="_blank" download>Download File</a>';
    item.appendChild(downButton);
    list.appendChild(item);
}

async function showPrescriptions(record){
    var list = document.getElementById("prescriptionsList");
    var item = document.createElement("div");
    item.style.border = "1px solid grey";
    item.style.padding = "1rem";
    item.style.width = "max-content";
    item.innerHTML = `<h4 id='prescriptionDetails'>Disease: ${record.data().prescFor}<br>Height: ${record.data().height}<br>Weight: ${record.data().weight}<br>Doctor: ${record.data().doctor}</h4><h4>Medicines:-</h4>`;
    // getMedTable(record);
    var medTable = await getMedTable(record);
    item.appendChild(medTable);
    list.appendChild(item);
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