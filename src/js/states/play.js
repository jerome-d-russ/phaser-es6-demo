import * as easystar from "easystarjs";
import _ from 'lodash';
import Buttons from "../extensions/Buttons";
import * as gameObjects from "../objects";
import * as missions from "../missions";
import * as inputHandlers from "../handlers";

export default class Play extends Phaser.State {

    preload() {
        this.game.create.grid('grid', this.game.width, this.game.height, 64, 64, '#ffffff');
        this.graphics = this.game.add.graphics(0, 0);
        this.mission = new missions[this.game.mission](this.game);
        //TODO: look through all missions and add the sprites used!
        this.mission.enemies.forEach((it) => {
          console.log(it.image);
          if(it.image){
            console.log('there is an image!');
            if(!this.game.cache.checkImageKey(it.image)){
              console.log('...and it wasnt cached yet!');
              this.game.load.image(it.image, it.imageSrc, it.imageSize.x, it.imageSize.y);
            }
          }
        });
    }

    create() {
        this.game.add.sprite(0,0,'grid');
        this.cellWidth = this.game.world.width / 10;
        this.cellHeight = this.game.world.height / 15;

        this.game.inputHandler = ()=>'';

        this.game.enemies = this.game.add.physicsGroup();

        this.setupGrid();

        this.drawHealth();

        this.drawInput();

    }

    setupGrid() {

        //10x15 grid
        let x = 10;
        let y = 15;

        //10x15 grid to make it easy.

        let easystar = new EasyStar.js();

        var grid = [];

        Array.from(new Array(y)).forEach(() => {
            grid.push(new Array(x).fill(0));
        });

        this.game.gameData.placedItems.forEach((it) => {
          grid[it.y][it.x] = 1;
          new gameObjects[it.type](this.game, it.x * this.cellWidth, it.y * this.cellHeight);
        });

        easystar.setGrid(grid);
        easystar.setAcceptableTiles([0]);
        easystar.calculate();
        easystar.enableDiagonals();
        easystar.disableCornerCutting();

        this.game.easystar = easystar;
        this.game.easystar.calculate();
    }

    drawHealth() {
        //Draw rectangles for health of enemy army
        // this.graphics.beginFill(0x00FF00);
        // this.graphics.lineStyle(2, 0x0000FF, 1);
        // this.graphics.drawRect(0, 0, 80, 1080);

        let w = this.game.world.width;
        let h = this.game.world.height;

        //Draw rectangles for health of player army
        // this.graphics.beginFill(0x00FF00);
        // this.graphics.lineStyle(2, 0x0000FF, 1);
        // this.graphics.drawRect(w-80, 0, 80, 1080);
    }

    drawInput() {
        Object.keys(inputHandlers).forEach((ih,index) => new inputHandlers[ih](this.game, 90, 310 + (90 * index)));

        this.btnDownSound = this.add.sound('menuDown');
        Buttons.makeButton(
            this.game,
            100,
            this.game.height - 40,
            100,
            20,
            this.btnDownSound,
            'back', ()=>{
                console.log("asking to go to menu");
                this.state.start('Missions');
            }
        );
    }

    update() {
        this.mission.update();
        this.game.easystar.calculate();
    }

    shutdown() {
        console.log("shut down called");
        this.mission.shutdown();
    }
}
