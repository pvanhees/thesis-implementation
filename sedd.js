d3.sedd = function() {
  var sedd = {},
      nodeWidth = 24,
      nodePadding = 8,
      size = [1, 1],
      nodesL = [],
      nodes = d3.map(),
      links = [];
      groups = [];
      positionAmount = 0;

  //sedd.nodeWidth = function(_) {
    //if (!arguments.length) return nodeWidth;
    //nodeWidth = +_;
    //return sedd;
  //};

  sedd.nodePadding = function(_) {
    if (!arguments.length) return nodePadding;
    nodePadding = +_;
    return sedd;
  };

  sedd.nodes = function(_) {
    if (!arguments.length) return nodesL;
    nodesL = _;
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

  sedd.layout = function(iterations) {
    computeNodeLinks();
    computeNodeValues();
    computeNodeBreadths();
    computeNodeDepths(iterations);
    computeLinkDepths();
    return sedd;
  };

  sedd.relayout = function() {
    computeLinkDepths();
    return sedd;
  };

  sedd.link = function() {
    var curvature = .5;

    function link(d) {
      var source = nodes.get(d.source);
      var target = nodes.get(d.target);
      var x0 = source.x + source.dx,
          x1 = target.x,
          xi = d3.interpolateNumber(x0, x1),
          //console.log(x0
          x2 = xi(curvature),
          x3 = xi(1 - curvature),
          y0 = source.y + d.sy + d.dy / 2,
          y1 = target.y + d.ty + d.dy / 2;
      return "M" + x0 + "," + y0
           + "C" + x2 + "," + y0
           + " " + x3 + "," + y1
           + " " + x1 + "," + y1;
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
      //if (typeof source === "number") source = link.source = nodes[link.source];
      //if (typeof target === "number") target = link.target = nodes[link.target];
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
      node.value = node.properties.weight
    });
  }

  function translateFromRangeToRange(value,leftMin,leftMax,rightMin,rightMax) {
    var leftSpan = leftMax - leftMin;
    var rightSpan = rightMax - rightMin;

    var valueScaled = (value - leftMin) / leftSpan

    return rightMin + (valueScaled * rightSpan)
  }

  // Iteratively assign the breadth (x-position) for each node.
  // Nodes are assigned the maximum breadth of incoming neighbors plus one;
  // nodes with no incoming links are assigned breadth zero, while
  // nodes with no outgoing links are assigned the maximum breadth.
  function computeNodeBreadths() {
    var remainingNodes = nodes.values(),
        nextNodes

    while (remainingNodes.length) {
      nextNodes = [];
      remainingNodes.forEach(function(node) {
        node.x = translateFromRangeToRange(node.properties.x, 0,35, 0, width);
        console.log(node.x);
        node.dx = node.properties.weight;
      });
      remainingNodes = nextNodes;
    }

    //
    //moveSinksRight(x);
    //TODO the nodewidth is subtracted from the size param, temporary fixed value
    scaleNodeBreadths((size[0] - nodeWidth));
  }

  function moveSourcesRight() {
    nodes.forEach(function(key,node) {
      if (!node.targetLinks.length) {
        node.x = d3.min(node.sourceLinks, function(d) { return d.target.x; }) - 1;
      }
    });
  }

  function moveSinksRight(x) {
    nodes.forEach(function(key,node) {
      if (!node.sourceLinks.length) {
        node.x = x - 1;
      }
    });
  }

  function scaleNodeBreadths(kx) {
    nodes.forEach(function(key,node) {
      node.x *= kx;
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
    resolveCollisions();
    for (var alpha = 1; iterations > 0; --iterations) {
      relaxRightToLeft(alpha *= .99);
      resolveCollisions();
      relaxLeftToRight(alpha);
      resolveCollisions();
    }

    function initializeNodeDepth() {
      var ky = d3.min(nodesByBreadth, function(nodes) {
        return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
      });

      nodesByBreadth.forEach(function(nodes) {
        nodes.forEach(function(node) {
          node.y = groups.indexOf(node.properties.y);
          node.dy = node.value * ky;
        });
      });

      links.forEach(function(link) {
        link.dy = link.properties.weight * ky;
      });
    }

    function relaxLeftToRight(alpha) {
      nodesByBreadth.forEach(function(nodes, breadth) {
        nodes.forEach(function(node) {
          if (node.targetLinks.length) {
            var y = d3.sum(node.targetLinks, weightedSource) 
                    / d3.sum(node.targetLinks, function(d){return d.properties.weight});
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedSource(link) {
        return center(link.source) * link.properties.weight;
      }
    }

    function relaxRightToLeft(alpha) {
      nodesByBreadth.slice().reverse().forEach(function(nodes) {
        nodes.forEach(function(node) {
          if (node.sourceLinks.length) {
            var y = d3.sum(node.sourceLinks, weightedTarget) 
                    / d3.sum(node.sourceLinks, function(d) {return d.properties.weight;});
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedTarget(link) {
        return center(nodes.get(link.target)) * link.properties.weight;
      }
    }

    function resolveCollisions() {
      nodesByBreadth.forEach(function(nodes) {
        var node,
            dy,
            y0 = 0,
            n = nodes.length,
            i;

        // Push any overlapping nodes down.
        nodes.sort(ascendingDepth);
        for (i = 0; i < n; ++i) {
          node = nodes[i];
          dy = y0 - node.y;
          if (dy > 0) node.y += dy;
          y0 = node.y + node.dy + nodePadding;
        }

        // If the bottommost node goes outside the bounds, push it back up.
        dy = y0 - nodePadding - size[1];
        if (dy > 0) {
          y0 = node.y -= dy;

          // Push any overlapping nodes back up.
          for (i = n - 2; i >= 0; --i) {
            node = nodes[i];
            dy = node.y + node.dy + nodePadding - y0;
            if (dy > 0) node.y -= dy;
            y0 = node.y;
          }
        }
      });
    }

    function ascendingDepth(a, b) {
      return a.y - b.y;
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
