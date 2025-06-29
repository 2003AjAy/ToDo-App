document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registration-form');
    const nameInput = document.getElementById('name');
    const dobInput = document.getElementById('dob');
    const errorMsg = document.getElementById('error-msg');

    // Auto-redirect if user already exists
    const existingUser = JSON.parse(localStorage.getItem('taskflow-user'));
    if (existingUser) {
      window.location.href = 'app.html';
    }

    // Form submission handler
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = nameInput.value.trim();
      const dob = new Date(dobInput.value);
      const today = new Date();

      if (!name || !dobInput.value) {
        errorMsg.textContent = 'Please fill out all fields.';
        return;
      }

      // Calculate age
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--; // adjust if birthday hasn't occurred this year
      }

      if (age <= 10) {
        errorMsg.textContent = 'You must be over 10 years old to use TaskFlow.';
        return;
      }

      // Save user to localStorage
      const userData = {
        name: name,
        dob: dobInput.value
      };
      localStorage.setItem('taskflow-user', JSON.stringify(userData));

      // Redirect to main app
      window.location.href = 'app.html';
    });
});