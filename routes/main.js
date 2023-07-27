const express = require('express');
const router = express.Router({ mergeParams: true });
const main = require('../controllers/main');

router.get('/', main.index);

router.route('/signup')
    .get(main.signup)
    .post(main.newUser);

router.route('/signin')
    .get(main.signin)
    .post(main.signinUser);

router.get('/logout', main.logout)

module.exports = router;