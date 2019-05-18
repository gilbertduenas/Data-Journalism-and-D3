// declare plot dimensions
var svgWidth = 900;
var svgHeight = 500;

var margin = {
  top: 0,
  right: 0,
  bottom: 110,
  left: 110
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// select the chart div and add an svg
var svg = d3.select(".chart")
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
    d3.max(csvData, d => d[chosenXAxis]) * 1.2])
    .range([0, width]);
  return xLinearScale;
}

// update scale of y axis when selecting obesity, smokes, or healthcare
function yScale(csvData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(csvData, d => d[chosenYAxis]) * 0.8,
    d3.max(csvData, d => d[chosenYAxis]) * 1.2])
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

// update y axis when selecting obesity, smokes, or health 
function renderAxesY(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  return yAxis;
}

// circles and labels group travel horizontally and vertically
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}

function renderLabels(stateLabels, newXScale, newYScale, chosenXAxis, chosenYAxis) {
  stateLabels.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));
  return stateLabels;
}

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
  if (chosenYAxis === "obesity") {
    var labelY = "Obesity (%):";
  }
  else if (chosenYAxis === 'smokes') {
    var labelY = "Smokes (%):";
  }
  else {
    var labelY = 'Lacks Health Insurance (%):';
  }

  // create the tooltip object
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(d => {
      return (`${d.state}
      <br>${label} ${d[chosenXAxis]}
      <br>${labelY} ${d[chosenYAxis]}`);
    });

  // call the tooltip when the mouse is over circlesGroup
  circlesGroup.call(toolTip)
  circlesGroup.on("mouseover", d => {
    toolTip.show(d);
  })
    // onmouseout event
    .on("mouseout", d => {
      toolTip.hide(d);
    });
  return circlesGroup;
}

// TO DO.......................................................................
// figure out how to mouse over stateLabels or merge state labels into circlesGroup

// update state labels with new tooltip
// function updateToolTip2(chosenXAxis, chosenYAxis, stateLabels) {
//   //determine axes selected
//   // x axis
//   if (chosenXAxis === "poverty") {
//     var label = "Poverty (%):";
//   }
//   else if (chosenXAxis === 'age') {
//     var label = "Median Age:";
//   }
//   else {
//     var label = 'Median Income:';
//   }
//   // y axis
//   if (chosenYAxis === "obesity") {
//     var labelY = "Obesity (%):";
//   }
//   else if (chosenYAxis === 'smokes') {
//     var labelY = "Smokes (%):";
//   }
//   else {
//     var labelY = 'Lacks Health Insurance (%):';
//   }

//   // create the tooltip object
//   var toolTip2 = d3.tip()
//     .attr("class", "tooltip")
//     .offset([80, -60])
//     .html(d => {
//       return (`${d.state}
//       <br>${label} ${d[chosenXAxis]}
//       <br>${labelY} ${d[chosenYAxis]}`);
//     });

//   // call the tooltip when the mouse is over stateLabels
//   stateLabels.call(toolTip2)
//   stateLabels.on("mouseover", d => {
//     toolTip2.show(d);
//   })
//     // onmouseout event
//     .on("mouseout", d => {
//       toolTip2.hide(d);
//     });
//   return stateLabels;
// }

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv", (err, csvData) => {
  if (err) throw err;

  // parse data
  csvData.forEach(d => {

    // grouped by X values
    d.poverty = +d.poverty;
    d.age = +d.age;
    d.income = +d.income;

    // grouped by Y values
    d.obesity = +d.obesity;
    d.smokes = +d.smokes;
    d.healthcare = +d.healthcare;
  });

  // create linear scale for x and y
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
    .text(d => {
      return d.abbr
    });

  // group for x axis labels - poverty, age, income
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty")
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age")
    .classed("inactive", true)
    .text("Median Age");

  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income")
    .classed("inactive", true)
    .text("Median Income");

  // group for y axis labels - obesity, smokes, healthcare
  var labelsGroupY = chartGroup.append("g")
    .attr("class", "axis-text")
    .attr("transform", "rotate(-90)");

  var obesityLabel = labelsGroupY.append("text")
    .attr("x", -200)
    .attr("y", -80)
    .attr("value", "obesity")
    .classed("active", true)
    .text("Obesity (%)");

  var smokesLabel = labelsGroupY.append("text")
    .attr("x", -200)
    .attr("y", -60)
    .attr("value", "smokes")
    .classed("inactive", true)
    .text("Smokes (%)");

  var healthLabel = labelsGroupY.append("text")
    .attr("x", -200)
    .attr("y", -40)
    .attr("value", "healthcare")
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");

  // generate tool tip
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  // var stateLabels = updateToolTip2(chosenXAxis, chosenYAxis, stateLabels);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", (i, nodes) => {
      // get value of selection
      var value = d3.select(nodes[i]).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // import csv and scale x access
        xLinearScale = xScale(csvData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles and labels with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
        stateLabels = renderLabels(stateLabels, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
        // stateLabels = updateToolTip2(chosenXAxis, chosenYAxis, stateLabels);

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

  // y axis labels event listener
  labelsGroupY.selectAll("text")
    .on("click", (d, i, nodes) => {
      // get value of selection
      var value = d3.select(nodes[i]).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenYAxis with value
        chosenYAxis = value;

        // import csv and scale y access
        yLinearScale = yScale(csvData, chosenYAxis);

        // updates y axis with transition
        yAxis = renderAxesY(yLinearScale, yAxis);

        // updates circles and labels with new y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
        stateLabels = renderLabels(stateLabels, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
        // stateLabels = updateToolTip2(chosenXAxis, chosenYAxis, stateLabels);

        // make y axis text bold and toggle active/inactive 
        if (chosenYAxis == "obesity") {
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis == "smokes") {
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          healthLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
});