/* Kookie Creates — site behaviour
   Progressive enhancement only: every page works without this file. */

document.addEventListener('DOMContentLoaded', function () {
  initNavToggle();
  initPortfolioFilters();
  initUploadZone();
  initCustomOrderForm();
});

/* ---------- Mobile nav ---------- */
function initNavToggle() {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.textContent = isOpen ? 'Close' : 'Menu';
  });

  nav.addEventListener('click', function (event) {
    if (event.target.tagName === 'A' && nav.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = 'Menu';
    }
  });
}

/* ---------- Portfolio filters ---------- */
function initPortfolioFilters() {
  var filterBar = document.querySelector('.portfolio-filters');
  if (!filterBar) return;

  var buttons = filterBar.querySelectorAll('button[data-filter]');
  var cards = document.querySelectorAll('.work-card[data-category]');

  filterBar.addEventListener('click', function (event) {
    var button = event.target.closest('button[data-filter]');
    if (!button) return;

    buttons.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
    button.setAttribute('aria-pressed', 'true');

    var filter = button.getAttribute('data-filter');
    cards.forEach(function (card) {
      var match = filter === 'all' || card.getAttribute('data-category') === filter;
      card.hidden = !match;
    });
  });
}

/* ---------- Upload zone ---------- */
function initUploadZone() {
  var zone = document.querySelector('.upload-zone');
  var input = document.getElementById('assets');
  var list = document.getElementById('upload-list');
  if (!zone || !input || !list) return;

  var files = [];

  ['dragenter', 'dragover'].forEach(function (evt) {
    zone.addEventListener(evt, function (e) {
      e.preventDefault();
      zone.classList.add('is-dragover');
    });
  });
  ['dragleave', 'drop'].forEach(function (evt) {
    zone.addEventListener(evt, function (e) {
      e.preventDefault();
      zone.classList.remove('is-dragover');
    });
  });
  zone.addEventListener('drop', function (e) {
    if (e.dataTransfer && e.dataTransfer.files.length) {
      addFiles(e.dataTransfer.files);
    }
  });

  input.addEventListener('change', function () {
    addFiles(input.files);
  });

  function addFiles(fileList) {
    Array.prototype.forEach.call(fileList, function (file) {
      files.push(file);
    });
    renderList();
  }

  function removeFile(index) {
    files.splice(index, 1);
    renderList();
  }

  function renderList() {
    list.innerHTML = '';
    files.forEach(function (file, index) {
      var item = document.createElement('li');

      var name = document.createElement('span');
      name.textContent = file.name + ' — ' + formatSize(file.size);

      var remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Remove';
      remove.setAttribute('aria-label', 'Remove ' + file.name);
      remove.addEventListener('click', function () { removeFile(index); });

      item.appendChild(name);
      item.appendChild(remove);
      list.appendChild(item);
    });
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}

/* ---------- Custom order form validation ---------- */
function initCustomOrderForm() {
  var form = document.getElementById('custom-order-form');
  if (!form) return;

  var status = document.getElementById('form-status');
  var honeypot = document.getElementById('website');

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    // Silently drop likely bot submissions.
    if (honeypot && honeypot.value) return;

    var requiredFields = form.querySelectorAll('[required]');
    var firstInvalid = null;

    requiredFields.forEach(function (field) {
      var errorEl = field.parentElement.querySelector('.field-error');
      var isEmpty = !field.value.trim();

      if (isEmpty) {
        field.setAttribute('aria-invalid', 'true');
        if (errorEl) {
          errorEl.textContent = field.getAttribute('data-error-message') || 'This field is required.';
          errorEl.classList.add('is-visible');
        }
        if (!firstInvalid) firstInvalid = field;
      } else {
        field.removeAttribute('aria-invalid');
        if (errorEl) errorEl.classList.remove('is-visible');
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
      setStatus('Please fill in the highlighted fields before sending.', 'error');
      return;
    }

    // No backend is wired up yet — this is where a real submission would go.
    setStatus('Thanks — your idea has been sent. We\u2019ll reply by email or phone shortly.', 'success');
    form.reset();
    var uploadList = document.getElementById('upload-list');
    if (uploadList) uploadList.innerHTML = '';
  });

  requiredFieldsClearErrorOnInput(form);

  function setStatus(message, type) {
    if (!status) return;
    status.textContent = message;
    status.className = 'form-status is-visible ' + (type === 'error' ? 'is-error' : 'is-success');
  }
}

function requiredFieldsClearErrorOnInput(form) {
  form.querySelectorAll('[required]').forEach(function (field) {
    field.addEventListener('input', function () {
      if (field.value.trim()) {
        field.removeAttribute('aria-invalid');
        var errorEl = field.parentElement.querySelector('.field-error');
        if (errorEl) errorEl.classList.remove('is-visible');
      }
    });
  });
}
