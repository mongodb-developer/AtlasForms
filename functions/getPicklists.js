/* If we can see the Entity then fetch all picklists defined for it */

exports = async function(docType){
  
  /*Get an Authorization object - should be standard in any non private function*/
  const authorization = await context.functions.execute("newAuthorization",context.user.id);
  if( authorization == null ) { return {ok: false,  message: "User no Authorized" }; }
  
   const canSeeDoctype = await authorization.authorize(authorization.READ_DOCTYPE,docType);
   if(canSeeDoctype.granted == false) {
      return {ok:false,message:canSeeDoctype.message};
  }
      
       
  const pickListsCollection = context.services.get("mongodb-atlas").db("__atlasforms").collection("picklists");
  const pickListObj = {}
    try {
      const [database,collection] = docType.namespace.split(".");
      const pickListCursor = await pickListsCollection.find({ database,collection },{_id:0});
      const pickLists = await pickListCursor.toArray();
      console.log(JSON.stringify(pickLists))
      for( const picklist of pickLists) {
        pickListObj[picklist.fieldname] = picklist.values;
      }
    } catch(e) {
      return { ok: false, message: e};
    }
  
  
  return {ok:true,picklists: pickListObj};
};