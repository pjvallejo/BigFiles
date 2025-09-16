// Main entry point for BigFiles CSV Processor
export { SalesDataGenerator, SalesRecord } from './generator';
export { SalesProcessor, SalesReportRecord } from './main';

// Main execution function
import { SalesDataGenerator } from './generator';
import { SalesProcessor } from './main';

async function main() {
  console.log('🚀 BigFiles CSV Processor');
  console.log('='.repeat(40));
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    switch (command) {
      case 'generate':
        console.log('📝 Generating sales data...');
        const generator = new SalesDataGenerator('sales.csv', 1000000);
        await generator.generate();
        break;
        
      case 'process':
        console.log('🔄 Processing sales report...');
        const processor = new SalesProcessor('sales.csv', 'sales_report.csv');
        await processor.process();
        break;
        
      case 'all':
        console.log('🔄 Running complete pipeline...');
        const gen = new SalesDataGenerator('sales.csv', 1000000);
        await gen.generate();
        
        console.log('\n' + '='.repeat(40));
        
        const proc = new SalesProcessor('sales.csv', 'sales_report.csv');
        await proc.process();
        break;
        
      default:
        console.log('Usage:');
        console.log('  ts-node src/index.ts generate  # Generate sales data');
        console.log('  ts-node src/index.ts process   # Process sales report');
        console.log('  ts-node src/index.ts all       # Run complete pipeline');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}




