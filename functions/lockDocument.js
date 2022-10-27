/* This finds an existing document and set's a flag in it to say I't being edited, preventing another user
editing it - the GUI only submits physical changes so if a backend process modifies it it *might* be OK
but multiple editors changing same fields obviously needs thought from a business process perspective*/

//TODO - Make it take a namespace
exports = async function (docType, _id) {

  /*Get an Authorization object - should be standard in any non private function*/
  const authorization = await context.functions.execute("newAuthorization", context.user.id);
  if (authorization == null) { return { ok: false, message: "User not Authorized" }; }

  //Verify user can edit this kind of document
  const canLockDoctype = await authorization.authorize(authorization.EDIT_DOCTYPE, docType);
  if (canLockDoctype.granted == false) {
    return { ok: false, message: canLockDoctype.message };
  }


  let lockState = { ok: false }

  const [databaseName, collectionName] = docType.namespace.split('.');
  if (databaseName == null || collectionName == null) {
    lockState.message = `Invalid namespace ${docType.namespace}`;
    return lockState; //Invalid namespace
  }
  if (_id == "" || _id == null) {
    lockState.message = "No _id supplied in call to Lock document";
    return lockState;//Error - no useful id
  }


  //TODO - verify we have permission to write to this
  const collection = context.services.get("mongodb-atlas").db(databaseName).collection(collectionName);

  //Check it's not locked, or I already own the lock (in case of page reloaded)
  //Or lock has expired
  let user = context.user;
  let email = user.data.email;


  let isUnlocked = { __locked: null };
  let isLockedByMe = { __lockedby: email };
  let halfHourAgo = new Date();
  halfHourAgo.setMinutes(halfHourAgo.getMinutes() - 30); //The time 30 mins ago

  let isExpiredLock = { __lockTime: { $lt: halfHourAgo } }
  let checkLock = { _id, $or: [isUnlocked, isLockedByMe, isExpiredLock] }
  let lockRecord = { $set: { __locked: true, __lockedby: email, __locktime: new Date() } }

  let getLock = await collection.findOneAndUpdate(checkLock, lockRecord, { returnNewDocument: true })
  if (getLock == null) {
    //We couldn't find a record in editable state
    let getRecord = await collection.findOne({ _id }, { __locked, __lockedby, __locktime })
    lockState.currentDoc = getRecord
    if (getRecord) {
      lockState.message = `It's locked by ${getRecord__lockedby}`;
    } else {
      lockState.message = `It does not exist anymore`;
    }
  } else {
    //Grab the record details 
    lockState.ok = true;
    lockState.currentDoc = getLock
  }
  return lockState;
};