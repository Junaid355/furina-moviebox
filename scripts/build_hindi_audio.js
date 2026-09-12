import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9892;
const USER_DATA_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\scratch\\edge-audio-builder-real';

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
function httpGetJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

function writeWavHeader(sampleRate, numChannels, numFrames) {
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numFrames * blockAlign;
  const buffer = Buffer.alloc(44);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bytesPerSample * 8, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  return buffer;
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }

  async waitForOpen() {
    if (this.ws.readyState === WebSocket.OPEN) return;
    return new Promise((resolve) => { this.ws.onopen = () => resolve(); });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true
    });
    if (res.exceptionDetails) throw new Error(JSON.stringify(res.exceptionDetails));
    return res.result?.value;
  }

  close() { try { this.ws.close(); } catch (e) {} }
}

async function fetchAudioChunk(startByte, endByte, fallbackPath) {
  if (fs.existsSync(fallbackPath)) {
    return fs.readFileSync(fallbackPath);
  }
  const res = await fetch('https://archive.org/download/sholay-1975/SHOLAY%201975.mp3', {
    headers: { 'Range': `bytes=${startByte}-${endByte}` }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching Sholay master chunk`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(fallbackPath, buf);
  return buf;
}

export async function buildAuthenticHindiAudio() {
  console.log('--- Building Authentic Cinematic Hindi Movie Audio ---');

  const introPath = path.resolve('scripts/sholay_chunk.mp3');
  const dialoguePath = path.resolve('scripts/chunk_gabbar.mp3');

  const introBuf = await fetchAudioChunk(0, 2097152, introPath);
  const dialogueBuf = await fetchAudioChunk(56 * 1024 * 1024, 56 * 1024 * 1024 + 2097152, dialoguePath);

  console.log('1. Launching Headless Edge to process & normalize master cinema audio...');
  const edgeProc = spawn(EDGE_PATH, [
    '--headless',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    'about:blank'
  ]);
  await sleep(1500);
  const tabs = await httpGetJson(`http://127.0.0.1:${PORT}/json/list`);
  const client = new CDPClient(tabs[0].webSocketDebuggerUrl);
  await client.waitForOpen();

  const b64Intro = introBuf.toString('base64');
  const b64Dialogue = dialogueBuf.toString('base64');

  const result = await client.eval(`
    (async () => {
      function b64ToBytes(b64) {
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return bytes;
      }

      const introBytes = b64ToBytes("${b64Intro}");
      const dialogueBytes = b64ToBytes("${b64Dialogue}");

      const ctx = new OfflineAudioContext(1, 44100 * 60, 44100);
      const [introAudio, dialogueAudio] = await Promise.all([
        ctx.decodeAudioData(introBytes.buffer),
        ctx.decodeAudioData(dialogueBytes.buffer)
      ]);

      const introData = introAudio.getChannelData(0);
      const dialogueData = dialogueAudio.getChannelData(0);

      const sampleRate = 44100;
      const introSamples = Math.floor(sampleRate * 8.0);
      const fadeSamples = Math.floor(sampleRate * 1.5);
      const dialogueSamples = Math.floor(sampleRate * 32.0);

      const totalSamples = introSamples + dialogueSamples;
      const mixed = new Float32Array(totalSamples);

      for (let i = 0; i < introSamples; i++) {
        let gain = 1.0;
        if (i > introSamples - fadeSamples) {
          gain = (introSamples - i) / fadeSamples;
        }
        mixed[i] = (introData[i] || 0) * gain * 0.85;
      }

      const dialogueStart = introSamples - fadeSamples;
      for (let i = 0; i < dialogueSamples; i++) {
        let gain = 1.0;
        if (i < fadeSamples) {
          gain = i / fadeSamples;
        } else if (i > dialogueSamples - Math.floor(sampleRate * 2)) {
          const endFade = Math.floor(sampleRate * 2);
          gain = (dialogueSamples - i) / endFade;
        }
        mixed[dialogueStart + i] += (dialogueData[i] || 0) * gain;
      }

      let peak = 0;
      for (let i = 0; i < totalSamples; i++) {
        const abs = Math.abs(mixed[i]);
        if (abs > peak) peak = abs;
      }
      const targetPeak = 0.89;
      const normFactor = peak > 0 ? (targetPeak / peak) : 1;
      for (let i = 0; i < totalSamples; i++) {
        mixed[i] = Math.max(-1, Math.min(1, mixed[i] * normFactor));
      }

      const pcm16 = new Int16Array(totalSamples);
      for (let i = 0; i < totalSamples; i++) {
        const s = mixed[i];
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }

      const u8 = new Uint8Array(pcm16.buffer);
      let str = '';
      const chunk = 8192;
      for (let j = 0; j < u8.length; j += chunk) {
        str += String.fromCharCode.apply(null, u8.subarray(j, Math.min(j + chunk, u8.length)));
      }

      return {
        sampleRate,
        totalSamples,
        duration: totalSamples / sampleRate,
        peak: (peak * normFactor).toFixed(3),
        b64pcm: btoa(str)
      };
    })()
  `);

  console.log(`2. Cinema Master Audio Generated: ${result.duration.toFixed(2)}s, Peak: ${result.peak}`);
  const pcmBuf = Buffer.from(result.b64pcm, 'base64');
  const wavHeader = writeWavHeader(result.sampleRate, 1, result.totalSamples);
  const fullWav = Buffer.concat([wavHeader, pcmBuf]);

  const pubPath = path.resolve('public/media/hindi_audio.wav');
  const distPath = path.resolve('dist/media/hindi_audio.wav');

  fs.writeFileSync(pubPath, fullWav);
  console.log(`✓ Written ${pubPath} (${fullWav.length} bytes)`);

  if (fs.existsSync(path.dirname(distPath))) {
    fs.writeFileSync(distPath, fullWav);
    console.log(`✓ Written ${distPath} (${fullWav.length} bytes)`);
  }

  client.close();
  edgeProc.kill();
  try { fs.rmSync(USER_DATA_DIR, { recursive: true, force: true }); } catch (e) {}
  console.log('🎉 Genuine Authentic Hindi Movie Dialogue Audio successfully built!');
}

buildAuthenticHindiAudio().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
