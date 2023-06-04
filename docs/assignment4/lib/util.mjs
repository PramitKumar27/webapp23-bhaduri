/**
 * Fill a Choice Set element with items
 *
 * @param {object} listEl  A list element
 * @param {object} selection  An entity table (map of objects)
 * @param {string} keyProp  The standard ID property of the entity table
 * @param {string} displayProp  A text property of the entity table
 */
function fillSelectedItemsList( listEl, selection, keyProp, displayProp) {
  // delete old contents
  listEl.innerHTML = "";
  for (const objId of Object.keys( selection)) {
    const obj = selection[objId];
    addItemToListOfSelectedItems( listEl, obj[keyProp], obj[displayProp]);
  }
}

/**
 * Add an item to a list element showing selected objects
 *
 * @param {object} listEl  A list element
 * @param {string} stdId  A standard identifier of an object
 * @param {string} humanReadableId  A human-readable ID of the object
 * @param {string} classValue?  A class value to be assigned to the list item
 */
function addItemToListOfSelectedItems( listEl, stdId, humanReadableId, classValue) {
  var el=null;
  const listItemEl = document.createElement("li");
  listItemEl.setAttribute("data-value", stdId);
  el = document.createElement("span");
  el.textContent = humanReadableId;
  listItemEl.appendChild( el);
  el = createPushButton("✕");
  listItemEl.appendChild( el);
  if (classValue) listItemEl.classList.add( classValue);
  listEl.appendChild( listItemEl);
}

/**
 * Create a Push Button
 * @param {string} txt [optional]
 * @return {object}
 */
function createPushButton( txt) {
  var pB = document.createElement("button");
  pB.type = "button";
  if (txt) pB.textContent = txt;
  return pB;
}

/**
 * Create a DOM option element
 *
 * @param {string} val
 * @param {string} txt
 * @param {string} classValues [optional]
 *
 * @return {object}
 */
function createOption( val, txt, classValues) {
  var el = document.createElement("option");
  el.value = val;
  el.text = txt;
  if (classValues) el.className = classValues;
  return el;
}

/**
 * Create a list element from an map of objects
 *
 * @param {object} entityTbl  An entity table
 * @param {string} displayProp  The object property to be displayed in the list
 * @return {object}
 */
function createListFromMap( entityTbl, displayProp) {
  const listEl = document.createElement("ul");
  // delete old contents
  listEl.innerHTML = "";
  // create list items from object property values
  for (const key of Object.keys( entityTbl)) {
    const listItemEl = document.createElement("li");
    listItemEl.textContent = entityTbl[key][displayProp];
    listEl.appendChild( listItemEl);
  }
  return listEl;
}

function isNonEmptyString(x) {
  return typeof(x) === "string" && x.trim() !== "";
}

/**
 * Fill a select element with option elements created from a list or
 * map of objects
 *
 * @param {object} selectEl  A select(ion list) element
 * @param {object} selectionRange  A map of objects
 * @param {string} keyProp  The standard identifier property
 * @param {object} optPar [optional]  A record of optional parameter slots
 *                 including optPar.displayProp and optPar.selection
 */
function fillSelectWithOptions( selectEl, selectionRange, keyProp, optPar) {
  var optionEl = null, obj = null, displayProp = "";
  // delete old contents
  selectEl.innerHTML = "";
  // create "no selection yet" entry
  if (!selectEl.multiple) selectEl.add( createOption(""," --- "));
  // create option elements from object property values
  var options = Object.keys( selectionRange);
  for (let i=0; i < options.length; i++) {
    obj = selectionRange[options[i]];
    if (optPar && optPar.displayProp) displayProp = optPar.displayProp;
    else displayProp = keyProp;
    optionEl = createOption( obj[keyProp], obj[displayProp]);
    // if invoked with a selection argument, flag the selected options
    if (selectEl.multiple && optPar && optPar.selection &&
        optPar.selection[keyProp]) {
      // flag the option element with this value as selected
      optionEl.selected = true;
    }
    selectEl.add( optionEl);
  }
}

function fillSelectWithOptionsAndSelect( selectEl, selectionRange, keyProp,
            optPar, selectedOne, defaultOpt) {
  var optionEl = null, obj = null, displayProp = "";
  // delete old contents
  selectEl.innerHTML = "";
  // create "no selection yet" entry
  if (!defaultOpt) selectEl.add( createOption(""," --- "));
  // create option elements from object property values
  var options = Object.keys( selectionRange);
  for (let i=0; i < options.length; i++) {
    obj = selectionRange[options[i]];
    if (optPar && optPar.displayProp) displayProp = optPar.displayProp;
    else displayProp = keyProp;
    optionEl = createOption( obj[keyProp], obj[displayProp]);
    // if invoked with a selection argument, flag the selected options
    if (parseInt(options[i]) === selectedOne) {
      // flag the option element with this value as selected
      optionEl.selected = true;
    }
    selectEl.add( optionEl);
  }
}

function fill( selectEl, selectionRange) {
  // delete old contents
  selectEl.innerHTML = "";
  var optionEl = null, obj = null;
  selectEl.add( createOption(""," --- "));
  for (let i=0; i < selectionRange.length; i++) {
    obj = selectionRange[i];
    optionEl = createOption( i, obj);
    selectEl.add( optionEl);
  }
}

/**
 * Create a "clone" of an object that is an instance of a model class
 *
 * @param {object} obj
 */
function cloneObject(obj) {
  const clone = Object.create( Object.getPrototypeOf(obj));
  for (const p in obj) {
    if (obj.hasOwnProperty(p)) {
      const val = obj[p];
      if (typeof val === "number" ||
          typeof val === "string" ||
          typeof val === "boolean" ||
          val instanceof Date ||
          // typed object reference
          typeof val === "object" && !!val.constructor ||
          // list of data values
          Array.isArray(val) && !val.some( el => typeof el === "object") ||
          // list of typed object references
          Array.isArray(val) &&
          val.every( el => typeof el === "object" && !!el.constructor)
      ) {
        if (Array.isArray(val)) clone[p] = val.slice(0);
        else clone[p] = val;
      }
      // else clone[p] = cloneObject(val);
    }
  }
  return clone;
}

function isIntegerOrIntegerString(x) {
  return typeof(x) === "number" && x.toString().search(/^-?[0-9]+$/) == 0 ||
      typeof(x) === "string" && x.search(/^-?[0-9]+$/) == 0;
}

/**
 * Create the contents of a Multi-Selection widget, which is a div containing
 * 1) a list of selected items, where each item has a delete button,
 * 2) a div containing a select element and an add button allowing to add a selected item
 *    to the selected items list
 *
 * @param {object} widgetContainerEl  The widget's container div
 * @param {object} selection  An entity table (map of objects)
 *                 for populating the list of selected objects
 * @param {object} selectionRange  An entity table (map of objects)
 *                 for populating the selection list
 * @param {string} keyProp  The standard identifier property of the range object type
 * @param {string} displayProp? Defines the property to be shown in the selection list
 * @param {string} minCard? The minimum cardinality of the list of selected objects
 */
function createMultiSelectionWidget( widgetContainerEl, selection, selectionRange,
                                    keyProp, displayProp, minCard) {
  const selectedItemsListEl = document.createElement("ul"),  // shows the selected objects
        selectEl = document.createElement("select");
  var el=null;
  if (!minCard) minCard = 0;  // default
  widgetContainerEl.innerHTML = "";  // delete old contents
  if (!displayProp) displayProp = keyProp;
  fillSelectedItemsList( selectedItemsListEl, selection, keyProp, displayProp);
  // event handler for removing an item from the selection
  selectedItemsListEl.addEventListener( 'click', function (e) {
    if (e.target.tagName === "BUTTON") {  // delete/undo button
      const btnEl = e.target,
            listItemEl = btnEl.parentNode,
            listEl = listItemEl.parentNode;
      if (listEl.children.length <= minCard) {
        alert("A book must have at least one author!");
        return;
      }
      if (listItemEl.classList.contains("removed")) {
        // undoing a previous removal
        listItemEl.classList.remove("removed");
        // change button text
        btnEl.textContent = "✕";
      } else if (listItemEl.classList.contains("added")) {
        // removing a previously added item means moving it back to the selection range
        listItemEl.parentNode.removeChild( listItemEl);
        const optionEl = createOption( listItemEl.getAttribute("data-value"),
                           listItemEl.firstElementChild.textContent);
        selectEl.add( optionEl);
      } else {
        // removing an ordinary item
        listItemEl.classList.add("removed");
        // change button text
        btnEl.textContent = "undo";
      }
    }
  });
  widgetContainerEl.appendChild( selectedItemsListEl);
  el = document.createElement("div");
  el.appendChild( selectEl);
  el.appendChild( createPushButton("add"));
  // event handler for moving an item from the selection range list to the selected items list
  selectEl.parentNode.addEventListener( 'click', function (e) {
    if (e.target.tagName === "BUTTON") {  // the add button was clicked
      if (selectEl.value) {
        addItemToListOfSelectedItems( selectedItemsListEl, selectEl.value,
            selectEl.options[selectEl.selectedIndex].textContent, "added");
        selectEl.remove( selectEl.selectedIndex);
        selectEl.selectedIndex = 0;
      }
    }
  });
  widgetContainerEl.appendChild( el);
  // create select options from selectionRange minus selection
  fillMultiSelectionListWithOptions( selectEl, selectionRange, keyProp,
      {"displayProp": displayProp, "selection": selection});
}

/**
  * Create a choice control (radio button or checkbox) element
  * 
  * @param {string} t  The type of choice control ("radio" or "checkbox")
  * @param {string} n  The name of the choice control input element
  * @param {string} v  The value of the choice control input element
  * @param {string} lbl  The label text of the choice control
  * @return {object}
  */
function createLabeledChoiceControl(t,n,v,lbl) {
  var ccEl = document.createElement("input"),
      lblEl = document.createElement("label");
  ccEl.type = t;
  ccEl.name = n;
  ccEl.value = v;
  lblEl.appendChild( ccEl);
  lblEl.appendChild( document.createTextNode( lbl));
  return lblEl;
}

/**
 * Fill the select element of an Multiple Choice Widget with option elements created
 * from the selectionRange minus an optional selection set specified in optPar
 *
 * @param {object} selectEl  A select(ion list) element
 * @param {object} selectionRange  A map of objects
 * @param {string} keyProp  The standard identifier property
 * @param {object} optPar [optional]  An record of optional parameter slots
 *                 including optPar.displayProp and optPar.selection
 */
function fillMultiSelectionListWithOptions( selectEl, selectionRange, keyProp, optPar) {
  var options = [], obj = null, displayProp = "";
  // delete old contents
  selectEl.innerHTML = "";
  // create "no selection yet" entry
  selectEl.add( createOption(""," --- "));
  // create option elements from object property values
  options = Object.keys( selectionRange);
  for (const i of options.keys()) {
    // if invoked with a selection argument, only add options for objects
    // that are not yet selected
    if (!optPar || !optPar.selection || !optPar.selection[options[i]]) {
      obj = selectionRange[options[i]];
      if (optPar && optPar.displayProp) displayProp = optPar.displayProp;
      else displayProp = keyProp;
      selectEl.add( createOption( obj[keyProp], obj[displayProp]));
    }
  }
}

/**
 * Create a choice widget in a given fieldset element.
 * A choice element is either an HTML radio button or an HTML checkbox.
 * @method 
 */
function createChoiceWidget(containerEl, fld, values, 
    choiceWidgetType, choiceItems, isMandatory) {
  const choiceControls = containerEl.querySelectorAll("label");
  // remove old content
  for (let j=0; j < choiceControls.length; j++) {
    containerEl.removeChild( choiceControls[j]);
  }
  if (!containerEl.hasAttribute("data-bind")) {
    containerEl.setAttribute("data-bind", fld);
  }
// for a mandatory radio button group initialze to first value
  if (choiceWidgetType === "radio" && isMandatory && values.length === 0) {
  values[0] = 1;
  }
  if (values.length >= 1) {
    if (choiceWidgetType === "radio") {
      containerEl.setAttribute("data-value", values[0]);      
    } else {  // checkboxes
      containerEl.setAttribute("data-value", "["+ values.join() +"]");            
    }
  }
  for (let j=0; j < choiceItems.length; j++) {
    // button values = 1..n
    const el = createLabeledChoiceControl( choiceWidgetType, fld,
        j+1, choiceItems[j]);
    // mark the radio button or checkbox as selected/checked
    if (values.includes(j+1)) el.firstElementChild.checked = true;
    containerEl.appendChild( el);
    el.firstElementChild.addEventListener("click", function (e) {
      const btnEl = e.target;
      if (choiceWidgetType === "radio") {
        if (containerEl.getAttribute("data-value") !== btnEl.value) {
          containerEl.setAttribute("data-value", btnEl.value);
        } else if (!isMandatory) {
          // turn off radio button
          btnEl.checked = false;
          containerEl.setAttribute("data-value", "");
        }
      } else {  // checkbox
        let values = JSON.parse( containerEl.getAttribute("data-value")) || [];
        let i = values.indexOf( parseInt( btnEl.value));
        if (i > -1) {   
          values.splice(i, 1);  // delete from value list
        } else {  // add to value list 
          values.push( btnEl.value);
        }
        containerEl.setAttribute("data-value", "["+ values.join() +"]");            
      }
    });
  }
  return containerEl;
}

export { isNonEmptyString, fillSelectWithOptions, cloneObject, 
  isIntegerOrIntegerString, createChoiceWidget, createListFromMap, 
  createMultiSelectionWidget, fillSelectWithOptionsAndSelect, fill, createOption};