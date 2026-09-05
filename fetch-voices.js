const https = require('https');
const fs = require('fs');

https.get('https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list?trustedclienttoken=6A5AA1D4EAFF4E9FB37E23D68491D6F4', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const voices = JSON.parse(data);
    
    // Map to our VoiceInfo format
    const voiceInfos = voices.map(v => {
      const locale = v.Locale;
      // Convert "en-US" to "English (US)"
      let language = locale;
      try {
        const display = new Intl.DisplayNames(['en'], { type: 'language' });
        language = display.of(locale) || locale;
      } catch (e) {}

      return {
        name: v.ShortName,
        shortName: v.ShortName.split('-').pop().replace('Neural', ''),
        locale: locale,
        language: language,
        gender: v.Gender
      };
    });

    const fileContent = `
export type VoiceInfo = {
  name: string;
  shortName: string;
  locale: string;
  language: string;
  gender: string;
};

export const VOICES: VoiceInfo[] = ${JSON.stringify(voiceInfos, null, 2)};

export const LANGUAGES = Array.from(new Set(VOICES.map(v => v.language))).sort();
`;
    fs.writeFileSync('src/lib/voices.ts', fileContent.trim());
    console.log('Successfully wrote ' + voiceInfos.length + ' voices to src/lib/voices.ts');
  });
});
