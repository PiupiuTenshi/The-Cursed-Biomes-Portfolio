const params = new URLSearchParams(window.location.search);
const gateTokenInput = document.querySelector('[data-gate-token]');
const passwordInput = document.querySelector('[data-password]');
const form = document.querySelector('[data-login-form]');
const statusText = document.querySelector('[data-status]');
const destinationButtons = document.querySelectorAll('[data-login-destination]');
let selectedDestination = '/admin/dashboard.html';

gateTokenInput.value = params.get('gateToken') || '';

destinationButtons.forEach((button) => {
  button.addEventListener('click', () => {
    selectedDestination = button.getAttribute('data-login-destination') === '/?admin=1'
      ? '/?admin=1'
      : '/admin/dashboard.html';
  });
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  statusText.textContent = 'Checking gate...';
  const returnTo = (event.submitter?.getAttribute('data-login-destination') || selectedDestination) === '/?admin=1'
    ? '/?admin=1'
    : '/admin/dashboard.html';

  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gateToken: gateTokenInput.value,
        password: passwordInput.value,
        returnTo,
      }),
    });

    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Login failed');

    statusText.textContent = 'Gate opened.';
    window.location.assign(returnTo);
  } catch (error) {
    statusText.textContent = error.message;
  }
});
