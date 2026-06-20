# meta.xml Editor

A web tool to create and edit `meta.xml` files for Wii Homebrew applications, as read by the
Homebrew Channel.

## Features

- Create a new `meta.xml` from scratch or import and edit an existing one (drag & drop, file
  picker).
- Live XML preview with copy-to-clipboard and download.
- All fields: name, author/coder, version, release date,
  short/long description, launch arguments, and the `ahb_access` / `no_ios_reload` flags.
- Release date picker producing the `YYYYMMDD` or `YYYYMMDDhhmmss` formats the Homebrew
  Channel understands; imported values are preserved as-is with a soft validity hint.
- Light / dark / automatic theme.

## Development

```bash
npm install
npm run dev        # start the dev server
npm run build      # type-check and build to dist/
npm run check      # Biome lint + format check
npm run typecheck  # vue-tsc type check
```
