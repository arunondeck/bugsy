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

## Development

```bash
pnpm install
pnpm --filter widget build
```

The build emits ESM + type declarations into `apps/widget/dist`.
