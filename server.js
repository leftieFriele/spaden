var express = require("express");
var path = require("path");

var app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});
app.use(express.static(path.join(__dirname, "src")));
app.get("/", function(req, res) {
  res.set("Content-Type", "text/css");
  res.send("@import '/styles/core/core.css';\n" +
           "@import '/styles/components/components.css';");
});
app.listen(process.env.PORT || 3000);
