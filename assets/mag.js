// JS-mode for reveal fallback
document.documentElement.classList.add('js');

const htmlEl = document.documentElement;
const metaTheme = document.querySelector('meta[name="theme-color"]');

// Mobile menu
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
hamburger?.addEventListener('click', ()=>{
  const open = nav?.classList.toggle('show');
  hamburger.setAttribute('aria-expanded', String(!!open));
});

// Appearance menu: theme + accent
const btn = document.getElementById('theme-button');
const menu = document.getElementById('theme-menu');
const items = menu?.querySelectorAll('.item');
const swatches = menu?.querySelectorAll('.swatch');
const mediaDark = window.matchMedia('(prefers-color-scheme: dark)');

function resolvedTheme(opt){ return opt === 'system' ? (mediaDark.matches ? 'dark' : 'light') : opt; }
function applyTheme(option){
  const theme = resolvedTheme(option);
  htmlEl.setAttribute('data-theme', theme);
  htmlEl.dataset.themeOption = option;
  metaTheme?.setAttribute('content', getComputedStyle(htmlEl).getPropertyValue('--bg').trim());
  items?.forEach(i=> i.setAttribute('aria-checked', String(i.dataset.theme === option)));
}
function applyAccent(name){ htmlEl.setAttribute('data-accent', name); localStorage.setItem('accent', name); }
function getSavedThemeOption(){ return localStorage.getItem('themeOption') || 'system'; }
function setThemeOption(option){ localStorage.setItem('themeOption', option); applyTheme(option); }
function toggleMenu(open){
  if (!menu || !btn) return;
  const willOpen = open ?? !menu.classList.contains('open');
  menu.classList.toggle('open', willOpen);
  btn.setAttribute('aria-expanded', String(willOpen));
}
btn?.addEventListener('click', ()=>toggleMenu());
document.addEventListener('click', (e)=>{
  if (!menu || !btn) return;
  if (menu.contains(e.target) || btn.contains(e.target)) return;
  toggleMenu(false);
});
document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') toggleMenu(false); });
items?.forEach(i => i.addEventListener('click', ()=>{ setThemeOption(i.dataset.theme); toggleMenu(false); }));
swatches?.forEach(s => s.addEventListener('click', ()=>{ applyAccent(s.dataset.accent); }));
mediaDark.addEventListener?.('change', ()=>{ if ((localStorage.getItem('themeOption')||'system') === 'system') applyTheme('system'); });

// init
applyTheme(getSavedThemeOption());
applyAccent(localStorage.getItem('accent') || 'clay');

// Reveal on scroll
const revealEls = document.querySelectorAll('[data-reveal]');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('reveal-in');
      io.unobserve(entry.target);
    }
  });
},{ threshold:0.12 });
revealEls.forEach(el=>io.observe(el));

// Search (demo)
const searchForm = document.querySelector('.search');
searchForm?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const q = searchForm.querySelector('input')?.value?.trim();
  if (!q) return;
  alert('جستجو برای: ' + q);
});

// Load more (demo)
const moreBtn = document.getElementById('load-more');
const latestGrid = document.getElementById('latest-grid');
let seedCount = 4;
function makeCard(seed){
  const wrap = document.createElement('article');
  wrap.className = 'post sheet';
  wrap.setAttribute('data-reveal','');
  wrap.innerHTML = `
    <a class="sheet-link" href="#">
      <img src="https://picsum.photos/seed/post-${seed}/800/520" alt="خبر جدید ${seed}" width="800" height="520" loading="lazy" decoding="async">
      <div class="info stack">
        <span class="badge cat-tech">فناوری</span>
        <h3 class="title">تیتر نمونه شماره ${seed}</h3>
        <p class="muted">خلاصه کوتاه خبر برای نمایش اولیه.</p>
      </div>
    </a>`;
  return wrap;
}
moreBtn?.addEventListener('click', ()=>{
  for(let i=0;i<3;i++){
    const card = makeCard(seedCount++);
    latestGrid?.appendChild(card);
    io.observe(card);
  }
});

// Headlines slider controls
const track = document.getElementById('hl-track');
const prev = document.getElementById('hl-prev');
const next = document.getElementById('hl-next');
function scrollSlides(dir){
  if (!track) return;
  const amount = track.clientWidth * 0.88; // مرتب و ثابت
  const rtl = document.dir === 'rtl';
  track.scrollBy({ left: (rtl ? -dir : dir) * amount, behavior:'smooth' });
}
prev?.addEventListener('click', ()=>scrollSlides(-1));
next?.addEventListener('click', ()=>scrollSlides(1));
function placeThemeMenu(){
  if (!menu || !btn || !menu.classList.contains('open')) return;
  const gap = 8;
  const br = btn.getBoundingClientRect();

  // برای اندازه‌گیری دقیق، منو باید قابل‌نمایش باشد
  // (الان open هست، پس ابعاد درسته)
  const mw = menu.offsetWidth || 220;
  const mh = menu.offsetHeight || 280;

  // پیش‌فرض: هم‌تراز با لبه راست دکمه (در مختصات ویوپورت)
  let left = br.right - mw;            // راستِ دکمه منهای عرض منو
  let top  = br.bottom + gap;          // پایینِ دکمه + فاصله

  // کلمپ افقی داخل ویوپورت
  left = Math.max(gap, Math.min(left, window.innerWidth - mw - gap));

  // اگر جا نشد، به بالا فلِپ کن
  if (top + mh > window.innerHeight - gap) {
    top = Math.max(gap, br.top - mh - gap);
  }

  // اطمینان از اینکه ارتفاع از ویوپورت بیشتر نشه
  const availH = Math.max(160, window.innerHeight - 2*gap);
  menu.style.maxHeight = Math.min(availH, 420) + 'px';

  // ست‌کردن مختصات
  menu.style.left = left + 'px';
  menu.style.top  = top  + 'px';
}