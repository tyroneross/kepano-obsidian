# Atlas-inspired Native Home

An Atlas-inspired home for an existing Obsidian vault. It uses Markdown, the built-in Bases list view and one CSS snippet. The basic home needs no Dataview, JavaScript, external fonts, build step, service or custom indexer. An optional source-owned editor module is described below.

The home opens existing files. It does not replace your folder structure or create a second task system.

## Install

1. Copy `Home.md` and `Home.base` into one folder in your existing vault. Keep this template repository separate from your vault.
2. Enable Obsidian's built-in Bases plugin if needed. Use a version that supports its native List view.
3. Set the five `home_*` properties on Home to your existing daily, project, archive and reference folders and project note type.
4. Replace the example quick links and Explore destinations with existing files in your vault. Replace the daily-plan instruction with your existing workflow. If you put the files in a subfolder, use explicit vault-relative paths for the three Home.base embeds.
5. Copy `atlas-home.css` to `.obsidian/snippets/`, then enable it in Appearance. Set `cssclasses: [atlas-home]` on Home. Disable another home snippet if that note was using it.
6. Open Home in Reading view and bookmark it. Properties remain editable in editing mode.

The example links are placeholders to customize, not files this add-on creates. Daily pages list up to three existing ISO-dated notes; the list does not claim they are today's current plan. Projects and recently modified reference each show up to six existing files. Core Bases owns loading, empty/error states, search, sort and other view controls. Task edits stay in your existing task workflow.

## Maintain

- `Home.md`: labels, navigation, attribution and folder mappings.
- `Home.base`: native filters, formulas, ordering and limits. The `this.home_*` properties come from the embedding Home note; opening the Base by itself lacks that context.
- `atlas-home.css`: page-scoped typography, compact shared outlines and responsive layout. It uses a RossLabs color-engine palette with separate light and dark roles and follows Obsidian's text-size setting. Two columns stack below 800px of actual note width; quick links become a two-column grid in narrow notes. System fonts work offline.

After changing styles with Home already open, reopen Home so native Bases recalculates its row measurements. Avoid copying Obsidian's workspace or settings from a template repository. This add-on performs no automatic writes; native Bases retains its standard property-editing controls.

## Privacy

Personal note data, real folder mappings, screenshots, settings, credentials and exports belong in your private vault. This folder contains generic examples only. No hosted service receives data from these files. Existing Sync, Publish and backup settings are unchanged.

## Attribution

- Atlas visual reference: [InlitX / Obsidian Dashboard Gallery](https://github.com/InlitX/Obsidian-Dashboard-Gallery), copyright (c) 2026 InlitX, MIT. License retained in `LICENSE-Atlas`. The original Atlas implementation uses DataviewJS; this version adapts the hierarchy and grouping with native Markdown and Bases, rather than reproducing its dynamic widgets.
- Retained linked-index approach: [Steph Ango / Kepano](https://stephango.com/vault), copyright (c) 2023 Steph Ango, MIT; original license retained at repository root.
- Native adaptation: Tyrone Ross, MIT.

References: [Bases syntax](https://help.obsidian.md/bases/syntax), [List view](https://help.obsidian.md/bases/views/list).

## Optional area reader and editor

`atlas-areas.js` is a small module for an **existing source-owned Obsidian plugin**. It is not a standalone plugin and is not required by the basic home. It adds searchable entry lists, rendered Markdown, a plain-text Markdown editor and explicit Save/Discard controls. No external packages or network requests are added.

For a CommonJS host, copy the module alongside its source and call `require("./atlas-areas").installAtlasAreas(this)` once from the host plugin's `onload`. If that host bundles modules, include it in its existing bundling mechanism. Keep the CSS snippet enabled. Customize the `areas` object, Home path and excluded folders to your vault. Example paths are generic conventions, not a vault export.

After integration, quick links can use `[Task inbox](obsidian://atlas-area?area=inbox)`, with `projects`, `knowledge` or `notes` for the other areas. The ordinary links in the supplied Home remain usable without this extension. Commands named “Atlas: …” are also registered under the host plugin.

The editor preserves frontmatter and changes the selected source file only when Save is clicked. It compares the exact original source inside Obsidian's atomic `Vault.process` callback; a concurrent change blocks the write. Drafts are stored in the app's local device storage, keyed by vault name and file path. They do not sync to another device. If storage fails, an in-memory draft remains and navigation is blocked until Save or Discard; quitting the app can still lose a memory-only draft. Older asynchronous save completions cannot remove or overwrite a newer draft. A newer draft whose source changed requires reconciliation.

This version edits existing entries; it does not automatically create tasks, project records or canonical knowledge pages. Use your existing capture workflows for new records. The entry list shows at most 80 matching results; search narrows it.

Run `node --test test-atlas-areas.js` for the behavioral checks. API basis: [official Obsidian API declarations](https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts), including `ItemView`, `MarkdownRenderer.render`, protocol handlers and `Vault.process`.

### Color provenance

The page palette was generated with the RossLabs/Groundwork relationship engine: anchor hue 250°, analogous accent +35°, base chroma 0.025, accent chroma 0.14, light surface L=0.985 and dark L=0.16. The generated roles are retained in CSS. Native Obsidian controls still inherit some platform styling; palette checks do not establish an overall accessibility pass.
