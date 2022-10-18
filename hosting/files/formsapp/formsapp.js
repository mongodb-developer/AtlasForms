'use strict';

let vueApp;

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
  vueApp.currentDoc = {};
  vueApp.editing = true;
  //Editable divs we changed need manually cleared
  for (const id of Object.keys(vueApp.fieldEdits)) {
    console.log(id)
    if (document.getElementById(id)) {
      document.getElementById(id).innerText = ""
      document.getElementById(id).value = null
    }
  }
  vueApp.fieldEdits = {}
}

async function editRecord() {

  if ( vueApp.currentDoc?.doc?._id == null) {
    formAlert(appStrings.AF_NO_OPEN_FOR_EDIT)
    return;
  }


  /* We need to Lock it before they can edit it, and fetch the latest version */
  let lockResult = await vueApp.realmApp.currentUser.functions.lockDocument(vueApp.selectedDocType, vueApp.currentDoc.doc._id);

  if (lockResult.lockObtained) {
    //We got the lock
    vueApp.editing = true;
    vueApp.currentDocLocked = true;
    vueApp.currentDoc.doc = lockResult.currentDoc
  } else {
    //Tell them Why not
    //TODO - Perhaps offer a 'Steal Lock' option in future depending
    //How long it's been locked for
    formAlert(appStrings.AF_DOC_ALREADY_LOCKED(lockResult.currentDoc.doc.__lockedBy))
  }

}

//TODO - combine commit and Cancel client and server end for clarity

async function commitEdit(cancel) {
  if (vueApp.currentDoc == {} || vueApp.currentDoc == null ||
    vueApp.currentDoc == undefined || vueApp.currentDoc.doc._id == null || !vueApp.currentDocLocked) {
    formAlert(appStrings.AF_NOT_LOCKED)
    return;
  }

  if(cancel == true) {
    vueApp.fieldEdits = {}; 
  }
  let commitResult = await vueApp.realmApp.currentUser.functions.commitEdit(vueApp.selectedDocType.namespace,
    vueApp.currentDoc.doc._id, vueApp.fieldEdits);

  //TODO: Error handling if edit fails

  //Mostly if I didn't have it locked (perhaps stolen) it doesn't matter
  console.log(commitResult)

  vueApp.currentDocLocked = false;
  vueApp.fieldEdits = {}; 
  //If we change current Doc to a different Doc but with the same values
  //Vue thinks it doesnt need to update anything, but we want to overwrite
  //The things we edited manually that aren't in the model
  vueApp.currentDoc.doc = {}; //This forces Vue to rerender divs we edited manually
  await Vue.nextTick(); // As the valuses change from nothing to the same value.

  vueApp.currentDoc.doc = commitResult.currentDoc; //Revert to latest server version
  vueApp.editing = false;

}

async function newRecord() {

  if (vueApp.fieldEdits._id != undefined && vueApp.fieldEdits._id != "") {
    formAlert(appStrings.AF_NO_MANUAL_ID)
    return;
  }

  let rval = await vueApp.realmApp.currentUser.functions.createDocument(vueApp.selectedDocType.namespace, vueApp.fieldEdits)
  if (rval.ok) {
    const wrappedDoc = { downloaded: true, doc: rval.newDoc }
    vueApp.results = [wrappedDoc]
    vueApp.currentDoc = wrappedDoc
    vueApp.editing = false
  } else {
    formAlert(appStrings.AF_BAD_FIELD_TYPE(rval.errorField, rval.errorType));
  }
}

async function resultClick(result) {
  if(result.downloaded == false) {

    /* Download the full doc when we select it*/
    const [wholeDoc] =  await vueApp.realmApp.currentUser.functions.queryDocType(
      vueApp.selectedDocType.namespace
      , {_id:result.doc._id}, {});
      result.doc = wholeDoc
      result.downloaded = true
  }
  vueApp.currentDoc = result;
}
//We use this to track editied controls so we can send an update to 
//Atlas also because we are editing InnerText rather than using a control we can't bind to it.
//Also we want to keep the original verison anyway.

//TODO - Handle Dates
function formValueChange(event) {

  const element = event.target
  const fieldName = element.id
  let value = ""
  //If it'a a DIV take the text, if not take the value
  if (element.nodeName == "INPUT") {
    value = element.value
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

}

function addArrayElement(name) {
  //Add a blank item at the end of the list
  //Oddly if we delete it - we will add a delete to send to the server
  //Which works because a delete on the setver is a $set then $pull
  //We either add and emptyp string or dummy object based on the type
  
  if(vueApp.selectedDocTypeSchema[name] == undefined || vueApp.selectedDocTypeSchema[name] == null)
  {
    const [arrayname, subfield] = name.split('_');
    console.log(`Sub Schema:  ${JSON.stringify(vueApp.selectedDocTypeSchema[arrayname])}`);
    const schemaElement = vueApp.selectedDocTypeSchema[arrayname].name;
    console.log(schemaElement);
  }
  else {
    const elementBsonType = getBsonType(vueApp.selectedDocTypeSchema[name][0])
  } 
  
  if(elementBsonType == "document") {
    vueApp.currentDoc.doc[name].push({__xyxxy__:1})
  } else {
    vueApp.currentDoc.doc[name].push('')
  }
  
}
function deleteArrayElement(name,index) {
  //Record the rquested deletion in our changes
  //We need to remove any existing edits inside this as we cannot
  //set a.b=null and a.b.c=1 - MongoDB won't like that
  //$$REMOVE isn't actually supported in this context but we can make it so
  //on the server
  const elname = `${name}.${index}`
  vueApp.fieldEdits[elname]="$$REMOVE"
  for( const entry of Object.keys(vueApp.fieldEdits)) {
    if(entry.startsWith(elname+'.')) {
      delete vueApp.fieldEdits[entry]
    }
  }
  //If we have removed all elements we need to add an empty one on the end
  //So users can type new data in - count how many we are removing
  let removed=0;
  let arrayLength = vueApp.currentDoc.doc[name].length
  for(let idx=0;idx<arrayLength;idx++) {
    if(vueApp.fieldEdits[`${name}.${idx}`] == "$$REMOVE") {
      removed++;
    }
  }
  if(removed == arrayLength) {
    vueApp.addArrayElement(name);
  }
}
// User has clicked the button to query for data

async function runQuery() {
  try {
    //Send the fieldEdits to the server, we will process to the correct data type there
    //Avoid any injection also all will be strings at this point.
    let projection = {}
   
    for (const fieldname of vueApp.listViewFields) {
      projection[fieldname] = 1
    }

    const results = await vueApp.realmApp.currentUser.functions.queryDocType(vueApp.selectedDocType.namespace
      , vueApp.fieldEdits, projection);

    //Wrap this in something to say if we have decoded it
    let wrappedResults = []
    let downloaded = false
    for(const doc of results)
    {
      wrappedResults.push({downloaded,doc})
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
    const docTypeSchemaInfo = await vueApp.realmApp.currentUser.functions.getDocTypeSchemaInfo(vueApp.selectedDocType.namespace);
    vueApp.selectedDocTypeSchema = docTypeSchemaInfo
    vueApp.listViewFields = vueApp.selectedDocType.listViewFields;
    vueApp.results = Array(20).fill({}) //Empty and show columnheaders
    vueApp.currentDoc = {}

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
      resultClick,deleteArrayElement,addArrayElement

    },
    data() {
      return {
        fieldEdits: {},
        results: [],
        docTypes: [],
        selectedDocType: {},
        selectedDocTypeSchema: {},
        currentDoc: {},
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
    },
  }).mount("#formsapp")


  vueApp.docTypes = await getListOfDocTypes()
  //Set the Document Type dropdown to the first value
  vueApp.selectedDocType = vueApp.docTypes?.[0]; //Null on empty list
  vueApp.selectDocType();
  vueApp.editing = true; //Can edit in empty form
}