class TransactionParser extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.transactions = [];
        this.render();
        this.initializeEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                :host {
                    display: block;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f8f9fa;
                }

                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }

                header {
                    text-align: center;
                    margin-bottom: 40px;
                    padding: 30px 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 12px;
                    margin: -20px -20px 40px -20px;
                }

                header h1 {
                    font-size: 2.5rem;
                    margin-bottom: 10px;
                    font-weight: 700;
                }

                header p {
                    font-size: 1.1rem;
                    opacity: 0.9;
                }

                main {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    margin-bottom: 40px;
                }

                .input-section, .output-section {
                    background: white;
                    padding: 25px;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e9ecef;
                }

                .input-section h2, .output-section h2 {
                    color: #2c3e50;
                    margin-bottom: 20px;
                    font-size: 1.5rem;
                    border-bottom: 2px solid #667eea;
                    padding-bottom: 10px;
                }

                textarea {
                    width: 100%;
                    padding: 15px;
                    border: 2px solid #e9ecef;
                    border-radius: 8px;
                    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                    font-size: 14px;
                    line-height: 1.4;
                    resize: vertical;
                    transition: border-color 0.3s ease;
                }

                textarea:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                .button-group {
                    display: flex;
                    gap: 15px;
                    margin-top: 20px;
                }

                .btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-decoration: none;
                    display: inline-block;
                    text-align: center;
                }

                .btn-primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
                }

                .btn-secondary {
                    background: #6c757d;
                    color: white;
                }

                .btn-secondary:hover {
                    background: #5a6268;
                    transform: translateY(-2px);
                }

                .btn-success {
                    background: #28a745;
                    color: white;
                }

                .btn-success:hover {
                    background: #218838;
                    transform: translateY(-2px);
                }

                .results-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .results-table th {
                    background: #667eea;
                    color: white;
                    padding: 15px;
                    text-align: left;
                    font-weight: 600;
                }

                .results-table td {
                    padding: 12px 15px;
                    border-bottom: 1px solid #e9ecef;
                }

                .results-table tr:nth-child(even) {
                    background: #f8f9fa;
                }

                .results-table tr:hover {
                    background: #e9ecef;
                }

                .export-buttons {
                    margin-top: 20px;
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                }

                .btn-copy {
                    background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
                    color: white;
                    transition: all 0.3s ease;
                }

                .btn-copy:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(23, 162, 184, 0.3);
                }

                .btn-copy.copied {
                    background: linear-gradient(135deg, #28a745 0%, #218838 100%);
                    transform: scale(1.05);
                }

                .no-data {
                    text-align: center;
                    color: #6c757d;
                    font-style: italic;
                    padding: 40px 20px;
                }

                .copy-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #28a745;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 600;
                    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                    z-index: 1000;
                }

                .copy-notification.show {
                    transform: translateX(0);
                }

                .copy-notification .checkmark {
                    width: 20px;
                    height: 20px;
                    border: 2px solid white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }

                .copy-notification .checkmark::after {
                    content: '';
                    width: 6px;
                    height: 10px;
                    border: solid white;
                    border-width: 0 2px 2px 0;
                    transform: rotate(45deg);
                    position: absolute;
                    top: 2px;
                    left: 5px;
                }

                .instructions {
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e9ecef;
                    margin-top: 40px;
                }

                .instructions h2 {
                    color: #2c3e50;
                    margin-bottom: 20px;
                    font-size: 1.8rem;
                    border-bottom: 2px solid #667eea;
                    padding-bottom: 10px;
                }

                .instructions ol {
                    margin-left: 20px;
                    margin-bottom: 20px;
                }

                .instructions li {
                    margin-bottom: 10px;
                    line-height: 1.8;
                }

                .supported-formats h3 {
                    color: #2c3e50;
                    margin: 20px 0 15px 0;
                    font-size: 1.3rem;
                }

                .supported-formats ul {
                    margin-left: 20px;
                }

                .supported-formats li {
                    margin-bottom: 8px;
                    line-height: 1.6;
                }

                @media (max-width: 768px) {
                    main {
                        grid-template-columns: 1fr;
                        gap: 20px;
                    }
                    
                    .container {
                        padding: 15px;
                    }
                    
                    header h1 {
                        font-size: 2rem;
                    }
                    
                    .button-group {
                        flex-direction: column;
                    }
                    
                    .export-buttons {
                        flex-direction: column;
                    }
                }
            </style>
            
            <div class="container">
                <header>
                    <h1>Credit Card Transaction Cleaner</h1>
                    <p>Clean and format your bank transaction data easily</p>
                </header>
                
                <main>
                    <div class="input-section">
                        <h2>Input Transaction Data</h2>
                        <textarea 
                            id="transactionInput" 
                            placeholder="Paste your bank transactions here..."
                            rows="10"
                        ></textarea>
                        <div class="button-group">
                            <button id="parseBtn" class="btn btn-primary">Parse Transactions</button>
                            <button id="clearBtn" class="btn btn-secondary">Clear</button>
                        </div>
                    </div>
                    
                    <div class="output-section">
                        <h2>Cleaned Results</h2>
                        <div id="resultsContainer">
                            <p class="no-data">No transactions parsed yet. Paste your data and click 'Parse Transactions'.</p>
                        </div>
                        <div id="exportButtons" class="export-buttons" style="display: none;">
                            <button id="copyCsvBtn" class="btn btn-copy">Copy Data</button>
                        </div>
                    </div>
                </main>

                <section class="instructions">
                    <h2>How to Use</h2>
                    <ol>
                        <li>Copy transaction data from your bank statement or app</li>
                        <li>Paste it into the input area above</li>
                        <li>Click "Parse Transactions" to clean and format the data</li>
                        <li>Use "Copy Data" to export your cleaned data</li>
                    </ol>
                    
                    <div class="supported-formats">
                        <h3>Supported Formats</h3>
                        <ul>
                            <li>5-column: Transaction Date, Posting Date, Description, Amount, Running Balance</li>
                            <li>3-column: Date, Description, Amount</li>
                            <li>2-column: Date, Description (amount embedded in description)</li>
                        </ul>
                    </div>
                </section>
            </div>
        `;
    }

    initializeEventListeners() {
        this.shadowRoot.getElementById('parseBtn').addEventListener('click', () => this.parseTransactions());
        this.shadowRoot.getElementById('clearBtn').addEventListener('click', () => this.clearInput());
        this.shadowRoot.getElementById('copyCsvBtn').addEventListener('click', () => this.copyToClipboard());
    }

    parseTransactions() {
        const input = this.shadowRoot.getElementById('transactionInput').value.trim();
        if (!input) {
            alert('Please enter some transaction data to parse.');
            return;
        }

        const lines = input.split('\n').filter(line => line.trim());
        const transactions = [];
        
        let currentTransaction = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (this.isTransactionStart(line)) {
                if (currentTransaction) {
                    const parsed = this.parseTransactionGroup(currentTransaction);
                    if (parsed) transactions.push(parsed);
                }
                
                currentTransaction = [line];
            } else if (currentTransaction) {
                currentTransaction.push(line);
            }
        }
        
        if (currentTransaction) {
            const parsed = this.parseTransactionGroup(currentTransaction);
            if (parsed) transactions.push(parsed);
        }

        if (transactions.length === 0) {
            alert('No valid transactions found. Please check your input format.');
            return;
        }

        this.transactions = transactions;
        this.displayResults(transactions);
        this.showExportButtons();
    }

    isTransactionStart(line) {
        const datePattern = /^\d{1,2}\/\d{1,2}\/\d{2}/;
        return datePattern.test(line);
    }

    parseTransactionGroup(transactionLines) {
        const fullTransaction = transactionLines.join(' ');
        
        let transaction = this.parseBankStatementFormat(fullTransaction);
        
        if (!transaction) {
            transaction = this.parse5ColumnFormat(fullTransaction) ||
                         this.parse3ColumnFormat(fullTransaction) ||
                         this.parse2ColumnFormat(fullTransaction) ||
                         this.parseGenericFormat(fullTransaction);
        }

        if (transaction && transaction.description.toLowerCase().includes('online payment thank you')) {
            return null;
        }

        return transaction;
    }

    parseBankStatementFormat(line) {
        const datePattern = /\b\d{1,2}\/\d{1,2}\/\d{2}\b/g;
        const dates = line.match(datePattern);
        
        if (!dates || dates.length < 2) return null;
        
        const transactionDate = dates[0];
        const postingDate = dates[1];
        
        const amountPattern = /\$[\d,]+\.\d{2}/g;
        const amounts = line.match(amountPattern);
        
        if (!amounts || amounts.length < 2) return null;
        
        const transactionAmount = amounts[0];
        const balance = amounts[1];
        
        // Find the description by looking for content between the first date and the first amount
        const firstDateEnd = line.indexOf(transactionDate) + transactionDate.length;
        const firstAmountStart = line.indexOf(transactionAmount);
        
        if (firstDateEnd >= firstAmountStart) return null;
        
        let description = line.substring(firstDateEnd, firstAmountStart).trim();
        description = this.cleanDescription(description);
        
        const amount = parseFloat(transactionAmount.replace('$', '').replace(',', ''));
        
        return {
            date: this.formatDate(transactionDate),
            description: description,
            amount: amount
        };
    }

    parse5ColumnFormat(line) {
        const parts = line.split(/\s+/);
        if (parts.length < 5) return null;
        
        const date = parts[0];
        const description = parts.slice(2, -2).join(' ');
        const amount = parts[parts.length - 2];
        
        if (!this.isValidDate(date) || !this.isValidAmount(amount)) return null;
        
        return {
            date: this.formatDate(date),
            description: this.cleanDescription(description),
            amount: parseFloat(amount.replace('$', '').replace(',', ''))
        };
    }

    parse3ColumnFormat(line) {
        const parts = line.split(/\s+/);
        if (parts.length < 3) return null;
        
        const date = parts[0];
        const description = parts.slice(1, -1).join(' ');
        const amount = parts[parts.length - 1];
        
        if (!this.isValidDate(date) || !this.isValidAmount(amount)) return null;
        
        return {
            date: this.formatDate(date),
            description: this.cleanDescription(description),
            amount: parseFloat(amount.replace('$', '').replace(',', ''))
        };
    }

    parse2ColumnFormat(line) {
        const parts = line.split(/\s+/);
        if (parts.length < 2) return null;
        
        const date = parts[0];
        const descriptionWithAmount = parts.slice(1).join(' ');
        
        const amountMatch = descriptionWithAmount.match(/\$[\d,]+\.\d{2}/);
        if (!amountMatch) return null;
        
        const amount = amountMatch[0];
        const description = descriptionWithAmount.replace(amount, '').trim();
        
        if (!this.isValidDate(date)) return null;
        
        return {
            date: this.formatDate(date),
            description: this.cleanDescription(description),
            amount: parseFloat(amount.replace('$', '').replace(',', ''))
        };
    }

    parseGenericFormat(line) {
        const dateMatch = line.match(/\b\d{1,2}\/\d{1,2}\/\d{2}\b/);
        const amountMatch = line.match(/\$[\d,]+\.\d{2}/);
        
        if (!dateMatch || !amountMatch) return null;
        
        const date = dateMatch[0];
        const amount = amountMatch[0];
        
        const descriptionStart = line.indexOf(date) + date.length;
        const descriptionEnd = line.indexOf(amount);
        
        if (descriptionStart >= descriptionEnd) return null;
        
        let description = line.substring(descriptionStart, descriptionEnd).trim();
        description = this.cleanDescription(description);
        
        return {
            date: this.formatDate(date),
            description: description,
            amount: parseFloat(amount.replace('$', '').replace(',', ''))
        };
    }

    cleanDescription(description) {
        return description
            .replace(/\b\d{10,}\b/g, '') // Remove long numbers (account numbers)
            .replace(/\b[A-Z]{2,3}\s+#\d+\b/g, '') // Remove reference codes like "WA #123456"
            .replace(/\b[A-Z]{2,3}\s+\d{8,}\b/g, '') // Remove other reference patterns
            .replace(/#[A-Z0-9]{8,}/g, '') // Remove long transaction numbers with # symbol (8+ characters)
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    }

    isValidDate(dateStr) {
        // More flexible date pattern that accepts various formats
        const datePattern = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
        return datePattern.test(dateStr);
    }

    isValidAmount(amountStr) {
        // More flexible amount pattern that accepts various formats
        const amountPattern = /^\$?[\d,]+\.\d{2}$/;
        return amountPattern.test(amountStr);
    }

    formatDate(dateStr) {
        const [month, day, year] = dateStr.split('/');
        const fullYear = year.length === 2 ? `20${year}` : year;
        return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${fullYear}`;
    }

    displayResults(transactions) {
        const container = this.shadowRoot.getElementById('resultsContainer');
        
        const table = document.createElement('table');
        table.className = 'results-table';
        
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['Date', 'Description', 'Amount'].forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        const tbody = document.createElement('tbody');
        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            
            const dateCell = document.createElement('td');
            dateCell.textContent = transaction.date;
            row.appendChild(dateCell);
            
            const descCell = document.createElement('td');
            descCell.textContent = transaction.description;
            row.appendChild(descCell);
            
            const amountCell = document.createElement('td');
            amountCell.textContent = `$${transaction.amount.toFixed(2)}`;
            amountCell.style.color = transaction.amount >= 0 ? '#28a745' : '#dc3545';
            row.appendChild(amountCell);
            
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        
        container.innerHTML = '';
        container.appendChild(table);
    }

    showExportButtons() {
        this.shadowRoot.getElementById('exportButtons').style.display = 'flex';
    }

    clearInput() {
        this.shadowRoot.getElementById('transactionInput').value = '';
        this.shadowRoot.getElementById('resultsContainer').innerHTML = '<p class="no-data">No transactions parsed yet. Paste your data and click \'Parse Transactions\'.</p>';
        this.shadowRoot.getElementById('exportButtons').style.display = 'none';
        this.transactions = [];
    }

    copyToClipboard() {
        if (!this.transactions || this.transactions.length === 0) {
            alert('No transactions to copy.');
            return;
        }

        const csvContent = this.generateCsv();
        const copyButton = this.shadowRoot.getElementById('copyCsvBtn');
        
        navigator.clipboard.writeText(csvContent).then(() => {
            // Animate the button to green
            copyButton.classList.add('copied');
            copyButton.textContent = 'Copied!';
            
            // Reset after 2 seconds
            setTimeout(() => {
                copyButton.classList.remove('copied');
                copyButton.textContent = 'Copy Data';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            this.fallbackCopy(csvContent);
        });
    }

    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        // Animate the button to green
        const copyButton = this.shadowRoot.getElementById('copyCsvBtn');
        copyButton.classList.add('copied');
        copyButton.textContent = 'Copied!';
        
        // Reset after 2 seconds
        setTimeout(() => {
            copyButton.classList.remove('copied');
            copyButton.textContent = 'Copy Data';
        }, 2000);
    }

    generateCsv() {
        // Only include transaction data, no headers
        const rows = this.transactions.map(t => [t.date, t.description, `$${t.amount.toFixed(2)}`]);
        
        // Use tab-separated values for better spreadsheet compatibility
        const csvContent = rows.map(row => row.join('\t')).join('\n');
        return csvContent;
    }
}

customElements.define('transaction-parser', TransactionParser); 
