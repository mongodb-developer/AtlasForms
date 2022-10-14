exports = async function(arg){
  /* Can we see who it's running as? */

  /*Here we are explicty, programatically choosing which document types to expose to the frontend*/
  /*We have the user details so wee can factor in authorization too */
  /* Although MongoDB can be 'Dynamic' we can't just expose all of them */
  /* Partly because a newly created collection should not just appear to all end users, better to have explicit security*/
  /* And partly because in App services you cannot enumerate the databases and collections in code without calling the
   REST Admin API */

  const docTypes = []
  
  /* This is a hard coded list for now */
  /* But plan to move to a collection */
  
  /*Get an Authorization object*/
  const authorization = context.functions.execute("newAuthorization",context.user.id);
  
  if(authorization.authorize(authorization.USER_MANAGER)) {
    const atlasFormsUsers = { title: "AF_Users", namespace: "__atlasforms.users"}
    atlasFormsUsers.listViewFields = ['_id'];
    docTypes.push(atlasFormsUsers); 
  }
  
  const sample_airbnb = { title: "Holiday Accomodations", namespace: "sample_airbnb.listingsAndReviews"}
  sample_airbnb.listViewFields = ["name","property_type","room_type","address.market","address.country"]
  docTypes.push(sample_airbnb);
  
  const sample_restaurants = { title: "Restaurants", namespace: "sample_restaurants.restaurants"}
  sample_restaurants.listViewFields = ["name","cuisine","bouroush","address.building","address.street"]
  docTypes.push(sample_restaurants);
  
  
  const sample_mflix = { title: "Movies", namespace: "sample_mflix.movies"}
  sample_mflix.listViewFields = ["title","year"] 
  docTypes.push(sample_mflix);
  
  return docTypes;
};