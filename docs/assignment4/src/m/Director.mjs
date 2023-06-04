import Person from "./Person.mjs";
import { cloneObject } from "../../lib/util.mjs";

/**
 * The class Director
 * @class
 */
export default class Director extends Person {
 
  constructor ({personId, name}) {
    
    super({personId, name});
    
    this._directedMovies = {}; 
  }

  get directedMovies() {
    return this._directedMovies;
  }
}
/****************************************************
*** Class-level ("static") properties ***************
*****************************************************/

Director.instances = {};
Person.subtypes.push( Director); 

/**********************************************************
 ***  Class-level ("static") storage management methods ***
 **********************************************************/

Director.add = function (slots) {
  try {
    const director = new Director( slots);
    Director.instances[director.personId] = director;
    console.log(`Saved: ${director.name}`);
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
  }
};

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