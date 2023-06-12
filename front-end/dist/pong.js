"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var gameBoard = document.querySelector("#gameBoard");
var ctx = gameBoard.getContext("2d");
var scoreText = document.querySelector("#scoreText");
var stopBtn = document.querySelector("#stopBtn");
var searchBtn = document.querySelector("#searchBtn");
var gameWidth = gameBoard.width;
var gameHeigth = gameBoard.height;
var boardBackGround = "rgb(187, 230, 228)";
var paddle1Color = "rgb(8, 75, 131)";
var paddle2Color = "rgb(8, 75, 131)";
var paddleBorder = "black";
var ballColor = "rgb(255, 102, 179)";
var ballBorderColor = "black";
var paddleSpeed = 50;
var playerUUID = crypto.randomUUID();
var API_IP = "localhost";
var intervalID;
var side;
var matchData;
window.addEventListener("keydown", changeDirection);
searchBtn === null || searchBtn === void 0 ? void 0 : searchBtn.addEventListener("click", gameSearch);
function waitMySecond(ms) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve();
        }, ms);
    });
}
function gameSearch() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (searchBtn)
                        searchBtn.textContent = "Searching";
                    sendPlayerData();
                    return [4 /*yield*/, waitMySecond(1000)];
                case 1:
                    _a.sent();
                    console.log('SEARCH AN OPPONENT !!');
                    _a.label = 2;
                case 2:
                    findOpponent();
                    return [4 /*yield*/, waitMySecond(1000)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    if (!matchData.findOpponent) return [3 /*break*/, 2];
                    _a.label = 5;
                case 5:
                    side = matchData.side;
                    console.log('FIND OPPONENT');
                    nextTick();
                    return [2 /*return*/];
            }
        });
    });
}
function sendPlayerData() {
    fetch("http://".concat(API_IP, ":3000/pong-data/"), {
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
    });
}
function findOpponent() {
    fetch("http://".concat(API_IP, ":3000/pong-data/").concat(playerUUID))
        .then(function (reponse) { return reponse.json(); })
        .then(function (reponseBis) { return matchData = reponseBis; })
        .catch(function (error) { return console.log(error); });
}
function updatePaddle() {
    fetch("http://".concat(API_IP, ":3000/pong-data/match/").concat(matchData.matchUUID), {
        method: 'PATCH',
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify(matchData)
    });
}
function getMatch() {
    fetch("http://".concat(API_IP, ":3000/pong-data/match/").concat(matchData.matchUUID))
        .then(function (reponse) { return reponse.json(); })
        .then(function (reponseBis) {
        console.table(reponseBis);
        matchData = reponseBis;
    })
        .catch(function (error) { return console.log(error); });
}
function nextTick() {
    intervalID = setTimeout(function () {
        getMatch();
        clearBoard();
        drawPaddles();
        drawball(matchData.ballX, matchData.ballY);
        updateScore();
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
    ctx === null || ctx === void 0 ? void 0 : ctx.fillRect(matchData.paddle1.x, matchData.paddle1.y, matchData.paddle1.width, matchData.paddle1.heigth);
    ctx === null || ctx === void 0 ? void 0 : ctx.strokeRect(matchData.paddle1.x, matchData.paddle1.y, matchData.paddle1.width, matchData.paddle1.heigth);
    if (ctx)
        ctx.fillStyle = paddle2Color;
    ctx === null || ctx === void 0 ? void 0 : ctx.fillRect(matchData.paddle2.x, matchData.paddle2.y, matchData.paddle2.width, matchData.paddle2.heigth);
    ctx === null || ctx === void 0 ? void 0 : ctx.strokeRect(matchData.paddle2.x, matchData.paddle2.y, matchData.paddle2.width, matchData.paddle2.heigth);
}
function drawball(ballX, ballY) {
    if (ctx) {
        ctx.fillStyle = ballColor;
        ctx.strokeStyle = ballBorderColor;
        ctx.lineWidth = 2;
    }
    ctx === null || ctx === void 0 ? void 0 : ctx.beginPath();
    ctx === null || ctx === void 0 ? void 0 : ctx.arc(ballX, ballY, matchData.ballRadius, 0, 2 * Math.PI);
    ctx === null || ctx === void 0 ? void 0 : ctx.stroke();
    ctx === null || ctx === void 0 ? void 0 : ctx.fill();
}
function changeDirection(event) {
    var keyPressed = event.keyCode;
    var paddleUp;
    var paddleDown;
    if (side === 1) {
        paddleUp = 87;
        paddleDown = 83;
    }
    else if (side === 2) {
        paddleUp = 38;
        paddleDown = 40;
    }
    switch (keyPressed) {
        case paddleUp:
            if (side === 1 && matchData.paddle1.y > 0)
                matchData.paddle1.y -= paddleSpeed;
            else if (matchData.paddle2.y > 0)
                matchData.paddle2.y -= paddleSpeed;
            break;
        case paddleDown:
            if (side === 1 && matchData.paddle1.y < gameHeigth - matchData.paddle1.heigth)
                matchData.paddle1.y += paddleSpeed;
            else if (side === 2 && matchData.paddle2.y < gameHeigth - matchData.paddle2.heigth)
                matchData.paddle2.y += paddleSpeed;
            break;
    }
    updatePaddle();
}
function updateScore() {
    if (scoreText)
        scoreText.textContent = "".concat(matchData.player1Score, " : ").concat(matchData.player2Score);
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
