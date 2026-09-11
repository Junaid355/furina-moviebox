import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9897;
const USER_DATA_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\scratch\\edge-audio-builder';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function httpGetJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
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
        if (msg.error) {
          reject(msg.error);
        } else {
          resolve(msg.result);
        }
      }
    };
  }

  async waitForOpen() {
    if (this.ws.readyState === WebSocket.OPEN) return;
    return new Promise((resolve) => {
      this.ws.onopen = () => resolve();
    });
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
    if (res.exceptionDetails) {
      throw new Error(`Eval error: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result?.value;
  }

  close() {
    try {
      this.ws.close();
    } catch (e) {}
  }
}

async function fetchMp3(text) {
  const q = encodeURIComponent(text);
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=hi&client=tw-ob&q=${q}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching TTS for "${text}"`);
  const buf = await res.arrayBuffer();
  return Buffer.from(buf);
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

async function main() {
  console.log('--- Building Authentic Hindi Movie Dialogue Audio ---');
  const dialogueLines = [
    { label: 'Deadpool Intro', text: 'नमस्ते दोस्तों! मैं हूँ डेडपूल! और यह है मेरा नया दोस्त वूल्वरिन! चलो भाई अब विलेन की धुलाई करते हैं!' },
    { label: 'Iron Man Endgame', text: 'और मैं... आयरन मैन हूँ! अवेंजर्स, एक साथ आओ!' },
    { label: 'Naruto Anime', text: 'मेरा नाम नारुतो उज़ुमाकी है! और मैं एक दिन सबसे बड़ा होकागे बनके दिखाऊँगा!' },
    { label: 'Sholay Classic', text: 'कितने आदमी थे? जो डर गया... समझो मर गया!' },
    { label: 'Dark Knight Joker', text: 'तुम इतने सीरियस क्यों हो? चेहरे पर एक मुस्कान लाओ!' }
  ];

  console.log('1. Fetching MP3 audio chunks from authentic Hindi TTS...');
  const mp3Buffers = [];
  for (const line of dialogueLines) {
    console.log(`   Fetching [${line.label}]: "${line.text}"`);
    const mp3 = await fetchMp3(line.text);
    mp3Buffers.push(mp3);
    await sleep(200);
  }

  console.log('2. Launching headless Edge to decode MP3 via Web Audio API...');
  const edgeProc = spawn(EDGE_PATH, [
    '--headless',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    'about:blank'
  ]);

  await sleep(1500);
  const tabs = await httpGetJson(`http://127.0.0.1:${PORT}/json/list`);
  const wsUrl = tabs[0].webSocketDebuggerUrl;
  const client = new CDPClient(wsUrl);
  await client.waitForOpen();

  console.log('3. Decoding MP3 chunks to raw PCM float samples in Edge...');
  const pcmChunks = [];
  let sampleRate = 44100;

  for (let i = 0; i < mp3Buffers.length; i++) {
    const b64 = mp3Buffers[i].toString('base64');
    const result = await client.eval(`
      (async () => {
        const binary = atob("${b64}");
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const ctx = new OfflineAudioContext(1, 44100 * 30, 44100);
        const audioBuffer = await ctx.decodeAudioData(bytes.buffer);
        const data = audioBuffer.getChannelData(0);
        const pcm16 = new Int16Array(data.length);
        for (let j = 0; j < data.length; j++) {
          const s = Math.max(-1, Math.min(1, data[j]));
          pcm16[j] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        const u8 = new Uint8Array(pcm16.buffer);
        let str = '';
        const chunk = 8192;
        for (let j = 0; j < u8.length; j += chunk) {
          str += String.fromCharCode.apply(null, u8.subarray(j, Math.min(j + chunk, u8.length)));
        }
        return {
          sampleRate: audioBuffer.sampleRate,
          samplesCount: data.length,
          b64pcm: btoa(str)
        };
      })()
    `);

    sampleRate = result.sampleRate;
    const pcmBuf = Buffer.from(result.b64pcm, 'base64');
    pcmChunks.push(pcmBuf);
    console.log(`   Decoded chunk ${i + 1}: ${result.samplesCount} samples (${(result.samplesCount / sampleRate).toFixed(2)}s)`);
  }

  client.close();
  edgeProc.kill();

  console.log('4. Concatenating with cinematic pauses...');
  const pauseSamples = Math.floor(sampleRate * 0.6);
  const pauseBuffer = Buffer.alloc(pauseSamples * 2);

  const allPcmBuffers = [];
  for (let i = 0; i < pcmChunks.length; i++) {
    allPcmBuffers.push(pcmChunks[i]);
    if (i < pcmChunks.length - 1) {
      allPcmBuffers.push(pauseBuffer);
    }
  }

  const combinedPcm = Buffer.concat(allPcmBuffers);
  const totalFrames = combinedPcm.length / 2;
  const durationSec = totalFrames / sampleRate;
  console.log(`   Total PCM audio duration: ${durationSec.toFixed(2)} seconds (${totalFrames} frames)`);

  const wavHeader = writeWavHeader(sampleRate, 1, totalFrames);
  const fullWav = Buffer.concat([wavHeader, combinedPcm]);

  const pubPath = path.resolve('public/media/hindi_audio.wav');
  const distPath = path.resolve('dist/media/hindi_audio.wav');

  fs.writeFileSync(pubPath, fullWav);
  console.log(`✓ Written ${pubPath} (${fullWav.length} bytes)`);

  if (fs.existsSync(path.dirname(distPath))) {
    fs.writeFileSync(distPath, fullWav);
    console.log(`✓ Written ${distPath} (${fullWav.length} bytes)`);
  }

  console.log('🎉 Hindi movie audio generation complete!');
}

main().catch(err => {
  console.error('Fatal error generating hindi audio:', err);
  process.exit(1);
});
