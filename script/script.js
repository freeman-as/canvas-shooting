(() => {
  window.isKeyDown = {};

  const CANVAS_WIDTH = 640;
  const CANVAS_HEIGHT = 480;
  const PLAYER_IMAGE_PATH = './image/viper.png';
  const SHOT_IMAGE_PATH = './image/viper_shot.png';
  const BG_COLOR = '#eeeeee';
  const SHOT_MAX_COUNT = 10;

  let util, canvas, ctx, image;
  let startTime = null;
  const PLAYER_START_Y = CANVAS_HEIGHT - 100;

  let player = null;
  let shotArray = [];

  
  window.addEventListener('load', () => {
    const canvasElem = document.getElementById('main_canvas');
    util = new Canvas2DUtility(canvasElem);
    canvas = util.canvas;
    ctx = util.context;
  
    // 初期化処理
    initialize();
    // インスタンスの状態確認
    loadCheck();
  }, false);
  
  function initialize() {
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // プレイヤー初期化
    player = new Player(ctx, 0, 0, 64, 64, PLAYER_IMAGE_PATH);

    // 登場演出
    player.setComing(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT + 50,
      CANVAS_WIDTH / 2,
      PLAYER_START_Y
    );

    // ショット初期化
    for (let i = 0; i < SHOT_MAX_COUNT; i++) {
      shotArray[i] = new Shot(ctx, 0, 0, 32, 32, SHOT_IMAGE_PATH)
    }
    player.setShotArray(shotArray);
  }
  
  /**
   * インスタンスの準備が完了しているか確認する
   */
  function loadCheck() {
    let ready = true;
    let checkCount = 0;

    ready = ready && player.ready;

    shotArray.map(v => {
      ready = ready && v.ready;
    });

    if (ready) {
      eventSetting();
      startTime = Date.now();
      render();
    } else {
      setTimeout(() => {
        // console.log(`checkCount: ${++checkCount}`);
        loadCheck();
      }, 100);
    }
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
    // ショットの状態を更新
    shotArray.map(v => v.update());

    requestAnimationFrame(render);
  }

})();
