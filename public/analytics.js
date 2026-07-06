/* silkvelvetrecords.com — privacy-first beacon. No cookies, no IP, no
   fingerprinting. Posts path + referrer + UA + a daily-rotating session id to
   the site-visit Edge Function. Content renders fine without this file. */
(function () {
  try {
    var EP = 'https://fitpvesrrirezbndkelo.supabase.co/functions/v1/site-visit';
    var key = 'svhive_sid';
    var today = new Date().toISOString().slice(0, 10);
    var sid;
    try { var o = JSON.parse(localStorage.getItem(key) || 'null'); if (o && o.d === today) sid = o.s; } catch (e) {}
    if (!sid) {
      sid = today + '-' + Math.random().toString(36).slice(2, 10);
      try { localStorage.setItem(key, JSON.stringify({ d: today, s: sid })); } catch (e) {}
    }
    var body = JSON.stringify({
      path: location.pathname,
      referrer: document.referrer || '',
      ua: navigator.userAgent,
      session_id: sid,
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(EP, new Blob([body], { type: 'application/json' }));
    } else {
      fetch(EP, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true });
    }
  } catch (e) { /* analytics never breaks the page */ }
})();
