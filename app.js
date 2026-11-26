const STORAGE_KEY = 'versionback.releases.v1';

const form = document.querySelector('#release-form');
const versionInput = document.querySelector('#version-input');
const notesInput = document.querySelector('#notes-input');
const releaseList = document.querySelector('#release-list');
const emptyState = document.querySelector('#empty-state');
const releaseCount = document.querySelector('#release-count');
const currentHeading = document.querySelector('#current-heading');
const currentNote = document.querySelector('#current-note');
const toast = document.querySelector('#toast');

let releases = loadReleases();
let toastTimer;

function loadReleases() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(stored) ? stored.filter((item) => item && typeof item.id === 'string' && typeof item.version === 'string') : [];
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(releases));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2600);
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function render() {
  const active = releases.find((release) => release.active);
  currentHeading.textContent = active ? `Version ${active.version}` : 'No active version';
  currentNote.textContent = active ? (active.notes || `Added ${formatDate(active.createdAt)}`) : 'Add a release to get started.';
  releaseCount.textContent = `${releases.length} ${releases.length === 1 ? 'release' : 'releases'}`;
  emptyState.hidden = releases.length > 0;
  releaseList.replaceChildren();

  releases.forEach((release) => {
    const item = makeElement('li', `release-item${release.active ? ' is-active' : ''}`);
    const marker = makeElement('span', 'timeline-marker', release.active ? '✓' : '');
    marker.setAttribute('aria-hidden', 'true');
    const details = makeElement('div', 'release-details');
    const topLine = makeElement('div', 'release-topline');
    topLine.append(makeElement('h3', 'release-version', `Version ${release.version}`));
    if (release.active) topLine.append(makeElement('span', 'active-pill', 'ACTIVE'));
    details.append(topLine);
    if (release.notes) details.append(makeElement('p', 'release-notes', release.notes));
    details.append(makeElement('time', 'release-date', formatDate(release.createdAt)));

    const actions = makeElement('div', 'release-actions');
    if (!release.active) {
      const rollback = makeElement('button', 'button secondary', 'Make active');
      rollback.type = 'button';
      rollback.setAttribute('aria-label', `Make version ${release.version} active`);
      rollback.addEventListener('click', () => activateRelease(release.id));
      actions.append(rollback);
    }
    const remove = makeElement('button', 'icon-button', '×');
    remove.type = 'button';
    remove.setAttribute('aria-label', `Delete version ${release.version}`);
    remove.addEventListener('click', () => deleteRelease(release.id));
    actions.append(remove);

    item.append(marker, details, actions);
    releaseList.append(item);
  });
}

function activateRelease(id) {
  const selected = releases.find((release) => release.id === id);
  if (!selected) return;
  releases = releases.map((release) => ({ ...release, active: release.id === id }));
  save();
  render();
  showToast(`Version ${selected.version} is now marked active.`);
}

function deleteRelease(id) {
  const release = releases.find((item) => item.id === id);
  if (!release) return;
  if (!window.confirm(`Delete version ${release.version} from this browser's history?`)) return;
  releases = releases.filter((item) => item.id !== id);
  // If the active release is removed, make the newest remaining release active.
  if (!releases.some((item) => item.active) && releases.length) releases[0].active = true;
  save();
  render();
  showToast(`Version ${release.version} was removed from history.`);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const version = versionInput.value.trim();
  if (!version) {
    versionInput.focus();
    return;
  }
  if (releases.some((release) => release.version.toLowerCase() === version.toLowerCase())) {
    showToast('That version is already in your history.');
    versionInput.focus();
    return;
  }
  const newRelease = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    version,
    notes: notesInput.value.trim(),
    createdAt: new Date().toISOString(),
    active: releases.length === 0,
  };
  releases.unshift(newRelease);
  save();
  render();
  form.reset();
  versionInput.focus();
  showToast(`Version ${version} was added.`);
});

render();
