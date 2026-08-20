// Inline "not sure where to start?" questionnaire in the hero. Two quick
// questions branch to one of the five calculators or the glossary — a
// guided alternative to picking a journey card directly, for a visitor
// who doesn't yet know which situation fits them.
const QUESTIONS = {
  start: {
    text: 'Do you already have a mortgage?',
    options: [
      { label: "No — I'm buying for the first time", next: 'buying' },
      { label: 'Yes, I already have one', next: 'owner' }
    ]
  },
  buying: {
    text: 'Are you set on buying, or still weighing renting?',
    options: [
      { label: "I'm planning to buy", result: { label: 'See what you can afford', href: '/mortgage-affordability-calculator/' } },
      { label: 'Still weighing renting vs. buying', result: { label: 'Compare renting and buying', href: '/rent-vs-buy-calculator/' } }
    ]
  },
  owner: {
    text: "What's on your mind?",
    options: [
      { label: 'My term is renewing soon', result: { label: 'Check your renewal offer', href: '/mortgage-renewal-calculator/' } },
      { label: 'Accessing equity or refinancing', result: { label: 'See what your equity is worth', href: '/mortgage-refinance-calculator/' } },
      { label: 'Breaking my mortgage early', result: { label: 'Estimate the penalty', href: '/mortgage-penalty-calculator/' } },
      { label: 'Just want to understand it better', result: { label: 'Browse the glossary', href: '/mortgage-glossary/' } }
    ]
  }
};

function initQuestionnaire() {
  const trigger = document.getElementById('qz-trigger');
  const panel = document.getElementById('qz-panel');
  if (!trigger || !panel) return;

  function renderStep(key) {
    const step = QUESTIONS[key];
    panel.innerHTML = `
      <p class="qz-question">${step.text}</p>
      <div class="qz-options">
        ${step.options.map((opt, i) => `<button type="button" class="btn btn-secondary qz-opt" data-index="${i}">${opt.label}</button>`).join('')}
      </div>`;
    panel.querySelectorAll('.qz-opt').forEach((btn) => {
      btn.addEventListener('click', () => {
        const opt = step.options[Number(btn.dataset.index)];
        if (opt.result) renderResult(opt.result);
        else renderStep(opt.next);
      });
    });
  }

  function renderResult(result) {
    panel.innerHTML = `
      <p class="qz-question">Based on that:</p>
      <div class="qz-options" style="flex-direction:row;flex-wrap:wrap;align-items:center">
        <a class="btn btn-primary" href="${result.href}">${result.label} →</a>
        <button type="button" class="btn-ghost qz-restart">Start over</button>
      </div>`;
    panel.querySelector('.qz-restart').addEventListener('click', () => renderStep('start'));
  }

  trigger.addEventListener('click', () => {
    const opening = panel.hidden;
    panel.hidden = !panel.hidden;
    trigger.setAttribute('aria-expanded', String(opening));
    if (opening && !panel.dataset.rendered) {
      renderStep('start');
      panel.dataset.rendered = '1';
    }
  });
}

initQuestionnaire();
