function buildMetadata(sample) {
  var URL =  '/metadata/'+sample;
  
  d3.json(URL).then(function(data){
    var panel = d3.select('#sample-metadata');  
    panel.html('');
    Object.entries(data).forEach(([key,value]) => {
      var par = panel.append('p');
      par.text(`${key}: ${value}`);
    });
  });

    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
}

function buildCharts(sample) {

  var URL =  '/samples/'+sample;
  d3.json(URL).then(function(data) {
    var data = [data];
    var sample_data = data[0].sample_values.slice(0);
    var sortedData = sample_data.sort((first, second) => second - first);
    var slicedData = sortedData.slice(0,10);
    
    var index_arr = [];
    for (var i=0; i<slicedData.length; i++){
      index_arr.push(data[0].sample_values.indexOf(slicedData[i]));
    };

    var sortedIds = [];
    for (var i=0; i<slicedData.length; i++){
      sortedIds.push(data[0].otu_ids[index_arr[i]]);
    };

    var sortedLabels = [];
    for (var i=0; i<slicedData.length; i++){
      sortedLabels.push(data[0].otu_labels[index_arr[i]]);
    };    

    var trace = [{
      type: "pie",
      labels: sortedIds,
      values: slicedData,
      hovertext: sortedLabels
    }];
    Plotly.newPlot("pie", trace);

    var trace2 = [{
      x: sortedIds,
      y: slicedData,
      mode: 'markers',
      text: sortedLabels,
      marker:{
        size: slicedData,
        color: sortedIds
      }
    }];

    var layout ={
      xaxis:{title:{text:'Otu_id'}}
    };
  
    Plotly.newPlot('bubble',trace2, layout);
  });

}

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
