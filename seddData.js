d3.sedd = function() {
  var sedd = {},
      nodeWidth = 24,
      maxNodeHeight = 10,
      nodePadding = 8,
      size = [1, 1],
      nodesL = [],
      nodes = d3.map(),
      links = [],
      categories = [],
      groups = [],
      yPositions = d3.map(),
      orderedCategories = [],
      maxWeight = 0,
      positionAmount = 0;

  sedd.nodeWidth = function(_) {
    if (!arguments.length) return nodeWidth;
    nodeWidth = +_;
    return sedd;
  };

  sedd.maxNodeHeight = function(_) {
    if (!arguments.length) return maxNodeHeight;
    maxNodeHeight = +_;
    return sedd;
  };

  sedd.nodePadding = function(_) {
    if (!arguments.length) return nodePadding;
    nodePadding = +_;
    return sedd;
  };

  sedd.nodes = function(_) {
    if (!arguments.length) return nodesL;
    nodesL = _;
    nodes.forEach(function(node) {
      var category = node.properties.category;
      if (categories.indexOf(category) === -1) {
        categories.push(category);
      }
    });
    return sedd;
  };

  sedd.links = function(_) {
    if (!arguments.length) return links;
    links = _;
    return sedd;
  };

  sedd.size = function(_) {
    if (!arguments.length) return size;
    size = _;
    return sedd;
  };

  sedd.yPositions = function() {
    return yPositions;
  }

  sedd.orderedCategories = function(_) {
    if(!arguments.length) return orderedCategories;
    orderedCategories = _;
    return sedd;
  };

  sedd.groups = function(_) {
    if(!arguments.length) return groups;
    groups = _;
    return sedd;
  };

  sedd.positionAmount = function(_) {
    if(!arguments.length) return positionAmount;
    positionAmount = _;
    return sedd;
  };

  sedd.maxWeight = function() {
    return maxWeight;
  };
  

  sedd.layout = function(iterations) {
    computeNodeLinks();
    computeNodeValues();
    computeNodeBreadths();
    computeYPositions();
    computeNodeDepths(iterations);
    computeLinkDepths();
    return sedd;
  };

  sedd.relayout = function() {
    computeLinkDepths();
    return sedd;
  };

  sedd.link = function() {
    var curvature = .2;

    function link(d) {
      var source = nodes.get(d.source);
      var target = nodes.get(d.target);
      var srcHeight = nodes.get(d.source).properties.weight;
      var destHeight = nodes.get(d.target).properties.weight;
      var x0 = source.x + nodeWidth,
          x1 = target.x,
          //xi = d3.scale.linear().range([x0,x1]).domain([0,1]);
      //var x2 = xi(curvature),
          //x3 = xi(1 - curvature),
          y0 = source.y + srcHeight /2,
          y1 = target.y + destHeight /2;
      return "M" + x0 + "," + y0
           + "L" + x1 + "," + y1
           //+ " " + x3 + "," + y1
           //+ " " + x1 + "," + y1;
    }

    link.curvature = function(_) {
      if (!arguments.length) return curvature;
      curvature = +_;
      return link;
    };

    return link;
  };

  // Populate the sourceLinks and targetLinks for each node.
  // Also, if the source and target are not objects, assume they are indices.
  function computeNodeLinks() {
    nodesL.forEach(function(node) {
      node.sourceLinks = [];
      node.targetLinks = [];
      nodes.set(node.id,node);
    });
    links.forEach(function(link) {
      var source = link.source,
          target = link.target;
          var n = nodes.get(link.source)
          if(typeof n === 'undefined'){
            alert(link.source);
          }
          n.sourceLinks.push(link);
          nodes.get(link.target).targetLinks.push(link);
    });
  }

  // Compute the value (size) of each node by getting their weight.
  function computeNodeValues() {
    nodes.forEach(function(key,node) {
      //node.value = Math.min(maxNodeHeight,node.properties.weight);
      node.value = node.properties.weight;
      if (node.value > maxWeight){
        maxWeight = node.value;
      }
    });
  }

  //scale the x-positions of the nodes according to the width of the visualization
  function computeNodeBreadths() {
    var remainingNodes = nodes.values(),
        nextNodes

    while (remainingNodes.length) {
      nextNodes = [];
      remainingNodes.forEach(function(node) {
        node.x = xScale(node.properties.x);
        node.dx = nodeWidth;
      });
      remainingNodes = nextNodes;
    }
  }

  sedd.yScale = function yScale(d){
    var scale = d3.scale.linear().rangeRound([10,size[1]]).domain([0,orderedCategories.length]);
    return scale(d);
  }

  function xScale(d){
    var scale = d3.scale.linear().rangeRound([1,size[0] - nodeWidth]).domain([0,35]);
    return scale(d);
  }

  sedd.weightScale = function weightScale(e){
    scale = d3.scale.linear().rangeRound([0.1,maxNodeHeight]).domain([0,graph.dataproperties.datasize]);
    return scale(e);
  }

  function computeYPositions() {
    var offset = 10
    var drawingHeight = size[1] - groups.length * offset;
    var scale = d3.scale.linear().rangeRound([10,drawingHeight]).domain([0,orderedCategories.length]);

    orderedCategories.forEach(function(d) {
      var baseValue = scale(orderedCategories.indexOf(d));
      var groupNb = 0;
      for (i = 0; i < groups.length; i++) {
        if (groups[i].indexOf(d) !== -1){
          groupNb = i;
        }
      }
      var value = (baseValue + (groupNb * offset));
      yPositions.set(d, value);
    });
   }

  function computeNodeDepths(iterations) {
    var nodesByBreadth = d3.nest()
        .key(function(d) { return d.x; })
        .sortKeys(d3.ascending)
        .entries(nodes.values())
        .map(function(d) { return d.values; });

    //
    initializeNodeDepth();
    function initializeNodeDepth() {
      var ky = d3.min(nodesByBreadth, function(nodes) {
        return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
      });

      nodesByBreadth.forEach(function(nodes) {
        nodes.forEach(function(node) {
          var index = orderedCategories.indexOf(node.properties.category);
          if (index === -1){
            index = orderedCategories.length;
          }
          node.y = yPositions.get(node.properties.category);
          //node.dy = node.value * ky;
        });
      });

      links.forEach(function(link) {
        //link.dy = link.properties.weight * ky;
        seqNb = link.properties.sequenceIds.length;
        link.dy = sedd.weightScale(seqNb);
      });
    }
  }

  function computeLinkDepths() {
    nodes.forEach(function(key,node) {
      node.sourceLinks.sort(ascendingTargetDepth);
      node.targetLinks.sort(ascendingSourceDepth);
    });
    nodes.forEach(function(key,node) {
      var sy = 0, ty = 0;
      node.sourceLinks.forEach(function(link) {
        link.sy = sy;
        sy += link.dy;
      });
      node.targetLinks.forEach(function(link) {
        link.ty = ty;
        ty += link.dy;
      });
    });

    function ascendingSourceDepth(a, b) {
      return a.source.y - b.source.y;
    }

    function ascendingTargetDepth(a, b) {
      return a.target.y - b.target.y;
    }
  }

  function center(node) {
    return node.y + node.dy / 2;
  }

  function value(link) {
    return link.value;
  }

  return sedd;
};
