var mysql = require('mysql');

var con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'futebol',
});

con.connect(function (err) {
  if (err) throw err;
  console.log('Conectado ao banco de dados MySQL!');
});

function NewGame(gameData, callback) {
  const { IdClubeHome, IdClubeAway, Score } = gameData;
  
  // Map the score values to the desired format
  let mappedScore;
  if (Score === 0) {
    mappedScore = '0'; // Draw
  } else if (Score === 1) {
    mappedScore = '1'; // Home team victory
  } else if (Score === 2) {
    mappedScore = '2'; // Away team victory
  } else {
    callback("Invalid score value.", null);
    return;
  }
  
  const query = `INSERT INTO resultado (IdClubeHome, IdClubeAway, Score) VALUES (?, ?, ?)`;
  con.query(query, [IdClubeHome, IdClubeAway, mappedScore], (error, result) => {
    if (error) {
      console.error("Erro ao inserir o resultado do jogo.", error);
      callback(error, null);
    } else {
      console.log("Resultado do jogo inserido com sucesso.");
      console.log(Result);

      callback(null, result);
    }
  });
}


function PlayerDetails(id, callback) {
  var sql = "SELECT * FROM jogador WHERE Id = ?";
  con.query(sql, id, function (err, result) {
    if (err) {
      console.log(err);
      callback(null);
    } else {
      callback(result);
    }
  });
}

function ClubDetails(id, callback) {
  var sql = "SELECT * FROM clube LEFT JOIN jogador ON clube.Id = jogador.Idclube WHERE clube.Id = ?";
  con.query(sql, id, function (err, result) {
    if (err) {
      console.log(err);
      callback(null);
    } else {
      callback(result);
    }
  });
}

function Transfer(transferData, callback) {
  var playerId = transferData.playerId;
  var targetClubId = transferData.targetClubId;

  var checkPlayerQuery = "SELECT * FROM jogador WHERE Id = ?";
  con.query(checkPlayerQuery, playerId, function (err, playerResult) {
    if (err) {
      console.log(err);
      callback("Erro ocorreu durante a transferência do jogador.");
      return;
    }

    if (playerResult.length === 0) {
      callback("Jogador não encontrado.");
      return;
    }

    var checkClubQuery = "SELECT * FROM clube WHERE Id = ?";
    con.query(checkClubQuery, targetClubId, function (err, clubResult) {
      if (err) {
        console.log(err);
        callback("Erro ocorreu durante a transferência do jogador.");
        return;
      }

      if (clubResult.length === 0) {
        callback("Clube de destino não encontrado.");
        return;
      }

      var updatePlayerQuery = "UPDATE jogador SET clube = ? WHERE Id = ?";
      con.query(
        updatePlayerQuery,
        [targetClubId, playerId],
        function (err, updateResult) {
          if (err) {
            console.log(err);
            callback("Erro ocorreu durante a transferência do jogador.");
          } else {
            callback("Jogador transferido com sucesso.");
          }
        }
      );
    });
  });
}

function Classification(callback) {
  var classificationQuery = `
    SELECT
      clube.Id AS ClubId,
      clube.Nome AS ClubName,
      resultado.Score
    FROM
      clube
    LEFT JOIN
      resultado
    ON
      resultado.IdClubeHome = clube.Id OR resultado.IdClubeAway = clube.Id
  `;

  con.query(classificationQuery, function (err, results) {
    if (err) {
      console.log(err);
      callback("Erro ocorreu durante o cálculo da classificação.");
      return;
    }

    var classification = {};

    results.forEach(function (row) {
      var clubId = row.ClubId;
      var score = row.Score;

      if (!classification[clubId]) {
        classification[clubId] = {
          ClubId: clubId,
          ClubName: row.ClubName,
          GamesPlayed: 0,
          Points: 0,
          Wins: 0,
          Losses: 0,
          Draws: 0,
        };
      }

      var clubData = classification[clubId];

      clubData.GamesPlayed++;

      if (score === 0) { // Compare as numbers instead of strings
        clubData.Points += 1;
        clubData.Draws++;
      } else if (score === 1) { // Compare as numbers instead of strings
        clubData.Points += 3;
        clubData.Wins++;
      } else { // Derrota
        clubData.Losses++;
      }
    });

    // Converte o objeto de classificação em um array
    var classificationArray = Object.values(classification);

    // Ordena a classificação com base nos pontos
    classificationArray.sort(function (a, b) {
      return b.Points - a.Points;
    });

    callback(classificationArray);
  });
}

module.exports = {
  con: con,
  NewGame: NewGame,
  PlayerDetails: PlayerDetails,
  ClubDetails: ClubDetails,
  Transfer: Transfer,
  Classification: Classification,
};



