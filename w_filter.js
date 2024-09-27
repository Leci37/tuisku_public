// Function to filter only the free ones
function filterOnlyFreeRows(row, headers, display) {
    const onlyFreeChecked = document.getElementById('onlyFreeCheckbox').checked;

    // Use the ID for the Price column header
    const priceColumn = headers['header-price']; // Use the 'header-price' ID
    const td = row.getElementsByTagName('td')[priceColumn];
    if (td) {
        // Eliminar caracteres no numéricos como $ € & % etc.
        const sanitizedValue = td.textContent.replace(/[^0-9.-]+/g, ''); // Mantiene solo números, puntos y el signo negativo
        // Convierte el valor a número
        const priceValue = parseFloat(sanitizedValue);
        // If the checkbox is checked, only show rows with price 0
        if (onlyFreeChecked && priceValue !== 0) {
            display = false;
        }
    }

    return display;
}
// Function to filter only purchased items (BUY)
// Function to filter only purchased items (BUY) based on the Strategy Chart image path
function filterOnlyBuyRows(row, headers, display) {
    const onlyBuyChecked = document.getElementById('onlyBuyCheckbox').checked;

    // Use the ID for the Strategy Chart column header
    const strategyChartColumn = headers['header-strategy-chart']; // Use the 'header-strategy-chart' ID
    const strategyChartCell = row.getElementsByTagName('td')[strategyChartColumn];
    const img = strategyChartCell.querySelector('img');

    if (!img) {
        return display; // If there's no image, skip this row
    }

    // Extract the src path of the image
    let imgSrc = img.src;

    // Extract the file name from the path (assuming it's the last part of the path)
    let fileName = imgSrc.split('/').pop();

    // Remove "_profit.png" from the file name
    fileName = fileName.replace('_profit.png', '');

    // Replace underscores with ' - ' to match the purchaseInfo format
    const purchaseInfo = fileName.replace(/_/g, ' - ');

    // Encode the purchaseInfo to match the cookie key
    const encodedKey = encodeKey(purchaseInfo);

    // Check if the purchase cookie exists exactly (not using startsWith)
    const cookieExists = document.cookie.split('; ').find(cookie => {
        const [cookieKey] = cookie.split('=');
        return cookieKey.trim() === encodedKey; // Exact match for the key
    });

    // If the checkbox is checked and the cookie doesn't exist, hide the row
    if (onlyBuyChecked && !cookieExists) {
        return false;
    }

    return display;
}


// Update filterTable to include "Only Buy" filter
function filterTable() {
    const table = document.getElementById('dataTable');
    const tr = table.getElementsByTagName('tr');
    let visibleRowCount = 0;

    // Get selected dropdown values and headers
    const selectedFilters = getSelectedFilters();
    const headers = getHeaders();  // Ensure headers contain column names and their indexes
    const filters = getFilterConditions(headers);

    for (let i = 1; i < tr.length; i++) {
        let display = true;

        // Apply dropdown and numeric filters
        display = applyDropdownFilters(tr[i], selectedFilters, headers, display);
        display = applyNumericFilters(tr[i], filters, display);

        // Apply "Only the Free Ones" filter
        display = filterOnlyFreeRows(tr[i], headers, display);

        // Apply "Only Buy" filter
        //display = filterOnlyBuyRows(tr[i], headers, display);

        // Set row visibility
        tr[i].style.display = display ? '' : 'none';

        // Count visible rows
        if (display) visibleRowCount++;
    }

    updateVisibleRowCount(visibleRowCount);
    updateDeselectButtons();
}



function getSelectedFilters() {
    return {
        tickers: $('#tickerDropdown').val() || [],
        intervals: $('#intervalDropdown').val() || [],
        keyTechs: $('#keyTechsDropdown').val() || [],
        releaseDates: $('#releaseDateDropdown').val() || [],
        indexes: $('#indexDropdown').val() || []
    };
}

// Updated getHeaders function to use header IDs instead of text
function getHeaders() {
    return Array.from(document.querySelectorAll('#dataTable th')).reduce((acc, th, index) => {
        const headerId = th.id; // Get the ID instead of the text content
        if (headerId) {
            acc[headerId] = index; // Map header ID to its column index
        }
        return acc;
    }, {});
}

function getFilterConditions(headers) {
  // Use the new IDs for the column headers
  const filters = [
    { column: headers['header-net-profit-usd'], min: parseFloat(document.getElementById('profitUsdMinTextbox').value), max: parseFloat(document.getElementById('profitUsdMaxTextbox').value) },
    { column: headers['header-net-profit-percent'], min: parseFloat(document.getElementById('netProfitPerMinTextbox').value), max: parseFloat(document.getElementById('netProfitPerMaxTextbox').value) },
    { column: headers['header-closed-trades'], min: parseFloat(document.getElementById('totalClosedTradesMinTextbox').value), max: parseFloat(document.getElementById('totalClosedTradesMaxTextbox').value) },
    { column: headers['header-win-rate-percent'], min: parseFloat(document.getElementById('percentProfitablePerMinTextbox').value), max: parseFloat(document.getElementById('percentProfitablePerMaxTextbox').value) },
    { column: headers['header-profit-factor'], min: parseFloat(document.getElementById('profitFactorMinTextbox').value), max: parseFloat(document.getElementById('profitFactorMaxTextbox').value) },
    { column: headers['header-max-loss-usd'], min: parseFloat(document.getElementById('maxDrawdownUsdMinTextbox').value), max: parseFloat(document.getElementById('maxDrawdownUsdMaxTextbox').value) },
    { column: headers['header-max-loss-percent'], min: parseFloat(document.getElementById('maxDrawdownPerMinTextbox').value), max: parseFloat(document.getElementById('maxDrawdownPerMaxTextbox').value) },
    { column: headers['header-avg-profit-usd'], min: parseFloat(document.getElementById('avgTradeUsdMinTextbox').value), max: parseFloat(document.getElementById('avgTradeUsdMaxTextbox').value) },
    { column: headers['header-avg-profit-percent'], min: parseFloat(document.getElementById('avgTradePerMinTextbox').value), max: parseFloat(document.getElementById('avgTradePerMaxTextbox').value) },
    { column: headers['header-avg-bars-trade'], min: parseFloat(document.getElementById('avgBarsInTradesMinTextbox').value), max: parseFloat(document.getElementById('avgBarsInTradesMaxTextbox').value) },
    { column: headers['header-price'], min: parseFloat(document.getElementById('priceMinTextbox').value), max: parseFloat(document.getElementById('priceMaxTextbox').value) },
    { column: headers['header-training-months'], min: parseFloat(document.getElementById('trainingMonthsMinTextbox').value), max: parseFloat(document.getElementById('trainingMonthsMaxTextbox').value) },
    { column: headers['header-trade-activity'], min: parseFloat(document.getElementById('activityPerCandleMinTextbox').value), max: parseFloat(document.getElementById('activityPerCandleMaxTextbox').value) },
    { column: headers['header-n-candles'], min: parseFloat(document.getElementById('nCandlesMinTextbox').value), max: parseFloat(document.getElementById('nCandlesMaxTextbox').value) }
  ];
  return filters;
}


function applyDropdownFilters(row, selectedFilters, headers, display) {
    const columns = {
        ticker: row.getElementsByTagName('td')[headers['header-symbol']],
        interval: row.getElementsByTagName('td')[headers['header-time-frame']],
        keyTech: row.getElementsByTagName('td')[headers['header-indicators']],
        releaseDate: row.getElementsByTagName('td')[headers['header-release-date']],
        index: row.getElementsByTagName('td')[headers['header-index']]
    };

    return display &&
        applyFilter(columns.ticker, selectedFilters.tickers) &&
        applyFilter(columns.interval, selectedFilters.intervals) &&
        applyFilter(columns.keyTech, selectedFilters.keyTechs) &&
        applyFilter(columns.releaseDate, selectedFilters.releaseDates) &&
        applyFilter(columns.index, selectedFilters.indexes);
}
function applyFilter(column, selectedValues) {
    if (column && selectedValues.length > 0 && selectedValues.includes(column.textContent)){
         return true
    }
        return false;
}

function applyNumericFilters(row, filters, display) {
    filters.forEach(filter => {
        const td = row.getElementsByTagName('td')[filter.column];
        if (td) {
            // Eliminar caracteres no numéricos como $ € & % etc.
            const sanitizedValue = td.textContent.replace(/[^0-9.-]+/g, ''); // Mantiene solo números, puntos y el signo negativo
            // Convierte el valor a número
            const value = parseFloat(sanitizedValue);
            // Aplica los filtros min y max
            if (value < filter.min || value > filter.max) {
                display = false;
            }
        }
    });
    return display;
}

function updateVisibleRowCount(count) {
    document.getElementById('visibleRowCount').textContent = count;
}

// Function to update all Deselect All buttons and associated Select All buttons
function updateDeselectButtons() {
    toggleDeselectButton('#tickerDropdown', '#tickerDeselectAll', '#tickerSelectAll');
    toggleDeselectButton('#intervalDropdown', '#intervalDeselectAll', '#intervalSelectAll');
    toggleDeselectButton('#keyTechsDropdown', '#keyTechsDeselectAll', '#keyTechsSelectAll');
    toggleDeselectButton('#releaseDateDropdown', '#releaseDateDeselectAll', '#releaseDateSelectAll');
    toggleDeselectButton('#indexDropdown', '#indexDeselectAll', '#indexSelectAll');
    console.log("Deselect buttons updated.");
}
// Function to disable or enable the Deselect All button based on selections
function toggleDeselectButton(dropdownId, buttonId, selectAllButtonId) {
  const selectedOptions = $(dropdownId).val() || [];
  const deselectButton = document.querySelector(buttonId);
  const selectAllButton = document.querySelector(selectAllButtonId); // Select All button

  if (selectedOptions.length === 0) {
    deselectButton.disabled = true;
    deselectButton.classList.add('disabled-button');
    deselectButton.style.backgroundColor = '#808080'; // Grey when disabled
    deselectButton.style.color = '#fff'; // White text for contrast

    // Add green outline to Select All button
    selectAllButton.style.outline = '2px solid #32CD32'; // Lime green
  } else {
    deselectButton.disabled = false;
    deselectButton.classList.remove('disabled-button');
    deselectButton.style.backgroundColor = ''; // Reset to original background
    deselectButton.style.color = ''; // Reset to original color

    // Remove green outline from Select All button
    selectAllButton.style.outline = ''; // Reset to default
  }
}


// Sort the table based on the clicked column index
function sortTable(columnIndex) {
    const table = document.getElementById('dataTable');
    const tbody = table.getElementsByTagName('tbody')[0];
    const rows = Array.from(tbody.getElementsByTagName('tr'));

    // Remove active sort state from all headers
    const thElements = table.querySelectorAll('th');
    thElements.forEach(th => {
        th.removeAttribute('data-active');
        th.removeAttribute('data-sorted'); // Remove sort direction indicator
    });

    // Determine if we need to sort in ascending or descending order
    const isNumericColumn = !isNaN(rows[0].getElementsByTagName('td')[columnIndex].textContent);
    const isAscending = tbody.getAttribute('data-sorted') !== `col${columnIndex}-asc`;

    // Sort the rows
    rows.sort((a, b) => {
        const aValue = a.getElementsByTagName('td')[columnIndex].textContent.trim();
        const bValue = b.getElementsByTagName('td')[columnIndex].textContent.trim();

        if (isNumericColumn) {
            return isAscending ? parseFloat(aValue) - parseFloat(bValue) : parseFloat(bValue) - parseFloat(aValue);
        } else {
            return isAscending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
    });

    // Clear the table body and re-append the sorted rows
    tbody.innerHTML = '';
    rows.forEach(row => tbody.appendChild(row));

    // Set active column to show the arrow
    const sortedDirection = isAscending ? 'asc' : 'desc';
    thElements[columnIndex].setAttribute('data-active', 'true');
    thElements[columnIndex].setAttribute('data-sorted', sortedDirection);

    // Toggle the sort direction
    tbody.setAttribute('data-sorted', `col${columnIndex}-${sortedDirection}`);
}

// Function to reset all filters to their original values, including slider updates
function resetFilters() {
    // Reset checkboxes
    document.getElementById('onlyFreeCheckbox').checked = false;
    //document.getElementById('onlyBuyCheckbox').checked = false;

    // Reset numeric ranges to their initial values and sliders
    resetRangeWithSlider('profitUsd', 0, 22000);
    resetRangeWithSlider('price', 0.0, 199.0);
    resetRangeWithSlider('netProfitPer', 0.00, 3.00);
    resetRangeWithSlider('totalClosedTrades', 0, 3000);
    resetRangeWithSlider('percentProfitablePer', 0.0, 100.0);
    resetRangeWithSlider('profitFactor', 0, 2000);
    resetRangeWithSlider('trainingMonths', 0, 400);
    resetRangeWithSlider('maxDrawdownUsd', 0, 3000);
    resetRangeWithSlider('maxDrawdownPer', 0.0, 2.0);
    resetRangeWithSlider('avgTradeUsd', 0.0, 400.0);
    resetRangeWithSlider('avgTradePer', 0.0, 4000.0);
    resetRangeWithSlider('avgBarsInTrades', 0.0, 2000.0);

    // Reset numeric ranges and sliders for new filters
    resetRangeWithSlider('activityPerCandle', 0.0, 10.0);
    resetRangeWithSlider('nCandles', 0, 500000);

    // Reset multi-select dropdowns (select all options)
    selectAll('#tickerDropdown');       // Use selectAll() helper method for dropdowns
    selectAll('#intervalDropdown');
    selectAll('#keyTechsDropdown');
    selectAll('#indexDropdown');
    selectAll('#releaseDateDropdown');

    // Call filterTable to apply the reset values
    filterTable();
}

// Helper function to reset both range inputs and slider values
function resetRangeWithSlider(idPrefix, minValue, maxValue) {
    // Reset the text input fields
    document.getElementById(`${idPrefix}MinTextbox`).value = minValue;
    document.getElementById(`${idPrefix}MaxTextbox`).value = maxValue;

    // Reset the slider bar values
    $(`#slider-range-${idPrefix}`).slider("values", [minValue, maxValue]); // jQuery UI slider
}

// Helper function to reset multi-select dropdowns
//function resetMultiSelect(dropdownId) {
//    const dropdown = document.querySelector(dropdownId);
//    const options = dropdown && dropdown.options;
//    if (options) {
//        for (let i = 0; i < options.length; i++) {
//            options[i].selected = true; // Select all options
//        }
//    }
//
//    // Update the dropdown to reflect the selection
//    $(dropdownId).trigger('change');
//}
