# Credit Card Transaction Cleaner

A simple, offline web tool to clean and format credit card transaction data from bank statements. Convert messy, copied transaction data into clean, structured format with date, description, and amount columns.

## Features

- **Offline First**: Works completely offline - no internet connection required
- **Smart Parsing**: Automatically detects and parses various bank statement formats
- **Multiple Export Options**: Copy to clipboard or download as CSV
- **Clean Interface**: Modern, responsive design that works on all devices
- **No Installation**: Just open the HTML file in any modern web browser

## How to Use

1. **Open the Tool**: Double-click `index.html` to open it in your default web browser
2. **Copy Transaction Data**: Copy your transaction data from your bank statement or banking app
3. **Paste Data**: Paste the copied data into the input text area
4. **Parse Transactions**: Click "Parse Transactions" to clean and format the data
5. **Export Results**: Use "Copy CSV" to copy to clipboard or "Download CSV" to save as a file

## Supported Formats

The tool automatically detects and parses these common bank statement formats:

### 5-Column Format
```
Transaction Date, Posting Date, Description, Amount, Running Balance
08/11/25 08/11/25 STEAMGAMES.COM 425952298542S-8899642 WA #242042962011MNAGV $5.00 $28.03
```

### 3-Column Format
```
Date, Description, Amount
08/11/25 STEAMGAMES.COM $5.00
```

### 2-Column Format
```
Date, Description (with embedded amount)
08/11/25 STEAMGAMES.COM $5.00 WA
```

## What Gets Cleaned

- **Dates**: Standardized to MM/DD/YYYY format
- **Descriptions**: Removes account numbers, reference codes, and other artifacts
- **Amounts**: Properly formatted with positive/negative indicators
- **Whitespace**: Normalized and cleaned

## Output Format

The tool outputs clean data in three columns:
- **Date**: Transaction date in MM/DD/YYYY format
- **Description**: Cleaned merchant/transaction description
- **Amount**: Transaction amount (positive for credits, negative for debits)

## Export Options

- **Copy CSV**: Copies the formatted data to your clipboard for pasting into Excel, Google Sheets, or other applications
- **Download CSV**: Downloads a CSV file that can be opened in any spreadsheet application

## Browser Compatibility

Works in all modern browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## File Structure

```
transaction_parsing/
├── index.html          # Main application file
├── styles.css          # Styling and layout
├── script.js           # Transaction parsing logic
└── README.md           # This file
```

## Tips for Best Results

1. **Copy Complete Lines**: Make sure to copy the entire transaction line from your bank statement
2. **Check Format**: The tool works best with consistent formatting - if your bank uses a unique format, the generic parser will attempt to extract the data
3. **Review Results**: Always review the parsed results before exporting to ensure accuracy
4. **Use Clear Button**: Use the "Clear" button to start fresh with new data

## Troubleshooting

**No transactions found**: 
- Check that your data includes dates in MM/DD/YY or MM/DD/YYYY format
- Ensure amounts are in $X.XX format
- Try copying a few sample transactions first to test

**Incorrect parsing**:
- The tool uses multiple parsing strategies - if one fails, it tries others
- Check the format of your bank statement and ensure it matches one of the supported formats

**Export issues**:
- For clipboard copying, ensure your browser allows clipboard access
- For downloads, check that your browser allows file downloads

## Privacy & Security

- **100% Offline**: No data is sent to any server
- **Local Processing**: All transaction parsing happens in your browser
- **No Storage**: No transaction data is stored on your device
- **Open Source**: Review the code to ensure it meets your security requirements

## Getting Help

If you encounter issues or have suggestions for improvements:
1. Check that your browser is up to date
2. Try copying a sample transaction to test the parsing
3. Review the supported formats to ensure your data matches

---

**Note**: This tool is designed for personal use and educational purposes. Always verify the accuracy of parsed data before using it for financial analysis or record-keeping. 