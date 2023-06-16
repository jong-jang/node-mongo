// import
const express = require('express'); // express
const path = require('path'); // 경로 설정
const mongoose = require('mongoose'); // db 연결
const ejsMate = require('ejs-mate'); // 템플릿
const ExpressError = require('./utils/ExpressError') // express 에러 처리
const methodOverride = require('method-override'); // update, delete 메소드
const morgan = require('morgan'); // 로그 출력

const campgrounds = require('./routes/campground') // 캠프 라우터
const reviews = require('./routes/review') // 리뷰 라우터

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

// 라우트
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

// get
app.get('/', (req, res) => {
    res.render('home');
})

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