
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
      const arrayIdx = refersToArrayElement(fieldName);
      if( arrayIdx.locationOfIndex != -1 ) {
        console.log(`arrayFieldName: ${arrayIdx.arrayFieldName} locationOfIndex: ${arrayIdx.index} elementFieldName: ${arrayIdx.elementFieldName}  Value: ${typedQuery[fieldName]}`);
        if(!elementsToMatch[arrayIdx.arrayFieldName]) { elementsToMatch[arrayIdx.arrayFieldName] = []; }
        if(!arrayIdx.elementFieldName) {
          elementsToMatch[arrayIdx.arrayFieldName][arrayIdx.index] = typedQuery[fieldName];
        } else {
          if(!elementsToMatch[arrayIdx.arrayFieldName][arrayIdx.index]) {elementsToMatch[arrayIdx.arrayFieldName][arrayIdx.index]={};}
          elementsToMatch[arrayIdx.arrayFieldName][arrayIdx.index][arrayIdx.elementFieldName] = typedQuery[fieldName];
        }
      }
    }
    console.log(JSON.stringify(elementsToMatch))
    return typedQuery;
}

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

   
    let typedQuery = {}
    for( let fieldName of Object.keys(query) )
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
      let correctlyTypedValue = utilityFunctions.correctValueType(query[fieldName],subobj)
      if(correctlyTypedValue != null && correctlyTypedValue!="") {
        typedQuery[fieldName] = correctlyTypedValue
      }
    }
    
    /* Handle Arrays correctly*/
    typedQuery = rewriteArrayQuery(typedQuery);
 

    let results
    var collection = context.services.get("mongodb-atlas").db(databaseName).collection(collectionName);
    try {
  
      const cursor = await collection.find(typedQuery,projection).limit(30); //Temp limit when testing
      const results = await cursor.toArray(); 
      return results;
    } catch(e) {
      console.error(error);
      return [];
    }

};