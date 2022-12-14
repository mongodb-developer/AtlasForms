function getBsonType(obj) {
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
  if (result == null || result?.doc == null) return;
  const [a, b] = fieldname.split('.')
  if (b && result.doc[a]) { return result.doc[a][b] }
  else { return result.doc[a]; }
}
