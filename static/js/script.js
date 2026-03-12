// ── Scroll reveal ──────────────────────────────────────────────
// Add js-loaded so CSS hides .reveal elements only when JS is running
document.body.classList.add('js-loaded');

const reveals = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
reveals.forEach(el => io.observe(el));

// ── Tab switching ───────────────────────────────────────────────
const tabs = document.querySelectorAll('.tab-btn');
const screens = document.querySelectorAll('.app-screen');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    screens.forEach(s => s.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.screen).classList.add('active');
    if (tab.dataset.screen === 'screen-ai') startTyping();
  });
});

// ── Job cards data ──────────────────────────────────────────────
const jobs = [
  { logo: 'S', grad: 'linear-gradient(135deg,#ff4d00,#ff8a00)', title: 'Software Engineer', company: 'Stripe', type: 'Full-time', location: 'Bengaluru', salary: '₹18L – ₹26L / yr', match: 94, matchOffset: 7, tags: [{l:'React',m:true},{l:'Node.js',m:true},{l:'GraphQL',m:false},{l:'REST APIs',m:false}], desc: 'Build and scale payment infrastructure used by millions of businesses worldwide.' },
  { logo: 'G', grad: 'linear-gradient(135deg,#ea4335,#fbbc05)', title: 'UX Designer', company: 'Google', type: 'Remote', location: 'Remote', salary: '₹22L – ₹32L / yr', match: 88, matchOffset: 21, tags: [{l:'Figma',m:true},{l:'Prototyping',m:true},{l:'Motion',m:false},{l:'Research',m:false}], desc: 'Design next-generation user experiences for Google Workspace products.' },
  { logo: 'R', grad: 'linear-gradient(135deg,#0f6fff,#34d399)', title: 'Backend Engineer', company: 'Razorpay', type: 'Hybrid', location: 'Bengaluru', salary: '₹14L – ₹20L / yr', match: 81, matchOffset: 34, tags: [{l:'Python',m:true},{l:'Django',m:true},{l:'Redis',m:false},{l:'Kafka',m:false}], desc: "Build APIs powering India's largest payment gateway." },
  { logo: 'N', grad: 'linear-gradient(135deg,#7c3aed,#a855f7)', title: 'Product Manager', company: 'Notion', type: 'Remote', location: 'Remote', salary: '₹20L – ₹28L / yr', match: 76, matchOffset: 53, tags: [{l:'Roadmapping',m:true},{l:'Jira',m:true},{l:'SQL',m:false},{l:'Analytics',m:false}], desc: "Drive product strategy for Notion's collaboration tools." },
  { logo: 'Z', grad: 'linear-gradient(135deg,#f59e0b,#ef4444)', title: 'ML Engineer', company: 'Zepto', type: 'On-site', location: 'Mumbai', salary: '₹16L – ₹24L / yr', match: 72, matchOffset: 63, tags: [{l:'Python',m:true},{l:'TensorFlow',m:false},{l:'PyTorch',m:false},{l:'MLOps',m:false}], desc: 'Build recommendation and demand forecasting models at scale.' },
];

let currentIdx = 0;
let isDragging = false, startX = 0, startY = 0, currentX = 0;
const topCard = document.getElementById('topCard');
const cardStack = document.getElementById('cardStack');
let isAnimating = false;

function buildCard(job) {
  const circumference = 2 * Math.PI * 18; // r=18
  const offset = circumference - (job.match / 100) * circumference;
  return `
    <div class="sc-top-header">
      <div class="sc-logo sc-logo-lg" style="background:${job.grad}">${job.logo}</div>
      <div class="sc-match-ring">
        <svg viewBox="0 0 44 44" width="44" height="44">
          <circle cx="22" cy="22" r="18" fill="none" stroke="#222" stroke-width="3"/>
          <circle cx="22" cy="22" r="18" fill="none" stroke="#ff4d00" stroke-width="3"
            stroke-dasharray="${circumference.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"
            stroke-linecap="round" transform="rotate(-90 22 22)"/>
        </svg>
        <span class="sc-match-pct">${job.match}%</span>
      </div>
    </div>
    <div class="sc-title-lg">${job.title}</div>
    <div class="sc-company-row">
      <span class="sc-company-name">${job.company}</span>
      <span class="sc-dot">·</span>
      <span class="sc-type-badge">${job.type}</span>
      <span class="sc-dot">·</span>
      <span class="sc-location">📍 ${job.location}</span>
    </div>
    <div class="sc-salary">${job.salary}</div>
    <div class="sc-tags">${job.tags.map(t=>`<span class="sc-tag ${t.m?'sc-tag-match':'sc-tag-miss'}">${t.l}</span>`).join('')}</div>
    <div class="sc-desc">${job.desc}</div>
    <div class="swipe-overlay apply-overlay" id="applyOverlay">✓ APPLY</div>
    <div class="swipe-overlay skip-overlay" id="skipOverlay">✕ SKIP</div>
  `;
}

function swipeCard(direction) {
  if (isAnimating) return;
  isAnimating = true;
  const card = document.getElementById('topCard');
  const flyX = direction === 'apply' ? 400 : direction === 'skip' ? -400 : 0;
  const flyR = direction === 'apply' ? 25 : direction === 'skip' ? -25 : 0;

  // Show overlay flash
  if (direction === 'apply') card.querySelector('#applyOverlay').style.opacity = '1';
  if (direction === 'skip') card.querySelector('#skipOverlay').style.opacity = '1';

  card.style.transition = 'transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.45s';
  card.style.transform = `translateX(${flyX}px) rotate(${flyR}deg)`;
  card.style.opacity = '0';

  // Activity feed ping
  const actions = { apply: ['✓ Applied → ' + jobs[currentIdx].company + ' ' + jobs[currentIdx].title, 'hf-act-apply'], skip: ['✕ Skipped → ' + jobs[currentIdx].company, 'hf-act-skip'], save: ['🔖 Saved → ' + jobs[currentIdx].company + ' ' + jobs[currentIdx].title, 'hf-act-save'] };
  if (actions[direction]) addActivity(...actions[direction]);

  setTimeout(() => {
    currentIdx = (currentIdx + 1) % jobs.length;
    card.style.transition = 'none';
    card.style.transform = 'translateX(0) rotate(0deg) scale(1)';
    card.style.opacity = '1';
    card.innerHTML = buildCard(jobs[currentIdx]);
    isAnimating = false;
  }, 460);
}

// Button controls
document.getElementById('btnApply').addEventListener('click', () => swipeCard('apply'));
document.getElementById('btnSkip').addEventListener('click', () => swipeCard('skip'));
document.getElementById('btnSave').addEventListener('click', () => swipeCard('save'));

// Drag / swipe on card
topCard.addEventListener('mousedown', dragStart);
topCard.addEventListener('touchstart', e => dragStart(e.touches[0]), {passive:true});
document.addEventListener('mousemove', dragMove);
document.addEventListener('touchmove', e => dragMove(e.touches[0]), {passive:true});
document.addEventListener('mouseup', dragEnd);
document.addEventListener('touchend', dragEnd);

function dragStart(e) {
  if (isAnimating) return;
  isDragging = true;
  startX = e.clientX; startY = e.clientY; currentX = 0;
  topCard.style.transition = 'none';
}
function dragMove(e) {
  if (!isDragging) return;
  currentX = e.clientX - startX;
  const rotate = currentX / 18;
  topCard.style.transform = `translateX(${currentX}px) rotate(${rotate}deg)`;
  const card = document.getElementById('topCard');
  const applyOv = card.querySelector('#applyOverlay');
  const skipOv = card.querySelector('#skipOverlay');
  if (applyOv && skipOv) {
    applyOv.style.opacity = currentX > 40 ? Math.min((currentX - 40) / 60, 1) : 0;
    skipOv.style.opacity = currentX < -40 ? Math.min((-currentX - 40) / 60, 1) : 0;
  }
}
function dragEnd() {
  if (!isDragging) return;
  isDragging = false;
  if (currentX > 80) swipeCard('apply');
  else if (currentX < -80) swipeCard('skip');
  else {
    topCard.style.transition = 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)';
    topCard.style.transform = 'translateX(0) rotate(0deg)';
    const card = document.getElementById('topCard');
    const applyOv = card.querySelector('#applyOverlay');
    const skipOv = card.querySelector('#skipOverlay');
    if (applyOv) applyOv.style.opacity = 0;
    if (skipOv) skipOv.style.opacity = 0;
  }
}

// ── Activity feed ──────────────────────────────────────────────
function addActivity(text, cls) {
  const feed = document.getElementById('activityFeed');
  if (!feed) return;
  const item = document.createElement('div');
  item.className = 'hf-activity-item ' + cls;
  item.textContent = text;
  item.style.opacity = '0'; item.style.transform = 'translateY(-8px)';
  feed.insertBefore(item, feed.firstChild);
  requestAnimationFrame(() => {
    item.style.transition = 'all 0.3s ease';
    item.style.opacity = '1'; item.style.transform = 'translateY(0)';
  });
  while (feed.children.length > 4) feed.removeChild(feed.lastChild);
}

// Auto-cycle activity feed
const autoActivities = [
  ['⚡ 97% match — Figma Designer @ Canva', 'hf-act-match'],
  ['🔔 5 new jobs in Full Stack', 'hf-act-alert'],
  ['✓ Applied → Google UX Designer', 'hf-act-apply'],
  ['🔖 Saved → Zepto ML Engineer', 'hf-act-save'],
  ['⚡ New: Backend Eng @ PhonePe', 'hf-act-match'],
];
let autoIdx = 0;
setInterval(() => {
  addActivity(...autoActivities[autoIdx % autoActivities.length]);
  autoIdx++;
}, 3200);

// ── AI typing animation ────────────────────────────────────────
const coverText = `Dear Hiring Team,\n\nAs a final-year CS student with hands-on React & Node.js experience, I'm excited to apply for the Software Engineer role at Stripe.\n\nMy recent project — a real-time payment dashboard processing 10K+ daily transactions — aligns directly with Stripe's mission.\n\nI'd love to bring this to your team.`;

let typingInterval = null;
function startTyping() {
  const el = document.getElementById('typingText');
  if (!el) return;
  clearInterval(typingInterval);
  el.textContent = '';
  let i = 0;
  typingInterval = setInterval(() => {
    if (i >= coverText.length) { clearInterval(typingInterval); return; }
    el.textContent += coverText[i++];
    el.parentElement.scrollTop = el.parentElement.scrollHeight;
  }, 22);
}

// ── Phone 3D tilt ──────────────────────────────────────────────
const phoneFrame = document.getElementById('phoneFrame');
const heroSection = document.querySelector('.hero');
if (phoneFrame && heroSection) {
  heroSection.addEventListener('mousemove', (e) => {
    const rect = phoneFrame.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / 35;
    const dy = (e.clientY - cy) / 35;
    phoneFrame.style.transform = `perspective(900px) rotateY(${dx}deg) rotateX(${-dy}deg)`;
  });
  heroSection.addEventListener('mouseleave', () => {
    phoneFrame.style.transition = 'transform 0.5s ease';
    phoneFrame.style.transform = '';
    setTimeout(() => phoneFrame.style.transition = '', 500);
  });
}

// ── Waitlist form ──────────────────────────────────────────────
const waitlistBtn = document.getElementById('waitlistBtn');
const waitlistEmail = document.getElementById('waitlistEmail');
const waitlistMsg = document.getElementById('waitlistMsg');

if (waitlistBtn) {
  waitlistBtn.addEventListener('click', async () => {
    const email = waitlistEmail.value.trim();
    if (!email || !email.includes('@')) {
      waitlistMsg.style.display = 'block';
      waitlistMsg.style.color = '#ef4444';
      waitlistMsg.textContent = 'Please enter a valid email address.';
      return;
    }

    waitlistBtn.textContent = 'Sending...';
    waitlistBtn.disabled = true;

    try {
      const res = await fetch('/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      waitlistMsg.style.display = 'block';
      if (data.success) {
        waitlistMsg.style.color = '#50dc78';
        waitlistMsg.textContent = "🎉 You're on the list! We'll reach out when LYNK launches.";
        waitlistEmail.value = '';
      } else {
        waitlistMsg.style.color = '#ef4444';
        waitlistMsg.textContent = data.message || 'Something went wrong. Please try again.';
      }
    } catch (err) {
      waitlistMsg.style.display = 'block';
      waitlistMsg.style.color = '#ef4444';
      waitlistMsg.textContent = 'Network error. Please try again.';
    } finally {
      waitlistBtn.textContent = 'Get Early Access';
      waitlistBtn.disabled = false;
    }
  });
}
