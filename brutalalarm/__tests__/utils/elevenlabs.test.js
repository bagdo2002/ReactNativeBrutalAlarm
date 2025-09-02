import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import {
  VOICES,
  CHARACTER_MESSAGES,
  getRandomCharacterMessage,
  generateVoice,
  generateCharacterVoice,
  generateVoiceFromPreferences,
  generateAndSaveVoice,
  generateMultipleVoices,
} from '../../elevenlabs';

// Mock Buffer for Node.js compatibility
global.Buffer = require('buffer').Buffer;

describe('ElevenLabs Utility Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API response
    axios.post.mockResolvedValue({
      data: new ArrayBuffer(8),
      status: 200,
    });

    // Mock successful file operations
    FileSystem.writeAsStringAsync.mockResolvedValue();
    Audio.Sound.createAsync.mockResolvedValue({
      sound: {
        playAsync: jest.fn(),
      },
    });
  });

  describe('VOICES constant', () => {
    it('should contain all expected voice IDs', () => {
      expect(VOICES).toHaveProperty('navySeal');
      expect(VOICES).toHaveProperty('yogaInstructor');
      expect(VOICES).toHaveProperty('drillSergeant');
      expect(VOICES).toHaveProperty('motivationalCoach');
      expect(VOICES).toHaveProperty('gentle');
      expect(VOICES).toHaveProperty('energetic');
    });

    it('should have valid voice ID strings', () => {
      Object.values(VOICES).forEach(voiceId => {
        expect(typeof voiceId).toBe('string');
        expect(voiceId.length).toBeGreaterThan(0);
      });
    });
  });

  describe('CHARACTER_MESSAGES constant', () => {
    it('should contain messages for all voice characters', () => {
      Object.keys(VOICES).forEach(character => {
        expect(CHARACTER_MESSAGES).toHaveProperty(character);
        expect(Array.isArray(CHARACTER_MESSAGES[character])).toBe(true);
        expect(CHARACTER_MESSAGES[character].length).toBeGreaterThan(0);
      });
    });

    it('should have non-empty message strings', () => {
      Object.values(CHARACTER_MESSAGES).forEach(messages => {
        messages.forEach(message => {
          expect(typeof message).toBe('string');
          expect(message.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('getRandomCharacterMessage', () => {
    it('should return a message for valid character', () => {
      const message = getRandomCharacterMessage('navySeal');
      expect(typeof message).toBe('string');
      expect(CHARACTER_MESSAGES.navySeal).toContain(message);
    });

    it('should return navySeal message for invalid character', () => {
      const message = getRandomCharacterMessage('invalidCharacter');
      expect(typeof message).toBe('string');
      expect(CHARACTER_MESSAGES.navySeal).toContain(message);
    });

    it('should return different messages on multiple calls (probabilistic)', () => {
      const messages = new Set();
      for (let i = 0; i < 20; i++) {
        messages.add(getRandomCharacterMessage('navySeal'));
      }
      // With 5 messages, we should get at least 2 different ones in 20 tries
      expect(messages.size).toBeGreaterThan(1);
    });
  });

  describe('generateVoice', () => {
    it('should generate voice successfully with default parameters', async () => {
      const result = await generateVoice('Test message');
      
      expect(axios.post).toHaveBeenCalledWith(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICES.navySeal}`,
        { text: 'Test message' },
        expect.objectContaining({
          headers: expect.objectContaining({
            'xi-api-key': expect.any(String),
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg',
          }),
          responseType: 'arraybuffer',
        })
      );

      expect(FileSystem.writeAsStringAsync).toHaveBeenCalled();
      expect(Audio.Sound.createAsync).toHaveBeenCalled();
      expect(result).toContain('alarm.mp3');
    });

    it('should use custom voice ID when provided', async () => {
      const customVoiceId = 'custom-voice-id';
      await generateVoice('Test message', customVoiceId);
      
      expect(axios.post).toHaveBeenCalledWith(
        `https://api.elevenlabs.io/v1/text-to-speech/${customVoiceId}`,
        { text: 'Test message' },
        expect.any(Object)
      );
    });

    it('should resolve character name to voice ID', async () => {
      await generateVoice('Test message', 'yogaInstructor');
      
      expect(axios.post).toHaveBeenCalledWith(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICES.yogaInstructor}`,
        { text: 'Test message' },
        expect.any(Object)
      );
    });

    it('should not generate voice for empty text', async () => {
      const result = await generateVoice('');
      expect(result).toBeUndefined();
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should handle 401 authentication error', async () => {
      axios.post.mockRejectedValue({
        response: { status: 401, statusText: 'Unauthorized' }
      });

      await expect(generateVoice('Test message')).rejects.toThrow(
        'ElevenLabs API authentication failed'
      );
    });

    it('should handle 429 rate limit error', async () => {
      axios.post.mockRejectedValue({
        response: { status: 429, data: 'Rate limited' }
      });

      await expect(generateVoice('Test message')).rejects.toThrow(
        'ElevenLabs API rate limit exceeded'
      );
    });

    it('should handle 422 validation error', async () => {
      axios.post.mockRejectedValue({
        response: { status: 422, data: 'Invalid data' }
      });

      await expect(generateVoice('Test message')).rejects.toThrow(
        'Invalid request data sent to ElevenLabs API'
      );
    });

    it('should handle network error', async () => {
      axios.post.mockRejectedValue(new Error('Network error'));

      await expect(generateVoice('Test message')).rejects.toThrow(
        'Voice generation failed: Network error'
      );
    });
  });

  describe('generateCharacterVoice', () => {
    it('should use custom text when provided', async () => {
      const customText = 'Wake up now!';
      await generateCharacterVoice('navySeal', customText);
      
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        { text: customText },
        expect.any(Object)
      );
    });

    it('should use random character message when no custom text', async () => {
      await generateCharacterVoice('navySeal');
      
      const callArgs = axios.post.mock.calls[0][1];
      expect(CHARACTER_MESSAGES.navySeal).toContain(callArgs.text);
    });

    it('should fallback to navySeal for invalid character', async () => {
      await generateCharacterVoice('invalidCharacter');
      
      expect(axios.post).toHaveBeenCalledWith(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICES.navySeal}`,
        expect.any(Object),
        expect.any(Object)
      );
    });
  });

  describe('generateVoiceFromPreferences', () => {
    it('should use voice type from preferences', async () => {
      const preferences = { voiceType: 'yogaInstructor' };
      await generateVoiceFromPreferences(preferences);
      
      expect(axios.post).toHaveBeenCalledWith(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICES.yogaInstructor}`,
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should use custom text from preferences', async () => {
      const preferences = { voiceType: 'navySeal' };
      const customText = 'Custom wake up message';
      await generateVoiceFromPreferences(preferences, customText);
      
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        { text: customText },
        expect.any(Object)
      );
    });

    it('should fallback to navySeal when no preferences', async () => {
      await generateVoiceFromPreferences(null);
      
      expect(axios.post).toHaveBeenCalledWith(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICES.navySeal}`,
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should fallback to navySeal when preferences missing voice type', async () => {
      const preferences = { wakeUpStyle: 'loud' };
      await generateVoiceFromPreferences(preferences);
      
      expect(axios.post).toHaveBeenCalledWith(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICES.navySeal}`,
        expect.any(Object),
        expect.any(Object)
      );
    });
  });

  describe('generateAndSaveVoice', () => {
    it('should generate and save voice successfully', async () => {
      const text = 'Test message';
      const voiceId = 'testVoiceId';
      const recordingName = 'Test Recording';

      const result = await generateAndSaveVoice(text, voiceId, recordingName);

      expect(axios.post).toHaveBeenCalledWith(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        { text },
        expect.any(Object)
      );

      expect(FileSystem.writeAsStringAsync).toHaveBeenCalled();
      
      expect(result).toMatchObject({
        name: recordingName,
        isCustom: true,
        isCustomVoice: true,
        text: text,
      });
      expect(result.id).toContain('custom_tts_');
      expect(result.path.uri).toContain('.mp3');
    });

    it('should return null for empty text', async () => {
      const result = await generateAndSaveVoice('', 'voiceId', 'Name');
      expect(result).toBe(null);
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should return null for empty recording name', async () => {
      const result = await generateAndSaveVoice('Text', 'voiceId', '');
      expect(result).toBe(null);
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should resolve character name to voice ID', async () => {
      await generateAndSaveVoice('Text', 'drillSergeant', 'Name');
      
      expect(axios.post).toHaveBeenCalledWith(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICES.drillSergeant}`,
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should handle API errors', async () => {
      axios.post.mockRejectedValue({
        response: { status: 401, statusText: 'Unauthorized' }
      });

      await expect(generateAndSaveVoice('Text', 'voiceId', 'Name')).rejects.toThrow(
        'ElevenLabs API authentication failed'
      );
    });
  });

  describe('generateMultipleVoices', () => {
    it('should generate multiple voices sequentially', async () => {
      const textArray = ['Message 1', 'Message 2', 'Message 3'];
      const voiceId = 'testVoice';

      await generateMultipleVoices(textArray, voiceId);

      expect(axios.post).toHaveBeenCalledTimes(3);
      expect(axios.post).toHaveBeenNthCalledWith(
        1,
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        { text: 'Message 1' },
        expect.any(Object)
      );
      expect(axios.post).toHaveBeenNthCalledWith(
        2,
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        { text: 'Message 2' },
        expect.any(Object)
      );
      expect(axios.post).toHaveBeenNthCalledWith(
        3,
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        { text: 'Message 3' },
        expect.any(Object)
      );
    });

    it('should resolve character name to voice ID', async () => {
      await generateMultipleVoices(['Test'], 'motivationalCoach');
      
      expect(axios.post).toHaveBeenCalledWith(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICES.motivationalCoach}`,
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should handle empty array', async () => {
      await generateMultipleVoices([], 'testVoice');
      expect(axios.post).not.toHaveBeenCalled();
    });
  });
});
