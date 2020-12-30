(() => {
  window.isKeyDown = {};

  const CANVAS_WIDTH = 640;
  const CANVAS_HEIGHT = 480;
  const PLAYER_IMAGE_PATH = './image/viper.png';
  const PLAYER_START_Y = CANVAS_HEIGHT - 100;
  const SHOT_IMAGE_PATH = './image/viper_shot.png';
  const SINGLE_SHOT_IMAGE_PATH = './image/viper_single_shot.png';
  const ENEMY_IMAGE_PATH = './image/enemy_small.png';
  const ENEMY_SHOT_IMAGE_PATH = './image/enemy_shot.png';
  const BG_COLOR = '#eeeeee';
  const SHOT_MAX_COUNT = 10;
  const ENEMY_MAX_COUNT = 10;
  const ENEMY_SHOT_MAX_COUNT = 50;
  const EXPLOSION_MAX_COUNT = 10;

  let util, canvas, ctx;
  let scene = null;
  let startTime = null;

  let player = null;
  let shotArray = [];
  let singleShotArray = [];

  let enemyArray = [];
  let enemyShotArray = [];

  let explosionArray = [];

  let restart = false;

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
    let i;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // シーン初期化
    scene = new SceneManager();

    // 爆発エフェクト初期化
    for (i = 0; i < EXPLOSION_MAX_COUNT; i++) {
      explosionArray[i] = new Explosion(ctx, 100.0, 15, 40.0, 1.0);
    }

    // ショット初期化
    for (i = 0; i < SHOT_MAX_COUNT; i++) {
      shotArray[i] = new Shot(ctx, 0, 0, 32, 32, SHOT_IMAGE_PATH);
      singleShotArray[i * 2] = new Shot(ctx, 0, 0, 32, 32, SINGLE_SHOT_IMAGE_PATH);
      singleShotArray[i * 2 + 1] = new Shot(ctx, 0, 0, 32, 32, SINGLE_SHOT_IMAGE_PATH);
    }

    // プレイヤー初期化
    player = new Player(ctx, 0, 0, 64, 64, PLAYER_IMAGE_PATH);

    // 登場演出
    player.setComing(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT + 50,
      CANVAS_WIDTH / 2,
      PLAYER_START_Y
    );
    player.setShotArray(shotArray, singleShotArray);

    // 敵ショット初期化
    for (i = 0; i < ENEMY_SHOT_MAX_COUNT; i++) {
      enemyShotArray[i] = new Shot(ctx, 0, 0, 32, 32, ENEMY_SHOT_IMAGE_PATH);
      enemyShotArray[i].setTargets([player]);
      enemyShotArray[i].setExplosions(explosionArray);
    }

    // 敵キャラクター初期化
    for (i = 0; i < ENEMY_MAX_COUNT; i++) {
      enemyArray[i] = new Enemy(ctx, 0, 0, 48, 48, ENEMY_IMAGE_PATH);
      // 敵キャラクターは全て同じショットを共有する
      enemyArray[i].setShotArray(enemyShotArray);
    }

    // 衝突判定対象の設定
    for (i = 0; i < SHOT_MAX_COUNT; i++) {
      shotArray[i].setTargets(enemyArray);
      singleShotArray[i * 2].setTargets(enemyArray);
      singleShotArray[i * 2 + 1].setTargets(enemyArray);
      shotArray[i].setExplosions(explosionArray);
      singleShotArray[i * 2].setExplosions(explosionArray);
      singleShotArray[i * 2 + 1].setExplosions(explosionArray);
    }

  }
  
  /**
   * インスタンスの準備が完了しているか確認する
   */
  function loadCheck() {
    let ready = true;
    let checkCount = 0;

    ready = ready && player.ready;

    enemyArray.map(v => {
      ready = ready && v.ready;
    });

    shotArray.map(v => {
      ready = ready && v.ready;
    });

    singleShotArray.map(v => {
      ready = ready && v.ready;
    });

    enemyShotArray.map(v => {
      ready = ready && v.ready;
    });

    if (ready) {
      eventSetting();
      sceneSetting();
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

      if (event.key === 'Enter') {
        if (player.life <= 0) {
          restart = true;
        }
      }
    }, false);
    window.addEventListener('keyup', (event) => {
      window.isKeyDown[`key_${event.key}`] = false;
    }, false);
  }

  function sceneSetting() {
    scene.add('intro', (time) => {
      if(time > 2.0) {
        scene.use('invade');
      }
    });

    scene.add('invade', (time) => {
      if (scene.frame === 0) {
        for (i = 0; i < ENEMY_MAX_COUNT; i++) {
          if (enemyArray[i].life <= 0) {
            let e = enemyArray[i];
            e.set(CANVAS_WIDTH / 2, -e.height, 2, 'default');
            e.setVector(0.0, 1.0);
            break;
          }
        }
      };

      if (scene.frame === 100) {
        scene.use('invade');
      }

      if (player.life <= 0) {
        scene.use('gameover');
      }
    });

    scene.add('gameover', (time) => {
      let textWidth = CANVAS_WIDTH / 2;
      let loopWidth = CANVAS_WIDTH + textWidth;
      let x = CANVAS_WIDTH - (scene.frame * 2) % loopWidth;
      ctx.font = 'bold 72px sans-serif';
      util.drawText('GAME OVER', x, CANVAS_HEIGHT / 2, '#ff0000', textWidth);
      if (restart) {
        restart = false;
        player.setComing(
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT + 50,
          CANVAS_WIDTH / 2,
          PLAYER_START_Y
        );
        scene.use('intro');
      }
    });

    scene.use('intro');
  }

  function render() {
    ctx.globalAlpha = 1.0;
    // 描画の度に塗りつぶす
    util.drawRect(0, 0, canvas.width, canvas.height, BG_COLOR);
    // 現在までの経過時間
    let nowTime = (Date.now() - startTime) / 1000;

    scene.update();

    // プレイヤーの状態を更新
    player.update();
    // ショットの状態を更新
    shotArray.map(v => v.update());
    singleShotArray.map(v => v.update());
    enemyArray.map(v => v.update());
    enemyShotArray.map(v => v.update());
    explosionArray.map(v => v.update());

    requestAnimationFrame(render);
  }

})();
