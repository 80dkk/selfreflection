const reflectionInput = document.getElementById('reflectionInput');
const saveStatus = document.getElementById('saveStatus');
const saveReflectionButton = document.getElementById('saveReflection');
const savedCount = document.getElementById('savedCount');
const moodButtons = document.querySelectorAll('.mood-button');
const journalList = document.getElementById('journalList');
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const promptTags = document.querySelectorAll('.mini-tag');

const STORAGE_KEY = 'selfreflection-saves';
const MOOD_KEY = 'selfreflection-mood';
const CHAT_KEY = 'selfreflection-chat';

function readSavedReflections() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function writeSavedReflections(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderJournal() {
  const entries = readSavedReflections();
  savedCount.textContent = String(entries.length);

  if (!journalList) {
    return;
  }

  if (!entries.length) {
    journalList.innerHTML = '<li class="empty-state">No reflections yet. Write your first note and save it.</li>';
    return;
  }

  journalList.innerHTML = entries
    .slice()
    .reverse()
    .map(
      (entry) => `
        <li class="journal-item">
          <div class="journal-item-top">
            <span class="mood-chip">${escapeHtml(entry.mood || 'Calm')}</span>
            <time>${formatDate(entry.createdAt)}</time>
          </div>
          <p>${escapeHtml(entry.text)}</p>
        </li>
      `
    )
    .join('');
}

function updateCount() {
  renderJournal();
}

function saveReflection() {
  const text = reflectionInput.value.trim();

  if (!text) {
    saveStatus.textContent = 'Write a few thoughts before saving.';
    saveStatus.style.color = '#b85c4a';
    return;
  }

  const entries = readSavedReflections();
  const mood = localStorage.getItem(MOOD_KEY) || 'Calm';
  entries.push({
    text,
    mood,
    createdAt: new Date().toISOString()
  });

  writeSavedReflections(entries);
  renderJournal();

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

function saveChatHistory() {
  if (!chatMessages) {
    return;
  }

  const history = Array.from(chatMessages.querySelectorAll('.message')).map((message) => ({
    role: message.classList.contains('user') ? 'user' : 'bot',
    text: message.querySelector('.bubble')?.textContent || ''
  }));

  localStorage.setItem(CHAT_KEY, JSON.stringify(history));
}

function addMessage(role, text) {
  if (!chatMessages) {
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = `message ${role}`;
  const bubble = document.createElement('span');
  bubble.className = 'bubble';
  bubble.textContent = text;
  wrapper.appendChild(bubble);
  chatMessages.appendChild(wrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  saveChatHistory();
}

function getRecentContext() {
  const entries = readSavedReflections();
  return entries.slice(-3).map((entry) => entry.text).join(' ');
}

function generateAssistantReply(input) {
  const normalized = input.toLowerCase();
  const mood = localStorage.getItem(MOOD_KEY) || 'Calm';
  const context = getRecentContext();

  if (context && /(tired|anxious|stress|focus|grateful|happy|work)/i.test(context)) {
    const recentTheme = /(tired|anxious|stress|focus|grateful|happy|work)/i.exec(context)?.[0] || 'your reflections';
    return `Based on your recent reflections, ${recentTheme} seems to be a recurring theme. That means you are noticing real patterns, not random fluctuations. Try one small action today that honors that pattern: protect your energy, simplify your next task, or make space for gratitude.`;
  }

  if (/gratitude|thankful|grateful|good|happy|joy|love/.test(normalized)) {
    return `You seem to be noticing what is going well. That is a strong sign of emotional balance. Try naming one thing you can carry into tomorrow and let it anchor your mood: ${mood}.`;
  }

  if (/tired|exhausted|burned|drained|sleep/.test(normalized)) {
    return `Your energy sounds low, and that deserves care rather than judgment. Consider reducing one task, resting for a few minutes, and protecting your next quiet block of time.`;
  }

  if (/anxious|stress|worried|nervous|overwhelmed/.test(normalized)) {
    return `Anxiety often feels loudest when the mind is trying to do too much at once. Breathe for 60 seconds, focus on one next step, and remind yourself that you do not need to solve everything today.`;
  }

  if (/work|focus|productive|goal|plan/.test(normalized)) {
    return `A clear goal can calm the mind. Pick the single highest-value task, set a 25-minute timer, and decide what success looks like before noon.`;
  }

  if (/sad|lonely|empty|lost|confused/.test(normalized)) {
    return `It makes sense to feel this way sometimes. Try writing down what you feel, what you need, and which part of the day feels the heaviest. Gentle honesty often brings clarity.`;
  }

  if (/mood|feel|emotion|how am i/.test(normalized)) {
    return `Right now your current reflection mood is ${mood}. That is a useful anchor. Notice what is helping you feel this way, and what one change would make the next hour lighter.`;
  }

  return `I hear you. The most helpful next step is to pause, name the emotion, and choose one gentle action that supports your wellbeing. You are not behind—you are learning what restores you.`;
}

function handleChatSubmit(event) {
  event.preventDefault();

  const userMessage = chatInput.value.trim();
  if (!userMessage) {
    return;
  }

  addMessage('user', userMessage);
  chatInput.value = '';

  const reply = generateAssistantReply(userMessage);
  setTimeout(() => addMessage('bot', reply), 200);
}

saveReflectionButton.addEventListener('click', saveReflection);

promptTags.forEach((tag) => {
  tag.addEventListener('click', () => {
    reflectionInput.value = tag.dataset.prompt || tag.textContent.trim();
    reflectionInput.focus();
  });
});

moodButtons.forEach((button) => {
  button.addEventListener('click', () => setActiveMood(button));
});

chatForm.addEventListener('submit', handleChatSubmit);

const storedMood = localStorage.getItem(MOOD_KEY);
if (storedMood) {
  const matchingButton = [...moodButtons].find((button) => button.dataset.mood === storedMood);
  if (matchingButton) {
    setActiveMood(matchingButton);
  }
}

const savedChat = localStorage.getItem(CHAT_KEY);
if (savedChat) {
  try {
    const parsedChat = JSON.parse(savedChat);
    if (Array.isArray(parsedChat)) {
      parsedChat.forEach((message) => addMessage(message.role, message.text));
    }
  } catch (error) {
    // ignore parse errors
  }
}

if (!chatMessages?.children.length) {
  addMessage('bot', 'Hi, I’m your reflection guide. Tell me what’s on your mind today.');
}

renderJournal();
