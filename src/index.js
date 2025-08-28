const json2md = require("json2md");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const argv = yargs(hideBin(process.argv)).argv;
const core = require("@actions/core");

// call via node convert-json-to-markdown.js --file=scanresults.json

// add a custom converter for vulnerabilities
json2md.converters.vulnerabilities = function (input, json2md) {
  // convert input to a Markdown table
  var headers = [
    "ID",
    "Status",
    "CVSS",
    "Severity",
    "Package Name",
    "Package Version",
    "Published Date",
    "Discovered Date",
    "Grace Days",
    "Fix Date",
  ];
  var rows = input.map((vulnerability) => ({
    ID: vulnerability.id || "",
    Status: vulnerability.status || "",
    CVSS: vulnerability.cvss || "",
    Severity: vulnerability.severity || "",
    "Package Name": vulnerability.packageName || "",
    "Package Version": vulnerability.packageVersion || "",
    "Published Date": vulnerability.publishedDate || "",
    "Discovered Date": vulnerability.discoveredDate || "",
    "Grace Days": vulnerability.graceDays || "",
    "Fix Date": vulnerability.fixDate || "",
  }));
  return json2md({ table: { headers: headers, rows: rows } });
};

// add a custom converter for compliance findings
json2md.converters.compliances = function (input, json2md) {
  // convert input to a Markdown table
  var headers = [
    "ID",
    "Title",
    "Severity",
    "Category",
    "Description",
    "Layer Time",
  ];
  var rows = input.map((compliance) => ({
    ID: compliance.id || "",
    Title: compliance.title || "",
    Severity: compliance.severity || "",
    Category: compliance.category || "",
    Description: (compliance.description || "").replace(/\n/g, " ").substring(0, 100) + (compliance.description && compliance.description.length > 100 ? "..." : ""),
    "Layer Time": compliance.layerTime || "",
  }));
  return json2md({ table: { headers: headers, rows: rows } });
};

// read the json
var fs = require("fs");
var data = fs.readFileSync(
  argv.file ||
  core.getInput("results-json-path", { required: true }) ||
  "scanresults.json",
  "utf8",
);

// parse the JSON string to a JavaScript object
var obj = JSON.parse(data);

if (Array.isArray(obj.results) && obj.results.length > 0) {
  // use the custom converter for the first item in the results array
  var result = obj.results[0];
  // Always generate tables, even if vulnerabilities array is empty
  var vulnerabilities = result.vulnerabilities || [];

  var markdownVulnerabilities = json2md({
    vulnerabilities: vulnerabilities,
  });

  let vulnerabilitiesDetails = `## Twistlock Vulnerabilities (${vulnerabilities.length})\n`;
  let markdownVulnerabilitiesWithDetails = `${vulnerabilitiesDetails}\n\n${markdownVulnerabilities}\n`;

  // log the Markdown vulnerabilities to the console
  console.log(markdownVulnerabilitiesWithDetails);

  // write the Markdown vulnerabilities to a file
  const twistlockVulnerabilityTable = "./twistlock-vulnerability-table.md";
  fs.writeFileSync(
    twistlockVulnerabilityTable,
    `${markdownVulnerabilitiesWithDetails}\n`,
  );
  core.setOutput("vulnerability-table", twistlockVulnerabilityTable);

  // Process compliance findings
  var compliances = result.compliances || [];

  var markdownCompliances = json2md({
    compliances: compliances,
  });

  let compliancesDetails = `## Twistlock Compliance Findings (${compliances.length})\n`;
  let markdownCompliancesWithDetails = `${compliancesDetails}\n\n${markdownCompliances}\n`;

  // log the Markdown compliance findings to the console
  console.log(markdownCompliancesWithDetails);

  // write the Markdown compliance findings to a file
  const twistlockComplianceTable = "./twistlock-compliance-table.md";
  fs.writeFileSync(
    twistlockComplianceTable,
    `${markdownCompliancesWithDetails}\n`,
  );
  core.setOutput("compliance-table", twistlockComplianceTable);

  // Use complianceDistribution if provided, otherwise calculate severity counts
  var complianceSeverityCounts;
  if (result.complianceDistribution) {
    // Use the provided compliance distribution
    complianceSeverityCounts = result.complianceDistribution;
  } else {
    // Calculate the number of compliance findings with each severity
    complianceSeverityCounts = compliances.reduce(
      (counts, compliance) => {
        var severity = compliance.severity;
        if (!counts[severity]) {
          counts[severity] = 0;
        }
        counts[severity]++;
        return counts;
      },
      {},
    );
  }

  // Define severity symbols
  var severitySymbols = {
    critical: "‼️",
    important: "❌",
    high: "⛔️",
    medium: "⚠️",
    moderate: "⚠️",
    low: "🟡",
  };

  // convert the complianceSeverityCounts object to a Markdown table
  var complianceHeaders = ["Severity", "Count"];

  var complianceRows = Object.keys(complianceSeverityCounts).map((severity) => {
    var symbol = severitySymbols[severity] || "";
    return {
      Severity: `${symbol} ${severity}`,
      Count: complianceSeverityCounts[severity],
    };
  });

  var markdownComplianceSummary = json2md({ table: { headers: complianceHeaders, rows: complianceRows } });

  var complianceSummaryDetails = `## Twistlock Compliance Summary\n\nScan: 💾 ${scanId} | 📅 ${scanTime} | 🔗 [More Details](${url})`;
  var markdownComplianceSummaryWithDetails = `${complianceSummaryDetails}\n\n${markdownComplianceSummary}\n`;

  // output compliance summary
  console.log(markdownComplianceSummaryWithDetails);
  var twistlockComplianceSummaryTable = "./twistlock-compliance-summary-table.md";
  fs.writeFileSync(twistlockComplianceSummaryTable, markdownComplianceSummaryWithDetails);
  core.setOutput("compliance-summary-table", twistlockComplianceSummaryTable);

  // Use vulnerabilityDistribution if provided, otherwise calculate severity counts
  var severityCounts;
  if (result.vulnerabilityDistribution) {
    // Use the provided vulnerability distribution
    severityCounts = result.vulnerabilityDistribution;
  } else {
    // Calculate the number of vulnerabilities with each severity
    severityCounts = vulnerabilities.reduce(
      (counts, vulnerability) => {
        var severity = vulnerability.severity;
        if (!counts[severity]) {
          counts[severity] = 0;
        }
        counts[severity]++;
        return counts;
      },
      {},
    );
  }

  // convert the severityCounts object to a Markdown table
  var headers = ["Severity", "Count"];

  var rows = Object.keys(severityCounts).map((severity) => {
    var symbol = severitySymbols[severity] || "";
    return {
      Severity: `${symbol} ${severity}`,
      Count: severityCounts[severity],
    };
  });

  var markdownSummary = json2md({ table: { headers: headers, rows: rows } });

  // add scan metadata
  var scanTime = new Date(obj.results[0].scanTime)
    .toISOString()
    .slice(0, 16)
    .replace("T", " ");
  var scanId = obj.results[0].scanID;
  var url = obj.consoleURL;
  var summaryDetails = `## Twistlock Scan Summary\n\nScan: 💾 ${scanId} | 📅 ${scanTime} | 🔗 [More Details](${url})`;
  var markdownSummaryWithDetails = `${summaryDetails}\n\n${markdownSummary}\n`;

  // output summary
  console.log(markdownSummaryWithDetails);
  var twistlockSummaryTable = "./twistlock-summary-table.md";
  fs.writeFileSync(twistlockSummaryTable, markdownSummaryWithDetails);
  core.setOutput("summary-table", twistlockSummaryTable);
} else {
  console.log("obj.results is not an array");
}
