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
        alert('please enteran API Key!');
        return;
    }

    //Validate API key first
    fetch(rootPath + "controller/api-key/?apiKey=" + inputApiKey)
        .then(function (response){
            return response.text()
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
        })

        .catch(function() {
            alert('Error validation your API Key.Please try again.')
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
