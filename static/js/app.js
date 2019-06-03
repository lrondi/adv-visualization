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
    // buildGauge(data.WFREQ)    
};

function buildGauge(sample){
  var URL = '/wfreq/'+sample;
  d3.json(URL).then(function(data){
    console.log(data);
    var level = data.WFREQ[0];
    if (level <1){
      var level2 = 10;
    } else if (level <2){
      var level2 = 30;
    } else if (level<3){
      var level2 = 50;
    } else if (level<4){
      var level2 = 70;
    } else if (level<5){
      var level2 = 90;
    } else if (level<6){
      var level2 = 110;
    } else if (level<7){
      var level2 = 130;
    } else if (level<8){
      var level2 = 150;
    } else if (level<9){
      var level2 = 170;
    } else{
      var level2 = 180;
    };
    // Trig to calc meter point
    var degrees = 180 - level2,
        radius = .5;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    // Path: may have to change to create a better triangle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);

    var data = [
      {type: 'scatter',
      x: [0], y:[0],
      marker: {size: 28, color:'850000'},
      showlegend: false,
      name: 'scrubs',
      text: level,
      hoverinfo: 'text+name'},
      {values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
      rotation: 90,
      text: ['8-9', '7-8', '6-7', '5-6','4-5', '3-4', '2-3', '1-2', '0-1',''],
      textinfo: 'text',
      textposition:'inside',
      marker: {colors:['rgba(4,93,29,0.8)','rgba(27,112,43 ,0.8)','rgba(51,132,57,0.8)',
                            'rgba(75,152,71,0.8)', 'rgba(99,172,85,0.8)',
                            'rgba(122,191,99,0.8)', 'rgba(146,211,113,0.8)',
                            'rgba(170,231,127,0.8)', 'rgba(194,251,142,0.8)',
                            'rgba(255, 255, 255, 0)']},
      labels: ['8-9', '7-8', '6-7','5-6','4-5', '3-4', '2-3', '1-2', '0-1',''],
      hoverinfo: 'label',
      hole: .5,
      type: 'pie',
      showlegend: false
    }];
        
    var layout = {
      shapes:[{
          type: 'path',
          path: path,
          fillcolor: '850000',
          line: {
            color: '850000'
          }
        }],
      title: '<b>Scrub-ometer!</b>',
      height: 500,
      width: 500,
      xaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]},
      yaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]}
    };

  Plotly.newPlot('gauge', data, layout);
  });
};

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
    buildGauge(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
  buildGauge(newSample);
}

// Initialize the dashboard
init();
