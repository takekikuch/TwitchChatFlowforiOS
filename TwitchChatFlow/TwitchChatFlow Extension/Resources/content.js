(() => {
	// Danmaku Flow Chat: Extension loaded
	
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
		
		if (message.action === 'showSettingsPopup') {
			try {
				showGlobalSettingsPopup();
				sendResponse({ success: true, message: 'Settings popup created successfully' });
			} catch (error) {
				sendResponse({ success: false, error: error.message });
			}
		} else if (message.action === 'updateSettings') {
			try {
				// グローバル設定を更新
				Object.assign(settings, message.settings);
				// コアエンジンに設定変更を通知
				if (core && core.onSettingsChange) {
					core.onSettingsChange(settings);
				}
				sendResponse({ success: true, message: 'Settings updated successfully' });
			} catch (error) {
				sendResponse({ success: false, error: error.message });
			}
		}
		
		// 非同期レスポンスを示すため true を返す
		return true;
	});
	
	// グローバル設定ポップアップ表示関数（iOS Safari Extension対応）
	window.showGlobalSettingsPopup = window.showGlobalSettingsPopup = async () => {
		
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
	} catch (error) {
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
			<h2 style="margin: 0; font-size: 18px; font-weight: 600;">${browser.i18n.getMessage('extensionName')}</h2>
			<p style="margin: 5px 0 0 0; font-size: 14px; color: #a0a0a3;">${browser.i18n.getMessage('appSubtitle')}</p>
		</div>
		
		<div style="margin-bottom: 20px;">
			<label style="color: white; display: flex; align-items: center; gap: 10px; cursor: pointer;">
				<input type="checkbox" id="tcf-global-enable-toggle" ${settings.enabled ? 'checked' : ''} 
					   style="transform: scale(1.3);">
				<span style="font-size: 16px;">${browser.i18n.getMessage('enableDanmaku')}</span>
			</label>
		</div>
		
		<div style="margin-bottom: 20px;">
			<label style="color: white; font-size: 14px; display: block; margin-bottom: 10px;">
				${browser.i18n.getMessage('fontSize')}: <span id="tcf-global-font-size-value">${settings.fontSize}</span>${browser.i18n.getMessage('unitPixels')}
			</label>
			<input type="range" id="tcf-global-font-size-slider" min="12" max="48" value="${settings.fontSize}" step="2"
				   style="width: 100%; height: 8px; border-radius: 4px; background: #464649; outline: none; -webkit-appearance: none;">
			<div style="display: flex; justify-content: space-between; font-size: 12px; color: #a0a0a3; margin-top: 5px;">
				<span>${browser.i18n.getMessage('sizeSmall')}</span><span>${browser.i18n.getMessage('sizeLarge')}</span>
			</div>
		</div>
		
		<div style="margin-bottom: 20px;">
			<label style="color: white; font-size: 14px; display: block; margin-bottom: 10px;">
				${browser.i18n.getMessage('displayDuration')}: <span id="tcf-global-duration-value">${settings.duration}</span> ${browser.i18n.getMessage('unitSeconds')}
			</label>
			<input type="range" id="tcf-global-duration-slider" min="3" max="15" value="${settings.duration}" step="1"
				   style="width: 100%; height: 8px; border-radius: 4px; background: #464649; outline: none; -webkit-appearance: none;">
			<div style="display: flex; justify-content: space-between; font-size: 12px; color: #a0a0a3; margin-top: 5px;">
				<span>${browser.i18n.getMessage('durationShort')}</span><span>${browser.i18n.getMessage('durationLong')}</span>
			</div>
		</div>
		
		<div style="margin-bottom: 20px;">
			<label style="color: white; font-size: 14px; display: block; margin-bottom: 10px;">
				${browser.i18n.getMessage('shadowOpacity')}: <span id="tcf-global-shadow-opacity-value">${Math.round(settings.shadowOpacity * 100)}</span>${browser.i18n.getMessage('unitPercent')}
			</label>
			<input type="range" id="tcf-global-shadow-opacity-slider" min="0" max="100" value="${Math.round(settings.shadowOpacity * 100)}" step="5"
				   style="width: 100%; height: 8px; border-radius: 4px; background: #464649; outline: none; -webkit-appearance: none;">
			<div style="display: flex; justify-content: space-between; font-size: 12px; color: #a0a0a3; margin-top: 5px;">
				<span>${browser.i18n.getMessage('opacityTransparent')}</span><span>${browser.i18n.getMessage('opacityOpaque')}</span>
			</div>
		</div>
		
		<div style="margin-bottom: 20px;">
			<label style="color: white; font-size: 14px; display: block; margin-bottom: 10px;">
				${browser.i18n.getMessage('textOpacity')}: <span id="tcf-global-text-opacity-value">${Math.round(settings.textOpacity * 100)}</span>${browser.i18n.getMessage('unitPercent')}
			</label>
			<input type="range" id="tcf-global-text-opacity-slider" min="10" max="100" value="${Math.round(settings.textOpacity * 100)}" step="5"
				   style="width: 100%; height: 8px; border-radius: 4px; background: #464649; outline: none; -webkit-appearance: none;">
			<div style="display: flex; justify-content: space-between; font-size: 12px; color: #a0a0a3; margin-top: 5px;">
				<span>${browser.i18n.getMessage('opacityLight')}</span><span>${browser.i18n.getMessage('opacityDark')}</span>
			</div>
		</div>
		
		<div style="margin-bottom: 20px;">
			<label style="color: white; font-size: 14px; display: block; margin-bottom: 10px;">
				${browser.i18n.getMessage('fontWeight')}: <span id="tcf-global-font-weight-value">${settings.fontWeight}</span>
			</label>
			<input type="range" id="tcf-global-font-weight-slider" min="100" max="900" value="${settings.fontWeight}" step="100"
				   style="width: 100%; height: 8px; border-radius: 4px; background: #464649; outline: none; -webkit-appearance: none;">
			<div style="display: flex; justify-content: space-between; font-size: 12px; color: #a0a0a3; margin-top: 5px;">
				<span>${browser.i18n.getMessage('weightThin')}</span><span>${browser.i18n.getMessage('weightBold')}</span>
			</div>
		</div>
		
		<div style="margin-bottom: 25px;">
			<label style="color: white; font-size: 14px; display: block; margin-bottom: 10px;">${browser.i18n.getMessage('commentDensity')}</label>
			<div style="display: flex; gap: 20px; margin-top: 8px;">
				<label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 14px; color: white;">
					<input type="radio" name="tcf-comment-overflow" value="overlap" id="tcf-global-overflow-overlap" ${settings.commentOverflow === 'overlap' ? 'checked' : ''}
						   style="width: 16px; height: 16px; margin: 0;">
					<span style="user-select: none;">${browser.i18n.getMessage('overlapDisplay')}</span>
				</label>
				<label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 14px; color: white;">
					<input type="radio" name="tcf-comment-overflow" value="hide" id="tcf-global-overflow-hide" ${settings.commentOverflow === 'hide' ? 'checked' : ''}
						   style="width: 16px; height: 16px; margin: 0;">
					<span style="user-select: none;">${browser.i18n.getMessage('hideComments')}</span>
				</label>
			</div>
		</div>
		
		<div style="margin-bottom: 25px;">
			<label style="color: white; font-size: 14px; display: block; margin-bottom: 10px;">
				${browser.i18n.getMessage('commentDelay')}: <span id="tcf-global-delay-value">${settings.delay}</span> ${browser.i18n.getMessage('unitSeconds')}
			</label>
			<input type="range" id="tcf-global-delay-slider" min="0" max="30" value="${settings.delay}" step="1"
				   style="width: 100%; height: 8px; border-radius: 4px; background: #464649; outline: none; -webkit-appearance: none;">
			<div style="display: flex; justify-content: space-between; font-size: 12px; color: #a0a0a3; margin-top: 5px;">
				<span>${browser.i18n.getMessage('delayImmediate')}</span><span>${browser.i18n.getMessage('delay30Seconds')}</span>
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
			">${browser.i18n.getMessage('closeButton')}</button>
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
			
			// コアエンジンに設定変更を通知
			if (core && core.onSettingsChange) {
				core.onSettingsChange(settings);
			}
		} catch (error) {
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
	
};;
	
		const VIDEO_CONTAINER_SELECTORS = [
			'[data-test-selector="video-player__video-container"]',
			'[data-test-selector="video-player__container"]',
			'.video-player__container',
			'[data-a-target="video-ref"]',
			'.video-ref',
			'[data-a-target="player-overlay-click-handler"]'
		];
	const CHAT_CONTAINER_SELECTORS = [
		'[data-test-selector="chat-scrollable-area__message-container"]',
		'.chat-scrollable-area__message-container',
		'[data-test-selector="video-chat-message-list-wrapper"]',
		'.video-chat__message-list-wrapper',
		'.chat-list--default'
	];
	const PLAYER_ROOT_SELECTORS = [
		'.video-player__default-player',
		'[data-test-selector="video-player__container"]',
		'.video-player__container',
		'.video-player'
	];
	const FULLSCREEN_BUTTON_SELECTORS = [
		'[data-a-target="player-fullscreen-button"]',
		'button[aria-label*="フルスクリーン"]',
		'button[aria-label*="fullscreen"]',
		'button[aria-label*="Fullscreen"]',
		'button[aria-label*="全画面"]'
	];
		const VIDEO_SURFACE_SELECTORS = [
			'[data-a-target="video-player"]',
			'.video-player',
			'.video-player__container',
			'.playerContainerMWeb--WuAj6',
			'[data-a-target="video-ref"]',
			'.video-ref'
		];
	const PSEUDO_FULLSCREEN_CLASS = 'tcf-pseudo-fullscreen';
	const PSEUDO_FULLSCREEN_SURFACE_CLASS = 'tcf-pseudo-fullscreen-surface';
	const PSEUDO_FULLSCREEN_OBSERVER_SELECTORS = [
		'.player-controls',
		'.player-controls__right-control-group',
		'[data-a-target="player-overlay-click-handler"]',
		'[class*="toggleControls--"]',
		...FULLSCREEN_BUTTON_SELECTORS
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

		const findFirstElementBySelectors = (selectors, $parent) => {
			const searchRoot = $parent || document;
			for (const selector of selectors) {
				const $el = searchRoot.querySelector(selector);
				if ($el) {
					return $el;
				}
			}
			return null;
		};

		const getVideoContainer = () => {
			return waitUntil(() => findFirstElementBySelectors(VIDEO_CONTAINER_SELECTORS), { timeout: 15000 });
		};
		const getChatContainer = () => {
			return waitUntil(() => findFirstElementBySelectors(CHAT_CONTAINER_SELECTORS), { timeout: 15000 });
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
				
				
				// コアエンジンに設定変更を通知
				if (core && core.onSettingsChange) {
					core.onSettingsChange(settings);
				}
			} catch (error) {
			}
		};
		
		// 初期設定読み込み
		await loadSettings();
		
		// browser.storage変更の監視
		browser.storage.onChanged.addListener((changes, namespace) => {
			if (namespace === 'local') {
				const relevantChanges = Object.keys(changes).filter(key => key.startsWith('twitchChatFlow'));
				if (relevantChanges.length > 0) {
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
			
			
			return allWorking;
		};

		const getUnprocessedChats = () => {
			return waitUntil(() => getElementsBySelectors(RAW_CHAT_SELECTORS, $chat)).then(chats => {
				return chats;
			});
		};

		const processChat = async ($chat) => {
			$chat.setAttribute('data-danmaku-ready', true);
			
			const $username = (await getElementsBySelectors(CHAT_USERNAME_SELECTORS, $chat))[0];
			const $message = (await getElementsBySelectors(CHAT_MESSAGE_SELECTORS, $chat))[0];

			
			if ($username && $message) {
				const usernameText = $username.textContent || $username.innerText;
				const messageText = $message.textContent || $message.innerText;
				core?.onDanmaku?.($username.cloneNode(true), $message.cloneNode(true));
			} else {
			}
		}

		const getCore = async () => {
			try {
				core = await waitUntil(() => window._twitchChatDanmaku?.[settings.mode], { timeout: 5000 });
			} catch (ex) {
			}
			return core;
		}

		let pseudoFullscreenActive = false;
		let pseudoFullscreenRoot = null;
		let pseudoFullscreenListenersBound = false;
		let pseudoFullscreenObserver = null;
		let pseudoFullscreenObserverRoot = null;
		let pseudoFullscreenRetryTimers = [];
		let fullscreenVideo = null;
		let fullscreenButtonBound = null;
		let pseudoFullscreenSurface = null;
		let pseudoFullscreenToggleStamp = 0;

		const getViewportMetrics = () => {
			const viewport = window.visualViewport;
			const layoutWidth = Math.round(window.innerWidth || document.documentElement.clientWidth || 0);
			const layoutHeight = Math.round(window.innerHeight || document.documentElement.clientHeight || 0);
			const top = Math.max(0, Math.round(viewport?.offsetTop || 0));
			const left = Math.max(0, Math.round(viewport?.offsetLeft || 0));
			const rawWidth = Math.round(viewport?.width || layoutWidth || 0);
			const rawHeight = Math.round(viewport?.height || layoutHeight || 0);
			return {
				width: Math.max(0, Math.min(rawWidth, Math.max(0, layoutWidth - left) || rawWidth)),
				height: Math.max(0, Math.min(rawHeight, Math.max(0, layoutHeight - top) || rawHeight)),
				top,
				left
			};
		};

		const getFullscreenButton = () => {
			const searchRoot = $video && document.body.contains($video) ? $video.closest(PLAYER_ROOT_SELECTORS.join(',')) || document : document;
			return searchRoot.querySelector(FULLSCREEN_BUTTON_SELECTORS.join(',')) || document.querySelector(FULLSCREEN_BUTTON_SELECTORS.join(','));
		};

		const isDesktopTwitchLayout = () => {
			return Boolean(document.querySelector('.persistent-player')) && !Boolean(document.querySelector('[class*="toggleControls--"]'));
		};

		const findPseudoFullscreenContainerFrom = (startElement) => {
			for (let element = startElement; element && element !== document.body; element = element.parentElement) {
				const hasVideo = Boolean(element.querySelector('video'));
				const hasVideoSurface = Boolean(element.querySelector(VIDEO_SURFACE_SELECTORS.join(',')));
				const hasControllerLayer = Boolean(element.querySelector('.video-player__default-player')) || Boolean(element.querySelector('.player-controls'));
				if (hasVideo && hasVideoSurface && hasControllerLayer) {
					return element;
				}
			}
			return null;
		};

		const getPseudoFullscreenRoot = () => {
			const fullscreenButton = getFullscreenButton();
			return fullscreenButton?.closest('.video-player__default-player')
				|| $video?.closest?.('.video-player__default-player')
				|| document.querySelector('.video-player__default-player')
				|| fullscreenButton?.closest(PLAYER_ROOT_SELECTORS.join(','))
				|| $video?.closest?.(PLAYER_ROOT_SELECTORS.join(','))
				|| $video?.parentElement
				|| null;
		};

		const getPseudoFullscreenSurface = () => {
			const fullscreenButton = getFullscreenButton();
			const container = findPseudoFullscreenContainerFrom(fullscreenButton)
				|| findPseudoFullscreenContainerFrom($video)
				|| findPseudoFullscreenContainerFrom(document.querySelector('.video-player__default-player'));
			return container?.querySelector(VIDEO_SURFACE_SELECTORS.join(','))
				|| $video?.closest?.(VIDEO_SURFACE_SELECTORS.join(','))
				|| document.querySelector(VIDEO_SURFACE_SELECTORS.join(','))
				|| null;
		};

		const clearPseudoFullscreenViewport = (element) => {
			if (!element) {
				return;
			}
			element.style.removeProperty('--tcf-viewport-width');
			element.style.removeProperty('--tcf-viewport-height');
			element.style.removeProperty('--tcf-viewport-top');
			element.style.removeProperty('--tcf-viewport-left');
		};

		const applyPseudoFullscreenViewport = () => {
			if (!pseudoFullscreenActive || !pseudoFullscreenRoot || !document.body.contains(pseudoFullscreenRoot)) {
				return;
			}

			const { width, height, top, left } = getViewportMetrics();
			[pseudoFullscreenSurface, pseudoFullscreenRoot].forEach(element => {
				if (!element) {
					return;
				}
				element.style.setProperty('--tcf-viewport-width', `${width}px`);
				element.style.setProperty('--tcf-viewport-height', `${height}px`);
				element.style.setProperty('--tcf-viewport-top', `${top}px`);
				element.style.setProperty('--tcf-viewport-left', `${left}px`);
			});
		};

		const syncPseudoFullscreenRoot = () => {
			const nextRoot = getPseudoFullscreenRoot();
			const nextSurface = getPseudoFullscreenSurface();
			if (!nextRoot) {
				return;
			}

			if (pseudoFullscreenRoot && pseudoFullscreenRoot !== nextRoot) {
				pseudoFullscreenRoot.classList.remove(PSEUDO_FULLSCREEN_CLASS);
				clearPseudoFullscreenViewport(pseudoFullscreenRoot);
			}
			if (pseudoFullscreenSurface && pseudoFullscreenSurface !== nextSurface) {
				pseudoFullscreenSurface.classList.remove(PSEUDO_FULLSCREEN_SURFACE_CLASS);
				clearPseudoFullscreenViewport(pseudoFullscreenSurface);
			}

			pseudoFullscreenRoot = nextRoot;
			pseudoFullscreenSurface = nextSurface;
			if (!pseudoFullscreenActive) {
				return;
			}

			pseudoFullscreenSurface?.classList.add(PSEUDO_FULLSCREEN_SURFACE_CLASS);
			pseudoFullscreenRoot.classList.add(PSEUDO_FULLSCREEN_CLASS);
			applyPseudoFullscreenViewport();
		};

		const setPseudoFullscreenActive = (nextState) => {
			if (nextState) {
				syncPseudoFullscreenRoot();
				if (!pseudoFullscreenRoot) {
					return;
				}
				pseudoFullscreenActive = true;
				pseudoFullscreenSurface?.classList.add(PSEUDO_FULLSCREEN_SURFACE_CLASS);
				pseudoFullscreenRoot.classList.add(PSEUDO_FULLSCREEN_CLASS);
				applyPseudoFullscreenViewport();
			} else {
				pseudoFullscreenActive = false;
				pseudoFullscreenSurface?.classList.remove(PSEUDO_FULLSCREEN_SURFACE_CLASS);
				pseudoFullscreenRoot?.classList.remove(PSEUDO_FULLSCREEN_CLASS);
				clearPseudoFullscreenViewport(pseudoFullscreenSurface);
				clearPseudoFullscreenViewport(pseudoFullscreenRoot);
			}
		};

		const clearPseudoFullscreenRetryTimers = () => {
			pseudoFullscreenRetryTimers.forEach(timer => clearTimeout(timer));
			pseudoFullscreenRetryTimers = [];
		};

		const interceptFullscreen = (event) => {
			const now = Date.now();
			if (now - pseudoFullscreenToggleStamp < 250) {
				event.preventDefault();
				event.stopPropagation();
				event.stopImmediatePropagation?.();
				return;
			}

			pseudoFullscreenToggleStamp = now;
			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation?.();
			setPseudoFullscreenActive(!pseudoFullscreenActive);
		};

		const unbindFullscreenButtonInterceptor = () => {
			if (!fullscreenButtonBound) {
				return;
			}

			fullscreenButtonBound.removeEventListener('touchend', interceptFullscreen, true);
			fullscreenButtonBound.removeEventListener('pointerup', interceptFullscreen, true);
			fullscreenButtonBound.removeEventListener('click', interceptFullscreen, true);
			delete fullscreenButtonBound.dataset.tcfPseudoBound;
			fullscreenButtonBound = null;
		};

		const ensureFullscreenButtonInterceptor = () => {
			if (isDesktopTwitchLayout()) {
				unbindFullscreenButtonInterceptor();
				if (pseudoFullscreenActive) {
					setPseudoFullscreenActive(false);
				}
				return;
			}

			const fullscreenButton = getFullscreenButton();
			if (!fullscreenButton) {
				unbindFullscreenButtonInterceptor();
				return;
			}

			if (fullscreenButtonBound === fullscreenButton && fullscreenButton.dataset.tcfPseudoBound === 'true') {
				return;
			}

			unbindFullscreenButtonInterceptor();
			fullscreenButton.dataset.tcfPseudoBound = 'true';
			fullscreenButton.addEventListener('touchend', interceptFullscreen, true);
			fullscreenButton.addEventListener('pointerup', interceptFullscreen, true);
			fullscreenButton.addEventListener('click', interceptFullscreen, true);
			fullscreenButtonBound = fullscreenButton;
		};

		const scheduleEnsureFullscreenButtonInterceptor = (delays = [0, 120, 280, 520, 900]) => {
			clearPseudoFullscreenRetryTimers();
			delays.forEach(delay => {
				const timer = setTimeout(() => {
					bindPseudoFullscreenVideoListeners();
					bindPseudoFullscreenObserver();
					ensureFullscreenButtonInterceptor();
					syncPseudoFullscreenRoot();
				}, delay);
				pseudoFullscreenRetryTimers.push(timer);
			});
		};

		const elementMatchesPseudoFullscreenUi = (element) => {
			if (!(element instanceof Element)) {
				return false;
			}

			return PSEUDO_FULLSCREEN_OBSERVER_SELECTORS.some(selector => {
				try {
					return element.matches(selector) || Boolean(element.closest(selector)) || Boolean(element.querySelector?.(selector));
				} catch (error) {
					return false;
				}
			});
		};

		const bindPseudoFullscreenObserver = () => {
			const nextRoot = findPseudoFullscreenContainerFrom(getFullscreenButton())
				|| findPseudoFullscreenContainerFrom($video)
				|| getPseudoFullscreenRoot();
			if (!nextRoot || !document.body.contains(nextRoot)) {
				return;
			}

			if (pseudoFullscreenObserverRoot === nextRoot && pseudoFullscreenObserver) {
				return;
			}

			pseudoFullscreenObserver?.disconnect();
			pseudoFullscreenObserverRoot = nextRoot;
			pseudoFullscreenObserver = new MutationObserver((mutations) => {
				const shouldRebind = mutations.some(mutation => {
					if (mutation.type === 'attributes') {
						return elementMatchesPseudoFullscreenUi(mutation.target);
					}

					return [...mutation.addedNodes, ...mutation.removedNodes].some(node => elementMatchesPseudoFullscreenUi(node));
				});

				if (!shouldRebind) {
					return;
				}

				scheduleEnsureFullscreenButtonInterceptor();
			});
			pseudoFullscreenObserver.observe(nextRoot, {
				subtree: true,
				childList: true,
				attributes: true,
				attributeFilter: ['class', 'style', 'aria-hidden']
			});
		};

		const handlePseudoFullscreenViewportChange = () => {
			bindPseudoFullscreenVideoListeners();
			bindPseudoFullscreenObserver();
			syncPseudoFullscreenRoot();
		};

		const handleNativeFullscreenStateChange = () => {
			if (!document.fullscreenElement && !document.webkitFullscreenElement) {
				scheduleEnsureFullscreenButtonInterceptor([0, 180, 420, 760]);
				handlePseudoFullscreenViewportChange();
				return;
			}

			if (pseudoFullscreenActive) {
				setPseudoFullscreenActive(false);
			}
		};

		const bindPseudoFullscreenListeners = () => {
			if (pseudoFullscreenListenersBound) {
				return;
			}

			window.addEventListener('resize', handlePseudoFullscreenViewportChange, true);
			window.addEventListener('orientationchange', handlePseudoFullscreenViewportChange, true);
			window.visualViewport?.addEventListener('resize', handlePseudoFullscreenViewportChange);
			window.visualViewport?.addEventListener('scroll', handlePseudoFullscreenViewportChange);
			document.addEventListener('fullscreenchange', handleNativeFullscreenStateChange, true);
			document.addEventListener('webkitfullscreenchange', handleNativeFullscreenStateChange, true);
			document.addEventListener('keydown', (event) => {
				if (event.key === 'Escape' && pseudoFullscreenActive) {
					setPseudoFullscreenActive(false);
				}
			}, true);
			pseudoFullscreenListenersBound = true;
		};

		const bindPseudoFullscreenVideoListeners = () => {
			const nextVideo = $video?.querySelector('video') || document.querySelector('video');
			if (!nextVideo || nextVideo === fullscreenVideo) {
				return;
			}

			if (fullscreenVideo) {
				fullscreenVideo.removeEventListener('webkitbeginfullscreen', handleNativeFullscreenStateChange, true);
				fullscreenVideo.removeEventListener('webkitendfullscreen', handleNativeFullscreenStateChange, true);
				fullscreenVideo.removeEventListener('webkitpresentationmodechanged', handleNativeFullscreenStateChange, true);
			}

			fullscreenVideo = nextVideo;
			fullscreenVideo.addEventListener('webkitbeginfullscreen', handleNativeFullscreenStateChange, true);
			fullscreenVideo.addEventListener('webkitendfullscreen', handleNativeFullscreenStateChange, true);
			fullscreenVideo.addEventListener('webkitpresentationmodechanged', handleNativeFullscreenStateChange, true);
		};

		await getCore();
		if (!core) {
			return;
		}

		const reset = async () => {
			const existingContainers = [...document.querySelectorAll('#danmaku-container')];
			await getCore();
			existingContainers.forEach($el => {
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
			
			
			core?.init?.($danmakuContainer, settings);
			bindPseudoFullscreenListeners();
			bindPseudoFullscreenVideoListeners();
			bindPseudoFullscreenObserver();
			ensureFullscreenButtonInterceptor();
			scheduleEnsureFullscreenButtonInterceptor([0, 180, 420, 760]);
			syncPseudoFullscreenRoot();

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
		while (true) {
			if (await waitUntil(() => !isDanmakuWorking(), { interval: 3000 })) {
				$chat = await getChatContainer();
				$video = await getVideoContainer();

				if (document.body.contains($chat) && document.body.contains($video)) {
					await initDanmakuContainer();
				}
			}
		}
	})();
})();
