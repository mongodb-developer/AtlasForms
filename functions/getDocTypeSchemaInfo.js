/* This returns a template document for a given type with information about the fields ,
data types AND the arrangement/order of those fields. This is needed to provide an empty
form for Query or data entry  */

/*Default will take the first record in a collection and use it to derive this information
rather than be an explicit definition btu you could explicity define it here or read a definition from
a given collection. As it stands we just look at some of the existing docs*/


exports = async function (docType) {

    /*Get an Authorization object - should be standard in any non private function*/
    const authorization = await context.functions.execute("newAuthorization", context.user.id);
    if (authorization == null) { return { ok: false, message: "User no Authorized" }; }

    //TODO - Change this to a specific security check that let's us manipulate the schema per person */
    //For now it's see the whole schema if you can read the doc.

    const canSeeDoctype = await authorization.authorize(authorization.READ_DOCTYPE, docType);
    if (canSeeDoctype.granted == false) {
        return { ok: false, message: canSeeDoctype.message };
    }


    /*Dynamically load some shared code*/
    utilityFunctions = await context.functions.execute("utility_functions");
    const { namespace } = docType;

    if (["__atlasforms.doctypes", "__atlasforms.picklists"].includes(namespace)) {
        return { ok: true, docTypeSchemaInfo: getSystemDocTypeSchemaInfo(namespace) };
    }

    //We should be able to pull this info from the doctype record
    const docTypeCollection = context.services.get("mongodb-atlas").db("__atlasforms").collection("doctypes");
    try {
        const docTypeInfo = await docTypeCollection.findOne({ namespace });
        if (docTypeInfo == null) {
            return { ok: false, message: `Cannot find doctype description for ${namespace}` };
        }
        if (docTypeInfo.schema == null || docTypeInfo.schema.length < 3) {
            /* Create a Schema and store it in the record */
            console.log(JSON.stringify(docTypeInfo))
            const schema = await generateDefaultSchemaInfo(namespace);
            schemaAsText = JSON.stringify(schema, null, 2);
            await docTypeCollection.updateOne({ _id: docTypeInfo._id }, { $set: { schema: schemaAsText } });
            docTypeInfo.schema = schemaAsText;
        }

        let schemaAsObj = {};
        try {
            schemaAsObj = JSON.parse(docTypeInfo.schema);
        } catch (e) {
            return { ok: false, message: `Cannot parse schema for ${namespace} error ${e}` };
        }


        return { ok: true, docTypeSchemaInfo: schemaAsObj };
    }
    catch (e) {
        return { ok: false, message: `Low level error: ${e}` };
    }
}

async function generateDefaultSchemaInfo(namespace) {
    console.log(`Generating New Scheme for ${namespace}`)
    const [databaseName, collectionName] = namespace.split('.');
    var collection = context.services.get("mongodb-atlas").db(databaseName).collection(collectionName);

    const removeLockingFields = { __locked: 0, __lockedby: 0, __lockedtime: 0 };

    //TODO - Add try/catch
    const exampleDocs = await collection.find({}, removeLockingFields).limit(10).toArray();

    if (exampleDocs.length == 0) {
        console.log("No example doc");
        return { ok: false, message: `No example document for namespace ${namespace}` };
    }

    const templateDoc = {};

    for (let exampleDoc of exampleDocs) {
        addDocumentToTemplate(exampleDoc, templateDoc);
    }

    console.log(JSON.stringify(templateDoc, null, 2));
    return templateDoc;

}



/*This isn't easy to read but it converts object keys to their types
  as Strings and does a deep merge at the same time to create a schema from
  multiple docs - turns out the $mergeObjects or ... operator won't play
 due to shallow copying*/

/* Also tries to estimate max length of strings */

function addDocumentToTemplate(doc, templateDoc) {

    //If doc is a simple scalar return the type

    if (typeof doc != 'object') {
        /*This is scalars in an array*/
        let doctype = typeof (doc)
        if (doctype == 'string') {
            doctype = `${doctype}:${doc.length}`
        }
        return doctype;
    }

    // Iterate through the members adding each to the typemap
    for (let key of Object.keys(doc)) {

        if (typeof doc[key] == "object") {

            let bsonType = utilityFunctions.getBsonType(doc[key]);
            if (['array', 'document'].includes(bsonType) == false) {
                /* This is for Scalars which are bson objects like Date */
                templateDoc[key] = bsonType;


            } else
                if (bsonType == 'array') {
                    //If this an Array - then make it an array with whatever member 0 is
                    const firstItem = doc[key][0];
                    //It's goign to be an array so add one if we don't have it
                    if (templateDoc[key] == null) { templateDoc[key] = []; }


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
                    if (templateDoc[key] == null) { templateDoc[key] = {}; }

                    templateDoc[key] = addDocumentToTemplate(doc[key], templateDoc[key]);
                }
        } else {
            /* This is for scalar members of an object*/

            let docType = typeof (doc[key])
            const oldType = templateDoc[key]


            //Add length to strings - take largest we find
            if (docType == "string") {
                const len = doc[key].length;
                if (oldType != undefined) {
                    const parts = oldType.split(':')

                    if (parts.length == 2) {
                        if (len > parts[1]) {
                            docType = `${docType}:${len}`
                        } else {
                            docType = oldType;
                        }
                    }
                } else {
                    docType = `${docType}:${len}`
                }
            }
            templateDoc[key] = docType

        }
    }
    return templateDoc;

}

/* Return Schema info for the built in doc types - User and SchemaInfo */

function getSystemDocTypeSchemaInfo(namespace) {
    if (namespace == "__atlasforms.doctypes") {
        return { _id: "objectid", namespace: "string", title: "string", schema: "string:1000", listViewFields: ["string"] };

    }

    if (namespace == '__atlasforms.picklists') {
        return { _id: "objectid", database: "string", collection: "string", fieldname: "string", values: ["string"] };
    }
}