# @aaos/action-conventional-pr

Opinionated Conventional Commits validation for pull request titles.

This action wraps [`amannn/action-semantic-pull-request`](https://github.com/amannn/action-semantic-pull-request) and adds extra checks:

- Description must start with an imperative verb (e.g. 'add', not 'adds' or 'adding')
- Optional issue suffix at the end of the subject
- PR required to be lowercase

## Usage

```yaml
name: PR Title

on:
  pull_request:
    types: [opened, edited, synchronize, reopened]

jobs:
  validate-title:
    runs-on: ubuntu-latest
    steps:
      - uses: @aaos/action-conventional-pr@v1
        with:
          issue-prefix: "foo-"
```

## Examples

- `feat(api): add endpoint`
- `fix(ci): update release workflow`
- `chore: refactor nx config foo-123`

## Rules

- If `issue-prefix` is set, the optional suffix must be `${prefix}<positive-integer>` and appear at the end of the subject.
- `enforce-lowercase` is optional (`true` by default). Set it to `false` to allow uppercase letters in the subject.
- `verbs` is optional and overrides the default allowed first-word verb list (comma-separated).
- `add-verbs` is optional and adds verbs to the default allowed list (comma-separated). Duplicates are removed.
- `verbs` and `add-verbs` cannot both be set at the same time.

Default imperative verbs accepted as first subject word:

`add`, `adjust`, `bump`, `change`, `clean`, `create`, `disable`, `document`, `drop`, `enable`, `fix`, `implement`, `improve`, `introduce`, `migrate`, `refactor`, `remove`, `rename`, `replace`, `revert`, `simplify`, `update`, `upgrade`.
