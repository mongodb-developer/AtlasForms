

// This just and's the values together - what it does do it cast
// Them all to the correct data type for the field as the form
// Thinks the numbers are strings

exports = async function(docType,untypedUpdates){
  const utilityFunctions =  await context.functions.execute("utility_functions")
  
    if (untypedUpdates == null || untypedUpdates == {} ) { return {}; }
    
    const [databaseName,collectionName] = docType.namespace.split('.');
    //TODO - verify we have permission to write to this
    
    if(!databaseName || !collectionName) { return {}}
    
    // Convert everything to the correct Javascript/BSON type 
    // As it's all sent as strings from the form, 
    // also sanitises any Javascript injection
    
    const objSchema =  await context.functions.execute("getDocTypeSchemaInfo",docType)

   
    let updates = {}
    for( let field of Object.keys(untypedUpdates) )
    {
      let parts = field.split('.')
      let subobj = objSchema
      for(const part of parts) {
        subobj = subobj[part]
      }
      //Now based on that convert value and add to our new query
      let correctlyTypedValue = correctValueType(untypedUpdates[field],subobj)
      
      if(correctlyTypedValue != null && correctlyTypedValue!="") {
        //Don't store empty fields
        updates[field] = correctlyTypedValue
      }
    }


    let results
    var collection = context.services.get("mongodb-atlas").db(databaseName).collection(collectionName);
    try {
      //We aren't going to use insertOne here, we have a list of fields we want ot set so we will to an update with upsert
      //and also grab the final document and return it
      if(updates._id == null) { updates._id = new BSON.ObjectId() } //TODO - Change this to something better
      rval = collection.findOneAndUpdate({_id:updates._id},updates,{upsert:true, returnNewDocument: true})
      return rval;
    } catch(e) {
      console.error(error);
      return [];
    }

};