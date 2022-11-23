/* eslint-disable no-undef */

function rewriteArrayQuery (typedQuery, utilityFunctions) {
  /* Wherever we are querying against array elements we need to rewrite */
  /* If we have {skills.1: "archery"} and { skills.2: "weaving" } */
  /* We want to find them at any location in the array not just at positions 1 and 2 */
  /* Also if we have { skills.1.skill: "archery", skills.1.level: 3 } we */
  /* are looking for level3 archery, not any level archery and level=3 in something else */
  /* To do this we rewrite the query using $elemMatch */

  // { skills : { $elemMatch: { skill: "archery", level: 3}}}
  // We use $and for multiples
  const elementsToMatch = {}
  for (const fieldName of Object.keys(typedQuery)) {
    const { arrayFieldName, index, elementFieldName, locationOfIndex } = utilityFunctions.refersToArrayElement(fieldName)
    if (locationOfIndex !== -1) {
      if (!elementsToMatch[arrayFieldName]) { elementsToMatch[arrayFieldName] = [] }
      if (!elementFieldName) {
        elementsToMatch[arrayFieldName][index] = typedQuery[fieldName]
      } else {
        if (!elementsToMatch[arrayFieldName][index]) { elementsToMatch[arrayFieldName][index] = {} }
        elementsToMatch[arrayFieldName][index][elementFieldName] = typedQuery[fieldName]
      }
      /* Remove this from the query */
      delete typedQuery[fieldName]
    }
  }
  // Rewrite as an $and of $elemMatches
  const arrayQueryClauses = []
  for (const arrayName of Object.keys(elementsToMatch)) {
    for (const arrayElement of elementsToMatch[arrayName]) {
      // A Value of $$REMOVE is not something we want ot be searching for.
      if (arrayElement !== '$$REMOVE' && arrayElement !== '') {
        if (utilityFunctions.getBsonType(arrayElement) === 'document') {
          arrayQueryClauses.push({ [arrayName]: { $elemMatch: arrayElement } })
        } else {
          arrayQueryClauses.push({ [arrayName]: { $elemMatch: { $eq: arrayElement } } })
        }
      }
    }
  }
  if (arrayQueryClauses.length > 0) {
    typedQuery.$and = arrayQueryClauses
  }
  return typedQuery
}

// This just ANDs the values together - first though it casts
// Them all to the correct data type for the field as the form
// returns everything as a string

exports = async function (docType, query, projection, textquery) {
  const fnstarttime = new Date()
  /* Get an Authorization object - should be standard in any non private function */
  const authorization = await context.functions.execute('newAuthorization', context.user.id)
  if (authorization == null) { return { ok: false, message: 'User no Authorized' } }

  console.log(` new Authorization: ${new Date() - fnstarttime}ms `)

  // Check we can see this type at all - if we can see it we can read it.
  const canSeeDoctype = await authorization.authorize(authorization.READ_DOCTYPE, docType)
  if (canSeeDoctype.granted === false) {
    return { ok: false, message: canSeeDoctype.message }
  }

  const MAX_RESULTS = 200 /* THink carefully if you really need this larger or not */
  const { namespace } = docType

  /* Dynamically load some shared code */
  utilityFunctions = await context.functions.execute('utility_functions')

  if (query == null) { query = {} }
  const [databaseName, collectionName] = namespace.split('.')
  if (!databaseName || !collectionName) { return { ok: false, message: `Invalid namespace suppied ${namespace}` } }
  const collection = context.services.get('mongodb-atlas').db(databaseName).collection(collectionName)

  const { docTypeSchemaInfo } = await context.functions.execute('getDocTypeSchemaInfo', docType)

  // Convert everything to the correct Javascript/BSON type
  // As it's all sent as strings from the form,
  // also sanitises any Javascript injection
  //
  const forQuery = true // Used to tell it to convert > and < values
  let typedQuery = utilityFunctions.castDocToType(query, docTypeSchemaInfo, forQuery)

  /* Handle Arrays correctly */
  typedQuery = rewriteArrayQuery(typedQuery, utilityFunctions)

  /* Previously we applied $limit/limit() to the queries however as we are now trying to getDocTypeSchemaInfo
 MAX_RESULTS *after* we apply authorization we instead keep track of result size , we alo dont use toArray() now */
  const results = []
  try {
    let cursor
    // If we have a text query then send this via Atlas search
    let timestart = new Date()
    if (textquery) {
      const atlasSearch = { $search: { index: 'default', text: { query: textquery, path: { wildcard: '*' } } } }
      const pipeline = [atlasSearch]

      if (typedQuery && Object.keys(typedQuery).length > 0) {
        pipeline.push({ $match: typedQuery })
      }

      console.log(`Atlas Search: ${JSON.stringify(typedQuery, null, 2)}`)
      cursor = await collection.aggregate(pipeline)
    } else {
      console.log(`Query: ${JSON.stringify(typedQuery, null, 2)}`)
      cursor = await collection.find(typedQuery, projection)
    }
    let timeend = new Date()
    console.log(`find() took ${timeend - timestart}ms`)

    timestart = new Date()
    let doc
    do {
      doc = await cursor.next()
      const canSeeDocument = await authorization.authorize(authorization.READ_DOCUMENT, docType, doc)
      // console.log(JSON.stringify(canSeeDocument));
      if (canSeeDocument && canSeeDocument.granted === true) {
        results.push(doc)
      }
    }
    while (results.length < MAX_RESULTS && doc !== undefined)
    timeend = new Date()
    console.log(`fetching took ${timeend - timestart}ms`)
  } catch (e) {
    console.error(e)
    return { ok: false, message: `Error in Querying ${e}`, results: [] }
  }
  const fnendtime = new Date()
  console.log(`function took: ${fnendtime - fnstarttime}ms`)
  return { ok: true, results }
}
