$(document).ready(function() {
  var idToken;
  chk_idToken();

  $(document).on('change', '#top_photos_upload_div',function() {
    var file_name = send_photo("top_add_photo");
    console.log("result : " +file_name);

    var data = {filename: file_name};
    var source = $("#top_photo-template").html();
    var template = Handlebars.compile(source);
    var temp_img = template(data);

    // var temp_img = "<img class='img-responsive' src='/static/img/upload/"+resp+"'style='width:100%;'>";
    $("#top_photos_upload").hide();
    $("#top_photos_upload_div").append(temp_img);
    $("#photos_upload").removeClass("hidden");
  });

  $(document).on('change', '#add_photo', function() {
    var file_name = send_photo("add_photo");

    var data = {filename: file_name};
    var source = $("#photos-template").html();
    var template = Handlebars.compile(source);
    var temp_img = template(data);

    $("#photos_div").before(temp_img);
  });

  $(document).on('click', '#photo_del_btn', function(){
    $('#photo_del_btn').addClass('hidden');
    $('#photo_remove_btn').removeClass('hidden');

    $(document).on('click', '#photo_remove_btn', function(){
      var filename = $(this).data("options");
      var req = $.get("/delete/"+filename);
      req.done(function(result){
        if(result){
          $("#top_photo").remove();
          $("#top_photos_upload").show();
          $("#photos_upload").addClass("hidden");
        }
      });
    });
  });

  function send_photo(id){
    var result;

    var formData = new FormData();
    formData.append( "file", $("#" + id).prop("files")[0] );

    if (idToken != null) {
      $.ajax({
        url: '/upload',
        type: 'POST',
        dataType : "text",
        //TODO:async is deprecated!
        async: false,
        headers: {
          "x-access-token": idToken
        },
        data: formData,
        processData : false,
        contentType : false,
        success: function(response) {
          console.log("filename : " + response);
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
