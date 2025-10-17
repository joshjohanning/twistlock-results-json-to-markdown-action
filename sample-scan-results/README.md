# sample-scan-results

You can verify the functionality of this action by running it against the sample scan results provided in this directory.

## Testing in Actions

Testing in Actions:

```yml
- name: convert-twistlock-json-results-to-markdown
  id: convert-twistlock-results
  uses: joshjohanning/twistlock-results-json-to-markdown-action@v1
  with:
    results-json-path: sample-scan-results/scanresults-generic.json
- name: write to job summary
  run: |
    cat ${{ steps.convert-twistlock-results.outputs.summary-table }} >> $GITHUB_STEP_SUMMARY
    cat ${{ steps.convert-twistlock-results.outputs.vulnerability-table }} >> $GITHUB_STEP_SUMMARY
    cat ${{ steps.convert-twistlock-results.outputs.compliance-table }} >> $GITHUB_STEP_SUMMARY
    cat ${{ steps.convert-twistlock-results.outputs.compliance-summary-table }} >> $GITHUB_STEP_SUMMARY
```

## Testing Locally

You can also run the scan outside of Actions for testing purposes:

```sh
cd twistlock-results-json-to-markdown-action
npm install
node src/index.js --file sample-scan-results/scanresults-generic.json
cat twistlock*.md
```
