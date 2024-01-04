const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync'); // 비동기 에러 처리
const { campgroundSchema } = require('../schemas.js'); // 유효성검사
const ExpressError = require('../utils/ExpressError'); // express 에러 처리
const Campground = require('../models/campground'); // campground 모델

// 스키마 유효성 검사
const validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(',');
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

router.get(
	'/',
	catchAsync(async (req, res) => {
		const campgrounds = await Campground.find({});
		res.render('campgrounds/index', { campgrounds });
	})
);
router.get('/new', (req, res) => {
	if (!req.isAuthenticated()) {
		req.flash('error', '로그인 해주세요');
		return res.redirect('/login');
	}
	res.render('campgrounds/new');
});

router.get(
	'/:id',
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findById(id).populate('reviews');
		if (!campground) {
			req.flash('error', '캠핑장을 찾을 수 없습니다');
			return req.redirect('/campgrounds');
		}
		res.render('campgrounds/show', { campground });
	})
);
router.get(
	'/:id/edit',
	catchAsync(async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		if (!campground) {
			req.flash('error', '캠핑장을 찾을 수 없습니다');
			return req.redirect('/campgrounds');
		}
		res.render(`campgrounds/edit`, { campground });
	})
);

// post
router.post(
	'/',
	validateCampground,
	catchAsync(async (req, res, next) => {
		const campground = new Campground(req.body.campground);
		await campground.save();
		req.flash('success', '캠프 등록 성공');
		res.redirect(`/campgrounds/${campground._id}`);
	})
);
// update
router.put(
	'/:id',
	validateCampground,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
		req.flash('success', '캠프 업데이트 성공');
		res.redirect(`/campgrounds/${campground._id}`);
	})
);
// delete
router.delete(
	'/:id',
	catchAsync(async (req, res) => {
		const { id } = req.params;
		await Campground.findByIdAndDelete(id);
		req.flash('success', '캠핑장이 삭제되었습니다.');
		res.redirect('/campgrounds');
	})
);

module.exports = router;
