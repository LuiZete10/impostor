/**
 * Author: Michael Hadley, mikewesthad.com
 * Asset Credits:
 *  - Tuxemon, https://github.com/Tuxemon/Tuxemon
 */

function lanzarJuego(){
  game = new Phaser.Game(config);
}

  const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 450,
    //parent: "game-container",
    parent:"pantallaJuego",
    pixelArt: true,
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 }
      }
    },
    scene: {
      preload: preload,
      create: create,
      update: update
    }
  };

  let game;// = new Phaser.Game(config);
  let cursors;
  var player;
  //let player2;
  var jugadores={}; //la colección de jugadores remotos
  let showDebug = false;
  let camera;
  var worldLayer;
  var capaColisiones;
  let map;
  var crear;
  var spawnPoint;
  var recursos=[{frame:0,sprite:"gold"},{frame:3,sprite:"misty"},{frame:6,sprite:"rojo"},{frame:9,sprite:"blanca"},{frame:12,sprite:"azul"},
                {frame:60,sprite:"debora"},{frame:63,sprite:"maximo"},{frame:66,sprite:"sachiko"},{frame:69,sprite:"brock"},{frame:72,sprite:"kimono"}];
  var remotos;
  var muertos;
  var capaTareas;
  var tareasOn=true;
  var ataquesOn=true;
  var final=false;


  function preload() {
    
    //this.load.image("tiles", "cliente/assets/tilesets/tuxmon-sample-32px-extruded.png");
    this.load.image("tiles", "cliente/assets/tilesets/Serene_Village_32x32.png");
    //this.load.tilemapTiledJSON("map", "cliente/assets/tilemaps/tuxemon-town.json");
    this.load.tilemapTiledJSON("map", "cliente/assets/tilemaps/mapa"+ws.numeroMapa+"retro.json");

    // An atlas is a way to pack multiple images together into one texture. I'm using it to load all
    // the player animations (walking left, walking right, etc.) in one image. For more info see:
    //  https://labs.phaser.io/view.html?src=src/animation/texture%20atlas%20animation.js
    // If you don't use an atlas, you can do the same thing with a spritesheet, see:
    //  https://labs.phaser.io/view.html?src=src/animation/single%20sprite%20sheet.js
    //this.load.atlas("atlas", "cliente/assets/atlas/atlas.png", "cliente/assets/atlas/atlas.json");
    //this.load.spritesheet("gabe","cliente/assets/images/gabe.png",{frameWidth:24,frameHeight:24});
    //this.load.spritesheet("gabe","cliente/assets/images/male01-2.png",{frameWidth:32,frameHeight:32});
    //this.load.spritesheet("varios","cliente/assets/atlas/personajes.png",{frameWidth:32,frameHeight:32});
    this.load.spritesheet("varios","cliente/assets/atlas/personajes.png",{frameWidth:26,frameHeight:28});
    this.load.spritesheet("fantasmas","cliente/assets/atlas/fantasmas.png",{frameWidth:26,frameHeight:28});
    this.load.spritesheet("tumba","cliente/assets/atlas/tumba.png",{frameWidth:32,frameHeight:32});
  }

  function create() {

    crear=this;

    map = crear.make.tilemap({ key: "map" });

    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    //const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");
    const tileset = map.addTilesetImage("Serene_Village_32x32", "tiles");

    
    
    // Parameters: layer name (or index) from Tiled, tileset, x, y
    const belowLayer = map.createStaticLayer("Below Player", tileset, 0, 0);
    worldLayer = map.createStaticLayer("World", tileset, 0, 0);
    const aboveLayer = map.createStaticLayer("Above Player", tileset, 0, 0);

    capaColisiones = map.createStaticLayer("CapaColisiones", tileset, 0, 0);
    capaColisiones.setCollisionByProperty({ collides: true });
    capaColisiones.visible = false;

    // capaTareas = map.createStaticLayer("capaTareas", tileset, 0, 0);
    if(ws.encargo=="Jardinero"){
      //capaTareas = map.createStaticLayer("CapaTareasJardinero", tileset, 0, 0);
      capaTareas = map.createDynamicLayer("CapaTareasJardinero", tileset, 0, 0);
      capaTareas.setCollisionByProperty({ collides: true });
    }else if(ws.encargo=="Barrendero"){
      //capaTareas = map.createStaticLayer("CapaTareasBarrendero", tileset, 0, 0);
      capaTareas = map.createDynamicLayer("CapaTareasBarrendero", tileset, 0, 0);
      capaTareas.setCollisionByProperty({ collides: true });
    }else if(ws.encargo=="Cartero"){
      //capaTareas = map.createStaticLayer("CapaTareasCartero", tileset, 0, 0);
      capaTareas = map.createDynamicLayer("CapaTareasCartero", tileset, 0, 0);
      capaTareas.setCollisionByProperty({ collides: true });
    }else if(ws.encargo=="Vidente"){
      //capaTareas = map.createStaticLayer("CapaTareasVidente", tileset, 0, 0);
      capaTareas = map.createDynamicLayer("CapaTareasVidente", tileset, 0, 0);
      capaTareas.setCollisionByProperty({ collides: true });
    }
    worldLayer.setCollisionByProperty({ collides: true });

    // By default, everything gets depth sorted on the screen in the order we created things. Here, we
    // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
    // Higher depths will sit on top of lower depth objects.
    aboveLayer.setDepth(10);

    // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
    // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
    spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");

    // Create a sprite with physics enabled via the physics system. The image used for the sprite has
    // a bit of whitespace, so I'm using setSize & setOffset to control the size of the player's body.
    // player = this.physics.add
    //   .sprite(spawnPoint.x, spawnPoint.y, "atlas", "misa-front")
    //   .setSize(30, 40)
    //   .setOffset(0, 24);

    // // Watch the player and worldLayer for collisions, for the duration of the scene:
    //this.physics.add.collider(player, worldLayer);

     const anims = crear.anims;
      anims.create({
        key: "gold-left-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 15,
          end: 17,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims.create({
        key: "gold-right-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 30,
          end: 32,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims.create({
        key: "gold-back-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 0,
          end: 2,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims.create({
        key: "gold-front-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 45,
          end: 47,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

      const anims2 = crear.anims;
      anims2.create({
        key: "misty-left-walk",
        frames: anims.generateFrameNames("varios", {
          start: 18,
          end: 20,
        }),
        repeat: -1
      });
      anims2.create({
        key: "misty-right-walk",
        frames: anims.generateFrameNames("varios", {
          start: 33,
          end: 35,
        }),
        repeat: -1
      });
      anims2.create({
        key: "misty-back-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 3,
          end: 5,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims2.create({
        key: "misty-front-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 48,
          end: 50,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

      const anims3 = crear.anims;
      anims3.create({
        key: "rojo-left-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 21,
          end: 23,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims3.create({
        key: "rojo-right-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 36,
          end: 38,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims3.create({
        key: "rojo-back-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 6,
          end: 8,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims3.create({
        key: "rojo-front-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 51,
          end: 53,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

    const anims4 = crear.anims;
      anims4.create({
        key: "blanca-left-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 24,
          end: 26,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims4.create({
        key: "blanca-right-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 39,
          end: 41,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims4.create({
        key: "blanca-back-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 9,
          end: 11,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims4.create({
        key: "blanca-front-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 54,
          end: 56,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

      const anims5 = crear.anims;
      anims5.create({
        key: "azul-left-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 27,
          end: 29,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims5.create({
        key: "azul-right-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 42,
          end: 44,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims5.create({
        key: "azul-back-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 12,
          end: 14,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims5.create({
        key: "azul-front-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 57,
          end: 59,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

      const anims6 = crear.anims;
      anims6.create({
        key: "debora-left-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 60+15,
          end: 60+17,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims6.create({
        key: "debora-right-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 60+30,
          end: 60+32,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims6.create({
        key: "debora-back-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 60+0,
          end: 60+2,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims6.create({
        key: "debora-front-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 60+45,
          end: 60+47,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

      const anims7 = crear.anims;
      anims7.create({
        key: "maximo-left-walk",
        frames: anims.generateFrameNames("varios", {
          start: 60+18,
          end: 60+20,
        }),
        repeat: -1
      });
      anims7.create({
        key: "maximo-right-walk",
        frames: anims.generateFrameNames("varios", {
          start: 60+33,
          end: 60+35,
        }),
        repeat: -1
      });
      anims7.create({
        key: "maximo-back-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 60+3,
          end: 60+5,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims7.create({
        key: "maximo-front-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 60+48,
          end: 60+50,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

      const anims8 = crear.anims;
      anims8.create({
        key: "sachiko-left-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 60+21,
          end: 60+23,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims8.create({
        key: "sachiko-right-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 60+36,
          end: 60+38,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims8.create({
        key: "sachiko-back-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 60+6,
          end: 60+8,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims8.create({
        key: "sachiko-front-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 60+51,
          end: 60+53,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

    const anims9 = crear.anims;
      anims9.create({
        key: "brock-left-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 60+24,
          end: 60+26,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims9.create({
        key: "brock-right-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 60+39,
          end: 60+41,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims9.create({
        key: "brock-back-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 60+9,
          end: 60+11,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims9.create({
        key: "brock-front-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 60+54,
          end: 60+56,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

      const anims10 = crear.anims;
      anims10.create({
        key: "kimono-left-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 60+27,
          end: 60+29,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims10.create({
        key: "kimono-right-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 60+42,
          end: 60+44,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims10.create({
        key: "kimono-back-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 60+12,
          end: 60+14,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      anims10.create({
        key: "kimono-front-walk",
        frames: anims.generateFrameNames("varios", {
          //prefix: "misa-left-walk.",
          start: 60+57,
          end: 60+59,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
      const animsfan = crear.anims;
      animsfan.create({
        key: "gold-left-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 15,
          end: 17,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      animsfan.create({
        key: "gold-right-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 30,
          end: 32,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      animsfan.create({
        key: "gold-back-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 0,
          end: 2,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      animsfan.create({
        key: "gold-front-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 45,
          end: 47,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

      const animsfan2 = crear.anims;
      animsfan2.create({
        key: "misty-left-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          start: 18,
          end: 20,
        }),
        repeat: -1
      });
      animsfan2.create({
        key: "misty-right-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          start: 33,
          end: 35,
        }),
        repeat: -1
      });
      animsfan2.create({
        key: "misty-back-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 3,
          end: 5,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      animsfan2.create({
        key: "misty-front-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 48,
          end: 50,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

      const animsfan3 = crear.anims;
      animsfan3.create({
        key: "rojo-left-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 21,
          end: 23,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      animsfan3.create({
        key: "rojo-right-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 36,
          end: 38,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      animsfan3.create({
        key: "rojo-back-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 6,
          end: 8,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      animsfan3.create({
        key: "rojo-front-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 51,
          end: 53,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

    const animsfan4 = crear.anims;
      animsfan4.create({
        key: "blanca-left-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 24,
          end: 26,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      animsfan4.create({
        key: "blanca-right-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 39,
          end: 41,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      animsfan4.create({
        key: "blanca-back-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 9,
          end: 11,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      animsfan4.create({
        key: "blanca-front-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 54,
          end: 56,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

      const animsfan5 = crear.anims;
      animsfan5.create({
        key: "azul-left-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 27,
          end: 29,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      animsfan5.create({
        key: "azul-right-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 42,
          end: 44,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      animsfan5.create({
        key: "azul-back-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 12,
          end: 14,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      animsfan5.create({
        key: "azul-front-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 57,
          end: 59,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

      const animsfan6 = crear.anims;
      animsfan6.create({
        key: "debora-left-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 60+15,
          end: 60+17,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      animsfan6.create({
        key: "debora-right-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 60+30,
          end: 60+32,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      animsfan6.create({
        key: "debora-back-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 60+0,
          end: 60+2,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      animsfan6.create({
        key: "debora-front-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 60+45,
          end: 60+47,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

      const animsfan7 = crear.anims;
      animsfan7.create({
        key: "maximo-left-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          start: 60+18,
          end: 60+20,
        }),
        repeat: -1
      });
      animsfan7.create({
        key: "maximo-right-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          start: 60+33,
          end: 60+35,
        }),
        repeat: -1
      });
      animsfan7.create({
        key: "maximo-back-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 60+3,
          end: 60+5,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      animsfan7.create({
        key: "maximo-front-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 60+48,
          end: 60+50,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

      const animsfan8 = crear.anims;
      animsfan8.create({
        key: "sachiko-left-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 60+21,
          end: 60+23,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      animsfan8.create({
        key: "sachiko-right-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 60+36,
          end: 60+38,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      animsfan8.create({
        key: "sachiko-back-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 60+6,
          end: 60+8,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      animsfan8.create({
        key: "sachiko-front-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 60+51,
          end: 60+53,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

    const animsfan9 = crear.anims;
      animsfan9.create({
        key: "brock-left-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 60+24,
          end: 60+26,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      animsfan9.create({
        key: "brock-right-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 60+39,
          end: 60+41,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      animsfan9.create({
        key: "brock-back-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 60+9,
          end: 60+11,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      animsfan9.create({
        key: "brock-front-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 60+54,
          end: 60+56,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

      const animsfan10 = crear.anims;
      animsfan10.create({
        key: "kimono-left-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 60+27,
          end: 60+29,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      animsfan10.create({
        key: "kimono-right-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 60+42,
          end: 60+44,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      animsfan10.create({
        key: "kimono-back-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 60+12,
          end: 60+14,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });
      animsfan10.create({
        key: "kimono-front-walk-fan",
        frames: anims.generateFrameNames("fantasmas", {
          //prefix: "misa-left-walk.",
          start: 60+57,
          end: 60+59,
          //zeroPad: 3
        }),
        //frameRate: 10,
        repeat: -1
      });

    // const camera = this.cameras.main;
    // camera.startFollow(player);
    // camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    cursors = crear.input.keyboard.createCursorKeys();
    remotos = crear.add.group();
    muertos = crear.add.group();
    teclaA=crear.input.keyboard.addKey('a');
    teclaV=crear.input.keyboard.addKey('v');
    teclaT=crear.input.keyboard.addKey('t');
    lanzarJugador(ws.nick,ws.numJugador);
    ws.estoyDentro();
  }

  function resetFinal(){
    if(!game){
      return
    }
    game.destroy();
    cursosr=null;
    player=null;
    jugadores={};
    showDebug=false;
    camera=null;
    worldLayer=null;
    map=null;
    crear=null;
    spawnPoint=null;
    id=null;
    capaTareas=null;
    tareasOn=true;
    ataquesOn=true;
    remotos=null;
    muertos=null;
    final = false;
  }

  function crearColision(){
    if(ws.impostor && crear){
      crear.physics.add.overlap(player,remotos,kill,()=>{return ataquesOn});
    }
  }

  function kill(sprite,inocente){
    var nick = inocente.nick;
    if(teclaA.isDown && ws.estado=="vivo"){
      ataquesOn=false;
      ws.atacar(nick);
    }
  }

  function dibujarMuereInocente(inocente){
    var x=jugadores[inocente].x;
    var y=jugadores[inocente].y;
    var numJugador=jugadores[inocente].numJugador;

    var muerto = crear.physics.add.sprite(x, y,"tumba",0);
    muertos.add(muerto);
    if(ws.nick!=inocente){
      jugadores[inocente].visible=false;
    }else{
      player.anims.play(recursos[numJugador].sprite+"-back-walk-fan", true);
      //console.log(remotos.children.entries[0]);
      //for(i=0;i<remotos.children.size;i++){
      //  remotos.children.entries[i].visible=true;
      //  console.log(remotos.children.entries[i]);
      //  remotos.children.entries[i].anims.play(remotos.children.entries[i].numJugador+"-back-walk-fan", true);
      //}
    }
    if(ws.encargo=="Vidente"){
      jugadores[inocente].visible=true;
    }
    crear.physics.add.overlap(player,muertos,votacion);
  }

  function dibujarMuereInocenteVotacion(inocente){
    if(ws.nick!=inocente){
      jugadores[inocente].visible=false;
    }else{
      player.anims.play(recursos[numJugador].sprite+"-back-walk-fan", true);
      //for(i=0;i<remotos.children.size;i++){
      //  remotos.children.entries[i].visible=true;
      //  console.log(remotos.children.entries[i]);
      //  remotos.children.entries[i].anims.play(remotos.children.entries[i].numJugador+"-back-walk-fan", true);
      //}
    }
    if(ws.encargo=="Vidente"){
      jugadores[inocente].visible=true;
    }
  }

  function dibujarAbandono(nick){
    //var numJugador=jugadores[nick].numJugador;
    //var remoto=jugadores[nick];
    //remoto.visible=false;
    //jugadores[nick].visible=false;
    jugadores[nick].destroy();
  }

  function votacion(muerto){
    if(teclaV.isDown && ws.estado=="vivo"){
      ws.lanzarVotacion();
    }
  }

  function borrarTumbas(){
    var i = 0;
    for(i=0;i<muertos.children.size;i++){
      muertos.children.entries[0].destroy();
    }
  }

  function tareas(sprite,objeto){
    if (ws.encargo==objeto.properties.tarea && objeto.properties.done==false && teclaT.isDown){
      tareasOn=false;      
      ws.realizarTarea();
      objeto.properties.done=true;
      map.removeTileAt(objeto.x,objeto.y,null,true,capaTareas);
    }
    if (ws.encargo==objeto.properties.tarea && objeto.properties.done==true && teclaT.isDown){
      cw.mostrarModalTarea(ws.encargo);
    }
  }

  function lanzarJugador(nick,numJugador){
    player = crear.physics.add.sprite(spawnPoint.x+15*numJugador, spawnPoint.y,"varios",recursos[numJugador].frame);    
    // Watch the player and worldLayer for collisions, for the duration of the scene:
    crear.physics.add.collider(player, worldLayer);
    crear.physics.add.collider(player, capaTareas,tareas,()=>{return tareasOn});
    crear.physics.add.collider(player, capaColisiones);
    jugadores[nick] = player;
    jugadores[nick].nick = nick;
    jugadores[nick].numJugador=numJugador;
    camera = crear.cameras.main;
    camera.startFollow(player);
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    camera.setZoom(1.5);
  }

  function lanzarJugadorRemoto(nick,numJugador){
    var frame=recursos[numJugador].frame;
    jugadores[nick]=crear.physics.add.sprite(spawnPoint.x+15*numJugador, spawnPoint.y,"varios",frame);   
    crear.physics.add.collider(jugadores[nick], worldLayer);
    jugadores[nick].nick=nick;
    jugadores[nick].numJugador=numJugador;
    remotos.add(jugadores[nick]);
  }

  function mover(datos){
    var direccion = datos.direccion;
    var nick = datos.nick;
    var numJugador = datos.numJugador;
    var x = datos.x;
    var y = datos.y;
    var remoto=jugadores[nick];
    const speed = 175;
    const nombre=recursos[numJugador].sprite;
    if (remoto){
      if(datos.estado!="fantasma"||ws.estado=="fantasma"||ws.encargo=="Vidente"){
        remoto.body.setVelocity(0);
        remoto.setX(x);
        remoto.setY(y);
        remoto.body.velocity.normalize().scale(speed);
        if(datos.estado=="vivo"){
          if (direccion=="left") {
            remoto.anims.play(nombre+"-left-walk", true);
          } else if (direccion=="right") {
            remoto.anims.play(nombre+"-right-walk", true);
          } else if (direccion=="up") {
            remoto.anims.play(nombre+"-back-walk", true);
          } else if (direccion=="down") {
            remoto.anims.play(nombre+"-front-walk", true);
          } else {
            remoto.anims.stop();
          }
        }else{
          if (direccion=="left") {
            remoto.anims.play(nombre+"-left-walk-fan", true);
          } else if (direccion=="right") {
            remoto.anims.play(nombre+"-right-walk-fan", true);
          } else if (direccion=="up") {
            remoto.anims.play(nombre+"-back-walk-fan", true);
          } else if (direccion=="down") {
            remoto.anims.play(nombre+"-front-walk-fan", true);
          } else {
            remoto.anims.stop();
          }
        }
      } //else {
        //remoto.visible=false;
      //}
    }
  }

  function finPartida(data){
    final=true;
    //remoto=undefined;
    cw.mostrarModalSimple("Fin de la partida "+data);
  }

  // function moverRemoto(direccion,nick,numJugador)
  // {
  //   const speed = 175;
  //   var remoto=jugadores[nick];

  //   if (direccion=="left"){
  //     remoto.body.setVelocityX(-speed);
  //   }
  // }

  function update(time, delta) {
    const speed = 175;
    const prevVelocity = player.body.velocity.clone();
    var direccion="stop";
    const nombre=recursos[ws.numJugador].sprite;
    //aqui para vidente
    if(ws.estado=="fantasma"){
      for(var nick in jugadores){
        jugadores[nick].visible=true;
      }
    }
    if (!final){
      // Stop any previous movement from the last frame
      player.body.setVelocity(0);
      //player2.body.setVelocity(0);

      // Horizontal movement
      if (cursors.left.isDown) {
        player.body.setVelocityX(-speed);
        direccion="left";
      } else if (cursors.right.isDown) {
        player.body.setVelocityX(speed);
        direccion="right";
      }

      // Vertical movement
      if (cursors.up.isDown) {
        player.body.setVelocityY(-speed);
        direccion="up";
      } else if (cursors.down.isDown) {
        player.body.setVelocityY(speed);
        direccion="down";
      }

      // Normalize and scale the velocity so that player can't move faster along a diagonal
      player.body.velocity.normalize().scale(speed);

      ws.movimiento(direccion,player.x,player.y);

      // Update the animation last and give left/right animations precedence over up/down animations
      if(ws.estado=="vivo"){
        if (cursors.left.isDown) {
          player.anims.play(nombre+"-left-walk", true);
        } else if (cursors.right.isDown) {
          player.anims.play(nombre+"-right-walk", true);
        } else if (cursors.up.isDown) {
          player.anims.play(nombre+"-back-walk", true);
        } else if (cursors.down.isDown) {
          player.anims.play(nombre+"-front-walk", true);
        } else {
          player.anims.stop();
        }
      }else{
        if (cursors.left.isDown) {
          player.anims.play(nombre+"-left-walk-fan", true);
        } else if (cursors.right.isDown) {
          player.anims.play(nombre+"-right-walk-fan", true);
        } else if (cursors.up.isDown) {
          player.anims.play(nombre+"-back-walk-fan", true);
        } else if (cursors.down.isDown) {
          player.anims.play(nombre+"-front-walk-fan", true);
        } else {
          player.anims.stop();
        }
      }
      
    }
  }