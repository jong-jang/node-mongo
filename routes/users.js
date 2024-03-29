const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');

router.get('/register', (req, res) => {
	res.render('users/register');
});

router.post(
	'/register',
	catchAsync(async (req, res, next) => {
		try {
			const { email, username, password } = req.body;
			const user = new User({ email, username });
			const registeredUser = await User.register(user, password);
			req.login(registeredUser, (err) => {
				if (err) return next(err);
				req.flash('success', 'Welcom to Yelp Camp!');
				res.redirect('/campgrounds');
			});
		} catch (e) {
			req.flash('error', e.message);
			res.redirect('/register');
		}
	})
);

router.get('/login', (req, res) => {
	res.render('users/login');
});

// 로그인 실패시 메시지띄우고 로그인 페이지로 리다이렉트 authenticate = 해쉬역할
router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
	req.flash('success', 'welcome back!');
	const redirectUrl = res.locals.returnTo || '/campgrounds';
	delete req.session.returnTo;
	res.redirect(redirectUrl);
});

router.get('/logout', (req, res, next) => {
	req.logout(function (err) {
		if (err) {
			return next(err);
		}
		req.flash('success', '로그아웃 되었습니다.');
		res.redirect('/campgrounds');
	});
});

module.exports = router;
