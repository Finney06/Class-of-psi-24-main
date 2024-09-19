// Define submitForm function
function submitForm(event) {
    event.preventDefault(); // Prevent form submission

    // Add the 'active-hover' class to keep hover state after submission
    const submitButton = document.querySelector(".submit-button");
    submitButton.classList.add("active-hover");

    const fileInput = document.getElementById("picture");
    const file = fileInput.files[0];

    // Show loader and change button text
    document.getElementById("submit-text").innerText = "Please wait...";
    document.getElementById("loader").style.display = "inline-block";

    const whatsappNumber = document
        .getElementById("whatsapp-number")
        .value.replace(/[\s+]/g, ""); // Remove spaces and '+' sign

    // Collect form data
    const formData = {
        Name: document.getElementById("name").value,
        Nickname: document.getElementById("nickname").value,
        "Whatsapp Number": whatsappNumber,
        Email: document.getElementById("email").value,
        "Date of Birth": document.getElementById("dob").value,
        Picture: [
            { url: "" }, // Placeholder for the Cloudinary URL
        ],
    };

    if (!validateForm(formData, file)) {
        // Hide loader, reset button text and remove active hover state
        document.getElementById("submit-text").innerText = "Submit";
        document.getElementById("loader").style.display = "none";
        submitButton.classList.remove("active-hover");
        return;
    }

    // Upload image to Cloudinary
    const cloudinaryUrl = "https://api.cloudinary.com/v1_1/dhiegatc6/upload";
    const formDataCloudinary = new FormData();
    formDataCloudinary.append("file", file);
    formDataCloudinary.append("upload_preset", "hct18iyo"); // Set Cloudinary upload preset

    // Fetch request to upload image to Cloudinary
    fetch(cloudinaryUrl, {
        method: "POST",
        body: formDataCloudinary,
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            const imageUrl = data.secure_url; // Extract the URL of the uploaded image from Cloudinary response
            formData.Picture[0].url = imageUrl; // Update the Picture URL in the formData object

            // Send form data to Airtable via API
            return fetch(
                "https://api.airtable.com/v0/appufz5VPar7viZy0/tblmXStbPbBj88Z5E",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization:
                            "Bearer patMBlQYlVo3H5wZU.5a353c102f5a4090215697499350e6d7bfcf285e61c3592e663cf6692a483fac",
                    },
                    body: JSON.stringify({
                        records: [
                            {
                                fields: formData,
                            },
                        ],
                    }),
                }
            );
        })
        .then((response) => {
            if (response.ok) {
                // Display confirmation message
                showPopup(); // Call showPopup function if form submission is successful
                document.getElementById("submit-text").innerText = "Submit";
                document.getElementById("loader").style.display = "none";
                submitButton.classList.remove("active-hover"); // Remove hover state once submitted
                // Reset the form
                document.getElementById("form").reset();
            } else {
                // Handle error response
                console.error("Error submitting form:", response.statusText);
                alert("Error submitting form:", response.statusText); // Show error message
                document.getElementById("submit-text").innerText = "Submit";
                document.getElementById("loader").style.display = "none";
                submitButton.classList.remove("active-hover"); // Remove hover state on error
            }
        })
        .catch((error) => {
            console.error("Error submitting form:", error);
            alert("Error submitting form: " + error); // Show error message with full error details
            document.getElementById("submit-text").innerText = "Submit";
            document.getElementById("loader").style.display = "none";
            submitButton.classList.remove("active-hover"); // Remove hover state on error
        });
}

// Function to format WhatsApp number input
const inputField = document.getElementById("whatsapp-number");

inputField.addEventListener("input", function (e) {
    let value = e.target.value.replace(/[^\d+]/g, ""); // Remove non-numeric characters

    // Add spaces according to the format 4, 3, 3, 4
    let formattedValue = "";
    for (let i = 0; i < value.length; i++) {
        if (i === 0 && value[i] !== "+") {
            formattedValue = "+234"; // Ensure the prefix is always present
        } else if (
            (i === 4 || i === 7 || i === 10 || i === 14) &&
            value[i - 1] !== "+"
        ) {
            formattedValue += " ";
        }
        if (i === 4 && value[i] === "0") {
            continue; // Skip adding the leading '0'
        }
        formattedValue += value[i];
    }

    // Limit input to 14 characters after formatting
    if (formattedValue.length > 17) {
        formattedValue = formattedValue.substr(0, 17);
    }
    // Add "+234" prefix if the input field is empty
    if (e.target.value === "") {
        formattedValue = "+234";
    }

    e.target.value = formattedValue;
});

// Validate WhatsApp username, Email, and Picture
function validateForm(formData, file) {
    const email = formData["Email"];
    const picture = formData.Picture[0].url; // Assuming Picture is an array

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return false;
    }

    // Picture validation
    if (!file || !["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
        alert("Please upload an image file (JPG, JPEG, PNG, GIF).");
        return false;
    }

    return true;
}

// Show the popup when the form is successfully submitted
function showPopup() {
    const popupOverlay = document.querySelector(".popup-overlay");
    popupOverlay.style.display = "flex";
}

// DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", function () {
    // Call submitForm function when the form is submitted
    document.getElementById("form").addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent default form submission behavior
        submitForm(event); // Call submitForm function
    });

    // Listen for Enter key press to trigger form submission
    form.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent default Enter behavior
            submitForm(event); // Call submitForm function
        }
    });

    const okButton = document.getElementById("ok-button");
    const popupOverlay = document.querySelector(".popup-overlay");

    // Reload the page when the OK button is clicked and hide the popup
    okButton.addEventListener("click", function () {
        location.reload();
        popupOverlay.style.display = "none";
    });
});
