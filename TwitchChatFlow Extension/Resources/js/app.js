(() => {
	console.log('🎉 Twitch Chat Flow: Extension loaded!');
	
	// background scriptからのメッセージリスナー (標準WebExtensionパターン)
	browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
		console.log('📨 Message received from background script:', message);
		
		if (message.action === 'showSettingsPopup') {
			console.log('🔧 Creating settings popup from message');
			try {
				showGlobalSettingsPopup();
				sendResponse({ success: true, message: 'Settings popup created successfully' });
			} catch (error) {
				console.error('❌ Error creating settings popup:', error);
				sendResponse({ success: false, error: error.message });
			}
		}
		
		// 非同期レスポンスを示すため true を返す
		return true;
	});
	
	// グローバル設定ポップアップ表示関数（iOS Safari Extension対応）
	window.showGlobalSettingsPopup = () => {
		console.log('🔧 Creating global settings popup');
		
		// 既存のグローバルポップアップを削除
		const existingPopup = document.querySelector('#twitch-chat-flow-global-popup');
		if (existingPopup) {
			existingPopup.remove();
		}
		
		// 設定を読み込み
		let settings = {
			enabled: true,
			fontSize: 24,
			duration: 7
		};
		
		try {
			const savedEnabled = localStorage.getItem('twitchChatFlowEnabled');
			const savedFontSize = localStorage.getItem('twitchChatFlowFontSize');
			const savedDuration = localStorage.getItem('twitchChatFlowDuration');
			
			if (savedEnabled !== null) settings.enabled = JSON.parse(savedEnabled);
			if (savedFontSize !== null) settings.fontSize = JSON.parse(savedFontSize);
			if (savedDuration !== null) settings.duration = JSON.parse(savedDuration);
		} catch (error) {
			console.log('📝 Using default settings for global popup');
		}
		
		// 背景オーバーレイ
		const overlay = document.createElement('div');
		overlay.id = 'twitch-chat-flow-global-popup';
		overlay.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: rgba(0, 0, 0, 0.8);
			z-index: 999999;
			display: flex;
			justify-content: center;
			align-items: center;
		`;
		
		// ポップアップパネル
		const popup = document.createElement('div');
		popup.style.cssText = `
			background: rgba(24, 24, 27, 0.98);
			border: 1px solid #464649;
			border-radius: 12px;
			padding: 25px;
			min-width: 320px;
			max-width: 400px;
			box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
			backdrop-filter: blur(10px);
		`;
		
		popup.innerHTML = `
			<div style="color: white; margin-bottom: 20px;">
				<h2 style="margin: 0; font-size: 18px; font-weight: 600;">Twitch Chat Flow 設定</h2>
				<p style="margin: 5px 0 0 0; font-size: 14px; color: #a0a0a3;">ニコニコ動画風コメント表示</p>
			</div>
			
			<div style="margin-bottom: 20px;">
				<label style="color: white; display: flex; align-items: center; gap: 10px; cursor: pointer;">
					<input type="checkbox" id="tcf-global-enable-toggle" ${settings.enabled ? 'checked' : ''} 
						   style="transform: scale(1.3);">
					<span style="font-size: 16px;">弾幕表示を有効にする</span>
				</label>
			</div>
			
			<div style="margin-bottom: 20px;">
				<label style="color: white; font-size: 14px; display: block; margin-bottom: 10px;">
					文字サイズ: <span id="tcf-global-font-size-value">${settings.fontSize}</span>px
				</label>
				<input type="range" id="tcf-global-font-size-slider" min="12" max="48" value="${settings.fontSize}" step="2"
					   style="width: 100%; height: 8px; border-radius: 4px; background: #464649; outline: none; -webkit-appearance: none;">
				<div style="display: flex; justify-content: space-between; font-size: 12px; color: #a0a0a3; margin-top: 5px;">
					<span>小</span><span>大</span>
				</div>
			</div>
			
			<div style="margin-bottom: 25px;">
				<label style="color: white; font-size: 14px; display: block; margin-bottom: 10px;">
					表示時間: <span id="tcf-global-duration-value">${settings.duration}</span>秒
				</label>
				<input type="range" id="tcf-global-duration-slider" min="3" max="15" value="${settings.duration}" step="1"
					   style="width: 100%; height: 8px; border-radius: 4px; background: #464649; outline: none; -webkit-appearance: none;">
				<div style="display: flex; justify-content: space-between; font-size: 12px; color: #a0a0a3; margin-top: 5px;">
					<span>短</span><span>長</span>
				</div>
			</div>
			
			<div style="text-align: right;">
				<button id="tcf-global-close-btn" style="
					background: #9146ff;
					color: white;
					border: none;
					border-radius: 6px;
					padding: 10px 20px;
					font-size: 14px;
					cursor: pointer;
				">閉じる</button>
			</div>
		`;
		
		// スライダーのスタイル
		const sliderStyle = document.createElement('style');
		sliderStyle.textContent = `
			#twitch-chat-flow-global-popup input[type="range"]::-webkit-slider-thumb {
				-webkit-appearance: none;
				appearance: none;
				width: 20px;
				height: 20px;
				border-radius: 50%;
				background: #9146ff;
				cursor: pointer;
			}
		`;
		document.head.appendChild(sliderStyle);
		
		overlay.appendChild(popup);
		document.body.appendChild(overlay);
		
		// イベントリスナー設定
		const enableToggle = popup.querySelector('#tcf-global-enable-toggle');
		const fontSizeSlider = popup.querySelector('#tcf-global-font-size-slider');
		const fontSizeValue = popup.querySelector('#tcf-global-font-size-value');
		const durationSlider = popup.querySelector('#tcf-global-duration-slider');
		const durationValue = popup.querySelector('#tcf-global-duration-value');
		const closeBtn = popup.querySelector('#tcf-global-close-btn');
		
		const saveSettings = () => {
			localStorage.setItem('twitchChatFlowEnabled', JSON.stringify(settings.enabled));
			localStorage.setItem('twitchChatFlowFontSize', JSON.stringify(settings.fontSize));
			localStorage.setItem('twitchChatFlowDuration', JSON.stringify(settings.duration));
			console.log('💾 Global settings saved:', settings);
		};
		
		enableToggle.addEventListener('change', () => {
			settings.enabled = enableToggle.checked;
			saveSettings();
		});
		
		fontSizeSlider.addEventListener('input', () => {
			settings.fontSize = parseInt(fontSizeSlider.value);
			fontSizeValue.textContent = settings.fontSize;
			saveSettings();
		});
		
		durationSlider.addEventListener('input', () => {
			settings.duration = parseInt(durationSlider.value);
			durationValue.textContent = settings.duration;
			saveSettings();
		});
		
		closeBtn.addEventListener('click', () => {
			overlay.remove();
			sliderStyle.remove();
		});
		
		// 背景クリックで閉じる
		overlay.addEventListener('click', (e) => {
			if (e.target === overlay) {
				overlay.remove();
				sliderStyle.remove();
			}
		});
		
		console.log('✅ Global settings popup created and displayed');
	};
	
	const VIDEO_CONTAINER_SELECTORS = [
		'[data-test-selector="video-player__container"]',
		'.video-player__container',
		'[data-a-target="player-overlay-click-handler"]'
	];
	const CHAT_CONTAINER_SELECTORS = [
		'[data-test-selector="chat-scrollable-area__message-container"]',
		'.chat-scrollable-area__message-container',
		'[data-test-selector="video-chat-message-list-wrapper"]',
		'.video-chat__message-list-wrapper',
		'.chat-list--default'
	];

	const RAW_CHAT_SELECTORS = [
		'[data-test-selector="chat-line-message"]',
		'.chat-line__message',
		'div[data-a-target="chat-line-message"]',
		'.vod-message'
	].map(e => `${e}:not([data-danmaku-ready])`);

	const CHAT_USERNAME_SELECTORS = [
		'[data-test-selector="message-username"]',
		'.chat-line__username',
		'.chat-author__display-name',
		'.vod-message .video-chat__message-author',
		'.chat-author__intl-login',
		'span[class*="CoreText-sc-"]',
		'div[class*="CoreText-sc-"]',
		'button[data-a-target="chat-username"]'
	];
	const CHAT_MESSAGE_SELECTORS = [
		'[data-test-selector="message-text"]',
		'.chat-line__message-container .text-fragment',
		'.chat-line__message-container .chat-line__username-container ~ span:last-of-type',
		'.message',
		'.vod-message .video-chat__message > span ~ span:last-of-type',
		'span[class*="CoreText-sc-"]',
		'div[class*="CoreText-sc-"]',
		'span[data-a-target="chat-message-text"]'
	];

	// 簡素化されたユーティリティ関数
	const waitUntil = (condition, { timeout = 0, interval = 1000 / 60 } = {}) => new Promise((resolve, reject) => {
		let res;
		const tick = () => {
			if (res = condition()) {
				resolve(res);
			} else {
				if (interval || typeof requestAnimationFrame !== 'function') {
					setTimeout(tick, interval);
				} else {
					requestAnimationFrame(tick);
				}
			}
		};

		tick();

		if (timeout) {
			setTimeout(() => {
				reject('timeout');
			}, timeout);
		}
	});

	const getElementsBySelectors = (selectors, $parent) => {
		let fulfilled;
		return Promise.race(
			selectors.map(selector => waitUntil(() => {
				if (fulfilled) {
					return fulfilled;
				}
				const $els = [...($parent || document).querySelectorAll(selector)];
				if ($els.length) {
					fulfilled = $els;
					return $els;
				} else {
					return false;
				}
			}))
		);
	};

	const getVideoContainer = () => {
		console.log('🎬 Looking for video container...');
		return getElementsBySelectors(VIDEO_CONTAINER_SELECTORS).then($els => {
			console.log('🎬 Video container found:', $els[0]);
			return $els[0];
		});
	};
	const getChatContainer = () => {
		console.log('💬 Looking for chat container...');
		return getElementsBySelectors(CHAT_CONTAINER_SELECTORS).then($els => {
			console.log('💬 Chat container found:', $els[0]);
			return $els[0];
		});
	};

	(async () => {
		let $video, $chat, $danmakuContainer;
		
		// 設定をlocalStorageから読み取り
		let settings = {
			mode: 'default',
			enabled: true,
			showUsername: true,
			fontSize: 24,
			duration: 7,
			opacity: 1,
			danmakuDensity: 2
		};
		
		const loadSettings = () => {
			try {
				const savedEnabled = localStorage.getItem('twitchChatFlowEnabled');
				const savedFontSize = localStorage.getItem('twitchChatFlowFontSize');
				const savedDuration = localStorage.getItem('twitchChatFlowDuration');
				
				if (savedEnabled !== null) settings.enabled = JSON.parse(savedEnabled);
				if (savedFontSize !== null) settings.fontSize = JSON.parse(savedFontSize);
				if (savedDuration !== null) settings.duration = JSON.parse(savedDuration);
				
				console.log('📖 Settings loaded from localStorage:', settings);
				
				// コアエンジンに設定変更を通知
				if (core && core.onSettingsChange) {
					core.onSettingsChange(settings);
				}
			} catch (error) {
				console.log('📝 Using default settings');
			}
		};
		
		// 初期設定読み込み
		loadSettings();
		
		// 設定変更の監視
		window.addEventListener('storage', (event) => {
			if (event.key && event.key.startsWith('twitchChatFlow')) {
				console.log('⚙️ Settings changed, reloading...');
				loadSettings();
			}
		});
		let core;

		const isDanmakuWorking = () => {
			// 毎回最新のコンテナを確認（変数参照ではなく）
			const currentContainer = document.querySelector('#danmaku-container');
			const containerWorking = currentContainer && document.body.contains(currentContainer);
			const videoWorking = $video && document.body.contains($video);
			const chatWorking = $chat && document.body.contains($chat);
			const allWorking = containerWorking && videoWorking && chatWorking;
			
			console.log('🔧 isDanmakuWorking check:', {
				container: containerWorking,
				video: videoWorking,
				chat: chatWorking,
				overall: allWorking,
				containerElement: currentContainer
			});
			
			return allWorking;
		};

		const getUnprocessedChats = () => {
			console.log('🔍 Looking for unprocessed chat messages...');
			return waitUntil(() => getElementsBySelectors(RAW_CHAT_SELECTORS, $chat)).then(chats => {
				console.log('📨 Found', chats.length, 'unprocessed chat messages:', chats);
				return chats;
			});
		};

		const processChat = async ($chat) => {
			console.log('📝 Processing chat element:', $chat);
			$chat.setAttribute('data-danmaku-ready', true);
			
			const $username = (await getElementsBySelectors(CHAT_USERNAME_SELECTORS, $chat))[0];
			const $message = (await getElementsBySelectors(CHAT_MESSAGE_SELECTORS, $chat))[0];

			console.log('👤 Username element found:', $username);
			console.log('💬 Message element found:', $message);
			
			if ($username && $message) {
				const usernameText = $username.textContent || $username.innerText;
				const messageText = $message.textContent || $message.innerText;
				console.log('👤 New message from:', usernameText);
				console.log('💬 Message:', messageText);
				core?.onDanmaku?.($username.cloneNode(true), $message.cloneNode(true));
			} else {
				console.log('❌ Failed to find username or message in chat element');
			}
		}

		const getCore = async () => {
			console.log('⚙️ Looking for core...', settings.mode);
			console.log('⚙️ window._twitchChatDanmaku:', window._twitchChatDanmaku);
			try {
				core = await waitUntil(() => window._twitchChatDanmaku?.[settings.mode], { timeout: 5000 });
				console.log('✅ Core found:', core);
			} catch (ex) {
				console.error('❌ TwitchChatDanmaku: core not found, abort!', ex);
			}
			return core;
		}

		console.log('🚀 Starting main loop...');
		await getCore();
		if (!core) {
			console.error('❌ TwitchChatDanmaku: core not found, abort!');
			return;
		}

		const reset = async () => {
			console.log('🗑️ RESET called - removing existing containers');
			const existingContainers = [...document.querySelectorAll('#danmaku-container')];
			console.log('🗑️ Found', existingContainers.length, 'existing containers to remove');
			await getCore();
			existingContainers.forEach($el => {
				console.log('🗑️ Removing container:', $el);
				$el.remove();
			});
		};

		// 設定パネルUI作成
		const createSettingsPanel = () => {
			// 設定ボタン
			const settingsButton = document.createElement('button');
			settingsButton.id = 'twitch-chat-flow-settings-btn';
			settingsButton.innerHTML = '⚙️';
			settingsButton.style.cssText = `
				position: absolute;
				top: 10px;
				right: 10px;
				width: 40px;
				height: 40px;
				border: none;
				border-radius: 8px;
				background: rgba(0, 0, 0, 0.8);
				color: white;
				font-size: 18px;
				cursor: pointer;
				z-index: 9999;
				transition: background 0.3s;
			`;
			settingsButton.addEventListener('mouseenter', () => {
				settingsButton.style.background = 'rgba(0, 0, 0, 0.9)';
			});
			settingsButton.addEventListener('mouseleave', () => {
				settingsButton.style.background = 'rgba(0, 0, 0, 0.8)';
			});
			
			// 設定パネル
			const settingsPanel = document.createElement('div');
			settingsPanel.id = 'twitch-chat-flow-settings-panel';
			settingsPanel.style.cssText = `
				position: absolute;
				top: 60px;
				right: 10px;
				width: 300px;
				background: rgba(24, 24, 27, 0.95);
				border: 1px solid #464649;
				border-radius: 12px;
				padding: 20px;
				z-index: 9999;
				display: none;
				box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
				backdrop-filter: blur(10px);
			`;
			
			settingsPanel.innerHTML = `
				<div style="color: white; margin-bottom: 15px;">
					<h3 style="margin: 0; font-size: 16px; font-weight: 600;">弾幕設定</h3>
				</div>
				
				<div style="margin-bottom: 15px;">
					<label style="color: white; display: flex; align-items: center; gap: 10px; cursor: pointer;">
						<input type="checkbox" id="tcf-enable-toggle" ${settings.enabled ? 'checked' : ''} 
							   style="transform: scale(1.2);">
						<span>弾幕表示を有効にする</span>
					</label>
				</div>
				
				<div style="margin-bottom: 15px;">
					<label style="color: white; font-size: 14px; display: block; margin-bottom: 8px;">
						文字サイズ: <span id="tcf-font-size-value">${settings.fontSize}</span>px
					</label>
					<input type="range" id="tcf-font-size-slider" min="12" max="48" value="${settings.fontSize}" step="2"
						   style="width: 100%; height: 6px; border-radius: 3px; background: #464649; outline: none; -webkit-appearance: none;">
					<div style="display: flex; justify-content: space-between; font-size: 10px; color: #a0a0a3;">
						<span>小</span><span>大</span>
					</div>
				</div>
				
				<div style="margin-bottom: 15px;">
					<label style="color: white; font-size: 14px; display: block; margin-bottom: 8px;">
						表示時間: <span id="tcf-duration-value">${settings.duration}</span>秒
					</label>
					<input type="range" id="tcf-duration-slider" min="3" max="15" value="${settings.duration}" step="1"
						   style="width: 100%; height: 6px; border-radius: 3px; background: #464649; outline: none; -webkit-appearance: none;">
					<div style="display: flex; justify-content: space-between; font-size: 10px; color: #a0a0a3;">
						<span>短</span><span>長</span>
					</div>
				</div>
			`;
			
			// スライダーのスタイル調整
			const sliderStyle = `
				input[type="range"]::-webkit-slider-thumb {
					-webkit-appearance: none;
					appearance: none;
					width: 18px;
					height: 18px;
					border-radius: 50%;
					background: #9146ff;
					cursor: pointer;
				}
			`;
			const style = document.createElement('style');
			style.textContent = sliderStyle;
			document.head.appendChild(style);
			
			// イベントハンドラー
			settingsButton.addEventListener('click', () => {
				const isVisible = settingsPanel.style.display === 'block';
				settingsPanel.style.display = isVisible ? 'none' : 'block';
			});
			
			// パネル外クリックで閉じる
			document.addEventListener('click', (e) => {
				if (!settingsButton.contains(e.target) && !settingsPanel.contains(e.target)) {
					settingsPanel.style.display = 'none';
				}
			});
			
			return { button: settingsButton, panel: settingsPanel };
		};
		
		// 設定パネルイベント処理
		const setupSettingsEvents = (panel) => {
			const enableToggle = panel.querySelector('#tcf-enable-toggle');
			const fontSizeSlider = panel.querySelector('#tcf-font-size-slider');
			const fontSizeValue = panel.querySelector('#tcf-font-size-value');
			const durationSlider = panel.querySelector('#tcf-duration-slider');
			const durationValue = panel.querySelector('#tcf-duration-value');
			
			enableToggle.addEventListener('change', () => {
				settings.enabled = enableToggle.checked;
				localStorage.setItem('twitchChatFlowEnabled', JSON.stringify(settings.enabled));
				loadSettings();
			});
			
			fontSizeSlider.addEventListener('input', () => {
				settings.fontSize = parseInt(fontSizeSlider.value);
				fontSizeValue.textContent = settings.fontSize;
				localStorage.setItem('twitchChatFlowFontSize', JSON.stringify(settings.fontSize));
				loadSettings();
			});
			
			durationSlider.addEventListener('input', () => {
				settings.duration = parseInt(durationSlider.value);
				durationValue.textContent = settings.duration;
				localStorage.setItem('twitchChatFlowDuration', JSON.stringify(settings.duration));
				loadSettings();
			});
		};

		// danmakuコンテナ初期化
		const initDanmakuContainer = async () => {
			await reset();
			$danmakuContainer = document.createElement('div');
			$danmakuContainer.setAttribute('id', 'danmaku-container');
			$danmakuContainer.setAttribute('data-danmaku-mode', settings.mode);
			$video.appendChild($danmakuContainer);
			console.log('✅ New danmaku container created and added to video:', $danmakuContainer);
			
			// 設定パネルを追加
			const settingsUI = createSettingsPanel();
			$video.appendChild(settingsUI.button);
			$video.appendChild(settingsUI.panel);
			setupSettingsEvents(settingsUI.panel);
			console.log('⚙️ Settings panel added to video container');
			
			core?.init?.($danmakuContainer, settings);

			(async () => {
				let $orgContainer = $danmakuContainer;
				let $chats;

				do {
					$chats?.forEach(processChat);
					$chats = await getUnprocessedChats();
				} while ($orgContainer === $danmakuContainer);
			})();
		}

		// メインループ
		console.log('🔄 Starting main monitoring loop...');
		while (true) {
			if (await waitUntil(() => !isDanmakuWorking(), { interval: 3000 })) {
				console.log('🔄 Danmaku not working, reinitializing...');
				$chat = await getChatContainer();
				$video = await getVideoContainer();

				if (document.body.contains($chat) && document.body.contains($video)) {
					console.log('✅ Both containers found, initializing danmaku...');
					await initDanmakuContainer();
				} else {
					console.log('❌ Containers not found in DOM');
				}
			}
		}
	})();
})();