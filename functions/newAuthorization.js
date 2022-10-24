/* This class handles all authorization (AUTHZ) for the application */
/* App Services does have authorization built in but in general it's*/
/* AUTHZ by configuration (you can attach a function) - this is */
/* Pure AUTHZ by code so you can define it any way you want.*/

class Authorization {
  
 
  constructor() {
    this.USER_MANAGER = "USER_MANAGER";    /* Can Manage other users*/
    this.DOCTYPE_MANAGER = "DOCTYPE_MANAGER"; /* Can edit Doctypes, Add data sources */
    this.READ_DOCTYPE = "READ"; /* User can see a given doctype */
    this.CREATE_DOCTYPE = "CREATE"; /* User can create a given doctype */
    this.EDIT_DOCTYPE = "EDIT"; /* User can edit given doctype */
  }
  
  async lookupUser(user) {
    // TODO:error handling
    const userCollection = context.services.get("mongodb-atlas").db('__atlasforms').collection('users');
    this.userRecord = await userCollection.findOne({_id:user})
    
  }
  
  /* Return True is the user may do this , False if they may not*/
  
  authorize(type,docType,targetRecord,...args) {
    
    let grant = { granted: false, message: ""}

    if(this.userRecord == null) { 
      grant.granted = false;
      grant.message = 'Unknown User';
      return grant;
    }
  
  if(this.userRecord.isSuperUser) {
     console.log("Caller is SuperUser");
     grant.granted = true;
     return grant;
    
  }    

  /*****************************/
  
  /* Change this for whatever permission model you want */
  /* This can handle both security and business rules */
  /* Even call out to a custom function based on the docype if it exists */
  
  //Simple one - Check user record permissions - This is a global permissions
  //If we cannot do this we cannot see the doctype
  
  if(type == this.ACCESS_DOCTYPE) {
  grant.message="Not Allowed";
   for(const permission of this.userRecord.permissions) {
     if(permission.item == docType.namespace &&
        permission.permissions.split(',').includes(type)) {
       grant.permissions = true;
       grant.message=""
     }
   }
  }

  /* Execute a custom function for each operations/namspace combo*/
  
  try {
    context.functions.execute(`verify_${type}_${docType.namespace}`,grant,targetRecord,...args);
  } catch (e) {
    //Ignore error
  }
  
  /****************************/
  
   return grant;
  }
}

exports = async function(user){
  const authClass = new Authorization()
  await authClass.lookupUser(user); /* Cannot use await in a constructor*/
  if(!authClass.userRecord) {
    console.log(`No User Permissions for ${user}`);
    return null;
  }
  return authClass;
};