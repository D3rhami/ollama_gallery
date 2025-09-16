<div align="center" style="background:#fffce9;padding:16px;">
  <img src="https://raw.githubusercontent.com/D3rhami/ollama_gallery/heads/main/assets/images/banner_light.webp" alt="Project Banner" width="960" />
</div>

🌌 Ollama Gallery — The Ultimate Community Models Explorer

A fast, nice‑looking web app to discover, filter, sort, and explore the Ollama models and tags ecosystem with smooth tables and daily‑updated JSON APIs.

---

### ✨ Overview
Ollama Gallery is a fast and friendly explorer for community models and tags. Data refreshes daily. A static JSON API is available. The UI is nice‑looking, with advanced filters, instant search, and dark mode to help you track models, tags, sizes, context windows, capabilities, and more.

---
### 🆚 Why this over the official Ollama Library?
- **Static JSON endpoints** for the entire library and per-entity access.
- **Richer filters** across capabilities, parameters, temporal windows, and sizes.
- **Rapid search+highlight** with zero back-end.
- **Copy‑friendly UI** and ribbon‑based filter feedback.
- **Daily refresh** with simple observability via status JSON.

---

### 🚀 Highlights
- **Daily-updated data**: JSON snapshots refreshed via automation.
- **Advanced filtering**: capabilities, parameters, updated-time, input types, context window, size, include/exclude terms, entries per page.
- **Unified search**: instant highlight across relevant columns for both models and tags.
- **Copy-friendly**: one-click copy on model and tag names.
- **Accessible**: keyboard-friendly, ARIA for loading, high-contrast dark mode.
- **Static hosting ready**: works on GitHub Pages or any static host.

---

### 🖼️ Screenshot
<div style="border:1px solid #e5e7eb;border-radius:12px;padding:12px;">
  <img src="https://raw.githubusercontent.com/D3rhami/ollama_gallery/heads/main/assets/Screenshot1.svg" alt="App Screenshot" width="960" />
  <div style="display:flex;justify-content:center;font-weight:600;color:#64748b;font-size:13px;margin-top:8px;">Preview of the Models view — supports dark mode and light mode</div>
</div>

---

### 🧪 Advanced Filtering (Filters Hub)
- **Capabilities**: filter by model features like embedding, vision, tools, thinking.
- **Parameters**: filter by model parameter scales (k/M/B/T/P), with robust parsing.
- **Updated range**: presets (today, week, 2 weeks, month, 3 months, year) or custom date range.
- **Include terms**: require substrings in names, e.g., `qwen:`.
- **Exclude terms**: remove noisy matches from names.
- **Entries per page**: 5/10/25/50/75/100/All with live pagination.
- **Tags view filters**:
  - Input types: Text/Image/…
  - Context window range: numeric range using tokenized values.
  - Size range: numeric range parsed from human-friendly sizes.

Filter chips appear in a ribbon with actions: remove, open filter hub, save (extensible).

---

### 🔍 Unified Search
- Searches contextually across key columns for the active table.
- Highlights matches in-table with smart scoping (no noise in link/icon cells).
- Clears on navigation to keep focus sharp.

---

### 🔌 Public JSON API (Static Data)
Curated JSON is updated daily and consumable directly from GitHub raw URLs.

#### 📖 Full API Document
- See: [API_DOC.md](API_DOC.md) — also rendered under the “APIs” tab in the site

#### 🏷️ All Tags
- Link: [Open](https://raw.githubusercontent.com/D3rhami/ollama_gallery/main/data/tags.json)
- Structure: a map of `tag → versions`, each version entry containing `input_types`, `updated_str`, `update_date`, `context_window(_num)`, `size(_num)`, and `href`.

#### 🔖 Tag By Name
- Pattern: [Open](https://raw.githubusercontent.com/D3rhami/ollama_gallery/main/data/tags/{tag}.json)
- Keys: `href`, `name`, `input_types`, `updated_str`, `update_date`, `context_window(_num)`, `size(_num)`.

#### 📚 All Models
- Link: [Open](https://raw.githubusercontent.com/D3rhami/ollama_gallery/main/data/models.json)
- Fields: `capabilities`, `parameters`, `pull(_str)`, `tag_count`, `updated(_date)`, `link`, `description`.

#### 🎯 Model By Name
- Pattern: [Open](https://raw.githubusercontent.com/D3rhami/ollama_gallery/main/data/models/{model}.json)
- Use with tag data for richer joins (e.g., versions, sizes, context windows).
 
 

---

### 🧩 Tech Stack
- HTML/CSS/JS (no backend required)
- DataTables 2, jQuery, mark.js, Prism, DOMPurify, marked
- Tailwind (CDN), Bootstrap (CDN)

---

### 🤝 Contributing or 🐞 Report Bug
Issues and PRs are welcome. Please:
- Describe the change and motivation clearly
- For UI changes, attach before/after screenshots
- Keep styles and scripts consistent with existing patterns
 If you found a bug or want to request a feature, open an issue: [Report an issue](https://github.com/D3rhami/ollama_gallery/issues)
---

### 📜 License
- See [LICENSE](LICENSE).

---

### 🌟 Acknowledgements
- Inspired by `ollama/ollama` and the community library. This project focuses on discoverability, up-to-date static data, and UX for creative workflows.


