/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */



/*global cwAPI, jQuery */
(function (cwApi, $) {
    "use strict";
    if(cwApi && cwApi.cwLayouts && cwApi.cwLayouts.cwLayoutNetwork) {
      var cwLayoutNetwork = cwApi.cwLayouts.cwLayoutNetwork;
    } else {
    // constructor
        var cwLayoutNetwork = function (options, viewSchema) {
            cwApi.extend(this, cwApi.cwLayouts.CwLayout, options, viewSchema); // heritage
            cwApi.registerLayoutForJSActions(this); // execute le applyJavaScript après drawAssociations
            this.construct(options);
        };
    }

    cwLayoutNetwork.prototype.removeLonelyButtonAction  = function (event) {
        var self = this,changeSetNode = [];
        this.nodes.forEach(function(node) {
            var ncs = self.networkUI.getConnectedNodes(node.id);
            if(ncs.length == 0) {
                changeSetNode.push(node.id);
            }
        });   
        self.removeNodes(changeSetNode);  

    };

    cwLayoutNetwork.prototype.RemoveNodeEvent  = function (event) {
        var nodeID = event.data.d.nodes[0];
        this.removeNodes([nodeID]);
    };

    cwLayoutNetwork.prototype.removeNodes = function (nodesID) {
        var self = this,changeSetNode = [];

        nodesID.forEach(function(nodeID) {
            var node;
            if(nodeID.hasOwnProperty("id")) {
                node = self.nodes.get(nodeID.id);
            } else {
                node = self.nodes.get(nodeID);
            }
            if(node) {
                if(node.cluster) {
                    var newClusters = [];
                    self.clusters.forEach(function(cluster){
                        if(cluster.head === node.id) {
                            self.disableCluster(cluster);
                        } else {
                            cluster.nodes = cluster.nodes.filter(function(item) { return item !== node.id;});
                            var connectedEdge = self.networkUI.getConnectedEdges(node.id);
                            connectedEdge.forEach(function(edgeID) {
                                var edge = self.edges.get(edgeID);
                                if(edge.cluster == true) {
                                    edge.cluster = false;
                                    edge.hidden = edge.hideByZipping;
                                    self.edges.update(edge);                    
                                }
                            });

                            if(cluster.nodes.length === 0) {
                                self.disableCluster(cluster);
                            } else {
                                newClusters.push(cluster);
                            }                  
                        }
                    });
                    self.clusters = newClusters;
                }
                changeSetNode.push(node.id);
                self.network.hide(node.id.split("#")[0],node.group.replace("Hidden",""));
                $('select.selectNetworkPicker_' + self.nodeID + "." + node.group.replaceAll(" ","_").replace("Hidden","")).each(function( index ) { // put values into filters
                    if($(this).val()) {
                        $(this).selectpicker('val',$(this).val().filter(function(item) { return item !== node.name.replaceAll("\n"," ");}));
                    }
                });
            }
        });
        self.nodes.remove(changeSetNode);
    };

    // dealing with adding node with the menu
    cwLayoutNetwork.prototype.RemoveClosesNodes = function (event) {
        var nodeID = event.data.d.nodes[0];
        var connected = this.networkUI.getConnectedNodes(nodeID);
        if(connected) {
            connected.push(nodeID);
            this.removeNodes(connected);
        } else {
            this.removeNodes([nodeID]);
        }
        
    };
    
    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));