'use strict';

let vueApp;

function passwordLogin(username,password)
{
   try {
    if( vueApp.authHelper.passwordLogin(username,password) == true)
    {
        console.log("Login Successful")
        // Redirect once logged in
    } else {
        console.log("Login Failed")
        vueApp.message =  appStrings.AF_INCORRECT_PASSWORD;
    }
   } 
   catch(e)
   {
    console.error(e)
   }
}

function loginOnLoad() {
    const { createApp } = Vue
    const authHelper = new AuthHelper();

    if (authHelper.isLoggedIn()) {
      //We should not be here if we are already logged in
      window.location.replace("formsapp/formsapp.html");
    }
    
    vueApp  = createApp({
       methods: {
        passwordLogin,
       },
       data() {
        return {
            username: "",
            password: "",
            message: "here"
        }
       }
    }).mount("#loginapp")


}