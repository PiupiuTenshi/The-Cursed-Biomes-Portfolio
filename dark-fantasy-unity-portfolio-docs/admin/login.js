const params = new URLSearchParams(window.location.search);
const gateTokenInput = document.querySelector('[data-gate-token]');
const passwordInput = document.querySelector('[data-password]');
const form = document.querySelector('[data-login-form]');
const statusText = document.querySelector('[data-status]');

gateTokenInput.value = params.get('gateToken') || '';

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  statusText.textContent = 'Checking gate...';

  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gateToken: gateTokenInput.value,
        password: passwordInput.value,
      }),
    });

    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Login failed');

    statusText.textContent = 'Gate opened.';
    window.location.href = payload.redirectTo || '/admin/dashboard.html';
  } catch (error) {
    statusText.textContent = error.message;
  }
});
