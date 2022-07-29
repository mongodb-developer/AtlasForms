exports = async function(arg){
  /* Can we see who it's running as? */
 const userCalling  = context.user

  /*Here we are explicty, programatically choosing which document to expose to the frontend*/
  /*We have the user details so wee can factor in authorization too*/
  /* Although MongoDB can be 'Dynamic' we can;t just expose all of them */
  /* Partly because a newly created collection shoudl not just appear to all users, better to have explicit security*/
  /* And partly because in App services you cannot enumerate the ddatabases and collections in code without calling the
   REST Admin API */

  const docTypes = []
  
  /*Add Logig here to decide who sees what*/
  
  docTypes.push({ title: "Holiday Accomodations", namespace: "sample_airbnb.listingsAndReviews"})
  docTypes.push({ title: "Rsetauraunts", namespace: "sample_restauraunts.restaurants"})
  
  return docTypes;
};