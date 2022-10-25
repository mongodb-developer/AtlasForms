'use strict';

let vueApp;

function classFromType(valtype) {

  let rval = "smallitem";

  //Document and Array field wrappers have their own class
  if (['document', 'array'].includes(getBsonType(valtype))) {
    rval = " newline"
  } else {
    if (valtype.startsWith("string")) {
      const size = valtype.split(':')[1];
      if (size > 30) { rval = "mediumitem" };
      if (size > 150) { rval = "largeitem" };

    }
  }
  return " " + rval /* Non Strings can be type small */
}

async function logOut(email, password) {
  try {
    await vueApp.realmApp.currentUser.logOut();
    window.location.replace("../login/login.html");
  }
  catch (e) {
    console.error(e)
  }
}

//Fetch the list of document types I can interact with from the server*/

async function getListOfDocTypes() {
  try {
    const docTypes = await vueApp.realmApp.currentUser.functions.getListOfDoctypes();
    return docTypes;
  }
  catch (e) {
    console.error(e)
    return [];
  }
}

//Pop up out custom alert dialog thingy
function formAlert(message) {
  vueApp.show_modal = true;
  vueApp.modal_content = message ? message : "[Error Message Missing !]"
}

async function clearForm() {
  //TODO maybe - add an Are you sure? if they have been entering data
  vueApp.results = [];
  vueApp.currentDoc = { doc: {} };
  vueApp.editing = true;
  //Editable divs we changed need manually cleared
  for (const id of Object.keys(vueApp.fieldEdits)) {
    if (document.getElementById(id)) {
      document.getElementById(id).innerText = ""
      document.getElementById(id).value = null
    }
  }
  vueApp.fieldEdits = {}
}

async function editRecord() {

  if (vueApp.currentDoc?.doc?._id == null) {
    formAlert(appStrings.AF_NO_OPEN_FOR_EDIT)
    return;
  }

  /* We need to Lock it before they can edit it, and fetch the latest version */
  let lockResult = await vueApp.realmApp.currentUser.functions.lockDocument(vueApp.selectedDocType, vueApp.currentDoc.doc._id);

  if (lockResult.ok) {
    //We got the lock
    vueApp.editing = true;
    vueApp.currentDocLocked = true;
    vueApp.currentDoc.doc = lockResult.currentDoc
  } else {
    //Tell them Why not
    //TODO - Perhaps offer a 'Steal Lock' option in future depending
    //How long it's been locked for
    formAlert(appStrings.AF_DOC_CANNOT_LOCK(lockResult.message))
  }

}

//TODO - combine commit and Cancel client and server end for clarity

async function commitEdit(cancel) {
  if (vueApp.currentDoc == {} || vueApp.currentDoc == null ||
    vueApp.currentDoc == undefined || vueApp.currentDoc.doc._id == null || !vueApp.currentDocLocked) {
    formAlert(appStrings.AF_NOT_LOCKED)
    return;
  }

  if (cancel == true) {
    vueApp.fieldEdits = {};
  }
  let commitResult = await vueApp.realmApp.currentUser.functions.commitEdit(vueApp.selectedDocType,
    vueApp.currentDoc.doc._id, vueApp.fieldEdits);

  if (commitResult.ok) {
    vueApp.currentDocLocked = false;
    vueApp.fieldEdits = {};
    //If we change current Doc to a different Doc but with the same values
    //Vue thinks it doesnt need to update anything, but we want to overwrite
    //The things we edited manually that aren't in the model
    vueApp.currentDoc.doc = {}; //This forces Vue to rerender divs we edited manually
    await Vue.nextTick(); // As the valuses change from nothing to the same value.
    vueApp.currentDoc.doc = commitResult.currentDoc; //Revert to latest server version
    vueApp.editing = false;

  } else {
    //Tell them Why not
    //TODO - Perhaps offer a 'Steal Lock' option in future depending
    //How long it's been locked for
    formAlert(appStrings.AF_DOC_CANNOT_LOCK(commitResult.message))
  }
}

async function newRecord() {

  if (vueApp.fieldEdits._id != undefined && vueApp.fieldEdits._id != "") {
    formAlert(appStrings.AF_NO_MANUAL_ID)
    return;
  }

  let { ok, message, currentDoc } = await vueApp.realmApp.currentUser.functions.createDocument(vueApp.selectedDocType, vueApp.fieldEdits)
  if (ok && currentDoc) {
    const wrappedDoc = { downloaded: true, doc: currentDoc }
    vueApp.results = [wrappedDoc]
    vueApp.currentDoc = wrappedDoc
    vueApp.editing = false;
    vueApp.fieldEdits = {};
  } else {
    formAlert(appStrings.AF_DOC_CANNOT_CREATE(message));
  }
}

async function resultClick(result) {
  if (result.downloaded == false) {

    /* Download the full doc when we select it*/
    const { ok, message, results } = await vueApp.realmApp.currentUser.functions.queryDocType(
      vueApp.selectedDocType
      , { _id: `${result.doc._id}` }, {});
    if (ok) {
      result.doc = results[0];
      result.downloaded = true
    } else {

      formAlert(appStrings.AF_SERVER_ERROR(message));
    }
  }
  vueApp.currentDoc = result;
}
//We use this to track editied controls so we can send an update to 
//Atlas also because we are editing InnerText rather than using a control we can't bind to it.
//Also we want to keep the original verison anyway.


function formValueChange(event) {
  
  const element = event.target
  const fieldName = element.id
  let value = ""

  //If it'a a DIV take the text, if not take the value
  if (element.nodeName == "INPUT") {
    value = element.value
    console.log('change');
  } else {
    value = element.innerText
    //If this is not acceptable (letters in a number for example)
    //Set it back to the previous value and place the cursor at the end

    if (['number', 'int32', 'int64', 'decimal128'].includes(element.getAttribute('data-bsontype'))) {
      if (isNaN(Number(value))) {
        element.innerText = vueApp.fieldEdits[fieldName] ? vueApp.fieldEdits[fieldName] : "";
        let range = document.createRange();
        let sel = window.getSelection();
        range.setStart(element, 1);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        return;
      }
    }
  }


  vueApp.fieldEdits[fieldName] = value;
  return ;
}

function addArrayElement(name) {
  /* array or object.array are the paths we support, no array nesting */
  const pathParts = name.split('.');
  const workingDoc = vueApp.currentDoc.doc;
  let workingArray = null;
  let elementBsonType = null;
  if (pathParts.length > 2) return false; /* Not supported */

  /* It's possible to click delete when there is nothing actually in the array yet
     Add a dummy entrry - content doesnt matter but make it an object so iterable
     Alternative is to clear the entries in element 0 if it's empty */

  if (pathParts.length == 2) {
    const arraySchema = vueApp.selectedDocTypeSchema[pathParts[0]][pathParts[1]];
    elementBsonType = getBsonType(arraySchema[0]);
    if (workingDoc[pathParts[0]] == undefined) {
      workingDoc[pathParts[0]] = { [pathParts[1]]: [elementBsonType == 'document' ? { _xyzzy_: 1 } : ''] }
    }
    if (workingDoc[pathParts[0]][pathParts[1]] == undefined) {
      workingDoc[pathParts[0]][pathParts[1]] = [elementBsonType == 'document' ? { _xyzzy_: 1 } : ''];
    }
    workingArray = workingDoc[pathParts[0]][pathParts[1]]
  } else {
    const arraySchema = vueApp.selectedDocTypeSchema[pathParts[0]];
    elementBsonType = getBsonType(arraySchema[0]);
    //pathPart[0] is an array
    if (workingDoc[pathParts[0]] == undefined) {
      workingDoc[pathParts[0]] = [elementBsonType == 'document' ? { _xyzzy_: 1 } : ''];
    }
    workingArray = workingDoc[pathParts[0]]
  }
  if (elementBsonType == "document") {
    workingArray.push({ __xyxxy__: 1 });
  } else {
    workingArray.push('');
  }
}

function deleteArrayElement(name, index) {

  /* array or object.array are the paths we support, no array nesting */
  const pathParts = name.split('.');
  const workingDoc = vueApp.currentDoc.doc;
  let workingArray = null;

  if (pathParts.length > 2) return false; /* Not supported */

  /* It's possible to click delete when there is nothing actually in the array yet
     Add a dummy entrry - content doesnt matter but make it an object so iterable
     Alternative is to clear the entries in element 0 if it's empty */

  if (pathParts.length == 2) {
    if (workingDoc[pathParts[0]] == undefined) { workingDoc[pathParts[0]] = { [pathParts[1]]: [{ _xyzzy_: 1 }] } }
    if (workingDoc[pathParts[0]][pathParts[1]] == undefined) { workingDoc[pathParts[0]][pathParts[1]] = [{ _xyzzy_: 1 }] }
    workingArray = workingDoc[pathParts[0]][pathParts[1]]
  } else {
    //pathPart[0] is an array
    if (workingDoc[pathParts[0]] == undefined) { workingDoc[pathParts[0]] = [{ _xyzzy_: 1 }] }
    workingArray = workingDoc[pathParts[0]]
  }

  /* Record what we want ot remove in our list of edits as $$REMOVE */

  const elname = `${name}.${index}`
  vueApp.fieldEdits[elname] = "$$REMOVE"
  for (const entry of Object.keys(vueApp.fieldEdits)) {
    if (entry.startsWith(elname + '.')) {
      delete vueApp.fieldEdits[entry]
    }
  }

  //If we have removed all elements we need to add an empty one on the end
  //So users can type new data in - count how many we are removing
  let removed = 0;
  let arrayLength = workingArray.length
  for (let idx = 0; idx < arrayLength; idx++) {
    if (vueApp.fieldEdits[`${name}.${idx}`] == "$$REMOVE") {
      removed++;
    }
  }

  if (removed == arrayLength) {
    vueApp.addArrayElement(name);
  }

}

async function runQuery() {
  try {
    //Send the fieldEdits to the server, we will process to the correct data type there
    //Avoid any injection also all will be strings at this point.
    let projection = {}

    for (const fieldname of vueApp.listViewFields) {
      projection[fieldname] = 1
    }


    const { ok, message, results } = await vueApp.realmApp.currentUser.functions.queryDocType(vueApp.selectedDocType
      , vueApp.fieldEdits, projection);

    if (!ok) {
      formAlert(appStrings.AF_SERVER_ERROR(message));
      vueApp.wrappedResults = [];
      vueApp.editing = true;
      return;
    }

    //Wrap this in something to say if we have decoded it
    let wrappedResults = []
    let downloaded = false
    for (const doc of results) {
      wrappedResults.push({ downloaded, doc })
    }

    vueApp.results = wrappedResults;
    vueApp.editing = false; //No implicit editing
    if (results.length == 0) {
      formAlert(appStrings.AF_NO_RESULTS_FOUND);
      vueApp.editing = true;
    }
  }
  catch (e) {
    console.error(e)
    return [];
  }
}

//User has changed the dropdown for the document type
async function selectDocType() {
  vueApp.columnResizeObserver.disconnect()
  try {
    // It would be simple to cache this info client end if we want to
    const { ok, docTypeSchemaInfo, message } = await vueApp.realmApp.currentUser.functions.getDocTypeSchemaInfo(vueApp.selectedDocType);

    vueApp.fieldEdits = {};
    vueApp.listViewFields = [];
    vueApp.results = Array(10).fill({}) //Empty and show columnheaders
    vueApp.currentDoc = { doc: {} }
    await Vue.nextTick();
    if (!ok) {
      formAlert(appStrings.AF_SERVER_ERROR(message));
      vueApp.selectedDocType = {}
    } else {
      vueApp.fieldEdits = {};
      vueApp.selectedDocTypeSchema = docTypeSchemaInfo
      vueApp.listViewFields = vueApp.selectedDocType.listViewFields;
      // We cache these
     
      if (vueApp.selectedDocType.picklists == null) {
       
        const { ok, message, picklists } = await vueApp.realmApp.currentUser.functions.getPicklists(vueApp.selectedDocType);
        if (!ok) {
          formAlert(appStrings.AF_SERVER_ERROR(message));
        } else {
          
          vueApp.selectedDocType.picklists = picklists;
        }
      }
    }
  }
  catch (e) {
    console.error(e)
    vueApp.selectedDocType = {}
  }
}

async function formsOnLoad() {
  const { createApp } = Vue
  const realmApp = new Realm.App({ id: atlasAppConfig.ATLAS_SERVICES_APPID });

  if (realmApp.currentUser == null) {
    // We should not be here if we are not logged in
    window.location.replace("/login/login.html");
  }

  vueApp = createApp({
    methods: {
      //Method we call from  HTML
      log: console.log,
      logOut, selectDocType, formValueChange, runQuery, clearForm,
      editRecord, newRecord, toDateTime, getBsonType, watchColumnResizing,
      getFieldValue, formatFieldname, sortListviewColumn, commitEdit,
      resultClick, deleteArrayElement, addArrayElement, classFromType

    },
    data() {
      return {
        
        results: [],
        docTypes: [],
        selectedDocType: {},
        selectedDocTypeSchema: {},
        currentDoc: { doc: {} },
        listViewFields: [],
        editing: false,
        currentDocLocked: false,
        modal_content: "test",
        show_modal: false
      }
    },
    mounted() {
      //Non reactive data , don't want reactivity on a deep component like this.
      //So we don't add it in the data member
      //Also confiuses first login attempt for a new user with realmApp.
      this.realmApp = realmApp;
      this.columnResizeObserver = new ResizeObserver(onListviewColumnResize);
      this.fieldEdits={};
    },
  }).mount("#formsapp")

  const { ok, docTypes, message } = await getListOfDocTypes();
  if (!ok) {
    formAlert(appStrings.AF_SERVER_ERROR(message));
    return;
  }
  vueApp.docTypes = docTypes;
  //Set the Document Type dropdown to the first value
  if (vueApp.docTypes.length > 0) {
    vueApp.selectedDocType = vueApp.docTypes?.[0]; //Null on empty list
    vueApp.selectDocType();
    vueApp.editing = true; //Can edit in empty form
  } else {
    formAlert(appStrings.AF_NO_DOCTYPES);
  }
}