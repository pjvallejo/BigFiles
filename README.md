# BigFiles CSV Processor

A TypeScript application designed to handle large CSV files that cannot be loaded into memory. This project generates and processes sales data with streaming techniques for optimal performance.

## 📋 Features

- **Data Generation**: Creates CSV files with 1,000,000+ records using batched streaming
- **Report Processing**: Processes large CSV files using Node.js streams to avoid memory issues
- **Statistical Analysis**: Calculates comprehensive statistics including standard deviation
- **Memory Efficient**: Handles files of any size without loading them entirely into memory
- **Progress Tracking**: Real-time progress indicators during processing
- **Comprehensive Testing**: Full test suite with validation and performance testing

## 🏗️ Project Structure

```
├── src/
│   ├── generator.ts      # Sales data generator
│   ├── main.ts          # Report processor
│   └── index.ts         # Main entry point
├── test/
│   └── test.ts          # Test suite
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## 📊 Data Schema

### Sales Data (`sales.csv`)
| Field | Type | Description |
|-------|------|-------------|
| id | int | Sequential ID (1 to 1,000,000) |
| order_id | int | Random order identifier |
| customer_id | int | Random customer identifier (1-50,000) |
| total | float | Random amount ($500.00 - $1800.00) |
| date | datetime | Random date (2020-2025) |

### Sales Report (`sales_report.csv`)
| Field | Type | Description |
|-------|------|-------------|
| year | int | Year |
| month | int | Month (1-12) |
| month_name | string | Month name |
| number_of_orders | int | Count of orders |
| max_amount | float | Maximum sale amount |
| min_amount | float | Minimum sale amount |
| sales_average | float | Average sale amount |
| standard_deviation | float | Standard deviation of sales |

## 🚀 Installation

1. **Clone or create the project directory**
2. **Install dependencies**:
   ```bash
   npm install
   ```

## 📖 Usage

### Generate Sales Data
Creates `sales.csv` with 1,000,000 records:
```bash
npm run generate-data
```

### Process Sales Report
Processes `sales.csv` and creates `sales_report.csv`:
```bash
npm run process-report
```

### Run Tests
Executes the comprehensive test suite:
```bash
npm test
```

### Build Project
Compile TypeScript to JavaScript:
```bash
npm run build
```

### Manual Execution
You can also run the programs directly with ts-node:
```bash
# Generate data
npx ts-node src/generator.ts

# Process report
npx ts-node src/main.ts

# Run tests
npx ts-node test/test.ts
```

## 🔧 Configuration

### Custom Data Generation
```typescript
import { SalesDataGenerator } from './src/generator';

// Create generator with custom parameters
const generator = new SalesDataGenerator(
  'custom_sales.csv',  // Output file
  2000000,            // Number of records
  20000               // Batch size
);

await generator.generate();
```

### Custom Report Processing
```typescript
import { SalesProcessor } from './src/main';

// Create processor with custom paths
const processor = new SalesProcessor(
  'input_sales.csv',    // Input file
  'output_report.csv'   // Output file
);

await processor.process();
```

## 🧪 Testing

The test suite includes:
- **Data Generation Tests**: Validates record structure, ranges, and constraints
- **Report Processing Tests**: Ensures accurate statistical calculations
- **Data Validation Tests**: Checks data integrity and uniqueness
- **Performance Tests**: Measures processing speed and efficiency

Run with: `npm test`

## 🚀 Performance

### Benchmarks (Typical Performance)
- **Data Generation**: ~50,000-100,000 records/second
- **Report Processing**: ~80,000-120,000 records/second
- **Memory Usage**: Constant ~50-100MB regardless of file size
- **File Size**: ~80MB for 1M records

### Memory Efficiency
- Uses streaming for both reading and writing
- Processes data in configurable batches
- Constant memory usage regardless of file size
- Suitable for files with millions or billions of records

## 🛠️ Technical Implementation

### Streaming Strategy
- **Write Streams**: For generating large CSV files without memory accumulation
- **Read Streams**: For processing large CSV files line by line
- **Transform Streams**: For data processing and validation
- **Batch Processing**: Configurable batch sizes for optimal performance

### Error Handling
- Comprehensive error handling with detailed messages
- Progress tracking with interruption recovery
- File system error management
- Data validation with informative error reporting

## 📝 Example Output

### Generation Progress
```
🚀 Starting generation of 1,000,000 records...
📁 Output file: sales.csv
📦 Batch size: 10,000
📊 Progress: 10.0% (100,000/1,000,000) - 85,234 records/sec
📊 Progress: 20.0% (200,000/1,000,000) - 87,532 records/sec
...
✅ Generation completed successfully!
⏱️  Total time: 11.73 seconds
🚀 Average speed: 85,248 records/second
📦 File size: 79.2 MB
```

### Processing Progress
```
🔄 Processing sales data from: sales.csv
📊 Generating report to: sales_report.csv
📈 Processed 100,000 records - 92,847 records/sec
📈 Processed 200,000 records - 94,339 records/sec
...
✅ Report generation completed successfully!
⏱️  Total processing time: 10.84 seconds
🚀 Average processing speed: 92,251 records/second
📈 Generated 72 monthly summaries
📦 Report file size: 3.2 KB
```

### Sample Report Output
```
year,month,month_name,number_of_orders,max_amount,min_amount,sales_average,standard_deviation
2020,1,January,13842,1799.99,500.01,1149.87,375.42
2020,2,February,12634,1799.85,500.15,1151.23,374.89
2020,3,March,13901,1799.92,500.07,1148.94,376.12
...
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run the test suite
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for any purpose.

## 🐛 Troubleshooting

### Common Issues

**Memory Errors**: 
- Ensure you're not trying to load the entire file at once
- Reduce batch size if experiencing memory pressure

**File Not Found**:
- Ensure `sales.csv` exists before running the report processor
- Check file paths are correct for your operating system

**Performance Issues**:
- Adjust batch size based on available memory
- Ensure sufficient disk space for temporary operations

### Support
For issues or questions, please check the test suite for examples of proper usage patterns.




