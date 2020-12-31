(() => {
  window.isKeyDown = {};
  window.gameScore = 0;

  const CANVAS_WIDTH = 640;
  const CANVAS_HEIGHT = 480;
  const PLAYER_IMAGE_PATH = './image/viper.png';
  const PLAYER_START_Y = CANVAS_HEIGHT - 100;
  const SHOT_IMAGE_PATH = './image/viper_shot.png';
  const SINGLE_SHOT_IMAGE_PATH = './image/viper_single_shot.png';
  const ENEMY_SMALL_IMAGE_PATH = './image/enemy_small.png';
  const ENEMY_LARGE_IMAGE_PATH = './image/enemy_large.png';
  const ENEMY_SHOT_IMAGE_PATH = './image/enemy_shot.png';
  const BG_COLOR = '#111122';
  const SHOT_MAX_COUNT = 10;
  const ENEMY_SMALL_MAX_COUNT = 20;
  const ENEMY_LARGE_MAX_COUNT = 5;
  const ENEMY_SHOT_MAX_COUNT = 50;
  const EXPLOSION_MAX_COUNT = 10;
  const BACKGROUND_STAR_MAX_COUNT = 100;
  const BACKGROUND_STAR_MAX_SZIE = 3;
  const BACKGROUND_STAR_MAX_SPEED = 4;

  let util, canvas, ctx;
  let scene = null;
  let startTime = null;

  let player = null;
  let shotArray = [];
  let singleShotArray = [];

  let enemyArray = [];
  let enemyShotArray = [];

  let explosionArray = [];

  let backgroundStarArray = [];

  let restart = false;

  let button = document.querySelector('#start_button');

  button.addEventListener('click', () => {
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

    // 敵キャラクター(小)初期化
    for (i = 0; i < ENEMY_SMALL_MAX_COUNT; i++) {
      enemyArray[i] = new Enemy(ctx, 0, 0, 48, 48, ENEMY_SMALL_IMAGE_PATH);
      // 敵キャラクターは全て同じショットを共有する
      enemyArray[i].setShotArray(enemyShotArray);
      enemyArray[i].setAttackTarget(player);
    }

    // 敵キャラクター(大)初期化
    for (i = 0; i < ENEMY_LARGE_MAX_COUNT; i++) {
      enemyArray[ENEMY_SMALL_MAX_COUNT + i] = new Enemy(ctx, 0, 0, 64, 64, ENEMY_LARGE_IMAGE_PATH);
      // 敵キャラクターは全て同じショットを共有する
      enemyArray[ENEMY_SMALL_MAX_COUNT + i].setShotArray(enemyShotArray);
      enemyArray[ENEMY_SMALL_MAX_COUNT + i].setAttackTarget(player);
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

    for (i = 0; i < BACKGROUND_STAR_MAX_COUNT; i++) {
      let size = 1 + Math.random() * (BACKGROUND_STAR_MAX_SZIE - 1);
      let speed = 1 + Math.random() * (BACKGROUND_STAR_MAX_SPEED - 1);

      backgroundStarArray[i] = new BackgroundStar(ctx, size, speed);
      let x = Math.random() * CANVAS_WIDTH;
      let y = Math.random() * CANVAS_HEIGHT;
      backgroundStarArray[i].set(x, y);
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
      if(time > 3.0) {
        scene.use('invade_default_type');
      }
    });

    scene.add('invade_default_type', (time) => {
      if (scene.frame % 30 === 0) {
        for (i = 0; i < ENEMY_SMALL_MAX_COUNT; i++) {
          if (enemyArray[i].life <= 0) {
            let e = enemyArray[i];

            if (scene.frame % 60 === 0) {
              e.set(-e.width, 30, 2, 'default');
              e.setVectorFromAngle(degreesToRadians(30));
            } else {
              e.set(CANVAS_WIDTH + e.width, 30, 2, 'default');
              e.setVectorFromAngle(degreesToRadians(150));
            }
            break;
          }
        }
      };

      if (scene.frame === 270) scene.use('blank');
      if (player.life <= 0) scene.use('gameover');
    });

    scene.add('blank', (time) => {
      if (scene.frame === 150) {
        scene.use('invade_wave_move_type');
      }

      if (player.life <= 0) {
        scene.use('gameover');
      }
    });

    scene.add('invade_wave_move_type', (time) => {
      if (scene.frame % 50 === 0) {
        for (i = 0; i < ENEMY_SMALL_MAX_COUNT; i++) {
          if (enemyArray[i].life <= 0) {
            let e = enemyArray[i];

            if (scene.frame <= 200) {
              e.set(CANVAS_WIDTH * 0.2, -e.height, 2, 'wave');
            } else {
              e.set(CANVAS_WIDTH * 0.8, -e.height, 2, 'wave');
            }
            break;
          }
        }
      };

      if (scene.frame === 450) scene.use('invade_large_type');
      if (player.life <= 0) scene.use('gameover');
    });

    scene.add('invade_large_type', (time) => {
      if (scene.frame === 100) {
        let i = ENEMY_SMALL_MAX_COUNT + ENEMY_LARGE_MAX_COUNT;
        for (let j = ENEMY_SMALL_MAX_COUNT; j < i; j++) {
          if (enemyArray[j].life <= 0) {
            let e = enemyArray[j];
            e.set(CANVAS_WIDTH / 2, -e.height, 50, 'large');
            break;
          }
        }
      };

      if (player.life <= 0) scene.use('gameover');
    });

    scene.add('gameover', (time) => {
      let textWidth = CANVAS_WIDTH / 2;
      let loopWidth = CANVAS_WIDTH + textWidth;
      let x = CANVAS_WIDTH - (scene.frame * 2) % loopWidth;
      ctx.font = 'bold 72px sans-serif';
      util.drawText('GAME OVER', x, CANVAS_HEIGHT / 2, '#ff0000', textWidth);
      if (restart) {
        restart = false;
        gameScore = 0;
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

    backgroundStarArray.map(v => v.update());

    // プレイヤーの状態を更新
    player.update();

    enemyArray.map(v => v.update());

    // ショットの状態を更新
    shotArray.map(v => v.update());
    singleShotArray.map(v => v.update());
    enemyShotArray.map(v => v.update());

    explosionArray.map(v => v.update());

    ctx.font = 'bold 24px monospace';
    util.drawText(zeroPadding(gameScore, 5), 30, 50, '#111111');

    requestAnimationFrame(render);
  }

  function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  function zeroPadding(number, count) {
    let zeroArray = new Array(count);
    let zeroString = zeroArray.join('0') + number;
    // 文字列の後ろから桁数分抽出
    return zeroString.slice(-count);
  }

})();
