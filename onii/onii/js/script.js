// Barbería Nova: registros, reservas, academia, carrito y administración local.
const $ = id => document.getElementById(id);
const KEYS = {bookings:"bn_bookings", students:"bn_students", warning:"bn_warning", qr:"bn_qr", products:"bn_products"};
const read = key => { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } };
const save = (key,value) => localStorage.setItem(key,JSON.stringify(value));
const esc = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let carrito = [];
let isAdmin = false;

// Imagen de presentación elegida por el administrador/usuario de este navegador.
const imagenFondo = $("imagenFondo"), banner = document.querySelector(".banner");
const fondoGuardado = localStorage.getItem("imagenFondoPresentacion");
if (fondoGuardado) banner.style.backgroundImage = `linear-gradient(rgba(0,0,0,.48),rgba(0,0,0,.48)),url("${fondoGuardado}")`;
imagenFondo.addEventListener("change",()=>{
 const file=imagenFondo.files[0]; if(!file)return;
 if(!file.type.startsWith("image/")||file.size>5*1024*1024){alert("Selecciona una imagen de máximo 5 MB.");imagenFondo.value="";return;}
 const reader=new FileReader();
 reader.onload=e=>{const img=new Image();img.onload=()=>{const scale=Math.min(1,1600/img.width),canvas=document.createElement("canvas");canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);const data=canvas.toDataURL("image/jpeg",.82);try{localStorage.setItem("imagenFondoPresentacion",data);banner.style.backgroundImage=`linear-gradient(rgba(0,0,0,.48),rgba(0,0,0,.48)),url("${data}")`;}catch{alert("No se pudo guardar. Usa una imagen más pequeña.");}};img.src=e.target.result;};
 reader.readAsDataURL(file);
});

// Navegación por apartados.
document.querySelectorAll("[data-target]").forEach(btn=>btn.addEventListener("click",()=>{
 document.querySelectorAll(".panel-section").forEach(s=>s.classList.add("hidden"));
 $(btn.dataset.target).classList.remove("hidden");
 $(btn.dataset.target).scrollIntoView({behavior:"smooth",block:"start"});
}));
function showPanel(id){document.querySelectorAll(".panel-section").forEach(s=>s.classList.add("hidden"));$(id).classList.remove("hidden");$(id).scrollIntoView({behavior:"smooth"});}

// Catálogo editable: carga los servicios guardados y actualiza el selector de reservas.
const productContent=$("ProductoContent"), serviceSelect=$("bookingService");
try {
 const savedProducts=JSON.parse(localStorage.getItem(KEYS.products)||"null");
 if(Array.isArray(savedProducts)&&savedProducts.length){productos.splice(0,productos.length,...savedProducts);}
} catch {}
function renderCatalog(){
 productContent.innerHTML="";serviceSelect.innerHTML='<option value="">Selecciona un servicio</option>';
 productos.forEach(p=>{
  const card=document.createElement("article");card.className="card";
  const photo=p.img?`<img src="${esc(p.img)}" alt="${esc(p.nombre)}">`:`<div class="service-no-image">Fotografía no disponible</div>`;
  card.innerHTML=`${photo}<h3>${esc(p.nombre)}</h3><p class="service-description">${esc(p.descripcion||"")}</p><p>Bs. ${Number(p.precio).toFixed(2)}</p>`;
  const reserve=document.createElement("button");reserve.textContent="Reservar";reserve.addEventListener("click",()=>{serviceSelect.value=String(p.id);showPanel("registroBarberia");});
  const add=document.createElement("button");add.textContent="Agregar al carrito";add.className="secondary";add.addEventListener("click",()=>{carrito.push(p);alert(p.nombre+" agregado al carrito.");});
  card.append(reserve,add);productContent.append(card);
  const opt=document.createElement("option");opt.value=p.id;opt.textContent=p.nombre+" - Bs. "+Number(p.precio).toFixed(2);serviceSelect.append(opt);
 });
}
renderCatalog();

// Carrito modal: una sola ventana, con opción para quitar elementos.
const modal=$("modal-container");
$("vercarrito").addEventListener("click",renderCart);
function renderCart(){
 modal.innerHTML="";modal.style.display="flex";
 const head=document.createElement("div");head.className="modal-header";
 head.innerHTML="<h2 class='modal-header-title'>CARRITO DE SERVICIOS</h2>";
 const close=document.createElement("button");close.textContent="Cerrar";close.className="modal-close";close.onclick=()=>modal.style.display="none";head.append(close);modal.append(head);
 if(!carrito.length){modal.insertAdjacentHTML("beforeend","<p>El carrito está vacío.</p>");return;}
 carrito.forEach((p,i)=>{const row=document.createElement("div");row.className="modal-content";row.innerHTML=`<h3>${esc(p.nombre)}</h3><p>Bs. ${p.precio.toFixed(2)}</p>`;
 const del=document.createElement("button");del.textContent="Quitar";del.onclick=()=>{carrito.splice(i,1);renderCart();};row.append(del);modal.append(row);});
 const total=carrito.reduce((s,p)=>s+p.precio,0);modal.insertAdjacentHTML("beforeend",`<div class="total-content"><h2>Total: Bs. ${total.toFixed(2)}</h2><p>Para reservar, completa el formulario de barbería.</p></div>`);
 const go=document.createElement("button");go.className="primary";go.textContent="Continuar a reservar";go.onclick=()=>{modal.style.display="none";showPanel("registroBarberia");};modal.append(go);
}

// Registro de reservas de barbería.
$("bookingForm").addEventListener("submit",e=>{
 e.preventDefault();
 const date=$("bookingDate").value,time=$("bookingTime").value;
 if(new Date(`${date}T${time}`)<=new Date()){alert("Selecciona una fecha y hora futura.");return;}
 const list=read(KEYS.bookings);
 const conflict=list.some(b=>b.date===date&&b.time===time&&b.status!=="Cancelada");
 if(conflict){alert("Ese horario ya está reservado. Elige otra hora.");return;}
 const service=productos.find(p=>String(p.id)===$("bookingService").value);
 if(!service){alert("Selecciona un servicio.");return;}
 const booking={id:"RES-"+Date.now().toString().slice(-8),name:$("bookingName").value.trim(),ci:$("bookingCi").value.trim(),phone:$("bookingPhone").value.trim(),service:service.nombre,price:service.precio,date,time,status:"Pendiente",paymentMethod:"Sin seleccionar",paymentStatus:"Pendiente"};
 list.push(booking);save(KEYS.bookings,list);e.target.reset();
 $("bookingMessage").textContent="Reserva registrada. El administrador revisará el pago y confirmará la cita.";
});

// Registro independiente de estudiantes.
$("academyForm").addEventListener("submit",e=>{
 e.preventDefault();const list=read(KEYS.students),ci=$("studentCi").value.trim();
 if(list.some(s=>s.ci===ci&&s.course===$("studentCourse").value)){alert("Ya existe una inscripción para este curso con ese CI.");return;}
 list.push({id:"ACA-"+Date.now().toString().slice(-8),name:$("studentName").value.trim(),ci,phone:$("studentPhone").value.trim(),course:$("studentCourse").value,date:$("studentDate").value,paymentMethod:"Sin seleccionar",paymentStatus:"Pendiente"});
 save(KEYS.students,list);e.target.reset();$("academyMessage").textContent="Inscripción registrada. El administrador indicará y confirmará el pago.";
});

// Consulta de reservas por CI.
$("searchReservation").addEventListener("submit",e=>{
 e.preventDefault();const ci=$("searchCi").value.trim();const matches=read(KEYS.bookings).filter(b=>b.ci===ci);
 const out=$("reservationResults");out.innerHTML="";
 if(!matches.length){out.textContent="No se encontraron reservas con ese CI.";return;}
 matches.forEach(b=>{const box=document.createElement("article");box.className="record-card";box.innerHTML=`<b>${esc(b.service)}</b><p>${esc(b.date)} a las ${esc(b.time)}</p><p>Estado: ${esc(b.status)}</p><p>Pago: ${esc(b.paymentMethod)} — ${esc(b.paymentStatus)}</p>${b.paymentMethod==="QR"&&localStorage.getItem(KEYS.qr)?`<img class="qr-small" src="${localStorage.getItem(KEYS.qr)}">`:""}`;out.append(box);});
});

// Administración: se protege con contraseña de demostración.
$("adminAccess").addEventListener("click",()=>{
 const pass=prompt("Contraseña del administrador:");
 if(pass!=="nova123"){alert("Contraseña incorrecta.");return;}
 isAdmin=true;showPanel("adminPanel");renderAdmin();
});
function paymentControls(record,type,index){
 return `<div class="admin-controls">
 <label>Método de pago<select data-type="${type}" data-index="${index}" data-field="paymentMethod">
 <option ${record.paymentMethod==="Sin seleccionar"?"selected":""}>Sin seleccionar</option>
 <option ${record.paymentMethod==="Efectivo"?"selected":""}>Efectivo</option>
 <option ${record.paymentMethod==="QR"?"selected":""}>QR</option></select></label>
 <label>Estado del pago<select data-type="${type}" data-index="${index}" data-field="paymentStatus">
 <option ${record.paymentStatus==="Pendiente"?"selected":""}>Pendiente</option>
 <option ${record.paymentStatus==="Pagado"?"selected":""}>Pagado</option>
 <option ${record.paymentStatus==="Rechazado"?"selected":""}>Rechazado</option></select></label>
 ${type==="booking"?`<label>Estado de reserva<select data-type="${type}" data-index="${index}" data-field="status"><option ${record.status==="Pendiente"?"selected":""}>Pendiente</option><option ${record.status==="Confirmada"?"selected":""}>Confirmada</option><option ${record.status==="Cancelada"?"selected":""}>Cancelada</option></select></label>`:""}
 </div>`;
}
function renderRecords(key,type,target){
 const records=read(key),container=$(target);container.innerHTML="";
 if(!records.length){container.textContent="Todavía no hay registros.";return;}
 records.forEach((r,i)=>{
  const article=document.createElement("article");article.className="record-card";
  article.innerHTML=`<h4>${esc(r.name)} — ${esc(r.id)}</h4><p>CI: ${esc(r.ci)} | Teléfono: ${esc(r.phone)}</p><p>${type==="booking"?`Servicio: ${esc(r.service)} · ${esc(r.date)} ${esc(r.time)}`:`Curso: ${esc(r.course)} · Inscripción: ${esc(r.date)}`}</p>${paymentControls(r,type,i)}`;
  const remove=document.createElement("button");remove.className="danger";remove.textContent="Eliminar registro";remove.onclick=()=>{if(confirm("¿Eliminar este registro?")){const arr=read(key);arr.splice(i,1);save(key,arr);renderAdmin();}};
  article.append(remove);container.append(article);
 });
}
let editingProductId=null;
function resetServiceForm(){editingProductId=null;$("serviceForm").reset();$("saveService").textContent="Agregar servicio";$("cancelServiceEdit").hidden=true;}
function renderServicesAdmin(){
 const box=$("adminServices");box.innerHTML="";
 if(!productos.length){box.textContent="No hay servicios registrados.";return;}
 productos.forEach(p=>{
  const item=document.createElement("article");item.className="record-card service-admin-card";
  item.innerHTML=`${p.img?`<img class="service-admin-image" src="${esc(p.img)}" alt="${esc(p.nombre)}">`:""}<div><h4>${esc(p.nombre)} — Bs. ${Number(p.precio).toFixed(2)}</h4><p>${esc(p.descripcion||"")}</p></div>`;
  const edit=document.createElement("button");edit.className="secondary";edit.textContent="Editar";edit.onclick=()=>{editingProductId=p.id;$("serviceName").value=p.nombre;$("servicePrice").value=p.precio;$("serviceDescription").value=p.descripcion||"";$("serviceImage").value="";showServiceImagePreview(p.img||"");$("saveService").textContent="Guardar cambios";$("cancelServiceEdit").hidden=false;$("serviceForm").scrollIntoView({behavior:"smooth",block:"center"});};
  const del=document.createElement("button");del.className="danger";del.textContent="Eliminar";del.onclick=()=>{if(!confirm("¿Eliminar este servicio del catálogo?"))return;const i=productos.findIndex(x=>x.id===p.id);if(i>=0)productos.splice(i,1);save(KEYS.products,productos);renderCatalog();renderServicesAdmin();};
  item.append(edit,del);box.append(item);
 });
}
function showServiceImagePreview(src){const box=$("serviceImagePreview"),img=$("serviceImagePreviewImg");if(src){img.src=src;box.hidden=false;}else{img.removeAttribute("src");box.hidden=true;}}
$("serviceImage").addEventListener("change",()=>{const file=$("serviceImage").files[0];if(!file){if(editingProductId===null)showServiceImagePreview("");return;}if(!file.type.startsWith("image/")){alert("Selecciona un archivo de imagen.");$("serviceImage").value="";return;}const reader=new FileReader();reader.onload=e=>showServiceImagePreview(e.target.result);reader.readAsDataURL(file);});

function compressServiceImage(file){
 return new Promise((resolve,reject)=>{
  if(!file){resolve(null);return;}
  if(!file.type.startsWith("image/")||file.size>5*1024*1024){reject(new Error("Selecciona una imagen válida de máximo 5 MB."));return;}
  const reader=new FileReader();reader.onerror=()=>reject(new Error("No se pudo leer la imagen."));
  reader.onload=ev=>{const image=new Image();image.onerror=()=>reject(new Error("La imagen no es válida."));image.onload=()=>{const scale=Math.min(1,700/image.width,550/image.height),canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));canvas.getContext("2d").drawImage(image,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL("image/jpeg",.72));};image.src=ev.target.result;};reader.readAsDataURL(file);
 });
}
$("serviceForm").addEventListener("submit",async e=>{
 e.preventDefault();
 try{
  const name=$("serviceName").value.trim(),price=Number($("servicePrice").value),description=$("serviceDescription").value.trim();
  if(!name||!Number.isFinite(price)||price<0){alert("Revisa el nombre y el precio.");return;}
  const photo=await compressServiceImage($("serviceImage").files[0]);
  if(editingProductId===null&&!photo){alert("Selecciona una fotografía para el nuevo servicio.");return;}
  if(editingProductId!==null){const item=productos.find(x=>x.id===editingProductId);if(!item)return;item.nombre=name;item.precio=price;item.descripcion=description;if(photo)item.img=photo;}
  else{productos.push({id:Date.now(),nombre:name,precio:price,descripcion,img:photo});}
  save(KEYS.products,productos);renderCatalog();renderServicesAdmin();resetServiceForm();alert("Servicio guardado correctamente.");
 }catch(err){alert(err.message||"No se pudo guardar. Prueba con una imagen más pequeña.");}
});
$("cancelServiceEdit").addEventListener("click",resetServiceForm);

function renderAdmin(){
 $("warningText").value=localStorage.getItem(KEYS.warning)||"";
 renderRecords(KEYS.bookings,"booking","adminBookings");renderRecords(KEYS.students,"student","adminStudents");renderServicesAdmin();
 const qr=localStorage.getItem(KEYS.qr);$("qrPreview").innerHTML=qr?`<img class="qr-small" src="${qr}" alt="QR guardado">`:"No hay QR cargado.";
}
$("adminPanel").addEventListener("change",e=>{
 const t=e.target;if(!t.matches("select[data-field]"))return;
 const key=t.dataset.type==="booking"?KEYS.bookings:KEYS.students,arr=read(key),record=arr[Number(t.dataset.index)];if(!record)return;
 record[t.dataset.field]=t.value;save(key,arr);
});
$("saveWarning").addEventListener("click",()=>{localStorage.setItem(KEYS.warning,$("warningText").value.trim());$("warningStatus").textContent="Advertencia guardada.";renderWarning();});
$("deleteWarning").addEventListener("click",()=>{localStorage.removeItem(KEYS.warning);$("warningText").value="";$("warningStatus").textContent="Advertencia eliminada.";renderWarning();});
function renderWarning(){const w=localStorage.getItem(KEYS.warning)||"";$("publicWarning").textContent=w;$("publicWarning").classList.toggle("hidden",!w);}
renderWarning();
$("saveAdminQr").addEventListener("click",()=>{
 const file=$("adminQrFile").files[0];if(!file){alert("Selecciona una imagen QR.");return;}
 if(!file.type.startsWith("image/")||file.size>2*1024*1024){alert("El QR debe ser una imagen de máximo 2 MB.");return;}
 const reader=new FileReader();reader.onload=e=>{try{localStorage.setItem(KEYS.qr,e.target.result);renderAdmin();alert("QR guardado.");}catch{alert("No se pudo guardar el QR. Usa una imagen más pequeña.");}};reader.readAsDataURL(file);
});
