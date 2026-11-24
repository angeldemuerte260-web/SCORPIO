const $=id=>document.getElementById(id),K={products:'bn_products',cats:'bn_categories',bookings:'bn_bookings',students:'bn_students',settings:'bn_settings',courses:'bn_courses',warning:'bn_warning',qr:'bn_qr',branches:'bn_branches',barbers:'bn_barbers',cuts:'bn_cuts'},read=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},save=(k,v)=>localStorage.setItem(k,JSON.stringify(v)),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));let products=read(K.products,[{id:1,nombre:'Corte clásico',descripcion:'Corte tradicional a elección.',precio:25,categoria:'Clásico',img:''},{id:2,nombre:'Degradado',descripcion:'Degradado personalizado.',precio:30,categoria:'Degradado',img:''}]),cats=read(K.cats,['Clásico','Degradado','Taper','Diseños','Barba']),courses=read(K.courses,[{id:1,name:'Barbería básica',price:350,description:'Fundamentos, herramientas y técnicas iniciales.',cupos:20,inicio:'',horario:''},{id:2,name:'Degradados y diseños',price:450,description:'Técnicas de fade y diseños.',cupos:15,inicio:'',horario:''}]),bgData=null,serviceImageData=null;
$('loginForm').addEventListener('submit',e=>{e.preventDefault();if($('adminPass').value!=='nova123'){alert('Contraseña incorrecta');return}$('loginBox').classList.add('hidden');$('adminContent').classList.remove('hidden');loadAll()});$('logout').onclick=()=>{ $('adminContent').classList.add('hidden');$('loginBox').classList.remove('hidden');$('adminPass').value=''};
function settings(){let s=read(K.settings,{});$('siteName').value=s.name||'Barbería Nova';$('siteFacebook').value=s.facebook||'';$('siteTikTok').value=s.tiktok||'';$('siteAdvance').value=s.advance??10;$('tagline').value=s.tagline||'Tu estilo, en las mejores manos';if(s.background){$('backgroundPreviewImg').src=s.background;$('backgroundPreview').classList.remove('hidden')}$('warningText').value=localStorage.getItem(K.warning)||'';let qr=localStorage.getItem(K.qr);if(qr){$('qrPreview').src=qr}else $('qrPreview').removeAttribute('src')}
function compress(file,max=1000){return new Promise((res,rej)=>{if(!file){res(null);return}if(!file.type.startsWith('image/')||file.size>6*1024*1024){rej(Error('Selecciona una imagen de máximo 6 MB.'));return}let rd=new FileReader();rd.onload=e=>{let im=new Image();im.onload=()=>{let sc=Math.min(1,max/im.width,max/im.height),c=document.createElement('canvas');c.width=Math.round(im.width*sc);c.height=Math.round(im.height*sc);c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.78))};im.onerror=()=>rej(Error('Imagen no válida'));im.src=e.target.result};rd.onerror=()=>rej(Error('No se pudo leer la imagen'));rd.readAsDataURL(file)})}
$('backgroundFile').onchange=async()=>{try{bgData=await compress($('backgroundFile').files[0],1600);if(bgData){$('backgroundPreviewImg').src=bgData;$('backgroundPreview').classList.remove('hidden')}}catch(e){alert(e.message)}};$('settingsForm').onsubmit=e=>{e.preventDefault();let old=read(K.settings,{}),fb=socialUrl($('siteFacebook').value,'facebook'),tk=socialUrl($('siteTikTok').value,'tiktok');if($('siteFacebook').value.trim()&&!fb){alert('El enlace de Facebook no es válido.');return}if($('siteTikTok').value.trim()&&!tk){alert('El enlace de TikTok no es válido.');return}$('siteFacebook').value=fb;$('siteTikTok').value=tk;save(K.settings,{advance:$('siteAdvance').value===''?10:Math.max(0,Number($('siteAdvance').value)),facebook:fb,tiktok:tk,name:$('siteName').value.trim(),tagline:$('tagline').value.trim(),background:bgData||old.background||''});$('settingsMsg').textContent='Nombre y presentación guardados.';ctRefreshMin()};
function renderCats(){$('categoriesList').innerHTML=cats.map((c,i)=>`<div class="record"><b>${esc(c)}</b> <button class="danger" data-delcat="${i}">Eliminar</button></div>`).join('');$('serviceCategory').innerHTML=cats.map(c=>`<option>${esc(c)}</option>`).join('')};$('categoryForm').onsubmit=e=>{e.preventDefault();let n=$('categoryName').value.trim();if(!n)return;if(cats.some(c=>c.toLowerCase()===n.toLowerCase())){alert('Ese tipo ya existe.');return}cats.push(n);save(K.cats,cats);$('categoryName').value='';renderCats()};$('categoriesList').onclick=e=>{let b=e.target.closest('[data-delcat]');if(!b)return;cats.splice(Number(b.dataset.delcat),1);save(K.cats,cats);renderCats()};
$('serviceImage').onchange=async()=>{try{serviceImageData=await compress($('serviceImage').files[0],850);if(serviceImageData){$('servicePreviewImg').src=serviceImageData;$('servicePreview').classList.remove('hidden')}}catch(e){alert(e.message)}};$('serviceForm').onsubmit=async e=>{e.preventDefault();let id=$('editServiceId').value,n=$('serviceName').value.trim(),p=Number($('servicePrice').value),desc=$('serviceDescription').value.trim(),cat=$('serviceCategory').value;let list=read(K.products,products),old=list.find(x=>String(x.id)===id);let img=serviceImageData||(old&&old.img)||'';if(!img&&!old){alert('Agrega una fotografía para el corte.');return}let item={id:old?old.id:Date.now(),nombre:n,precio:p,descripcion:desc,categoria:cat,img,duracion:Number($('serviceDuration').value)||60};if(old)list=list.map(x=>x.id===old.id?item:x);else list.push(item);save(K.products,list);products=list;resetService();renderServices()};function resetService(){$('serviceForm').reset();$('editServiceId').value='';serviceImageData=null;$('servicePreview').classList.add('hidden');$('servicePreviewImg').removeAttribute('src')}$('cancelEdit').onclick=resetService;
function renderServices(){$('adminServices').innerHTML=products.map(p=>`<div class="record"><h3>${esc(p.nombre)} · Bs. ${Number(p.precio).toFixed(2)} · ${p.duracion||60} min</h3><p>${esc(p.categoria)} — ${esc(p.descripcion)}</p>${p.img?`<img src="${p.img}" style="width:130px;height:90px;object-fit:cover">`:''}<button class="small-btn" data-editservice="${p.id}">Editar</button><button class="danger" data-delservice="${p.id}">Eliminar</button></div>`).join('')};$('adminServices').onclick=e=>{let ed=e.target.closest('[data-editservice]'),del=e.target.closest('[data-delservice]');if(ed){let p=products.find(x=>String(x.id)===ed.dataset.editservice);$('editServiceId').value=p.id;$('serviceName').value=p.nombre;$('servicePrice').value=p.precio;$('serviceDuration').value=p.duracion||60;$('serviceDescription').value=p.descripcion;$('serviceCategory').value=p.categoria;$('servicePreviewImg').src=p.img;$('servicePreview').classList.toggle('hidden',!p.img);serviceImageData=null;$('serviceForm').scrollIntoView({behavior:'smooth'})}if(del&&confirm('¿Eliminar este corte?')){products=products.filter(x=>String(x.id)!==del.dataset.delservice);save(K.products,products);renderServices()}};
function renderBookings(){let a=read(K.bookings),q=($('bookingSearch').value||'').trim().toLowerCase();$('adminBookings').innerHTML=a.map((r,i)=>({r,i})).filter(({r})=>!q||[r.ci,r.name,r.phone,r.id,r.barber].some(v=>String(v||'').toLowerCase().includes(q))).map(({r,i})=>`<article class="record"><h3>${esc(r.name)} · ${esc(r.id)}</h3><p>CI: ${esc(r.ci)} · Teléfono: ${esc(r.phone)}</p><p>Sucursal: ${esc(r.branch||'—')} · Barbero: ${esc(r.barber||'—')}</p><p>${esc(r.service||r.category)} · ${esc(r.date)} a las ${esc(r.time)} hasta ${esc(endOf(r))} · ${r.price==null?'Precio por definir':'Bs. '+Number(r.price).toFixed(2)}</p><p>Pago elegido: ${esc(r.paymentMethod||'Sin seleccionar')}${r.paymentOption?' · '+esc(r.paymentOption):''}</p><label>Estado de reserva <select data-book="${i}" data-field="status"><option ${r.status==='Pendiente'?'selected':''}>Pendiente</option><option ${r.status==='Confirmada'?'selected':''}>Confirmada</option><option ${r.status==='Cancelada'?'selected':''}>Cancelada</option></select></label><label>Método de pago <select data-book="${i}" data-field="paymentMethod"><option ${r.paymentMethod==='Sin seleccionar'?'selected':''}>Sin seleccionar</option><option ${r.paymentMethod==='Efectivo'?'selected':''}>Efectivo</option><option ${r.paymentMethod==='QR'?'selected':''}>QR</option></select></label><label>Estado del pago <select data-book="${i}" data-field="paymentStatus"><option ${r.paymentStatus==='Pendiente'?'selected':''}>Pendiente</option><option ${r.paymentStatus==='Pagado'?'selected':''}>Pagado</option><option ${r.paymentStatus==='Rechazado'?'selected':''}>Rechazado</option></select></label><button class="danger" data-delbooking="${i}">Eliminar</button></article>`).join('')||(q?'<p>No se encontraron reservas con esa búsqueda.</p>':'<p>No hay reservas registradas.</p>')};$('bookingSearch').oninput=renderBookings;$('adminBookings').onchange=e=>{let x=e.target.closest('[data-book]');if(!x)return;let a=read(K.bookings),r=a[+x.dataset.book];r[x.dataset.field]=x.value;save(K.bookings,a);renderAvailability()};$('adminBookings').onclick=e=>{let b=e.target.closest('[data-delbooking]');if(b&&confirm('¿Eliminar reserva?')){let a=read(K.bookings);a.splice(+b.dataset.delbooking,1);save(K.bookings,a);renderBookings();renderAvailability()}};
function renderStudents(){let a=read(K.students),q=($('studentSearch').value||'').trim().toLowerCase();$('adminStudents').innerHTML=a.map((r,i)=>({r,i})).filter(({r})=>!q||[r.ci,r.name,r.phone,r.id,r.course].some(v=>String(v||'').toLowerCase().includes(q))).map(({r,i})=>`<article class="record"><h3>${esc(r.name)} · ${esc(r.id)}</h3><p>CI: ${esc(r.ci)} · ${esc(r.phone)} · Curso: ${esc(r.course)}</p><p>Inscripción: ${esc(r.date)} · Bs. ${Number(r.price||0).toFixed(2)}</p><label>Método de pago <select data-student="${i}" data-field="paymentMethod"><option>Sin seleccionar</option><option ${r.paymentMethod==='Efectivo'?'selected':''}>Efectivo</option><option ${r.paymentMethod==='QR'?'selected':''}>QR</option></select></label><label>Estado del pago <select data-student="${i}" data-field="paymentStatus"><option ${r.paymentStatus==='Pendiente'?'selected':''}>Pendiente</option><option ${r.paymentStatus==='Pagado'?'selected':''}>Pagado</option><option ${r.paymentStatus==='Rechazado'?'selected':''}>Rechazado</option></select></label><button class="danger" data-delstudent="${i}">Eliminar</button></article>`).join('')||(q?'<p>No se encontraron inscripciones con esa búsqueda.</p>':'<p>No hay inscripciones.</p>')};$('studentSearch').oninput=renderStudents;$('adminStudents').onchange=e=>{let x=e.target.closest('[data-student]');if(!x)return;let a=read(K.students);a[+x.dataset.student][x.dataset.field]=x.value;save(K.students,a);renderCourses()};$('adminStudents').onclick=e=>{let b=e.target.closest('[data-delstudent]');if(b&&confirm('¿Eliminar inscripción?')){let a=read(K.students);a.splice(+b.dataset.delstudent,1);save(K.students,a);renderStudents();renderCourses()}};
$('saveQr').onclick=async()=>{try{let d=await compress($('qrFile').files[0],600);if(!d)return;localStorage.setItem(K.qr,d);$('qrPreview').src=d;alert('QR guardado')}catch(e){alert(e.message)}};$('saveWarning').onclick=()=>{localStorage.setItem(K.warning,$('warningText').value.trim());alert('Advertencia guardada')};
$('courseForm').onsubmit=e=>{e.preventDefault();let id=$('editCourseId').value,list=read(K.courses,courses),obj={id:id?Number(id):Date.now(),name:$('courseName').value.trim(),price:Number($('coursePrice').value),description:$('courseDescription').value.trim(),cupos:Number($('courseCupos').value),inicio:$('courseStart').value,horario:$('courseSchedule').value.trim()};let i=list.findIndex(c=>String(c.id)===id);if(i>=0)list[i]=obj;else list.push(obj);save(K.courses,list);courses=list;$('courseForm').reset();$('editCourseId').value='';renderCourses()};function renderCourses(){$('adminCourses').innerHTML=courses.map((c,i)=>`<div class="record"><h3>${esc(c.name)} · Bs. ${Number(c.price).toFixed(2)}</h3><p>${esc(c.description)}</p><p><b>${(()=>{const cap=Number(c.cupos)>0?Number(c.cupos):null,used=read(K.students).filter(x=>String(x.courseId)===String(c.id)&&x.paymentStatus!=='Rechazado').length;return cap===null?'Sin límite de cupos':`Cupos: ${used} ocupados de ${cap} · ${Math.max(0,cap-used)} disponibles`})()}</b>${c.inicio?' · Inicio: '+esc(c.inicio):''}${c.horario?' · '+esc(c.horario):''}</p><button class="small-btn" data-editcourse="${i}">Editar</button><button class="danger" data-delcourse="${i}">Eliminar</button></div>`).join('')};$('adminCourses').onclick=e=>{let ed=e.target.closest('[data-editcourse]'),del=e.target.closest('[data-delcourse]');if(ed){let c=courses[+ed.dataset.editcourse];$('editCourseId').value=c.id;$('courseName').value=c.name;$('coursePrice').value=c.price;$('courseDescription').value=c.description;$('courseCupos').value=c.cupos||'';$('courseStart').value=c.inicio||'';$('courseSchedule').value=c.horario||''}if(del&&confirm('¿Eliminar curso?')){courses.splice(+del.dataset.delcourse,1);save(K.courses,courses);renderCourses()}};

/* ===== Sucursales y barberos ===== */
const defaultBranches=[{id:1,name:'Sucursal Centro',address:'Av. Principal #123, Centro',mapsUrl:'',phone:'',hours:'Lun a Sáb · 09:00 - 20:00'},{id:2,name:'Sucursal Norte',address:'Calle Los Pinos #456, Zona Norte',mapsUrl:'',phone:'',hours:'Lun a Sáb · 10:00 - 19:00'}];
const defaultBarbers=[{id:1,name:'Carlos',ci:'',phone:'',branchId:1,specialty:'Degradados',available:true},{id:2,name:'Diego',ci:'',phone:'',branchId:1,specialty:'Barba y perfilado',available:true},{id:3,name:'Mateo',ci:'',phone:'',branchId:2,specialty:'Corte clásico',available:true},{id:4,name:'Luis',ci:'',phone:'',branchId:2,specialty:'Diseños',available:false}];
let branches=read(K.branches,defaultBranches),barbers=read(K.barbers,defaultBarbers);
function renderBranches(){
 branches=read(K.branches,defaultBranches);barbers=read(K.barbers,defaultBarbers);
 $('adminBranches').innerHTML=branches.map(b=>`<div class="record"><h3>${esc(b.name)}</h3><p>${esc(b.address)}${b.phone?' · '+esc(b.phone):''}</p>${b.hours?`<p>${esc(b.hours)}</p>`:''}<p>${b.mapsUrl?'Enlace de mapa guardado':'Sin enlace de mapa (se buscará por la dirección)'}</p><button class="small-btn" data-editbranch="${b.id}">Editar</button><button class="danger" data-delbranch="${b.id}">Eliminar</button></div>`).join('')||'<p>No hay sucursales.</p>';
 $('barberBranch').innerHTML=branches.map(b=>`<option value="${b.id}">${esc(b.name)}</option>`).join('');
 const q=($('barberSearch').value||'').trim().toLowerCase();$('adminBarbers').innerHTML=barbers.filter(x=>!q||[x.name,x.ci,x.phone].some(v=>String(v||'').toLowerCase().includes(q))).map(x=>{const b=branches.find(y=>String(y.id)===String(x.branchId));return `<div class="record"><h3>${esc(x.name)} · ${esc(b?b.name:'Sin sucursal')}</h3><p>CI: ${esc(x.ci||'Sin registrar')} · Celular: ${esc(x.phone||'Sin registrar')}</p><p>${socialLinksHtml(x)||'<span class="muted">Sin redes sociales</span>'}</p><p>${esc(x.specialty||'')} — <b>${x.available?'Disponible':'No disponible'}</b></p><button class="small-btn" data-togglebarber="${x.id}">${x.available?'Marcar no disponible':'Marcar disponible'}</button><button class="small-btn" data-editbarber="${x.id}">Editar</button><button class="danger" data-delbarber="${x.id}">Eliminar</button></div>`}).join('')||'<p>No se encontraron barberos.</p>';renderAvailability();
}
function resetBranch(){$('branchForm').reset();$('editBranchId').value=''}
function resetBarber(){$('barberForm').reset();$('editBarberId').value='';$('barberAvailable').checked=true}
$('barberSearch').oninput=renderBranches;$('cancelBranch').onclick=resetBranch;$('cancelBarber').onclick=resetBarber;
$('branchForm').onsubmit=e=>{e.preventDefault();const id=$('editBranchId').value,url=$('branchMap').value.trim();
 if(url&&!/^https?:\/\//i.test(url)){alert('El enlace debe empezar con http:// o https://');return}
 const obj={id:id?Number(id):Date.now(),name:$('branchName').value.trim(),address:$('branchAddress').value.trim(),mapsUrl:url,phone:$('branchPhone').value.trim(),hours:$('branchHours').value.trim()};
 const i=branches.findIndex(x=>String(x.id)===id);if(i>=0)branches[i]=obj;else branches.push(obj);
 save(K.branches,branches);save(K.barbers,barbers);resetBranch();renderBranches()};
$('adminBranches').onclick=e=>{const ed=e.target.closest('[data-editbranch]'),del=e.target.closest('[data-delbranch]');
 if(ed){const b=branches.find(x=>String(x.id)===ed.dataset.editbranch);$('editBranchId').value=b.id;$('branchName').value=b.name;$('branchAddress').value=b.address;$('branchMap').value=b.mapsUrl||'';$('branchPhone').value=b.phone||'';$('branchHours').value=b.hours||'';$('branchForm').scrollIntoView({behavior:'smooth'})}
 if(del&&confirm('¿Eliminar esta sucursal y sus barberos?')){branches=branches.filter(x=>String(x.id)!==del.dataset.delbranch);barbers=barbers.filter(x=>String(x.branchId)!==del.dataset.delbranch);save(K.branches,branches);save(K.barbers,barbers);renderBranches()}};
$('barberForm').onsubmit=e=>{e.preventDefault();const id=$('editBarberId').value,fb=socialUrl($('barberFacebook').value,'facebook'),tk=socialUrl($('barberTikTok').value,'tiktok');if($('barberFacebook').value.trim()&&!fb){alert('El enlace de Facebook no es válido.');return}if($('barberTikTok').value.trim()&&!tk){alert('El enlace de TikTok no es válido.');return}
 const obj={id:id?Number(id):Date.now(),name:$('barberName').value.trim(),ci:$('barberCi').value.trim(),phone:$('barberPhone').value.trim(),facebook:fb,tiktok:tk,branchId:Number($('barberBranch').value),specialty:$('barberSpecialty').value.trim(),available:$('barberAvailable').checked};
 if(barbers.some(x=>String(x.id)!==id&&x.ci&&x.ci.toLowerCase()===obj.ci.toLowerCase())){alert('Ya existe un barbero con esa cédula.');return}
 const i=barbers.findIndex(x=>String(x.id)===id);if(i>=0)barbers[i]=obj;else barbers.push(obj);
 save(K.barbers,barbers);save(K.branches,branches);resetBarber();renderBranches()};
$('adminBarbers').onclick=e=>{const ed=e.target.closest('[data-editbarber]'),del=e.target.closest('[data-delbarber]'),tg=e.target.closest('[data-togglebarber]');
 if(tg){const x=barbers.find(y=>String(y.id)===tg.dataset.togglebarber);x.available=!x.available;save(K.barbers,barbers);save(K.branches,branches);renderBranches()}
 if(ed){const x=barbers.find(y=>String(y.id)===ed.dataset.editbarber);$('editBarberId').value=x.id;$('barberName').value=x.name;$('barberFacebook').value=x.facebook||'';$('barberTikTok').value=x.tiktok||'';$('barberCi').value=x.ci||'';$('barberPhone').value=x.phone||'';$('barberBranch').value=x.branchId;$('barberSpecialty').value=x.specialty||'';$('barberAvailable').checked=!!x.available;$('barberForm').scrollIntoView({behavior:'smooth'})}
 if(del&&confirm('¿Eliminar este barbero?')){barbers=barbers.filter(y=>String(y.id)!==del.dataset.delbarber);save(K.barbers,barbers);renderBranches()}};

/* ===== Disponibilidad en vivo y pestañas ===== */
const toMin=t=>{const [h,m]=String(t||'0:0').split(':').map(Number);return (h||0)*60+(m||0)};
const fmtMin=n=>{n=Math.min(Math.max(n,0),1439);return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0')};
const durOfBooking=r=>Number(r.duration)||60;
const endOf=r=>fmtMin(toMin(r.time)+durOfBooking(r));
const todayStr=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function renderAvailability(){
 const q=($('availSearch').value||'').trim().toLowerCase(),now=new Date(),nowMin=now.getHours()*60+now.getMinutes(),today=todayStr();
 const brs=read(K.branches,defaultBranches),bar=read(K.barbers,defaultBarbers),all=read(K.bookings),bk=all.filter(r=>r.status!=='Cancelada');
 const match=(...v)=>!q||v.some(x=>String(x||'').toLowerCase().includes(q));
 const cards=bar.filter(x=>match(x.name,x.ci,x.phone,x.specialty)).map(x=>{
  const br=brs.find(y=>String(y.id)===String(x.branchId));
  const todays=bk.filter(r=>String(r.barberId)===String(x.id)&&r.date===today).sort((a,c)=>toMin(a.time)-toMin(c.time));
  const cur=todays.find(r=>toMin(r.time)<=nowMin&&nowMin<toMin(r.time)+durOfBooking(r)),next=todays.find(r=>toMin(r.time)>nowMin);
  let cls,label,detail;
  if(!x.available){cls='gray';label='No disponible';detail='Marcado como no disponible.'}
  else if(cur){cls='busy';label='Reservado hasta '+endOf(cur);detail='Atiende a '+cur.name+' ('+(cur.service||cur.category)+')'+(next?' · Luego: reserva a las '+next.time:'')}
  else{cls='on';label='Libre ahora';detail=next?'Próxima reserva hoy a las '+next.time:'Sin más reservas hoy'}
  const list=todays.length?'Hoy: '+todays.map(r=>r.time+'–'+endOf(r)+' ('+r.name+')').join(', '):'Sin reservas hoy';
  return `<article class="record avail-card"><h3>${esc(x.name)}</h3><p class="muted">${esc(br?br.name:'Sin sucursal')}${x.ci?' · CI '+esc(x.ci):''}${x.phone?' · '+esc(x.phone):''}</p><span class="badge ${cls}">${esc(label)}</span><p>${esc(detail)}</p><p class="muted">${esc(list)}</p></article>`}).join('')||'<p>No se encontraron barberos con esa búsqueda.</p>';
 $('availBarbers').innerHTML=cards;
 $('availBookingsWrap').classList.toggle('hidden',!q);
 let found=[];
 if(q){
  found=bk.filter(r=>match(r.name,r.ci,r.phone,r.id,r.barber)).sort((a,c)=>(a.date+a.time).localeCompare(c.date+c.time));
  $('availBookings').innerHTML=found.map(r=>{
   const st=new Date(r.date+'T'+r.time),en=new Date(st.getTime()+durOfBooking(r)*60000);
   const [cls,txt]=now<st?['warn','Reservada']:now<en?['busy','En curso hasta '+endOf(r)]:['gray','Finalizada'];
   return `<article class="record"><h3>${esc(r.name)} · ${esc(r.id)}</h3><p>${esc(r.date)} · ${esc(r.time)} a ${esc(endOf(r))} · ${esc(r.service||r.category)}</p><p>Sucursal: ${esc(r.branch||'—')} · Barbero: ${esc(r.barber||'—')}</p><span class="badge ${cls}">${esc(txt)}</span> <span class="muted">Estado: ${esc(r.status)}</span></article>`}).join('')||'<p>No hay reservas para esta búsqueda.</p>';
 }
 $('availSummary').textContent=q?(found.length?`${found.length} reserva(s) encontrada(s) para “${$('availSearch').value.trim()}”: sí tiene reserva.`:`No hay reservas para “${$('availSearch').value.trim()}”: no está reservado.`):'';
 $('availStamp').textContent='Actualizado a las '+now.toLocaleTimeString('es-BO');
}
$('availSearch').oninput=renderAvailability;
setInterval(()=>{if(!$('adminContent').classList.contains('hidden'))renderAvailability()},30000);
window.addEventListener('storage',()=>{if(!$('adminContent').classList.contains('hidden')){renderBookings();renderStudents();renderAvailability()}});
const TABS=[...document.querySelectorAll('[data-tabbtn]')].map(b=>b.dataset.tabbtn);
function showTab(n){if(!TABS.includes(n))n='reservas';document.querySelectorAll('.tab-pane').forEach(p=>p.classList.toggle('hidden',p.dataset.tab!==n));document.querySelectorAll('[data-tabbtn]').forEach(b=>b.classList.toggle('active',b.dataset.tabbtn===n));try{sessionStorage.setItem('bn_admin_tab',n)}catch{}if(n==='disponibilidad')renderAvailability()}
document.querySelector('.tabs').addEventListener('click',e=>{const b=e.target.closest('[data-tabbtn]');if(b)showTab(b.dataset.tabbtn)});

/* ===== Registro de cortes (una hoja por fecha) ===== */
const ctPad=n=>String(n).padStart(2,'0');
const ctNow=()=>{const d=new Date();return ctPad(d.getHours())+':'+ctPad(d.getMinutes())};
const ctDate=iso=>{const [y,m,d]=String(iso).split('-');return `${d}/${m}/${y}`};
const ctCents=n=>Math.round(Number(n)*100);
const ctMoney=c=>'Bs. '+(c/100).toFixed(2);
const ctSaldo=r=>r.paid?0:Math.max(0,ctCents(r.cost)-ctCents(r.advance));
const ctCollected=r=>r.paid?ctCents(r.cost):Math.min(ctCents(r.advance),ctCents(r.cost));
const ctCuts=()=>read(K.cuts,[]);
const ctDefaultBranches=[{id:1,name:'Sucursal Centro'},{id:2,name:'Sucursal Norte'}];
const ctDefaultBarbers=[{id:1,name:'Carlos',branchId:1},{id:2,name:'Diego',branchId:1},{id:3,name:'Mateo',branchId:2},{id:4,name:'Luis',branchId:2}];
function ctFillPeople(){
 const branches=read(K.branches,ctDefaultBranches),barbers=read(K.barbers,ctDefaultBarbers);
 const oldB=$('cutBarber').value,oldS=$('cutBranch').value;
 $('cutBranch').innerHTML='<option value="">Selecciona sucursal</option>'+branches.map(b=>`<option value="${esc(b.id)}">${esc(b.name)}</option>`).join('');
 $('cutBarber').innerHTML='<option value="">Selecciona barbero</option>'+barbers.map(b=>{const br=branches.find(x=>String(x.id)===String(b.branchId));return `<option value="${esc(b.id)}" data-branch="${esc(b.branchId)}">${esc(b.name)}${br?' · '+esc(br.name):''}</option>`}).join('');
 if([...$('cutBranch').options].some(o=>o.value===oldS))$('cutBranch').value=oldS;
 if([...$('cutBarber').options].some(o=>o.value===oldB))$('cutBarber').value=oldB;
}
$('cutBranch').addEventListener('change',()=>{const bid=$('cutBranch').value;[...$('cutBarber').options].forEach(o=>{if(o.value)o.hidden=!!bid&&o.dataset.branch!==bid});if($('cutBarber').selectedOptions[0]?.hidden)$('cutBarber').value=''});
$('cutBarber').addEventListener('change',()=>{const o=$('cutBarber').selectedOptions[0];if(o?.dataset.branch)$('cutBranch').value=o.dataset.branch});
ctFillPeople();
function ctMinCash(){const a=read(K.settings,{}).advance;return (a===undefined||a===''||isNaN(Number(a)))?10:Math.max(0,Number(a))}
function ctRefreshMin(){$('ctMinLabel').textContent=ctMinCash().toFixed(2)}
let ctAdvAuto=true;
/* Anticipo sugerido: efectivo = mínimo (o el costo si es menor); QR = pago completo */
function ctSuggestAdvance(){
 const cost=Number($('cutCost').value)||0;
 return Math.min(ctMinCash(),cost);
}
function ctPreview(){
 const cost=$('cutCost').value===''?null:Number($('cutCost').value),adv=$('cutAdvance').value===''?null:Number($('cutAdvance').value);
 if(cost===null||adv===null){$('cutPreview').textContent='';return}
 const saldo=Math.max(0,ctCents(cost)-ctCents(adv));
 let t=`Saldo que le falta al cliente: ${ctMoney(saldo)}`;
 if($('cutMethod').value==='Efectivo'&&ctCents(adv)<ctCents(Math.min(ctMinCash(),cost)))t+=` · Falta anticipo: en efectivo el mínimo es Bs. ${Math.min(ctMinCash(),cost).toFixed(2)}`;
 $('cutPreview').textContent=t;
}
function ctSyncAdvance(){if(ctAdvAuto&&$('cutCost').value!==''){$('cutAdvance').value=ctSuggestAdvance().toFixed(2)}ctPreview()}
function ctFillServices(){$('cutServiceList').innerHTML=products.map(p=>`<option value="${esc(p.nombre)}">Bs. ${Number(p.precio).toFixed(2)}</option>`).join('')}
function ctResetForm(){
 $('cutForm').reset();$('editCutId').value='';$('cutDate').value=$('regDate').value||todayStr();$('cutTime').value=ctNow();
 $('cutSubmit').textContent='Agregar al registro';$('cutCancel').classList.add('hidden');ctAdvAuto=true;ctPreview();
}
// El costo del registro se introduce manualmente y permanece editable.
$('cutCost').addEventListener('input',ctSyncAdvance);
$('cutMethod').addEventListener('change',()=>{ctAdvAuto=true;ctSyncAdvance()});
$('cutAdvance').addEventListener('input',()=>{ctAdvAuto=false;ctPreview()});
$('cutNow').addEventListener('click',()=>{$('cutDate').value=todayStr();$('cutTime').value=ctNow()});
$('cutCancel').addEventListener('click',ctResetForm);
$('cutForm').addEventListener('submit',e=>{
 e.preventDefault();
 const id=$('editCutId').value,cost=Number($('cutCost').value),adv=Number($('cutAdvance').value),method=$('cutMethod').value;
 if(!(cost>=0)||$('cutCost').value===''){alert('Escribe el costo del corte.');return}
 if(!(adv>=0)||$('cutAdvance').value===''){alert('Escribe el anticipo (puede ser 0 si no aplica).');return}
 if(ctCents(adv)>ctCents(cost)){alert('El anticipo no puede ser mayor que el costo del corte.');return}
 if(!$('cutBarber').value||!$('cutBranch').value){alert('Selecciona el barbero y la sucursal.');return}
 const min=Math.min(ctMinCash(),cost);
 if(method==='Efectivo'&&ctCents(adv)<ctCents(min)){alert(`El pago en efectivo requiere un anticipo mínimo de Bs. ${min.toFixed(2)}.`);return}
 const list=ctCuts(),old=list.find(x=>String(x.id)===id);
 const rec={id:old?old.id:Date.now()*1000+Math.floor(Math.random()*1000),client:$('cutClient').value.trim(),barber:$('cutBarber').selectedOptions[0]?.textContent.split(' · ')[0]||'',barberId:$('cutBarber').value,branch:$('cutBranch').selectedOptions[0]?.textContent||'',branchId:$('cutBranch').value,service:$('cutService').value.trim(),cost:Math.round(cost*100)/100,advance:Math.round(adv*100)/100,method,date:$('cutDate').value,time:$('cutTime').value,paid:old?!!old.paid:false};
 if(old)list[list.indexOf(old)]=rec;else list.push(rec);
 try{localStorage.setItem(K.cuts,JSON.stringify(list))}catch{alert('No se pudo guardar el registro.');return}
 $('regDate').value=rec.date;ctResetForm();renderCuts();
});
function ctRows(){return ctCuts().filter(r=>r.date===$('regDate').value).sort((a,b)=>a.time.localeCompare(b.time)||a.id-b.id)}
function ctTotals(rows){return {cost:rows.reduce((t,r)=>t+ctCents(r.cost),0),paid:rows.reduce((t,r)=>t+ctCollected(r),0),pending:rows.reduce((t,r)=>t+ctSaldo(r),0)}}
function renderCuts(){
 const all=ctCuts(),rows=ctRows(),t=ctTotals(rows);
 $('regBody').innerHTML=rows.map((r,i)=>{const s=ctSaldo(r);return `<tr><td>${i+1}</td><td>${esc(r.time)}</td><td>${esc(r.client)}</td><td>${esc(r.barber||'—')}</td><td>${esc(r.branch||'—')}</td><td>${esc(r.service)}</td><td>${esc(r.method)}</td><td class="num">${ctMoney(ctCents(r.cost))}</td><td class="num">${ctMoney(ctCents(r.advance))}</td><td class="num"><b>${ctMoney(s)}</b>${s>0?'<span class="pill debt">Debe</span>':'<span class="pill">Cancelado</span>'}</td><td class="row-actions">${s>0?`<button class="small-btn" data-ctpay="${r.id}">Cobrar saldo</button>`:''}<button class="small-btn" data-ctrec="${r.id}">Recibo</button><button class="small-btn" data-ctedit="${r.id}">Editar</button><button class="danger" data-ctdel="${r.id}">Eliminar</button></td></tr>`}).join('')||'<tr><td colspan="11" class="muted">Esta hoja no tiene cortes todavía.</td></tr>';
 $('regTotal').textContent=ctMoney(t.cost);$('regPaid').textContent=ctMoney(t.paid);$('regPending').textContent=ctMoney(t.pending);$('regCount').textContent=rows.length;
 $('ftCost').textContent=ctMoney(t.cost);$('ftAdv').textContent=ctMoney(rows.reduce((a,r)=>a+ctCents(r.advance),0));$('ftSaldo').textContent=ctMoney(t.pending);
 const dates=[...new Set(all.map(r=>r.date))].sort().reverse();
 $('regDates').innerHTML='<option value="">Elige una fecha…</option>'+dates.map(d=>`<option value="${d}">${ctDate(d)} · ${all.filter(r=>r.date===d).length} corte(s)</option>`).join('');
 $('regDates').value=dates.includes($('regDate').value)?$('regDate').value:'';
}
$('regDate').addEventListener('change',()=>{renderCuts();if(!$('editCutId').value&&$('regDate').value)$('cutDate').value=$('regDate').value});
$('regDates').addEventListener('change',()=>{if($('regDates').value){$('regDate').value=$('regDates').value;renderCuts();if(!$('editCutId').value)$('cutDate').value=$('regDate').value}});
$('regToday').addEventListener('click',()=>{$('regDate').value=todayStr();renderCuts();if(!$('editCutId').value)$('cutDate').value=todayStr()});
$('regBody').addEventListener('click',e=>{
 const pay=e.target.closest('[data-ctpay]'),rec=e.target.closest('[data-ctrec]'),ed=e.target.closest('[data-ctedit]'),del=e.target.closest('[data-ctdel]');
 const list=ctCuts(),find=id=>list.find(x=>String(x.id)===id);
 if(pay){const r=find(pay.dataset.ctpay);if(r&&confirm(`¿Cobrar el saldo de ${ctMoney(ctSaldo(r))} a ${r.client}?`)){r.paid=true;localStorage.setItem(K.cuts,JSON.stringify(list));renderCuts()}}
 if(rec){const r=find(rec.dataset.ctrec);if(r)ctPrint(ctReceiptHtml(r))}
 if(ed){const r=find(ed.dataset.ctedit);if(!r)return;
  $('editCutId').value=r.id;$('cutClient').value=r.client;ctFillPeople();$('cutBranch').value=String(r.branchId??[...$('cutBranch').options].find(o=>o.textContent===r.branch)?.value??'');$('cutBarber').value=String(r.barberId??[...$('cutBarber').options].find(o=>o.textContent.startsWith(r.barber||'') )?.value??'');$('cutBranch').dispatchEvent(new Event('change'));$('cutService').value=r.service;$('cutCost').value=Number(r.cost).toFixed(2);$('cutMethod').value=r.method;$('cutDate').value=r.date;$('cutTime').value=r.time;$('cutAdvance').value=Number(r.advance).toFixed(2);
  ctAdvAuto=false;$('cutSubmit').textContent='Guardar cambios';$('cutCancel').classList.remove('hidden');ctPreview();$('cutForm').scrollIntoView({behavior:'smooth'})}
 if(del&&confirm('¿Eliminar este corte del registro?')){localStorage.setItem(K.cuts,JSON.stringify(list.filter(x=>String(x.id)!==del.dataset.ctdel)));renderCuts()}
});

/* ----- Impresión en tamaño carta (hoja de registro y recibo) ----- */
function ctPrint(html){$('printArea').innerHTML=html;window.print()}
const ctBiz=()=>esc(read(K.settings,{}).name||'Barbería Nova');
function ctSheetHtml(date,rows){
 const t=ctTotals(rows);
 const body=rows.map((r,i)=>{const s=ctSaldo(r);return `<tr><td>${i+1}</td><td>${esc(r.time)}</td><td>${esc(r.client)}</td><td>${esc(r.barber||'—')}</td><td>${esc(r.branch||'—')}</td><td>${esc(r.service)}</td><td>${esc(r.method)}</td><td class="num">${ctMoney(ctCents(r.cost))}</td><td class="num">${ctMoney(ctCents(r.advance))}</td><td class="num">${ctMoney(s)}${r.paid&&ctCents(r.cost)>ctCents(r.advance)?' (cobrado)':''}</td></tr>`}).join('');
 return `<div class="sheet"><div class="sheet-head"><h1>${ctBiz()}</h1><h2>REGISTRO DE CORTES</h2><p>Fecha del registro: <b>${ctDate(date)}</b> · Impreso: ${ctDate(todayStr())} ${ctNow()}</p></div><table><thead><tr><th>N°</th><th>Hora</th><th>Cliente</th><th>Barbero</th><th>Sucursal</th><th>Corte</th><th>Pago</th><th class="num">Costo</th><th class="num">Anticipo</th><th class="num">Saldo</th></tr></thead><tbody>${body}</tbody></table><div class="sheet-totals"><div><span>Total de cortes</span><b>${ctMoney(t.cost)}</b></div><div><span>Cobrado</span><b>${ctMoney(t.paid)}</b></div><div><span>Saldo pendiente</span><b>${ctMoney(t.pending)}</b></div></div><div class="sheet-sign"><div>Firma del responsable</div><div>Firma del administrador</div></div></div>`;
}
function ctReceiptHtml(r){
 const s=ctSaldo(r);
 return `<div class="sheet receipt"><div class="sheet-head"><h1>${ctBiz()}</h1><h2>RECIBO / FACTURA DE CORTE</h2><p>N° <b>REC-${String(r.id).slice(-6)}</b></p></div><table class="kv"><tr><th>Cliente</th><td>${esc(r.client)}</td></tr><tr><th>Corte o servicio</th><td>${esc(r.service)}</td></tr><tr><th>Barbero</th><td>${esc(r.barber||'—')}</td></tr><tr><th>Sucursal</th><td>${esc(r.branch||'—')}</td></tr><tr><th>Fecha y hora</th><td>${ctDate(r.date)} ${esc(r.time)}</td></tr><tr><th>Método de pago</th><td>${esc(r.method)}</td></tr><tr><th>Costo del corte</th><td>${ctMoney(ctCents(r.cost))}</td></tr><tr><th>Anticipo</th><td>${r.method==='QR'?'Bs. 10.00':'....................'}</td></tr><tr><th>Saldo que falta</th><td>....................</td></tr></table><div class="sheet-sign"><div>Firma del cliente</div><div>Firma de la barbería</div></div></div>`;
}
$('regPrint').addEventListener('click',()=>{const rows=ctRows();if(!rows.length){alert('Esta hoja no tiene cortes para imprimir.');return}ctPrint(ctSheetHtml($('regDate').value,rows))});

/* ----- JPG tamaño carta (8.5 x 11 pulgadas a 150 ppp = 1275 x 1650 px) ----- */
function ctDownloadJpg(){
 const rows=ctRows(),date=$('regDate').value;
 if(!rows.length){alert('Esta hoja no tiene cortes para descargar.');return}
 const W=1275,H=1650,PER=20,pages=Math.ceil(rows.length/PER),t=ctTotals(rows),name=(read(K.settings,{}).name||'Barbería Nova');
 const X={n:80,h:130,c:215,s:475,p:700,cost:915,adv:1055,sal:1195};
 for(let pg=0;pg<pages;pg++)setTimeout(()=>{
  const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const fit=(s,max)=>{s=String(s);if(g.measureText(s).width<=max)return s;while(s.length>1&&g.measureText(s+'…').width>max)s=s.slice(0,-1);return s+'…'};
  g.fillStyle='#fff';g.fillRect(0,0,W,H);g.fillStyle='#111';g.fillRect(0,0,W,150);g.textBaseline='alphabetic';g.textAlign='left';
  g.fillStyle='#e5b64c';g.font='bold 44px Arial';g.fillText(fit(name.toUpperCase(),W-380),70,80);
  g.fillStyle='#fff';g.font='24px Arial';g.fillText('REGISTRO DE CORTES',70,120);
  g.textAlign='right';g.font='20px Arial';g.fillText(`Hoja ${pg+1} de ${pages}`,W-70,120);g.textAlign='left';
  g.fillStyle='#111';g.font='bold 30px Arial';g.fillText('Fecha del registro: '+ctDate(date),70,215);
  g.fillStyle='#555';g.font='20px Arial';g.fillText(`Impreso: ${ctDate(todayStr())} ${ctNow()} · ${rows.length} corte(s) en total`,70,250);
  g.fillStyle='#e5b64c';g.fillRect(70,270,W-140,50);g.fillStyle='#111';g.font='bold 18px Arial';
  g.fillText('N°',X.n,303);g.fillText('HORA',X.h,303);g.fillText('CLIENTE / BARBERO',X.c,303);g.fillText('CORTE / SUCURSAL',X.s,303);g.fillText('PAGO',X.p,303);
  g.textAlign='right';g.fillText('COSTO',X.cost,303);g.fillText('ANTICIPO',X.adv,303);g.fillText('SALDO',X.sal,303);
  const part=rows.slice(pg*PER,pg*PER+PER);
  part.forEach((r,i)=>{
   const y=320+i*52;if(i%2){g.fillStyle='#f7f3e8';g.fillRect(70,y,W-140,52)}g.fillStyle='#e3e3e3';g.fillRect(70,y+51,W-140,1);
   g.fillStyle='#111';g.font='19px Arial';g.textAlign='left';
   g.fillText(String(pg*PER+i+1),X.n,y+34);g.fillText(r.time,X.h,y+34);g.fillText(fit(r.client,235),X.c,y+25);g.font='14px Arial';g.fillStyle='#555';g.fillText(fit('Barbero: '+(r.barber||'—'),235),X.c,y+44);g.font='19px Arial';g.fillStyle='#111';g.fillText(fit(r.service,205),X.s,y+25);g.font='14px Arial';g.fillStyle='#555';g.fillText(fit('Sucursal: '+(r.branch||'—'),205),X.s,y+44);g.font='19px Arial';g.fillStyle='#111';g.fillText(r.method,X.p,y+34);
   g.textAlign='right';g.fillText(ctMoney(ctCents(r.cost)),X.cost,y+34);g.fillText(ctMoney(ctCents(r.advance)),X.adv,y+34);g.font='bold 19px Arial';g.fillText(ctMoney(ctSaldo(r)),X.sal,y+34);
  });
  const yEnd=320+part.length*52;g.fillStyle='#e5b64c';g.fillRect(70,yEnd,W-140,3);
  if(pg===pages-1){
   g.fillStyle='#111';g.fillRect(70,yEnd+30,W-140,150);g.textAlign='left';g.fillStyle='#e5b64c';g.font='bold 20px Arial';
   [['TOTAL DE CORTES',t.cost,95],['COBRADO',t.paid,470],['SALDO PENDIENTE',t.pending,830]].forEach(([l,v,x])=>{g.fillStyle='#bbb';g.font='bold 19px Arial';g.fillText(l,x,yEnd+80);g.fillStyle='#e5b64c';g.font='bold 38px Arial';g.fillText(ctMoney(v),x,yEnd+140)});
  }else{g.fillStyle='#777';g.font='18px Arial';g.fillText('Continúa en la siguiente hoja…',70,yEnd+40)}
  g.fillStyle='#777';g.textAlign='left';g.font='16px Arial';g.fillText(`Documento generado por ${name}`,70,H-50);
  c.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`registro-cortes-${date}${pages>1?'-hoja'+(pg+1):''}.jpg`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500)},'image/jpeg',.92);
 },pg*600);
}
$('regJpg').addEventListener('click',ctDownloadJpg);
function ctInit(){ctRefreshMin();ctFillServices();$('regDate').value=$('regDate').value||todayStr();ctResetForm();renderCuts()}
function loadAll(){products=read(K.products,products);cats=read(K.cats,cats);courses=read(K.courses,courses);settings();renderCats();renderServices();renderBookings();renderStudents();renderCourses();renderBranches();renderAvailability();ctInit();let t='reservas';try{t=sessionStorage.getItem('bn_admin_tab')||t}catch{}showTab(t)}