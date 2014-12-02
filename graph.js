// Generated by CoffeeScript 1.8.0
(function() {
  this.JsonGraph = (function() {
    var edgeObjects, edgeProperties, edges, nodeProperties, nodes;

    nodes = [];

    edges = [];

    edgeObjects = [];

    nodeProperties = {};

    edgeProperties = {};

    function JsonGraph(json) {
      var edge, node, _i, _j, _len, _len1, _ref, _ref1;
      this.json = json;
      nodes = (function() {
        var _i, _len, _ref, _results;
        _ref = json.nodes;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          node = _ref[_i];
          _results.push(node.id);
        }
        return _results;
      })();
      edges = (function() {
        var _i, _len, _ref, _results;
        _ref = json.edges;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          edge = _ref[_i];
          _results.push(edge.id);
        }
        return _results;
      })();
      _ref = json.edges;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        edge = _ref[_i];
        edgeObjects.push({
          "id": edge.id,
          "source": edge.source,
          "target": edge.target
        });
        edgeProperties[edge.id] = edge.properties;
      }
      _ref1 = json.nodes;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        node = _ref1[_j];
        nodeProperties[node.id] = node.properties;
      }
    }

    JsonGraph.prototype.getNodes = function() {
      return nodes;
    };

    JsonGraph.prototype.getEdges = function() {
      return edges;
    };

    JsonGraph.prototype.getEdgesAsObjects = function() {
      return edgeObjects;
    };

    JsonGraph.prototype.getNodeProperties = function(key) {
      return nodeProperties[key];
    };

    JsonGraph.prototype.getNodeProperty = function(key, property) {
      return nodeProperties[key][property];
    };

    JsonGraph.prototype.getEdgeProperties = function(key) {
      return edgeProperties[key];
    };

    JsonGraph.prototype.getEdgeProperty = function(key, property) {
      return edgeProperties[key][property];
    };

    JsonGraph.prototype.asMatrix = function(valueProperty) {
      var amount, edge, matrix, nodeC, nodeR, row, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
      if (valueProperty == null) {
        valueProperty = "PropertyEdgeAmount";
      }
      matrix = [];
      _ref = this.json.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        nodeR = _ref[_i];
        row = [];
        _ref1 = this.json.nodes;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          nodeC = _ref1[_j];
          amount = 0;
          _ref2 = this.json.edges;
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            edge = _ref2[_k];
            if ((edge.source === nodeR.id && edge.target === nodeC.id) || (edge.source === nodeC.id && edge.target === nodeR.id)) {
              if (valueProperty === "PropertyEdgeAmount") {
                amount++;
              } else {
                amount = edge.properties[valueProperty];
              }
            }
          }
          row.push(amount);
        }
        matrix.push(row);
      }
      return matrix;
    };

    return JsonGraph;

  })();

}).call(this);
