'use strict';

let vueApp;

function passwordLogin()
{
   try {
    vueApp.authHelper.passwordLogin(vueApp.username,vueApp.password)
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
        passwordLogin : authHelper.passwordLogin,
       },
       data() {
        return {
            username: "",
            password: ""
        }
       }
    }).mount("#loginapp")


}