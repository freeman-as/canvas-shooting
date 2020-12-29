class Position {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  set(x, y) {
    if (x != null) this.x = x;
    if (y != null) this.y = y;
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
    super(ctx, x, y, w, h, 0, imagePath);

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
    this.life = 0;
    this.vector = new Position(0.0, -1.0);
  }

  set(x, y) {
    this.position.set(x, y);
    this.life = 1;
  }

  update() {
    // ライフなければ更新しない
    if (this.life <= 0) return;
    // 画面外なら更新しない
    if (this.position.y + this.height < 0) this.life = 0;

    this.position.x += this.vector.x * this.speed;
    this.position.y += this.vector.y * this.speed;

    // ショットの描画
    this.rotationDraw();
  }
}

class Enemy extends Character {
  constructor(ctx, x, y, w, h, imagePath) {
    super(ctx, x, y, w, h, 0, imagePath);

    this.speed = 3;
    this.life = 0;
    this.vector = new Position(0.0, 1.0);
  }

  set(x, y, life = 1) {
    this.position.set(x, y);
    this.life = life;
  }

  update() {
    if (this.life <= 0) return;
    if (this.position.y - this.height > this.ctx.canvas.height) this.life = 0;

    this.position.x += this.vector.x * this.speed;
    this.position.y += this.vector.y * this.speed;

    this.draw();
  }
}
