// Importing the functions from the needed SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-storage.js";

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
const monthsToShow = [
    'October',
    'November',
    'December',
    'January',
    'February',
    'March',
];


/*Styling*/
let patientProfile = document.getElementById('patient-profile');
let profileAccordion = document.getElementById('profile-accordion');
patientProfile.addEventListener('click', () => {
    profileAccordion.classList.toggle('invisible');
})

var userID = localStorage.getItem('uid');
// await makeChart();

/*Navigation*/
let dataContainer = document.getElementById('data-container');
let dashboardNav = document.getElementById('dashboard-nav');
let prescriptionNav = document.getElementById('prescription-nav');
let recordsNav = document.getElementById('records-nav');




/* If the user has not signed in, take him/her to signin page else proceed */
if (localStorage.getItem("uid") == null) {
    window.location.replace("./../index.html");
} else {
    userID = localStorage.getItem("uid");

    // retrieve data from server
    const docSnap = await getDoc(doc(db, "patients", userID));

    // show the data in the website
    var dataToShow = ["name", "age", "email", "height", "weight"];
    for (var i = 0; i < dataToShow.length; i++) {
        var currentData = dataToShow[i];
        document.getElementById(currentData + "Box").innerHTML = docSnap.get(currentData);
        if ((currentData != "email") && (currentData != "age")) {
            document.getElementById(currentData + "Edit").value = docSnap.get(currentData);
        }
    }

    // collect records from the server and show it in the website
    var recordsList = await getRecords(userID);
    showRecords(recordsList);

    dashboardNav.addEventListener('click', async () => {
        document.getElementById('userPrescriptions').style.display = 'none';
        document.getElementById('userRecords').style.display = 'none';
        document.getElementById('userEditBox').style.display = 'none';
        document.getElementById('userProfile').style.display = 'block';


        document.querySelector('.active').classList.remove('active');
        document.querySelector('#dashboard-nav-anchor').classList.add('active');
    })

    prescriptionNav.addEventListener('click', async () => {
        document.getElementById('userPrescriptions').style.display = 'block';
        document.getElementById('userRecords').style.display = 'none';
        document.getElementById('userEditBox').style.display = 'none';
        document.getElementById('userProfile').style.display = 'none';


        await showCurrentMeds();
        await showPastMeds();

        document.querySelector('.active').classList.remove('active');
        document.querySelector('#prescription-nav-anchor').classList.add('active');

    });

    recordsNav.addEventListener('click', () => {
        document.getElementById('userPrescriptions').style.display = 'none';
        document.getElementById('userRecords').style.display = 'block';
        document.getElementById('userEditBox').style.display = 'none';
        document.getElementById('userProfile').style.display = 'none';

        document.querySelector('.active').classList.remove('active');
        document.querySelector('#records-nav-anchor').classList.add('active');
    })


    // when logout button is clicked, remove the uid from storage and take user to sign in page
    document.getElementById("logoutButton").addEventListener('click', () => {
        localStorage.removeItem('uid');
        window.location.replace("./../index.html");
    });

    // send the edits to server
    document.getElementById("submitEditsButton").addEventListener('click', async () => {
        uploadEdits();
    });



    // open the edit interface when edit button is clicked
    document.getElementById("editButton").addEventListener('click', () => {
        document.getElementById('userPrescriptions').style.display = 'none';
        document.getElementById('userRecords').style.display = 'none';
        document.getElementById('userEditBox').style.display = 'flex';
        document.getElementById('userProfile').style.display = 'none';
    });

    await makeChart();
}

async function uploadEdits() {
        var patientRef = doc(db, 'patients', userID);
        await setDoc(patientRef, {
            name: document.getElementById('nameEdit').value,
            height: document.getElementById('heightEdit').value,
            weight: document.getElementById('weightEdit').value
        }, { merge: true });

        location.reload();
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
            console.log(record)

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
            }
        });
    });
}

function showAllergies(record) {
    var allergy = record.data().allergyFrom;
    var table = document.getElementById('allergiesTable');
    var item = document.createElement("tr");
    item.innerHTML = `<td>${allergy}</td>`;
    table.appendChild(item);
}

function showVaccinations(record) {
    var table = document.querySelector("#vaccinationsTable");
    var item = document.createElement("tr");
    item.innerHTML = `<td>${record.data().disease}</td><td>${record.data().dateGiven}</td><td>${record.data().ageGiven}</td>`;
    table.appendChild(item);
}


async function showPathologicalReports(record) {
    var type = record.data().type;
    var fileName = record.data().fileName;
    var table = document.querySelector("#reportsTable");
    var item = document.createElement("tr");
    var folder = record.id;

    var url = await getDownloadURL(ref(storage, userID + '/' + folder + '/' + fileName));
    console.log(url);

    item.innerHTML = `<td>${type} Report</td> <td><button><a href="${url}" target="_blank" download>Download File</a></button></td>`;

    table.appendChild(item);
}


async function showPastMeds() {
    const prescriptionsSnapshot = await getDocs(collection(db, "patients", userID, "prescriptions"));
    prescriptionsSnapshot.forEach(async (prescription) => {
        var list = document.getElementById("pastPrescriptions");
        list.innerHTML = ' <h1 class="prescriptionTitle">Past Prescriptions:- </h1>';
        var item = document.createElement("div");
        item.classList.add('prescription-item');
        item.style.border = "1px solid grey";
        item.innerHTML = `<div class="prescription-conditions"><div class="disease-name">Disease: ${prescription.data().prescFor}</div><div class="doctor-name">Doctor: ${prescription.data().doctor}</div></div>`;
        var medTable = await getMedTable(prescription);
        item.appendChild(medTable);
        list.appendChild(item);
    });
}

async function showCurrentMeds() {
    var list = document.getElementById("currentMedicatations");
    list.innerHTML = '<h1 class="prescriptionTitle">Current Medications:- </h1>';
    var tableParent = document.createElement("div");
    tableParent.classList.add('prescription-item');
    var table = document.createElement("table");
    table.classList.add('medicine-list');
    table.classList.add('current-medications');
    table.innerHTML = "<tr><th>Sr.no</th><th>Medicine</th><th>Duration</th><th>Dose</th></tr>";

    const presSnapshot = await getDocs(collection(db, "patients", userID, "prescriptions"));
    var i = 0;

    presSnapshot.forEach(async (pres) => {
        var presDate = pres.data().prescDate.toDate();
        var days = parseInt(calcDaysDiff(presDate));
        console.log(days);
        var medsSnapshot = await getDocs(collection(db, "patients", userID, "prescriptions", pres.id, "medicines"));
        medsSnapshot.forEach((med) => {
            console.log(med.data().name);
            var duration = med.data().doseDuration;
            if (duration >= days) {
                i++;
                var item = document.createElement("tr");
                item.innerHTML = `<td>${i}.</td><td>${med.data().name}</td><td>${duration} days</td><td>${med.data().dailyDose}</td>`;
                table.appendChild(item);
            }
        });
    });
    tableParent.appendChild(table);
    list.appendChild(tableParent);
}

async function makeChartData() {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var presProgress = new Map();

    const presSnapshot = await getDocs(collection(db, "patients", userID, "prescriptions"));
    presSnapshot.forEach(async (pres) => {
        var presDate = pres.data().prescDate.toDate();
        var month = months[presDate.getMonth()];
        var height = pres.data().height;
        var weight = pres.data().weight;
        presProgress.set(month, [height, weight]);
    });
    return presProgress;
}

async function makeChart() {
    var presProgress = await makeChartData();
    console.log(presProgress.size);

    if(presProgress.size >= 6){
        var heights = [];
        var weights = [];
        monthsToShow.forEach(month => {
            heights.push(presProgress.get(month)[0]);
            weights.push(presProgress.get(month)[1]);
        });
        console.log(heights);
        console.log(weights);
    
        drawHeightChart(heights);
        drawWeightChart(weights);
    }else{
        document.getElementById('charts').innerHTML = '';
    }
}


function drawHeightChart(heights) {
    const labels = monthsToShow;

    const data = {
        labels: labels,
        datasets: [{
            label: 'Height(cm)',
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: heights,
        }]
    };

    const config = {
        type: 'line',
        data: data,
        options: {}
    };

    const myChart = new Chart(
        document.getElementById('heightChart'),
        config
    );
}

function drawWeightChart(weights) {
    const labels = monthsToShow;

    const data = {
        labels: labels,
        datasets: [{
            label: 'Weights(Kg)',
            backgroundColor: 'rgb(0, 0, 0)',
            borderColor: 'rgb(0, 0, 0)',
            data: weights,
        }]
    };

    const config = {
        type: 'line',
        data: data,
        options: {}
    };

    const myChart = new Chart(
        document.getElementById('weightChart'),
        config
    );
}



function calcDaysDiff(fromDate) {
    var currDate = new Date();

    // To calculate the time difference of two dates
    var Difference_In_Time = currDate.getTime() - fromDate.getTime();

    // To calculate the no. of days between two dates
    var difference = Difference_In_Time / (1000 * 3600 * 24);
    return difference;
}


async function getMedTable(record) {
    var table = document.createElement("table");
    table.classList.add('medicine-list');
    table.innerHTML = "<tr><th>Sr.no</th><th>Medicine</th><th>Duration</th><th>Dose</th></tr>";

    const medicinesSnapshot = await getDocs(collection(db, "patients", userID, "prescriptions", record.id, "medicines"));

    var i = 1;
    medicinesSnapshot.forEach(medicine => {
        var medItem = document.createElement("tr");
        console.log(medicine.data());
        medItem.innerHTML = `<td>${i}.</td><td>${medicine.data().name}</td><td>${medicine.data().doseDuration} days</td><td>${medicine.data().dailyDose}</td>`;
        table.appendChild(medItem);
    });

    return table;
}