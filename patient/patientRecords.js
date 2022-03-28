// Importing the functions from the needed SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";
import { getFirestore, doc, setDoc, getDocs, collection, getDoc } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js";
import { getStorage, ref, getDownloadURL, uploadBytes } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-storage.js";

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

    document.getElementById("createRecordsButton").addEventListener('click', () => {
        document.getElementById("showRecordsBox").style.display = "none";
        document.getElementById("recordTypeDialog").style.display = "block";
        document.getElementById("createRecordsButton").style.display = "none";
        document.getElementById("homeButton").style.display = "none";
    });

    document.getElementById("allergy").addEventListener('click', () => { displayInputDialog('newAllergy') });
    document.getElementById("vaccination").addEventListener('click', () => { displayInputDialog('newVaccination') });
    document.getElementById("pathReport").addEventListener('click', () => { displayInputDialog('newPathReport') });

    document.getElementById("allergySubmit").addEventListener('click', () => { registerRecord('allergy') });
    document.getElementById("vaccineSubmit").addEventListener('click', () => { registerRecord('vaccine') });
    document.getElementById("reportSubmit").addEventListener('click', () => { registerRecord('pathReport') });

}

function calcAge(DOB, refDate) {
    // To calculate the time difference of two dates
    var Difference_In_Time = refDate.getTime() - (DOB.seconds*1000);

    // To calculate the no. of days between two dates
    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
    var age = parseInt(Difference_In_Days / 365);
    return age;
}

async function registerRecord(recordType) {
    switch (recordType) {
        case 'allergy':
            var allSnapshot = await getDocs(collection(db, 'patients', userID, "allergies"));
            var allergyIndex = allSnapshot.docs.length + 1;
            var allRef = doc(db, 'patients', userID, "allergies", `all${allergyIndex}`);
            await setDoc(allRef, {
                allergyFrom: document.getElementById('allergyFrom').value
            }, { merge: true });
            break;
        case 'vaccine':
            var vaccSnapshot = await getDocs(collection(db, 'patients', userID, "vaccinations"));
            var vaccineIndex = vaccSnapshot.docs.length + 1;
            var vaccRef = doc(db, 'patients', userID, "vaccinations", `vacc${vaccineIndex}`);
            var dateGiven = document.getElementById("dateGiven").valueAsDate;
            const patientSnap = await getDoc(doc(db, "patients", userID));
            var dob = patientSnap.get("dob");
            console.log(dob);
            var ageGiven = calcAge(dob, dateGiven); 
            await setDoc(vaccRef, {
                ageGiven:  ageGiven,
                dateGiven: document.getElementById("dateGiven").value,
                disease: document.getElementById("disease").value
            }, { merge: true });
            break;
        case 'pathReport':
            var repSnapshot = await getDocs(collection(db, 'patients', userID, "pathologicalReports"));
            var repIndex = repSnapshot.docs.length + 1;

            const file = document.getElementById("reportFile").files[0];
            // Get a reference to the storage service, which is used to create references in your storage bucket
            const storage = getStorage();
            // Create a storage reference from our storage service
            const repStorageRef = ref(storage, userID + `/rep${repIndex}/` + file.name);
            // upload the selected file to cloud storage
            await uploadBytes(repStorageRef, file);
            console.log('Uploaded a blob or file!');

            // register the report type to user profile
            var repDbRef = doc(db, "patients", userID, 'pathologicalReports', `rep${repIndex}`);
            await setDoc(repDbRef, {
                type: document.getElementById("reportType").value,
                fileName: file.name
            }, { merge: true });
            break;
    }
    window.location.reload();
}


function displayInputDialog(recordTypeId) {
    document.getElementById("recordTypeDialog").style.display = "none";
    document.getElementById(recordTypeId).style.display = "block";
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

