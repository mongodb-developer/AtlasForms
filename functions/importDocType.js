// This is for importing a document passed
exports = async function (namespace, name, url, listviewfields) {

    // Get the 

    /*Get an Authorization object - should be standard in any non private function*/
    const authorization = await context.functions.execute("newAuthorization", context.user.id);
    if (authorization == null) { return { ok: false, message: "User not Authorized" }; }

    let rval = { ok: false, message: "No Error Message Set" };
    let postCommit = {};

    const doctypesdata = context.services.get("mongodb-atlas").db("__atlasforms").collection("doctypes");
    const listViewFieldsArray = listviewfields.split(',');

    const newdoctype = {};
    
}