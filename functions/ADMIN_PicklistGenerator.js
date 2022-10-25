async function getPicklistValues(databaseName,collectionName,fieldName) {
  const collection = context.services.get("mongodb-atlas").db(databaseName).collection(collectionName);
  const SAMPLESIZE=10000; /* Limit to 10,000 but not the fist 10000*/
  let picklist;
  try {
    picklist = await collection.aggregate([{$sample:{size:SAMPLESIZE}},
    {$unwind:`$${fieldName}`} ,
    {$group:{_id:null,count:{$sum:1},values:{$addToSet:`$${fieldName}`}}}
    ])
  } catch(e) {
    console.error(e);
  }
  return picklist;
}

exports = async function(arg){
  //This is a private function, intended to be run from the App Services GUI only
  //Although you could use the code elsewhere - it's job is to generate a set of
  //Picklists - Version 1 we will give it an entity and fieldname and it
  //Will see how many unique values there are and if there are < 30 not counting
  //Blanks will generate a new Picklists
  
  const databaseName ="sameple_airbnb"
  const collectionName = "listingsAndReviews"
  const fieldName ="amenities";
  let rval = await   getPicklistValues(databaseName,collectionName,fieldName);
  console.log(JSON.stringify(rval))
  return true;
};