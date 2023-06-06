const gameBoard = document.querySelector("#gameBoard") as HTMLCanvasElement;
const ctx = gameBoard.getContext("2d");
const scoreText = document.querySelector("#scoreText");
const resetBtn = document.querySelector("#resetBtn");
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
let paddle1 = {
  width: 25,
  heigth: 100,
  x: 0,
  y: 0,
};

let paddle2 = {
  width: 25,
  heigth: 100,
  x: gameWidth - 25,
  y: gameHeigth - 100,
};

fetch('http://localhost:3000/pong-data/', {
  method: 'POST',
  headers: {
    "Content-type": "application/json; charset=UTF-8"
  },

  body: JSON.stringify({
    matchID: 1,
    ballSpeed: 1,
    ballX: gameWidth / 2,
    ballY: gameHeigth / 2,
    ballXDirection: 0,
    ballYDirection: 0,
    player1Score: 0,
    player2Score: 0,
    paddle1,
    paddle2
  })

})


let intervalID: any;
let ballSpeed: number = 1;
let ballX: number = gameWidth / 2;
let ballY: number = gameHeigth / 2;
let ballXDirection: number = 0;
let ballYDirection: number = 0;
let player1Score: number = 0;
let player2Score: number = 0;



window.addEventListener("keydown", changeDirection);
resetBtn?.addEventListener("click", resetGame);

gameStart();
drawPaddles();

function gameStart() {
  createBall();
  nextTick();
}

function nextTick() {
  intervalID = setTimeout(() => {
    clearBoard();
    drawPaddles();
    moveball();
    drawball(ballX, ballY);
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
  ctx?.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.heigth);
  ctx?.strokeRect(paddle1.x, paddle1.y, paddle1.width, paddle1.heigth);

  if (ctx) ctx.fillStyle = paddle2Color;
  ctx?.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.heigth);
  ctx?.strokeRect(paddle2.x, paddle2.y, paddle2.width, paddle2.heigth);
}

function createBall() {
  ballSpeed = 1;
  if (Math.round(Math.random()) == 1) ballXDirection = 1;
  else ballXDirection = -1;
  if (Math.round(Math.random()) == 1) ballYDirection = 1;
  else ballYDirection = -1;
  ballX = gameWidth / 2;
  ballY = gameHeigth / 2;
  drawball(ballX, ballY);
}

function moveball() {
  ballX += ballSpeed * ballXDirection;
  ballY += ballSpeed * ballYDirection;
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
  if (ballY <= 0 + ballRadius) ballYDirection *= -1;
  if (ballY >= gameHeigth - ballRadius) ballYDirection *= -1;
  if (ballX <= 0) {
    player2Score++;
    updateScore();
    createBall();
    return;
  }
  if (ballX >= gameWidth) {
    player1Score++;
    updateScore();
    createBall();
    return;
  }
  if (ballX <= paddle1.x + paddle1.width + ballRadius) {
    if (ballY > paddle1.y && ballY < paddle1.y + paddle1.heigth) {
      ballX = paddle1.x + paddle1.width + ballRadius; // if ball gets stuck
      ballXDirection *= -1;
      ballSpeed++;
    }
  }
  if (ballX >= paddle2.x - ballRadius) {
    if (ballY > paddle2.y && ballY < paddle2.y + paddle2.heigth) {
      ballX = paddle2.x - ballRadius; // if ball gets stuck
      ballXDirection *= -1;
      ballSpeed++;
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
      if (paddle1.y > 0) paddle1.y -= paddleSpeed;
      break;
    case paddle1Down:
      if (paddle1.y < gameHeigth - paddle1.heigth) paddle1.y += paddleSpeed;
      break;
    case paddle2Up:
      if (paddle2.y > 0) paddle2.y -= paddleSpeed;
      break;
    case paddle2Down:
      if (paddle2.y < gameHeigth - paddle2.heigth) paddle2.y += paddleSpeed;
      break;
  }
}

function updateScore() {
  if (scoreText) scoreText.textContent = `${player1Score} : ${player2Score}`;
}

function resetGame() {
  player1Score = 0;
  player2Score = 0;
  paddle1 = {
    width: 25,
    heigth: 100,
    x: 0,
    y: 0,
  };
  paddle2 = {
    width: 25,
    heigth: 100,
    x: gameWidth - 25,
    y: gameHeigth - 100,
  };
  ballSpeed = 1;
  ballX = 0;
  ballY = 0;
  ballXDirection = 0;
  ballYDirection = 0;
  updateScore();
  clearInterval(intervalID);
  gameStart();
}
