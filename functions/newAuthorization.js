/* This class handles all authorization (AUTHZ) for the application */
/* App Services does have authorization built in but in general it's*/
/* AUTHZ by configuration (you can attach a function) - this is */
/* Pure AUTHZ by code so you can define it any way you want.*/

class Authorization {
  
 
  constructor() {
    this.USER_MANAGER = "USER_MANAGER";   
  }
  
  async lookupUser(user) {
    const userCollection = context.services.get("mongodb-atlas").db('__atlasforms').collection('users');
    this.userRecord = await userCollection.findOne({_id:user})
    
  }
  
  /* Return True is the user may do this , False if they may not*/
  
  authorize(type,docType,targetRecord,...args) {
    
    let permission = { granted: false, message: ""}
    console.log(JSON.stringify(this.userRecord))
    if(this.userRecord == null) { 
      permission.granted = false;
      permission.message = 'Unknown User';
      return permission;
    }
  
  if(this.userRecord.isSuperUser) {
     console.log("SuperUser override");
     permission.granted = true;
  }    

   return permission;
  }
}

exports = async function(user){
  console.log(`Fetching permission for ${user}`)
  const authClass = new Authorization()
  await authClass.lookupUser(user); /* Cannot use await in a constructor*/
  if(authClass.userRecord) {
    console.log("User Permissions Loaded")
  } else {
    console.log("No User Permissions")
  }
  return authClass;
};