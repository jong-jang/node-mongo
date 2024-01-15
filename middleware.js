module.exports.isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.flash('error', '로그인 해주세요');
		return res.redirect('/login');
	}
	next();
};
