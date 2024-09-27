

paypal.Buttons({
    createOrder: function(data, actions) {
        // Set up the transaction by calculating the total from the cart
        console.info("actions.order.create buy dolars: "+ simpleCart.grandTotal() + "usd");
        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: simpleCart.grandTotal() // Use simpleCart's grand total function to get the total price
                }
            }]
        });
    },
onApprove: function(data, actions) {
    return actions.order.capture().then(function(details) {
        // Store the relevant payment information in sessionStorage
        const paymentData = {
            orderID: data.orderID,
            payerID: data.payerID,
            paymentID: data.paymentID,
            paymentSource: data.paymentSource,
            facilitatorAccessToken: data.facilitatorAccessToken
        };

        // Save to sessionStorage for use on the thank you page
        sessionStorage.setItem('paymentData', JSON.stringify(paymentData));

        // Redirect to Thank You page after the order is captured
        window.location.href = 'w_thankyou.html';
    });
},
    onError: function(err) {
        console.error(err);
        alert('An error occurred during the transaction');
    },
    // Add the style parameter to customize the button
    style: {
        color: 'blue',      // Button color: 'gold', 'blue', 'silver', 'black'
        shape: 'pill',        // Button shape: 'rect', 'pill'
        label: 'checkout',    // Button label: 'checkout', 'buynow', 'pay'
        layout: 'vertical', // Button layout: 'vertical', 'horizontal'
        tagline: false        // Display PayPal tagline below the button (true/false)
    }
}).render('#paypal-button-container'); // Display PayPal button in the container