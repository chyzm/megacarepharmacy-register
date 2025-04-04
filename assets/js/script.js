document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registrationForm');
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    const qrcodeDiv = document.getElementById('qrcode');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        // 1. Collect form data
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            mobile: document.getElementById('mobile').value,
            jobTitle: document.getElementById('jobTitle').value,
            company: document.getElementById('company').value,
            city: document.getElementById('city').value,
            country: document.getElementById('country').value,
            registrationDate: new Date().toISOString()
        };

        // 2. Generate a secure ID (instead of exposing data in URL)
        const userId = Math.random().toString(36).substring(2, 10);
        localStorage.setItem(userId, JSON.stringify(formData));

        // 3. Save to admin list
        let allRegistrants = JSON.parse(localStorage.getItem('allRegistrants')) || [];
        allRegistrants.push({ ...formData, id: userId });
        localStorage.setItem('allRegistrants', JSON.stringify(allRegistrants));

        // 4. Generate QR Code using QRCode Monkey
        const detailsUrl = `${window.location.origin}/registrant_details.html?id=${userId}`;
        const qrCodeUrl = `https://api.qrcode-monkey.com/qr/custom?size=300&data=${encodeURIComponent(detailsUrl)}`;

        // 5. Display QR Code
        qrcodeDiv.innerHTML = `<img src="${qrCodeUrl}" alt="QR Code" class="img-fluid">`;
        qrCodeContainer.classList.remove('d-none');
        form.classList.add('d-none');
    });
});