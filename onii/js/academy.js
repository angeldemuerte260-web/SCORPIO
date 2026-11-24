const $=id=>document.getElementById(id),read=(k,d=[])=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},save=(k,v)=>localStorage.setItem(k,JSON.stringify(v)),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const defaultCourses=[{id:1,name:'Barbería básica',price:350,description:'Fundamentos, herramientas y técnicas iniciales.',cupos:20,inicio:'',horario:''},{id:2,name:'Degradados y diseños',price:450,description:'Técnicas de fade y diseños.',cupos:15,inicio:'',horario:''}];
let courses=read('bn_courses',defaultCourses);
const s=read('bn_settings',{});$('brandName').textContent=(s.name||'Barbería Nova').toUpperCase();$('footerName').textContent=s.name||'Barbería Nova';
/* Cupos: una inscripción ocupa cupo salvo que su pago esté Rechazado. Sin "cupos" definido = sin límite. */
const taken=c=>read('bn_students').filter(x=>String(x.courseId)===String(c.id)&&x.paymentStatus!=='Rechazado').length;
const capacity=c=>Number(c.cupos)>0?Number(c.cupos):null;
const left=c=>capacity(c)===null?null:Math.max(0,capacity(c)-taken(c));
const cupoText=c=>{const l=left(c);return l===null?'Cupos: sin límite':l===0?'Cupos agotados':`Cupos disponibles: ${l} de ${capacity(c)}`};
function render(){
 courses=read('bn_courses',defaultCourses);
 $('courses').innerHTML=courses.map(c=>`<article class="course-card"><h3>${esc(c.name)}</h3><p>${esc(c.description)}</p>${c.inicio||c.horario?`<p class="muted">${c.inicio?'Inicio: '+esc(c.inicio):''}${c.inicio&&c.horario?' · ':''}${c.horario?esc(c.horario):''}</p>`:''}<p class="price">Bs. ${Number(c.price).toFixed(2)}</p><p><b>${cupoText(c)}</b></p></article>`).join('')||'<p>No hay cursos publicados.</p>';
 const cur=$('courseId').value;
 $('courseId').innerHTML='<option value="">Selecciona un curso</option>'+courses.map(c=>{const full=left(c)===0;return `<option value="${c.id}"${full?' disabled':''}>${esc(c.name)} — Bs. ${Number(c.price).toFixed(2)}${full?' (sin cupos)':''}</option>`}).join('');
 if([...$('courseId').options].some(o=>o.value===cur&&!o.disabled))$('courseId').value=cur;
}
render();
(function(){const p=new URLSearchParams(location.search).get('curso');if(p&&[...$('courseId').options].some(o=>o.value===p&&!o.disabled)){$('courseId').value=p;setTimeout(()=>$('academyForm').scrollIntoView(),60)}})();
$('academyForm').addEventListener('submit',e=>{
 e.preventDefault();
 let list=read('bn_students'),ci=$('studentCi').value.trim(),course=courses.find(c=>String(c.id)===$('courseId').value);
 if(!course)return;
 if(list.some(x=>x.ci===ci&&String(x.courseId)===String(course.id))){alert('Ya existe una inscripción con ese CI para este curso.');return}
 if(left(course)===0){alert('Este curso ya no tiene cupos disponibles.');render();return}
 let r={id:'ACA-'+Date.now().toString().slice(-8),name:$('studentName').value.trim(),ci,phone:$('studentPhone').value.trim(),courseId:course.id,course:course.name,price:Number(course.price),date:new Date().toLocaleDateString('es-BO'),paymentMethod:'Sin seleccionar',paymentStatus:'Pendiente'};
 list.push(r);save('bn_students',list);
 $('academyMsg').textContent='Cupo reservado e inscripción registrada. El administrador revisará los datos y el pago.';
 $('academyReceipt').innerHTML=`<article class="invoice"><h2>Comprobante de inscripción</h2><p><b>Código:</b> ${r.id}</p><p><b>Estudiante:</b> ${esc(r.name)} · <b>CI:</b> ${esc(r.ci)}</p><p><b>Curso:</b> ${esc(r.course)}</p><p><b>Importe:</b> Bs. ......................</p><p><b>Pago:</b> ..............................</p><p><b>Estado:</b> Cupo reservado · Pendiente de confirmación y pago</p><div class="signatures"><div>Firma del estudiante</div><div>Firma / sello de academia</div></div><div class="invoice-actions"><button class="gold-btn" onclick="window.print()">Imprimir comprobante</button></div></article>`;
 e.target.reset();render();
});
