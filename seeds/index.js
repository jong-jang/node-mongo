const mongoose = require('mongoose');
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers')
const Campground = require('../models/campground');

// 몽구스 연결
mongoose.connect('mongodb://localhost:27017/yelp-camp');

// 오류 확인 로직
const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i=0; i <50;i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/random/300x300/?camp',
            description : 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente modi, molestiae minima beatae itaque earum sit soluta maiores. Quod sed, ab porro placeat aliquam possimus quae qui nisi exercitationem dolorem.',
            price
        })
        
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})