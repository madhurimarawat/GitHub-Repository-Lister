// GitHub API endpoint
const API_URL = 'https://api.github.com';

// Selectors
const usernameInput = document.getElementById('usernameInput');
const fetchButton = document.getElementById('fetchButton');
const userImage = document.getElementById('userImage');
const userName = document.getElementById('userName');
const userLocation = document.getElementById('userLocation');
const userBio = document.getElementById('userBio');
const userProfileLink = document.getElementById('userProfileLink');
const userLinks = document.getElementById('userLinks');
const userSocialLinks = document.getElementById('userSocialLinks');
const userFollowers = document.getElementById('userFollowers');
const userRepos = document.getElementById('userRepos');
const userStars = document.getElementById('userStars');
const userPullRequests = document.getElementById('userPullRequests');
const userIssues = document.getElementById('userIssues');
const repositoriesDiv = document.getElementById('repositories');
const loaderContainer = document.getElementById('loaderContainer');
const loader = document.getElementById('loader');
const paginationDiv = document.getElementById('pagination');
const userInfoCard = document.getElementById('userInfo');

let repositoriesData = []; // Array to store fetched repositories
let currentPage = 1; // Variable to track current page

// Event listener for fetch button click
fetchButton.addEventListener('click', fetchRepositories);

// Function to fetch repositories
async function fetchRepositories() {
    const username = usernameInput.value.trim();

    if (username === '') {
        alert('Please enter a GitHub username.');
        return;
    }

    // Clear previous data
    clearUserData();
    repositoriesDiv.innerHTML = '';
    paginationDiv.innerHTML = '';
    loaderContainer.style.display = 'flex';
    loader.style.display = 'block';

    try {
        // Fetch user data
        const userResponse = await fetch(`${API_URL}/users/${username}`);
        if (!userResponse.ok) {
            throw new Error('Failed to fetch user data');
        }
        const userData = await userResponse.json();

        // Display user information
        displayUserInfo(userData);

        // Display user info card
        userInfoCard.style.display = 'flex';

        // Fetch repositories
        const repositoriesResponse = await fetch(`${API_URL}/users/${username}/repos`);
        if (!repositoriesResponse.ok) {
            throw new Error('Failed to fetch repositories');
        }
        repositoriesData = await repositoriesResponse.json();

        // Display first page of repositories
        displayRepositories(currentPage);

    } catch (error) {
        repositoriesDiv.innerHTML = `<div class="alert alert-danger" role="alert">
                                        Failed to fetch repositories. Please check the username and try again.
                                     </div>`;
    } finally {
        loader.style.display = 'none';
        setTimeout(() => {
            loaderContainer.style.display = 'none';
        }, 2000);
    }
}

// Function to display user information
function displayUserInfo(userData) {
    const { login, name, avatar_url, html_url, location, bio, followers, public_repos, blog, twitter_username } = userData;

    userImage.src = avatar_url;
    userImage.style.display = 'block';
    userName.textContent = name ? name : login;
    userLocation.textContent = location ? `Location: ${location}` : '';
    userBio.textContent = bio ? bio : '';

    userProfileLink.innerHTML = `<a href="${html_url}" target="_blank" class="btn btn-primary">View on GitHub</a>`;
    userFollowers.innerHTML = `👥 Followers: ${followers}`;
    userRepos.innerHTML = `📦 Public Repos: ${public_repos}`;
    userLinks.innerHTML = blog ? `🔗 <a href="${blog}" target="_blank">${blog}</a>` : '';

    // Social media links
    const socialLinks = [];
    if (twitter_username) {
        socialLinks.push(`🐦 <a href="https://twitter.com/${twitter_username}" target="_blank">Twitter</a>`);
    }
    userSocialLinks.innerHTML = socialLinks.join(' | ');

    // Fetch additional data for stars, pull requests, and issues
    Promise.all([
        fetch(`${API_URL}/users/${login}/starred`),
        fetch(`${API_URL}/search/issues?q=author:${login}+type:pr`),
        fetch(`${API_URL}/search/issues?q=author:${login}+type:issue`)
    ]).then(async ([starredResponse, pullsResponse, issuesResponse]) => {
        const starredRepos = await starredResponse.json();
        const pullsData = await pullsResponse.json();
        const issuesData = await issuesResponse.json();

        userStars.innerHTML = `⭐ Stars: ${starredRepos.length}`;
        userPullRequests.innerHTML = `🔃 Pull Requests: ${pullsData.total_count !== undefined ? pullsData.total_count : 0}`;
        userIssues.innerHTML = `❗ Issues: ${issuesData.total_count !== undefined ? issuesData.total_count : 0}`;
    }).catch(error => {
        console.error('Failed to fetch additional data:', error);

        // Handle case where data is not available or error occurred
        userStars.innerHTML = `⭐ Stars: 0`;
        userPullRequests.innerHTML = `🔃 Pull Requests: 0`;
        userIssues.innerHTML = `❗ Issues: 0`;
    });
}



// Function to display repositories paginated
function displayRepositories(page) {
    currentPage = page;
    const startIndex = (page - 1) * 9;
    const endIndex = startIndex + 9;
    const displayedRepos = repositoriesData.slice(startIndex, endIndex);

    repositoriesDiv.innerHTML = displayedRepos.map(repo => {
        const { name, description, html_url, topics } = repo;

        return `
            <div class="col-md-4">
                <div class="card mb-4 repo-card">
                    <div class="card-body">
                        <h5 class="card-title">${name}</h5>
                        <p class="card-text">${description ? description : 'No description provided'}</p>
                        <div class="repo-description">
                            ${topics.map(topic => `<button type="button" class="btn topic-button btn-sm">${topic}</button>`).join(' ')}
                        </div>
                        <div class="repo-link">
                            <a href="${html_url}" target="_blank" class="btn btn-primary">View on GitHub</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Display pagination
    displayPagination();
}

// Function to display pagination
function displayPagination() {
    const totalPages = Math.ceil(repositoriesData.length / 9);

    let paginationHTML = `
        <ul class="pagination">
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="navigatePage(${currentPage - 1})">Previous</a>
            </li>
    `;

    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="navigatePage(${i})">${i}</a>
            </li>
        `;
    }

    paginationHTML += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="navigatePage(${currentPage + 1})">Next</a>
            </li>
        </ul>
    `;

    paginationDiv.innerHTML = paginationHTML;
}

// Function to navigate to a specific page
function navigatePage(page) {
    if (page < 1 || page > Math.ceil(repositoriesData.length / 9)) {
        return;
    }
    displayRepositories(page);
}

// Function to clear user data
function clearUserData() {
    userImage.style.display = 'none';
    userImage.src = '';
    userName.textContent = '';
    userLocation.textContent = '';
    userBio.textContent = '';
    userProfileLink.innerHTML = '';
    userFollowers.innerHTML = '';
    userRepos.innerHTML = '';
    userStars.innerHTML = '';
    userPullRequests.innerHTML = '';
    userIssues.innerHTML = '';
    userLinks.innerHTML = '';
    userSocialLinks.innerHTML = '';
}
