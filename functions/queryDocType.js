


// This just and's the values together - what it does do it cast
// Them all to the correct data type for the field as the form
// Thinks the numbers are strings

exports = async function(namespace,query,projection){
  
  /*Dynamically load some shared code*/
  
  const utilityFunctions =  await context.functions.execute("utility_functions")
  

    if (query == null) { query = {} }
    const [databaseName,collectionName] = namespace.split('.');
    if(!databaseName || !collectionName) { return {}}
    
  
    // Convert everything to the correct Javascript/BSON type 
    // As it's all sent as strings from the form, 
    // also sanitises any Javascript injection
    
    const objSchema =  await context.functions.execute("getDocTypeSchemaInfo",namespace)

   
    let newQuery = {}
    for( let field of Object.keys(query) )
    {
      let parts = field.split('.')
      let subobj = objSchema
      for(const part of parts) {
        subobj = subobj[part]
      }
      //Now based on that convert value and add to our new query
      let correctlyTypedValue = utilityFunctions.correctValueType(query[field],subobj)
      
      if(correctlyTypedValue != null && correctlyTypedValue!="") {
        //If we are querying an array we will have 'arrayname.0.field or 'arrayname.0'
        //We dont want to constrain it to the first array element so remove the .0 
        //In future add support for multiple array element querying with $elemMatch
        
        field = field.replace('.0','');
        newQuery[field] = correctlyTypedValue
      }
    }

    let results
    var collection = context.services.get("mongodb-atlas").db(databaseName).collection(collectionName);
    try {
  
      const cursor = await collection.find(newQuery,projection).limit(30); //Temp limit when testing
      const results = await cursor.toArray(); 
      return results;
    } catch(e) {
      console.error(error);
      return [];
    }

};