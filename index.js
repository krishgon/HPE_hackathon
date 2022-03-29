//Styling
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
    container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
});


// Importing the functions from the needed SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, writeBatch } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js";
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
<<<<<<< HEAD
=======
var userDetails, user, userDocRef, collec;
var vaccToAdd = document.getElementById('vaccineInput').cloneNode(true);
var vaccBox = document.getElementById("vaccines");
var allToAdd = document.getElementById('allergyInput').cloneNode(true);
var allBox = document.getElementById("allergies");
var repToAdd = document.getElementById("reportInput").cloneNode(true);
var repBox = document.getElementById("reports");
var dob;

>>>>>>> 3853252be3ad13e5e6ef8cfab76228dcc439d8a0

if (localStorage.getItem("uid") != null) {
    sendToRespectivePage(localStorage.getItem("uid"));
} else {
    // when the signup button will be clicked
    sButton.addEventListener('click', (e) => {
        console.log("button click deteceted");

        // store all the details entered by user in a map variable called userDetails
        userDetails = new Map();
        userDetails.set('email', document.getElementById('sMail').value);
        userDetails.set('password', document.getElementById('sPass').value);
        userDetails.set('name', document.getElementById('sName').value);

        // move ahead and ask the user if he/she is a doctor or a patient by changing body's html
        document.getElementById("container").style.display = "none";
        document.getElementById("userTypeBox").style.display = "block";

        //if patient
        document.getElementById("patient").addEventListener('click', () => { signUpUser('patient'); });
        //if doctor
        document.getElementById("doctor").addEventListener('click', () => { signUpUser('doctor'); });
    });

    // when the login button will be clicked
    lButton.addEventListener('click', (e) => {
        console.log("log in button clicked");
        // collect credentials entered by the user
        var email = document.getElementById('lMail').value;
        var password = document.getElementById('lPass').value;

        signInWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                // alert user that he/she is logged in
                const user = userCredential.user;

                localStorage.setItem("uid", user.uid);

                sendToRespectivePage(user.uid);
            })
            .catch((error) => {
                // if there's some error in details or any other thing, alert about it to the user
                const errorCode = error.code;
                const errorMessage = error.message;

                alert(errorMessage);
            });
    });

    document.getElementById("patientContinue").addEventListener('click', async () => {
        dob = document.getElementById('birthDate').valueAsDate;
        console.log(dob);
        var userAge = calcAge(dob,new Date());
        console.log(userAge);
        await setDoc(userDocRef, {
            dob: dob,
            age: userAge,
            height: document.getElementById('height').value,
            weight: document.getElementById('weight').value
        }, { merge: true });

        document.getElementById("patientDetails").style.display = "none";
        document.getElementById("patientVaccinations").style.display = "block";
    });

    // add and delete of ALLERGIES
    document.getElementById("addAllergyButton").addEventListener('click', () => { addItem(allToAdd, allBox, 1); });
    document.getElementById("deleteAllButton").addEventListener('click', () => { deleteBox(document.getElementById("deleteAllButton")); });

    // add and delete of VACCINES
    document.getElementById("addVaccineButton").addEventListener('click', () => { addItem(vaccToAdd, vaccBox, 2) });
    document.getElementById("deleteVaccButton").addEventListener('click', () => { deleteBox(document.getElementById("deleteVaccButton")); });

    // add and delete of PATHOLOGICAL REPORTS
    document.getElementById("addReportButton").addEventListener('click', () => { addItem(repToAdd, repBox, 2); });
    document.getElementById("deleteReportButton").addEventListener('click', () => { deleteBox(document.getElementById("deleteReportButton")); });


    // When the vaccine submit button is clicked
    document.getElementById("vaccineSubmit").addEventListener('click', async () => {
        await uploadVaccines();

        document.getElementById("patientVaccinations").style.display = "none";
        document.getElementById("patientAllergies").style.display = "block";
    });

    // When the allergies submit button is clicked
    document.getElementById("allergySubmit").addEventListener('click', async () => {
        await uploadAllergies();

        document.getElementById("patientAllergies").style.display = "none";
        document.getElementById("patientPathReports").style.display = "block";
    });

    // when pathological reports submit button is clicked
    document.getElementById('reportSubmit').addEventListener('click', async () => {
        await uploadPathReports();

        // since all information is collected, take the user to his profile page
        window.location.replace("./patient/patientHome.html");

    });


}

function addItem(toAdd, parentBox, deleteIndex) {
    var item = toAdd.cloneNode(true);
    parentBox.appendChild(item);
    var deleteButton = item.children[deleteIndex];
    deleteButton.addEventListener('click', () => {
        deleteBox(deleteButton);
    });
}

function deleteBox(delButton) {
    delButton.parentElement.outerHTML = "";
}


function calcAge(DOB, refDate) {
    // To calculate the time difference of two dates
    var Difference_In_Time = refDate.getTime() - DOB.getTime();

    // To calculate the no. of days between two dates
    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
    var age = parseInt(Difference_In_Days / 365);
    return age;
}

async function sendToRespectivePage(uid) {
    var patientSnap = await getDoc(doc(db, "patients", uid));

    if (patientSnap.exists() == true) {
        window.location.replace("./patient/patientHome.html");
    } else {
        window.location.replace("./doctor/doctorHome.html");
    }
}


function signUpUser(userStatus) {
    // register the user 
    createUserWithEmailAndPassword(auth, userDetails.get('email'), userDetails.get('password'))
        .then(async (userCredential) => {
            // after registering
            user = userCredential.user;
            collec = userStatus + "s";

            // create a document of user in the respective collection including user's basic details 
            userDocRef = doc(db, collec, user.uid);
            await setDoc(userDocRef, {
                name: userDetails.get('name'),
                email: userDetails.get('email')
            });

            localStorage.setItem("uid", user.uid);

            // when the user is succesfully signed up, show him/her that profile is created and prompt a continue button
            document.getElementById("userTypeBox").style.display = "none";
            document.getElementById("successfullyCreated").style.display = "block";
            document.getElementById("contButton").addEventListener('click', () => {
                if (userStatus == 'patient') {
                    makePatientProfile();
                } else {
                    makeDoctorProfile();
                }
            });
        })
        .catch((error) => {
            // if there's some error in details or any other thing, alert about it to the user
            const errorCode = error.code;
            const errorMessage = error.message;

            window.alert(errorMessage);
        });
}


function makeDoctorProfile() {
    // ask user about the remaining details after continue is clicked
    document.getElementById("successfullyCreated").style.display = "none";
    document.getElementById("doctorDetails").style.display = "block";
    document.getElementById("doctorContinue").addEventListener('click', async () => {
        await setDoc(userDocRef, {
            hospital: document.getElementById('hospital').value,
            specialization: document.getElementById('specialization').value
        }, { merge: true });


        // since all information is collected, take the user to his profile page
        window.location.replace("./doctor/doctorHome.html");
    });
}


function makePatientProfile() {
    // ask user about the remaining details after continue is clicked
    document.getElementById("successfullyCreated").style.display = "none";
    document.getElementById("patientDetails").style.display = "block";
}

async function uploadVaccines() {
    const batch = writeBatch(db);

    var vaccs = document.querySelectorAll("#vaccineInput");
    for (var i = 0; i < vaccs.length; i++) {
        var vaccRef = doc(db, 'patients', user.uid, "vaccinations", `vacc${i + 1}`);
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

    var alls = document.querySelectorAll("#allergyInput");
    for (var i = 0; i < alls.length; i++) {
        var allRef = doc(db, 'patients', user.uid, "allergies", `all${i + 1}`);
        batch.set(allRef, {
            allergyFrom: alls[i].querySelector("#allergyFrom").value
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
        const reportRef = ref(storage, user.uid + `/rep${i+1}/` + file.name);

        // upload the selected file to cloud storage
        await uploadBytes(reportRef, file);
        console.log('Uploaded a blob or file!');

        // register the report type to user profile
        var pathReportRef = doc(db, "patients", user.uid, 'pathologicalReports', `rep${i+1}`);
        await setDoc(pathReportRef, {
            type: reps[i].querySelector('#reportType').value,
            fileName: file.name
        }, { merge: true });
    }
}