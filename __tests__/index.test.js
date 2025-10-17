import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

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
    outputFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
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
      execSync(`node src/index.js --file=${testDataPath}`, {
        cwd: join(__dirname, '..'),
        encoding: 'utf8'
      });

      // Verify all output files were created
      outputFiles.forEach(file => {
        expect(fs.existsSync(file)).toBe(true);
      });
    });

    test('should generate vulnerability table with correct content', () => {
      execSync(`node src/index.js --file=${testDataPath}`, {
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
      execSync(`node src/index.js --file=${testDataPath}`, {
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
      execSync(`node src/index.js --file=${testDataPath}`, {
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
      execSync(`node src/index.js --file=${testDataPath}`, {
        cwd: join(__dirname, '..'),
        encoding: 'utf8'
      });

      const complianceSummaryTable = fs.readFileSync('./twistlock-compliance-summary-table.md', 'utf8');

      expect(complianceSummaryTable).toContain('Twistlock Compliance Summary');
      expect(complianceSummaryTable).toContain('Severity');
      expect(complianceSummaryTable).toContain('Count');
    });

    test('should include severity symbols in tables', () => {
      execSync(`node src/index.js --file=${testDataPath}`, {
        cwd: join(__dirname, '..'),
        encoding: 'utf8'
      });

      const summaryTable = fs.readFileSync('./twistlock-summary-table.md', 'utf8');

      // Check for severity symbols (emojis)
      const hasSeveritySymbols = /‼️|❌|⛔️|⚠️|🟡/.test(summaryTable);
      expect(hasSeveritySymbols).toBe(true);
    });

    test('should format scan time correctly', () => {
      execSync(`node src/index.js --file=${testDataPath}`, {
        cwd: join(__dirname, '..'),
        encoding: 'utf8'
      });

      const summaryTable = fs.readFileSync('./twistlock-summary-table.md', 'utf8');

      // Should contain formatted date (YYYY-MM-DD HH:mm)
      expect(summaryTable).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/);
    });

    test('should include console URL link', () => {
      execSync(`node src/index.js --file=${testDataPath}`, {
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
      execSync(`node src/index.js --file=${testDataPath}`, {
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
});
