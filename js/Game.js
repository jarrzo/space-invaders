function Game() {

    this.canvas = null;
    this.parentDiv = null;
    this.timer = null;

    this.state = null;

    this.config = {
        width: 800,
        height: 600,
        fps: 60,
    }

    this.delta = 1 / this.config.fps;

    this.currentGame = {
        lives: CONFIG.ship.lives,
        score: 0,
        level: 1,
    }

    this.bounds = {left: null, right: null, top: null, bottom: null}

    this.pressedKeyCodes = [];

    this.init = function (div) {
        this.parentDiv = div;

        let canvas = document.createElement('canvas');
        this.parentDiv.appendChild(canvas);

        this.canvas = canvas;
        this.canvas.width = this.config.width;
        this.canvas.height = this.config.height;

        this.bounds = {
            left: canvas.width / 2 - this.config.width / 2,
            right: canvas.width / 2 + this.config.width / 2,
            top: canvas.height / 2 - this.config.height / 2,
            bottom: canvas.height / 2 + this.config.height / 2,
        }
    }

    this.begin = function () {
        this.setState(new WelcomeState({game: this}));

        let self = this;
        this.timer = setInterval(function () {
            self.loop();
        }, CONFIG.global.delta * 1000);
    }

    this.loop = function () {
        if (this.state) {
            let currentContext = this.canvas.getContext("2d");
            this.state.update(currentContext);
            this.state.render(currentContext);
        }
    }

    this.end = function () {
        clearInterval(this.timer);
    }

    this.keyDown = function (keyCode) {
        this.pressedKeyCodes[keyCode] = true;

        if (this.state) {
            this.state.keyDown(keyCode);
        }
    }

    this.keyUp = function (keyCode) {
        this.pressedKeyCodes[keyCode] = false;
    }

    this.setState = function (state) {
        this.state = state;

        if (state.init) {
            state.init();
        }
    }

    this.IDDQD = function () {
        CONFIG.ship.rocketFireRate = CONFIG.IDDQD.rocketFireRate;
        CONFIG.ship.invadersDropByLevels = CONFIG.IDDQD.invadersDropByLevels;
        CONFIG.ship.lives = CONFIG.IDDQD.lives;
    }
}

function State(params) {
    this.game = params.game;

    this.update = function () {
    }
    this.render = function (currentContext) {
    }
    this.keyDown = function (keyCode) {
    }

    this.clearBackground = function (currentContext) {
        currentContext.clearRect(0, 0, this.game.config.width, this.game.config.height);
    }

    this.restartGame = function () {
        this.game.currentGame.lives = CONFIG.ship.lives;
        this.game.currentGame.score = 0;
        this.game.currentGame.level = 1;

        this.game.setState(new LevelIntroState({game: this.game}));
    }
}

function WelcomeState(params) {
    State.call(this, params);

    this.render = function (currentContext) {
        this.clearBackground(currentContext);

        currentContext.font = "30px Arial";
        currentContext.fillStyle = CONFIG.global.textColor;
        currentContext.textBaseline = "middle";
        currentContext.textAlign = "center";
        currentContext.fillText("Space Invaders", this.game.config.width / 2, this.game.config.height / 2 - 40);

        currentContext.font = "16px Arial";
        currentContext.fillText("Press 'Space' to start.", this.game.config.width / 2, this.game.config.height / 2);
    }

    this.keyDown = function (keyCode) {
        if (keyCode === KEY_SPACE) {
            this.restartGame();
        }
    }
}

function LevelIntroState(params) {
    State.call(this, params);
    this.message = "3";

    this.update = function () {
        if (this.timePassed === undefined) {
            this.timePassed = 3;
        }
        this.timePassed -= this.game.delta;

        if (this.timePassed <= 2) {
            this.message = "2";
        }
        if (this.timePassed <= 1) {
            this.message = "1";
        }
        if (this.timePassed <= 0) {
            this.game.setState(new PlayState(params));
        }
    }

    this.render = function (currentContext) {
        this.clearBackground(currentContext);

        currentContext.font = "30px Arial";
        currentContext.fillStyle = CONFIG.global.textColor;
        currentContext.textBaseline = "middle";
        currentContext.textAlign = "center";
        currentContext.fillText("Level " + this.game.currentGame.level, this.game.config.width / 2, this.game.config.height / 2);

        currentContext.font = "24px Arial";
        currentContext.fillText("Ready in " + this.message, this.game.config.width / 2, this.game.config.height / 2 + 40);
    }
}

function GameOverState(params) {
    State.call(this, params);

    this.render = function (currentContext) {
        this.clearBackground(currentContext);

        currentContext.font = "30px Arial";
        currentContext.fillStyle = CONFIG.global.textColor;
        currentContext.textBaseline = "middle";
        currentContext.textAlign = "center";
        currentContext.fillText("Game over! ", this.game.config.width / 2, this.game.config.height / 2);

        currentContext.font = "16px Arial";
        currentContext.fillText("Your score: " + this.game.currentGame.score, this.game.config.width / 2, this.game.config.height / 2 + 40);
        currentContext.fillText("Your level: " + this.game.currentGame.level, this.game.config.width / 2, this.game.config.height / 2 + 80);
        currentContext.fillText("Press 'Space' to play again", this.game.config.width / 2, this.game.config.height / 2 + 160);
    }

    this.keyDown = function (keyCode) {
        if (keyCode === KEY_SPACE) {
            this.restartGame();
        }
    }
}

function PlayState(params) {
    State.call(this, params);

    this.invadersCount = CONFIG.invader.rows * CONFIG.invader.columns;
    this.invadersDropLevel = 0;
    this.invadersDirection = 'RIGHT';
    this.invadersSpeed = CONFIG.invader.defaultSpeed * this.game.currentGame.level;

    // Game entities
    this.ship = null;
    this.gameEntities = [];

    this.init = function () {
        this.createShip();
        this.createInvaders();
    }

    this.update = function () {
        this.ship.keysDown();

        if (this.checkForWin()) {
            this.win();
        }

        this.updateInvadersDirection();

        Object.values(this.gameEntities).forEach(value => {
            if (value.update) value.update();
        })
    }

    this.render = function (currentContext) {
        this.clearBackground(currentContext);

        Object.values(this.gameEntities).forEach(value => {
            value.render(currentContext);
        });

        currentContext.fillStyle = CONFIG.global.textColor;
        currentContext.font = "16px Arial";
        currentContext.textAlign = "left";
        currentContext.fillText("Score: " + this.game.currentGame.score, 20, 20);
        currentContext.fillText("Lives: " + this.game.currentGame.lives, 20, 40);
    }

    this.createShip = function () {
        this.ship = new Ship({
            x: this.game.config.width / 2 - CONFIG.ship.width / 2,
            y: this.game.bounds.bottom - CONFIG.ship.height,
            width: CONFIG.ship.width,
            height: CONFIG.ship.height,
            playState: this,
        });
        this.gameEntities.push(this.ship);
    }

    this.createInvaders = function () {
        for (let i = 0; i < CONFIG.invader.columns; i++) {
            for (let j = 0; j < CONFIG.invader.rows; j++) {
                this.gameEntities.push(new Invader({
                    x: i * (CONFIG.invader.width + CONFIG.invader.horizontalSpacing),
                    y: CONFIG.invader.topSpacing + j * (CONFIG.invader.height + CONFIG.invader.verticalSpacing),
                    width: CONFIG.invader.width,
                    height: CONFIG.invader.height,
                    playState: this,
                    canFireRockets: j === (CONFIG.invader.rows - 1),
                }));
            }
        }
    }

    this.updateInvadersDirection = function () {
        let rightSide = this.game.bounds.left;
        let leftSide = this.game.bounds.right;
        Object.values(this.gameEntities).forEach(value => {
            if (value.constructor.name === "Invader") {
                if (value.x + value.width > rightSide) rightSide = value.x + value.width;
                if (value.x < leftSide) leftSide = value.x;
            }
        });

        if (this.invadersDirection === "RIGHT" && rightSide >= this.game.bounds.right) {
            this.invadersDirection = "LEFT";
            this.updateInvadersLevel();
        }
        if (this.invadersDirection === "LEFT" && leftSide <= this.game.bounds.left) {
            this.invadersDirection = "RIGHT";
            this.updateInvadersLevel();
        }
    }

    this.updateInvadersLevel = function () {
        if (this.invadersDropLevel >= CONFIG.invader.invadersDropLevelLoose) {
            this.loose();
        }

        if (CONFIG.invader.invadersDropByLevels) {
            this.invadersDropLevel += CONFIG.invader.invadersDropByLevels;

            Object.values(this.gameEntities).forEach(value => {
                if (value.constructor.name === "Invader") {
                    value.y += value.height;
                }
            });
        }
    }

    this.checkForWin = function () {
        return !this.invadersCount;
    }

    this.win = function () {
        this.game.currentGame.level++;
        this.game.setState(new LevelIntroState({
            game: this.game,
        }));
    }

    this.loose = function () {
        this.game.setState(new GameOverState({
            game: this.game,
        }));
    }

    this.addScore = function () {
        this.game.currentGame.score += CONFIG.invader.pointsPerInvader;
    }

    this.removeObject = function (object) {
        if (this.gameEntities.indexOf(object) !== -1) {
            this.gameEntities.splice(this.gameEntities.indexOf(object), 1);
        }
    }
}

function GameEntity(params) {
    this.x = params.x;
    this.y = params.y;
    this.width = params.width;
    this.height = params.height;

    this.playState = params.playState;

    this.update = function () {
    }

    this.render = function (currentContext) {
    }
}

function Ship(params) {
    GameEntity.call(this, params);

    this.lastRocketTime = null;

    this.render = function (currentContext) {
        currentContext.fillStyle = '';
        let img = new Image();
        img.src = CONFIG.ship.imgSrc;
        currentContext.drawImage(img, this.x, this.y, this.width, this.height);
    }

    this.keysDown = function () {
        if (this.playState.game.pressedKeyCodes[KEY_LEFT] && this.canMoveLeft()) {
            this.x -= CONFIG.ship.defaultSpeed * this.playState.game.delta;
        }
        if (this.playState.game.pressedKeyCodes[KEY_RIGHT] && this.canMoveRight()) {
            this.x += CONFIG.ship.defaultSpeed * this.playState.game.delta;
        }
        if (this.playState.game.pressedKeyCodes[KEY_SPACE] && this.canFireRocket()) {
            this.lastRocketTime = (new Date()).valueOf();
            this.fireRocket();
        }
    }

    this.fireRocket = function () {
        this.playState.gameEntities.push(new Rocket({
            playState: this.playState,
            x: this.x + this.width / 2 - CONFIG.rocket.width / 2,
            y: this.y,
            width: CONFIG.rocket.width,
            height: CONFIG.rocket.height,
            direction: 'UP',
        }));
    }

    this.canFireRocket = function () {
        return this.lastRocketTime === null || (new Date()).valueOf() - this.lastRocketTime > (1000 / CONFIG.ship.rocketFireRate);
    }

    this.canMoveLeft = function () {
        return this.x > this.playState.game.bounds.left;
    }

    this.canMoveRight = function () {
        return this.x < this.playState.game.bounds.right - this.width;
    }
}

function Rocket(params) {
    GameEntity.call(this, params);

    this.direction = params.direction;

    this.update = function () {
        switch (this.direction) {
            case 'UP':
                this.y -= CONFIG.rocket.defaultSpeed * this.playState.game.delta;
                break;
            case 'DOWN':
                this.y += CONFIG.rocket.defaultSpeed * this.playState.game.delta;
                break;
        }

        this.checkForCollisions();

        if (this.y < this.playState.game.bounds.top || this.y > this.playState.game.bounds.bottom) {
            this.playState.removeObject(this);
        }
    }

    this.checkForCollisions = function () {
        let el = null;
        for (let i = 0; i < this.playState.gameEntities.length; i++) {
            el = this.playState.gameEntities[i];
            if (el.constructor.name === "Invader") {
                if (this.collidesWithObject(el)) {
                    this.playState.removeObject(el);
                    this.playState.removeObject(this);
                    this.playState.addScore();
                    this.playState.invadersCount--;
                    break;
                }
            }
            if (el.constructor.name === "Ship") {
                if (this.collidesWithObject(el)) {
                    this.playState.removeObject(this);
                    this.playState.game.currentGame.lives--;
                    if (this.playState.game.currentGame.lives === 0) this.playState.loose();
                    break;
                }
            }
        }
    }

    this.collidesWithObject = function (object) {
        return this.x >= object.x && this.x + this.width <= object.x + object.width && this.y >= object.y && this.y + this.height <= object.y + object.height
    }

    this.render = function (currentContext) {
        currentContext.fillStyle = CONFIG.rocket.color;
        currentContext.fillRect(this.x, this.y, this.width, this.height);
    }
}

function Invader(params) {
    GameEntity.call(this, params);

    this.canFireRockets = params.canFireRockets;
    this.secondsToRocket = Math.random() * CONFIG.invader.rocketMaxTime;

    this.update = function () {
        if (this.playState.invadersDirection === "RIGHT") {
            this.x += this.playState.invadersSpeed * this.playState.game.delta;
        }

        if (this.playState.invadersDirection === "LEFT") {
            this.x -= this.playState.invadersSpeed * this.playState.game.delta;
        }

        if (this.canFireRockets) {
            this.secondsToRocket -= this.playState.game.delta;
            if (this.secondsToRocket <= 0) this.fireRocket();
        }
    }

    this.fireRocket = function () {
        this.playState.gameEntities.push(new Rocket({
            playState: this.playState,
            x: this.x + this.width / 2 - CONFIG.rocket.width / 2,
            y: this.y + this.height + CONFIG.rocket.height,
            width: CONFIG.rocket.width,
            height: CONFIG.rocket.height,
            direction: 'DOWN',
        }));
        this.secondsToRocket = Math.random() * CONFIG.invader.rocketMaxTime;
    }

    this.render = function (currentContext) {
        currentContext.fillStyle = '';
        let img = new Image();
        img.src = CONFIG.invader.imgSrc;
        currentContext.drawImage(img, this.x, this.y, this.width, this.height);
    }
}