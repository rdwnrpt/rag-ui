# RAG Search — Local Development Instructions

This README explains how to run this repository locally so your friend can reproduce the development environment and verify styling (Tailwind CSS + React + Vite).

**Prerequisites**
- Node.js (16+ recommended) and `npm` on your PATH. On macOS you can install via Homebrew:

```bash
brew install node
```

Or install using `nvm` to manage Node versions:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm install --lts
```

**Clone & install**

```bash
git clone <repo-url> rag-search
cd rag-search
npm install
```

**Run dev server (Vite)**

```bash
npm run dev
```

- Open the URL shown by Vite (default: `http://localhost:5173`).

**What this repo uses**
- Vite + React
- Tailwind CSS (imported via `src/index.css` with `@tailwind` directives)
- PostCSS (`postcss.config.cjs`) + `autoprefixer`

Key files:
- `index.html` — app entry (contains a temporary Tailwind CDN snippet for quick styling checks)
- `src/main.jsx` — imports `./index.css`
- `src/index.css` — contains Tailwind directives (`@tailwind base; @tailwind components; @tailwind utilities;`) and custom rules
- `tailwind.config.cjs` and `postcss.config.cjs` — Tailwind/PostCSS config

**Quick styling verification (temporary CDN test)**

If the UI looks unstyled when running the dev server, we temporarily added a Tailwind CDN snippet to `index.html` to verify whether failing local compilation is the cause. If the page becomes styled after adding the CDN, the root cause is that Tailwind is not being compiled by the local build pipeline.

To remove the temporary CDN (once Tailwind compiles locally), open `index.html` and remove these lines from the `<head>`:

```html
<!-- Temporary: load Tailwind via CDN to check whether compiled Tailwind is missing locally -->
<script>
	tailwind_config = {
		content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
	};
</script>
<script src="https://cdn.tailwindcss.com"></script>
```

**Regenerate / test Tailwind output manually**

If you want to confirm Tailwind compilation without running the full dev server, you can build a CSS file with `npx`:

```bash
npx tailwindcss -i ./src/index.css -o ./dist/tw.css --minify
```

Then add a temporary `<link rel="stylesheet" href="/dist/tw.css">` in `index.html` or serve the `dist` folder to test if utilities like `.bg-slate-950` appear.

**Troubleshooting**
- `zsh: command not found: npm` — install Node/npm or ensure it is on your PATH (see prerequisites).
- Tailwind classes present in DOM but styles not applied:
	- Check DevTools → Network for loaded CSS files. If only a tiny CSS file that contains `@tailwind` directives appears, PostCSS/Tailwind is not running during bundling.
	- Restart the dev server and clear the browser cache.
	- Confirm `tailwind.config.cjs` `content` globs include `./index.html` and `./src/**/*.{js,jsx,ts,tsx}` (they do by default in this repo).
- If you see Vite/PostCSS warnings in the terminal, paste them here and they can be diagnosed further.

**Notes for reviewers**
- The app uses many Tailwind utility classes in `src/App.jsx`. Without processed Tailwind CSS these classes will not style elements — the app will appear plain or “ugly.”

**If anything still looks off**
- Send a screenshot of the page or copy/paste the browser DevTools Console and Network/Styles output and I’ll help debug further.

---

If you want, I can commit a cleaned README that also shows how to run a production build and how to test generating the Tailwind CSS artifact. Want me to add that too?
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler



The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
