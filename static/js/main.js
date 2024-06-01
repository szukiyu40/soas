function searchMessage() {
    var searchQuery = document.getElementById('searchInput').value;
    fetch(`https://seekunknown.com/search?query=${encodeURIComponent(searchQuery)}`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        if (data.length > 0) {
            document.getElementById('searchResults').innerHTML = data.map(item => `${item.id}: ${item.message}`).join('<br>');
        } else {
            document.getElementById('searchResults').innerText = 'No results found.';
        }
    })
    .catch(error => {
        console.error('Search Error:', error);
        document.getElementById('searchResults').innerText = 'Search failed. Try again later.';
    });
}

function sendMessage() {
    console.log('sendMessage function triggered');
    var userInput = document.getElementById('userInput').value;
    if (!userInput.trim()) {
        document.getElementById('botResponse').innerText = 'Error: Please enter a message.';
        return;
    }
    fetch('https://seekunknown.com/submit', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ message: userInput })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('botResponse').innerText = 'Submit Response: ' + data.response;
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('botResponse').innerText = 'Error: ' + error.message;
    });
}


function fetchRecentQA() {
    fetch('/api/recent-qa')
    .then(response => response.json())
    .then(data => {
        const questionsContainer = document.getElementById('recentQA');
        questionsContainer.innerHTML = data.map(qa => {
            return `<div class="question" id="question_${qa.id}">
                        <p><strong>Question:</strong> ${qa.question}</p>
                        <p><strong>Answer:</strong> ${qa.answer}</p>
                        <button class="vote up" onclick="handleVote(${qa.id}, true)">👍 <span id="upvotes_${qa.id}">${qa.upvotes}</span></button>
                        <button class="vote down" onclick="handleVote(${qa.id}, false)">👎 <span id="downvotes_${qa.id}">${qa.downvotes}</span></button>
                        <div id="comments_${qa.id}">
                            <!-- Comments will be dynamically inserted here -->
                        </div>
                        <input type="text" id="comment_input_${qa.id}" placeholder="Write a comment...">
                        <button onclick="postComment(${qa.id})">Post Comment</button>
                    </div>`;
        }).join('<hr>');
        
        // After the initial render, fetch comments for each question
        data.forEach(qa => {
            fetchComments(qa.id); // Ensure you have a function to fetch and display comments
        });
    })
    .catch(error => console.error('Error fetching recent QA:', error));
}

// Additional function to fetch and display comments
function fetchComments(questionId) {
    fetch(`/api/comments/${questionId}`)
    .then(response => response.json())
    .then(comments => {
        const commentsContainer = document.getElementById(`comments_${questionId}`);
        commentsContainer.innerHTML = comments.map(comment => `<p>${comment.content}</p>`).join('');
    })
    .catch(error => console.error('Error fetching comments for question ID ${questionId}:', error));
}



function handleVote(messageId, isUpvote) {
    const endpoint = isUpvote ? `/api/upvote/${messageId}` : `/api/downvote/${messageId}`;
    fetch(endpoint, { method: 'POST' })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('Error: ' + data.error);
        } else {
            document.getElementById(`upvotes_${messageId}`).textContent = data.upvotes;
            document.getElementById(`downvotes_${messageId}`).textContent = data.downvotes;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Voting failed. Try again later.');
    });
}

function postComment(messageId) {
    const inputId = `comment_input_${messageId}`;
    const commentContent = document.getElementById(inputId).value;
    fetch(`/api/comments/${messageId}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ content: commentContent })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Comment added') {
            // Optionally clear the input field
            document.getElementById(inputId).value = '';
            // Fetch and display all comments including the new one
            fetchComments(messageId);
        }
    })
    .catch(error => console.error('Error posting comment:', error));
}

window.onload = function() {
    fetchRecentQA();  // Ensure questions and comments are fetched when the page is loaded
}

document.addEventListener('DOMContentLoaded', () => {
    let language = localStorage.getItem('preferredLanguage') || 'Japanese';

    document.body.addEventListener('click', event => {
        const target = event.target;
        if (target.matches('.good-button')) {
            console.log('Good button clicked', target.dataset.messageId);
            handleVote(target.dataset.messageId, true);
        } else if (target.matches('.bad-button')) {
            console.log('Bad button clicked', target.dataset.messageId);
            handleVote(target.dataset.messageId, false);
        }
    });

    fetchRecentQA();  // Ensure questions and comments are fetched when the page is loaded
});

