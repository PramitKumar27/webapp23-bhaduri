import Person from "./Person.mjs";
import Movie from "./Movie.mjs";
import { NoConstraintViolation } from "../../lib/errorTypes.mjs";
import { cloneObject } from "../../lib/util.mjs";

/**
 * The class Actor
 * @class
 */
export default class Actor extends Person {
  // using a single record parameter with ES6 function parameter destructuring
  constructor ({personId, name, agent, agent_id}) {
    // call constructor of superclass
    super({personId, name});
    // derived inverse reference property (inverse of Movie::actors)
    this._playedMovies = {};   // initialize as an empty map
    if (agent || agent_id) this.agent = agent || agent_id;
  }

  get playedMovies() {
    return this._playedMovies;
  }

  get agent() {
    return this._agent;
  }
  set agent( a) {
    // d can be an ID reference or an object reference 
    const agent_id = (typeof a !==  "object") ? a : a.personId;
    const validationResult = Actor.checkAgent( agent_id);
    if (validationResult instanceof NoConstraintViolation) {
      this._agent = Person.instances[ agent_id];
    } else {
      throw validationResult;
    }
  }
  static checkAgent( agent_id) {
    if (!agent_id) {
      // an agent is optional
      return new NoConstraintViolation();
    } else {
      // invoke foreign key constraint check
      return Person.checkPersonIdAsIdRef( agent_id, Person);
    }
  }

  toString() {
    var actorStr = `Person{ person ID: ${this.personId}, name: ${this.name}`;
    if (this.agent) {
      actorStr += ` agent: ${this.agent.toString()}`;
    }
    return actorStr + ` }`;
  }
}

/****************************************************
*** Class-level ("static") properties ***************
*****************************************************/
// initially an empty collection (in the form of a map)
Actor.instances = {};
Person.subtypes.push( Actor);

/**********************************************************
 ***  Class-level ("static") storage management methods ***
 **********************************************************/
/**
 *  Create a new actor record/object
 */
Actor.add = function (slots) {
  try {
    const actor = new Actor( slots);
    Actor.instances[actor.personId] = actor;
    console.log(`Saved: ${actor.name}`);
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
  }
};
/**
 *  Update an existing actor record/object
 */
Actor.update = function ({personId, name, agent_id}) {
  const actor = Actor.instances[personId],
        objectBeforeUpdate = cloneObject( actor);
  var noConstraintViolated=true, ending="", updatedProperties=[];
  try {
    if (name && actor.name !== name) {
      actor.name = name;
      updatedProperties.push("name");
    }
    const act_id = parseInt(agent_id);
    if (actor.agent) {
      if (act_id && actor.agent.personId !== act_id) {
        // agent has a non-empty value that is new
        actor.agent = agent_id;
        updatedProperties.push("agent");
      } else if (!agent_id && actor.agent !== undefined) {
        // agent has a empty value that is new
        delete actor._agent;  // unset the property "agent"
        updatedProperties.push("agent");
      }
    } else if (act_id) {
      // actor has no agent, but gets now one
      actor.agent = agent_id;
      updatedProperties.push("agent");
    }
  } catch (e) {
    console.log( `${e.constructor.name}: ${e.message}`);
    noConstraintViolated = false;
    // restore object to its state before updating
    Actor.instances[personId] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log( `Propert${ending} ${updatedProperties.toString()} modified for actor ${name}`);
    } else {
      console.log( `No property value changed for actor ${name}!`);
    }
  }
};
/**
 *  Delete an actor object/record
 *  Since the movie-actor association is unidirectional, a linear search on all
 *  movies is required for being able to delete the actor from the movies' actors.
 */
Actor.destroy = function (personId) {
  const person = Actor.instances[personId];
  // delete all dependent movie records
  for (const movieId of Object.keys( Movie.instances)) {
    const movie = Movie.instances[movieId];
    if (personId in movie.actors) delete movie.actors[personId];
  }
  // delete the actor object
  delete Actor.instances[personId];
  console.log( `Person ${person.name} deleted.`);
};
/**
 *  Load all actor records and convert them to objects
 */
Actor.retrieveAll = function () {
  var actors = {};
  if (!localStorage["actors"]) localStorage["actors"] = "{}";
  try {
    actors = JSON.parse( localStorage["actors"]);
  } catch (e) {
    console.log( "Error when reading from Local Storage\n" + e);
    actors = {};
  }
  for (const key of Object.keys( actors)) {
    try {
      // convert record to (typed) object
      Actor.instances[key] = new Actor( actors[key]);
      Person.instances[key] = Actor.instances[key];
    } catch (e) {
      console.log( `${e.constructor.name} while deserializing actor ${key}: ${e.message}`);
    }
  }
  console.log( `${Object.keys( actors).length} actor records loaded.`);
};
/**
 *  Save all actor objects as records
 */
Actor.saveAll = function () {
  const nmrOfActors = Object.keys( Actor.instances).length;
  try {
    localStorage["actors"] = JSON.stringify( Actor.instances);
    console.log( `${nmrOfActors} actor records saved.`);
  } catch (e) {
    alert( "Error when writing to Local Storage\n" + e);
  }
};