exports = async function(authEvent) {
  /*
    An Authentication Trigger will always call a function with an authEvent.
    Documentation on Triggers: https://www.mongodb.com/docs/atlas/app-services/triggers/overview/

    Access the user associated with the authEvent:
    const user = authEvent.user

    Access the time the authEvent happened:
    const time = authEvent.time

    Access the operation type for the authEvent:
    const operationType = authEvent.operationType

    Access the providers associated with the authEvent:
    const providers = authEvent.providers

    Functions run by Triggers are run as System users and have full access to Services, Functions, and MongoDB Data.
  */
    
    const userdata = context.services.get("mongodb-atlas").db("__atlasforms").collection("users");
    
    //Check if there are any existing users - if this is the first ever user they are a 'superuser'
   
    let isSuperUser = false;
    const superuser = await userdata.findOne({}); //Should we check if there is a superuser?
    if(superuser == null) {
      isSuperUser = true;
    }
    
    newuser  = { _id: authEvent.user.id, user: authEvent.user, createdate: authEvent.time, isSuperUser, permissions: [] }
    await userdata.insertOne(newuser)
};
