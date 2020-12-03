require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

let id = 0;
let links = [];
app.post('/api/shorturl/new', function(req, res) {
  var { url } = req.body;
  let Url = url.replace(/^https:?\/\//, '');
  
  dns.lookup(Url, function(err) {
    if(err) {
      return res.json({error: "INVALID URL"})
    } else {
      id++;
      
      const link = {
        original_url: url,
        short_url: id
      };
      
      links.push(link);
      return res.json(link);
    }
  });
});

app.get('/api/shorturl/:id', function(req, res) {
  const { id } = req.params;
  console.log("id", id)
  const url = links.find(li => li.short_url == id);
  console.log(url);
  
  if(url) {
    return res.redirect(url.original_url);
  } else {
    return res.json({error: "NIE MA"})
  }
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

