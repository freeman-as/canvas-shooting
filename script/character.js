class Position {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  set(x, y) {
    if (x != null) this.x = x;
    if (y != null) this.y = y;
  }

  distance(target) {
    let x = this.x - target.x;
    let y = this.y - target.y;
    return Math.sqrt(x * x + y * y);
  }
}

class Character {
  constructor(ctx, x, y, w, h, life, imagePath) {
    this.ctx = ctx;
    this.position = new Position(x, y);
    this.vector = new Position(0.0, -1.0);
    this.angle = 270 * Math.PI / 180;
    this.width = w;
    this.height = h;
    this.life = life;
    this.ready = false;
    this.image = new Image();

    this.image.addEventListener('load', () => {
      this.ready = true;
    }, false);
    this.image.src = imagePath;
  }

  setVector(x, y) {
    this.vector.set(x, y);
  }

  setVectorFromAngle(angle) {
    this.angle = angle;
    let sin = Math.sin(angle);
    let cos = Math.cos(angle);

    this.vector.set(cos, sin);
  }

  draw() {
    let offsetX = this.width / 2;
    let offsetY = this.height / 2;
    
    this.ctx.drawImage(
      this.image,
      this.position.x - offsetX,
      this.position.y - offsetY,
      this.width,
      this.height
    );
  }

  rotationDraw() {
    // 座標系を保存
    this.ctx.save();
    // 座標系を自身が中心になるように移動
    this.ctx.translate(this.position.x, this.position.y);
    // 座標系回転 (270度の位置を基準にするためその分引いてあげる)
    this.ctx.rotate(this.angle - Math.PI * 1.5);
  
    let offsetX = this.width / 2;
    let offsetY = this.height / 2;
    
    this.ctx.drawImage(
      this.image,
      -offsetX, // 平行移動後なので、オフセット分だけ引く
      -offsetY, // 平行移動後なので、オフセット分だけ引く
      this.width,
      this.height
    );

    // 座標系を保存時の状態に戻す
    this.ctx.restore();
  }
}


class Player extends Character {
  constructor(ctx, x, y, w, h, imagePath) {
    super(ctx, x, y, w, h, 1, imagePath);

    this.speed = 3;
    // 自機が登場中かどうかのフラグ
    this.isComing = false;
    // 登場演出を開始した際のタイムスタンプ
    this.comingStart = null;
    this.comingStartPosition = null;
    this.comingEndPosition = null;
    this.shotArray = null;
    this.singleShotArray = null;
    this.shotCheckCounter = 0;
    this.shotInterval = 10;
  }

  setComing(startX, startY, endX, endY) {
    this.life = 1;
    this.isComing = true;
    this.comingStart = Date.now();
    this.position.set(startX, startY);
    this.comingStartPosition = new Position(startX, startY);
    this.comingEndPosition = new Position(endX, endY);
  }

  setShotArray(shotArray, singleShotArray) {
    this.shotArray = shotArray;
    this.singleShotArray = singleShotArray;
  }

  update() {
    if (this.life <= 0) return;
    let justTime = Date.now();

    if (this.isComing) {
      let comingTime = (justTime - this.comingStart) / 1000;
      let posy = this.comingStartPosition.y - comingTime * 50;

      if (posy <= this.comingEndPosition.y) {
        this.isComing = false;
        posy = this.comingEndPosition.y;
      }

      this.position.set(this.position.x, posy);

      if (justTime % 100 < 50) {
        this.ctx.globalAlpha = 0.5;
      }
    } else {
      if (window.isKeyDown.key_ArrowLeft) {
        this.position.x -= this.speed;
      }
      if (window.isKeyDown.key_ArrowRight) {
        this.position.x += this.speed;
      }
      if (window.isKeyDown.key_ArrowUp) {
        this.position.y -= this.speed;
      }
      if (window.isKeyDown.key_ArrowDown) {
        this.position.y += this.speed;
      }

      // プレイヤーが画面外に出ないように制御
      let canvasWidth = this.ctx.canvas.width;
      let canvasHeight = this.ctx.canvas.height;
      let tx = Math.min(Math.max(this.position.x, 0), canvasWidth);
      let ty = Math.min(Math.max(this.position.y, 0), canvasHeight);
      this.position.set(tx, ty);

      if (window.isKeyDown.key_z) {
        if (this.shotCheckCounter >= 0) {
          // ショットの生存を確認し非生存のものがあれば生成する
          for (let i = 0; i < this.shotArray.length; i++) {
            if (this.shotArray[i].life <= 0) {
              this.shotArray[i].set(this.position.x, this.position.y);
              this.shotArray[i].setPower(2);
              this.shotCheckCounter = -this.shotInterval;
              break;
            } 
          }

          for (let i = 0; i < this.singleShotArray.length; i+=2) {
            if (this.singleShotArray[i].life <= 0 && this.singleShotArray[i + 1].life <= 0) {
              let radCW = 280 * Math.PI / 180;
              let radCCW = 260 * Math.PI / 180;

              this.singleShotArray[i].set(this.position.x, this.position.y);
              this.singleShotArray[i].setVectorFromAngle(radCW);
              this.singleShotArray[i + 1].set(this.position.x, this.position.y);
              this.singleShotArray[i + 1].setVectorFromAngle(radCCW);
              this.shotCheckCounter = -this.shotInterval;
              break;
            } 
          }
        }
      }

      ++this.shotCheckCounter;

    }

    // プレイヤーの描画
    this.draw();

    // 念のためグローバルなアルファの状態に戻す
    this.ctx.globalAlpha = 1.0;
  }
}

class Shot extends Character {
  constructor(ctx, x, y, w, h, imagePath) {
    super(ctx, x, y, w, h, 0, imagePath);

    this.speed = 7;
    this.power = 1;
    // 衝突判定対象
    this.tragetArray = [];
    this.explosionArray = [];
    this.life = 0;
    this.vector = new Position(0.0, -1.0);
  }

  set(x, y) {
    this.position.set(x, y);
    this.life = 1;
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  setPower(power) {
    if (power && power > 0) {
      this.power = power;
    }
  }

  setTargets(targets) {
    if (targets && Array.isArray(targets) && targets.length > 0) {
      this.tragetArray = targets;
    }
  }

  setExplosions(targets) {
    if (targets && Array.isArray(targets) && targets.length > 0) {
      this.explosionArray = targets;
    }
  }

  update() {
    // ライフなければ更新しない
    if (this.life <= 0) return;
    // 画面外なら更新しない
    if (this.position.y + this.height < 0 || this.position.y - this.height > this.ctx.canvas.height) {
      this.life = 0;
    }

    this.position.x += this.vector.x * this.speed;
    this.position.y += this.vector.y * this.speed;

    this.tragetArray.map(v => {
      if (this.life <= 0 || v.life <= 0) return;
      let dist = this.position.distance(v.position);

      if (dist <= (this.width + v.width) / 4) {
        // プレイヤーが判定対象の場合に、登場シーンの時は処理しない
        if (v instanceof Player) {
          if (v.isComing) return;
        }

        v.life -= this.power;

        // 爆発エフェクト発生
        if (v.life <= 0) {
          for (let i = 0; i < this.explosionArray.length; i++) {
            if (!this.explosionArray[i].life) {
              this.explosionArray[i].set(v.position.x, v.position.y);
              break;
            }
          }

          if (v instanceof Enemy) {
            gameScore = Math.min(gameScore + 100, 99999);
          }
        }

        this.life = 0;
      }
    });

    // 座標系を回転させてショットを描画
    this.rotationDraw();
  }
}

class Enemy extends Character {
  constructor(ctx, x, y, w, h, imagePath) {
    super(ctx, x, y, w, h, 0, imagePath);

    this.type = 'default';
    this.frame = 0;
    this.speed = 3;
    this.life = 0;
    this.shotArray = null;
  }

  set(x, y, life = 1, type = 'default') {
    this.position.set(x, y);
    this.life = life;
    this.type = type;
    this.frame = 0;
  }

  setShotArray(shotArray) {
    this.shotArray = shotArray;
  }

  fire(vx = 0.0, vy = 1.0) {
    for (let i = 0; i < this.shotArray.length; i++) {
      if (this.shotArray[i].life <= 0) {
        this.shotArray[i].set(this.position.x, this.position.y);
        this.shotArray[i].setSpeed(5.0);
        this.shotArray[i].setVector(vx, vy);
        break;
      } 
    }
  }

  update() {
    if (this.life <= 0) return;

    switch (this.type) {
      case 'default':
      default:
        // 配置後50フレームでショット
        if (this.frame === 50) {
          this.fire();
        }

        this.position.x += this.vector.x * this.speed;
        this.position.y += this.vector.y * this.speed;
    
        if (this.position.y - this.height > this.ctx.canvas.height) this.life = 0;

        break;
    }

    this.draw();
    ++this.frame;
  }
}

class Explosion {
  constructor(ctx, radius, count, size, timeRange, color = '#ff1166') {
    this.ctx = ctx;
    this.life = false;
    this.color = color;
    this.position = null;
    this.radius = radius;
    this.count = count;
    this.startTime = 0;
    this.timeRange = timeRange;
    this.fireBaseSize = size;
    this.fireSize = [];
    this.firePosition = [];
    this.fireVector = [];
  }

  set(x, y) {
    for (let i = 0; i < this.count; i++) {
      this.firePosition[i] = new Position(x, y);
      let vr = Math.random() * Math.PI * 2.0;
      let s = Math.sin(vr);
      let c = Math.cos(vr);
      let mr = Math.random();
      this.fireVector[i] = new Position(c * mr, s * mr);
      this.fireSize[i] = (Math.random() * 0.5 + 0.5) * this.fireBaseSize;
    }
    this.life = true;
    this.startTime = Date.now();
  }

  update() {
    // ライフがない場合処理しない
    if (!this.life) return;

    this.ctx.fillStyle = this.color;
    this.ctx.globalAlpha = 0.5;

    // 爆発発生からの経過時間
    let time = (Date.now() - this.startTime) / 1000;
    // 爆発終了までの時間で正規化して、進捗度合いを算出
    let ease = simpleEaseIn(1.0 - Math.min(time / this.timeRange, 1.0));
    let progress = 1.0 - ease;

    for (let i = 0; i < this.firePosition.length; i++) {
      let d = this.radius * progress;

      let x = this.firePosition[i].x + this.fireVector[i].x * d;
      let y = this.firePosition[i].y + this.fireVector[i].y * d;

      let s = 1.0 - progress;

      this.ctx.fillRect(
        x - (this.fireSize[i] * s) / 2,
        y - (this.fireSize[i] * s) / 2,
        this.fireSize[i] * s,
        this.fireSize[i] * s,
      );
    }

    if (progress >= 1.0) this.life = false;
  }
}

function simpleEaseIn(t) {
  return t * t * t * t;
}
