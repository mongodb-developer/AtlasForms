exports = async function(authEvent) {

    const userdata = context.services.get("mongodb-atlas").db("__atlasforms").collection("users");
    
    //Check if there are any existing users - if this is the first ever user they are a 'superuser'
   
    let isSuperUser = false;
    const superuser = await userdata.findOne({}); //Should we check if there is a superuser?
    if(superuser == null) {
      isSuperUser = true;
    }
    //TODO - figure out what those permissions look like 
    newuser  = { _id: authEvent.user.id, ...authEvent.user, createdate: authEvent.time, isSuperUser, permissions: [{item:"",permissions:""}] }
    delete newuser.id; //Moved into _id
    
    await userdata.insertOne(newuser)
};
