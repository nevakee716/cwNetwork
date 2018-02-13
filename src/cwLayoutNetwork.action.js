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


    // Adding all group
    cwLayoutNetwork.prototype.activateAllGroup = function (event) {
        var self = this;
        this.networkUI.groups.groupsArray.forEach(function(group) {
            $('.selectNetworkPicker_' + self.nodeID + "." + group.replaceAll(" ","_")).selectpicker('selectAll');
        });
    };

    // Enable External Filter
    cwLayoutNetwork.prototype.activateStartingExternalFilter = function () {
        if(this.externalFilterToSelectOnStart) {
            var filterName = this.externalFilterToSelectOnStart[0],id = parseInt(this.externalFilterToSelectOnStart[1]);

            this.externalFilters[filterName].selectedId = parseInt(this.externalFilterToSelectOnStart[1]);
            this.filterExternalAssociation(filterName,id);           
        }

    };

    cwLayoutNetwork.prototype.disableGroupClusters = function () {
        var node,self = this;
        self.clusters.forEach(function(cluster){
            self.disableCluster(cluster);
        });
        this.clusters = [];
    };

    // Adding group at start
    cwLayoutNetwork.prototype.deActivateAllGroup = function (event) {
        var changeset = [], self = this;
        
        this.disableGroupClusters();
        this.networkUI.groups.groupsArray.forEach(function(group) {
            changeset = changeset.concat(self.network.SetAllAndGetNodesObject(false,group));
            $('.selectNetworkPicker_' + self.nodeID + "." + group.replaceAll(" ","_")).selectpicker('val',"");
        });
        this.nodes.remove(changeset);
    };

    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));