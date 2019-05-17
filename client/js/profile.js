
var Cognito = window.Cognito || {};
Cognito.map = Cognito.map || {};

(function ScopeWrapper($) {
  var authToken;
  Cognito.authToken.then(function setAuthToken(token) {
    if (token) {
      authToken = token;
    } else {
      window.location.href = './signin.html';
    }
  }).catch(function handleTokenError(error) {
    alert(error);
    window.location.href = './signin.html';
  });

  $(function onDocReady() {
    $('#signOut').click(function() {
      Cognito.signOut();
        alert("You have been signed out.");
        window.location = "signin.html";
      });

    var data = {
  		UserPoolId : _config.cognito.userPoolId,
      ClientId : _config.cognito.userPoolClientId
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(data);
    var cognitoUser = userPool.getCurrentUser();
    getCurrentUser(cognitoUser);
  });

  function getCurrentUser(cognitoUser) {
    cognitoUser.getSession(function(err, session) {
      if (err) {
        alert(err);
        return;
      }
      //Set the profile info
      cognitoUser.getUserAttributes(function(err, result) {
        if (err) {
          console.log(err);
          return;
        }
        document.getElementById("name_value").innerHTML = result[2].getValue();
        document.getElementById("email_value").innerHTML = result[3].getValue();

      });
    });
  }
}(jQuery));
