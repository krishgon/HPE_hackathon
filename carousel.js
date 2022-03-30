// Importing the functions from the needed SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, writeBatch } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js";
import { getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-storage.js";

function checkInputs(){
    let inputs=document.getElementsByClassName('carousel-input');
    let i=inputs.length;
    let inputCounter=0;
    for(let j=0; j<i; j++){
        if(inputs[j].length == 0){
            inputCounter++;
        }
    }
    if(inputCounter == i){
        return true;
    }
}

let vaccBox = document.getElementById("vaccines");
let allBox = document.getElementById("allergies");
let repBox = document.getElementById("reports");


document.getElementById("addVaccineButton").addEventListener('click', () => {
    const vaccInput=document.createElement('div');
    vaccInput.setAttribute('id','vaccineInput');
    vaccInput.innerHTML='<div id="vaccineInput" style="border: 1px solid black; padding: 1rem;"> <input type="text" id="disease" placeholder="For what disease the vaccine was provided?"> <input type="date" id="dateGiven"> </div>';
    vaccBox.appendChild(vaccInput);
});

document.getElementById('deleteVaccButton').addEventListener('click',()=>{
    vaccBox.removeChild(vaccBox.lastChild);
})


document.getElementById("addAllergyButton").addEventListener('click', () => {
    const allergyInput=document.createElement('div');
    allergyInput.setAttribute('id','allergyInput');
    allergyInput.innerHTML='<div id="allergyInput" style="border: 1px solid black; padding: 1rem;"> <input type="text" id="sAllergy" placeholder="What allergy do you have"> </div>';
    allBox.appendChild(allergyInput);
});

document.getElementById('deleteAllergyButton').addEventListener('click',()=>{
    allBox.removeChild(allBox.lastChild);
})
