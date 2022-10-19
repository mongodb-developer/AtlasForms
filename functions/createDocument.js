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
    
    
    const collection = context.services.get("mongodb-atlas").db(databaseName).collection(collectionName);
    
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
 
      const newId =  getNewIdValue(objSchema);
      newDocument._id = newId
      
        
    /* Add fields to lock it for us on insert */

    newDocument.__locked = true;
    newDocument.__lockedby = context.user.data.email
    newDocument.__locktime = new Date();
    try {
      await collection.insertOne(newDocument);
      /* Now edit it */
      const asCreate = true
      const rval = await context.functions.execute("commitEdit",namespace,newId,untypedValues,asCreate)
      //If that goes wrong cleanup (TODO)
      return rval;
    }
    catch(e) {
      console.error(e);
      return  {ok: false};
    }
}

