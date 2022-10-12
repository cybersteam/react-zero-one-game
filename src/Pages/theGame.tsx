import phaser from "phaser"
import "../Styles/game.css"

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
        //render: render
        }
};

//const Level1 = new Phaser.Game(config);
const Level1 = () => {
    new Phaser.Game(config);
};

let player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var played;
var collectsnd;
var dielaugh;
var bombsnd;
var startButt;



class Button {
    constructor(x, y, label, scene, callback) {
        const button = scene.add.text(x, y, label)
         // const button = document.querySelector('#myButton')
            .setOrigin(0.5)
            .setPadding(10)
            .setStyle({ backgroundColor: '#ff0000' })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => callback())
            .on('pointerover', () => button.setStyle({ backgroundColor: '#ff0000' }))
            .on('pointerout', () => button.setStyle({ fill: '#000'} && {backgroundColor: '#32a852'})); 
            //.on('pointerout', () => button.setStyle({ fill: '#000' })); 
        }
}


function preload ()
{
    this.load.image('sky', '../assets/gameassets/level2sky.png');
    this.load.image('ground', '../assets/gameassets/platform.png');
    this.load.image('star', '../assets/gameassets/star.png');
    this.load.image('bomb', 'assets/bomb.gif');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 }); 
    this.load.audio('audiodao', 'assets/audio/test.ogg');
    this.load.audio('collected', 'assets/audio/collect.ogg');
    this.load.audio('died', 'assets/audio/laugh.ogg');
    this.load.audio('bombsaway', 'assets/audio/bomb.ogg');
    //    this.load.image('stbutt', 'assets/butt.png', {frameWidth: 193, frameHeight: 73});    
    //this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
}

function create ()
{
    //  A simple background for our game
    this.add.image(400, 300, 'sky');
    //this.startButt = this.add.image('stbutt');
    

    

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.physics.add.staticGroup();
    
    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    //  Now let's create some ledges
    platforms.create(500, 400, 'ground');
    platforms.create(10, 300, 'ground');
    platforms.create(480, 180, 'ground');

    // The player and its settings
    player = this.physics.add.sprite(100, 450, 'dude');
    
    //  Player physics properties. Give the little guy a slight bounce.
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    

    

    key_A = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    key_S = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    key_D = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    key_SPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    //key_ENTER = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
       
//use this for a one press event - it doesn't need frame by frame updating like above 
    this.input.keyboard.on('keydown_ENTER', function(event){
    this.scene.restart();
        },this);
    

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 20,
        repeat: -1
    });
   
        ////
    //this.beamSound = this.sound.add("audio_var");

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 10
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 20,
        repeat: -1
    });
    
    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {

        //  Give each star a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    bombs = this.physics.add.group();

    //  The score
    scoreText = this.add.text(16, 16, 'No specimens collected.', { fontSize: '32px', fill: '#fff' });

    //  Collide the player and the stars with the platforms
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    this.physics.add.overlap(player, stars, collectStar, null, this);

    this.physics.add.collider(player, bombs, hitBomb, null, this);

    this.played = this.sound.add('audiodao');
    this.played.setLoop(true);
    this.played.play();
        


}






function update ()
{
    
    
        this.input.keyboard.on('keydown_P', function(event){
        this.scene.resume();
        console.log("im working!");
        },this);
    
        this.input.keyboard.on('keydown_P', function(event){
        this.scene.pause();
        },this);
    


    if (gameOver)
    {
     
    this.button.inputEnabled = false;
    }

    if (key_A.isDown || cursors.left.isDown)
    {
        player.setVelocityX(-500);
        player.anims.play('left', true);
    }

    else if (key_D.isDown || cursors.right.isDown)
    {
        player.setVelocityX(500);
        player.anims.play('right', true);
    }
    else if (key_S.isDown || cursors.down.isDown)
    {
        player.setVelocityY(200);
    }
    else
    {
        player.setVelocityX(0);

        player.anims.play('turn');
    }
    if (cursors.up.isDown || key_SPACE.isDown && player.body.touching.down)
    {
        player.setVelocityY(-530);
    }
}


function collectStar (player, star)
{
    star.disableBody(true, true);
    this.collectsnd = this.sound.add('collected');
    this.collectsnd.play();
    this.collectsnd.setLoop(false);

    //  Add and update the score
    score += 10;
    scoreText.setText(score + ' specimens collected.');

    if (stars.countActive(true) === 0)
    {
        //  A new batch of stars to collect
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        this.bombsnd = this.sound.add('bombsaway');    
        this.bombsnd.play();


        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;

    }
}
function hitBomb (player, bomb)
{
     
    this.played.stop();
    this.dielaugh = this.sound.add('died');
    this.dielaugh.play();
    this.dielaugh.setLoop(false);
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');
    
    gameOver = true;

    this.button = new Button(400, 270, "Play Again", this, () => this.scene.restart());

    score = 0;
}


const Game = () => {
    return (
        <div>
           <Level1 />
        </div>
    )
}
export default Game