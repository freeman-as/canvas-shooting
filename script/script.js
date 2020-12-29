(() => {
  const CANVAS_WIDTH = 640;
  const CANVAS_HEIGHT = 480;
  const PLAYER_IMAGE = './image/viper.png';
  const BG_COLOR = '#eeeeee';
  let util, canvas, ctx, image;
  let startTime = null;
  const PLAYER_START_Y = CANVAS_HEIGHT - 100;

  let player = null;

  
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

    player = new Player(ctx, 0, 0, 64, 64, image);

    player.setComing(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT,
      CANVAS_WIDTH / 2,
      PLAYER_START_Y
    );
  }
  
  function render() {
    ctx.globalAlpha = 1.0;
    // 描画の度に塗りつぶす
    util.drawRect(0, 0, canvas.width, canvas.height, BG_COLOR);
    // 現在までの経過時間
    let nowTime = (Date.now() - startTime) / 1000;

    // プレイヤーの状態を更新
    player.update();

    requestAnimationFrame(render);
  }

  function eventSetting() {
    window.addEventListener('keydown', (event) => {
      if (player.isComing) return;

      switch (event.key) {
        case 'ArrowLeft':
          player.position.x -= 10;
          break;
        case 'ArrowRight':
          player.position.x += 10;
          break;
        case 'ArrowUp':
          player.position.y -= 10;
          break;
        case 'ArrowDown':
          player.position.y += 10;
          break;
      }

    }, false);
  }
})();
