/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
 import Person from "../m/Person.mjs";
 import Movie from "../m/Movie.mjs";
 import Director from "../m/Director.mjs";
 import { fillSelectWithOptions, createListFromMap } from "../../lib/util.mjs";
 
 /***************************************************************
  Load data
  ***************************************************************/
 Person.retrieveAll();
 Movie.retrieveAll();
 
 /***************************************************************
  Set up general, use-case-independent UI elements
  ***************************************************************/
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
 
 /**********************************************
  Use case Retrieve and List All Directors
  **********************************************/
 document.getElementById("RetrieveAndListAll")
     .addEventListener("click", function () {
   const tableBodyEl = document.querySelector("section#Director-R > table > tbody");
   tableBodyEl.innerHTML = "";
   for (const key of Object.keys( Director.instances)) {
     const director = Director.instances[key];
     const row = tableBodyEl.insertRow();
     const dirMoviesListEl = createListFromMap( director.directedMovies, "title");
     row.insertCell().textContent = director.personId;
     row.insertCell().textContent = director.name;
     row.insertCell().appendChild(dirMoviesListEl);
   }
   document.getElementById("Director-M").style.display = "none";
   document.getElementById("Director-R").style.display = "block";
 });
 
 /**********************************************
  Use case Create Director
  **********************************************/
 const createFormEl = document.querySelector("section#Director-C > form");
 document.getElementById("Create").addEventListener("click", function () {
   document.getElementById("Director-M").style.display = "none";
   document.getElementById("Director-C").style.display = "block";
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
   if (createFormEl.reportValidity()) Director.add( slots);
 });
 
 /**********************************************
  Use case Update Director
  **********************************************/
 const updateFormEl = document.querySelector("section#Director-U > form");
 const updSelDirectorEl = updateFormEl.selectDirector;
 document.getElementById("Update").addEventListener("click", function () {

   updSelDirectorEl.innerHTML = "";
   fillSelectWithOptions( updSelDirectorEl, Director.instances,
       "personId", {displayProp:"name"});
   document.getElementById("Director-M").style.display = "none";
   document.getElementById("Director-U").style.display = "block";
   updateFormEl.name.setCustomValidity("");
   updateFormEl.reportValidity();
   updateFormEl.reset();
 });
 updSelDirectorEl.addEventListener("change", handleDirectorSelectChangeEvent);
 updateFormEl.name.addEventListener("input", function () {
  updateFormEl.name.setCustomValidity(
       Person.checkName( updateFormEl.name.value).message);
 });

 updateFormEl["commit"].addEventListener("click", function () {
   const personIdRef = updSelDirectorEl.value;
   if (!personIdRef) return;
   const slots = {
     personId: updateFormEl.personId.value,
     name: updateFormEl.name.value
   }
   updateFormEl.name.setCustomValidity(
    Person.checkName(slots.name).message);
   if (updateFormEl.reportValidity()) {
     Director.update( slots);
     updSelDirectorEl.options[updSelDirectorEl.selectedIndex].text = slots.name;
   }
 });

 function handleDirectorSelectChangeEvent () {
   const key = updateFormEl.selectDirector.value;
   if (key) {
     const director = Director.instances[key];
     updateFormEl.personId.value = director.personId;
     updateFormEl.name.value = director.name;
   } else {
     updateFormEl.reset();
   }
 }
 
 /**********************************************
  Use case Delete Director
  **********************************************/
 const deleteFormEl = document.querySelector("section#Director-D > form");
 const delSelDirectorEl = deleteFormEl.selectDirector;
 document.getElementById("Delete").addEventListener("click", function () {
   document.getElementById("Director-M").style.display = "none";
   document.getElementById("Director-D").style.display = "block";
   delSelDirectorEl.innerHTML = "";
   fillSelectWithOptions( delSelDirectorEl, Director.instances,
       "personId", {displayProp:"name"});
   deleteFormEl.reset();
 });
 deleteFormEl["commit"].addEventListener("click", function () {
   const personIdRef = delSelDirectorEl.value;
   if (!personIdRef) return;
   if (confirm("Do you really want to delete this director?")) {
     Director.destroy( personIdRef);
     delSelDirectorEl.remove( delSelDirectorEl.selectedIndex);
   }
 });
 
 /**********************************************
  * Refresh the Manage Persons Data UI
  **********************************************/
 function refreshManageDataUI() {
   // show the manage person UI and hide the other UIs
   document.getElementById("Director-M").style.display = "block";
   document.getElementById("Director-R").style.display = "none";
   document.getElementById("Director-C").style.display = "none";
   document.getElementById("Director-U").style.display = "none";
   document.getElementById("Director-D").style.display = "none";
 }
 

 refreshManageDataUI();
 