import { NextResponse } from 'next/server';
import { generateTTS, TTSRequest } from '@/services/ttsService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, voice, lang, rate, pitch, volume, saveSubtitles } = body;
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ success: false, error: { message: "Text is required" } }, { status: 400 });
    }
    if (text.length > 5000) {
      return NextResponse.json({ success: false, error: { message: "Text is too long (max 5000 chars)" } }, { status: 400 });
    }
    if (text.trim() === '') {
      return NextResponse.json({ success: false, error: { message: "Text cannot be empty" } }, { status: 400 });
    }
    
    const result = await generateTTS({ text: text.trim(), voice, lang, rate, pitch, volume, saveSubtitles });
    
    return NextResponse.json({
      success: true,
      audio: {
        url: result.audioUrl,
        mimeType: 'audio/mpeg',
        filename: result.audioUrl.split('/').pop()
      },
      subtitles: {
        available: !!result.subtitleUrl,
        url: result.subtitleUrl
      }
    });
  } catch (error: any) {
    console.error('TTS Generation Error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'TTS_GENERATION_FAILED',
        message: 'Speech generation failed. ' + (error?.message || '')
      }
    }, { status: 500 });
  }
}
