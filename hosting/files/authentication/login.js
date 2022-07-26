let vueApp;

function loginOnLoad() {
    const authHelper = new AuthHelper();
    if (authHelper.isLoggedIn()) {
      //We should not be here if we are already logged in
      window.location.replace("formsapp/formsapp.html");
    }
    
    const { createApp } = Vue
    vueApp  = createApp({
       methods: {},
       data() {
        return {
            username: "",
            password: ""
        }
       }
    }).mount("#loginapp")


}