/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
 import Person from "../m/Person.mjs";
 import Movie from "../m/Movie.mjs";
 import Actor from "../m/Actor.mjs";
 import { fillSelectWithOptions, fillSelectWithOptionsAndSelect, createListFromMap } from "../../lib/util.mjs";
 
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
 // neutralize the submit event for all use cases
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
  Use case Retrieve and List All Actors
  **********************************************/
 document.getElementById("RetrieveAndListAll")
     .addEventListener("click", function () {
   const tableBodyEl = document.querySelector("section#Actor-R > table > tbody");
   tableBodyEl.innerHTML = "";
   for (const key of Object.keys( Actor.instances)) {
     const actor = Actor.instances[key];
     const row = tableBodyEl.insertRow();
     const playMoviesListEl = createListFromMap( actor.playedMovies, "title");
     row.insertCell().textContent = actor.personId;
     row.insertCell().textContent = actor.name;
     row.insertCell().appendChild(playMoviesListEl);
     if (actor.agent) {
      row.insertCell().textContent = actor.agent.name;
     }
   }
   document.getElementById("Actor-M").style.display = "none";
   document.getElementById("Actor-R").style.display = "block";
 });
 
 /**********************************************
  Use case Create Actor
  **********************************************/
 const createFormEl = document.querySelector("section#Actor-C > form"),
       selectAgentEl = createFormEl["selectAgent"];
 document.getElementById("Create").addEventListener("click", function () {
   document.getElementById("Actor-M").style.display = "none";
   document.getElementById("Actor-C").style.display = "block";
   // set up a single selection list for selecting a actor
   fillSelectWithOptions( selectAgentEl, Person.instances,
       "personId", {displayProp: "name"});
   // reset red box and error messages
   createFormEl.personId.setCustomValidity("");
   createFormEl.name.setCustomValidity("");
   createFormEl.selectAgent.setCustomValidity("");
   createFormEl.reportValidity();
   createFormEl.reset();
 });
 // set up event handlers for responsive constraint validation
 createFormEl.personId.addEventListener("input", function () {
   createFormEl.personId.setCustomValidity(
       Person.checkPersonIdAsId( createFormEl.personId.value).message);
 });
 // set up event handlers for responsive constraint validation
 createFormEl.name.addEventListener("input", function () {
   createFormEl.name.setCustomValidity(
       Person.checkName( createFormEl.name.value).message);
 });
 createFormEl.selectAgent.addEventListener("click", function () {
  createFormEl.selectAgent.setCustomValidity(
       Actor.checkAgent( createFormEl["selectAgent"].value).message);
 });
 
 // handle Save button click events
 createFormEl["commit"].addEventListener("click", function () {
   const slots = {
     personId: createFormEl.personId.value,
     name: createFormEl.name.value,
     agent_id: createFormEl["selectAgent"].value
   };
   // check all input fields and show error messages
   createFormEl.personId.setCustomValidity(
       Person.checkPersonIdAsId( slots.personId).message);
   createFormEl.name.setCustomValidity(
       Person.checkName( slots.name).message);
   createFormEl.selectAgent.setCustomValidity(
       Actor.checkAgent( slots.agent_id).message);
   // save the input data only if all form fields are valid
   if (createFormEl.reportValidity()) Actor.add( slots);
 });
 
 /**********************************************
  Use case Update Actor
  **********************************************/
 const updateFormEl = document.querySelector("section#Actor-U > form");
 const updSelActorEl = updateFormEl.selectActor;
 // handle click event for the menu item "Update"
 document.getElementById("Update").addEventListener("click", function () {
   // reset selection list (drop its previous contents)
   updSelActorEl.innerHTML = "";
   // populate the selection list
   fillSelectWithOptions( updSelActorEl, Actor.instances,
       "personId", {displayProp:"name"});
   document.getElementById("Actor-M").style.display = "none";
   document.getElementById("Actor-U").style.display = "block";
   // reset red box and error messages
   updateFormEl.name.setCustomValidity("");
   createFormEl.selectAgent.setCustomValidity("");
   updateFormEl.reportValidity();
   updateFormEl.reset();
 });
 updSelActorEl.addEventListener("change", handleActorSelectChangeEvent);
 
 // set up event handlers for responsive constraint validation
 updateFormEl.name.addEventListener("input", function () {
  updateFormEl.name.setCustomValidity(
       Person.checkName( updateFormEl.name.value).message);
 });
 updateFormEl.selectAgent.addEventListener("click", function () {
  updateFormEl.selectAgent.setCustomValidity(
       Actor.checkAgent( updateFormEl["selectAgent"].value).message);
 });
 
 // handle Save button click events
 updateFormEl["commit"].addEventListener("click", function () {
   const personIdRef = updSelActorEl.value;
   if (!personIdRef) return;
   const slots = {
     personId: updateFormEl.personId.value,
     name: updateFormEl.name.value,
     agent_id: updateFormEl["selectAgent"].value
   }
   // check all property constraints
   updateFormEl.name.setCustomValidity(
       Person.checkName(slots.name).message);
   updateFormEl.selectAgent.setCustomValidity(
       Actor.checkAgent( slots.agent_id).message);

   // save the input data only if all of the form fields are valid
   if (updateFormEl.reportValidity()) {
     Actor.update( slots);
     // update the actor selection list's option element
     updSelActorEl.options[updSelActorEl.selectedIndex].text = slots.name;
   }
 });
 /**
  * handle actor selection events
  * when a actor is selected, populate the form with the data of the selected person
  */
 function handleActorSelectChangeEvent () {
   const key = updateFormEl.selectActor.value,
         selectAgentEl = updateFormEl["selectAgent"];
   if (key) {
     const actor = Actor.instances[key];
     updateFormEl.personId.value = actor.personId;
     updateFormEl.name.value = actor.name;
     // set up the associated person as agent selection list
     if (actor.agent) {
      fillSelectWithOptionsAndSelect( selectAgentEl, Person.instances,
          "personId", {displayProp: "name"}, actor.agent.personId, false);
     } else {
      fillSelectWithOptions(selectAgentEl, Person.instances,
        "personId", {displayProp: "name"});
     }
   } else {
     updateFormEl.reset();
   }
 }
 
 /**********************************************
  Use case Delete Actor
  **********************************************/
 const deleteFormEl = document.querySelector("section#Actor-D > form");
 const delSelActorEl = deleteFormEl.selectActor;
 document.getElementById("Delete").addEventListener("click", function () {
   document.getElementById("Actor-M").style.display = "none";
   document.getElementById("Actor-D").style.display = "block";
   // reset selection list (drop its previous contents)
   delSelActorEl.innerHTML = "";
   // populate the selection list
   fillSelectWithOptions( delSelActorEl, Actor.instances,
       "personId", {displayProp:"name"});
   deleteFormEl.reset();
 });
 // handle Delete button click events
 deleteFormEl["commit"].addEventListener("click", function () {
   const personIdRef = delSelActorEl.value;
   if (!personIdRef) return;
   if (confirm("Do you really want to delete this person?")) {
     Actor.destroy( personIdRef);
     delSelActorEl.remove( delSelActorEl.selectedIndex);
   }
 });
 
 /**********************************************
  * Refresh the Manage Actors Data UI
  **********************************************/
 function refreshManageDataUI() {
   // show the manage person UI and hide the other UIs
   document.getElementById("Actor-M").style.display = "block";
   document.getElementById("Actor-R").style.display = "none";
   document.getElementById("Actor-C").style.display = "none";
   document.getElementById("Actor-U").style.display = "none";
   document.getElementById("Actor-D").style.display = "none";
 }
 
 // Set up Manage Actors UI
 refreshManageDataUI();
 