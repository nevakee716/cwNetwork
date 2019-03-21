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



    cwLayoutNetwork.prototype.clusterByHubsize = function(event) {
        var maxConnected = 4;
        var distFactor = 1000;
        var data = {
            nodes: this.nodes,
            edges: this.edges
        };
        var self = this;
        var biggest = "";
        this.networkUI.setData(data);


        var ncs,nodesToConnect = {};
        // created
        this.nodes.forEach(function(node) {
            ncs = self.networkUI.getConnectedNodes(node.id);
            if(ncs.length >= maxConnected - 1) {
                nodesToConnect[node.id] = ncs;
            }
        });
        var cc = 1;
        var nodesToConnectNew,nodeToDelete = [];

        // remove lonely node 
        while(cc !== 0) {
            cc = 0;
            nodesToConnectNew = {};
            for(var n in nodesToConnect) {
                if(nodesToConnect.hasOwnProperty(n)){
                    var ntd = [];
                    nodesToConnect[n].forEach(function(nc) {
                        if(!nodesToConnect.hasOwnProperty(nc)) {
                            ntd.push(nc);
                            cc = cc + 1;
                        }
                    }); 
                   // nodesToConnect[n] = nodesToConnect[n].diff(ntd);
                    if(nodesToConnect[n].length >= maxConnected - 1) {
                        nodesToConnectNew[n] = nodesToConnect[n];
                    }
                }
            }
            nodesToConnect = nodesToConnectNew;
        }

        var point,dist,center,distanceMax,nodesCount,cluster,nodePositions = self.networkUI.getPositions();
        
        
        // cluster by distance
        var loop = true;
        while(loop) {
            cluster = {};
            cluster.nodes = [];
            biggest = {};
            biggest.size = 0;
            nodesCount = 0;
            //determine  biggest
            for(var n in nodesToConnect) {
                if(nodesToConnect.hasOwnProperty(n)){
                    if(nodesToConnect[n].length > biggest.size) {
                        biggest.size = nodesToConnect[n].length;
                        biggest.id = n;
                        nodesCount +=1;
                    }
                }
            }
        
            distanceMax = (nodesCount *distFactor) * nodesCount * distFactor;
            center = nodePositions[biggest.id];
            // position
            for(var n in nodesToConnect) {
                if(nodesToConnect.hasOwnProperty(n)){
                    point = nodePositions[n];
                    dist = (center.x - point.x)*(center.x - point.x) + (center.y - point.y)* (center.y - point.y);
                    if(dist < distanceMax)  cluster.nodes.push(n);
                }
            }
            cluster.nodes.forEach(function(c) {
                delete nodesToConnect[c];
            });
            if(cluster.nodes.length < 2) loop = false;
            else {
                this.clusters.push(cluster);
            }
        }
    
        this.activateClusterEvent();
    };


    // Fill value in the filter
    cwLayoutNetwork.prototype.fillValueInClusterFilter = function (head,child) {
        $('select.selectNetworkClusterByGroup_' + this.nodeID + "_head").selectpicker('val',head); 
        $('select.selectNetworkClusterByGroup_' + this.nodeID + "_child").selectpicker('val',child); 

    };


    cwLayoutNetwork.prototype.clusterByGroup = function() {
        this.disableGroupClusters();
        if(this.clusterByGroupOption.head == "" || this.clusterByGroupOption.child === null || this.clusterByGroupOption.child.length < 1) {
            return;
        }

        var cluster,nodeInCluster = {},heads = [];
        var self = this;
        var i = 0;



        var nodes = this.nodes.get();
        nodes.sort(function(a, b) {
            return self.networkUI.getConnectedNodes(b.id).length - self.networkUI.getConnectedNodes(a.id).length;
        });

        nodes.forEach(function(node) {
            if((node.group.replaceAll(" ","_") === self.clusterByGroupOption.head.replaceAll(" ","_") || node.group.replaceAll(" ","_") === self.clusterByGroupOption.head.replaceAll(" ","_") + "Hidden") && !nodeInCluster.hasOwnProperty(node.id)) {
                var ncs = self.networkUI.getConnectedNodes(node.id);
                if(ncs.length > 0) {
                    cluster = {};
                    cluster.head = node.id;
                    cluster.nodes = [];
                    heads.push(node.id);
                    ncs.forEach(function(nc) {
                        if(heads.indexOf(nc) === -1) {
                            if(self.clusterByGroupOption.child.indexOf(self.nodes.get(nc).group.replace("Hidden","")) !== -1 ) { // if in child group
                                if(nodeInCluster.hasOwnProperty(nc)) { // if node already cluster
                                    if(nodeInCluster[nc].connectedNode < ncs.length) {
                                        cluster.nodes.push(nc);
                                        self.clusters[nodeInCluster[nc].i].nodes = self.clusters[nodeInCluster[nc].i].nodes.filter(function(item) { return item !== nc;});
                                        nodeInCluster[nc] = {}; 
                                        nodeInCluster[nc].i = i;
                                        nodeInCluster[nc].connectedNode = ncs.length;
                                    }
                                } else { // if node not clusterized
                                  nodeInCluster[nc] = {};  
                                  nodeInCluster[nc].connectedNode = ncs.length;
                                  nodeInCluster[nc].i = i;
                                  cluster.nodes.push(nc);
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

        var filteredClusters = [];
        self.clusters.forEach(function(cluster){ // remove cluster which are empty
            if(cluster.nodes.length > 0) filteredClusters.push(cluster);
        });
        this.clusters = filteredClusters;
        this.activateClusterEvent();
    };



    cwLayoutNetwork.prototype.disableCluster = function (cluster) {
        var self = this,changeSetNode = [],changeSetEdge = [];
        cluster.nodes.forEach(function(nodeID) {
            node = self.nodes.get(nodeID);
            node.cluster = false;
            node.physics = self.physics;
            changeSetNode.push(node);

            var connectedEdge = self.networkUI.getConnectedEdges(node.id);
            connectedEdge.forEach(function(edgeID) {
                var edge = self.edges.get(edgeID);
                if(edge.cluster == true) {
                    edge.cluster = false;
                    if(edge.hideBySelection === undefined) edge.hidden = edge.hideByZipping;
                    else edge.hidden = edge.hideByZipping || edge.hideBySelection;
                    
                    changeSetEdge.push(edge);                   
                }
            });
        });

        if(cluster.head) {
            var node = this.nodes.get(cluster.head);
            node.physics = this.physics;
            node.cluster = false;
            var group = self.networkUI.groups.get(node.group);
            if(group.shape !== "image" && group.shape !== "circularImage") {
                node.size = undefined;
                node.shape = undefined;
            }
            changeSetNode.push(node);
        }
        this.edges.update(changeSetEdge); 
        this.nodes.update(changeSetNode);
    };


    cwLayoutNetwork.prototype.activateClusterEvent = function () {
        var connectedEdge,head,node,self = this,changeSetNode=[],changeSetEdge=[];
        self.clusters.forEach(function(cluster){
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
                    if((edge.from === nodeID && cluster.nodes.indexOf(edge.to) !== -1) || (edge.to === nodeID && cluster.nodes.indexOf(edge.from) !== -1)) {
                        edge.hidden = true;
                        edge.cluster = true;
                        changeSetEdge.push(edge);
                    }
                });
            });


            // reshape the head and hide connection between head and cluster node
            if(cluster.head) {
                head = self.nodes.get(cluster.head);
                head.physics = false;
                var group = self.networkUI.groups.get(head.group);
                if(!group || (group.shape != "icon" && group.shape != "image" && group.shape != "circularImage" && group.diagram != true)) {
                    head.shape = "square";
                }
                if(group.shape !== "image" && group.shape !== "circularImage" && group.diagram != true) {
                    head.size = 0;
                }
                
                head.cluster = true;
                changeSetNode.push(head);
                connectedEdge = self.networkUI.getConnectedEdges(head.id);
                cluster.nodes.forEach(function(nodeID) {
                    connectedEdge.forEach(function(edgeID) {
                        if(edgeID.indexOf(nodeID) !== -1) {
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
}(cwAPI, jQuery));