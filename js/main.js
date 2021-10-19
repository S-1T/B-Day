alert("WARNING: This game is a very scuffed amalgamated clone of multiple retro games.");

$("#container").css("display", "block");

var config = {
    type: Phaser.AUTO,
    parent: "game",
    width: 384,
    height: 512,
    backgroundColor: "#0000ff",
    input: {
        queue: true
    },
    physics: {
        default: "arcade",
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update,

        createBar: createBar
    },
    fps: 30
};

var game;
var scene;

var screen = 0;
$(document).keydown((e) => {
    if(e.keyCode == Phaser.Input.Keyboard.KeyCodes.ENTER)
        if(screen < 3)
        {
            if(screen == 0)
            {
                screen++;
                $("#titleScreen").css("display", "none");
                $("#plotScreen").css("display", "block");
            }
            else if(screen == 1)
            {
                screen++;
                $("#plotScreen").css("display", "none");
                $("#controlsScreen").css("display", "block");
            }
            else if(screen == 2)
            {
                screen++;
                $("#controlsScreen").css("display", "none");
                $("#game").css("display", "block");
                $("#foreground").css("display", "block");
                game = new Phaser.Game(config);
            }
        }
});

// Keys
var keyUp;
var keyDown;
var keyLeft;
var keyRight;
var keyV;
var keySpace;

// Sounds & Music
var shootSound;
var damageSound;
var powerSound;
var warningSound;
var explosionSound;

var beachMusic;
var jungleMusic;

var minibossMusic;
var bossMusic;

// Variables
var health = 100;
var special = 0;
var score = 0;
var time = 0;
var level = 0;
var levelTime = 0;
var bossInbound = false;
var bossTime = 160*30;
var minibossSection = false;
var bossSection = false;
var behavior;

// Bars & Text
var healthBar;
var specialBar;
var scoreText;

// Sprites

// I just wanted to say that I used this technique for the looping background im lesson 26. :)
var background1;
var background2;

var topBound;
var bottomBound;
var leftBound;
var rightBound;

var warning;

var player;

// Groups
var playerBullets;
var specialBullets;
var pingPongBullets;

var powers;

var enemyBasicPlanes;
var enemyBullets;

// Scene Functions

function preload()
{
    this.load.image("background", "assets/images/world/background.png");

    this.load.image("verticalBound", "assets/images/world/verticalBound.png");
    this.load.image("horizontalBound", "assets/images/world/horizontalBound.png");

    this.load.image("silverPlane", "assets/images/planes/silverPlane.png");
    this.load.image("greenPlane", "assets/images/planes/greenPlane.png");
    this.load.image("redPlane", "assets/images/planes/redPlane.png");
    this.load.image("yellowPlane", "assets/images/planes/yellowPlane.png");

    this.load.image("playerBullet", "assets/images/bullets/playerBullet.png");
    this.load.image("enemyBullet", "assets/images/bullets/enemyBullet.png");

    this.load.image("healthPackage", "assets/images/items/healthPackage.png");
    this.load.image("specialPower", "assets/images/items/specialPower.png");
    this.load.image("rapidPower", "assets/images/items/rapidPower.png");
    this.load.image("pingPongPower", "assets/images/items/pingPongPower.png");

    this.load.spritesheet("warning", "assets/images/world/warning.png", {
        frameWidth: 32,
        frameHeight: 32
    });
    this.load.spritesheet("explosion", "assets/images/world/explosion.png", {
        frameWidth: 32,
        frameHeight: 32
    });


    this.load.image("magnet", "assets/images/boss/magnet.png");
    this.load.image("beachBody", "assets/images/boss/beachBody.png");



    this.load.audio("shoot", "assets/audio/sounds/shoot.mp3");
    this.load.audio("damage", "assets/audio/sounds/damage.mp3");
    this.load.audio("power", "assets/audio/sounds/power.mp3");
    this.load.audio("warning", "assets/audio/sounds/warning.mp3");
    this.load.audio("explosion", "assets/audio/sounds/explosion.mp3");
    this.load.audio("end", "assets/audio/sounds/end.mp3"); // Gradius: Historic Soldier

    this.load.audio("beach", "assets/audio/themes/beach.mp3");
    this.load.audio("jungle", "assets/audio/themes/jungle.mp3");

    // I c
    this.load.audio("miniboss", "assets/audio/themes/miniboss.mp3"); // Operation C: Area 2
    this.load.audio("boss", "assets/audio/themes/boss.mp3"); // Gradius 2: Take Care
}

function create()
{
    scene = this;

    keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    keyDown = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    keyX = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    shootSound = this.sound.add("shoot", { volume: 0.1 });
    damageSound = this.sound.add("damage", { volume: 0.5 });
    powerSound = this.sound.add("power", { volume: 0.3 });
    warningSound = this.sound.add("warning", { volume: 0.1 });
    explosionSound = this.sound.add("explosion", { volume: 0.3 });
    endSound = this.sound.add("end", { volume: 0.3 });

    beachMusic = this.sound.add("beach", { loop: true });
    //jungleMusic = this.sound.add("jungle", { loop: true });

    minibossMusic = this.sound.add("miniboss", { loop: true });
    bossMusic = this.sound.add("boss", { loop: true });

    this.anims.create({
        key: "warning",
        frameRate: 1.3333,
        frames: "warning",
        repeat: 2
    });

    this.anims.create({
        key: "explosion",
        frameRate: 3,
        frames: "explosion",
        repeat: 3
    });

    healthBar = createBar(100, "#ff8080", "#402020");
    specialBar = createBar(100, "#8080ff", "#202040");
    scoreText = createText("white");

    background1 = this.physics.add.sprite(192, 256, "background");
    background1.scale = 4;
    background2 = this.physics.add.sprite(192, -256, "background");
    background2.scale = 4;
    
    topBound = this.physics.add.sprite(192, -112, "verticalBound");
    bottomBound = this.physics.add.sprite(192, 624, "verticalBound");
    leftBound = this.physics.add.sprite(-112, 256, "horizontalBound");
    rightBound = this.physics.add.sprite(496, 256, "horizontalBound");

    warning = this.physics.add.sprite(192, 128, "warning");
    warning.setVisible(false);

    player = this.physics.add.sprite(192, 448, "silverPlane");
    player.setCollideWorldBounds(true);
    player.shield = 1;
    player.power = 0;
    player.time = 0;
    player.uses = 0;

    playerBullets = this.physics.add.group();
    specialBullets = this.physics.add.group();
    destroyPastTop(specialBullets);
    pingPongBullets = this.physics.add.group();
    destroyPastTop(pingPongBullets);

    powers = this.physics.add.group();

    enemyBasicPlanes = this.physics.add.group();
    enemyBullets = this.physics.add.group();
    this.physics.add.collider(enemyBullets, player, bulletHurtPlayer, null, this);
}

function update()
{
    time++;
    player.time--;

    health = health < 100 ? health : 100;
    special = special < 100 ? special : 100;

    if(level == 0 && !beachMusic.isPlaying)
        beachMusic.play();

    controlPlayer();
    boundPlayer();
    playerDeath();

    advanceBackground();

    spawnPowerEveryWhile("health", 100*30, time);
    spawnPowerEveryWhile("special", 20*30, time);
    spawnPowerEveryWhile("rapid", 50*30, time);
    spawnPowerEveryWhile("pingpong", 70*30, time);

    makeBasicPlanesShootEveryWhile(5*30, time);

    healthBar.setValue(health);
    specialBar.setValue(special);
    scoreText.setValue("Score: " + score);



    if(!bossInbound){
        if(level == 0)
        {
            if(time%(30*30) ==  0*30)
                spawnPFormation();

            if(time%(30*30) == 10*30)
                spawnVFormation();

            if(time%(30*30) == 20*30)
                spawnXFormation();
            
            if(time == 150*30)
                spawnBoss(spawnBeachMiniboss);
        }
    }
    else
    {
        if(behavior && behavior.use)
            behavior.behave();
    }
}

// Player Relating Functions

function controlPlayer()
{
    if(!player.isDead)
    {
        player.setVelocity(
            160*(keyRight.isDown - keyLeft.isDown),
            160*(keyDown.isDown - keyUp.isDown)
        );

        if(keyX.isDown && special == 100)
            doSpecial();

        if(player.power == 0)
            doNormal();
        else if(player.power == 1)
            doRapid();
        else if(player.power == 2)
            doPingPong();
    }
}

function boundPlayer()
{
    if(player.x < 32)
        player.x = 32;

    if(player.x > 352)
        player.x = 352;
}

function bulletHurtPlayer(player, bullet)
{
    damageSound.play();
    health -= 5;
    bullet.destroy();
}

function playerDeath()
{
    if(health <= 0 && !player.isDead)
    {
        beachMusic.volume = 0;
        // jungleMusic.volume = 0;

        minibossMusic.stop();
        bossMusic.stop();

        player.isDead = true;
        player.setActive(false);
        player.setVisible(false);
        showExplosion(player.x, player.y);
        scene.time.addEvent({ delay: 3000, callback: () => {
            $("#gameOver").css("display", "block");
        }});
    }
}

// Advancing The Background

function advanceBackground()
{
    background1.y += 1;
    background2.y += 1;
    
    if(background1.y >= 768)
        background1.y = -256;
    
    if(background2.y >= 768)
        background2.y = -256;
}

// Power Functions

function spawnPowerEveryWhile(type, rate, time)
{
    if((time / rate)%1 == 0)
        spawnPower(type);
}

function spawnPower(type, x, y)
{
    var power;
    
    if(type == "health")
        spawnHealthPackage();
    else if(type == "special")
        spawnSpecialPower();
    else if(type == "rapid")
        spawnRapidPower();
    else if(type == "pingpong")
        spawnPingPongPower();
}

function spawnHealthPackage(x = 384*Math.random(), y = 1)
{
    power = powers.create(x, y, "healthPackage");
    power.setVelocityY(64);
    scene.physics.add.collider(power, player, function(power)
    {
        powerSound.play();
        health += 30;
        score += 100;
        power.destroy();
    }, null, scene);
}

function spawnSpecialPower(x = 384*Math.random(), y = 1)
{
    power = powers.create(x, y, "specialPower");
    power.setVelocityY(64);
    scene.physics.add.collider(power, player, function(power)
    {
        powerSound.play();
        special += 10;
        score += 100;
        power.destroy();
    }, null, scene);
}

function spawnRapidPower(x = 384*Math.random(), y = 1)
{
    power = powers.create(x, y, "rapidPower");
    power.setVelocityY(64);
    scene.physics.add.collider(power, player, function(power)
    {
        powerSound.play();
        player.power = 1;
        player.time = 10*30;
        score += 100;
        power.destroy();
    }, null, scene);
}

function spawnPingPongPower(x = 384*Math.random(), y = 1)
{
    power = powers.create(x, y, "pingPongPower");
    power.setVelocityY(64);
    scene.physics.add.collider(power, player, function(power)
    {
        powerSound.play();
        player.power = 2;
        player.uses = 10;
        score += 100;
        power.destroy();
    }, null, scene);
}

// Player Moves (Special, Normal, Rapid)

function doSpecial()
{
    special = 0;
    for(var i = 0; i < 12; i++)
        for(var j = 0; j < 16; j++)
        {
            var bullet = specialBullets.create(16 + 32*i, 512 + 16*j, "playerBullet");
            bullet.setVelocityY(-512);
        }
    for(var i = 0, l = 9; i < l; i++)
    {
        var bullet = playerBullets.create(player.x, player.y, "playerBullet");
        bullet.rotation = (45 - i * 90 / (l - 1)) * Math.PI/180
        bullet.setVelocity(256 * Math.sin(bullet.rotation), -256 * Math.cos(bullet.rotation),);
        destroyOutOfBounds(bullet);
    }
}

function doNormal()
{
    if(Phaser.Input.Keyboard.JustDown(keySpace))
    {
        shootSound.play();

        var bullet = playerBullets.create(player.x, player.y, "playerBullet");
        bullet.setVelocityY(-256);
        destroyOutOfBounds(bullet);
    }
}

function doRapid()
{
    if(player.time <= 0)
    {
        player.power = 0;
    }
    else if(keySpace.isDown)
    {
        shootSound.play();

        var bullet = playerBullets.create(player.x, player.y, "playerBullet");
        bullet.setVelocityY(-512);
        destroyOutOfBounds(bullet);
    }
}

function doPingPong()
{
    if(player.uses <= 0)
    {
        player.power = 0;
    }
    else if(Phaser.Input.Keyboard.JustDown(keySpace))
    {
        shootSound.play();

        player.uses--;

        var bullet1 = pingPongBullets.create(player.x, player.y, "playerBullet");
        bullet1.setVelocity(-512, -512);
        bullet1.setBounce(1);
        bullet1.setCollideWorldBounds(true);

        var bullet2 = pingPongBullets.create(player.x, player.y, "playerBullet");
        bullet2.setVelocity(512, -512);
        bullet2.setBounce(1);
        bullet2.setCollideWorldBounds(true);
    }
}

// Enemy Functions

function spawnVFormation()
{
    spawnGreenPlane( 48, -160);
    spawnGreenPlane( 96, -112);
    spawnGreenPlane(144,  -64);
    spawnGreenPlane(192,  -16);
    spawnGreenPlane(240,  -64);
    spawnGreenPlane(288, -112);
    spawnGreenPlane(336, -160);
}

function spawnXFormation()
{
    spawnRedPlane( 48,  -16);
    spawnRedPlane( 48, -304);
    spawnRedPlane( 96,  -64);
    spawnRedPlane( 96, -256);
    spawnRedPlane(144, -112);
    spawnRedPlane(144, -208);
    spawnRedPlane(192, -160);
    spawnRedPlane(240, -208);
    spawnRedPlane(240, -112);
    spawnRedPlane(288, -256);
    spawnRedPlane(288, -64);
    spawnRedPlane(336, -304);
    spawnRedPlane(336, -16);
}

function spawnPFormation()
{
    for(var i = 0; i < 10; i++)
    {
        spawnYellowPlane( 1*96, i*-48 - 16);
        spawnYellowPlane( 3*96, i*-48 - 16);
    }
}

function spawnGreenPlane(x, y)
{
    var plane = enemyBasicPlanes.create(x, y, "greenPlane");
    plane.rotation = 180 * (Math.PI / 180);
    plane.setVelocityY(128);
    destroyPastBottom(plane);
    destroyPlaneWhenHit(plane);
}

function spawnRedPlane(x, y)
{
    var plane = enemyBasicPlanes.create(x, y, "redPlane");
    plane.rotation = 180 * (Math.PI / 180);
    plane.setVelocityY(128);
    destroyPastBottom(plane);
    destroyPlaneWhenHit(plane);
}

function spawnYellowPlane(x, y)
{
    var plane = enemyBasicPlanes.create(x, y, "yellowPlane");
    plane.rotation = 180 * (Math.PI / 180);
    plane.setVelocityY(128);
    destroyPastBottom(plane);
    destroyPlaneWhenHit(plane);
}

function makeBasicPlanesShootEveryWhile(rate, time)
{
    if((time / rate)%1 == 0)
        makeBasicPlanesShoot();
}

function makeBasicPlanesShoot()
{
    Phaser.Actions.Call(enemyBasicPlanes.getChildren(), function(plane)
    {
        var bullet = enemyBullets.create(plane.x, plane.y, "enemyBullet");
        bullet.rotation = -Math.atan2(bullet.x - player.x, bullet.y - player.y);
        bullet.setVelocity(
            128*Math.sin(bullet.rotation),
            -128*Math.cos(bullet.rotation)
        );
        destroyOutOfBounds(bullet);
    });
}

// World Functions

function showWarning(x, y)
{
    warning.x = x;
    warning.y = y;
    warning.setVisible(true);
    warning.anims.play("warning");
    warningSound.play();
    scene.time.addEvent({ delay: 3000, callback: () => warning.setVisible(false) });
}

function showExplosion(x, y)
{
    var explosionSprite = scene.physics.add.sprite(x, y, "explosion");
    explosionSprite.anims.play("explosion");

    explosionSound.play();
}

function showBossExplosion(x, y)
{
    var explosionSprite1 = scene.physics.add.sprite(x, y - 32, "explosion");
    explosionSprite1.anims.play("explosion");

    var explosionSprite2 = scene.physics.add.sprite(x + 28, y + 16, "explosion");
    explosionSprite2.anims.play("explosion");

    var explosionSprite3 = scene.physics.add.sprite(x - 28, y + 16, "explosion");
    explosionSprite3.anims.play("explosion");
}

// Boss Functions

function spawnBoss(minibossF)
{
    if(!bossInbound)
    {
        bossInbound = true;
        beachMusic.volume = 0;
        beachMusic.stop();
        showWarning(192, 128);
        scene.time.addEvent({ delay: 6000, callback: () => {
            minibossMusic.volume = 1;
            minibossMusic.play();
            minibossSection = true;
            minibossF();
        }});
    }
}

function spawnBeachBoss()
{
    var boss = scene.physics.add.sprite(192, 16, "beachBody");
    boss.scale = 2;
    scene.physics.add.collider(player, boss, function(player)
    {
        health = 0;
    }, null, scene);
    scene.physics.add.collider(playerBullets, boss, function(boss, bullet)
    {
        behavior.health -= 1;
        bullet.destroy();
        damageSound.play();
    }, null, scene);
    scene.physics.add.collider(pingPongBullets, boss, function(boss, bullet)
    {
        behavior.health -= 1;
        bullet.destroy();
        damageSound.play();
    }, null, scene);
    behavior = {
        time: Number(time.toString()),
        duration: 50*30,
        phase: 0,
        health: 100,
        use: true,
        flag: 0,
        behave()
        {
            if(behavior.health > 0)
            {
                if(time - behavior.time < behavior.duration)
                {
                    if(behavior.phase == 0)
                    {
                        boss.x = 192;
                        boss.y = 16;
                        boss.rotation = -Math.atan2(boss.x - player.x, boss.y - player.y);
                        if(Math.floor((time - behavior.time)/(2*30))%2 == 0)
                        {
                            var bullet = enemyBullets.create(boss.x, boss.y, "enemyBullet");
                            bullet.setVelocity(
                                256*Math.sin(boss.rotation),
                                -256*Math.cos(boss.rotation)
                            );
                            destroyOutOfBounds(bullet);
                        }
                    }
                    else if(behavior.phase == 1)
                    {
                        if(behavior.flag == 0)
                        {
                            if(boss.y < 512)
                            {
                                boss.x = 96;
                                boss.setVelocity(0, 192);
                                boss.rotation = (Math.PI / 180) * 180;
                            }
                            else
                                behavior.flag = 1;
                        }
                        else if(behavior.flag == 1)
                        {
                            if(boss.y > 0)
                            {
                                boss.x = 288;
                                boss.setVelocity(0, -128);
                                boss.rotation = (Math.PI / 180) * 0;
                            }
                            else
                                behavior.flag = 0;
                        }
                    }
                    else if(behavior.phase == 2)
                    {
                        // TODO: Phase 3
                    }
                }
                else
                {
                    behavior.time = Number(time.toString());
                    behavior.phase++;
                    behavior.phase %= 2;
                }
            }
            else
            {
                behavior.use = false;
                showBossExplosion(boss.x, boss.y);
                boss.destroy();
                theEnding();
            }
        }
    };
}

function spawnBeachMiniboss()
{
    var boss = scene.physics.add.sprite(192, 0, "magnet");
    scene.physics.add.collider(player, boss, function(player)
    {
        health--;
    }, null, scene);
    behavior = {
        time: Number(time.toString()),
        duration: 65*30,
        use: true,
        behave()
        {
            if(time - behavior.time < behavior.duration)
            {
                boss.rotation = -Math.atan2(boss.x - player.x, boss.y - player.y);
                boss.setVelocity(
                    128*Math.sin(boss.rotation),
                    -128*Math.cos(boss.rotation)
                );
            }
            else if(time - behavior.time > behavior.duration + 8*30)
            {
                behavior.use = false;
                minibossMusic.stop();
                showWarning(192, 128);
                scene.time.addEvent({ delay: 6000, callback: () => {
                    if(!player.isDead)
                    {
                        bossMusic.volume = 1;
                        bossMusic.play();
                        bossSection = true;
                        spawnBeachBoss();
                    }
                }});
            }
        }
    };
}

// Bounce Functions

function bounceOffTop(obj)
{
    scene.physics.add.collider(obj, topBound, (obj) => obj.body.velocity.y *= -obj.bounce, null, scene);
}

function bounceOffBottom(obj)
{
    scene.physics.add.collider(obj, bottomBound, (obj) => obj.body.velocity.y *= -obj.bounce, null, scene);
}

function bounceOffLeft(obj)
{
    scene.physics.add.collider(obj, leftBound, (obj) => obj.body.velocity.x *= -obj.bounce, null, scene);
}

function bounceOffRight(obj)
{
    scene.physics.add.collider(obj, rightBound, (obj) => obj.body.velocity.x *= -obj.bounce, null, scene);
}

// Destroy Functions

function destroyOutOfBounds(obj)
{
    obj.setCollideWorldBounds(true);
    obj.body.onWorldBounds = true;
    obj.body.world.on("worldbounds", function(body)
    {
        if(body.gameObject == this)
        {
            this.destroy();
        }
    }, obj);
}

function destroyPastTop(obj)
{
    scene.physics.add.collider(obj, topBound, function(obj)
    {
        obj.destroy();
    }, null, scene);
}

function destroyPastBottom(obj)
{
    scene.physics.add.collider(obj, bottomBound, function(obj)
    {
        obj.destroy();
    }, null, scene);
}

function destroyPastLeft(obj)
{
    scene.physics.add.collider(obj, leftBound, function(obj)
    {
        obj.destroy();
    }, null, scene);
}

function destroyPastRight(obj)
{
    scene.physics.add.collider(obj, rightBound, function(obj)
    {
        obj.destroy();
    }, null, scene);
}

function destroyPlaneWhenHit(plane){
    scene.physics.add.collider(plane, playerBullets, function(plane, bullet)
    {
        score += 500;
        plane.destroy();
        bullet.destroy();
    }, null, scene);
    scene.physics.add.collider(plane, specialBullets, function(plane, bullet)
    {
        score += 500;
        plane.destroy();
        bullet.destroy();
    }, null, scene);
    scene.physics.add.collider(plane, pingPongBullets, function(plane, bullet)
    {
        score += 500;
        plane.destroy();
        bullet.destroy();
    }, null, scene);
    scene.physics.add.collider(plane, player, function(plane)
    {
        damageSound.play();
        health -= 10;
        plane.destroy();
    }, null, scene);
}

// Foreground Elements

function createBar(max, barColor, containerColor = "black")
{
    var bar = $("<div></div>");
    bar.addClass("bar");
    bar.css("background", containerColor);
    $("#foreground").append(bar);

    var value = $("<div></div>");
    value.addClass("value");
    value.css("background", barColor);
    bar.append(value);

    return {
        setValue(amt){
            if(amt <= max)
                value.css("width", 180 * (amt / max) + "px");
            else
                value.css("width", "180px");
        }
    }
}

function createText(color)
{
    var text = $("<div></div>");
    text.addClass("text");
    $("#foreground").append(text);

    var value = $("<div></div>");
    value.addClass("value");
    value.css("color", color);
    text.append(value);
    
    return {
        setValue(amt){
            value.html(amt);
        }
    }
}

// Ending
function theEnding()
{
    scene.time.addEvent({ delay: 3000, callback: () => {
        bossMusic.volume = 0;
        endSound.play();
        $("#game").css("display", "none");
        $("#foreground").css("display", "none");
        $("#creditsScreen").css("display", "block");
    }});
}