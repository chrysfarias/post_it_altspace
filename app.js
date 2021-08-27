const express = require('express')
const bodyParser = require('body-parser')
const path = require('path');
const fs = require('fs');
const app = express()
const port = process.env.PORT || 3000;
const routes = require('./routes/api.routes');

if (!fs.existsSync("postits")){
  fs.mkdirSync("postits");
}

app.use(express.static('public'));
 
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use('/api', routes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname+'/pages/index.html'));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});