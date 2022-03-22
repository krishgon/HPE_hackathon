

// after uploading report, proceed to collect prescriptions
document.body.innerHTML = "<h1>Hi " + userDetails.get('name') + ", Please submit your prescriptions: </h1><h2>prescription 1</h2><input type='text' id='presDoctor' placeholder='Given by'><input type='text' placeholder='prescription is for' id='prescFor'><button id='presSubmit'>Submit</button>";

document.getElementById("presSubmit").addEventListener('click', async () => {
    var presRef = doc(db, collec, user.uid, 'prescriptions', 'pres1');
    await setDoc(presRef, {
        doctor: document.getElementById('presDoctor').value,
        prescFor: document.getElementById('prescFor').value
    }, { merge: true });
});