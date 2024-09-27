
//--------------------------------------------------
// Global flag to track the current view
let isTableView = true; // Track whether we are in table view or grid view

function toggleViewFormat() {
    const dataTable = document.getElementById('dataTable');
    const tableBody = dataTable.querySelector('tbody');

    if (isTableView) {
        // Switch to Grid View
        dataTable.classList.remove('table-view');
        dataTable.classList.add('grid-view');
        isTableView = false;

        // Convert each table row to a grid cell format
        tableBody.childNodes.forEach(row => {
            const gridCell = document.createElement('div');
            gridCell.classList.add('grid-item');

            row.childNodes.forEach(cell => {
                const cellClone = cell.cloneNode(true);
                gridCell.appendChild(cellClone);
            });

            tableBody.appendChild(gridCell);
            row.remove(); // Remove the original table row
        });

    } else {
        // Switch to Table View
        dataTable.classList.remove('grid-view');
        dataTable.classList.add('table-view');
        isTableView = true;

        // Reconstruct the table from the grid format
        const gridItems = Array.from(document.querySelectorAll('.grid-item'));
        gridItems.forEach(gridItem => {
            const tableRow = document.createElement('tr');

            gridItem.childNodes.forEach(gridCell => {
                const cellClone = gridCell.cloneNode(true);
                tableRow.appendChild(cellClone);
            });

            tableBody.appendChild(tableRow);
            gridItem.remove(); // Remove the original grid item
        });
    }
}


function renderGridView() {
    const tableBody = document.querySelector('#dataTable tbody');
    tableBody.innerHTML = ''; // Clear the existing table content

    dataLoaded.forEach(row => {
        const tr = document.createElement('tr');
        tr.classList.add('grid-view-row'); // Use a specific class for grid-view rows

        // Create the cells in grid view format
        const columns = [
            'path_stra', 'path_candle', 'Name', 'Price', 'Net Profit_usd', 'Trade Activity Per Candle', 'n_candles'
        ];

        columns.forEach(column => {
            const td = document.createElement('td');

            if (column === 'path_stra' || column === 'path_candle') {
                // Handle image columns
                td.appendChild(createImageElement(row, column));
            } else {
                td.textContent = row[column] !== undefined ? row[column] : 'N/A';
            }

            tr.appendChild(td);
        });

        tableBody.appendChild(tr);
    });
}

// Helper function to create image elements with proper styles
function createImageElement(row, key) {
    const imgPath = row[key];
    const img = document.createElement('img');
    img.src = imgPath.replace(/\\/g, '/'); // Correct path format
    img.classList.add('grid-image'); // Add a class for specific grid-view styling
    return img;
}


function populateGridView(data) {
    const gridViewContainer = document.getElementById('gridViewContainer');
    gridViewContainer.innerHTML = ''; // Clear any existing elements

    data.forEach(row => {
        const card = document.createElement('div');
        card.classList.add('grid-card');

        // Create image elements for the paths
        const straImg = document.createElement('img');
        straImg.src = row['path_stra'];
        straImg.alt = 'Strategy Image';
        straImg.classList.add('grid-img');

        const candleImg = document.createElement('img');
        candleImg.src = row['path_candle'];
        candleImg.alt = 'Candle Image';
        candleImg.classList.add('grid-img');

        // Add additional information as in S_05 format
        const nameDiv = document.createElement('div');
        nameDiv.classList.add('grid-card-name');
        nameDiv.textContent = row['Name'];

        // Append to the card
        card.appendChild(straImg);
        card.appendChild(candleImg);
        card.appendChild(nameDiv);

        // Add card to the grid container
        gridViewContainer.appendChild(card);
    });
}

function triggerPostLoadActions() {
    console.log("Triggering post-load actions...");
    filterTable(); // Existing table population
    populateGridView(dataLoaded); // Populate the grid view with the same data
}

