/* This finds an existing document and set's a flag in it to say I't being edited, preventing another user
editing it - the GUI only submits physical changes so if a backend process modifies it it *might* be OK
but multiple editors changing same fields obviously needs thought from a business process perspective*/

exports = async function(docType,_id){
    let lockState = { lockObtained: false }
    
    const [databaseName,collectionName] = docType.namespace.split('.');
    if(databaseName == null || collectionName ==null  )
    {
      return lockState; //Invalid namespace
    }
    if(_id == "" || _id==null) {
      return lockState;//Error - no useful id
    }
    
    
    //TODO - verify we have permission to write to this
    const collection = context.services.get("mongodb-atlas").db(databaseName).collection(collectionName);
    
    //Check it's not locked, or I already own the lock (in case of page reloaded)
    //Or lock has expired
    let user = context.user
    let email = user.data.email
    
   
    let isUnlocked = { __locked: null }
    let isLockedByMe = { __lockedby : email }
    let halfHourAgo = new Date();
    halfHourAgo.setMinutes(haslHourAgo.getMinutes() - 30 ) //THe time 30 mins ago
    
    let isExpiredLock = { __lockTime : { $lt : halfHourAgo}}
    let checkLock = { _id, $or : [ isUnlocked,isLockedByMe,isExpiredLock] }
    let lockRecord = { $set : { __locked: true, __lockedby: email, __lockTime: new Date()}}
    
    let getLock = await collection.findOneAndUpdate(checkLock,lockRecord,{returnDocument: "after"})
    if(getLock == null) {
      //We couldn't find a record in editable state
       let getRecord = await collection.findOne({_id},{__locked,__lockedby,__lockTime})
       lockState.currentDoc = getRecord
    } else {
      //Grab the record details 
      lockState.lockObtained = true;
      lockState.currentDoc = getLock
    }
    return lockState;
};