/* Weilburg-TV – Navigation, Video-Vorschauen, Galerien, Lightbox */
(function () {
  'use strict';

  /* ---------- Navigation ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }
  document.querySelectorAll('.sub-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.sub-toggle').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
      btn.setAttribute('aria-expanded', String(!expanded));
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-sub')) {
      document.querySelectorAll('.sub-toggle').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.sub-toggle').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    }
  });

  /* ---------- Videos (Vorschau erst laden, Player erst beim Klick) ---------- */
  function parseVimeo(id) {
    var parts = String(id).split('/');
    return { id: parts[0], hash: parts[1] || '' };
  }

  function pageUrl(provider, id) {
    if (provider === 'youtube') return 'https://www.youtube.com/watch?v=' + id;
    var v = parseVimeo(id);
    return 'https://vimeo.com/' + v.id + (v.hash ? '/' + v.hash : '');
  }

  function playerUrl(provider, id) {
    if (provider === 'youtube') return 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
    var v = parseVimeo(id);
    return 'https://player.vimeo.com/video/' + v.id + '?autoplay=1&dnt=1' + (v.hash ? '&h=' + v.hash : '');
  }

  function loadMeta(card) {
    if (card.dataset.metaLoaded) return;
    card.dataset.metaLoaded = '1';
    var provider = card.dataset.provider;
    var id = card.dataset.id;
    var img = card.querySelector('.video-play img');
    var titleEl = card.querySelector('.video-title');

    if (provider === 'youtube') {
      img.src = 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
    }
    var endpoint = provider === 'youtube'
      ? 'https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent(pageUrl(provider, id))
      : 'https://vimeo.com/api/oembed.json?width=640&url=' + encodeURIComponent(pageUrl(provider, id));

    fetch(endpoint).then(function (r) { return r.ok ? r.json() : null; }).then(function (data) {
      if (!data) return;
      if (provider === 'vimeo' && data.thumbnail_url) img.src = data.thumbnail_url;
      if (data.title) {
        img.alt = data.title;
        card.querySelector('.video-play').setAttribute('aria-label', 'Video abspielen: ' + data.title);
        if (titleEl) titleEl.textContent = data.title;
      }
    }).catch(function () { /* Vorschau ist optional */ });
  }

  var observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          loadMeta(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '300px 0px' })
    : null;

  function setupCard(card) {
    var provider = card.dataset.provider;
    var id = card.dataset.id;
    var frame = document.createElement('div');
    frame.className = 'video-frame';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'video-play';
    btn.setAttribute('aria-label', 'Video abspielen');
    var img = document.createElement('img');
    img.alt = '';
    img.decoding = 'async';
    img.addEventListener('load', function () { img.classList.add('loaded'); });
    btn.appendChild(img);
    var badge = document.createElement('span');
    badge.className = 'video-provider';
    badge.textContent = provider === 'youtube' ? 'YouTube' : 'Vimeo';
    frame.appendChild(badge);
    frame.appendChild(btn);

    btn.addEventListener('click', function () {
      var iframe = document.createElement('iframe');
      iframe.src = playerUrl(provider, id);
      iframe.title = img.alt || 'Video';
      iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
      iframe.allowFullscreen = true;
      frame.innerHTML = '';
      frame.appendChild(iframe);
    });

    var fallback = card.querySelector('.video-fallback');
    if (fallback) fallback.remove();
    card.insertBefore(frame, card.firstChild);
    if (!card.querySelector('figcaption') && !card.querySelector('.video-title')) {
      var t = document.createElement('div');
      t.className = 'video-title';
      card.appendChild(t);
    }
    if (observer) observer.observe(card); else loadMeta(card);
  }

  function makeCard(provider, id) {
    var card = document.createElement('div');
    card.className = 'video-card';
    card.dataset.provider = provider;
    card.dataset.id = id;
    setupCard(card);
    return card;
  }

  document.querySelectorAll('.video-card[data-id]').forEach(setupCard);

  document.querySelectorAll('.video-gallery').forEach(function (gallery) {
    var provider = gallery.dataset.provider;
    var ids = (gallery.dataset.ids || '').split(',').filter(Boolean);
    var step = parseInt(gallery.dataset.step || '12', 10);
    var shown = 0;
    var grid = gallery.querySelector('.video-grid');
    var noscript = gallery.querySelector('.video-noscript');
    if (noscript) noscript.remove();

    var more = document.createElement('div');
    more.className = 'gallery-more';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-outline';
    var info = document.createElement('small');
    more.appendChild(btn);
    more.appendChild(info);
    gallery.appendChild(more);

    function render() {
      var next = ids.slice(shown, shown + step);
      next.forEach(function (id) { grid.appendChild(makeCard(provider, id)); });
      shown += next.length;
      info.textContent = shown + ' von ' + ids.length + ' Videos';
      btn.textContent = 'Weitere Videos anzeigen';
      more.hidden = ids.length <= step && shown >= ids.length;
      btn.hidden = shown >= ids.length;
    }
    btn.addEventListener('click', render);
    render();
  });

  /* ---------- Lightbox ---------- */
  var links = document.querySelectorAll('a[data-lightbox]');
  if (links.length && typeof HTMLDialogElement === 'function') {
    var dlg = document.createElement('dialog');
    dlg.className = 'lightbox';
    dlg.innerHTML = '<button class="lightbox-close" type="button" aria-label="Schließen">×</button><img alt=""><p></p>';
    document.body.appendChild(dlg);
    var dImg = dlg.querySelector('img');
    var dCap = dlg.querySelector('p');
    dlg.querySelector('.lightbox-close').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        dImg.src = a.getAttribute('href');
        dImg.alt = a.dataset.caption || '';
        dCap.textContent = a.dataset.caption || '';
        dlg.showModal();
      });
    });
  }

  /* ---------- Nach oben ---------- */
  var top = document.querySelector('.to-top');
  if (top) {
    window.addEventListener('scroll', function () {
      top.classList.toggle('show', window.scrollY > 700);
    }, { passive: true });
    top.addEventListener('click', function () { window.scrollTo({ top: 0 }); });
  }
})();
