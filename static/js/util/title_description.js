$(document).ready(function() {
  var idToken;
  chk_idToken();



    $("#title_description_btn").click(function(){
      event.preventDefault();
      chk_idToken();
      if (idToken != null) {
        $('<input />').attr('type', 'hidden')
          .attr('name', 'hidden_input_token')
          .attr('value', idToken)
         .appendTo('#title_description_form');
         $("#title_description_form").submit();
      } else {
        console.log("plz log in!(title_description_page)");
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
