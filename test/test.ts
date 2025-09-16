import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';
import { SalesDataGenerator, SalesRecord } from '../src/generator';
import { SalesProcessor } from '../src/main';

class TestSuite {
  private testDir: string;
  private testDataFile: string;
  private testReportFile: string;
  private passedTests: number = 0;
  private failedTests: number = 0;

  constructor() {
    this.testDir = path.join(__dirname, 'test_data');
    this.testDataFile = path.join(this.testDir, 'test_sales.csv');
    this.testReportFile = path.join(this.testDir, 'test_report.csv');
  }

  /**
   * Run a test with proper error handling
   */
  private async runTest(testName: string, testFn: () => Promise<void>): Promise<void> {
    try {
      console.log(`🧪 Running: ${testName}`);
      await testFn();
      console.log(`✅ PASSED: ${testName}`);
      this.passedTests++;
    } catch (error) {
      console.error(`❌ FAILED: ${testName}`);
      console.error(`   Error: ${error instanceof Error ? error.message : String(error)}`);
      this.failedTests++;
    }
  }

  /**
   * Assert that a condition is true
   */
  private assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  /**
   * Setup test environment
   */
  private async setupTestEnvironment(): Promise<void> {
    // Create test directory if it doesn't exist
    if (!fs.existsSync(this.testDir)) {
      fs.mkdirSync(this.testDir, { recursive: true });
    }

    // Clean up any existing test files
    if (fs.existsSync(this.testDataFile)) {
      fs.unlinkSync(this.testDataFile);
    }
    if (fs.existsSync(this.testReportFile)) {
      fs.unlinkSync(this.testReportFile);
    }
  }

  /**
   * Test data generation with a small dataset
   */
  private async testDataGeneration(): Promise<void> {
    const generator = new SalesDataGenerator(this.testDataFile, 1000, 100); // 1000 records, 100 per batch
    await generator.generate();

    // Check if file was created
    this.assert(fs.existsSync(this.testDataFile), 'Test sales file should exist');

    // Read and validate the generated data
    const records: any[] = [];
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(this.testDataFile)
        .pipe(csv())
        .on('data', (record: any) => records.push(record))
        .on('end', () => resolve())
        .on('error', (error: Error) => reject(error));
    });

    // Validate record count (including header)
    this.assert(records.length === 1000, `Should have 1000 records, but found ${records.length}`);

    // Validate first record structure
    const firstRecord = records[0];
    this.assert('id' in firstRecord, 'Record should have id field');
    this.assert('order_id' in firstRecord, 'Record should have order_id field');
    this.assert('customer_id' in firstRecord, 'Record should have customer_id field');
    this.assert('total' in firstRecord, 'Record should have total field');
    this.assert('date' in firstRecord, 'Record should have date field');

    // Validate data types and ranges
    const id = parseInt(firstRecord.id);
    const total = parseFloat(firstRecord.total);
    const date = new Date(firstRecord.date);

    this.assert(id === 1, `First record ID should be 1, but was ${id}`);
    this.assert(total >= 500 && total <= 1800, `Total should be between 500-1800, but was ${total}`);
    this.assert(date.getFullYear() >= 2020 && date.getFullYear() <= 2025, 
      `Date should be between 2020-2025, but was ${date.getFullYear()}`);

    // Validate ID sequence
    const lastRecord = records[records.length - 1];
    const lastId = parseInt(lastRecord.id);
    this.assert(lastId === 1000, `Last record ID should be 1000, but was ${lastId}`);

    console.log(`   ✓ Generated ${records.length} records successfully`);
    console.log(`   ✓ ID range: ${id} to ${lastId}`);
    console.log(`   ✓ Sample total: $${total.toFixed(2)}`);
    console.log(`   ✓ Sample date: ${date.toISOString().split('T')[0]}`);
  }

  /**
   * Test report processing
   */
  private async testReportProcessing(): Promise<void> {
    const processor = new SalesProcessor(this.testDataFile, this.testReportFile);
    await processor.process();

    // Check if report file was created
    this.assert(fs.existsSync(this.testReportFile), 'Test report file should exist');

    // Read and validate the report data
    const reportRecords: any[] = [];
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(this.testReportFile)
        .pipe(csv())
        .on('data', (record: any) => reportRecords.push(record))
        .on('end', () => resolve())
        .on('error', (error: Error) => reject(error));
    });

    this.assert(reportRecords.length > 0, 'Report should contain at least one record');

    // Validate report structure
    const firstReport = reportRecords[0];
    const requiredFields = ['year', 'month', 'month_name', 'number_of_orders', 'max_amount', 'min_amount', 'sales_average', 'standard_deviation'];
    
    for (const field of requiredFields) {
      this.assert(field in firstReport, `Report record should have ${field} field`);
    }

    // Validate data types and ranges
    const year = parseInt(firstReport.year);
    const month = parseInt(firstReport.month);
    const numberOfOrders = parseInt(firstReport.number_of_orders);
    const maxAmount = parseFloat(firstReport.max_amount);
    const minAmount = parseFloat(firstReport.min_amount);
    const salesAverage = parseFloat(firstReport.sales_average);
    const standardDeviation = parseFloat(firstReport.standard_deviation);

    this.assert(year >= 2020 && year <= 2025, `Year should be 2020-2025, but was ${year}`);
    this.assert(month >= 1 && month <= 12, `Month should be 1-12, but was ${month}`);
    this.assert(numberOfOrders > 0, `Number of orders should be positive, but was ${numberOfOrders}`);
    this.assert(maxAmount >= minAmount, `Max amount (${maxAmount}) should be >= min amount (${minAmount})`);
    this.assert(salesAverage >= minAmount && salesAverage <= maxAmount, 
      `Sales average (${salesAverage}) should be between min (${minAmount}) and max (${maxAmount})`);
    this.assert(standardDeviation >= 0, `Standard deviation should be non-negative, but was ${standardDeviation}`);

    // Get processor stats
    const stats = processor.getStats();
    this.assert(stats.totalRecordsProcessed === 1000, 
      `Should have processed 1000 records, but processed ${stats.totalRecordsProcessed}`);

    console.log(`   ✓ Generated report with ${reportRecords.length} monthly summaries`);
    console.log(`   ✓ Sample: ${firstReport.year}-${firstReport.month.toString().padStart(2, '0')} (${firstReport.month_name})`);
    console.log(`   ✓ Orders: ${numberOfOrders}, Avg: $${salesAverage}, StdDev: $${standardDeviation.toFixed(2)}`);
    console.log(`   ✓ Range: $${minAmount} - $${maxAmount}`);
  }

  /**
   * Test data validation and edge cases
   */
  private async testDataValidation(): Promise<void> {
    // Read the test data to validate specific constraints
    const records: any[] = [];
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(this.testDataFile)
        .pipe(csv())
        .on('data', (record: any) => records.push(record))
        .on('end', () => resolve())
        .on('error', (error: Error) => reject(error));
    });

    // Validate all totals are in the correct range
    let totalInRange = 0;
    let datesInRange = 0;
    const minTotal = 500;
    const maxTotal = 1800;

    for (const record of records) {
      const total = parseFloat(record.total);
      const date = new Date(record.date);
      const year = date.getFullYear();

      if (total >= minTotal && total <= maxTotal) {
        totalInRange++;
      }

      if (year >= 2020 && year <= 2025) {
        datesInRange++;
      }
    }

    this.assert(totalInRange === records.length, 
      `All ${records.length} totals should be in range [$${minTotal}, $${maxTotal}], but only ${totalInRange} are`);
    this.assert(datesInRange === records.length, 
      `All ${records.length} dates should be in range [2020, 2025], but only ${datesInRange} are`);

    // Validate ID uniqueness and sequence
    const ids = records.map(record => parseInt(record.id));
    const uniqueIds = new Set(ids);
    this.assert(uniqueIds.size === records.length, 'All IDs should be unique');

    const sortedIds = [...ids].sort((a, b) => a - b);
    for (let i = 0; i < sortedIds.length; i++) {
      this.assert(sortedIds[i] === i + 1, `ID at position ${i} should be ${i + 1}, but was ${sortedIds[i]}`);
    }

    console.log(`   ✓ All ${totalInRange} totals within range [$${minTotal}, $${maxTotal}]`);
    console.log(`   ✓ All ${datesInRange} dates within range [2020, 2025]`);
    console.log(`   ✓ All ${uniqueIds.size} IDs are unique and sequential`);
  }

  /**
   * Performance test with timing
   */
  private async testPerformance(): Promise<void> {
    const startTime = Date.now();
    
    // Generate larger dataset for performance testing
    const perfDataFile = path.join(this.testDir, 'perf_sales.csv');
    const perfReportFile = path.join(this.testDir, 'perf_report.csv');
    
    try {
      const generator = new SalesDataGenerator(perfDataFile, 10000, 1000); // 10k records
      await generator.generate();

      const processor = new SalesProcessor(perfDataFile, perfReportFile);
      await processor.process();

      const endTime = Date.now();
      const totalTime = (endTime - startTime) / 1000;
      
      // Validate files exist
      this.assert(fs.existsSync(perfDataFile), 'Performance test data file should exist');
      this.assert(fs.existsSync(perfReportFile), 'Performance test report file should exist');

      console.log(`   ✓ Processed 10,000 records in ${totalTime.toFixed(2)} seconds`);
      
      // Clean up performance test files
      fs.unlinkSync(perfDataFile);
      fs.unlinkSync(perfReportFile);
      
    } catch (error) {
      // Clean up on error
      if (fs.existsSync(perfDataFile)) fs.unlinkSync(perfDataFile);
      if (fs.existsSync(perfReportFile)) fs.unlinkSync(perfReportFile);
      throw error;
    }
  }

  /**
   * Clean up test files
   */
  private cleanup(): void {
    try {
      if (fs.existsSync(this.testDataFile)) {
        fs.unlinkSync(this.testDataFile);
      }
      if (fs.existsSync(this.testReportFile)) {
        fs.unlinkSync(this.testReportFile);
      }
      if (fs.existsSync(this.testDir)) {
        fs.rmdirSync(this.testDir);
      }
    } catch (error) {
      console.warn('⚠️  Warning: Could not clean up all test files:', error);
    }
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting BigFiles CSV Processor Test Suite');
    console.log('='.repeat(60));

    try {
      await this.setupTestEnvironment();

      await this.runTest('Data Generation', () => this.testDataGeneration());
      await this.runTest('Report Processing', () => this.testReportProcessing());
      await this.runTest('Data Validation', () => this.testDataValidation());
      await this.runTest('Performance Test', () => this.testPerformance());

    } catch (error) {
      console.error('💥 Test suite setup failed:', error);
      this.failedTests++;
    } finally {
      this.cleanup();
    }

    console.log('='.repeat(60));
    console.log(`📊 Test Results:`);
    console.log(`   ✅ Passed: ${this.passedTests}`);
    console.log(`   ❌ Failed: ${this.failedTests}`);
    console.log(`   📈 Success Rate: ${((this.passedTests / (this.passedTests + this.failedTests)) * 100).toFixed(1)}%`);

    if (this.failedTests === 0) {
      console.log('🎉 All tests passed! The BigFiles CSV Processor is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Please review the errors above.');
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  const testSuite = new TestSuite();
  await testSuite.runAllTests();
}

// Export for external usage
export { TestSuite };

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}
