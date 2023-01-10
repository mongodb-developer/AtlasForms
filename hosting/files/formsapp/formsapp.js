'use strict'
/* global getBsonType, appStrings, Vue, getFieldValue,atlasAppConfig,
   toDateTime,formatFieldname,sortListviewColumn,watchColumnResizing,
   onListviewColumnResize , Realm */

let vueApp

function classFromType (valtype) {
  let rval = 'af_small'

  // Document and Array field wrappers have their own class
  if (['document', 'array'].includes(getBsonType(valtype))) {
    rval = ' af_newline'
  } else {
    if (valtype.startsWith('string')) {
      const size = valtype.split(':')[1]
      if (size > 30) { rval = 'af_medium' };
      if (size > 150) { rval = 'af_large' };
    }
  }
  return ' ' + rval /* Non Strings can be type small */
}

async function logOut (email, password) {
  try {
    await vueApp.realmApp.currentUser.logOut()
    window.location.replace('../login/login.html')
  } catch (e) {
    console.error(e)
  }
}

// Fetch the list of document types I can interact with from the server*/

async function getListOfDocTypes () {
  try {
    const docTypes = await vueApp.realmApp.currentUser.functions.getListOfDoctypes()
    return docTypes
  } catch (e) {
    console.error(e)
    return []
  }
}

// Pop up out custom alert dialog thingy
function formAlert (message) {
  vueApp.show_modal = true
  vueApp.modal_content = message || '[Error Message Missing !]'
}

async function clearForm () {
  // TODO maybe - add an Are you sure? if they have been entering data
  vueApp.results = []
  vueApp.currentDoc = { doc: {} }
  vueApp.editing = true
  vueApp.textquery = ''
  // Editable divs we changed need manually cleared
  for (const id of Object.keys(vueApp.fieldEdits)) {
    if (document.getElementById(id)) {
      document.getElementById(id).innerText = ''
      document.getElementById(id).value = null
    }
  }
  vueApp.fieldEdits = {}
}

async function editRecord () {
  if (vueApp.currentDoc?.doc?._id == null) {
    formAlert(appStrings.AF_NO_OPEN_FOR_EDIT)
    return
  }

  /* We need to Lock it before they can edit it, and fetch the latest version */
  const lockResult = await vueApp.realmApp.currentUser.functions.lockDocument(vueApp.selectedDocType, vueApp.currentDoc.doc._id)

  if (lockResult.ok) {
    // We got the lock
    vueApp.editing = true
    vueApp.currentDocLocked = true
    vueApp.currentDoc.doc = lockResult.currentDoc
  } else {
    // Tell them Why not
    // TODO - Perhaps offer a 'Steal Lock' option in future depending
    // How long it's been locked for
    formAlert(appStrings.AF_DOC_CANNOT_LOCK(lockResult.message))
  }
}

// TODO - combine commit and Cancel client and server end for clarity

async function commitEdit (cancel) {
  if (vueApp.currentDoc === {} || vueApp.currentDoc == null ||
    vueApp.currentDoc === undefined || vueApp.currentDoc.doc._id == null || !vueApp.currentDocLocked) {
    formAlert(appStrings.AF_NOT_LOCKED)
    return
  }

  if (cancel === true) {
    vueApp.fieldEdits = {}
  }
  const commitResult = await vueApp.realmApp.currentUser.functions.commitEdit(vueApp.selectedDocType,
    vueApp.currentDoc.doc._id, vueApp.fieldEdits)

  if (commitResult.ok) {
    vueApp.currentDocLocked = false
    vueApp.fieldEdits = {}
    // If we change current Doc to a different Doc but with the same values
    // Vue thinks it doesnt need to update anything, but we want to overwrite
    // The things we edited manually that aren't in the model
    vueApp.currentDoc.doc = {} // This forces Vue to rerender divs we edited manually
    await Vue.nextTick() // As the valuses change from nothing to the same value.
    vueApp.currentDoc.doc = commitResult.currentDoc // Revert to latest server version
    vueApp.editing = false
  } else {
    // Tell them Why not
    // TODO - Perhaps offer a 'Steal Lock' option in future depending
    // How long it's been locked for
    console.log(appStrings.AF_DOC_CANNOT_LOCK(commitResult.message))
    formAlert(appStrings.AF_DOC_CANNOT_LOCK(commitResult.message))
  }
}

async function newRecord () {
  if (vueApp.fieldEdits._id !== undefined && vueApp.fieldEdits._id !== '') {
    formAlert(appStrings.AF_NO_MANUAL_ID)
    return
  }

  const { ok, message, currentDoc } = await vueApp.realmApp.currentUser.functions.createDocument(vueApp.selectedDocType, vueApp.fieldEdits)
  if (ok && currentDoc) {
    const wrappedDoc = { downloaded: true, doc: currentDoc }
    vueApp.results = [wrappedDoc]
    vueApp.currentDoc = wrappedDoc
    vueApp.editing = false
    vueApp.fieldEdits = {}
  } else {
    formAlert(appStrings.AF_DOC_CANNOT_CREATE(message))
  }
}

async function resultClick (result) {
  if (result.downloaded === false) {
    console.log(result)
    /* Download the full doc when we select it */
    const { ok, message, results } = await vueApp.realmApp.currentUser.functions.queryDocType(
      vueApp.selectedDocType
      , { _id: `${result.doc._id}` }, {})
    if (ok) {
      result.doc = results[0]
      result.downloaded = true
    } else {
      formAlert(appStrings.AF_SERVER_ERROR(message))
    }
  }
  vueApp.editing = false
  vueApp.currentDoc = result
}
// We use this to track editied controls so we can send an update to
// Atlas also because we are editing InnerText rather than using a control we can't bind to it.
// Also we want to keep the original verison anyway.

function formValueChange (event) {
  const element = event.target
  const fieldName = element.id
  let evalue = ''

  // If it'a a DIV take the text, if not take the value
  if (element.nodeName === 'INPUT' || element.nodeName === 'SELECT') {
    evalue = element.value
    this.value = evalue
  } else {
    evalue = element.innerText

    // If this is not acceptable (letters in a number for example)
    // Set it back to the previous value and place the cursor at the end

    /* Allow > and < in front of numbers */

    if (['number', 'int32', 'int64', 'decimal128'].includes(element.getAttribute('data-bsontype'))) {
      const trimmed = evalue.replace(/^[>< ]*/, '')
      if (isNaN(Number(trimmed))) {
        element.innerText = vueApp.fieldEdits[fieldName] ? vueApp.fieldEdits[fieldName] : ''
        const range = document.createRange()
        const sel = window.getSelection()
        try {
          range.setStart(element, 1)
          range.collapse(true)
          sel.removeAllRanges()
          sel.addRange(range)
        } catch (e) { /* Can fail if empty */ }
        return
      }
    }
  }

  vueApp.fieldEdits[fieldName] = evalue
}

function addArrayElement (name) {
  /* array or object.array are the paths we support, no array nesting */
  const pathParts = name.split('.')
  const workingDoc = vueApp.currentDoc.doc
  let workingArray = null
  let elementBsonType = null
  if (pathParts.length > 2) return false /* Not supported */

  /* It's possible to click delete when there is nothing actually in the array yet
     Add a dummy entrry - content doesnt matter but make it an object so iterable
     Alternative is to clear the entries in element 0 if it's empty */

  if (pathParts.length === 2) {
    const arraySchema = vueApp.selectedDocTypeSchema[pathParts[0]][pathParts[1]]
    elementBsonType = getBsonType(arraySchema[0])
    if (workingDoc[pathParts[0]] === undefined) {
      workingDoc[pathParts[0]] = { [pathParts[1]]: [elementBsonType === 'document' ? { _xyzzy_: 1 } : ''] }
    }
    if (workingDoc[pathParts[0]][pathParts[1]] === undefined) {
      workingDoc[pathParts[0]][pathParts[1]] = [elementBsonType === 'document' ? { _xyzzy_: 1 } : '']
    }
    workingArray = workingDoc[pathParts[0]][pathParts[1]]
  } else {
    const arraySchema = vueApp.selectedDocTypeSchema[pathParts[0]]
    elementBsonType = getBsonType(arraySchema[0])
    // pathPart[0] is an array
    if (workingDoc[pathParts[0]] === undefined) {
      workingDoc[pathParts[0]] = [elementBsonType === 'document' ? { _xyzzy_: 1 } : '']
    }
    workingArray = workingDoc[pathParts[0]]
  }
  if (elementBsonType === 'document') {
    workingArray.push({ __xyxxy__: 1 })
  } else {
    workingArray.push('')
  }
}

function deleteArrayElement (name, index) {
  /* array or object.array are the paths we support, no array nesting */
  const pathParts = name.split('.')
  const workingDoc = vueApp.currentDoc.doc
  let workingArray = null

  if (pathParts.length > 2) return false /* Not supported */

  /* It's possible to click delete when there is nothing actually in the array yet
     Add a dummy entrry - content doesnt matter but make it an object so iterable
     Alternative is to clear the entries in element 0 if it's empty */

  if (pathParts.length === 2) {
    if (workingDoc[pathParts[0]] === undefined) { workingDoc[pathParts[0]] = { [pathParts[1]]: [{ _xyzzy_: 1 }] } }
    if (workingDoc[pathParts[0]][pathParts[1]] === undefined) { workingDoc[pathParts[0]][pathParts[1]] = [{ _xyzzy_: 1 }] }
    workingArray = workingDoc[pathParts[0]][pathParts[1]]
  } else {
    // pathPart[0] is an array
    if (workingDoc[pathParts[0]] === undefined) { workingDoc[pathParts[0]] = [{ _xyzzy_: 1 }] }
    workingArray = workingDoc[pathParts[0]]
  }

  /* Record what we want ot remove in our list of edits as $$REMOVE */

  const elname = `${name}.${index}`
  vueApp.fieldEdits[elname] = '$$REMOVE'
  for (const entry of Object.keys(vueApp.fieldEdits)) {
    if (entry.startsWith(elname + '.')) {
      delete vueApp.fieldEdits[entry]
    }
  }

  // If we have removed all elements we need to add an empty one on the end
  // So users can type new data in - count how many we are removing
  let removed = 0
  const arrayLength = workingArray.length
  for (let idx = 0; idx < arrayLength; idx++) {
    if (vueApp.fieldEdits[`${name}.${idx}`] === '$$REMOVE') {
      removed++
    }
  }

  if (removed === arrayLength) {
    vueApp.addArrayElement(name) 
  }
}

async function runQuery () {
  try {
    // Send the fieldEdits to the server, we will process to the correct data type there
    // Avoid any injection also all will be strings at this point.
    const projection = {}

    for (const fieldname of vueApp.listViewFields) {
      projection[fieldname] = 1
    }

    const { ok, message, results } = await vueApp.realmApp.currentUser.functions.queryDocType(vueApp.selectedDocType
      , vueApp.fieldEdits, projection, vueApp.textquery)

    if (!ok) {
      formAlert(appStrings.AF_SERVER_ERROR(message))
      vueApp.wrappedResults = []
      vueApp.editing = true
      return
    }

    // Wrap this in something to say if we have decoded it
    const wrappedResults = []
    const downloaded = false
    for (const doc of results) {
      if(doc !== null) { wrappedResults.push({ downloaded, doc }) }
    }
  
    vueApp.results = wrappedResults

    if (results.length === 0) {
      formAlert(appStrings.AF_NO_RESULTS_FOUND)
      vueApp.editing = true
    }
  } catch (e) {
    console.error(e)
    return []
  }
}

// User has changed the dropdown for the document type
async function selectDocType () {
  vueApp.columnResizeObserver.disconnect()
  await clearForm()
  vueApp.results = Array(7).fill({}) // Adds nice visual lines to empty listviewfields

  try {
    // It would be simple to cache this info client end if we want to
    const { ok, docTypeSchemaInfo, message } = await vueApp.realmApp.currentUser.functions.getDocTypeSchemaInfo(vueApp.selectedDocType)

    // We only want to show the import button when the doctypes dropdown is selected
    if (vueApp.selectedDocType.title === 'AF_Doctypes') {
      vueApp.showImport = true
    } else {
      vueApp.showImport = false
    }

    if (!ok) {
      formAlert(appStrings.AF_SERVER_ERROR(message))
      vueApp.selectedDocType = {}
    } else {
      vueApp.fieldEdits = {}
      vueApp.selectedDocTypeSchema = docTypeSchemaInfo
      vueApp.listViewFields = vueApp.selectedDocType.listViewFields
      // We cache these

      if (vueApp.selectedDocType.picklists == null) {
        const { ok, message, picklists } = await vueApp.realmApp.currentUser.functions.getPicklists(vueApp.selectedDocType)
        if (!ok) {
          formAlert(appStrings.AF_SERVER_ERROR(message))
        } else {
          vueApp.selectedDocType.picklists = picklists
        }
      }
    }
  } catch (e) {
    console.error(e)
    vueApp.selectedDocType = {}
  }
}

function importDoc () {
  window.location.replace('../import/import.html')
}

function getLink (fieldname) {
  if (vueApp?.selectedDocType?.links) {
    for (const link of vueApp?.selectedDocType?.links) {
      if (link.fromField === fieldname) {
        // TODO - Check we can see that entity too otherwise dont show follow link
        return link
      }
    }
  }
  return false
}

// eslint-disable-next-line no-unused-vars

 async function autoSearch(namespace,query){

  if(vueApp && vueApp.docTypes && vueApp.docTypes.length>0 && vueApp.ready) {


    vueApp.selectedDocType = vueApp.docTypes?.find(e => e.namespace == namespace); //Null on empty list
    if( vueApp.selectedDocType == null) console.log(`Cannot find ${namespace} in ${JSON.stringify( vueApp.docTypes)}`)
    await vueApp.selectDocType();
    await clearForm()
    vueApp.fieldEdits=query;
    
    vueApp.editing = true; //Can edit in empty form
    await vueApp.runQuery();
    console.log(vueApp.results[0]);
    await resultClick(vueApp.results[0])
  } else {
    console.log('no vueApp ready yet, trying again')
    setTimeout(() => { autoSearch(namespace, query) }, 100)
  }
}

async function followLink (fieldname) {
  const linkInfo = getLink(fieldname)
  console.log(linkInfo)
  // TODO check we are allowed to do this

  // Open a new Tab If we don't have one for this entity type from here
  let remote = vueApp.childTabs[fieldname]

  const value = getFieldValue(vueApp.currentDoc, linkInfo.fromField)
  const query = { [linkInfo.tofield]: value }
  console.log(query)
  if (remote === undefined || remote.closed) {
    remote = window.open(window.location.href, 'fieldname')
    vueApp.childTabs[fieldname] = remote
    remote.addEventListener('load', async () => { await remote.autoSearch(linkInfo.namespace, query) }, true)
  } else {
    await remote.autoSearch(linkInfo.namespace, query)
  }
}
async function deleteEdit () {
  if (vueApp.currentDoc === {} || vueApp.currentDoc == null ||
    vueApp.currentDoc === undefined || vueApp.currentDoc.doc._id == null || !vueApp.currentDocLocked) {
    formAlert(appStrings.AF_NOT_LOCKED)
    return
  }

  const deleteResult = await vueApp.realmApp.currentUser.functions.deleteEdit(vueApp.selectedDocType,
    vueApp.currentDoc.doc._id)

  if (deleteResult.ok) {
    vueApp.currentDocLocked = false
    await clearForm()
  } else {
    // Tell them Why not
  
    console.log(appStrings.AF_DOC_CANNOT_LOCK(deleteResult.message))
    formAlert(appStrings.AF_DOC_CANNOT_LOCK(deleteResult.message))
  }
}

// eslint-disable-next-line no-unused-vars
async function formsOnLoad () {
  const { createApp } = Vue
  const realmApp = new Realm.App({ id: atlasAppConfig.ATLAS_SERVICES_APPID })

  if (realmApp.currentUser == null) {
    // We should not be here if we are not logged in
    window.location.replace('/login/login.html')
  }

  vueApp = createApp({
    methods: {
      // Method we call from  HTML
      log: console.log,
      logOut,
      selectDocType,
      formValueChange,
      runQuery,
      clearForm,
      editRecord,
      newRecord,
      toDateTime,
      getBsonType,
      watchColumnResizing,
      getFieldValue,
      formatFieldname,
      sortListviewColumn,
      commitEdit,
      resultClick,
      deleteArrayElement,
      addArrayElement,
      classFromType,
      importDoc,
      getLink,
      followLink,
      deleteEdit
    },
    data () {
      return {
        fieldEdits: {},
        results: [],
        docTypes: [],
        selectedDocType: {},
        selectedDocTypeSchema: {},
        currentDoc: { doc: {} },
        listViewFields: [],
        editing: false,
        currentDocLocked: false,
        modal_content: 'test',
        show_modal: false,
        textquery: '',
        showImport: false,
        childTabs: {},
        ready: false
      }
    },
    mounted () {
      // Non reactive data , don't want reactivity on a deep component like this.
      // So we don't add it in the data member
      // Also confiuses first login attempt for a new user with realmApp.
      this.realmApp = realmApp
      this.columnResizeObserver = new ResizeObserver(onListviewColumnResize)
    }
  }).mount('#formsapp')

  const { ok, docTypes, message } = await getListOfDocTypes()
  if (!ok) {
    formAlert(appStrings.AF_SERVER_ERROR(message))
    return
  }
  vueApp.docTypes = docTypes
  // Set the Document Type dropdown to the first value
  if (vueApp.docTypes.length > 0) {
    vueApp.selectedDocType = vueApp.docTypes?.[0] // Null on empty list
    await vueApp.selectDocType()
    vueApp.editing = true // Can edit in empty form
    vueApp.ready = true;
  } else {
    formAlert(appStrings.AF_NO_DOCTYPES)
  }
}
