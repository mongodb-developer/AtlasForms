//Takes a Javascript document and replaces each value with a String
//Showing the data type - essentially making a template from a 
//sample document
function replacer(key,value) {
  if( key == "") return "object"
  return typeof value;
}

function documentToTypemap(doc){
  const docAsString = JSON.stringify(doc,replacer)
  return JSON.parse(docAsString);
}

exports = async function(docType){
  try {
    docType = { namespace: "sample_airbnb.listingsAndReviews" }
    
    const [databaseName,collectionName] = docType.namespace.split('.')
    
    //Very Simple implmentation, grab the first document and use that to create a form template
    
    const collectio = context.services.get("mongodb-atlas").db(databaseName).collection(collectionName);
    
    const firstDoc = await collection.findOne({ owner_id: context.user.id });
    
  } catch(e) {
    docType.errmsg = e; //Client end debug option
   console.error(e)
  }
 
  return docType; /* Just adding to what we had*/
};