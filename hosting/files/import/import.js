function importOnLoad() {
    const { createApp } = Vue
    
    const realmApp = new Realm.App({ id: atlasAppConfig.ATLAS_SERVICES_APPID });

    if (realmApp.currentUser == null) {
      // We should not be here if we are not already logged in
      window.location.replace("/login/login.html");
    }

    vueApp = createApp({
        methods: {
          importDocType, navToForm  
        },
        data() {
          return {
            namespace: "",
            importdoctypename: "",
            importurl: "",
            listviewfields: "",
            message: "",
            isBusy: false       
          }
        },
        mounted() {
          //Non reactive data , don't want reactivity on a deep component like this.
          //So we don't add it in the data member
          //Also confiuses first login attempt for a new user with realmApp.
          this.realmApp = realmApp;         
        },
      }).mount("#importapp");          
}

async function importDocType(namespace,importdoctypename,importurl,listviewfields) {

  if(!namespace.includes('.')) {
    vueApp.message = "Namespace not properly defined";
    return;
   }
       
   if(importurl.slice(-4).toLowerCase() != 'json' )
   {
     vueApp.message = "URL not a json file";
     return;
   }

    try {
      vueApp.isBusy = true;
      let { ok, message } = await vueApp.realmApp.currentUser.functions.importDocType(namespace,importdoctypename,importurl,listviewfields);
      vueApp.message =  message;
      vueApp.isBusy = false;
      vueApp.namespace = "";
      vueApp.importdoctypename = "";
      vueApp.importurl = "";
      vueApp.listviewfields = "";
    }
    catch(e) {
      vueApp.message = e;
    }
}

function navToForm() {
  window.location.replace("../formsapp/formsapp.html");
}