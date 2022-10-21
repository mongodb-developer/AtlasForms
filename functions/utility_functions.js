//Given a field name, let us know if it's an arrayFieldName
//And if do get the bit before and after the number

function refersToArrayElement(fieldName)
{
    
    const parts = fieldName.split('.');
    //Is anything in here a number if so return the index
    const locationOfIndex = parts.reduce((val,el,idx)=>{ return isNaN(el) ? val : idx ;}  , -1);
    const rval = { locationOfIndex }
    if(locationOfIndex != -1) 
    {
      rval.arrayFieldName = parts.slice(0,locationOfIndex).join('.');
      rval.elementFieldName = parts.slice(locationOfIndex+1).join('.');
      rval.index = parts[locationOfIndex];
    }  
    return rval;
}


//Take a Document where everything is a string and make it all 
//be the correct data type according to the schema
// Question: Should we use the code in here to determine if we are 
// working with arrays and return a list of arrays and a list of arrays wiuth deletes
// As insert/update needs them - os shoudl we do it in there.

function castDocToType(doc,objSchema){
  const typedDoc={}
  for( let fieldName of Object.keys(doc) )
  {
    /* Special value we put in to remove array elements
       when editing - copy over unchanged*/
       
    if(doc[fieldName] == "$$REMOVE") {
      typedDoc[fieldName] = "$$REMOVE"
    } else {
      let parts = fieldName.split('.') ;
      let subobj = objSchema
      for(let part of parts) {
        if(!isNaN(part)) {
          part='0'; /*When comparing to schema always check against element 0*/
        }
        subobj = subobj[part]
      }
      //Now based on that convert value and add to our new query
      let correctlyTypedValue = correctValueType(doc[fieldName],subobj)
      if(correctlyTypedValue != null && correctlyTypedValue!="") {
        typedDoc[fieldName] = correctlyTypedValue
      }
    }
  }
  return typedDoc
}


//Deal with data types which are objects but specific types
//Like Binary, Date, Decimal128 etc.

function  getBsonType(obj) {
  if (typeof obj != "object") return typeof obj; 
    if (Array.isArray(obj)) return "array"
    if (obj instanceof Date) return "date"
    if (obj instanceof BSON.ObjectId) return "objectid"
    if (obj instanceof BSON.Binary) return "binary"
    if (obj instanceof BSON.Int32) return "int32"
    if (obj instanceof BSON.Long) return "int64"
    if (obj instanceof BSON.Double) return "number"
    if (obj instanceof BSON.Decimal128) return "decimal128"
    return "document";
}

/* Code/Function used in multiple other functions, we we don't want to
have the overhead of calling them as a context.function so we have one that
returns an object with all the defined functions - can also do this returning a class*/

/* TODO - Handle Number types correctly*/

function correctValueType(value,type) {
  let rval = null;
  try {
    if(type.startsWith("string")) { type="string"; } //Strip any length info
    switch(type) {
      case "string":
        rval = `${value}`
        break;
      case "number":
      case "int32":
      case "int64":
      case "decimal128":
        //TODO : FIX THIS!
        rval = Number(value)
        if(isNaN(rval)) { rval = null}
        break;
      case "objectid":
        rval = new BSON.ObjectId(value)
        break;
      case 'date':
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
  return { correctValueType,getBsonType ,castDocToType ,refersToArrayElement}
};