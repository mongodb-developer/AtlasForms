exports = async function(arg){
  /* Can we see who it's running as? */
 const userCalling  = context.user
  var collection = context.services.get("mongodb-atlas").db("admin").collection("$cmd");
  var cursor = await collection.find({ listDatabases:1})
  console.log(cursor.toArray())


  
};