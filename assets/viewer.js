
const items = [
  {src:'assets/images/work-01.jpg'},
  {src:'assets/images/work-02.jpg'},
  {src:'assets/images/work-03.jpg'},
  {src:'assets/images/work-04.jpg'},
  {src:'assets/images/work-05.jpg'},
  {src:'assets/images/work-06.jpg'},
  {src:'assets/images/work-07.jpg'},
  {src:'assets/images/work-08.jpg'},
];

function getIndex(){
  const params = new URLSearchParams(window.location.search);
  const i = parseInt(params.get('i') || '0',10);
  return isNaN(i)?0:Math.max(0,Math.min(items.length-1,i));
}

let i = getIndex();

function render(){
  document.getElementById('viewerImg').src = items[i].src;
  document.getElementById('counter').textContent = (i+1)+" / "+items.length;
}

function next(){ i=(i+1)%items.length; render(); }
function prev(){ i=(i-1+items.length)%items.length; render(); }

document.getElementById('nextBtn')?.addEventListener('click',next);
document.getElementById('prevBtn')?.addEventListener('click',prev);

document.addEventListener('keydown',e=>{
  if(e.key==='ArrowRight') next();
  if(e.key==='ArrowLeft') prev();
});

render();
