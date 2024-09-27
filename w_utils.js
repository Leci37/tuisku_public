

// Select All function for fSelect dropdown
function selectAll(dropdownId) {
  $(dropdownId).find('option').prop('selected', true);
  $(dropdownId).fSelect('reload'); // Reload fSelect to reflect the selected options
  filterTable(); // Update the table with the selected values
}

// Deselect All function for fSelect dropdown
function deselectAll(dropdownId) {
  $(dropdownId).find('option').prop('selected', false);
  $(dropdownId).fSelect('reload'); // Reload fSelect to reflect the deselected options
  filterTable(); // Update the table with the deselected values
}


let sortDirections = {}; // To keep track of the sort direction for each column

// Main function to handle sorting the table
function sortTable(columnIndex) {
    const table = document.getElementById('dataTable');
    const tbody = table.getElementsByTagName('tbody')[0];
    const rowsArray = Array.from(tbody.getElementsByTagName('tr'));
    const isNumericColumn = columnIndex === 5 || columnIndex === 9 || columnIndex === 10 || columnIndex === 11 || columnIndex === 12 || columnIndex === 13 || columnIndex === 14 || columnIndex === 15 || columnIndex === 16 || columnIndex === 17 || columnIndex === 19|| columnIndex === 22 || columnIndex === 23;

    // Initialize the sorting direction for the column if it doesn't exist
    if (!sortDirections[columnIndex]) {
        sortDirections[columnIndex] = 1; // 1 for ascending, -1 for descending
    }

    // Toggle the sorting direction
    sortDirections[columnIndex] = -sortDirections[columnIndex];

    // Sort rows based on the content of the specified column
    rowsArray.sort(function (rowA, rowB) {
        const cellA = rowA.getElementsByTagName('td')[columnIndex].innerText.trim();
        const cellB = rowB.getElementsByTagName('td')[columnIndex].innerText.trim();

        let comparison = 0;
        if (isNumericColumn) {
            // Compare as numbers
            comparison = parseFloat(cellA) - parseFloat(cellB);
        } else {
            // Compare as strings (case-insensitive)
            comparison = cellA.localeCompare(cellB, undefined, { numeric: true });
        }

        return comparison * sortDirections[columnIndex];
    });

    // Append sorted rows back to the tbody
    rowsArray.forEach(row => tbody.appendChild(row));
}


// Function to handle the file download for FREE items
// Function to handle the click event for FREE downloads
function handleFreeClick(row, td) {
    showTemporaryText(td, "Downloading " + `${row['ticker']}`);

    const filePath = row['pine_path_shadow'];
    const newFileName = `Tuisku_TraderView_${row['ticker']} - ${row['interval']} - ${row['key_techs']}.pine`;

    // Create a link element to trigger the download
    const downloadLink = document.createElement('a');
    downloadLink.href = filePath; // Set the file path
    downloadLink.download = newFileName; // Set the new file name
    document.body.appendChild(downloadLink);
    downloadLink.click(); // Trigger the download
    document.body.removeChild(downloadLink); // Remove the link after download

    // Change icon color to indicate the download
    const icon_free = td.querySelector('i');
    icon_free.style.color = '#75acb4'; // Change to a success green color
    const spam_free = td.querySelector('spam');
    icon_free.style.color = '#75acb4'; // Change to a success green color
}

// Function to handle the Buy click event with cookie toggle functionality
function handleBuyClick(row, td) {
    const purchaseInfo = `${row['ticker']} - ${row['interval']} - ${row['key_techs']} - ${row['id_model']}`;
    const browserId = getBrowserId();
    const cookieName = `${browserId}_shop`;
    const encodedPurchaseInfo = encodeValue(purchaseInfo); // Encrypt/Obfuscate the purchase info

    // Check if the cookie already exists
    const cookieExists = document.cookie.split('; ').find(row => row.startsWith(`${cookieName}=`));

    if (!cookieExists) {
        // Add the cookie and change the styles
        document.cookie = `${cookieName}=${encodedPurchaseInfo}; path=/; max-age=86400`; // Set cookie for 1 day
        td.style.backgroundColor = '#FFD700'; // Change background to gold
        const icon = td.querySelector('i');
        icon.style.color = '#FFD700'; // Change icon to gold
    } else {
        // Remove the cookie and revert the styles
        document.cookie = `${cookieName}=; path=/; max-age=0`; // Delete the cookie
        td.style.backgroundColor = ''; // Revert background color
        const icon = td.querySelector('i');
        icon.style.color = '#3BAF75'; // Revert icon color to original
    }
}




// Function to get or generate a unique computer-browser ID
function getBrowserId() {
    const storedId = localStorage.getItem('browserId');
    if (storedId) {
        return storedId;
    }

    // Combine timestamp and random value to create a unique ID
    const timestamp = Date.now().toString(36); // Current time in base36
    const randomValue = Math.random().toString(36).substr(2, 9); // Random part

    const newId = 'browser_' + timestamp + randomValue;
    localStorage.setItem('browserId', newId);
    return newId;
}


// Helper function to encode the cookie key (URL-safe Base64 encoding)
function encodeKey(key) {
    // Trim the input to remove extra spaces and encode to Base64, then make it URL-safe
    return btoa(key.trim()).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Helper function to decode the cookie key (URL-safe Base64 decoding)
function decodeKey(encodedKey) {
    // Replace URL-safe characters back to original Base64 characters
    let key = encodedKey.replace(/-/g, '+').replace(/_/g, '/');
    // Decode Base64 and return the result
    return atob(key);
}

// Helper function to generate a random session ID
function generateSessionID(length = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let sessionId = '';
    for (let i = 0; i < length; i++) {
        sessionId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return sessionId;
}


// Get unique Name, Ticker, and Icon pairs
function getUniqueTickerNamePairs(data) {
    const uniquePairs = {};
    data.forEach(row => {
        const ticker = row['ticker'];
        const name = row['Name'];
        const iconPath = row['path_ico'];  // Extract icon path

        if (!uniquePairs[ticker]) {
            uniquePairs[ticker] = { name: name, iconPath: iconPath };  // Associate ticker with name and icon
        }
    });
    return uniquePairs;
}


function generateTradingViewPath(row) {
    const ticker = row['ticker'];
    const index = row['Index'];

    if (!ticker || !index) {
        console.error("Ticker or Index is missing in the row data.");
        return '';
    }

    // Format the TradingView URL
    const tradingViewUrl = `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(index)}%3A${encodeURIComponent(ticker)}`;

    return tradingViewUrl;
}



// Utility function to format currency
function formatCurrency(value) {
    if (!isNaN(value)) {
        return `$${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }
    return 'N/A';
}

// Utility function to format percentages
function formatPercentage(value) {
    if (!isNaN(value)) {
        return `${parseFloat(value).toFixed(2)}%`;
    }
    return 'N/A';
}


// Temporary Text Display

// Displays a temporary message (e.g., "Item added to cart") when an item is clicked, with transition effects for showing and hiding the message.
function showTemporaryText(element, message) {
    // Create a span element for the temporary message
    var tempText = document.createElement('span');
    tempText.innerHTML = '<strong>' + message + '</strong>';
    tempText.classList.add('temp-text');

    // Set the parent element to relative positioning to avoid affecting the table layout
    element.style.position = 'relative';

    // Insert the text inside the parent but absolutely positioned
    element.appendChild(tempText);

    // Position the temp text above or to the side of the element
    tempText.style.top = '-30px'; // Adjust this value to control position
    tempText.style.left = '0'; // Set to left aligned
    tempText.style.width = 'max-content';

    // First, show the element with the "show" class (fast transition in)
    setTimeout(function() {
        tempText.classList.add('show');
    }, 10);

    // After 2 seconds, start the hide transition
    setTimeout(function() {
        tempText.classList.remove('show');
        tempText.classList.add('hide');
    }, 2000);

    // Remove the element from the DOM after the slow transition
    setTimeout(function() {
        tempText.remove();
    }, 4000);
}



// Function to split the explanation text every 70 characters
function splitTextEvery70Chars(text) {
    const words = text.split(' ');
    let lineLength = 0;
    let formattedText = '';

    words.forEach(word => {
        if (lineLength + word.length > 70) {
            formattedText += '<br>'; // Add a line break if the current line exceeds 70 characters
            lineLength = 0; // Reset line length for the new line
        }
        formattedText += word + ' ';
        lineLength += word.length + 1; // Update the line length (account for the space after each word)
    });

    return formattedText.trim(); // Remove any trailing spaces
}


function getTechnicalPatternInfo(row) {
    // Find the matching explanation from explanationsData
    const explanationRow = explanationsData.find(explanationRow => explanationRow['Key'] === row['key_techs']);

    // Extract relevant data from explanationRow, or default values if not found
    const key = explanationRow ? explanationRow['Key'] : 'N/A';
    const attachedFile = explanationRow ? explanationRow['Attached File'] : 'N/A';
    const associatedFunction = explanationRow ? explanationRow['Associated Function'] : 'N/A';
    const fullIndicatorName = explanationRow ? explanationRow['Full Indicator Name'] : 'N/A';
    const tradingViewUrl = explanationRow ? explanationRow['Traderview URL Indicator'] : '#';
    const author = explanationRow ? explanationRow['Author'] : 'N/A';
    const variables = explanationRow ? explanationRow['Variables it returns'] : 'N/A';
    const explanation = explanationRow ? explanationRow['Explanation'] : 'No explanation available';
    const keyCombination = explanationRow ? explanationRow['Key Combination'] : row['key_techs'];

    // Handle keyCombination format
    if (keyCombination.includes('|')) {
        keyCombination = "Composed by: " + keyCombination.replace(/\|/g, ', ');
    }

    // Function to conditionally display each field if the value is not "--"
    function displayField(label, value) {
        return value && value !== '--' && value !== 'N/A' ? `<p><strong>${label}:</strong> ${value}</p>` : '';
    }

    // Create HTML for technical pattern information, omitting fields with "--"
    return `
    <div class="technical-info" >
        <h2>Technical Pattern Information</h2>
        ${displayField('Key', key)}
        ${displayField('Attached File', attachedFile)}
        ${displayField('Associated Function', associatedFunction)}
        ${tradingViewUrl !== '#' ? `<p><strong>Full Indicator Name:</strong> <a href="${tradingViewUrl}" target="_blank">${fullIndicatorName}</a></p>` : ''}
        ${displayField('Author', author)}
        ${displayField('Variables it Returns', variables)}
        ${displayField('Explanation', explanation)}
        ${displayField('Key Combination', keyCombination)}
    </div>`;
}


// Helper function to decode the cookie key (URL-safe Base64 decoding) and reformat the result
function decodeKey_B(encodedKey) {
    // Replace URL-safe characters back to original Base64 characters
    let key = encodedKey.replace(/-/g, '+').replace(/_/g, '/');
    // Decode Base64
    let decoded = atob(key);

    // Split the decoded string and reformat it to the desired format
    let parts = decoded.split(' - ');  // Splits by ' - '
    if (parts.length === 4) {
        return `${parts[0]}_${parts[1]}_${parts[2]}tuisku${parts[3]}`;
    } else {
        return decoded; // Fallback in case the format doesn't match
    }
}


function copyEmailToClipboard() {
    // Create a temporary text area to hold the email text
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = "sales@tuisku.eu";  // Email to be copied
    document.body.appendChild(tempTextArea);  // Append it to the body (invisible)

    // Select and copy the text to clipboard
    tempTextArea.select();
    document.execCommand('copy');

    // Remove the text area after copying
    document.body.removeChild(tempTextArea);

    const copyIcon = document.querySelector('.fa-copy');
    // Optionally, alert or notify the user that the email was copied
    showTemporaryText(copyIcon,"Email sales@tuisku.eu address copied to clipboard!");
}

