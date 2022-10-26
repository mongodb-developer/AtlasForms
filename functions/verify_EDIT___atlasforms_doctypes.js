/* Duplicate this function to use it for your doctype */

/* Functions named verify_ACTION_database_collection 
   Can be used to apply addidtional restrictions to an action 
   the gran object lets you deny the actions and add a message
   you can also modify the arguments which vary by action */
   
   
function verify(grant,targetRecord,proposedEdit)
{
    grant.granted=true;
    grant.message = `Because it's against the rules.`
    if(proposedEdit && proposedEdit.schema ) {
      try{
        if(proposedEdit.schema.length >3)
        {
          JSON.parse(proposedEdit.schema)
        }
      } catch(e) {
        console.log("NOPE Bad Schema!")
        grant.message = `Schema is invalid JSON - ${e}`;
        grant.granted=false;
      }
    }
    //console.log(JSON.stringify(proposedEdit));
    return true; //True - it made a change
}

exports = function(){
  //Dont call the function - just return it so we can call it by reference.
  return verify;
};