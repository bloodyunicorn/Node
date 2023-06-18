const mysql = require('mysql');

const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'futebol',
});

con.connect(function (err) {
  if (err) throw err;
  console.log('Conectado à base de dados!');
});

function asyncQuery(query, valores) {
  return new Promise(function (resolve, reject) {
    con.query(query, valores, function (err, results) {
      if (err) {
        console.error(err);
        reject(err);
      }

      resolve(results);
    });
  });
}

async function newGame(request, response) {
  const { IdCasa, IdFora, Resultado } = request.body;

  if (!IdCasa || !IdFora) {
    response.status(400).json({ error: "Faltam campos necessários." });
    return;
  }

  if (IdCasa === IdFora) {
    response.status(400).json({ error: "As equipas não podem jogar contra si próprias." });
    return;
  }

  // Ver se o resultado é um dígito que estamos à espera
  // 0 - empate
  // 1 - vitória da equipa da casa
  // 2 - vitória da equipa visitante
  if (![ 0, 1, 2 ].includes(Resultado)) {
    response.status(400).json({ error: "Resultado inválido, usa 0 para empate, 1 para vitória da equipa da casa, e 2 para vitória da equipa que joga fora."});
    return;
  }
  
  const query = `INSERT INTO resultado (IdCasa, IdFora, Resultado) VALUES (?, ?, ?)`;

  let result;
  try {
    result = await asyncQuery(query, [IdCasa, IdFora, Resultado]);
  }
  catch (ex) {
    response.status(500).json({ error: "Erro ao inserir o resultado." });
    return;
  }

  console.log("Resultado inserido com successo.");
  response.status(201).json({ message: "Resultado do jogo inserido com sucesso." });
}


async function playerDetails(req, res) {

  const id = Number(req.params.id);

  if (!id) {
    response.status(400).json({ error: "Faltam campos necessários." });
    return;
  }

  const sql = `
    SELECT
      j.id,
      j.nome AS Jogador,
      c.nome AS Clube
    FROM jogador j
    LEFT JOIN clube c ON j.IdClube = c.Id
    WHERE j.Id = ?
  `;

  try {
    result = await asyncQuery( sql, id);
  } 
  catch (ex) {
    console.error(ex);
    res.status(500).json({ error: "Erro ao retornar informação do Jogador" });
    return;
  
  }
  
  res.json(result);
 
}

async function classification(request, response) {

  const classificationQuery = `
    SELECT
      c.Id AS ClubId,
      c.Nome AS ClubName,
      r.IdCasa,
      r.Resultado
    FROM clube c
    LEFT JOIN resultado r
      ON r.IdCasa = c.Id OR r.IdFora = c.Id
  `;

  let results;
  try {
    results = await asyncQuery(classificationQuery);
  }
  catch (ex) {
    response.status(500).json({ error: "Erro ocorreu durante o cálculo da classificação." });
    return;
  }

  const classification = {};

  results.forEach(function (row) {
    const clubId = row.ClubId;
    const score = row.Resultado;

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
      const clubData = classification[clubId];
      const isHome = clubId === row.IdCasa;

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
  const classificationArray = Object.values(classification);

  // Ordena a classificação com base nos pontos
  classificationArray.sort(function (a, b) {
    return b.Points - a.Points;
  });

  if (request){
    response.json(classificationArray);

  } else{
    return classificationArray;
  }
}

async function clubDetails(request, response) {
  const id = Number(request.params.id);

  if (!id) {
    response.status(400).json({ error: "Faltam campos necessários." });
    return;
  }

  const result = await classification(null, response);
 
  const equipa = result.find(item => item.Id === id);

  if (!equipa) {
    response.status(404).json({ error: "Essa equipa não existe." });
    return;
  }

  const sql = `
    SELECT
      j.Id,
      j.Nome
    FROM clube 
    LEFT JOIN jogador j ON clube.Id = j.Idclube 
    WHERE clube.Id = ?
    `;

  let clubResult;
   try{
    clubResult = await asyncQuery(sql, id)
   } catch(ex){
    console.error(ex);
    response.status(500).json({ error: "Erro ao retornar informação da equipa." });   
  }

    equipa.Jogadores = clubResult;
    response.json(equipa);

}

async function transfer(req, res) {
  const playerId = Number(req.body.player);
  const targetClubId = Number(req.body.club);

  if (!playerId || !targetClubId) {
    res.status(400).json({ error: "Faltam campos necessários." });
    return;
  }

  const checkPlayerQuery = "SELECT * FROM jogador WHERE Id = ?";
  const checkClubQuery = "SELECT * FROM clube WHERE Id = ?";
  const updatePlayerQuery = "UPDATE jogador SET IdClube = ? WHERE Id = ?";

  try {
    const playerResult = await asyncQuery(checkPlayerQuery, playerId);

    if (playerResult.length === 0) {
      res.status(404).json({error: "Jogador não encontrado."});
      return;

    } else if(targetClubId === playerResult[0].IdClube){
      
      res.status(400).json({error: "O jogador já está nesse clube."});
      return;
    }

    const clubResult = await asyncQuery(checkClubQuery, targetClubId);

    if (clubResult.length === 0) {
      res.status(404).json({error: "Clube de destino não encontrado."});
      return;
    }

    await asyncQuery(updatePlayerQuery, [targetClubId, playerId]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro na transferência do jogador." });   
    return;

  }

    res.json({message: "Jogador transferido com sucesso."});
          
}

module.exports = {
  con,
  newGame,
  playerDetails,
  clubDetails,
  transfer,
  classification,
};



