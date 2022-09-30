function getBsonType(obj) {
  console.log(obj)
  console.log(typeof obj)
    if (typeof obj != "object") return typeof obj;
    if (Array.isArray(obj)) return "array"
    if (obj instanceof Date) return "date"
    if (obj instanceof Realm.BSON.ObjectId) return "objectid"
    if (obj instanceof Realm.BSON.Binary) return "binary"
    if (obj instanceof Realm.BSON.Int32) return "int32"
    if (obj instanceof Realm.BSON.Long) return "int64"
    if (obj instanceof Realm.BSON.Double) return "number"
    if (obj instanceof Realm.BSON.Decimal128) return "decimal128"
    return "document";
  }

  
  //This deals with dotted fieldnames 
//Also formatting for things like dates
function getFieldValue(result, fieldname) {
    console.log(result,fieldname)
    if(result == null) return;
    const [a,b] = fieldname.split('.')
    if (b && result[a]) { return result[a][b] }
    else { return result[a]; }
  }
  