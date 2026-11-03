# Native Home

A small, Kepano-inspired home screen over an existing Obsidian vault. No community plugins, JavaScript, Dataview, custom indexer, network calls or build step. It uses Markdown, the core Bases plugin and an optional CSS snippet. It does not replace your folder structure or task manager.

## Install in an existing vault

1. Keep your vault separate from this public template repository. Copy only `Home.md` and `Home.base` from this folder into one folder in your existing vault. Do not copy the repository's `.obsidian` configuration.
2. Enable Obsidian's built-in **Bases** plugin if needed.
3. Set the five `home_*` properties on `Home.md` to your existing folder paths and project `type`. Paths are relative to the vault root. `home_inactive_folder` must name your archive folder, not an empty string.
4. Edit the Plan / Explore links to point at your existing inbox, project index, reference index and writing area. Optionally replace them with your established task-entry workflow. The template creates no tasks or folders automatically.
5. Copy `kepano-home.css` to your vault's `.obsidian/snippets/` folder and enable it under **Settings → Appearance → CSS snippets**.
6. Open Home in Reading view. Bookmark it with Obsidian's native Bookmarks feature.

The styles apply only to notes with `cssclasses: [kepano-home]` in Reading view. Other notes, editor styles and the global theme are unchanged. The home remains usable without the snippet.

## Maintain it yourself

- **Home.md:** headings, links and the folder/type mappings.
- **Home.base:** native filters, columns, sorts and display limits; edit in Obsidian or a text editor. The `this.home_*` values refer to the embedding Home note. Open Home to use the mapped views; opening Home.base alone lacks that note's properties.
- **kepano-home.css:** page-scoped visual styles. Obsidian loads changes from disk.

Daily pages list up to three existing ISO-dated notes; they do not claim to be a live task plan. Projects are notes whose `type` matches the configured value, outside the archive. Recent reference excludes common raw/generated/template folders. Adjust these filters to your taxonomy. View limits affect displayed rows only; source notes are untouched.

Bases can edit properties through its normal UI. This add-on performs no automatic writes and contains no scripts. Keep task edits in your existing task system to avoid duplicate sources of truth. Formula columns derive values and are not stored in note frontmatter.

## Privacy and public updates

This repository is a template, not your vault. Keep personal notes, screenshots, task data, settings, credentials, exports and local mappings out of it. Update this folder manually with reusable changes only. Never sync a private vault into this checkout or run a bulk copy from your vault back into it.

No hosted service receives your data from these assets. Your existing Obsidian Sync, Publish and backup settings remain your responsibility and are not modified. Do not enable Publish or create a remote for your private vault as part of installing this template.

## Attribution

Original vault: [Steph Ango (Kepano)](https://stephango.com/vault), [kepano/kepano-obsidian](https://github.com/kepano/kepano-obsidian), copyright © 2023 Steph Ango, MIT licensed. Original license is preserved at the repository root.

Native Home adaptation and page-scoped CSS: Tyrone Ross. The home borrows the restrained, linked-index and warm-paper direction; it does not bundle Minimal or require that theme. New add-on files are distributed under the same MIT license.

References: [Bases syntax](https://help.obsidian.md/bases/syntax), [functions](https://help.obsidian.md/bases/functions).
