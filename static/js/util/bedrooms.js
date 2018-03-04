$(document).ready(function(){
  var idToken;
  chk_idToken();

  $("#guests_cnt_btn_plus").on("click", function() {
    var id = "guests";
    plus(id);
  });

  $("#guests_cnt_btn_minus").on("click", function() {
    var id = "guests";
    minus(id);
  });

  $("#beds_cnt_btn_plus").on("click", function() {
    var id = "beds";
    plus(id);
  });

  $("#beds_cnt_btn_minus").on("click", function() {
    var id = "beds";
    minus(id);
  });

  $("#bathrooms_cnt_btn_plus").on("click", function() {
    var id = "bathrooms";
    plus(id);
  });

  $("#bathrooms_cnt_btn_minus").on("click", function() {
    var id = "bathrooms";
    minus(id);
  });

  //When the radio button is selected, the next btn is activated.
  $( 'input[name="bathroom_private"]:radio' ).change( function() {
    bathroom_private = $(this).val();

    $('#bedrooms_next_btn').removeAttr("disabled");
  });

  //form btn submit. adding idToken.
  $('#bedrooms_next_btn').click(function() {
    event.preventDefault();
    chk_idToken();
    if (idToken != null) {
      $('<input />').attr('type', 'hidden')
        .attr('name', 'hidden_input_token')
        .attr('value', idToken)
       .appendTo('#bedrooms_form');
       $('#bedrooms_form').submit();
    } else {
      console.log("plz log in!(bedrooms_page)");
      // $('#logInModal').modal('show');
    }
  });

  // plus count function
  function plus(id){
    var newVal;
    var max = 15;
    var oldValue = $("#"+ id +"_cnt_val").text();

    var $plus = $("#"+ id +"_cnt_btn_plus");
    var $minus = $("#"+ id +"_cnt_btn_minus");

    $minus.removeClass('disabled');

    if (oldValue < max) {
      newVal = parseInt(oldValue) + 1;
  	} else {
      $plus.addClass('disabled');
      newVal = 15;
    }
    $("#"+ id +"_cnt_val").text(newVal);
    $("#"+ id +"_cnt").val(newVal);
  }

  // minus count function
  function minus(id){
    var newVal;
    var oldValue = $("#"+ id +"_cnt_val").text();

    var $plus = $("#"+ id +"_cnt_btn_plus");
    var $minus = $("#"+ id +"_cnt_btn_minus");

    $plus.removeClass('disabled');

    if (oldValue > 2) {
      newVal = parseInt(oldValue) - 1;
  	} else {
      $minus.addClass('disabled');
      newVal = 1;
    }
    $("#"+ id +"_cnt_val").text(newVal);
    $("#"+ id +"_cnt").val(newVal);
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
