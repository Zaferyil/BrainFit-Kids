// Cookie-Hinweis nach DSGVO/TKG: gleichwertige Knöpfe, nichts vorausgewählt, Wahl jederzeit änderbar (window.bfkCookies())
;(function () {
  var KEY = 'bfk.consent', VERSION = 1
  function lesen() { try { var c = JSON.parse(localStorage.getItem(KEY)); return c && c.v === VERSION ? c : null } catch (e) { return null } }
  function speichern(statistik, marketing) {
    var c = { v: VERSION, notwendig: true, statistik: !!statistik, marketing: !!marketing, zeit: new Date().toISOString() }
    try { localStorage.setItem(KEY, JSON.stringify(c)) } catch (e) {}
    window.dispatchEvent(new CustomEvent('bfk-consent', { detail: c }))
    schliessen()
  }
  var css = '#bfk-ck{position:fixed;z-index:99999;left:16px;right:16px;bottom:16px;max-width:560px;margin:0 auto;background:#fff;color:#231A4F;border-radius:20px;box-shadow:0 12px 40px rgba(35,26,79,.35);padding:20px;font:600 15px/1.5 Nunito,system-ui,sans-serif;border:2px solid #E4DFFF}'
    + '#bfk-ck h2{margin:0 0 6px;font:800 21px "Baloo 2",sans-serif;color:#5B47D6}#bfk-ck p{margin:0 0 12px}#bfk-ck a{color:#5B47D6}'
    + '#bfk-ck .ck-k{display:flex;flex-wrap:wrap;gap:8px}#bfk-ck button{flex:1 1 150px;padding:12px 14px;border-radius:999px;font:800 15px Nunito,sans-serif;cursor:pointer;border:2px solid #5B47D6;background:#5B47D6;color:#fff}'
    + '#bfk-ck button.ck-n{background:#fff;color:#5B47D6}#bfk-ck .ck-opt{display:none;margin:0 0 12px;padding:10px 12px;background:#F6F4FF;border-radius:14px}#bfk-ck.offen .ck-opt{display:block}'
    + '#bfk-ck label{display:flex;gap:10px;align-items:flex-start;margin:6px 0}#bfk-ck input{width:20px;height:20px;margin-top:2px;accent-color:#5B47D6}#bfk-ck small{display:block;color:#6B6494;font-weight:600}'
  function zeigen(offen) {
    schliessen()
    var c = lesen() || {}
    var st = document.createElement('style'); st.id = 'bfk-ck-css'; st.textContent = css; document.head.appendChild(st)
    var d = document.createElement('div'); d.id = 'bfk-ck'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Cookie-Einstellungen')
    if (offen) d.className = 'offen'
    d.innerHTML = '<h2>🍪 Cookies &amp; Datenschutz</h2>'
      + '<p>Wir verwenden nur technisch notwendige Speicher, damit Login, Lernstand und Bezahlung funktionieren. Statistik- oder Marketing-Cookies setzen wir nur mit Ihrer Einwilligung – Sie können diese jederzeit widerrufen. Mehr in der <a href="/cookies.html">Cookie-Richtlinie</a> und <a href="/datenschutz.html">Datenschutzerklärung</a>.</p>'
      + '<div class="ck-opt"><label><input type="checkbox" checked disabled><span><b>Notwendig</b><small>Login, Lernstand, Warenkorb, Bezahlung. Immer aktiv.</small></span></label>'
      + '<label><input type="checkbox" id="ck-stat"' + (c.statistik ? ' checked' : '') + '><span><b>Statistik</b><small>Anonyme Nutzungsstatistik zur Verbesserung (derzeit nicht im Einsatz).</small></span></label>'
      + '<label><input type="checkbox" id="ck-mark"' + (c.marketing ? ' checked' : '') + '><span><b>Marketing</b><small>Meta-Pixel (Facebook/Instagram): misst, ob ein Besuch über unsere Werbung zu einer Anfrage führt. Nur auf öffentlichen Seiten, nie in der Lernplattform für Kinder. Daten gehen an Meta.</small></span></label></div>'
      + '<div class="ck-k"><button type="button" class="ck-n" id="ck-nur">Nur notwendige</button><button type="button" class="ck-n" id="ck-einst">Einstellungen</button><button type="button" id="ck-alle">Alle akzeptieren</button></div>'
    document.body.appendChild(d)
    d.querySelector('#ck-nur').onclick = function () { speichern(false, false) }
    d.querySelector('#ck-alle').onclick = function () { speichern(true, true) }
    var einst = d.querySelector('#ck-einst')
    function knopf() { einst.textContent = d.classList.contains('offen') ? 'Auswahl speichern' : 'Einstellungen' }
    knopf()
    einst.onclick = function () {
      if (!d.classList.contains('offen')) { d.classList.add('offen'); knopf(); return }
      speichern(d.querySelector('#ck-stat').checked, d.querySelector('#ck-mark').checked)
    }
  }
  function schliessen() { var a = document.getElementById('bfk-ck'), b = document.getElementById('bfk-ck-css'); if (a) a.remove(); if (b) b.remove() }
  window.bfkConsent = lesen
  window.bfkCookies = function () { zeigen(true) }

  // Meta-Pixel (Werbe-Erfolgsmessung): nur mit Marketing-Einwilligung und nur auf öffentlichen Seiten
  // (Website, Gratis-Check, Vor-Ort-Anmeldung). Nie in der Lernplattform für Kinder und im Eltern-Bereich.
  var PIXEL = '673250477167904', geladen = false
  function aktiv(c) { return !!(c && c.marketing) && (location.pathname.indexOf('/app') !== 0 || /^#\/(check|vorort)/.test(location.hash)) }
  function fbc() { // fbclid aus dem Hash (Weiterleitung /vorort → /app/#/vorort?…) für die Werbe-Zuordnung übernehmen
    try { var m = /[?&]fbclid=([^&#]+)/.exec(location.search + location.hash); if (m && !/(^|; )_fbc=/.test(document.cookie)) document.cookie = '_fbc=fb.1.' + Date.now() + '.' + m[1] + ';path=/;max-age=7776000;SameSite=Lax;Secure' } catch (e) {}
  }
  function pixel() {
    var an = aktiv(lesen())
    if (!an) { if (window.fbq) { try { window.fbq('consent', 'revoke') } catch (e) {} } return }
    if (!geladen) {
      geladen = true; fbc()
      ;(function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = true; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = true; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s) })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
      window.fbq('set', 'autoConfig', false, PIXEL) // keine automatischen Klick-/Formular-Ereignisse
      window.fbq('init', PIXEL)
      window.fbq('track', 'PageView')
      return
    }
    try { window.fbq('consent', 'grant') } catch (e) {}
    window.fbq('track', 'PageView')
  }
  /** Ereignis melden (z. B. 'Lead'); ohne Einwilligung oder außerhalb öffentlicher Seiten passiert nichts. Keine E-Mail-Adressen übergeben! */
  window.bfkTrack = function (name, daten) { if (aktiv(lesen()) && window.fbq) window.fbq('track', name, daten || {}) }
  window.addEventListener('bfk-consent', pixel)
  window.addEventListener('hashchange', pixel)

  function start() { if (!lesen()) zeigen(false); else pixel() }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start()
})()
