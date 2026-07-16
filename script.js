// js/script.js

/* =========================================================
   CONFIGURAÇÃO DO EVENTO
   ========================================================= */
const EVENT_ISO = '2026-08-22T13:00:00-03:00'; // horário de Brasília, fixo pra qualquer convidado
const EVENT_LABEL = 'Sábado, 22 de Agosto de 2026 — 13:00';
const EVENT_LOCATION = 'Kid Recanto Buffet - Santana, R. Dr. Zuquim, 1786 - Santana, São Paulo - SP, 02035-022';

/* =========================================================
   CONFIGURAÇÃO DO BACKEND (Google Sheets via Apps Script)
   Troque a URL abaixo pela URL do seu Web App depois de
   publicar o Apps Script (veja SETUP.md para o passo a passo).
   ========================================================= */
const APPS_SCRIPT_URL = 'COLE_AQUI_A_URL_DO_SEU_APPS_SCRIPT';

const BACKEND_CONFIGURED = APPS_SCRIPT_URL && !APPS_SCRIPT_URL.startsWith('COLE_AQUI');

/* =========================================================
   ELEMENTOS DO DOM
   ========================================================= */
const elDays = document.getElementById('days');
const elHours = document.getElementById('hours');
const elMinutes = document.getElementById('minutes');
const elSeconds = document.getElementById('seconds');
const elEventDatePretty = document.getElementById('eventDatePretty');
const elWhenText = document.getElementById('whenText');

const gallery = document.getElementById('gallery');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modalImg');

const rsvpForm = document.getElementById('rsvpForm');
const rsvpSubmitBtn = document.getElementById('rsvpSubmitBtn');
const rsvpStatus = document.getElementById('rsvpStatus');
const mapFrame = document.getElementById('mapFrame');
const orbField = document.getElementById('orbField');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

/* =========================================================
   INICIALIZA TEXTOS DO EVENTO
   ========================================================= */
const eventDate = new Date(EVENT_ISO);

/* horário atual no fuso de Brasília, no formato "dd/mm/aaaa, hh:mm:ss" */
function nowInBrasilia() {
  return new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}
elEventDatePretty.textContent = eventDate.toLocaleString('pt-BR', {
  dateStyle: 'full',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo'
});
elWhenText.textContent = EVENT_LABEL;

/* =========================================================
   MAPA DE LOCALIZAÇÃO — usa o mesmo endereço do evento
   ========================================================= */
if (mapFrame) {
  mapFrame.src = `https://www.google.com/maps?q=${encodeURIComponent(EVENT_LOCATION)}&output=embed`;
}

/* =========================================================
   CONTAGEM REGRESSIVA
   ========================================================= */
function updateCountdown() {
  const now = new Date();
  const diff = eventDate - now;

  if (diff <= 0) {
    elDays.textContent = '0';
    elHours.textContent = '00';
    elMinutes.textContent = '00';
    elSeconds.textContent = '00';
    clearInterval(countdownInterval);
    return;
  }

  const secs = Math.floor(diff / 1000);
  const days = Math.floor(secs / (60 * 60 * 24));
  const hours = Math.floor((secs % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((secs % (60 * 60)) / 60);
  const seconds = secs % 60;

  elDays.textContent = days;
  elHours.textContent = String(hours).padStart(2, '0');
  elMinutes.textContent = String(minutes).padStart(2, '0');
  elSeconds.textContent = String(seconds).padStart(2, '0');
}

updateCountdown();
const countdownInterval = setInterval(updateCountdown, 1000);

/* =========================================================
   ORBS DE FUNDO — parallax no scroll + leve resposta ao mouse
   ========================================================= */
const ORB_COLORS = [
  'rgba(255,47,212,0.55)',
  'rgba(0,229,255,0.5)',
  'rgba(176,38,255,0.55)',
  'rgba(57,255,20,0.45)'
];

function initOrbField() {
  if (!orbField || prefersReducedMotion) return;

  const count = window.innerWidth < 700 ? 6 : 11;
  const orbs = [];

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'orb';
    const size = 40 + Math.random() * 90;
    const color = ORB_COLORS[i % ORB_COLORS.length];
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.left = `${Math.random() * 96}%`;
    el.style.top = `${Math.random() * 260 + i * 90}px`;
    el.style.background = `radial-gradient(circle, ${color}, transparent 70%)`;
    const scrollSpeed = 0.06 + Math.random() * 0.16;
    const mouseSpeed = 6 + Math.random() * 14;
    orbField.appendChild(el);
    orbs.push({ el, scrollSpeed, mouseSpeed, mx: 0, my: 0 });
  }

  let ticking = false;
  function applyTransforms() {
    const y = window.scrollY;
    orbs.forEach(o => {
      o.el.style.transform = `translate(${o.mx}px, ${-y * o.scrollSpeed + o.my}px)`;
    });
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(applyTransforms);
  }, { passive: true });

  if (hasFinePointer) {
    document.addEventListener('mousemove', (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      orbs.forEach(o => {
        o.mx = dx * o.mouseSpeed;
        o.my = dy * o.mouseSpeed;
      });
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(applyTransforms);
      }
    }, { passive: true });
  }
}

/* =========================================================
   REVEAL ON SCROLL — cards e fotos aparecendo ao rolar
   ========================================================= */
function initRevealOnScroll() {
  const items = document.querySelectorAll('.reveal, .photo-stage');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('in-view'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  items.forEach(el => observer.observe(el));
}

/* =========================================================
   MODAL DE IMAGEM
   ========================================================= */
function openModal(src) {
  modalImg.src = src;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  modalImg.src = '';
  document.body.style.overflow = 'auto';
}

modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});
modal.querySelector('.close').addEventListener('click', closeModal);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('show')) closeModal();
});

gallery.addEventListener('click', (e) => {
  const img = e.target.closest('img');
  if (!img) return;
  openModal(img.dataset.full || img.src);
});

/* =========================================================
   RSVP — envia a confirmação para o Google Sheets (Apps Script).
   Não existe mais leitura/exibição pública da lista de
   confirmados: os convidados só enviam, e as respostas ficam
   visíveis apenas para a anfitriã, direto na planilha.
   Uma cópia é guardada no localStorage só como rede de segurança
   caso o envio ao backend falhe (não é exibida em lugar nenhum).
   ========================================================= */
const LOCAL_CACHE_KEY = 'rsvp_local_cache_v2';

function saveLocalCacheEntry(guest) {
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    list.push(guest);
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(list));
  } catch {
    // localStorage indisponível — segue sem cache local, sem problema.
  }
}

async function sendGuestToBackend(guest) {
  // Content-Type text/plain evita o preflight CORS que o Apps Script não trata bem.
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(guest)
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Erro desconhecido no backend');
  return data;
}

function setStatus(message, type) {
  rsvpStatus.textContent = message;
  rsvpStatus.className = `rsvp-status ${type || ''}`;
}

rsvpForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('rsvpName').value.trim();
  const companion = document.getElementById('rsvpCompanion').value.trim();
  const attending = document.getElementById('rsvpAttending').value;
  const note = document.getElementById('rsvpMsg').value.trim();

  if (!name) {
    setStatus('Por favor, informe seu nome.', 'err');
    return;
  }

  const guest = { name, companion, attending, note, when: nowInBrasilia() };

  rsvpSubmitBtn.disabled = true;
  setStatus('Enviando confirmação...', '');

  if (BACKEND_CONFIGURED) {
    try {
      await sendGuestToBackend(guest);
      setStatus('Confirmação enviada com sucesso! Obrigado 🎉', 'ok');
    } catch (err) {
      console.error(err);
      saveLocalCacheEntry(guest);
      setStatus('Não consegui enviar agora. Tente novamente em instantes, por favor.', 'err');
    }
  } else {
    saveLocalCacheEntry(guest);
    setStatus('Backend do Google Sheets ainda não configurado (veja SETUP.md) — a confirmação não chegou até a anfitriã.', 'err');
  }

  rsvpSubmitBtn.disabled = false;
  rsvpForm.reset();
});

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */
initOrbField();
initRevealOnScroll();
