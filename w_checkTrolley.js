function checkTrolley() {
    // Open a new tab
    const newWindow = window.open('', '_blank');

    // Begin generating HTML for the new tab
    let html = `
    <html>
    <head>
        <title>Your Shopping Cart</title>
        <link rel="stylesheet" href="w_wtable.css"> <!-- Link to table styles -->
    </head>
    <body>
        <h1>Your Shopping Cart</h1>
        <div style=" max-width: 88%;    display: inline-flex; align-items: center;">
        <table id="dataTable">
            <thead>
                <tr>
                    <th id="header-price" onclick="sortTable(1)">Price</th>
                    <th id="header-name" onclick="sortTable(2)">Name</th>
                    <th id="header-time-frame" onclick="sortTable(3)">Time frame</th>
                    <th id="header-strategy-chart">Strategy Chart</th> <!-- Not sortable -->
                    <th id="header-candle-chart">Candle Chart</th> <!-- Not sortable -->
                    <th id="header-net-profit-usd" onclick="sortTable(6)">Net Profit ($)</th>
                    <th id="header-indicators" onclick="sortTable(7)">Indicators</th>
                    <th id="header-index" onclick="sortTable(8)">Index</th>
                    <th id="header-symbol" onclick="sortTable(9)">Symbol</th>
                    <th id="header-win-rate-percent" onclick="sortTable(12)">Win Rate (%)</th>
                    <th id="header-release-date" onclick="sortTable(19)">Release Date</th>
                    <th id="header-training-months" onclick="sortTable(20)">Training (Months)</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Check for cookies and add only rows with "BUY" cookies
    const cookies = document.cookie.split('; ').filter(cookie => cookie.includes('Tuisku_S_'));

    // Define the columns for the shopping cart
    const columns = [
        'Price', 'Name', 'interval', 'path_stra', 'path_candle',
        'Net Profit_usd', 'key_techs', 'Index', 'ticker',
        'Percent Profitable_per', 'Release date', 'months_trained'
    ];

    // Iterate through cookies and populate the table with purchased items
    cookies.forEach(cookie => {
        const purchaseKey = decodeKey(cookie.split('=')[0]); // Decode the key
        const rowData = getRowData(purchaseKey); // Fetch row data based on the purchaseKey

        if (rowData) {
            let tr = '<tr>';

            // Loop through the specified columns and handle each one with the appropriate method
            columns.forEach(key => {
                let td;
                // Special handling for the Name column
                if (key === 'Name') {
                    td = handleNameColumn(rowData);
                }
                // Handling images for 'path_stra' and 'path_candle'
                else if (key === 'path_candle' || key === 'path_stra') {
                    td = handleImageColumn(rowData, key);
                }
                // Default handling for other columns
                else {
                    td = document.createElement('td');
                    td.textContent = rowData[key] !== undefined ? rowData[key] : 'N/A';
                }

                // Add the td element to the row
                tr += td.outerHTML;
            });

            tr += '</tr>'; // Close the table row
            html += tr; // Add the row to the table body
        }
    });

    // Close the table and body
    html += `
            </tbody>
        </table>
    </body>
    </html>
    `;

    // Write the generated HTML into the new window
    newWindow.document.write(html);
    newWindow.document.close(); // Ensure the document is finished loading
}



function getRowData(purchaseKey) {
    // Assuming 'data' contains the full dataset of rows, similar to the loadData function
    return data.find(row => {
        const purchaseInfo = `${row['ticker']} - ${row['interval']} - ${row['key_techs']} - ${row['id_model']}`;
        return purchaseInfo === purchaseKey;
    });
}
