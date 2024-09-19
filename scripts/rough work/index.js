// Define submitForm function
async function submitForm(event) {
    event.preventDefault(); // Prevent form submission

    // Add the 'active-hover' class to keep hover state after submission
    const submitButton = document.querySelector(".submit-button");
    submitButton.classList.add("active-hover");

    const fileInput = document.getElementById('picture');
    const file = fileInput.files[0];

    // Show loader and change button text
    document.getElementById('submit-text').innerText = 'Please wait...';
    document.getElementById('loader').style.display = 'inline-block';

    const whatsappNumber = document
        .getElementById("whatsapp-number")
        .value.replace(/[\s+]/g, ""); // Remove spaces and '+' sign

    // Collect form data
    const formData = {
        Name: document.getElementById('name').value,
        Nickname: document.getElementById('nickname').value,
        "Whatsapp Number": whatsappNumber,
        Email: document.getElementById('email').value,
        "Date of Birth": document.getElementById('dob').value,
        Picture: [{ url: '' }] // Placeholder for the Cloudinary URL
    };

    console.log('Form Data:', formData); // Log form data

    if (!validateForm(formData, file)) {
        // Hide loader and reset button text
        document.getElementById('submit-text').innerText = 'Submit';
        document.getElementById('loader').style.display = 'none';
        submitButton.classList.remove("active-hover");
        return;
    }

    try {
        // Upload image to Cloudinary
        const cloudinaryUrl = 'https://api.cloudinary.com/v1_1/dhiegatc6/upload';
        const formDataCloudinary = new FormData();
        formDataCloudinary.append('file', file);
        formDataCloudinary.append('upload_preset', 'hct18iyo'); // Set Cloudinary upload preset

        const cloudinaryResponse = await fetch(cloudinaryUrl, {
            method: 'POST',
            body: formDataCloudinary,
        });

        if (!cloudinaryResponse.ok) {
            throw new Error('Error uploading image to Cloudinary.');
        }

        const cloudinaryData = await cloudinaryResponse.json();
        formData.Picture[0].url = cloudinaryData.secure_url; // Update the Picture URL in the formData object

        // Send form data to Airtable via API
        const airtableResponse = await fetch('https://api.airtable.com/v0/appufz5VPar7viZy0/tblmXStbPbBj88Z5E', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_AIRTABLE_API_KEY'
            },
            body: JSON.stringify({
                records: [{
                    fields: formData
                }]
            })
        });

        if (!airtableResponse.ok) {
            throw new Error('Error submitting form to Airtable.');
        }

        const result = await airtableResponse.json();
        console.log('Form submission response:', result); // Log response from backend

        // Display confirmation message
        showPopup(); // Call showPopup function if form submission is successful
        document.getElementById('submit-text').innerText = 'Submit';
        document.getElementById('loader').style.display = 'none';
        submitButton.classList.remove("active-hover"); // Remove hover state once submitted
        // Reset the form
        document.getElementById('form').reset();
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('Error submitting form: ' + error.message); // Show error message with full error details
        document.getElementById('submit-text').innerText = 'Submit';
        document.getElementById('loader').style.display = 'none';
        submitButton.classList.remove("active-hover"); // Remove hover state on error
    }
}

// Function to check if email exists in Airtable
async function checkUserDataExists(email) {
    const response = await fetch(`https://api.airtable.com/v0/appufz5VPar7viZy0/tblmXStbPbBj88Z5E?filterByFormula=SEARCH('${email}', Email)`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer YOUR_AIRTABLE_API_KEY'
        }
    });

    if (!response.ok) {
        throw new Error('Error checking user data');
    }

    const data = await response.json();
    console.log('User data check response:', data); // Log response from Airtable

    return data.records.length > 0; // Returns true if email exists, false otherwise
}

// DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function () {
    const loginPopup = document.getElementById('login-popup');
    const continueButton = document.getElementById('continue-button');
    const loginEmailInput = document.getElementById('login-email');
    const popupOverlay = document.querySelector('.popup-overlay');
    const okButton = document.getElementById('ok-button');
    const fileInput = document.getElementById('picture');
    const inputs = document.querySelectorAll('input');

    // Handle Enter key press for different elements
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            const activeElement = document.activeElement;

            // Form submission
            if (activeElement.tagName === 'INPUT' && document.getElementById('form').contains(activeElement)) {
                event.preventDefault();
                submitForm(event); // Trigger form submission
            }

            // Continue button in login popup
            if (activeElement === loginEmailInput) {
                event.preventDefault();
                continueButton.click(); // Trigger click event for email check
            }

            // OK button in success popup
            if (popupOverlay.style.display === 'flex') {
                event.preventDefault();
                okButton.click(); // Trigger click event to close popup
            }

            // Field navigation: move to the next input field
            if (activeElement.tagName === 'INPUT' && inputs.length > 1) {
                event.preventDefault();
                const currentIndex = Array.prototype.indexOf.call(inputs, activeElement);
                const nextInput = inputs[currentIndex + 1];
                if (nextInput) {
                    nextInput.focus(); // Move to the next input field
                }
            }

            // File upload
            if (activeElement === fileInput) {
                event.preventDefault();
                fileInput.click(); // Open file selection dialog
            }
        }
    });

    // Submit the form on submit button click
    document.getElementById('form').addEventListener('submit', submitForm);

    // OK button click event to reload the page
    okButton.addEventListener('click', function () {
        location.reload();
        popupOverlay.style.display = 'none';
    });

    // Continue button click event
    continueButton.addEventListener('click', async function () {
        const email = loginEmailInput.value.trim();

        if (email === '') {
            document.getElementById('continual').innerText = 'Please enter your email!';
            return;
        }

        continueButton.innerHTML = '<div id="loader"></div>';

        const userDataExists = await checkUserDataExists(email);

        if (userDataExists) {
            document.getElementById('giffy').src = 'images/giphy.webp';
            document.getElementById('continual').innerText = 'You have already registered.';
            document.getElementById('login-input').style.display = "none";
            continueButton.innerHTML = 'OK <img class="rocket" src="images/rocket.png" alt="">';
            continueButton.addEventListener('click', function () {
                location.reload();
            });
        } else {
            loginPopup.style.display = 'none';
            const autoFilledEmail = document.getElementById('email');
            autoFilledEmail.value = email;
            autoFilledEmail.disabled = true;
        }
    });
});

// Validate WhatsApp Number, Email, and Picture
function validateForm(formData, file) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(formData["Email"])) {
        alert('Please enter a valid email address.');
        return false;
    }

    if (!file || !['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        alert('Please upload an image file (JPG, JPEG, PNG, GIF).');
        return false;
    }

    return true;
}

// Show the popup when the form is successfully submitted
function showPopup() {
    const popupOverlay = document.querySelector('.popup-overlay');
    popupOverlay.style.display = 'flex';
}
