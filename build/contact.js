(function () {
  var TO = 'hello@suresh.app';
  var form = document.getElementById('contact-form');
  if (!form) return;
  var status = form.querySelector('.form-status');
  var btn = form.querySelector('.submit');
  var endpoint = (form.getAttribute('data-endpoint') || '').trim();

  // keep the smooth-scroll library from swallowing keys while typing
  ['keydown', 'keyup', 'keypress', 'wheel'].forEach(function (ev) {
    form.addEventListener(ev, function (e) { e.stopPropagation(); }, false);
  });

  function say(msg, type) {
    status.textContent = msg;
    status.className = 'form-status ' + (type || '');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.name.value.trim();
    var email = form.email.value.trim();
    var message = form.message.value.trim();

    if (form._gotcha && form._gotcha.value) return; // bot
    if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      say('Please fill in your name, a valid email and a message.', 'error');
      return;
    }

    // No endpoint configured: open the visitor's mail app, addressed to hello@suresh.app
    if (!endpoint) {
      var subject = encodeURIComponent('Message from ' + name);
      var body = encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')');
      window.location.href = 'mailto:' + TO + '?subject=' + subject + '&body=' + body;
      say('Opening your email app…', 'ok');
      return;
    }

    btn.disabled = true;
    say('Sending…');
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ name: name, email: email, message: message, _replyto: email, _subject: 'Message from ' + name })
    }).then(function (r) {
      if (!r.ok) throw new Error('bad status');
      form.reset();
      say('Thanks! Your message has been sent.', 'ok');
    }).catch(function () {
      say('Something went wrong. Please email ' + TO + ' directly.', 'error');
    }).then(function () { btn.disabled = false; });
  });
})();