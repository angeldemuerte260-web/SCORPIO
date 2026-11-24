/* Enlaces de redes sociales (Facebook / TikTok): validación, botones y pie de página */
function socialUrl(v,kind){
 v=String(v||'').trim();if(!v)return '';
 if(!/^https?:\/\//i.test(v))v='https://'+v;
 let u;try{u=new URL(v)}catch{return ''}
 if(u.protocol!=='https:'&&u.protocol!=='http:')return '';
 const h=u.hostname.toLowerCase(),ok={facebook:['facebook.com','fb.com','fb.watch'],tiktok:['tiktok.com']}[kind]||[];
 return ok.some(d=>h===d||h.endsWith('.'+d))?u.href:'';
}
function socialLinksHtml(o){
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 o=o||{};const fb=socialUrl(o.facebook,'facebook'),tk=socialUrl(o.tiktok,'tiktok');
 return (fb?`<a class="social-link" href="${esc(fb)}" target="_blank" rel="noopener noreferrer">Facebook</a>`:'')+(tk?`<a class="social-link" href="${esc(tk)}" target="_blank" rel="noopener noreferrer">TikTok</a>`:'');
}
(function(){
 const el=document.getElementById('footerSocial');if(!el)return;
 let s={};try{s=JSON.parse(localStorage.getItem('bn_settings'))||{}}catch{}
 const html=socialLinksHtml(s);el.innerHTML=html?'<span class="social-label">Síguenos:</span>'+html:'';
})();
