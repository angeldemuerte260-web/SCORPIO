const $=id=>document.getElementById(id),K={bookings:'bn_bookings',settings:'bn_settings',branches:'bn_branches',barbers:'bn_barbers'};
const read=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const defaultBranches=[{id:1,name:'Sucursal Centro',address:'Av. Principal #123, Centro',mapsUrl:'',phone:'',hours:'Lun a Sáb · 09:00 - 20:00'},{id:2,name:'Sucursal Norte',address:'Calle Los Pinos #456, Zona Norte',mapsUrl:'',phone:'',hours:'Lun a Sáb · 10:00 - 19:00'}];
const defaultBarbers=[{id:1,name:'Carlos',branchId:1,specialty:'Degradados',available:true},{id:2,name:'Diego',branchId:1,specialty:'Barba y perfilado',available:true},{id:3,name:'Mateo',branchId:2,specialty:'Corte clásico',available:true},{id:4,name:'Luis',branchId:2,specialty:'Diseños',available:false}];
const HOURS=Array.from({length:12},(_,i)=>String(i+9).padStart(2,'0')+':00');
const toMin=t=>{const [h,m]=String(t||'0:0').split(':').map(Number);return (h||0)*60+(m||0)};
const fmtMin=n=>{n=Math.min(Math.max(n,0),1439);return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0')};
const range=r=>r.time+'–'+fmtMin(toMin(r.time)+(Number(r.duration)||60));
const params=new URLSearchParams(location.search),onlyBarber=params.get('barbero');
let branchFilter=params.get('sucursal')||'';
const todayStr=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const s=read(K.settings,{}),name=s.name||'Barbería Nova';$('brandName').textContent=name.toUpperCase();$('footerName').textContent=name;
$('agendaDate').value=todayStr();$('agendaDate').min=todayStr();

function render(){
 const branches=read(K.branches,defaultBranches),barbers=read(K.barbers,defaultBarbers),bookings=read(K.bookings);
 const date=$('agendaDate').value||todayStr(),now=new Date();
 if(branchFilter&&!branches.some(b=>String(b.id)===branchFilter))branchFilter='';
 $('agendaBranch').innerHTML='<option value="">Todas las sucursales</option>'+branches.map(b=>`<option value="${b.id}">${esc(b.name)}</option>`).join('');
 $('agendaBranch').value=branchFilter;
 const list=barbers.filter(x=>(!branchFilter||String(x.branchId)===branchFilter)&&(!onlyBarber||String(x.id)===onlyBarber));
 $('agendaNote').classList.toggle('hidden',!onlyBarber);
 $('agendaNote').innerHTML=onlyBarber?'Estás viendo un solo barbero. <a href="barberos.html">Ver todos los barberos</a>':'';
 $('agendaList').innerHTML=list.map(x=>{
  const br=branches.find(b=>String(b.id)===String(x.branchId));
  const mine=bookings.filter(r=>String(r.barberId)===String(x.id)&&r.date===date&&r.status!=='Cancelada');
  let body,summary='';
  if(!x.available){body='<p class="muted">Este barbero no está disponible para reservas por ahora.</p>'}
  else{
   let free=0;
   const cells=HOURS.map(h=>{
    const busy=mine.some(r=>toMin(r.time)<toMin(h)+60&&toMin(r.time)+(Number(r.duration)||60)>toMin(h)),past=new Date(`${date}T${h}`)<=now;
    if(busy)return `<span class="slot busy">${h}<small>Reservado</small></span>`;
    if(past)return `<span class="slot past">${h}<small>Pasado</small></span>`;
    free++;
    const q=new URLSearchParams({branch:x.branchId,barber:x.id,date,time:h});
    return `<a class="slot free" href="../index.html?${q}#reservar">${h}<small>Libre</small></a>`}).join('');
   const times=mine.slice().sort((a,c)=>toMin(a.time)-toMin(c.time)).map(range);
   summary=`<p class="muted">${mine.length} reserva(s) · ${free} horario(s) libre(s)${times.length?' · Horas reservadas: '+times.map(esc).join(', '):''}</p>`;
   body=`<div class="slot-grid">${cells}</div>`}
  return `<article class="panel agenda-card" id="barbero-${x.id}"><div class="agenda-head"><div><h2>${esc(x.name)}</h2><p class="muted">${esc(br?br.name:'Sin sucursal')}${x.specialty?' · '+esc(x.specialty):''}</p><p>${socialLinksHtml(x)}</p></div><span class="badge ${x.available?'on':'off'}">${x.available?'Disponible':'No disponible'}</span></div>${summary}${body}</article>`}).join('')||'<p>No hay barberos registrados.</p>';
}
$('agendaDate').addEventListener('change',render);
$('agendaBranch').addEventListener('change',()=>{branchFilter=$('agendaBranch').value;render()});
window.addEventListener('storage',render);setInterval(render,60000);
render();
