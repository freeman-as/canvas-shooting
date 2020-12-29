(() => {
  window.isKeyDown = {};

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
      CANVAS_HEIGHT + 50,
      CANVAS_WIDTH / 2,
      PLAYER_START_Y
    );
  }
  
  function eventSetting() {
    window.addEventListener('keydown', (event) => {
      window.isKeyDown[`key_${event.key}`] = true;
    }, false);
    window.addEventListener('keyup', (event) => {
      window.isKeyDown[`key_${event.key}`] = false;
    }, false);
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

})();
