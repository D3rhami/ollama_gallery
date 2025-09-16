### 🗂️ API: Ollama Gallery JSON

- 📑 Static JSON endpoints scraped daily from the Ollama Library and kept up to date via automation ✨.
- 📦 Source: https://ollama.com/library
 
### 🏷️ All Tags
* JSON mapping of tag → versions metadata for all tags.
- **Link**: https://raw.githubusercontent.com/D3rhami/ollama_gallery/refs/heads/main/data/tags.json
- **Expected example** (truncated):
```json
{
  "gpt-oss": {
    "aa4295ac10c3": {
      "href": "https://ollama.com/library/gpt-oss:latest",
      "name": "gpt-oss:latest",
      "input_types": ["Text"],
      "updated_str": "1 month ago",
      "update_date": "2025-08-16",
      "context_window": "128K",
      "context_window_num": 128000,
      "size_str": "14GB",
      "size_num": 14000000000
    }
  }
}
```

### 🔖 Specific Tag
* Versions metadata for a single tag.
- **Link pattern**: https://raw.githubusercontent.com/D3rhami/ollama_gallery/refs/heads/main/data/tags/{tag}.json
- **Example**: https://raw.githubusercontent.com/D3rhami/ollama_gallery/refs/heads/main/data/tags/gpt-oss.json
- **Keys**:
  - `href`: source page URL of the tag or model variant.
  - `name`: full tag identifier, often `tag:variant`.
  - `input_types`: list of supported modalities, e.g., `Text`, `Image`.
  - `updated_str`: human-friendly relative update time.
  - `update_date`: ISO date string of last update.
  - `context_window`: human-friendly context window size.
  - `context_window_num`: numeric context window size in tokens.
  - `size_str`: human-friendly model size string.
  - `size_num`: model size in bytes (parsed from `size_str`).
- **Expected example** (truncated):
```json
{
  "aa4295ac10c3": {
    "href": "https://ollama.com/library/gpt-oss:latest",
    "name": "gpt-oss:latest",
    "input_types": ["Text"],
    "updated_str": "1 month ago",
    "update_date": "2025-08-16",
    "context_window": "128K",
    "context_window_num": 128000,
    "size_str": "14GB",
    "size_num": 14000000000
  },
  "f7f8e2f8f4e0": {
    "href": "https://ollama.com/library/gpt-oss:120b",
    "name": "gpt-oss:120b",
    "input_types": ["Text"],
    "updated_str": "1 month ago",
    "update_date": "2025-08-16",
    "context_window": "128K",
    "context_window_num": 128000,
    "size_str": "65GB",
    "size_num": 65000000000
  }
}
```

### 📚 All Models
* Aggregated index of models with latest metadata.
- **Link**: https://raw.githubusercontent.com/D3rhami/ollama_gallery/refs/heads/main/data/models.json
- **Expected example** (truncated):
```json
{
  "gpt-oss": {
    "href": "https://ollama.com/library/gpt-oss:latest",
    "name": "gpt-oss:latest",
    "updated_str": "1 month ago",
    "update_date": "2025-08-16"
  }
}
```

### 🎯 Specific Model
Metadata for a single model.
- **Link pattern**: https://raw.githubusercontent.com/D3rhami/ollama_gallery/refs/heads/main/data/models/{model}.json
- **Example**: https://raw.githubusercontent.com/D3rhami/ollama_gallery/refs/heads/main/data/models/gpt-oss.json
- **Keys**:
  - `href`: source page URL of the specific model tag/variant.
  - `name`: model identifier, often `model:variant`.
  - `input_types`: list of supported modalities.
  - `updated_str`: human-friendly relative update time.
  - `update_date`: ISO date of last update.
  - `context_window`: human-friendly context size.
  - `context_window_num`: numeric context tokens.
  - `size_str`: model size as display string.
  - `size_num`: model size in bytes.
- **Expected example** (truncated):
```json
{
  "href": "https://ollama.com/library/gpt-oss:latest",
  "name": "gpt-oss:latest",
  "input_types": ["Text"],
  "updated_str": "1 month ago",
  "update_date": "2025-08-16",
  "context_window": "128K",
  "context_window_num": 128000,
  "size_str": "14GB",
  "size_num": 14000000000
}
```

### 📊 Tags Status
* Scrape status summary for tags.
- **Link**: https://raw.githubusercontent.com/D3rhami/ollama_gallery/refs/heads/main/data/tags_status.json
- **Expected example**:
```json
{
  "successful": 5918,
  "success": true,
  "failed": 0,
  "api_data_updated": "2025-09-16",
  "processing_time": "27.02 seconds"
}
```

### 📊 Models Status
* Scrape status summary for models, including capability and parameter lists.
- **Link**: https://raw.githubusercontent.com/D3rhami/ollama_gallery/refs/heads/main/data/models_status.json
- **Expected example** (truncated):
```json
{
  "total_count": 179,
  "success": true,
  "error": 0,
  "api_data_updated": "2025-09-16",
  "cap_list": ["embedding", "thinking", "tools", "vision"],
  "pars_list": ["0.5b", "0.6b", "1.1b", "..."],
  "processing_time": "1.98 seconds"
}
```
