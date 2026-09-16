/*
 * Ward Rain&Sun Warranty Claim V1 Preview
 * PRODUCTION BACKEND NOT CONNECTED.
 * No email, order information, or image is transmitted or persistently stored.
 */

const TRANSFER_KEY = 'ward-warranty-preview-transfer';
const ORDER_ID_PATTERN = /^\d{3}-\d{7}-\d{7}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const claimState = {
  issueType: '',
  fullProductPhoto: '',
  fullProductPhotoName: '',
  issuePhoto: '',
  issuePhotoName: '',
  warrantyRecordId: '',
  caseId: ''
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function setFieldState(input, error, isValid) {
  input.classList.toggle('error', !isValid);
  input.classList.toggle('valid', isValid);
  error.classList.toggle('visible', !isValid);
  input.setAttribute('aria-invalid', String(!isValid));
  return isValid;
}

function isValidOptionalDate(value) {
  if (!value) return true;
  const date = new Date(`${value}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return !Number.isNaN(date.getTime()) && date <= today;
}

function generatePreviewId(prefix) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return `${prefix}-${[...bytes].map((byte) => alphabet[byte % alphabet.length]).join('')}`;
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
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function setPhoto(kind, file) {
  const isFull = kind === 'full';
  const box = $(isFull ? '#full-photo-box' : '#issue-photo-box');
  const error = $(isFull ? '#full-photo-error' : '#issue-photo-error');
  if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    box.classList.add('error');
    error.classList.add('visible');
    return;
  }
  try {
    const imageData = await compressPreviewImage(file);
    if (isFull) {
      claimState.fullProductPhoto = imageData;
      claimState.fullProductPhotoName = file.name;
      $('#full-photo-thumb').src = imageData;
      $('#full-photo-name').textContent = file.name;
      $('#full-photo-preview').classList.add('visible');
    } else {
      claimState.issuePhoto = imageData;
      claimState.issuePhotoName = file.name;
      $('#issue-photo-thumb').src = imageData;
      $('#issue-photo-name').textContent = file.name;
      $('#issue-photo-preview').classList.add('visible');
    }
    box.classList.remove('error');
    error.classList.remove('visible');
  } catch {
    error.textContent = 'We could not prepare that image. Please choose a JPEG, PNG, or WebP file.';
    error.classList.add('visible');
    box.classList.add('error');
  }
}

function clearPhoto(kind) {
  const isFull = kind === 'full';
  if (isFull) {
    claimState.fullProductPhoto = '';
    claimState.fullProductPhotoName = '';
    $('#full-photo').value = '';
    $('#full-photo-preview').classList.remove('visible');
  } else {
    claimState.issuePhoto = '';
    claimState.issuePhotoName = '';
    $('#issue-photo').value = '';
    $('#issue-photo-preview').classList.remove('visible');
  }
}

function loadTransfer() {
  let transfer;
  try {
    transfer = JSON.parse(sessionStorage.getItem(TRANSFER_KEY) || 'null');
  } catch {
    transfer = null;
  }
  if (!transfer) return;

  $('#claim-order-id').value = transfer.amazonOrderId || '';
  $('#claim-model').value = transfer.productModel || '';
  $('#claim-date').value = transfer.purchaseDate || '';
  claimState.warrantyRecordId = transfer.warrantyRecordId || '';

  if (transfer.productPhoto) {
    claimState.fullProductPhoto = transfer.productPhoto;
    claimState.fullProductPhotoName = transfer.productPhotoName || 'Product photo from Warranty Record flow';
    $('#full-photo-thumb').src = transfer.productPhoto;
    $('#full-photo-name').textContent = claimState.fullProductPhotoName;
    $('#full-photo-preview').classList.add('visible');
  }
  $('#carry-banner').classList.add('visible');
}

function showClaimForm(shouldScroll = true) {
  $('#resolved-box').hidden = true;
  $('#claim-form-section').hidden = false;
  if (shouldScroll) $('#claim-form-title').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function selectIssue() {
  const selected = $('input[name="issue-type"]:checked');
  if (!selected) return;
  claimState.issueType = selected.value;
  $('#issue-error').classList.remove('visible');
  $('#resolved-box').hidden = true;

  if (selected.value === 'Auto open / close issue') {
    $('#troubleshoot').hidden = false;
    $('#claim-form-section').hidden = true;
    return;
  }

  $('#troubleshoot').hidden = true;
  showClaimForm(false);
}

function validateClaim() {
  const order = $('#claim-order-id');
  const model = $('#claim-model');
  const date = $('#claim-date');
  const description = $('#problem-description');
  const email = $('#contact-email');

  const valid = [
    setFieldState(order, $('#claim-order-error'), ORDER_ID_PATTERN.test(order.value.trim())),
    setFieldState(model, $('#claim-model-error'), model.value.trim().length > 1),
    setFieldState(date, $('#claim-date-error'), isValidOptionalDate(date.value)),
    setFieldState(description, $('#description-error'), description.value.trim().length >= 10),
    setFieldState(email, $('#email-error'), EMAIL_PATTERN.test(email.value.trim()))
  ];

  const fullPhotoValid = Boolean(claimState.fullProductPhoto);
  const issuePhotoValid = Boolean(claimState.issuePhoto);
  $('#full-photo-box').classList.toggle('error', !fullPhotoValid);
  $('#full-photo-error').classList.toggle('visible', !fullPhotoValid);
  $('#issue-photo-box').classList.toggle('error', !issuePhotoValid);
  $('#issue-photo-error').classList.toggle('visible', !issuePhotoValid);

  if (!valid.every(Boolean) || !fullPhotoValid || !issuePhotoValid) {
    document.querySelector('.error, .field-error.visible')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return false;
  }
  return true;
}

function renderCaseStatus(status) {
  const card = $('#case-status-card');
  if (status === 'verified') {
    card.innerHTML = '<h3>Purchase Confirmed</h3><p>The purchase information has been confirmed for this support case.</p>';
    return;
  }
  if (status === 'needs-information') {
    card.innerHTML = '<h3>We Need a Little More Information</h3><p>We weren\'t able to confirm the purchase using the order information provided. Please double-check your Amazon Order ID or provide another proof of purchase so we can continue reviewing your request.</p><div class="case-status-actions"><button class="btn btn-outline small-btn" id="status-update-order" type="button">Update Order ID</button><button class="btn btn-outline small-btn" id="status-upload-proof" type="button">Upload Proof of Purchase</button><input id="proof-upload" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" hidden /></div>';
    $('#status-update-order').addEventListener('click', returnToClaimOrder);
    $('#status-upload-proof').addEventListener('click', () => $('#proof-upload').click());
    $('#proof-upload').addEventListener('change', (event) => {
      if (event.target.files[0]) {
        $('#status-upload-proof').textContent = 'Proof selected for local preview';
        $('#status-upload-proof').disabled = true;
      }
    });
    return;
  }
  card.innerHTML = '<h3>Purchase Information Under Review</h3><p>Product Support would review the order information as part of this claim workflow.</p>';
}

function submitMockClaim() {
  claimState.caseId = generatePreviewId('WS');
  const hadRecord = Boolean(claimState.warrantyRecordId);
  if (!hadRecord) claimState.warrantyRecordId = generatePreviewId('WR');

  $('#case-id').textContent = claimState.caseId;
  $('#claim-record-id').textContent = claimState.warrantyRecordId;
  $('#record-id-label').textContent = hadRecord ? 'Warranty Record' : 'Warranty Record ID';
  $('#created-record-message').hidden = hadRecord;
  $('#success-issue-type').textContent = claimState.issueType;
  $('#success-email').textContent = $('#contact-email').value.trim();
  $('#issue-step').hidden = true;
  $('#claim-form-section').hidden = true;
  $('#claim-success').hidden = false;
  renderCaseStatus('reviewing');
  $('#claim-success').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function returnToClaimOrder() {
  $('#claim-success').hidden = true;
  $('#issue-step').hidden = false;
  $('#troubleshoot').hidden = true;
  $('#resolved-box').hidden = true;
  $('#claim-form-section').hidden = false;
  window.setTimeout(() => $('#claim-order-id').focus(), 120);
}

$$('input[name="issue-type"]').forEach((input) => input.addEventListener('change', selectIssue));
$('#solved-button').addEventListener('click', () => {
  $('#troubleshoot').hidden = true;
  $('#claim-form-section').hidden = true;
  $('#resolved-box').hidden = false;
  $('#resolved-box').scrollIntoView({ behavior: 'smooth', block: 'center' });
});
$('#still-help-button').addEventListener('click', () => showClaimForm(true));
$('#full-photo').addEventListener('change', (event) => setPhoto('full', event.target.files[0]));
$('#issue-photo').addEventListener('change', (event) => setPhoto('issue', event.target.files[0]));
$('#full-photo-remove').addEventListener('click', () => clearPhoto('full'));
$('#issue-photo-remove').addEventListener('click', () => clearPhoto('issue'));
$('#claim-date').max = new Date().toISOString().split('T')[0];

$('#claim-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (!claimState.issueType) {
    $('#issue-error').classList.add('visible');
    $('#issue-step').scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  if (validateClaim()) submitMockClaim();
});

$('#case-status-select').addEventListener('change', (event) => renderCaseStatus(event.target.value));
$('#update-claim-order').addEventListener('click', returnToClaimOrder);

loadTransfer();
