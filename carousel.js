// Importing the functions from the needed SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, writeBatch } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js";
import { getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-storage.js";

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

var userCollec = localStorage.getItem("userCollection");
if (userCollec == 'patients') {
    document.getElementById('doctorDetailsBox').outerHTML = "";
} else {
    document.getElementById('patientDetailsBox').outerHTML = "";
}

let slideCounter = 0;
let carouselSlides = document.getElementsByClassName('carousel-slide');
let continueButton = document.getElementById('carousel-continue');
var userID = localStorage.getItem("uid");
var userDocRef = doc(db, userCollec, userID);
var dob;



continueButton.addEventListener('click', () => {
    if (slideCounter < 3) {
        let inputs = carouselSlides[slideCounter].getElementsByClassName('carousel-input');
        let i = inputs.length;
        for (let j = 0; j < i; j++) {
            console.log(inputs[j].id);
            if (inputs[j].value.length == 0) {
                alert('Fill all the fields');
                return;
            }
        }
        switch (slideCounter) {
            case 0:
                console.log("basic details");
                if(userCollec == 'patients'){uploadBasicDetails();}
                else{uploadDoctorDetails();}
                break;
            case 1:
                console.log("vaccinations details");
                uploadVaccinations();
                break;
            case 2:
                console.log("allergies details");
                uploadAllergies();
                break;
        }

        if (userCollec == 'patients') {
            console.log("reached here");
            carouselSlides[slideCounter].classList.remove('current-slide');
            slideCounter++;
            carouselSlides[slideCounter].classList.add('current-slide');
        }
    }
    else {
        console.log("uploading path reports");
        let inputs = carouselSlides[slideCounter].getElementsByClassName('carousel-input');
        let i = inputs.length;
        for (let j = 0; j < i; j++) {
            if (inputs[j].value.length == 0) {
                alert('Fill all the fields');
                return;
            }
        }
        uploadPathReports();
        alert('Your profile is created!');
        window.location.href = "./patient/patientHome.html";
    }
})

let vaccBox = document.getElementById("vaccines");
let allBox = document.getElementById("allergies");
let repBox = document.getElementById("reports");


document.getElementById("addVaccineButton").addEventListener('click', () => {
    const vaccInput = document.createElement('div');
    vaccInput.innerHTML = '<div id="vaccineInput"> <div class="extra-input"> <label for="disease">Vaccine:</label> <input type="text" id="disease" placeholder="Vaccine Name" class="carousel-input"> </div> <div class="extra-input"> <label for="dateGiven">Date Given:</label> <input type="date" id="dateGiven" class="carousel-input" placeholder="Date Given"> </div> </div>';
    vaccBox.appendChild(vaccInput);
});

document.getElementById('deleteVaccButton').addEventListener('click', () => {
    vaccBox.removeChild(vaccBox.lastChild);
})


document.getElementById("addAllergyButton").addEventListener('click', () => {
    const allergyInput = document.createElement('div');
    allergyInput.innerHTML = '<div id="allergyInput"> <div class="extra-input"> <label for="allergyFrom">Allergy Name:</label> <input type="text" id="allergyFrom" placeholder="What allergy do you have" class="carousel-input"> </div> </div>';
    allBox.appendChild(allergyInput);
});

document.getElementById('deleteAllergyButton').addEventListener('click', () => {
    allBox.removeChild(allBox.lastChild);
})



document.getElementById("addReportButton").addEventListener('click', () => {
    const reportInput = document.createElement('div');
    reportInput.innerHTML = '<div id="reportInput"> <div class="extra-input"> <label for="reportFiles"></label> <input type="file" id="reportFiles" placeholder="What are you allergic from?"" class="carousel-input"> </div> <div class="extra-input"> <label for="reportType"></label> <input type="text" placeholder="eg: blood report" id="reportType" class="carousel-input"> </div> </div>';
    repBox.appendChild(reportInput);
});

document.getElementById('deleteReportButton').addEventListener('click', () => {
    repBox.removeChild(repBox.lastChild);
});



async function uploadBasicDetails() {
    dob = document.getElementById('birthdate').valueAsDate;
    console.log(dob);
    var userAge = calcAge(dob, new Date());
    console.log(userAge);
    await setDoc(userDocRef, {
        dob: dob,
        age: userAge,
        height: document.getElementById('height').value,
        weight: document.getElementById('weight').value
    }, { merge: true });
}

async function uploadVaccinations() {
    const batch = writeBatch(db);

    var vaccs = document.querySelectorAll("#vaccineInput");
    for (var i = 0; i < vaccs.length; i++) {
        var vaccRef = doc(db, 'patients', userID, "vaccinations", `vacc${i + 1}`);
        var dateGiven = vaccs[i].querySelector("#dateGiven").valueAsDate;
        var ageGiven = calcAge(dob, dateGiven);
        batch.set(vaccRef, {
            ageGiven: ageGiven,
            disease: vaccs[i].querySelector("#disease").value,
            dateGiven: vaccs[i].querySelector("#dateGiven").value
        });
    }

    await batch.commit();
}

async function uploadAllergies() {
    const batch = writeBatch(db);

    var alls = document.querySelectorAll("#allergyFrom");
    for (var i = 0; i < alls.length; i++) {
        var allRef = doc(db, 'patients', userID, "allergies", `all${i + 1}`);
        batch.set(allRef, {
            allergyFrom: alls[i].value
        });
    }

    await batch.commit();
}

async function uploadPathReports() {
    var reps = document.querySelectorAll("#reportInput");
    for (var i = 0; i < reps.length; i++) {
        // Get the file by the user in a variable
        const file = reps[i].querySelector('#reportFiles').files[0];

        // Get a reference to the storage service, which is used to create references in your storage bucket
        const storage = getStorage();

        // Create a storage reference from our storage service
        const reportRef = ref(storage, userID + `/rep${i+1}/` + file.name);

        // upload the selected file to cloud storage
        await uploadBytes(reportRef, file);
        console.log('Uploaded a blob or file!');

        // register the report type to user profile
        var pathReportRef = doc(db, "patients", userID, 'pathologicalReports', `rep${i+1}`);
        await setDoc(pathReportRef, {
            type: reps[i].querySelector('#reportType').value,
            fileName: file.name
        }, { merge: true });
    }
}

async function uploadDoctorDetails(){
    console.log("uploading doctor details");
    await setDoc(userDocRef, {
        hospital: document.getElementById('hospital').value,
        specialization: document.getElementById('specialization').value
    }, { merge: true });


    // since all information is collected, take the user to his profile page
    window.location.replace("./doctor/doctorHome.html");
}


function calcAge(DOB, refDate) {
    // To calculate the time difference of two dates
    var Difference_In_Time = refDate.getTime() - DOB.getTime();

    // To calculate the no. of days between two dates
    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
    var age = parseInt(Difference_In_Days / 365);
    return age;
}








