var express = require("express");

var app = express();

app.use(express.static(__dirname));
app.get("/", function(req, res) {
  res.set("Content-Type", "text/css");
  res.send("@import '/src/styles/core/core.css';\n" +
           "@import '/src/styles/components/components.css';");
});
app.listen(process.env.PORT || 3000);
