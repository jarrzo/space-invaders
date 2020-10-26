const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_SPACE = 32;

const CONFIG = {
    background: {
        minSpeed: 10,
        maxSpeed: 50,
        elementsCount: 100,

        star: {
            color: '#ffffff',
            maxSize: 3,
        },
    },
    ship: {
        width: 30,
        height: 15,
        imgSrc: "images/spaceship.png",
        rocketFireRate: 2,

        defaultSpeed: 200,

        lives: 3,
    },
    invader: {
        width: 30,
        height: 15,
        imgSrc: "images/invader.png",
        horizontalSpacing: 10,
        verticalSpacing: 15,
        topSpacing: 70,
        rows: 6,
        columns: 11,
        rocketMaxTime: 12,

        invadersDropByLevels: 1,
        invadersDropLevelLoose: 20,

        defaultSpeed: 50,

        pointsPerInvader: 10,
    },
    rocket: {
        width: 3,
        height: 5,
        color: "#ff0000",
        defaultSpeed: 300,
    },
    global: {
        textColor: "#ffffff",
        fps: 60,
        delta: 1/60,
    },
    IDDQD: {
        rocketFireRate: 50,
        invadersDropByLevels: 0,
        lives: 9000,
    }
};