/* This class handles all authorization (AUTHZ) for the application */
/* App Services does have authorization built in but in general it's*/
/* AUTHZ by configuration (you can attach a function) - this is */
/* Pure AUTHZ by code so you can define it any way you want.*/

class Authorization {


  constructor() {
    this.USER_MANAGER = "USER_MANAGER";    /* Can Manage other users*/
    this.DOCTYPE_MANAGER = "DOCTYPE_MANAGER"; /* Can edit Doctypes, Add data sources */
    this.PICKLIST_MANAGER = "PICKLIST_MANAGER"; /* Can edit dropdown*/
    this.READ_DOCTYPE = "ACCESS"; /* User can see a given doctype */
    this.CREATE_DOCTYPE = "CREATE"; /* User can create a given doctype */
    this.EDIT_DOCTYPE = "EDIT"; /* User can edit given doctype */
    this.READ_DOCUMENT = "READDOC"; /* User can read a specific document (Can query)*/
  }

  async lookupUser(user) {
    // TODO:error handling
    const userCollection = context.services.get("mongodb-atlas").db('__atlasforms').collection('users');
    this.userRecord = await userCollection.findOne({ _id: user })

  }

  /* Return True is the user may do this , False if they may not*/

  async authorize(type, docType, targetRecord, ...args) {

    // console.log(`Request AUTHZ: ${type} ${docType?.namespace} ${targetRecord?._id}`);

    let grant = { granted: false, message: "" }

    if (this.userRecord == null) {
      grant.granted = false;
      grant.message = 'Unknown User';
      return grant;
    }

    if (this.userRecord.isSuperUser) {

      grant.granted = true; /* Could still be denied by function*/
    }

    /*****************************/

    /* Change this for whatever permission model you want */
    /* This can handle both security and business rules */
    /* Even call out to a custom function based on the docype if it exists */

    //Simple one - Check user record permissions - This is a global permissions
    //If we cannot do this we cannot see the doctype

    if ([this.READ_DOCTYPE, this.READ_DOCUMENT, this.EDIT_DOCTYPE, this.CREATE_DOCTYPE].includes(type)) {
      grant.message = "Not Allowed";
      for (const permission of this.userRecord.permissions) {
        if (permission.item == docType.namespace &&
          permission.permissions.split(',').includes(type)) {
          grant.granted = true;
          grant.message = ""
        }
      }
    }
    
    

    /* Execute a custom function for each operations/namspace combo*/
    /*This can override the default*/

    try {
      if (docType) {
        //This is called even for superusers
        const fname = `verify_${type}_${docType.namespace.replace(/\./g, '_')}`
        const verify_fn = context.functions.execute(fname);
        if (verify_fn) {
          verify_fn(grant, targetRecord, ...args); 
        }
      }
    } catch (e) {
      if (e.message.includes('function not found')) {
        //console.log(`No Custom Permissions Function ${e}`)
      } else {
        console.log(e);
      }

      //console.log(`Granted: ${grant.granted}`)
    }

    /****************************/

    return grant;
  }
}

exports = async function (user) {
  const authClass = new Authorization()
  await authClass.lookupUser(user); /* Cannot use await in a constructor*/
  if (!authClass.userRecord) {
    console.log(`No User Permissions for ${user}`);
    return null;
  }
  return authClass;
};