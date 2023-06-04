import Person from "./Person.mjs";
import { cloneObject } from "../../lib/util.mjs";

/**
 * The class Director
 * @class
 */
export default class Director extends Person {
  // using a single record parameter with ES6 function parameter destructuring
  constructor ({personId, name}) {
    // call constructor of superclass
    super({personId, name});
    // derived inverse reference property (inverse of Movie::director)
    this._directedMovies = {}; // initialize as an empty map
  }

  get directedMovies() {
    return this._directedMovies;
  }
}
/****************************************************
*** Class-level ("static") properties ***************
*****************************************************/
// initially an empty collection (in the form of a map)
Director.instances = {};
Person.subtypes.push( Director); 

/**********************************************************
 ***  Class-level ("static") storage management methods ***
 **********************************************************/
/**
 *  Create a new director record/object
 */
Director.add = function (slots) {
  try {
    const director = new Director( slots);
    Director.instances[director.personId] = director;
    console.log(`Saved: ${director.name}`);
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
  }
};
/**
 *  Update an existing director record/object
 */
Director.update = function ({personId, name}) {
  const director = Director.instances[personId],
        objectBeforeUpdate = cloneObject( director);
  var noConstraintViolated=true, ending="", updatedProperties=[];
  try {
    if (name && director.name !== name) {
      director.name = name;
      updatedProperties.push("name");
    }
  } catch (e) {
    console.log( `${e.constructor.name}: ${e.message}`);
    noConstraintViolated = false;
    // restore object to its state before updating
    Director.instances[personId] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log( `Propert${ending} ${updatedProperties.toString()} modified for person ${name}`);
    } else {
      console.log( `No property value changed for person ${name}!`);
    }
  }
};
/**
 *  Delete an director object/record
 */
Director.destroy = function (personId) {
  const person = Director.instances[personId];
  // delete the director object
  delete Director.instances[personId];
  console.log( `Director ${person.name} deleted.`);
};

/**
 *  Load all director records and convert them to objects
 */
Director.retrieveAll = function () {
  var directors = {};
  if (!localStorage["directors"]) localStorage["directors"] = "{}";
  try {
    directors = JSON.parse( localStorage["directors"]);
  } catch (e) {
    console.log( "Error when reading from Local Storage\n" + e);
    directors = {};
  }
  for (const key of Object.keys( directors)) {
    try {
      // convert record to (typed) object
      Director.instances[key] = new Director( directors[key]);
      Person.instances[key] = Director.instances[key];
    } catch (e) {
      console.log( `${e.constructor.name} while deserializing director ${key}: ${e.message}`);
    }
  }
  console.log( `${Object.keys( directors).length} director records loaded.`);
};
/**
 *  Save all director objects as records
 */
Director.saveAll = function () {
  const nmrOfDirectors = Object.keys( Director.instances).length;
  try {
    localStorage["directors"] = JSON.stringify( Director.instances);
    console.log( `${nmrOfDirectors} director records saved.`);
  } catch (e) {
    alert( "Error when writing to Local Storage\n" + e);
  }
};