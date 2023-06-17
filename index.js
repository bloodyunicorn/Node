var express = require('express');
var app = express();
var mysql = require('./mysqlfunctions.js');

app.use(express.json()); 

/* a. "/newgame": Insere o resultado de um jogo entre dois clubes */
app.post("/newgame", (req, res) => {
  var gameData = req.body;
  console.log('Received game data:', gameData);
  mysql.NewGame(gameData, function (error, result) {
    if (error) {
      console.error("Error inserting game result.", error);
      res
        .status(500)
        .json({ error });
    } else {
      console.log("Game result inserted successfully.", result);
      res
        .status(201)
        .json({ message: "Resultado do jogo inserido com sucesso." });
    }
  });
});

/* b. "/player/{id}": Retorna os dados do jogador com o {id} */
app.get("/player/:id", (req, res) => {
  var id = req.params.id;
  mysql.PlayerDetails(id, function (result) {
    res.json(result);
  });
});

/* c. "/club/{id}": Retorna os dados do clube e os respectivos jogadores associados a ele */
app.get("/club/:id", (req, res) => {
  var id = req.params.id;
  mysql.ClubDetails(id, function (result) {
    res.json(result);
  });
});

/* d. "/transfer": Possibilita a transferência de um jogador para outro clube */
app.post("/transfer", (req, res) => {
  mysql.Transfer(req.body, function (result) {
    res.send(result);
  });
});

/* e. "/classification": Retorna a classificação atual */
app.get("/classification", (request, response) => {
  mysql.Classification(function (result) {
    response.json(result);
  });
});

app.get("/", (req, res) => {
  res.json("Bem-vindo à API!");
});

app.listen(4000, function () {
  console.log('Server listening on port 4000');
});