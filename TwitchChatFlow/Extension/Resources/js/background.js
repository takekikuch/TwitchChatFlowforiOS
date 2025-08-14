// Background script for Twitch Chat Flow Safari Extension

// Extension installed/enabled
browser.runtime.onInstalled.addListener(() => {
    console.log('Twitch Chat Flow Extension installed');
});

// Handle extension startup
browser.runtime.onStartup.addListener(() => {
    console.log('Twitch Chat Flow Extension started');
});

// Basic settings management
const defaultSettings = {
    mode: 'default',
    enabled: true,
    showUsername: true,
    fontSize: 24,
    duration: 7,
    opacity: 1,
    danmakuDensity: 2,
    textDecoration: 'none',
    bold: false,
    font: 'Default'
};

// Initialize settings if not exists
browser.storage.local.get('twitchChatFlowSettings').then((result) => {
    if (!result.twitchChatFlowSettings) {
        browser.storage.local.set({
            twitchChatFlowSettings: defaultSettings
        });
    }
});

// Message handling between content script and popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'getSettings') {
        browser.storage.local.get('twitchChatFlowSettings').then((result) => {
            sendResponse(result.twitchChatFlowSettings || defaultSettings);
        });
        return true; // Indicates async response
    }
    
    if (message.type === 'setSettings') {
        browser.storage.local.set({
            twitchChatFlowSettings: message.settings
        }).then(() => {
            sendResponse({ success: true });
        });
        return true;
    }
});