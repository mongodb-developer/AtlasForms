let vueApp;

function passwordLogin()
{
   try {
    vueApp.authHelper.passwordLogin(vueApp.usernaem,vueApp.password)
   } 
   catch(e)
   {
    console.error(e)
   }
}

function loginOnLoad() {
    const authHelper = new AuthHelper();
    if (authHelper.isLoggedIn()) {
      //We should not be here if we are already logged in
      window.location.replace("formsapp/formsapp.html");
    }


    
    const { createApp } = Vue
    vueApp  = createApp({
       methods: {
        passwordLogin,
       },
       data() {
        return {
            username: "",
            password: "",
            authHelper
        }
       }
    }).mount("#loginapp")


}