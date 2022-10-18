
//Todo - in utility_fns?

function refersToArrayElement(fieldName)
{
    
    const parts = fieldName.split('.');
    //Is anything in here a number if so return the index
    const locationOfIndex = parts.reduce((val,el,idx)=>{ return isNaN(el) ? val : idx ;}  , -1);
    const rval = { locationOfIndex }
    if(locationOfIndex != -1) 
    {
      rval.arrayFieldName = parts.slice(0,locationOfIndex).join('.');
      rval.elementFieldName = parts.slice(locationOfIndex+1).join('.');
      rval.index = parts[locationOfIndex];
    }  
    return rval;
}

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
      const {arrayFieldName,ind,elementFieldName,locationOfIndex} = refersToArrayElement(fieldName); 
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
        //console.log(`Array Element is type ${utilityFunctions.getBsonType(arrayElement)}`)
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


function castDocToType(doc,objSchema){
     
  const typedQuery={}
  for( let fieldName of Object.keys(doc) )
  {
    let parts = fieldName.split('.')
    let subobj = objSchema
    for(let part of parts) {
      if(!isNaN(part)) {
        part='0'; /*When comparing to schema always check against element 0*/
      }
      subobj = subobj[part]
    }
    //Now based on that convert value and add to our new query
    let correctlyTypedValue = utilityFunctions.correctValueType(doc[fieldName],subobj)
    if(correctlyTypedValue != null && correctlyTypedValue!="") {
      typedQuery[fieldName] = correctlyTypedValue
    }
  }
  return typedQuery
}

// This just ANDs the values together - first though it casts
// Them all to the correct data type for the field as the form
// returns everything as a string

exports = async function(namespace,query,projection){
 
    /*Dynamically load some shared code*/
    var utilityFunctions =  await context.functions.execute("utility_functions");


    if (query == null) { query = {}; }
    const [databaseName,collectionName] = namespace.split('.');
    if(!databaseName || !collectionName) { return {}; }

    const objSchema =  await context.functions.execute("getDocTypeSchemaInfo",namespace);
    // Convert everything to the correct Javascript/BSON type 
    // As it's all sent as strings from the form, 
    // also sanitises any Javascript injection
    let typedQuery = castDocToType(query,objSchema);

    /* Handle Arrays correctly*/
    typedQuery = rewriteArrayQuery(typedQuery);
 
    var collection = context.services.get("mongodb-atlas").db(databaseName).collection(collectionName);
    try {
  
      const cursor = await collection.find(typedQuery,projection).limit(30); //Temp limit when testing
      const results = await cursor.toArray(); 
      return results;
    } catch(e) {
      console.error(e);
      return [];
    }

};