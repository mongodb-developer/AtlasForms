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