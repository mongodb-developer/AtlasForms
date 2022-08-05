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

async function runQuery() {
  try {
    console.log(vueApp.selecedtDocType)
    const results = await vueApp.realmApp.currentUser.functions.queryDocType(vueApp.selectedDocType);
    console.log(results)
    vueApp.results = results;
  }
  catch (e) {
    console.error(e)
    return [];
  }
}

function toDateTime(myDate) {
  /*If you want just dates not times, cut this shorter and change the HTML
   MDB uses DateTimes always internlly*/
  if (!myDate instanceof Date) return "";
  /* Return ISO String truncated at seconds*/
  const dtString = myDate.toISOString().substring(0, 19);
  return dtString
}

function getBsonType(obj) {
  if (typeof obj != "object") return typeof obj;
  if (Array.isArray(obj)) return "array"
  if (obj instanceof Date) return "date"
  if (obj instanceof Realm.BSON.ObjectId) return "objectid"
  if (obj instanceof Realm.BSON.Binary) return "binary"
  if (obj instanceof Realm.BSON.Int32) return "int32"
  if (obj instanceof Realm.BSON.Long) return "int64"
  if (obj instanceof Realm.BSON.Double) return "number"
  if (obj instanceof Realm.BSON.Decimal128) return "decimal128"
  return "document";
}


//This deals with dotted fieldnames 
//Also formatting for things like dates
function getFieldValue(result, fieldname) {
  if(result == null) return;
  const [a,b] = fieldname.split('.')
  if (b && result[a]) { return result[a][b] }
  else { return result[a]; }
}

async function selectDocType() {
  try {
    // It would be simple to cache this info client end if we want to
    const docTypeSchemaInfo = await vueApp.realmApp.currentUser.functions.getDocTypeSchemaInfo(vueApp.selectedDocType);
    vueApp.selectedDocTypeInfo = docTypeSchemaInfo
    vueApp.listViewFields = vueApp.selectedDocType.listViewFields;
    vueApp.results = Array(20).fill({}) //Empty and show columnheaders
  }
  catch (e) {
    console.error(e)
    vueApp.selectedDocType = {}
  }
}

/* Register a component to record it's width, apply any saved width*/

function watchColumnResizing(element) {
  //If we have a stored size for this column apply it
  const fieldname = element.id; //Record the size for a given label
  const docTypeName = vueApp.selectedDocType.namespace;
  const storedWidth = localStorage.getItem(`${docTypeName}_${fieldname}`)
  if (storedWidth) {
    element.style.width = storedWidth
  }
  vueApp.columnResizeObserver.observe(element)
}


//This is client side sorting but more complex than you might expect
//Needs to cope with any data type
function sortListviewColumn(column) {
 vueApp.results.sort( (a,b) =>
  {
    let value_a = getFieldValue(a,column);
    let value_b = getFieldValue(b,column);
   
    //If these are different types sort by typename
    if(typeof value_a != typeof value_b) { a_type = typeof value_a ; return a_type.localeCompare(typeof value_b) }
    //Try a numeric comparison, works for dates etc too.
    if(isNaN( value_a-value_b) == false)  { return  value_a-value_b; } //Comparison worked;
    //Last option, compare as strings
    return `${value_a}`.localeCompare(`${value_b}`);
  } )
 }

function onListviewColumnResize(columns) {
  for (let column of columns) {
    //Grab the width from the style and record it in localstorage
    const width = column.target.style.width;
    const fieldname = column.target.id; //Record the size for a given label
    const docTypeName = vueApp.selectedDocType.namespace;
    localStorage.setItem(`${docTypeName}_${fieldname}`, width);
  }
}

function formatFieldname(name){
   //Convert DB fieldname to nice visual
  return name.replace(/[\._]/g,' ');
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
      logOut, selectDocType, runQuery, toDateTime, getBsonType, watchColumnResizing,getFieldValue,formatFieldname,sortListviewColumn

    },
    data() {
      return {
        results: [],
        docTypes: [],
        selectedDocType: {},
        selectedDocTypeInfo: {},
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



}