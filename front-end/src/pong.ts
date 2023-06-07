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
const ballRadius: number = 12.5;
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
    ballXDirection: number;
    ballYDirection: number;
    player1Score: number;
    player2Score: number;
    paddle1: paddle;
    paddle2: paddle;
}

let matchData: MatchData;

window.addEventListener("keydown", changeDirection);
stopBtn?.addEventListener("click", stopGame);
searchBtn?.addEventListener("click", gameSearch);

// drawPaddles();
//drawball(gameWidth / 2, gameHeigth / 2);

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
  waitMySecond(2000);
  while (!findOpponent()) {
    console.log('SEARCH AN OPPONENT !!');
    await waitMySecond(1000);
  }
  console.log('FIND OPPONENT');
  // createBall();
  // nextTick();
}

function sendPlayerData() {
  fetch(`http://localhost:3000/pong-data/`, {
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

function findOpponent(): boolean {
  fetch(`http://localhost:3000/pong-data/${playerUUID}`)
  .then(reponse => reponse.json())
  .then(reponseBis => {
    if (!reponseBis.findOpponent) {
      console.log('OPPONENT NOT FOUND');
      return false;
    }
    else {
      console.table(reponseBis);
      matchData.playerUUIDs = reponseBis.playerUUIDs;
      matchData.findOpponent = matchData.findOpponent;
      matchData.matchUUID = reponseBis.matchUUID;
      matchData.ballSpeed = reponseBis.ballSpeed;
      matchData.ballX = reponseBis.ballX;
      matchData.ballY = reponseBis.ballY;
      matchData.ballXDirection = reponseBis.ballXDirection;
      matchData.ballYDirection = reponseBis.ballYDirection;
      matchData.player1Score = reponseBis.player1Score;
      matchData.player2Score = reponseBis.player2Score;
      matchData.paddle1 = reponseBis.paddle1;
      matchData.paddle2 = reponseBis.paddle2;
      return true;
    }
  })
  .catch(error => console.log('Catch an error'));
  return false;
}

function updateMatch() {
  fetch(`http://localhost:3000/pong-data/${matchData.matchUUID}`, {
    method: 'POST',
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    },

    body: JSON.stringify(matchData)
  })
}

function nextTick() {
  intervalID = setTimeout(() => {
    clearBoard();
    drawPaddles();
    moveball();
    drawball(matchData.ballX, matchData.ballY);
    checkCollision();
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

function createBall() {
  matchData.ballSpeed = 1;
  if (Math.round(Math.random()) == 1) matchData.ballXDirection = 1;
  else matchData.ballXDirection = -1;
  if (Math.round(Math.random()) == 1) matchData.ballYDirection = 1;
  else matchData.ballYDirection = -1;
  matchData.ballX = gameWidth / 2;
  matchData.ballY = gameHeigth / 2;
  drawball(matchData.ballX, matchData.ballY);
}

function moveball() {
  matchData.ballX += matchData.ballSpeed * matchData.ballXDirection;
  matchData.ballY += matchData.ballSpeed * matchData.ballYDirection;
}

function drawball(ballX: number, ballY: number) {
  if (ctx) {
    ctx.fillStyle = ballColor;
    ctx.strokeStyle = ballBorderColor;
    ctx.lineWidth = 2;
  }
  ctx?.beginPath();
  ctx?.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI);
  ctx?.stroke();
  ctx?.fill();
}

function checkCollision() {
  if (matchData.ballY <= 0 + ballRadius) matchData.ballYDirection *= -1;
  if (matchData.ballY >= gameHeigth - ballRadius) matchData.ballYDirection *= -1;
  if (matchData.ballX <= 0) {
    matchData.player2Score++;
    updateScore();
    createBall();
    return;
  }
  if (matchData.ballX >= gameWidth) {
    matchData.player1Score++;
    updateScore();
    createBall();
    return;
  }
  if (matchData.ballX <= matchData.paddle1.x + matchData.paddle1.width + ballRadius) {
    if (matchData.ballY > matchData.paddle1.y && matchData.ballY < matchData.paddle1.y + matchData.paddle1.heigth) {
      matchData.ballX = matchData.paddle1.x + matchData.paddle1.width + ballRadius; // if ball gets stuck
      matchData.ballXDirection *= -1;
      matchData.ballSpeed++;
    }
  }
  if (matchData.ballX >= matchData.paddle2.x - ballRadius) {
    if (matchData.ballY > matchData.paddle2.y && matchData.ballY < matchData.paddle2.y + matchData.paddle2.heigth) {
      matchData.ballX = matchData.paddle2.x - ballRadius; // if ball gets stuck
      matchData.ballXDirection *= -1;
      matchData.ballSpeed++;
    }
  }
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
}

function updateScore() {
  if (scoreText) scoreText.textContent = `${matchData.player1Score} : ${matchData.player2Score}`;
}

function stopGame() {
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
}
