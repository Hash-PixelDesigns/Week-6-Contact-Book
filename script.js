//Global Variables
let apiKey= '';
const rootPath = 'http://mysite.itvarsity.org/api/ContactBook/';

//Check if API key exists when page loads
function checkApiKey(){
    const storedApiKey = localStorage.getItem('apiKey');
    if (storedApiKey) {
        apiKey = storedApiKey;
        showContacts();
        getContacts()

    }
}

//Setup the API Key and Store it
function setApiKey() {
    const inputApiKey = document.getElementByID('apiKeyInput').value.trim();

    if (!inputApiKey) {
        alert('please enter an API Key!');
        return;
    }

    //Validate API key first
    fetch(rootPath + "controller/api-key/?apiKey=" + inputApiKey)
        .then(function (response){
            return response.text();
        })
        .then(function(data) {
            if (data == "1") {
                apiKey = inputApiKey;
                localStorage.setItem("apiKey",apiKey);
                showContacts();
                getContacts();
            } else {
                alert("Invalid API key enetered");
            }
        })
        .catch(function() {
            alert('Error validation your API Key.Please try again.');
        });
}

// Show different Pages
function showPage(pageId) {
    const pages= document.querySelectorAll('.page');
    forEach (page => page.classList.remove('active'));
}

function showContacts() {
    showPage('contactsPage');
}

function showAddContacts() {
    showPage('addContactPage');
    document.getElementById('addContactForm').reset();
}

function showEditContact (contactId) {
    showPage ('editContactPage')
    
    loadContactForEdit(contactId);
}

function getContacts() {
    const contactsList = document.getElementById('contactsList');
    contactsList.innerHTML = '<div class="Loading">Loading contacts...</div>';

    fetch(rootPath + "controller/get-contacts/")
        .then(function (response){
            return response.json();
        })
        .catch(function(data){
            displayContacts(data);
        })
        .catch(function(error){
            contactsList.innerHTML='<div class="error">Something wenr wrong, please try again later.</div>
        });
    }

function displayContacts(contacts){
    const contactsList = document.getElementById('contactsList');

    if (!contacts || contacts.length === 0) {
        contactsList.innerHTML = '<div class="Loading">No contacts found. Add your first contact!</div>';
        return;
    }

    let html = '<div class="contacts-grid">';

    for (let i=0; i < contacts.length;i++){
        const contact = contacts[i];

        let avatarSrc = contact.avatar ?
            `${rootPath}controller/uploads/${contact.avatar}`;
            `https://ui-avatars.com/api/?name=${contact.firstname}+${contact.lastname}&background=ff6b&color=fff&size=120`;

        html+= `
            <div class="contact-card">
                <img src="${avatarSrc}" alt="Avatar" class="contact-avatar">
                <div class="contactname">${contact.firstname}${contact.lastname}</div>
                <div class="contact-details">
                    <p><strong>Mobile:</strong>${contact.mobile}</p>
                    <p><strong>Email:</strong>${contact.email}</p>
                </div>
                <div class="contact-actions">
                    <button class="btn btn-secondary" onclick="showEditContact('${contact.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteContact('${contact.id}')">Delete</button>
                </div>
         
        `;
    }

    html += '<div>';
    contactsList.innerHTML = html
}

function refreshContacts(){
    getcontact();
}

function addContact(event){
    event.preventDefault();

    const form = new FormData(document.querySelector('#addContactform'));
    form.append('apiKey',apiKey);

    fetch(rootPath + 'controller/insert-contact/',{
        method: 'POST',
        headers:{'Accept':'application/json,*.* '};
        body:form
    })
        .then(function(response){
            return response.text();
        })
        .then (function (data){
            if (data=="1") {
                alert("Contact added successfully!");
                showContacts();
                getContacts();                
            } else {
                alert('Error adding contact:' + data);
            }
        })
        .catch ('Something went wrong. Please try again.');
}

function loadContactForEdit(contactId) {
    fetch(rootPath+'controller/get-contacts/?id='+contactId)
        .then(function(response){
            return response.json();
        })
        .then(function(data){
            const contact = data[0];

            //Show avatar if available
            if(contact.avatar) {
                const avatar= `<img src"${rootPath}controller/uploads/${contacts.avatar}"
                                width=200 style="border-radius:10px;"/>`;
                document.getElementById("editAvatarImage").innerHTML = avatarImg;
            } else {
                document.getElementById("editAvatarImage").innerHTML = '';
            }

            document.getElementById('editContactId').value = contact.id;
            document.getElementById('editFirstName').value = contact.firstname;
            document.getElementById('editLastName').value = contact.lastname;
            document.getElementById('editMobile').value = contact.mobile;
            document.getElementById('editEmail').value = contact.email;
        })
        .catch (function(error){
            alert('Error loading contact details.');
            showContacts();
        })
}

function updateContact (event){
    event.preventDefault();

    const form = new FormData(document.querySelector("#editContactForm"));
    const contactId = document.getElementById('editContactId').value;

    form.append('apiKey',apiKey);
    form.append('Id',contactId);

    fetch(rootPath+'controller/edit-contact/',{
        method: 'POST',
        headers: {'Accept': 'appliaction/json, *.*'},
        body: form
    })
        .then(function (response){
            return response.text();
        })
        .then(function(data){
            if (data == "1") {
                alert("Contact updated Successfully!");
                showContacts();
                getContacts();
            } else {
                alert('Error updating contact:' +data);
            }
        });
}

function deleteContact(contactId) {
    var confirmDelete = confirm ("Delete contact.ARe you sure?");

    if (confirmDelete == true) {
        fetch(rootPath + 'controller/delete-contact/?id='+contactId)
            .then (function (response){
                return response.text();
            })
            .then (function (data){
                if (data == "1") {
                    alert ('Contact deleted successfully!');
                    getContacts();
                } else {
                    alert('Error deleting contact:'+data);
                }
            })
            .catch(function (error){
                alert('Something went wrong. Please try again.');
            })
    }
}

window.onload = function () {
    checkApiKey();
}




