# Releasing wouter

The [Publish packages workflow](https://github.com/molefrog/wouter/actions/workflows/release.yml)
publishes `wouter` and `wouter-preact` together. It runs tests with coverage, type
checks, lint, size checks, and package-content checks before publishing the exact
tarballs it inspected. Stable versions use `latest`; prereleases use `next`.

## One-time npm setup

Merge `.github/workflows/release.yml` into `main`. In the npm settings for **each**
package, add a GitHub Actions trusted publisher:

| Setting | Value |
| --- | --- |
| Organization or user | `molefrog` |
| Repository | `wouter` |
| Workflow filename | `release.yml` |
| Environment name | Leave empty |
| Allowed actions | Enable direct publishing with `npm publish` |

Configure both [wouter](https://www.npmjs.com/package/wouter/access) and
[wouter-preact](https://www.npmjs.com/package/wouter-preact/access). No `NPM_TOKEN`
secret is needed. npm uses GitHub OIDC and attaches provenance automatically.
See [npm's trusted publishing guide](https://docs.npmjs.com/trusted-publishers/).

## Publish a version

1. Set the same new version in `packages/wouter/package.json` and
   `packages/wouter-preact/package.json`. Run `bun install --lockfile-only` to
   update `bun.lock`, then commit and merge the version change into `main`.
2. Tag that commit and push the tag (replace the example version):

   ```sh
   git switch main
   git pull --ff-only
   git tag v3.12.0
   git push origin v3.12.0
   ```

The tag push starts publishing automatically. A tag such as `v3.12.0-next.0`
publishes both packages under `next` without changing `latest`. The tag must match
both package versions and point to a commit on `main`. Build metadata (`+...`)
is not supported in release tags.

To publish an existing tag manually, choose **Publish packages → Run workflow**,
leave the workflow branch as `main`, and enter the tag. Or use:

```sh
gh workflow run release.yml --ref main -f tag=v3.12.0
```

Select **Validate and pack without publishing** (or add `-F dry_run=true`) to
check an existing tag without publishing. A tag push always publishes.

## Verify or retry

Check the Actions run, then inspect both packages:

```sh
npm view wouter@3.12.0 version dist.attestations
npm view wouter-preact@3.12.0 version dist.attestations
npm view wouter dist-tags
npm view wouter-preact dist-tags
```

npm cannot publish two packages atomically. If one succeeds and the other fails,
fix the reported issue and rerun the same tag. Existing versions are skipped;
their dist-tags are left unchanged. Registry errors other than a missing version
stop the run. Never move a released tag or try to overwrite a published version;
code changes require a new version.
