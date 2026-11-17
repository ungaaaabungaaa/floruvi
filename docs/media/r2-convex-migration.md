# Public product image migration

The manifest contains 11 images read from the production public catalogue on 18 November 2026. It contains no customer data. The image bytes are unchanged. Keys use the owner-selected `flourvi/` prefix and a SHA-256 fragment.

1. Upload each manifest file to the existing public R2 bucket. Set the recorded MIME type and `Cache-Control: public, max-age=86400`.
2. Download each public R2 URL. Confirm its full SHA-256 and byte length against the manifest.
3. Set `R2_PUBLIC_BASE_URL` in the selected Convex deployment to the confirmed public HTTPS base. This value is public. No R2 secret is required in Convex.
4. Deploy the additive schema and functions to the selected deployment. `products.publicImage` is optional. Existing products remain valid.
5. Run `publicImages:migrate` as an authenticated internal CLI mutation with `dryRun: true` and the manifest records as `images`.
6. Confirm that the dry run checked all 11 products. Run the same mutation with `dryRun: false`.
7. Check the public catalogue, a product page, and the merchant feed when enabled. Each migrated product must return the R2 URL.

The mutation checks each existing Convex URL, file size and MIME type before it writes. It requires a valid R2 key and hash. A repeated run preserves the same result. It does not remove the original `imageId` or delete storage files. Public reads use the Convex image if the R2 base is absent or the source image changes.

To roll back, run the internal `publicImages:rollback` mutation with `images: [{slug, expectedKey}]` from the manifest. It removes only the new metadata. It refuses a changed key. Then check the public catalogue again. Do not delete the original Convex files during this release.

Schema reference: https://docs.convex.dev/database/schemas. Optional fields permit old records to remain unchanged. Convex validates the schema at deploy time. No schema validation setting is disabled.
