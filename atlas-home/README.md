# Atlas-inspired Native Home

An Atlas-inspired home for an existing Obsidian vault. It uses Markdown, the built-in Bases list view and one CSS snippet. No Dataview, JavaScript, external fonts, build step, service or custom indexer.

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
- `atlas-home.css`: page-scoped typography, compact shared outlines and responsive layout. It follows Obsidian's colors and text-size setting. Two columns stack below 800px of actual note width; quick links become a two-column grid in narrow notes. System fonts work offline.

After changing styles with Home already open, reopen Home so native Bases recalculates its row measurements. Avoid copying Obsidian's workspace or settings from a template repository. This add-on performs no automatic writes; native Bases retains its standard property-editing controls.

## Privacy

Personal note data, real folder mappings, screenshots, settings, credentials and exports belong in your private vault. This folder contains generic examples only. No hosted service receives data from these files. Existing Sync, Publish and backup settings are unchanged.

## Attribution

- Atlas visual reference: [InlitX / Obsidian Dashboard Gallery](https://github.com/InlitX/Obsidian-Dashboard-Gallery), copyright (c) 2026 InlitX, MIT. License retained in `LICENSE-Atlas`. The original Atlas implementation uses DataviewJS; this version adapts the hierarchy and grouping with native Markdown and Bases, rather than reproducing its dynamic widgets.
- Retained linked-index approach: [Steph Ango / Kepano](https://stephango.com/vault), copyright (c) 2023 Steph Ango, MIT; original license retained at repository root.
- Native adaptation: Tyrone Ross, MIT.

References: [Bases syntax](https://help.obsidian.md/bases/syntax), [List view](https://help.obsidian.md/bases/views/list).
