var palette = {
  background: 'Black',
  ball: 'White',
  brick: 'HotPink',
}

var maxWidth = 400;
var maxHeight = 600;
var brickWidth = maxWidth / 10;
var brickHeight = maxHeight / 30;

function brick(x, y, count) {
  return {
    x: x * brickWidth,
    y: y * brickHeight,
    width: brickWidth,
    height: brickHeight,
    count: count
  };
}

function init() {
  var canvas = document.createElement("canvas");

  var ui = new UI(canvas);
  var game = new Game(ui);

  document.body.appendChild(canvas);

  game.start();

  // for instrospection
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

class Game {
  constructor(ui) {
    this.ui = ui;
    this.model = {
      width: ui.width,
      height: ui.height,

      ball: {
        x: 300.0,
        y: 332.0,
        velocity: {
          x: 0.1,
          y: 0.3,
        },
        radius: 10.0,
      },

      bricks: [
        brick(3, 3, 10),
        brick(4, 3, 10),
        brick(3, 4, 10),
        brick(5, 2, 10),
        brick(5, 3, 10),
        brick(5, 4, 10),
        brick(9, 2, 10),
        brick(9, 3, 10),
        brick(9, 4, 10),

        brick(5, 10, 10),
        brick(5, 11, 7),
        brick(5, 12, 4),
      ]
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

    window.requestAnimationFrame(this.mainLoop);
  }

  brickCollision(x, y, radius, bx, by, bwidth, bheight, px, py) {
    var leftMiss = (x + radius) < bx;
    var rightMiss = (x - radius) > (bx + bwidth);
    var topMiss = (y + radius) < by;
    var bottomMiss = (y - radius) > (by + bheight);

    if (leftMiss || rightMiss || topMiss || bottomMiss) {
      return false;
    } else if (!leftMiss && (px + radius) < bx) {
      return 'horizontal'
    } else if (!rightMiss && (px - radius) > (bx + bwidth)) {
      return 'horizontal'
    } else {
      return 'vertical'
    }
  }

  updateModel(timestamp) {
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

    if ((y + ball.radius) > height) {
      y = height - ball.radius;
      vy = (-1 * ball.velocity.y);
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
        console.log('HIT', collision);

        if(b.count > 0) {
          b.count -= 1;
        }

        if (collision === 'vertical') {
          vy = (-1 * ball.velocity.y);
        } else {
          vx = (-1 * ball.velocity.x);
        }
      }
    });
    this.model.bricks = this.model.bricks.filter((b) => b.count > 0);

    ball.x = x;
    ball.y = y;
    ball.velocity.x = vx;
    ball.velocity.y = vy;
  }

  render() {
    this.renderBackground();
    this.renderBricks();
    this.renderBall();
  }

  renderBackground() {
    this.ui.fill(palette.brackground);
  }

  renderBall() {
    var ball = this.model.ball;

    this.ui.circle(
      ball.x,
      ball.y,
      ball.radius,
      palette.ball,
    );
  }

  renderBricks() {
    var bricks = this.model.bricks;

    bricks.forEach(this.renderBrick);
  }

  renderBrick(brick) {
    this.ui.rectangle(
      brick.x,
      brick.y,
      brick.width,
      brick.height,
      "white"
    );
    this.ui.rectangle(
      brick.x + 1,
      brick.y + 1,
      brick.width - 2,
      brick.height - 2,
      palette.brick
    );
    this.ui.text(
      brick.x + 12,
      brick.y + 13,
      brick.count.toString(),
      "black"
    );
  }
}

init();
