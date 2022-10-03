exports = async function(docType,query){
  if (query == null) { query = {} }
    
    console.log(`Doctype Queried: [${docType.namespace}]`)
    const [databaseName,collectionName] = docType.namespace.split('.');
    if(!databaseName || !collectionName) { return {}}
    
    console.log(`Query: ${JSON.stringify(query)}`)
    
    //Convert everything to the correct type 
    //As it's all sent as strings - also sanitises any injection
    
    const objSchema =  await context.functions.execute("getDocTypeSchemaInfo",docType.namespace)
    console.log(objSchema)
    let newQuery = {}
    for( const [field,value] of Object.entries(query) )
    {
      let parts = field.split['.']
      let subobj = objSchema
      for(const part of parts) {
        console.log(part)
        //TODO - Deal with Arrays
        subobj = subobj[part]
      }
      console.log(subobj)
      //Now based on that convert value and add to our new query
    }
    
    var collection = context.services.get("mongodb-atlas").db(databaseName).collection(collectionName);
    const cursor = await collection.find(query).limit(30); //Temp limit when testing
    const results = await cursor.toArray(); 
    console.log(JSON.stringify(results))
    console.log(`Found: ${results.length} documents`)
    return results; 
};