"use strict";
//   let canvasEl = document.getElementById("screen");
let canvasEl = document.querySelector("canvas");
let ctx = canvasEl.getContext("2d");
let W;
let H;
let oldW;
let oldH;
let game;
let player;
const keyPressed = {
  up: false,
  down: false,
  left: false,
  right: false,
  z: false,
  c: false,
};
const COLORS = ["#854724", "#ffffff", "#fce803", "#4cfcf7"];

const lastVelocity = {
  x: 0,
  y: -7,
};

class Utils {
  static init() {
    Utils.updateCanvasSizes();
    game = new Game();
    player = new Player(W / 2, H / 2);
    window.addEventListener("resize", Utils.resize);
    document.addEventListener("keypress", (e) => {
      if (e.key === "x" || e.key === "X") {
        player.shoot();
      }
    });
    Utils.handleMovement();
  }

  static updateCanvasSizes() {
    canvasEl.width = window.innerWidth;
    canvasEl.height = window.innerHeight;
    oldW = W;
    oldH = H;
    W = canvasEl.width;
    H = canvasEl.height;
  }

  static resize() {
    Utils.updateCanvasSizes();
    Utils.redraw();
  }

  static redraw() {
    player.position.x = (W * player.position.x) / oldW;
    player.position.y = (H * player.position.y) / oldH;
    player.draw(player.position.x, player.position.y);
  }

  static handleMovement() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Up" || e.key === "ArrowUp") {
        keyPressed.up = true;
      } else if (e.key === "Down" || e.key === "ArrowDown") {
        keyPressed.down = true;
      } else if (e.key === "Left" || e.key === "ArrowLeft") {
        keyPressed.left = true;
      } else if (e.key === "Right" || e.key === "ArrowRight") {
        keyPressed.right = true;
      } else if (e.key === "z" || e.key === "Z") {
        keyPressed.z = true;
      } else if (e.key === "c" || e.key === "C") {
        keyPressed.c = true;
      }
    });
    document.addEventListener("keyup", (e) => {
      if (e.key === "Up" || e.key === "ArrowUp") {
        keyPressed.up = false;
      } else if (e.key === "Down" || e.key === "ArrowDown") {
        keyPressed.down = false;
      } else if (e.key === "Left" || e.key === "ArrowLeft") {
        keyPressed.left = false;
      } else if (e.key === "Right" || e.key === "ArrowRight") {
        keyPressed.right = false;
      } else if (e.key === "z" || e.key === "Z") {
        keyPressed.z = false;
      } else if (e.key === "c" || e.key === "C") {
        keyPressed.c = false;
      }
    });
  }
}

class Game {
  constructor() {
    this.asteroids = [];
    this.maxAsteroidsNumber = W < H ? W / 150 : H / 150;
  }

  checkForGameOver() {
    if (player.lives <= 0) return true;
    else return false;
  }

  drawUI() {
    this.updateScore();
    this.updateLives();
  }

  updateScore() {
    ctx.font = "bold 32pt Arial";
    ctx.fillStyle = "#ffffff";
    let text = "Score: " + player.score;
    ctx.fillText(text, ctx.measureText(text).width / 2 + 50, 50);
  }

  updateLives() {
    ctx.font = "bold 32pt Arial";
    ctx.fillStyle = "#ffffff";
    let text = "Lives: " + player.lives;
    ctx.fillText(text, W - ctx.measureText(text).width - 50, 50);
  }

  draw(x, y) {
    ctx.clearRect(0, 0, W, H);
    this.drawUI();
    player.draw(x + player.velocity.x, y + player.velocity.y);
    let colisionIndex = player.colisionWithAsteroid(this.asteroids);
    if (colisionIndex != -1) {
      player.angle = 0;
      player.draw(W / 2, H / 2);
      this.asteroids[colisionIndex].strength--;
      player.lives--;
    }

    for (let i = 0; i < player.rockets.length; i++) {
      if (
        player.rockets[i].position.x < -5 ||
        player.rockets[i].position.x > W + 5 ||
        player.rockets[i].position.y < -5 ||
        player.rockets[i].position.y > H + 5
      ) {
        player.rockets.splice(i, 1);
        player.rocketsLeft++;
      } else {
        if (player.rockets[i].hit(this.asteroids) !== -1) {
          player.rockets.splice(i, 1);
          player.rocketsLeft++;
        } else {
          player.rockets[i].draw(
            player.rockets[i].position.x + player.rockets[i].velocity.x,
            player.rockets[i].position.y + player.rockets[i].velocity.y
          );
        }
      }
    }

    for (let i = 0; i < this.asteroids.length; i++) {
      if (
        this.asteroids[i].position.x < -1 * this.asteroids[i].strength * 25 ||
        this.asteroids[i].position.x > W + this.asteroids[i].strength * 25 ||
        this.asteroids[i].position.y < -1 * this.asteroids[i].strength * 25 ||
        this.asteroids[i].position.y > H + this.asteroids[i].strength * 25 ||
        this.asteroids[i].strength === 0
      ) {
        this.asteroids.splice(i, 1);
      } else {
        this.asteroids[i].draw(
          this.asteroids[i].position.x + this.asteroids[i].velocity.x,
          this.asteroids[i].position.y + this.asteroids[i].velocity.y
        );
      }
    }
    this.spawnAsteroids();
  }

  spawnAsteroids() {
    if (this.asteroids.length < this.maxAsteroidsNumber) {
      const spawnChance = 30; // %
      const spawnNumber = Math.floor(Math.random() * 100);

      if (spawnNumber < spawnChance) {
        const strength = Math.floor(Math.random() * 4 + 1);
        let posX = Math.floor(Math.random() * W);
        if (posX > W) posX -= 100;
        if (posX < 100) posX += 100;

        let posY = Math.floor(Math.random() * W);
        if (posY > H) posY -= 100;
        if (posY < 100) posY += 100;

        //which side will spawn an asteroid?
        const side = Math.floor(Math.random() * 4);
        switch (side) {
          case 0:
            //top
            posY = 0 - strength * 25;
            break;
          case 1:
            //right
            posX = W + strength * 25;
            break;
          case 2:
            //bottom
            posY = W + strength * 25;
            break;
          case 3:
            //left
            posX = 0 - strength * 25;
            break;
        }

        let canBeSpawned = true;
        for (const asteroid of this.asteroids) {
          if (Asteroid.intersect(posX, posY, strength, asteroid))
            canBeSpawned = false;
        }

        if (canBeSpawned) {
          let vx;
          let vy;
          switch (side) {
            case 0:
              //top
              vx = Math.floor(Math.random() * 10 - 5);
              if (vx === 0) vx++;
              vy = Math.floor(Math.random() * 5 + 1);
              break;

            case 1:
              //right
              vx = Math.floor(Math.random() * 5 - 5);
              vy = Math.floor(Math.random() * 10 - 5);
              if (vy === 0) vy++;
              break;

            case 2:
              //bottom
              vx = Math.floor(Math.random() * 10 - 5);
              if (vx === 0) vx++;
              vy = Math.floor(Math.random() * 5 - 5);
              break;

            case 3:
              //left
              vx = Math.floor(Math.random() * 5 + 1);
              vy = Math.floor(Math.random() * 10 - 5);
              if (vy === 0) vy++;
              break;
          }
          this.asteroids.push(new Asteroid(posX, posY, vx, vy, strength));
        }
      }
    }
  }
}

class Rocket {
  constructor(posX, posY, vx, vy) {
    this.position = {
      x: posX,
      y: posY,
    };
    this.velocity = {
      x: vx,
      y: vy,
    };
  }

  draw(x, y) {
    this.position.x = x;
    this.position.y = y;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  }

  hit(asteroids) {
    for (const index in asteroids) {
      if (
        Asteroid.intersect(
          this.position.x,
          this.position.y,
          0.2,
          asteroids[index]
        )
      ) {
        asteroids[index].strength--;
        player.addScore();
        return index;
      }
    }
    return -1;
  }
}

class Player {
  constructor(posX, posY) {
    this.score = 0;
    this.lives = 3;
    this.position = {
      x: posX,
      y: posY,
    };
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.speed = 7;
    this.angle = 0;
    this.rocketsLeft = 3;
    this.rockets = new Array();
    this.lastScore = 0;
  }

  addScore() {
    this.score += 100;
    if (this.score - this.lastScore >= 10000) {
      this.lastScore = this.score;
      this.lives++;
    }
  }

  draw(x, y) {
    this.position.x = x;
    this.position.y = y;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((-1 * (this.angle * Math.PI)) / 180);
    ctx.translate(-x, -y);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 15, y + 40);
    ctx.lineTo(x - 15, y + 40);
    ctx.closePath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
    ctx.restore();
  }

  move() {
    //TODO: change movement to be acording to 8 different directions
    lastVelocity.x = Math.sin((this.angle / 180) * Math.PI) * -this.speed;
    lastVelocity.y = Math.cos((this.angle / 180) * Math.PI) * -this.speed;
    this.velocity = {
      x: 0,
      y: 0,
    };
    if (keyPressed.up) {
      this.velocity.x = Math.sin((this.angle / 180) * Math.PI) * -this.speed;
      this.velocity.y = Math.cos((this.angle / 180) * Math.PI) * -this.speed;
    }

    if (keyPressed.down) {
      this.velocity.x = Math.sin((this.angle / 180) * Math.PI) * this.speed;
      this.velocity.y = Math.cos((this.angle / 180) * Math.PI) * this.speed;
    }

    if (keyPressed.left) {
      this.velocity.x =
        Math.sin(((this.angle + 90) / 180) * Math.PI) * -this.speed;
      this.velocity.y =
        Math.cos(((this.angle + 90) / 180) * Math.PI) * -this.speed;
    }

    if (keyPressed.right) {
      this.velocity.x =
        Math.sin(((this.angle + 90) / 180) * Math.PI) * this.speed;
      this.velocity.y =
        Math.cos(((this.angle + 90) / 180) * Math.PI) * this.speed;
    }

    if (keyPressed.z) {
      this.angle += 3;
    }

    if (keyPressed.c) {
      this.angle -= 3;
    }
  }

  shoot() {
    if (this.rocketsLeft > 0) {
      this.rocketsLeft--;
      this.rockets.push(
        new Rocket(
          this.position.x,
          this.position.y,
          lastVelocity.x,
          lastVelocity.y
        )
      );
    }
  }

  colisionWithAsteroid(asteroids) {
    //TODO: improve this by including the angle
    for (const index in asteroids) {
      const distance1 = Math.sqrt(
        (this.position.x - asteroids[index].position.x) *
          (this.position.x - asteroids[index].position.x) +
          (this.position.y - asteroids[index].position.y) *
            (this.position.y - asteroids[index].position.y)
      );

      const posX2 = this.position.x + 15;
      const posY2 = this.position.y + 40;

      const distance2 = Math.sqrt(
        (posX2 - asteroids[index].position.x) *
          (posX2 - asteroids[index].position.x) +
          (posY2 - asteroids[index].position.y) *
            (posY2 - asteroids[index].position.y)
      );

      const posX3 = this.position.x - 15;
      const posY3 = this.position.y + 40;

      const distance3 = Math.sqrt(
        (posX3 - asteroids[index].position.x) *
          (posX3 - asteroids[index].position.x) +
          (posY3 - asteroids[index].position.y) *
            (posY3 - asteroids[index].position.y)
      );

      let shortest = distance1 < distance2 ? distance1 : distance2;
      if (distance3 < shortest) shortest = distance3;

      if (shortest < asteroids[index].strength * 25) {
        return index;
      }
    }
    return -1;
  }
}

class Asteroid {
  constructor(posX, posY, vx, vy, strength) {
    this.position = {
      x: posX,
      y: posY,
    };
    this.velocity = {
      x: vx,
      y: vy,
    };
    this.strength = strength;
  }

  draw(x, y) {
    this.position.x = x;
    this.position.y = y;
    ctx.beginPath();
    ctx.arc(
      this.position.x,
      this.position.y,
      25 * this.strength,
      0,
      Math.PI * 2
    );
    ctx.lineWidth = 3;
    ctx.strokeStyle = COLORS[this.strength - 1];
    ctx.stroke();
    ctx.font = `${this.strength * 3}pt`;
    ctx.fillStyle = COLORS[this.strength - 1];
    ctx.textAlign = "center";
    ctx.fillText(this.strength, x, y + 10);
  }

  static intersect(posX, posY, strength, asteroidB) {
    const distance = Math.sqrt(
      (posX - asteroidB.position.x) * (posX - asteroidB.position.x) +
        (posY - asteroidB.position.y) * (posY - asteroidB.position.y)
    );

    if (distance <= strength * 25 - asteroidB.strength * 25) {
      return true;
    } else if (distance <= asteroidB.strength * 25 - strength * 25) {
      return true;
    } else if (distance < strength * 25 + asteroidB.strength * 25) {
      return true;
    } else {
      return false;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  canvasEl = document.getElementById("screen");
  ctx = canvasEl.getContext("2d");
  const playBtnEl = document.getElementById("play-btn");
  const submitNameBtnEl = document.getElementById("submit-name");
  const startModalEl = document.getElementById("start-game");
  const endModalEl = document.getElementById("end-game");

  if (!ctx) {
    alert("You can't play this game! Please change your browser!");
    return;
  }
  Utils.init();
  playBtnEl.addEventListener("click", () => {
    startModalEl.classList.add("hidden");
    let gameLoop = setInterval(function () {
      player.move();
      game.draw(player.position.x, player.position.y);
      if (game.checkForGameOver()) {
        clearInterval(gameLoop);
        endModalEl.classList.remove("hidden");
        const endScreenMessageEl = document.getElementById("endgame-text");
        endScreenMessageEl.textContent = `You lost! Your score was ${player.score}.Please insert your nickname to save your achievement`;
      }
    }, 10);
  });

  submitNameBtnEl.addEventListener("click", () => {
    const nickname = document.getElementById("name");
    let highscores = JSON.parse(localStorage.getItem("highscores"));
    if (!highscores) {
      highscores = [];
    }
    highscores.push({
      name: nickname.value,
      score: player.score,
    });

    highscores.sort((a, b) => {
      if (a.score > b.score) return -1;
      else if (a.score < b.score) return 1;
      else return 0;
    });

    if (highscores.length > 6) {
      highscores.pop();
    }
    let message = "Leaderboard:\n";
    for (let i = 0; i < highscores.length; i++) {
      message += `${i + 1}.${highscores[i].name}: ${highscores[i].score}\n`;
    }

    alert(message);
    localStorage.setItem("highscores", JSON.stringify(highscores));
    location.reload();
  });
});
