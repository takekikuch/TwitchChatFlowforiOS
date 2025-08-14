// 極シンプルなテスト
console.log('SAFARI EXTENSION TEST: Script is running!');
alert('Safari Extension Works!');

// 確実に見える要素を追加
document.body.style.border = '10px solid red';

setTimeout(() => {
    document.body.style.border = '';
}, 5000);