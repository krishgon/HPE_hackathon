// Importing the functions from the needed SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, writeBatch } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js";
import { getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-storage.js";

let slideCounter=0;
let carouselSlides=document.getElementsByClassName('carousel-slide');
let continueButton=document.getElementById('carousel-continue');

continueButton.addEventListener('click',()=>{
    if(slideCounter<3){
        let inputs=carouselSlides[slideCounter].getElementsByClassName('carousel-input');
        let i=inputs.length;
        for(let j=0;j<i;j++){
            if(inputs[j].value.length==0){
                alert('Fill all the fields');
                return;
            }
        }
        carouselSlides[slideCounter].classList.remove('current-slide')
        slideCounter++;
        carouselSlides[slideCounter].classList.add('current-slide')
    }
    else{
        let inputs=carouselSlides[slideCounter].getElementsByClassName('carousel-input');
        let i=inputs.length;
        for(let j=0;j<i;j++){
            if(inputs[j].value.length==0){
                alert('Fill all the fields');
                return;
            }
        }
        alert('Your profile is created!')
    }
})

let vaccBox = document.getElementById("vaccines");
let allBox = document.getElementById("allergies");
let repBox = document.getElementById("reports");


document.getElementById("addVaccineButton").addEventListener('click', () => {
    const vaccInput=document.createElement('div');
    vaccInput.innerHTML='<div id="vaccineInput"> <div class="extra-input"> <label for="disease">Vaccine:</label> <input type="text" id="disease" placeholder="Vaccine Name" class="carousel-input"> </div> <div class="extra-input"> <label for="dateGiven">Date Given:</label> <input type="date" id="dateGiven" class="carousel-input" placeholder="Date Given"> </div> </div>';
    vaccBox.appendChild(vaccInput);
});

document.getElementById('deleteVaccButton').addEventListener('click',()=>{
    vaccBox.removeChild(vaccBox.lastChild);
})


document.getElementById("addAllergyButton").addEventListener('click', () => {
    const allergyInput=document.createElement('div');
    allergyInput.innerHTML='<div id="allergyInput"> <div class="extra-input"> <label for="sAllergy">Allergy Name:</label> <input type="text" id="sAllergy" placeholder="What allergy do you have" class="carousel-input"> </div> </div>';
    allBox.appendChild(allergyInput);
});

document.getElementById('deleteAllergyButton').addEventListener('click',()=>{
    allBox.removeChild(allBox.lastChild);
})



document.getElementById("addReportButton").addEventListener('click', () => {
    const reportInput=document.createElement('div');
    reportInput.innerHTML='<div id="reportInput"> <div class="extra-input"> <label for="reportFiles"></label> <input type="file" id="reportFiles" placeholder="What are you allergic from?"" class="carousel-input"> </div> <div class="extra-input"> <label for="reportType"></label> <input type="text" placeholder="eg: blood report" id="reportType" class="carousel-input"> </div> </div>';
    repBox.appendChild(reportInput);
});

document.getElementById('deleteReportButton').addEventListener('click',()=>{
    repBox.removeChild(repBox.lastChild);
})
