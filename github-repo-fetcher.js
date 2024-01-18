
    document.getElementById('fetchButton').addEventListener('click', function() {
		
        // Get the input value
        var username = document.getElementById('usernameInput').value;

        // Check if the username is empty
        if (!username) {
            console.error('Please enter a GitHub username.');
            return;
        }

        // Fetch repositories based on the input username
        var link = `https://api.github.com/users/${username}/repos`;

        fetch(link)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
			
            .then(data => {
                // Process the data (e.g., display repository names)
                data.forEach(repo => {
					
                    // Create a new paragraph element
                    var list = document.createElement("li");
					
					// Create a new paragraph element
                    var para = document.createElement("p");
					
                    // Create a text node with the repository name
                    var name = document.createTextNode(repo.name);
					
					// Create a text node with the repository name
                    var topic = document.createTextNode(repo.topics);
					
                    // Append the text node to the list element
                    list.appendChild(name);
					
					// Append the text node to the paragraph element
                    para.appendChild(topic);


                    // Append the new element to the body (or any other existing element)
                    document.body.appendChild(list);
					
					// Append the new element to the body (or any other existing element)
                    document.body.appendChild(para);
                });
            })
            .catch(error => console.error('Error fetching data:', error));
    });

