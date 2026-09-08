import { allTracks, safe, trackId } from '../music/data.js';
import { link, pageHeader } from '../layout/shell.js';

// Separate IndexedDB store: never mingle personal compilations with canonical ratings.
const owner = () => {
  const session = JSON.parse(localStorage.getItem('how-i-hear-music:cloud-sync-session:v1') || 'null');
  if (!session?.token) return 'guest';
  const id = session.user?.id;
  if (!id) throw new Error('Could not confirm the account. Please sign in again.');
  return `user:${id}`;
};
const database = () => new Promise((resolve, reject) => {
  const request = indexedDB.open('him-compilations-v1', 1);
  request.onupgradeneeded = () => request.result.createObjectStore('records', { keyPath: 'key' });
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});
const access = async (mode, action) => {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('records', mode);
    const request = action(tx.objectStore('records'));
    tx.oncomplete = () => { db.close(); resolve(request.result); };
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error || new Error('Could not save the compilation.')); };
  });
};
export const compilationsPage = () => `${pageHeader('ARCHIVE / COMPILATIONS', 'Custom compilation', 'Choose works, arrange the order, and design your cover.', link('/archive/albums', 'Back to albums', 'button'))}<section id="compilation-app" class="compilation-app"><p role="status">Loading local drafts…</p></section>`;

let cleanup = () => {};
export async function bindCompilations() {
  cleanup();
  const root = document.querySelector('#compilation-app');
  if (!root) return;
  let account;
  const fail = (e) => { const status = root.querySelector('[data-status]'); if (status) status.textContent = e.message; else root.textContent = e.message; };
  try { account = owner(); } catch(e) { fail(e); return; }
  const prefix = `${account}:`;
  let draft, rows, view = 'edit', query = '', coverDraft, undo = [], redo = [];
  const urls = new Set();
  let active = true, paintRevision = 0, tasks = Promise.resolve();
  cleanup = () => { active=false; for(const u of urls) URL.revokeObjectURL(u); urls.clear(); root.onchange=root.oninput=root.onclick=null; };
  const enqueue = job => { tasks=tasks.then(async()=>{if(!active)return;if(owner()!==account)throw new Error('The account changed. Refresh the page.');await job();}).catch(fail);return tasks; };
  const url = blob => { const value = URL.createObjectURL(blob); urls.add(value); return value; };
  const fresh = () => ({ key:prefix + crypto.randomUUID(), title:'Untitled compilation', note:'', tracks:[], design:{background:'#202020',color:'#ffffff',text:'Night listening',size:90,layout:'single',images:[]}, updatedAt:Date.now() });
  const persist = async () => { if (owner() !== account) throw new Error('The account changed. Reopen this page.'); draft.updatedAt = Date.now(); const saved=structuredClone(draft);await access('readwrite', s=>s.put(saved)); };
  const render = async () => {
    if (!active || !root.isConnected) return;
    for (const u of urls) URL.revokeObjectURL(u); urls.clear();
    rows = (await access('readonly', s=>s.getAll())).filter(r=>r.key.startsWith(prefix));
    if (!active || !root.isConnected) return;
    const tracks = allTracks();
    const selected = draft.tracks.map(id => tracks.find(t=>trackId(t)===id) || {title:'Work unavailable',artist:'Remove or re-import it',missing:true});
    const preview = draft.cover ? `<img src="${url(draft.cover)}" alt="Custom compilation cover">` : '<span>Design your cover</span>';
    root.innerHTML = `<p class="mono">${account==='guest'?'Guest showcase · isolated from your account':'Private compilation'} · Stored only in this browser · cloud sync is not enabled</p><div class="compilation-toolbar"><select aria-label="Choose a saved compilation" data-library><option value="">Choose a saved compilation</option>${rows.map(r=>`<option value="${safe(r.key)}" ${r.key===draft.key?'selected':''}>${safe(r.title)}</option>`).join('')}</select><button type="button" data-new>New compilation</button><button type="button" data-delete>Delete current compilation</button></div><p data-status role="status"></p>${view==='studio'?studio():`<div class="compilation-columns">${view==='edit'?`<section><h2>Choose tracks from the archive</h2><label class="sr-only" for="comp-search">Search works</label><input id="comp-search" type="search" value="${safe(query)}"><div class="compilation-tracks">${tracks.map(t=>`<label ${`${t.title} ${t.artist}`.toLowerCase().includes(query.toLowerCase())?'':'hidden'}><input type="checkbox" data-track="${safe(trackId(t))}" ${draft.tracks.includes(trackId(t))?'checked':''}><span>${safe(t.title)}<small>${safe(t.artist)} · ${safe(t.versionLabel || t.versionType || 'Original version')}</small></span></label>`).join('')}</div></section>`:''}<section><h2>${view==='preview'?'Album preview':'My compilation'}</h2><div class="compilation-cover">${preview}</div><button type="button" data-studio>Design cover</button><label>Album title<input data-title maxlength="80" value="${safe(draft.title)}"></label><label>Compilation note<textarea data-note maxlength="640">${safe(draft.note)}</textarea></label><ol class="compilation-order">${selected.map((t,i)=>`<li><span>${safe(t.title)}<small>${safe(t.artist)}</small></span>${view==='edit'?`<button type="button" data-up="${i}" aria-label="Move ${safe(t.title)} up" ${i===0?'disabled':''}>↑</button><button type="button" data-down="${i}" aria-label="Move ${safe(t.title)} down" ${i===selected.length-1?'disabled':''}>↓</button><button type="button" data-remove="${i}" aria-label="Remove ${safe(t.title)}">×</button>`:''}</li>`).join('')}</ol><button type="button" data-save>Save draft</button><button type="button" data-preview class="button primary">${view==='edit'?'Preview album':'Back to editing'}</button></section></div>`}`;
    if(view==='studio') await paint();
  };
  const studio = () => `<section class="cover-studio"><h2>Cover studio</h2><canvas width="1200" height="1200" aria-label="Cover preview"></canvas><div class="cover-tools"><label>Layout<select data-design="layout"><option value="single" ${coverDraft.layout==='single'?'selected':''}>Single image</option><option value="grid" ${coverDraft.layout==='grid'?'selected':''}>Four-panel grid</option><option value="text" ${coverDraft.layout==='text'?'selected':''}>Text only</option></select></label><label>Upload images (up to four)<input type="file" data-upload accept="image/jpeg,image/png,image/webp" multiple></label><label>Title<input data-design="text" maxlength="40" value="${safe(coverDraft.text)}"></label><label>Text size<input data-design="size" type="range" min="30" max="150" value="${coverDraft.size}"></label><label>Background<input data-design="background" type="color" value="${coverDraft.background}"></label><label>Text color<input data-design="color" type="color" value="${coverDraft.color}"></label><button type="button" data-undo ${!undo.length?'disabled':''}>Undo</button><button type="button" data-redo ${!redo.length?'disabled':''}>Redo</button><button type="button" data-clear-images>Clear images</button><button type="button" data-cancel>Cancel</button><button type="button" data-apply class="button primary">Use this cover</button></div><p>Images are center-cropped; template editing is supported. Freeform layer arrangement is coming later.</p></section>`;
  const paint = async () => {
    const canvas = root.querySelector('canvas'); if (!canvas) return;
    const revision=++paintRevision;
    const buffer=document.createElement('canvas');buffer.width=buffer.height=1200;
    const ctx = buffer.getContext('2d'); const design = structuredClone(coverDraft);
    ctx.fillStyle=design.background; ctx.fillRect(0,0,1200,1200);
    const blobs=design.layout==='text'?[]:design.images.slice(0,design.layout==='single'?1:4);
    for(let i=0;i<blobs.length;i++) {
      const bitmap = await createImageBitmap(blobs[i]);
      const size = design.layout==='single'?1200:600, x=design.layout==='single'?0:i%2*600,y=design.layout==='single'?0:Math.floor(i/2)*600;
      const crop=Math.min(bitmap.width,bitmap.height);ctx.drawImage(bitmap,(bitmap.width-crop)/2,(bitmap.height-crop)/2,crop,crop,x,y,size,size);bitmap.close();
    }
    await document.fonts.ready;
    ctx.fillStyle=design.color; ctx.font=`${design.size}px Georgia, serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(design.text,600,600,1080);
    if(active && revision===paintRevision && canvas.isConnected)canvas.getContext('2d').drawImage(buffer,0,0);
  };
  const checkpoint=()=>{undo.push(structuredClone(coverDraft));if(undo.length>20)undo.shift();redo=[];};
  try { rows=(await access('readonly',s=>s.getAll())).filter(r=>r.key.startsWith(prefix));draft=rows.sort((a,b)=>b.updatedAt-a.updatedAt)[0] || fresh();if(draft.title==='\u672a\u547d\u540d\u4e13\u8f91'){draft.title='Untitled compilation';await persist();}await render(); } catch(e) {fail(e);return;}
  root.onchange = e => {const t=e.target;const value=t.value;const checked=t.checked;const files=t.files?[...t.files]:[];return enqueue(async()=>{try {
    if(t.matches('[data-title]')) {draft.title=t.value.trim() || 'Untitled compilation';await persist();}
    if(t.matches('[data-note]')) {draft.note=t.value;await persist();}
    if(t.matches('[data-library]')&&t.value) {draft=rows.find(r=>r.key===t.value);view='edit';await render();}
    if(t.dataset.track) {draft.tracks=checked?[...new Set([...draft.tracks,t.dataset.track])]:draft.tracks.filter(id=>id!==t.dataset.track);await persist();await render();}
    if(t.dataset.design) {const next=t.type==='range'?Number(value):value;if(coverDraft[t.dataset.design]!==next){checkpoint();coverDraft[t.dataset.design]=next;draft.workingDesign=structuredClone(coverDraft);await persist();await paint();root.querySelector('[data-undo]').disabled=!undo.length;root.querySelector('[data-redo]').disabled=!redo.length;}}
    if(t.matches('[data-upload]')) {
      if(!files.length)return;if(files.length+coverDraft.images.length>4)throw new Error('Up to four images.');
      const normalized=[];
      for(const f of files){if(!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>10*1024*1024)throw new Error('Use JPEG, PNG or WebP files no larger than 10 MB.');const b=await createImageBitmap(f);if(b.width*b.height>40000000){b.close();throw new Error('Image dimensions are too large.');}const cv=document.createElement('canvas');const ratio=Math.min(1,1600/Math.max(b.width,b.height));cv.width=Math.round(b.width*ratio);cv.height=Math.round(b.height*ratio);cv.getContext('2d').drawImage(b,0,0,cv.width,cv.height);b.close();normalized.push(await new Promise(r=>cv.toBlob(r,'image/webp',.9)));}
      checkpoint();coverDraft.images.push(...normalized);draft.workingDesign=structuredClone(coverDraft);await persist();await render();
    }
  }catch(err){fail(err);}});};
  // Do not replace the search input while typing, especially during Chinese IME composition.
  root.oninput=e=>{if(e.target.id==='comp-search'){query=e.target.value;root.querySelectorAll('.compilation-tracks label').forEach(row=>{row.hidden=!row.textContent.toLowerCase().includes(query.toLowerCase());});}};
  root.onclick=e=>{const t=e.target.closest('button');if(!t||t.disabled)return;return enqueue(async()=>{try{
    if(t.hasAttribute('data-new')){draft=fresh();view='edit';}
    if(t.hasAttribute('data-delete')){if(!confirm('Delete this custom compilation? Original works and ratings will not be deleted.'))return;await access('readwrite',s=>s.delete(draft.key));draft=fresh();view='edit';}
    if(t.hasAttribute('data-studio')){coverDraft=structuredClone(draft.workingDesign || draft.design);undo=[];redo=[];view='studio';}
    if(t.hasAttribute('data-cancel')){delete draft.workingDesign;await persist();view='edit';}
    if(t.hasAttribute('data-undo')&&undo.length){redo.push(structuredClone(coverDraft));coverDraft=undo.pop();}
    if(t.hasAttribute('data-redo')&&redo.length){undo.push(structuredClone(coverDraft));coverDraft=redo.pop();}
    if(t.hasAttribute('data-clear-images')){checkpoint();coverDraft.images=[];}
    if(['data-undo','data-redo','data-clear-images'].some(attr=>t.hasAttribute(attr))){draft.workingDesign=structuredClone(coverDraft);await persist();}
    if(t.hasAttribute('data-apply')){await paint();const blob=await new Promise(r=>root.querySelector('canvas').toBlob(r,'image/png'));if(!blob)throw new Error('Cover generation failed. Please try again.');draft.cover=blob;draft.design=structuredClone(coverDraft);delete draft.workingDesign;await persist();view='edit';}
    for(const [attr,delta] of [['data-up',-1],['data-down',1]])if(t.hasAttribute(attr)){const i=Number(t.getAttribute(attr));[draft.tracks[i],draft.tracks[i+delta]]=[draft.tracks[i+delta],draft.tracks[i]];await persist();}
    if(t.hasAttribute('data-remove')){draft.tracks.splice(Number(t.getAttribute('data-remove')),1);await persist();}
    if(t.hasAttribute('data-preview')){if(!draft.tracks.length)throw new Error('Select at least one work first.');await persist();view=view==='preview'?'edit':'preview';}
    if(t.hasAttribute('data-save')){await persist();await render();root.querySelector('[data-status]').textContent='Draft saved in this browser.';return;}
    await render();
  }catch(err){fail(err);}});};
}
