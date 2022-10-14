/* This class handles all authorization (AUTHZ) for the application */
/* App Services does have authorization built in but in general it's*/
/* AUTHZ by confiuguration (you can attach a function) - this is */
/* Pure AUTHZ by code so you can define it any way you like */

class Authorization {
  constructor(user) {
    
    //Fetch the user's record
    
    this.user = user;
  }
  
  /* Return True is the user may do this , False if they may not*/
  authenticate(type,docType,targetRecord,...args) {
   let permission = { granted: false, message: ""}
   permission.granted = true;
   return permission;
  }
}

exports = function(user){
  const authClass = new Authorization(user)
};