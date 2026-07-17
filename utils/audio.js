const MUTED_KEY = 'audio_muted';

const SOUND_FILES = {
  click: 'audio/click.wav',
  correct: 'audio/correct.wav',
  wrong: 'audio/wrong.wav',
  countdown: 'audio/countdown.wav',
  complete: 'audio/complete.wav',
  breatheIn: 'audio/breathe_in.wav',
  breatheOut: 'audio/breathe_out.wav'
};

const LETTER_FILES = {};
'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => {
  LETTER_FILES[letter] = `audio/letters/${letter}.wav`;
});

class AudioManager {
  constructor() {
    this.muted = false;
    this.contexts = {};
    this.letterContexts = {};
    this.loaded = false;

    try {
      const muted = wx.getStorageSync(MUTED_KEY);
      this.muted = muted === true;
    } catch (e) {
      this.muted = false;
    }
  }

  preload() {
    Object.keys(SOUND_FILES).forEach(key => {
      const ctx = wx.createInnerAudioContext();
      ctx.src = SOUND_FILES[key];
      ctx.onEnded(() => { ctx.seek(0); });
      ctx.onError((err) => {
        console.warn(`[Audio] ${key} 加载失败:`, err);
      });
      this.contexts[key] = ctx;
    });

    Object.keys(LETTER_FILES).forEach(letter => {
      const ctx = wx.createInnerAudioContext();
      ctx.src = LETTER_FILES[letter];
      ctx.onEnded(() => { ctx.seek(0); });
      ctx.onError((err) => {
        console.warn(`[Audio] letter ${letter} 加载失败:`, err);
      });
      this.letterContexts[letter] = ctx;
    });

    this.loaded = true;
  }

  _play(context) {
    if (this.muted || !context) return;
    try {
      context.stop();
      context.seek(0);
      context.play();
    } catch (e) {
      console.warn('[Audio] 播放失败:', e);
    }
  }

  playTap() { this._play(this.contexts.click); }
  playSuccess() { this._play(this.contexts.correct); }
  playFail() { this._play(this.contexts.wrong); }
  playTick() { this._play(this.contexts.countdown); }
  playComplete() { this._play(this.contexts.complete); }
  playBreatheIn() { this._play(this.contexts.breatheIn); }
  playBreatheOut() { this._play(this.contexts.breatheOut); }

  playLetter(letter) {
    const upper = (letter || '').toUpperCase();
    const ctx = this.letterContexts[upper];
    if (ctx) this._play(ctx);
  }

  setMuted(muted) {
    this.muted = muted;
    try {
      wx.setStorageSync(MUTED_KEY, muted);
    } catch (e) {
      console.warn('[Audio] 保存静音状态失败:', e);
    }
    if (muted) this.stopAll();
  }

  isMuted() { return this.muted; }

  stopAll() {
    Object.values(this.contexts).forEach(ctx => {
      try { ctx.stop(); } catch (e) { /* ignore */ }
    });
    Object.values(this.letterContexts).forEach(ctx => {
      try { ctx.stop(); } catch (e) { /* ignore */ }
    });
  }

  destroy() {
    this.stopAll();
    Object.values(this.contexts).forEach(ctx => {
      try { ctx.destroy(); } catch (e) { /* ignore */ }
    });
    Object.values(this.letterContexts).forEach(ctx => {
      try { ctx.destroy(); } catch (e) { /* ignore */ }
    });
    this.contexts = {};
    this.letterContexts = {};
  }
}

module.exports = AudioManager;
