
/* This returns a template document for a given type with information about the fields ,
data types AND the arrangement/order of those fields. This is needed to provide an empty
form for Query or data entry  */

/*Default will take the first record in a collection and use it to derive this information
rather than be an explicit definition btu you could explicity define it here or read a definition from
a given collection. As it stands we just look at some of the existing docs*/

/* This will be extended to include lots more metadata like jsonSchema or similar*/


exports = async function (namespace) {
    /*Dynamically load some shared code*/
    utilityFunctions =  await context.functions.execute("utility_functions");
    
    if(namespace == "__atlasforms.doctypes" )
    {
      return  {ok: true, docTypeSchemaInfo: getSystemDocTypeSchemaInfo(namespace)};
    }
    
    //We should be able to pull this info from the doctype record
    const docTypeCollection = context.services.get("mongodb-atlas").db("__atlasforms").collection("doctypes");
    try {
    const docTypeInfo = await docTypeCollection.findOne({namespace});
    if(docTypeInfo == null ) {
        return {ok:false,message:`Cannot find doctype description for ${namespace}`}
      }
    if(docTypeInfo.schema == null) {
      /* Create a Schema and store it in the record */
      const schema = await generateDefaultSchemaInfo(namespace);
      schemaAsText = JSON.stringify(schema);
      await docTypeCollection.updateOne({_id:docTypeInfo._id},{$set:{schema:schemaAsText}})
      docTypeInfo.schema = schemaAsText;
    }
      schemaAsObj = JSON.parse(docTypeInfo.schema)
      return {ok: true, docTypeSchemaInfo: schemaAsObj};
    }
    
    catch(e) {
      return { ok: false, message: `Low level error: ${e}`}
    }
}

async function  generateDefaultSchemaInfo(namespace)
{
    
    const [databaseName, collectionName] = namespace.split('.');
    var collection = context.services.get("mongodb-atlas").db(databaseName).collection(collectionName);
    
    const removeLockingFields = { __locked:0,__lockedby:0,__lockedtime:0};
    
    //TODO - Add try/catch
    const exampleDocs = await collection.find({},removeLockingFields).limit(10).toArray();

    if (exampleDocs.length == 0) {
        console.log("No example doc");
        return {ok: false, message: `No example document for namespace ${namespace}`};
    }
    
    const templateDoc = {};
    
    for (let exampleDoc of exampleDocs) {
        addDocumentToTemplate(exampleDoc, templateDoc);
    }
    
    return templateDoc;

}



//This isn't easy to read but it converts object keys to their types
//as Strings and does a deep merge at the same time to create a schema from
//multiple docs - turns out the $mergeObjects or ... operator won't play
//due to shallow copying

function addDocumentToTemplate(doc, templateDoc) {
   
    //If doc is a simple scalar return the type
    
    if (typeof doc != 'object') {
        return typeof doc;
    }

    // Iterate through the members adding each to the typemap
    for (let key of Object.keys(doc)) {
        
        if (typeof doc[key] == "object") {

            let bsonType = utilityFunctions.getBsonType(doc[key]);
            if (['array','document'].includes(bsonType) == false) {
                templateDoc[key] = bsonType;
            } else
                if (bsonType == 'array') {
                    //If this an Array - then make it an array with whatever member 0 is
                    const firstItem = doc[key][0];
                    //It's goign to be an array so add one if we don't have it
                    if (templateDoc[key] == null) { templateDoc[key] = [] ;}


                    if (firstItem != null) { //Ignore empties
                        const existing = templateDoc[key][0];
                        if (existing) {
                            if (typeof existing == "object") {
                                templateDoc[key][0] = addDocumentToTemplate(firstItem, existing);
                            } //Not an object ignore further values
                        } else {
                            //Not existing Merge with empty obejct
                            templateDoc[key][0] = addDocumentToTemplate(firstItem, {});
                        }
                    }
                } else {
                    //Basic Objects
                    if (templateDoc[key] == null) { templateDoc[key] = {} ;}
                    templateDoc[key] = addDocumentToTemplate(doc[key], templateDoc[key]);
                }
        } else {
            templateDoc[key] = typeof doc[key];
        }
    }
    return templateDoc;

}



/* Return Schema info for the built in doc types - User and SchemaInfo */

function getSystemDocTypeSchemaInfo(namespace) {
  if(namespace == "__atlasforms.doctypes") {
    return { namespace: "string" , title: "string", schema: "string", listViewFields: ["string"]
    }
  }
}
