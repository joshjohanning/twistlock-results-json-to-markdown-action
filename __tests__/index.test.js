import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { execFileSync } from 'child_process';
import { processResults } from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Twistlock Results to Markdown', () => {
  const testDataPath = join(__dirname, '../sample-scan-results/scanresults-generic.json');
  const outputFiles = [
    './twistlock-vulnerability-table.md',
    './twistlock-compliance-table.md',
    './twistlock-summary-table.md',
    './twistlock-compliance-summary-table.md'
  ];

  const cleanupOutputFiles = () => {
    for (const file of outputFiles) {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    }
  };

  describe('Integration Tests', () => {
    beforeEach(() => {
      // Clean up any existing output files
      cleanupOutputFiles();
    });

    afterEach(() => {
      // Clean up output files after tests
      cleanupOutputFiles();
    });

    test('should generate all required markdown files', () => {
      // Run the script with the test data
      execFileSync('node', ['src/index.js', `--file=${testDataPath}`], {
        cwd: join(__dirname, '..'),
        encoding: 'utf8'
      });

      // Verify all output files were created
      for (const file of outputFiles) {
        expect(fs.existsSync(file)).toBe(true);
      }
    });

    test('should generate vulnerability table with correct content', () => {
      execFileSync('node', ['src/index.js', `--file=${testDataPath}`], {
        cwd: join(__dirname, '..'),
        encoding: 'utf8'
      });

      const vulnerabilityTable = fs.readFileSync('./twistlock-vulnerability-table.md', 'utf8');

      expect(vulnerabilityTable).toContain('Twistlock Vulnerabilities');
      expect(vulnerabilityTable).toContain('ID');
      expect(vulnerabilityTable).toContain('Severity');
      expect(vulnerabilityTable).toContain('Package Name');
    });

    test('should generate compliance table with correct content', () => {
      execFileSync('node', ['src/index.js', `--file=${testDataPath}`], {
        cwd: join(__dirname, '..'),
        encoding: 'utf8'
      });

      const complianceTable = fs.readFileSync('./twistlock-compliance-table.md', 'utf8');

      expect(complianceTable).toContain('Twistlock Compliance Findings');
      expect(complianceTable).toContain('ID');
      expect(complianceTable).toContain('Title');
      expect(complianceTable).toContain('Severity');
    });

    test('should generate summary table with metadata', () => {
      execFileSync('node', ['src/index.js', `--file=${testDataPath}`], {
        cwd: join(__dirname, '..'),
        encoding: 'utf8'
      });

      const summaryTable = fs.readFileSync('./twistlock-summary-table.md', 'utf8');

      expect(summaryTable).toContain('Twistlock Scan Summary');
      expect(summaryTable).toContain('Scan:');
      expect(summaryTable).toContain('More Details');
      expect(summaryTable).toContain('💾');
      expect(summaryTable).toContain('📅');
      expect(summaryTable).toContain('🔗');
    });

    test('should generate compliance summary table', () => {
      execFileSync('node', ['src/index.js', `--file=${testDataPath}`], {
        cwd: join(__dirname, '..'),
        encoding: 'utf8'
      });

      const complianceSummaryTable = fs.readFileSync('./twistlock-compliance-summary-table.md', 'utf8');

      expect(complianceSummaryTable).toContain('Twistlock Compliance Summary');
      expect(complianceSummaryTable).toContain('Severity');
      expect(complianceSummaryTable).toContain('Count');
    });

    test('should include severity symbols in tables', () => {
      execFileSync('node', ['src/index.js', `--file=${testDataPath}`], {
        cwd: join(__dirname, '..'),
        encoding: 'utf8'
      });

      const summaryTable = fs.readFileSync('./twistlock-summary-table.md', 'utf8');

      // Check for severity symbols (emojis)
      const hasSeveritySymbols = /‼️|❌|⛔️|⚠️|🟡/.test(summaryTable);
      expect(hasSeveritySymbols).toBe(true);
    });

    test('should format scan time correctly', () => {
      execFileSync('node', ['src/index.js', `--file=${testDataPath}`], {
        cwd: join(__dirname, '..'),
        encoding: 'utf8'
      });

      const summaryTable = fs.readFileSync('./twistlock-summary-table.md', 'utf8');

      // Should contain formatted date (YYYY-MM-DD HH:mm)
      expect(summaryTable).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/);
    });

    test('should include console URL link', () => {
      execFileSync('node', ['src/index.js', `--file=${testDataPath}`], {
        cwd: join(__dirname, '..'),
        encoding: 'utf8'
      });

      const summaryTable = fs.readFileSync('./twistlock-summary-table.md', 'utf8');

      expect(summaryTable).toContain('[More Details]');
      expect(summaryTable).toContain('https://');
    });
  });

  describe('Table Structure', () => {
    beforeAll(() => {
      // Clean up first
      cleanupOutputFiles();

      // Generate files for these tests
      execFileSync('node', ['src/index.js', `--file=${testDataPath}`], {
        cwd: join(__dirname, '..'),
        encoding: 'utf8'
      });
    });

    afterAll(() => {
      // Clean up after all table structure tests
      cleanupOutputFiles();
    });

    test('vulnerability table should have proper markdown table format', () => {
      const vulnerabilityTable = fs.readFileSync('./twistlock-vulnerability-table.md', 'utf8');

      // Check for markdown table structure
      expect(vulnerabilityTable).toContain('|');
      expect(vulnerabilityTable).toContain('---');
    });

    test('compliance table should have proper markdown table format', () => {
      const complianceTable = fs.readFileSync('./twistlock-compliance-table.md', 'utf8');

      // Check for markdown table structure
      expect(complianceTable).toContain('|');
      expect(complianceTable).toContain('---');
    });

    test('summary tables should have proper markdown table format', () => {
      const summaryTable = fs.readFileSync('./twistlock-summary-table.md', 'utf8');

      // Check for markdown table structure
      expect(summaryTable).toContain('|');
      expect(summaryTable).toContain('---');
    });
  });

  describe('Unit Tests', () => {
    const mockData = {
      consoleURL: 'https://console.example.com/compute',
      results: [
        {
          id: 'test123',
          scanID: 'scan123',
          scanTime: '2024-08-28T15:30:00.000Z',
          vulnerabilities: [
            {
              id: 'CVE-2023-12345',
              status: 'fixed in 1.2.3',
              cvss: 9.8,
              severity: 'critical',
              packageName: 'test-package',
              packageVersion: '1.0.0',
              publishedDate: '2023-01-01',
              discoveredDate: '2023-01-15',
              graceDays: 30,
              fixDate: '2023-02-01'
            }
          ],
          vulnerabilityDistribution: {
            critical: 1,
            high: 0,
            medium: 0,
            low: 0,
            total: 1
          },
          compliances: [
            {
              id: 'COMP-001',
              title: 'Test Compliance',
              severity: 'high',
              category: 'Security',
              description: 'Test description',
              layerTime: '2024-01-01'
            }
          ],
          complianceDistribution: {
            critical: 0,
            high: 1,
            medium: 0,
            low: 0,
            total: 1
          }
        }
      ]
    };

    beforeEach(() => {
      cleanupOutputFiles();
    });

    afterEach(() => {
      cleanupOutputFiles();
    });

    test('should return file paths when processing valid data', () => {
      const result = processResults(JSON.stringify(mockData));

      expect(result).toBeDefined();
      expect(result.vulnerabilityTable).toBe('./twistlock-vulnerability-table.md');
      expect(result.complianceTable).toBe('./twistlock-compliance-table.md');
      expect(result.summaryTable).toBe('./twistlock-summary-table.md');
      expect(result.complianceSummaryTable).toBe('./twistlock-compliance-summary-table.md');
    });

    test('should create all output files', () => {
      processResults(JSON.stringify(mockData));

      for (const file of outputFiles) {
        expect(fs.existsSync(file)).toBe(true);
      }
    });

    test('should handle empty vulnerabilities array', () => {
      const emptyVulnData = {
        ...mockData,
        results: [
          {
            ...mockData.results[0],
            vulnerabilities: [],
            vulnerabilityDistribution: {
              critical: 0,
              high: 0,
              medium: 0,
              low: 0,
              total: 0
            }
          }
        ]
      };

      const result = processResults(JSON.stringify(emptyVulnData));

      expect(result).toBeDefined();
      const content = fs.readFileSync(result.vulnerabilityTable, 'utf8');
      expect(content).toContain('Twistlock Vulnerabilities (0)');
    });

    test('should handle empty compliances array', () => {
      const emptyCompData = {
        ...mockData,
        results: [
          {
            ...mockData.results[0],
            compliances: [],
            complianceDistribution: {
              critical: 0,
              high: 0,
              medium: 0,
              low: 0,
              total: 0
            }
          }
        ]
      };

      const result = processResults(JSON.stringify(emptyCompData));

      expect(result).toBeDefined();
      const content = fs.readFileSync(result.complianceTable, 'utf8');
      expect(content).toContain('Twistlock Compliance Findings (0)');
    });

    test('should return null for invalid data (no results)', () => {
      const invalidData = { consoleURL: 'https://example.com' };

      const result = processResults(JSON.stringify(invalidData));

      expect(result).toBeNull();
    });

    test('should return null for empty results array', () => {
      const emptyResultsData = { consoleURL: 'https://example.com', results: [] };

      const result = processResults(JSON.stringify(emptyResultsData));

      expect(result).toBeNull();
    });

    test('should calculate severity counts when distribution not provided', () => {
      const noDistData = {
        ...mockData,
        results: [
          {
            ...mockData.results[0],
            vulnerabilityDistribution: undefined,
            complianceDistribution: undefined
          }
        ]
      };

      const result = processResults(JSON.stringify(noDistData));

      expect(result).toBeDefined();
      const summaryContent = fs.readFileSync(result.summaryTable, 'utf8');
      expect(summaryContent).toContain('critical');
    });

    test('should truncate long compliance descriptions', () => {
      const longDescData = {
        ...mockData,
        results: [
          {
            ...mockData.results[0],
            compliances: [
              {
                id: 'COMP-001',
                title: 'Test',
                severity: 'high',
                category: 'Security',
                description: 'A'.repeat(150),
                layerTime: '2024-01-01'
              }
            ]
          }
        ]
      };

      const result = processResults(JSON.stringify(longDescData));

      expect(result).toBeDefined();
      const content = fs.readFileSync(result.complianceTable, 'utf8');
      expect(content).toContain('...');
    });

    test('should format scan time correctly', () => {
      const result = processResults(JSON.stringify(mockData));

      expect(result).toBeDefined();
      const summaryContent = fs.readFileSync(result.summaryTable, 'utf8');
      // Should contain formatted date (YYYY-MM-DD HH:mm)
      expect(summaryContent).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/);
    });

    test('should include severity symbols', () => {
      const result = processResults(JSON.stringify(mockData));

      expect(result).toBeDefined();
      const summaryContent = fs.readFileSync(result.summaryTable, 'utf8');
      // Should contain emoji symbols
      expect(summaryContent).toMatch(/‼️|❌|⛔️|⚠️|🟡/);
    });

    test('should include console URL in summary', () => {
      const result = processResults(JSON.stringify(mockData));

      expect(result).toBeDefined();
      const summaryContent = fs.readFileSync(result.summaryTable, 'utf8');
      expect(summaryContent).toContain('[More Details]');
      expect(summaryContent).toContain('https://console.example.com');
    });
  });
});
