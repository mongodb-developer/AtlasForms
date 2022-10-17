

// This just and's the values together - what it does do it cast
// Them all to the correct data type for the field as the form
// Thinks the numbers are strings

exports = async function(namespace,untypedUpdates){

    //We don't allow _id to be specified here but will accept an empty
    //String as unspecificed
    
    if(untypedUpdates._id == "" || untypedUpdates._id==null) {
       delete  untypedUpdates._id
    }
    
    if(untypedUpdates._id != undefined) {
      //Providng an _id is not allowed *Design decision* 
      //Icky hack on error message reuse
      return { ok: false, errorField: "_id", errorType: "supplied"};     
    }
    
    const utilityFunctions =  await context.functions.execute("utility_functions")
  
    if (untypedUpdates == null || untypedUpdates == {} ) { return {}; }
    
    const [databaseName,collectionName] = namespace.split('.');
    //TODO - verify we have permission to write to this
    
    if(!databaseName || !collectionName) { return {}}
    
    // Convert everything to the correct Javascript/BSON type 
    // As it's all sent as strings from the form, 
    // also sanitises any Javascript injection
    
    const objSchema =  await context.functions.execute("getDocTypeSchemaInfo",namespace)

   
    let updates = {}
    let arrayPaths = {}
    for( let field of Object.keys(untypedUpdates) )
    {
      let arrayPath = []
      let parts = field.split('.')
      let subobj = objSchema
      for(const part of parts) {
        subobj = subobj[part]
        //Record if this is in an array (see IMPORTANT comment below)
        if(!isNaN(part)) {
          //A Numeric key means an Array for use
          arrayPaths[arrayPath.join(".")] = true;
        }
        arrayPath.push(part)
      }
      //Now based on that convert value and add to our new query
      let correctlyTypedValue = utilityFunctions.correctValueType(untypedUpdates[field],subobj)
      console.log(correctlyTypedValue)
      if(correctlyTypedValue == null) {
        console.error("Bad Record Summitted")
        //Check here and if we cannot cast the value sent to the correct data type
        //When inserting or updating - so they typed yes in a numeric field for example
        //We should raise an error - the GUI should prevent this though.
        return { ok: false, errorField: field, errorType: subobj};   
      }
  
      updates[field] = correctlyTypedValue
      
    }

    console.log(JSON.stringify(updates))
    let results
    const collection = context.services.get("mongodb-atlas").db(databaseName).collection(collectionName);
    try {
      //We aren't going to use insertOne here, we have a list of fields we want ti set so we will to an update with upsert
      //and also grab the final document and return it
      
      //IMPORTANT: This highlights a Bug/Feature  in MongoDB. If you do update { $set : { "a.0" : 5 } }
      //MongoDB doesn't make { "a" : [ 5] } it makes {"a" : { "0": 5}} - this is not what we want if that field
      //Is an array so in both insert and update we need to compensate for that. MongoDB cannot know if you want an
      //array or document really.
      
      //We want a fix for this that not only works for an insert - where we could just construct the whole array but also
      //For an update where we are being given 1 or more array members but don't know if we need to construct the array
      //or modify it
      
      //The only thing we can do is work out which array fields we are updating then insert a record with those already set 
      //Or in the case of an edit update to set them to an array
      console.log(`Arrays being modified: ${JSON.stringify(arrayPaths)}`)
      
      //This is a create so we just need to insert the document with all the arrays in place
      
      if(updates._id == null) { updates._id = new BSON.ObjectId() } //TODO - Change this to something better
      
      //Do we have arrays being modified
      if(Object.keys(arrayPaths).length > 0) {
        const newDoc = {_id:update._id} //Use our new ID
        for(let arrayPath of Object.keys(arrayPaths))
        {
          const pathParts = arrayPath.split('.');
          switch(pathParts.length) {
            case 1:
              newdoc[pathparts[0]] = []; //Top level aray si easy
              break;
            case 2:
              //Array in a subdocument - we may have >1 array in our subdocument
              if( newDoc[pathparts[0]] == undefined) {
                newDoc[pathparts[0]] = {}
              }
              newDoc[pathparts[0]][pathparts[1]] = []
          }
        }
        rval = collection.insertOne(newDoc); //Insert the one with empty arrays as needed
      }
      
      rval = collection.findOneAndUpdate({_id:updates._id},updates,{upsert:true, returnNewDocument: true})
      return {ok: true, newDoc:rval}
    } catch(e) {
      console.error(error);
      return [];
    }

};