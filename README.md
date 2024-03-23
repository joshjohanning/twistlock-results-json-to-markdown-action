# twistlock-results-json-to-markdown-action

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
```

## Example

![Twistlock JSON to Markdown Job Summary Example](https://github.com/joshjohanning/twistlock-results-json-to-markdown-action/assets/19912012/64e4e4bb-95a1-472c-be23-1756b440b974)
