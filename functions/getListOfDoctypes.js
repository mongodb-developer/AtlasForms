exports = async function(arg){
  
  /*Get an Authorization object - should be standard in any non private function*/
  const authorization = await context.functions.execute("newAuthorization",context.user.id);
  if( authorization == null ) { return {ok: false,  message: "User no Authorized" }; }

  const docTypes = [];
  
  // Read the list of doctypes 
  
  // TODO and check if this user can see each
  const docTypeCollection = context.services.get("mongodb-atlas").db('__atlasforms').collection('doctypes');
  
  const nonSystemDocTypes = await docTypeCollection.find({}).toArray();
  for (const docType of nonSystemDocTypes) {

    if(!docType.namespace.startsWith("__atlasforms"))
    {
      const canSeeDoctype = await authorization.authorize(authorization.READ_DOCTYPE,docType);
      if(canSeeDoctype.granted) {
        docTypes.push(docType)
      }
    }
  }
  
  /* System Doctypes at bottom of list */

  const canManageUsers = await authorization.authorize(authorization.USER_MANAGER);

  if(canManageUsers.granted) {
    const atlasFormsUsers = { title: "AF_Users", namespace: "__atlasforms.users"}
    atlasFormsUsers.listViewFields = ['_id','data.email','createdate']; 
    docTypes.push(atlasFormsUsers);  
  }
  
  const canManageDoctypes = await authorization.authorize(authorization.DOCTYPE_MANAGER);
  
   if(canManageDoctypes.granted) {
    const altasFormsDoctypes = { title: "AF_Doctypes", namespace: "__atlasforms.doctypes"}
    altasFormsDoctypes.listViewFields = ['title','namespace','listViewFields']; 
    docTypes.push(altasFormsDoctypes);  
  }
  
  const canManagePicklists = await authorization.authorize(authorization.PICKLIST_MANAGER);

  if(canManagePicklists.granted) {
    const atlasFormsPicklists = { title: "AF_Picklists", namespace: "__atlasforms.picklists"}
    atlasFormsPicklists.listViewFields = ['databsase','collection']; 
    docTypes.push(atlasFormsPicklists);  
  }
  
  
  
  return {ok: true, docTypes};
};