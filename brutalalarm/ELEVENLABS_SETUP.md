# ElevenLabs API Setup Guide

## Current Issue
The app is showing a 404 error when trying to generate custom voices. This is because the ElevenLabs API key is not properly configured.

## How to Fix

### 1. Get Your ElevenLabs API Key
1. Go to [ElevenLabs](https://elevenlabs.io)
2. Sign up or log in to your account
3. Navigate to Settings > API Keys
4. Create a new API key or copy your existing one

### 2. Configure the API Key
You have several options:

#### Option A: Environment Variable (Recommended)
Create a `.env` file in your project root with:
```
EXPO_PUBLIC_ELEVEN_LABS_API_KEY=your_actual_api_key_here
```

#### Option B: Expo Configuration
Add to your `app.json` or `app.config.js`:
```json
{
  "expo": {
    "extra": {
      "elevenLabsApiKey": "your_actual_api_key_here"
    }
  }
}
```

#### Option C: Direct Configuration (Not Recommended for Production)
Temporarily modify the `elevenlabs.js` file to include your API key directly.

### 3. Verify Voice IDs
The current voice IDs in the app may not be valid for your account. You can:
1. Check your ElevenLabs dashboard for available voices
2. Update the `VOICES` object in `elevenlabs.js` with your actual voice IDs

### 4. Test the Configuration
After setting up your API key, try creating a custom voice in the app to verify everything works.

## Security Note
Never commit your actual API key to version control. Always use environment variables or secure configuration methods.
