const reflectionInput = document.getElementById('reflectionInput');
const saveStatus = document.getElementById('saveStatus');
const saveReflectionButton = document.getElementById('saveReflection');
const savedCount = document.getElementById('savedCount');
const moodButtons = document.querySelectorAll('.mood-button');

const STORAGE_KEY = 'selfreflection-saves';
const MOOD_KEY = 'selfreflection-mood';

function getSavedReflections() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? Number.parseInt(stored, 10) || 0 : 0;
}

function updateCount() {
  const count = getSavedReflections();
  savedCount.textContent = String(count);
}

function saveReflection() {
  const text = reflectionInput.value.trim();

  if (!text) {
    saveStatus.textContent = 'Write a few thoughts before saving.';
    saveStatus.style.color = '#b85c4a';
    return;
  }

  const nextCount = getSavedReflections() + 1;
  localStorage.setItem(STORAGE_KEY, String(nextCount));
  updateCount();

  saveStatus.textContent = 'Reflection saved';
  saveStatus.style.color = '#2e7d67';
  reflectionInput.value = '';
}

function setActiveMood(button) {
  moodButtons.forEach((item) => item.classList.toggle('active', item === button));

  const mood = button.dataset.mood;
  localStorage.setItem(MOOD_KEY, mood);
  const moodStat = document.querySelector('.stat-card strong');
  if (moodStat) {
    moodStat.textContent = mood;
  }
}

saveReflectionButton.addEventListener('click', saveReflection);

moodButtons.forEach((button) => {
  button.addEventListener('click', () => setActiveMood(button));
});

const storedMood = localStorage.getItem(MOOD_KEY);
if (storedMood) {
  const matchingButton = [...moodButtons].find((button) => button.dataset.mood === storedMood);
  if (matchingButton) {
    setActiveMood(matchingButton);
  }
}

updateCount();
