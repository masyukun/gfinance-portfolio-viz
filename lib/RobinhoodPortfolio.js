// Setup
google.charts.load('current', {'packages':['treemap']});
google.charts.setOnLoadCallback(drawChart);


// Portfolio data structures
var portfolioIndustries = []
var portfolioSectors = []
var portfolio = []
                  

// Dropbox area for input files
var dropbox = document.getElementById("chart_div");
if (dropbox) {
    dropbox.addEventListener("dragenter", dragenter, false);
    dropbox.addEventListener("dragover", dragover, false);
    dropbox.addEventListener("drop", drop, false);
}

function dragenter(e) {
  e.stopPropagation();
  e.preventDefault();
}

function dragover(e) {
  e.stopPropagation();
  e.preventDefault();
}

function drop(e) {
  e.stopPropagation();
  e.preventDefault();

  var dt = e.dataTransfer;
  var files = dt.files;

  updateFile(files);
}




// Stole this from StackOverflow
Array.prototype.getUnique = function(){
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(u.hasOwnProperty(this[i])) {
         continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;
}


// Whenever a new file is uploaded, this runs.
function updateFile(myFile) {

    // Clear it all
    portfolioIndustries = []
    portfolioSectors = []
    portfolio = []

    // Get the uploaded file
    var fileInput = myFile.files;
    
    // Load CSV data 
    var results = Papa.parse(fileInput[0], {
        header: true,
        dynamicTyping: true,
        complete: function (results) {

            // Process each stock in the portfolio
            results.data.forEach( function(row) {

                // Extract the pertinents
                var marketValue = (row["Mkt value"] || 1);
                var tickerSymbol = row["Symbol"];

                // Poop the stocks into a bucket
                if (marketValue && tickerSymbol && marketValue != 0) {
                 
                    // Cleanup
                    psector = sectors[tickerSymbol] ? sectors[tickerSymbol] : "n/a";
                    pindustry = industries[tickerSymbol] ? industries[tickerSymbol] : "Unknown"
                    
                    // Poop
                    portfolio.push( [tickerSymbol, psector, marketValue] );
                    portfolioSectors.push( [psector, "Robinhood portfolio", null] );
                    portfolioIndustries.push( [pindustry, psector, null] );
                }
            });

            // Might as well.
            drawChart();
        }
    });
}


// Draw the chart
function drawChart() {


  // Draw chart
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'ID');
  data.addColumn('string', 'Parent');
  data.addColumn('number', 'Number Of Lines');
  
  data.addRow( ['Robinhood portfolio', null, 0] )
  if (portfolioSectors && portfolioSectors.length > 0)
    portfolioSectors.getUnique().forEach( function (p) { 
        data.addRow(p)
    })
  if (portfolioIndustries && portfolioIndustries.length > 0)
    portfolioIndustries.getUnique().forEach( function (p) { 
        data.addRow(p)
    })
  if (portfolio && portfolio.length > 0)
    portfolio.getUnique().forEach( function (p) { 
        data.addRow(p)
    })
//        : ['Upload a file', 'Robinhood portfolio', 1]
  

  var tree = new google.visualization.TreeMap(document.getElementById('chart_div'));

  var options = {
    highlightOnMouseOver: true,
    maxDepth: 1,
    maxPostDepth: 2,
    minHighlightColor: '#8c6bb1',
    midHighlightColor: '#9ebcda',
    maxHighlightColor: '#edf8fb',
    minColor: '#009688',
    midColor: '#f7f7f7',
    maxColor: '#ee8100',
    headerHeight: 15,
    showScale: true,
    height: 500,
    useWeightedAverageForAggregation: true
  };

  tree.draw(data, options);

}
