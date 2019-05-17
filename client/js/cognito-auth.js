/*global Cognito _config AmazonCognitoIdentity AWSCognito*/

var Cognito = window.Cognito || {};

(function scopeWrapper($) {
    var signinUrl = 'signin.html';

    var poolData = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _config.cognito.userPoolClientId
    };

    var userPool;

    if (!(_config.cognito.userPoolId &&
          _config.cognito.userPoolClientId &&
          _config.cognito.region)) {
        $('#noCognitoMessage').show();
        return;
    }

    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    if (typeof AWSCognito !== 'undefined') {
        AWSCognito.config.region = _config.cognito.region;
    }

    Cognito.signOut = function signOut() {
      if (userPool !== null) {
        userPool.getCurrentUser().signOut();
      } else {
        alert('You are not logged In!');
      }
    };

    Cognito.authToken = new Promise(function fetchCurrentAuthToken(resolve, reject) {
        var cognitoUser = userPool.getCurrentUser();

        if (cognitoUser) {
            cognitoUser.getSession(function sessionCallback(err, session) {
                if (err) {
                    reject(err);
                } else if (!session.isValid()) {
                    resolve(null);
                } else {
                    resolve(session.getIdToken().getJwtToken());
                }
            });
        } else {
            resolve(null);
        }
    });


    /*
     * Cognito User Pool functions
     */

    function register(email, name, password, onSuccess, onFailure) {

    		var attributeList = [];

        var dataEmail = {
            Name: 'email',
            Value: email
        };
        var dataPersonalName = {
          Name : 'name',
          Value : name, //get from form field
        };

        var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
        var attributePersonalName = new AmazonCognitoIdentity.CognitoUserAttribute(dataPersonalName);

        attributeList.push(attributeEmail);
        attributeList.push(attributePersonalName);

        userPool.signUp(email, password, attributeList, null,
            function signUpCallback(err, result) {
                if (!err) {
                    onSuccess(result);
                } else {
                    onFailure(err);
                }
            }
        );
    }

    function signin(email, password, onSuccess, onFailure) {
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: email,
            Password: password
        });

        var cognitoUser = createCognitoUser(email);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: onSuccess,
            onFailure: onFailure
        });
    }

    function forgot(email, onSuccess, onFailure) {
      var userData = {
        Username : email,
        Pool : userPool,
      };
      var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
      cognitoUser.forgotPassword({
        onSuccess: onSuccess,
        onFailure: onFailure,
        inputVerificationCode() {
            var verificationCode = prompt('Please input verification code ' ,'');
            var newPassword = prompt('Enter new password ' ,'');
            cognitoUser.confirmPassword(verificationCode, newPassword, this);
        }
      });
    }

    function updateUser(cognitoUser,name, onSuccess, onFailure){
    var attributeList = [];
    var dataPersonalName = {
      Name : 'name',
      Value : name, //get from form field
    };

    var attributePersonalName = new AmazonCognitoIdentity.CognitoUserAttribute(dataPersonalName);

    attributeList.push(attributePersonalName);
      console.log(attributeList)
      cognitoUser.updateAttributes(attributeList, function(err, result) {
        if (err) {
            alert(err);
            return;
        }
        console.log('call result: ' + result);
    });
    }

    function verify(email, code, onSuccess, onFailure) {
        createCognitoUser(email).confirmRegistration(code, true, function confirmCallback(err, result) {
            if (!err) {
                onSuccess(result);
            } else {
                onFailure(err);
            }
        });
    }

    function deleteUser(cognitoUser, onSuccess, onFailure) {
        cognitoUser.deleteUser({
          onSuccess: onSuccess,
          onFailure: onFailure,
        })
    }

    function createCognitoUser(email) {
        return new AmazonCognitoIdentity.CognitoUser({
            Username: email,
            Pool: userPool
        });
    }

    /*
     *  Event Handlers
     */

    $(function onDocReady() {
        $('#signinForm').submit(handleSignin);
        $('#registrationForm').submit(handleRegister);
        $('#verifyForm').submit(handleVerify);
        $('#forgotForm').submit(handleForgot);
        $('#deleteUserForm').submit(handleDeleteUser);
        $('#updateUserForm').submit(handleUpdateUser);

    });

    function handleSignin(event) {
        var email = $('#emailInputSignin').val();
        var password = $('#passwordInputSignin').val();
        event.preventDefault();
        signin(email, password,
            function signinSuccess() {
                console.log('Successfully Logged In');
                window.location.href = 'index.html';
            },
            function signinError(err) {
                alert(err);
            }
        );
    }
    function handleForgot(event) {
        var email = $('#emailInputForgot').val();
        event.preventDefault();
        forgot(email,
            function onSuccess(result) {
                console.log('call result: ' + result);
                console.log('Successfully Retrieved new Password');
                alert('New Password successful. You will now be redirected to the login page.');
                window.location.href = signinUrl;
            },
            function onFailure(err) {
                alert(err);
            }
        );
    }
    function handleUpdateUser(event) {
        var name = $('#nameInputUpdate').val();
        event.preventDefault();
        var cognitoUser = userPool.getCurrentUser();
        if (cognitoUser != null) {
          cognitoUser.getSession(function (err, session) {
            if (err) {
              alert(err);
                return;
              }
            });
            updateUser(cognitoUser, name,
              function onSuccess(result) {
                console.log('user updated result: ' + result);
                // location.reload();
              },
              function onFailure(err) {
                alert(err);
              }
            )
        }
    }


    function handleDeleteUser(event) {
        event.preventDefault();
        var cognitoUser = userPool.getCurrentUser();
        if (confirm("Are you sure you want to delete your user?")) {
          if (cognitoUser != null) {
            cognitoUser.getSession(function (err, session) {
              if (err) {
                alert(err);
                  return;
                }
              });
              deleteUser(cognitoUser,
                function onSuccess(result) {
                  console.log('user delete result: ' + result);
                  location.reload();
                },
                function onFailure(err) {
                  alert(err);
                }
              )
          }
        }
    }

    function handleRegister(event) {
        var email = $('#emailInputRegister').val();
        var name = $('#NameInputRegister').val();
        var password = $('#passwordInputRegister').val();
        var password2 = $('#password2InputRegister').val();

        var onSuccess = function registerSuccess(result) {
            var cognitoUser = result.user;
            console.log('user name is ' + cognitoUser.getUsername());
            var confirmation = ('Registration successful. Please check your email inbox or spam folder for your verification code.');
            if (confirmation) {
              window.location.href = 'verify.html';
            }
        };
        var onFailure = function registerFailure(err) {
            alert(err);
        };
        event.preventDefault();

        if (password === password2) {
            register(email, name, password, onSuccess, onFailure);
        } else {
            alert('Passwords do not match');
        }
    }

    function handleVerify(event) {
        var email = $('#emailInputVerify').val();
        var code = $('#codeInputVerify').val();
        event.preventDefault();
        verify(email, code,
            function verifySuccess(result) {
                console.log('call result: ' + result);
                console.log('Successfully verified');
                alert('Verification successful. You will now be redirected to the login page.');
                window.location.href = signinUrl;
            },
            function verifyError(err) {
                alert(err);
            }
        );
    }
}(jQuery));
