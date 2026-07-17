#!/usr/bin/env node
/**
 * 音效文件生成脚本
 * 使用纯 Node.js 生成 WAV 格式音频，无需外部依赖
 *
 * 运行: node scripts/generate-audio.js
 * 输出: audio/ 目录下生成所有音效文件
 */

const fs = require('fs');
const path = require('path');

// ===== WAV 文件生成工具 =====

function createWavBuffer(samples, sampleRate = 22050) {
  const numSamples = samples.length;
  const buffer = Buffer.alloc(44 + numSamples * 2);

  // WAV header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);       // chunk size
  buffer.writeUInt16LE(1, 20);        // PCM
  buffer.writeUInt16LE(1, 22);        // mono
  buffer.writeUInt32LE(sampleRate, 24); // sample rate
  buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32);        // block align
  buffer.writeUInt16LE(16, 34);       // bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  // Write samples
  for (let i = 0; i < numSamples; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(sample * 32767), 44 + i * 2);
  }

  return buffer;
}

// ===== 波形生成器 =====

function generateTone(freq, duration, type = 'sine', volume = 0.5, sampleRate = 22050) {
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let val = 0;

    // 包络（避免爆音）
    const attackTime = 0.005;
    const releaseTime = 0.01;
    let envelope = 1;
    if (t < attackTime) envelope = t / attackTime;
    else if (t > duration - releaseTime) envelope = (duration - t) / releaseTime;

    switch (type) {
      case 'sine':
        val = Math.sin(2 * Math.PI * freq * t);
        break;
      case 'square':
        val = Math.sin(2 * Math.PI * freq * t) > 0 ? 1 : -1;
        break;
      case 'triangle':
        val = 2 * Math.abs(2 * (freq * t - Math.floor(freq * t + 0.5))) - 1;
        break;
      case 'sawtooth':
        val = 2 * (freq * t - Math.floor(freq * t + 0.5));
        break;
    }

    samples[i] = val * volume * envelope;
  }

  return samples;
}

function generateNoise(duration, volume = 0.3, sampleRate = 22050) {
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const envelope = t < 0.005 ? t / 0.005 : (t > duration - 0.01 ? (duration - t) / 0.01 : 1);
    samples[i] = (Math.random() * 2 - 1) * volume * envelope;
  }

  return samples;
}

function generateChime(freqs, duration, sampleRate = 22050) {
  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  const segmentDuration = duration / freqs.length;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const segIndex = Math.min(Math.floor(t / segmentDuration), freqs.length - 1);
    const segT = t - segIndex * segmentDuration;

    const envelope = Math.exp(-3 * segT / segmentDuration);
    samples[i] = Math.sin(2 * Math.PI * freqs[segIndex] * segT) * 0.4 * envelope;
  }

  return samples;
}

// ===== 音效定义 =====

const AUDIO_DIR = path.join(__dirname, '..', 'audio');
const LETTERS_DIR = path.join(AUDIO_DIR, 'letters');

// 确保目录存在
if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });
if (!fs.existsSync(LETTERS_DIR)) fs.mkdirSync(LETTERS_DIR, { recursive: true });

function saveWav(filename, samples, sampleRate = 22050) {
  const buffer = createWavBuffer(samples, sampleRate);
  const filepath = path.join(path.dirname(AUDIO_DIR), filename);
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filepath, buffer);
  console.log(`  已生成: ${filepath}`);
}

console.log('开始生成音效文件...\n');

// 1. 点击音 - 短促的"哒"声
console.log('1. 点击音 (click.wav)');
saveWav('audio/click.wav', generateTone(800, 0.08, 'sine', 0.5));

// 2. 正确音 - 愉快的升调
console.log('2. 正确音 (correct.wav)');
saveWav('audio/correct.wav', generateChime([523, 659, 784], 0.3));

// 3. 错误音 - 低沉的警告音
console.log('3. 错误音 (wrong.wav)');
saveWav('audio/wrong.wav', generateChime([330, 247], 0.4));

// 4. 倒计时滴答
console.log('4. 倒计时音 (countdown.wav)');
saveWav('audio/countdown.wav', generateTone(1000, 0.15, 'sine', 0.4));

// 5. 完成音 - 胜利和弦
console.log('5. 完成音 (complete.wav)');
saveWav('audio/complete.wav', generateChime([523, 659, 784, 1047], 0.6));

// 6. 吸气音 - 上升的呼气声
console.log('6. 吸气音 (breathe_in.wav)');
{
  const numSamples = Math.floor(22050 * 4);
  const samples = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / 22050;
    const freq = 200 + 300 * (t / 4); // 频率上升
    const envelope = Math.sin(Math.PI * t / 4);
    samples[i] = (Math.sin(2 * Math.PI * freq * t) * 0.2 + (Math.random() * 2 - 1) * 0.05) * envelope;
  }
  saveWav('audio/breathe_in.wav', samples);
}

// 7. 呼气音 - 下降的呼气声
console.log('7. 呼气音 (breathe_out.wav)');
{
  const numSamples = Math.floor(22050 * 4);
  const samples = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / 22050;
    const freq = 500 - 300 * (t / 4); // 频率下降
    const envelope = Math.sin(Math.PI * t / 4);
    samples[i] = (Math.sin(2 * Math.PI * freq * t) * 0.2 + (Math.random() * 2 - 1) * 0.05) * envelope;
  }
  saveWav('audio/breathe_out.wav', samples);
}

// 8. 字母朗读 A-Z
console.log('8. 字母朗读 (letter_A.wav ~ letter_Z.wav)');
const LETTER_FREQS = {
  A: 440, B: 494, C: 523, D: 587, E: 659, F: 698, G: 784,
  H: 880, I: 988, J: 1047, K: 523, L: 587, M: 659, N: 698,
  O: 784, P: 880, Q: 988, R: 1047, S: 523, T: 587, U: 659,
  V: 698, W: 784, X: 880, Y: 988, Z: 1047
};

'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => {
  const freq = LETTER_FREQS[letter];
  const samples = generateTone(freq, 0.4, 'sine', 0.4);
  saveWav(`audio/letters/${letter}.wav`, samples);
});

console.log('\n所有音效文件生成完成!');
console.log(`- 通用音效: audio/ 目录`);
console.log(`- 字母朗读: audio/letters/ 目录`);
console.log(`\n使用时将 utils/audio.js 中的 CDN 路径替换为本地路径: audio/xxx.wav`);
