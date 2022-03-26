// Importing the functions from the needed SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js";
import { getAuth, sendSignInLinkToEmail, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js";
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
    // when the submit button is clicked, sign in the patient whose email is entered
    document.getElementById("mailSubmitButton").addEventListener('click', () => {
        var email = document.getElementById("patientMail").value;
        signPatientByEmail(email);
    });




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
                var q = query(collection(db, "patients"), where("email", "==", email));
                var querySnapshot = await getDocs(q);
                var patient;
                querySnapshot.forEach((doc) => {
                    patient = doc.data();
                    patient.uid = doc.id;
                    console.log(patient);
                });

                document.getElementById("patientName").innerHTML = `Patient Name: ${patient.name} <br> Patient age: ${patient.age} <br> Patient Height: ${patient.height} <br> Patient weight: ${patient.weight} <br>`;





            } else {
                document.getElementById("otpErrorBox").innerHTML = "Correct OTP please";
            }
        });
    });
}
