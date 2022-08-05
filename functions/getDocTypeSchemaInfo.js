/* This returns a template document for a given type with information about the fields ,
data types AND the arrangement/order of those fields. This is needed to provide an empty
form for Query or data entry  */

/*Default will take the first record in a collection and use it to derive this information
rather than be an explicit definition btu you could explicity define it here or read a definition from
a given collection. As it stands we just look at some of the existing docs*/

exports = async function (docType) {

    //docType = { namespace: "sample_airbnb.listingsAndReviews" }
    const [databaseName, collectionName] = docType.namespace.split('.');
    if (!databaseName || !collectionName) { return {} }


    var collection = context.services.get("mongodb-atlas").db(databaseName).collection(collectionName);

    const exampleDocs = await collection.find({}).limit(10).toArray();

    if (exampleDocs.length == null) {
        console.error("No example doc");
        return {}
    }
    templateDoc = {};
    for (let exampleDoc of exampleDocs) {
        addDocumentToTemplate(exampleDoc, templateDoc)
    }
    return templateDoc;
};

//Deal with data types which are objects but specific types
//Like Binary, Date, Decimal128 etc.

function getScalarType(obj) {
    if (obj instanceof Date) return "date"
    if (obj instanceof BSON.ObjectId) return "objectid"
    if (obj instanceof BSON.Binary) return "binary"
    if (obj instanceof BSON.Int32) return "int32"
    if (obj instanceof BSON.Long) return "int64"
    if (obj instanceof BSON.Double) return "number"
    if (obj instanceof BSON.Decimal128) return "decimal128"
    return null;
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

            let scalarType = getScalarType(doc[key])
            if (scalarType != null) {
                templateDoc[key] = scalarType
            } else
                if (Array.isArray(doc[key])) {
                    //If this an Array - then make it an array with whatever member 0 is
                    const firstItem = doc[key][0]
                    //It's goign to be an array so add one if we don't have it
                    if (templateDoc[key] == null) { templateDoc[key] = [] }


                    if (firstItem != null) { //Ignore empties
                        const existing = templateDoc[key][0]
                        if (existing) {
                            if (typeof exising == "object") {
                                templateDoc[key][0] = addDocumentToTemplate(firstItem, existing)
                            } //Not an object ignore further values
                        } else {
                            //Not existing Merge with empty obejct
                            templateDoc[key][0] = addDocumentToTemplate(firstItem, {})
                        }
                    }
                } else {
                    //Basic Objects
                    if (templateDoc[key] == null) { templateDoc[key] = {} }
                    templateDoc[key] = addDocumentToTemplate(doc[key], templateDoc[key])
                }
        } else {
            templateDoc[key] = typeof doc[key] 
        }
    }
    return templateDoc

}
