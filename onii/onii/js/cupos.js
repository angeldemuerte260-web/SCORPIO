const $=id=>document.getElementById(id),read=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const defaultCourses=[{id:1,name:'Barbería básica',price:350,description:'Fundamentos, herramientas y técnicas iniciales.',cupos:20,inicio:'',horario:''},{id:2,name:'Degradados y diseños',price:450,description:'Técnicas de fade y diseños.',cupos:15,inicio:'',horario:''}];
const s=read('bn_settings',{});$('brandName').textContent=(s.name||'Barbería Nova').toUpperCase();$('footerName').textContent=s.name||'Barbería Nova';
const taken=c=>read('bn_students').filter(x=>String(x.courseId)===String(c.id)&&x.paymentStatus!=='Rechazado').length;
function render(){
 const courses=read('bn_courses',defaultCourses);
 $('cuposList').innerHTML=courses.map(c=>{
  const cap=Number(c.cupos)>0?Number(c.cupos):null,used=taken(c),left=cap===null?null:Math.max(0,cap-used),pct=cap?Math.min(100,Math.round(used/cap*100)):0;
  const state=cap===null?['on','Sin límite']:left===0?['off','Cupos agotados']:left<=Math.max(2,Math.ceil(cap*.2))?['warn','Últimos cupos']:['on','Cupos disponibles'];
  return `<article class="panel cupo-card"><div class="agenda-head"><div><h2>${esc(c.name)}</h2><p class="muted">${esc(c.description||'')}</p>${c.inicio||c.horario?`<p class="muted">${c.inicio?'Inicio: '+esc(c.inicio):''}${c.inicio&&c.horario?' · ':''}${c.horario?esc(c.horario):''}</p>`:''}</div><span class="badge ${state[0]}">${state[1]}</span></div>
  ${cap===null?'<p>Este curso no tiene límite de cupos.</p>':`<div class="progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span class="${state[0]}" style="width:${pct}%"></span></div><p><b>${used}</b> de <b>${cap}</b> cupos ocupados · <b>${left}</b> disponible(s)</p>`}
  <p class="price">Bs. ${Number(c.price).toFixed(2)}</p>
  ${left===0?'<span class="outline-btn disabled-btn">Sin cupos</span>':`<a class="gold-btn" href="academia.html?curso=${c.id}">Reservar cupo e inscribirme</a>`}</article>`}).join('')||'<p>No hay cursos publicados.</p>';
}
window.addEventListener('storage',render);setInterval(render,60000);render();
