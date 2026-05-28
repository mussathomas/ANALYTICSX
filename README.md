# AnalyticsX — Standalone AI Analytical Platform

> A fully self-contained, browser-based analytical platform for small datasets.
> Upload data, run statistics, visualize, query in plain English, and auto-generate AI insights.
> Runs anywhere — locally, on Netlify, Vercel, or any static host.

---

## Screenshots (feature overview)

| Tab | What it does |
|-----|-------------|
| **Data Manager** | Upload CSV/Excel, drag-and-drop, manual sheet editor, export CSV |
| **Computations** | Aggregation (sum/avg/min/max/std/median), row filtering, group-by |
| **NL Query** | Plain-English questions → Claude answers with actual data values |
| **Visualize** | Bar, Line, Area, Pie, Scatter — download as SVG or PNG |
| **AI Insights** | Auto-generate executive summary, trends, outliers, recommendations |

---

## Quick Start

### Requirements
- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **npm** (comes with Node.js)

### 1. Install and run

```bash
# Clone or unzip the project folder, then:
cd analytix

# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser at **http://localhost:5173**

That's it. No backend server, no database, no Docker required.

---

## Getting Your API Key (for AI features)

The NL Query and AI Insights tabs require an Anthropic API key.

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`)
5. In the app, click **⚙ Settings** (top-right) → paste your key → **Save**

Your key is stored in your browser's `localStorage` only — it never leaves your machine except when sent directly to Anthropic's API.

> **Free tier:** Anthropic provides free credits on new accounts, more than enough to explore the platform extensively.

---

## Production Build

```bash
# Build optimized production files
npm run build

# Preview the production build locally
npm run preview
```

Output goes to the `dist/` folder. Deploy this folder to any static host.

---

## Deployment

### Netlify (drag-and-drop)
1. Run `npm run build`
2. Go to [netlify.com](https://netlify.com) → **Add new site** → **Deploy manually**
3. Drag the `dist/` folder onto the page

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### GitHub Pages
```bash
# In vite.config.js, add: base: '/your-repo-name/'
npm run build
# Push dist/ to gh-pages branch
```

### Any static host (Nginx, Apache, S3)
Upload all files in `dist/` to your web root.

---

## Project Structure

```
analytix/
├── index.html                    # HTML entry point
├── vite.config.js                # Vite configuration
├── package.json
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx                  # React DOM mount
    ├── App.jsx                   # Root shell, tab routing, state
    ├── index.css                 # Global design system (CSS variables, all styles)
    ├── components/
    │   ├── DataManager.jsx       # File upload, manual sheet, preview
    │   ├── Computations.jsx      # Stats, filter, group-by
    │   ├── NLChat.jsx            # Natural language query interface
    │   ├── Visualizations.jsx    # Chart builder with download
    │   ├── AIInsights.jsx        # AI auto-analysis panel
    │   └── SettingsModal.jsx     # API key management
    └── utils/
        └── data.js               # Parsing, stats, Claude API, utilities
```

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `react` + `react-dom` | UI framework |
| `recharts` | All charting (Bar, Line, Area, Pie, Scatter) |
| `xlsx` | Excel file parsing (.xlsx / .xls) |
| `papaparse` | Fast, robust CSV parsing |
| `vite` + `@vitejs/plugin-react` | Build tooling |

No UI component libraries. No CSS frameworks. Fully custom design system in `index.css`.

---

## Supported File Formats

| Format | Extensions | Notes |
|--------|-----------|-------|
| CSV | `.csv`, `.txt` | Comma-separated. PapaParse handles edge cases (quoted commas, etc.) |
| TSV | `.tsv`, `.txt` | Tab-separated also works |
| Excel (modern) | `.xlsx` | Reads first sheet |
| Excel (legacy) | `.xls` | Supported via SheetJS |

**Recommended dataset size:** Up to ~10,000 rows. The platform runs entirely in the browser — no server-side processing.

> For AI features, only the first 30 rows are sent to Claude to stay within token limits. All computations (tab 2) and charts (tab 4) use the full dataset.

---

## Feature Details

### Data Manager
- **Upload** — drag-and-drop or click-to-browse. Auto-detects numeric vs text columns.
- **Manual Sheet** — editable grid with custom column headers. Add/remove rows and columns.
- **Sample Data** — 12-month sales dataset with 6 columns, loaded instantly for demos.
- **Export** — downloads current working dataset as `.csv`.
- **Session Persistence** — dataset is saved to `sessionStorage` so a browser refresh won't lose your data.

### Computations
- **Aggregation** — Sum, Average, Min, Max, Count, Std Deviation, Median on any numeric column.
- **Filter Rows** — Filter by `>`, `<`, `>=`, `<=`, `==`, `!=` with downloadable results.
- **Group By** — Group any column, aggregate a numeric column across groups (shows sum, avg, min, max, count per group).
- **Full Summary Table** — All statistics computed for every numeric column at once.

### NL Query
- Type plain English: *"What month had the highest profit?"* or *"Are there any outliers?"*
- Claude reads the first 30 data rows and answers with real numbers.
- **Quick-prompt chips** for common queries — click to run instantly.
- Full conversation history maintained in the session.
- `Enter` to send, `Shift+Enter` for newline.

### Visualizations
- **Bar** — grouped bars, supports multiple Y columns.
- **Line** — trend lines with dot markers.
- **Area** — filled area charts with opacity.
- **Pie** — donut chart with percentage labels.
- **Scatter** — two-axis correlation plot.
- Toggle multiple Y columns. Download as **SVG** or **PNG** (2× resolution).
- Mini comparison gallery shows each numeric column side by side.

### AI Insights (5 modes)
1. **Executive Summary** — 4-5 sentence overview.
2. **Trends & Patterns** — Key patterns with specific numbers.
3. **Outliers & Anomalies** — Unusual values flagged by column.
4. **Recommendations** — 4-5 actionable next steps.
5. **Data Quality** — Completeness, consistency, type assessment.

---

## Customization

### Change the color theme
Edit CSS variables in `src/index.css`:
```css
:root {
  --accent:   #6c63ff;   /* Primary action color */
  --accent2:  #a78bfa;   /* Highlights, active states */
  --bg0:      #0a0b0f;   /* Page background */
  --bg1:      #10121a;   /* Card backgrounds */
}
```

### Add a new computation operation
In `src/utils/data.js`, add a case to `computeStat()`:
```js
case "range": return Math.max(...vals) - Math.min(...vals);
```
Then add it to the `<select>` in `Computations.jsx`.

### Add a new chart type
In `src/components/Visualizations.jsx`:
1. Add an entry to `CHART_TYPES`
2. Add a branch to `renderChart()` using a Recharts component

### Add a new AI insight mode
In `src/components/AIInsights.jsx`, add to the `MODES` array:
```js
{ id: "forecast", label: "Forecast", icon: "🔮", prompt: "Based on trends, project the next 3 periods..." }
```

### Change AI model
In `src/utils/data.js`, update the `callClaude` function:
```js
model: "claude-opus-4-20250514",  // more powerful
model: "claude-haiku-4-5-20251001", // faster / cheaper
```

---

## Security Notes

- **API key storage**: Stored in browser `localStorage` only. Never transmitted to any server other than `api.anthropic.com`.
- **Data privacy**: Your dataset never leaves the browser except the first 30 rows sent to Claude for AI features.
- **For team / shared deployments**: Add authentication (e.g. Netlify Identity, Supabase Auth) and move the API key to a backend proxy so it's not exposed client-side.

### Backend proxy pattern (for production teams)
```js
// server.js — Express proxy
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.post("/api/analyse", async (req, res) => {
  const { messages, system } = req.body;
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1200,
    system,
    messages,
  });
  res.json({ text: response.content[0].text });
});
```

Then update `callClaude()` in `data.js` to call `/api/analyse` instead of Anthropic directly.

---

## Troubleshooting

| Problem | Solution |
|---------|---------|
| `npm install` fails | Ensure Node.js 18+ is installed: `node --version` |
| Blank page after `npm run dev` | Check browser console for errors. Try a hard refresh (Ctrl+Shift+R) |
| CSV not parsing correctly | Ensure the first row contains column headers. Try saving as UTF-8 CSV. |
| Excel file empty | Only the first sheet is loaded. Check the sheet has data in row 1 as headers. |
| AI features not working | Verify your API key in Settings. Click "Test Key" to validate. |
| Charts not showing | Ensure at least one numeric column is selected in the Y-axis chip row. |
| CORS error on API call | This is normal in some corporate networks. Use a backend proxy (see above). |

---

## Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 15+ | ✅ Full |
| Edge 90+ | ✅ Full |
| Mobile (iOS/Android Chrome) | ✅ Responsive |

---

## License

MIT — free to use, modify, and distribute for personal or commercial purposes.
