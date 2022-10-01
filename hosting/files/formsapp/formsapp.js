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
  //TODO maybe - add an Are you sure if they have been entering data

  vueApp.results = [];
  vueApp.currentDoc = {};
  vueApp.editing = true;
}

async function editRecord() {
  alert("Not Yet Implemented"); //TODO
}

async function newRecord() {
  alert("Not Yet Implemented"); //TODO
}

//We use this to track editied controls so we can send an update to 
//Atlas also because we are editing InnerText rahter than using a control we can't bind to it.
//Also we want to keep the original verison anyway.

//TODO - Handle Dates
function formValueChange(event) {
  const element = event.target
  const fieldName = element.id
  const value = element.innerText
  vueApp.fieldEdits[fieldName] = value;
}

// User has clicked the button to query for data

async function runQuery() {
  try {
    //Create a list of all fields that have a value
    //Send the fieldEdits to the server, we will process to the correct 
    console.log(vueApp.fieldEdits);
    const results = await vueApp.realmApp.currentUser.functions.queryDocType(vueApp.selectedDocType);
    vueApp.results = results;
    vueApp.editing = false; //No implicit editing
  }
  catch (e) {
    console.error(e)
    return [];
  }
}

//User has changed the dropdown for the document type
async function selectDocType() {
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
        editing: false
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