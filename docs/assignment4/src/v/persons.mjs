/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
 import Person from "../m/Person.mjs";
 import Movie from "../m/Movie.mjs";
 import { fillSelectWithOptions, createListFromMap } from "../../lib/util.mjs";
 
 /***************************************************************
  Load data
  ***************************************************************/
 Person.retrieveAll();
 Movie.retrieveAll();
 

 for (const btn of document.querySelectorAll("button.back-to-menu")) {
   btn.addEventListener('click', function () {refreshManageDataUI();});
 }
 
 for (const frm of document.querySelectorAll("section > form")) {
   frm.addEventListener("submit", function (e) {
     e.preventDefault();
     frm.reset();
   });
 }
 window.addEventListener("beforeunload", function () {
   Person.saveAll();
   for (const Subtype of Person.subtypes) {
    Subtype.saveAll();
   }
   
   Movie.saveAll();
 });
 

 document.getElementById("RetrieveAndListAll")
     .addEventListener("click", function () {
   const tableBodyEl = document.querySelector("section#Person-R > table > tbody");
   tableBodyEl.innerHTML = "";
   for (const key of Object.keys( Person.instances)) {
     const person = Person.instances[key];
     const row = tableBodyEl.insertRow();
     const roles = [];
     row.insertCell().textContent = person.personId;
     row.insertCell().textContent = person.name;
     for (const Subtype of Person.subtypes) {
      if (person.personId in Subtype.instances) roles.push(Subtype.name);
     }
     row.insertCell().textContent = roles.toString();
   }
   document.getElementById("Person-M").style.display = "none";
   document.getElementById("Person-R").style.display = "block";
 });
 

 const createFormEl = document.querySelector("section#Person-C > form");
 document.getElementById("Create").addEventListener("click", function () {
   document.getElementById("Person-M").style.display = "none";
   document.getElementById("Person-C").style.display = "block";

   createFormEl.personId.setCustomValidity("");
   createFormEl.name.setCustomValidity("");
   createFormEl.reportValidity();
   createFormEl.reset();
 });

 createFormEl.personId.addEventListener("input", function () {
   createFormEl.personId.setCustomValidity(
       Person.checkPersonIdAsId( createFormEl.personId.value).message);
 });

 createFormEl.name.addEventListener("input", function () {
   createFormEl.name.setCustomValidity(
       Person.checkName( createFormEl.name.value).message);
 });
 

 createFormEl["commit"].addEventListener("click", function () {
   const slots = {
     personId: createFormEl.personId.value,
     name: createFormEl.name.value
   };
  
   createFormEl.personId.setCustomValidity(
       Person.checkPersonIdAsId( slots.personId).message);
   createFormEl.name.setCustomValidity(
       Person.checkName( slots.name).message);
 
   if (createFormEl.reportValidity()) Person.add( slots);
 });
 

 const updateFormEl = document.querySelector("section#Person-U > form");
 const updSelPersonEl = updateFormEl.selectPerson;

 document.getElementById("Update").addEventListener("click", function () {
  
   updSelPersonEl.innerHTML = "";
  
   fillSelectWithOptions( updSelPersonEl, Person.instances,
       "personId", {displayProp:"name"});
   document.getElementById("Person-M").style.display = "none";
   document.getElementById("Person-U").style.display = "block";
  
   updateFormEl.name.setCustomValidity("");
   updateFormEl.reportValidity();
   updateFormEl.reset();
 });
 updSelPersonEl.addEventListener("change", handlePersonSelectChangeEvent);
 

 updateFormEl.name.addEventListener("input", function () {
  updateFormEl.name.setCustomValidity(
       Person.checkName( updateFormEl.name.value).message);
 });
 

 updateFormEl["commit"].addEventListener("click", function () {
   const personIdRef = updSelPersonEl.value;
   if (!personIdRef) return;
   const slots = {
     personId: updateFormEl.personId.value,
     name: updateFormEl.name.value
   }
   
   updateFormEl.name.setCustomValidity(
    Person.checkName(slots.name).message);

   
   if (updateFormEl.reportValidity()) {
     Person.update( slots);
     
     updSelPersonEl.options[updSelPersonEl.selectedIndex].text = slots.name;
   }
 });

 function handlePersonSelectChangeEvent () {
   const key = updateFormEl.selectPerson.value;
   if (key) {
     const person = Person.instances[key];
     updateFormEl.personId.value = person.personId;
     updateFormEl.name.value = person.name;
   } else {
     updateFormEl.reset();
   }
 }
 

 const deleteFormEl = document.querySelector("section#Person-D > form");
 const delSelPersonEl = deleteFormEl.selectPerson;
 document.getElementById("Delete").addEventListener("click", function () {
   document.getElementById("Person-M").style.display = "none";
   document.getElementById("Person-D").style.display = "block";
   delSelPersonEl.innerHTML = "";
 
   fillSelectWithOptions( delSelPersonEl, Person.instances,
       "personId", {displayProp:"name"});
   deleteFormEl.reset();
 });

 delSelPersonEl.addEventListener("change", function () {
   const saveButton = deleteFormEl["commit"],
       movieId = delSelPersonEl.value;
   if (movieId) {
     saveButton.disabled = false;
   } else {
     deleteFormEl.reset();
     saveButton.disabled = true;
   }
 });

 deleteFormEl["commit"].addEventListener("click", function () {
   const personIdRef = delSelPersonEl.value;
   if (!personIdRef) return;
   if (confirm("Do you really want to delete this person?")) {
     Person.destroy( personIdRef);
     delSelPersonEl.remove( delSelPersonEl.selectedIndex);
   }
 });
 

 function refreshManageDataUI() {
   document.getElementById("Person-M").style.display = "block";
   document.getElementById("Person-R").style.display = "none";
   document.getElementById("Person-C").style.display = "none";
   document.getElementById("Person-U").style.display = "none";
   document.getElementById("Person-D").style.display = "none";
 }
 
 refreshManageDataUI();
 