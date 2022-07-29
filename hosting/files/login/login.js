'use strict';

let vueApp;

async function passwordLogin(email,password)
{
   try {
    const credentials = Realm.Credentials.emailPassword(email, password);
    await vueApp.realmApp.logIn(credentials);
    window.location.replace("../formsapp/formsapp.html");
   } 
   catch(e)
   {
    console.error(e)
    vueApp.message =  appStrings.AF_INCORRECT_PASSWORD;
   }
}

function resetPassword()
{
    window.location.replace("../resetPassword/resetPassword.html");
}

function newUser()
{
    window.location.replace("../newUser/newUser.html");
}

function loginOnLoad() {
    const { createApp } = Vue
    
    const realmApp = new Realm.App({ id: atlasAppConfig.ATLAS_SERVICES_APPID });

    if (realmApp.currentUser != null) {
      // We should not be here if we are already logged in
      window.location.replace("/formsapp/formsapp.html");
    }
    
    vueApp  = createApp({
       methods: {
        passwordLogin,
        newUser,
        resetPassword
       },
       data() {
        return {
            email: "",
            password: "",
            message: ""
            }
        },
        mounted() {
            //Non reactive , dont want reactivity on a deep component app like this.
            this.realmApp = realmApp;
          },
    }).mount("#loginapp")


}