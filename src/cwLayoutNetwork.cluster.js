/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */

/*global cwAPI, jQuery */
(function(cwApi, $) {
  "use strict";
  if (cwApi && cwApi.cwLayouts && cwApi.cwLayouts.cwLayoutNetwork) {
    var cwLayoutNetwork = cwApi.cwLayouts.cwLayoutNetwork;
  } else {
    // constructor
    var cwLayoutNetwork = function(options, viewSchema) {
      cwApi.extend(this, cwApi.cwLayouts.CwLayout, options, viewSchema); // heritage
      cwApi.registerLayoutForJSActions(this); // execute le applyJavaScript après drawAssociations
      this.construct(options);
    };
  }

  // Fill value in the filter
  cwLayoutNetwork.prototype.fillValueInClusterFilter = function(head, child) {
    $("select.selectNetworkClusterByGroup_" + this.nodeID + "_head").selectpicker("val", head);
    $("select.selectNetworkClusterByGroup_" + this.nodeID + "_child").selectpicker("val", child);
  };

  cwLayoutNetwork.prototype.clusterByGroup = function() {
    this.disableGroupClusters();

    var self = this;
    // sorting node to have the cluster removing the most links
    var nodes = self.nodes.get();
    nodes.sort(function(a, b) {
      return self.networkUI.getConnectedNodes(b.id).length - self.networkUI.getConnectedNodes(a.id).length;
    });

    Object.keys(this.clusterByGroupOption).forEach(function(headGroupCluster) {
      if (self.clusterByGroupOption[headGroupCluster] && self.clusterByGroupOption[headGroupCluster].length == 0) return;
      let clusterOption = self.clusterByGroupOption[headGroupCluster];
      var cluster,
        nodeInCluster = {},
        heads = [];

      var i = 0;

      nodes.forEach(function(headNode) {
        if ((headNode.group.replaceAll(" ", "_") === headGroupCluster.replaceAll(" ", "_") || headNode.group.replaceAll(" ", "_") === headGroupCluster.replaceAll(" ", "_") + "Hidden") && !nodeInCluster.hasOwnProperty(headNode.id)) {
          var ncs = self.networkUI.getConnectedNodes(headNode.id);
          if (ncs.length > 0) {
            cluster = {};
            cluster.head = headNode.id;
            cluster.headGroup = headGroupCluster;
            cluster.nodes = [];
            cluster.groups = {};
            clusterOption.forEach(function(g) {
              cluster.groups[g] = [];
            });
            heads.push(headNode.id);
            ncs.forEach(function(nc) {
              if (heads.indexOf(nc) === -1) {
                let node = self.nodes.get(nc);
                if (clusterOption.indexOf(node.group.replace("Hidden", "").replace(" ", "_")) !== -1) {
                  // if in child group
                  if (nodeInCluster.hasOwnProperty(nc)) {
                    // if node already cluster
                    if (nodeInCluster[nc].connectedNode < ncs.length) {
                      cluster.groups[node.group.replace("Hidden", "").replaceAll(" ", "_")].push(nc);
                      self.clusters[nodeInCluster[nc].i].nodes = self.clusters[nodeInCluster[nc].i].nodes.filter(function(item) {
                        return item !== nc;
                      });
                      nodeInCluster[nc] = {};
                      nodeInCluster[nc].i = i;
                      nodeInCluster[nc].connectedNode = ncs.length;
                    }
                  } else {
                    // if node not clusterized
                    nodeInCluster[nc] = {};
                    nodeInCluster[nc].connectedNode = ncs.length;
                    nodeInCluster[nc].i = i;
                    cluster.groups[node.group.replace("Hidden", "").replaceAll(" ", "_")].push(nc);
                  }
                }
              }
            });
            cluster.init = true;
            self.clusters.push(cluster);
            i++;
          }
        }
      });
    });

    var filteredClusters = [];
    self.clusters.forEach(function(cluster) {
      // remove cluster which are empty
      // and sort by group
      self.clusterByGroupOption[cluster.headGroup].forEach(function(g) {
        cluster.groups[g].sort(function(a, b) {
          return self.nodes.get(b).label - self.nodes.get(a).label;
        });
        cluster.groups[g].forEach(function(n) {
          cluster.nodes.push(n);
        });
      });
      if (cluster.nodes.length > 0) filteredClusters.push(cluster);
    });
    this.clusters = filteredClusters;
    this.activateClusterEvent();
  };

  cwLayoutNetwork.prototype.disableCluster = function(cluster) {
    var self = this,
      changeSetNode = [],
      changeSetEdge = [];
    cluster.nodes.forEach(function(nodeID) {
      node = self.nodes.get(nodeID);
      node.cluster = false;
      node.physics = self.physics;
      changeSetNode.push(node);

      var connectedEdge = self.networkUI.getConnectedEdges(node.id);
      connectedEdge.forEach(function(edgeID) {
        var edge = self.edges.get(edgeID);
        if (edge.cluster == true) {
          edge.cluster = false;
          if (edge.hideBySelection === undefined) edge.hidden = edge.hideByZipping;
          else edge.hidden = edge.hideByZipping || edge.hideBySelection;

          changeSetEdge.push(edge);
        }
      });
    });

    if (cluster.head) {
      var node = this.nodes.get(cluster.head);
      node.physics = this.physics;
      node.cluster = false;
      var group = self.networkUI.groups.get(node.group);
      if (group.shape !== "image" && group.shape !== "circularImage") {
        node.size = undefined;
        node.shape = undefined;
      }
      changeSetNode.push(node);
    }
    this.edges.update(changeSetEdge);
    this.nodes.update(changeSetNode);
  };

  cwLayoutNetwork.prototype.activateClusterEvent = function() {
    var connectedEdge,
      head,
      node,
      self = this,
      changeSetNode = [],
      changeSetEdge = [];
    self.clusters.forEach(function(cluster) {
      cluster.nodes.forEach(function(nodeID) {
        node = self.nodes.get(nodeID);
        node.physics = false;
        node.cluster = true;
        changeSetNode.push(node);
        self.nodes.update(node);
      });

      // hide connection inside the cluster
      cluster.nodes.forEach(function(nodeID) {
        connectedEdge = self.networkUI.getConnectedEdges(nodeID);
        connectedEdge.forEach(function(edgeID) {
          var edge = self.edges.get(edgeID);
          if ((edge.from === nodeID && cluster.nodes.indexOf(edge.to) !== -1) || (edge.to === nodeID && cluster.nodes.indexOf(edge.from) !== -1)) {
            edge.hidden = true;
            edge.cluster = true;
            changeSetEdge.push(edge);
          }
        });
      });

      // reshape the head and hide connection between head and cluster node
      if (cluster.head) {
        head = self.nodes.get(cluster.head);
        head.physics = false;
        var group = self.networkUI.groups.get(head.group);
        if (!group || (group.shape != "icon" && group.shape != "image" && group.shape != "circularImage" && group.diagram != true)) {
          head.shape = "square";
        }
        if (group.shape !== "image" && group.shape !== "circularImage" && group.diagram != true) {
          head.size = 0;
        }

        head.cluster = true;
        changeSetNode.push(head);
        connectedEdge = self.networkUI.getConnectedEdges(head.id);
        cluster.nodes.forEach(function(nodeID) {
          connectedEdge.forEach(function(edgeID) {
            if (edgeID.indexOf(nodeID) !== -1) {
              var edge = self.edges.get(edgeID);
              edge.hidden = true;
              edge.cluster = true;
              changeSetEdge.push(edge);
            }
          });
        });
      }
    });
    this.edges.update(changeSetEdge);
    this.nodes.update(changeSetNode);
  };

  cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
})(cwAPI, jQuery);
