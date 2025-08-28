(() => {
	console.log('🎉 Twitch Chat Flow: Extension loaded!');
	
	// 擬似フルスクリーン関連の変数
	let isPseudoFullscreen = false;
	let originalPlayerStyle = {};
	let originalPageStyle = {};
	
	// グローバル設定変数
	let settings = {
		mode: 'default',
		enabled: true,
		showUsername: true,
		fontSize: 24,
		duration: 7,
		opacity: 1,
		danmakuDensity: 3,
		shadowOpacity: 0.8,
		textOpacity: 1.0,
		fontWeight: 400,
		commentOverflow: 'overlap',
		delay: 0
	};
	let core;
	
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
		} else if (message.action === 'updateSettings') {
			console.log('⚙️ Settings update received:', message.settings);
			try {
				// グローバル設定を更新
				Object.assign(settings, message.settings);
				// コアエンジンに設定変更を通知
				if (core && core.onSettingsChange) {
					core.onSettingsChange(settings);
					console.log('✅ Settings applied to danmaku engine');
				}
				sendResponse({ success: true, message: 'Settings updated successfully' });
			} catch (error) {
				console.error('❌ Error updating settings:', error);
				sendResponse({ success: false, error: error.message });
			}
		}
		
		// 非同期レスポンスを示すため true を返す
		return true;
	});
	
	// グローバル設定ポップアップ表示関数（iOS Safari Extension対応）
	window.showGlobalSettingsPopup = async () => {
		console.log('🔧 Creating global settings popup');
		
		// 既存のグローバルポップアップを削除
		const existingPopup = document.querySelector('#twitch-chat-flow-global-popup');
		if (existingPopup) {
			existingPopup.remove();
		}
		
		// 設定を読み込み (browser.storage使用)
		let settings = {
			enabled: true,
			fontSize: 24,
			duration: 7,
			shadowOpacity: 0.8,
			textOpacity: 1.0,
			fontWeight: 400,
			commentOverflow: 'overlap',
			danmakuDensity: 3,
			delay: 0
		};
		
		try {
			const result = await browser.storage.local.get({
				twitchChatFlowEnabled: true,
				twitchChatFlowFontSize: 24,
				twitchChatFlowDuration: 7,
				twitchChatFlowShadowOpacity: 0.8,
				twitchChatFlowTextOpacity: 1.0,
				twitchChatFlowFontWeight: 400,
				twitchChatFlowCommentOverflow: 'overlap',
				twitchChatFlowDelay: 0
			});
			
			settings.enabled = result.twitchChatFlowEnabled;
			settings.fontSize = result.twitchChatFlowFontSize;
			settings.duration = result.twitchChatFlowDuration;
			settings.shadowOpacity = result.twitchChatFlowShadowOpacity;
			settings.textOpacity = result.twitchChatFlowTextOpacity;
			settings.fontWeight = result.twitchChatFlowFontWeight;
			settings.commentOverflow = result.twitchChatFlowCommentOverflow;
			settings.delay = result.twitchChatFlowDelay;
			console.log('📖 Settings loaded from browser.storage for popup:', settings);
		} catch (error) {
			console.log('📝 Using default settings for global popup:', error);
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
			max-height: 70vh;
			overflow-y: auto;
			box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
			backdrop-filter: blur(10px);
			box-sizing: border-box;
			-webkit-overflow-scrolling: touch;
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
			
			<div style="margin-bottom: 20px;">
				<label style="color: white; font-size: 14px; display: block; margin-bottom: 10px;">
					表示時間: <span id="tcf-global-duration-value">${settings.duration}</span>秒
				</label>
				<input type="range" id="tcf-global-duration-slider" min="3" max="15" value="${settings.duration}" step="1"
					   style="width: 100%; height: 8px; border-radius: 4px; background: #464649; outline: none; -webkit-appearance: none;">
				<div style="display: flex; justify-content: space-between; font-size: 12px; color: #a0a0a3; margin-top: 5px;">
					<span>短</span><span>長</span>
				</div>
			</div>
			
			<div style="margin-bottom: 20px;">
				<label style="color: white; font-size: 14px; display: block; margin-bottom: 10px;">
					文字影の透明度: <span id="tcf-global-shadow-opacity-value">${Math.round(settings.shadowOpacity * 100)}</span>%
				</label>
				<input type="range" id="tcf-global-shadow-opacity-slider" min="0" max="100" value="${Math.round(settings.shadowOpacity * 100)}" step="5"
					   style="width: 100%; height: 8px; border-radius: 4px; background: #464649; outline: none; -webkit-appearance: none;">
				<div style="display: flex; justify-content: space-between; font-size: 12px; color: #a0a0a3; margin-top: 5px;">
					<span>透明</span><span>濃い</span>
				</div>
			</div>
			
			<div style="margin-bottom: 20px;">
				<label style="color: white; font-size: 14px; display: block; margin-bottom: 10px;">
					文字の透明度: <span id="tcf-global-text-opacity-value">${Math.round(settings.textOpacity * 100)}</span>%
				</label>
				<input type="range" id="tcf-global-text-opacity-slider" min="10" max="100" value="${Math.round(settings.textOpacity * 100)}" step="5"
					   style="width: 100%; height: 8px; border-radius: 4px; background: #464649; outline: none; -webkit-appearance: none;">
				<div style="display: flex; justify-content: space-between; font-size: 12px; color: #a0a0a3; margin-top: 5px;">
					<span>薄い</span><span>濃い</span>
				</div>
			</div>
			
			<div style="margin-bottom: 20px;">
				<label style="color: white; font-size: 14px; display: block; margin-bottom: 10px;">
					文字の太さ: <span id="tcf-global-font-weight-value">${settings.fontWeight}</span>
				</label>
				<input type="range" id="tcf-global-font-weight-slider" min="100" max="900" value="${settings.fontWeight}" step="100"
					   style="width: 100%; height: 8px; border-radius: 4px; background: #464649; outline: none; -webkit-appearance: none;">
				<div style="display: flex; justify-content: space-between; font-size: 12px; color: #a0a0a3; margin-top: 5px;">
					<span>細</span><span>太</span>
				</div>
			</div>
			
			<div style="margin-bottom: 25px;">
				<label style="color: white; font-size: 14px; display: block; margin-bottom: 10px;">コメント密度が高い時：</label>
				<div style="display: flex; gap: 20px; margin-top: 8px;">
					<label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 14px; color: white;">
						<input type="radio" name="tcf-comment-overflow" value="overlap" id="tcf-global-overflow-overlap" ${settings.commentOverflow === 'overlap' ? 'checked' : ''}
							   style="width: 16px; height: 16px; margin: 0;">
						<span style="user-select: none;">重ねて表示</span>
					</label>
					<label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 14px; color: white;">
						<input type="radio" name="tcf-comment-overflow" value="hide" id="tcf-global-overflow-hide" ${settings.commentOverflow === 'hide' ? 'checked' : ''}
							   style="width: 16px; height: 16px; margin: 0;">
						<span style="user-select: none;">非表示</span>
					</label>
				</div>
			</div>
			
			<div style="margin-bottom: 25px;">
				<label style="color: white; font-size: 14px; display: block; margin-bottom: 10px;">
					コメント遅延: <span id="tcf-global-delay-value">${settings.delay}</span>秒
				</label>
				<input type="range" id="tcf-global-delay-slider" min="0" max="30" value="${settings.delay}" step="1"
					   style="width: 100%; height: 8px; border-radius: 4px; background: #464649; outline: none; -webkit-appearance: none;">
				<div style="display: flex; justify-content: space-between; font-size: 12px; color: #a0a0a3; margin-top: 5px;">
					<span>即時</span><span>30秒</span>
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
		const shadowOpacitySlider = popup.querySelector('#tcf-global-shadow-opacity-slider');
		const shadowOpacityValue = popup.querySelector('#tcf-global-shadow-opacity-value');
		const textOpacitySlider = popup.querySelector('#tcf-global-text-opacity-slider');
		const textOpacityValue = popup.querySelector('#tcf-global-text-opacity-value');
		const fontWeightSlider = popup.querySelector('#tcf-global-font-weight-slider');
		const fontWeightValue = popup.querySelector('#tcf-global-font-weight-value');
		const overflowOverlap = popup.querySelector('#tcf-global-overflow-overlap');
		const overflowHide = popup.querySelector('#tcf-global-overflow-hide');
		const delaySlider = popup.querySelector('#tcf-global-delay-slider');
		const delayValue = popup.querySelector('#tcf-global-delay-value');
		const closeBtn = popup.querySelector('#tcf-global-close-btn');
		
		const saveSettings = async () => {
			try {
				await browser.storage.local.set({
					twitchChatFlowEnabled: settings.enabled,
					twitchChatFlowFontSize: settings.fontSize,
					twitchChatFlowDuration: settings.duration,
					twitchChatFlowShadowOpacity: settings.shadowOpacity,
					twitchChatFlowTextOpacity: settings.textOpacity,
					twitchChatFlowFontWeight: settings.fontWeight,
					twitchChatFlowCommentOverflow: settings.commentOverflow,
					twitchChatFlowDelay: settings.delay
				});
				console.log('💾 Global settings saved to browser.storage:', settings);
				
				// コアエンジンに設定変更を通知
				if (core && core.onSettingsChange) {
					core.onSettingsChange(settings);
					console.log('✅ Settings applied to danmaku engine from popup');
				}
			} catch (error) {
				console.error('❌ Failed to save global settings:', error);
			}
		};
		
		enableToggle.addEventListener('change', async () => {
			settings.enabled = enableToggle.checked;
			await saveSettings();
		});
		
		fontSizeSlider.addEventListener('input', async () => {
			settings.fontSize = parseInt(fontSizeSlider.value);
			fontSizeValue.textContent = settings.fontSize;
			await saveSettings();
		});
		
		durationSlider.addEventListener('input', async () => {
			settings.duration = parseInt(durationSlider.value);
			durationValue.textContent = settings.duration;
			await saveSettings();
		});
		
		shadowOpacitySlider.addEventListener('input', async () => {
			settings.shadowOpacity = parseInt(shadowOpacitySlider.value) / 100;
			shadowOpacityValue.textContent = Math.round(settings.shadowOpacity * 100);
			await saveSettings();
		});
		
		textOpacitySlider.addEventListener('input', async () => {
			settings.textOpacity = parseInt(textOpacitySlider.value) / 100;
			textOpacityValue.textContent = Math.round(settings.textOpacity * 100);
			await saveSettings();
		});
		
		fontWeightSlider.addEventListener('input', async () => {
			settings.fontWeight = parseInt(fontWeightSlider.value);
			fontWeightValue.textContent = settings.fontWeight;
			await saveSettings();
		});
		
		overflowOverlap.addEventListener('change', async () => {
			if (overflowOverlap.checked) {
				settings.commentOverflow = 'overlap';
				await saveSettings();
			}
		});
		
		overflowHide.addEventListener('change', async () => {
			if (overflowHide.checked) {
				settings.commentOverflow = 'hide';
				await saveSettings();
			}
		});
		
		delaySlider.addEventListener('input', async () => {
			settings.delay = parseInt(delaySlider.value);
			delayValue.textContent = settings.delay;
			await saveSettings();
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
		
		const loadSettings = async () => {
			try {
				const result = await browser.storage.local.get({
					twitchChatFlowEnabled: true,
					twitchChatFlowFontSize: 24,
					twitchChatFlowDuration: 7,
					twitchChatFlowShadowOpacity: 0.8,
					twitchChatFlowTextOpacity: 1.0,
					twitchChatFlowFontWeight: 400,
					twitchChatFlowCommentOverflow: 'overlap',
					twitchChatFlowDelay: 0
				});
				
				settings.enabled = result.twitchChatFlowEnabled;
				settings.fontSize = result.twitchChatFlowFontSize;
				settings.duration = result.twitchChatFlowDuration;
				settings.shadowOpacity = result.twitchChatFlowShadowOpacity;
				settings.textOpacity = result.twitchChatFlowTextOpacity;
				settings.fontWeight = result.twitchChatFlowFontWeight;
				settings.commentOverflow = result.twitchChatFlowCommentOverflow;
				settings.delay = result.twitchChatFlowDelay;
				
				console.log('📖 Settings loaded from browser.storage:', settings);
				
				// コアエンジンに設定変更を通知
				if (core && core.onSettingsChange) {
					core.onSettingsChange(settings);
				}
			} catch (error) {
				console.log('📝 Using default settings:', error);
			}
		};
		
		// 初期設定読み込み
		await loadSettings();
		
		// browser.storage変更の監視
		browser.storage.onChanged.addListener((changes, namespace) => {
			if (namespace === 'local') {
				const relevantChanges = Object.keys(changes).filter(key => key.startsWith('twitchChatFlow'));
				if (relevantChanges.length > 0) {
					console.log('⚙️ Storage changed, reloading settings...', changes);
					loadSettings();
				}
			}
		});

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

		// 擬似フルスクリーン機能
		const PLAYER_SELECTORS = [
			'[data-test-selector="video-player__container"]',
			'.video-player__container',
			'[data-a-target="player-overlay-click-handler"]',
			'.video-player',
			'video'
		];
		
		const FULLSCREEN_BUTTON_SELECTORS = [
			'[data-a-target="player-fullscreen-button"]',
			'button[aria-label*="全画面"]',
			'button[aria-label*="fullscreen"]',
			'button[aria-label*="Fullscreen"]'
		];
		
		// 保存用の変数
		let fullscreenWrapper = null;
		let originalParent = null;
		let originalNextSibling = null;

		const enterPseudoFullscreen = () => {
			console.log('🖥️ Entering pseudo fullscreen mode');
			
			if (isPseudoFullscreen) return;
			
			const playerContainer = document.querySelector(PLAYER_SELECTORS.join(','));
			if (!playerContainer) {
				console.error('❌ Player container not found');
				return;
			}
			
			console.log('🎯 Found player container:', playerContainer);
			
			// 現在の親要素と位置を保存
			originalParent = playerContainer.parentNode;
			originalNextSibling = playerContainer.nextSibling;
			
			// 現在のスタイルを保存（computed styleも含める）
			const computedStyle = window.getComputedStyle(playerContainer);
			originalPlayerStyle = {
				position: playerContainer.style.position || computedStyle.position,
				top: playerContainer.style.top || computedStyle.top,
				left: playerContainer.style.left || computedStyle.left,
				width: playerContainer.style.width || computedStyle.width,
				height: playerContainer.style.height || computedStyle.height,
				zIndex: playerContainer.style.zIndex || computedStyle.zIndex,
				backgroundColor: playerContainer.style.backgroundColor || computedStyle.backgroundColor,
				transform: playerContainer.style.transform || computedStyle.transform,
				margin: playerContainer.style.margin || computedStyle.margin,
				padding: playerContainer.style.padding || computedStyle.padding
			};
			
			originalPageStyle = {
				overflow: document.body.style.overflow || '',
				margin: document.body.style.margin || '',
				padding: document.body.style.padding || ''
			};
			
			console.log('📱 Creating fullscreen wrapper at body level');
			
			// bodyの直下にフルスクリーンラッパーを作成
			fullscreenWrapper = document.createElement('div');
			fullscreenWrapper.className = 'twitch-chat-flow-fullscreen-wrapper';
			fullscreenWrapper.style.setProperty('position', 'fixed', 'important');
			fullscreenWrapper.style.setProperty('top', '0px', 'important');
			fullscreenWrapper.style.setProperty('left', '0px', 'important');
			fullscreenWrapper.style.setProperty('width', '100dvw', 'important');
			fullscreenWrapper.style.setProperty('height', '100dvh', 'important');
			fullscreenWrapper.style.setProperty('z-index', '2147483647', 'important');
			fullscreenWrapper.style.setProperty('background-color', '#000', 'important');
			fullscreenWrapper.style.setProperty('margin', '0', 'important');
			fullscreenWrapper.style.setProperty('padding', '0', 'important');
			
			// プレイヤーを新しいラッパーに移動
			document.body.appendChild(fullscreenWrapper);
			fullscreenWrapper.appendChild(playerContainer);
			
			// プレイヤー要素のスタイル調整
			playerContainer.style.setProperty('position', 'relative', 'important');
			playerContainer.style.setProperty('top', 'auto', 'important');
			playerContainer.style.setProperty('left', 'auto', 'important');
			playerContainer.style.setProperty('width', '100%', 'important');
			playerContainer.style.setProperty('height', '100%', 'important');
			playerContainer.style.setProperty('z-index', 'auto', 'important');
			playerContainer.style.setProperty('background-color', 'transparent', 'important');
			playerContainer.style.setProperty('transform', 'none', 'important');
			playerContainer.style.setProperty('margin', '0', 'important');
			playerContainer.style.setProperty('padding', '0', 'important');
			playerContainer.style.setProperty('max-width', 'none', 'important');
			playerContainer.style.setProperty('max-height', 'none', 'important');
			
			// ページのスクロールを有効化
			document.body.style.overflow = 'auto';
			document.body.style.margin = '0';
			document.body.style.padding = '0';
			
			// 擬似フルスクリーンクラスを追加
			playerContainer.classList.add('pseudo-fullscreen');
			document.body.classList.add('pseudo-fullscreen-active');
			
			// ビデオ要素も調整
			const video = playerContainer.querySelector('video');
			if (video) {
				video.style.setProperty('width', '100%', 'important');
				video.style.setProperty('height', '100%', 'important');
				video.style.setProperty('object-fit', 'contain', 'important');
				console.log('📺 Video element adjusted');
			}
			
			isPseudoFullscreen = true;
			console.log('✅ Pseudo fullscreen mode activated with body-level wrapper');
		};
		
		const exitPseudoFullscreen = () => {
			console.log('🔽 Exiting pseudo fullscreen mode');
			
			if (!isPseudoFullscreen) return;
			
			const playerContainer = document.querySelector(PLAYER_SELECTORS.join(','));
			if (playerContainer && originalParent && fullscreenWrapper) {
				// プレイヤーコンテナを元の位置に戻す
				console.log('📱 Restoring player container to original position');
				if (originalNextSibling) {
					originalParent.insertBefore(playerContainer, originalNextSibling);
				} else {
					originalParent.appendChild(playerContainer);
				}
				
				// すべての擬似フルスクリーン用のスタイルをリセット
				playerContainer.style.removeProperty('position');
				playerContainer.style.removeProperty('top');
				playerContainer.style.removeProperty('left');
				playerContainer.style.removeProperty('width');
				playerContainer.style.removeProperty('height');
				playerContainer.style.removeProperty('z-index');
				playerContainer.style.removeProperty('background-color');
				playerContainer.style.removeProperty('transform');
				playerContainer.style.removeProperty('margin');
				playerContainer.style.removeProperty('padding');
				playerContainer.style.removeProperty('max-width');
				playerContainer.style.removeProperty('max-height');
				
				// 元のスタイルがある場合は復元
				Object.keys(originalPlayerStyle).forEach(key => {
					if (originalPlayerStyle[key] && originalPlayerStyle[key] !== 'auto' && originalPlayerStyle[key] !== '') {
						playerContainer.style.setProperty(key, originalPlayerStyle[key]);
					}
				});
				
				// クラスを削除
				playerContainer.classList.remove('pseudo-fullscreen');
				
				// ビデオ要素のスタイルもリセット
				const video = playerContainer.querySelector('video');
				if (video) {
					video.style.removeProperty('width');
					video.style.removeProperty('height');
					video.style.removeProperty('object-fit');
					console.log('📺 Video element style reset');
				}
			}
			
			// フルスクリーンラッパーを削除
			if (fullscreenWrapper && fullscreenWrapper.parentNode) {
				fullscreenWrapper.parentNode.removeChild(fullscreenWrapper);
				console.log('🗑️ Fullscreen wrapper removed');
			}
			
			// ページスタイルを復元
			Object.keys(originalPageStyle).forEach(key => {
				if (originalPageStyle[key]) {
					document.body.style[key] = originalPageStyle[key];
				} else {
					document.body.style.removeProperty(key);
				}
			});
			
			
			document.body.classList.remove('pseudo-fullscreen-active');
			
			// 変数をリセット
			fullscreenWrapper = null;
			originalParent = null;
			originalNextSibling = null;
			
			isPseudoFullscreen = false;
			
			console.log('✅ Pseudo fullscreen mode deactivated and DOM restored');
		};
		
		const togglePseudoFullscreen = () => {
			if (isPseudoFullscreen) {
				exitPseudoFullscreen();
			} else {
				enterPseudoFullscreen();
			}
		};
		
		// フルスクリーンボタンのオーバーライド
		const overrideFullscreenButtons = () => {
			const fullscreenButtons = document.querySelectorAll(FULLSCREEN_BUTTON_SELECTORS.join(','));
			fullscreenButtons.forEach(button => {
				if (button.dataset.tcfOverridden) return;
				
				console.log('🔄 Overriding fullscreen button:', button);
				button.dataset.tcfOverridden = 'true';
				
				// 既存のイベントリスナーを削除
				const newButton = button.cloneNode(true);
				button.parentNode?.replaceChild(newButton, button);
				
				// 新しいイベントリスナーを追加
				newButton.addEventListener('click', (e) => {
					e.preventDefault();
					e.stopPropagation();
					togglePseudoFullscreen();
				}, true);
			});
		};
		
		// ESCキーでフルスクリーン解除
		const handleKeydown = (e) => {
			if (e.key === 'Escape' && isPseudoFullscreen) {
				exitPseudoFullscreen();
			}
		};
		
		// フルスクリーンボタンの監視と初期化
		const initPseudoFullscreen = () => {
			console.log('🖥️ Initializing pseudo fullscreen feature');
			
			// ESCキーイベントリスナーを追加
			document.addEventListener('keydown', handleKeydown, true);
			
			// 定期的にフルスクリーンボタンをオーバーライド
			setInterval(overrideFullscreenButtons, 2000);
			
			// 初回実行
			setTimeout(overrideFullscreenButtons, 1000);
			
			console.log('✅ Pseudo fullscreen feature initialized');
		};

		// styleタグを常に挿入して全体の高さを150%に設定
		const scrollStyle = document.createElement('style');
		scrollStyle.id = 'twitch-chat-flow-scroll-style';
		scrollStyle.textContent = `
			html, body, .root { 
				height: 150% !important; 
			}
		`;
		document.head.appendChild(scrollStyle);

		console.log('🚀 Starting main loop...');
		await getCore();
		if (!core) {
			console.error('❌ TwitchChatDanmaku: core not found, abort!');
			return;
		}

		// 擬似フルスクリーン機能を初期化
		initPseudoFullscreen();

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


		// danmakuコンテナ初期化
		const initDanmakuContainer = async () => {
			await reset();
			$danmakuContainer = document.createElement('div');
			$danmakuContainer.setAttribute('id', 'danmaku-container');
			$danmakuContainer.setAttribute('data-danmaku-mode', settings.mode);
			$video.appendChild($danmakuContainer);
			console.log('✅ New danmaku container created and added to video:', $danmakuContainer);
			
			
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