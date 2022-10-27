// This is for importing a document passed via url
exports = async function (namespace, importdoctypename, importurl, listviewfields) {
  
   let rval = { ok: false, message: "No Error Message Set" };
    
    /*Get an Authorization object - should be standard in any non private function*/
    // const authorization = await context.functions.execute("newAuthorization", context.user.id);
    // if (authorization == null) { return { ok: false, message: "User not Authorized" }; }
    
    if(namespace == undefined || importdoctypename == undefined || importurl == undefined || listviewfields == undefined)
    {
      namespace = "sample.people";
      importdoctypename = "People";
      importurl = "https://filesamples.com/samples/code/json/sample2.json";
      listviewfields = "firstName,lastName,details";
    }

    
    if(importurl.slice(-4).toLowerCase() != 'json' )
    {
      rval = { ok: false, message: "URL not a json file" };
    }
    
    let filetoimport = await fetchFile(importurl);
    try {
        const [db, collection] = namespace.split('.');

        const importdb = context.services.get("mongodb-atlas").db(db);
        const importcoll = importdb.collection(collection);
        
        /*
        App Services doesn't support drop on an existing collection if you want to replace everything, not add to it.
        This aggregation pipeline is a workaround for this that allows you to essentially generate nothing and use $out to add nothing to the collection.
        $out is a stage that can overwrite the contents. But it has to be done on a collection and can't take passed in data.
        If the collection doesn't exist, the pipeline simply won't do anything. So this is a way of emptying a collection if it exists, otherwise doing nothing
        so it is ready to then have our fetched data written to it.
        */
        const emptyCollPipeline = [{$indexStats: {}}, {$match: {luce:"awesome"}}, {$out: collection}];
        await importcoll.aggregate(emptyCollPipeline).toArray();
        
        if(Array.isArray(filetoimport)) {
           importcoll.insertMany(filetoimport);
        }
        
        else {
          const arrayForInsert = [];
          arrayForInsert.push(filetoimport);
          importcoll.insertMany(arrayForInsert);
        }
       
        
        await addToDocTypes(namespace,importdoctypename,listviewfields);
        
        rval = { ok: true, message: "Succesfully imported to collection" };
    }
    catch (e) {
        console.log(`Error inserting imported file: ${e}`);

        return { ok: false, message: `Error inserting imported file: ${e}` }
    }
}

async function fetchFile(fileUrl) {
    try {
        const response = await context.http.get({
            url: fileUrl
        });
        
        return JSON.parse(response.body.text());

    } catch (e) {
        console.log(`Error: ${e}`);
    }
}

// As well as import the data, we want to record that this is a new entity/doc type
async function addToDocTypes(namespace,title,listviewfields) {
  let rval = { ok: false, message: "No Error Message Set" };
  
  const doctypescoll = context.services.get("mongodb-atlas").db("__atlasforms").collection("doctypes");
  
  try {
    const fields = listviewfields.split(',');
    
    if(fields.length >0) {
      const newDocType = {
        title: title,
        namespace: namespace,
        listViewFields: fields
      };
    
      doctypescoll.replaceOne({title: title}, newDocType, {upsert: true});
      rval = {ok: true, message: `Successfully added new doc type`};
    }
    
    rval = {ok: false, message: "Listview fields not present" };
  } 
  catch (e) {
    console.log(`Error adding to DocTypes: ${e}`)
    rval = {ok: false, message: `Error adding to DocTypes: ${e}`};
  }
}