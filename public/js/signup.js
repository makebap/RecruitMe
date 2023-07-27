//password check
const signup = document.querySelector('#signup');
const pass = document.querySelector('#password');
const confpass = document.querySelector('#confpassword');
const passerror = document.querySelector('#passerror');

// confpass.addEventListener('input', function () {
//     passerror.hidden = true;
// });
confpass.addEventListener('input', function() {
    if (pass.value != confpass.value) {
        passerror.hidden = false;
    } else {
        passerror.hidden = true;
    }
});

signup.addEventListener('submit', function (e) {
    if (pass.value != confpass.value) {
        e.preventDefault();
        passerror.hidden = false;
    }
});

//promo checkbox
const promo = document.querySelector('#promo');

promo.addEventListener('input', function () {
    if (promo.checked == true) {
        promo.value = true;
    } else {
        promo.value = false;
    }
});