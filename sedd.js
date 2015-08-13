var graph,
    cutoff,
    maxNodeHeight,
    sedd;

function drawSedd(data,cutoff){
  graph = data.asJson();

  //if (!checkIfDataCanBeDisplayed2(graph.dataproperties)) {
    //d3.select("body").append("p").html("The selected data is not fit for this visualisation");
    //return false;
  //}
  maxNodeHeight = 50;
  var margin = {top: 1, right: 1, bottom: 6, left: 1},
      categoryWidth = 25,
      groupWidth = 80,
      separatorHeight = 10,
      width = 1500 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom,
      colors = ["#EC008C","#00AEEF"];


  var formatNumber = d3.format(",.0f"),
      format = function(d) { return formatNumber(d) + " TWh"; };
      //color = d3.scale.category20();

  var svg = d3.select("#visualisations").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var categories = ["A","G","I","L","V","C","M","S","T","P","F","W","Y","H","K","R","D","E","N","Q",".","X"];
  var groups = [];
  groups.push(["A","G","I","L","V"]);
  groups.push(["C","M","S","T"]);
  groups.push(["P"]);
  groups.push(["F","W","Y"]);
  groups.push(["H","K","R"]);
  groups.push(["D","E","N","Q"]);
  groups.push(["."]);
  groups.push(["X"]);

  var groupNames = d3.map();
  groupNames.set(0,"aliphatic");
  groupNames.set(1,"OH or Sulfur");
  groupNames.set(2,"cyclic");
  groupNames.set(3,"aromatic");
  groupNames.set(4,"basic");
  groupNames.set(5,"acidic");
  groupNames.set(6,"blank");
  groupNames.set(7,"unknown");

  sedd = d3.sedd()
      .nodePadding(10)
      .nodeWidth(10)
      .maxNodeHeight(maxNodeHeight)
      .orderedCategories(categories)
      .groups(groups)
      .size([width - groupWidth - categoryWidth , height]);

  var path = sedd.link();

  sedd.nodes(graph.nodes)
      .links(graph.edges)
      .layout(32);

  var cutoffWeight = calculateCutoffWeight(cutoff);
  
    // append gray rectangle for background
  svg.append("g").append("rect")
      .attr("height", height)
      .attr("width",width)
      .attr("transform","translate(" + groupWidth + ")")
      .style("stroke", "gray")
      .style("opacity", "0.1");

    // draw white rectangles as separator for groups
  svg.append("g").selectAll(".separator")
      .data(groups)
      .enter().append("g")
      .attr("transform", function (d) {
        lastCat = d[d.length-1];
        y = maxNodeHeight + sedd.yPositions().get(lastCat);
        return "translate(0," + y + ")";
      })
      .append("rect")
      .attr("height", separatorHeight)
      .attr("width" , width)
      .style("stroke", "white")
      .style("fill" , "white")

  var link = svg.append("g")
      .attr("transform","translate(" + (categoryWidth + groupWidth) + ")")
      .selectAll(".link")
      .data(graph.edges.filter(function (e) { return e.properties.weight > cutoffWeight}))
      .enter().append("path")
      .attr("class", "link")
      .attr("d", path)
      .style("stroke-width", function(e) { return e.dy })
      .style("stroke", function(e) { return d3.rgb(colors[e.properties.group]);})
      .style("opacity", "0.7")
      .style("cursor","pointer")
      .on("mouseenter", selectSequence)
      .on("mouseleave", function (e) { redrawWithCutoff(cutoff);});


  var node = svg.append("g")
      .attr("transform","translate(" + (categoryWidth + groupWidth) + ")")
      .selectAll(".node")
      .data(graph.nodes.filter(function (d) { return d.properties.weight > cutoffWeight}))
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { 
          return "translate(" + d.x + "," + (d.y - d.properties.weight / 2) + ")"; 
        });

  node.append("rect")
      .attr("height", function(d) { return d.properties.weight * 2; })
      .attr("width", function(d) { return d.dx}) 
      .style("stroke", function(e) { return d3.rgb(colors[e.properties.group]);})
      .style("fill", function(e) { return d3.rgb(colors[e.properties.group]);})
      .style("opacity", "0.7")
    .append("title")
      .text(function(d) { return d.id + "\n" + format(d.properties.weight); });

  svg.append("g").selectAll(".category")
      .data(categories)
      .enter()
      .append("text")
      .attr("x", groupWidth + 4)
      .attr("y", function(d) {return sedd.yPositions().get(d) + 5;})
      .attr("font-size","10px")
      .attr("text-anchor", "start")
      .text(function(d) {return d;});

  svg.append("g").selectAll(".group")
      .data(groupNames.keys())
      .enter()
      .append("text")
      .attr("x", groupWidth - 3)
      .attr("y", function(d) {
        var firstCat = groups[d][0];
        return sedd.yPositions().get(firstCat) + 5;
      })
      .attr("font-size","10px")
      .attr("text-anchor", "end")
      .text(function(d) {return groupNames.get(d);});
}

function checkIfDataCanBeDisplayed2(dataproperties) {
  if(typeof dataproperties == "undefined" || dataproperties.length == 0) return false;
  if((dataproperties.indexOf("graph") != -1) && 
      (dataproperties.indexOf("weighted") != -1) &&
      (dataproperties.indexOf("directed") != -1)){
    return true;
  } else {return false;}
  
}

function selectSequence(d){
  d3.selectAll(".link")
    .data(graph.edges)
    .style("stroke-width", function(e) { 
        var scale = d3.scale.linear().rangeRound([0,maxNodeHeight * 2]).domain([0,graph.dataproperties.datasize]);
        var amount = sequenceContainsSequences(e,d);
        var value = sedd.weightScale(amount);
        if(e.id == "0-0-2A3H"){
          var test = sequenceContainsSequences(d,d);
        }
        return value ; 
      });

  var array = [1];
  var array2 = [4,5,6,1];
  var amount = 0;
  for(var j = 0; j < array2.length; j++){
    if(array.indexOf(array2[j]) > -1){
      amount++;
    }
  }
}

function sequenceContainsSequences(edge, selectedEdge){
  if(edge.properties.group != selectedEdge.properties.group){ 
    return 0;
  }
  var amount = 0;
  var selectedLength = selectedEdge.properties.sequenceIds.length;
  var otherSequences = edge.properties.sequenceIds;
  var selectedSequences = selectedEdge.properties.sequenceIds;

  for(var j = 0; j < otherSequences.length; j++){
    for(var i = 0; i < selectedLength; i++){
      if(otherSequences[j] === selectedSequences[i]){
        amount++;
      }
    }
  }
  return amount;
}

function redrawWithCutoff(cutoff) {
  this.cutoff = cutoff;
  var cutoffWeight = calculateCutoffWeight(cutoff);
  d3.selectAll(".link")
    .data(graph.edges)
    .style("opacity", function (e) {return e.properties.weight > cutoffWeight ? "0.7" : "0";})
    .style("stroke-width", function(e) { return e.dy; });

  d3.selectAll(".node")
    .data(graph.nodes)
    .style("opacity", function (e) {return e.properties.weight > cutoffWeight ? "0.7" : "0";});
}

function calculateCutoffWeight(cutoff){
  var cutoffScaler = d3.scale.linear().range([0,sedd.maxWeight()]).domain([0,1]);
  return cutoffScaler(cutoff);
}
