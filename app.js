// import
const express = require('express'); // express
const path = require('path'); // 경로 설정
const mongoose = require('mongoose'); // db 연결
const ejsMate = require('ejs-mate'); // 템플릿
const session = require('express-session'); // 세션
const flash = require('connect-flash'); // 플래시, 문구 띄우기
const ExpressError = require('./utils/ExpressError'); // express 에러 처리
const methodOverride = require('method-override'); // update, delete 메소드
const morgan = require('morgan'); // 로그 출력
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const userRoutes = require('./routes/users'); // 사용자 라우터
const campgroundsRoutes = require('./routes/campground'); // 캠프 라우터
const reviewsRoutes = require('./routes/review'); // 리뷰 라우터

// db 연결
mongoose.connect('mongodb://127.0.0.1/yelp-camp');

// db 연결 오류 체크
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connecion error:'));
db.once('open', () => {
	console.log('database connected');
});

const app = express();
// view 설정
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // views 폴더 default 설정

// log 출력
morgan('tiny');

// req.body parser
app.use(express.urlencoded({ extended: true }));
// methodoverride
app.use(methodOverride('_method'));
// public 폴더 정적 asset 설정
app.use(express.static(path.join(__dirname, 'public')));
// 세션 설정값
const sessionConfig = {
	secret: 'thisshouldbeabettersecret!', // 비밀키
	resave: false, // 세션 중단 경고 메시지 처리
	saveUninitialized: true, // 세션 중단 경고 메시지 처리
	cookie: {
		httpOnly: true, // 서버로 전송되는 쿠키를 JavaScript로 접근하는 것을 막는 옵션
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 쿠키가 만료되는 날짜 (설정 : 일주일)
		maxAge: 1000 * 60 * 60 * 24 * 7, // 현재 시간부터 MaxAge 시간이 경과하면 쿠키가 만료
	},
};
// 세션
app.use(session(sessionConfig));
// 플래시
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});
// 라우트
app.get('/fakeUser', async (req, res) => {
	const user = new User({ email: 'clotttt@gmail.com', username: 'colttt' });
	const newUser = await User.register(user, 'chicken');
	res.send(newUser);
});

app.use('/', userRoutes);
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);

// get
app.get('/', (req, res) => {
	res.render('home');
});

// 404
app.all('*', (req, res, next) => {
	next(new ExpressError('Page Not Found', 404));
});

// 오류처리
app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) err.message = 'Oh No, Something Went Wrong';
	res.status(statusCode).render('error', { err });
});

// 포트 설정
app.listen(3000, () => {
	console.log('port : 3000');
});
