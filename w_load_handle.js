// Table Column Handlers

// Handles the rendering of the "Name" column, including an icon and ticker with TradingView link and icon.
// Handles the rendering of the "Name" column, including an icon, name, and ticker with TradingView link and icon.
// Handles the rendering of the "Name" column, including an icon, name, and ticker with TradingView link and icon.
function handleNameColumn(row) {
    const td = document.createElement('td');
    const iconPath = row['path_ico'];
    const name = row['Name'];
    const ticker = row['ticker'];

    // Generate the TradingView URL using the previously defined function
    const tradingViewUrl = generateTradingViewPath(row);

    // Path to the TradingView icon
    const twIconPath = 'd_result/icons/_TW_ICO_16px.ico';

    // Create the image element for the company icon (no div for this as per request)
    const iconImg = `<img src="${iconPath}" alt="${ticker} icon" style="width: 1.75em; height: 1.75em; vertical-align: middle; margin-left: 0.8em;">`;

    // Create the name div
    //const nameDiv = `<div ><span class="name-text">${name}</span></div>`;
    const nameDiv = `${name} `;


    // Create the ticker div, with the TradingView icon and ticker as links
    const tickerDiv = `
    <div  style="display: inline-flex; align-items: center;">
            <img src="${twIconPath}" href="${tradingViewUrl}" alt="TW icon" style="width: 1.1em; height: 1.1em; vertical-align: middle; margin-right: 4px;">
            <a href="${tradingViewUrl}" target="_blank" style="color: #3BAF75; ">${ticker}</a>
     </div>
    `;

    // Combine all parts into the table cell
    td.innerHTML = `<div class="td_name_ico_div">${iconImg}<div  class="ticker-name-div" > ${nameDiv} ${tickerDiv}</div></div>`;
    td.classList.add('td_name_ico'); // Add the specific class for styling

    return td;
}






// Handles the rendering of columns containing image paths.
function handleImageColumn(row, key) {
    const td = document.createElement('td');
    const imgPath = row[key];

    if (imgPath) {
        const img = document.createElement('img');
        img.src = imgPath.replace(/\\/g, '/'); // Correct path format
        img.classList.add('th_img_path');
        td.classList.add('td_img_path');

        const link = document.createElement('a');
        link.href = '#'; // Dummy href
        link.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default anchor behavior
            const newWindow = window.open('', '_blank');
            newWindow.document.write(generateHtmlForRow(row, row['path_candle'], row['path_stra']));
            newWindow.document.close();
        });

        link.appendChild(img);
        td.appendChild(link);
    } else {
        td.textContent = 'N/A';
    }

    return td;
}

// Handles the rendering of the "Shop" column, including free and buyable items.
function handleShopColumn(row, price) {
    const td = document.createElement('td');
    td.classList.add('shop-cell', 'buy');
    const id_encodedKey = encodeKey(`${row['ticker']} - ${row['interval']} - ${row['key_techs']} - ${row['id_model']}`);

    if (price === 0) {
        handleFreeItem(td, row);
    } else if (price > 0) {
        handleBuyItem(td, row, price);
        const simpleCartDiv = createSimpleCartFields(row, price, id_encodedKey);
        td.appendChild(simpleCartDiv);
        simpleCart.load();
    }
    return td;
}

// Manages free items and sets up the temporary text message on click.
function handleFreeItem(td, row) {
    const freeIcon = '<i class="fa-solid fa-file-arrow-down" style="color: #3BD7C8; font-size: 1.35em; font-weight: bold;"></i>';
    td.innerHTML = `${freeIcon} <span style="color: #3BD7C8; font-weight: bold; cursor: pointer;text-decoration: underline;">FREE</span>`;
    td.classList.add('free');
    td.addEventListener('click', () => handleFreeClick(row, td));
}


// Manages buyable items and integrates SimpleCart.js.
function handleBuyItem(td, row, price) {
    const cartIcon = '<i class="fa-solid fa-cart-shopping" style="color: #3BAF75; font-size: 1.35em; font-weight: bold;"></i>';
    const div = document.createElement('div');
    div.classList.add('item_add', 'buy_div_class');
    div.href = 'javascript:;';

    // Handle the click event for adding to cart
    div.onclick = function() {
        const icon = div.querySelector('i');
        icon.style.color = '#2c6b52'; // Darker green color
        const textElement = div.querySelector('a');
        if (textElement) {
            textElement.style.color = '#2c6b52'; // Change the text color to darker green
        }
        // Show temporary text indicating the item was added to the cart
        showTemporaryText(div, `${row['ticker']} added to cart`);
    };

    // Create the inner content including the cart icon and "Add to Cart" text
    div.innerHTML = `${cartIcon} <a class="item_add" href="javascript:;" style="color: #3BAF75; font-weight: bold; cursor: pointer;">Add to Cart</a>`;
    td.appendChild(div); // Append the div to the table cell
}



// Shop and Purchase Handlers

// Handles the buying logic when the user clicks on an item, including cookie management and UI updates.
function handleBuyClick(row, td, checkbox) {
    const purchaseInfo = `${row['ticker']} - ${row['interval']} - ${row['key_techs']} - ${row['id_model']}`;
    const encodedKey = encodeKey(purchaseInfo);
    const sessionI = generateSessionID();
    const encodedSessionValue = `Tuisku_S_${sessionI}`;

    const cookieExists = document.cookie.split('; ').find(cookie => cookie.startsWith(`${encodedKey}=`));

    if (!cookieExists) {
        document.cookie = `${encodedKey}=${encodedSessionValue}; path=/; max-age=86400`;
        td.style.backgroundColor = 'rgba(187, 222, 251, 0.3)';
        td.style.border = '2px solid rgb(56, 142, 60)';
        const icon = td.querySelector('i');
        icon.style.color = 'rgb(102, 187, 106)';
        checkbox.checked = true;
    } else {
        document.cookie = `${encodedKey}=; path=/; max-age=0`;
        td.style.backgroundColor = '';
        td.style.border = '';
        const icon = td.querySelector('i');
        icon.style.color = '#3BAF75';
        checkbox.checked = false;
    }
}

// Checks whether an item has already been purchased (based on cookies).
function checkPurchased(row, td, checkbox) {
    const purchaseInfo = `${row['ticker']} - ${row['interval']} - ${row['key_techs']} - ${row['id_model']}`;
    const encodedKey = encodeKey(purchaseInfo);
    const cookieExists = document.cookie.split('; ').find(cookie => cookie.startsWith(`${encodedKey}=`));

    if (cookieExists) {
        td.style.backgroundColor = 'rgba(187, 222, 251, 0.3)';
        td.style.border = '2px solid rgb(56, 142, 60)';
        const icon = td.querySelector('i');
        icon.style.color = 'rgb(102, 187, 106)';
        checkbox.checked = true;
    } else {
        checkbox.checked = false;
    }
}

// Generates hidden fields for SimpleCart.js to track cart items.
function createSimpleCartFields(row, price, id_encodedKey) {
    const simpleCartDiv = document.createElement('div');

    simpleCartDiv.innerHTML = `
        <span class="item_name" data-name="${id_encodedKey}" style="display:none;">${id_encodedKey}</span>
        <span class="item_name-name" data-name-name="${row['Name']}" style="display:none;"> ${row['Name']}</span>
        <span class="item_price" data-price="${price}" style="display:none;">${price}</span>
        <span class="item_interval" data-interval="${row['interval']}" style="display:none;">${row['interval']}</span>
        <span class="item_net-profit-usd" data-net-profit-usd="${row['Net Profit_usd']}" style="display:none;">${row['Net Profit_usd']}</span>
        <span class="item_indicator-name" data-indicator-name="${row['Full Indicator Name']}"style="display:none;">"${row['Full Indicator Name']}"</span> <!-- New Indicator Name field -->
        <span class="item_key-techs" data-key-techs="${row['key_techs']}" style="display:none;">${row['key_techs']}</span>
        <span class="item_index" data-index="${row['Index']}" style="display:none;">${row['Index']}</span>
        <span class="item_ticker" data-ticker="${row['ticker']}" style="display:none;">${row['ticker']}</span>
        <span class="item_win-rate-per" data-win-rate-per="${row['Percent Profitable_per']}" style="display:none;">${row['Percent Profitable_per']}</span>
        <span class="item_total-closed-trades" data-total-closed-trades="${row['Total Closed Trades']}" style="display:none;">${row['Total Closed Trades']}</span>
        <span class="item_release-date" data-release-date="${row['Release date']}" style="display:none;">${row['Release date']}</span>
        <span class="item_months-trained" data-months-trained="${row['months_trained']}" style="display:none;">${row['months_trained']}</span>
        <span class="item_path-ico" data-path-ico="${row['path_ico']}" style="display:none;">${row['path_ico']}</span>
        <input type="text" value="1" class="item_quantity" style="display:none;" />
        <a class="item_add" href="javascript:;" style="color: #3BAF75; font-weight: bold; cursor: pointer;"
    `; //        onclick="showTemporaryText(this,'${row['ticker']} added to cart')">Add to Cart</a>
    return simpleCartDiv;
}

// SimpleCart.js Configuration

simpleCart({
   //const fullIndicatorName = handleFullIndicatorNameColumn(row).innerHTML;
    cartColumns: [
        { attr: "name", label: "ID" },
        { attr: "name-name", label: "Name", view: function(item) {
            return `<div style="display: flex; align-items: center;"> <p style=" margin: 0px;">  ${item.get('name-name')} </p> &ensp; <img style="width: 1em; height: 1em;" src="${item.get('path-ico')}" alt="Icon"></div>`;
        } },
        { attr: "price", label: "Price" , view: 'currency' },
        { attr: "interval", label: "Interval" },
        { attr: "net-profit-usd", label: "Net Profit (USD)", view: 'currency' },
        { attr: "indicator-name", label: "Indicators Name" , view: function(item) {
            return handleFullIndicatorNameColumn(item.get('key-techs')).innerHTML;
        } },
        { attr: "key-techs", label: "Key Techs" },
        { attr: "index", label: "Index" },
        { attr: "ticker", label: "Ticker" },
        { attr: "win-rate-per", label: "Win Rate (%)" },
        { attr: "total-closed-trades", label: "Closed Trades" },
        { attr: "release-date", label: "Release Date" },
        { attr: "months-trained", label: "Months Trained" },
//        { attr: "quantity", label: "Qty" },
//        { attr: "total", label: "SubTotal", view: 'currency' },
        { view: "remove", text: "Remove", label: false }
    ],
    cartStyle: "table",
    checkout: {
        type: "PayPal",
        email: "l.lecinana@gmail.com",
        sandbox: true  // Set this to false for live payments
    },
    currency: "USD",
    taxRate: 0.10,
    shippingFlatRate: 0.00,
    language: "english-us",

    // Use afterAdd to manage quantity limits
    afterAdd: function(item) {
        // Delay the quantity check to ensure cart is updated first
        setTimeout(function() {
            var existingItems = simpleCart.items();
            var existingItem = null;
            for (var i = 0; i < existingItems.length; i++) {
                if (existingItems[i].get('name') === item.get('name')) {
                    existingItem = existingItems[i];
                    break;
                }
            }

            if (existingItem && existingItem.get('quantity') > 1) {
                existingItem.set('quantity', 1);
                simpleCart.update();
                var cartTable = document.querySelector('.simpleCart_checkout');
                showTemporaryText(cartTable, 'You can only have 1 of this item in your cart.');
            }
        }, 100);

        console.log(item.get('name') + " added to cart.");
    }
});





