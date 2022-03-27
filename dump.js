// after uploading report, proceed to collect prescriptions
document.body.innerHTML = "<h1>Hi " + userDetails.get('name') + ", Please submit your prescriptions: </h1><h2>prescription 1</h2><input type='text' id='presDoctor' placeholder='Given by'><input type='text' placeholder='prescription is for' id='prescFor'><button id='presSubmit'>Submit</button>";

document.getElementById("presSubmit").addEventListener('click', async () => {
    var presRef = doc(db, collec, user.uid, 'prescriptions', 'pres1');
    await setDoc(presRef, {
        doctor: document.getElementById('presDoctor').value,
        prescFor: document.getElementById('prescFor').value
    }, { merge: true });
});
// Idhar vo sara code hai jo abhi temporary kahipe store karna hai. kyuki ye aage kam aasakta hai


document.getElementById("patientContinue").addEventListener('click', async () => {

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
    document.body.innerHTML = "<h1>Hi " + userDetails.get('name') + ", Please submit your past vaccination records: </h1><div id='vaccines'><div id='vaccineInput'><input type='number' id='ageGiven' placeholder='Age at which it was given'><input type='text' id='disease' placeholder='For what disease the vaccine was provided?'><input type='date' id='dateGiven'></div></div><button id='addVaccineButton'>+</button><button id='vaccineSubmit'>Submit</button>";

    // when add vacine button (plus icon) will be clicked
    document.getElementById("addVaccineButton").addEventListener('click', () => {
        var vaccineItem = document.getElementById("vaccineInput").cloneNode(true);
        document.getElementById("")
    });

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
                        type: document.getElementById('reportType').value,
                        fileName: file.name
                    }, { merge: true });

                    // since all information is collected, take the user to his profile page
                    window.location.replace("./patient/patientHome.html");
                });
            });
        });
    });
});
