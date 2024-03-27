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
        const data = await TweetData.find({}, {'AccountID': 1, 'AccountDescriptionURL': 1});
        //console.log(data);
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/api/data/tweet', async (req, res) => {
    try {
        const { ID } = req.query;
        const { date } = req.query;
        //console.log(date)
        const data = await TweetData.findOne({ 'AccountID' : ID, 'TweetData.TweetCreated' : { $lte : new Date(date) } }, {"AccountID" : 1, "TweetData.TweetID": 1, "TweetData.TweetContentURL": 1, _id: 0});
        //console.log(data)
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/api/find/account', async (req, res) => {
    const { ID } = req.query;
    try {
        const data = await TweetData.findOne({ 'AccountID' : ID }, {TweetData: 0, AccountDescriptionPreprocessing: 0, AccountEntities: 0, _id: 0});
        //console.log(data)
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/api/find/tweet', async (req, res) => {
    const { ID } = req.query;
    try {
        //console.log(ID)
        const data = await TweetData.findOne({"TweetData.TweetID": ID}, {"TweetData.$": 1});
        //console.log(data)
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/api/data/date', async (req, res) => {
    const { date } = req.query;
    try {
        const data = await TweetData.find({'TweetData.TweetCreated' : { $lte : new Date(date) } }, {"AccountID" : 1, 'AccountDescriptionURL': 1, _id: 0});
        res.json(data);
        //console.log(data)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.listen(4000, () => console.log('Server started on port 4000'));