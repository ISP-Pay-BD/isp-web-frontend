# Fonts

Bundled via `@fontsource` packages (build-time, no runtime CDN).

| Font | Package | Usage |
|------|---------|-------|
| Inter | `@fontsource-variable/inter` | Landing body |
| Plus Jakarta Sans | `@fontsource-variable/plus-jakarta-sans` | Landing display |
| Noto Sans Bengali | `@fontsource/noto-sans-bengali` | BN copy |
| IBM Plex Mono | `@fontsource/ibm-plex-mono` | IDs, amounts |

## Satoshi (portal UI)

Satoshi is referenced in ISP portal tokens. Add manually when available:

```
public/fonts/satoshi-variable.woff2
public/fonts/satoshi-variable-italic.woff2
```

Until then, CSS falls back to Inter for portal `--font-sans`.
