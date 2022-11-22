/** IMPORTANT **/
/* Although these functions are run from the server end and they run as 'system' - they are still subject to 
the authorization class and so look a thtre user context. You need to 'change user' below to an actual user
with permissions to read the schema to run them in here */


async function getPicklistValues(databaseName, collectionName, fieldName) {
  const collection = context.services.get("mongodb-atlas").db(databaseName).collection(collectionName);
  const SAMPLESIZE = 2000; /* Limit to 10,000 but not the fist 10000*/
  let unwindFrom;
  if (fieldName.includes("[]")) {
    // We have an array to unwindArray
    [unwindFrom] = fieldName.split('[]');
    fieldName = fieldName.replace('[]', '');
  }
  let picklist;
  const pipeline = [];
  try {

    pipeline.push({ $sample: { size: SAMPLESIZE } });

    if (unwindFrom) {
      pipeline.push({ $unwind: `$${unwindFrom}` });
    }

    pipeline.push({ $group: { _id: null, count: { $sum: 1 }, values: { $addToSet: `$${fieldName}` } } });


    picklist = await collection.aggregate(pipeline).toArray();
    ///console.log(picklist)
  } catch (e) {
    console.log(JSON.stringify(pipeline));
    console.log(e);
  }

  if (picklist == null) {
    console.log("No results from:")
    console.log(JSON.stringify(pipeline));
    return { count: 0, values: [] }
  }
  return picklist[0];
}

function flattenSchema(obj, prefix, picklists) {
  if (typeof obj == 'string') {
    //Scalar Arrays
    if (obj.startsWith("string")) {
      const [x, maxlen] = obj.split(':')
      if (maxlen < 80) {
        picklists.push(`${prefix}`)

      }
    }
  } else {

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value == "string") {

        if (value.startsWith("string")) {
          const [x, maxlen] = value.split(':')
          if (maxlen < 80) {
            if (prefix.length > 0) {
              picklists.push(`${prefix}.${key}`)
            } else {
              picklists.push(`${key}`)
            }

          }
        }
      } else {
        if (Array.isArray(value)) {

          if (prefix.length > 0) {
            flattenSchema(value[0], `${prefix}.${key}[]`, picklists)
          } else {
            flattenSchema(value[0], `${key}[]`, picklists)
          }
        } else {

          if (prefix.length > 0) {
            flattenSchema(value, `${prefix}.${key}`, picklists)
          } else {
            flattenSchema(value, `${key}`, picklists)
          }
        }
      }

    }
  }
}

exports = async function () {
  //Change these
  const database = "sample_airbnb"
  const collection = "listingsAndReviews"

  const picklists = [];
  const schema = await context.functions.execute("getDocTypeSchemaInfo", { namespace: `${database}.${collection}` });
  if (schema.ok == true) {
    flattenSchema(schema.docTypeSchemaInfo, "", picklists);

    genfunctions = []
    for (const pl of picklists) {

      genfunctions.push(generatePicklist(database, collection, pl));
    }
  } else {
    console.error("Need to run ADMIN_PicklistGenerator as a User , not System User in the function editor (Click Change User ^)")
  }

  await Promise.all(genfunctions);
  return true;
}


async function generatePicklist(database, collection, fieldname) {
  //This is a private function, intended to be run from the App Services GUI only
  //Although you could use the code elsewhere - it's job is to generate a set of
  //Picklists - Version 1 we will give it an entity and fieldname and it
  //Will see how many unique values there are and if there are < 30 not counting
  //Blanks will generate a new Picklists
  const MAX_PICKLIST_LEN = 32;
  console.log(`Generating ${fieldname}`)
  let values, count;

  const rval = await getPicklistValues(database, collection, fieldname);

  if (rval) {
    values = rval.values;
    count = rval.count;
  } else {
    return;
  }
  console.log(`${values.length} unique elements from ${count} `);
  if (values.length < 250 && count > values.length * 3) {
    /* Delete any existing picklist record */
    console.log("Building a Picklist for it")
    const picklistCollection = context.services.get("mongodb-atlas").db("__atlasforms").collection("picklists");
    try {
      fieldname = fieldname.replace('[]', '');
      await picklistCollection.updateOne({ database, collection, fieldname }, { $set: { values } }, { upsert: true })
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  return true;
};