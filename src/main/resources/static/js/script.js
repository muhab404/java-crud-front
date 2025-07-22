document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const userForm = document.getElementById('user-form');
    const usersList = document.getElementById('users-list');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const userIdInput = document.getElementById('userId');
    const submitBtn = document.getElementById('submit-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const loadingElement = document.getElementById('loading');
    const noUsersElement = document.getElementById('no-users');
    const searchInput = document.getElementById('search-input');
    
    // API URL
    const API_URL = '/api/users';
    
    // Load users on page load
    loadUsers();
    
    // Event Listeners
    userForm.addEventListener('submit', handleFormSubmit);
    cancelBtn.addEventListener('click', resetForm);
    searchInput.addEventListener('input', handleSearch);
    
    // Functions
    function loadUsers() {
        loadingElement.style.display = 'block';
        noUsersElement.style.display = 'none';
        
        fetch(API_URL)
            .then(response => response.json())
            .then(users => {
                loadingElement.style.display = 'none';
                
                if (users.length === 0) {
                    noUsersElement.style.display = 'block';
                } else {
                    renderUsers(users);
                }
            })
            .catch(error => {
                console.error('Error loading users:', error);
                loadingElement.style.display = 'none';
                showMessage('Error loading users. Please try again.', 'error');
            });
    }
    
    function renderUsers(users) {
        usersList.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${user.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" data-id="${user.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            usersList.appendChild(row);
            
            // Add event listeners to buttons
            row.querySelector('.edit-btn').addEventListener('click', () => editUser(user));
            row.querySelector('.delete-btn').addEventListener('click', () => deleteUser(user.id));
        });
    }
    
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const user = {
            name: nameInput.value,
            email: emailInput.value
        };
        
        const userId = userIdInput.value;
        
        if (userId) {
            // Update existing user
            updateUser(userId, user);
        } else {
            // Create new user
            createUser(user);
        }
    }
    
    function createUser(user) {
        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
        .then(response => {
            if (response.ok) {
                resetForm();
                loadUsers();
                showMessage('User created successfully!', 'success');
            } else {
                throw new Error('Failed to create user');
            }
        })
        .catch(error => {
            console.error('Error creating user:', error);
            showMessage('Error creating user. Please try again.', 'error');
        });
    }
    
    function editUser(user) {
        nameInput.value = user.name;
        emailInput.value = user.email;
        userIdInput.value = user.id;
        
        submitBtn.textContent = 'Update User';
        cancelBtn.style.display = 'inline-block';
        
        // Scroll to form
        userForm.scrollIntoView({ behavior: 'smooth' });
    }
    
    function updateUser(id, user) {
        fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
        .then(response => {
            if (response.ok) {
                resetForm();
                loadUsers();
                showMessage('User updated successfully!', 'success');
            } else {
                throw new Error('Failed to update user');
            }
        })
        .catch(error => {
            console.error('Error updating user:', error);
            showMessage('Error updating user. Please try again.', 'error');
        });
    }
    
    function deleteUser(id) {
        if (confirm('Are you sure you want to delete this user?')) {
            fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    loadUsers();
                    showMessage('User deleted successfully!', 'success');
                } else {
                    throw new Error('Failed to delete user');
                }
            })
            .catch(error => {
                console.error('Error deleting user:', error);
                showMessage('Error deleting user. Please try again.', 'error');
            });
        }
    }
    
    function resetForm() {
        userForm.reset();
        userIdInput.value = '';
        submitBtn.textContent = 'Add User';
        cancelBtn.style.display = 'none';
    }
    
    function handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        
        const rows = usersList.querySelectorAll('tr');
        
        rows.forEach(row => {
            const name = row.cells[1].textContent.toLowerCase();
            const email = row.cells[2].textContent.toLowerCase();
            
            if (name.includes(searchTerm) || email.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
    
    function showMessage(message, type) {
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.className = type === 'success' ? 'success-message' : 'error-message';
        
        // Insert message before the form
        userForm.parentNode.insertBefore(messageElement, userForm);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }
});