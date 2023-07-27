const User = require('../models/user');

module.exports.index =
    (req, res) => {
        res.render('main/home');
    }

module.exports.signup =
    (req, res) => {
        res.render('main/signup');
    }

module.exports.newUser =
    async (req, res) => {
        const newUser = req.body.user;
        const promo = false;
        if (newUser.mailingList == true) {
            promo = true;
        }
        const user = new User({
            fname:  newUser.fname,
            lname: newUser.lname,
            email: newUser.email,
            password: newUser.password,
            mailingList: promo
        });
        try {
            await user.save({ runValidators: true });
        } catch (e) {
            req.flash('error', 'Couldn\'t create your account.');
            console.log(e);
            return res.redirect('/signup');
        }
        req.flash('success', 'Successfully signed up.');
        req.session.user_id = user._id;
        res.redirect('/jobs');
    }

module.exports.signin =
    (req, res) => {
        res.render('main/signin');
    }

module.exports.signinUser =
    async (req, res) => {
        const { email, password } = req.body.user;
        const foundUser = await User.findAndAuthenticate(email, password);
        if (foundUser) {
            req.session.user_id = foundUser._id;
            console.log(req.session.user_id);
            if (req.cookies.comeback) {
                return res.redirect(`/jobs/${req.cookies.comeback}`);
            } else {
                return res.redirect('/jobs');
            }
        } else {
            res.redirect('/signin');
        }
    }

module.exports.logout =
    (req, res) => {
    req.session.user_id = null;
    req.flash('success', 'Successfully logged you out.');
    res.redirect('/');
}