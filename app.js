import { colors } from "./lib/palette.js";

var maxWidth = 400;
var maxHeight = 600;
var brickWidth = maxWidth / 10;
var brickHeight = maxHeight / 20;
var fontHeight = 10;

function makeBrick(x, y, count) {
  return {
    x: x * brickWidth,
    y: y * brickHeight,
    width: brickWidth,
    height: brickHeight,
    count: count
  };
}

function levelGenerator(bricksCount) {
  var draw = [];
  var bricks = [];

  for (var i = 0; i < bricksCount; i++) {
    var pos;

    do {
      pos = Math.round(Math.random() * 100); // 10x10 matrix
    } while(draw.indexOf(pos) !== -1);

    draw.push(pos);

    var x = pos % 10;
    var y = Math.floor(pos / 10);
    var count = Math.round(Math.random(7) * 7) + 1;

    bricks.push(makeBrick(x, y, count));
  }

  return bricks;
}

function init() {
  var canvas = document.createElement("canvas");

  var ui = new UI(canvas);
  var game = new Game(ui);

  var help = document.createElement("p");
  help.innerHTML = "Move the bar using <code>h</code> and <code>l</code> keys.<br><strong>Press any key to start the game.</strong>";

  var container = document.createElement("div");
  container.classList.add("container");

  container.appendChild(help);
  container.appendChild(canvas);

  document.body.appendChild(container);

  game.render();

  var started = false;

  document.body.onkeydown = (event) => {
    if (!started) {
      started = true;
      game.start();
      return;
    }

    if (event.code === "KeyH") {
      game.model.move = 'left';
    } else if (event.code === "KeyL") {
      game.model.move = 'right';
    }
  };

  document.body.onkeyup = () => {
    game.model.move = null;
  };

  window.game = game;
}

class UI {
  constructor(canvas) {
    this.context = canvas.getContext("2d");
    this.width = maxWidth;
    this.height = maxHeight;

    canvas.setAttribute("width", this.width);
    canvas.setAttribute("height", this.height);
  }

  fill(color) {
    this.rectangle(
      0,
      0,
      this.width,
      this.height,
      color
    );
  }

  rectangle(x, y, width, height, color) {
    var context = this.context;

    context.save();
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
    context.restore();
  }

  circle(x, y, radius, color) {
    var context = this.context;

    context.save();
    context.fillStyle = color;
    context.beginPath();
    context.arc(
      x,
      y,
      radius,
      this.relativeToRadians(0.0),
      this.relativeToRadians(1.0)
    );
    context.fill();
    context.restore();
  }

  text(x, y, text, color) {
    var context = this.context;

    context.save();
    context.fillStyle = color;
    context.fillText(
      text,
      x,
      y
    );
    context.restore();
  }

  relativeToRadians(value) {
    return value * 2 * Math.PI;
  }
}

var FORCE = 0.4;

class Game {
  constructor(ui) {
    this.ui = ui;
    this.model = {
      isActive: true,
      width: ui.width,
      height: ui.height,

      ball: {
        x: 300.0,
        y: 332.0,
        velocity: {
          x: Math.cos(45) * FORCE,
          y: -Math.sin(45) * FORCE,
        },
        radius: 10.0,
      },

      bricks: levelGenerator(30),

      player: {
        x: 4 * brickWidth,
        y: 19 * brickHeight,
        width: brickWidth * 2,
        height: brickHeight,
      }
    };

    this.mainLoop = this.mainLoop.bind(this);
    this.renderBrick = this.renderBrick.bind(this);
  }

  start() {
    window.requestAnimationFrame(this.mainLoop);
  }

  stop() {
    window.clearRequestAnimationFrame(this.mainLoop);
  }

  mainLoop(timestamp) {
    var elapsedTime = 0;

    if (!this.last) {
      this.last = timestamp;
    } else {
      elapsedTime = timestamp - this.last;
      this.last = timestamp;
    }

    this.updateModel(elapsedTime);
    this.render();

    if (this.model.isActive) {
      window.requestAnimationFrame(this.mainLoop);
    } else {
      console.log('The End');
    }
  }

  brickCollision(x, y, radius, bx, by, bwidth, bheight, px, py) {
    var leftMiss = (x + radius) < bx;
    var rightMiss = (x - radius) > (bx + bwidth);
    var topMiss = (y + radius) < by;
    var bottomMiss = (y - radius) > (by + bheight);

    if (leftMiss || rightMiss || topMiss || bottomMiss) {
      return false;
    } else if (!leftMiss && (px + radius) < bx) {
      return 'left';
    } else if (!rightMiss && (px - radius) > (bx + bwidth)) {
      return 'right';
    } else if (!topMiss && (py + radius) < by){
      return 'top';
    } else {
      return 'bottom';
    }
  }

  updateModel(timestamp) {
    // player
    if (this.model.move) {
      var howmuch = (timestamp / 1000) * 400;

      if (this.model.move === 'left') {
        if (this.model.player.x > howmuch) {
          this.model.player.x -= howmuch;
        } else {
          this.model.player.x = 0;
        }
      }

      if (this.model.move === 'right') {
        if (this.model.player.x + this.model.player.width < maxWidth - howmuch) {
          this.model.player.x += howmuch;
        } else {
          this.model.player.x = maxWidth - this.model.player.width;
        }
      }
    }

    // ball
    var ball = this.model.ball;
    var width = this.model.width;
    var height = this.model.height;

    var x = ball.x + (ball.velocity.x * timestamp);
    var y = ball.y + (ball.velocity.y * timestamp);
    var vx = ball.velocity.x;
    var vy = ball.velocity.y;

    if ((x + ball.radius) > width) {
      x = width - ball.radius;
      vx = (-1 * ball.velocity.x);
    } else if ((x - ball.radius) < 0) {
      x = ball.radius;
      vx = (-1 * ball.velocity.x);
    } else {
      x = x;
      vx = ball.velocity.x;
    }

    if ((y + ball.radius) >= height) {
      y = height - ball.radius;
      vy = (-1 * ball.velocity.y);
      this.model.isActive = false;
    } else if ((y - ball.radius) < 0) {
      y = ball.radius;
      vy = (-1 * ball.velocity.y);
    } else {
      y = y;
      vy = ball.velocity.y;
    }

    this.model.bricks.forEach((b) => {
      var collision;

      if (collision = this.brickCollision(x, y, ball.radius, b.x, b.y, b.width, b.height, ball.x, ball.y)) {
        if(b.count > 0) {
          b.count -= 1;
        }

        if (collision === "top") {
          y = b.y - ball.radius;
          vy = (-1 * ball.velocity.y);
        } else if (collision === "bottom") {
          y = b.y + b.height + ball.radius;
          vy = (-1 * ball.velocity.y);
        } else if( collision === "left") {
          x = b.x - ball.radius;
          vx = (-1 * ball.velocity.x);
        } else {
          x = b.x + b.width + ball.radius;
          vx = (-1 * ball.velocity.x);
        }
      }
    });

    this.model.bricks = this.model.bricks.filter((b) => b.count > 0);
    this.model.isActive = this.model.isActive && this.model.bricks.length;

    var collision;
    var player = this.model.player;

    if (collision = this.brickCollision(x, y, ball.radius, player.x, player.y, player.width, player.height, ball.x, ball.y)) {
      if (collision === "top") {
        y = player.y - ball.radius;
        // Me tengo que cubrir con el radius de la bola porque el centro de la
        // bola puede quedar por fuera del player al momento del choque
        //
        // Centro es 0
        // Izquierda [-1.0,0)
        // Derecha (0,1.0]
        var adyasente = ((x - player.x) - (player.width / 2)) / ((player.width + ball.radius) / 2);
        var opuesto = Math.sqrt(1 - Math.pow(adyasente, 2));
        vx = (adyasente) * FORCE;
        vy = (-1.0 * opuesto) * FORCE;
      } else if (collision === "bottom") {
        y = player.y + player.height + ball.radius;
        vy = (-1 * ball.velocity.y);
      } else if( collision === "left") {
        x = player.x - ball.radius;
        vx = (-1 * ball.velocity.x);
      } else {
        x = player.x + player.width + ball.radius;
        vx = (-1 * ball.velocity.x);
      }
    }

    ball.x = x;
    ball.y = y;
    ball.velocity.x = vx;
    ball.velocity.y = vy;
  }

  render() {
    this.renderBackground();
    this.renderBricks();
    this.renderBall();
    this.renderPlayer();
    this.renderOSD();
  }

  renderBackground() {
    this.ui.fill(colors.brackground);
  }

  renderBall() {
    var ball = this.model.ball;

    if (this.previousBalls) {
      this.previousBalls.forEach((old, i) => {
        this.ui.circle(
          old.x,
          old.y,
          old.radius,
          colors.previousBalls[i],
        );
      });
    }

    this.ui.circle(
      ball.x,
      ball.y,
      ball.radius,
      colors.ball,
    );

    if (!this.previousBalls) {
      this.previousBalls = [];
    }

    this.previousBalls.push({
      x: ball.x,
      y: ball.y,
      radius: ball.radius,
    });

    if (this.previousBalls.length > 5) {
      this.previousBalls.shift();
    }
  }

  renderBricks() {
    var bricks = this.model.bricks;

    bricks.forEach(this.renderBrick);
  }

  renderBrick(brick) {
    this.ui.rectangle(
      brick.x + 1,
      brick.y + 1,
      brick.width - 2,
      brick.height - 2,
      colors.brick[brick.count % colors.brick.length]
    );
    this.ui.text(
      brick.x + 16,
      brick.y + (brick.height / 2) + (fontHeight / 2),
      brick.count.toString(),
      colors.brickText
    );
  }

  renderPlayer() {
    var player = this.model.player;

    this.ui.rectangle(
      player.x,
      player.y,
      player.width,
      player.height,
      colors.player
    );
  }

  renderOSD() {
    if (!this.model.isActive) {
      this.ui.text(
        (this.model.width / 2) - 20,
        (this.model.height / 2) + 50,
        "THE END",
        colors.osd
      );
    }
  }
}

init();
