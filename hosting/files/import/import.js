function importOnLoad() {
    const { createApp } = Vue
    
    const realmApp = new Realm.App({ id: atlasAppConfig.ATLAS_SERVICES_APPID });

    if (realmApp.currentUser == null) {
      // We should not be here if we are already logged in
      window.location.replace("/login/login.html");
    }

    vueApp = createApp({
        methods: {
          //Method we call from  HTML
          //log: console.log,
          //logOut, selectDocType, formValueChange, runQuery, clearForm     
        },
        data() {
          return {
            listViewFields: [],          
          }
        },
        mounted() {
          //Non reactive data , don't want reactivity on a deep component like this.
          //So we don't add it in the data member
          //Also confiuses first login attempt for a new user with realmApp.
          this.realmApp = realmApp;         
        },
      }).mount("#importapp");    

      console.log(vueApp.listViewFields);
}
async function importDocType(namespace, name, url, listviewfields) {
    try {
      let { ok, message } = await vueApp.realmApp.currentUser.functions.importDocType(namespace,name,listviewfields,url)
    }
    catch(e) {

    }
}