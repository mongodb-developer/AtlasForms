//Deal with data types which are objects but specific types
//Like Binary, Date, Decimal128 etc.

function  getBsonType(obj) {
    if (obj instanceof Date) return "date"
    if (obj instanceof BSON.ObjectId) return "objectid"
    if (obj instanceof BSON.Binary) return "binary"
    if (obj instanceof BSON.Int32) return "int32"
    if (obj instanceof BSON.Long) return "int64"
    if (obj instanceof BSON.Double) return "number"
    if (obj instanceof BSON.Decimal128) return "decimal128"
    return null;
}

/* Code/Function used in multiple other functions, we we don't want to
have the overhead of calling them as a context.function so we have one that
returns an object with all the defined functions - can also do this returning a class*/

function correctValueType(value,type) {
  let rval = null;
  try {
    switch(type) {
      case "string":
        rval = `${value}`
        break;
      case "number":
      case "int32":
      case "int64":
      case "decimal128":
        rval = Number(value)
        console.log(`rval = ${rval}`)
        if(isNaN(rval)) { rval = null}
        console.log(`rval = ${rval}`)
        break;
      case "objectid":
        rval = new BSON.ObjectId(value)
        break;
      case 'date':
        console.log(`Converting Date: ${value}`)
        rval = new Date(value)
        break;
      default: 
        console.log(`Nothing defined for converting ${value} to ${type}`)
    }
  }
  catch(e) {
    console.error(`Error converting "${value}" to a ${type}`)
    console.error(e)
  }
  return rval;
}

exports = function(arg){
  return { correctValueType }
};