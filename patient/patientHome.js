// Importing the functions from the needed SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js";
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
const monthsToShow = [
    'October',
    'November',
    'December',
    'January',
    'February',
    'March',
];

// If the user has not signed in, take him/her to signin page else proceed
if (localStorage.getItem("uid") == null) {
    window.location.replace("./../index.html");
} else {
    // when logout button is clicked, remove the uid from storage and take user to sign in page
    var userID = localStorage.getItem("uid");
    document.getElementById("logoutButton").addEventListener('click', () => {
        localStorage.removeItem('uid');
        window.location.replace("./../index.html");
    });

    // retrieve data from server
    const docSnap = await getDoc(doc(db, "patients", userID));

    // show the data in the website
    var dataToShow = ["name", "age", "email", "height", "weight"];
    for (var i = 0; i < dataToShow.length; i++) {
        var currentData = dataToShow[i];
        document.getElementById(currentData + "Box").innerHTML = "your " + currentData + " is " + docSnap.get(currentData);
        if ((currentData != "email") && (currentData != "age")) {
            document.getElementById(currentData + "Edit").value = docSnap.get(currentData);
        }
    }

    await showCurrentMeds();


    // open the edit interface when edit button is clicked
    document.getElementById("editButton").addEventListener('click', () => {
        document.getElementById("userProfile").style.display = "none";
        document.getElementById("profileEdit").style.display = "block";
    });

    // send the edits to server
    document.getElementById("submitEditsButton").addEventListener('click', async () => {

        var patientRef = doc(db, 'patients', userID);
        await setDoc(patientRef, {
            name: document.getElementById('nameEdit').value,
            height: document.getElementById('heightEdit').value,
            weight: document.getElementById('weightEdit').value
        }, { merge: true });

        location.reload();
    });

    await makeChart();
}

async function showCurrentMeds() {
    var list = document.getElementById("currentMeds");
    const presSnapshot = await getDocs(collection(db, "patients", userID, "prescriptions"));
    presSnapshot.forEach(async (pres) => {
        var presDate = pres.data().prescDate.toDate();
        var days = parseInt(calcDaysDiff(presDate));
        console.log(days);
        var medsSnapshot = await getDocs(collection(db, "patients", userID, "prescriptions", pres.id, "medicines"));
        medsSnapshot.forEach((med) => {
            console.log(med.data().name);
            var duration = med.data().doseDuration;
            if (duration >= days) {
                var item = document.createElement("li");
                item.innerHTML = `${med.data().name} for ${pres.data().prescFor}`;
                list.appendChild(item);
            }
        });
    });
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

async function makeChart(){
    var presProgress = await makeChartData();
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

function drawWeightChart(weights){
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

