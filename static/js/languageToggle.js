let language = localStorage.getItem('preferredLanguage') || 'Japanese';

function toggleLanguage() {
    language = (language === 'Japanese') ? 'English' : 'Japanese';
    localStorage.setItem('preferredLanguage', language);
    setLanguage(language);
}

function setLanguage(displayLanguage) {
    const elementsEn = document.querySelectorAll('.langEn');
    const elementsJp = document.querySelectorAll('.langJp');
    if (displayLanguage === 'English') {
        elementsEn.forEach(el => el.style.display = 'block');
        elementsJp.forEach(el => el.style.display = 'none');
        document.getElementById('languageToggle').innerText = 'Switch to Japanese';
        document.getElementById('pageTitle').innerText = 'If you know you don\'t know, the problem is half solved!';
        document.getElementById('subTitle').innerText = 'Ask anything that you are curious about. AI will answer.';
        document.getElementById('userInput').placeholder = 'Enter your message...';
        document.getElementById('sendButton').innerText = 'Send';
        document.getElementById('botResponse').innerText = 'Response will be shown here...';
    } else {
        elementsEn.forEach(el => el.style.display = 'none');
        elementsJp.forEach(el => el.style.display = 'block');
        document.getElementById('languageToggle').innerText = 'Switch to English';
        document.getElementById('pageTitle').innerText = 'もし、あなたが分からないことが分かれば問題は半分は解けたようなもの！';
        document.getElementById('subTitle').innerText = 'あなたが気になっていることを質問してね。AIが回答するよ。';
        document.getElementById('userInput').placeholder = 'メッセージを入力してください...';
        document.getElementById('sendButton').innerText = '送信';
        document.getElementById('botResponse').innerText = '返答はここに表示されます...';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setLanguage(language);
});
