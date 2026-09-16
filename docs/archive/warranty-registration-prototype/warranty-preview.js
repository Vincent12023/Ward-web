/*
 * Ward Rain&Sun Warranty Record V1 Preview
 * PRODUCTION BACKEND NOT CONNECTED.
 * AMAZON COMPLIANCE REVIEW REQUIRED before production launch.
 * Registration and support remain independently switchable.
 */

const ENABLE_WARRANTY_RECORD_REGISTRATION = true;
const TRANSFER_KEY = 'ward-warranty-preview-transfer';
const ORDER_ID_PATTERN = /^\d{3}-\d{7}-\d{7}$/;

const state = {
  amazonOrderId: '',
  productModel: '',
  purchaseDate: '',
  productPhoto: '',
  productPhotoName: '',
  earlyWarrantyRecord: false,
  photoLabel: 'Current Product Condition',
  supportInstructionsReviewed: false,
  operatingInstructionsReviewed: false,
  instructionVersion: 'Auto Umbrella Guide v1.0',
  acknowledgedAt: '',
  recordId: '',
  recordCreatedAt: '',
  recordUpdatedAt: '',
  purchaseVerificationStatus: 'not_reviewed'
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('visible'), 2200);
}

function setPanel(panelId, step) {
  $$('.panel').forEach((panel) => panel.classList.toggle('active', panel.id === panelId));
  $$('.stepper-item').forEach((item) => {
    const itemStep = Number(item.dataset.step);
    item.classList.toggle('active', itemStep === step);
    item.classList.toggle('complete', itemStep < step);
  });
  $('.workflow-shell').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function openWorkflow() {
  const workflow = $('#setup');
  workflow.hidden = false;
  document.body.classList.add('flow-open');
  setPanel('panel-prepare', 1);
}

function applyFeatureFlag() {
  if (ENABLE_WARRANTY_RECORD_REGISTRATION) return;
  $('#hero-title').textContent = 'Lifetime Warranty & Product Care';
  $('#hero-subtitle').textContent = 'Product support when you need it';
  $('#hero-copy').textContent = 'Learn how to care for your umbrella and contact Ward Rain&Sun Product Support for help.';
  $('#start-setup').hidden = true;
  $('.why-section').hidden = true;
}

function setFieldState(input, error, isValid) {
  input.classList.toggle('error', !isValid);
  input.classList.toggle('valid', isValid);
  error.classList.toggle('visible', !isValid);
  input.setAttribute('aria-invalid', String(!isValid));
  return isValid;
}

function isValidPurchaseDate(value) {
  if (!value) return false;
  const chosen = new Date(`${value}T12:00:00`);
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  return !Number.isNaN(chosen.getTime()) && chosen <= now;
}

function getDaysSincePurchase(value) {
  const chosen = new Date(`${value}T12:00:00`);
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  return Math.floor((now - chosen) / 86400000);
}

function updateDateStatus() {
  const value = $('#purchase-date').value;
  const isValid = isValidPurchaseDate(value);
  setFieldState($('#purchase-date'), $('#date-error'), isValid);
  if (!isValid) {
    $('#early-status').hidden = true;
    $('#after-30-route').hidden = true;
    $('#details-actions').hidden = false;
    return;
  }

  const days = getDaysSincePurchase(value);
  state.earlyWarrantyRecord = days <= 30;
  state.photoLabel = state.earlyWarrantyRecord ? 'Early Product Condition' : 'Current Product Condition';
  $('#early-status').hidden = !state.earlyWarrantyRecord;
  if (state.earlyWarrantyRecord) {
    $('#after-30-route').hidden = true;
    $('#details-actions').hidden = false;
  }
}

function compressPreviewImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const maxDimension = 900;
        const ratio = Math.min(1, maxDimension / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * ratio));
        canvas.height = Math.max(1, Math.round(image.height * ratio));
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function handleProductPhoto(file) {
  if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    $('#record-photo-box').classList.add('error');
    $('#photo-error').classList.add('visible');
    return;
  }
  try {
    state.productPhoto = await compressPreviewImage(file);
    state.productPhotoName = file.name;
    $('#record-photo-thumb').src = state.productPhoto;
    $('#record-photo-name').textContent = file.name;
    $('#record-photo-preview').classList.add('visible');
    $('#record-photo-box').classList.remove('error');
    $('#photo-error').classList.remove('visible');
  } catch {
    $('#photo-error').textContent = 'We could not prepare that image. Please choose a JPEG, PNG, or WebP file.';
    $('#photo-error').classList.add('visible');
    $('#record-photo-box').classList.add('error');
  }
}

function clearProductPhoto() {
  state.productPhoto = '';
  state.productPhotoName = '';
  $('#record-photo').value = '';
  $('#record-photo-thumb').removeAttribute('src');
  $('#record-photo-preview').classList.remove('visible');
}

function validateDetails() {
  const orderId = $('#order-id').value.trim();
  const productModel = $('#product-model').value.trim();
  const purchaseDate = $('#purchase-date').value;

  const orderValid = setFieldState($('#order-id'), $('#order-error'), ORDER_ID_PATTERN.test(orderId));
  const modelValid = setFieldState($('#product-model'), $('#model-error'), productModel.length > 1);
  const dateValid = setFieldState($('#purchase-date'), $('#date-error'), isValidPurchaseDate(purchaseDate));
  const photoValid = Boolean(state.productPhoto);
  $('#record-photo-box').classList.toggle('error', !photoValid);
  $('#photo-error').classList.toggle('visible', !photoValid);

  if (!(orderValid && modelValid && dateValid && photoValid)) {
    document.querySelector('.error, .field-error.visible')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return false;
  }

  state.amazonOrderId = orderId;
  state.productModel = productModel;
  state.purchaseDate = purchaseDate;
  const days = getDaysSincePurchase(purchaseDate);
  state.earlyWarrantyRecord = days <= 30;
  state.photoLabel = state.earlyWarrantyRecord ? 'Early Product Condition' : 'Current Product Condition';
  return true;
}

function formatDate(value) {
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
}

function renderReview() {
  $('#review-order').textContent = state.amazonOrderId;
  $('#review-model').textContent = state.productModel;
  $('#review-date').textContent = formatDate(state.purchaseDate);
  $('#review-photo').src = state.productPhoto;
  setPanel('panel-review', 1);
}

function saveTransferForSupport() {
  const transfer = {
    amazonOrderId: state.amazonOrderId,
    productModel: state.productModel,
    purchaseDate: state.purchaseDate,
    productPhoto: state.productPhoto,
    productPhotoName: state.productPhotoName,
    warrantyRecordId: state.recordId || ''
  };
  try {
    sessionStorage.setItem(TRANSFER_KEY, JSON.stringify(transfer));
  } catch {
    try {
      sessionStorage.setItem(TRANSFER_KEY, JSON.stringify({ ...transfer, productPhoto: '' }));
    } catch {
      // The support page will still work without prefilled session data.
    }
  }
}

function generatePreviewId(prefix) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return `${prefix}-${[...bytes].map((byte) => alphabet[byte % alphabet.length]).join('')}`;
}

function maskOrderId(orderId) {
  const parts = orderId.split('-');
  return `${parts[0]}-*******-${parts[2].slice(-4)}`;
}

function renderSuccess() {
  const now = new Date();
  if (!state.recordId) {
    state.recordId = generatePreviewId('WR');
    state.recordCreatedAt = now.toISOString();
  } else {
    state.recordUpdatedAt = now.toISOString();
  }

  state.supportInstructionsReviewed = true;
  state.operatingInstructionsReviewed = true;
  state.acknowledgedAt = now.toISOString();

  $('#success-title').textContent = state.earlyWarrantyRecord ? '30-Day Warranty Setup Complete' : 'Warranty Record Created';
  $('#success-subtitle').textContent = state.earlyWarrantyRecord
    ? 'Your early Warranty Record has been created successfully.'
    : 'Your Warranty Record has been created successfully.';
  $('#condition-status').textContent = state.earlyWarrantyRecord ? 'Early Product Condition Recorded' : 'Current Product Condition Recorded';
  $('#success-record-id').textContent = state.recordId;
  $('#success-order').textContent = maskOrderId(state.amazonOrderId);
  $('#success-product').textContent = state.productModel;
  $('#success-created').textContent = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(state.recordCreatedAt));
  $('#updated-row').hidden = !state.recordUpdatedAt;
  if (state.recordUpdatedAt) {
    $('#success-updated').textContent = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(state.recordUpdatedAt));
  }

  saveTransferForSupport();
  setPanel('panel-success', 3);
}

function returnToDetails(focusSelector) {
  $('#after-30-route').hidden = true;
  $('#details-actions').hidden = false;
  setPanel('panel-details', 1);
  window.setTimeout(() => $(focusSelector)?.focus(), 350);
}

function downloadCareGuide() {
  const guide = `Ward Rain&Sun — Auto Umbrella Care Guide\n\nBEFORE OPENING\n1. Unfasten the strap.\n2. Gently shake the umbrella to loosen the canopy and ribs.\n3. Press the button to open.\n\nTO CLOSE\n1. Press the button once. The canopy will automatically close.\n2. Hold the handle with one hand and place your other hand near the upper part of the shaft.\n3. Push the shaft firmly together in one continuous motion until it locks.\n\nCARE TIPS\n• Allow the umbrella to air-dry before long-term storage.\n• Always use the automatic open / close button as intended.\n• Loosen the canopy before opening.\n• Use extra care in severe weather.\n\nProduct Support: support@wardrainsun.com\nWarranty Terms: https://wardrainsun.com/warranty-terms-preview\n\nPreview guide — final operating instructions require Product Team verification.`;
  const url = URL.createObjectURL(new Blob([guide], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ward-rain-sun-care-guide.txt';
  link.click();
  URL.revokeObjectURL(url);
}

function copySupportEmail() {
  const email = 'support@wardrainsun.com';
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(email).then(() => showToast('Support email copied.')).catch(() => showToast(email));
  } else {
    showToast(email);
  }
}

$('#start-setup').addEventListener('click', openWorkflow);
$('#prepare-continue').addEventListener('click', () => setPanel('panel-details', 1));
$('#purchase-date').max = new Date().toISOString().split('T')[0];
$('#purchase-date').addEventListener('change', updateDateStatus);
$('#record-photo').addEventListener('change', (event) => handleProductPhoto(event.target.files[0]));
$('#record-photo-remove').addEventListener('click', clearProductPhoto);

$('#record-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (!validateDetails()) return;
  if (!state.earlyWarrantyRecord) {
    $('#after-30-route').hidden = false;
    $('#details-actions').hidden = true;
    $('#after-30-route').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  renderReview();
});

$('#continue-record').addEventListener('click', () => {
  if (validateDetails()) renderReview();
});

$('#route-support').addEventListener('click', () => {
  if (!validateDetails()) return;
  saveTransferForSupport();
  window.location.href = '/warranty-claim-preview?from=warranty-record';
});

$('#edit-information').addEventListener('click', () => returnToDetails('#order-id'));
$('#review-continue').addEventListener('click', () => setPanel('panel-important', 2));
$('#important-back').addEventListener('click', renderReview);

function updateCreateButton() {
  $('#create-record').disabled = !($('#support-reviewed').checked && $('#operating-reviewed').checked);
}

$('#support-reviewed').addEventListener('change', updateCreateButton);
$('#operating-reviewed').addEventListener('change', updateCreateButton);
$('#create-record').addEventListener('click', renderSuccess);
$('#save-confirmation').addEventListener('click', () => window.print());
$('#download-care').addEventListener('click', downloadCareGuide);
$('#update-information').addEventListener('click', () => returnToDetails('#order-id'));
$('#update-product').addEventListener('click', () => returnToDetails('#product-model'));
$('#update-photo').addEventListener('click', () => returnToDetails('#record-photo'));
$$('[data-copy-email]').forEach((button) => button.addEventListener('click', copySupportEmail));

$$('a[href="/warranty-claim-preview"]').forEach((link) => {
  link.addEventListener('click', () => {
    if (state.amazonOrderId) saveTransferForSupport();
  });
});

applyFeatureFlag();
