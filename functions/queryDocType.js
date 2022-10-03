//Make sure things are the data type we want them to be
function correctValueType(value,type) {
  let rval = "";
  try {
    switch(type) {
      case "string":
        rval = `${value}`
        break;
      case "number":
      case "int32":
      case "int64":
        rval = Number(value)
        break;
      default: 
        rval = "";
    }
  }
  catch(e) {
    console.error(e)
  }
  return rval;
}
exports = async function(docType,query){
  
  // query = { "_id" : 1  }
  // docType = { namespace: "sample_airbnb.listingsAndReviews" }
    if (query == null) { query = {} }
    
    console.log(`Doctype Queried: [${docType.namespace}]`)
 
    const [databaseName,collectionName] = docType.namespace.split('.');
   
    if(!databaseName || !collectionName) { return {}}
    
    console.log(`Query: ${JSON.stringify(query)}`)
   
    // Convert everything to the correct Javascript/BSON type 
    // As it's all sent as strings from the form, 
    // also sanitises any Javascript injection
    
    const objSchema =  await context.functions.execute("getDocTypeSchemaInfo",docType)
    //console.log(objSchema)
   
    let newQuery = {}
    for( const field of Object.keys(query) )
    {
      let parts = field.split('.')
      let subobj = objSchema
      for(const part of parts) {
        console.log(part)
        //TODO - Deal with Arrays
        subobj = subobj[part]
      }
      console.log(subobj)
      //Now based on that convert value and add to our new query
      let correctlyTypedValue = correctValueType(query[field],subobj)
      if(correctlyTypedValue != null && correctlyTypedValue!="") {
        newQuery[field] = correctlyTypedValue
      }
    }
    console.log(EJSON.stringify(newQuery))
    var collection = context.services.get("mongodb-atlas").db(databaseName).collection(collectionName);
    const cursor = await collection.find(query).limit(30); //Temp limit when testing
    const results = await cursor.toArray(); 
    console.log(JSON.stringify(results))
    console.log(`Found: ${results.length} documents`)
    return results; 
};