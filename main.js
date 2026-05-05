/* ─── Download + redirect ───────────────────────────────────
   Replace 'serializer.zip' below with your actual file URL
   once you've uploaded the extension (GitHub Releases, etc.)
──────────────────────────────────────────────────────────── */
document.querySelectorAll('.btn-download').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const a = document.createElement('a');
    a.href = btn.href;          // uses the href already on the element
    a.download = 'serializer.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => {
      window.location.href = 'install.html';
    }, 600);
  });
});

/* ─── Scroll reveal ─── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll('.reveal').forEach((el) => {
  revealObserver.observe(el);
});

/* ─── Product demo animation ─── */
(function initDemo() {
  const demoWindow = document.getElementById('demo-window');
  if (!demoWindow) return;

  const FIELDS = [
    { lbl: 'Patient name', val: '—',                         stepLabel: 'Patient name' },
    { lbl: 'Date',         val: 'Today',                     stepLabel: 'Date'         },
    { lbl: 'Heart rate',   val: '72 bpm',                    stepLabel: 'Heart rate'   },
    { lbl: 'Diagnosis',    val: 'Z00.00',                    stepLabel: 'Diagnosis'    },
    { lbl: 'Notes',        val: 'Routine visit.',            stepLabel: 'Notes'        },
  ];

  const recBadge   = document.getElementById('demo-rec');
  const panelBody  = document.getElementById('demo-panel-body');
  const phaseItems = [
    document.getElementById('dpi-0'),
    document.getElementById('dpi-1'),
    document.getElementById('dpi-2'),
  ];

  let running = false;
  let cancelFlag = false;
  const tids = [];

  /* ── Utilities ── */

  function wait(ms) {
    return new Promise((resolve) => {
      if (cancelFlag) { resolve(); return; }
      const id = setTimeout(resolve, ms);
      tids.push(id);
    });
  }

  async function typeInto(el, text, perChar = 52) {
    el.textContent = '';
    for (const ch of text) {
      if (cancelFlag) { el.textContent = text; return; }
      await wait(perChar);
      el.textContent += ch;
    }
  }

  function fieldEl(i)  { return document.getElementById('df-' + i); }
  function valEl(i)    { return document.getElementById('dv-' + i); }
  function lblEl(i)    { return fieldEl(i) && fieldEl(i).querySelector('.demo-field-lbl'); }

  function resetFields() {
    for (let i = 0; i < FIELDS.length; i++) {
      const f = fieldEl(i);
      const v = valEl(i);
      const l = lblEl(i);
      if (!f) continue;
      f.classList.remove('is-active', 'is-filled', 'is-highlighted');
      if (v) v.textContent = '';
      if (l) l.removeAttribute('data-step');
    }
  }

  function setPhase(n) {
    phaseItems.forEach((p, i) => {
      if (!p) return;
      p.classList.toggle('is-active', i <= n);
    });
  }

  /* ── Panel states ── */

  function panelRecording(steps) {
    panelBody.innerHTML =
      '<div class="dp-status"><span>Recording</span></div>' +
      '<div class="dp-steps">' +
      steps.map((s, i) =>
        `<div class="dp-step">
          <span class="dp-step-num">0${i + 1}</span>
          <span class="dp-step-label">${s}</span>
        </div>`
      ).join('') +
      '</div>';
  }

  function panelSaving() {
    panelBody.innerHTML =
      '<div class="dp-save-ui">' +
        '<p class="dp-save-prompt">Template name</p>' +
        '<div class="dp-save-input" id="dp-name-input"></div>' +
        '<button class="dp-save-btn" id="dp-save-btn">Save template</button>' +
      '</div>';
  }

  function panelSaved() {
    panelBody.innerHTML =
      '<div class="dp-saved">' +
        '<div class="dp-saved-check">✓</div>' +
        '<div class="dp-saved-name">Morning Rounds</div>' +
        '<div class="dp-saved-count">5 steps recorded</div>' +
      '</div>';
  }

  function panelReplay() {
    panelBody.innerHTML =
      '<div class="dp-replay-card">' +
        '<div class="dp-template-name">Morning Rounds</div>' +
        '<div class="dp-template-meta">5 steps · 5 fields</div>' +
        '<button class="dp-replay-btn" id="dp-replay-btn">Fill form</button>' +
      '</div>';
  }

  function panelDone() {
    panelBody.innerHTML =
      '<div class="dp-done">' +
        '<div class="dp-done-label">Done</div>' +
        '<div class="dp-done-text">All fields filled.</div>' +
        '<div class="dp-done-hint">Review and submit when ready.</div>' +
      '</div>';
  }

  /* ── Main animation loop ── */

  async function runLoop() {
    if (running) return;
    running = true;
    cancelFlag = false;

    while (!cancelFlag) {

      /* ── PHASE 1: RECORDING ── */
      setPhase(0);
      resetFields();
      recBadge.classList.add('is-visible');
      panelRecording([]);
      const recorded = [];

      for (let i = 0; i < FIELDS.length; i++) {
        if (cancelFlag) break;
        const f = fieldEl(i);
        const v = valEl(i);
        const l = lblEl(i);

        f.classList.add('is-active');
        await wait(220);
        await typeInto(v, FIELDS[i].val, 48);
        await wait(160);
        f.classList.remove('is-active');
        f.classList.add('is-filled');

        if (l) l.setAttribute('data-step', `0${i + 1}`);
        recorded.push(FIELDS[i].stepLabel);
        panelRecording([...recorded]);

        await wait(380);
      }

      await wait(700);

      /* ── PHASE 2: SAVING ── */
      setPhase(1);
      recBadge.classList.remove('is-visible');
      panelSaving();
      await wait(500);

      const nameInput = document.getElementById('dp-name-input');
      if (nameInput) await typeInto(nameInput, 'Morning Rounds', 68);
      await wait(350);

      const saveBtn = document.getElementById('dp-save-btn');
      if (saveBtn) saveBtn.classList.add('is-clicked');
      await wait(500);
      panelSaved();
      await wait(1600);

      /* ── PHASE 3: REPLAY ── */
      setPhase(2);
      resetFields();
      panelReplay();
      await wait(800);

      const replayBtn = document.getElementById('dp-replay-btn');
      if (replayBtn) replayBtn.classList.add('is-clicked');
      await wait(280);

      for (let i = 0; i < FIELDS.length; i++) {
        if (cancelFlag) break;
        const f = fieldEl(i);
        const v = valEl(i);
        f.classList.add('is-highlighted');
        if (v) v.textContent = FIELDS[i].val;
        await wait(170);
      }

      await wait(700);
      panelDone();

      /* Hold the completed state */
      await wait(3000);

      /* Fade out before reset */
      recBadge.classList.remove('is-visible');
      setPhase(-1);
      resetFields();
      panelRecording([]);
      await wait(700);
    }

    running = false;
  }

  /* Start when scrolled into view */
  const startObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        runLoop();
        startObserver.disconnect();
      }
    },
    { threshold: 0.25 }
  );

  startObserver.observe(demoWindow);
})();
