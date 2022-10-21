/* This is used to commit or cancel an edit - if untypedupdates is
not supplied or empty , then no changes are made except the unlock*/

exports = async function(namespace,_id,untypedUpdates,asCreate){
  
    /*Get an Authorization object - should be standard in any non private function*/
  const authorization = await context.functions.execute("newAuthorization",context.user.id);
  if( authorization == null ) { return {ok: false,  message: "User not Authorized" }; }


  let rval = { ok: false, message: "No Error Message Set" };
  let postCommit = {};
    
  if(_id == undefined) {
      rval.message = "No _id supplied for document being edited.";
      return rval;   
  }
  
  const [databaseName,collectionName] = namespace.split('.');
  if(!databaseName || !collectionName) { 
    rval.message=`Invalid namespace ${namespace}` ;
    return rval;
  }
  
  const collection = context.services.get("mongodb-atlas").db(databaseName).collection(collectionName);
  const utilityFunctions =  await context.functions.execute("utility_functions");
  
  // TODO - verify we have permission to write to this (AUTHZ)

    let email = context.user.data.email;
    
    //Cannot unlock it if it's not mine  
    let checkLock = { _id, __lockedby : email };

    // Convert everything to the correct Javascript/BSON type as it's all
    // sent as strings from the UI,  also sanitises any Javascript injection
    
    const {docTypeSchemaInfo} =  await context.functions.execute("getDocTypeSchemaInfo",namespace);
    
    
    let typedUpdates = utilityFunctions.castDocToType(untypedUpdates,docTypeSchemaInfo);
    
     
    let unlockRecord = { $unset : { __locked: 1, __lockedby: 1, __locktime: 1}};
    let sets = {$set: typedUpdates};
   
  
    try {
      
    // If we have any edits to arrays - we first, unfortunately need to ensure that in the document
    // Those are existing arrays as if we do {$set:{"a.0":1}} and a is not an array (i.e null) 
    // then we get {a:{"0":1}} not {a:[1]} - MongoDB cannot tell which we want.
    // we push this down as a pipeline update usin the $ifNull expresssion

    if(!asCreate) {
      
    // Find all the array fields we are trying to add
    // And flag them for ensureArrays below
    let arrayPaths = {} ;
    for(const fieldName of Object.keys(typedUpdates)) {
       const {arrayFieldName,locationOfIndex} = utilityFunctions.refersToArrayElement(fieldName); 
       //If this is and array flag it as such
       if(locationOfIndex != -1) {
           arrayPaths[arrayFieldName] = true;
         }
       }
       
      let arrayFields = Object.keys(arrayPaths);
      if(arrayFields.length > 0) {
        let ensureArray = {};
        //For each field, if it's null then set it to square brackets
        for( let arrayField of arrayFields) {
          ensureArray[arrayField] = { $ifNull : [ `\$${arrayField}`,[] ]};
        }
        //Now apply that updateOne
  
        const { matchedCount, modifiedCount }= await collection.updateOne(checkLock,[{$set:ensureArray}]);
       
      }
    }
    
     //Also record all arrays where we are deleting an element 
    let deletePulls = {};
    for(const fieldName of Object.keys(typedUpdates)) {
      if(typedUpdates[fieldName] == "$$REMOVE") {
         const {arrayFieldName,locationOfIndex} = utilityFunctions.refersToArrayElement(fieldName); 
         deletePulls[arrayFieldName] = "$$REMOVE";
      }   
    }
     let pulls = {$pull: deletePulls};
     
      if(Object.keys(deletePulls).length == 0 )
      {
      
        const setAndUnlock = { ...sets, ...unlockRecord };
        postCommit = await collection.findOneAndUpdate(checkLock,setAndUnlock,{returnNewDocument: true});
        rval.ok = true;
        rval.currentDoc = postCommit;
      } else {
        await collection.updateOne(checkLock,sets,{returnNewDocument: true});
        const removeElementsAndUnlock = { ...pulls,...unlockRecord};
        postCommit = await collection.findOneAndUpdate(checkLock,removeElementsAndUnlock,{returnNewDocument: true});
        rval.ok = true;
        rval.currentDoc = postCommit;
      }
    } catch(e) {
      console.log(`Error in commitEdit: ${e}`);
      //We couldn't find it or we weren't editing it that's OK - maybe it was stolen
       postCommit = await collection.findOne({_id},{__locked:0,__lockedby:0,__locktime:0});
       rval.currentDoc = postCommit;
    } 
    return rval;

};