/* Duplicate this function to use it for your doctype */

/* Functions named verify_ACTION_database_collection 
   Can be used to apply addidtional restrictions to an action 
   the gran object lets you deny the actions and add a message
   you can also modify the arguments which vary by action */
   
   
function verify(grant,proposedEdit)
{
    grant.granted=true;
    grant.message = ``
    console.log("Custom Validator for docType Create")
    //An exception/error should not grant access!!
    try {
  
      if(proposedEdit && proposedEdit.schema ) {
         try {
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
      

        
        if(proposedEdit && !proposedEdit.title ) {
            grant.message = `Title is mandatory`;
            grant.granted=false;
        }
        
       if(proposedEdit &&  !proposedEdit.namespace ) {
            grant.message = `Namespace is mandatory`;
            grant.granted=false;
        }
        
        if(proposedEdit && proposedEdit.namespace && proposedEdit.namespace.split('.').length != 2) {
           grant.message = `Namespace must be database.collection`;
            grant.granted=false;
        }
        
        if(proposedEdit) {
          for(let edit of proposedEdit) {
            if( edit.startsWith("listviewfields.") && proposedEdit[edit].includes("\n"))
            {
              grant.granted = false;
              grant.message += ` ${edit} has a newline in it, this is not allowed `
            }
          }
        }
    
    } catch(e) {
      grant.message = `${e}`;
      grant.granted = false; //Fail on error
    }
    
    //console.log(JSON.stringify(proposedEdit));
    return true; //True - it made a change
}

exports = function(){
  //Dont call the function - just return it so we can call it by reference.
  return verify;
};