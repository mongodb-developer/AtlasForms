// This is for importing a document passed via url
exports = async function (namespace, importdoctypename, importurl, listviewfields) {
  
    let rval = { ok: false, message: "No Error Message Set" };
     
     /*Get an Authorization object - should be standard in any non private function*/
    // const authorization = await context.functions.execute("newAuthorization", context.user.id);
    // if (authorization == null) { return { ok: false, message: "User not Authorized" }; }
    
    namespace = "sample.dictionary";
    importdoctypename = "English";
    importurl = "https://raw.githubusercontent.com/adambom/dictionary/master/graph.json";
    listviewfields = "FUN";
     
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
       
       /* We want to better handle errors with insert.
          1. If the file is an array then import many then add to doc types and return success and catch insert errors.
          2. If the file is an object then create empty array, push object into array, insert array then add to doc types and return success and catch insert errors.
          3. If neither then simply return error message.
       */
        if(Array.isArray(filetoimport)) {
           await importcoll.insertMany(filetoimport);
           return { ok: true, message: "Successfully imported file." };
          
        }
        else if(typeof filetoimport === 'object') {
          await importcoll.insertOne(filetoimport);
          return { ok: true, message: "Successfully imported file." };
        }
        
        else {
          return { ok: false, message: 'Unsupported import type' };
        }
     }
     catch (e) {
         return { ok: false, message: `Error inserting imported file: ${e}` }
     }
 }
 
 async function fetchFile(fileUrl) {
     try {
         const response = await context.http.get({
             url: fileUrl
         });
        if(typeof(response.body.text() === 'object')) {
      
           return EJSON.parse(response.body.text());
        } 
        else {
          return EJSON.parse(response.body.text());
        }
 
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