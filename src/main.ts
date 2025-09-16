import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';

interface SalesRecord {
  id: number;
  order_id: number;
  customer_id: number;
  total: number;
  date: string;
}

interface SalesStats {
  year: number;
  month: number;
  numberOfOrders: number;
  maxAmount: number;
  minAmount: number;
  totalAmount: number;
  salesAverage: number;
  standardDeviation: number;
  amounts: number[]; // Temporary array for calculating std dev
}

interface SalesReportRecord {
  year: number;
  month: number;
  numberOfOrders: number;
  maxAmount: number;
  minAmount: number;
  salesAverage: number;
  standardDeviation: number;
}

class SalesProcessor {
  private readonly inputPath: string;
  private readonly outputPath: string;
  private readonly monthlyStats: Map<string, SalesStats>;

  constructor(inputPath: string = 'sales.csv', outputPath: string = 'sales_report.csv') {
    this.inputPath = inputPath;
    this.outputPath = outputPath;
    this.monthlyStats = new Map();
  }

  /**
   * Get month name from month number
   */
  private getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  }

  /**
   * Calculate standard deviation for an array of numbers
   */
  private calculateStandardDeviation(values: number[], mean: number): number {
    if (values.length <= 1) return 0;
    
    const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
    const variance = squaredDifferences.reduce((sum, sqDiff) => sum + sqDiff, 0) / (values.length - 1);
    return Math.sqrt(variance);
  }

  /**
   * Process a single sales record
   */
  private processSalesRecord(record: SalesRecord): void {
    const date = new Date(record.date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() returns 0-11, we want 1-12
    const key = `${year}-${month.toString().padStart(2, '0')}`;

    if (!this.monthlyStats.has(key)) {
      this.monthlyStats.set(key, {
        year,
        month,
        numberOfOrders: 0,
        maxAmount: record.total,
        minAmount: record.total,
        totalAmount: 0,
        salesAverage: 0,
        standardDeviation: 0,
        amounts: []
      });
    }

    const stats = this.monthlyStats.get(key)!;
    stats.numberOfOrders++;
    stats.totalAmount += record.total;
    stats.maxAmount = Math.max(stats.maxAmount, record.total);
    stats.minAmount = Math.min(stats.minAmount, record.total);
    stats.amounts.push(record.total);
  }

  /**
   * Finalize statistics calculations
   */
  private finalizeStats(): void {
    for (const [key, stats] of this.monthlyStats) {
      stats.salesAverage = stats.totalAmount / stats.numberOfOrders;
      stats.standardDeviation = this.calculateStandardDeviation(stats.amounts, stats.salesAverage);
      
      // Clean up amounts array to free memory
      delete (stats as any).amounts;
    }
  }

  /**
   * Convert stats to CSV format
   */
  private statsToCSV(): string {
    let csv = 'year,month,month_name,number_of_orders,max_amount,min_amount,sales_average,standard_deviation\n';
    
    // Sort by year and month
    const sortedEntries = Array.from(this.monthlyStats.entries()).sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
    
    for (const [, stats] of sortedEntries) {
      const monthName = this.getMonthName(stats.month);
      csv += `${stats.year},${stats.month},${monthName},${stats.numberOfOrders},${stats.maxAmount.toFixed(2)},${stats.minAmount.toFixed(2)},${stats.salesAverage.toFixed(2)},${stats.standardDeviation.toFixed(2)}\n`;
    }
    
    return csv;
  }

  /**
   * Process the sales CSV file and generate report
   */
  async process(): Promise<void> {
    console.log(`🔄 Processing sales data from: ${this.inputPath}`);
    console.log(`📊 Generating report to: ${this.outputPath}`);

    if (!fs.existsSync(this.inputPath)) {
      throw new Error(`Input file not found: ${this.inputPath}`);
    }

    const startTime = Date.now();
    let recordsProcessed = 0;

    return new Promise((resolve, reject) => {
      fs.createReadStream(this.inputPath)
        .pipe(csv({
          mapHeaders: ({ header }: { header: string }) => header.trim()
        }))
        .on('data', (rawRecord: any) => {
          try {
            const record: SalesRecord = {
              id: parseInt(rawRecord.id),
              order_id: parseInt(rawRecord.order_id),
              customer_id: parseInt(rawRecord.customer_id),
              total: parseFloat(rawRecord.total),
              date: rawRecord.date
            };

            this.processSalesRecord(record);
            recordsProcessed++;

            // Progress update every 100k records
            if (recordsProcessed % 100000 === 0) {
              const elapsed = (Date.now() - startTime) / 1000;
              const recordsPerSecond = Math.round(recordsProcessed / elapsed);
              console.log(`📈 Processed ${recordsProcessed.toLocaleString()} records - ${recordsPerSecond.toLocaleString()} records/sec`);
            }
          } catch (error) {
            console.error(`❌ Error processing record at line ${recordsProcessed + 1}:`, error);
          }
        })
        .on('end', () => {
          try {
            console.log(`✅ Finished reading ${recordsProcessed.toLocaleString()} records`);
            console.log(`🧮 Finalizing calculations...`);

            this.finalizeStats();

            console.log(`📝 Writing report with ${this.monthlyStats.size} monthly summaries...`);
            const csvContent = this.statsToCSV();
            
            // Ensure output directory exists
            const dir = path.dirname(this.outputPath);
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(this.outputPath, csvContent);

            const totalTime = (Date.now() - startTime) / 1000;
            const avgRecordsPerSecond = Math.round(recordsProcessed / totalTime);

            console.log(`✅ Report generation completed successfully!`);
            console.log(`⏱️  Total processing time: ${totalTime.toFixed(2)} seconds`);
            console.log(`🚀 Average processing speed: ${avgRecordsPerSecond.toLocaleString()} records/second`);
            console.log(`📈 Generated ${this.monthlyStats.size} monthly summaries`);
            console.log(`📦 Report file size: ${this.getFileSize(this.outputPath)}`);

            this.printSampleResults();
            resolve();
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error: Error) => {
          reject(error);
        });
    });
  }

  /**
   * Print sample results for verification
   */
  private printSampleResults(): void {
    console.log('\n📊 Sample Results (First 5 entries):');
    console.log('─'.repeat(80));
    
    const sortedEntries = Array.from(this.monthlyStats.entries())
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .slice(0, 5);

    for (const [, stats] of sortedEntries) {
      const monthName = this.getMonthName(stats.month);
      console.log(`${stats.year}-${stats.month.toString().padStart(2, '0')} (${monthName}): ${stats.numberOfOrders.toLocaleString()} orders, Avg: $${stats.salesAverage.toFixed(2)}, StdDev: $${stats.standardDeviation.toFixed(2)}`);
    }
  }

  /**
   * Get human readable file size
   */
  private getFileSize(filePath: string): string {
    const stats = fs.statSync(filePath);
    const bytes = stats.size;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get summary statistics
   */
  getStats(): { totalMonths: number; yearRange: string; totalRecordsProcessed: number } {
    if (this.monthlyStats.size === 0) {
      return { totalMonths: 0, yearRange: '', totalRecordsProcessed: 0 };
    }

    const years = Array.from(this.monthlyStats.values()).map(stats => stats.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const totalRecords = Array.from(this.monthlyStats.values())
      .reduce((sum, stats) => sum + stats.numberOfOrders, 0);

    return {
      totalMonths: this.monthlyStats.size,
      yearRange: minYear === maxYear ? `${minYear}` : `${minYear}-${maxYear}`,
      totalRecordsProcessed: totalRecords
    };
  }
}

// Main execution when run directly
async function main() {
  const processor = new SalesProcessor('sales.csv', 'sales_report.csv');
  
  try {
    await processor.process();
  } catch (error) {
    console.error('❌ Failed to process sales data:', error);
    process.exit(1);
  }
}

// Export for testing
export { SalesProcessor, SalesRecord, SalesReportRecord };

// Run if this file is executed directly
if (require.main === module) {
  main();
}
