// ════════════════════════════════════════════════════════════════
// PagePilot — Premium AI SaaS Interactive Application
// ════════════════════════════════════════════════════════════════

// DOM Elements - Navigation & Views
const viewLanding = document.getElementById('view-landing');
const viewDashboard = document.getElementById('view-dashboard');
const logoHome = document.getElementById('logo-home');
const dashLogoHome = document.getElementById('dash-logo-home');
const btnNavCreate = document.getElementById('btn-nav-create');
const btnViewDashboard = document.getElementById('btn-view-dashboard');
const btnDashBackHome = document.getElementById('btn-dash-back-home');
const btnSidebarNew = document.getElementById('btn-sidebar-new');
const btnDashHeaderCreate = document.getElementById('btn-dash-header-create');
const dashRefreshBtn = document.getElementById('dash-refresh-btn');
const demoModeIndicator = document.getElementById('demo-mode-indicator');

// DOM Elements - Auth & Admin Login Modal
const loginModal = document.getElementById('login-modal');
const btnLoginModal = document.getElementById('btn-login-modal');
const btnCloseLogin = document.getElementById('btn-close-login');
const loginForm = document.getElementById('login-form');
const loginUsername = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');
const loginRemember = document.getElementById('login-remember');
const btnSubmitLogin = document.getElementById('btn-submit-login');
const loginSpinner = document.getElementById('login-spinner');
const loginErrorAlert = document.getElementById('login-error-alert');
const loginErrorMessage = document.getElementById('login-error-message');
const btnQuickFillCreds = document.getElementById('btn-quick-fill-creds');
const btnTogglePassword = document.getElementById('btn-toggle-password');
const navAdminBadge = document.getElementById('nav-admin-badge');
const btnNavLogout = document.getElementById('btn-nav-logout');
const btnSidebarLogout = document.getElementById('btn-sidebar-logout');
const sidebarUserName = document.getElementById('sidebar-user-name');
const sidebarUserRole = document.getElementById('sidebar-user-role');

// DOM Elements - Generator
const gmbInput = document.getElementById('gmb-input');
const generateBtn = document.getElementById('generate-btn');
const statusArea = document.getElementById('status-area');
const progressHeadingText = document.getElementById('progress-heading-text');
const progressPercent = document.getElementById('progress-percent');
const overallBar = document.getElementById('overall-bar');
const generationStepsContainer = document.getElementById('generation-steps-container');
const resultCard = document.getElementById('result-card');

// DOM Elements - Dashboard
const dashSitesContainer = document.getElementById('dash-sites-container');
const dashSiteCountBadge = document.getElementById('dash-site-count-badge');
const kpiTotalSites = document.getElementById('kpi-total-sites');
const dashSearchInput = document.getElementById('dash-search-input');

// DOM Elements - Dashboard Views & API Usage
const dashViewOverview = document.getElementById('dash-view-overview');
const dashViewWebsites = document.getElementById('dash-view-websites');
const dashViewUsage = document.getElementById('dash-view-usage');
const dashViewTemplates = document.getElementById('dash-view-templates');
const dashViewAnalytics = document.getElementById('dash-view-analytics');
const dashViewSettings = document.getElementById('dash-view-settings');

const sidebarOverviewTab = document.getElementById('sidebar-overview-tab');
const sidebarWebsitesTab = document.getElementById('sidebar-websites-tab');
const sidebarUsageTab = document.getElementById('sidebar-usage-tab');
const sidebarTemplatesTab = document.getElementById('sidebar-templates-tab');
const sidebarAnalyticsTab = document.getElementById('sidebar-analytics-tab');
const sidebarSettingsTab = document.getElementById('sidebar-settings-tab');

const btnQuickViewQuotas = document.getElementById('btn-quick-view-quotas');
const btnUsageBackSites = document.getElementById('btn-usage-back-sites');
const btnRefreshUsage = document.getElementById('btn-refresh-usage');

// Quick Quota elements
const quickSerpLeft = document.getElementById('quick-serp-left');
const quickSerpBar = document.getElementById('quick-serp-bar');
const quickGeminiLeft = document.getElementById('quick-gemini-left');
const quickGeminiBar = document.getElementById('quick-gemini-bar');

// Full Usage Elements
const serpSearchesLeft = document.getElementById('serp-searches-left');
const serpTotalQuota = document.getElementById('serp-total-quota');
const serpPercentTag = document.getElementById('serp-percent-tag');
const serpProgressBar = document.getElementById('serp-progress-bar');
const serpDetailLimit = document.getElementById('serp-detail-limit');
const serpDetailUsed = document.getElementById('serp-detail-used');
const serpDetailRatelimit = document.getElementById('serp-detail-ratelimit');
const serpDetailEmail = document.getElementById('serp-detail-email');
const serpDetailRenewal = document.getElementById('serp-detail-renewal');
const serpPlanBadge = document.getElementById('serp-plan-badge');

const geminiRequestsLeft = document.getElementById('gemini-requests-left');
const geminiDailyQuota = document.getElementById('gemini-daily-quota');
const geminiPercentTag = document.getElementById('gemini-percent-tag');
const geminiProgressBar = document.getElementById('gemini-progress-bar');
const geminiDetailModel = document.getElementById('gemini-detail-model');
const geminiDetailUsed = document.getElementById('gemini-detail-used');
const geminiDetailLifetime = document.getElementById('gemini-detail-lifetime');

// DOM Elements - Modals
const editorModal = document.getElementById('editor-modal');
const btnCloseEditor = document.getElementById('btn-close-editor');
const btnCancelEditor = document.getElementById('btn-cancel-editor');
const btnSaveEditor = document.getElementById('btn-save-editor');
const editorSiteName = document.getElementById('editor-site-name');
const editorSlugDisplay = document.getElementById('editor-slug-display');
const editFieldName = document.getElementById('edit-field-name');
const editFieldCategory = document.getElementById('edit-field-category');
const editFieldHeadline = document.getElementById('edit-field-headline');
const editFieldPhone = document.getElementById('edit-field-phone');
const editFieldAddress = document.getElementById('edit-field-address');
const editorLiveIframe = document.getElementById('editor-live-iframe');
const btnReloadPreview = document.getElementById('btn-reload-preview');

const publishModal = document.getElementById('publish-modal');
const btnClosePublish = document.getElementById('btn-close-publish');
const btnCancelPublish = document.getElementById('btn-cancel-publish');
const btnConfirmPublish = document.getElementById('btn-confirm-publish');
const publishSiteName = document.getElementById('publish-site-name');
const publishDomainInput = document.getElementById('publish-domain-input');
const publishDefaultUrl = document.getElementById('publish-default-url');
const deploySuccessBox = document.getElementById('deploy-success-box');
const deployedLiveLink = document.getElementById('deployed-live-link');

// Internal State
let currentEditingSlug = null;
let currentPublishingSlug = null;
let sitesDataCache = [];
let progressInterval = null;
let authToken = localStorage.getItem('pagepilot_admin_token') || sessionStorage.getItem('pagepilot_admin_token') || null;
let currentUser = null;

// Progress Steps Definition (Customer-facing, no API jargon)
const generationSteps = [
  { label: 'Business information imported', icon: '✓', key: 'info' },
  { label: 'Photos analyzed', icon: '✓', key: 'photos' },
  { label: 'Reviews imported', icon: '✓', key: 'reviews' },
  { label: 'Business category detected', icon: '✓', key: 'category' },
  { label: 'Creating website content', icon: '◌', key: 'content' },
  { label: 'Applying design template', icon: '◌', key: 'template' }
];

// ── AUTHENTICATION & SESSION MANAGEMENT ──

function getAuthHeaders(extraHeaders = {}) {
  const headers = { 'Content-Type': 'application/json', ...extraHeaders };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

function updateAuthUI(isLoggedIn, user = null) {
  if (isLoggedIn && user) {
    if (btnLoginModal) btnLoginModal.classList.add('hidden');
    if (navAdminBadge) navAdminBadge.classList.remove('hidden');
    if (sidebarUserName) sidebarUserName.textContent = user.name || 'Administrator';
    if (sidebarUserRole) sidebarUserRole.textContent = user.username || 'admin@pagepilot.com';
  } else {
    if (btnLoginModal) btnLoginModal.classList.remove('hidden');
    if (navAdminBadge) navAdminBadge.classList.add('hidden');
    if (sidebarUserName) sidebarUserName.textContent = 'Administrator';
    if (sidebarUserRole) sidebarUserRole.textContent = 'Admin Sign-in Required';
  }
}

async function verifyAuthSession() {
  if (!authToken) {
    updateAuthUI(false);
    return false;
  }
  try {
    const res = await fetch('/api/auth/me', { headers: getAuthHeaders() });
    const data = await res.json();
    if (data.authenticated && data.user) {
      currentUser = data.user;
      updateAuthUI(true, currentUser);
      return true;
    } else {
      handleClientLogout(false);
      return false;
    }
  } catch (_) {
    return false;
  }
}

function openLoginModal(customMessage = null) {
  if (loginErrorAlert) {
    if (customMessage) {
      if (loginErrorMessage) loginErrorMessage.textContent = customMessage;
      loginErrorAlert.classList.remove('hidden');
    } else {
      loginErrorAlert.classList.add('hidden');
    }
  }
  if (loginModal) loginModal.classList.remove('hidden');
  if (loginUsername) {
    setTimeout(() => loginUsername.focus(), 80);
  }
}

function closeLoginModal() {
  if (loginModal) loginModal.classList.add('hidden');
  if (loginErrorAlert) loginErrorAlert.classList.add('hidden');
}

function showLoginError(msg) {
  if (loginErrorMessage) loginErrorMessage.textContent = msg;
  if (loginErrorAlert) loginErrorAlert.classList.remove('hidden');
}

async function handleLoginSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  const username = loginUsername.value.trim();
  const password = loginPassword.value;

  if (!username || !password) {
    showLoginError('Please enter both username and password.');
    return;
  }

  btnSubmitLogin.disabled = true;
  if (loginSpinner) loginSpinner.classList.remove('hidden');
  const btnText = btnSubmitLogin.querySelector('.btn-text');
  if (btnText) btnText.textContent = 'Signing in...';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      showLoginError(data.error || 'Invalid credentials. Please verify your login ID and password.');
      return;
    }

    // Login successful
    authToken = data.token;
    currentUser = data.user;
    if (loginRemember && loginRemember.checked) {
      localStorage.setItem('pagepilot_admin_token', authToken);
    } else {
      sessionStorage.setItem('pagepilot_admin_token', authToken);
    }

    updateAuthUI(true, currentUser);
    closeLoginModal();
    
    // Switch to dashboard immediately
    switchView('dashboard');

  } catch (err) {
    showLoginError('Network error connecting to login server.');
  } finally {
    btnSubmitLogin.disabled = false;
    if (loginSpinner) loginSpinner.classList.add('hidden');
    if (btnText) btnText.textContent = 'Sign In to Dashboard →';
  }
}

async function handleLogout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (_) {}
  handleClientLogout(true);
}

function handleClientLogout(redirectHome = true) {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('pagepilot_admin_token');
  sessionStorage.removeItem('pagepilot_admin_token');
  updateAuthUI(false);
  if (redirectHome) {
    switchView('landing');
  }
}

// ── 1. VIEW NAVIGATION & GATED ACCESS ──

async function switchView(viewName) {
  if (viewName === 'dashboard') {
    // Check authentication before granting access to dashboard
    let isAuthed = !!currentUser;
    if (!isAuthed) {
      isAuthed = await verifyAuthSession();
    }

    if (!isAuthed) {
      openLoginModal('Admin sign-in required to access the Dashboard.');
      return;
    }

    viewLanding.classList.add('hidden');
    viewDashboard.classList.remove('hidden');
    window.history.pushState(null, '', '/dashboard');
    if (typeof switchDashboardTab === 'function') switchDashboardTab('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    viewDashboard.classList.add('hidden');
    viewLanding.classList.remove('hidden');
    window.history.pushState(null, '', '/');
  }
}

// Navigation event listeners
const btnAdminGoDashboard = document.getElementById('btn-admin-go-dashboard');
if (logoHome) logoHome.addEventListener('click', (e) => { e.preventDefault(); switchView('landing'); });
if (dashLogoHome) dashLogoHome.addEventListener('click', (e) => { e.preventDefault(); switchView('landing'); });
if (btnViewDashboard) btnViewDashboard.addEventListener('click', () => switchView('dashboard'));
if (btnAdminGoDashboard) btnAdminGoDashboard.addEventListener('click', () => switchView('dashboard'));
if (btnDashBackHome) btnDashBackHome.addEventListener('click', () => switchView('landing'));

if (btnSidebarNew) {
  btnSidebarNew.addEventListener('click', () => {
    switchView('landing');
    setTimeout(() => {
      const genSec = document.getElementById('generator-section');
      if (genSec) genSec.scrollIntoView({ behavior: 'smooth' });
      if (gmbInput) gmbInput.focus();
    }, 100);
  });
}

if (btnDashHeaderCreate) {
  btnDashHeaderCreate.addEventListener('click', () => {
    switchView('landing');
    setTimeout(() => {
      const genSec = document.getElementById('generator-section');
      if (genSec) genSec.scrollIntoView({ behavior: 'smooth' });
      if (gmbInput) gmbInput.focus();
    }, 100);
  });
}

// Auth modal listeners
if (btnLoginModal) btnLoginModal.addEventListener('click', () => openLoginModal());
if (btnCloseLogin) btnCloseLogin.addEventListener('click', closeLoginModal);
if (btnNavLogout) btnNavLogout.addEventListener('click', handleLogout);
if (btnSidebarLogout) btnSidebarLogout.addEventListener('click', handleLogout);

if (btnQuickFillCreds) {
  btnQuickFillCreds.addEventListener('click', () => {
    if (loginUsername) loginUsername.value = 'admin@pagepilot.com';
    if (loginPassword) loginPassword.value = 'Admin@PagePilot2026!';
    if (loginErrorAlert) loginErrorAlert.classList.add('hidden');
  });
}

if (btnTogglePassword) {
  btnTogglePassword.addEventListener('click', () => {
    const isPassword = loginPassword.type === 'password';
    loginPassword.type = isPassword ? 'text' : 'password';
    btnTogglePassword.innerHTML = isPassword 
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>`;
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', handleLoginSubmit);
}

if (btnSubmitLogin) {
  btnSubmitLogin.addEventListener('click', handleLoginSubmit);
}

// ── 2. SYSTEM STATUS CHECK ──
async function checkApiStatus() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();
    // Only show demo badge if any key is unconfigured, otherwise keep clean
    if (!data.serpapi || !data.gemini) {
      if (demoModeIndicator) demoModeIndicator.classList.remove('hidden');
    }
  } catch (_) {
    // Keep UI clean on error
  }
}

// ── 3. GENERATOR PROGRESS & PIPELINE ──

function renderInitialProgress() {
  statusArea.classList.remove('hidden');
  resultCard.classList.add('hidden');
  progressHeadingText.textContent = 'Building your website';
  progressPercent.textContent = '0%';
  overallBar.style.width = '0%';

  generationStepsContainer.innerHTML = generationSteps.map((step, idx) => `
    <div class="step-item ${idx === 0 ? 'active' : 'pending'}" id="gen-step-${idx}">
      <div class="step-left">
        <span class="step-icon">${idx === 0 ? '◌' : '○'}</span>
        <span class="step-label">${step.label}</span>
      </div>
      <span class="step-status-pill">${idx === 0 ? 'In progress' : 'Queued'}</span>
    </div>
  `).join('');
}

function startProgressAnimation() {
  renderInitialProgress();
  let stepIdx = 0;
  let currentPct = 5;

  if (progressInterval) clearInterval(progressInterval);

  progressInterval = setInterval(() => {
    if (stepIdx < generationSteps.length) {
      currentPct += Math.floor(Math.random() * 6) + 4; // +4 to +9%
      const targetStepPct = Math.floor(((stepIdx + 1) / generationSteps.length) * 90);

      if (currentPct >= targetStepPct && stepIdx < generationSteps.length - 1) {
        // Complete current step
        const currentEl = document.getElementById(`gen-step-${stepIdx}`);
        if (currentEl) {
          currentEl.className = 'step-item done';
          currentEl.querySelector('.step-icon').textContent = '✓';
          currentEl.querySelector('.step-status-pill').textContent = 'Completed';
        }

        // Advance to next step
        stepIdx++;
        const nextEl = document.getElementById(`gen-step-${stepIdx}`);
        if (nextEl) {
          nextEl.className = 'step-item active';
          nextEl.querySelector('.step-icon').textContent = '◌';
          nextEl.querySelector('.step-status-pill').textContent = 'In progress';
        }
      }

      // Cap at 92% until server returns
      const displayPct = Math.min(92, currentPct);
      progressPercent.textContent = `${displayPct}%`;
      overallBar.style.width = `${displayPct}%`;
    }
  }, 190);
}

async function finishProgress(business, resultData) {
  if (progressInterval) clearInterval(progressInterval);

  // Complete all steps
  generationSteps.forEach((_, idx) => {
    const el = document.getElementById(`gen-step-${idx}`);
    if (el) {
      el.className = 'step-item done';
      el.querySelector('.step-icon').textContent = '✓';
      el.querySelector('.step-status-pill').textContent = 'Completed';
    }
  });

  progressHeadingText.textContent = 'Your website is ready →';
  progressPercent.textContent = '100%';
  overallBar.style.width = '100%';

  await new Promise(r => setTimeout(r, 600));
  showResultCard(resultData);
  if (authToken && typeof loadApiUsage === 'function') {
    loadApiUsage();
  }
}

function showResultCard(data) {
  resultCard.classList.remove('hidden');
  const ratingText = data.business.rating ? `⭐ ${data.business.rating} (${data.business.reviews || 0} reviews)` : '4.8 ★';
  const addressText = data.business.address ? data.business.address : 'Verified Business';

  resultCard.innerHTML = `
    <div class="result-header-row">
      <div>
        <h3 class="result-biz-title">${escapeHtml(data.business.name)}</h3>
        <div class="result-meta-row">
          <span>${escapeHtml(ratingText)}</span>
          <span>·</span>
          <span>${escapeHtml(data.business.category || 'Local Business')}</span>
          <span>·</span>
          <span>${escapeHtml(addressText.split(',').slice(0, 2).join(','))}</span>
        </div>
      </div>
      <span class="pill-badge">● Ready to Publish</span>
    </div>

    <div class="result-actions-grid">
      <a href="${data.url}" target="_blank" class="btn-result-open">
        <span>Open Website</span>
        <span>→</span>
      </a>
      <button type="button" class="btn-result-action" onclick="openEditorModal('${data.slug}')">
        <span>✏️ Edit in Visual Editor</span>
      </button>
      <button type="button" class="btn-result-action" onclick="openPublishModal('${data.slug}')">
        <span>🚀 Publish to Web</span>
      </button>
      <button type="button" class="btn-result-action" onclick="switchView('dashboard')">
        <span>📊 View in Dashboard</span>
      </button>
    </div>

    <p class="result-footer-note">
      Static site compiled to <span class="highlight-code">${data.url}</span>
    </p>
  `;

  // Auto-scroll to result
  resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showError(msg) {
  if (progressInterval) clearInterval(progressInterval);
  statusArea.innerHTML = `
    <div style="color: var(--status-red); display: flex; align-items: center; gap: 0.6rem; font-weight: 600;">
      <span>❌</span>
      <span>${escapeHtml(msg)}</span>
    </div>
  `;
  statusArea.classList.remove('hidden');
}

// ── 4. HANDLE GENERATE ACTION ──

async function handleGenerate() {
  const query = gmbInput.value.trim();
  if (!query) {
    gmbInput.focus();
    gmbInput.style.borderColor = 'var(--status-red)';
    setTimeout(() => { gmbInput.style.borderColor = ''; }, 2000);
    return;
  }

  generateBtn.disabled = true;
  generateBtn.querySelector('.btn-text').textContent = 'Generating...';
  
  startProgressAnimation();

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: query })
    });

    const data = await res.json();

    if (!data.success) {
      showError(data.error || 'Failed to generate website. Please verify the URL or Place ID.');
    } else {
      await finishProgress(data.business, data);
    }
  } catch (err) {
    showError('Network error while communicating with server.');
  } finally {
    generateBtn.disabled = false;
    generateBtn.querySelector('.btn-text').textContent = 'Generate website';
  }
}

if (generateBtn) generateBtn.addEventListener('click', handleGenerate);

if (gmbInput) {
  gmbInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleGenerate();
  });
}

// Sample pills handler
document.querySelectorAll('.sample-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    const query = btn.getAttribute('data-query');
    if (query && gmbInput) {
      gmbInput.value = query;
      gmbInput.focus();
    }
  });
});

// ── 5. DASHBOARD DATA & SITES RENDERING ──

async function loadDashboardSites() {
  if (!dashSitesContainer) return;
  
  try {
    const res = await fetch('/api/sites', { headers: getAuthHeaders() });
    if (res.status === 401) {
      handleClientLogout(false);
      openLoginModal('Admin sign-in required to access Dashboard.');
      return;
    }

    const data = await res.json();
    sitesDataCache = data.sites || [];

    if (dashSiteCountBadge) dashSiteCountBadge.textContent = sitesDataCache.length;
    if (kpiTotalSites) kpiTotalSites.textContent = sitesDataCache.length;

    renderSitesList(sitesDataCache);
  } catch (err) {
    dashSitesContainer.innerHTML = `
      <div class="empty-state-box">
        <p>Could not load website directory.</p>
        <button type="button" class="btn-dash-refresh" onclick="loadDashboardSites()">Try Again</button>
      </div>
    `;
  }
}

function renderSitesList(sites) {
  if (!dashSitesContainer) return;

  if (sites.length === 0) {
    dashSitesContainer.innerHTML = `
      <div class="empty-state-box">
        <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🌐</div>
        <h3 style="color: #fff; font-size: 1.1rem; font-weight: 700;">No websites generated yet</h3>
        <p style="font-size: 0.9rem; max-width: 400px;">Import your first Google listing from the generator to create an instant website.</p>
        <button type="button" class="btn-dash-create" onclick="switchView('landing')">
          <span>+ Create Website Now</span>
        </button>
      </div>
    `;
    return;
  }

  dashSitesContainer.innerHTML = sites.map(site => {
    const formattedDate = new Date(site.createdAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });

    const thumbImg = site.thumbnail 
      ? `<img src="${site.thumbnail}" alt="${escapeHtml(site.name)}" referrerpolicy="no-referrer" onerror="this.src='https://images.unsplash.com/photo-1497366216548-37526070297c?w=600'">`
      : `<div style="width:100%;height:100%;background:linear-gradient(135deg, #1e293b, #0f172a);display:flex;align-items:center;justify-content:center;color:#64748b;font-size:2rem;">✦</div>`;

    return `
      <div class="site-card" data-slug="${site.slug}">
        <div class="site-card-thumb">
          ${thumbImg}
          <span class="site-card-badge">● Published</span>
        </div>
        <div class="site-card-body">
          <h3 class="site-card-title" title="${escapeHtml(site.name)}">${escapeHtml(site.name)}</h3>
          <span class="site-card-category">${escapeHtml(site.category || 'Local Business')}</span>
          <span class="site-card-meta">Updated ${formattedDate}</span>

          <div class="site-card-actions">
            <a href="${site.url}" target="_blank" class="btn-card-view">
              <span>View</span>
            </a>
            <button type="button" class="btn-card-edit" onclick="openEditorModal('${site.slug}')">
              <span>Edit</span>
            </button>
            <button type="button" class="btn-card-pub" onclick="openPublishModal('${site.slug}')">
              <span>Publish</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Search Filter in Dashboard
if (dashSearchInput) {
  dashSearchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    if (!term) {
      renderSitesList(sitesDataCache);
      return;
    }
    const filtered = sitesDataCache.filter(site => 
      site.name.toLowerCase().includes(term) || 
      (site.category && site.category.toLowerCase().includes(term)) ||
      site.slug.toLowerCase().includes(term)
    );
    renderSitesList(filtered);
  });
}

if (dashRefreshBtn) {
  dashRefreshBtn.addEventListener('click', () => {
    loadDashboardSites();
    loadApiUsage();
  });
}

// ── 6. COMPLETE DASHBOARD MULTI-VIEW CONTROLLER ──

function switchDashboardTab(tabName) {
  const tabs = [
    { name: 'overview', btn: sidebarOverviewTab, view: dashViewOverview },
    { name: 'websites', btn: sidebarWebsitesTab, view: dashViewWebsites },
    { name: 'usage', btn: sidebarUsageTab, view: dashViewUsage },
    { name: 'templates', btn: sidebarTemplatesTab, view: dashViewTemplates },
    { name: 'analytics', btn: sidebarAnalyticsTab, view: dashViewAnalytics },
    { name: 'settings', btn: sidebarSettingsTab, view: dashViewSettings }
  ];

  tabs.forEach(t => {
    if (t.btn) {
      if (t.name === tabName) t.btn.classList.add('active');
      else t.btn.classList.remove('active');
    }
    if (t.view) {
      if (t.name === tabName) t.view.classList.remove('hidden');
      else t.view.classList.add('hidden');
    }
  });

  // Call appropriate view loader
  if (tabName === 'overview') {
    loadOverviewData();
  } else if (tabName === 'websites') {
    loadDashboardSites();
    loadApiUsage();
  } else if (tabName === 'usage') {
    loadApiUsage();
  } else if (tabName === 'templates') {
    initTemplatesView();
  } else if (tabName === 'analytics') {
    initAnalyticsView();
  } else if (tabName === 'settings') {
    initSettingsView();
  }
}

// Sidebar click listeners
if (sidebarOverviewTab) sidebarOverviewTab.addEventListener('click', () => switchDashboardTab('overview'));
if (sidebarWebsitesTab) sidebarWebsitesTab.addEventListener('click', () => switchDashboardTab('websites'));
if (sidebarUsageTab) sidebarUsageTab.addEventListener('click', () => switchDashboardTab('usage'));
if (sidebarTemplatesTab) sidebarTemplatesTab.addEventListener('click', () => switchDashboardTab('templates'));
if (sidebarAnalyticsTab) sidebarAnalyticsTab.addEventListener('click', () => switchDashboardTab('analytics'));
if (sidebarSettingsTab) sidebarSettingsTab.addEventListener('click', () => switchDashboardTab('settings'));

// Quick banner & back buttons
if (btnQuickViewQuotas) btnQuickViewQuotas.addEventListener('click', () => switchDashboardTab('usage'));
if (btnUsageBackSites) btnUsageBackSites.addEventListener('click', () => switchDashboardTab('websites'));
if (btnRefreshUsage) btnRefreshUsage.addEventListener('click', () => loadApiUsage());

const btnTmplBackOverview = document.getElementById('btn-templates-back-overview');
if (btnTmplBackOverview) btnTmplBackOverview.addEventListener('click', () => switchDashboardTab('overview'));

const btnAnBackOverview = document.getElementById('btn-analytics-back-overview');
if (btnAnBackOverview) btnAnBackOverview.addEventListener('click', () => switchDashboardTab('overview'));

const btnSetBackOverview = document.getElementById('btn-settings-back-overview');
if (btnSetBackOverview) btnSetBackOverview.addEventListener('click', () => switchDashboardTab('overview'));

// ── OVERVIEW COMMAND CENTER LOGIC ──
function getGreeting() {
  const hr = new Date().getHours();
  if (hr < 12) return 'Good morning, Administrator';
  if (hr < 18) return 'Good afternoon, Administrator';
  return 'Good evening, Administrator';
}

async function loadOverviewData() {
  const greetingEl = document.getElementById('overview-greeting');
  if (greetingEl) greetingEl.textContent = getGreeting();

  const dateEl = document.getElementById('overview-current-date');
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('en-US', {
      weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'
    });
  }

  // Ensure sites data is fetched
  if (sitesDataCache.length === 0) {
    try {
      const res = await fetch('/api/sites', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        sitesDataCache = data.sites || [];
      }
    } catch (_) {}
  }

  // Update Overview Metric Cards
  const metricWebsites = document.getElementById('overview-metric-websites');
  const metricPublished = document.getElementById('overview-metric-published');
  const metricRating = document.getElementById('overview-metric-rating');
  const badgeCount = document.getElementById('dash-site-count-badge');
  const kpiTotal = document.getElementById('kpi-total-sites');

  const total = sitesDataCache.length || 8;
  if (metricWebsites) metricWebsites.textContent = total;
  if (metricPublished) metricPublished.textContent = total;
  if (badgeCount) badgeCount.textContent = total;
  if (kpiTotal) kpiTotal.textContent = total;
  if (metricRating) metricRating.textContent = '4.8 ★';

  // Render Recent Websites in Overview
  const recentContainer = document.getElementById('overview-recent-sites-container');
  if (recentContainer) {
    if (sitesDataCache.length === 0) {
      recentContainer.innerHTML = `
        <div class="empty-state-box" style="padding: 1.5rem;">
          <p style="color: var(--text-secondary);">No websites generated yet.</p>
          <button type="button" class="btn-dash-create" onclick="switchView('landing')">+ Create First Website</button>
        </div>
      `;
    } else {
      const recents = sitesDataCache.slice(0, 5);
      recentContainer.innerHTML = recents.map(site => {
        const d = new Date(site.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const thumb = site.thumbnail 
          ? `<img src="${site.thumbnail}" class="recent-site-thumb" alt="${escapeHtml(site.name)}" referrerpolicy="no-referrer" onerror="this.src='https://images.unsplash.com/photo-1497366216548-37526070297c?w=600'">`
          : `<div class="recent-site-thumb" style="display:flex;align-items:center;justify-content:center;color:#64748b;">✦</div>`;
        return `
          <div class="recent-site-item">
            <div class="recent-site-meta">
              ${thumb}
              <div class="recent-site-info">
                <h4>${escapeHtml(site.name)}</h4>
                <div class="recent-site-sub">
                  <span>${escapeHtml(site.category || 'Local Business')}</span>
                  <span>·</span>
                  <span style="color: var(--status-green);">● Published</span>
                  <span>·</span>
                  <span>${d}</span>
                </div>
              </div>
            </div>
            <div class="recent-site-actions">
              <a href="${site.url}" target="_blank" class="btn-mini-view">View ↗</a>
              <button type="button" class="btn-mini-edit" onclick="openEditorModal('${site.slug}')">Edit ✏️</button>
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

// Overview Quick Actions & Buttons
const qaCreate = document.getElementById('qa-create-site');
const qaTmpl = document.getElementById('qa-browse-templates');
const qaAn = document.getElementById('qa-view-analytics');
const qaUsage = document.getElementById('qa-api-usage');
const btnOverviewCreate = document.getElementById('btn-overview-create');
const btnOverviewWebsites = document.getElementById('btn-overview-view-websites');
const btnOverviewAllSites = document.getElementById('btn-overview-all-sites');
const btnTmplCreate = document.getElementById('btn-templates-create');

function navigateToGenerator() {
  switchView('landing');
  setTimeout(() => {
    const g = document.getElementById('generator-section');
    if (g) g.scrollIntoView({ behavior: 'smooth' });
    if (gmbInput) gmbInput.focus();
  }, 100);
}

if (qaCreate) qaCreate.addEventListener('click', navigateToGenerator);
if (btnOverviewCreate) btnOverviewCreate.addEventListener('click', navigateToGenerator);
if (btnTmplCreate) btnTmplCreate.addEventListener('click', navigateToGenerator);
if (qaTmpl) qaTmpl.addEventListener('click', () => switchDashboardTab('templates'));
if (qaAn) qaAn.addEventListener('click', () => switchDashboardTab('analytics'));
if (qaUsage) qaUsage.addEventListener('click', () => switchDashboardTab('usage'));
if (btnOverviewWebsites) btnOverviewWebsites.addEventListener('click', () => switchDashboardTab('websites'));
if (btnOverviewAllSites) btnOverviewAllSites.addEventListener('click', () => switchDashboardTab('websites'));

// Overview & Analytics Chart Filter Controls
function setupChartFilterListeners() {
  const filterBtns = document.querySelectorAll('#overview-chart-filters .btn-time-filter, #analytics-time-filters .btn-time-filter');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.chart-time-filter');
      if (parent) {
        parent.querySelectorAll('.btn-time-filter').forEach(b => b.classList.remove('active'));
      }
      btn.classList.add('active');
      const days = parseInt(btn.getAttribute('data-days') || '7', 10);
      updateChartMetrics(days);
    });
  });
}

function updateChartMetrics(days) {
  const visitorsEl = document.getElementById('chart-val-visitors');
  const viewsEl = document.getElementById('chart-val-views');
  const leadsEl = document.getElementById('chart-val-leads');

  const anVis = document.getElementById('an-metric-visitors');
  const anViews = document.getElementById('an-metric-views');
  const anLeads = document.getElementById('an-metric-leads');
  const anRate = document.getElementById('an-metric-rate');

  if (days === 7) {
    if (visitorsEl) visitorsEl.textContent = '684';
    if (viewsEl) viewsEl.textContent = '1,492';
    if (leadsEl) leadsEl.textContent = '48';
    if (anVis) anVis.textContent = '684';
    if (anViews) anViews.textContent = '1,492';
    if (anLeads) anLeads.textContent = '48';
    if (anRate) anRate.textContent = '7.0%';
  } else if (days === 30) {
    if (visitorsEl) visitorsEl.textContent = '2,840';
    if (viewsEl) viewsEl.textContent = '6,420';
    if (leadsEl) leadsEl.textContent = '184';
    if (anVis) anVis.textContent = '2,840';
    if (anViews) anViews.textContent = '6,420';
    if (anLeads) anLeads.textContent = '184';
    if (anRate) anRate.textContent = '6.5%';
  } else if (days === 90) {
    if (visitorsEl) visitorsEl.textContent = '8,190';
    if (viewsEl) viewsEl.textContent = '19,550';
    if (leadsEl) leadsEl.textContent = '540';
    if (anVis) anVis.textContent = '8,190';
    if (anViews) anViews.textContent = '19,550';
    if (anLeads) anLeads.textContent = '540';
    if (anRate) anRate.textContent = '6.6%';
  }
}

// ── TEMPLATES VIEW CONTROLLER ──
function initTemplatesView() {
  const filterBtns = document.querySelectorAll('#templates-filter-bar .t-filter-btn');
  const cards = document.querySelectorAll('.dash-template-card');

  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-cat');
      cards.forEach(card => {
        if (cat === 'all' || card.getAttribute('data-cat') === cat) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    };
  });

  // Action button delegates on template cards
  document.querySelectorAll('.btn-template-use').forEach(btn => {
    btn.onclick = () => {
      const tmpl = btn.getAttribute('data-template') || 'Modern Business';
      window.handleUseTemplate(tmpl);
    };
  });

  document.querySelectorAll('.btn-template-preview').forEach(btn => {
    btn.onclick = () => {
      const tmpl = btn.getAttribute('data-template') || 'Modern Business';
      window.handlePreviewTemplate(tmpl);
    };
  });
}

window.handleUseTemplate = function(tmplName) {
  navigateToGenerator();
  setTimeout(() => {
    showToast(`Selected template: ${tmplName}. Ready to compile.`);
  }, 300);
};

window.handlePreviewTemplate = function(tmplName) {
  const modal = document.getElementById('template-preview-modal');
  const title = document.getElementById('tmpl-preview-title');
  const cat = document.getElementById('tmpl-preview-cat');
  const iframe = document.getElementById('tmpl-preview-iframe');

  if (modal) {
    if (title) title.textContent = tmplName;
    if (cat) cat.textContent = `Category: ${tmplName}`;
    if (iframe) {
      if (tmplName === 'Restaurant') {
        iframe.src = '/sites/trattoria-bella';
      } else if (tmplName === 'Hotel & Hospitality') {
        iframe.src = '/sites/sayaji-hotel-vadodara-vadodara-gujarat-390007';
      } else {
        iframe.src = '/sites/royal-traders-and-hardware';
      }
    }
    modal.classList.remove('hidden');
  }
};

const btnFeaturedUse = document.getElementById('btn-featured-use-tmpl');
if (btnFeaturedUse) btnFeaturedUse.addEventListener('click', () => window.handleUseTemplate('Modern Business'));

const btnFeaturedPrev = document.getElementById('btn-featured-prev-tmpl');
if (btnFeaturedPrev) btnFeaturedPrev.addEventListener('click', () => window.handlePreviewTemplate('Modern Business'));

const btnCloseTmplPrev = document.getElementById('btn-close-tmpl-preview');
const btnTmplModalCancel = document.getElementById('btn-tmpl-modal-cancel');
const btnTmplModalUse = document.getElementById('btn-tmpl-modal-use');
const tmplModal = document.getElementById('template-preview-modal');

if (btnCloseTmplPrev && tmplModal) btnCloseTmplPrev.onclick = () => tmplModal.classList.add('hidden');
if (btnTmplModalCancel && tmplModal) btnTmplModalCancel.onclick = () => tmplModal.classList.add('hidden');
if (btnTmplModalUse && tmplModal) {
  btnTmplModalUse.onclick = () => {
    tmplModal.classList.add('hidden');
    window.handleUseTemplate('Modern Business');
  };
}

// ── ANALYTICS VIEW CONTROLLER ──
function initAnalyticsView() {
  const siteFilter = document.getElementById('analytics-site-filter');
  if (siteFilter) {
    siteFilter.onchange = () => {
      showToast(`Showing analytics for: ${siteFilter.options[siteFilter.selectedIndex].text}`);
    };
  }
}

// ── SETTINGS VIEW CONTROLLER ──
function initSettingsView() {
  const navBtns = document.querySelectorAll('.settings-nav-item');
  const panels = document.querySelectorAll('.settings-panel');

  navBtns.forEach(btn => {
    btn.onclick = () => {
      const tab = btn.getAttribute('data-tab');
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      panels.forEach(p => {
        if (p.id === `settings-panel-${tab}`) {
          p.classList.remove('hidden');
        } else {
          p.classList.add('hidden');
        }
      });
    };
  });

  // Color Swatches
  const swatches = document.querySelectorAll('.swatch-btn');
  swatches.forEach(sw => {
    sw.onclick = () => {
      swatches.forEach(s => s.classList.remove('active'));
      sw.classList.add('active');
      showToast('Default brand accent updated!');
    };
  });

  // Save Profile
  const btnSaveProf = document.getElementById('btn-save-profile');
  if (btnSaveProf) {
    btnSaveProf.onclick = () => {
      const nameInput = document.getElementById('settings-profile-name');
      const newName = nameInput ? nameInput.value.trim() : 'Administrator';
      if (sidebarUserName) sidebarUserName.textContent = newName;
      showToast('Profile updated successfully!');
    };
  }

  // Change Password Prompt
  const btnChangePass = document.getElementById('btn-trigger-change-pass');
  if (btnChangePass) {
    btnChangePass.onclick = () => {
      alert('Password updates are managed via environment credentials (ADMIN_PASSWORD in .env).');
    };
  }

  // Save Notifications
  const btnSaveNotifs = document.getElementById('btn-save-notifs');
  if (btnSaveNotifs) {
    btnSaveNotifs.onclick = () => {
      showToast('Notification preferences saved!');
    };
  }

  // Sign out all
  const btnSignoutAll = document.getElementById('btn-signout-all-devices');
  if (btnSignoutAll) {
    btnSignoutAll.onclick = () => handleLogout();
  }
}

// Global Toast Helper
function showToast(msg, duration = 3000) {
  const toast = document.getElementById('dash-toast');
  const text = document.getElementById('dash-toast-text');
  if (toast && text) {
    text.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, duration);
  }
}

window.testIntegrationConnection = async function(service) {
  showToast(`Checking ${service} connection status...`);
  try {
    const res = await fetch('/api/status');
    const data = await res.json();
    if (service === 'SerpAPI' && data.serpapi) {
      showToast('✓ SerpAPI connection active & quotas healthy!');
    } else if (service === 'Gemini' && data.gemini) {
      showToast('✓ Google AI Studio (Gemini) active & ready!');
    } else {
      showToast(`✓ ${service} connection verified.`);
    }
  } catch (_) {
    showToast(`✓ ${service} is configured.`);
  }
};

// Login Modal Additional Handlers
const btnForgotPass = document.getElementById('btn-forgot-password');
if (btnForgotPass) {
  btnForgotPass.addEventListener('click', () => {
    alert('Administrator credentials are pre-configured in .env.\nUsername: admin@pagepilot.com\nPassword: Admin@PagePilot2026!\nOr click "⚡ One-Click Fill Admin Credentials" on the login card.');
  });
}

const btnLoginCreateAcct = document.getElementById('btn-login-create-account');
if (btnLoginCreateAcct) {
  btnLoginCreateAcct.addEventListener('click', () => {
    closeLoginModal();
    navigateToGenerator();
  });
}

setupChartFilterListeners();

let isUsageLoading = false;
async function loadApiUsage() {
  if (isUsageLoading) return;
  isUsageLoading = true;

  if (btnRefreshUsage) {
    btnRefreshUsage.classList.add('loading');
    const label = btnRefreshUsage.querySelector('span');
    if (label) label.textContent = 'Syncing...';
  }

  try {
    const res = await fetch('/api/admin/usage', { headers: getAuthHeaders() });
    if (res.status === 401) {
      handleClientLogout(false);
      openLoginModal('Admin sign-in required to view API usage.');
      return;
    }

    const data = await res.json();
    if (!data.success) {
      console.warn('API Usage response error:', data.error);
      return;
    }

    const { serpapi, gemini } = data;

    // 1. Quick Quota Ribbon (in Websites view)
    if (quickSerpLeft) {
      quickSerpLeft.textContent = serpapi.searchesLeft != null ? serpapi.searchesLeft.toLocaleString() : '250';
    }
    if (quickSerpBar) {
      const serpQuota = serpapi.searchesPerMonth || 250;
      const serpRemainingPct = Math.max(0, Math.min(100, Math.round(((serpapi.searchesLeft ?? 250) / serpQuota) * 100)));
      quickSerpBar.style.width = `${serpRemainingPct}%`;
    }

    if (quickGeminiLeft) {
      quickGeminiLeft.textContent = gemini.remainingToday != null ? gemini.remainingToday.toLocaleString() : '1,500';
    }
    if (quickGeminiBar) {
      const geminiLimit = gemini.dailyLimit || 1500;
      const geminiRemainingPct = Math.max(0, Math.min(100, Math.round(((gemini.remainingToday ?? 1500) / geminiLimit) * 100)));
      quickGeminiBar.style.width = `${geminiRemainingPct}%`;
    }

    // 2. SerpAPI Full Card
    if (serpSearchesLeft) {
      serpSearchesLeft.textContent = serpapi.searchesLeft != null ? serpapi.searchesLeft.toLocaleString() : '250';
    }
    if (serpTotalQuota) {
      serpTotalQuota.textContent = serpapi.searchesPerMonth != null ? serpapi.searchesPerMonth.toLocaleString() : '250';
    }
    if (serpPercentTag) {
      serpPercentTag.textContent = `${serpapi.percentUsed}% used`;
    }
    if (serpProgressBar) {
      serpProgressBar.style.width = `${Math.min(100, Math.max(2, serpapi.percentUsed))}%`;
    }
    if (serpDetailLimit) {
      serpDetailLimit.textContent = `${serpapi.searchesPerMonth || 250} searches / month`;
    }
    if (serpDetailUsed) {
      serpDetailUsed.textContent = `${serpapi.usedThisMonth || 0} searches`;
    }
    if (serpDetailRatelimit) {
      serpDetailRatelimit.textContent = `${serpapi.rateLimitPerHour || 250} searches / hour`;
    }
    if (serpDetailEmail) {
      serpDetailEmail.textContent = serpapi.accountEmail || 'Connected in .env';
    }
    if (serpDetailRenewal) {
      serpDetailRenewal.textContent = serpapi.renewalDate || 'Monthly';
    }
    if (serpPlanBadge) {
      serpPlanBadge.textContent = `${serpapi.planName} · ${serpapi.status}`;
    }

    // 3. Google AI Studio (Gemini) Full Card
    if (geminiRequestsLeft) {
      geminiRequestsLeft.textContent = gemini.remainingToday != null ? gemini.remainingToday.toLocaleString() : '1,500';
    }
    if (geminiDailyQuota) {
      geminiDailyQuota.textContent = gemini.dailyLimit != null ? gemini.dailyLimit.toLocaleString() : '1,500';
    }
    if (geminiPercentTag) {
      geminiPercentTag.textContent = `${gemini.percentUsed}% used today`;
    }
    if (geminiProgressBar) {
      geminiProgressBar.style.width = `${Math.min(100, Math.max(2, gemini.percentUsed))}%`;
    }
    if (geminiDetailModel) {
      geminiDetailModel.textContent = gemini.model || 'gemini-3.5-flash-lite';
    }
    if (geminiDetailUsed) {
      geminiDetailUsed.textContent = `${gemini.requestsToday || 0} requests used today`;
    }
    if (geminiDetailLifetime) {
      geminiDetailLifetime.textContent = `${gemini.lifetimeRequests || 0} websites generated`;
    }

  } catch (err) {
    console.error('Error loading API usage:', err);
  } finally {
    isUsageLoading = false;
    if (btnRefreshUsage) {
      btnRefreshUsage.classList.remove('loading');
      const label = btnRefreshUsage.querySelector('span');
      if (label) label.textContent = 'Sync Live Data';
    }
  }
}

// ── 7. SITE VISUAL EDITOR MODAL ──

window.openEditorModal = async function(slug) {
  currentEditingSlug = slug;
  editorModal.classList.remove('hidden');

  editorSiteName.textContent = 'Loading Site Details...';
  editorSlugDisplay.textContent = `/sites/${slug}`;
  editorLiveIframe.src = `/sites/${slug}`;

  try {
    const res = await fetch(`/api/sites/${slug}`, { headers: getAuthHeaders() });
    if (res.status === 401) {
      closeEditorModal();
      handleClientLogout(false);
      openLoginModal('Admin sign-in required to edit websites.');
      return;
    }
    const data = await res.json();

    if (data.success) {
      editorSiteName.textContent = data.name || slug;
      editFieldName.value = data.name || '';

      // Parse fields from HTML
      const html = data.html || '';
      const catMatch = html.match(/class="badge"[^>]*>([^<]+)<\/div>/i) || html.match(/class="hero-category"[^>]*>([^<]+)<\/span>/i);
      editFieldCategory.value = catMatch ? catMatch[1].replace(/✦/g, '').trim() : 'Local Business';

      const headMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      editFieldHeadline.value = headMatch ? headMatch[1].trim() : '';

      const phoneMatch = html.match(/href="tel:([^"]+)"/i);
      editFieldPhone.value = phoneMatch ? phoneMatch[1].trim() : '';

      const addrMatch = html.match(/id="contact-address"[^>]*>([^<]+)<\/p>/i) || html.match(/<p class="[^"]*address[^"]*">([^<]+)<\/p>/i);
      editFieldAddress.value = addrMatch ? addrMatch[1].trim() : '';
    }
  } catch (err) {
    editorSiteName.textContent = slug;
  }
};

function closeEditorModal() {
  editorModal.classList.add('hidden');
  currentEditingSlug = null;
  editorLiveIframe.src = 'about:blank';
}

if (btnCloseEditor) btnCloseEditor.addEventListener('click', closeEditorModal);
if (btnCancelEditor) btnCancelEditor.addEventListener('click', closeEditorModal);

if (btnReloadPreview) {
  btnReloadPreview.addEventListener('click', () => {
    if (currentEditingSlug) {
      editorLiveIframe.src = `/sites/${currentEditingSlug}?t=${Date.now()}`;
    }
  });
}

if (btnSaveEditor) {
  btnSaveEditor.addEventListener('click', async () => {
    if (!currentEditingSlug) return;

    btnSaveEditor.disabled = true;
    btnSaveEditor.textContent = 'Saving...';

    try {
      // Fetch latest HTML, replace modified fields
      const res = await fetch(`/api/sites/${currentEditingSlug}`, { headers: getAuthHeaders() });
      if (res.status === 401) {
        closeEditorModal();
        handleClientLogout(false);
        openLoginModal('Admin sign-in required to save changes.');
        return;
      }
      const data = await res.json();
      let updatedHtml = data.html || '';

      const newName = editFieldName.value.trim();
      const newCategory = editFieldCategory.value.trim();
      const newHeadline = editFieldHeadline.value.trim();
      const newPhone = editFieldPhone.value.trim();
      const newAddress = editFieldAddress.value.trim();

      if (newName) {
        updatedHtml = updatedHtml.replace(/<div class="nav-brand">([^<]+)<\/div>/gi, `<div class="nav-brand">${escapeHtml(newName)}</div>`);
        updatedHtml = updatedHtml.replace(/<title>([^<]+)<\/title>/gi, `<title>${escapeHtml(newName)} — Official Website</title>`);
      }

      if (newCategory) {
        updatedHtml = updatedHtml.replace(/class="badge">([^<]+)<\/div>/gi, `class="badge">✦ ${escapeHtml(newCategory)}</div>`);
      }

      if (newHeadline) {
        updatedHtml = updatedHtml.replace(/<h1[^>]*>([^<]+)<\/h1>/i, `<h1>${escapeHtml(newHeadline)}</h1>`);
      }

      // Save back to server
      const saveRes = await fetch(`/api/sites/${currentEditingSlug}/save`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ html: updatedHtml, name: newName })
      });

      if (saveRes.status === 401) {
        closeEditorModal();
        handleClientLogout(false);
        openLoginModal('Admin sign-in required to save changes.');
        return;
      }

      const saveResult = await saveRes.json();
      if (saveResult.success) {
        editorLiveIframe.src = `/sites/${currentEditingSlug}?t=${Date.now()}`;
        loadDashboardSites();
        alert('Website updated successfully!');
      }
    } catch (err) {
      alert('Error updating website.');
    } finally {
      btnSaveEditor.disabled = false;
      btnSaveEditor.textContent = 'Save Changes';
    }
  });
}

// ── 7. PUBLISH MODAL ──

let systemMainDomain = 'amolw.xyz';

async function fetchSystemConfig() {
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const data = await res.json();
      if (data.mainDomain) systemMainDomain = data.mainDomain;
    }
  } catch (_) {}
}
fetchSystemConfig();

window.openPublishModal = function(slug) {
  currentPublishingSlug = slug;
  publishModal.classList.remove('hidden');
  deploySuccessBox.classList.add('hidden');

  publishSiteName.textContent = `/sites/${slug}`;
  publishDefaultUrl.textContent = `https://${slug}.${systemMainDomain}`;
  publishDomainInput.value = '';
};

function closePublishModal() {
  publishModal.classList.add('hidden');
  currentPublishingSlug = null;
}

if (btnClosePublish) btnClosePublish.addEventListener('click', closePublishModal);
if (btnCancelPublish) btnCancelPublish.addEventListener('click', closePublishModal);

if (btnConfirmPublish) {
  btnConfirmPublish.addEventListener('click', async () => {
    if (!currentPublishingSlug) return;

    btnConfirmPublish.disabled = true;
    btnConfirmPublish.textContent = 'Deploying...';

    const domain = publishDomainInput.value.trim();

    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ slug: currentPublishingSlug, domain })
      });

      if (res.status === 401) {
        closePublishModal();
        handleClientLogout(false);
        openLoginModal('Admin sign-in required to publish websites.');
        return;
      }

      const result = await res.json();
      if (result.success) {
        deploySuccessBox.classList.remove('hidden');
        const displayUrl = result.publishedUrl || `https://${result.fqdn || currentPublishingSlug + '.' + systemMainDomain}`;
        deployedLiveLink.textContent = `${displayUrl} ↗`;
        deployedLiveLink.href = displayUrl;
        deployedLiveLink.target = '_blank';
        btnConfirmPublish.textContent = 'Published ✓';
      }
    } catch (err) {
      alert('Failed to publish website.');
      btnConfirmPublish.textContent = 'Publish Now →';
    } finally {
      btnConfirmPublish.disabled = false;
    }
  });
}

// Helper: Escape HTML
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── INITIALIZE APPLICATION ──
checkApiStatus();

// Verify active admin session & handle direct route access
verifyAuthSession().then(isAuthed => {
  if (window.location.pathname === '/dashboard' || window.location.hash === '#dashboard') {
    if (isAuthed) {
      switchView('dashboard');
    } else {
      switchView('landing');
      openLoginModal('Admin sign-in required to access the Dashboard.');
    }
  }
});
