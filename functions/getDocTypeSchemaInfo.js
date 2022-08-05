/* This returns a template document for a given type with information about the fields ,
data type AND the arrangement/order of those fields. It could also be user to return 
additional information */

/*Default will take the first record in a collection and use it to derive this information
rather than be an explicit definition */

exports = async function(docType){
    
    const [databaseName,collectionName] = docType.namespace.split('.');
    if(!databaseName || !collectionName) { return {}}
    
    
    var collection = context.services.get("mongodb-atlas").db(databaseName).collection(collectionName);
    const exampleDoc = await collection.findOne({});
    
    if(exampleDoc == null) { console.error("No example doc");
                            return {} }

  const templateDoc = documentToTemplate(exampleDoc)
  return templateDoc;
};

//Deal with data types which are objects but specific types
//Like Binary, Date, Decimal128 etc.

function getScalarType(obj)
{

  if (obj instanceof Date) return "date"
  if (obj instanceof BSON.ObjectId) return "objectid"
  if (obj instanceof BSON.Binary) return "binary"
  if (obj instanceof BSON.Int32) return "int32"
  if (obj instanceof BSON.Long) return "int64"
  if (obj instanceof BSON.Double) return "number"
  if (obj instanceof BSON.Decimal128) return "decimal128"
  return null;
}

function documentToTemplate(doc) {
  //If doc is a scalar return the type
  
  if( typeof doc != 'object') {
    return typeof doc;
  }
  
  const templateDoc = {}
  // Iterate through the members adding each to the typemap
  for ( let key of Object.keys(doc)) {
    if(typeof doc[key] == "object") {
    
      let scalarType = getScalarType( doc[key] )
      if(scalarType != null) {
         templateDoc[key] = scalarType
      } else 
      if(Array.isArray(doc[key])) {
        //If this an Array - then make it an array with whatever member 0 is
        const firstItem = doc[key][0]
         templateDoc[key] = [ documentToTemplate(firstItem) ]
      } else {
        //Special rules for handling non basic types
        templateDoc[key] = documentToTemplate(doc[key])
      }
    } else {
      templateDoc[key] = typeof doc[key]
    }
  }
  return templateDoc
}