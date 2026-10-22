const canvas = document.getElementById("game-canvas");

let keys = [], mouseX = 0, mouseY = 0, clicked = false, deaths = 0, scene = "menu";

window.onkeydown = function(event) {
  keys[event.keyCode] = true;
}

window.onkeyup = function(event) {
  keys[event.keyCode] = false;
}

canvas.onmousemove = function(event) {
  let rect = canvas.getBoundingClientRect();
  mouseX = event.clientX - rect.x;
  mouseY = event.clientY - rect.y;
};

window.onmouseup = function(event) {
  clicked = true;
};

const ctx = new Webgl2DContext(canvas);

function collide(obj1, obj2) {
  return obj1.x + obj1.w > obj2.x && obj1.x < obj2.x + obj2.w && obj1.y + obj1.h > obj2.y && obj1.y < obj2.y + obj2.h;
};

function button(x, y, width, height, onPress) {
  const mouseOver = mouseX > x && mouseX < x + width && mouseY > y && mouseY < y + height;

  ctx.fillColor = [125, 125, 125];
  ctx.fillRect(x, y, width, height);
  if(mouseOver) {
    ctx.fillColor = [0, 0, 0];
  }else {
    ctx.fillColor = [255, 255, 255];
  }
  ctx.fillRect(x + 2, y + 2, width - 4, height - 4);

  if(mouseOver && clicked) {
    onPress();
  }

  return mouseOver;
};

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 20;
    this.h = 20;
    this.xVel = 0;
    this.yVel = 0;
    this.gravity = 0.6;
    this.canJump = false;
  }

  draw() {
    ctx.fillColor = [0, 200, 0];
    ctx.fillRect(this.x, this.y, this.w, this.h);

    ctx.fillColor = [0, 0, 0];

    ctx.fillRect(this.x, this.y, this.w / 4, this.h / 4);
    ctx.fillRect(this.x + this.w - this.w / 4, this.y, this.w / 4, this.h / 4);
  }

  update() {
    if(keys[65] || keys[37]) {
      this.xVel = -4;
    }else if(keys[68] || keys[39]) {
      this.xVel = 4;
    }else {
      this.xVel = 0;
    }

    if((keys[87] || keys[38]) && this.canJump) {
      this.yVel = -10;
      this.canJump = false;
    }

    this.yVel += this.gravity;

    if(this.yVel > 10) {
      this.yVel = 10;
    }

    this.x += this.xVel;

    for(let block of blocks) {
      if(collide(this, block)) {
        if(block.collide) {
          if(this.x < block.x) {
            this.x = block.x - this.w;
          }else if(this.x > block.x) {
            this.x = block.x + block.w;
          }
          block.onCollide(block);
        }
      }
    }

    this.x = this.x < 0 ? 0 : this.x + this.w > canvas.width ? canvas.width - this.w : this.x;

    this.y += this.yVel;

    for(let block of blocks) {
      if(collide(this, block)) {
        if(block.collide) {
          if(this.y < block.y) {
            if(!(keys[87] || keys[38])) {
              this.canJump = true;
            }
            this.yVel = 0;
            this.y = block.y - this.h;
          }else if(this.y > block.y) {
            this.yVel *= -0.01;
            this.y = block.y + block.h;
          }
        }else {
          block.onCollide(block);
          if(block.type === "d" || block.type === "e") {
            return;
          }
        }
      }
    }

    if(this.y > canvas.height) {
      deaths ++;
      loadLevel();
    }
  }
}

class Block {
  constructor(x, y, type, collide, onCollide) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.collide = collide;
    this.onCollide = onCollide;
    this.w = 20;
    this.h = 20;
  }

  draw() {
    switch(this.type) {
      case "b": //block
        ctx.fillColor = [125, 125, 125];
        ctx.fillRect(this.x, this.y, this.w, this.h);
        break;
      case "e": //exit
        ctx.fillColor = [(Math.sin(performance.now() / -300) + 1) / 2 * 255, (Math.sin(performance.now() / 200) + 1) / 2 * 255, (Math.sin(performance.now() / 300) + 1) / 2 * 255];
        ctx.fillRect(this.x, this.y, this.w, this.h);
        break;
      case "d": //death
        ctx.fillColor = [255, 0, 0];
        ctx.fillRect(this.x, this.y, this.w, this.h);
        break;
      case "s": //sign
        ctx.fillColor = [165, 42, 42];
        ctx.fillRect(this.x, this.y, this.w, this.h / 2);
        ctx.fillRect(this.x + this.w / 3, this.y, this.w / 3, this.h);
        ctx.fillColor = [0, 0, 0];
        ctx.fillRect(this.x + 2, this.y + 4, 3, 3);
        ctx.fillRect(this.x + 6, this.y + 2, 3, 5);
        ctx.fillRect(this.x + 10, this.y + 4, 3, 3);
        ctx.fillRect(this.x + 14, this.y + 2, 3, 5);
        break;
    }
  }
}

let curLevel = 0;

const levels = [
  {
    levelText: ["WAD or arrow keys to move", "Touch the glowing portal to progress"],
    levelMap: [
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "      p                                 ",
      "      s           s                    e",
      "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        "
    ]
  },
  {
    levelText: ["Lava kills you"],
    levelMap: [
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "p        s                             e",
      "bbbbbbbbbbbbbbbbbbbb    bbbbbbbbbbbbbbbb",
      "                   b    b               ",
      "                   bddddb               ",
      "                   bbbbbb               ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        "
    ]
  },
  {
    levelText: ["Jump after falling to go farther"],
    levelMap: [
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "p        s                             e",
      "bbbbbbbbbbbbbbbbbb        bbbbbbbbbbbbbb",
      "                 b        b             ",
      "                 b        b             ",
      "                 bddddddddb             ",
      "                 bbbbbbbbbb             ",
      "                                        ",
      "                                        ",
      "                                        "
    ]
  },
  {
    levelText: ["Good Luck!"],
    levelMap: [
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "           b        b                   ",
      "                                        ",
      "                                        ",
      "       b                                ",
      "                                        ",
      "p  s                                    ",
      "bbbb                                    ",
      "                                 e      ",
      "                                        ",
      "                                        "
    ]
  },
  {
    levelText: [],
    levelMap: [
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "p                                      e",
      "bbbbbbdbbdbbdbbdbbdbbdbbdbbdbbdbbdbbdbbb",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        "
    ]
  },
  {
    levelText: [],
    levelMap: [
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "    d  d  d  d  d  d  d  d  d  d  d     ",
      "    d  d  d  d  d  d  d  d  d  d  d     ",
      "p   d  d  d  d  d  d  d  d  d  d  d    e",
      "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        "
    ]
  },
  {
    levelText: [],
    levelMap: [
      "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                       p",
      " dbbddbbddbbddbbddbbddbbddbbddbbddbbddbb",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "bb                                      ",
      "e                                       ",
      "                                        ",
      "                                        ",
      "dddddddddddddddddddddddddddddddddddddddd"
    ]
  },
  {
    levelText: [],
    levelMap: [
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "    p           bb                      ",
      "   bbb                   bb             ",
      "                                        ",
      "           bb                           ",
      "dddddddddddddddddddddddddddddddd        ",
      "                                        ",
      "                                     b  ",
      "             b                          ",
      " e     b                    b           ",
      "                                        ",
      "                  b                     ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        "
    ]
  },
  {
    levelText: [],
    levelMap: [
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "             e                          ",
      "                                        ",
      "                                        ",
      "                 b                      ",
      "                                        ",
      "                                     b  ",
      "                    b                b  ",
      "                                     b  ",
      "                                    bb  ",
      "                       bb            b  ",
      "        bbbbbb         b             b  ",
      "        b    b         b            bb  ",
      "       bb    b         bb            b  ",
      "        b    bdddddddd b             b  ",
      "        b    bbbbbbbbb b            bb  ",
      "       bb            d bb            b  ",
      "        b            d d             b  ",
      "        b            d d          dbbb  ",
      "       bb            d d          d     ",
      "        b            d d          d     ",
      "        b            d d         bd     ",
      "       bb            d d                ",
      "        b            d                  ",
      "        b            d        db        ",
      "       bb            d        d         ",
      "        b            d        d         ",
      "p       b            d       bd         ",
      "bbbbbdddbbbbbbbbbbbbbddbbbbbbbdddddddddd",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        "
    ]
  },
  {
    levelText: [],
    levelMap: [
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "bbbbbbbb bbbbbb     b        b        bb",
      "b      b      b                        b",
      "b b    bbbbbb b                        b",
      "b bbb  b      b                       bb",
      "b b    b bbbbbb                        b",
      "beb    b      b                        b",
      "bbb   bbbbbbb b                       bb",
      "       b      b                        b",
      "       b      b                       bb",
      "      bb      b                        b",
      "       b      b                        b",
      "       bddd   b                       bb",
      "      bb      b                        b",
      "       b      b                        b",
      "       b      b                       bb",
      "      bb      b                         ",
      "              b           p             ",
      "                         bbb    b       ",
      "      bbbdddddd                         ",
      "                                        ",
      "                                        "
    ]
  },
  {
    levelText: [],
    levelMap: [
      "                                        ",
      "                                        ",
      "                p                       ",
      "               bbb                      ",
      "      d                  d              ",
      "           b                      d     ",
      "   d    bb                 b            ",
      "           d    b    d          d   bdb ",
      "      b             b             d     ",
      "           b   d              b    d    ",
      "          d       b    b          b     ",
      "  bdd        d    b   d                 ",
      "         b  d   d         bb         bb ",
      "  d    b b    b      b        b         ",
      "   bd    b    b     b        d          ",
      "ddd      db    d    b d     b       d   ",
      "  d  bbb b                 d  d    d    ",
      "   b  dddb      db      d          dd  d",
      "  b      b   bdbbb    b               d ",
      "  d  b   b      d b  d d       b    b   ",
      "    d           b d bd     d   b     d b",
      "               b  d b  b      db        ",
      " d       d    d           b b  db     bd",
      "         b          bd    b           d ",
      "d   d    b  bd     b        b   d b  bbd",
      "d        d         d     b     d   b  b ",
      "d                      bd   d d b    d b",
      "dd     d    d ddbddd       d           d",
      "                       d  d       b     ",
      "                        d   db    b     ",
      "            d                    b      ",
      "      b                     b        d  ",
      "      b                     bbbbbbb    b",
      "    bbbd d d d d d d d d d db     d   db",
      "                          bb          bb",
      "bb                              bbbb    ",
      "        b       b                e      ",
      "                                        ",
      "                        b               ",
      "                                        "
    ]
  },
  {
    levelText: [],
    levelMap: [
      "                       bbbbbbbbbbbbbbbbb",
      "                       b        b       ",
      "                       b        b       ",
      "              b        b        b   b   ",
      "                       b    b       b  b",
      "       b              bb           bb   ",
      " p                                      ",
      "bbb                                    b",
      "                                        ",
      "                         bb             ",
      "                          b       b     ",
      "                          bdddd dddddddd",
      "ddddddddddddddddddddddddddb      b      ",
      "                          b      b      ",
      "                          b      b      ",
      "                          b      b      ",
      "          bbbbbbb        bb      b      ",
      "          b               b      b      ",
      "          b               bd   ddb      ",
      "          b              bb      b      ",
      "      ddddb               b      b      ",
      "          b               b     db      ",
      "          b          bb   b      b      ",
      "          b               b      b      ",
      "ddd       b               bbbb   b      ",
      "          b   bb                 b      ",
      "          b                      b      ",
      "          b          bb          b      ",
      "          b                   bbbb      ",
      "          b                             ",
      "       dddb                             ",
      "          b                             ",
      "          b                             ",
      "          bdddddddddddddddddddd         ",
      "                              d         ",
      "                              d         ",
      "                                 e      ",
      "                       b  b             ",
      "       b                                ",
      "                b                       "
    ]
  },
  {
    levelText: [],
    levelMap: [
      "                                        ",
      "                                        ",
      "                                        ",
      "                bbbbbbbb                ",
      "                b  e   b                ",
      "                bbbb b b                ",
      "                b  d   b                ",
      "                b     bb                ",
      "                b      b                ",
      "                b b   db                ",
      "                b      b                ",
      "                b      b                ",
      "                bddd  bb                ",
      "                b      b                ",
      "                b      b                ",
      "                b    b b                ",
      "                b      b                ",
      "                b      b                ",
      "                b b dddb                ",
      "                b      b                ",
      "                b      b                ",
      "                b b    b                ",
      "                bdd   db                ",
      "                b     db                ",
      "                b    b b                ",
      "                b      b                ",
      "                b      b                ",
      "                bb     b                ",
      "                bdd    b                ",
      "                b      b                ",
      "                b     bb                ",
      "                bb   ddb                ",
      "                b      b                ",
      "                b      b                ",
      "                      bb                ",
      "                       b                ",
      "                       b                ",
      "                      bb                ",
      "            p                           ",
      "           bbb      b                   "
    ]
  },
];

/*
  {
    levelText: [],
    levelMap: [
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        ",
      "                                        "
    ]
  },
*/

let blocks, player;

//Exit, Death, Sign, Block

function loadLevel() {
  if(curLevel === levels.length) {
    scene = "win";
    leaderboard = new XMLHttpRequest();
    leaderboard.open("GET", "https://platformer.danielrichards9.repl.co/leaderboard.json");
    leaderboard.send();
    return;
  }


  blocks = [];
  player = null;

  let exits = [], deathBlocks = [], signs = [], normals = [];

  for(let row in levels[curLevel].levelMap) {
    let y = row * 20;
    for(let column in levels[curLevel].levelMap[row]) {
      let x = column * 20;
      const letter = levels[curLevel].levelMap[row][column];

      if(letter === " ") {
        continue;
      }

      switch(letter) {
        case "b":
          normals.push(new Block(x, y, letter, true, () => {}));
          break;
        case "e":
          exits.push(new Block(x, y, letter, false, () => {
            curLevel ++;
            loadLevel();
          }));
          break;
        case "d":
          deathBlocks.push(new Block(x, y, letter, false, (block) => {
            deaths ++;
            loadLevel();
          }));
          break;
        case "s":
          signs.push(new Block(x, y, letter, false, (block) => {
            let justSigns = blocks.slice();

            for(let i = justSigns.length - 1; i >= 0; i --) {
              if(justSigns[i].type !== "s") {
                justSigns.splice(i, 1);
              }
            }

            ctx.font = "20px Sans-Serif";

            ctx.fillText(levels[curLevel].levelText[justSigns.indexOf(block)], block.x + block.w / 2, block.y - 40);
          }));
          break;
        case "p":
          player = new Player(x, y);
          break;
      }
    }
  }

  blocks.push(...exits, ...deathBlocks, ...signs, ...normals);

  if(!player) {
    player = new Player(canvas.width / 2, canvas.height / 2);
  }
}

let leaderboard;

function loop() {
  switch(scene) {
    case "menu":
      ctx.background(255, 255, 255, 1);

      ctx.font = "50px Sans-Serif";
      ctx.fillText("A Platformer", canvas.width / 2, 150);

      const playButton = button(canvas.width / 2 - 100, canvas.height / 2 + 150, 200, 50, () => {
        scene = "game";
        loadLevel();
      });

      const leaderboardButton = button(canvas.width / 2 - 100, canvas.height / 2 + 210, 200, 50, () => {
        scene = "leaderboard";
        leaderboard = new XMLHttpRequest();
        leaderboard.open("GET", "https://platformer.danielrichards9.repl.co/leaderboard.json");
        leaderboard.send();
      });

      ctx.font = "20px Sans-Serif";
      if(playButton) {
        ctx.fillColor = [255, 255, 255];
      }else {
        ctx.fillColor = [0, 0, 0];
      }

      ctx.fillText("Play", canvas.width / 2, canvas.height / 2 + 144);

      if(leaderboardButton) {
        ctx.fillColor = [255, 255, 255];
      }else {
        ctx.fillColor = [0, 0, 0];
      }

      ctx.fillText("Leaderboard", canvas.width / 2, canvas.height / 2 + 204);

      const playerDrawing = new Player(canvas.width / 2 - 100, 300);
      playerDrawing.w = 200;
      playerDrawing.h = 200;

      playerDrawing.draw();
      break;
    case "leaderboard":
      ctx.background(255, 255, 255, 1);

      ctx.font = "20px Sans-Serif";

      ctx.fillColor = [0, 0, 0];

      if(leaderboard.status === 200) {
        const data = JSON.parse(leaderboard.response);
        ctx.fillColor = [0, 0, 0];
        ctx.fillText("Name:", canvas.width / 2 - 70, 150);
        ctx.fillText("Deaths:", canvas.width / 2 + 90, 150);
        for(let i in data) {
          let y = i * 50 + 200;
          ctx.fillText(data[i].name, canvas.width / 2 - 70, y);
          ctx.fillText(data[i].deaths, canvas.width / 2 + 90, y);
        }
      }else {
        ctx.fillText("Leaderboard loading...", canvas.width / 2, canvas.height / 2);
      }
      
      const backButton = button(20, 20, 200, 50, () => {
        scene = "menu";
      });

      if(backButton) {
        ctx.fillColor = [255, 255, 255];
      }else {
        ctx.fillColor = [0, 0, 0];
      }

      ctx.fillText("Back", 120, 14);
      break;
    case "game":
      ctx.background(255, 255, 255, 1);

      for(let block of blocks) {
        block.draw();
      }

      player.draw();
      player.update();

      ctx.font = "15px Sans-Serif";
      ctx.fillText(`Deaths: ${deaths}`, canvas.width - ctx.measureText(`Deaths: ${deaths}`).width / 2 - 2, -15);
      break;
    case "win":
      ctx.background(255, 255, 255, 1);
      
      if(!leaderboard) {
        leaderboard = new XMLHttpRequest();
        leaderboard.open("GET", "https://platformer.danielrichards9.repl.co/leaderboard.json");
        leaderboard.send();
      }

      ctx.font = "30px Sans-Serif";
      ctx.fillText("Good job!", canvas.width / 2, canvas.height / 2 - 140);
      ctx.fillText(`You won with ${deaths} deaths`, canvas.width / 2, canvas.height / 2 - 100);

      const menuButton = button(canvas.width / 2 - 100, canvas.height / 2 + 150, 200, 50, () => {
        scene = "menu";
        clicked = false;
        deaths = 0;
        player = null;
        curLevel = 0;
        document.getElementById("username-input").style.display = "none";
        document.getElementById("username-send").style.display = "none";
      });

      if(menuButton) {
        ctx.fillColor = [255, 255, 255];
      }else {
        ctx.fillColor = [0, 0, 0];
      }

      ctx.font = "20px Sans-Serif";
      
      ctx.fillText("Menu", canvas.width / 2, canvas.height / 2 + 144);

      ctx.fillColor = [0, 0, 0];

      if(leaderboard.status === 200) {
        const data = JSON.parse(leaderboard.response);
        const highestDeaths = data[9].deaths;
        
        if(deaths < highestDeaths) {
          if((document.getElementById("username-input").style.display === "none" || document.getElementById("username-send").style.display === "none") && scene === "win") {
            const input = document.getElementById("username-input");
            const button = document.getElementById("username-send");

            const rect = canvas.getBoundingClientRect();

            input.style.display = "block";
            button.style.display = "block";
            input.style.left = canvas.width / 2 + rect.x - 70 + "px";
            button.style.left = canvas.width / 2 + rect.x - 25 + "px";
            input.style.top = canvas.height / 2 + 220 + "px";
            button.style.top = canvas.height / 2 + 250 + "px";
          }
          ctx.fillText("Enter a username for leaderboard", canvas.width / 2, canvas.height / 2);
        }else {
          ctx.fillText("Deaths too high for leaderboard", canvas.width / 2, canvas.height / 2);
        }
      }else {
        ctx.fillText("Leaderboard loading...", canvas.width / 2, canvas.height / 2);
      }
      break;
  }
  clicked = false;

  if(!arraysEqual(ctx.triangles, [])) {
    ctx.render();
  }
};

function arraysEqual(array1, array2) {
  if(array1.length !== array2.length) {
    return false;
  }else {
    let copy = array2.slice();
    for(let property of array1) {
      if(!copy.includes(property)) {
        return false;
      }else {
        copy.splice(copy.indexOf(property), 1);
      }
    }
    return true;
  }
};

const sendButton = document.getElementById("username-send");

sendButton.onclick = () => {
  const input = document.getElementById("username-input");
  const value = input.value;

  const playerDeaths = deaths;

  scene = "menu";
  deaths = 0;
  curLevel = 0;
  player = null;

  input.style.display = "none";
  sendButton.style.display = "none";

  const oldDataReq = new XMLHttpRequest();
  oldDataReq.open("GET", "https://platformer.danielrichards9.repl.co/leaderboard.json");
  oldDataReq.onloadend = () => {
    let oldData = JSON.parse(oldDataReq.response);

    oldData.push({name: input.value, deaths: playerDeaths});

    let newData = oldData.sort((a, b) => a.deaths - b.deaths);

    newData = newData.slice(0, 10);

    const newDataPut = new XMLHttpRequest();
    newDataPut.open("PUT", "https://platformer.danielrichards9.repl.co/leaderboard.json");
    newDataPut.send(JSON.stringify(newData));
    input.value = "";
  };
  oldDataReq.send();

  clicked = false;
};

window.setInterval(loop, 1000 / 60);