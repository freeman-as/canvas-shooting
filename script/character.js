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
  constructor(ctx, x, y, w, h, life, image) {
    this.ctx = ctx;
    this.position = new Position(x, y);
    this.width = w;
    this.height = h;
    this.life = life;
    this.image = image;
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
}

class Player extends Character {
  constructor(ctx, x, y, w, h, image) {
    super(ctx, x, y, w, h, 0, image);

    // 自機が登場中かどうかのフラグ
    this.isComing = false;
    // 登場演出を開始した際のタイムスタンプ
    this.comingStart = null;
    this.comingEndPosition = null;
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
    }

    this.draw();

    // 念のためグローバルなアルファの状態に戻す
    this.ctx.globalAlpha = 1.0;
  }

  setComing(startX, startY, endX, endY) {
    this.isComing = true;
    this.comingStart = Date.now();
    this.position.set(startX, startY);
    this.comingStartPosition = new Position(startX, startY);
    this.comingEndPosition = new Position(endX, endY);
  }
}
