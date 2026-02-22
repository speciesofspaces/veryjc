function qs(name, fallback=null){
  const p = new URLSearchParams(window.location.search);
  return p.get(name) ?? fallback;
}

const type = (qs('type','project') || 'project').toLowerCase();
const slug = qs('slug','the-meadow');
const n = Math.max(1, Math.min(200, parseInt(qs('n','6'),10) || 6));
let i = Math.max(0, Math.min(n-1, parseInt(qs('i','0'),10) || 0));

function pad2(x){ return String(x).padStart(2,'0'); }

function srcFor(idx){
  const file = pad2(idx+1) + '.jpg';
  if(type === 'studies'){
    return `assets/images/studies/${file}`;
  }
  return `assets/images/projects/${slug}/${file}`;
}

function titleFor(){
  if(type === 'studies') return 'Studies';
  if(slug === 'the-meadow') return 'The Meadow';
  if(slug === 'project2') return 'Project 2';
  return slug.replace(/-/g,' ');
}

function backHref(){
  if(type === 'studies') return 'studies.html';
  return 'projects.html';
}

function render(){
  const img = document.getElementById('viewerImg');
  const counter = document.getElementById('counter');
  const title = document.getElementById('viewerTitle');
  const back = document.getElementById('backLink');

  img.src = srcFor(i);
  img.alt = titleFor();

  counter.textContent = `${i+1} / ${n}`;
  title.textContent = titleFor();
  back.href = backHref();

  const p = new URLSearchParams(window.location.search);
  p.set('i', String(i));
  history.replaceState(null, '', `${window.location.pathname}?${p.toString()}`);
}

function next(){ i = (i+1) % n; render(); }
function prev(){ i = (i-1+n) % n; render(); }

document.getElementById('nextBtn')?.addEventListener('click', next);
document.getElementById('prevBtn')?.addEventListener('click', prev);

document.addEventListener('keydown', e => {
  if(e.key === 'ArrowRight') next();
  if(e.key === 'ArrowLeft') prev();
});

render();
