# twistlock-results-json-to-markdown-action

[![GitHub release](https://img.shields.io/github/release/joshjohanning/twistlock-results-json-to-markdown-action.svg?logo=github&labelColor=333)](https://github.com/joshjohanning/twistlock-results-json-to-markdown-action/releases)
[![GitHub marketplace](https://img.shields.io/badge/marketplace-Twistlock%2FPrisma%20Scan%20Results%20JSON%20to%20Markdown-blue?logo=github&labelColor=333)](https://github.com/marketplace/actions/twistlock-prisma-scan-results-json-to-markdown)
[![CI](https://github.com/joshjohanning/twistlock-results-json-to-markdown-action/actions/workflows/ci.yml/badge.svg)](https://github.com/joshjohanning/twistlock-results-json-to-markdown-action/actions/workflows/ci.yml)
[![Publish GitHub Action](https://github.com/joshjohanning/twistlock-results-json-to-markdown-action/actions/workflows/publish.yml/badge.svg)](https://github.com/joshjohanning/twistlock-results-json-to-markdown-action/actions/workflows/publish.yml)
![Coverage](./badges/coverage.svg)

An action to convert Twistlock/Prisma scan results from JSON to Markdown

## Usage

```yaml
steps:
  - run: twistcli scan <params> --output-file scan-results.json
  - name: convert-twistlock-json-results-to-markdown
    id: convert-twistlock-results
    uses: joshjohanning/twistlock-results-json-to-markdown-action@v1
    with:
      results-json-path: scanresults.json
  - name: write to job summary
    run: |
      cat ${{ steps.convert-twistlock-results.outputs.summary-table }} >> $GITHUB_STEP_SUMMARY
      cat ${{ steps.convert-twistlock-results.outputs.vulnerability-table }} >> $GITHUB_STEP_SUMMARY
      cat ${{ steps.convert-twistlock-results.outputs.compliance-table }} >> $GITHUB_STEP_SUMMARY
      cat ${{ steps.convert-twistlock-results.outputs.compliance-summary-table }} >> $GITHUB_STEP_SUMMARY
```

## Example

![Twistlock JSON to Markdown Job Summary Example](https://github.com/joshjohanning/twistlock-results-json-to-markdown-action/assets/19912012/64e4e4bb-95a1-472c-be23-1756b440b974)

## Testing with Sample Scan Results

See [sample-scan-results/README.md](./sample-scan-results/README.md)
