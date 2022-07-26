
class AuthHelper {

    constructor() {
        this.realmApp = new Realm.App({ id: atlasAppConfig.ATLAS_SERVICES_APPID });
    }

    //Verify is we are already logged in
    isLoggedIn() {
        if (this.realmApp.currentUser != null) {
            return true;
        }
        return false;
    }

    passwordLogin(username,password) {
        console.log(`Attempt to Login as ${username}`)
        return true;
    }

}
