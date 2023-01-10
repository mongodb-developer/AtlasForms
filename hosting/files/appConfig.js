//Change this so your browser app knows what atlas app services to connect to


const atlasAppConfig = { ATLAS_SERVICES_APPID : "atlasforms-xxxab" }


//All the strings that aren't in HTML to allow localization
//Avoid showing end users errors returned from the server, log them instead.
const appStrings = {
     AF_INCORRECT_PASSWORD : "Unable to log in with those credentials.",
     AF_PASSWORDS_DONT_MATCH : "Passwords do not match.",
     AF_CHECK_EMAIL : "Please check your email for link to confirm this is your address.",
     AF_CHECK_EMAIL_RESET : "Please check your email for link to reset your password.",
     AF_PASSWORD_CHANGED : "Your password has been sucessfully changed.",
     AF_NO_RESULTS_FOUND : "Nothing was found.",
     AF_BAD_FIELD_TYPE: (errorField,errorType) => `Value in ${errorField} is not ${errorType}. Cannot write changes.`,
     AF_NO_MANUAL_ID: "This application does not let you manually specify an id when creating a new document",
     AF_NO_OPEN_FOR_EDIT: "You must have a document open to edit it",
     AF_DOC_CANNOT_LOCK: (msg) => `Cannot edit this record.  ${msg}.`,
     AF_DOC_CANNOT_CREATE: (msg) => `Cannot create this record.  ${msg}.`,
     AF_NOT_LOCKED: "You do not currently have this document locked for edit",
     AF_SERVER_ERROR: (msg)=>`Error from Server: ${JSON.stringify(msg)}`,
     AF_NO_DOCTYPES: "Your Administrator has not granted you any permissions yet."
}