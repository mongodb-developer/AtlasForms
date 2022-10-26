async function getPicklistValues(databaseName,collectionName,fieldName) {
  const collection = context.services.get("mongodb-atlas").db(databaseName).collection(collectionName);
  const SAMPLESIZE=10000; /* Limit to 10,000 but not the fist 10000*/
  let picklist;
  try {
    const sample = {$sample:{size:SAMPLESIZE}};
    const unwindArray = {$unwind:`$${fieldName}`};
    const groupAll = {$group:{_id:null,count:{$sum:1},values:{$addToSet:`$${fieldName}`}}}
    
    const pipeline = [ sample,unwindArray,groupAll ]
    picklist = await collection.aggregate(pipeline).toArray();

  } catch(e) {
    console.error(e);
  }
  return picklist[0];
}

exports = async function(arg){
  //This is a private function, intended to be run from the App Services GUI only
  //Although you could use the code elsewhere - it's job is to generate a set of
  //Picklists - Version 1 we will give it an entity and fieldname and it
  //Will see how many unique values there are and if there are < 30 not counting
  //Blanks will generate a new Picklists
  const MAX_PICKLIST_LEN = 32;
  const database ="sample_airbnb"
  const collection = "listingsAndReviews"
  const fieldname ="amenities";
  let {values,count} = await   getPicklistValues(database,collection,fieldname);
  console.log(`${values.length} unique elements from ${count} `);
  if (values.length < 250 && count > values.length*5) {
    /* Delete any existing picklist record */
    const picklistCollection = context.services.get("mongodb-atlas").db("__atlasforms").collection("picklists");
   try{
    await picklistCollection.updateOne({database,collection,fieldname},{$set:{values}},{upsert:true})
   } catch(e) {
     console.error(e);
     return false;
   }
  }
 
  return true;
};