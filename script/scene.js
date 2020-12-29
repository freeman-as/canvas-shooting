class SceneManager {
  constructor() {
    // 
    this.scene = {};

    this.activeScene = null;

    // アクティブになった時のタイムスタンプ
    this.startTime = null;

    // アクティブになってからの実行回数
    this.frame = null;
  }

  add(name, updateFunction) {
    console.log(name);
    this.scene[name] = updateFunction;
  }

  use(name) {
    console.log(name);
    // 指定したシーンがなければ処理しない
    if (!this.scene.hasOwnProperty(name)) return;

    // アクティブシーン設定
    this.activeScene = this.scene[name];
    // タイムスタンプ初期化
    this.startTime = Date.now();
    // カウンターリセット
    this.frame = -1;
  }

  update() {
    let activeTime = (Date.now() - this.startTime) / 1000;

    this.activeScene(activeTime);

    ++this.frame;
  }
}