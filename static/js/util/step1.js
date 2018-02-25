$(document).ready(function() {
  var idToken;
  chk_idToken();

  $('#step1_btn').click(function() {
    event.preventDefault();
    chk_idToken();
    if (idToken != null) {
      $('<input />').attr('type', 'hidden')
        .attr('name', 'hidden_input_token')
        .attr('value', idToken)
       .appendTo('#step1_form');
       $('#step1_form').submit();
    } else {
      console.log("plz log in!(step1_page)");
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
