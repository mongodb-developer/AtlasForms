'use strict';

let vueApp;

async function logOut(email,password)
{
   try {
    await vueApp.realmApp.currentUser.logOut();
    window.location.replace("../login/login.html");
   } 
   catch(e)
   {
    console.error(e)
   }
}


function formsOnLoad() {
    const { createApp } = Vue
    
    const realmApp = new Realm.App({ id: atlasAppConfig.ATLAS_SERVICES_APPID });

    if (realmApp.currentUser == null) {
      // We should not be here if we are not logged in
      window.location.replace("/login/login.html");
    }
    
    vueApp  = createApp({
       methods: {
        logOut,
       },
       data() {
        return {
            realmApp
        }
       }
    }).mount("#formsapp")


}