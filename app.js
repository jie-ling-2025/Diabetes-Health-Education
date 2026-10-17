'use strict';
const $ = selector => document.querySelector(selector);
const menu = $('#menu-toggle');
const navigation = $('#navigation');
function closeMenu(restoreFocus = false) {
  navigation.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', '開啟導覽選單');
  if (restoreFocus) menu.focus();
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  navigation.classList.toggle('open', open); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? '關閉導覽選單' : '開啟導覽選單');
});
navigation.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') closeMenu(true); });
$('#font-toggle').addEventListener('click', () => {
  const large = document.documentElement.classList.toggle('large'); $('#font-toggle').setAttribute('aria-pressed', String(large));
});
const slides = [
  ['從認識血糖開始，把照顧自己融入日常，和醫療團隊一起，找到適合自己的生活步調。', '認識常見警訊', '#recognize'],
  ['手抖、冷汗、心悸時留意低血糖。清醒且能安全吞嚥才口服補糖；意識不清立即打 119。', '了解低血糖處理', '#emergency'],
  ['規律用藥、均衡飲食、適量活動與每天檢查雙腳。從一個小習慣開始，照顧每天的自己。', '開始日常照護', '#care']
];
let slide = 0;
function showSlide(index) {
  slide = (index + slides.length) % slides.length;
  $('#hero-description').textContent = slides[slide][0];
  const cta = $('.hero-buttons .primary'); cta.textContent = slides[slide][1] + ' ↗'; cta.href = slides[slide][2];
  $('#slide-counter').textContent = `0${slide + 1} / 03`;
  document.querySelectorAll('[data-slide]').forEach((dot, i) => { dot.classList.toggle('active', i === slide); dot.setAttribute('aria-pressed', String(i === slide)); });
}
$('#slide-prev').addEventListener('click', () => showSlide(slide - 1));
$('#slide-next').addEventListener('click', () => showSlide(slide + 1));
document.querySelectorAll('[data-slide]').forEach(dot => dot.addEventListener('click', () => showSlide(Number(dot.dataset.slide))));
const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(tab, focus = false) {
  tabs.forEach(item => { const selected = item === tab; item.setAttribute('aria-selected', String(selected)); item.tabIndex = selected ? 0 : -1; document.getElementById(item.getAttribute('aria-controls')).hidden = !selected; });
  if (focus) tab.focus();
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', e => {
    let next;
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
    if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { e.preventDefault(); selectTab(tabs[next], true); }
  });
});
const checks = [...document.querySelectorAll('.checklist input')];
function updateChecks() { $('#checklist-status').textContent = `已確認 ${checks.filter(c => c.checked).length} / ${checks.length} 項；這是學習提醒，不代表醫療評估。`; }
checks.forEach(c => { c.checked = false; c.addEventListener('change', updateChecks); });
window.addEventListener('pageshow', updateChecks);
let printDetails = [];
window.addEventListener('beforeprint', () => { printDetails = [...document.querySelectorAll('details')].map(el => [el, el.open]); printDetails.forEach(([el]) => { el.open = true; }); });
window.addEventListener('afterprint', () => { printDetails.forEach(([el, open]) => { el.open = open; }); });
$('#print-button').addEventListener('click', () => window.print());
const questions = [
  { question: '家人突然冒冷汗，血糖 62 mg/dL；他清醒而且能安全吞嚥。你會怎麼做？', options: ['先去散步，等下一餐再吃', '補充約 15 公克速效糖，15 分鐘後複測', '喝無糖茶並繼續活動'], correct: 1, explanation: '清醒且能安全吞嚥時，補充速效糖並於 15 分鐘後複測；仍低於 70 mg/dL 就重複。若惡化、無法吞嚥或意識改變，立即打 119，不餵食。來源 02。' },
  { question: '家人已經意識不清，懷疑低血糖，你的第一個行動是？', options: ['將糖水灌入嘴裡', '等他自然醒來', '立即打 119，不餵水或食物'], correct: 2, explanation: '意識不清時餵食可能嗆到。立即打 119 並依救護人員指示；有醫師開立的升糖素且受過訓練者，可依指示使用。來源 02。' },
  { question: '今天檢查腳底時發現破皮紅腫，雖然不太痛，應該怎麼做？', options: ['盡早聯絡醫療團隊，不自行使用雞眼藥', '沒有痛就繼續觀察一個月', '赤腳走路讓傷口透氣'], correct: 0, explanation: '糖尿病可能使足部感覺變鈍，不痛也可能有傷口。每天檢查腳底與趾縫，有紅腫或傷口盡早就醫，不赤腳行走。來源 04。' }
];
let questionIndex = 0, score = 0, answered = false;
function renderQuestion(focus = false) {
  answered = false; const q = questions[questionIndex];
  $('#quiz-question').hidden = false; $('#quiz-options').hidden = false; $('#quiz-result').hidden = true;
  $('#quiz-question').textContent = q.question; $('#quiz-progress').textContent = `第 ${questionIndex + 1} 題，共 ${questions.length} 題`;
  $('#quiz-progress-bar').style.width = `${(questionIndex + 1) / questions.length * 100}%`;
  $('#quiz-feedback').hidden = true; $('#quiz-feedback').textContent = ''; $('#quiz-next').hidden = true;
  $('#quiz-options').replaceChildren();
  q.options.forEach((option, i) => {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = option;
    button.addEventListener('click', () => {
      if (answered) return; answered = true; if (i === q.correct) score++;
      [...$('#quiz-options').children].forEach(b => { b.disabled = true; }); button.classList.add('chosen');
      $('#quiz-feedback').textContent = (i === q.correct ? '答對了。' : '再記住這個行動：') + q.explanation;
      $('#quiz-feedback').hidden = false; $('#quiz-next').hidden = false;
      $('#quiz-next').textContent = questionIndex === questions.length - 1 ? '查看練習結果 →' : '下一題 →';
    });
    $('#quiz-options').append(button);
  });
  if (focus) $('#quiz-question').focus();
}
$('#quiz-next').addEventListener('click', () => {
  if (!answered) return;
  if (questionIndex < questions.length - 1) { questionIndex++; renderQuestion(true); }
  else { $('#quiz-result').hidden = false; $('#quiz-options').hidden = true; $('#quiz-question').hidden = true; $('#quiz-feedback').hidden = true; $('#quiz-next').hidden = true; $('#quiz-score').textContent = `完成練習：答對 ${score} / ${questions.length} 題`; $('#quiz-restart').focus(); }
});
$('#quiz-restart').addEventListener('click', () => { questionIndex = 0; score = 0; renderQuestion(true); });
renderQuestion();
function updateProgress() { const distance = document.documentElement.scrollHeight - document.documentElement.clientHeight; $('#reading-progress').style.width = `${distance > 0 ? window.scrollY / distance * 100 : 0}%`; }
window.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress); updateProgress();
