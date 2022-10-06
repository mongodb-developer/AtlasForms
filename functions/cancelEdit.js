/*Call this on a documentyou are editing to cancel the changes and revert*/

exports = async function(docType,_id){
    let lockState = { lockReleased: false }
    
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
    let user = context.user;
    let email = user.data.email;
    
    //Cannot unlock it if it's not mine  
    let isLockedByMe = { __lockedby : email };
    let checkLock = { _id, $or : [ isLockedByMe] };
    let unlockRecord = { $unset : { __locked: 1, __lockedby: 1, __locktime: 1}};
    
    let getUnlock = await collection.findOneAndUpdate(checkLock,lockRecord,{returnNewDocument: true});
    
    if(getUnlock == null) {
      //We couldn't find it or we weren't editing it that's OK - maybe it was stolen
       getUnlock = await collection.findOne({_id},{__locked,__lockedby,__locktime});
       lockState.currentDoc = getUnlock;
    } else {
      lockState.lockReleased = true;
      lockState.currentDoc = getUnlock;
    }
    return lockState;
};