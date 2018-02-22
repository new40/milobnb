$(document).ready(function() {
  var idToken;
  chk_idToken();

  $('#location_map_next_btn').click(function() {
    event.preventDefault();
    chk_idToken();
    if (idToken != null) {
      $('<input />').attr('type', 'hidden')
        .attr('name', 'hidden_input_token')
        .attr('value', idToken)
       .appendTo('#location_map_form');
       $('#location_map_form').submit();
    } else {
      console.log("plz log in!(location_map_page)");
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
