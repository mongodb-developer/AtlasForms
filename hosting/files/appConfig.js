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
}