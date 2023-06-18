const express = require('express');
const app = express();
const mysql = require('./mysqlfunctions.js');

app.use(express.json()); 

app.get("/", (req, res) => {
  res.json("Yo!");
});

app.get("/player/:id", mysql.playerDetails);

app.get("/club/:id", mysql.clubDetails);

app.get("/classification", mysql.classification);

app.post("/transfer", mysql.transfer);

app.post("/newgame", mysql.newGame);

app.get('*', function(req, res){
  res.status(404).json({ error: 'Page not found' });
});

app.post('*', function(req, res){
  res.status(404).json({ error: 'Page not found' });
});

app.listen(4000, function () {
  console.log('Server listening on port 4000');
});