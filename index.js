// Importing the functions from the needed SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js";
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



if (localStorage.getItem("uid") != null) {
    sendToRespectivePage(localStorage.getItem("uid"));
} else {
    // when the signup button will be clicked
    sButton.addEventListener('click', (e) => {
        console.log("button click deteceted");

        // store all the details entered by user in a map variable called userDetails
        var userDetails = new Map();
        userDetails.set('email', document.getElementById('sMail').value);
        userDetails.set('password', document.getElementById('sPass').value);
        userDetails.set('name', document.getElementById('sName').value);

        // move ahead and ask the user if he/she is a doctor or a patient by changing body's html
        document.body.innerHTML = "<h1>Hi " + userDetails.get('name') + ", Please tell us what are you: </h1><button id='patient'>Patient</button><button id='doctor'>Doctor</button";

        //if patient
        document.getElementById("patient").addEventListener('click', () => { signUpUser('patient'); });
        //if doctor
        document.getElementById("doctor").addEventListener('click', () => { signUpUser('doctor'); });

        //register the user on firebase authentication and also create a profile for user in firestore



        function signUpUser(userStatus) {
            // register the user 
            createUserWithEmailAndPassword(auth, userDetails.get('email'), userDetails.get('password'))
                .then(async (userCredential) => {
                    // after registering
                    const user = userCredential.user;
                    var collec = userStatus + "s";

                    // create a document of user in the respective collection including user's basic details 
                    var userDocRef = doc(db, collec, user.uid);
                    await setDoc(userDocRef, {
                        name: userDetails.get('name'),
                        email: userDetails.get('email')
                    });

                    localStorage.setItem("uid", user.uid);

                    // when the user is succesfully signed up, show him/her that profile is created and prompt a continue button
                    document.body.innerHTML = "<h1>Your profile is created successfully!</h1><button id='contButton'>Continue</button>";
                    document.getElementById("contButton").addEventListener('click', () => {
                        if (userStatus == 'patient') {
                            makePatientProfile(user, userDocRef, collec);
                        } else {
                            makeDoctorProfile(user, userDocRef, collec);
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


        function makeDoctorProfile(user, userDocRef, collec) {
            // ask user about the remaining details after continue is clicked
            document.body.innerHTML = "</h1>Please enter the following details</h1><input type='text' id='hospital' placeholder='your hospital'><input type='text' id='specialization' placeholder='your specialization'><button id='extraContButton'>Continue</button>";
            document.getElementById("extraContButton").addEventListener('click', async () => {
                await setDoc(userDocRef, {
                    hospital: document.getElementById('hospital').value,
                    specialization: document.getElementById('specialization').value
                }, { merge: true });


                // since all information is collected, take the user to his profile page
                window.location.replace("./doctor/doctorHome.html");
            });

        }


        function makePatientProfile(user, userDocRef, collec) {
            // ask user about the remaining details after continue is clicked
            document.body.innerHTML = "</h1>Please enter the following details</h1><input type='date' id='birthDate' placeholder='your birthdate'><input type='number' id='height' placeholder='your height'><input type='number' id='weight' placeholder='your weight'><button id='extraContButton'>Continue</button>";

            document.getElementById("extraContButton").addEventListener('click', async () => {

                var dob = document.getElementById('birthDate').valueAsDate;
                console.log(dob);
                var userAge = calcAge(dob);
                console.log(userAge);
                await setDoc(userDocRef, {
                    dob: dob,
                    age: userAge,
                    height: document.getElementById('height').value,
                    weight: document.getElementById('weight').value
                }, { merge: true });


                // when the user clicks continue, complete his profile by collecting past records
                document.body.innerHTML = "<h1>Hi " + userDetails.get('name') + ", Please submit your past vaccination records: </h1><h2>Vaccine 1</h2><input type='number' id='ageGiven' placeholder='Age at which it was given'><input type='text' id='disease' placeholder='For what disease the vaccine was provided?'><input type='date' id='dateGiven'><button id='vaccineSubmit'>Submit</button>";

                // When the submit button is clicked
                document.getElementById("vaccineSubmit").addEventListener('click', async () => {
                    var vaccineRef = doc(db, collec, user.uid, 'vaccinations', 'vacc1');
                    await setDoc(vaccineRef, {
                        ageGiven: document.getElementById('ageGiven').value,
                        disease: document.getElementById('disease').value,
                        dateGiven: document.getElementById('dateGiven').value
                    }, { merge: true });

                    // when vaccinations are registered, ask for allergies
                    document.body.innerHTML = "<h1>Hi " + userDetails.get('name') + ", Please submit your allergies: </h1><h2>Allergy 1</h2><input type='text' id='allergyFrom' placeholder='What are you allergic from?'><button id='allergySubmit'>Submit</button>";

                    // When the submit button is clicked
                    document.getElementById("allergySubmit").addEventListener('click', async () => {
                        var allergyRef = doc(db, collec, user.uid, 'allergies', 'all1');
                        await setDoc(allergyRef, {
                            allergyFrom: document.getElementById('allergyFrom').value
                        }, { merge: true });

                        // when allergies are registered, ask for pathological reports
                        document.body.innerHTML = "<h1>Hi " + userDetails.get('name') + ", Please submit your pathological reports: </h1><h2>Report 1</h2><input type='file' id='report1' placeholder='What are you allergic from?'><input type='text' placeholder='This report is: ex blood report' id='reportType'><button id='reportSubmit'>Submit</button>";

                        document.getElementById('reportSubmit').addEventListener('click', async () => {
                            // Get the file by the user in a variable
                            const file = document.getElementById('report1').files[0];

                            // Get a reference to the storage service, which is used to create references in your storage bucket
                            const storage = getStorage();

                            // Create a storage reference from our storage service
                            const reportRef = ref(storage, user.uid + '/rep1/' + file.name);

                            // upload the selected file to cloud storage
                            uploadBytes(reportRef, file).then(async (snapshot) => {
                                console.log('Uploaded a blob or file!');

                                // register the report type to user profile
                                var pathReportRef = doc(db, collec, user.uid, 'pathologicalReports', 'rep1');
                                await setDoc(pathReportRef, {
                                    type: document.getElementById('reportType').value
                                }, { merge: true });

                                // since all information is collected, take the user to his profile page
                                window.location.replace("./patient/patientHome.html");
                            });
                        });
                    });
                });
            });
        }

    });


    // when the login button will be clicked
    lButton.addEventListener('click', (e) => {
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

    function calcAge(DOB) {
        var currentDate = new Date();

        // To calculate the time difference of two dates
        var Difference_In_Time = currentDate.getTime() - DOB.getTime();

        // To calculate the no. of days between two dates
        var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
        var age = parseInt(Difference_In_Days / 365);
        return age;
    }
}

async function sendToRespectivePage(uid) {
    var patientSnap = await getDoc(doc(db, "patients", uid));

    if (patientSnap.exists() == true) {
        window.location.replace("./patient/patientHome.html");
    } else {
        window.location.replace("./doctor/doctorHome.html");
    }
}