/* Duplicate this function to use it for your doctype */

/* Functions named verify_ACTION_database_collection
   Can be used to apply addidtional restrictions to an action
   the gran object lets you deny the actions and add a message
   you can also modify the arguments which vary by action */

function verify (grant, targetRecord, ...args) {
  // You can assume yes and then deny or assume no then allow
  // If you assume yes use a try/catch to ensure you don't allow
  // on a bug.

  grant.granted = false
  grant.message = 'Because it\'s against the rules.'
}

exports = function () {
  // Return the function, don't call it.
  return verify
}
