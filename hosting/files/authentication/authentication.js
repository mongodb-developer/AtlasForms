
class AuthHelper {

    constructor() {
        this.realmApp = new Realm.App({ id: atlasAppConfig.ATLAS_SERVICES_APPID });
    }

    //Verify is we are already logged in
    isLoggedIn() {
        if (this.realmApp.currentUser.id != null) {
            return true;
        }
        return false;
    }

}
