(function(){
  'use strict';

  /* ════════════════════════════════════════════════════════════════════
     CONFIG — the only part of this file you should need to edit.
     ════════════════════════════════════════════════════════════════════ */
  var CONFIG = {

    /* Where demo requests are sent.
       Leave '' and the form only shows a thank-you (nothing is delivered).
       Put a URL here and the form POSTs JSON: {name, phone, outlet, outlets, city}
       — e.g. your own API, or a form service like Formspree/Web3Forms. */
    formEndpoint: '',

    /* WhatsApp business number, digits only, with country code. */
    whatsapp: '+91 7757833382',

    /* The two videos.
       Either a file you upload to assets/video/, or a YouTube/Vimeo link —
       both work, the player picks the right one automatically. */
    videos: {
      hero: {
        title: 'SIROO overview',
        src:   'assets/video/siroo-overview.mp4',
        poster:'',
        blurb: 'A two-minute look at how SIROO measures, prices and reports your stock.'
      },
      action: {
        title: 'SIROO in action',
        src:   'assets/video/siroo-in-action.mp4',
        poster:'',
        blurb: 'One full count, start to finish — scan a bottle, weigh it, and watch the value land in the report.'
      }
    }
  };
  /* ═══════════════════════ end of config ═══════════════════════════ */

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer:fine)').matches;
  document.getElementById('yr').textContent = new Date().getFullYear();
  document.getElementById('waLink').href =
    'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent("Hi SIROO, I'd like to book a demo");

  /* nav */
  var nav = document.getElementById('nav');
  function onScroll(){ nav.classList.toggle('stuck', window.scrollY > 24); }
  onScroll(); window.addEventListener('scroll', onScroll, {passive:true});
  var navMid = document.getElementById('navMid');
  document.getElementById('navToggle').addEventListener('click', function(){ navMid.classList.toggle('open'); });
  navMid.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ navMid.classList.remove('open'); }); });

  /* parallax on hero + video band */
  /* scroll progress — an affordance, so it runs even with reduced motion */
  var prog = document.getElementById('prog');
  function setProg(){
    var d = document.documentElement, max = d.scrollHeight - d.clientHeight;
    prog.style.transform = 'scaleX(' + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ')';
  }
  setProg(); window.addEventListener('scroll', setProg, {passive:true});
  window.addEventListener('resize', setProg);

  if(!reduce){
    var heroImg = document.getElementById('heroImg'), vidBg = document.getElementById('vidBg'),
        rails = [].slice.call(document.querySelectorAll('.railTrack')), tick = false;
    window.addEventListener('scroll', function(){
      if(tick) return; tick = true;
      requestAnimationFrame(function(){
        if(heroImg) heroImg.style.transform = 'translateY(' + (window.scrollY * 0.16) + 'px)';
        if(vidBg){
          var r = vidBg.parentNode.getBoundingClientRect();
          if(r.bottom > 0 && r.top < window.innerHeight){
            var p = (r.top + r.height/2 - window.innerHeight/2) / window.innerHeight;
            vidBg.style.transform = 'translateY(' + (p * 40) + 'px)';
          }
        }
        /* the rails lean into the scroll direction */
        rails.forEach(function(el, i){
          var rr = el.getBoundingClientRect();
          if(rr.bottom > 0 && rr.top < window.innerHeight){
            var q = (rr.top + rr.height/2 - window.innerHeight/2) / window.innerHeight;
            el.style.transform = 'translateX(' + (q * (i ? 34 : -34)) + 'px)';
          }
        });
        tick = false;
      });
    }, {passive:true});
  }

  /* reveal */
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:.12, rootMargin:'0px 0px -50px 0px'});
  document.querySelectorAll('.rv:not(.in)').forEach(function(el){ io.observe(el); });

  /* counters */
  function animateCount(el){
    var target = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || 0, 10),
        pre = el.dataset.prefix || '', suf = el.dataset.suffix || '', t0 = null, dur = 1500;
    function out(v){ return pre + (dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-IN')) + suf; }
    if(reduce){ el.textContent = out(target); return; }
    function tick(ts){
      if(!t0) t0 = ts;
      var p = Math.min((ts - t0)/dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = out(target * e);
      if(p < 1) requestAnimationFrame(tick); else el.textContent = out(target);
    }
    requestAnimationFrame(tick);
  }
  var cio = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting) return;
      animateCount(e.target);
      var card = e.target.closest('.statCard');
      if(card) card.classList.add('lit');
      cio.unobserve(e.target);
    });
  }, {threshold:.5});
  document.querySelectorAll('[data-count]').forEach(function(el){ cio.observe(el); });

  /* dashboard chart + donut */
  var dash = document.getElementById('dash');
  var dio = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting) return;
      document.getElementById('sparkLine').classList.add('draw');
      document.getElementById('sparkArea').classList.add('draw');
      var C = 2 * Math.PI * 15.9, off = 25;   /* start at 12 o'clock */
      document.querySelectorAll('#donut circle').forEach(function(c, i){
        var pct = parseFloat(c.dataset.pct);
        c.style.strokeDashoffset = -off * C / 100;
        setTimeout(function(){ c.style.strokeDasharray = (pct * C / 100) + ' ' + C; }, 160 * i);
        off += pct;
      });
      dio.unobserve(e.target);
    });
  }, {threshold:.35});
  if(dash) dio.observe(dash);

  /* 3D tilt on kit shots */
  if(!reduce && fine){
    document.querySelectorAll('[data-tilt]').forEach(function(el){
      el.addEventListener('mousemove', function(ev){
        var r = el.getBoundingClientRect();
        var px = (ev.clientX - r.left)/r.width - .5, py = (ev.clientY - r.top)/r.height - .5;
        el.style.transform = 'rotateY(' + (px*8) + 'deg) rotateX(' + (-py*8) + 'deg) translateZ(14px)';
      });
      el.addEventListener('mouseleave', function(){ el.style.transform = ''; });
    });
  }

  /* FAQ */
  document.querySelectorAll('.qa').forEach(function(qa){
    var btn = qa.querySelector('button'), ans = qa.querySelector('.ans');
    btn.setAttribute('aria-expanded','false');
    btn.addEventListener('click', function(){
      var open = qa.classList.contains('open');
      document.querySelectorAll('.qa.open').forEach(function(o){
        o.classList.remove('open'); o.querySelector('.ans').style.maxHeight = null;
        o.querySelector('button').setAttribute('aria-expanded','false');
      });
      if(!open){ qa.classList.add('open'); ans.style.maxHeight = ans.scrollHeight + 'px'; btn.setAttribute('aria-expanded','true'); }
    });
  });

  /* modals */
  var lastFocus = null;
  function openModal(id){
    lastFocus = document.activeElement;
    var m = document.getElementById(id);
    m.classList.add('show'); document.body.style.overflow = 'hidden';
    var f = m.querySelector('input, button'); if(f) setTimeout(function(){ f.focus(); }, 60);
  }
  function closeModals(){
    document.querySelectorAll('.modal.show').forEach(function(m){ m.classList.remove('show'); });
    document.body.style.overflow = ''; if(lastFocus) lastFocus.focus();
    stopPlayer();   /* kill playback so audio doesn't keep running */
  }
  document.querySelectorAll('[data-demo]').forEach(function(b){ b.addEventListener('click', function(e){ e.preventDefault(); openModal('demoModal'); }); });
  /* ── video player: builds the right element for whichever source you gave ── */
  var vidFrame = document.getElementById('vidFrame');
  function buildPlayer(key){
    var v = CONFIG.videos[key] || CONFIG.videos.hero;
    document.getElementById('vidTitle').textContent = v.title || 'How SIROO works';
    var src = (v.src || '').trim();
    vidFrame.innerHTML = '';

    if(!src){
      vidFrame.innerHTML = '<div class="placeholder"><button class="playBig" style="pointer-events:none"></button>' +
        '<h3>' + (v.title || '') + '</h3><p>' + (v.blurb || '') + '</p></div>';
      return;
    }
    var yt = src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/);
    var vm = src.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if(yt || vm){
      var url = yt ? 'https://www.youtube.com/embed/' + yt[1] + '?autoplay=1&rel=0'
                   : 'https://player.vimeo.com/video/' + vm[1] + '?autoplay=1';
      var f = document.createElement('iframe');
      f.src = url; f.allow = 'autoplay; fullscreen; picture-in-picture'; f.allowFullscreen = true;
      vidFrame.appendChild(f);
    } else {
      var el = document.createElement('video');
      el.src = src; el.controls = true; el.autoplay = true; el.playsInline = true;
      if(v.poster) el.poster = v.poster;
      vidFrame.appendChild(el);
    }
  }
  function stopPlayer(){ if(vidFrame) vidFrame.innerHTML = ''; }

  document.querySelectorAll('[data-video]').forEach(function(b){
    b.addEventListener('click', function(){
      buildPlayer(b.getAttribute('data-video') || 'hero');
      openModal('videoModal');
    });
  });
  document.querySelectorAll('[data-close]').forEach(function(b){ b.addEventListener('click', closeModals); });
  document.querySelectorAll('.modal').forEach(function(m){ m.addEventListener('click', function(e){ if(e.target === m) closeModals(); }); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeModals(); });

  /* demo form — front-end only; wire this to your backend */
  var sendBtn = document.getElementById('sendDemo');
  sendBtn.addEventListener('click', function(){
    var name  = document.getElementById('f-name').value.trim();
    var phone = document.getElementById('f-phone').value.trim();
    if(!name || !phone){
      var el = document.getElementById(!name ? 'f-name' : 'f-phone');
      el.style.borderColor = '#ff7043'; el.focus();
      setTimeout(function(){ el.style.borderColor = ''; }, 1800);
      return;
    }
    var payload = {
      name: name, phone: phone,
      outlet:  document.getElementById('f-outlet').value.trim(),
      outlets: document.getElementById('f-count').value,
      city:    document.getElementById('f-city').value.trim(),
      source:  'siroo-landing', at: new Date().toISOString()
    };

    function done(){
      document.getElementById('demoForm').style.display = 'none';
      document.getElementById('demoDone').style.display = 'block';
    }
    function failed(msg){
      sendBtn.disabled = false; sendBtn.textContent = 'Request my demo';
      var w = document.getElementById('demoErr');
      w.textContent = msg; w.style.display = 'block';
    }

    if(!CONFIG.formEndpoint){
      /* No endpoint set — nothing is delivered anywhere. */
      console.warn('SIROO: CONFIG.formEndpoint is empty, so this demo request was NOT sent. ' +
                   'Set it in assets/js/main.js before going live.', payload);
      done(); return;
    }

    sendBtn.disabled = true; sendBtn.textContent = 'Sending…';
    fetch(CONFIG.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function(r){
      if(!r.ok) throw new Error('HTTP ' + r.status);
      done();
    }).catch(function(err){
      console.error('SIROO: demo request failed', err);
      failed('Could not send just now. Please WhatsApp us instead — the button below works.');
    });
  });
  /* newsletter — also front-end only */
  document.getElementById('newsBtn').addEventListener('click', function(){
    var i = document.getElementById('newsEmail');
    if(!i.value.trim() || i.value.indexOf('@') < 0){
      i.style.borderColor = '#ff7043'; i.focus();
      setTimeout(function(){ i.style.borderColor = ''; }, 1800); return;
    }
    i.value = ''; i.placeholder = 'Thanks — you\u2019re on the list';
  });

  /* draft tap pour */
  (function(){
    var stream = document.querySelector('.pourStream'), fill = document.querySelector('.beerFill'), head = document.querySelector('.beerHead');
    if(!stream || !fill || !head) return;
    var GB = 282, FULL = 92, HEAD = 15, ST = 150;
    var tms = [], praf = null, on = false;
    function pc(){ tms.forEach(clearTimeout); tms = []; if(praf) cancelAnimationFrame(praf); }
    function pl(fn, ms){ tms.push(setTimeout(fn, ms)); }
    function setBeer(f){
      var bh = FULL * f;
      fill.setAttribute('y', GB - bh); fill.setAttribute('height', bh);
      var hh = f > .03 ? HEAD : 0;
      head.setAttribute('y', GB - bh - hh); head.setAttribute('height', hh);
    }
    function setStream(o, bh){ stream.setAttribute('height', o ? Math.max(0, (GB - (bh||0)) - ST) : 0); }
    function cycle(){
      if(!on) return;
      setBeer(0); setStream(false);
      pl(function(){
        setStream(true, 0);
        var t0 = null, dur = 2600;
        function tick(ts){
          if(!on) return;
          if(!t0) t0 = ts;
          var p = Math.min((ts - t0)/dur, 1), f = 1 - Math.pow(1 - p, 2);
          setBeer(f); setStream(true, FULL * f);
          if(p < 1) praf = requestAnimationFrame(tick);
          else { setStream(false); pl(cycle, 3200); }
        }
        praf = requestAnimationFrame(tick);
      }, 700);
    }
    if(reduce){ setBeer(1); setStream(false); return; }
    var tio = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting && !on){ on = true; cycle(); }
        else if(!e.isIntersecting && on){ on = false; pc(); }
      });
    }, {threshold:.3});
    tio.observe(stream.closest('svg'));
  })();

  /* how-it-works bottle — remaining ML only */
  var POURS = [
    {name:'Glenfiddich 12', meta:'750 ML bottle · Main Bar',   label:'SINGLE MALT',   size:750,  left:460},
    {name:'Tanqueray',      meta:'750 ML bottle · Main Bar',   label:'LONDON DRY',    size:750,  left:241},
    {name:'Jameson',        meta:'1000 ML bottle · Terrace',   label:'IRISH WHISKEY', size:1000, left:713},
    {name:'Bacardi White',  meta:'750 ML bottle · Stock Room', label:'WHITE RUM',     size:750,  left:520}
  ];
  var hiwEmpty = document.getElementById('hiwEmpty'), hiwLine = document.getElementById('hiwLine'),
      mlOut = document.getElementById('mlOut'), pourOut = document.getElementById('pourOut'),
      bName = document.getElementById('bName'), bMeta = document.getElementById('bMeta'),
      lblName = document.getElementById('lblName'), steps = document.querySelectorAll('.stepItem');
  /* where the liquid sits in the bottle photo, as % from the top */
  var LVL_FULL = 17, LVL_EMPTY = 95, idx = 0, timers = [], raf = null;
  function clearAll(){ timers.forEach(clearTimeout); timers = []; if(raf) cancelAnimationFrame(raf); }
  function later(fn, ms){ timers.push(setTimeout(fn, ms)); }
  function lightStep(i){ steps.forEach(function(s, n){ s.classList.toggle('on', n === i); }); }
  function setLevel(ml, size){
    var frac = Math.max(0, Math.min(ml / size, 1));
    var lvl = LVL_EMPTY - (LVL_EMPTY - LVL_FULL) * frac;    /* % from the top */
    hiwEmpty.style.setProperty('--cut', (100 - lvl) + '%'); /* drained twin covers down to the level */
    hiwLine.style.setProperty('--lvl', lvl + '%');
  }
  function tween(from, to, dur, upd, done){
    if(reduce){ upd(to); if(done) done(); return; }
    var t0 = null;
    function tick(ts){
      if(!t0) t0 = ts;
      var p = Math.min((ts - t0)/dur, 1), e = 1 - Math.pow(1 - p, 3);
      upd(from + (to - from) * e);
      if(p < 1) raf = requestAnimationFrame(tick); else { upd(to); if(done) done(); }
    }
    raf = requestAnimationFrame(tick);
  }
  function runPour(){
    var b = POURS[idx], startMl = Math.min(b.size, Math.round(b.left + b.size * 0.34));
    bName.textContent = b.name; bMeta.textContent = b.meta; lblName.textContent = b.label;
    lightStep(0); setLevel(startMl, b.size);
    mlOut.textContent = Math.round(startMl).toLocaleString('en-IN'); pourOut.textContent = '0';
    later(function(){
      lightStep(1);
      tween(startMl, b.left, 1500, function(v){
        setLevel(v, b.size);
        mlOut.textContent = Math.round(v).toLocaleString('en-IN');
        pourOut.textContent = Math.round(startMl - v).toLocaleString('en-IN');
      }, function(){
        later(function(){ lightStep(2); }, 260);
        later(function(){ idx = (idx + 1) % POURS.length; runPour(); }, 3000);
      });
    }, 900);
  }
  var stageEl = document.querySelector('.bottleStage'), running = false;
  var sio = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting && !running){ running = true; runPour(); }
      else if(!e.isIntersecting && running){ running = false; clearAll(); }
    });
  }, {threshold:.25});
  if(stageEl) sio.observe(stageEl);
})();
