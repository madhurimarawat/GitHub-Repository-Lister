/*
*********************************************************************************************
* File: index.js
* Author: Madhurima Rawat
* Date: July 29, 2024
* Description: JavaScript file for GitHub user data and repositories viewer, providing
*              functionality to fetch and display GitHub user data, repositories, and related
*              statistics. Supports pagination and dynamically updates repository details such as
*              stars, issues, and pull requests.
* Version: 1.0
* GitHub Repository: https://github.com/madhurimarawat/GitHub-Repository-Lister
* Issues/Bugs: For any issues or bugs, please visit the GitHub repository issues section.
* Comments: This JS file defines functions to fetch and display user information, repositories,
*           and additional statistics from the GitHub API. It includes functionalities for pagination,
*           error handling, and dynamic updates of repository details. The script uses async/await
*           for API calls and handles user interactions for fetching and displaying data.
* Dependencies: None
*********************************************************************************************
*/

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
const userStarsGiven = document.getElementById('userStarsGiven');
const userStarsEarned = document.getElementById('userStarsEarned');
const userPullRequests = document.getElementById('userPullRequests');
const userIssues = document.getElementById('userIssues');
const repositoriesDiv = document.getElementById('repositories');
const loaderContainer = document.getElementById('loaderContainer');
const loader = document.getElementById('loader');
const paginationDiv = document.getElementById('pagination');
const userInfoCard = document.getElementById('userInfo');

let repositoriesData = [];
let currentPage = 1;

fetchButton.addEventListener('click', fetchUserData);

async function fetchUserData() {
    const username = usernameInput.value.trim();

    if (username === '') {
        alert('Please enter a GitHub username.');
        return;
    }

    clearUserData();
    repositoriesDiv.innerHTML = '';
    paginationDiv.innerHTML = '';
    loaderContainer.style.display = 'flex';
    loader.style.display = 'block';

    try {
        const userData = await fetchUser(username);
        displayUserInfo(userData);

        userInfoCard.style.display = 'flex';

        repositoriesData = await fetchRepositories(username);
        repositoriesData.sort((a, b) => b.stargazers_count - a.stargazers_count); // Sort by stars
        displayRepositories(currentPage);

        // Calculate total stars earned
        const totalStarsEarned = repositoriesData.reduce((total, repo) => total + repo.stargazers_count, 0);
        userStarsEarned.textContent = `✨ Stars Earned: ${totalStarsEarned}`;

    } catch (error) {
        displayError('Failed to fetch data. Please check the username and try again.');
    } finally {
        loader.style.display = 'none';
        loaderContainer.style.display = 'none';
    }
}

async function fetchUser(username) {
    const response = await fetch(`${API_URL}/users/${username}`);
    if (!response.ok) {
        throw new Error('Failed to fetch user data');
    }
    return response.json();
}

async function fetchRepositories(username) {
    const response = await fetch(`${API_URL}/users/${username}/repos?per_page=100`);
    if (!response.ok) {
        throw new Error('Failed to fetch repositories');
    }
    return response.json();
}

async function fetchPullRequests(repoUrl) {
    const response = await fetch(repoUrl.replace('{/number}', ''));
    if (!response.ok) {
        return 0;
    }
    const pullRequests = await response.json();
    return pullRequests.length;
}

function displayUserInfo(userData) {
    const { login, name, avatar_url, html_url, location, bio, followers, public_repos, blog, twitter_username, email, company } = userData;

    userImage.src = avatar_url;
    userImage.style.display = 'block';
    userName.textContent = name || login;
    userLocation.textContent = location ? `Location: ${location}` : '';
    userBio.textContent = bio || '';
    userProfileLink.innerHTML = `<a href="${html_url}" target="_blank" class="btn btn-primary">View on GitHub</a>`;
    userFollowers.textContent = `👥 Followers: ${followers}`;
    userRepos.textContent = `📦 Public Repos: ${public_repos}`;

    const socialLinks = [];
    if (blog) {
        socialLinks.push(`🔗 <a href="${blog}" target="_blank">${blog}</a>`);
    }
    if (twitter_username) {
        socialLinks.push(`🐦 <a href="https://twitter.com/${twitter_username}" target="_blank">@${twitter_username}</a>`);
    }
    if (email) {
        socialLinks.push(`📧 <a href="mailto:${email}">${email}</a>`);
    }
    if (company) {
        socialLinks.push(`🏢 ${company}`);
    }
    fetchSocialLinks(userData.html_url).then(links => {
        if (links.instagram) {
            socialLinks.push(`📸 <a href="${links.instagram}" target="_blank">Instagram</a>`);
        }
        if (links.linkedin) {
            socialLinks.push(`🔗 <a href="${links.linkedin}" target="_blank">LinkedIn</a>`);
        }
    });

    userSocialLinks.innerHTML = socialLinks.join(' | ');
    fetchAdditionalUserData(login);
}

async function fetchSocialLinks(profileUrl) {
    // Placeholder function because we can not fetch such data.
    return {
        instagram: null,
        linkedin: null
    };
}

async function fetchAdditionalUserData(username) {
    try {
        const [starredResponse, pullsResponse, issuesResponse] = await Promise.all([
            fetch(`${API_URL}/users/${username}/starred`),
            fetch(`${API_URL}/search/issues?q=author:${username}+type:pr`),
            fetch(`${API_URL}/search/issues?q=author:${username}+type:issue`)
        ]);

        const starredRepos = await starredResponse.json();
        const pullsData = await pullsResponse.json();
        const issuesData = await issuesResponse.json();

        userStarsGiven.textContent = `⭐ Stars Given: ${starredRepos.length}`;
        userPullRequests.textContent = `🔃 Pull Requests: ${pullsData.total_count || 0}`;
        userIssues.textContent = `❗ Issues: ${issuesData.total_count || 0}`;

    } catch (error) {
        console.error('Failed to fetch additional user data:', error);
        userStarsGiven.textContent = `⭐ Stars Given: 0`;
        userPullRequests.textContent = `🔃 Pull Requests: 0`;
        userIssues.textContent = `❗ Issues: 0`;
    }
}

function displayRepositories(page) {
    currentPage = page;
    const startIndex = (page - 1) * 9;
    const endIndex = startIndex + 9;
    const displayedRepos = repositoriesData.slice(startIndex, endIndex);

    repositoriesDiv.innerHTML = displayedRepos.map(repo => {
        const { name, description, html_url, topics, license, stargazers_count, open_issues_count, forks_count, watchers_count, language, updated_at, pulls_url } = repo;
        return `
            <div class="col-md-4">
                <div class="card mb-4 repo-card">
                    <div class="card-body">
                        <h5 class="card-title">${name}</h5>
                        <p class="card-text">${description || 'No description provided'}</p>
                        <div class="repo-description">
                            ${topics.map(topic => `<button type="button" class="btn topic-button btn-sm">${topic}</button>`).join(' ')}
                        </div>
                        <div class="repo-link">
                        <div class = "repo-actions">
                            <p>📜 License: ${license ? license.spdx_id : 'None'}</p>
                            <p>📚 Language: ${language || 'None'}</p>
                            <p>⭐ Stars: ${stargazers_count}</p>
                            <p>❗ Issues: ${open_issues_count}</p>
                            <p id="pull-requests-${name}">🔃 Pull Requests: Fetching...</p>
                            <p id="commits-${name}">📊 Commits: Fetching...</p>
                            <p id="deployments-${name}">🚀 Deployments: Fetching...</p>
                            <p>🍴 Forks: ${forks_count}</p>
                            <p>👁️ Watchers: ${watchers_count}</p>
                            <p>📅 Updated: ${new Date(updated_at).toLocaleDateString()}</p>
                            </div>
                            <a href="${html_url}" target="_blank" class="btn btn-primary">View on GitHub</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    displayedRepos.forEach(repo => {
        const { name, pulls_url, owner } = repo;
        fetchPullRequests(pulls_url).then(count => {
            document.getElementById(`pull-requests-${name}`).textContent = `🔃 Pull Requests: ${count}`;
        });
        fetchCommits(repo).then(count => {
            document.getElementById(`commits-${name}`).textContent = `📊 Commits: ${count}`;
        });
        fetchDeployments(repo).then(count => {
            document.getElementById(`deployments-${name}`).textContent = `🚀 Deployments: ${count}`;
        });
    });

    displayPagination();
}

async function fetchCommits(repo) {
    const { owner, name } = repo;
    const response = await fetch(`${API_URL}/repos/${owner.login}/${name}/commits?per_page=1`);
    if (!response.ok) {
        return 'Error';
    }
    const linkHeader = response.headers.get('link');
    if (linkHeader) {
        const lastPageMatch = linkHeader.match(/&page=(\d+)>; rel="last"/);
        if (lastPageMatch) {
            return parseInt(lastPageMatch[1], 10);
        }
    }
    return 0;
}

async function fetchDeployments(repo) {
    const { owner, name } = repo;
    const response = await fetch(`${API_URL}/repos/${owner.login}/${name}/deployments`);
    if (!response.ok) {
        return 0;
    }
    const deployments = await response.json();
    return deployments.length || 0;
}


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

function navigatePage(page) {
    if (page >= 1 && page <= Math.ceil(repositoriesData.length / 9)) {
        displayRepositories(page);
    }
}

function clearUserData() {
    userImage.style.display = 'none';
    userName.textContent = '';
    userLocation.textContent = '';
    userBio.textContent = '';
    userProfileLink.innerHTML = '';
    userFollowers.textContent = '';
    userRepos.textContent = '';
    userStarsGiven.textContent = '';
    userStarsEarned.textContent = '';
    userPullRequests.textContent = '';
    userIssues.textContent = '';
    userSocialLinks.innerHTML = '';
    userInfoCard.style.display = 'none';
}

function displayError(message) {
    alert(message);
}