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
- `chore: refactor nx config eng-123`

## Inputs

| Input                  | Default    | Description                                                                                                                          |
| ---------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `issue-prefix`         | `""`       | Optional single prefix or comma-separated list of prefixes. Valid suffixes use `${prefix}<positive-integer>`, for example `foo-123`. |
| `issue-mode`           | `optional` | Issue suffix policy: `optional` or `required`.                                                                                       |
| `issue-unknown`        | `false`    | Allow unknown issue-like suffixes such as `bar-123` or `#123`.                                                                       |
| `issue-near-miss`      | `false`    | Allow near-miss suffixes such as `foo123` when `issue-prefix` is `foo-`.                                                             |
| `trailing-punctuation` | `false`    | Allow the subject to end with `.`, `!`, `?`, `,`, `;`, or `:`.                                                                       |
| `enforce-lowercase`    | `true`     | Require the entire PR title to be lowercase, including type, scope, and subject.                                                     |
| `verbs`                | `""`       | Optional comma-separated list of allowed imperative verbs. Overrides the default verb list.                                          |
| `add-verbs`            | `""`       | Optional comma-separated list of imperative verbs to add to the default list.                                                        |

## Validation Notes

- Repeated spaces are not allowed anywhere in the title.
- If `issue-prefix` is set to multiple values, any matching prefix is accepted, for example `foo-, eng-`.
- `verbs` and `add-verbs` cannot both be set at the same time.
