let board : HTMLFormElement;
let context : CanvasRenderingContext2D;
const boardWidth: number = 500;
const boardHeight: number = 500;
let score1: number = 0;
let score2: number = 0;
let play: boolean = false;

//players
const playerWidth: number = boardWidth / 50;
const playerHeight: number = boardHeight / 5;
let playerVelocityY: number = 0;

//paddel
const speed = boardHeight / 10;

//ball
let ballWidth: number = 10;
let ballHeight: number = 10;

let ball: {x: number, y: number, width: number, height: number, velocityX: number, velocityY: number} = {
    x : boardWidth / 2,
    y : boardHeight / 2,
    width : ballWidth,
    height : ballHeight,
    velocityX : 1,
    velocityY : 2,
};


//init player one
let player1 = {
    x: 10,
    y : boardHeight / 2  - playerHeight / 2,
    width : playerWidth,
    height : playerHeight,
    velocityY : playerVelocityY
}

//init player two
let player2 = { ... player1 };
player2.x = boardWidth - playerWidth - 10;
player2.y = boardHeight / 2 - playerHeight / 2;

window.onload = function () {
    board = document.getElementById("board") as HTMLFormElement;
    if (!board)
        return;
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    //draw init paddel
    context.fillStyle = "skyblue";
    context.fillRect(player1.x, player1.y, player1.width, player1.height);

    requestAnimationFrame(update);
    document.addEventListener("keyup", movePlayer);
    const img = new Image();
    img.src = "background.jpe";
    context.drawImage(img, 0, 0, board.width, board.height);
}

function update(){
    requestAnimationFrame(update)

    context.clearRect(0, 0, board.width, board.height);
    context.fillStyle = "skyblue";

    //print paddle to canvas
    printPlayers();

    //ball
    drawLine();
    ballMovements();

    //win point
    if (ball.x <= 0){
        score2++;
        resetGame(1);
    } else if (ball.x + ballWidth > boardWidth){
        score1++;
        resetGame(1);
    }

    //print score
    context.fillStyle = "white"
    context.font = "42px sans-serif";
    context.fillText(score1.toString(), boardWidth / 5, 45);
    context.fillText(score2.toString(), boardWidth * 4 / 5 - 45, 45);
}

function movePlayer(event : KeyboardEvent) {
    if (event.code == "KeyW"){
        player1.velocityY = -speed;
    } else if (event.code == "KeyS"){
        player1.velocityY = speed;
    }

    if (event.code == "ArrowUp"){
        player2.velocityY = -speed;
    } else if (event.code == "ArrowDown"){
        player2.velocityY = speed;
    }
}

function outOfBounds(yPos: number){
    return (yPos < 0 || yPos + playerHeight > boardHeight);
}

function detectCollision(a: any , b: any) {
    return (a.x < b.x + b.width && //a top left doesn't hit b top right
        a.x + a.width > b.x && //a top right doesn't hit b top left 
        a.y < b.y + b.height && // a top left doesn't hit b bot left
        a.y + a.height > b.y);
        //a bot left does hit b top left
        // check if a object is inside b object 
}

function resetGame(direction: number){
    ball = {
        x : boardWidth / 2,
        y : boardHeight / 2,
        width : ballWidth,
        height : ballHeight,
        velocityX : direction,
        velocityY : 2,
    }
}

function ballMovements(){
    if ((ball.x + ball.height) > boardWidth || ball.x <= 0)
        ball.velocityX *= -1;
    ball.x += ball.velocityX;
    if ((ball.y + ball.width) >= boardHeight || ball.y <= 0)
        ball.velocityY *= -1;
    ball.y += ball.velocityY;
    //context.fillRect(ball.x, ball.y, ball.width, ball.height);
    context.beginPath();
    context.arc(ball.x + ballHeight / 2, ball.y + ball.width / 2, 10, 0 , 2 * Math.PI, false);
    context.fillStyle = 'red';
    context.fill()

    if (detectCollision(ball, player1)){
        ball.velocityX < 0 ? ball.velocityX -= 0.5 : ball.velocityX += 0.5;
        ball.velocityX *= -1;
    } else if (detectCollision(ball, player2)){
        ball.velocityX < 0 ? ball.velocityX -= 0.5 : ball.velocityX += 0.5;
        ball.velocityX *= -1;
    }
}

function printPlayers(){
    //player 1
    if (!outOfBounds(player1.y + player1.velocityY)){
        player1.y += player1.velocityY;
    }
    context.fillRect(player1.x, player1.y, player1.width, player1.height);
    player1.velocityY = 0;
    
    //player 2
    if (!outOfBounds(player2.y + player2.velocityY)){
        player2.y += player2.velocityY;
    }
    context.fillStyle = "skyblue";
    context.fillRect(player2.x, player2.y, player2.width, player2.height);
    player2.velocityY = 0;
}

function drawLine(){
    context.beginPath();
    context.fillStyle = 'white';
    context.fillRect(board.width / 2 - 5, 0, 5, boardHeight);
    
    context.arc(board.width / 2, board.height / 2, 70, 0 , 2 * Math.PI, false);
    context.fillStyle = "rgba(255, 255, 255, 0)";
    context.fill();
    context.lineWidth = 5;
    context.strokeStyle = 'white';
    context.stroke();
}