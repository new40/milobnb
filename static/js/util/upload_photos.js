$(document).ready(function() {
  var idToken;
  chk_idToken();

  $(document).on('change', '#top_add_photo', function() {
    var resp = send_photo("top_add_photo");
    console.log("result : " +resp);
  });

  $(document).on('change', '#add_photo', function() {
    send_photo("add_photo");
  });

  function send_photo(id){
    chk_idToken();
    var result;
    var formData = new FormData();
    formData.append( "file", $("#" + id).prop("files")[0] );

    if (idToken != null) {
      $.ajax({
        url: '/upload',
        type: 'POST',
        dataType : "text",
        headers: {
          "x-access-token": idToken
        },
        data: formData,
        processData : false,
        contentType : false,
        success: function(response) {
          console.log(response);
          result=response;
        }
      });
    } else {
      //TODO : redirect to login page
    }
    return result;
  }

  function chk_idToken() {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        user.getIdToken().then(function (data) {
          idToken = data;
        });
      } else {
        console.log('plz login!');
        idToken = null;
      }
    });
  }
});
