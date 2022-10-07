

// This just and's the values together - what it does do it cast
// Them all to the correct data type for the field as the form
// Thinks the numbers are strings

exports = async function(namespace,_id,untypedUpdates){
  rval = { commitSuccess: false }
  
  const utilityFunctions =  await context.functions.execute("utility_functions")
    
  if(_id == undefined) {
     //If we don't have and _id we cannot edit
      return rval;   
  }
    
  if (untypedUpdates == null || untypedUpdates == {} ) { return rval; }
    
    const [databaseName,collectionName] = namespace.split('.');
    //TODO - verify we have permission to write to this
    const collection = context.services.get("mongodb-atlas").db(databaseName).collection(collectionName);
      
    //TODO - any server side change like a 'last update date'
    
    if(!databaseName || !collectionName) { return rval;}
    
    // Convert everything to the correct Javascript/BSON type 
    // As it's all sent as strings from the form, 
    // also sanitises any Javascript injection
    
    const objSchema =  await context.functions.execute("getDocTypeSchemaInfo",docType)

    let updates = {}
    for( let field of Object.keys(untypedUpdates) )
    {
      let parts = field.split('.')
      let subobj = objSchema
      for(const part of parts) {
        subobj = subobj[part]
      }
      //Now based on that convert value and add to our new query
      let correctlyTypedValue = utilityFunctions.correctValueType(untypedUpdates[field],subobj)
      if(correctlyTypedValue == null) {
        console.error("Bad Record Summitted")
        //Check here and if we cannot cast the value sent to the correct data type
        //When inserting or updating - so they types yes in a numeric field for example
        //We should raise an error
        return rval;
      }
      updates[field] = correctlyTypedValue
    }

    let user = context.user;
    let email = user.data.email;
    
    //Cannot unlock it if it's not mine  
    let isLockedByMe = { __lockedby : email };
    let checkLock = { _id, $or : [ isLockedByMe] };
    let unlockRecord = { $unset : { __locked: 1, __lockedby: 1, __locktime: 1}, $set: updates};
    
    let postCommit;
    
    try {
      postCommit = await collection.findOneAndUpdate(checkLock,unlockRecord,{returnNewDocument: true});
      rval.commitSuccess = true;
      rval.currentDoc = postCommit;
    } catch(e) {
      //We couldn't find it or we weren't editing it that's OK - maybe it was stolen
       postCommit = await collection.findOne({_id},{__locked,__lockedby,__locktime});
       rval.currentDoc = postCommit;
    } 
    return rval;

};