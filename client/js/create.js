
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
          function createItem(pickupLocation) {
            console.log(authToken)
              $.ajax({
                  method: 'POST',
                  crossDomain: true,
                  url: _config.api.invokeUrl + '/items',
                  headers: {
                      Authorization: authToken
                  },
                  data: JSON.stringify({id: 1 }),
                  contentType: 'application/json',
                  success: completeRequest,
                  error: function ajaxError(jqXHR, textStatus, errorThrown) {
                      console.error('Error requesting item: ', textStatus, ', Details: ', errorThrown);
                      console.error('Response: ', jqXHR.responseText);
                      alert('An error occured when creating your item:\n' + jqXHR.responseText);
                  }
              });
          }

          function completeRequest(result) {
              console.log('Response received from API: ', result);
              alert("Item created: "+ result.Id)
          }

          // Register click handler for #request button
          $(function onDocReady() {
              $('#request').click(createItem);
              Cognito.authToken.then(function updateAuthMessage(token) {
                  if (token) {
                      // displayUpdate('You are authenticated. Click to see your <a href="#authTokenModal" data-toggle="modal">auth token</a>.');
                      $('.authToken').text(token);
                  }
              });

              if (!_config.api.invokeUrl) {
                  $('#noApiMessage').show();
              }


          });
      }(jQuery));
