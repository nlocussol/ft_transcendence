"use strict";
var gameBoard = document.querySelector("#gameBoard");
var ctx = gameBoard.getContext("2d");
var scoreText = document.querySelector("#scoreText");
var resetBtn = document.querySelector("#resetBtn");
var gameWidth = gameBoard.width;
var gameHeigth = gameBoard.height;
var boardBackGround = "rgb(187, 230, 228)";
var paddle1Color = "rgb(8, 75, 131)";
var paddle2Color = "rgb(8, 75, 131)";
var paddleBorder = "black";
var ballColor = "rgb(255, 102, 179)";
var ballBorderColor = "black";
var ballRadius = 12.5;
var paddleSpeed = 50;
var paddle1 = {
    width: 25,
    heigth: 100,
    x: 0,
    y: 0,
};
var paddle2 = {
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
        paddle1: paddle1,
        paddle2: paddle2
    })
}).then(function (res) { return res.json(); })
    .then(function (data) { return console.log(data); });
var intervalID;
var ballSpeed = 1;
var ballX = gameWidth / 2;
var ballY = gameHeigth / 2;
var ballXDirection = 0;
var ballYDirection = 0;
var player1Score = 0;
var player2Score = 0;
window.addEventListener("keydown", changeDirection);
resetBtn === null || resetBtn === void 0 ? void 0 : resetBtn.addEventListener("click", resetGame);
gameStart();
drawPaddles();
function gameStart() {
    createBall();
    nextTick();
}
function nextTick() {
    intervalID = setTimeout(function () {
        clearBoard();
        drawPaddles();
        moveball();
        drawball(ballX, ballY);
        checkCollision();
        nextTick();
    }, 10);
}
function clearBoard() {
    if (ctx)
        ctx.fillStyle = boardBackGround;
    ctx === null || ctx === void 0 ? void 0 : ctx.fillRect(0, 0, gameWidth, gameHeigth);
}
function drawPaddles() {
    if (ctx) {
        ctx.strokeStyle = paddleBorder;
        ctx.fillStyle = paddle1Color;
    }
    ctx === null || ctx === void 0 ? void 0 : ctx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.heigth);
    ctx === null || ctx === void 0 ? void 0 : ctx.strokeRect(paddle1.x, paddle1.y, paddle1.width, paddle1.heigth);
    if (ctx)
        ctx.fillStyle = paddle2Color;
    ctx === null || ctx === void 0 ? void 0 : ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.heigth);
    ctx === null || ctx === void 0 ? void 0 : ctx.strokeRect(paddle2.x, paddle2.y, paddle2.width, paddle2.heigth);
}
function createBall() {
    ballSpeed = 1;
    if (Math.round(Math.random()) == 1)
        ballXDirection = 1;
    else
        ballXDirection = -1;
    if (Math.round(Math.random()) == 1)
        ballYDirection = 1;
    else
        ballYDirection = -1;
    ballX = gameWidth / 2;
    ballY = gameHeigth / 2;
    drawball(ballX, ballY);
}
function moveball() {
    ballX += ballSpeed * ballXDirection;
    ballY += ballSpeed * ballYDirection;
}
function drawball(ballX, ballY) {
    if (ctx) {
        ctx.fillStyle = ballColor;
        ctx.strokeStyle = ballBorderColor;
        ctx.lineWidth = 2;
    }
    ctx === null || ctx === void 0 ? void 0 : ctx.beginPath();
    ctx === null || ctx === void 0 ? void 0 : ctx.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI);
    ctx === null || ctx === void 0 ? void 0 : ctx.stroke();
    ctx === null || ctx === void 0 ? void 0 : ctx.fill();
}
function checkCollision() {
    if (ballY <= 0 + ballRadius)
        ballYDirection *= -1;
    if (ballY >= gameHeigth - ballRadius)
        ballYDirection *= -1;
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
function changeDirection(event) {
    var keyPressed = event.keyCode;
    var paddle1Up = 87;
    var paddle1Down = 83;
    var paddle2Up = 38;
    var paddle2Down = 40;
    switch (keyPressed) {
        case paddle1Up:
            if (paddle1.y > 0)
                paddle1.y -= paddleSpeed;
            break;
        case paddle1Down:
            if (paddle1.y < gameHeigth - paddle1.heigth)
                paddle1.y += paddleSpeed;
            break;
        case paddle2Up:
            if (paddle2.y > 0)
                paddle2.y -= paddleSpeed;
            break;
        case paddle2Down:
            if (paddle2.y < gameHeigth - paddle2.heigth)
                paddle2.y += paddleSpeed;
            break;
    }
}
function updateScore() {
    if (scoreText)
        scoreText.textContent = "".concat(player1Score, " : ").concat(player2Score);
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
