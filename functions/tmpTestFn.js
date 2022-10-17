exports = async function(arg){
  const collection = context.services.get("mongodb-atlas").db(databaseName).collection(collectionName);
  const _id = new BSON.ObjectId()
  const values = {"namespace":"sample_airbnb.listingsAndReviews","title":"airbnb","listViewFields.0":"name"}
  await collection.findOneAndUpdate({_id},{$set:values})
  return {arg: arg};
};