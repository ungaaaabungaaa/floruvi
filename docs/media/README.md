# Public image storage

FLORUVI keeps product data and private records in Convex. Public artwork uses the owner's Cloudflare R2 bucket `flourvi`, under `flourvi/`. Never upload customer records, private documents, exports, or credentials to this bucket.

Set `NEXT_PUBLIC_MEDIA_BASE_URL` to the unsigned HTTPS public media address before building the site. This address is public. It is embedded in browser bundles. Do not use an S3 API endpoint, signed URL, or secret as this value. A changed address requires a new website build.

## Update artwork

1. Keep source artwork in `src/assets/` and preserve the existing image selection.
2. Run `node scripts/prepare-r2-media.mjs --rewrite`.
3. Review `r2-manifest.json` and the changed references. Each key includes a content hash. The manifest contains source paths, sizes, MIME types, dimensions, and SHA-256 checksums. It contains no credentials.
4. Upload the files to the listed keys using server-side or local credentials. Set the listed `Content-Type` and `Cache-Control: public, max-age=86400`. Never overwrite a different object at an existing versioned key.
5. Verify every uploaded file against its checksum and confirm its unsigned public URL works. Only then deploy the website.

The generator reads metadata with the existing Next.js `sharp` dependency. It does not resize images, contact paid providers, or upload files. Re-running it updates content hashes and dimensions when source bytes change. The generated inline image data preserves `.src`, width, height, alt text at call sites, and gallery ordering. It does not put the full manifest into every client bundle.

Keep `images.unoptimized: true`. Images then go directly to the public media address. Do not add a Vercel image-proxy route or set `assetPrefix`; JavaScript and CSS stay on Vercel.

## Migration boundaries

- Preserve `app/icon.png`, `app/apple-icon.png`, and `app/favicon.ico` as stable Next.js metadata endpoints.
- Keep local source artwork for rollback. The manifest also includes currently unused originals so they can be preserved in R2.
- Six testimonial portraits in `components/testimonials-section.tsx` use versioned keys under `flourvi/external/testimonials/`. They were downloaded from the original Unsplash addresses without changing the image settings. They are separate from the local artwork manifest. Preserve their migration manifest and source files with the release evidence; verify their checksums and public URLs before deployment.
- The 11 existing Convex-uploaded product images now use verified R2 metadata. New or changed images need the same upload, verification, and metadata migration before publication. Keep legacy file IDs for recovery. Do not use the old pantry replacement operation to remove source files during this migration.
- Never change public caching for checkout, orders, sessions, admin pages, or other private data.

## Verification

Run `pnpm typecheck`, `pnpm lint`, and `pnpm test` with the media base set. Run the full production build against the intended backend. Check the home banners, product gallery, recipe image, box selection, cart thumbnails, share metadata, and an RTL page. Confirm browser requests use the public R2 address directly and do not use `/_next/image`.

If a problem occurs, restore the previous website revision. Keep old local and Convex files until the live checks pass; do not remove production data as part of a website rollback.
