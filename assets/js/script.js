let globalDownloadLink;

function triggerDownload() {
  if (globalDownloadLink) {
    globalDownloadLink.click();
  } else {
    console.error("Download link not initialized.");
  }
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    const qrcodeDiv = document.getElementById('qrcode');
    const submitBtn = form.querySelector('button[type="submit"]');
    const feedbackMessage = document.createElement('div');
    feedbackMessage.className = 'alert alert-success mt-3 d-none';
    form.parentNode.insertBefore(feedbackMessage, form.nextSibling);
    
    const requiredFields = [
        'firstName', 'lastName', 'email', 'mobile', 
        'jobTitle', 'company', 'city', 'country'
    ];
  
    // Initialize field validation
    requiredFields.forEach(field => {
        const element = document.getElementById(field);
        element.addEventListener('blur', () => validateField(element));
    });
  
    const validateField = (fieldElement) => {
        const isValid = fieldElement.value.trim() !== '';
        fieldElement.classList.toggle('is-invalid', !isValid);
        return isValid;
    };
  
    const validateForm = () => {
        let isValid = true;
        requiredFields.forEach(field => {
            const element = document.getElementById(field);
            if (!validateField(element)) {
                isValid = false;
            }
        });
        return isValid;
    };
  
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        if (!validateForm()) {
            feedbackMessage.textContent = 'Please fill in all required fields correctly.';
            feedbackMessage.className = 'alert alert-danger mt-3';
            return;
        }
    
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
    
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Processing...';
        feedbackMessage.className = 'alert alert-info mt-3';
        feedbackMessage.textContent = 'Processing your registration...';
    
        try {
            // For demo using localStorage - replace with your KV storage in production
            const userId = 'user-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36);
            localStorage.setItem(userId, JSON.stringify(formData));
            
            let allRegistrants = JSON.parse(localStorage.getItem('allRegistrants')) || [];
            allRegistrants.push({ ...formData, id: userId });
            localStorage.setItem('allRegistrants', JSON.stringify(allRegistrants));
    
            const vercelUrl = "https://megacarepharmacy-register.vercel.app/";
            const detailsUrl = `${vercelUrl}registrant_details.html?id=${userId}`;
            const qrCodeUrl = `https://api.qrcode-monkey.com/qr/custom?size=300&data=${encodeURIComponent(detailsUrl)}`;
            
            globalDownloadLink = document.createElement('a');
            globalDownloadLink.href = qrCodeUrl;
            globalDownloadLink.download = `vaccine-qr-${userId}.png`;
            globalDownloadLink.style.display = 'none';
            document.body.appendChild(globalDownloadLink);
            
            qrcodeDiv.innerHTML = `
                <div class="text-center">
                    <img src="${qrCodeUrl}" alt="QR Code" class="img-fluid mb-3">
                    <p class="text-success mb-3"><i class="fas fa-check-circle"></i> Registration successful!</p>
                    <p class="small text-muted">Scan this code to verify your registration</p>
                    <div class="d-flex gap-2 mt-3">
                        <button onclick="window.print()" class="btn btn-primary flex-grow-1">
                            <i class="fas fa-print me-2"></i>Print
                        </button>
                        <button onclick="triggerDownload()" class="btn btn-success flex-grow-1">
                            <i class="fas fa-download me-2"></i>Download
                        </button>
                    </div>
                </div>
            `;
    
            qrCodeContainer.classList.remove('d-none');
            form.classList.add('d-none');
            feedbackMessage.className = 'alert alert-success mt-3 d-none';
            qrCodeContainer.scrollIntoView({ behavior: 'smooth' });
    
        } catch (error) {
            console.error('Registration error:', error);
            feedbackMessage.className = 'alert alert-danger mt-3';
            feedbackMessage.innerHTML = `
                <strong>Registration failed:</strong> ${error.message}<br>
                Please try again or contact support.
            `;
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Register';
        }
    });
});