document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registrationForm');
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    const qrcodeDiv = document.getElementById('qrcode');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        // Validate required fields
        const requiredFields = ['firstName', 'lastName', 'email', 'mobile', 'jobTitle', 'company', 'city', 'country'];
        let isValid = true;

        requiredFields.forEach(field => {
            const element = document.getElementById(field);
            if (!element.value.trim()) {
                element.classList.add('is-invalid');
                isValid = false;
            } else {
                element.classList.remove('is-invalid');
            }
        });

        if (!isValid) {
            alert('Please fill in all required fields.');
            return;
        }

        // 1. Collect form data
        const formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            mobile: document.getElementById('mobile').value.trim(),
            jobTitle: document.getElementById('jobTitle').value.trim(),
            company: document.getElementById('company').value.trim(),
            city: document.getElementById('city').value.trim(),
            country: document.getElementById('country').value.trim(),
            registrationDate: new Date().toISOString()
        };

        // 2. Generate a secure ID
        const userId = 'user-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36);
        
        // 3. Save data with user ID
        localStorage.setItem(userId, JSON.stringify(formData));

        // 4. Update admin list
        let allRegistrants = JSON.parse(localStorage.getItem('allRegistrants')) || [];
        allRegistrants.push({ 
            ...formData,
            id: userId,
            registrationDate: formData.registrationDate
        });
        localStorage.setItem('allRegistrants', JSON.stringify(allRegistrants));

        // 5. Generate QR Code with absolute URL
        // Use this for Vercel deployment (replace with your actual Vercel URL)
        const vercelUrl = "https://megacarepharmacy-register.vercel.app/"; // UPDATE THIS WITH YOUR ACTUAL VERCEL URL
        const detailsUrl = `${vercelUrl}/registrant_details.html?id=${userId}`;
        
        // For local testing (uncomment if needed)
        // const currentUrl = new URL(window.location.href);
        // const baseUrl = currentUrl.origin + currentUrl.pathname.replace('index.html', '');
        // const detailsUrl = `${baseUrl}registrant_details.html?id=${userId}`;

        // Using QRCode Monkey API with error handling
        try {
            const qrCodeUrl = `https://api.qrcode-monkey.com/qr/custom?size=300&data=${encodeURIComponent(detailsUrl)}`;
            
            // Create download link as fallback
            const downloadLink = document.createElement('a');
            downloadLink.href = qrCodeUrl;
            downloadLink.download = `vaccine-qr-${userId}.png`;
            downloadLink.style.display = 'none';
            document.body.appendChild(downloadLink);

            qrcodeDiv.innerHTML = `
                <img src="${qrCodeUrl}" alt="QR Code" class="img-fluid mb-3">
                <p class="small text-muted">Scan this code to view your registration details</p>
                <button onclick="window.print()" class="btn btn-primary me-2">Print</button>
                <button onclick="downloadLink.click()" class="btn btn-secondary">Download</button>
            `;
            
            qrCodeContainer.classList.remove('d-none');
            form.classList.add('d-none');

            // Scroll to QR code
            qrCodeContainer.scrollIntoView({ behavior: 'smooth' });

            // Debug output
            console.log('Registration successful!');
            console.log('User ID:', userId);
            console.log('Data saved:', formData);
            console.log('QR Code URL:', detailsUrl);

        } catch (error) {
            console.error('QR generation failed:', error);
            alert('Registration successful, but QR code generation failed. Please contact support.');
            form.reset();
        }
    });

    // Add input validation on blur
    requiredFields.forEach(field => {
        document.getElementById(field).addEventListener('blur', function() {
            if (!this.value.trim()) {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
            }
        });
    });
});