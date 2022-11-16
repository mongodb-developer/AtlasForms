/* Duplicate this function to use it for your doctype */

/* Functions named verify_ACTION_database_collection 
   Can be used to apply addidtional restrictions to an action 
   the gran object lets you deny the actions and add a message
   you can also modify the arguments which vary by action */


function verify(grant, targetRecord, ...args) {
  grant.granted = true;
  targetRecord.price = ""
}

exports = function () {
  //Return the function, don't call it.
  return verify;
};