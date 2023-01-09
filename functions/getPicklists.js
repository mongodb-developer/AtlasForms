/* eslint-disable no-undef */
/* If we can see the Entity then fetch all picklists defined for it */

exports = async function (docType) {
  /* Get an Authorization object - should be standard in any non private function */
  const authorization = await context.functions.execute('newAuthorization', context.user.id)
  if (authorization == null) { return { ok: false, message: 'User no Authorized' } }

  const canSeeDoctype = await authorization.authorize(authorization.READ_DOCTYPE, docType)
  if (canSeeDoctype.granted === false) {
    return { ok: false, message: canSeeDoctype.message }
  }

  
  const pickListsCollection = context.services.get('mongodb-atlas').db('__atlasforms').collection('picklists')
  const pickListObj = {}
  try {
    const [database, collection] = docType.namespace.split('.')
    const pickListCursor = await pickListsCollection.find({ database, collection }, { _id: 0 })
    const pickLists = await pickListCursor.toArray()
    const optional = {}
    for (const picklist of pickLists) {
      pickListObj[picklist.fieldname] = picklist.values
      if (picklist.optional === false) {
        optional[picklist.fieldname] = false;
      } else {
        optional[picklist.fieldname] = true; //Default to optional 
      }
    }
    pickListObj._optional = optional;
    
    // Special case for AF_Doctypes, optioanlly list the available collections
    if( docType.namespace === '__atlasforms.doctypes') {
       pickListObj.namespace = []
      pickListObj._optional.namespace = true
      const admin = mongodb.admin();
      const dbNames = admin.getDBNames();
      for( const dbName in dbNames) {
        const db = mongodb.db(dbName);
        const collectionNames = db.getCollectionNames();
        for(const collName in collectionNames) {
          pickListObj.namespace.push(`${dbName}.${collName}`) 
        }
      }
     
    }
  } catch (e) {
    return { ok: false, message: e }
  }

  return { ok: true, picklists: pickListObj }
}
