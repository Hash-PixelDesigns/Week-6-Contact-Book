//Global Variables
let apiKey = '';
const rootPath = 'http://mysite.itvarsity.org/api/ContactBook/';

//Check if API key exists when page loads
function checkApiKey() {
    const storedApiKey = localStorage.getItem('apiKey');
    if (storedApiKey) {
        apiKey = storedApiKey;
        // Show contacts page
        showContacts();
        //Get contacts (API Call)
        getContacts();
    }
}

//Setup the API Key and Store it
function setApiKey() {
    const inputApiKey = document.getElementById('apiKeyInput').value.trim();

    if (!inputApiKey) {
        alert('Please enter an API Key!');
        return;
    }

    //Validate API key first
    fetch(rootPath + "controller/api-key/?apiKey=" + inputApiKey)
        .then(function (response) {
            return response.text();
        })
        .then(function (data) {
            if (data == "1") {
                apiKey = inputApiKey;
                localStorage.setItem("apiKey", apiKey);
                showContacts();
                getContacts();
            } else {
                alert("Invalid API key entered");
            }
        })
        .catch(function (error) {
            alert('Error validating your API Key. Please try again.');
        });
}

// Show different Pages
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Add active class to the specified page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
}

function showContacts() {
    showPage('contactsPage');
}

function showAddContact() {
    showPage('addContactPage');
    // Clear the Form 
    const form = document.getElementById('addContactForm');
    if (form) {
        form.reset();
    }
}

function showEditContact(contactId) {
    showPage('editContactPage');
    //Load contact data for editing
    loadContactForEdit(contactId);
}

function getContacts() {
    const contactsList = document.getElementById('contactList');
    
    // Check if element exists before proceeding
    if (!contactsList) {
        console.error('Element with ID "contactList" not found');
        return;
    }
    
    contactsList.innerHTML = '<div class="loading">Loading contacts...</div>';

    console.log('Fetching contacts from:', rootPath + "controller/get-contacts/?apiKey=" + apiKey);

    fetch(rootPath + "controller/get-contacts/?apiKey=" + apiKey)
        .then(function (response) {
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            return response.json();
        })
        .then(function (data) {
            console.log('Raw contacts data received:', data);
            console.log('Number of contacts:', data ? data.length : 0);
            console.log('Data type:', typeof data);
            
            // Log each contact individually
            if (data && Array.isArray(data)) {
                data.forEach((contact, index) => {
                    console.log(`Contact ${index + 1}:`, contact);
                });
            }
            
            displayContacts(data);
        })
        .catch(function (error) {
            contactsList.innerHTML = '<div class="error">Something went wrong, please try again later.</div>';
            console.error('Error fetching contacts:', error);
        });
}

function displayContacts(contacts) {
    const contactsList = document.getElementById('contactList');
    
    if (!contactsList) {
        console.error('Element with ID "contactList" not found');
        return;
    }

    console.log('Displaying contacts:', contacts);
    console.log('Is contacts an array?', Array.isArray(contacts));

    if (!contacts || contacts.length === 0) {
        console.log('No contacts to display');
        contactsList.innerHTML = '<div class="loading">No contacts found. Add your first contact!</div>';
        return;
    }

    console.log('Building HTML for', contacts.length, 'contacts');
    let html = '<div class="contacts-grid">';

    for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        console.log(`Processing contact ${i + 1}:`, contact);

        let avatarSrc = contact.avatar ?
            `${rootPath}controller/uploads/${contact.avatar}` :
            `https://ui-avatars.com/api/?name=${contact.firstname}+${contact.lastname}&background=ff6b&color=fff&size=120`;

        console.log(`Avatar source for ${contact.firstname}:`, avatarSrc);

        html += `
            <div class="contact-card">
                <img src="${avatarSrc}" alt="Avatar" class="contact-avatar">
                <div class="contact-name">${contact.firstname} ${contact.lastname}</div>
                <div class="contact-details">
                    <p><strong>Mobile:</strong> ${contact.mobile}</p>
                    <p><strong>Email:</strong> ${contact.email}</p>
                </div>
                <div class="contact-actions">
                    <button class="btn btn-secondary" onclick="showEditContact('${contact.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteContact('${contact.id}')">Delete</button>
                </div>
            </div>
        `;
    }

    html += '</div>';
    console.log('Final HTML length:', html.length);
    contactsList.innerHTML = html;
    console.log('Contacts displayed successfully');
}

function refreshContacts() {
    getContacts();
}

function addContact(event) {
    event.preventDefault();

    const form = new FormData(document.querySelector('#addContactForm'));
    form.append('apiKey', apiKey);

    fetch(rootPath + 'controller/insert-contact/', {
        method: 'POST',
        headers: { 'Accept': 'application/json, */*' },
        body: form
    })
        .then(function (response) {
            return response.text();
        })
        .then(function (data) {
            if (data == "1") {
                alert("Contact added successfully!");
                showContacts();
                getContacts();
            } else {
                alert('Error adding contact: ' + data);
            }
        })
        .catch(function (error) {
            alert('Something went wrong. Please try again.');
            console.error('Error adding contact:', error);
        });
}

function loadContactForEdit(contactId) {
    console.log('Loading contact for edit, ID:', contactId);
    
    fetch(rootPath + 'controller/get-contacts/?id=' + contactId + '&apiKey=' + apiKey)
        .then(function (response) {
            console.log('Edit contact response status:', response.status);
            return response.json();
        })
        .then(function (data) {
            console.log('Contact data for editing:', data);
            const contact = data[0];
            console.log('Selected contact:', contact);

            //Show avatar if available
            if (contact.avatar) {
                const avatarImg = `<img src="${rootPath}controller/uploads/${contact.avatar}" width="200" style="border-radius:10px;"/>`;
                const editAvatarImage = document.getElementById("editAvatarImage");
                if (editAvatarImage) {
                    editAvatarImage.innerHTML = avatarImg;
                }
            } else {
                const editAvatarImage = document.getElementById("editAvatarImage");
                if (editAvatarImage) {
                    editAvatarImage.innerHTML = '';
                }
            }

            // Set form values with null checks
            const editContactId = document.getElementById('editContactId');
            const editFirstName = document.getElementById('editFirstName');
            const editLastName = document.getElementById('editLastName');
            const editMobile = document.getElementById('editMobile');
            const editEmail = document.getElementById('editEmail');

            if (editContactId) editContactId.value = contact.id;
            if (editFirstName) editFirstName.value = contact.firstname;
            if (editLastName) editLastName.value = contact.lastname;
            if (editMobile) editMobile.value = contact.mobile;
            if (editEmail) editEmail.value = contact.email;
            
            console.log('Form populated with contact data');
        })
        .catch(function (error) {
            alert('Error loading contact details.');
            showContacts();
            console.error('Error loading contact:', error);
        });
}

function updateContact(event) {
    event.preventDefault();

    const form = new FormData(document.querySelector("#editContactForm"));
    const contactIdElement = document.getElementById('editContactId');
    
    if (!contactIdElement) {
        alert('Error: Contact ID not found');
        return;
    }
    
    const contactId = contactIdElement.value;

    form.append('apiKey', apiKey);
    form.append('id', contactId);

    fetch(rootPath + 'controller/edit-contact/', {
        method: 'POST',
        headers: { 'Accept': 'application/json, */*' },
        body: form
    })
        .then(function (response) {
            return response.text();
        })
        .then(function (data) {
            if (data == "1") {
                alert("Contact updated successfully!");
                showContacts();
                getContacts();
            } else {
                alert('Error updating contact: ' + data);
            }
        })
        .catch(function (error) {
            alert('Something went wrong. Please try again.');
            console.error('Error updating contact:', error);
        });
}

function deleteContact(contactId) {
    const confirmDelete = confirm("Delete contact. Are you sure?");

    if (confirmDelete) {
        fetch(rootPath + 'controller/delete-contact/?id=' + contactId + '&apiKey=' + apiKey)
            .then(function (response) {
                return response.text();
            })
            .then(function (data) {
                if (data == "1") {
                    alert('Contact deleted successfully!');
                    getContacts();
                } else {
                    alert('Error deleting contact: ' + data);
                }
            })
            .catch(function (error) {
                alert('Something went wrong. Please try again.');
                console.error('Error deleting contact:', error);
            });
    }
}

window.onload = function () {
    checkApiKey();
};