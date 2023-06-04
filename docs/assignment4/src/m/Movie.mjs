import Person from "./Person.mjs";
import Director from "./Director.mjs";
import Actor from "./Actor.mjs";
import { isNonEmptyString, cloneObject, isIntegerOrIntegerString } from "../../lib/util.mjs";
import { NoConstraintViolation, 
    MandatoryValueConstraintViolation, 
    RangeConstraintViolation,
    UniquenessConstraintViolation,
    StringLengthConstraintViolation,
    FrozenValueConstraintViolation,
    ConstraintViolation } from "../../lib/errorTypes.mjs";
import { MovieCategoryEL} from "../../lib/Enumeration.mjs";

export default class Movie {
  // using a record parameter with ES6 function parameter destructuring
  constructor ({movieId, title, releaseDate, director, director_id,
                 actors, actorIdRefs, category, about, aboutIdRefs, tvSeriesName,
                 episodeNo}) {
    this.movieId = movieId;          // number (int)
    this.title = title;              // string
    this.releaseDate = releaseDate;  // string
    // assign object references or ID references (to be converted in setter)
    this.actors = actors || actorIdRefs;
    this.director = director || director_id;

    // optional properties
    if (category) this.category = category;
    if (about || aboutIdRefs) this.about = about || aboutIdRefs;
    if (tvSeriesName) this.tvSeriesName = tvSeriesName;
    if (episodeNo) this.episodeNo = episodeNo;
  }

  get movieId() {
    return this._movieId;
  }
  //  set the movieId but first validating the data
  set movieId( id) {
    const validationResult = Movie.checkMovieIdAsId( id);
    if (validationResult instanceof NoConstraintViolation) {
      this._movieId = id;
    } else {
      throw validationResult;
    }
  }
  static checkMovieId( id) {
    if (id === undefined) {
      return new NoConstraintViolation();
    }
    const newId = parseInt(id); // transfer string to int
    if (Number.isInteger( newId)) {
      if (newId > 0) return new NoConstraintViolation();
    }
    
    return new RangeConstraintViolation(
      "The movie ID must be a positiv integer!");
  }
  static checkMovieIdAsId( id) {
    var constraintViolation = Movie.checkMovieId( id);
    if ((constraintViolation instanceof NoConstraintViolation)) {
      if (!id) {
        constraintViolation = new MandatoryValueConstraintViolation(
            "A value for the movie ID must be provided!");
      } else if (Movie.instances[id]) {  
        constraintViolation = new UniquenessConstraintViolation(
            "There is already a movie record with this movie ID!");
      } else {
        constraintViolation = new NoConstraintViolation();
      } 
    }
    return constraintViolation;
  }

  //  set the title but first validating the data
  get title() {
    return this._title;
  }
  set title( t) {
    const validationResult = Movie.checkTitle( t);
    if (validationResult instanceof NoConstraintViolation) {
      this._title = t;
    } else {
      throw validationResult;
    }
  }
  static checkTitle( newTitle) {
    if (!newTitle) {
      return new MandatoryValueConstraintViolation(
        "A name for the title must be provided!");
    } else if (!isNonEmptyString(newTitle)) {
      return new RangeConstraintViolation(
          "The title must be a non-empty string!");
    } else if (newTitle.trim().length > 120) {
      return new StringLengthConstraintViolation(
          "The title can have up to 120 characters!");
    } else {
      return new NoConstraintViolation();
    }
  }

  //  set the releaseDate but first validating the data
  get releaseDate() {
    return this._releaseDate;
  }
  set releaseDate( rD) {
    const validationResult = Movie.checkReleaseDate( rD);
    if (validationResult instanceof NoConstraintViolation) {
      this._releaseDate = rD;
    } else {
      throw validationResult;
    }
  }
  static checkReleaseDate( newDateString) {
    const newDate = new Date(newDateString);
    const baseDate = new Date("1895-12-28");
  
    if (!newDateString) {
      return new MandatoryValueConstraintViolation("The movie needs a release Date!");
    } else if (typeof(newDateString) !== "string") {
      return new RangeConstraintViolation(
          "The release date must be a real date in the form YYYY-MM-DD!");
    } else if (newDateString.trim() === "") {
      return new MandatoryValueConstraintViolation("The movie needs a release Date!");
    } else if (isNaN(newDate) || !/\b\d{4}-\d{2}-\d{2}\b/.test(newDateString)) {
      return new RangeConstraintViolation(
          "The release date must be a real date in the form YYYY-MM-DD!");
    } else if (newDate.getTime() < baseDate.getTime()) {
      return new IntervalConstraintViolation(
        "A date must be 1895-12-28 or later!");
    } else {
      return new NoConstraintViolation();
    }
  }

  get actors() {
    return this._actors;
  }
  set actors( a) {
    // delete all actors
    if (this.actors) {
      for (const actorId of Object.keys( this.actors)) {
        delete this._actors[actorId].playedMovies[movieId];
      }
    }
    this._actors = {};
    
    // refill list of actors
    if (Array.isArray(a)) {  // array of IdRefs
      for (const idRef of a) {
        this.addActor( idRef);
      }
    } else {  // map of IdRefs to object references
      for (const idRef of Object.keys( a)) {
        this.addActor( a[idRef]);
      }
    }
  }
  static checkActor( actor_id) {
    if (!actor_id) {
      // actor(s) are optional
      return new NoConstraintViolation();
    } else {
      // invoke foreign key constraint check
      return Person.checkPersonIdAsIdRef( actor_id, Actor);
    }
  }
  addActor( actor) {
    // a can be an ID reference or an object reference
    const actor_id = (typeof actor !== "object") ? parseInt(actor) : actor.personId;
    const validationResult = Movie.checkActor( actor_id);
    if (actor_id && validationResult instanceof NoConstraintViolation) {
      // add the new actor reference
      const key = String( actor_id);
      /*console.log("test1 ",actor);
      console.log("test2 ",this._actors);
      console.log("test3 ",Actor.instances);*/
      this._actors[key] = Actor.instances[key];
      //console.log("test4 ",this._actors);
      // automatically add the derived inverse reference
      this._actors[key].playedMovies[this._movieId] = this;
    } else {
      throw validationResult;
    }
  }
  removeActor( actor) {
    // a can be an ID reference or an object reference
    const actor_id = (typeof actor !== "object") ? parseInt( actor) : actor.personId;
    const validationResult = Movie.checkActor( actor_id);
    if (validationResult instanceof NoConstraintViolation) {
      // automatically delete the derived inverse reference
      delete this._actors[actor_id].playedMovies[this._movieId];
      // delete the actor reference
      delete this._actors[actor_id];
    } else {
      throw validationResult;
    }
  }

  get director() {
    return this._director;
  }
  set director( d) {
    // d can be an ID reference or an object reference 
    const director_id = (typeof d !==  "object") ? d : d.personId;
    const validationResult = Movie.checkDirector( director_id);
    if (validationResult instanceof NoConstraintViolation) {
      if (this._director) {
        // delete the inverse reference in Director::directedMovies
        delete this._director.directedMovies[ this._movieId];
      }
      // create the new director reference
      this._director = Director.instances[ director_id];
      // add the new inverse reference to Director::directedMovies
      this._director.directedMovies[ this._movieId] = this;
    } else {
      throw validationResult;
    }
  }
  static checkDirector( director_id) {
    if (!director_id) {
      return new MandatoryValueConstraintViolation(
        "A director must be chosen from the list!");
    } else {
      // invoke foreign key constraint check
      return Person.checkPersonIdAsIdRef( director_id, Director);
    }
  }

  get category() {
    return this._category;
  }
  set category( c) {
    var validationResult = null;
    if (this.category) {
      validationResult = new FrozenValueConstraintViolation(
        "The category cannot be changed!");
    } else {
      validationResult = Movie.checkCategory( c);
    }
    if (validationResult instanceof NoConstraintViolation) {
      this._category = parseInt( c);
    } else {
      throw validationResult;
    }
  }
  static checkCategory( type) {
    if (type === undefined || type === "") {
      return new NoConstraintViolation();
    } else if (!isIntegerOrIntegerString(type) || parseInt(type) < 1 ||
        parseInt(type) > MovieCategoryEL.MAX) {
      return new RangeConstraintViolation(
          "Invalid value for category: " + type);
    } else {
      return new NoConstraintViolation();
    }
  }
  
  get about() {
    return this._about;
  }
  set about( a) {
    // d can be an ID reference or an object reference 
    const about_id = (typeof a !==  "object") ? a : a.personId;
    const validationResult = Movie.checkAbout( about_id, this.category);
    if (validationResult instanceof NoConstraintViolation) {
      this._about = Person.instances[ about_id];
    } else {
      throw validationResult;
    }
  }
  static checkAbout( about_id, cat) {
    if (cat === MovieCategoryEL.BIOGRAPHY && !about_id) {
      return new MandatoryValueConstraintViolation(
        "A person must be provided for a biography!");
    } else if (cat !== MovieCategoryEL.BIOGRAPHY && about_id) {
      return new ConstraintViolation("About should be empty " +
          "if the movie is not a biography!");
    } else {
      // invoke foreign key constraint check
      return Person.checkPersonIdAsIdRef( about_id, Person);
    }
  }
  
  get tvSeriesName() {
    return this._tvSeriesName;
  }
  set tvSeriesName( t) {
    const validationResult = Movie.checkTvSeriesName( t, this.category);
    if (validationResult instanceof NoConstraintViolation) {
      this._tvSeriesName = t;
    } else {
      throw validationResult;
    }
  }
  static checkTvSeriesName( name, cat) {
    if (cat === MovieCategoryEL.TVSERIESEPISODE && !name) {
      return new MandatoryValueConstraintViolation(
        "A TV series must have a name!");
    } else if (cat !== MovieCategoryEL.TVSERIESEPISODE && name) {
      return new ConstraintViolation("A series name should be empty " +
          "if the movie is not a TV series episode!");
    } else if (name && (typeof(name) !== "string" || name.trim() === "")) {
      return new RangeConstraintViolation(
          "The series name must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  }
  
  get episodeNo() {
    return this._episodeNo;
  }
  set episodeNo( e) {
    const validationResult = Movie.checkEpisodeNo( e, this.category);
    if (validationResult instanceof NoConstraintViolation) {
      this._episodeNo = e;
    } else {
      throw validationResult;
    }
  }
  static checkEpisodeNo( number, cat) {
    if (cat === MovieCategoryEL.TVSERIESEPISODE && !number) {
      return new MandatoryValueConstraintViolation(
        "A TV series must have a episode number!");
    } else if (cat !== MovieCategoryEL.TVSERIESEPISODE && number) {
      return new ConstraintViolation("A series episode number should be empty " +
          "if the movie is not a TV series episode!");
    } else if (number && !Number.isInteger( parseInt(number))) {
      return new RangeConstraintViolation(
          "The series episode number must be a positiv integer!");
    } else {
      return new NoConstraintViolation();
    }
  }

  toString() {
    var moviesStr = `Movie{ MovieID: ${this.movieId}, Title: ${this.title},` +
    `ReleaseDate: ${this.releaseDate}, Director: ${this.director.toString()} }, `;
    moviesStr += `Actors: `;
    for (const actorId of Object.keys( this.actors)) {
      moviesStr += this.actors[actorId].toString();
      moviesStr += ", ";
    }
    switch (this.category) {
      case MovieCategoryEL.BIOHRAPHY:
        moviesStr += `, biography about: ${this.about.toString()}`;
        break;
      case MovieCategoryEL.TVSERIESEPISODE:
        moviesStr += `, series episode from ${this.tvSeriesName} episode ${this.episodeNo}`;
        break;
    }
    return moviesStr + `}`;
  }
}

Movie.instances = {};

Movie.add = function (slots) {
  try {
    const movie = new Movie( slots);
    // add movie to the Movie.instances collection
    Movie.instances[slots.movieId] = movie;
    console.log(`Movie ${slots.movieId} created!`);
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
  }
}

// Load the movie table from Local Storage
Movie.retrieveAll = function () {
  var movies = {};
  try {
    if (!localStorage["movies"]) localStorage["movies"] = "{}";
    else {
      movies = JSON.parse( localStorage["movies"]);
      console.log(`${Object.keys( movies).length} movies loaded.`);
    }
  } catch (e) {
    alert("Error when reading from Local Storage\n" + e);
  }
  for (const movieId of Object.keys( movies)) {
    try {
      Movie.instances[movieId] = new Movie( movies[movieId]);
    } catch (e) {
      console.log(`${e.constructor.name} while deserializing movie ${movieId}: ${e.message}`);
    }
  }
  //console.log(Movie.instances);
};

//  Update an existing movie row
Movie.update = function ({movieId, title, releaseDate, director_id,
  actorIdRefsToAdd, actorIdRefsToRemove, category, about_id, tvSeriesName,
  episodeNo}) {
  var noConstraintViolated = true,
      updatedProperties = [];
  const movie = Movie.instances[movieId], 
      objectBeforeUpdate = cloneObject( movie);
  try {
    if (title && movie.title !== title) {
      movie.title = title;
      updatedProperties.push("title");
    }
    if (releaseDate && movie.releaseDate !== releaseDate) {
      movie.releaseDate = releaseDate;
      updatedProperties.push("releaseDate");
    }
    if (actorIdRefsToAdd) {
      updatedProperties.push("actors(added)");
      for (const actorIdRef of actorIdRefsToAdd) {
        movie.addActor( actorIdRef);
      }
    }
    if (actorIdRefsToRemove) {
      updatedProperties.push("actors(removed)");
      for (const actor_id of actorIdRefsToRemove) {
        movie.removeActor( actor_id);
      }
    }
    const dir_id = parseInt(director_id)
    if (dir_id && movie.director.personId !== dir_id) {
      movie.director = dir_id;
      updatedProperties.push("director_id");
    }
    if (category && movie.category !== category) {
      movie.category = category;
      updatedProperties.push("category");
    } else if (category === "" && "category" in movie) {
      throw FrozenValueConstraintViolation(
          "The movie category cannot be unset!");
    }
    const ab_id = parseInt(about_id);
    if (ab_id && movie.about.personId !== ab_id) {
      movie.about = ab_id;
      updatedProperties.push("about");
    }
    if (tvSeriesName && movie.tvSeriesName !== tvSeriesName) {
      movie.tvSeriesName = tvSeriesName;
      updatedProperties.push("tvSeriesName");
    }
    if (episodeNo && movie.episodeNo !== episodeNo) {
      movie.episodeNo = episodeNo;
      updatedProperties.push("episodeNo");
    }
  } catch (e) {
    console.log( e.constructor.name +": "+ e.message);
    noConstraintViolated = false;
    // restore object to its state before updating
    Movie.instances[movieId] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      let ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log(`Propert${ending} ${updatedProperties.toString()}` + 
          ` modified for movie ${movieId}`);
    } else {
      console.log(`No property value changed for movie ${movieId}!`);
    }
  }
};

//  Delete a movie row from persistent storage
Movie.destroy = function (movieId) {
  const movie = Movie.instances[movieId];
  if (movie) {
    console.log( movie.title + " deleted!");
    // remove inverse reference from movie.director
    delete movie.director.directedMovies[movieId];
    // remove inverse references from all movie.actors
    for (const actorId of Object.keys( movie.actors)) {
      delete movie.actors[actorId].playedMovies[movieId];
    }
    delete Movie.instances[movieId];
  } else {
    console.log(`There is no movie with MovieID ${movieId} in the database!`);
  }
};

//  Save all movie objects to Local Storage
Movie.saveAll = function () {
  const nmrOfMovies = Object.keys( Movie.instances).length;
  try {
    var moviesString = JSON.stringify( Movie.instances);
    moviesString = moviesString.replace(/"_/g,'"');
    localStorage["movies"] = moviesString;
    console.log(`${nmrOfMovies} movies saved.`);
  } catch (e) {
    alert("Error when writing to Local Storage\n" + e);
  }
};