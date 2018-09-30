function buildMetadata(sample) {

  // Use `d3.json` to fetch the metadata for a sample
  var url = "/metadata/"+ sample;
    d3.json(url).then(function(response) {
        console.log(response);
    
    // Get object to add each key and value pair to the panel
    var meta = Object.keys(response);

    // Get reference
    var $sampleMetadata = document.querySelector("#sample-metadata");

    // Reset form after each reference
    $sampleMetadata.innerHTML = null;

    for (var i = 0; i < meta.length; i++) {
        var $meta_data = document.createElement("p");
        $meta_data.innerHTML = meta[i] + ": " + response[meta[i]];
        $sampleMetadata.appendChild($meta_data)
    };
  });
};


function buildCharts(sample) {

  // Use `d3.json` to fetch the sample data for the plots
  var url = "/samples/" + sample;

  d3.json(url).then(function(data) {
    console.log(data);

    // Build a Bubble Chart using the sample data
    var trace1 = {
      x: data.otu_ids,
      y: data.sample_values,
      text: data.otu_labels,
      mode: "markers",
      marker: {
        color: data.otu_ids,
        size: data.sample_values
      }
    };

    var bubble = [trace1];

    Plotly.newPlot("bubble", bubble);


   // Create a empty list to store values
    var piechart = [];

    // Look for our targeted values
    for (var i = 0; i < data.sample_values.length; i++) {
      piechart.push({otu_ids : data.otu_ids[i],
        otu_labels: data.otu_labels[i],
        sample_values: data.sample_values[i]
      })
    };


    piechart.sort(function(a, b) {
      return parseFloat(b.sample_values) - parseFloat(a.sample_values);
    });

    // Slice the first 10 objects for plotting
    piechart_topten = piechart.slice(0, 10);

    // Reverse the array due to Plotly's defaults
    piechart_topten = piechart_topten.reverse();

    var trace2 = {
      values: piechart_topten.map(row => row.sample_values),
      labels: piechart_topten.map(row => row.otu_ids),
      type: "pie",
      hoverinfo: piechart_topten.map(row => row.otu_labels),
      textinfo: "percent"
    };

    var data2 = [trace2];

    Plotly.newPlot("pie", data2);
  })
};


function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();

