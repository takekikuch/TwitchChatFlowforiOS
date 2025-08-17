// 最小限のテストスクリプト - より強制的に表示
console.log('🧪 TEST: Content script loaded successfully!');
console.log('🧪 TEST: URL:', window.location.href);
console.log('🧪 TEST: Domain:', window.location.hostname);

// より目立つアラートも追加
setTimeout(() => {
    alert('🎉 Twitch Chat Flow Extension is working!');
}, 2000);

// ページに赤い四角を表示してスクリプト実行を視覚的に確認
const testDiv = document.createElement('div');
testDiv.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    width: 100px;
    height: 50px;
    background-color: red;
    color: white;
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: Arial, sans-serif;
    font-size: 12px;
    border-radius: 5px;
`;
testDiv.textContent = 'Extension OK!';

// 3秒後に表示
setTimeout(() => {
    document.body.appendChild(testDiv);
    console.log('🧪 TEST: Red box added to page');
    
    // 5秒後に削除
    setTimeout(() => {
        testDiv.remove();
        console.log('🧪 TEST: Red box removed');
    }, 5000);
}, 3000);