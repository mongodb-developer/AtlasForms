'use strict';

let vueApp;

function cancel() {
    window.location.replace("../login/login.html");
}

async function registerNewUser(email,password,password2) {
    vueApp.message = ""

    if (password != password2) {
        vueApp.message = appStrings.AF_PASSWORDS_DONT_MATCH;
        return false
    }
    try {
        const newUser = await vueApp.realmApp.emailPasswordAuth.registerUser({email,password });
        vueApp.message = appStrings.AF_CHECK_EMAIL;
    }
    catch (e) {
        console.error(e)
        vueApp.message = e.error
        //Or use statusCode and write your own errors which is better for end users.
    }
    
}

function newUserOnLoad() {
    const { createApp } = Vue
    const realmApp = new Realm.App({ id: atlasAppConfig.ATLAS_SERVICES_APPID });
    
    if (realmApp.currentUser != null) {
        // We should not be here if we are already logged in
        window.location.replace("/formsapp/formsapp.html");
      }

    vueApp = createApp({
        methods: {
            cancel,
            registerNewUser
        },
        data() {
            return {
                email: "",
                password: "",
                password2: "",
                message: "",
                }
            },
            mounted() {
                //Non reactive data , don't want reactivity on a deep component like this.
                //Also confiuses first login attempt for a new user.
                this.realmApp = realmApp;
              },
    }).mount("#app")


}