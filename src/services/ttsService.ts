process.env.WS_NO_BUFFER_UTIL = '1';
process.env.WS_NO_UTF_8_VALIDATE = '1';
import { EdgeTTS } from 'node-edge-tts';
import fs from 'fs';
import path from 'path';

const TTS_OUTPUT_DIR = path.join(process.cwd(), 'public', 'tts');

export type TTSRequest = {
  text: string;
  voice: string;
  lang: string;
  rate?: string;
  pitch?: string;
  volume?: string;
  outputFormat?: string;
  saveSubtitles?: boolean;
};

export async function generateTTS(req: TTSRequest) {
  if (!fs.existsSync(TTS_OUTPUT_DIR)) {
    fs.mkdirSync(TTS_OUTPUT_DIR, { recursive: true });
  }

  // Cleanup old files (> 1 hour)
  try {
    const files = fs.readdirSync(TTS_OUTPUT_DIR);
    const now = Date.now();
    for (const file of files) {
      if (file === '.gitkeep') continue;
      const filePath = path.join(TTS_OUTPUT_DIR, file);
      const stat = fs.statSync(filePath);
      if (now - stat.mtimeMs > 3600000) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (e) {
    console.error("Cleanup error", e);
  }

  const { text, voice, lang, rate, pitch, volume, outputFormat, saveSubtitles } = req;
  
  const requestId = crypto.randomUUID();
  const ext = outputFormat?.includes('mp3') ? 'mp3' : 'mp3';
  const audioFilename = `audio-${requestId}.${ext}`;
  const outputPath = path.join(TTS_OUTPUT_DIR, audioFilename);

  const tts = new EdgeTTS({
    voice: voice || 'en-US-AriaNeural',
    lang: lang || 'en-US',
    outputFormat: outputFormat || 'audio-24khz-96kbitrate-mono-mp3',
    saveSubtitles: !!saveSubtitles,
    pitch: pitch || 'default',
    rate: rate || 'default',
    volume: volume || 'default',
    timeout: 15000,
  });

  await tts.ttsPromise(text, outputPath);

  const subtitleFilename = `${audioFilename}.json`;
  const subtitlePath = path.join(TTS_OUTPUT_DIR, subtitleFilename);
  
  let subtitleUrl = undefined;
  if (saveSubtitles && fs.existsSync(subtitlePath)) {
    subtitleUrl = `/tts/${subtitleFilename}`;
  }

  return {
    audioUrl: `/tts/${audioFilename}`,
    subtitleUrl,
    requestId
  };
}
