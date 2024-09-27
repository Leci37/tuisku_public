// Generates a histogram based on the provided data, bin count, and min/max values
function generateHistogram(data, bins, min, max) {
  console.log(`Generating histogram with ${bins} bins, min: ${min}, max: ${max}`);
  const binWidth = (max - min) / bins;
  const histogram = Array(bins).fill(0);

  data.forEach(value => {
    const bin = Math.floor((value - min) / binWidth);
    if (bin >= 0 && bin < bins) {
      histogram[bin]++;
    }
  });

  console.log(`Generated histogram: ${histogram}`);
  return histogram;
}

// Updates the histogram visualization with bars based on provided data
function updateHistogram(min, max, type, data) {
  console.log(`Updating histogram for type: ${type}, min: ${min}, max: ${max}`);
  const histogramContainer = document.getElementById(`histogram-container-${type}`);
  const histogramData = data;
  histogramContainer.innerHTML = '';  // Clear previous histogram

  const maxHeight = Math.max(...histogramData);
  const minBarHeight = 5; // Minimum bar height for non-zero bars
  histogramData.forEach((value, index) => {
    const bar = document.createElement('div');
    bar.className = 'histogram-bar';
    if (value > 0) {
      const height = (value / maxHeight) * 100;
      bar.style.height = `${Math.max(height, minBarHeight)}%`;
    } else {
      bar.style.height = '0'; // Height stays at 0 for bars with no data
    }
    bar.dataset.value = index * (max - min) / histogramData.length + min;
    histogramContainer.appendChild(bar);
  });

  // Set initial opacity based on the current slider range
  updateHistogramOpacity(min, max, type);
}

// Updates the opacity of the histogram bars based on slider values
function updateHistogramOpacity(min, max, type) {
  console.log(`Updating histogram opacity for ${type} between ${min} and ${max}`);
  const bars = document.querySelectorAll(`#histogram-container-${type} .histogram-bar`);
  bars.forEach(bar => {
    const value = parseFloat(bar.dataset.value);
    if (value >= min && value <= max) {
      bar.style.opacity = 1;  // Fully visible
    } else {
      bar.style.opacity = 0.2;  // Transparent
    }
  });
}

// Initializes sliders with histogram for a given type
function initialize_Sliders_with_Histogram({ sliderId, minTextboxId, maxTextboxId, histogramType, min, max, step }) {
  console.log(`Initializing slider with histogram for ${histogramType}`);
  $(sliderId).slider({
    range: true,
    min: min,
    max: max,
    step: step,
    values: [min, max],
    slide: function(event, ui) {
      console.log(`Slider moved: ${ui.values[0]} - ${ui.values[1]}`);
      $(minTextboxId).val(ui.values[0]);
      $(maxTextboxId).val(ui.values[1]);
      filterTable();
      updateHistogramOpacity(ui.values[0], ui.values[1], histogramType);
    }
  });

  // Set initial textbox values based on the slider
  $(minTextboxId).val($(sliderId).slider("values", 0));
  $(maxTextboxId).val($(sliderId).slider("values", 1));
}

// Initializes regular sliders without histograms
function initialize_Regular_Slider({ sliderId, minTextboxId, maxTextboxId, min, max, step }) {
  console.log(`Initializing regular slider for ${sliderId}`);
  $(sliderId).slider({
    range: true,
    min: min,
    max: max,
    step: step,
    values: [min, max],
    slide: function(event, ui) {
      console.log(`Regular slider moved: ${ui.values[0]} - ${ui.values[1]}`);
      $(minTextboxId).val(ui.values[0]);
      $(maxTextboxId).val(ui.values[1]);
      filterTable();
    }
  });

  $(minTextboxId).val($(sliderId).slider("values", 0));
  $(maxTextboxId).val($(sliderId).slider("values", 1));
}

// Initializes all sliders and links them with histograms and filters
function load_full_sliders() {
  console.log("Loading full sliders with histograms and regular sliders");

  // Sliders with histograms
  initialize_Sliders_with_Histogram({
    sliderId: "#slider-range-profit",
    minTextboxId: "#profitUsdMinTextbox",
    maxTextboxId: "#profitUsdMaxTextbox",
    histogramType: 'profit',
    min: 0,
    max: 22000,
    step: 10
  });

  initialize_Sliders_with_Histogram({
    sliderId: "#slider-range-price",
    minTextboxId: "#priceMinTextbox",
    maxTextboxId: "#priceMaxTextbox",
    histogramType: 'price',
    min: 0.0,
    max: 199.0,
    step: 1
  });

  initialize_Sliders_with_Histogram({
    sliderId: "#slider-range-trainingMonths",
    minTextboxId: "#trainingMonthsMinTextbox",
    maxTextboxId: "#trainingMonthsMaxTextbox",
    histogramType: 'trainingMonths',
    min: 0,
    max: 400,
    step: 1
  });

  // Load regular sliders without histograms
  $("#slider-range-netProfitPer, #slider-range-totalClosedTrades, #slider-range-percentProfitablePer, #slider-range-profitFactor, #slider-range-maxDrawdownUsd, #slider-range-maxDrawdownPer, #slider-range-avgTradeUsd, #slider-range-avgTradePer, #slider-range-avgBarsInTrades, #slider-range-activityPerCandle, #slider-range-nCandles").each(function() {
    const id = $(this).attr('id').replace('slider-range-', '');
    const minTextbox = $(`#${id}MinTextbox`);
    const maxTextbox = $(`#${id}MaxTextbox`);
    const minValue = parseFloat(minTextbox.attr('min'));
    const maxValue = parseFloat(maxTextbox.attr('max'));

    initialize_Regular_Slider({
      sliderId: `#slider-range-${id}`,
      minTextboxId: `#${id}MinTextbox`,
      maxTextboxId: `#${id}MaxTextbox`,
      min: minValue,
      max: maxValue,
      step: parseFloat(minTextbox.attr('step'))
    });
  });

  // Link input textboxes to sliders
  $("input[type='number']").on('input', function() {
    const id = $(this).attr('id').replace('MinTextbox', '').replace('MaxTextbox', '');
    const minTextbox = $(`#${id}MinTextbox`);
    const maxTextbox = $(`#${id}MaxTextbox`);
    const slider = $(`#slider-range-${id}`);

    const minVal = parseFloat(minTextbox.val());
    const maxVal = parseFloat(maxTextbox.val());

    if (minVal < maxVal) {
      console.log(`Textbox updated: ${minVal} - ${maxVal}`);
      slider.slider("values", [minVal, maxVal]);
      filterTable();
    }
  });
}


document.querySelectorAll('.td_img_path img').forEach(function(img) {
    const imgSrc = img.getAttribute('src');
    const link = document.createElement('a');
    link.setAttribute('href', imgSrc);
    link.setAttribute('target', '_blank'); // Open in a new tab
    img.parentNode.insertBefore(link, img);
    link.appendChild(img);
});