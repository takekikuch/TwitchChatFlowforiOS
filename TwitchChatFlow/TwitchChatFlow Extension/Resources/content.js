(() => {
	console.log('🎉 Twitch Chat Flow: Extension loaded!');
	
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
		commentOverflow: 'overlap'
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
			danmakuDensity: 3
		};
		
		try {
			const result = await browser.storage.local.get({
				twitchChatFlowEnabled: true,
				twitchChatFlowFontSize: 24,
				twitchChatFlowDuration: 7,
				twitchChatFlowShadowOpacity: 0.8,
				twitchChatFlowTextOpacity: 1.0,
				twitchChatFlowFontWeight: 400,
				twitchChatFlowCommentOverflow: 'overlap'
			});
			
			settings.enabled = result.twitchChatFlowEnabled;
			settings.fontSize = result.twitchChatFlowFontSize;
			settings.duration = result.twitchChatFlowDuration;
			settings.shadowOpacity = result.twitchChatFlowShadowOpacity;
			settings.textOpacity = result.twitchChatFlowTextOpacity;
			settings.fontWeight = result.twitchChatFlowFontWeight;
			settings.commentOverflow = result.twitchChatFlowCommentOverflow;
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
					twitchChatFlowCommentOverflow: settings.commentOverflow
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
					twitchChatFlowCommentOverflow: 'overlap'
				});
				
				settings.enabled = result.twitchChatFlowEnabled;
				settings.fontSize = result.twitchChatFlowFontSize;
				settings.duration = result.twitchChatFlowDuration;
				settings.shadowOpacity = result.twitchChatFlowShadowOpacity;
				settings.textOpacity = result.twitchChatFlowTextOpacity;
				settings.fontWeight = result.twitchChatFlowFontWeight;
				settings.commentOverflow = result.twitchChatFlowCommentOverflow;
				
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