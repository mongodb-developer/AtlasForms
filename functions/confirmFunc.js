
  /*

    This function will be run AFTER a user registers their username and password and is called with an object parameter
    which contains three keys: 'token', 'tokenId', and 'username'.

    The return object must contain a 'status' key which can be empty or one of three string values:
      'success', 'pending', or 'fail'.

    'success': the user is confirmed and is able to log in.

    'pending': the user is not confirmed and the UserPasswordAuthProviderClient 'confirmUser' function would
      need to be called with the token and tokenId via an SDK. (see below)

      const Realm = require("realm");
      const appConfig = {
          id: "my-app-id",
          timeout: 1000,
          app: {
              name: "my-app-name",
              version: "1"
          }
        };
      let app = new Realm.App(appConfig);
      let client = app.auth.emailPassword;
      await client.confirmUser(token, tokenId);

    'fail': the user is not confirmed and will not be able to log in.

    If an error is thrown within the function the result is the same as 'fail'.

    Example below:

    exports = ({ token, tokenId, username }) => {
      // process the confirm token, tokenId and username
      if (context.functions.execute('isValidUser', username)) {
        // will confirm the user
        return { status: 'success' };
      } else {
        context.functions.execute('sendConfirmationEmail', username, token, tokenId);
        return { status: 'pending' };
      }

      return { status: 'fail' };
    };

    The uncommented function below is just a placeholder and will result in failure.
  */

  exports = ({ token, tokenId, username }) => {
    // do not confirm the user
    return { status: 'success' };
  };
