var config = {
  apiKey: "AIzaSyAUF3Q6lYDaROrcmeiZeAfRO2ILi0uxJgA",
  authDomain: "milobnb-1512790607233.firebaseapp.com",
  databaseURL: "https://milobnb-1512790607233.firebaseio.com",
  projectId: "milobnb-1512790607233",
  storageBucket: "milobnb-1512790607233.appspot.com",
  messagingSenderId: "639197336107"
};
firebase.initializeApp(config);

$(document).ready(function () {
  //전역에서 idToken을 사용하기 위해 선언
  var idToken;
  //페이지가 표시되면서 기존 유저를 확인하고 idToken을 설정.이부분 생략하면 1번째 호출에서 null이 전달됨.
  chk_idToken();
  //기존 유저를 확인하고 유저에 따른 네비게이션을 설정
  chk_nav();

  //로그인 유저가 있는지 확인후 idToken설정
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

  function chk_nav() {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user != null) {
        var email = user.email;
        req = $.ajax({
          url: '/navbar',
          type: 'POST',
          data: {
            email: email
          }
        });
        req.done(function (data) {
          $('#no_user_nav').hide();
          $('#navbar').html(data);
        });
      } else {
        $('#navbar').html($('#no_user_nav'));
      }
    });
  }

  function postForm(url, temp_token){
    $('<form/>', {action: '/main', method: 'POST'})
    .append($('<input/>', {type: 'hidden', name: 'hidden_input_token', id: 'hidden_input_token', value: temp_token}))
    .appendTo(document.body)
    .submit();
  }


  $('#signup_submit').click(function () {
    var $btn = $(this).button('loading');

    var email = $('#signup_email').val();
    var firstname = $('#signup_firstname').val();
    var lastname = $('#signup_lastname').val();
    var password = $('#signup_password').val();
    var year = $('#signup_year').val();
    var month = $('#signup_month').val();
    var day = $('#signup_day').val();
    // var signup_check = $('#signup_check').val();

    $.ajax({
      url: '/signup',
      type: 'POST',
      data: {
        email: email,
        firstname: firstname,
        lastname: lastname,
        password: password,
        year: year,
        month: month,
        day: day
        // signup_check: signup_check
      },
      success: function (response) {
        if (response.token != null) {
          //기존 사용자가 없을 경우 토큰을 전달 받아 firebase로그인 진행
          var firebase_user = firebase.auth().signInWithCustomToken(response.token).catch(function (error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            if (errorCode === 'auth/invalid-custom-token') {
              alert('The token you provided is not valid.');
            } else {
              console.error(errorMessage);
            }
          });
          if (firebase_user != null) {
            $btn.button('reset');
            $('#signUpModal1').modal('hide');
            location.reload();
          }
        } else {
          //기존 사용자일 경우 logged_user_modal html을 전달 받음.
          $('#signUpModal1').modal('hide');
          $('#logged_user_modal').html(response);
          $('#logged_user_modal').modal('show');
        }
      },
      error: function(error) {
        console.log(error);
      }
    }); //ajax
  }); //signup_submit

  $('#login_submit').click(function () {
    var $btn = $(this).button('loading');

    var email = $('#login_email').val();
    var password = $('#login_password').val();
    var login_check = $('#login_check').val();

    $.ajax({
      url: '/login',
      type: 'POST',
      data: {
        email: email,
        password: password,
        login_check: login_check
      },
      success: function (response) {
        if (response.token != null) {
          var firebase_user = firebase.auth().signInWithCustomToken(response.token).catch(function (error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            if (errorCode === 'auth/invalid-custom-token') {
              alert('The token you provided is not valid.');
            } else if (errorCode === 'auth/email-already-exists') {
              alert('Email is aleady exist');
              $('#loginModal').modal('hide');
            } else {
              console.error(errorMessage);
            }
          }); //firebase_user end
          firebase_user.then(function () {
            $btn.button('reset');
            $('#logInModal').modal('hide');
            location.reload();
          });
        } else {
          console.log('login error : ' + response.err_msg);
          //TODO : "invalid email or password" modlal
        } //if else
      }, //success
      error: function(error) {
        $btn.button('reset');
        console.log(error);
      }
    }); //ajax
  }); //login_submit

  //사인업에서 기존 사용자가 있는 경우 로그인 모달표시후의 로그인
  $(document).on('click', '#logged_user_modal_submit', function() {
    var $btn = $(this).button('loading');

    var logged_user_email = $('#logged_user_email').text();
    var logged_user_password = $('#logged_user_password').val();

    $.ajax({
      url: '/login',
      type: 'POST',
      data: {
        email: logged_user_email,
        password: logged_user_password,
        login_check: 'off'
      },
      success: function(response) {
        if (response.token != null) {
          var firebase_user = firebase.auth().signInWithCustomToken(response.token).catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            if (errorCode === 'auth/invalid-custom-token') {
              alert('The token you provided is not valid.');
            } else if (errorCode === 'auth/email-already-exists') {
              alert('Email is aleady exist');
              $('#loginModal').modal('hide');
            } else {
              console.error(errorMessage);
            }
          }); //firebase_user end
          firebase_user.then(function () {
            $btn.button('reset');
            $('#logged_user_modal').modal('hide');
            location.reload();
          });
        } else {
          console.log('login error : ' + response.err_msg);
          // 추후 모달 에러 표시
        } //if else
      }, //success
      error: function(error) {
        console.log(error);
      }
    }); //ajax
  }); //login_submit

  $('#test').click(function() {
    chk_idToken();
    if (idToken != null) {
      $.ajax({
        url: '/test',
        type: 'POST',
        headers: {
          "Content-Type": "application/json",
          "x-access-token": idToken
        },
        data: {
          email: "haha@haha.com"
        },
        success: function(response) {
          console.log(response);
        }
      });
    } else {
      $('#logInModal').modal('show');
    }
  });

  $(document).on('click', '#get_started', function(event){
    event.preventDefault();
    chk_idToken();
    if (idToken != null) {
      $('<input />').attr('type', 'hidden')
        .attr('name', 'hidden_input_token')
        .attr('value', idToken)
       .appendTo('#get_started_form');
       $('#get_started_form').submit();
    } else {
      $('#logInModal').modal('show');
    }
  });

  $(document).on('click', '#logout', function() {
    firebase.auth().signOut().then(function() {
      console.log('logged out!!');
      location.reload();
    }).catch(function(error) {
      console.log('Do not logged out!!');
    });
  });

}); //document
