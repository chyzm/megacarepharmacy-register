document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const form = document.getElementById('registrationForm');
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    const qrcodeDiv = document.getElementById('qrcode');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Required fields
    const requiredFields = [
      'firstName', 'lastName', 'email', 'mobile', 
      'jobTitle', 'company', 'city', 'country'
    ];
  
    // Initialize field validation
    const initializeValidation = () => {
      requiredFields.forEach(field => {
        const element = document.getElementById(field);
        element.addEventListener('blur', () => validateField(element));
      });
    };
  
    // Validate single field
    const validateField = (fieldElement) => {
      const isValid = fieldElement.value.trim() !== '';
      fieldElement.classList.toggle('is-invalid', !isValid);
      return isValid;
    };
  
    // Validate entire form
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
  
    // Create download button
    const createDownloadButton = (qrCodeUrl, userId) => {
      const button = document.createElement('button');
      button.className = 'btn btn-success flex-grow-1';
      button.innerHTML = '<i class="fas fa-download me-2"></i>Download';
      button.onclick = () => {
        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = `vaccine-registration-${userId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      return button;
    };
  
    // Form submission handler
    form.addEventListener('submit', async function(event) {
      event.preventDefault();
      
      // Validate form
      if (!validateForm()) {
        alert('Please fill in all required fields correctly.');
        return;
      }
  
      // Prepare form data
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
  
      // Show loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Processing...';
  
      try {
        // Submit to API
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
  
        const result = await response.json();
  
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Registration failed');
        }
  
        // Generate QR Code
        const qrCodeUrl = `https://api.qrcode-monkey.com/qr/custom?size=300&data=${encodeURIComponent(result.qrData)}`;
        
        // Display results
        qrcodeDiv.innerHTML = `
          <div class="text-center">
            <img src="${qrCodeUrl}" alt="Vaccine Registration QR Code" class="img-fluid mb-3">
            <p class="small text-muted">Scan this code to verify registration</p>
            <div class="d-flex gap-2 mt-3">
              <button onclick="window.print()" class="btn btn-primary flex-grow-1">
                <i class="fas fa-print me-2"></i>Print
              </button>
            </div>
          </div>
        `;
  
        // Add download button
        const downloadBtn = createDownloadButton(qrCodeUrl, result.id);
        qrcodeDiv.querySelector('.d-flex').appendChild(downloadBtn);
  
        // Show QR container
        qrCodeContainer.classList.remove('d-none');
        form.classList.add('d-none');
        qrCodeContainer.scrollIntoView({ behavior: 'smooth' });
  
        // Log success
        console.log('Registration successful:', result);
  
      } catch (error) {
        console.error('Registration error:', error);
        alert(`Registration failed: ${error.message}\n\nPlease try again.`);
      } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Register';
      }
    });
  
    // Initialize form validation
    initializeValidation();
  });