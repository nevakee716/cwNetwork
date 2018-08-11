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
    // Adding group at start
    cwLayoutNetwork.prototype.activateStartingGroup = function (event) {
        var self = this;
        this.groupToSelectOnStart.forEach(function(group) {
            $('.selectNetworkPicker_' + self.nodeID + "." + group.replaceAll(" ","_")).selectpicker('selectAll');
        });
    };

    // Adding group at start
    cwLayoutNetwork.prototype.activateStartingEdgeType = function (edgeTypeToSelect) {
        var self = this;
        var values = [],changeSet = [];
        if(edgeTypeToSelect === undefined && this.edgeTypeToSelect) edgeTypeToSelect = this.edgeTypeToSelect;
        else edgeTypeToSelect = [];
        edgeTypeToSelect.forEach(function(edgeTypeScriptname) {
            if(self.edgeConfiguration.hasOwnProperty(edgeTypeScriptname)) {
                self.edgeConfiguration[edgeTypeScriptname].show = true;
                changeSet = changeSet.concat(self.showEdgeByScriptname(edgeTypeScriptname));
                values.push(self.edgeConfiguration[edgeTypeScriptname].label);
            }
        });
        this.edges.update(changeSet);
        $('.selectNetworkEdge_' + this.nodeID).selectpicker('val',values);
    };


    // Activate cluster from option
    cwLayoutNetwork.prototype.activateStartingCluster = function (event) {
        var self = this;
        self.fillValueInClusterFilter(this.clusterByGroupOption.head,this.clusterByGroupOption.child);
        self.clusterByGroup();
    };


       



    // Adding all group
    cwLayoutNetwork.prototype.activateAllGroup = function (event) {
        var self = this;
        this.networkUI.groups.groupsArray.forEach(function(group) {
            $('.selectNetworkPicker_' + self.nodeID + "." + group.replaceAll(" ","_")).selectpicker('selectAll');
        });
    };


    cwLayoutNetwork.prototype.disableGroupClusters = function () {
        var node,self = this;
        this.networkUI.off("afterDrawing");
        self.clusters.forEach(function(cluster){
            self.disableCluster(cluster);
        });
        this.clusters = [];
    };

    // Remove all group
    cwLayoutNetwork.prototype.deActivateAllGroup = function (event) {
        var OT,changeset = [], self = this;
        
        this.disableGroupClusters();
        for(OT in self.network.objectTypeNodes) {
            if(self.network.objectTypeNodes.hasOwnProperty(OT)) {
                changeset = changeset.concat(self.network.SetAllAndGetNodesObject(false,OT));
                $('.selectNetworkPicker_' + self.nodeID + "." + OT.replaceAll(" ","_")).selectpicker('val',"");                
            }
        }
        this.nodes.remove(changeset);
    };



    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));