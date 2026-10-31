// Lisa – KI-Assistentin für Eltern (Chat unten rechts). Antworten kommen von der Supabase-Funktion „assistent“.
;(function () {
  var SUPA = 'https://zqskietwmexfrwisgrft.supabase.co'
  var ANON = document.querySelector('meta[name="bfk-anon"]')?.content || ''
  var KEY = 'bfk.lisa.verlauf'
  var verlauf = []
  try { verlauf = JSON.parse(sessionStorage.getItem(KEY) || '[]') } catch (e) { verlauf = [] }
  var css = '#lisa-knopf{position:fixed;right:18px;bottom:18px;z-index:8000;display:flex;align-items:center;gap:10px;border:0;cursor:pointer;background:#fff;color:#231A4F;border-radius:999px;padding:6px 18px 6px 6px;box-shadow:0 12px 32px rgba(27,20,70,.35);font:800 15px Nunito,system-ui,sans-serif}'
    + '#lisa-knopf img{width:52px;height:52px;border-radius:50%;border:3px solid #FFC531}#lisa-knopf small{display:block;font-weight:700;color:#6B648F;font-size:12px}'
    + '#lisa-fenster{position:fixed;right:18px;bottom:18px;z-index:8001;width:min(390px,calc(100vw - 32px));height:min(600px,calc(100vh - 36px));display:none;flex-direction:column;background:#fff;color:#231A4F;border-radius:24px;overflow:hidden;box-shadow:0 24px 60px rgba(27,20,70,.45);font:600 15px/1.45 Nunito,system-ui,sans-serif}'
    + '#lisa-fenster.offen{display:flex}.li-kopf{display:flex;align-items:center;gap:10px;padding:12px 14px;background:linear-gradient(135deg,#5B47D6,#9B5CFF);color:#fff}.li-kopf img{width:46px;height:46px;border-radius:50%;border:2px solid #FFC531}.li-kopf b{font-size:17px;font-family:"Baloo 2",sans-serif}.li-kopf small{display:block;opacity:.9;font-size:12px}.li-kopf button{margin-left:auto;background:rgba(255,255,255,.2);border:0;color:#fff;width:34px;height:34px;border-radius:50%;font-size:16px;cursor:pointer}'
    + '.li-liste{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;background:#F6F4FF}.li-m{max-width:85%;padding:10px 13px;border-radius:16px;white-space:pre-wrap;word-wrap:break-word}.li-m.a{background:#fff;border:1px solid #E4DFFF;align-self:flex-start;border-bottom-left-radius:4px}.li-m.u{background:#5B47D6;color:#fff;align-self:flex-end;border-bottom-right-radius:4px}.li-m a{color:inherit}'
    + '.li-vorschlaege{display:flex;flex-wrap:wrap;gap:6px}.li-vorschlaege button{border:1.5px solid #CFC6FF;background:#fff;color:#5B47D6;border-radius:999px;padding:6px 12px;font:700 13px Nunito,sans-serif;cursor:pointer}'
    + '.li-form{display:flex;gap:8px;padding:10px;border-top:1px solid #EEE;background:#fff}.li-form input{flex:1;min-width:0;border:1.5px solid #DDD6FF;border-radius:999px;padding:10px 14px;font:inherit;color:#231A4F;background:#fff}.li-form button{border:0;background:#FFC531;color:#231A4F;font-weight:900;border-radius:999px;padding:0 16px;cursor:pointer}'
    + '.li-hinweis{font-size:11px;color:#6B648F;text-align:center;padding:0 10px 8px;background:#fff}.li-tippt{opacity:.6;font-style:italic}'
    + '@media (max-width:520px){#lisa-knopf span{display:none}#lisa-knopf{padding:5px}}'
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st)

  var knopf = document.createElement('button'); knopf.id = 'lisa-knopf'; knopf.type = 'button'; knopf.setAttribute('aria-label', 'Fragen an Lisa, unsere KI-Assistentin')
  knopf.innerHTML = '<img src="/lisa-avatar.webp" alt=""><span>Fragen? Frag Lisa!<small>KI-Assistentin · antwortet sofort</small></span>'
  var f = document.createElement('div'); f.id = 'lisa-fenster'; f.setAttribute('role', 'dialog'); f.setAttribute('aria-label', 'Chat mit Lisa')
  f.innerHTML = '<div class="li-kopf"><img src="/lisa-avatar.webp" alt=""><div><b>Lisa</b><small>KI-Assistentin von BrainFit Kids</small></div><button type="button" aria-label="Schließen">✕</button></div>'
    + '<div class="li-liste" aria-live="polite"></div>'
    + '<form class="li-form"><input maxlength="500" placeholder="Ihre Frage …" aria-label="Ihre Frage"><button type="submit">Senden</button></form>'
    + '<div class="li-hinweis">Lisa ist eine KI und kann sich irren. Bitte keine persönlichen Daten eingeben. <a href="/datenschutz.html">Datenschutz</a></div>'
  document.body.append(knopf, f)
  var liste = f.querySelector('.li-liste'), form = f.querySelector('form'), feld = form.querySelector('input'), laeuft = false

  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] }) }
  // einfache Formatierung: **fett**, Links auf eigene Seiten und E-Mail
  function format(t) {
    return esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/(info@mentalmath\.at)/g, '<a href="mailto:$1">$1</a>')
      .replace(/(^|\s)(\/[a-z]+\.html)/g, '$1<a href="$2">$2</a>')
  }
  function blase(rolle, text, extra) { var d = document.createElement('div'); d.className = 'li-m ' + (rolle === 'user' ? 'u' : 'a') + (extra ? ' ' + extra : ''); d.innerHTML = rolle === 'user' ? esc(text) : format(text); liste.appendChild(d); liste.scrollTop = liste.scrollHeight; return d }
  function speichern() { try { sessionStorage.setItem(KEY, JSON.stringify(verlauf.slice(-20))) } catch (e) {} }
  function start() {
    liste.innerHTML = ''
    blase('assistant', 'Hallo, ich bin Lisa 👋 Ich beantworte gern Ihre Fragen zu BrainFit Kids – zu Paketen, Preisen, Alter, Ablauf oder Abakus. Was möchten Sie wissen?')
    verlauf.forEach(function (m) { blase(m.rolle, m.text) })
    if (!verlauf.length) {
      var v = document.createElement('div'); v.className = 'li-vorschlaege'
      ;['Welches Paket passt zu uns?', 'Ab welchem Alter?', 'Wie viel Zeit am Tag?', 'Was ist der Unterschied Basic / Plus?'].forEach(function (q) {
        var b = document.createElement('button'); b.type = 'button'; b.textContent = q; b.onclick = function () { v.remove(); fragen(q) }; v.appendChild(b) })
      liste.appendChild(v)
    }
  }
  async function fragen(q) {
    if (laeuft || !q.trim()) return
    laeuft = true; verlauf.push({ rolle: 'user', text: q.trim() }); speichern(); blase('user', q.trim())
    var t = blase('assistant', 'Lisa tippt …', 'li-tippt')
    try {
      var r = await fetch(SUPA + '/functions/v1/assistent', { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: ANON, Authorization: 'Bearer ' + ANON }, body: JSON.stringify({ verlauf: verlauf }) })
      var d = await r.json(); var text = d.text || 'Entschuldigung, das hat nicht geklappt. Bitte schreiben Sie an info@mentalmath.at.'
      t.remove(); blase('assistant', text); verlauf.push({ rolle: 'assistant', text: text }); speichern()
    } catch (e) { t.remove(); blase('assistant', 'Ich bin gerade nicht erreichbar 😕 Bitte schreiben Sie an info@mentalmath.at.') }
    laeuft = false
  }
  knopf.onclick = function () { f.classList.add('offen'); knopf.style.display = 'none'; if (!liste.children.length) start(); setTimeout(function () { feld.focus() }, 50) }
  f.querySelector('.li-kopf button').onclick = function () { f.classList.remove('offen'); knopf.style.display = '' }
  form.onsubmit = function (e) { e.preventDefault(); var q = feld.value; feld.value = ''; var v = liste.querySelector('.li-vorschlaege'); if (v) v.remove(); fragen(q) }
})()
