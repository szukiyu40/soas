document.addEventListener('DOMContentLoaded', (event) => {
    const goodButton = document.getElementById('good-button');
    const badButton = document.getElementById('bad-button');
    
    goodButton.addEventListener('click', () => {
        vote('good');
    });
    
    badButton.addEventListener('click', () => {
        vote('bad');
    });
    
    function vote(type) {
        fetch(`/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ vote: type }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
});
