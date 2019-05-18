var svgWidth = 900;
var svgHeight = 500;

var margin = {
  top: 50,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// select the chart div and add an svg.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// create chart group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// initialize x and y axis
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// update scale of x axis when selecting poverty, age, or income
function xScale(csvData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(csvData, d => d[chosenXAxis]) * 0.8,
    d3.max(csvData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);
  return xLinearScale;
}

// update scale of y axis when selecting obesity, smokes, or healthcare
function yScale(csvData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(csvData, d => d[chosenYAxis]) * 0.8,
    d3.max(csvData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);
  return yLinearScale;
}

// update x axis when selecting poverty, age, or income 
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}

// circles group travels horizontally
function renderCircles(circlesGroup, newXScale, chosenXaxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));
  return circlesGroup;
}

function renderLabels(stateLabels, newXScale, chosenXaxis) {
  stateLabels.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));
  return stateLabels;
}

// TO DO.............................................................
// circles group travels vertically

// update circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  //determine axes selected
  // x axis
  if (chosenXAxis === "poverty") {
    var label = "Poverty (%):";
  }
  else if (chosenXAxis === 'age') {
    var label = "Median Age:";
  }
  else {
    var label = 'Median Income:';
  }

  // y axis
  var labelY = "Obesity (%):";

  // TO DO.............................................................
  // allow multiple y axis selections

  // if (chosenYAxis === "obesity") {
  //   var labelY = "Obesity (%):";
  // }
  // else if (chosenYAxis === 'smokes') {
  //   var labelY = "Smokes (%):";
  // }
  // else {
  //   var labelY = 'Lacks Health Insurance (%):';
  // }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function (d) {
      return (`${d.state}
      <br>${label} ${d[chosenXAxis]}
      <br>${labelY} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function (data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function (data, index) {
      toolTip.hide(data);
    });
  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv", function (err, csvData) {
  if (err) throw err;

  // parse data
  csvData.forEach(function (data) {

    // grouped by X values
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;

    // grouped by Y values
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
    data.healthcare = +data.healthcare;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(csvData, chosenXAxis);
  var yLinearScale = yScale(csvData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .attr("transform", `translate(0, 0)`)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(csvData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 13)
    .attr("fill", "limegreen")
    .attr("opacity", ".5");

  // create state labels
  var stateLabels = chartGroup.append("text")
    .style("text-anchor", "middle")
    .style("font-size", "10px")
    .selectAll("tspan")
    .data(csvData)
    .enter()
    .append("tspan")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .text(function (data) {
      return data.abbr
    });

  // group for x axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Median Age");

  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Median Income");


  // group for y axis labels
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Obesity (%)");

  // TO DO.............................................................
  // add labels for obesity, smokes, and healthcare

  // var obesityLabel = labelsGroupY.append("text")
  //   .attr("x", 0)
  //   .attr("y", 80)
  //   .attr("value", "obesity") // value to grab for event listener
  //   .classed("active", true)
  //   .text("Obesity (%)");

  // var smokesLabel = labelsGroupY.append("text")
  //   .attr("x", 0)
  //   .attr("y", 100)
  //   .attr("value", "smokes") // value to grab for event listener
  //   .classed("inactive", true)
  //   .text("Smokes (%)");

  // var healthLabel = labelsGroupY.append("text")
  //   .attr("x", 0)
  //   .attr("y", 120)
  //   .attr("value", "healthcare") // value to grab for event listener
  //   .classed("inactive", true)
  //   .text("Lacks Healthcare (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // import csv and scale x access
        xLinearScale = xScale(csvData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles and labels with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
        stateLabels = renderLabels(stateLabels, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // make x axis text bold and toggle active/inactive 
        if (chosenXAxis == "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis == 'age') {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
});