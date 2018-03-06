$(document).ready(function() {
  var idToken;
  chk_idToken();

  // var amenities = ["Wifi", "Shampoo", "Closet/drawers", "TV", "Heat", "Air Conditioning",
  //   "Breakfast, coffee, tea", "Fireplace", "Iron", "Hair dryer",
  // ];
  //
  // $.each(amenities, function(index, value){
  //   $div = "<div class='checkbox input-lg'><label><input type='checkbox' value='"+ value +"'>"+ value +"</label></div>";
  //   $('#amenities_list').append($div);
  // });

  $('#amenities_btn').click(function() {
    event.preventDefault();
    chk_idToken();
    if (idToken != null) {
      $('<input />').attr('type', 'hidden')
        .attr('name', 'hidden_input_token')
        .attr('value', idToken)
       .appendTo('#amenities_form');
       $('#amenities_form').submit();
    } else {
      console.log("plz log in!(amenities_page)");
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
