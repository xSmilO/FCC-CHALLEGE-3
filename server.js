require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dns = require("dns");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const { Schema } = mongoose;

const urlSchema = new Schema({
  original_url: { type: String, required: true },
  short_url: Number
});

const URL = mongoose.model("URL", urlSchema);

let responseObject = {};

app.post("/api/shorturl/new", function(req, res) {
  let { url } = req.body;
  let regex = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/
  let checkUrl = url.replace(regex, "");
  let inputShort = 1;
  responseObject["original_url"] = url;
  

  dns.lookup(checkUrl, function(err) {
    if (err) {
      res.json({ error: "invalid url" });
      return;
    } else {
      URL.findOne({ original_url: url }, function(err, result) {
        if (result) {
          let { original_url, short_url } = result;
          res.json({ original_url, short_url });
          return;
        } else {
          URL.findOne({})
            .sort({ short_url: "desc" })
            .exec((error, result) => {
              if (!error && result != undefined) {
                inputShort = result.short_url + 1;
              }
              if (!error) {
                responseObject["short_url"] = inputShort;
                let urls = new URL(responseObject);
                urls.save();
                res.json(responseObject);
                return;
              }
            });
        }
      });
    }
  });
});

app.get("/api/shorturl/:id", function(req, res) {
  let { id } = req.params;
  URL.findOne({ short_url: id }, function(err, result) {
    if (result) {
      res.redirect(result.original_url);
    } else {
      res.json({ error: "invalid id" });
    }
  });
});
