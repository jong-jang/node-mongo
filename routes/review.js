const express = require('express');
const router = express.Router({mergeParams: true}); // 매개변수 병합 - app.js에서 campgroud의 id 를 가져오기 위함

const Campground = require('../models/campground'); // campground 모델
const Review = require('../models/review') // review 모델

const { reviewSchema } = require('../schemas.js'); // 유효성검사

const catchAsync = require('../utils/catchAsync'); // 비동기 에러 처리
const ExpressError = require('../utils/ExpressError') // express 에러 처리

// 스키마 유효성 검사
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// review
router.post('/', validateReview, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', '리뷰 등록 완료!')
    res.redirect(`/campgrounds/${campground._id}`);
}))
// review delete
router.delete('/:reviewId', catchAsync(async (req, res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull : {reviews : reviewId}})
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', '리뷰가 삭제되었습니다!!')
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;