# DOLESS Photography

An independent photography gallery for Daniel Laky. A static, responsive website with curated collections, category filters and a keyboard-accessible full-screen photograph viewer.

## Running locally

Serve this folder using any static HTTP server. There is no build step, application server, database or paid API dependency.

GitHub Pages should deploy the root of the `main` branch. All application and image paths are relative, so the site works at a repository subpath.

## Updating the gallery

Photo metadata lives in `gallery-data.js`; `photos.json` is its readable companion. Add web-size photographs to `assets/photos/` and maintain both metadata files. Supply useful descriptions and the original aspect ratio. Keep color grading and compositions unchanged unless the photographer requests an edit.

## Rights

All photographs and DOLESS branding are © Daniel Laky. All rights reserved. This public repository is a hosting and portfolio source; it does not grant permission to reuse the photographs. See `ASSET-RIGHTS.md`.

The site contains no contact form, analytics tracker, cookies, credentials, private Drive links or camera originals. Contact links open a phone call or the photographer’s Instagram profile. Google Fonts is optional; local system fallbacks keep the layout usable if it is blocked.
