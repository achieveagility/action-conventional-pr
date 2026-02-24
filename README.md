# @aaos/action-conventional-pr

Opinionated Conventional Commits validation for pull request titles.

This action wraps [`amannn/action-semantic-pull-request`](https://github.com/amannn/action-semantic-pull-request) and adds extra checks:

- Description must start with an imperative verb (e.g. 'add', not 'adds' or 'adding')
- Optional issue suffix at the end of the subject
- PR required to be lowercase

## Usage

```yaml
name: PR Lint

permissions:
  pull-requests: read

on:
  pull_request:
    types: [opened, edited, synchronize, reopened]

jobs:
  validate-title:
    runs-on: ubuntu-latest
    steps:
      - uses: achieveagility/action-conventional-pr@v1
        with:
          issue-prefix: "foo-"
```

## Examples

- `feat(api): add endpoint`
- `ci: update release workflow`
- `chore: refactor nx config foo-123`

## Rules

- `issue-prefix` is optional. When present, a matching suffix format is `${prefix}<positive-integer>` (for example `foo-123`).
- `issue-mode` is optional (`optional` by default). Set to `required` to require an issue suffix.
- `issue-unknown` is optional (`false` by default). When `false`, issue-like suffixes must match `issue-prefix` if present. When `true`, unknown suffixes like `BAR-123` or `#123` are allowed.
- `issue-near-miss` is optional (`false` by default). When `false`, near-miss suffixes like `foo123` are rejected when `issue-prefix` is `foo-`.
- `trailing-punctuation` is optional (`false` by default). When `false`, subjects cannot end in `.`, `!`, `?`, `,`, `;`, or `:`.
- `enforce-lowercase` is optional (`true` by default). When enabled, uppercase letters are rejected anywhere in the title (`type`, `scope`, and subject).
- Repeated spaces are not allowed anywhere in the title.
- `verbs` is optional and overrides the default allowed first-word verb list (comma-separated).
- `add-verbs` is optional and adds verbs to the default allowed list (comma-separated). Duplicates are removed.
- `verbs` and `add-verbs` cannot both be set at the same time.
