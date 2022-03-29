let contentArray=
[
    '<h2 class="instruction">What type of user do you want to sign up as?</h2>    <div class="choice-container">        <input type="radio" name="sUsertype" id="sPatient" class="user-type-input">        <label class="choice-box" for="sPatient">            <img src="patient-icon-3.png" alt="patient-icon">            Patient        </label>                <input type="radio" name="sUsertype" id="sDoctor" class="user-type-input">        <label class="choice-box" for="sDoctor">            <img src="doctor-icon.png" alt="doctor-icon">            Doctor        </label>    </div>',
    '<h2 class="instruction">Please enter the following details</h2>    <div class="input-boxes">        <div class="extra-input">            <label for="sBirthdate">Date of Birth</label>            <input type="date" id="sBirthdate">        </div>        <div class="extra-input">            <label for="sHeight">Height</label>            <input type="number" id="sHeight" placeholder="in cm">        </div>        <div class="extra-input">            <label for="sWeight">Weight</label>            <input type="number" id="sWeight" placeholder="in kg">        </div>    </div>',

];

let counter=0;
let carouselBox=document.getElementById('carousel-box');
nextButton=document.getElementById('nextButton');
previousButton=document.getElementById('previousButton');

nextButton.addEventListener('click',()=>{
    if(counter<1){
        counter++;
        carouselBox.innerHTML=contentArray[counter];
    }  
})

previousButton.addEventListener('click',()=>{
    if(counter>0){
        counter--;
        carouselBox.innerHTML=contentArray[counter];
    }   
})

