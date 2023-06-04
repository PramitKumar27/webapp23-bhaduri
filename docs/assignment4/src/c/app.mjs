import Person from "../m/Person.mjs";
import Movie from "../m/Movie.mjs";
import Actor from "../m/Actor.mjs";
import Director from "../m/Director.mjs";
import { MovieCategoryEL} from "../../lib/Enumeration.mjs";

//  Create and save test data
function createTestData() {
  try {
    Director.instances["1"] = new Director({personId: 1, name: "Stephen Frears"});
    Director.instances["2"] = new Director({personId: 2, name: "George Lucas"});
    Director.instances["3"] = new Director({personId: 3, name: "Quentin Tarantino"});
    Director.instances["9"] = new Director({personId: 9, name: "Russell Crowe"});
    Director.instances["13"] = new Director({personId: 13, name: "Marc Forster"});
    Director.saveAll();
    Person.instances["14"] = new Person({personId: 14, name: "John Forbes Nash"});
    Person.instances["15"] = new Person({personId: 15, name: "John Doe"});
    Person.instances["16"] = new Person({personId: 16, name: "Jane Doe"});
    Person.saveAll();
    Actor.instances["3"] = new Actor({personId: 3, name: "Quentin Tarantino"});
    Actor.instances["4"] = new Actor({personId: 4, name: "Uma Thurman", agent: 15});
    Actor.instances["5"] = new Actor({personId: 5, name: "John Travolta"});
    Actor.instances["6"] = new Actor({personId: 6, name: "Ewan McGregor"});
    Actor.instances["7"] = new Actor({personId: 7, name: "Natalie Portman"});
    Actor.instances["8"] = new Actor({personId: 8, name: "Keanu Reeves", agent: 16});
    Actor.instances["9"] = new Actor({personId: 9, name: "Russell Crowe", agent: 16});
    Actor.instances["10"] = new Actor({personId: 10, name: "Seth MacFarlane"});
    Actor.instances["11"] = new Actor({personId: 11, name: "Naomi Watts"});
    Actor.instances["12"] = new Actor({personId: 12, name: "Ed Harris", agent: 15});
    Actor.saveAll();
    Movie.instances["1"] = new Movie({movieId: 1, title:"Pulp Fiction",
        releaseDate:"1994-05-12", director: 3, actors:[3, 4, 5]});
    Movie.instances["2"] = new Movie({movieId: 2, title:"Star Wars",
        releaseDate:"1999-08-19", director: 2, actors:[6, 7]});
    Movie.instances["3"] = new Movie({movieId: 3, title:"Dangerous Liaisons",
        releaseDate:"1988-12-16", director: 1, actors:[8, 4]});
    Movie.instances["4"] = new Movie({movieId: 4, title:"2015",
        releaseDate:"2019-06-30", director: 1, actors:[9, 10, 11], 
        category: MovieCategoryEL.TVSERIESEPISODE, tvSeriesName: "The Loudest Voice",
        episodeNo: 6});
    Movie.instances["5"] = new Movie({movieId: 5, title:"A Beautiful Mind",
        releaseDate:"2001-12-21", director: 9, actors:[9, 12], 
        category: MovieCategoryEL.BIOGRAPHY, about: 14});
    Movie.instances["6"] = new Movie({movieId: 6, title:"Stay",
        releaseDate:"2005-09-24", director: 13, actors:[6, 11]});
    Movie.saveAll();
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
  }
};

//  Clear data
function clearData() {
  if (confirm("Do you really want to delete all movie data?")) {
    try {
      Movie.instances = {};
      localStorage["movies"] = "{}";
      Person.instances = {};
      localStorage["persons"] = "{}";
      Actor.instances = {};
      localStorage["actors"] = "{}";
      Director.instances = {};
      localStorage["directors"] = "{}";
      console.log("All data cleared.");
    } catch (error) {
      console.log( `${e.constructor.name}: ${e.message}`);
    }
  }
};

export { createTestData, clearData };