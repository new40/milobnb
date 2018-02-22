$(document).ready(function(){
  var idToken;
  chk_idToken();
  // $("#room_type").hide();
  // $("#space_radio").hide();
  var category_type_val;
  var property_type_val;
  var room_type_val = 'entire';
  var space_radio;

  $( "select[name=property_type]" ).prop( "disabled", true );

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

  $("select[name=category_type]").change(function() {
   var temp = $("select[name=property_type]");
   temp.prop( "disabled", false );
   category_type_val = $(this).val();
   temp.children().remove();
   $("#helpBlock").text('');
   temp.append('<option value="" disabled selected>Select property type</option>');

   if(category_type_val == '1'){
    temp.append('<option value="A">A중학교</option>');
    temp.append('<option value="B">B중학교</option>');
    temp.append('<option value="C">C중학교</option>');
   }
   if(category_type_val == '2'){
    temp.append('<option value="AH">A고등학교</option>');
    temp.append('<option value="BH">B고등학교</option>');
    temp.append('<option value="CH">C고등학교</option>');
   }
   if(category_type_val == '3'){
    temp.append('<option value="AU">A대학교</option>');
    temp.append('<option value="BU">B대학교</option>');
    temp.append('<option value="CU">C대학교</option>');
   }
  });

  $("select[name=property_type]").change(function() {
    property_type_val = $(this).val();

    if(property_type_val == "A"){
      $("#helpBlock").text('A middle school');
    }
    if(property_type_val == "B"){
      $("#helpBlock").text('B middle school');
    }
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
    // console.log(space_radio);
    if(category_type_val != null && property_type_val != null){
      $('#room_next_btn').removeClass('disabled');
    }
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
});
