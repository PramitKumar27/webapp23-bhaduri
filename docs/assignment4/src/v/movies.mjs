/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
 import Person from "../m/Person.mjs";
 import Director from "../m/Director.mjs";
 import Actor from "../m/Actor.mjs"
 import Movie from "../m/Movie.mjs";
 import { fillSelectWithOptions, fillSelectWithOptionsAndSelect,
   createListFromMap, createMultiSelectionWidget, fill, createOption } from "../../lib/util.mjs";
 import { MovieCategoryEL} from "../../lib/Enumeration.mjs";
 import { displaySegmentFields, undisplayAllSegmentFields} from "./app.mjs";

 /***************************************************************
  Load data
  ***************************************************************/
 Person.retrieveAll();
 Movie.retrieveAll();
 
 /***************************************************************
  Set up general, use-case-independent UI elements
  ***************************************************************/
 // set up back-to-menu buttons for all CRUD UIs
 for (const btn of document.querySelectorAll("button.back-to-menu")) {
   btn.addEventListener("click", refreshManageDataUI);
 }
 // neutralize the submit event for all CRUD UIs
 for (const frm of document.querySelectorAll("section > form")) {
   frm.addEventListener("submit", function (e) {
     e.preventDefault();
     frm.reset();
   });
 }
 // save data when leaving the page
 window.addEventListener("beforeunload", Movie.saveAll);
 
 /**********************************************
  Use case Retrieve/List All Movies
  **********************************************/
 document.getElementById("RetrieveAndListAll")
     .addEventListener("click", function () {
   document.getElementById("Movie-M").style.display = "none";
   document.getElementById("Movie-R").style.display = "block";
   const tableBodyEl = document.querySelector("section#Movie-R>table>tbody");
   tableBodyEl.innerHTML = "";  // drop old content
   for (const key of Object.keys( Movie.instances)) {
     const movie = Movie.instances[key];
     // create list of actors for this movie
     const actListEl = createListFromMap( movie.actors, "name");
     const row = tableBodyEl.insertRow();
     row.insertCell().textContent = movie.movieId;
     row.insertCell().textContent = movie.title;
     row.insertCell().textContent = movie.releaseDate;
     row.insertCell().appendChild( actListEl);
     row.insertCell().textContent = movie.director.name;
     if (movie.category) {
      switch (movie.category) {
      case MovieCategoryEL.TVSERIESEPISODE:
        row.insertCell().textContent = movie.tvSeriesName;
        row.insertCell().textContent = "Episode number " + movie.episodeNo;
        break;
      case MovieCategoryEL.BIOGRAPHY: 
        row.insertCell().textContent = "Biography about " + movie.about.name;
        break;
      }
    }
   }
 });
 
 /**********************************************
   Use case Create Movie
  **********************************************/
 const createFormEl = document.querySelector("section#Movie-C > form"),
       selectActorsEl = createFormEl["selectActors"],
       selectDirectorEl = createFormEl["selectDirector"],
       selcetAboutEl = createFormEl["selectAboutPerson"];
 document.getElementById("Create").addEventListener("click", function () {
   // set up a single selection list for selecting a director
   fillSelectWithOptionsAndSelect( selectDirectorEl, Director.instances,
       "personId", {displayProp: "name"}, 0, true);
   // set up a multiple selection list for selecting actors
   fillSelectWithOptions( selectActorsEl, Actor.instances,
       "personId", {displayProp: "name"});
   document.getElementById("Movie-M").style.display = "none";
   document.getElementById("Movie-C").style.display = "block";
   undisplayAllSegmentFields( createFormEl, MovieCategoryEL.labels);
   fillSelectWithOptionsAndSelect( selcetAboutEl, Person.instances,
       "personId", {displayProp: "name"}, 0, true);
   // reset red box and error messages
   createFormEl.movieId.setCustomValidity("");
   createFormEl.title.setCustomValidity("");
   createFormEl.releaseDate.setCustomValidity("");
   createFormEl.selectDirector.setCustomValidity("");
   createFormEl.category.setCustomValidity("");
   createFormEl.selectAboutPerson.setCustomValidity("");
   createFormEl.tvSeriesName.setCustomValidity("");
   createFormEl.episodeNo.setCustomValidity("");
   createFormEl.reportValidity();
   createFormEl.reset();
 });
 // set up event handlers for responsive constraint validation
 createFormEl.movieId.addEventListener("input", function () {
   createFormEl.movieId.setCustomValidity(
       Movie.checkMovieIdAsId( createFormEl["movieId"].value).message);
 });
 // set up event handlers for responsive constraint validation
 createFormEl.title.addEventListener("input", function () {
   createFormEl.title.setCustomValidity(
       Movie.checkTitle( createFormEl["title"].value).message);
 });
 // set up event handlers for responsive constraint validation
 createFormEl.releaseDate.addEventListener("input", function () {
   createFormEl.releaseDate.setCustomValidity(
       Movie.checkReleaseDate( createFormEl["releaseDate"].value).message);
 });
 createFormEl.selectDirector.addEventListener("click", function () {
  createFormEl.selectDirector.setCustomValidity(
      Movie.checkDirector( createFormEl["selectDirector"].value).message);
 });
 
 // set up the movie category selection list
 fill( createFormEl.category, MovieCategoryEL.labels);
 createFormEl.category.addEventListener("change", function () {
  // the array index of MovieCategoryEL.labels
  const categoryIndexStr = createFormEl.category.value;
  if (categoryIndexStr) {
  displaySegmentFields( createFormEl, MovieCategoryEL.labels,
    parseInt( categoryIndexStr) + 1);
  } else {
  undisplayAllSegmentFields( createFormEl, MovieCategoryEL.labels);
  }
  });

 // handle Save button click events
 createFormEl["commit"].addEventListener("click", function () {
   const slots = {
     movieId: createFormEl["movieId"].value,
     title: createFormEl["title"].value,
     releaseDate: createFormEl["releaseDate"].value,
     actorIdRefs: [],
     director_id: createFormEl["selectDirector"].value,
     category: parseInt(createFormEl["category"].value)+1,
     aboutIdRefs: undefined,
     tvSeriesName: undefined,
     episodeNo: undefined
   };
   // check all input fields and show error messages
   createFormEl.movieId.setCustomValidity(
       Movie.checkMovieIdAsId( slots.movieId).message);
   createFormEl.title.setCustomValidity(
       Movie.checkTitle( slots.title).message);
   createFormEl.releaseDate.setCustomValidity(
       Movie.checkReleaseDate( slots.releaseDate).message);
   // get the list of selected actors
   const selActOptions = createFormEl.selectActors.selectedOptions;
   // check the mandatory value constraint for actors
   createFormEl.selectDirector.setCustomValidity(
       Movie.checkDirector( slots.director_id).message);
   createFormEl.category.setCustomValidity(
       Movie.checkCategory( slots.category).message);
  
   if (slots.category === MovieCategoryEL.BIOGRAPHY) {
    slots.aboutIdRefs = createFormEl["selectAboutPerson"].value;
    createFormEl.selectAboutPerson.setCustomValidity(
      Movie.checkAbout( slots.aboutIdRefs, slots.category).message);
   } else if (slots.category === MovieCategoryEL.TVSERIESEPISODE) {
    slots.tvSeriesName = createFormEl["tvSeriesName"].value;
    createFormEl.tvSeriesName.setCustomValidity(
      Movie.checkTvSeriesName( slots.tvSeriesName, slots.category).message);
    slots.episodeNo = createFormEl["episodeNo"].value;
    createFormEl.episodeNo.setCustomValidity(
      Movie.checkEpisodeNo( slots.episodeNo, slots.category).message);
   }
   // save the input data only if all form fields are valid
   if (createFormEl.reportValidity()) {
     // construct a list of actor ID references
     for (const opt of selActOptions) {
       slots.actorIdRefs.push( opt.value);
     }
     Movie.add( slots);
     undisplayAllSegmentFields( createFormEl, MovieCategoryEL.labels);
   }
 });
 
 /**********************************************
  * Use case Update Movie
 **********************************************/
 const updateFormEl = document.querySelector("section#Movie-U > form"),
       updSelMovieEl = updateFormEl["selectMovie"];
 document.getElementById("Update").addEventListener("click", function () {
   // reset selection list (drop its previous contents)
   updSelMovieEl.innerHTML = "";
   updateFormEl.category.innerHTML = "";
   // populate the selection list
   fillSelectWithOptions( updSelMovieEl, Movie.instances,
       "movieId", {displayProp: "title"});
   document.getElementById("Movie-M").style.display = "none";
   document.getElementById("Movie-U").style.display = "block";
   undisplayAllSegmentFields( updateFormEl, MovieCategoryEL.labels);
   // reset red box and error messages
   updateFormEl.movieId.setCustomValidity("");
   updateFormEl.title.setCustomValidity("");
   updateFormEl.releaseDate.setCustomValidity("");
   updateFormEl.selectDirector.setCustomValidity("");
   updateFormEl.category.setCustomValidity("");
   updateFormEl.selectAboutPerson.setCustomValidity("");
   updateFormEl.tvSeriesName.setCustomValidity("");
   updateFormEl.episodeNo.setCustomValidity("");
   updateFormEl.reportValidity();
   updateFormEl.reset();
 });
 /**
  * handle movie selection events: when a movie is selected,
  * populate the form with the data of the selected movie
  */
 updSelMovieEl.addEventListener("change", function () {
   const saveButton = updateFormEl["commit"],
     selectActorsWidget = updateFormEl.querySelector(".MultiSelectionWidget"),
     selectDirectorEl = updateFormEl["selectDirector"],
     movieId = updateFormEl["selectMovie"].value,
     updSelAboutEl = updateFormEl["selectAboutPerson"];
   if (movieId) {
     const movie = Movie.instances[movieId];
     updateFormEl["movieId"].value = movie.movieId;
     updateFormEl["title"].value = movie.title;
     updateFormEl["releaseDate"].value = movie.releaseDate;
     // set up the associated director selection list
     fillSelectWithOptionsAndSelect( selectDirectorEl, Director.instances,
         "personId", {displayProp: "name"}, movie.director.personId, false);
     // set up the associated actors selection widget
     createMultiSelectionWidget( selectActorsWidget, movie.actors,
         Actor.instances, "personId", "name", 1);  // minCard=1
     if (movie.about) {
      fillSelectWithOptionsAndSelect( updSelAboutEl, Person.instances,
          "personId", {displayProp: "name"}, movie.about.personId, true);
     }
     updateFormEl["tvSeriesName"].value = movie.tvSeriesName;
     updateFormEl["episodeNo"].value = movie.episodeNo;
         
     // set up the movie category selection list
     updateFormEl.category.innerHTML = "";
     if (movie.category) {
      const cat = parseInt(movie.category);
      updateFormEl.category.add( createOption(movie.category-1,
          MovieCategoryEL.labels[cat-1]));
      displaySegmentFields( updateFormEl, MovieCategoryEL.labels, cat);
     } else {
      updateFormEl.category.add( createOption(""," --- "));
      undisplayAllSegmentFields( updateFormEl, MovieCategoryEL.labels);
     }
     saveButton.disabled = false;
   } else {
     updateFormEl.reset();
     updateFormEl["selectDirector"].selectedIndex = 0;
     selectActorsWidget.innerHTML = "";
     saveButton.disabled = true;
   }
 });
 // set up event handlers for responsive constraint validation
 updateFormEl.movieId.addEventListener("input", function () {
  updateFormEl.movieId.setCustomValidity(
       Movie.checkMovieIdAsId( updateFormEl["movieId"].value).message);
 });
 // set up event handlers for responsive constraint validation
 updateFormEl.title.addEventListener("input", function () {
  updateFormEl.title.setCustomValidity(
       Movie.checkTitle( updateFormEl["title"].value).message);
 });
 // set up event handlers for responsive constraint validation
 updateFormEl.releaseDate.addEventListener("input", function () {
  updateFormEl.releaseDate.setCustomValidity(
       Movie.checkReleaseDate( updateFormEl["releaseDate"].value).message);
 });
 updateFormEl.selectDirector.addEventListener("click", function () {
  updateFormEl.selectDirector.setCustomValidity(
      Movie.checkDirector( updateFormEl["selectDirector"].value).message);
 });
 
 updateFormEl.category.addEventListener("change", function () {
  // the array index of MovieCategoryEL.labels
  const categoryIndexStr = updateFormEl.category.value;
  if (categoryIndexStr) {
  displaySegmentFields( updateFormEl, MovieCategoryEL.labels,
    parseInt( categoryIndexStr) + 1);
  } else {
  undisplayAllSegmentFields( updateFormEl, MovieCategoryEL.labels);
  }
  });

 // handle Save button click events
 updateFormEl["commit"].addEventListener("click", function () {
   const movieIdRef = updSelMovieEl.value,
     selectActorsWidget = updateFormEl.querySelector(".MultiSelectionWidget"),
     selectedActorsListEl = selectActorsWidget.firstElementChild;
   if (!movieIdRef) return;
   const slots = {
     movieId: updateFormEl["movieId"].value,
     title: updateFormEl["title"].value,
     releaseDate: updateFormEl["releaseDate"].value,
     director_id: updateFormEl["selectDirector"].value,
     category: parseInt(updateFormEl["category"].value)+1,
     about_id: undefined,
     tvSeriesName: undefined,
     episodeNo: undefined
   };
   // check all input fields and show error messages
   updateFormEl.title.setCustomValidity(
    Movie.checkTitle( slots.title).message);
   updateFormEl.releaseDate.setCustomValidity(
    Movie.checkReleaseDate( slots.releaseDate).message);
   // check the mandatory value constraint for actors
   updateFormEl.selectDirector.setCustomValidity(
    Movie.checkDirector( slots.director_id).message);
   if (isNaN(slots.category)) {
    slots.category = "";
   }
   updateFormEl.category.setCustomValidity(
    Movie.checkCategory( slots.category).message);
  
   if (slots.category === MovieCategoryEL.BIOGRAPHY) {
    slots.about_id = updateFormEl["selectAboutPerson"].value;
    updateFormEl.selectAboutPerson.setCustomValidity(
      Movie.checkAbout( slots.about_id, slots.category).message);
   } else if (slots.category === MovieCategoryEL.TVSERIESEPISODE) {
    slots.tvSeriesName = updateFormEl["tvSeriesName"].value;
    updateFormEl.tvSeriesName.setCustomValidity(
      Movie.checkTvSeriesName( slots.tvSeriesName, slots.category).message);
    slots.episodeNo = parseInt(updateFormEl["episodeNo"].value);
    updateFormEl.episodeNo.setCustomValidity(
      Movie.checkEpisodeNo( slots.episodeNo, slots.category).message);
   }
   // commit the update only if all form field values are valid
   if (updateFormEl.reportValidity()) {
     // construct actorIdRefs-ToAdd/ToRemove lists
     const actorIdRefsToAdd=[], actorIdRefsToRemove=[];
     for (const actorItemEl of selectedActorsListEl.children) {
       if (actorItemEl.classList.contains("removed")) {
         actorIdRefsToRemove.push( actorItemEl.getAttribute("data-value"));
       }
       if (actorItemEl.classList.contains("added")) {
         console.log(actorItemEl.getAttribute("data-value"));
         actorIdRefsToAdd.push( actorItemEl.getAttribute("data-value"));
       }
     }
     // if the add/remove list is non-empty, create a corresponding slot
     if (actorIdRefsToRemove.length > 0) {
       slots.actorIdRefsToRemove = actorIdRefsToRemove;
     }
     if (actorIdRefsToAdd.length > 0) {
       slots.actorIdRefsToAdd = actorIdRefsToAdd;
     }
     Movie.update( slots);
     // update the movie selection list's option element
     updSelMovieEl.options[updSelMovieEl.selectedIndex].text = slots.title;
     // drop widget content
     selectActorsWidget.innerHTML = "";
     undisplayAllSegmentFields( updateFormEl, MovieCategoryEL.labels);
     updateFormEl.category.innerHTML = "";
   }
 });
 
 /**********************************************
  * Use case Delete Movie
 **********************************************/
 const deleteFormEl = document.querySelector("section#Movie-D > form");
 const delSelMovieEl = deleteFormEl["selectMovie"];
 document.getElementById("Delete").addEventListener("click", function () {
   // reset selection list (drop its previous contents)
   delSelMovieEl.innerHTML = "";
   // populate the selection list
   fillSelectWithOptions( delSelMovieEl, Movie.instances,
       "movieId", {displayProp: "title"});
   document.getElementById("Movie-M").style.display = "none";
   document.getElementById("Movie-D").style.display = "block";
   deleteFormEl.reset();
 });
 /**
  * handle movie selection events: when a movie is selected,
  * activate delete button
  */
 delSelMovieEl.addEventListener("change", function () {
   const saveButton = deleteFormEl["commit"],
       movieId = delSelMovieEl.value;
   if (movieId) {
     saveButton.disabled = false;
   } else {
     deleteFormEl.reset();
     saveButton.disabled = true;
   }
 });
 // handle Delete button click events
 deleteFormEl["commit"].addEventListener("click", function () {
   const movieIdRef = delSelMovieEl.value;
   if (!movieIdRef) return;
   if (confirm("Do you really want to delete this movie?")) {
     Movie.destroy( movieIdRef);
     // remove deleted movie from select options
     delSelMovieEl.remove( delSelMovieEl.selectedIndex);
   }
 });
 
 /**********************************************
  * Refresh the Manage Movies Data UI
  **********************************************/
 function refreshManageDataUI() {
   // show the manage movie UI and hide the other UIs
   document.getElementById("Movie-M").style.display = "block";
   document.getElementById("Movie-R").style.display = "none";
   document.getElementById("Movie-C").style.display = "none";
   document.getElementById("Movie-U").style.display = "none";
   document.getElementById("Movie-D").style.display = "none";
 }
 
 // Set up Manage Movie UI
 refreshManageDataUI();