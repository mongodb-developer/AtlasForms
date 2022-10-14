/* This class handles all authorization (AUTHZ) for the application */
/* App Services does have authorization built in but in general it's*/
/* AUTHZ by confiuguration (you can attach a function) - this is */
/* Pure AUTHZ by code so you can define it any way you like */

class Authorization {
  
  constructor() {
    
  }
  
  lookupUser(user) {
    const userCollection = context.services.get("mongodb-atlas").db('__atlasforms').collection('users');
    this.userRecord = userCollection.findOne({_id:user})
    
  }
  
  /* Return True is the user may do this , False if they may not*/
  
  authenticate(type,docType,targetRecord,...args) {
    let permission = { granted: false, message: ""}
       
    if(this.userRecord == null) { 
      permission.granted = false;
      permission.message = 'Unknown User';
      return permission;
    }
      

   permission.granted = true;
   return permission;
  }
}

exports = async function(user){
  const authClass = new Authorization()
  await authClass.lookupUser(user); /* Cannot use await in a constructor*/
  return authClass;
};