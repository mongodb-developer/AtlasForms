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
    
    let isAvailable = { _id,  __lockstate : null }
    
    let getLock = collection.findOneAndUpdate(isAvailable)
    return {arg: arg};
};