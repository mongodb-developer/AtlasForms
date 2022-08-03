'use strict';

let vueApp;

function cancel() {
    window.location.replace("../login/login.html");
}

async function requestReset(email) {
    vueApp.message = ""


    try {
        const rval = await vueApp.realmApp.emailPasswordAuth.sendResetPasswordEmail({ email });
        console.log(rval)
        vueApp.message = appStrings.AF_CHECK_EMAIL;
    }
    catch (e) {
        console.error(e)
        vueApp.message = e.error
        //Or use statusCode and write your own errors which is better for end users.
    }
    
}

async function resetPassword(password,password2,token,tokenId) {
    vueApp.message = ""

    if (password != password2) {
        vueApp.message = appStrings.AF_PASSWORDS_DONT_MATCH;
        return false
    }
    
    try {
        await vueApp.realmApp.emailPasswordAuth.resetPassword({
            password,
            token,
            tokenId,
          });
        vueApp.message = appStrings.AF_PASSWORD_CHANGED;
    }
    catch (e) {
        console.error(e)
        vueApp.message = e.error
        //Or use statusCode and write your own errors which is better for end users.
    }
    
}


function resetPasswordOnLoad() {
    const { createApp } = Vue
    
    const realmApp = new Realm.App({ id: atlasAppConfig.ATLAS_SERVICES_APPID });
    if (realmApp.currentUser != null) {
        // We should not be here if we are already logged in
        window.location.replace("/formsapp/formsapp.html");
      }

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const tokenId = params.get("tokenId");

    vueApp = createApp({
        methods: {
            cancel,
            requestReset,
            resetPassword
        },
        data() {
            return {
                email: "",
                password: "",
                password2: "",
                message: "",
                token,
                tokenId
            },
            mounted() {
                //Non reactive data , don't want reactivity on a deep component like this.
                //Also confiuses first login attempt for a new user.
                this.realmApp = realmApp;
              },
        }
    }).mount("#resetpasswordapp")


}