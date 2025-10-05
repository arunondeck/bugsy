# Feedback Widget

Embeddable submit-only feedback widget that posts feedback to the Bugsy API.

## Usage

```html
<script>
  window.FBW_INIT = {
    projectKey: 'pk_live_xxx',
    theme: 'auto',
    position: 'right'
  };
</script>
<script async src="https://cdn.yourapp.com/embed.js"></script>
```

Once `embed.js` loads, the runtime API is available via `window.FBW`:

```js
FBW.open();
FBW.close();
FBW.identify({ email: 'user@example.com', name: 'Ava' });
FBW.setTags(['beta', 'signed-in']);
```

When reporters toggle **Attach screenshot** the widget now captures the current page automatically, shows an inline preview, and lets them retake the capture from inside the dialog. They can also opt into **Include page details (page url, console statements)** to share diagnostics alongside their submission.

## Development

Install dependencies once at the repo root:

```bash
pnpm install
```

### Build

```bash
pnpm --filter widget build
```

### Interactive preview

```bash
pnpm --filter widget preview
```

This command rebuilds the bundle and launches `demo/index.html` (served from `http://localhost:4173/demo/`) so you can interact with the widget exactly as it would appear when embedded by a customer. The page exercises the runtime API and can be customized for additional scenarios.

To keep the demo running while you iterate on the source, use the watch task:

```bash
pnpm --filter widget preview:watch
```

This runs TypeScript in watch mode alongside the static server; refresh the browser after each rebuild to pull in the latest bundle.

The build emits ESM + type declarations into `apps/widget/dist`.


