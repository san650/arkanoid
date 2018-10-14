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
    this.width = 400;
    this.height = 600;

    canvas.setAttribute("width", this.width);
    canvas.setAttribute("height", this.height);
  }

  fill(color) {
    var context = this.context;

    context.save();
    context.fillStyle = color;
    context.fillRect(0, 0, this.width, this.height);
    context.fill();
    context.restore();
  }

  rectangle(x, y, width, height, color) {
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
          y: 0.2,
        },
        radius: 10.0,
      },

      bricks: {
      }
    };

    this.mainLoop = this.mainLoop.bind(this);
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

  updateModel(timestamp) {
    var ball = this.model.ball;
    var width = this.model.width;
    var height = this.model.height;

    var x = ball.x + (ball.velocity.x * timestamp);
    var y = ball.y + (ball.velocity.y * timestamp);

    if ((x + ball.radius) > width) {
      ball.x = width - ball.radius;
      ball.velocity.x = (-1 * ball.velocity.x);
    } else if ((x - ball.radius) < 0) {
      ball.x = ball.radius;
      ball.velocity.x = (-1 * ball.velocity.x);
    } else {
      ball.x = x;
    }

    if ((y + ball.radius) > height) {
      ball.y = height - ball.radius;
      ball.velocity.y = (-1 * ball.velocity.y);
    } else if ((y - ball.radius) < 0) {
      ball.y = ball.radius;
      ball.velocity.y = (-1 * ball.velocity.y);
    } else {
      ball.y = y;
    }
  }

  render() {
    this.renderBackground();
    this.renderBall();
  }

  renderBackground() {
    this.ui.fill('black');
  }

  renderBall() {
    var ball = this.model.ball;

    this.ui.circle(
      ball.x,
      ball.y,
      ball.radius,
      'white',
    );
  }
}

init();
