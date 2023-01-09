/* eslint-disable no-undef */
/* This is used to commit or cancel an edit - if untypedupdates is
not supplied or empty , then no changes are made except the unlock */

exports = async function (docType, _id, untypedUpdates) {
  /* Get an Authorization object - should be standard in any non private function */
  const authorization = await context.functions.execute('newAuthorization', context.user.id)
  if (authorization == null) { return { ok: false, message: 'User not Authorized' } }

  // Keeping EDIT and DELETE as same in basic version
  const canEditDoctype = await authorization.authorize(authorization.EDIT_DOCTYPE, docType, _id, untypedUpdates)
  if (canEditDoctype.granted === false) {
    return { ok: false, message: canEditDoctype.message }
  }


 const rval = { ok: false, message: 'No Error Message Set' }
  let postCommit = {}

  if (_id === undefined) {
    rval.message = 'No _id supplied for document being deleted.'
    return rval
  }

  const { namespace } = docType
  const [databaseName, collectionName] = namespace.split('.')
  if (!databaseName || !collectionName) {
    rval.message = `Invalid namespace ${namespace}`
    return rval
  }


  try {
   const collection = context.services.get('mongodb-atlas').db(databaseName).collection(collectionName)
   await collection.deleteOne({_id})
   return { ok: true, message: "Record Deleted Sucessfully"}
   
  } catch (e) {
    return { ok: false, message: e }
  }
}
