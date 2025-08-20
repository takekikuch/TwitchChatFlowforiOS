console.log('🎯 Twitch Chat Flow: Default.js loaded!');

if (typeof window._twitchChatDanmaku === 'undefined') {
	window._twitchChatDanmaku = {};
}

(() => {
	let $container;
	let settings = {};
	let stacks = [], maxStack = 20;

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

	const calculateMaxStack = () => {
		if (!settings) return;
		const { danmakuDensity, fontSize } = settings;
		// 画面全体を使用: 70%〜100%の範囲
		const percent = 0.7 + ((+danmakuDensity || 0) * 0.1);
		const lineHeight = fontSize * 1.25;
		const containerHeight = $container?.offsetHeight || 480;
		const containerWidth = $container?.offsetWidth || 854;
		maxStack = Math.max(Math.floor(containerHeight / lineHeight * percent), 1);
		$container?.style.setProperty('--width', `${containerWidth}px`);
		console.log('📏 MaxStack calculated:', { danmakuDensity, percent: Math.round(percent * 100) + '%', maxStack });
	}

	window.addEventListener('resize', calculateMaxStack);
	setInterval(calculateMaxStack, 500);

	const getProperStack = $chat => {
		let min = maxStack, currentMin = Infinity;
		let foundEmptyStack = false;
		
		for (let i = 0; i < maxStack; i++) {
			if (!stacks[i]) {
				stacks[i] = 0;
				min = i;
				foundEmptyStack = true;
				break;
			} else if (stacks[i] < currentMin) {
				min = i;
				currentMin = stacks[i];
			}
		}
		
		// 非表示モードで空きスタックがない場合は非表示
		if (settings?.commentOverflow === 'hide' && !foundEmptyStack) {
			console.log('🚫 Comment hidden - no available stack (hide mode)');
			return null;
		}
		
		min = Math.min(min, maxStack);
		if ($chat) {
			if (!stacks[min]) {
				stacks[min] = 1;
			} else {
				stacks[min]++;
			}
			$chat.setAttribute('data-stack', min);
			$chat.style.setProperty('--stack', min);
		}
		return min;
	}

	const applyUserSettings = () => {
		if ($container) {
			calculateMaxStack();

			const { enabled, showUsername, textDecoration, bold, font, danmakuDensity, mode, commentOverflow, ...rest } = settings;

			Object.entries(rest).forEach(([key, value]) => {
				$container.style.setProperty(`--${key}`, value);
			});

			// 非表示モードではスタック間隔を詰める
			if (commentOverflow === 'hide') {
				$container.style.setProperty('--stack-spacing', '1.1em');
			} else {
				$container.style.setProperty('--stack-spacing', '1.25em');
			}

			if (!enabled || mode !== 'default') {
				$container.innerHTML = '';
				stacks = [];
			}

			if (!enabled) {
				$container.style.setProperty('display', 'none');
			} else {
				$container.style.removeProperty('display');
			}

			if (showUsername) {
				$container.classList.remove('hide-username');
			} else {
				$container.classList.add('hide-username');
			}

			if (bold) {
				$container.classList.add('bold');
			} else {
				$container.classList.remove('bold');
			}

			if (font === 'Default') {
				$container.style.removeProperty('--font-family');
			} else {
				$container.style.setProperty('--font-family', font);
			}

			$container.setAttribute('data-text-decoration', textDecoration || 'none');
		}
	}

	window._twitchChatDanmaku['default'] = {
		init($el, userSettings) {
			$container = $el;
			settings = userSettings;
			applyUserSettings();
			console.log('🎯 Danmaku container initialized:', $container);
		},

		onSettingsChange(userSettings) {
			settings = userSettings;
			applyUserSettings();
		},

		onDanmaku($username, $message) {
			console.log('🎬 onDanmaku called with:', { username: $username, message: $message });
			console.log('🎬 Settings enabled:', settings?.enabled);
			console.log('🎬 Container exists:', !!$container);
			
			if (!settings?.enabled) {
				console.log('❌ Settings not enabled, aborting danmaku');
				return;
			}
			if ($message?.querySelector('.chat-line__message--deleted-notice') || $username?.querySelector('.chat-line__message--deleted-notice')) {
				console.log('❌ Deleted message detected, aborting danmaku');
				return;
			}
			
			// コメント遅延処理
			const delayMs = (settings?.delay || 0) * 1000;
			console.log('⏰ Comment delay:', settings?.delay || 0, 'seconds');
			
			const showDanmaku = () => {
				const $chat = document.createElement('div');
				$chat.classList.add('danmaku-chat');

				const $usernameContainer = document.createElement('span');
				$usernameContainer.classList.add('danmaku-username');
				$usernameContainer.appendChild($username.cloneNode(true));
				$chat.appendChild($usernameContainer);

				const $messageContainer = document.createElement('span');
				$messageContainer.classList.add('danmaku-message');
				$messageContainer.appendChild($message.cloneNode(true));
				$chat.appendChild($messageContainer);

				// アニメーション終了時に要素を削除
				$chat.addEventListener('animationend', () => $chat.remove());

				const stack = getProperStack($chat);
				if (stack === null) {
					console.log('🚫 Danmaku hidden due to overflow settings');
					return;
				}
				console.log('🎨 Creating danmaku element, stack:', stack);
				console.log('🎨 Danmaku element:', $chat);

				$container.appendChild($chat);

				setTimeout(() => {
					let length = $message.getBoundingClientRect().width / $container.getBoundingClientRect().width || 0;
					$chat.style.setProperty('--length', length);

					waitUntil(() =>
						!$container || !$container.contains($chat) || (
							$container.getBoundingClientRect().left + $container.getBoundingClientRect().width >=
							$chat.getBoundingClientRect().left + $chat.getBoundingClientRect().width + 200
						)
					).then(() => {
						stacks[stack] = Math.max(stacks[stack] - 1, 0) || 0;
					})
				}, 0);
			};
			
			// 遅延がある場合はsetTimeoutで遅らせる
			if (delayMs > 0) {
				setTimeout(showDanmaku, delayMs);
			} else {
				showDanmaku();
			}
		}
	};
})();