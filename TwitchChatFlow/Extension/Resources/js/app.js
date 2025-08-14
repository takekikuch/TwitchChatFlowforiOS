(() => {
	console.log('🎉 Twitch Chat Flow: Extension loaded!');
	
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
		'.vod-message',
		'.chat-line__no-background'
	].map(e => `${e}:not([data-danmaku-ready])`);

	const CHAT_USERNAME_SELECTORS = [
		'[data-test-selector="message-username"]',
		'.chat-line__username',
		'.chat-author__display-name',
		'.vod-message .video-chat__message-author',
		'.chat-author__intl-login'
	];
	const CHAT_MESSAGE_SELECTORS = [
		'[data-test-selector="message-text"]',
		'.chat-line__message-container .text-fragment',
		'.chat-line__message-container .chat-line__username-container ~ span:last-of-type',
		'.message',
		'.vod-message .video-chat__message > span ~ span:last-of-type'
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
		
		try {
			const savedEnabled = localStorage.getItem('twitchChatFlowEnabled');
			if (savedEnabled !== null) {
				settings.enabled = JSON.parse(savedEnabled);
				console.log('📖 Settings loaded from localStorage:', settings.enabled);
			}
		} catch (error) {
			console.log('📝 Using default settings');
		}
		let core;

		const isDanmakuWorking = () => (
			($danmakuContainer && document.body.contains($danmakuContainer)) &&
			($video && document.body.contains($video)) &&
			($chat && document.body.contains($chat))
		);

		const getUnprocessedChats = () => waitUntil(() => getElementsBySelectors(RAW_CHAT_SELECTORS, $chat));

		const processChat = async ($chat) => {
			$chat.setAttribute('data-danmaku-ready', true);
			const $username = (await getElementsBySelectors(CHAT_USERNAME_SELECTORS, $chat))[0];
			const $message = (await getElementsBySelectors(CHAT_MESSAGE_SELECTORS, $chat))[0];

			if ($username && $message) {
				core?.onDanmaku?.($username.cloneNode(true), $message.cloneNode(true));
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
			await getCore();
			[...document.querySelectorAll('#danmaku-container')].forEach($el => $el.remove());
		};

		// danmakuコンテナ初期化
		const initDanmakuContainer = async () => {
			await reset();
			$danmakuContainer = document.createElement('div');
			$danmakuContainer.setAttribute('id', 'danmaku-container');
			$danmakuContainer.setAttribute('data-danmaku-mode', settings.mode);
			$video.appendChild($danmakuContainer);
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
			if (await waitUntil(() => !isDanmakuWorking(), { interval: 1000 })) {
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