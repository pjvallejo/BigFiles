import * as fs from 'fs';
import * as path from 'path';

interface SalesRecord {
  id: number;
  order_id: number;
  customer_id: number;
  total: number;
  date: string;
}

class SalesDataGenerator {
  private readonly outputPath: string;
  private readonly totalRecords: number;
  private readonly batchSize: number;

  constructor(outputPath: string = 'sales.csv', totalRecords: number = 1000000, batchSize: number = 10000) {
    this.outputPath = outputPath;
    this.totalRecords = totalRecords;
    this.batchSize = batchSize;
  }

  /**
   * Generate random integer between min and max (inclusive)
   */
  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate random float between min and max with specified decimal places
   */
  private randomFloat(min: number, max: number, decimals: number = 2): number {
    const value = Math.random() * (max - min) + min;
    return parseFloat(value.toFixed(decimals));
  }

  /**
   * Generate random date between 2020 and 2025
   */
  private randomDate(): string {
    const startYear = 2020;
    const endYear = 2025;
    const year = this.randomInt(startYear, endYear);
    const month = this.randomInt(1, 12);
    const daysInMonth = new Date(year, month, 0).getDate();
    const day = this.randomInt(1, daysInMonth);
    const hour = this.randomInt(0, 23);
    const minute = this.randomInt(0, 59);
    const second = this.randomInt(0, 59);

    return new Date(year, month - 1, day, hour, minute, second).toISOString();
  }

  /**
   * Generate a batch of sales records
   */
  private generateBatch(startId: number, count: number): SalesRecord[] {
    const records: SalesRecord[] = [];
    
    for (let i = 0; i < count; i++) {
      const record: SalesRecord = {
        id: startId + i,
        order_id: this.randomInt(100000, 999999),
        customer_id: this.randomInt(1, 50000),
        total: this.randomFloat(500, 1800, 2),
        date: this.randomDate()
      };
      records.push(record);
    }
    
    return records;
  }

  /**
   * Convert records to CSV format
   */
  private recordsToCSV(records: SalesRecord[], includeHeader: boolean = false): string {
    let csv = '';
    
    if (includeHeader) {
      csv += 'id,order_id,customer_id,total,date\n';
    }
    
    for (const record of records) {
      csv += `${record.id},${record.order_id},${record.customer_id},${record.total},${record.date}\n`;
    }
    
    return csv;
  }

  /**
   * Generate the complete sales CSV file with streaming to handle large datasets
   */
  async generate(): Promise<void> {
    console.log(`🚀 Starting generation of ${this.totalRecords.toLocaleString()} records...`);
    console.log(`📁 Output file: ${this.outputPath}`);
    console.log(`📦 Batch size: ${this.batchSize.toLocaleString()}`);

    // Ensure directory exists
    const dir = path.dirname(this.outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Create write stream
    const writeStream = fs.createWriteStream(this.outputPath, { flags: 'w' });
    
    try {
      // Write header
      writeStream.write('id,order_id,customer_id,total,date\n');

      let processed = 0;
      const startTime = Date.now();

      while (processed < this.totalRecords) {
        const remainingRecords = this.totalRecords - processed;
        const currentBatchSize = Math.min(this.batchSize, remainingRecords);
        
        // Generate batch
        const batch = this.generateBatch(processed + 1, currentBatchSize);
        const csvData = this.recordsToCSV(batch, false);
        
        // Write batch to stream
        await new Promise<void>((resolve, reject) => {
          writeStream.write(csvData, (error) => {
            if (error) reject(error);
            else resolve();
          });
        });

        processed += currentBatchSize;
        
        // Progress update
        if (processed % (this.batchSize * 10) === 0 || processed === this.totalRecords) {
          const progress = (processed / this.totalRecords * 100).toFixed(1);
          const elapsed = (Date.now() - startTime) / 1000;
          const recordsPerSecond = Math.round(processed / elapsed);
          console.log(`📊 Progress: ${progress}% (${processed.toLocaleString()}/${this.totalRecords.toLocaleString()}) - ${recordsPerSecond.toLocaleString()} records/sec`);
        }
      }

      // Close stream
      await new Promise<void>((resolve, reject) => {
          writeStream.end((error?: Error) => {
            if (error) reject(error);
            else resolve();
          });
      });

      const totalTime = (Date.now() - startTime) / 1000;
      const avgRecordsPerSecond = Math.round(this.totalRecords / totalTime);
      
      console.log(`✅ Generation completed successfully!`);
      console.log(`⏱️  Total time: ${totalTime.toFixed(2)} seconds`);
      console.log(`🚀 Average speed: ${avgRecordsPerSecond.toLocaleString()} records/second`);
      console.log(`📦 File size: ${this.getFileSize(this.outputPath)}`);

    } catch (error) {
      console.error('❌ Error during generation:', error);
      throw error;
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
}

// Main execution when run directly
async function main() {
  const generator = new SalesDataGenerator('sales.csv', 1000000);
  
  try {
    await generator.generate();
  } catch (error) {
    console.error('Failed to generate sales data:', error);
    process.exit(1);
  }
}

// Export for testing
export { SalesDataGenerator, SalesRecord };

// Run if this file is executed directly
if (require.main === module) {
  main();
}
