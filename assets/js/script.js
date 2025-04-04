document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registrationForm');
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    const qrcodeDiv = document.getElementById('qrcode');

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            mobile: document.getElementById('mobile').value,
            jobTitle: document.getElementById('jobTitle').value,
            company: document.getElementById('company').value,
            city: document.getElementById('city').value,
            country: document.getElementById('country').value,
        };

        // Construct the URL with registrant details as parameters
        const detailsUrl = `registrant_details.html?firstName=${encodeURIComponent(formData.firstName)}&lastName=${encodeURIComponent(formData.lastName)}&email=${encodeURIComponent(formData.email)}&mobile=${encodeURIComponent(formData.mobile)}&jobTitle=${encodeURIComponent(formData.jobTitle)}&company=${encodeURIComponent(formData.company)}&city=${encodeURIComponent(formData.city)}&country=${encodeURIComponent(formData.country)}`;

        qrcodeDiv.innerHTML = '';
        const qrcode = new QRCode(qrcodeDiv, {
            text: detailsUrl, // Encode the URL in the QR code
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.L
        });

        qrCodeContainer.classList.remove('d-none');
        form.classList.add('d-none');
        alert('Registration successful! Scan the QR code to view your details.');
    });
});