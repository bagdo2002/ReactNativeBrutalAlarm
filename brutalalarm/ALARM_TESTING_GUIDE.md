# Alarm Testing Guide

## Overview
This guide will help you test the alarm functionality with the new critical alert permissions and background audio capabilities that have been implemented to ensure alarms work when the app is closed or the phone is locked.

## What's New
1. **Critical Alert Permissions**: Added `NSCriticalAlertStyle` and `allowCriticalAlerts` permissions
2. **Enhanced Background Modes**: Added `remote-notification` and `background-fetch` modes
3. **Notification Categories**: Added alarm-specific notification categories with snooze/stop actions
4. **Improved Audio Configuration**: Enhanced background audio setup for alarm playback

## Testing Steps

### 1. Initial Setup
1. Open the app on your iPhone
2. When prompted, grant **ALL** notification permissions including:
   - Allow Notifications
   - Allow Critical Alerts (this is crucial!)
   - Allow Sounds
   - Allow Badges

### 2. Test Alarm with App Open
1. Set an alarm for 1-2 minutes from now
2. Keep the app open and wait for the alarm
3. Verify that the alarm sound plays correctly
4. Test the snooze and stop functionality

### 3. Test Alarm with App in Background
1. Set an alarm for 1-2 minutes from now
2. Press the home button or swipe up to put the app in background
3. Wait for the alarm notification
4. Verify that:
   - The notification appears
   - The alarm sound plays
   - You can interact with snooze/stop buttons

### 4. Test Alarm with App Closed
1. Set an alarm for 1-2 minutes from now
2. Close the app completely (swipe up and swipe away)
3. Wait for the alarm notification
4. Verify that:
   - The notification appears even with app closed
   - The alarm sound plays
   - You can interact with snooze/stop buttons

### 5. Test Alarm with Phone Locked
1. Set an alarm for 1-2 minutes from now
2. Lock your phone (press power button)
3. Wait for the alarm notification
4. Verify that:
   - The notification appears and wakes the screen
   - The alarm sound plays even when locked
   - You can interact with snooze/stop buttons

### 6. Test with Do Not Disturb Mode
1. Enable Do Not Disturb mode in iOS Settings
2. Set an alarm for 1-2 minutes from now
3. Lock your phone
4. Verify that the alarm still works (critical alerts bypass Do Not Disturb)

## Troubleshooting

### If Alarms Don't Work When App is Closed:

1. **Check Notification Permissions**:
   - Go to iOS Settings > Notifications > BrutalAlarm
   - Ensure ALL permissions are enabled:
     - Allow Notifications: ON
     - Critical Alerts: ON
     - Sounds: ON
     - Badges: ON

2. **Check Background App Refresh**:
   - Go to iOS Settings > General > Background App Refresh
   - Ensure it's enabled for BrutalAlarm

3. **Check Focus/DND Settings**:
   - Go to iOS Settings > Focus
   - Ensure BrutalAlarm is allowed in your focus modes

### If Critical Alerts Don't Work:

1. **Request Critical Alert Permissions Again**:
   - Delete and reinstall the app
   - When prompted, make sure to allow "Critical Alerts"

2. **Check iOS Version**:
   - Critical alerts require iOS 12.0 or later
   - Ensure you're running a compatible iOS version

### If Alarm Sound Doesn't Play:

1. **Check Device Volume**:
   - Ensure your device volume is not muted
   - Check that media volume is up

2. **Check Silent Mode**:
   - The app is configured to play sounds even in silent mode
   - If it's not working, check the audio configuration

## Expected Behavior

### When Alarm Triggers:
1. **Notification appears** with alarm title and message
2. **Screen wakes up** (if phone was locked)
3. **Alarm sound plays** for up to 1 minute
4. **Snooze and Stop buttons** are available
5. **Vibration** occurs (if enabled)

### Notification Actions:
- **Snooze**: Dismisses current alarm and schedules a new one for 5 minutes later
- **Stop**: Completely stops the alarm

## Technical Notes

### Critical Alert Permissions:
- These are special iOS permissions that allow alarms to work even in Do Not Disturb mode
- They require explicit user consent and cannot be granted automatically
- The app requests these permissions on first launch

### Background Audio:
- The app uses `UIBackgroundModes` with `audio` capability
- This allows audio to continue playing when the app is in background
- Audio is configured to play even in silent mode

### Notification Categories:
- Custom notification categories are set up for alarm-specific actions
- This provides better user experience with snooze/stop buttons

## Testing Checklist

- [ ] App open alarm works
- [ ] App background alarm works
- [ ] App closed alarm works
- [ ] Phone locked alarm works
- [ ] Do Not Disturb bypass works
- [ ] Snooze functionality works
- [ ] Stop functionality works
- [ ] Multiple alarms work correctly
- [ ] Custom sounds work
- [ ] Built-in sounds work

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Ensure all permissions are granted
3. Test with different alarm times
4. Try restarting the app and device
5. Check iOS system logs for any errors

## Notes for Development

- The app uses Expo Notifications with critical alert capabilities
- Background audio is handled through Expo AV
- Notification categories are set up for better iOS integration
- The app requests critical alert permissions on first launch
