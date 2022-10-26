// This is for importing a document passed via url
exports = async function (namespace, name, url, listviewfields) {

    /*Get an Authorization object - should be standard in any non private function*/
    const authorization = await context.functions.execute("newAuthorization", context.user.id);
    if (authorization == null) { return { ok: false, message: "User not Authorized" }; }

    await fetchFile(url);

    let rval = { ok: false, message: "No Error Message Set" };
    let postCommit = {};

    const doctypesdata = context.services.get("mongodb-atlas").db("__atlasforms").collection("doctypes");
    const listViewFieldsArray = listviewfields.split(',');

    const newdoctype = {};
    
}

async function fetchFile(url) {
    try {
        const response = await context.http.get({url: url});
        console.log(JSON.parse(response.body.text()));
    }
    catch(e) {
        return {ok: false, message: `Error in Importing ${e}`,results:[]}
    }
}