// Importing the functions from the needed SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, writeBatch } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js";
import { getAuth, sendSignInLinkToEmail, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-storage.js";

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
var patient, doctor = {};

// If the user has not signed in, take him/her to signin page else proceed
if (localStorage.getItem("uid") == null) {
    window.location.replace("./../index.html");
} else {
    var docID = localStorage.getItem("uid");
    const docSnap = await getDoc(doc(db, "doctors", docID));
    doctor.name = docSnap.get("name");
    doctor.hospital = docSnap.get("hospital");
    console.log(doctor)
    var med = document.getElementById("med").cloneNode(true);
    var medBox = document.getElementById("medicinesBox");

    // when the submit button is clicked, sign in the patient whose email is entered
    document.getElementById("mailSubmitButton").addEventListener('click', () => {
        var email = document.getElementById("patientMail").value;
        signPatientByEmail(email);
    });

    document.getElementById("showRecordsButton").addEventListener('click', async () => {
        document.getElementById("patientDetailsBox").style.display = "none";
        document.getElementById("patientRecords").style.display = "block";


        var recordsList = await getRecords(patient.uid);
        showRecords(recordsList);
    });

    document.querySelectorAll("#backButton").forEach((button) => {
        button.addEventListener('click', () => {
            document.getElementById("patientDetailsBox").style.display = "block";
            document.getElementById("patientRecords").style.display = "none";
            document.getElementById("patientPrescriptions").style.display = "none";
        });    
    });

    document.getElementById("submitPrescriptionButton").addEventListener('click', async () => {
        await uploadPrescription();
        alert("prescription uploaded");
        window.location.reload();
    });

    document.getElementById("addMedButton").addEventListener('click', () => {
        console.log("add button clicked");
        var medToAdd = med.cloneNode(true);
        medBox.appendChild(medToAdd);
        var deleteButton = medToAdd.children[15];
        deleteButton.addEventListener('click', () => {
            delteMedicine(deleteButton);
        });
    });

    document.getElementById("deleteMed").addEventListener('click', () => {
        delteMedicine(document.getElementById("deleteMed"));
    });

    document.getElementById("showPrescriptionsButton").addEventListener('click', () => {
        document.getElementById("patientDetailsBox").style.display = "none";
        document.getElementById("patientPrescriptions").style.display = "block";

        showPrescriptions();
    });

}


async function showPrescriptions(){
    const prescriptionsSnapshot = await getDocs(collection(db, "patients", patient.uid, "prescriptions"));
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
    
    const medicinesSnapshot = await getDocs(collection(db, "patients", patient.uid, "prescriptions", record.id, "medicines"));
 
    medicinesSnapshot.forEach(medicine => {
        var medItem = document.createElement("tr");
        console.log(medicine.data());
        medItem.innerHTML = `<td>${medicine.data().name}</td><td>${medicine.data().dailyDose}</td><td>${medicine.data().doseDuration} days</td>`;
        table.appendChild(medItem);
    });

    return table;
}

function delteMedicine(deleteButton) {
    deleteButton.parentElement.outerHTML = "";
}

async function uploadPrescription() {
    const batch = writeBatch(db);

    var presSnapshot = await getDocs(collection(db, 'patients', patient.uid, "prescriptions"));
    var prescriptionIndex = presSnapshot.docs.length + 1;
    var prescDate = new Date();
    var prescriptionRef = doc(db, 'patients', patient.uid, "prescriptions", `pres${prescriptionIndex}`);
    batch.set(prescriptionRef, {
        doctor: doctor.name,
        hospital: doctor.hospital,
        prescFor: document.getElementById('prescFor').value,
        height: document.getElementById('height').value,
        weight: document.getElementById('weight').value,
        prescDate: prescDate
    });

    var meds = document.querySelectorAll("#med");
    for (var i = 0; i < meds.length; i++) {
        var dailyDose = getDailyDose(meds[i]);
        var medicineRef = doc(db, 'patients', patient.uid, "prescriptions", `pres${prescriptionIndex}`, "medicines", `med${i+1}`);
        batch.set(medicineRef, {
            doseDuration: meds[i].querySelector("#medDuration").value,
            name: meds[i].querySelector("#medName").value,
            dailyDose: dailyDose
        });
    }

    await batch.commit();
}

function getDailyDose(med) {
    var doseArr = [];
    var nodes = med.querySelectorAll("input[type='checkbox']");
    nodes.forEach(node => {
        if (node.checked) {
            doseArr.push(node.value);
        }
    });
    return doseArr;
}



function signPatientByEmail(email) {
    // generate the OTP
    var OTP = Math.floor(1000 + Math.random() * 9000);

    // Send the otp via mail to the typed email
    Email.send({
        Host: "smtp.gmail.com",
        Username: "medfiles69420@gmail.com",
        Password: "keolpuzpewesugun",
        To: email,
        From: "medfiles69420@gmail.com",
        Subject: "Your MEDFiles OTP",
        Body: `Your MedFiles OTP is ${OTP}`,
    }).then(function (message) {
        // verify OTP and show the details of the respective patient
        console.log(message);
        document.getElementById("patientAuth").style.display = "none";

        var otpBox = document.getElementById("otpBox");
        otpBox.parentElement.style.display = "block";

        document.getElementById("submitOTP").addEventListener('click', async () => {
            var typedOTP = otpBox.value;
            if (typedOTP == OTP) {
                otpBox.parentElement.style.display = "none";
                document.getElementById("patientDetailsBox").style.display = "block";
                document.getElementById("prescriptionBox").style.display = "block";
                var q = query(collection(db, "patients"), where("email", "==", email));
                var querySnapshot = await getDocs(q);
                querySnapshot.forEach((doc) => {
                    patient = doc.data();
                    patient.uid = doc.id;
                    console.log(patient);
                });

                document.getElementById("patientDetails").innerHTML = `Patient Name: ${patient.name} <br> Patient age: ${patient.age} <br> Patient Height: ${patient.height} <br> Patient weight: ${patient.weight} <br>`;
                showCurrentMeds();
            } else {
                document.getElementById("otpErrorBox").innerHTML = "Correct OTP please";
            }
        });
    });
}



async function showCurrentMeds() {
    var list = document.getElementById("currentMeds");
    const presSnapshot = await getDocs(collection(db, "patients", patient.uid, "prescriptions"));
    presSnapshot.forEach(async (pres) => {
        var presDate = pres.data().prescDate.toDate();
        var days = parseInt(calcDaysDiff(presDate));
        console.log(days);
        var medsSnapshot = await getDocs(collection(db, "patients", patient.uid, "prescriptions", pres.id, "medicines"));
        medsSnapshot.forEach((med) => {
            console.log(med.data().name);
            var duration = med.data().doseDuration;
            if(duration >= days){
                var item = document.createElement("li");
                item.innerHTML = `${med.data().name} for ${pres.data().prescFor}`;
                list.appendChild(item);
            }
        });
    });
}

function calcDaysDiff(fromDate) {
    var currDate = new Date();

    // To calculate the time difference of two dates
    var Difference_In_Time = currDate.getTime() - fromDate.getTime();

    // To calculate the no. of days between two dates
    var difference = Difference_In_Time / (1000 * 3600 * 24);
    return difference;
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
    list.innerHTML = "";
    var item = document.createElement("li");
    item.appendChild(document.createTextNode(allergy));
    list.appendChild(item);
}

function showVaccinations(record) {
    var list = document.querySelector("#vaccinationsList");
    list.innerHTML = "";
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
    list.innerHTML = "";
    var item = document.createElement("li");
    item.appendChild(document.createTextNode(type));
    var downButton = document.createElement("button");
    var folder = record.id;

    var url = await getDownloadURL(ref(storage, patient.uid + '/' + folder + '/' + fileName));

    console.log(url);

    downButton.innerHTML = '<a href="' + url + '" target="_blank" download>Download File</a>';
    item.appendChild(downButton);
    list.appendChild(item);
}