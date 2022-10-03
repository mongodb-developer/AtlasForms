exports = async function(docType,query){
  if (query == null) { query = {} }
    
    console.log(`Doctype Queried: [${docType.namespace}]`)
    const [databaseName,collectionName] = docType.namespace.split('.');
    if(!databaseName || !collectionName) { return {}}
    
    console.log(`Query: ${JSON.stringify(query)}`)
    var collection = context.services.get("mongodb-atlas").db(databaseName).collection(collectionName);
    const cursor = await collection.find(query).limit(30);
    const results = cursor.toArray(); 
    console.log(`Found: ${results.length} diocuments`)
    return results; 
};