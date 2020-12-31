class Sound {
  constructor() {
    this.ctx = new AudioContext();
    this.source = null;
  }

  load(audioPath, callback) {
    fetch(audioPath)
    .then((response) => {
      // ロード完了後、AudioBuffer生成用データを取り出す
      return response.arrayBuffer();
    })
    .then((buffer) => {
      // AudioBuffer生成
      return this.ctx.decodeAudioData(buffer);
    })
    .then((decodeAudio) => {
      this.source = decodeAudio;
      callback();
    })
    .catch(() => {
      callback('error');
    });
  }

  play() {
    // ノード生成
    let node = new AudioBufferSourceNode(this.ctx, { buffer: this.source });
    // ノードを接続
    node.connect(this.ctx.destination);
    // ノード再生完了後の解放処理
    node.addEventListener('ended', () => {
      // 念のためstop
      node.stop();
      // 接続解除
      node.disconnect();
      // ガベージコレクタが開放するようにnullでリセット
      node = null;
    }, false);

    // ノードの再生開始
    node.start();
  }
}