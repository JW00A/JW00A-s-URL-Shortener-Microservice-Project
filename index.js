require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require("dns");
const shortid = require("shortid");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cors());

const urlDatabase = {};
let shortIdCounter = 1;

app.post("/api/shorturl", function(req, res) {
  let { url } = req.body;

  if (!/^https?:\/\/.+/.test(url)) {
    return res.json({ error: "invalid url" });
  }

  dns.lookup(new URL(url).hostname, (err) => {
    if (err) {
      return res.json({ error: "invalid url" });
    }

    const shortURL = shortIdCounter++;
    urlDatabase[shortURL] = url;

    res.json({ original_url: url, short_url: shortURL });
  });
});

app.get("/api/shorturl/:shortUrl", function (req, res) {
  const { shortUrl } = req.params;
  const orginialURL = urlDatabase[shortUrl];

  if (!orginialURL) {
    return res.json({ error: "Short URL not found" });
  }

  res.redirect(orginialURL);
});

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
