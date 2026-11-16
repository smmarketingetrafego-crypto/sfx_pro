/**
 * SFX PRO — Landing Page de Vendas & Central de Admin Integrada
 * Criado para Silas Maroto
 */

const SECRET_SALT = "SILAS_MAROTO_SFX_PRO_KEY_SALT_2026";
const KIWIFY_CHECKOUT_URL = "https://pay.kiwify.com.br/";

// Credenciais Oficiais do Administrador (Silas Maroto)
const DEFAULT_ADMIN_CREDS = {
  user: "smmarketingetrafego@gmail.com",
  pass: "76154394"
};

let licensesData = [];
let activeFilter = "all";
let searchQuery = "";

document.addEventListener("DOMContentLoaded", function () {
  initLicensesStore();
  initAdminAuth();
  initClientPortal();
  initModeSwitch();
  initAdminSubtabs();
  initGdriveDownloadsManager();
  initKiwifyCheckoutManager();
  initQuickGenerator();
  initOfflineHwidGenerator();
  initWebAudioSoundboard();
  initAutoSfxSimulator();
  initFaqAccordion();
});

// ==========================================================================
// 1. SISTEMA DE AUTENTICAÇÃO E LOGIN DO ADMIN (SILAS MAROTO)
// ==========================================================================
function getAdminCredentials() {
  try {
    const saved = localStorage.getItem("sfx_admin_credentials");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migração automática para as credenciais oficiais de Silas Maroto
      if (parsed && (parsed.user === "silas" || parsed.pass === "sfxpro2024")) {
        saveAdminCredentials(DEFAULT_ADMIN_CREDS.user, DEFAULT_ADMIN_CREDS.pass);
        return DEFAULT_ADMIN_CREDS;
      }
      if (parsed && parsed.user && parsed.pass) return parsed;
    }
  } catch (e) {
    console.error("Erro ao ler credenciais salvas:", e);
  }
  return DEFAULT_ADMIN_CREDS;
}

function saveAdminCredentials(user, pass) {
  const creds = { user: user.trim(), pass: pass.trim() };
  localStorage.setItem("sfx_admin_credentials", JSON.stringify(creds));
  return creds;
}

function isAdminAuthenticated() {
  return sessionStorage.getItem("sfx_admin_auth") === "true" ||
         localStorage.getItem("sfx_admin_auth") === "true";
}

function setAdminAuthenticated(remember) {
  if (remember) {
    localStorage.setItem("sfx_admin_auth", "true");
  } else {
    sessionStorage.setItem("sfx_admin_auth", "true");
  }
}

function adminLogout() {
  localStorage.removeItem("sfx_admin_auth");
  sessionStorage.removeItem("sfx_admin_auth");

  const adminWrapper = document.getElementById("adminWrapper");
  const landingWrapper = document.getElementById("landingWrapper");
  const adminLoginModal = document.getElementById("adminLoginModal");

  if (adminLoginModal) adminLoginModal.style.display = "none";
  if (adminWrapper) adminWrapper.style.display = "none";
  if (landingWrapper) landingWrapper.style.display = "block";

  if (window.location.hash === "#admin") {
    history.replaceState(null, null, " ");
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openAdminLoginModal() {
  const modal = document.getElementById("adminLoginModal");
  const errorBox = document.getElementById("adminLoginError");
  const userInput = document.getElementById("adminUsername");
  const passInput = document.getElementById("adminPassword");

  if (errorBox) errorBox.style.display = "none";
  if (passInput) passInput.value = "";
  if (userInput && !userInput.value) {
    const creds = getAdminCredentials();
    userInput.value = creds.user;
  }

  if (modal) {
    modal.style.display = "flex";
    setTimeout(() => {
      if (passInput) passInput.focus();
    }, 100);
  }
}

function closeAdminLoginModal() {
  const modal = document.getElementById("adminLoginModal");
  if (modal) modal.style.display = "none";
  if (window.location.hash === "#admin") {
    history.replaceState(null, null, " ");
  }
}

function initAdminAuth() {
  const loginForm = document.getElementById("adminLoginForm");
  const errorBox = document.getElementById("adminLoginError");
  const errorMsg = document.getElementById("adminLoginErrorMsg");
  const userInput = document.getElementById("adminUsername");
  const passInput = document.getElementById("adminPassword");
  const rememberCheck = document.getElementById("adminRememberMe");
  const btnTogglePwd = document.getElementById("btnToggleAdminPwd");
  const btnCloseModal = document.getElementById("btnCloseAdminLogin");
  const btnCancelLogin = document.getElementById("btnCancelAdminLogin");
  const backdrop = document.getElementById("adminLoginBackdrop");
  const btnLogout = document.getElementById("btnAdminLogout");

  // Alternar visualização da senha
  if (btnTogglePwd && passInput) {
    btnTogglePwd.addEventListener("click", function () {
      if (passInput.type === "password") {
        passInput.type = "text";
        btnTogglePwd.textContent = "🙈";
      } else {
        passInput.type = "password";
        btnTogglePwd.textContent = "👁";
      }
    });
  }

  // Fechar modal
  if (btnCloseModal) btnCloseModal.addEventListener("click", closeAdminLoginModal);
  if (btnCancelLogin) btnCancelLogin.addEventListener("click", closeAdminLoginModal);
  if (backdrop) backdrop.addEventListener("click", closeAdminLoginModal);

  // Botão no rodapé para abrir a Central de Admin
  const btnFooterAdmin = document.getElementById("footerAdminBtn");
  if (btnFooterAdmin) {
    btnFooterAdmin.addEventListener("click", function (e) {
      e.preventDefault();
      if (isAdminAuthenticated()) {
        showAdminView();
      } else {
        openAdminLoginModal();
      }
    });
  }

  // Submissão do login
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const enteredUser = userInput ? userInput.value.trim() : "";
      const enteredPass = passInput ? passInput.value.trim() : "";
      const creds = getAdminCredentials();

      const userMatch = enteredUser.toLowerCase() === creds.user.toLowerCase() ||
                        enteredUser.toLowerCase() === "admin";
      const passMatch = enteredPass === creds.pass;

      if (userMatch && passMatch) {
        if (errorBox) errorBox.style.display = "none";
        setAdminAuthenticated(rememberCheck ? rememberCheck.checked : true);
        if (passInput) passInput.value = "";
        closeAdminLoginModal();
        showAdminView();
      } else {
        if (errorBox) {
          errorBox.style.display = "flex";
          if (errorMsg) {
            errorMsg.textContent = "Credenciais inválidas. Verifique seu usuário ou senha master.";
          }
          errorBox.classList.remove("error");
          void errorBox.offsetWidth; // trigger reflow
          errorBox.classList.add("error");
        }
        if (passInput) {
          passInput.select();
          passInput.focus();
        }
      }
    });
  }

  // Logout
  if (btnLogout) {
    btnLogout.addEventListener("click", function () {
      if (confirm("Deseja realmente sair da Central de Admin?")) {
        adminLogout();
      }
    });
  }

  // Modal de Troca de Senha
  initChangePasswordFeature();
}

function initChangePasswordFeature() {
  const btnOpenChange = document.getElementById("btnChangeAdminPassword");
  const modal = document.getElementById("adminChangePwdModal");
  const backdrop = document.getElementById("adminChangePwdBackdrop");
  const btnClose = document.getElementById("btnCloseChangePwd");
  const form = document.getElementById("adminChangePwdForm");
  const userInput = document.getElementById("newAdminUsername");
  const passInput = document.getElementById("newAdminPassword");
  const successBox = document.getElementById("adminChangePwdSuccess");

  function openModal() {
    const creds = getAdminCredentials();
    if (userInput) userInput.value = creds.user;
    if (passInput) passInput.value = "";
    if (successBox) successBox.style.display = "none";
    if (modal) modal.style.display = "flex";
    setTimeout(() => { if (passInput) passInput.focus(); }, 100);
  }

  function closeModal() {
    if (modal) modal.style.display = "none";
  }

  if (btnOpenChange) btnOpenChange.addEventListener("click", openModal);
  if (btnClose) btnClose.addEventListener("click", closeModal);
  if (backdrop) backdrop.addEventListener("click", closeModal);

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const newUser = userInput ? userInput.value.trim() : "";
      const newPass = passInput ? passInput.value.trim() : "";

      if (!newUser || newPass.length < 4) {
        alert("O usuário é obrigatório e a senha deve ter pelo menos 4 caracteres.");
        return;
      }

      saveAdminCredentials(newUser, newPass);
      if (successBox) successBox.style.display = "flex";

      setTimeout(() => {
        closeModal();
      }, 1200);
    });
  }
}

// ==========================================================================
// 2. ALTERNADOR: LANDING PAGE vs ÁREA DO CLIENTE vs CENTRAL DE ADMIN
// ==========================================================================
function showLandingView() {
  const landingWrapper = document.getElementById("landingWrapper");
  const clientWrapper = document.getElementById("clientWrapper");
  const adminWrapper = document.getElementById("adminWrapper");
  const adminLoginModal = document.getElementById("adminLoginModal");

  if (adminLoginModal) adminLoginModal.style.display = "none";
  if (adminWrapper) adminWrapper.style.display = "none";
  if (clientWrapper) clientWrapper.style.display = "none";
  if (landingWrapper) landingWrapper.style.display = "block";

  if (window.location.hash === "#admin" || window.location.hash.startsWith("#cliente")) {
    history.replaceState(null, null, " ");
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showClientView(emailParam = null) {
  const landingWrapper = document.getElementById("landingWrapper");
  const clientWrapper = document.getElementById("clientWrapper");
  const adminWrapper = document.getElementById("adminWrapper");
  const adminLoginModal = document.getElementById("adminLoginModal");

  if (adminLoginModal) adminLoginModal.style.display = "none";
  if (adminWrapper) adminWrapper.style.display = "none";
  if (landingWrapper) landingWrapper.style.display = "none";
  if (clientWrapper) clientWrapper.style.display = "block";

  if (!window.location.hash.startsWith("#cliente")) {
    window.location.hash = "cliente";
  }
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (emailParam) {
    loginClientByEmail(emailParam);
  } else {
    checkClientSession();
  }
}

function showAdminView() {
  const landingWrapper = document.getElementById("landingWrapper");
  const clientWrapper = document.getElementById("clientWrapper");
  const adminWrapper = document.getElementById("adminWrapper");

  if (landingWrapper) landingWrapper.style.display = "none";
  if (clientWrapper) clientWrapper.style.display = "none";
  if (adminWrapper) adminWrapper.style.display = "block";

  window.location.hash = "admin";
  window.scrollTo({ top: 0, behavior: "smooth" });
  updateKpiMetrics();
  renderLicensesTable();
}

function handleAdminNavigation() {
  if (isAdminAuthenticated()) {
    showAdminView();
  } else {
    showClientView();
    const emailInput = document.getElementById("clientEmailInput");
    const creds = getAdminCredentials();
    if (emailInput) {
      emailInput.value = creds.user || "smmarketingetrafego@gmail.com";
      const grpAdminPassword = document.getElementById("grpAdminPassword");
      const btnSubmitClientText = document.getElementById("btnSubmitClientText");
      const portalAdminPassword = document.getElementById("portalAdminPassword");
      if (grpAdminPassword) grpAdminPassword.style.display = "block";
      if (btnSubmitClientText) btnSubmitClientText.textContent = "Desbloquear Central de Admin 👑";
      if (portalAdminPassword) setTimeout(() => portalAdminPassword.focus(), 150);
    }
  }
}

function handleClientNavigation(email = null) {
  showClientView(email);
}

function parseUrlAndNavigate() {
  const hash = window.location.hash || "";
  const search = window.location.search || "";

  // Checar se há e-mail na URL (ex: #cliente?email=joao@exemplo.com ou ?email=joao@exemplo.com)
  let targetEmail = null;
  const fullUrl = hash + search;
  const match = fullUrl.match(/[?&]email=([^&]+)/);
  if (match && match[1]) {
    targetEmail = decodeURIComponent(match[1]);
  }

  if (hash === "#admin") {
    handleAdminNavigation();
  } else if (hash.startsWith("#cliente") || targetEmail) {
    handleClientNavigation(targetEmail);
  } else {
    showLandingView();
  }
}

function initModeSwitch() {
  const btnReturnLanding = document.getElementById("btnReturnLanding");
  const footerAdminLink = document.getElementById("footerAdminLink");
  const btnNavClientPortal = document.getElementById("btnNavClientPortal");
  const footerClientLink = document.getElementById("footerClientLink");

  if (btnNavClientPortal) {
    btnNavClientPortal.addEventListener("click", function (e) {
      e.preventDefault();
      handleClientNavigation();
    });
  }

  if (footerClientLink) {
    footerClientLink.addEventListener("click", function (e) {
      e.preventDefault();
      handleClientNavigation();
    });
  }

  if (btnReturnLanding) {
    btnReturnLanding.addEventListener("click", function (e) {
      e.preventDefault();
      showLandingView();
    });
  }

  if (footerAdminLink) {
    footerAdminLink.addEventListener("click", function (e) {
      e.preventDefault();
      handleAdminNavigation();
    });
  }

  // Verificação inicial
  parseUrlAndNavigate();

  // Mudança de hash manual no navegador
  window.addEventListener("hashchange", function () {
    parseUrlAndNavigate();
  });
}

// ==========================================================================
// 3. ÁREA DO CLIENTE & PORTAL DO ALUNO SFX PRO
// ==========================================================================
let currentClientSession = null;

function checkClientSession() {
  const loginView = document.getElementById("clientLoginView");
  const dashboardView = document.getElementById("clientDashboardView");

  try {
    const saved = localStorage.getItem("sfx_client_session");
    if (saved) {
      currentClientSession = JSON.parse(saved);
      // Validar se ainda existe na lista de licenças
      const match = licensesData.find(l => 
        (l.email && l.email.toLowerCase() === currentClientSession.email.toLowerCase()) || 
        l.key === currentClientSession.key
      );
      if (match) {
        currentClientSession = match;
      }
      renderClientDashboard(currentClientSession);
      if (loginView) loginView.style.display = "none";
      if (dashboardView) dashboardView.style.display = "block";
      return true;
    }
  } catch (e) {
    console.error("Erro ao ler sessão do cliente:", e);
  }

  // Se não tem sessão, exibe a tela de login/consulta
  if (dashboardView) dashboardView.style.display = "none";
  if (loginView) loginView.style.display = "flex";
  return false;
}

function loginClientByEmail(emailOrKey) {
  const cleanInput = (emailOrKey || "").trim();
  if (!cleanInput) return false;

  const errorBox = document.getElementById("clientLookupError");
  const errorMsg = document.getElementById("clientLookupErrorMsg");
  const loginView = document.getElementById("clientLoginView");
  const dashboardView = document.getElementById("clientDashboardView");

  // Buscar em licensesData
  let found = licensesData.find(l => 
    (l.email && l.email.toLowerCase() === cleanInput.toLowerCase()) ||
    (l.key && l.key.toLowerCase() === cleanInput.toLowerCase())
  );

  // Se não encontrou, mas o e-mail é de teste de Silas ou master
  if (!found && cleanInput.includes("@")) {
    if (cleanInput.toLowerCase() === "smmarketingetrafego@gmail.com" || cleanInput.toLowerCase() === "silasmaroto@gmail.com" || cleanInput.toLowerCase() === "silas@sfxpro.com") {
      found = {
        id: "lic_master",
        name: "Silas Maroto",
        email: cleanInput,
        key: "SFXPRO-SILAS-MAROTO-MASTER-2026",
        hwid: "SFX-97E2-AD3F-C2F5-ED1E",
        plan: "Vitalícia VIP Master",
        created: "12/11/2026",
        status: "active"
      };
      licensesData.unshift(found);
      saveLicensesToStorage();
    }
  }

  if (found) {
    if (found.status === "blocked") {
      if (errorBox) {
        errorBox.style.display = "flex";
        if (errorMsg) errorMsg.textContent = "Esta licença foi suspensa ou reembolsada. Entre em contato com o suporte.";
      }
      return false;
    }

    currentClientSession = found;
    localStorage.setItem("sfx_client_session", JSON.stringify(found));
    if (errorBox) errorBox.style.display = "none";

    renderClientDashboard(found);
    if (loginView) loginView.style.display = "none";
    if (dashboardView) dashboardView.style.display = "block";
    return true;
  } else {
    if (errorBox) {
      errorBox.style.display = "flex";
      if (errorMsg) {
        errorMsg.textContent = "E-mail não localizado na base Kiwify. Verifique a digitação ou digite a Chave de Licença recebida.";
      }
    }
    return false;
  }
}

function renderClientDashboard(client) {
  const nameEl = document.getElementById("clientNameDisplay");
  const keyEl = document.getElementById("clientLicenseKeyDisplay");
  const planEl = document.getElementById("clientPlanDisplay");
  const dateEl = document.getElementById("clientDateDisplay");
  const hwidEl = document.getElementById("clientHwidDisplay");

  if (nameEl) nameEl.textContent = client.name || "Cliente SFX PRO";
  if (keyEl) keyEl.textContent = client.key || "SFXPRO-PENDENTE";
  if (planEl) planEl.textContent = client.plan || "Vitalícia Completa";
  if (dateEl) dateEl.textContent = client.created || "Ativo";

  if (hwidEl) {
    if (client.hwid && client.hwid.trim()) {
      hwidEl.innerHTML = '<span style="color: #38bdf8; font-family: monospace;">● Vinculado: ' + escapeHtml(client.hwid) + '</span>';
    } else {
      hwidEl.innerHTML = '<span style="color: #34d399;">● Nenhum (Pronto para Ativar no Premiere)</span>';
    }
  }
}

function clientLogout() {
  localStorage.removeItem("sfx_client_session");
  currentClientSession = null;
  const loginView = document.getElementById("clientLoginView");
  const dashboardView = document.getElementById("clientDashboardView");
  if (dashboardView) dashboardView.style.display = "none";
  if (loginView) loginView.style.display = "flex";
  const emailInput = document.getElementById("clientEmailInput");
  if (emailInput) {
    emailInput.value = "";
    emailInput.focus();
  }
}

function getClientDownloadTarget(type) {
  const gdriveFolder = (localStorage.getItem("sfxpro_gdrive_folder") || "").trim();
  const gdriveMac = (localStorage.getItem("sfxpro_gdrive_mac") || "").trim();
  const gdriveWin = (localStorage.getItem("sfxpro_gdrive_win") || "").trim();
  const gdriveSfx = (localStorage.getItem("sfxpro_gdrive_sfx") || "").trim();

  let targetUrl = "";
  let filename = "";
  let title = "";

  if (type === "mac") {
    title = "Instalador SFX PRO Studio para macOS (Extensão + Sons)";
    filename = "SFX_PRO_Studio_Mac_v2.4_Instalador.zip";
    targetUrl = gdriveMac || gdriveFolder || "downloads/SFX_PRO_Studio_Mac_v2.4_Instalador.zip";
  } else if (type === "win") {
    title = "Instalador SFX PRO Studio para Windows (Extensão + Sons)";
    filename = "SFX_PRO_Studio_Windows_v2.4_Instalador.zip";
    targetUrl = gdriveWin || gdriveFolder || "downloads/SFX_PRO_Studio_Windows_v2.4_Instalador.zip";
  } else if (type === "sfx") {
    title = "Super Pacote +2.000 SFX (69 Categorias Master)";
    filename = "SFX_PRO_Super_Pacote_2000_SFX.zip";
    targetUrl = gdriveSfx || gdriveFolder || "downloads/SFX_PRO_Super_Pacote_2000_SFX.zip";
  }

  return { targetUrl, filename, title };
}

function triggerClientDownload(type) {
  const info = getClientDownloadTarget(type);
  const isExternal = info.targetUrl.startsWith("http://") || info.targetUrl.startsWith("https://");
  const isGoogleDrive = info.targetUrl.indexOf("drive.google.com") !== -1;

  if (isExternal) {
    window.open(info.targetUrl, "_blank");

    if (isGoogleDrive) {
      alert("🎉 Abrindo download seguro no Google Drive!\n\n" +
            info.title + "\n\n" +
            "✔ O arquivo já contém a extensão oficial e todos os 2.310 sons inclusos!\n" +
            "✔ No Google Drive, clique no botão 'Fazer download' no canto superior direito.\n" +
            "✔ Lembre-se de copiar a sua Chave de Ativação aqui na sua Área do Cliente!");
    } else {
      alert("🎉 Redirecionando para download seguro:\n\n" + info.title);
    }
  } else {
    const a = document.createElement("a");
    a.href = info.targetUrl;
    a.setAttribute("download", info.filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    alert("🎉 Download Iniciado com Sucesso!\n\n" +
          "Arquivo: " + info.filename + "\n" +
          info.title + "\n\n" +
          "✔ O pacote já contém a extensão oficial e o acervo completo de sons!\n" +
          "✔ Descompacte o arquivo e execute o instalador em 1 clique.\n" +
          "✔ Lembre-se de copiar a sua Chave de Ativação aqui na sua Área do Cliente!");
  }
}

function isAdminIdentifier(val) {
  if (!val) return false;
  const clean = val.trim().toLowerCase();
  const creds = getAdminCredentials();
  const adminUser = (creds.user || "smmarketingetrafego@gmail.com").toLowerCase();

  return clean === adminUser ||
         clean === "smmarketingetrafego@gmail.com" ||
         clean === "silasmaroto@gmail.com" ||
         clean === "silas@sfxpro.com" ||
         clean === "silas" ||
         clean === "admin";
}

function initClientPortal() {
  const lookupForm = document.getElementById("clientLookupForm");
  const emailInput = document.getElementById("clientEmailInput");
  const grpAdminPassword = document.getElementById("grpAdminPassword");
  const portalAdminPassword = document.getElementById("portalAdminPassword");
  const btnTogglePortalAdminPwd = document.getElementById("btnTogglePortalAdminPwd");
  const btnSubmitClientText = document.getElementById("btnSubmitClientText");
  const btnReturnLanding = document.getElementById("btnReturnLandingFromClient");
  const btnBackToSite = document.getElementById("btnClientBackToSite");
  const btnLogout = document.getElementById("btnClientLogout");
  const btnCopyKey = document.getElementById("btnClientCopyKey");
  const copyKeyText = document.getElementById("copyKeyBtnText");
  const btnResetHwid = document.getElementById("btnClientResetHwid");
  const btnAdminViewClientArea = document.getElementById("btnAdminViewClientArea");
  const dlButtons = document.querySelectorAll(".btn-dl-action");

  function checkAdminInputTrigger() {
    const val = emailInput ? emailInput.value.trim() : "";
    if (isAdminIdentifier(val)) {
      if (isAdminAuthenticated()) {
        if (grpAdminPassword) grpAdminPassword.style.display = "none";
        if (btnSubmitClientText) btnSubmitClientText.textContent = "Abrir Central de Admin 👑";
      } else {
        if (grpAdminPassword) grpAdminPassword.style.display = "block";
        if (btnSubmitClientText) btnSubmitClientText.textContent = "Desbloquear Central de Admin 👑";
      }
    } else {
      if (grpAdminPassword) grpAdminPassword.style.display = "none";
      if (btnSubmitClientText) btnSubmitClientText.textContent = "Acessar Meus Downloads e Chave";
    }
  }

  if (emailInput) {
    emailInput.addEventListener("input", checkAdminInputTrigger);
    emailInput.addEventListener("blur", checkAdminInputTrigger);
  }

  if (btnTogglePortalAdminPwd && portalAdminPassword) {
    btnTogglePortalAdminPwd.addEventListener("click", function () {
      if (portalAdminPassword.type === "password") {
        portalAdminPassword.type = "text";
        btnTogglePortalAdminPwd.textContent = "🙈";
      } else {
        portalAdminPassword.type = "password";
        btnTogglePortalAdminPwd.textContent = "👁";
      }
    });
  }

  // Submissão unificada de login (Cliente ou Silas Admin)
  if (lookupForm) {
    lookupForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const val = emailInput ? emailInput.value.trim() : "";
      const pass = portalAdminPassword ? portalAdminPassword.value.trim() : "";
      const errorBox = document.getElementById("clientLookupError");
      const errorMsg = document.getElementById("clientLookupErrorMsg");

      if (isAdminIdentifier(val)) {
        if (isAdminAuthenticated()) {
          showAdminView();
          return;
        }

        if (grpAdminPassword && grpAdminPassword.style.display === "none") {
          grpAdminPassword.style.display = "block";
          if (btnSubmitClientText) btnSubmitClientText.textContent = "Desbloquear Central de Admin 👑";
          if (portalAdminPassword) portalAdminPassword.focus();
          return;
        }

        // Validação da senha master de Silas
        const creds = getAdminCredentials();
        if (pass === creds.pass) {
          setAdminAuthenticated(true);
          if (errorBox) errorBox.style.display = "none";
          if (portalAdminPassword) portalAdminPassword.value = "";
          showAdminView();
        } else {
          if (errorBox) {
            errorBox.style.display = "flex";
            if (errorMsg) errorMsg.textContent = "Senha master de administrador incorreta.";
            errorBox.classList.remove("error");
            void errorBox.offsetWidth;
            errorBox.classList.add("error");
          }
          if (portalAdminPassword) {
            portalAdminPassword.select();
            portalAdminPassword.focus();
          }
        }
        return;
      }

      // Login normal de cliente
      loginClientByEmail(val);
    });
  }

  // Botão na Central de Admin para ver a Área do Cliente
  if (btnAdminViewClientArea) {
    btnAdminViewClientArea.addEventListener("click", function () {
      loginClientByEmail("smmarketingetrafego@gmail.com");
      showClientView();
    });
  }

  // Retornar ao site
  if (btnReturnLanding) {
    btnReturnLanding.addEventListener("click", showLandingView);
  }
  if (btnBackToSite) {
    btnBackToSite.addEventListener("click", showLandingView);
  }

  // Logout do cliente
  if (btnLogout) {
    btnLogout.addEventListener("click", function () {
      if (confirm("Deseja desconectar da sua Área do Cliente?")) {
        clientLogout();
      }
    });
  }

  // Copiar chave de licença
  if (btnCopyKey) {
    btnCopyKey.addEventListener("click", function () {
      if (!currentClientSession || !currentClientSession.key) return;
      navigator.clipboard.writeText(currentClientSession.key).then(() => {
        if (copyKeyText) copyKeyText.textContent = "✓ Copiado!";
        btnCopyKey.classList.add("btn-success");
        setTimeout(() => {
          if (copyKeyText) copyKeyText.textContent = "Copiar Chave";
          btnCopyKey.classList.remove("btn-success");
        }, 2000);
      }).catch(err => {
        prompt("Copie sua chave de licença:", currentClientSession.key);
      });
    });
  }

  // Troca de Computador (Reset HWID) pelo próprio cliente
  if (btnResetHwid) {
    btnResetHwid.addEventListener("click", function () {
      if (!currentClientSession) return;

      const confirmMsg = "Deseja liberar sua chave para ativar em um novo computador?\n\nIsso removerá a vinculação com a máquina anterior no Premiere Pro.";
      if (confirm(confirmMsg)) {
        const target = licensesData.find(l => l.id === currentClientSession.id || l.key === currentClientSession.key);
        if (target) {
          target.hwid = "";
          saveLicensesToStorage();
        }
        currentClientSession.hwid = "";
        localStorage.setItem("sfx_client_session", JSON.stringify(currentClientSession));
        renderClientDashboard(currentClientSession);

        alert("Computador desvinculado com sucesso!\n\nSua chave agora está livre para ser ativada na sua nova máquina no Premiere Pro.");
      }
    });
  }

  // Botões de download
  dlButtons.forEach(btn => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const dlType = btn.dataset.download;
      triggerClientDownload(dlType);
    });
  });
}

// Sub-abas dentro da Central de Admin
function initAdminSubtabs() {
  const subtabBtns = document.querySelectorAll(".admin-subtab-btn");
  const subviews = document.querySelectorAll(".admin-subview");

  subtabBtns.forEach(btn => {
    btn.addEventListener("click", function () {
      const target = btn.dataset.subview;
      subtabBtns.forEach(b => b.classList.remove("active"));
      subviews.forEach(v => v.classList.remove("active"));

      btn.classList.add("active");
      const activeSub = document.getElementById("subview-" + target);
      if (activeSub) activeSub.classList.add("active");
    });
  });
}

// Gerenciador de Links de Download do Google Drive
function initGdriveDownloadsManager() {
  const gdriveMac = document.getElementById("gdriveMacInput");
  const gdriveWin = document.getElementById("gdriveWinInput");
  const gdriveSfx = document.getElementById("gdriveSfxInput");
  const gdriveFolder = document.getElementById("gdriveFolderInput");
  const btnSave = document.getElementById("btnSaveGdriveLinks");
  const btnReset = document.getElementById("btnResetGdriveLinks");
  const feedback = document.getElementById("gdriveSaveFeedback");

  if (!btnSave) return;

  // Carregar valores atualmente salvos
  if (gdriveMac) gdriveMac.value = localStorage.getItem("sfxpro_gdrive_mac") || "";
  if (gdriveWin) gdriveWin.value = localStorage.getItem("sfxpro_gdrive_win") || "";
  if (gdriveSfx) gdriveSfx.value = localStorage.getItem("sfxpro_gdrive_sfx") || "";
  if (gdriveFolder) gdriveFolder.value = localStorage.getItem("sfxpro_gdrive_folder") || "";

  btnSave.addEventListener("click", function () {
    if (gdriveMac) localStorage.setItem("sfxpro_gdrive_mac", gdriveMac.value.trim());
    if (gdriveWin) localStorage.setItem("sfxpro_gdrive_win", gdriveWin.value.trim());
    if (gdriveSfx) localStorage.setItem("sfxpro_gdrive_sfx", gdriveSfx.value.trim());
    if (gdriveFolder) localStorage.setItem("sfxpro_gdrive_folder", gdriveFolder.value.trim());

    if (feedback) {
      feedback.style.display = "block";
      setTimeout(function () {
        feedback.style.display = "none";
      }, 4000);
    }
  });

  if (btnReset) {
    btnReset.addEventListener("click", function () {
      if (confirm("Deseja restaurar os links de download padrão para os arquivos locais da pasta /downloads?")) {
        localStorage.removeItem("sfxpro_gdrive_mac");
        localStorage.removeItem("sfxpro_gdrive_win");
        localStorage.removeItem("sfxpro_gdrive_sfx");
        localStorage.removeItem("sfxpro_gdrive_folder");

        if (gdriveMac) gdriveMac.value = "";
        if (gdriveWin) gdriveWin.value = "";
        if (gdriveSfx) gdriveSfx.value = "";
        if (gdriveFolder) gdriveFolder.value = "";

        alert("Padrão local restaurado com sucesso! Os botões voltarão a baixar direto da pasta /downloads.");
      }
    });
  }
}

// Gerenciador do Link de Checkout Kiwify
function applyKiwifyCheckoutLinks() {
  const savedUrl = localStorage.getItem("sfxpro_kiwify_checkout");
  if (!savedUrl) return;
  document.querySelectorAll('a[href*="pay.kiwify.com.br"]').forEach(a => {
    a.href = savedUrl;
  });
}

function initKiwifyCheckoutManager() {
  const input = document.getElementById("kiwifyCheckoutInput");
  const btnSave = document.getElementById("btnSaveKiwifyCheckout");
  const msg = document.getElementById("kiwifyCheckoutSavedMsg");

  applyKiwifyCheckoutLinks();

  if (input) {
    input.value = localStorage.getItem("sfxpro_kiwify_checkout") || "";
  }

  if (btnSave && input) {
    btnSave.addEventListener("click", function () {
      const val = input.value.trim();
      if (val) {
        localStorage.setItem("sfxpro_kiwify_checkout", val);
      } else {
        localStorage.removeItem("sfxpro_kiwify_checkout");
      }
      applyKiwifyCheckoutLinks();
      if (msg) {
        msg.style.display = "inline";
        setTimeout(() => { msg.style.display = "none"; }, 3500);
      }
      showToast("Link de Checkout Kiwify atualizado no site!");
    });
  }
}

// ==========================================================================
// 2. GESTÃO DE LICENÇAS (STORE, CRUD & FILTROS)
// ==========================================================================
function initLicensesStore() {
  const stored = localStorage.getItem("sfxpro_admin_licenses");
  if (stored) {
    try {
      licensesData = JSON.parse(stored);
    } catch (e) {
      licensesData = [];
    }
  }

  if (!licensesData || licensesData.length === 0) {
    licensesData = [
      {
        id: "lic_1",
        name: "Silas Maroto (Master)",
        email: "smmarketingetrafego@gmail.com",
        key: "SFXPRO-SILAS-MAROTO-MASTER-2026",
        hwid: "SFX-97E2-AD3F-C2F5-ED1E",
        plan: "Vitalícia VIP Master",
        created: "12/11/2026",
        status: "active"
      },
      {
        id: "lic_2",
        name: "Lucas Menezes",
        email: "lucas.motion@gmail.com",
        key: generateRandomKey(),
        hwid: "SFX-A81B-4402-99CD-11FE",
        plan: "Vitalícia Kiwify",
        created: "12/11/2026",
        status: "active"
      },
      {
        id: "lic_3",
        name: "Rodrigo Ferreira",
        email: "rodrigo.cortes@outlook.com",
        key: generateRandomKey(),
        hwid: "SFX-5531-E08A-3382-77BA",
        plan: "Vitalícia Kiwify",
        created: "11/11/2026",
        status: "active"
      }
    ];
    saveLicenses();
  }

  renderLicensesTable();
  updateKpiMetrics();

  const searchInput = document.getElementById("adminSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      searchQuery = e.target.value.trim().toLowerCase();
      renderLicensesTable();
    });
  }

  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", function () {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.status;
      renderLicensesTable();
    });
  });

  const btnExport = document.getElementById("btnExportBackup");
  if (btnExport) btnExport.addEventListener("click", exportBackupJson);

  const importInput = document.getElementById("importFileInput");
  if (importInput) importInput.addEventListener("change", importBackupJson);
}

function saveLicenses() {
  localStorage.setItem("sfxpro_admin_licenses", JSON.stringify(licensesData));
  updateKpiMetrics();
}

function updateKpiMetrics() {
  const totalEl = document.getElementById("kpiTotal");
  const activeEl = document.getElementById("kpiActive");
  const blockedEl = document.getElementById("kpiBlocked");
  const hwidEl = document.getElementById("kpiHwid");

  const total = licensesData.length;
  const active = licensesData.filter(l => l.status === "active").length;
  const blocked = licensesData.filter(l => l.status === "blocked").length;
  const bound = licensesData.filter(l => l.hwid && l.hwid !== "").length;

  if (totalEl) totalEl.textContent = total;
  if (activeEl) activeEl.textContent = active;
  if (blockedEl) blockedEl.textContent = blocked;
  if (hwidEl) hwidEl.textContent = bound;
}

function renderLicensesTable() {
  const tbody = document.getElementById("licensesTableBody");
  if (!tbody) return;

  const filtered = licensesData.filter(item => {
    if (activeFilter === "active" && item.status !== "active") return false;
    if (activeFilter === "blocked" && item.status !== "blocked") return false;

    if (searchQuery) {
      const matchName = item.name.toLowerCase().includes(searchQuery);
      const matchEmail = item.email.toLowerCase().includes(searchQuery);
      const matchKey = item.key.toLowerCase().includes(searchQuery);
      const matchHwid = (item.hwid || "").toLowerCase().includes(searchQuery);
      return matchName || matchEmail || matchKey || matchHwid;
    }
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">Nenhuma licença encontrada.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(lic => {
    const isAct = lic.status === "active";
    const statusHtml = isAct 
      ? `<span class="status-badge active">● Ativa</span>` 
      : `<span class="status-badge blocked">✕ Bloqueada</span>`;

    const hwidTxt = lic.hwid 
      ? `<span class="hwid-pill">${lic.hwid}</span>` 
      : `<span style="color:var(--text-muted); font-size:0.75rem;">Livre (Aguardando ativação)</span>`;

    return `
      <tr>
        <td>
          <strong style="display:block; font-size:0.9rem;">${escapeHtml(lic.name)}</strong>
          <span style="font-size:0.75rem; color:var(--text-secondary);">${escapeHtml(lic.email)}</span>
        </td>
        <td>
          <span class="key-pill" title="Clique para copiar" onclick="copyToClipboard('${lic.key}')">
            ${lic.key} 📋
          </span>
        </td>
        <td>${hwidTxt}</td>
        <td>${statusHtml}</td>
        <td style="font-size:0.75rem; color:var(--text-muted);">${lic.created}</td>
        <td>
          <div class="row-actions">
            <button class="btn-icon" title="Copiar Mensagem de Entrega" onclick="copyClientMessage('${lic.id}')">💬</button>
            <button class="btn-icon" title="Resetar Computador (HWID)" onclick="resetLicenseHwid('${lic.id}')">🔄</button>
            <button class="btn-icon" title="${isAct ? 'Bloquear Licença' : 'Desbloquear Licença'}" onclick="toggleLicenseStatus('${lic.id}')">
              ${isAct ? '🔒' : '🔓'}
            </button>
            <button class="btn-icon" style="color:#ef4444;" title="Excluir Licença" onclick="deleteLicense('${lic.id}')">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function toggleLicenseStatus(id) {
  const lic = licensesData.find(l => l.id === id);
  if (!lic) return;
  lic.status = lic.status === "active" ? "blocked" : "active";
  saveLicenses();
  renderLicensesTable();
  showToast(`Licença de ${lic.name} ${lic.status === "active" ? "ativada" : "bloqueada"}!`);
}

function resetLicenseHwid(id) {
  const lic = licensesData.find(l => l.id === id);
  if (!lic) return;
  if (confirm(`Deseja desvincular o computador (HWID) de ${lic.name}? O cliente poderá ativar em um novo PC.`)) {
    lic.hwid = "";
    saveLicenses();
    renderLicensesTable();
    showToast(`HWID de ${lic.name} liberado com sucesso!`);
  }
}

function deleteLicense(id) {
  const idx = licensesData.findIndex(l => l.id === id);
  if (idx === -1) return;
  const name = licensesData[idx].name;
  if (confirm(`Tem certeza que deseja excluir a licença de "${name}"?`)) {
    licensesData.splice(idx, 1);
    saveLicenses();
    renderLicensesTable();
    showToast(`Licença de ${name} excluída!`);
  }
}

function copyClientMessage(id) {
  const lic = licensesData.find(l => l.id === id);
  if (!lic) return;
  const msg = `Olá ${lic.name}!\n\n` +
    `Aqui está sua licença vitalícia do SFX PRO para Adobe Premiere Pro:\n\n` +
    `🔑 CHAVE: ${lic.key}\n` +
    `📦 PACOTE: + de 2.000 Efeitos Sonoros Inclusos\n\n` +
    `Instruções de Ativação:\n` +
    `1. Abra o Premiere Pro > Janela > Extensões > SFX PRO\n` +
    `2. Cole sua chave no campo de ativação e clique em "Ativar Licença".\n\n` +
    `Bons cortes! 🎬`;

  copyToClipboard(msg);
  showToast("Mensagem copiada para o WhatsApp!");
}

// ==========================================================================
// 3. GERADOR RÁPIDO ONLINE & NOVO CLIENTE
// ==========================================================================
function initQuickGenerator() {
  const btnCreate = document.getElementById("btnCreateLicense");
  if (!btnCreate) return;

  btnCreate.addEventListener("click", function () {
    const nameInput = document.getElementById("newClientName");
    const emailInput = document.getElementById("newClientEmail");
    const planSelect = document.getElementById("newClientPlan");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const plan = planSelect ? planSelect.value : "Vitalícia Kiwify";

    if (!name || !email) {
      alert("Por favor, preencha o Nome e o E-mail do cliente.");
      return;
    }

    const newKey = generateRandomKey();
    const today = new Date().toLocaleDateString("pt-BR");

    const newLic = {
      id: "lic_" + Date.now(),
      name: name,
      email: email,
      key: newKey,
      hwid: "",
      plan: plan,
      created: today,
      status: "active"
    };

    licensesData.unshift(newLic);
    saveLicenses();
    renderLicensesTable();

    const resBox = document.getElementById("quickKeyResult");
    const displayKey = document.getElementById("displayGeneratedKey");
    if (resBox && displayKey) {
      displayKey.textContent = newKey;
      resBox.style.display = "flex";
    }

    nameInput.value = "";
    emailInput.value = "";
    showToast(`Licença criada para ${name}!`);
  });
}

// ==========================================================================
// 4. GERADOR OFFLINE POR HWID
// ==========================================================================
function initOfflineHwidGenerator() {
  const btnGen = document.getElementById("btnGenOfflineKey");
  const hwidInput = document.getElementById("offlineHwidInput");
  const offlineResult = document.getElementById("offlineKeyResult");
  const offlineKeyDisplay = document.getElementById("offlineKeyDisplay");

  if (!btnGen || !hwidInput) return;

  btnGen.addEventListener("click", async function () {
    const hwid = hwidInput.value.trim();
    if (!hwid) {
      alert("Insira o HWID do cliente (ex: SFX-97E2-AD3F-C2F5-ED1E)");
      return;
    }

    const key = await generateOfflineKeyFromHwid(hwid);
    if (offlineKeyDisplay && offlineResult) {
      offlineKeyDisplay.textContent = key;
      offlineResult.style.display = "flex";
    }
    showToast("Chave Offline calculada com sucesso!");
  });
}

async function generateOfflineKeyFromHwid(hwid) {
  let clean = hwid.trim().toUpperCase().replace(/\s+/g, "");
  if (clean.startsWith("SFX-")) clean = clean.substring(4);
  clean = "SFX-" + clean;
  const msg = "SFX_HWID:" + clean;

  try {
    const enc = new TextEncoder();
    const keyData = enc.encode(SECRET_SALT);
    const msgData = enc.encode(msg);
    const cryptoKey = await crypto.subtle.importKey(
      "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
    const hashArray = Array.from(new Uint8Array(sig));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
    const sig16 = hashHex.substring(0, 16);
    return `SFXPRO-${sig16.substring(0, 4)}-${sig16.substring(4, 8)}-${sig16.substring(8, 12)}-${sig16.substring(12, 16)}`;
  } catch (e) {
    let h = 0x811c9dc5;
    for (let i = 0; i < msg.length; i++) {
      h ^= msg.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    const hex = (h >>> 0).toString(16).toUpperCase().padStart(8, "0");
    return `SFXPRO-${hex.substring(0, 4)}-${hex.substring(4, 8)}-ABCD-9999`;
  }
}

function generateRandomKey() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const b = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `SFXPRO-${b()}-${b()}-${b()}-${b()}`;
}

function exportBackupJson() {
  const jsonStr = JSON.stringify(licensesData, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sfx_pro_licencas_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Backup baixado!");
}

function importBackupJson(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (ev) {
    try {
      const data = JSON.parse(ev.target.result);
      if (Array.isArray(data)) {
        licensesData = data;
        saveLicenses();
        renderLicensesTable();
        showToast(`${data.length} licenças restauradas do backup!`);
      } else {
        alert("Formato inválido.");
      }
    } catch (err) {
      alert("Erro ao ler JSON.");
    }
  };
  reader.readAsText(file);
}

// ==========================================================================
// 5. DEMONSTRAÇÃO WEB AUDIO (SOUNDBOARD & SÍNTESE ACÚSTICA)
// ==========================================================================
let _sharedAudioCtx = null;

function getSharedAudioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!_sharedAudioCtx) _sharedAudioCtx = new AudioContext();
  if (_sharedAudioCtx.state === "suspended") _sharedAudioCtx.resume();
  return _sharedAudioCtx;
}

function playWhoosh(audio, now) {
  const size = audio.sampleRate * 0.4;
  const buf = audio.createBuffer(1, size, audio.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < size; i++) d[i] = Math.random() * 2 - 1;
  const src = audio.createBufferSource();
  src.buffer = buf;
  const f = audio.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.setValueAtTime(200, now);
  f.frequency.exponentialRampToValueAtTime(3000, now + 0.16);
  f.frequency.exponentialRampToValueAtTime(200, now + 0.38);
  const g = audio.createGain();
  g.gain.setValueAtTime(0.01, now);
  g.gain.linearRampToValueAtTime(0.8, now + 0.16);
  g.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
  src.connect(f); f.connect(g); g.connect(audio.destination);
  src.start(now); src.stop(now + 0.4);
}

function playBoom(audio, now) {
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.frequency.setValueAtTime(130, now);
  osc.frequency.exponentialRampToValueAtTime(32, now + 0.6);
  g.gain.setValueAtTime(0.9, now);
  g.gain.exponentialRampToValueAtTime(0.01, now + 0.65);
  osc.connect(g); g.connect(audio.destination);
  osc.start(now); osc.stop(now + 0.65);
}

function playPop(audio, now) {
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.frequency.setValueAtTime(450, now);
  osc.frequency.exponentialRampToValueAtTime(950, now + 0.08);
  g.gain.setValueAtTime(0.7, now);
  g.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
  osc.connect(g); g.connect(audio.destination);
  osc.start(now); osc.stop(now + 0.1);
}

function playClick(audio, now) {
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(1600, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);
  g.gain.setValueAtTime(0.6, now);
  g.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
  osc.connect(g); g.connect(audio.destination);
  osc.start(now); osc.stop(now + 0.05);
}

function playRiser(audio, now) {
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.exponentialRampToValueAtTime(1100, now + 0.55);
  g.gain.setValueAtTime(0.05, now);
  g.gain.linearRampToValueAtTime(0.5, now + 0.5);
  g.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
  osc.connect(g); g.connect(audio.destination);
  osc.start(now); osc.stop(now + 0.6);
}

function playGlitch(audio, now) {
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.setValueAtTime(300, now + 0.04);
  osc.frequency.setValueAtTime(1300, now + 0.08);
  g.gain.setValueAtTime(0.4, now);
  g.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
  osc.connect(g); g.connect(audio.destination);
  osc.start(now); osc.stop(now + 0.15);
}

function playSynthesizedSound(snd) {
  try {
    const audio = getSharedAudioContext();
    const now = audio.currentTime;
    if (snd === "whoosh") playWhoosh(audio, now);
    else if (snd === "boom") playBoom(audio, now);
    else if (snd === "pop") playPop(audio, now);
    else if (snd === "click") playClick(audio, now);
    else if (snd === "riser") playRiser(audio, now);
    else playGlitch(audio, now);
  } catch (e) {
    console.warn("Áudio não pôde ser reproduzido automaticamente:", e);
  }
}

function initWebAudioSoundboard() {
  const cards = document.querySelectorAll(".sound-card");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      const snd = card.dataset.sound;
      cards.forEach(c => c.classList.remove("playing"));
      card.classList.add("playing");
      playSynthesizedSound(snd);
      setTimeout(() => card.classList.remove("playing"), 600);
    });
  });
}

// ==========================================================================
// 6. SIMULADOR DO AUTO SFX INTELIGENTE (5 PILARES DE IA)
// ==========================================================================
const SIMULATOR_PRESETS_DATA = {
  dynamic: {
    title: "⚡ Dinâmico & Comercial",
    summary: "Equilíbrio perfeito para vídeos do YouTube, comerciais e cortes dinâmicos.",
    cuts: [
      {
        tc: "00:00:02:14",
        badge: "⚡ Pacing Rápido 0.8s",
        tagClass: "pacing",
        name: "Fast Swish 04",
        track: "Trilha A2",
        preRoll: "Pico -90ms",
        sound: "whoosh",
        note: "Corte rápido adaptado com swish curto para não poluir."
      },
      {
        tc: "00:00:06:02",
        badge: "🧠 Marcador [ZOOM]",
        tagClass: "semantic",
        name: "Whoosh Clean Fast 02",
        track: "Trilha A2",
        preRoll: "Pico -160ms",
        sound: "whoosh",
        note: "Palavra-chave ZOOM identificada no marcador da timeline."
      },
      {
        tc: "00:00:10:18",
        badge: "🎚️ Camada Dupla A2 + A3",
        tagClass: "layer",
        name: "Epic Cinema Hit + Sub Boom",
        track: "Trilhas A2 & A3",
        preRoll: "Alinhamento -20ms",
        sound: "boom",
        note: "Impacto no corte com camada dupla (A2 Whoosh + A3 Sub)."
      },
      {
        tc: "00:00:14:20",
        badge: "🎙️ Diálogo na A1 (Ducking)",
        tagClass: "ducking",
        name: "Pop Minimalist UI",
        track: "Trilha A2",
        preRoll: "Ducking -6dB",
        sound: "pop",
        note: "Fala ativa na A1: som inserido atenuado para preservar a voz."
      }
    ]
  },
  viral: {
    title: "🔥 Viral Fast (Reels & TikTok)",
    summary: "Pacing acelerado, micro-whooshes, efeitos de memes e UI pops de alta retenção.",
    cuts: [
      {
        tc: "00:00:00:22",
        badge: "⚡ Pacing Ultra 0.4s",
        tagClass: "pacing",
        name: "Micro Snap Whoosh 01",
        track: "Trilha A2",
        preRoll: "Pico -80ms",
        sound: "whoosh",
        note: "Cena ultra-curta: micro-whoosh de 180ms evita fadiga auditiva."
      },
      {
        tc: "00:00:02:15",
        badge: "🧠 Clipe [MEME]",
        tagClass: "semantic",
        name: "Cartoon Boing / Vinyl Scratch",
        track: "Trilha A2",
        preRoll: "Frame 0ms",
        sound: "glitch",
        note: "Nome do clipe com tag MEME mapeado para família cômica."
      },
      {
        tc: "00:00:04:10",
        badge: "🧠 Marcador [TEXTO]",
        tagClass: "semantic",
        name: "Keyboard Pop Clean",
        track: "Trilha A2",
        preRoll: "Frame 0ms",
        sound: "click",
        note: "Marcador de lettering com pop sutil e elegante."
      },
      {
        tc: "00:00:07:05",
        badge: "🎚️ Camada Dupla A2 + A3",
        tagClass: "layer",
        name: "Bass Drop Punch + Sub Low",
        track: "Trilhas A2 & A3",
        preRoll: "Pico -20ms",
        sound: "boom",
        note: "Drop viral potente sem distorcer o áudio do clipe."
      }
    ]
  },
  cinematic: {
    title: "🎬 Cinema & Trailer Épico",
    summary: "Sub booms profundos, risers sincronizados e atmosfera imersiva de alta escala.",
    cuts: [
      {
        tc: "00:00:03:00",
        badge: "🧠 Marcador [RISER]",
        tagClass: "semantic",
        name: "Dark Tension Riser 03",
        track: "Trilha A2",
        preRoll: "Pre-roll -800ms",
        sound: "riser",
        note: "Riser iniciado exatamente 800ms antes do corte épico."
      },
      {
        tc: "00:00:05:12",
        badge: "🎚️ Camada Dupla Clímax",
        tagClass: "layer",
        name: "Cinema Trailer Hit + Earth Boom",
        track: "Trilhas A2 & A3",
        preRoll: "Pico -20ms",
        sound: "boom",
        note: "Dupla camada master: trailer hit agudo na A2 e sub na A3."
      },
      {
        tc: "00:00:09:20",
        badge: "⏳ Pacing Longo 4.5s",
        tagClass: "pacing",
        name: "Deep Drone Atmosphere",
        track: "Trilha A2",
        preRoll: "Fade in/out",
        sound: "whoosh",
        note: "Tomada longa: preenchimento textural contínuo sem cortes secos."
      },
      {
        tc: "00:00:15:00",
        badge: "🧠 Marcador [TRANSIÇÃO]",
        tagClass: "semantic",
        name: "Cinema Dark Swish",
        track: "Trilha A2",
        preRoll: "Pico -160ms",
        sound: "whoosh",
        note: "Swish escuro clássico de cinema para troca de ambiente."
      }
    ]
  },
  documentary: {
    title: "🕵️ Documentário & VSL",
    summary: "Foley realista, batimentos de suspense e respeito total à narração principal.",
    cuts: [
      {
        tc: "00:00:02:10",
        badge: "🧠 Clipe [FOLEY]",
        tagClass: "semantic",
        name: "Paper Document Shuffle",
        track: "Trilha A2",
        preRoll: "Frame 0ms",
        sound: "click",
        note: "Clipe de B-Roll documental enriquecido com foley realista."
      },
      {
        tc: "00:00:06:00",
        badge: "🧠 Marcador [CORAÇÃO]",
        tagClass: "semantic",
        name: "Sub Heartbeat Tension Pulse",
        track: "Trilha A2",
        preRoll: "Frame 0ms",
        sound: "boom",
        note: "Marcador de suspense: pulsação sub-grave que prende a atenção."
      },
      {
        tc: "00:00:09:22",
        badge: "🎙️ Narração na A1 (Ducking)",
        tagClass: "ducking",
        name: "Soft Subtle Swish",
        track: "Trilha A2",
        preRoll: "Ducking -6dB",
        sound: "whoosh",
        note: "Voz detectada no frame exato: ganho reduzido em -6dB."
      },
      {
        tc: "00:00:13:00",
        badge: "🎚️ Camada Dupla Revelação",
        tagClass: "layer",
        name: "Brass Swell + Sub Climax",
        track: "Trilhas A2 & A3",
        preRoll: "Pico -20ms",
        sound: "riser",
        note: "Ponto de virada na história: swell dramático + sub grave."
      }
    ]
  }
};

function renderAutoSfxSimulation(presetKey, resultsBox) {
  const data = SIMULATOR_PRESETS_DATA[presetKey] || SIMULATOR_PRESETS_DATA.dynamic;
  if (!resultsBox) return;

  let html = `
    <div style="padding: 6px 8px; margin-bottom: 6px; font-size: 0.76rem; color: #9ca3af; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed rgba(255,255,255,0.08);">
      <span>Preset Ativo: <strong style="color: #fbbf24;">${escapeHtml(data.title)}</strong></span>
      <span style="color: #34d399; font-size: 0.72rem;">● 4 Cortes Analisados</span>
    </div>
  `;

  data.cuts.forEach((item, idx) => {
    html += `
      <div class="asfx-sim-row" data-sim-index="${idx}">
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 3px; flex-wrap: wrap;">
            <span style="color: #fbbf24; font-family: monospace; font-size: 0.78rem; font-weight: 700;">${item.tc}</span>
            <span class="asfx-sim-tag ${item.tagClass}">${item.badge}</span>
            <span style="font-size: 0.7rem; color: #64748b;">${item.track}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <strong style="color: #fff; font-size: 0.82rem;">${item.name}</strong>
            <span style="font-size: 0.7rem; color: #9ca3af;">(${item.preRoll})</span>
          </div>
          <p style="font-size: 0.72rem; color: #9ca3af; margin: 2px 0 0 0; line-height: 1.3;">${item.note}</p>
        </div>
        <button type="button" class="btn-sim-play" data-sound="${item.sound}" title="Ouvir som deste corte">
          ▶
        </button>
      </div>
    `;
  });

  html += `
    <div style="margin-top: 8px; padding: 8px 10px; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 6px; font-size: 0.74rem; color: #34d399; display: flex; align-items: center; gap: 8px;">
      <span>✔</span>
      <span><strong>Sucesso:</strong> Todos os 5 Pilares de IA aplicados (Semântica, Ritmo, Pico Sync, Camada Dupla e Ducking).</span>
    </div>
  `;

  resultsBox.innerHTML = html;

  // Ouvintes de clique para tocar o som de cada linha simulada
  resultsBox.querySelectorAll(".btn-sim-play").forEach(btn => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      const snd = btn.dataset.sound;
      playSynthesizedSound(snd);
      btn.style.transform = "scale(1.2)";
      setTimeout(() => { btn.style.transform = "scale(1)"; }, 200);
    });
  });
}

function initAutoSfxSimulator() {
  const pills = document.querySelectorAll(".asfx-pill-btn");
  const simBtn = document.getElementById("btnSimulateAutoSfx");
  const resultsBox = document.getElementById("asfxSimResults");
  let currentPreset = "dynamic";

  pills.forEach(p => {
    p.addEventListener("click", () => {
      pills.forEach(x => x.classList.remove("active"));
      p.classList.add("active");
      currentPreset = p.dataset.preset || "dynamic";
      playSynthesizedSound("click");
      // Renderiza imediatamente o preview do estilo selecionado
      renderAutoSfxSimulation(currentPreset, resultsBox);
    });
  });

  if (simBtn && resultsBox) {
    simBtn.addEventListener("click", () => {
      simBtn.disabled = true;
      simBtn.innerHTML = "<span>🧠 Lendo semântica de clipes e marcadores...</span>";

      setTimeout(() => {
        simBtn.innerHTML = "<span>⚡ Calculando ritmo (pacing) e pre-roll dinâmico...</span>";
      }, 260);

      setTimeout(() => {
        simBtn.innerHTML = "<span>🎙️ Detectando voz na trilha A1 para ducking...</span>";
      }, 520);

      setTimeout(() => {
        renderAutoSfxSimulation(currentPreset, resultsBox);
        playSynthesizedSound("whoosh");
        simBtn.innerHTML = "<span>✓ Timeline Sonorizada! Simular Novamente</span>";
        simBtn.disabled = false;
      }, 820);
    });
  }
}

// ==========================================================================
// 7. FAQ ACCORDION
// ==========================================================================
function initFaqAccordion() {
  const items = document.querySelectorAll(".faq-item");
  items.forEach(it => {
    const q = it.querySelector(".faq-q");
    if (!q) return;
    q.addEventListener("click", () => {
      const isAct = it.classList.contains("active");
      items.forEach(other => other.classList.remove("active"));
      if (!isAct) it.classList.add("active");
    });
  });
}

function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
  showToast("Copiado para a área de transferência!");
}

function showToast(message) {
  let toast = document.getElementById("adminToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "adminToast";
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #1c1f2a;
      border: 1px solid var(--border-accent);
      color: #fff;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 700;
      box-shadow: 0 10px 30px rgba(0,0,0,0.8);
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: fadeIn 0.2s ease;
    `;
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>✓</span> <span>${escapeHtml(message)}</span>`;
  toast.style.display = "flex";

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.display = "none";
  }, 2800);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
