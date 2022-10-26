/* This is used to commit or cancel an edit - if untypedupdates is
not supplied or empty , then no changes are made except the unlock*/

exports = async function (docType, _id, untypedUpdates) {

  /*Get an Authorization object - should be standard in any non private function*/
  const authorization = await context.functions.execute("newAuthorization", context.user.id);
  if (authorization == null) { return { ok: false, message: "User not Authorized" }; }

  const canEditDoctype = await authorization.authorize(authorization.EDIT_DOCTYPE, docType, _id, untypedUpdates);
  if (canEditDoctype.granted == false) {
    return { ok: false, message: canEditDoctype.message }
  }

  return await context.functions.execute("internalCommitEdit", docType, _id, untypedUpdates);

};