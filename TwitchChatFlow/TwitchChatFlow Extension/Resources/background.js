// Background script for Twitch Chat Flow Safari Extension

// Extension installed/enabled
browser.runtime.onInstalled.addListener(() => {
    console.log('Twitch Chat Flow Extension installed');
});

// Handle extension startup
browser.runtime.onStartup.addListener(() => {
    console.log('Twitch Chat Flow Extension started');
});

// Handle action click (標準WebExtensionパターン)
browser.action.onClicked.addListener(async (tab) => {
    console.log('🎯 Extension action clicked on tab:', tab.url);
    
    if (tab.url && tab.url.includes('twitch.tv')) {
        console.log('📨 Sending message to content script to show settings popup');
        try {
            const response = await browser.tabs.sendMessage(tab.id, {
                action: 'showSettingsPopup'
            });
            console.log('✅ Message sent successfully:', response);
        } catch (error) {
            console.log('❌ Could not send message to content script:', error);
            // フォールバック: 新しいタブで設定を開く
            browser.tabs.create({
                url: browser.runtime.getURL('Resources/popup.html')
            });
        }
    } else {
        console.log('ℹ️ Not on Twitch, opening settings in new tab');
        browser.tabs.create({
            url: browser.runtime.getURL('Resources/popup.html')
        });
    }
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