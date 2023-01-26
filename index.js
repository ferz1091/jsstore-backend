const express = require('express');
const cors = require('cors');
const authRouter = require('./routes/authRoutes');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.port || 5000;

app.use(cors());
app.use(express.json());
app.use('/auth', authRouter);

const start = async () => {
    await mongoose.connect('mongodb+srv://moon:passwordmoon123@cluster0.if2jhsn.mongodb.net/jsstoreBD?retryWrites=true&w=majority')
    app.listen(PORT, () => {
        console.log(`Server is running on port: ${PORT}`);
    });
}

start();
