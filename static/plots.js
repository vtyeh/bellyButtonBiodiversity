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
populateSamples();


