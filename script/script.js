(() => {
  const CANVAS_WIDTH = 640;
  const CANVAS_HEIGHT = 480;
  const PLAYER_IMAGE = './image/viper.png';
  const BG_COLOR = '#eeeeee';
  let util, canvas, ctx, image;
  let startTime = null;
  let playerX = CANVAS_HEIGHT / 2;
  let playerY = CANVAS_HEIGHT / 2;

  
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
  }
  
  function render() {
    // 描画の度に塗りつぶす
    util.drawRect(0, 0, canvas.width, canvas.height, BG_COLOR);

    // 現在までの経過時間をミリ秒を秒に変換
    let nowTime = (Date.now() - startTime) / 1000;

    let s = Math.sin(nowTime);
    let x = s * 100.0;
    ctx.drawImage(image, playerX, playerY);

    requestAnimationFrame(render);
  }

  function eventSetting() {
    window.addEventListener('keydown', (event) => {
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
