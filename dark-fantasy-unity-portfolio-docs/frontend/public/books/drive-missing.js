const params = new URLSearchParams(window.location.search);
const title = params.get('title') || 'Book';
document.querySelector('[data-title]').textContent = `Book: ${title}`;
