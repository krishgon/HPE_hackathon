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
        var deleteButton = medToAdd.querySelector(".deleteContainer > button");
        deleteButton.addEventListener('click', () => {
            delteMedicine(deleteButton);
        });
    });

    document.getElementById("deleteMed").addEventListener('click', () => {
        delteMedicine(document.getElementById("deleteMed"));
    });

}


async function getMedTable(record) {
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
    deleteButton.parentElement.parentElement.outerHTML = "";
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
        var medicineRef = doc(db, 'patients', patient.uid, "prescriptions", `pres${prescriptionIndex}`, "medicines", `med${i + 1}`);
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

        document.getElementById("otpDialog").style.display = "flex"
        var otpBox = document.getElementById("otpBox");


        document.getElementById("submitOTP").addEventListener('click', async () => {
            var typedOTP = otpBox.value;
            if (typedOTP == OTP) {
                document.getElementById("otpDialog").style.display = "none"
                document.getElementById("patientDetailsBox").style.display = "block";
                document.getElementById("prescriptionBox").style.display = "block";
                var q = query(collection(db, "patients"), where("email", "==", email));
                var querySnapshot = await getDocs(q);
                querySnapshot.forEach((doc) => {
                    patient = doc.data();
                    patient.uid = doc.id;
                    console.log(patient);
                });

                // retrieve data from server
                const patientSnap = await getDoc(doc(db, "patients", patient.uid));
                console.log(patientSnap);

                var dataToShow = ["name", "age", "email", "height", "weight"];
                for (var i = 0; i < dataToShow.length; i++) {
                    var currentData = dataToShow[i];
                    document.getElementById(currentData + "Box").innerHTML = patientSnap.get(currentData);
                }
                await showCurrentMeds();

            } else {
                document.getElementById("otpErrorBox").innerHTML = "Correct OTP please";
            }
        });
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

    const presSnapshot = await getDocs(collection(db, "patients", patient.uid, "prescriptions"));
    var i = 0;

    presSnapshot.forEach(async (pres) => {
        var presDate = pres.data().prescDate.toDate();
        var days = parseInt(calcDaysDiff(presDate));
        console.log(days);
        var medsSnapshot = await getDocs(collection(db, "patients", patient.uid, "prescriptions", pres.id, "medicines"));
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


function calcDaysDiff(fromDate) {
    var currDate = new Date();

    // To calculate the time difference of two dates
    var Difference_In_Time = currDate.getTime() - fromDate.getTime();

    // To calculate the no. of days between two dates
    var difference = Difference_In_Time / (1000 * 3600 * 24);
    return difference;
}