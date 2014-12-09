var margin = {top: 1, right: 1, bottom: 6, left: 1},
    width = 1800 - margin.left - margin.right,
    height = 900 - margin.top - margin.bottom;

var formatNumber = d3.format(",.0f"),
    format = function(d) { return formatNumber(d) + " TWh"; },
    color = d3.scale.category20();

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var sedd = d3.sedd()
    .nodePadding(10)
      .groups(["A","G","I","L","V","C","M","S","T","P","F","W","Y","H","K","R","D","E","N","Q",".","X"])
    .size([width, height]);

var path = sedd.link();

d3.json("http://localhost:8000/graph.json", function(error,graph) {
  sedd.nodes(graph.nodes)
      .links(graph.edges)
      .layout(32);

  var link = svg.append("g").selectAll(".link")
      .data(graph.edges)
      .enter().append("path")
      .attr("class", "link")
      .attr("d", path)
      .style("stroke-width", function(e) { return e.properties.weight; })

  //link.append("title")
   //   .text(function(e) { return e.source.id + " → " + e.target.id + "\n" + format(e.properties.weight); });

  var node = svg.append("g").selectAll(".node")
      .data(graph.nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { 
          d.id
          return "translate(" + d.x + "," + d.y + ")"; 
        })
      //.call(d3.behavior.drag()
      //.origin(function(d) { return d; })
      //.on("dragstart", function() { this.parentNode.appendChild(this); })
      //.on("drag", dragmove));

  node.append("rect")
      .attr("height", function(d) { return d.value; })
      .attr("width", function(d) { return 8}) // random chosen value to test
      .style("fill", function(d) { return d.color = "#FFEC008C"; })
      .style("stroke", function(d) { return d.color; })
    .append("title")
      .text(function(d) { return d.id + "\n" + format(d.properties.weight); });

  //node.append("text")
      //.attr("x", -6)
      //.attr("y", function(d) { return d.value / 2; })
      //.attr("dy", ".35em")
      //.attr("text-anchor", "end")
      //.attr("transform", null)
      //.text(function(d) { return d.id; })
    //.filter(function(d) { return d.x < width / 2; })
      //.attr("x", function(d) { return d.value + 6})
      //.attr("text-anchor", "start");

  //function dragmove(d) {
   // d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
    //sedd.relayout();
    //link.attr("d", path);
  //}
});

