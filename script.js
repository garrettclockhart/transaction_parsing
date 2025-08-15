class TransactionParser {
    constructor() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('parseBtn').addEventListener('click', () => this.parseTransactions());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearInput());
        document.getElementById('copyCsvBtn').addEventListener('click', () => this.copyToClipboard());
        document.getElementById('downloadCsvBtn').addEventListener('click', () => this.downloadCsv());
    }

    parseTransactions() {
        const input = document.getElementById('transactionInput').value.trim();
        if (!input) {
            alert('Please enter some transaction data to parse.');
            return;
        }

        // Split input into lines and group related lines together
        const lines = input.split('\n').filter(line => line.trim());
        const transactions = [];
        
        // Process lines in groups to handle multi-line transactions
        let currentTransaction = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Check if this line starts with a date (new transaction)
            if (this.isTransactionStart(line)) {
                // If we have a previous transaction, save it
                if (currentTransaction) {
                    const parsed = this.parseTransactionGroup(currentTransaction);
                    if (parsed) transactions.push(parsed);
                }
                
                // Start new transaction group
                currentTransaction = [line];
            } else if (currentTransaction) {
                // Add line to current transaction group
                currentTransaction.push(line);
            }
        }
        
        // Don't forget the last transaction
        if (currentTransaction) {
            const parsed = this.parseTransactionGroup(currentTransaction);
            if (parsed) transactions.push(parsed);
        }

        if (transactions.length === 0) {
            alert('No valid transactions found. Please check your input format.');
            return;
        }

        this.displayResults(transactions);
        this.showExportButtons();
    }

    isTransactionStart(line) {
        // Check if line starts with a date pattern
        const datePattern = /^\d{1,2}\/\d{1,2}\/\d{2}/;
        return datePattern.test(line);
    }

    parseTransactionGroup(transactionLines) {
        // Combine all lines into one string for parsing
        const fullTransaction = transactionLines.join(' ');
        
        // Try the specific bank statement format first
        let transaction = this.parseBankStatementFormat(fullTransaction);
        
        // Fall back to other formats if the specific one doesn't work
        if (!transaction) {
            transaction = this.parse5ColumnFormat(fullTransaction) ||
                         this.parse3ColumnFormat(fullTransaction) ||
                         this.parse2ColumnFormat(fullTransaction) ||
                         this.parseGenericFormat(fullTransaction);
        }

        // Filter out "ONLINE PAYMENT THANK YOU" transactions
        if (transaction && transaction.description.toLowerCase().includes('online payment thank you')) {
            return null;
        }

        return transaction;
    }

    parseBankStatementFormat(line) {
        // Format: Date Date Description #numbers Amount Balance
        // Example: "08/12/25	08/12/25	AMAZON MKTPL*J272L8WM3 Amzn.com/billWA #24692167033MQJ81M $10.15 $41.37"
        
        // Find all dates in MM/DD/YY format
        const datePattern = /\b\d{1,2}\/\d{1,2}\/\d{2}\b/g;
        const dates = line.match(datePattern);
        
        if (!dates || dates.length < 2) return null;
        
        // Take the second date (index 1)
        const transactionDate = dates[1];
        
        // Find the first dollar amount (positive or negative)
        const amountPattern = /[+-]?\$[\d,]+\.\d{2}/g;
        const amounts = line.match(amountPattern);
        
        if (!amounts || amounts.length === 0) return null;
        
        // Take the first amount (usually the transaction amount, not the balance)
        const amount = amounts[0];
        
        // Extract description: everything between the second date and the first #
        const secondDateIndex = line.indexOf(transactionDate) + transactionDate.length;
        const hashIndex = line.indexOf('#', secondDateIndex);
        
        if (hashIndex === -1) return null;
        
        // Get description from after the second date to before the #
        let description = line.substring(secondDateIndex, hashIndex).trim();
        
        // Clean up the description
        description = this.cleanDescription(description);
        
        if (!description) return null;

        return {
            date: this.formatDate(transactionDate),
            description: description,
            amount: this.parseAmount(amount)
        };
    }

    parse5ColumnFormat(line) {
        // Format: Date Date Description Amount Balance
        // Example: "08/11/25 08/11/25 STEAMGAMES.COM 425952298542S-8899642 WA #242042962011MNAGV $5.00 $28.03"
        
        const parts = line.split(' ');
        if (parts.length < 5) return null;

        // Look for date patterns (MM/DD/YY or MM/DD/YYYY)
        const datePattern = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
        let dateIndex = -1;
        
        for (let i = 0; i < Math.min(3, parts.length); i++) {
            if (datePattern.test(parts[i])) {
                dateIndex = i;
                break;
            }
        }
        
        if (dateIndex === -1) return null;

        // Look for amount patterns ($X.XX or -$X.XX)
        const amountPattern = /^-?\$?\d+\.\d{2}$/;
        let amountIndex = -1;
        
        for (let i = parts.length - 1; i >= 0; i--) {
            if (amountPattern.test(parts[i])) {
                amountIndex = i;
                break;
            }
        }
        
        if (amountIndex === -1) return null;

        // Extract date
        const date = parts[dateIndex];
        
        // Extract amount
        const amount = parts[amountIndex];
        
        // Extract description (everything between date and amount)
        const description = parts.slice(dateIndex + 1, amountIndex).join(' ').trim();
        
        if (!description) return null;

        return {
            date: this.formatDate(date),
            description: this.cleanDescription(description),
            amount: this.parseAmount(amount)
        };
    }

    parse3ColumnFormat(line) {
        // Format: Date Description Amount
        // Example: "08/11/25 STEAMGAMES.COM $5.00"
        
        const parts = line.split(' ');
        if (parts.length < 3) return null;

        const datePattern = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
        const amountPattern = /^-?\$?\d+\.\d{2}$/;
        
        // Find date and amount
        let dateIndex = -1;
        let amountIndex = -1;
        
        for (let i = 0; i < parts.length; i++) {
            if (datePattern.test(parts[i]) && dateIndex === -1) {
                dateIndex = i;
            } else if (amountPattern.test(parts[i]) && amountIndex === -1) {
                amountIndex = i;
            }
        }
        
        if (dateIndex === -1 || amountIndex === -1) return null;
        
        // Extract description (everything between date and amount)
        const description = parts.slice(dateIndex + 1, amountIndex).join(' ').trim();
        
        if (!description) return null;

        return {
            date: this.formatDate(parts[dateIndex]),
            description: this.cleanDescription(description),
            amount: this.parseAmount(parts[amountIndex])
        };
    }

    parse2ColumnFormat(line) {
        // Format: Date Description (amount embedded in description)
        // Example: "08/11/25 STEAMGAMES.COM $5.00 WA"
        
        const parts = line.split(' ');
        if (parts.length < 2) return null;

        const datePattern = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
        const amountPattern = /^-?\$?\d+\.\d{2}$/;
        
        // Find date
        let dateIndex = -1;
        for (let i = 0; i < parts.length; i++) {
            if (datePattern.test(parts[i])) {
                dateIndex = i;
                break;
            }
        }
        
        if (dateIndex === -1) return null;
        
        // Find amount in the remaining parts
        let amountIndex = -1;
        let amount = null;
        
        for (let i = dateIndex + 1; i < parts.length; i++) {
            if (amountPattern.test(parts[i])) {
                amountIndex = i;
                amount = parts[i];
                break;
            }
        }
        
        if (amountIndex === -1) return null;
        
        // Extract description (everything after date, excluding amount)
        const descriptionParts = parts.slice(dateIndex + 1);
        descriptionParts.splice(amountIndex - dateIndex - 1, 1); // Remove amount from description
        const description = descriptionParts.join(' ').trim();
        
        if (!description) return null;

        return {
            date: this.formatDate(parts[dateIndex]),
            description: this.cleanDescription(description),
            amount: this.parseAmount(amount)
        };
    }

    parseGenericFormat(line) {
        // Fallback: try to extract date, description, and amount from any format
        
        // Look for date patterns
        const dateMatch = line.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/);
        if (!dateMatch) return null;
        
        const date = dateMatch[1];
        
        // Look for amount patterns
        const amountMatch = line.match(/(-?\$?\d+\.\d{2})/);
        if (!amountMatch) return null;
        
        const amount = amountMatch[1];
        
        // Extract description (remove date and amount from line)
        let description = line
            .replace(date, '')
            .replace(amount, '')
            .replace(/\s+/g, ' ')
            .trim();
        
        if (!description) return null;

        return {
            date: this.formatDate(date),
            description: this.cleanDescription(description),
            amount: this.parseAmount(amount)
        };
    }

    formatDate(dateStr) {
        // Convert MM/DD/YY to MM/DD/YYYY if needed
        if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{2}$/)) {
            const [month, day, year] = dateStr.split('/');
            return `${month}/${day}/20${year}`;
        }
        return dateStr;
    }

    cleanDescription(description) {
        // Remove common bank statement artifacts
        return description
            .replace(/^\d{1,2}\/\d{1,2}\/\d{2}\s*/, '') // Remove date at beginning of description
            .replace(/\d{10,}/g, '') // Remove long numbers (account numbers, etc.)
            .replace(/[A-Z]{2}\s*#?\d+/g, '') // Remove state codes with numbers
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    }

    parseAmount(amountStr) {
        // Convert amount string to number
        const cleanAmount = amountStr.replace(/[$,]/g, '');
        const numAmount = parseFloat(cleanAmount);
        
        // Determine if it's a credit or debit
        if (amountStr.startsWith('+')) {
            // Credit transaction (money received)
            return Math.abs(numAmount);
        } else if (amountStr.startsWith('-') || numAmount < 0) {
            // Debit transaction (money spent)
            return -Math.abs(numAmount);
        } else {
            // No sign means debit (money spent)
            return -Math.abs(numAmount);
        }
    }

    displayResults(transactions) {
        const container = document.getElementById('resultsContainer');
        
        if (transactions.length === 0) {
            container.innerHTML = '<p class="no-data">No valid transactions found.</p>';
            return;
        }

        let html = `
            <table class="transaction-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
        `;

        transactions.forEach(transaction => {
            html += `
                <tr>
                    <td>${transaction.date}</td>
                    <td>${transaction.description}</td>
                    <td>$${Math.abs(transaction.amount).toFixed(2)}</td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        
        container.innerHTML = html;
        
        // Store transactions for export
        this.transactions = transactions;
    }

    showExportButtons() {
        document.getElementById('exportButtons').style.display = 'flex';
    }

    copyToClipboard() {
        if (!this.transactions || this.transactions.length === 0) {
            alert('No transactions to copy.');
            return;
        }

        const tsv = this.generateTsv();
        
        // Try to copy as TSV first (better for spreadsheet pasting)
        navigator.clipboard.writeText(tsv).then(() => {
            this.showCopySuccess();
        }).catch(err => {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            this.fallbackCopy(tsv);
        });
    }

    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            this.showCopySuccess();
        } catch (err) {
            alert('Failed to copy to clipboard. Please use the download option instead.');
        }
        document.body.removeChild(textArea);
    }

    showCopySuccess() {
        const copyBtn = document.getElementById('copyCsvBtn');
        const originalText = copyBtn.textContent;
        
        // Change button to show checkmark
        copyBtn.innerHTML = '✓ Copied!';
        copyBtn.classList.add('copy-success');
        
        // Reset after 2 seconds
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.classList.remove('copy-success');
        }, 2000);
    }

    downloadCsv() {
        if (!this.transactions || this.transactions.length === 0) {
            alert('No transactions to download.');
            return;
        }

        const csv = this.generateCsv();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    generateCsv() {
        const rows = this.transactions.map(t => [
            t.date,
            t.description,
            `$${Math.abs(t.amount).toFixed(2)}`
        ]);
        
        // Create CSV without headers and with positive amounts
        return rows
            .map(row => row.join(','))
            .join('\n');
    }

    generateTsv() {
        const rows = this.transactions.map(t => [
            t.date,
            t.description,
            `$${Math.abs(t.amount).toFixed(2)}`
        ]);
        
        // Create TSV (tab-separated values) without headers for better spreadsheet pasting
        return rows
            .map(row => row.join('\t'))
            .join('\n');
    }

    clearInput() {
        document.getElementById('transactionInput').value = '';
        document.getElementById('resultsContainer').innerHTML = '<p class="no-data">No transactions parsed yet. Paste your data and click \'Parse Transactions\'.</p>';
        document.getElementById('exportButtons').style.display = 'none';
        this.transactions = null;
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TransactionParser();
}); 