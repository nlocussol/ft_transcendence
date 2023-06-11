const gameBoard = document.querySelector("#gameBoard") as HTMLCanvasElement;
const ctx = gameBoard.getContext("2d");
const scoreText = document.querySelector("#scoreText");
const stopBtn = document.querySelector("#stopBtn");
const searchBtn = document.querySelector("#searchBtn");
const gameWidth: number = gameBoard.width;
const gameHeigth: number = gameBoard.height;
const boardBackGround: string = "rgb(187, 230, 228)";
const paddle1Color: string = "rgb(8, 75, 131)";
const paddle2Color: string = "rgb(8, 75, 131)";
const paddleBorder: string = "black";
const ballColor: string = "rgb(255, 102, 179)";
const ballBorderColor: string = "black";
const paddleSpeed: number = 50;
const playerUUID: string = crypto.randomUUID();
let intervalID: any;

interface paddle {
  width: number;
  heigth: number;
  x: number;
  y: number;
}

interface MatchData {
  playerUUIDs: string[];
  matchUUID: string;
  findOpponent: boolean;
  ballSpeed: number;
  ballX: number;
  ballY: number;
  ballRadius: number;
  ballXDirection: number;
  ballYDirection: number;
  player1Score: number;
  player2Score: number;
  paddle1: paddle;
  paddle2: paddle;
}
let IP: string = "localhost";

let matchData: MatchData;

window.addEventListener("keydown", changeDirection);
// stopBtn?.addEventListener("click", stopGame);
searchBtn?.addEventListener("click", gameSearch);

function waitMySecond(ms:number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

async function gameSearch() {
  if (searchBtn)
    searchBtn.textContent = "Searching";
  sendPlayerData();
  await waitMySecond(1000);
  console.log('SEARCH AN OPPONENT !!');
  do {
    findOpponent()
    await waitMySecond(1000);
  } while (!matchData.findOpponent)
  console.log('FIND OPPONENT');
  nextTick();
}

function sendPlayerData() {
  fetch(`http://${IP}:3000/pong-data/`, {
    method: 'POST',
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    },

    body: JSON.stringify({
      playerUUID: playerUUID,
      waitingMatch: true,
      gameHeigth: gameHeigth,
      gameWidth: gameWidth,
    })
  })
}

function findOpponent() {
  fetch(`http://${IP}:3000/pong-data/${playerUUID}`)
  .then(reponse => reponse.json())
  .then(reponseBis => matchData = reponseBis)
  .catch(error => console.log(error));
}

function updatePaddle() {
  fetch(`http://localhost:3000/pong-data/match/${matchData.matchUUID}`, {
    method: 'PATCH',
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    },

    body: JSON.stringify(matchData)
  })
}

function getMatch() {
  fetch(`http://${IP}:3000/pong-data/match/${matchData.matchUUID}`)
  .then(reponse => reponse.json())
  .then(reponseBis => {
    console.table(reponseBis);
    matchData = reponseBis})
  .catch(error => console.log(error));
}

function nextTick() { 
  intervalID = setTimeout(() => {
    getMatch();
    clearBoard();
    drawPaddles();
    drawball(matchData.ballX, matchData.ballY);
    updateScore();
    nextTick();
  }, 10);
}

function clearBoard() {
  if (ctx) ctx.fillStyle = boardBackGround;
  ctx?.fillRect(0, 0, gameWidth, gameHeigth);
}

function drawPaddles() {
  if (ctx) {
    ctx.strokeStyle = paddleBorder;
    ctx.fillStyle = paddle1Color;
  }
  ctx?.fillRect(matchData.paddle1.x, matchData.paddle1.y, matchData.paddle1.width, matchData.paddle1.heigth);
  ctx?.strokeRect(matchData.paddle1.x, matchData.paddle1.y, matchData.paddle1.width, matchData.paddle1.heigth);

  if (ctx) ctx.fillStyle = paddle2Color;
  ctx?.fillRect(matchData.paddle2.x, matchData.paddle2.y, matchData.paddle2.width, matchData.paddle2.heigth);
  ctx?.strokeRect(matchData.paddle2.x, matchData.paddle2.y, matchData.paddle2.width, matchData.paddle2.heigth);
}

function drawball(ballX: number, ballY: number) {
  if (ctx) {
    ctx.fillStyle = ballColor;
    ctx.strokeStyle = ballBorderColor;
    ctx.lineWidth = 2;
  }
  ctx?.beginPath();
  ctx?.arc(ballX, ballY, matchData.ballRadius, 0, 2 * Math.PI);
  ctx?.stroke();
  ctx?.fill();
}

function changeDirection(event: any) {
  const keyPressed = event.keyCode;
  const paddle1Up = 87;
  const paddle1Down = 83;
  const paddle2Up = 38;
  const paddle2Down = 40;

  switch (keyPressed) {
    case paddle1Up:
      if (matchData.paddle1.y > 0) matchData.paddle1.y -= paddleSpeed;
      break;
    case paddle1Down:
      if (matchData.paddle1.y < gameHeigth - matchData.paddle1.heigth) matchData.paddle1.y += paddleSpeed;
      break;
    case paddle2Up:
      if (matchData.paddle2.y > 0) matchData.paddle2.y -= paddleSpeed;
      break;
    case paddle2Down:
      if (matchData.paddle2.y < gameHeigth - matchData.paddle2.heigth) matchData.paddle2.y += paddleSpeed;
      break;
  }
  updatePaddle();
}

function updateScore() {
  if (scoreText) scoreText.textContent = `${matchData.player1Score} : ${matchData.player2Score}`;
}

/*function stopGame() {
  matchData.player1Score = 0;
  matchData.player2Score = 0;
  matchData.paddle1 = {
    width: 25,
    heigth: 100,
    x: 0,
    y: 0,
  };
  matchData.paddle2 = {
    width: 25,
    heigth: 100,
    x: gameWidth - 25,
    y: gameHeigth - 100,
  };
  matchData.ballSpeed = 1;
  matchData.ballX = 0;
  matchData.ballY = 0;
  matchData.ballXDirection = 0;
  matchData.ballYDirection = 0;
  updateScore();
  clearInterval(intervalID);
  clearBoard();
  drawPaddles();
  drawball(gameWidth / 2, gameHeigth / 2);
}*/
