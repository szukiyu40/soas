document.getElementById('questionForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const userQuestion = document.getElementById('userQuestion').value;
    fetch('/api/submit-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userQuestion })
    })
    .then(response => response.json())
    .then(data => {
        alert('Question submitted successfully!');
        document.getElementById('userQuestion').value = ''; // Clear the form
        // Optionally refresh the list of popular questions
    })
    .catch(error => {
        console.error('Error submitting question:', error);
        alert('Failed to submit question. Please try again later.');
    });
});

function loadPopularQuestions() {
    fetch('/api/popular-questions')
    .then(response => response.json())
    .then(questions => {
        const questionsContainer = document.getElementById('popularQuestions');
        questionsContainer.innerHTML = questions.map(q => `<p>${q.question}</p>`).join('');
    })
    .catch(error => {
        console.error('Error loading popular questions:', error);
    });
}

window.onload = loadPopularQuestions;
