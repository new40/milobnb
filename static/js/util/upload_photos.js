$(document).ready(function() {
  var idToken;
  chk_idToken();

  // 대표사진 업로드
  $(document).on('change', '#top_photos_upload_div',function() {
    var file_name = send_photo("top_add_photo");

    // 핸들바 템플렛 사용
    var data = {filename: file_name};
    var source = $("#top_photo-template").html();
    var template = Handlebars.compile(source);
    var temp_img = template(data);

    $("#top_photos_upload").hide();
    $("#top_photos_upload_div").append(temp_img);
    $("#photos_upload").removeClass("hidden");
  });

  // 추가 사진들 업로드
  $(document).on('change', '#add_photo', function() {
    var file_name = send_photo("add_photo");

    // 현재 추가된 사진 개수 확인(업로드 버튼 박스가 포함된 숫자)
    var smallPhoto_cnt = $("#add_photos_upload_div div").length;
    // 업로드 버튼 박스가 포함된 숫자이므로 한개를 빼야함 (-1)
    var data = {filename: file_name, cnt: smallPhoto_cnt - 1};
    var source = $("#photos-template").html();
    var template = Handlebars.compile(source);
    var temp_img = template(data);

    $("#photos_div").before(temp_img);
  });

  $(document).on('click', '#photo_del_btn', function(){
    $('#photo_del_btn').addClass('hidden');
    $('#photo_remove_btn').removeClass('hidden');
    var smallPhoto_cnt = $("#add_photos_upload_div div").length;

    $(document).on('click', '#photo_remove_btn', function(){
      var filename = $(this).data("options");

      $.ajaxSetup({
        headers: {
            "Content-Type": "application/json",
            "x-access-token": idToken
          }
      });
      var req = $.getJSON('/delete/'+filename, {top: 'top'});
      req.done(function(result){
        if(result){
          $("#top_photo").remove();
          $("#top_photos_upload").show();
          // smallPhoto_cnt는 사진이 없을때 div가 2개있음. default = 2
          if(smallPhoto_cnt < 3){
            $("#photos_upload").addClass("hidden");
          }
        }
      });
    });
  });

  $(document).on('click', 'a[name=add_photo_del_btn]', function(){
    // 대표사진이 있는지 없는지 확인 (1이면 없고, 2이면 있음)
    var topPhoto_cnt = $("#top_photos_upload_div div").length;
    var smallPhoto_cnt = $("#add_photos_upload_div div").length;
    console.log("top : " + topPhoto_cnt);
    console.log("small : " + smallPhoto_cnt);
    var cnt = $(this).data("cnt");

    $(this).addClass('hidden');
    $('#add_photo_remove_btn'+cnt).removeClass('hidden');

    $(document).on('click', '#add_photo_remove_btn'+cnt, function(){
      var filename = $(this).data("options");
      // var req = $.post("/delete", { "where": top, "filename": filename, "hidden_input_token": idToken });
      $.ajaxSetup({
        headers: {
            "Content-Type": "application/json",
            "x-access-token": idToken
          }
      });
      var req = $.getJSON('/delete/'+filename, {top: 'add'});
      req.done(function(result){
        if(result){
          if(smallPhoto_cnt <= 3){
            if(topPhoto_cnt == 1){
              $("#photos_upload").addClass("hidden");
            }
          }
          $("#added_photos"+cnt).remove();
        }
      });
    });
  });

  // 서버에 사진을 보내는 function
  function send_photo(id){
    chk_idToken();
    var result;
    var formData = new FormData();
    formData.append( "file", $("#" + id).prop("files")[0] );
    if (id === "top_add_photo"){
      formData.append( "top", "top" );
    } else {
      formData.append( "top", "added" );
    }

    if (idToken != null) {
      $.ajaxSetup({ async:false });
      $.ajax({
        url: '/upload',
        type: 'POST',
        dataType : "text",
        //TODO:async is deprecated!
        // async: false,
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
      $.ajaxSetup({ async:true });
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
