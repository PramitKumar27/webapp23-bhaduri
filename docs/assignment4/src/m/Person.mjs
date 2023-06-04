import { cloneObject, isNonEmptyString } from "../../lib/util.mjs";
import { NoConstraintViolation, 
  MandatoryValueConstraintViolation, 
  RangeConstraintViolation,
  UniquenessConstraintViolation,
  StringLengthConstraintViolation,
  ReferentialIntegrityConstraintViolation } from "../../lib/errorTypes.mjs";

/**
 * The class Person
 * @class
 */
export default class Person {
  constructor ({personId, name}) {
    this.personId = personId;  
    this.name = name;          
  }
  get personId() {
    return this._personId;
  }
  set personId( id) {
    const constraintViolation = Person.checkPersonIdAsId( id, this.constructor);
    if (constraintViolation instanceof NoConstraintViolation) {
      this._personId = parseInt( id);
    } else {
      throw constraintViolation;
    }
  }
  static checkPersonId( id) {
    if (!id) {
      return new NoConstraintViolation();  
    } else {
      id = parseInt( id);  
      if (isNaN( id) || !Number.isInteger( id) || id < 1) {
        console.log(id);
        console.log(typeof id);
        return new RangeConstraintViolation("The person ID must be a positive integer!");
      } else {
        return new NoConstraintViolation();
      }
    }
  }
  static checkPersonIdAsId( id, DirectType) {
    if (!DirectType) DirectType = Person;  
    var constraintViolation = Person.checkPersonId(id);
    if ((constraintViolation instanceof NoConstraintViolation)) {
      
      id = parseInt(id);
      if (isNaN(id)) {
        return new MandatoryValueConstraintViolation(
            "A positive integer value for the person ID is required!");
      } else if (DirectType.instances[String(id)]) {  
        constraintViolation = new UniquenessConstraintViolation(
            `There is already a ${DirectType.name} record with this person ID!`);
      } else {
        constraintViolation = new NoConstraintViolation();
      }
    }
    return constraintViolation;
  }
  static checkPersonIdAsIdRef( id, Type) {
    if (!Type) Type = Person;  
    var constraintViolation = Person.checkPersonId( id);
    if ((constraintViolation instanceof NoConstraintViolation) && id) {
      if (!Type.instances[String(id)]) {
        constraintViolation = new ReferentialIntegrityConstraintViolation(
            `There is no ${Type.name} record with this person ID!`);
      }
    }
    return constraintViolation;
  }
  
  get name() {
    return this._name;
  }
  set name( n) {
    const validationResult = Person.checkName( n);
    if (validationResult instanceof NoConstraintViolation) {
      this._name = n;
    } else {
      throw validationResult;
    }
  }
  static checkName( name) {
    if (!name) {
      
      return new MandatoryValueConstraintViolation(
        "A name for the person must be provided!");
    } else if (!isNonEmptyString(name)) {
      return new RangeConstraintViolation(
          "The title must be a non-empty string!");
    } else if (name.trim().length > 120) {
      return new StringLengthConstraintViolation(
          "The title can have up to 120 characters!");
    } else {
      return new NoConstraintViolation();
    }
  }

  toString() {
    return `Person{ person ID: ${this.personId}, name: ${this.name} }`;
  }

  toJSON() {  
    var rec = {};
    for (const p of Object.keys( this)) {
      
      if (p.charAt(0) === "_" && p !== "_directedMovies" && p !== "_playedMovies") {
      
        rec[p.substr(1)] = this[p];
      }
    }
    return rec;
  }
}
/****************************************************
*** Class-level ("static") properties ***************
*****************************************************/

Person.instances = {};

Person.subtypes = [];  

/**********************************************************
 ***  Class-level ("static") storage management methods ***
 **********************************************************/

Person.add = function (slots) {
  try {
    const person = new Person( slots);
    Person.instances[person.personId] = person;
    console.log(`Saved: ${person.name}`);
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
  }
};

Person.update = function ({personId, name}) {
  const person = Person.instances[String( personId)],
        objectBeforeUpdate = cloneObject( person);
  var noConstraintViolated=true, ending="", updatedProperties=[];
  try {
    if (name && person.name !== name) {
      person.name = name;
      updatedProperties.push("name");
    }
  } catch (e) {
    console.log( `${e.constructor.name}: ${e.message}`);
    noConstraintViolated = false
    Person.instances[personId] = objectBeforeUpdate;
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
 *  Delete an person object/record
 */
Person.destroy = function (personId) {
  const person = Person.instances[personId];
  delete Person.instances[personId];
  console.log( `Person ${person.name} deleted.`);
};

Person.retrieveAll = function () {
  var persons = {};
  if (!localStorage["persons"]) localStorage["persons"] = "{}";
  try {
    persons = JSON.parse( localStorage["persons"]);
  } catch (e) {
    console.log( "Error when reading from Local Storage\n" + e);
    persons = {};
  }
  for (const key of Object.keys( persons)) {
    try {
      Person.instances[key] = new Person( persons[key]);
    } catch (e) {
      console.log( `${e.constructor.name} while deserializing person ${key}: ${e.message}`);
    }
  }
  for (const Subtype of Person.subtypes) {
    Subtype.retrieveAll();

  }
  console.log( `${Object.keys( persons).length} person records loaded.`);
};

Person.saveAll = function () {
  const nmrOfPersons = Object.keys( Person.instances).length;
  try {
    localStorage["persons"] = JSON.stringify( Person.instances);
    console.log( `${nmrOfPersons} person records saved.`);
  } catch (e) {
    alert( "Error when writing to Local Storage\n" + e);
  }
};