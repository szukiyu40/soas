let language = localStorage.getItem('preferredLanguage') || 'Japanese';

function toggleLanguage() {
    language = (language === 'Japanese') ? 'English' : 'Japanese';
    localStorage.setItem('preferredLanguage', language);
    setLanguage(language);
}

function setLanguage(displayLanguage) {
    const elementsEn = document.querySelectorAll('.langEn');
    const elementsJp = document.querySelectorAll('.langJp');
    const languageToggle = document.getElementById('languageToggle');
    
    if (displayLanguage === 'English') {
        elementsEn.forEach(el => el.style.display = 'block');
        elementsJp.forEach(el => el.style.display = 'none');
        if (languageToggle) {
            languageToggle.innerHTML = '<i class="bi bi-translate"></i> Switch to Japanese';
        }
        // Update elements that exist in index page
        const pageTitle = document.getElementById('pageTitle');
        const subTitle = document.getElementById('subTitle');
        const userInput = document.getElementById('userInput');
        const sendButton = document.getElementById('sendButton');
        const botResponse = document.getElementById('botResponse');
        
        if (pageTitle) pageTitle.innerText = 'If you know you don\'t know, the problem is half solved!';
        if (subTitle) subTitle.innerText = 'Ask anything that you are curious about. AI will answer.';
        if (userInput) userInput.placeholder = 'Enter your message...';
        if (sendButton) sendButton.innerText = 'Send';
        if (botResponse) botResponse.innerText = 'Response will be shown here...';
    } else {
        elementsEn.forEach(el => el.style.display = 'none');
        elementsJp.forEach(el => el.style.display = 'block');
        if (languageToggle) {
            languageToggle.innerHTML = '<i class="bi bi-translate"></i> Switch to English';
        }
        // Update elements that exist in index page
        const pageTitle = document.getElementById('pageTitle');
        const subTitle = document.getElementById('subTitle');
        const userInput = document.getElementById('userInput');
        const sendButton = document.getElementById('sendButton');
        const botResponse = document.getElementById('botResponse');
        
        if (pageTitle) pageTitle.innerText = 'もし、あなたが分からないことが分かれば問題は半分は解けたようなもの！';
        if (subTitle) subTitle.innerText = 'あなたが気になっていることを質問してね。AIが回答するよ。';
        if (userInput) userInput.placeholder = 'メッセージを入力してください...';
        if (sendButton) sendButton.innerText = '送信';
        if (botResponse) botResponse.innerText = '返答はここに表示されます...';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setLanguage(language);
});
