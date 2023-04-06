require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRouter = require('./routes/authRoutes');
const productRouter = require('./routes/productRoutes');
const orderRouter = require('./routes/orderRoutes');
const usersRouter = require('./routes/usersRoutes');
const imageRouter = require('./routes/imageRoutes');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ credentials: true, origin: 'https://jsstore-frontend.vercel.app'}));
app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRouter);
app.use('/product', productRouter);
app.use('/order', orderRouter);
app.use('/users', usersRouter);
app.use('/image', imageRouter);
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));


const start = async () => {
    await mongoose.connect(process.env.DB_URL);
    app.listen(PORT, () => {
        console.log(`Server is running on port: ${PORT}`);
    });
}

start();
