const { test } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const { installAtlasAreas } = require('./atlas-areas');
class El {
  constructor(tag = 'div', props = {}) { this.tag = tag; this.children = []; this.value = ''; this.dataset = {}; this.text = props.text; this.attrs = props.attr || {}; }
  createEl(tag, props) { const e = new El(tag,props); this.children.push(e); return e; }
  createDiv(props) { return this.createEl('div',props); }
  empty() { this.children = []; }
  addClass() {} focus() {} setSelectionRange() {} scrollIntoView() {}
  insertBefore(child,before) { this.children=this.children.filter(e=>e!==child);this.children.splice(this.children.indexOf(before),0,child); } setText(t) { this.text=t; } setAttribute(k,v) { this.attrs[k]=v; }
  all() { return [this,...this.children.flatMap(e=>e.all())]; }
}
function harness() {
  const files = [{ path:'Planner/notes.md', extension:'md', basename:'notes', stat:{mtime:1} }, {path:'Wiki/raw/private.md',extension:'md',stat:{mtime:2}}, {path:'Wiki/concepts/example.md',extension:'md',basename:'example',stat:{mtime:3}}];
  let text = '---\nid: notes\nprivacy: confidential\n---\n# Notes\nOriginal';
  const vault = {getName:()=> 'test',getMarkdownFiles:()=>files,read:async()=>text,process:async(f,fn)=>{text=fn(text);}};
  class ItemView { constructor() { this.app={vault,metadataCache:{getFileCache:()=>({})}};this.contentEl=new El(); } async setState(){} }
  const original=Module._load; let View;
  Module._load = function(name,...args) { if(name==='obsidian') return {ItemView,MarkdownRenderer:{render:async(app,t,el)=>el.setText(t)},Notice:class{}};return original.call(this,name,...args); };
  try { installAtlasAreas({registerView:(t,fn)=>{View=fn;},registerObsidianProtocolHandler(){},addCommand(){}}); } finally {Module._load=original;}
  const store=new Map(); global.localStorage={getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
  const view=View({});
  const find=(tag,text)=>view.contentEl.all().find(e=>e.tag===tag && (text === undefined || e.text===text));
  return {view,store,find,newView:()=>View({}),get:()=>text,set:t=>{text=t;}};
}
test('save preserves frontmatter and navigation restores a locally persisted draft',async()=>{
 const h=harness();await h.view.setState({area:'notes'});await h.find('button','Edit text').onclick();
 const edit=h.find('textarea');edit.value='# Notes\nChanged';edit.oninput();
 await h.view.setState({area:'inbox'});await h.view.setState({area:'notes'});
 assert.equal(h.find('textarea').value,'# Notes\nChanged');
 await h.find('button','Save changes').onclick();assert.equal(h.get(),'---\nid: notes\nprivacy: confidential\n---\n# Notes\nChanged');assert.equal(h.store.size,0);
});
test('concurrent source change blocks save and retains draft',async()=>{
 const h=harness();await h.view.setState({area:'notes'});const edit=h.find('textarea');edit.value='My draft';edit.oninput();h.set('Another writer changed the source');
 await h.find('button','Save changes').onclick();assert.equal(h.get(),'Another writer changed the source');assert.equal(h.store.size,1);assert.ok(h.view.contentEl.all().some(e=>e.text?.includes('Save failed. Source changed')));
});
test('knowledge excludes raw files; search exposes an empty result state',async()=>{
 const h=harness();await h.view.setState({area:'knowledge'});assert.ok(h.find('button','example'));assert.ok(!h.find('button','private'));
 const search=h.find('input');search.value='does not exist';search.oninput();assert.ok(h.view.contentEl.all().some(e=>e.text==='No matching entries.'));
});
test('discard requires two clicks',async()=>{
 const h=harness();await h.view.setState({area:'notes'});h.find('textarea').value='draft';h.find('textarea').oninput();const b=h.find('button','Discard draft');b.onclick();assert.equal(h.store.size,1);b.onclick();assert.equal(h.store.size,0);
});
test('pending save blocks changing editor sessions',async()=>{
 const h=harness();await h.view.setState({area:'notes'});const edit=h.find('textarea');edit.value='Saved draft';edit.oninput();
 let release;const vault=h.view.app.vault;vault.process=async(f,fn)=>{await new Promise(r=>{release=r;});h.set(fn(h.get()));};
 const pending=h.find('button','Save changes').onclick();await h.view.setState({area:'knowledge'});assert.equal(h.view.area,'notes');await h.view.showFile({path:'other'});assert.equal(h.find('textarea'),edit);release();await pending;assert.ok(h.get().endsWith('Saved draft'));
});
test('storage failure retains memory draft and blocks navigation; source save still works',async()=>{
 const h=harness();await h.view.setState({area:'notes'});global.localStorage.setItem=()=>{throw Error('Quota exceeded');};
 const edit=h.find('textarea');edit.value='In memory';edit.oninput();await h.view.setState({area:'knowledge'});assert.equal(h.view.area,'notes');assert.equal(h.find('textarea').value,'In memory');
 await h.find('button','Save changes').onclick();assert.ok(h.get().endsWith('In memory'));await h.view.setState({area:'knowledge'});assert.equal(h.view.area,'knowledge');
});
test('draft cleanup failure does not misreport a successful source write',async()=>{
 const h=harness();await h.view.setState({area:'notes'});h.find('textarea').value='Saved';h.find('textarea').oninput();global.localStorage.removeItem=()=>{throw Error('Unavailable');};
 await h.find('button','Save changes').onclick();assert.ok(h.get().endsWith('Saved'));assert.ok(h.view.contentEl.all().some(e=>e.text==='Saved to source file. Device draft cleanup failed.'));
});
test('a read already in flight cannot replace the editor during save',async()=>{
 const h=harness();await h.view.setState({area:'notes'});const edit=h.find('textarea');edit.value='Draft one';edit.oninput();
 let finishRead, finishSave;h.view.app.vault.read=()=>new Promise(r=>{finishRead=r;});h.view.app.vault.process=async(f,fn)=>{await new Promise(r=>{finishSave=r;});h.set(fn(h.get()));};
 const read=h.view.showFile({path:'Planner/notes.md',basename:'notes'});const save=h.find('button','Save changes').onclick();finishRead(h.get());await read;assert.equal(h.find('textarea'),edit);assert.equal(edit.disabled,true);finishSave();await save;assert.ok(h.get().endsWith('Draft one'));
});
for (const fail of [false,true]) test(`closed view's ${fail?'failed':'successful'} save cannot erase a recreated view's newer draft`,async()=>{
 const h=harness();await h.view.setState({area:'notes'});h.find('textarea').value='Draft one';h.find('textarea').oninput();
 let finish;h.view.app.vault.process=async(f,fn)=>{await new Promise(r=>{finish=r;});if(fail)throw Error('Write failed');h.set(fn(h.get()));};
 const save=h.find('button','Save changes').onclick();await h.view.onClose();const next=h.newView();await next.setState({area:'notes'});const editor=next.contentEl.all().find(e=>e.tag==='textarea');editor.value='Draft two';editor.oninput();finish();await save;
 assert.equal(JSON.parse([...h.store.values()][0]).body,'Draft two');assert.equal(editor.value,'Draft two');assert.equal(fail?h.get().endsWith('Original'):h.get().endsWith('Draft one'),true);
});
