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
async function clearForm() {
  //TODO maybe - add an Are you sure? if they have been entering data

  vueApp.results = [];
  vueApp.currentDoc = {};
  vueApp.editing = true;
  //Editable divs we changed need manually cleared
  for(const id of Object.keys(vueApp.fieldEdits)) {
    console.log(id)
    if(document.getElementById(id)) {
      document.getElementById(id).innerText = ""
      document.getElementById(id).value = null
    }
  }
  vueApp.fieldEdits = {}
}

async function editRecord() {
  alert("Not Yet Implemented"); //TODO
}

async function newRecord() {
  console.log(vueApp.fieldEdits);
  let rval = await vueApp.realmApp.currentUser.functions.createDocument(vueApp.selectedDocType, vueApp.fieldEdits)
  if(rval.ok) {
  console.log(rval)
  vueApp.results=[rval.newDoc]
  vueApp.currentDoc = rval.newDoc
  vueApp.editing=false
 } else {
    vueApp.show_modal = true;
    vueApp.modal_content = appStrings.AF_BAD_FIELD_TYPE(rval.errorField,rval.errorType);
 }
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
  if(element.nodeName == "INPUT") {
    value = element.value
  } else {
    value = element.innerText
    //If this is not acceptable (letters in a number for example)
    //Set it back to the previous value and place the cursor at the end

    if (['number','int32','int64','decimal128'].includes(element.getAttribute('data-bsontype'))) {
      if(isNaN(Number(value))) {
        element.innerText = vueApp.fieldEdits[fieldName]?vueApp.fieldEdits[fieldName]:"";
        let range = document.createRange();
        let sel = window.getSelection();
        range.setStart(element,1);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        return;
      }
    }
  }
  vueApp.fieldEdits[fieldName] = value;

}

// User has clicked the button to query for data

async function runQuery() {
  try {

    console.log(vueApp.fieldEdits);

    //Send the fieldEdits to the server, we will process to the correct data type there
    //Avoid any injection also all will be strings at this point.
    const results = await vueApp.realmApp.currentUser.functions.queryDocType(vueApp.selectedDocType,vueApp.fieldEdits);
    vueApp.results = results;
    vueApp.editing = false; //No implicit editing
    if( results.length == 0) {
      vueApp.show_modal = true;
      vueApp.modal_content = appStrings.AF_NO_RESULTS_FOUND;
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
  console.log(`Disconnected Observer`)
  try {
    // It would be simple to cache this info client end if we want to
    const docTypeSchemaInfo = await vueApp.realmApp.currentUser.functions.getDocTypeSchemaInfo(vueApp.selectedDocType);
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
      logOut,  selectDocType, formValueChange, runQuery, clearForm, editRecord, newRecord, toDateTime, getBsonType, watchColumnResizing, getFieldValue, formatFieldname, sortListviewColumn

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