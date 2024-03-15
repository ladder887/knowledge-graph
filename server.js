const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors()); 

mongoose.connect('mongodb://localhost:27017/d3', {useNewUrlParser: true, useUnifiedTopology: true});

const tweetDataSchema = new mongoose.Schema({}, {collection: 'test1'});

const TweetData  = mongoose.model('TweetData', tweetDataSchema);

app.get('/api/data', async (req, res) => {
    try {
        const data = await TweetData.find({}, 'AccountID');
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



app.get('/api/find/account', async (req, res) => {
    const { AccountID } = req.query;
    try {
        const data = await TweetData.findOne({ AccountID }, {TweetData: 0});
        //console.log(data)
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.listen(4000, () => console.log('Server started on port 4000'));