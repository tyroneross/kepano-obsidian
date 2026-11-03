// Source-owned Atlas area browser. No network, packages, or parallel content store.
function installAtlasAreas(plugin) {
  const { ItemView, MarkdownRenderer, Notice } = require('obsidian');
  const type = 'atlas-area-view';
  const memoryDrafts = new Map();
  const areas = {
    inbox: { title: 'Task inbox', paths: ['Planner/inbox.md'] },
    projects: { title: 'Projects', prefix: 'my-projects/', exclude: 'my-projects/inactive/' },
    knowledge: { title: 'Knowledge', prefix: 'Wiki/' },
    notes: { title: 'Planning notes', paths: ['Planner/notes.md'] },
  };
  function eligible(file, area) {
    return file.extension === 'md' && (area.paths ? area.paths.includes(file.path)
      : file.path.startsWith(area.prefix) && !file.path.startsWith(area.exclude || '\0')
        && !/(?:^|\/)(?:raw|outputs|tmp|templates|artifacts|scripts|_views)\//.test(file.path)
        && !/(?:\.suggestions|(?:^|\/)(?:CLAUDE|AGENTS)\.md)/.test(file.path));
  }
  function split(text) {
    const match = text.match(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/);
    return { prefix: match ? match[0] : '', body: match ? text.slice(match[0].length) : text };
  }
  class AreaView extends ItemView {
    getViewType() { return type; }
    getDisplayText() { return areas[this.area]?.title || 'Atlas'; }
    getIcon() { return 'panels-top-left'; }
    canLeave() {
      if (this.saving) { new Notice("Wait for the current save to finish."); return false; }
      const draft = memoryDrafts.get(this.currentKey);
      if (draft?.volatile) { new Notice("Device draft storage is unavailable. Save or discard this draft before leaving."); return false; }
      return true;
    }
    async setState(state, result) {
      if (!this.canLeave()) return;
      this.area = areas[state.area] ? state.area : 'notes';
      this.selectedPath = state.path || null;
      await this.render();
      await super.setState(state, result);
    }
    getState() { return { area: this.area || 'notes', path: this.selectedPath }; }
    async onOpen() { if (this.area) await this.render(); }
    draftKey(path) { return `atlas-draft:${this.app.vault.getName()}:${path}`; }
    async onClose() { this.request = (this.request || 0) + 1; }
    async render() {
      this.request = (this.request || 0) + 1;
      const root = this.contentEl; root.empty(); root.addClass('atlas-area');
      const area = areas[this.area];
      const header = root.createDiv({ cls: 'atlas-area-header' });
      const home = header.createEl('button', { text: '← Home' });
      home.onclick = async () => {
        if (!this.canLeave()) return;
        const leaf = this.app.workspace.getLeavesOfType('markdown').find(l => l.view.file?.path === 'Planner/Home.md') || this.app.workspace.getLeaf('tab');
        await leaf.setViewState({ type: 'markdown', active: true, state: { file: 'Planner/Home.md', mode: 'preview' } });
        this.app.workspace.revealLeaf(leaf);
      };
      header.createEl('h1', { text: area.title });
      const nav = root.createDiv({ cls: 'atlas-area-nav', attr: { 'aria-label': 'Areas' } });
      for (const [key, value] of Object.entries(areas)) {
        const b = nav.createEl('button', { text: value.title, attr: { 'aria-pressed': String(key === this.area) } });
        b.onclick = () => { if (this.canLeave()) void this.leaf.setViewState({ type, active: true, state: { area: key } }); };
      }
      const layout = root.createDiv({ cls: 'atlas-area-layout' });
      const side = layout.createDiv({ cls: 'atlas-area-sidebar' });
      const input = side.createEl('input', { type: 'search', placeholder: 'Find an entry…', attr: { 'aria-label': `Search ${area.title}` } });
      const count = side.createDiv({ cls: 'atlas-area-count', attr: { 'aria-live': 'polite' } });
      const list = side.createDiv({ cls: 'atlas-area-list' });
      this.detail = layout.createDiv({ cls: 'atlas-area-detail' });
      const files = this.app.vault.getMarkdownFiles().filter(f => eligible(f, area)).sort((a,b) => b.stat.mtime-a.stat.mtime);
      const title = f => this.app.metadataCache.getFileCache(f)?.frontmatter?.title || f.basename;
      const draw = () => {
        list.empty(); const matches = files.filter(f => `${title(f)} ${f.path}`.toLowerCase().includes(input.value.toLowerCase()));
        count.setText(`${matches.length} ${matches.length === 1 ? "entry" : "entries"}`);
        for (const file of matches.slice(0,80)) {
          const b = list.createEl('button', { cls: 'atlas-area-row', text: title(file) });
          b.onclick = () => this.showFile(file);
        }
        if (matches.length > 80) list.createEl('p', { text: 'Search to narrow the list.' });
        if (!matches.length) list.createEl('p', { text: 'No matching entries.' });
      };
      input.oninput = draw; draw();
      if (files.length) await this.showFile(files.find(f => f.path === this.selectedPath) || files[0]);
      else this.detail.createEl('p', { text: 'No entries in this area yet.' });
    }
    async showFile(file) {
      if (!this.canLeave()) return;
      const request = this.request = (this.request || 0) + 1;
      let original;
      try { original = await this.app.vault.read(file); }
      catch (error) { new Notice(`Could not read entry: ${error.message}`); return; }
      if (request !== this.request || !this.canLeave()) return;
      this.selectedPath = file.path;
      this.app.workspace?.requestSaveLayout?.();
      const { prefix, body } = split(original);
      const root = this.detail; root.empty();
      const title = this.app.metadataCache.getFileCache(file)?.frontmatter?.title || file.basename;
      root.createEl('h2', { text: title });
      root.createEl('p', { cls: 'atlas-area-path', text: file.path });
      const actions = root.createDiv({ cls: 'atlas-area-actions' });
      const read = actions.createEl('button', { text: 'Read' });
      const edit = actions.createEl('button', { text: 'Edit text' });
      const source = actions.createEl('button', { text: 'Open source' });
      source.onclick = () => this.app.workspace.getLeaf('tab').openFile(file);
      const status = root.createDiv({ cls: 'atlas-area-status', attr: { role: 'status' } });
      const preview = root.createDiv({ cls: 'atlas-area-preview' });
      const editor = root.createEl('textarea', { cls: 'atlas-area-editor', attr: { 'aria-label': `Edit ${title}`, spellcheck: 'true' } });
      const key = this.draftKey(file.path);
      this.currentKey = key;
      let draft = memoryDrafts.get(key);
      if (!draft) { try { draft = JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { draft = null; } }
      if (draft) memoryDrafts.set(key, draft);
      editor.value = draft?.body ?? body;
      editor.setSelectionRange(0, 0); editor.scrollTop = 0;
      const footer = root.createDiv({ cls: 'atlas-area-actions atlas-area-save' });
      root.insertBefore(footer, preview);
      const save = footer.createEl('button', { text: 'Save changes', cls: 'mod-cta' });
      const discard = footer.createEl('button', { text: 'Discard draft' });
      const persist = () => {
        draft = { original: draft?.original ?? original, body: editor.value };
        memoryDrafts.set(key, draft);
        try {
          localStorage.setItem(key, JSON.stringify(draft));
          status.setText('Draft kept on this device. Save changes to update the source file.');
        } catch (_) { draft.volatile = true; status.setText('Draft kept in memory only. Save before closing Obsidian.'); }
      };
      editor.oninput = persist;
      const mode = async editing => {
        editor.hidden = !editing; footer.hidden = !editing; preview.hidden = editing;
        read.setAttribute('aria-pressed', String(!editing)); edit.setAttribute('aria-pressed', String(editing));
        if (editing) { editor.focus(); if (this.contentEl.clientWidth <= 700) editor.scrollIntoView({ block: 'center' }); }
        else { preview.empty(); await MarkdownRenderer.render(this.app, editor.value, preview, file.path, this); }
      };
      read.onclick = () => mode(false); edit.onclick = () => mode(true);
      save.onclick = async () => {
        const savingDraft = memoryDrafts.get(key);
        const expected = draft?.original ?? original;
        const next = prefix + editor.value;
        this.request = (this.request || 0) + 1;
        this.saving = true;
        save.disabled = true; editor.disabled = true; discard.disabled = true;
        try {
          await this.app.vault.process(file, current => {
            if (current !== expected) throw new Error('Source changed since this draft began. Your draft is preserved; open the source to reconcile it.');
            return next;
          });
          original = next; draft = null;
          if (memoryDrafts.get(key) === savingDraft) {
            memoryDrafts.delete(key);
            try { localStorage.removeItem(key); status.setText('Saved to source file.'); }
            catch (_) { status.setText('Saved to source file. Device draft cleanup failed.'); }
          } else { status.setText('Saved earlier revision. A newer draft is preserved for review.'); }
          try { await mode(false); } catch (_) { status.setText('Saved to source file. Preview unavailable; open the source to read.'); }
        } catch (error) { if (memoryDrafts.get(key) === savingDraft) persist(); status.setText(`Save failed. ${error.message}`); }
        finally { this.saving = false; save.disabled = false; editor.disabled = false; discard.disabled = false; }
      };
      discard.onclick = () => {
        // Deliberate two-step discard; the first click cannot destroy a draft.
        if (discard.dataset.confirm !== 'yes') { discard.dataset.confirm = 'yes'; discard.setText('Confirm discard'); return; }
        try { localStorage.removeItem(key); } catch (_) { status.setText('Could not clear device draft. Retry after storage becomes available.'); return; }
        memoryDrafts.delete(key); void this.showFile(file);
      };
      if (draft) status.setText('Unfinished draft restored from this device.');
      await mode(Boolean(draft));
    }
  }
  plugin.registerView(type, leaf => new AreaView(leaf));
  const open = async area => {
    const leaf = plugin.app.workspace.getLeavesOfType(type)[0] || plugin.app.workspace.getLeaf('tab');
    await leaf.setViewState({ type, active: true, state: { area } });
    plugin.app.workspace.revealLeaf(leaf);
  };
  plugin.registerObsidianProtocolHandler('atlas-area', params => { if (areas[params.area]) void open(params.area); });
  for (const [key, area] of Object.entries(areas)) plugin.addCommand({ id: `atlas-${key}`, name: `Atlas: ${area.title}`, callback: () => open(key) });
}
module.exports = { installAtlasAreas };
