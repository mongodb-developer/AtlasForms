'use strict';

let vueApp;

async function logOut(email,password)
{
   try {
    await vueApp.realmApp.currentUser.logOut();
    window.location.replace("../login/login.html");
   } 
   catch(e)
   {
    console.error(e)
   }
}

//Fetch the list of document types I can interact with from the server*/

async function getListOfDocTypes()
{
  try {
    const docTypes = await vueApp.realmApp.currentUser.functions.getListOfDoctypes();
    return docTypes;
   } 
   catch(e)
   {
    console.error(e)
    return [];
   }
}

async function runQuery()
{
  try {
    console.log(vueApp.selecedtDocType)
    const results = await vueApp.realmApp.currentUser.functions.queryDocType(vueApp.selectedDocType);
    console.log(results)
    vueApp.results = results;
   } 
   catch(e)
   {
    console.error(e)
    return [];
   }
}

function toDateTime(myDate) {
  /*If you want just dates not times, cut this shorter and change the HTML
   MDB uses DateTimes always internlly*/
  if(!myDate instanceof Date)  return "";
  /* Return ISO String truncated at seconds*/
  const dtString = myDate.toISOString().substring(0,19);
  return dtString
}

function getBsonType(obj)
{
  if(typeof obj != "object") return typeof obj;
  if(Array.isArray(obj)) return "array"
  if (obj instanceof Date) return "date"
  if (obj instanceof Realm.BSON.ObjectId) return "objectid"
  if (obj instanceof Realm.BSON.Binary) return "binary"
  if (obj instanceof Realm.BSON.Int32) return "int32"
  if (obj instanceof Realm.BSON.Long) return "int64"
  if (obj instanceof Realm.BSON.Double) return "number"
  if (obj instanceof Realm.BSON.Decimal128) return "decimal128"
  return "document";
}

async function selectDocType(docType)
{
  try {
    console.log(docType)
    // It would be simple to cache this info client end if we want to
    const docTypeInfo = await vueApp.realmApp.currentUser.functions.getDocTypeInfo(docType);
    console.log(docTypeInfo)
    docType.info = docTypeInfo
    vueApp.selectedDocType = docType
   } 
   catch(e)
   {
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

    
    vueApp  = createApp({
       methods: {
        logOut, selectDocType, runQuery,toDateTime,getBsonType
       },
       data() {
        return {
            results: [],
            docTypes : [],
            selectedDocType: {},
            currentDoc:  {},
            editing: false
        }
       },
       mounted() {
           //Non reactive data , don't want reactivity on a deep component like this.
           //Also confiuses first login attempt for a new user.
           this.realmApp = realmApp;
         },
    }).mount("#formsapp")

        
    vueApp.docTypes = await getListOfDocTypes()
    


}