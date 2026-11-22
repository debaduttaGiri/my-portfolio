# Repository Guidelines

## Project Structure

This repository is a static portfolio site. `index.html` is the entry point; it loads `css/style.css` and `js/app.js`. Page content is split into HTML fragments in `sections/`, with the navigation fragment in `components/navbar.html`. Images and other visual assets belong in `assets/` (currently `assets/images/`). There is no separate source, build, or test directory.

## Development

There is no build step or package manager configuration. Run the site through a local HTTP server so JavaScript `fetch()` can load the fragments:

```powershell
py -m http.server 8000
```

Then open `http://localhost:8000`. Stop the server with Ctrl+C. For changes, edit the relevant fragment, stylesheet, or script directly and refresh the browser.

## Style and Naming

Match the existing four-space indentation in HTML, CSS, and JavaScript. Keep section markup in its corresponding `sections/<name>.html` file, use lowercase descriptive filenames, and keep shared navigation in `components/`. Use semantic HTML, descriptive image `alt` text, and the existing CSS custom properties for shared colors and sizing. Keep JavaScript browser-native; there is no formatter or linter configured.

## Testing and Review

No automated test framework or test command is configured. Verify changes manually in a browser served over HTTP. Check the affected section, navigation behavior, responsive layout, and browser console for failed fragment or asset requests. For visual changes, check both desktop and narrow/mobile widths.

## Commits and Pull Requests

Recent history uses short, informal subject lines (for example, `new changes` and `update on projects,about`); no formal convention is established. Use a concise summary that names the area changed. A pull request should explain the user-visible change, list the main files or sections affected, and include screenshots for visual updates. Link a related issue when one exists.
