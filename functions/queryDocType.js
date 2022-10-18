
//Todo - in utility_fns?

function refersToArrayElement(fieldName)
{
    
    const parts = fieldName.split('.');
    //Is anything in here a number if so return the index
    const locationOfIndex = parts.reduce((val,el,idx)=>{ return isNaN(el) ? val : idx ;}  ,-1);
    const rval = { locationOfIndex }
    if(locationOfIndex != -1) 
    {
      rval.arrayFieldName = parts.slice(0,locationOfIndex).join('.');
      rval.elementFieldName = parts.slice(locationOfIndex+1).join('.');
    }  
    return rval;
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
      for(const part of parts) {
        subobj = subobj[part]
      }
      //Now based on that convert value and add to our new query
      let correctlyTypedValue = utilityFunctions.correctValueType(query[fieldName],subobj)
      
      if(correctlyTypedValue != null && correctlyTypedValue!="") {
        typedQuery[fieldName] = correctlyTypedValue
      }
    }
    
    /* Wherever we are querying against array elements we need to rewrite */
    /* If we have {skills.1: "archery"} and { skills.2: "weaving" } */
    /* We want ot find them at any location in the array not just at 1 and 2 */
    /* Also if we have { skills.1.skill: "archery", skills.1.level: 3 } we */
    /* are looking for level3 archery, not level 1 archery and level3 in something else*/
    /* To do this we rewrite the query using $elemMatch */
     for( let fieldName of Object.keys(query) )
    {
      const arrayIdx = refersToArrayElement(fieldName);
      if( arrayIdx.locationOfIndex != -1 ) {
        console.log(`arrayFieldName: ${arrayIdx.arrayFieldName} locationOfIndex: ${arrayIdx.locationOfIndex} elementFieldName: ${arrayIdx.elementFieldName}`)
      }
    }
    
 

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