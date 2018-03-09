$(document).ready(function(){
  var idToken;
  chk_idToken();

  $(document).on('change', '#profile_photo_div',function() {
    chk_idToken();

    var formData = new FormData();
    formData.append( "file", $("#profile_photo_upload_btn").prop("files")[0] );

    if (idToken != null) {
      $.ajax({
        url: '/upload-profile',
        type: 'POST',
        dataType : "text",
        headers: {
          "x-access-token": idToken
        },
        data: formData,
        processData : false,
        contentType : false,
        success: function(response) {
          // 핸들바 템플렛 사용
          var data = {filename: response};
          var source = $("#profile_photo-template").html();
          var template = Handlebars.compile(source);
          var temp_img = template(data);

          $("#profile_photo_div").hide();
          $("#profile_photo_change_div").append(temp_img);
        }
      });
    } else {
      //TODO : redirect to login page
    }
  });

  $(document).on('click', '#change_photo', function(){
    var filename = $("#profile_photo_name").val();

    $.ajaxSetup({
      headers: {
          "Content-Type": "application/json",
          "x-access-token": idToken
        }
    });
    var req = $.get('/delete-profile-photo/'+filename);
    req.done(function(result){
      if(result){
        $("#profile_photo_added_div").remove();
        $("#profile_photo_div").show();
        location.reload();
      }
    });

  });

  function send_photo(id){
    chk_idToken();
    var result;
    var formData = new FormData();
    formData.append( "file", $("#" + id).prop("files")[0] );

    if (idToken != null) {
      $.ajax({
        url: '/upload-profile',
        type: 'POST',
        dataType : "text",
        headers: {
          "x-access-token": idToken
        },
        data: formData,
        processData : false,
        contentType : false,
        success: function(response) {
          // console.log("filename : " + response);
          result = response;
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
