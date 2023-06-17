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

  // Uma equipa não pode jogar contra si própria
  if (IdClubeHome === IdClubeAway) {
    callback("As equipas não podem jogar contra si próprias.");
    return;
  }

  // Ver se o score é um dígito que estamos à espera
  if (![ 0, 1, 2 ].includes(Score)) {
    callback("Resultado inválido, usa 0 para empate, 1 para vitória da equipa da casa, e 2 para vitória da equipa que joga fora.");
    return;
  }

  // Map the score values to the desired format
  /*
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
  */
  
  const query = `INSERT INTO resultado (IdClubeHome, IdClubeAway, Score) VALUES (?, ?, ?)`;
  con.query(query, [IdClubeHome, IdClubeAway, Score], (error, result) => {
    if (error) {
      console.error("Erro ao inserir o resultado do jogo.", error);
      callback(error, null);
    } else {
      console.log("Resultado do jogo inserido com sucesso.");
      console.log(result);

      callback(null, result);
    }
  });
}


function PlayerDetails(id, callback) {
  var sql = `
    SELECT
      j.id,
      j.nome AS Jogador,
      c.nome AS Clube
    FROM jogador j
    LEFT JOIN clube c ON j.IdClube = c.Id
    WHERE j.Id = ?
  `;
  con.query(sql, id, function (err, result) {
    if (err) {
      console.log(err);
      callback(null);
    } else {
      callback(result);
    }
  });
}

/*
{
  Nome: 'Real Madrid',
  jogadores: [
    'Cristiano Ronaldo',
    'Messi',
    'Whatever'
  ],
  GamesPlayed: 0,
  Points: 0,
  Wins: 0,
  Losses: 0,
  Draws: 0
}
*/

function ClubDetails(id, callback) {
  Classification(function(result) {
    const equipa = result.find(item => item.Id === Number(id));

    if (!equipa) {
      console.log('Essa equipa não existe.')
      callback(null);
      return;
    }
  
    var sql = `
      SELECT
        jogador.Id,
        jogador.Nome
      FROM clube 
      LEFT JOIN jogador ON clube.Id = jogador.Idclube 
      WHERE clube.Id = ?
      `;
    con.query(sql, id, function (err, result) {
      if (err) {
        console.log(err);
        callback(null);
      } else {
        equipa.Jogadores = result;
        callback(equipa);
      }
    });
  });
}

function Transfer(transferData, callback) {
  var playerId = Number(transferData.player);
  var targetClubId = Number(transferData.club);

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
    } else if(targetClubId === playerResult[0].IdClube){
      callback("O jogador já está nesse clube.");
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

      var updatePlayerQuery = "UPDATE jogador SET IdClube = ? WHERE Id = ?";
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
      resultado.IdClubeHome,
      resultado.Score
    FROM clube
    LEFT JOIN resultado
      ON resultado.IdClubeHome = clube.Id OR resultado.IdClubeAway = clube.Id
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
          Id: clubId,
          Name: row.ClubName,
          GamesPlayed: 0,
          Points: 0,
          Wins: 0,
          Losses: 0,
          Draws: 0,
        };
      }

      if (score !== null) {
        var clubData = classification[clubId];
        var isHome = clubId === row.IdClubeHome;
  
        clubData.GamesPlayed++;
  
        if (score === 0) { // Empate
          clubData.Points += 1;
          clubData.Draws++;
        } else if (score === 1) { // Vitória da casa
          if (isHome) {
            clubData.Points += 3;
            clubData.Wins++;
          }
          else {
            clubData.Losses++;
          }
        } else { // Derrota da casa
          if (isHome) {
            clubData.Losses++;
          }
          else {
            clubData.Points += 3;
            clubData.Wins++;
          }
        }
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



