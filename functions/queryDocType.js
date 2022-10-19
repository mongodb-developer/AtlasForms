
function rewriteArrayQuery(typedQuery) {
    /* Wherever we are querying against array elements we need to rewrite */
    /* If we have {skills.1: "archery"} and { skills.2: "weaving" } */
    /* We want to find them at any location in the array not just at positions 1 and 2 */
    /* Also if we have { skills.1.skill: "archery", skills.1.level: 3 } we */
    /* are looking for level3 archery, not any level archery and level=3 in something else*/
    /* To do this we rewrite the query using $elemMatch */
    
    // { skills : { $elemMatch: { skill: "archery", level: 3}}}
    // We use $and for multiples
    const elementsToMatch = {};
    
    for( let fieldName of Object.keys(typedQuery) )
    {
      const {arrayFieldName,index,elementFieldName,locationOfIndex} = utilityFunctions.refersToArrayElement(fieldName); 
      if( locationOfIndex != -1 ) {
         if(!elementsToMatch[arrayFieldName]) { elementsToMatch[arrayFieldName] = []; }
        if(!elementFieldName) {
          elementsToMatch[arrayFieldName][index] = typedQuery[fieldName];
        } else {
          if(!elementsToMatch[arrayFieldName][index]) {elementsToMatch[arrayFieldName][index]={};}
          elementsToMatch[arrayFieldName][index][elementFieldName] = typedQuery[fieldName];
        }
        /* Remove this from the query */
        delete typedQuery[fieldName];
      }
    }
    //Rewrite as an $and of $elemMatches
    const arrayQueryClauses = []
    for(let arrayName of Object.keys(elementsToMatch)) {
      for(let arrayElement of elementsToMatch[arrayName]) {
        //A Value of $$REMOVE is not something we want ot be searching for.
        if(arrayElement != "$$REMOVE" && arrayElement != "") {
          if( utilityFunctions.getBsonType(arrayElement) == "document" )
          {
            arrayQueryClauses.push( { [arrayName] : { $elemMatch : arrayElement}})
          } else {
             arrayQueryClauses.push( { [arrayName] : { $elemMatch : {$eq : arrayElement}}})
          }
        }
      }
    }
    if(arrayQueryClauses.length > 0) {
      typedQuery['$and'] = arrayQueryClauses;
    }
    //console.log(JSON.stringify(typedQuery));
    return typedQuery;
}



// This just ANDs the values together - first though it casts
// Them all to the correct data type for the field as the form
// returns everything as a string

exports = async function(namespace,query,projection){
    console.log(`Query: ${JSON.stringify(query,null,2)}`)
    /*Dynamically load some shared code*/
    var utilityFunctions =  await context.functions.execute("utility_functions");


    if (query == null) { query = {}; }
    const [databaseName,collectionName] = namespace.split('.');
    if(!databaseName || !collectionName) { return {}; }

    const objSchema =  await context.functions.execute("getDocTypeSchemaInfo",namespace);
    // Convert everything to the correct Javascript/BSON type 
    // As it's all sent as strings from the form, 
    // also sanitises any Javascript injection
    let typedQuery = utilityFunctions.castDocToType(query,objSchema);

    /* Handle Arrays correctly*/
    typedQuery = rewriteArrayQuery(typedQuery);
 
    var collection = context.services.get("mongodb-atlas").db(databaseName).collection(collectionName);
    try {
      console.log(`Query: ${JSON.stringify(typedQuery,null,2)}`)
      const cursor = await collection.find(typedQuery,projection).limit(30); //Temp limit when testing
      const results = await cursor.toArray(); 
      return results;
    } catch(e) {
      console.error(e);
      return [];
    }

};