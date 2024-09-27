// Main function to initialize the column toggle functionality
function initializeColumnToggleHideColumns() {
    initializeColumnCheckboxes();
    bindCheckboxEvents();
}

// Function to initialize checkboxes based on table headers
// Function to initialize checkboxes based on table headers
function initializeColumnCheckboxes() {
    const tableHeaders = $('#dataTable th');
    const checkboxContainer = $('#column-toggle-container');
    checkboxContainer.empty(); // Clear the container

    // List of columns that should not have checkboxes (like "Shop")
    const excludedColumns = ['Shop'];

    // List of columns that should be unchecked by default
    const uncheckedColumns = [
        'Indicators','Symbol', 'Max Loss ($)', 'Max Loss (%)', 'Profit Factor', 'Avg Bars/Trade', 'Numbers candles', 'Months trained'
    ];

    tableHeaders.each(function(index) {
        const columnName = $(this).text();

        // Skip generating a checkbox for the "Shop" column
        if (excludedColumns.includes(columnName)) {
            return; // Skip the "Shop" column
        }

        // Create a div to wrap the checkbox and label
        const checkboxWrapper = createCheckboxWrapper(index, columnName, uncheckedColumns);

        // Append the wrapper div to the container
        checkboxContainer.append(checkboxWrapper);

        // Apply initial column visibility based on checkbox state
        const checkbox = checkboxWrapper.find('input[type="checkbox"]');
        toggleColumnVisibility(index, checkbox.is(':checked'));
    });
}


// Function to create a checkbox wrapper (div) with a checkbox and label
function createCheckboxWrapper(index, columnName, uncheckedColumns) {
    // Create a div to wrap the checkbox and label
    const checkboxWrapper = $('<div>', {
        class: 'checkbox-wrapper' // Add a class for custom styling
    });

    // Create a checkbox for each column
    const checkbox = $('<input>', {
        type: 'checkbox',
        id: `column-toggle-${index}`,
        'data-column-index': index,
        checked: !uncheckedColumns.includes(columnName) // Uncheck if the column is in the list
    });

    // Create a label for the checkbox
    const label = $('<label>', {
        for: `column-toggle-${index}`,
        text: columnName
    });

    // Append the checkbox and label inside the wrapper div
    checkboxWrapper.append(checkbox).append(label);

    return checkboxWrapper;
}

// Function to bind the checkbox change events to show/hide columns
function bindCheckboxEvents() {
    $('#column-toggle-container input[type="checkbox"]').change(function() {
        const columnIndex = $(this).data('column-index');
        toggleColumnVisibility(columnIndex, $(this).is(':checked'));
    });
}

// Function to show/hide the columns based on checkbox state
function toggleColumnVisibility(columnIndex, isVisible) {
    const th = $(`#dataTable th:nth-child(${columnIndex + 1})`);
    const td = $(`#dataTable td:nth-child(${columnIndex + 1})`);

    if (isVisible) {
        th.show();
        td.show();
    } else {
        th.hide();
        td.hide();
    }
}





function saveColumnPreferences() {
    const preferences = {};
    $('#column-toggle-container input[type=checkbox]').each(function() {
        preferences[$(this).data('column-index')] = $(this).is(':checked');
    });
    localStorage.setItem('columnPreferences', JSON.stringify(preferences));
}

function loadColumnPreferences() {
    const preferences = JSON.parse(localStorage.getItem('columnPreferences'));
    if (preferences) {
        $.each(preferences, function(index, isVisible) {
            $(`#column-toggle-${index}`).prop('checked', isVisible).trigger('change');
        });
    }
}

// Call save function whenever a checkbox changes
$('#column-toggle-container input[type=checkbox]').on('change', saveColumnPreferences);

// Call load function on page load
$(document).ready(function() {
    loadColumnPreferences();
});
