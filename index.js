const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const NodeCache = require('node-cache');
const myCache = new NodeCache();

dotenv.config();

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0-kopit.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`;
mongoose.connect(uri, {useNewUrlParser: true});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
  // we're connected!
  console.log("connected")
});

const TextSchema = new mongoose.Schema({
    content: String,
    id: Number
}, {
    collection: 'texts'
});

var TextModel = mongoose.model('TextModel', TextSchema);

app.get('/texts', (req, res, next) => {
    const header = req.headers[process.env.HEADER_NAME];
    if(header && header === process.env.HEADER_VALUE) return next();
    return res.status(403).send('UNAUTHORIZED');
  }, (req, res) => {
    const data = myCache.get('texts');
    if(data) return res.json(data);

    TextModel.find((err, texts) => {
        if (err) return console.error(err);
        myCache.set('texts', texts, 5000);
        res.json(texts);
    })
});

app.get('/', (res) => {
  res.send("hello")
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log('Example app listening on port 3000!');
});