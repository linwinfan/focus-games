/**
 * 高精度计时器
 * 使用 Date.now() 而非 setInterval 累计，避免漂移
 */
class Timer {
  constructor() {
    this.startTime = 0;
    this.elapsed = 0;
    this.running = false;
  }

  start() {
    if (this.running) return;
    this.startTime = Date.now();
    this.running = true;
  }

  /**
   * 暂停并返回当前经过的毫秒数
   */
  pause() {
    if (!this.running) return this.elapsed;
    this.elapsed += Date.now() - this.startTime;
    this.running = false;
    return this.elapsed;
  }

  /**
   * 恢复计时
   */
  resume() {
    if (this.running) return;
    this.startTime = Date.now();
    this.running = true;
  }

  /**
   * 停止并重置
   */
  reset() {
    this.startTime = 0;
    this.elapsed = 0;
    this.running = false;
  }

  /**
   * 获取当前经过的毫秒数（不停止）
   */
  getElapsed() {
    if (this.running) {
      return this.elapsed + (Date.now() - this.startTime);
    }
    return this.elapsed;
  }

  /**
   * 格式化为秒（保留 2 位小数）
   */
  getElapsedSeconds() {
    return Math.round(this.getElapsed()) / 1000;
  }

  /**
   * 格式化为 mm:ss.d
   */
  getFormatted() {
    const totalMs = this.getElapsed();
    const totalSec = Math.floor(totalMs / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    const tenths = Math.floor((totalMs % 1000) / 100);
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${tenths}`;
  }

  isRunning() {
    return this.running;
  }
}

/**
 * 倒计时器
 */
class CountdownTimer {
  constructor(durationMs, onTick, onComplete) {
    this.duration = durationMs;
    this.remaining = durationMs;
    this.onTick = onTick || (() => {});
    this.onComplete = onComplete || (() => {});
    this.intervalId = null;
    this.running = false;
  }

  start() {
    if (this.running) return;
    this.running = true;
    const endTime = Date.now() + this.remaining;

    this.intervalId = setInterval(() => {
      this.remaining = endTime - Date.now();
      if (this.remaining <= 0) {
        this.remaining = 0;
        this.stop();
        this.onTick(0);
        this.onComplete();
        return;
      }
      this.onTick(this.remaining);
    }, 100);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.running = false;
  }

  reset(durationMs) {
    this.stop();
    this.remaining = durationMs || this.duration;
  }

  getRemaining() {
    return this.remaining;
  }

  getRemainingSeconds() {
    return Math.ceil(this.remaining / 1000);
  }
}

module.exports = { Timer, CountdownTimer };
