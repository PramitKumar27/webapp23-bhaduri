import Person from "./Person.mjs";
import { isNonEmptyString, cloneObject, isIntegerOrIntegerString } from "../../lib/util.mjs";
import { NoConstraintViolation, 
    MandatoryValueConstraintViolation, 
    RangeConstraintViolation,
    UniquenessConstraintViolation,
    StringLenghtConstrainViolation } from "../../lib/errorTypes.mjs";

export default class Movie {
  // using a record parameter with ES6 function parameter destructuring
  constructor ({movieId, title, releaseDate, director, director_id,
                 actors, actorIdRefs}) {
    this.movieId = movieId;      // number (int)
    this.title = title;       // string
    this.releaseDate = releaseDate;  // string
    // assign object references or ID references (to be converted in setter)
    this.actors = actors || actorIdRefs;
    this.director = director || director_id;
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
      return new StringLenghtConstrainViolation(
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
  
    if (newDateString === undefined) {
      return new NoConstraintViolation();
    } else if (typeof(newDateString) !== "string") {
      return new RangeConstraintViolation(
          "The release date must be a real date in the form YYYY-MM-DD!");
    } else if (newDateString.trim() === "") {
      return new NoConstraintViolation();
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
    this._actors = {};
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
      return Person.checkPersonIdAsIdRef( actor_id);
    }
  }
  addActor( actor) {
    // a can be an ID reference or an object reference
    const actor_id = (typeof actor !== "object") ? parseInt( actor) : actor.personId;
    if (actor_id) {
      const validationResult = Movie.checkActor( actor_id);
      if (actor_id && validationResult instanceof NoConstraintViolation) {
        // add the new author reference
        const key = String( actor_id);
        this._actors[key] = Person.instances[key];
      } else {
        throw validationResult;
      }
    }
  }
  removeActor( actor) {
    // a can be an ID reference or an object reference
    const actor_id = (typeof actor !== "object") ? parseInt( actor) : actor.personId;
    if (actor_id) {
      const validationResult = Movie.checkActor( actor_id);
      if (validationResult instanceof NoConstraintViolation) {
        // delete the author reference
        delete this._actors[String( actor_id)];
      } else {
        throw validationResult;
      }
    }
  }

  get director() {
    return this._director;
  }
  set director( d) {
    // p can be an ID reference or an object reference 
    const director_id = (typeof d !==  "object") ? d : d.personId;
    const validationResult = Movie.checkDirector( director_id);
    if (validationResult instanceof NoConstraintViolation) {
      // create the new director reference
      this._director = Person.instances[ director_id];
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
      return Person.checkPersonIdAsIdRef( director_id);
    }
  }

  toString() {
    return `Movie{ MovieID: ${this.movieId}, Title: ${this.title},
    MovieRating: ${this.rating},
    Genres: ${this.genres.toString()} }`;
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
};

//  Update an existing movie row
Movie.update = function ({movieId, title, releaseDate, director_id,
  actorIdRefsToAdd, actorIdRefsToRemove}) {
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
      // releaseDate has a non-empty value that is new
      movie.releaseDate = releaseDate;
      updatedProperties.push("releaseDate");
    } else if (!releaseDate && movie.releaseDate !== undefined) {
      // releaseDate has a empty value that is new
      delete movie.releaseDate;  // unset the property "releaseDate"
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
    if (director_id && movie.director_id !== director_id) {
      movie.director_id = director_id;
      updatedProperties.push("director_id");
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
  if (Movie.instances[movieId]) {
    console.log(`Movie ${movieId} deleted`);
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