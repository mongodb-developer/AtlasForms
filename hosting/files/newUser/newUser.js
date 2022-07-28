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
                realmApp,
            }
        }
    }).mount("#app")


}