$(document).ready(function(){
  var idToken;
  chk_idToken();
  // $("#room_type").hide();
  // $("#space_radio").hide();

  var category_type_val = $("select[name=category_type]").val();
  var property_type_val;
  var temp = $("select[name=property_type]");
  var obj;
  var cate1;
  var cate2;
  var cate3;
  var cate4;
  var cate5;
  var cate6;
  var room_type_val = 'entire';
  var space_radio;

  // var req_first = $.get("/become-a-host/room");
  // req_first.done(function(data){
  //   console.log(data);
  // });

  var req = $.get("/subcategories");
  req.done(function(data){
    var temp_data = JSON.stringify(data);
    obj = JSON.parse(temp_data);

    //category_id별로 html작성하여 str로 저장
    for (var i=0; i<obj.length; i++){
      if (obj[i].category_id == 1){
        cate1 +='<option value="'+obj[i].id+'">'+ obj[i].name +'</option>';
      }
      if (obj[i].category_id == 2){
        cate2 += '<option value="'+obj[i].id+'">'+ obj[i].name +'</option>';
      }
      if (obj[i].category_id == 3){
        cate3 += '<option value="'+obj[i].id+'">'+ obj[i].name +'</option>';
      }
      if (obj[i].category_id == 4){
        cate4 += '<option value="'+obj[i].id+'">'+ obj[i].name +'</option>';
      }
      if (obj[i].category_id == 5){
        cate5 += '<option value="'+obj[i].id+'">'+ obj[i].name +'</option>';
      }
      if (obj[i].category_id == 6){
        cate6 += '<option value="'+obj[i].id+'">'+ obj[i].name +'</option>';
      }
    }
  });

  $("select[name=category_type]").change(function() {
    temp.prop( "disabled", false );
    category_type_val = $(this).val();
    temp.children().remove();
    $("#helpBlock1").remove();
    $("#helpBlock").text('');
    temp.append('<option value="" disabled selected>Select property type</option>');

    switch (category_type_val) {
     case '1':
       temp.append(cate1);
       break;
     case '2':
       temp.append(cate2);
       break;
     case '3':
       temp.append(cate3);
       break;
     case '4':
       temp.append(cate4);
       break;
     case '5':
       temp.append(cate5);
       break;
     default:
       temp.append(cate6);
    }
  });

  if(category_type_val == null){
    $( "select[name=property_type]" ).prop( "disabled", true );
  }

  $("select[name=property_type]").change(function() {
    property_type_val = $(this).val();
    $("#helpBlock1").remove();
    //obj는 0에서 시작하므로 -1
    $("#helpBlock").text(obj[property_type_val - 1].description);
    //
    // $("#room_type").show();
    // $("#space_radio").show();
  });

  $("select[name=room_type]").change(function() {
    room_type_val = $(this).val();
    // console.log(room_type_val);
  });

  //When the radio button is selected, the next btn is activated.
  $( 'input[name="space_radio"]:radio' ).change( function() {
    space_radio = $(this).val();
    $('#room_next_btn').removeAttr("disabled");

  });

  $('#room_next_btn').click(function() {
    event.preventDefault();
    chk_idToken();
    if (idToken != null) {
      $('<input />').attr('type', 'hidden')
        .attr('name', 'hidden_input_token')
        .attr('value', idToken)
       .appendTo('#room_form');
       $('#room_form').submit();
    } else {
      console.log("plz log in!(room_page)");
      // $('#logInModal').modal('show');
    }
  });

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
