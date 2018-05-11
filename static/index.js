function populateSamples() {
    Plotly.d3.json('/names', function(error, response) {
        if(error) return console.warn(error);

        let select = document.getElementById('selDataset')
        for (var i=0,ii=response.length; i<ii; i++){
            let option = document.createElement('option');
            option.value = response[i];
            option.text = response[i];
            select.appendChild(option);
        };
    });
}

function displayMetaData(metaResponse) {
    let displayPanel = document.getElementById('displayMeta');
    displayPanel.innerHTML = '';
    
    for ( var key in metaResponse) {
        info = document.createElement("h5");
        infoText = document.createTextNode(`${key}: ${metaResponse[key]}`);
        info.append(infoText);
        displayPanel.appendChild(info);
        };
}

function buildGraphs(samplesResponse, otuResponse) {
    let sampleValues = samplesResponse[0]['sample_values'];
    let otuIds = samplesResponse[0]['otu_ids'];

    let labels = otuIds.map(function(description) {
        return otuResponse[description]
    });

    let pieTrace = [{
        labels: otuIds.slice(0,10),
        values: sampleValues.slice(0,10),
        marker: {colors: ["#4b8272", "#91ba8d", "#82ada0", "#67937a", "#f9f6bb", "#d5edb8", "#eae693", "#ffe8a5", "#ffd6a4", "#ffd4c4"]},
        hovertext: labels.slice(0, 10),
        hoverinfo: 'hovertext',
        type: 'pie'
        }];

    let pieLayout = {
        margin: { t:0, l:0}
    };

    let PIE = document.getElementById('pie');
    Plotly.plot(PIE, pieTrace, pieLayout);

    let bubbleTrace = [{
        x: otuIds,
        y: sampleValues,
        text: labels,
        mode: 'markers',
        marker: {
            size: sampleValues,
            color: otuIds
        }
    }];

    let bubbleLayout = {
        margin: { t: 0 },
        hovermode: 'closest',
        xaxis: { title: 'OTU (Operational Taxonomic Unit) ID' },
        yaxis: { title: 'Sample Values'},
    };

    let BUBBLE = document.getElementById('bubble');
    Plotly.plot(BUBBLE, bubbleTrace, bubbleLayout);
}

function updateGraphs(new_samplesResponse, new_otuResponse) {
    let sampleValues = new_samplesResponse[0]['sample_values'];
    let otuIds = new_samplesResponse[0]['otu_ids'];

    let labels = otuIds.map(function(description) {
        return new_otuResponse[description]
    });

    let pieUpdate = {
        labels: [otuIds.slice(0,10)],
        values: [sampleValues.slice(0,10)],
        hovertext: [labels.slice(0, 10)],
        hoverinfo: 'hovertext',
        type: 'pie'
        };

    let NEWPIE = document.getElementById('pie');
    Plotly.restyle(NEWPIE, pieUpdate);
    console.log("hi");

    let bubbleUpdate = {
        x: [otuIds],
        y: [sampleValues],
        text: [labels],
        mode: 'markers',
        marker: {
            size: sampleValues,
            color: otuIds,
        }
    };

    let NEWBUBBLE = document.getElementById('bubble');
    Plotly.restyle(NEWBUBBLE, bubbleUpdate);
}

function buildGauge(freqResponse) {
    
    // Enter a speed between 0 and 180
    let level = freqResponse*20;

    // Trig to calc meter point
    let degrees = 180- level,
        radius = .5;
    let radians = degrees * Math.PI / 180;
    let x = radius * Math.cos(radians);
    let y = radius * Math.sin(radians);

    // Path: may have to change to create a better triangle
    let mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    let path = mainPath.concat(pathX,space,pathY,pathEnd);

    let data = [{ type: 'scatter',
        x: [0], y:[0],
        marker: {size: 28, color:'850000'},
        showlegend: false,
        name: 'Frequency',
        text: freqResponse,
        hoverinfo: 'text+name'
        },
        { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
        rotation: 90,
        text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
        textinfo: 'text',
        textposition:'inside',
        marker: {colors:['rgba(0, 105, 11, .5)', 'rgba(10, 120, 22, .5)',
                        'rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
                         'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                         'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
                         'rgba(240, 230, 215, .5)', 'rgba(255, 255, 255, 0)']},
        labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1',''],
        hoverinfo: 'label',
        hole: .5,
        type: 'pie',
        showlegend: false
    }];

    let layout = {
        shapes:[{
        type: 'path',
        path: path,
        fillcolor: '850000',
        line: {
        color: '850000'
        }
        }],
        title: '<b>Belly Button Washing Frequency</b> <br> Scrubs per Week',
        titlefont: {family: '"Palatino Linotype", "Book Antiqua", Palatino, serif'},
        height: 520,
        width: 520,
        xaxis: {zeroline:false, showticklabels:false,
             showgrid: false, range: [-1, 1]},
        yaxis: {zeroline:false, showticklabels:false,
             showgrid: false, range: [-1, 1]},
        };

    let GAUGE = document.getElementById('freqGauge');
    Plotly.newPlot(GAUGE, data, layout);
}

function initData(sample) {
    let samplesUrl = '/samples/' + sample;
    let metaUrl = '/metadata/' +sample;
    let otuUrl = '/otu';
    let freqUrl = '/wfreq/' + sample;

    Plotly.d3.json(samplesUrl, function(error, samplesResponse){
        if (error) return console.warn(error);
        Plotly.d3.json(otuUrl, function(error, otuResponse) {
            if (error) return console.warn(error);
            buildGraphs(samplesResponse, otuResponse);
        });
    });

    Plotly.d3.json(metaUrl, function(error, metaResponse){
        if (error) return console.warn(error);
        displayMetaData(metaResponse);
    });

    Plotly.d3.json(freqUrl, function(error, freqResponse){
        if (error) return console.warn(error);
        buildGauge(freqResponse);
    });
}

function getData(new_sample) {
    let new_url1 = '/samples/' + new_sample;
    let new_url2 = '/metadata/' + new_sample;
    let new_url3 = '/wfreq/' + new_sample;
    Plotly.d3.json(new_url1, function(error, new_samplesResponse){
        if (error) return console.warn(error);
        Plotly.d3.json('/otu', function(error, new_otuResponse) {
            if (error) return console.warn(error);
            updateGraphs(new_samplesResponse, new_otuResponse);
            console.log('after update graph');
        });
    });

    Plotly.d3.json(new_url2, function(error, new_metaResponse){
        if (error) return console.warn(error);
        displayMetaData(new_metaResponse);
    });

    Plotly.d3.json(new_url3, function(error, new_freqResponse){
        if (error) return console.warn(error);
        buildGauge(new_freqResponse);
    });
}

populateSamples();
initData("BB_940");
