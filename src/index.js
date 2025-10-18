import json2md from 'json2md';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import core from '@actions/core';
import fs from 'fs';

// add a custom converter for vulnerabilities
json2md.converters.vulnerabilities = function (input) {
  // convert input to a Markdown table
  const headers = [
    'ID',
    'Status',
    'CVSS',
    'Severity',
    'Package Name',
    'Package Version',
    'Published Date',
    'Discovered Date',
    'Grace Days',
    'Fix Date'
  ];
  const rows = input.map(vulnerability => ({
    ID: vulnerability.id || '',
    Status: vulnerability.status || '',
    CVSS: vulnerability.cvss || '',
    Severity: vulnerability.severity || '',
    'Package Name': vulnerability.packageName || '',
    'Package Version': vulnerability.packageVersion || '',
    'Published Date': vulnerability.publishedDate || '',
    'Discovered Date': vulnerability.discoveredDate || '',
    'Grace Days': vulnerability.graceDays || '',
    'Fix Date': vulnerability.fixDate || ''
  }));
  return json2md({ table: { headers: headers, rows: rows } });
};

// add a custom converter for compliance findings
json2md.converters.compliances = function (input) {
  // convert input to a Markdown table
  const headers = ['ID', 'Title', 'Severity', 'Category', 'Description', 'Layer Time'];
  const rows = input.map(compliance => ({
    ID: compliance.id || '',
    Title: compliance.title || '',
    Severity: compliance.severity || '',
    Category: compliance.category || '',
    Description:
      (compliance.description || '').replace(/\n/g, ' ').substring(0, 100) +
      (compliance.description && compliance.description.length > 100 ? '...' : ''),
    'Layer Time': compliance.layerTime || ''
  }));
  return json2md({ table: { headers: headers, rows: rows } });
};

export function processResults(dataString) {
  // parse the JSON string to a JavaScript object
  const obj = JSON.parse(dataString);

  if (Array.isArray(obj.results) && obj.results.length > 0) {
    // use the custom converter for the first item in the results array
    const result = obj.results[0];

    // Extract scan metadata early for use in summaries
    const scanTime = new Date(obj.results[0].scanTime).toISOString().slice(0, 16).replace('T', ' ');
    const scanId = obj.results[0].scanID;
    const url = obj.consoleURL;

    // Always generate tables, even if vulnerabilities array is empty
    const vulnerabilities = result.vulnerabilities || [];

    const markdownVulnerabilities = json2md({
      vulnerabilities: vulnerabilities
    });

    const vulnerabilitiesDetails = `## Twistlock Vulnerabilities (${vulnerabilities.length})\n`;
    const markdownVulnerabilitiesWithDetails = `${vulnerabilitiesDetails}\n\n${markdownVulnerabilities}\n`;

    // log the Markdown vulnerabilities to the console
    // eslint-disable-next-line no-console
    console.log(markdownVulnerabilitiesWithDetails);

    // write the Markdown vulnerabilities to a file
    const twistlockVulnerabilityTable = './twistlock-vulnerability-table.md';
    fs.writeFileSync(twistlockVulnerabilityTable, `${markdownVulnerabilitiesWithDetails}\n`);
    core.setOutput('vulnerability-table', twistlockVulnerabilityTable);

    // Process compliance findings
    const compliances = result.compliances || [];

    const markdownCompliances = json2md({
      compliances: compliances
    });

    const compliancesDetails = `## Twistlock Compliance Findings (${compliances.length})\n`;
    const markdownCompliancesWithDetails = `${compliancesDetails}\n\n${markdownCompliances}\n`;

    // log the Markdown compliance findings to the console
    // eslint-disable-next-line no-console
    console.log(markdownCompliancesWithDetails);

    // write the Markdown compliance findings to a file
    const twistlockComplianceTable = './twistlock-compliance-table.md';
    fs.writeFileSync(twistlockComplianceTable, `${markdownCompliancesWithDetails}\n`);
    core.setOutput('compliance-table', twistlockComplianceTable);

    // Use complianceDistribution if provided, otherwise calculate severity counts
    let complianceSeverityCounts;
    if (result.complianceDistribution) {
      // Use the provided compliance distribution
      complianceSeverityCounts = result.complianceDistribution;
    } else {
      // Calculate the number of compliance findings with each severity
      complianceSeverityCounts = compliances.reduce((counts, compliance) => {
        const severity = compliance.severity;
        if (!counts[severity]) {
          counts[severity] = 0;
        }
        counts[severity]++;
        return counts;
      }, {});
    }

    // Define severity symbols
    const severitySymbols = {
      critical: '‼️',
      important: '❌',
      high: '⛔️',
      medium: '⚠️',
      moderate: '⚠️',
      low: '🟡'
    };

    // convert the complianceSeverityCounts object to a Markdown table
    const complianceHeaders = ['Severity', 'Count'];

    const complianceRows = Object.keys(complianceSeverityCounts).map(severity => {
      const symbol = severitySymbols[severity] || '';
      return {
        Severity: `${symbol} ${severity}`,
        Count: complianceSeverityCounts[severity]
      };
    });

    const markdownComplianceSummary = json2md({ table: { headers: complianceHeaders, rows: complianceRows } });

    const complianceSummaryDetails = `## Twistlock Compliance Summary\n\nScan: 💾 ${scanId} | 📅 ${scanTime} | 🔗 [More Details](${url})`;
    const markdownComplianceSummaryWithDetails = `${complianceSummaryDetails}\n\n${markdownComplianceSummary}\n`;

    // output compliance summary
    // eslint-disable-next-line no-console
    console.log(markdownComplianceSummaryWithDetails);
    const twistlockComplianceSummaryTable = './twistlock-compliance-summary-table.md';
    fs.writeFileSync(twistlockComplianceSummaryTable, markdownComplianceSummaryWithDetails);
    core.setOutput('compliance-summary-table', twistlockComplianceSummaryTable);

    // Use vulnerabilityDistribution if provided, otherwise calculate severity counts
    let severityCounts;
    if (result.vulnerabilityDistribution) {
      // Use the provided vulnerability distribution
      severityCounts = result.vulnerabilityDistribution;
    } else {
      // Calculate the number of vulnerabilities with each severity
      severityCounts = vulnerabilities.reduce((counts, vulnerability) => {
        const severity = vulnerability.severity;
        if (!counts[severity]) {
          counts[severity] = 0;
        }
        counts[severity]++;
        return counts;
      }, {});
    }

    // convert the severityCounts object to a Markdown table
    const headers = ['Severity', 'Count'];

    const rows = Object.keys(severityCounts).map(severity => {
      const symbol = severitySymbols[severity] || '';
      return {
        Severity: `${symbol} ${severity}`,
        Count: severityCounts[severity]
      };
    });

    const markdownSummary = json2md({ table: { headers: headers, rows: rows } });

    const summaryDetails = `## Twistlock Scan Summary\n\nScan: 💾 ${scanId} | 📅 ${scanTime} | 🔗 [More Details](${url})`;
    const markdownSummaryWithDetails = `${summaryDetails}\n\n${markdownSummary}\n`;

    // output summary
    // eslint-disable-next-line no-console
    console.log(markdownSummaryWithDetails);
    const twistlockSummaryTable = './twistlock-summary-table.md';
    fs.writeFileSync(twistlockSummaryTable, markdownSummaryWithDetails);
    core.setOutput('summary-table', twistlockSummaryTable);

    return {
      vulnerabilityTable: twistlockVulnerabilityTable,
      complianceTable: twistlockComplianceTable,
      summaryTable: twistlockSummaryTable,
      complianceSummaryTable: twistlockComplianceSummaryTable
    };
  }

  // eslint-disable-next-line no-console
  console.log('obj.results is not an array');
  return null;
}

// Main entry point when run as a script (not when imported for tests)
if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = yargs(hideBin(process.argv))
    .option('file', {
      type: 'string',
      description: 'Path to the Twistlock/Prisma scan results JSON file'
    })
    .wrap(null)
    .version()
    .help()
    .parse();

  const data = fs.readFileSync(argv.file || core.getInput('results-json-path', { required: true }), 'utf8');
  processResults(data);
}
