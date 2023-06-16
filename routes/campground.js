const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync'); // 비동기 에러 처리
const { campgroundSchema } = require('../schemas.js'); // 유효성검사
const ExpressError = require('../utils/ExpressError') // express 에러 처리
const Campground = require('../models/campground'); // campground 모델

// 스키마 유효성 검사
const validateCampground = (req, res ,next) => {
    const { error } = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))
router.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    res.render('campgrounds/show', { campground });
}))
router.get('/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render(`campgrounds/edit`, {campground});
}))

// post
router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    redirect(`/campgrounds/${campground._id}`)
}))
// update
router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    redirect(`/campgrounds/${campground._id}`)
}));
// delete
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

module.exports = router;