// Background script for Danmaku Flow Chat Safari Extension

// Extension installed/enabled
browser.runtime.onInstalled.addListener(() => {
    // Extension installed
});

// Handle extension startup
browser.runtime.onStartup.addListener(() => {
    // Extension started
});

// Handle action click (標準WebExtensionパターン)
browser.action.onClicked.addListener(async (tab) => {
    
    if (tab.url && tab.url.includes('twitch.tv')) {
        try {
            const response = await browser.tabs.sendMessage(tab.id, {
                action: 'showSettingsPopup'
            });
        } catch (error) {
            // フォールバック: 新しいタブで設定を開く
            browser.tabs.create({
                url: browser.runtime.getURL('Resources/popup.html')
            });
        }
    } else {
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