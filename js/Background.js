function Background() {
    this.width = 0;
    this.height = 0;

    this.elements = [];

    this.canvas = null;
    this.parentDiv = null;
    this.timer = null;

    this.init = function (div) {
        this.parentDiv = div;

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        let canvas = document.createElement('canvas');
        this.parentDiv.appendChild(canvas);

        this.canvas = canvas;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    this.begin = function () {
        this.createStars();

        let self = this;
        this.timer = setInterval(() => {
            self.update();
            self.render();
        }, CONFIG.global.delta * 1000);
    }

    this.createStars = function () {
        for (let i = 0; i < CONFIG.background.elementsCount; i++) {
            this.elements.push(new Star({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * CONFIG.background.star.maxSize + 1,
                speed: Math.random() * (CONFIG.background.maxSpeed - CONFIG.background.minSpeed) + CONFIG.background.minSpeed,
            }));
        }
    }

    this.end = function () {
        clearInterval(this.timer);
    }

    this.render = function () {
        let canvasContext = this.canvas.getContext("2d");
        this.clearBackground(canvasContext);
        this.drawElements(canvasContext);
    }

    this.clearBackground = function (canvasContext) {
        canvasContext.fillStyle = '#000000';
        canvasContext.fillRect(0, 0, this.width, this.height);
    }

    this.drawElements = function (canvasContext) {
        Object.values(this.elements).forEach(value => {
            value.render(canvasContext);
        });
    }

    this.update = function () {
        Object.values(this.elements).forEach(value => {
            value.update(this);
        });
    }
}

function BackgroundObject(params) {
    this.x = params.x;
    this.y = params.y;
    this.size = params.size;
    this.speed = params.speed;

    this.update = function (background) {
    }
    this.render = function (canvasContext) {
    }
}

function Star(params) {
    BackgroundObject.call(this, params);

    this.render = function (canvasContext) {
        canvasContext.fillStyle = CONFIG.background.star.color;
        canvasContext.fillRect(this.x, this.y, this.size, this.size);
    }

    this.update = function (background) {
        this.y += CONFIG.global.delta * this.speed;

        if (this.y > background.height) {
            this.x = Math.random() * background.width;
            this.y = 0;
            this.size = Math.random() * 3 + 1;
            this.speed = Math.random() * (CONFIG.background.maxSpeed - CONFIG.background.minSpeed) + CONFIG.background.minSpeed;
        }
    }
}