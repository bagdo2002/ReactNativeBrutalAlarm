// elevenLabs.js
import axios from "axios";
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { Buffer } from "buffer";

// Your ElevenLabs API key - use environment variable for security
const ELEVEN_LABS_API_KEY = process.env.EXPO_PUBLIC_ELEVEN_LABS_API_KEY || "sk_c601097f4b77f5dac6895da9548437e23518baf804e17298";

// Character voices with different personalities
export const VOICES = {
  navySeal: "pNInz6obpgDQGcFmaJgB",        // Adam - deep, commanding voice
  yogaInstructor: "EXAVITQu4vr4xnSDxMaL",  // Bella - calm, soothing voice
  drillSergeant: "VR6AewLTigWG4xSOukaG",   // Antoni - intense, aggressive voice
  motivationalCoach: "TX3LPaxmHKxFdv7VOQHJ", // Elli - energetic, inspiring voice
  gentle: "AZnzlk1XvdvUeBnXmlld",          // Domi - soft, gentle voice
  energetic: "21m00Tcm4TlvDq8ikWAM",       // Rachel - high energy voice
};

// Character-specific wake-up messages
export const CHARACTER_MESSAGES = {
  navySeal: [
    "Drop and give me twenty! Time to get your ass out of bed, soldier!",
    "Wake up, you lazy fuck! Navy SEAL style!",
    "Move it, move it, move it! The enemy doesn't wait for sleepyheads!",
    "Rise and shine, warrior! Your mission starts now!",
    "Get up! No excuses, no delays! Time to dominate this day!"
  ],
  yogaInstructor: [
    "Good morning, beautiful soul. Take a deep breath and gently open your eyes.",
    "Welcome to a new day filled with possibilities. Let's start with gratitude.",
    "Rise slowly, like the sun. Feel the peaceful energy flowing through you.",
    "Namaste. Your body has rested, now let your spirit soar.",
    "Breathe in peace, breathe out stress. Today is your canvas to paint."
  ],
  drillSergeant: [
    "GET UP RIGHT NOW! NO EXCUSES, NO DELAYS!",
    "MOVE YOUR ASS! The day is wasting and you're still in bed!",
    "DROP AND GIVE ME PUSH-UPS! Now get up and show me what you're made of!",
    "WAKE UP, MAGGOT! Time to prove you're not a complete failure!",
    "ON YOUR FEET, SOLDIER! The weak stay in bed, the strong conquer the day!"
  ],
  motivationalCoach: [
    "Rise and shine, champion! Today is YOUR day to shine!",
    "Wake up, superstar! The world is waiting for your amazing energy!",
    "Good morning, winner! You've got this - let's make today incredible!",
    "Time to wake up and be awesome! Your dreams won't chase themselves!",
    "Rise up, champion! Today is another opportunity to be extraordinary!"
  ],
  gentle: [
    "Good morning, dear. Time to slowly wake up and embrace the day.",
    "Wake up gently, sweetheart. A beautiful day is waiting for you.",
    "Rise slowly and peacefully. There's no rush, just gentle awakening.",
    "Good morning, lovely. Let's start this day with kindness and peace.",
    "Wake up softly, dear one. Today holds wonderful possibilities for you."
  ],
  energetic: [
    "WAKE UP! It's time to ROCK this day!",
    "Good morning, energy machine! Let's GET MOVING!",
    "Rise and SHINE! Today is going to be AMAZING!",
    "Wake up, dynamo! Time to unleash your incredible energy!",
    "GET UP and let's make this day FANTASTIC!"
  ]
};

/**
 * Get a random message for a specific character
 * @param {string} character - The character type
 * @returns {string} Random message for the character
 */
export function getRandomCharacterMessage(character) {
  const messages = CHARACTER_MESSAGES[character] || CHARACTER_MESSAGES.navySeal;
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Generate voice audio from text and play it
 * @param {string} text - The text to speak
 * @param {string} voiceId - The ElevenLabs voice ID or character name
 */
export async function generateVoice(text, voiceId = VOICES.navySeal) {
  try {
    if (!text || text.trim() === "") return;

    // Check if API key is available
    if (!ELEVEN_LABS_API_KEY || ELEVEN_LABS_API_KEY === "your_api_key_here") {
      throw new Error("ElevenLabs API key is not configured. Please set EXPO_PUBLIC_ELEVEN_LABS_API_KEY environment variable.");
    }

    // If voiceId is a character name, get the actual voice ID
    const actualVoiceId = VOICES[voiceId] || voiceId;

    // Request TTS from ElevenLabs
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${actualVoiceId}`,
      { text },
      {
        headers: {
          "xi-api-key": ELEVEN_LABS_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        responseType: "arraybuffer",
      }
    );

    // Save audio locally
    const fileUri = `${FileSystem.cacheDirectory}alarm.mp3`;
    await FileSystem.writeAsStringAsync(
      fileUri,
      Buffer.from(response.data).toString("base64"),
      { encoding: FileSystem.EncodingType.Base64 }
    );

    // Play audio
    const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
    await sound.playAsync();

    return fileUri;
  } catch (error) {
    if (error.response?.status === 401) {
      console.error("ElevenLabs API Authentication Error (401):", {
        message: "Invalid API key or insufficient permissions",
        status: error.response.status,
        statusText: error.response.statusText,
        apiKey: ELEVEN_LABS_API_KEY ? `${ELEVEN_LABS_API_KEY.substring(0, 8)}...` : "Not set"
      });
      throw new Error("ElevenLabs API authentication failed. Please check your API key and account status.");
    } else if (error.response?.status === 429) {
      console.error("ElevenLabs API Rate Limit Error (429):", error.response.data);
      throw new Error("ElevenLabs API rate limit exceeded. Please try again later.");
    } else if (error.response?.status === 422) {
      console.error("ElevenLabs API Validation Error (422):", error.response.data);
      throw new Error("Invalid request data sent to ElevenLabs API.");
    } else {
      console.error("Error generating voice:", error);
      throw new Error(`Voice generation failed: ${error.message}`);
    }
  }
}

/**
 * Generate character voice with a random message
 * @param {string} character - Character type (navySeal, yogaInstructor, etc.)
 * @param {string} customText - Optional custom text, otherwise uses random character message
 */
export async function generateCharacterVoice(character, customText = null) {
  const text = customText || getRandomCharacterMessage(character);
  const voiceId = VOICES[character] || VOICES.navySeal;
  return await generateVoice(text, voiceId);
}

/**
 * Generate voice based on user preferences
 * @param {Object} preferences - User preferences object
 * @param {string} customText - Optional custom text
 */
export async function generateVoiceFromPreferences(preferences, customText = null) {
  if (!preferences || !preferences.voiceType) {
    return await generateCharacterVoice('navySeal', customText);
  }

  return await generateCharacterVoice(preferences.voiceType, customText);
}

/**
 * Generate voice audio and save it as a custom recording
 * @param {string} text - The text to speak
 * @param {string} voiceId - The ElevenLabs voice ID or character name
 * @param {string} recordingName - Name for the saved recording
 * @returns {Object|null} New sound object or null if failed
 */
export async function generateAndSaveVoice(text, voiceId = VOICES.navySeal, recordingName) {
  try {
    if (!text || text.trim() === "") return null;
    if (!recordingName || recordingName.trim() === "") return null;

    // Check if API key is available
    if (!ELEVEN_LABS_API_KEY || ELEVEN_LABS_API_KEY === "your_api_key_here") {
      throw new Error("ElevenLabs API key is not configured. Please set EXPO_PUBLIC_ELEVEN_LABS_API_KEY environment variable.");
    }

    // If voiceId is a character name, get the actual voice ID
    const actualVoiceId = VOICES[voiceId] || voiceId;

    // Request TTS from ElevenLabs
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${actualVoiceId}`,
      { text },
      {
        headers: {
          "xi-api-key": ELEVEN_LABS_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        responseType: "arraybuffer",
      }
    );

    // Save audio to permanent location
    const timestamp = new Date().getTime();
    const fileName = `custom_tts_${timestamp}.mp3`;
    const documentDirectory = FileSystem.documentDirectory;
    const filePath = `${documentDirectory}${fileName}`;
    
    await FileSystem.writeAsStringAsync(
      filePath,
      Buffer.from(response.data).toString("base64"),
      { encoding: FileSystem.EncodingType.Base64 }
    );

    // Create new sound object
    const newSound = {
      id: `custom_tts_${timestamp}`,
      name: recordingName.trim(),
      path: { uri: filePath },
      isCustom: true,
      isCustomVoice: true, // Flag to distinguish TTS from recordings
      text: text.trim(),
    };

    console.log("TTS audio saved successfully:", filePath);
    return newSound;
  } catch (error) {
    if (error.response?.status === 401) {
      console.error("ElevenLabs API Authentication Error (401):", {
        message: "Invalid API key or insufficient permissions",
        status: error.response.status,
        statusText: error.response.statusText,
        apiKey: ELEVEN_LABS_API_KEY ? `${ELEVEN_LABS_API_KEY.substring(0, 8)}...` : "Not set"
      });
      throw new Error("ElevenLabs API authentication failed. Please check your API key and account status.");
    } else if (error.response?.status === 429) {
      console.error("ElevenLabs API Rate Limit Error (429):", error.response.data);
      throw new Error("ElevenLabs API rate limit exceeded. Please try again later.");
    } else if (error.response?.status === 422) {
      console.error("ElevenLabs API Validation Error (422):", error.response.data);
      throw new Error("Invalid request data sent to ElevenLabs API.");
    } else {
      console.error("Error generating and saving voice:", error);
      throw new Error(`Voice generation failed: ${error.message}`);
    }
  }
}

/**
 * Optional: preload multiple voices
 * @param {string[]} textArray - Array of texts
 * @param {string} voiceId - Voice ID or character name
 */
export async function generateMultipleVoices(textArray, voiceId = VOICES.navySeal) {
  const actualVoiceId = VOICES[voiceId] || voiceId;
  for (let text of textArray) {
    await generateVoice(text, actualVoiceId);
  }
}
