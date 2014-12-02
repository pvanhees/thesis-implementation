xobj = new XMLHttpRequest()
xobj.open("GET", 'graph.json',true)
xobj.setRequestHeader("Content-type", "application/json")
xobj.onreadystatechange =  ->
  if xobj.readyState is 4 and xobj.status is 200 
    json = JSON.parse(xobj.responseText)
    load(json)
    
xobj.send()

load = (json) ->
  graph = new JsonGraph(json)
  color = d3.scale.category20()

  width = 1600
  height = 900
  colad3 = cola.d3adaptor()
          #.linkDistance(30)
          .size([width, height])

  svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
  #reform jsongraph to cola acceptable format
  graphNodes = []
  graphEdges = []
  nodeIndices = {}

  graph.getNodes().forEach((node, i) ->
    graphNodes.push({"name": node, "group": graph.getNodeProperty(node, "y")})
    nodeIndices[node] = i
  )
  graph.getEdgesAsObjects().forEach((e) ->
    graphEdges.push({"target": nodeIndices[e.target], "source": nodeIndices[e.source], "value": graph.getEdgeProperty(e.id, "weight")})
  )

  colaGraph = {"nodes": graphNodes, "links":graphEdges}
  colad3.nodes(colaGraph.nodes)
      .links(colaGraph.links)
      #.symmetricDiffLinkLengths(5)
      .linkDistance(40)
      .charge(-300)
      .start(30)
  # build the arrow.
  svg.append("svg:defs").selectAll("marker")
      .data(["end"])      #Different link/path types can be defined here
      .enter().append("svg:marker")    # This section adds in the arrows
      .attr("id", String)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", -1.5)
      .attr("markerWidth", 3)
      .attr("markerHeight", 3)
      .attr("orient", "auto")
    .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5")

# add the links and the arrows
  path = svg.append("svg:g").selectAll("path")
    .data(colad3.links())
    .enter().append("svg:path")
    .attr("class", "link")
    .attr("marker-end", "url(#end)")

  #link = svg.selectAll(".link")
          #.data(colaGraph.links)
          #.enter().append("line")
          #.attr("class", "link")
          #.style("stroke", "#999")
          #.style("stroke-width", (d) -> Math.sqrt(d.value) )
  node = svg.selectAll(".node")
          .data(colad3.nodes())
          .enter().append("g")
          .attr("class", "node")
          .attr("r", 5)
          .call(colad3.drag)

  node.append("title")
    .text((d) -> d.name)

  colad3.on("tick", -> 
    path.attr("d", (d) ->
      dx = d.target.x - d.source.x
      dy = d.target.y - d.source.y
      dr = Math.sqrt(dx * dx + dy * dy)
      "M" + 
        d.source.x + "," + 
        d.source.y + "A" + 
        dr + "," + dr + " 0 0,1 " + 
        d.target.x + "," + 
        d.target.y;
    )

    node.attr("transform", (d) ->
  	    return "translate(" + d.x + "," + d.y + ")" )
  )
