(() => {
  const CANVAS_WIDTH = 640;
  const CANVAS_HEIGHT = 480;
  const PLAYER_IMAGE = './image/viper.png';
  const BG_COLOR = '#eeeeee';
  let util, canvas, ctx, image;
  let startTime = null;
  let playerX = CANVAS_WIDTH / 2;
  let playerY = CANVAS_HEIGHT / 2;
  const PLAYER_START_Y = CANVAS_HEIGHT - 100;
  // 自機が登場中かどうかのフラグ
  let isComing = false;
  // 登場演出を開始した際のタイムスタンプ
  let comingStart = null;

  
  window.addEventListener('load', () => {
    const canvasElem = document.getElementById('main_canvas');
    util = new Canvas2DUtility(canvasElem);
    canvas = util.canvas;
    ctx = util.context;
  
    util.imageLoader(PLAYER_IMAGE, (loadImage) => {
      image = loadImage;
      initialize();
      eventSetting();
      startTime = Date.now();
      render();
    });
  }, false);
  
  function initialize() {
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    isComing = true;
    comingStart = Date.now();
    playerY = CANVAS_HEIGHT;
  }
  
  function render() {
    ctx.globalAlpha = 1.0;

    // 描画の度に塗りつぶす
    util.drawRect(0, 0, canvas.width, canvas.height, BG_COLOR);

    if (isComing) {
      let justTime = Date.now();
      let comingTime = (justTime - comingStart) / 1000;
      playerY = CANVAS_HEIGHT - comingTime * 50;

      if (playerY <= PLAYER_START_Y) {
        isComing = false;
        playerY = PLAYER_START_Y;
      }

      if (justTime % 100 < 50) {
        ctx.globalAlpha = 0.5;
      }
    }

    // 現在までの経過時間をミリ秒を秒に変換
    // let nowTime = (Date.now() - startTime) / 1000;

    // let s = Math.sin(nowTime);
    // let x = s * 100.0;
    ctx.drawImage(image, playerX, playerY);

    requestAnimationFrame(render);
  }

  function eventSetting() {
    window.addEventListener('keydown', (event) => {
      if (isComing) return;

      switch (event.key) {
        case 'ArrowLeft':
          playerX -= 10;
          break;
        case 'ArrowRight':
          playerX += 10;
          break;
        case 'ArrowUp':
          playerY -= 10;
          break;
        case 'ArrowDown':
          playerY += 10;
          break;
      }
    }, false);
  }
})();
