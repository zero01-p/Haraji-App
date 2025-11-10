/* script.js — corrected single-file for Haraji app (replace your existing script.js) */
/* Haraji app script — modular, uses Firebase v10 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, updateProfile
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import {
  getFirestore, collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot, enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

/* ================== FIREBASE CONFIG ================== */
const firebaseConfig = {
  apiKey: "AIzaSyA5Acv9TsCKrSz12YX0aZ4Hr0_sU6mpt0Q",
  authDomain: "haraji-app.firebaseapp.com",
  projectId: "haraji-app",
  storageBucket: "haraji-app.appspot.com",
  messagingSenderId: "175488351067",
  appId: "1:175488351067:web:f96560348fd9bd7eec787e",
  measurementId: "G-BJX74YX3F7"
};
/* ======================================================================== */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// enable persistence for offline use (best-effort)
enableIndexedDbPersistence(db).catch((err) => {
  console.warn("Could not enable persistence:", err && err.message);
});

/* Helper: safe get element */
const $ = (id) => document.getElementById(id) || null;

/* ----------------- App state & DOM refs ----------------- */
let currentUser = null;
let transactionsCache = [];

const screens = {
  auth: $('auth-screen'),
  dashboard: $('dashboard-screen'),
  addSale: $('add-sale-screen'),
  addExpense: $('add-expense-screen'),
  transactions: $('transactions-screen'),
  tax: $('tax-calculator-screen'),
  settings: $('settings-screen'),
  support: $('support-screen')
};

const navButtons = {
  home: $('nav-home'),
  tx: $('nav-transactions'),
  tax: $('nav-tax'),
  support: $('btn-open-support'),
  settings: $('nav-settings')
};

const valSales = $('val-sales');
const valExpenses = $('val-expenses');
const valProfit = $('val-profit');
const recentList = $('recent-list');

const btnLogin = $('btn-login');
const btnToggleSignup = $('btn-toggle-signup');
const btnGuest = $('btn-guest');
const emailInput = $('email');
const passwordInput = $('password');
const fullnameInput = $('fullname');

const btnAddSale = $('btn-add-sale');
const btnAddExpense = $('btn-add-expense');
const saleItem = $('sale-item');
const saleAmount = $('sale-amount');
const saveSaleBtn = $('save-sale');
const btnCancelSale = $('btn-cancel-sale');

const expenseDesc = $('expense-desc');
const expenseAmount = $('expense-amount');
const saveExpenseBtn = $('save-expense');
const btnCancelExpense = $('btn-cancel-expense');

const txList = $('tx-list');

const rangeBtns = document.querySelectorAll('.range-btn') || [];
let selectedRange = 'month';
const taxSalesLabel = $('tax-sales');
const taxProfitLabel = $('tax-profit');
const turnoverText = $('turnover-text');
const smeStatus = $('sme-status');
const citText = $('cit-text');
const devText = $('dev-text');
const vatText = $('vat-text');

const btnLangEn = $('btn-lang-en');
const btnLangHa = $('btn-lang-ha');
const profileName = $('profile-name');
const profileEmail = $('profile-email');
const btnLogout = $('btn-logout');

const langEnShort = $('lang-en');
const langHaShort = $('lang-ha');
const userGreet = $('user-greet');

const btnTheme = $('btn-theme');

const btnExport = $('btn-export');
const btnClearLocal = $('btn-clear-local');

const btnSendSupport = $('btn-send-support');

const btnCancelSupport = $('btn-cancel-support');

const toastRoot = $('toast-root');

const onboard = $('onboard');
const btnDismissOnboard = $('btn-dismiss-onboard');
const btnSkipOnboard = $('btn-skip-onboard');

/* ----------------- Simple localization (small subset) ----------------- */
const UI_STRINGS = {
  en: { appTitle: "Haraji", welcome: "Welcome to Haraji", loginSub: "Login or sign up to get started", signUp: "Sign up", login: "Login", logout: "Logout", continueDemo: "Continue Demo", totalSales: "Total Sales", totalExpenses: "Total Expenses", profit: "Profit", addSale: "Add Sale", addExpense: "Add Expense", recentTransactions: "Recent Transactions", recordSale: "Record a New Sale", recordExpense: "Record a New Expense", saveSale: "Save Sale", saveExpense: "Save Expense", cancel: "Cancel", allTransactions: "All Transactions", taxEstimator: "Tax Estimator", thisMonth: "This Month", last3Months: "Last 3 Months", thisYear: "This Year", totalRevenue: "Total Revenue", profitLabel: "Profit", estimatedAnnual: "Estimated Annual Turnover", smeQualified: "Congratulations! Your business qualifies for the 0% tax rate for small companies.", smeNotQualified: "Your business does not qualify for the small company tax exemption.", citEstimate: "Estimated Company Income Tax (CIT)", devEstimate: "Estimated Development Levy", vatEstimate: "Estimated VAT (7.5%)", vatDisclaimer: "Note: Many basic food items are exempt from VAT. Your actual VAT may be lower.", settings: "Settings", logout: "Logout", home: "Home", transactions: "Transactions", tax: "Tax", settingsLabel: "Settings", amount: "Amount", description: "Description", logoutConfirm: "Logout", saveSuccess: "Saved!", saleSaved: "Sale Saved!", expenseSaved: "Expense Saved!", enterAmount: "Please enter an amount", enterEmail: "Please enter email", enterPassword: "Please enter password", fullName: "Full name (Sign up)", signUpMode: "Sign up", support:"Support", loginMode: "Login", eduTitle: "Educational Hub", eduDesc: "Learn about taxes, small business management, and how to stay financially smart.", taxBasics: "Tax Basics", taxBasicsDesc: "Understand how business taxes work and how to calculate yours properly.", finLit: "Financial Literacy", finLitDesc: "Practical tips to track your sales, manage expenses, and grow your business profitably.", msme: "MSME Support", msmeDesc: "Discover government and private initiatives that support small and medium businesses in Nigeria.", contactSupport: "Contact Support", contactDesc: "Reach out to us for help or questions.", send: "Send", cancel: "Cancel", payTax: "💳 Pay Your Tax" },
  ha: { appTitle: "Haraji", welcome: "Barka da zuwa Haraji", loginSub: "Shiga ko yi rijista don fara", signUp: "Yi Rijista", login: "Shiga", logout: "Fita", continueDemo: "Ci gaba Demo", totalSales: "Jimillar Siyarwa", totalExpenses: "Jimillar Kashewa", profit: "Riba", addSale: "Ƙara Siyarwa", addExpense: "Ƙara Kashewa", recentTransactions: "Duk Ma'amaloli", recordSale: "Rubuta Sabuwar Siyarwa", recordExpense: "Rubuta Sabon Kashewa", saveSale: "Ajiye Siyarwa", saveExpense: "Ajiye Kashewa", cancel: "Soke", allTransactions: "Duk Ma'amaloli", taxEstimator: "Kimanta Haraji", thisMonth: "Wannan Watan", last3Months: "Watanni 3 na Ƙarshe", thisYear: "Wannan Shekarar", totalRevenue: "Jimillar Kuɗaɗe", profitLabel: "Riba", estimatedAnnual: "Kimanta Jimillar Shekara", smeQualified: "Kai! Kasuwancinka ya cancanci harajin 0% na kananan kamfanoni.", smeNotQualified: "Kasuwancinka bai cancanci rangwamen haraji na kananan kamfanoni ba.", citEstimate: "Kimanta Harajin Kamfani (CIT)", devEstimate: "Kimanta Haraji na Ci Gaba", vatEstimate: "Kimanta VAT (7.5%)", vatDisclaimer: "Lura: Yawancin kayan abinci na yau da kullun ba su da harajin VAT. Zai yiwu ainihin harajin VAT dinka ya yi kasa.", settings: "Saiti", logout: "Fita", home: "Gida", transactions: "Ma'amaloli", tax: "Haraji", settingsLabel: "Saiti", amount: "Adadin", description: "Bayani", logoutConfirm: "Fita", saveSuccess: "An Ajiye!", saleSaved: "An Ajiye Siyarwa!", expenseSaved: "An Ajiye Kashewa!", enterAmount: "Don Allah shigar da adadi", enterEmail: "Don Allah shigar da imel", enterPassword: "Don Allah shigar da kalmar sirri", fullName: "Cikakken suna (Rijista)", signUpMode: "Yi Rijista", support:"Taimako", loginMode: "Shiga", eduTitle: "Cibiyar Ilimi", eduDesc: "Koyi game da haraji, kula da kasuwanci, da yadda ake sarrafa kuɗi yadda ya dace.", taxBasics: "Asalin Haraji", taxBasicsDesc: "Fahimci yadda haraji ke aiki da yadda ake ƙirga naka daidai.", finLit: "Ilmin Kuɗi", finLitDesc: "Shawarwari masu amfani don bibiyar tallace-tallace, kashe kuɗi, da haɓaka ribar kasuwanci.", msme: "Tallafin MSME", msmeDesc: "Gano shirye-shiryen gwamnati da masu zaman kansu da ke tallafawa ƙananan masana'antu a Najeriya.", contactSupport: "Tuntuɓi Taimako", contactDesc: "Tuntuɓe mu don taimako ko tambayoyi.", send: "Aika", cancel: "Soke", payTax: "💳 Biya Haraji" }};

  let LANG = 'en';
const t = (k) => (UI_STRINGS[LANG] && UI_STRINGS[LANG][k]) ? UI_STRINGS[LANG][k] : k;

/* ----------------- UI helpers ----------------- */
// ---------- Replace your existing showScreen with this ----------
function showScreen(name){
  console.debug('[showScreen] requested ->', name);

  // hide all screens (only if they exist)
  Object.entries(screens).forEach(([k, s]) => {
    if(!s) return;
    s.classList.add('hidden');
  });

  // Hide/Show "Pay Your Tax" button based on active screen
  const payTaxBtn = $('btn-pay-tax');
  if (payTaxBtn) {
    if (name === 'auth') {
      payTaxBtn.style.display = 'none';
    } else {
      payTaxBtn.style.display = 'flex'; // or 'block'
    }
  }
  // Hide entire Tax section except on Tax screen
const taxSection = $('tax-calculator-screen');
if (taxSection) {
  if (name === 'tax') {
    taxSection.style.display = 'block';
  } else {
    taxSection.style.display = 'none';
  }
}

  // remove active from nav buttons (only if they exist)
  Object.entries(navButtons).forEach(([k, b]) => {
    if(!b) return;
    b.classList.remove('active');
  });

  // Helper to unhide a screen safely
  const unhide = (key) => {
    const s = screens[key];
    if(!s) return false;
    s.classList.remove('hidden');
    // ensure children that may have been hidden are visible
    s.querySelectorAll('.hidden').forEach(ch => ch.classList.remove('hidden'));
    // also ensure edu-card children are not accidentally display:none
    s.querySelectorAll('.edu-card').forEach(card => {
      card.style.display = card.style.display || 'block';
      card.style.visibility = 'visible';
    });
    return true;
  };

  if(name === 'auth' && unhide('auth')) {}
  if(name === 'dashboard' && unhide('dashboard')) {
    if(navButtons.home) navButtons.home.classList.add('active');
  }
  if(name === 'addSale' && unhide('addSale')) {}
  if(name === 'addExpense' && unhide('addExpense')) {}
  if(name === 'transactions' && unhide('transactions')) {
    if(navButtons.tx) navButtons.tx.classList.add('active');
  }
  if(name === 'tax' && unhide('tax')) {
    if(navButtons.tax) navButtons.tax.classList.add('active');
  }
  if(name === 'settings' && unhide('settings')) {
    if(navButtons.settings) navButtons.settings.classList.add('active');
  }
  if(name === 'support' && unhide('support')) {
    if(navButtons.support) navButtons.support.classList.add('active');
    // scroll the support screen into view
    try { screens.support.scrollIntoView({behavior:'smooth'}); } catch(e){ /* ignore */ }
  }

  // final safety: ensure the app wrapper isn't covering content (z-index issues)
  try { document.querySelector('#app').style.overflow = 'visible'; } catch(e){}

  console.debug('[showScreen] finished -> visible screens:', Object.keys(screens).filter(k=>screens[k] && !screens[k].classList.contains('hidden')));
}

function showToast(msg, time=3000){
  if(!toastRoot) { console.log('Toast:', msg); return; }
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  toastRoot.appendChild(el);
  requestAnimationFrame(()=> el.classList.add('show'));
  setTimeout(()=> { el.classList.remove('show'); setTimeout(()=> el.remove(),300); }, time);
}

/* ----------------- AUTH FLOW ----------------- */
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if(user){
    if(profileName) profileName.textContent = user.displayName || user.email;
    if(profileEmail) profileEmail.textContent = user.email;
    if(userGreet) userGreet.textContent = (LANG==='en' ? 'Hi, ' : 'Sannu, ') + (user.displayName || user.email);
    showScreen('dashboard');
    listenToTransactions();
  } else {
    if(profileName) profileName.textContent = '';
    if(profileEmail) profileEmail.textContent = '';
    if(userGreet) userGreet.textContent = '';
    showScreen('auth');
  }
  setLanguage(LANG);
});

// ---------- CORRECTED LOGIN/SIGNUP FLOW ----------
let signupMode = false;

// If toggle button exists, bind; else skip
if(btnToggleSignup){
  btnToggleSignup.addEventListener('click', ()=> {
    signupMode = !signupMode;
    if(signupMode){
      if(fullnameInput) fullnameInput.classList.remove('hidden');
      btnToggleSignup.textContent = t('loginMode');
      if(btnLogin) btnLogin.textContent = t('signUp');
    } else {
      if(fullnameInput) fullnameInput.classList.add('hidden');
      btnToggleSignup.textContent = t('signUp');
      if(btnLogin) btnLogin.textContent = t('login');
    }
  });
}

// Login or Signup depending on mode
if(btnLogin){
  btnLogin.addEventListener('click', async ()=> {
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value.trim() : '';
    const full = fullnameInput ? fullnameInput.value.trim() : '';

    if(!email){ showToast(t('enterEmail')); return; }
    if(!password){ showToast(t('enterPassword')); return; }

    try {
      if(signupMode){
        if(!full){ showToast(t('fullName') || 'Enter full name'); return; }
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: full });
        showToast(t('saveSuccess'));
        // reset UI
        signupMode = false;
        if(fullnameInput) fullnameInput.classList.add('hidden');
        if(btnToggleSignup) btnToggleSignup.textContent = t('signUp');
        if(btnLogin) btnLogin.textContent = t('login');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch(err){
      showToast((signupMode ? 'Sign up error: ' : 'Login error: ') + (err.message || err));
    }
  });
}

// guest
if(btnGuest){
  btnGuest.addEventListener('click', ()=> {
    currentUser = { uid: 'demo-' + Date.now(), email: 'demo@haraji.local', displayName: 'Demo User' };
    if(userGreet) userGreet.textContent = (LANG==='en' ? 'Hi, ' : 'Sannu, ') + currentUser.displayName;
    if(profileName) profileName.textContent = currentUser.displayName;
    if(profileEmail) profileEmail.textContent = currentUser.email;
    transactionsCache = [];
    renderDashboardTotals();
    renderRecentTransactions();
    showScreen('dashboard');
  });
}

if(btnLogout){
  btnLogout.addEventListener('click', async ()=> {
    if(confirm(t('logoutConfirm') + '?')) {
      try { await signOut(auth); } catch(e){ console.warn(e); }
      if(currentUser && String(currentUser.uid).startsWith('demo-')) { currentUser = null; transactionsCache = []; showScreen('auth'); }
    }
  });
}

/* ----------------- TRANSACTIONS (Firestore + local demo) ----------------- */
async function addTransaction({ type, description='', amount=0, category='' }){
  amount = Number(amount) || 0;
  if(amount <= 0){ showToast(t('enterAmount')); return; }
  const doc = { userId: currentUser ? currentUser.uid : null, type, description, amount, category, timestamp: serverTimestamp() };
  try {
    if(currentUser && String(currentUser.uid).startsWith('demo-')){
      const localDoc = { ...doc, id: 'local-' + Date.now(), timestamp: new Date() };
      transactionsCache.unshift(localDoc);
      renderDashboardTotals(); renderRecentTransactions(); showToast(type==='sale'?t('saleSaved'):t('expenseSaved')); showScreen('dashboard'); return;
    }
    await addDoc(collection(db, 'transactions'), doc);
    showToast(type==='sale'?t('saleSaved'):t('expenseSaved'));
    showScreen('dashboard');
  } catch(err){ console.error('Add transaction failed', err); showToast('Error saving: ' + (err.message||err)); }
}

let unsubTransactions = null;
function listenToTransactions(){
  if(unsubTransactions){ unsubTransactions(); unsubTransactions = null; }
  if(!currentUser) return;
  if(String(currentUser.uid).startsWith('demo-')) { transactionsCache = transactionsCache || []; renderDashboardTotals(); renderRecentTransactions(); return; }
  const colRef = collection(db, 'transactions');
  const q = query(colRef, where('userId','==', currentUser.uid), orderBy('timestamp','desc'));
  unsubTransactions = onSnapshot(q, (snap) => {
    transactionsCache = [];
    snap.forEach(doc => {
      const data = doc.data();
      transactionsCache.push({ id: doc.id, ...data, timestamp: data.timestamp && data.timestamp.toDate ? data.timestamp.toDate() : new Date() });
    });
    renderDashboardTotals(); renderRecentTransactions();
  }, err => console.warn('Transaction listener error', err));
}

/* ----------------- RENDER & CALCS ----------------- */
function formatNaira(value){
  const n = Number(value) || 0;
  return (getCurrencySymbol() || '₦') + n.toLocaleString();
}

function getCurrencySymbol(){
  try {
    const el = $('currency-select');
    if(!el) return '₦';
    return el.value === 'NGN' ? '₦' : (el.value === 'USD' ? '$' : (el.value === 'EUR' ? '€' : '₵'));
  } catch(e){ return '₦'; }
}

function renderDashboardTotals(){
  const now = new Date(); const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let totalSales = 0, totalExpenses = 0;
  transactionsCache.forEach(tx => {
    const ts = tx.timestamp instanceof Date ? tx.timestamp : new Date(tx.timestamp);
    if(ts >= startOfDay){
      if(tx.type === 'sale') totalSales += Number(tx.amount || 0);
      if(tx.type === 'expense') totalExpenses += Number(tx.amount || 0);
    }
  });
  const profit = totalSales - totalExpenses;
  if(valSales) valSales.textContent = formatNaira(totalSales);
  if(valExpenses) valExpenses.textContent = formatNaira(totalExpenses);
  if(valProfit) valProfit.textContent = formatNaira(profit);
  updateChart();
}

function renderRecentTransactions(){
  if(recentList) recentList.innerHTML = '';
  const recent = transactionsCache.slice(0,6);
  if(recent.length === 0){
    if(recentList) recentList.innerHTML = `<div class="center muted">No transactions</div>`;
    if(txList) txList.innerHTML = `<div class="center muted">No transactions</div>`;
    return;
  }
  recent.forEach(tx=>{
    const el = document.createElement('div'); el.className='tx-item';
    const left = document.createElement('div'); left.className='tx-left';
    const desc = document.createElement('div'); desc.className='tx-desc'; desc.textContent = tx.description || (tx.type === 'sale' ? 'Sale' : 'Expense');
    const meta = document.createElement('div'); meta.className='tx-meta'; meta.textContent = `${(tx.timestamp instanceof Date ? tx.timestamp : new Date(tx.timestamp)).toLocaleString()} • ${tx.category||''}`;
    left.appendChild(desc); left.appendChild(meta);
    const right = document.createElement('div'); right.className = tx.type === 'sale' ? 'green' : 'red';
    right.textContent = (tx.type === 'sale' ? '+ ' : '- ') + formatNaira(tx.amount);
    el.appendChild(left); el.appendChild(right);
    if(recentList) recentList.appendChild(el);
  });

  if(txList) txList.innerHTML = '';
  transactionsCache.forEach(tx=>{
    const el = document.createElement('div'); el.className='tx-item';
    const left = document.createElement('div'); left.className='tx-left';
    const desc = document.createElement('div'); desc.className='tx-desc'; desc.textContent = tx.description || (tx.type === 'sale' ? 'Sale' : 'Expense');
    const meta = document.createElement('div'); meta.className='tx-meta'; meta.textContent = `${(tx.timestamp instanceof Date ? tx.timestamp : new Date(tx.timestamp)).toLocaleString()} • ${tx.category||''}`;
    left.appendChild(desc); left.appendChild(meta);
    const right = document.createElement('div'); right.className = tx.type === 'sale' ? 'green' : 'red';
    right.textContent = (tx.type === 'sale' ? '+ ' : '- ') + formatNaira(tx.amount);
    el.appendChild(left); el.appendChild(right);
    if(txList) txList.appendChild(el);
  });
}

/* ----------------- TAX CALC ----------------- */
function monthDifference(d1, d2) {
  let months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
}

function calculateTaxForRange(rangeKey){
  const now = new Date(); let start;
  if(rangeKey === 'month'){ start = new Date(now.getFullYear(), now.getMonth(), 1); }
  else if(rangeKey === '3months'){ const m = now.getMonth() - 2; start = new Date(now.getFullYear(), m, 1); }
  else if(rangeKey === 'year'){ start = new Date(now.getFullYear(), 0, 1); } else { start = new Date(0); }

  let totalRevenue=0, totalExpenses=0;
  transactionsCache.forEach(tx => {
    const ts = tx.timestamp instanceof Date ? tx.timestamp : new Date(tx.timestamp);
    if(ts >= start){
      if(tx.type==='sale') totalRevenue += Number(tx.amount||0);
      if(tx.type==='expense') totalExpenses += Number(tx.amount||0);
    }
  });

  const profit = totalRevenue - totalExpenses;
  const monthDiff = monthDifference(start, now) + 1;
  const estimatedAnnualTurnover = monthDiff > 0 ? (totalRevenue / monthDiff) * 12 : totalRevenue;
  const qualifiesSmall = estimatedAnnualTurnover <= 100000000;
  const cit = qualifiesSmall ? 0 : Math.max(0, 0.30 * profit);
  const devLevy = qualifiesSmall ? 0 : Math.max(0, 0.04 * profit);
  const vat = 0.075 * totalRevenue;

  return { totalRevenue, totalExpenses, profit, estimatedAnnualTurnover, qualifiesSmall, cit, devLevy, vat };
}

function renderTaxForSelectedRange(){
  const r = calculateTaxForRange(selectedRange);
  if(taxSalesLabel) taxSalesLabel.textContent = formatNaira(r.totalRevenue);
  if(taxProfitLabel) taxProfitLabel.textContent = formatNaira(r.profit);
  if(turnoverText) turnoverText.textContent = `${t('estimatedAnnual')}: ${formatNaira(Math.round(r.estimatedAnnualTurnover))}`;
  if(smeStatus) smeStatus.textContent = r.qualifiesSmall ? t('smeQualified') : t('smeNotQualified');
  if(citText) citText.textContent = `${t('citEstimate')}: ${formatNaira(Math.round(r.cit))}`;
  if(devText) devText.textContent = `${t('devEstimate')}: ${formatNaira(Math.round(r.devLevy))}`;
  if(vatText) vatText.textContent = `${t('vatEstimate')}: ${formatNaira(Math.round(r.vat))}`;
}

/* ----------------- Chart.js setup ----------------- */
let dashboardChart = null;
function updateChart(){
  const data = transactionsCache.slice(0,12).reverse();
  const labels = data.map((d,i)=> (d.timestamp instanceof Date ? d.timestamp : new Date(d.timestamp)).toLocaleDateString());
  const income = data.map(d => d.type==='sale' ? Number(d.amount||0) : 0);
  const expense = data.map(d => d.type==='expense' ? Number(d.amount||0) : 0);

  const ctx = $('dashboardChart');
  if(!ctx) return;
  if(dashboardChart) {
    try { dashboardChart.destroy(); } catch(e){ /* ignore */ }
  }
  // Chart.js expects canvas element context or canvas element
  dashboardChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Income', data: income, stack: 'a' },
        { label: 'Expense', data: expense, stack: 'a' }
      ]
    },
    options: {
      responsive: true,
      scales: { x: { stacked: true }, y: { stacked: true } }
    }
  });
}

// Optional: Log when user views Educational Hub section
const supportScreen = document.getElementById('support-screen');
if (supportScreen) {
  supportScreen.addEventListener('click', (e) => {
    if (e.target.closest('.edu-card a')) {
      console.log('User opened an Educational Hub link:', e.target.href);
    }
  });
}

/* ----------------- UI event binding ----------------- */
// nav buttons
if(navButtons.home) navButtons.home.addEventListener('click', ()=> showScreen('dashboard'));
if(navButtons.tx) navButtons.tx.addEventListener('click', ()=> showScreen('transactions'));
if(navButtons.tax) navButtons.tax.addEventListener('click', ()=> { showScreen('tax'); renderTaxForSelectedRange(); });
if(navButtons.support) navButtons.support.addEventListener('click', ()=> showScreen('support'));
if(navButtons.settings) navButtons.settings.addEventListener('click', ()=> showScreen('settings'));

// add sale/expense
if(btnAddSale) btnAddSale.addEventListener('click', ()=> { if(saleItem) saleItem.value=''; if(saleAmount) saleAmount.value=''; showScreen('addSale'); });
if(btnAddExpense) btnAddExpense.addEventListener('click', ()=> { if(expenseDesc) expenseDesc.value=''; if(expenseAmount) expenseAmount.value=''; showScreen('addExpense'); });

// save/cancel sale
if(saveSaleBtn) saveSaleBtn.addEventListener('click', async ()=> {
  const desc = saleItem ? saleItem.value.trim() : '';
  const amt = saleAmount ? Number(saleAmount.value.replace(/[^0-9.-]/g,'')) || 0 : 0;
  const category = $('sale-category') ? $('sale-category').value : '';
  if(!amt || amt <= 0){ showToast(t('enterAmount')); return; }
  await addTransaction({ type:'sale', description:desc, amount:amt, category });
});
if(btnCancelSale) btnCancelSale.addEventListener('click', ()=> showScreen('dashboard'));

// save/cancel expense
if(saveExpenseBtn) saveExpenseBtn.addEventListener('click', async ()=> {
  const desc = expenseDesc ? expenseDesc.value.trim() : '';
  const amt = expenseAmount ? Number(expenseAmount.value.replace(/[^0-9.-]/g,'')) || 0 : 0;
  const category = $('expense-category') ? $('expense-category').value : '';
  if(!amt || amt <= 0){ showToast(t('enterAmount')); return; }
  await addTransaction({ type:'expense', description:desc, amount:amt, category });
});
if(btnCancelExpense) btnCancelExpense.addEventListener('click', ()=> showScreen('dashboard'));

// tax range buttons
if(rangeBtns && rangeBtns.length){
  rangeBtns.forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      rangeBtns.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      selectedRange = btn.getAttribute('data-range') || 'month';
      renderTaxForSelectedRange();
    });
  });
}

const btnPayTax = $('btn-pay-tax');
if (btnPayTax) {
  btnPayTax.addEventListener('click', () => {
    // Redirect to official FIRS payment page
    window.open('https://www.firs.gov.ng/eServices/taxPayment', '_blank');
  });
}

/* language toggles */
if(btnLangEn) btnLangEn.addEventListener('click', ()=> setLanguage('en'));
if(btnLangHa) btnLangHa.addEventListener('click', ()=> setLanguage('ha'));
if(langEnShort) langEnShort.addEventListener('click', ()=> setLanguage('en'));
if(langHaShort) langHaShort.addEventListener('click', ()=> setLanguage('ha'));

/* theme toggle */
if(btnTheme){
  btnTheme.addEventListener('click', ()=> {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('haraji_dark', document.body.classList.contains('dark-mode') ? '1' : '0');
  });
}

/* CSV export */
if(btnExport){
  btnExport.addEventListener('click', ()=> {
    if(!transactionsCache.length){ showToast('No transactions to export'); return; }
    const rows = [['type','description','category','amount','timestamp']];
    transactionsCache.forEach(tx => rows.push([tx.type, (tx.description||''), (tx.category||''), tx.amount, tx.timestamp instanceof Date ? tx.timestamp.toISOString() : new Date(tx.timestamp).toISOString()]));
    const csv = rows.map(r=> r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `haraji-transactions-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  });
}

/* Clear local (demo) */
if(btnClearLocal){
  btnClearLocal.addEventListener('click', ()=> {
    if(!confirm('Clear local transactions?')) return;
    transactionsCache = [];
    renderDashboardTotals(); renderRecentTransactions();
  });
}

/* Support form */
if(btnSendSupport){
  btnSendSupport.addEventListener('click', async ()=>{
    const name = $('support-name') ? $('support-name').value.trim() : '';
    const email = $('support-email') ? $('support-email').value.trim() : '';
    const subject = $('support-subject') ? $('support-subject').value.trim() : '';
    const message = $('support-message') ? $('support-message').value.trim() : '';
    if(!name || !email || !message){ showToast('Please complete name, email, and message'); return; }

    const doc = { name, email, subject, message, userId: currentUser ? currentUser.uid : null, timestamp: serverTimestamp() };
    try {
      await addDoc(collection(db, 'supportMessages'), doc);
      showToast('Message sent — we will follow up.');
      if($('support-name')) $('support-name').value='';
      if($('support-email')) $('support-email').value='';
      if($('support-subject')) $('support-subject').value='';
      if($('support-message')) $('support-message').value='';
      showScreen('dashboard');
    } catch(err){ console.error('Support save failed', err); showToast('Could not send message: '+(err.message||err)); }
  });
}
if(btnCancelSupport) btnCancelSupport.addEventListener('click', ()=> showScreen('dashboard'));

const btnOpenChat = $('btn-open-chat');
const supportForm = $('support-form');

if (btnOpenChat && supportForm) {
  btnOpenChat.addEventListener('click', () => {
    supportForm.classList.toggle('hidden');
  });
}


/* Save profile name */
if($('btn-save-profile')){
  $('btn-save-profile').addEventListener('click', async ()=> {
    const newName = $('profile-edit-name') ? $('profile-edit-name').value.trim() : '';
    if(!currentUser || !newName){ showToast('Enter a name'); return; }
    try {
      await updateProfile(auth.currentUser, { displayName: newName });
      if(profileName) profileName.textContent = newName; showToast('Profile updated');
    } catch(err){ console.warn(err); showToast('Could not update profile'); }
  });
}

/* onboarding */
if(onboard && localStorage.getItem('haraji_onboard_shown') !== 'true'){
  onboard.classList.remove('hidden');
}
if(btnDismissOnboard) btnDismissOnboard.addEventListener('click', ()=> { if(onboard) onboard.classList.add('hidden'); localStorage.setItem('haraji_onboard_shown','true'); });
if(btnSkipOnboard) btnSkipOnboard.addEventListener('click', ()=> { if(onboard) onboard.classList.add('hidden'); localStorage.setItem('haraji_onboard_shown','true'); });

/* set language strings */
function setLanguage(lang){
  LANG = lang;
  if($('app-title')) $('app-title').textContent = t('appTitle');
  if($('auth-title')) $('auth-title').textContent = t('welcome');
  if($('auth-sub')) $('auth-sub').textContent = t('loginSub');
  if(btnToggleSignup) btnToggleSignup.textContent = t('signUp');
  if(btnLogin) btnLogin.textContent = t('login');
  if(btnGuest) btnGuest.textContent = t('continueDemo');
  if($('lbl-sales')) $('lbl-sales').textContent = t('totalSales');
  if($('lbl-expenses')) $('lbl-expenses').textContent = t('totalExpenses');
  if($('lbl-profit')) $('lbl-profit').textContent = t('profit');
  if($('add-sale-label')) $('add-sale-label').textContent = t('addSale');
  if($('add-expense-label')) $('add-expense-label').textContent = t('addExpense');
  if($('recent-title')) $('recent-title').textContent = t('recentTransactions');
  if($('add-sale-title')) $('add-sale-title').textContent = t('recordSale');
  if($('add-expense-title')) $('add-expense-title').textContent = t('recordExpense');
  if($('save-sale')) $('save-sale').textContent = t('saveSale');
  if($('save-expense')) $('save-expense').textContent = t('saveExpense');
  if($('btn-cancel-sale')) $('btn-cancel-sale').textContent = t('cancel');
  if($('btn-cancel-expense')) $('btn-cancel-expense').textContent = t('cancel');
  if($('transactions-title')) $('transactions-title').textContent = t('allTransactions');
  if($('tax-title')) $('tax-title').textContent = t('taxEstimator');
  if ($('edu-title')) $('edu-title').textContent = t('eduTitle');
  if ($('edu-desc')) $('edu-desc').textContent = t('eduDesc');
  if ($('tax-basics-title')) $('tax-basics-title').textContent = t('taxBasics');
  if ($('tax-basics-desc')) $('tax-basics-desc').textContent = t('taxBasicsDesc');
  if ($('fin-lit-title')) $('fin-lit-title').textContent = t('finLit');
  if ($('fin-lit-desc')) $('fin-lit-desc').textContent = t('finLitDesc');
  if ($('msme-title')) $('msme-title').textContent = t('msme');
  if ($('msme-desc')) $('msme-desc').textContent = t('msmeDesc');
  if ($('contact-support-title')) $('contact-support-title').textContent = t('contactSupport');
  if ($('contact-support-desc')) $('contact-support-desc').textContent = t('contactDesc');
  if ($('btn-send-support')) $('btn-send-support').textContent = t('send');
  if ($('btn-cancel-support')) $('btn-cancel-support').textContent = t('cancel');
  if ($('btn-logout')) $('btn-logout').textContent = t('logout');
  if ($('btn-pay-tax')) $('btn-pay-tax').textContent = t('payTax');

  const rbtns = document.querySelectorAll('.range-btn');
  if(rbtns && rbtns.length>=3){
    rbtns[0].textContent = t('thisMonth');
    rbtns[1].textContent = t('last3Months');
    rbtns[2].textContent = t('thisYear');
  }
  if($('settings-title')) $('settings-title').textContent = t('settings');
  if($('nav-home-label')) $('nav-home-label').textContent = t('home');
  if($('nav-tx-label')) $('nav-tx-label').textContent = t('transactions');
  if($('nav-tax-label')) $('nav-tax-label').textContent = t('tax');
  if($('nav-support-label')) $('nav-support-label').textContent = t('support');

  if(langEnShort) langEnShort.classList.toggle('active', lang==='en');
  if(langHaShort) langHaShort.classList.toggle('active', lang==='ha');
  if(btnLangEn) btnLangEn.classList.toggle('active', lang==='en');
  if(btnLangHa) btnLangHa.classList.toggle('active', lang==='ha');

  if(currentUser){
    if(profileName) profileName.textContent = currentUser.displayName || currentUser.email;
    if(profileEmail) profileEmail.textContent = currentUser.email;
    if(userGreet) userGreet.textContent = (LANG==='en'? 'Hi, ' : 'Sannu, ') + (currentUser.displayName || currentUser.email);
  }

}

/* initial language */
setLanguage(LANG);

/* initial screen */
showScreen('auth');

/* numeric keyboard hint */
if(saleAmount) saleAmount.setAttribute('inputmode','numeric');
if(expenseAmount) expenseAmount.setAttribute('inputmode','numeric');

/* ----------------- small utilities (local backup) ----------------- */
function saveLocalTxForUid(uid){
  if(!uid) return;
  try { localStorage.setItem(`haraji_tx_${uid}`, JSON.stringify(transactionsCache)); } catch(e){ console.warn(e); }
}
function loadLocalTxForUid(uid){
  try { const s = localStorage.getItem(`haraji_tx_${uid}`); return s ? JSON.parse(s) : []; } catch(e){ return []; }
}

/* ----------------- PWA: register service worker ----------------- */
if('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    try {
      navigator.serviceWorker.register('/service-worker.js').then(()=> console.log('sw registered')).catch(()=> console.warn('sw failed'));
    } catch(e){ /* ignore on pages without SW */ }
  });
}
