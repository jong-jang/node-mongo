// import
const express = require('express'); // express
const path = require('path'); // 경로 설정
const mongoose = require('mongoose'); // db 연결
const ejsMate = require('ejs-mate'); // 템플릿
const {campgroundSchema} = require('./schemas.js'); // 유효성검사
const catchAsync = require('./utils/catchAsync'); // 비동기 에러 처리
const ExpressError = require('./utils/ExpressError') // express 에러 처리
const methodOverride = require('method-override'); // update, delete 메소드
const Campground = require('./models/campground'); // 모델링
const morgan = require('morgan'); // 로그 출력

// db 연결
mongoose.connect('mongodb://localhost:27017/yelp-camp');

// db 연결 오류 체크
const db = mongoose.connection;
db.on('error', console.error.bind(console, "connecion error:"));
db.once("open", () => {
    console.log("database connected");
});

const app = express();
// view 설정
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views')); // views 폴더 default 설정

// log 출력
morgan('tiny');

// req.body parser
app.use(express.urlencoded({extended:true}));
// methodoverride
app.use(methodOverride("_method"));

// 스키마 유효성 검사
const validateCampground = (req, res ,next) => {
    // joi - 유효성 검사 패키지
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// 비밀번호 체크
const verifyPassword = (req, res, next) => {
    const { password } = req.query;
    if(password === 'aaaa'){
        next();
    }
}

// get
app.get('/', (req, res) => {
    res.render('home');
})

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/show', { campground });
}))
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render(`campgrounds/edit`, {campground});
}))

// post
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    redirect(`/campgrounds/${campground._id}`)
}))
// update
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    redirect(`/campgrounds/${campground._id}`)
}));
// delete
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

// 404
app.all('*',(req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

// 오류처리
app.use((err, req, res, next) => {
    const {statusCode = 500 } = err;
    if(!err.message) err.message = 'Oh No, Something Went Wrong'
    res.status(statusCode).render('error', { err });
})

// 포트 설정
app.listen(3000, () => {
    console.log('port : 3000');
})