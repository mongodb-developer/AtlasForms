//This provides a default ID if needed, you can and 
// probably should override In the preinsert function

function getNewIdValue(objSchema) {
  const type = objSchema._id;
  /* We want the ID values ot be the same type */
  const objid = new BSON.ObjectId();
  switch(type) {
      case "string":
        return objid.toString();
     default:
        return objid;
  }
}

exports = async function (namespace,untypedValues) {
   const utilityFunctions =  await context.functions.execute("utility_functions");
    
    //We don't allow _id to be specified here but will accept an empty String as unspecificed
    if(untypedValues._id == "" || untypedValues._id==null) {
       delete  untypedValues._id;
    }
    
    if(untypedValues._id != undefined) {
      //Providng an _id is not allowed from the frontend *Design decision* 
      return { ok: false, errorField: "_id", errorType: "supplied"};     
    }
    
    if (untypedValues == null || untypedValues == {} ) { return {ok: false}; }
    
     const [databaseName,collectionName] = namespace.split('.');
    //TODO - verify we have permission to write to this
    
    if(!databaseName || !collectionName) { return {ok: false}}
    
    //Most of the work will be done in commitEdit - we will insert a 
    //placeholder here with arrays where we need them,
    //IMPORTANT: This highlights a Bug/Feature  in MongoDB. If you do update { $set : { "a.0" : 5 } }
    //MongoDB doesn't make { "a" : [ 5] } it makes {"a" : { "0": 5}} - this is not what we want if that field
    //Is an array so in both insert and update we need to compensate for that. MongoDB cannot know if you want an
    //array or document really.
      
    //We want a fix for this that not only works for an insert - where we could just construct the whole array but also
    //For an update where we are being given 1 or more array members but don't know if we need to construct the array
    //or modify it
      
    //The only thing we can do is work out which array fields we are updating then insert a record with those already set 
    //Or in the case of an edit update to set them to an array

      
    const objSchema =  await context.functions.execute("getDocTypeSchemaInfo",namespace)
    //This is a create so we just need to insert the document with all the arrays in place
    const newDocument = {}
  
        
    //Fina all the array fields we are trying to add
    //And set them as emty arrays in newDocument
  
    for(const fieldName of Object.keys(untypedValues)) {
       const {arrayFieldName,index,elementFieldName,locationOfIndex} = utilityFunctions.refersToArrayElement(fieldName); 
       //If this is and array flag it as such
       if(locationOfIndex != -1) {
         switch(locationOfIndex) {
           case 1:
             newDocument[arrayFieldName] = [];
             break;
            case 2:
              const [pathParts] = arrayFieldName.split('.');
              if(newDocument[pathParts[0]] == undefined) { newDocument[pathParts[0]] = {} }
              newDocument[pathParts[0]][pathparts]=[]; /* Array in subdoc */
              break;
             default:
         }
       }
    }
    
      // Assign an ID to the document
 
      const newId =  getNewIdValue(objSchema) 
      newDocument._id = newId
      
        
    /* Add fields to lock it for us on insert */

    newDocument.__locked = true;
    newDocument.__lockedBy = context.user.data.email
    newDocument.__locktime = new Date();
    try {
      await collection.insertOne(newDocument);
      /* Now edit it */
      await context.functions.execute("commitEdit",nameSpace,newId,untypedValues)
    }
    catch(e) {
      console.error(e);
      return  {ok: false};
    }
}



// This just and's the values together - what it does do it cast
// Them all to the correct data type for the field as the form
// Thinks the numbers are strings

exports_old = async function(namespace,untypedUpdates){
  
    const utilityFunctions =  await context.functions.execute("utility_functions")
  
    //We don't allow _id to be specified here but will accept an empty
    //String as unspecificed
    if(untypedUpdates._id == "" || untypedUpdates._id==null) {
       delete  untypedUpdates._id
    }
    
    if(untypedUpdates._id != undefined) {
      //Providng an _id is not allowed from the frontend *Design decision* 
      //Icky hack on error message reuse
      return { ok: false, errorField: "_id", errorType: "supplied"};     
    }
    
    
    if (untypedUpdates == null || untypedUpdates == {} ) { return {}; }
    
    const [databaseName,collectionName] = namespace.split('.');
    //TODO - verify we have permission to write to this
    
    if(!databaseName || !collectionName) { return {}}
    
    // Convert everything to the correct Javascript/BSON type 
    // As it's all sent as strings from the form, 
    // also sanitises any Javascript injection
    
    const objSchema =  await context.functions.execute("getDocTypeSchemaInfo",namespace)

   
    const updates = utilityFunctions.castDocToType(untypedUpdates,objSchema)
    const deletePulls = {} ; //IF any array has a $$REMOVE we need to clean it updates
    const arrayPaths = {}
    for(const fieldName of Object.keys(updates)) {
       const {arrayFieldName,index,elementFieldName,locationOfIndex} = utilityFunctions.refersToArrayElement(fieldName); 
       //If this is and array flag it as such
       if(locationOfIndex != -1) {
          arrayPaths[arrayFieldName] = true;
          deletePulls[arrayFieldName] = "$$REMOVE"
       }
    }
  
    let results
    const collection = context.services.get("mongodb-atlas").db(databaseName).collection(collectionName);
    try {
      //We aren't going to use insertOne here, we have a list of fields we want to set so we will do 
      //an update with upsert and also grab the final document and return it
      
      //IMPORTANT: This highlights a Bug/Feature  in MongoDB. If you do update { $set : { "a.0" : 5 } }
      //MongoDB doesn't make { "a" : [ 5] } it makes {"a" : { "0": 5}} - this is not what we want if that field
      //Is an array so in both insert and update we need to compensate for that. MongoDB cannot know if you want an
      //array or document really.
      
      //We want a fix for this that not only works for an insert - where we could just construct the whole array but also
      //For an update where we are being given 1 or more array members but don't know if we need to construct the array
      //or modify it
      
      //The only thing we can do is work out which array fields we are updating then insert a record with those already set 
      //Or in the case of an edit update to set them to an array

      
      //This is a create so we just need to insert the document with all the arrays in place
      
      // Assign an ID to the document
      if(updates._id == null) { 
          const newId =  getNewIdValue(objSchema) 
          updates._id = newId
        } 
      
      //Do we have arrays being modified
      if(Object.keys(arrayPaths).length > 0) {
        const newDoc = {_id:updates._id} //Use our new ID
        for(let arrayPath of Object.keys(arrayPaths))
        {
          const pathParts = arrayPath.split('.');
          switch(pathParts.length) {
            case 1:
              newDoc[pathParts[0]] = []; //Top level array is easy
              break;
            case 2:
              //Array in a subdocument - we may have >1 array in our subdocument
              if( newDoc[pathParts[0]] == undefined) {
                newDoc[pathParts[0]] = {}
              }
              newDoc[pathParts[0]][pathParts[1]] = []
          }
        }
 
        rval = await collection.insertOne(newDoc); //Insert the one with empty arrays as needed
      }

      rval = collection.findOneAndUpdate({_id:updates._id},{$set:updates},{upsert:true, returnNewDocument: true})
      return {ok: true, newDoc:rval}
    } catch(e) {
      console.error(e);
      return [];
    }

};