//Change this so your browser app knows what atlas app services to connect to

const atlasAppConfig = { ATLAS_SERVICES_APPID : "atlasforms-jgtbe" }

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
     AF_DOC_ALREADY_LOCKED: (otherUser) => `Cannot edit this record. It is currently being edited by  ${otherUser}.`,
}