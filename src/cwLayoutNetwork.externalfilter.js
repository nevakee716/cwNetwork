/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */



/*global cwAPI, jQuery */
(function (cwApi, $) {
    "use strict";
    if(cwApi && cwLayouts && cwApi.cwLayouts.cwLayoutNetwork) {
      var cwLayoutNetwork = cwApi.cwLayouts.cwLayoutNetwork;
    } else {
    // constructor
        var cwLayoutNetwork = function (options, viewSchema) {
            cwApi.extend(this, cwApi.cwLayouts.CwLayout, options, viewSchema); // heritage
            cwApi.registerLayoutForJSActions(this); // execute le applyJavaScript après drawAssociations
            this.construct(options);
        };
    }

   cwLayoutNetwork.prototype.setAllExternalFilter = function () {
        for(var extF in this.externalFilters) {
            if(this.externalFilters.hasOwnProperty(extF)) {
                if(this.externalFilters[extF].selectedId !== 0) { // On ne selectionne pas la case "None"
                    this.filterExternalAssociation(this.externalFilters[extF].label,this.externalFilters[extF].selectedId); 
                } 
            }
        }
    };


    cwLayoutNetwork.prototype.setExternalFilterToNone = function () {
        $('select.selectNetworkExternal_' + this.nodeID).selectpicker('val','None'); 
        for(var extF in this.externalFilters) {
            if(this.externalFilters.hasOwnProperty(extF)) {
                this.externalFilters[extF].selectedId = 0; 
            }
        }
    };

    cwLayoutNetwork.prototype.filterExternalAssociation = function (filterName,id) {
        var changeSet,nodesToHighlight,nodesIdToHighlight,edgesToHighlight,edgesIdToHighlight,updateArray;
        this.updatePhysics();
        edgesToHighlight = this.externalFilters[filterName].getEdgesToBeFiltered(id); // on recupere les nodes qui sont associés à la data filtré
        nodesToHighlight = this.externalFilters[filterName].getNodesToBeFiltered(id); // on recupere les nodes qui sont associés à la data filtré
        changeSet = this.network.ActionAndGetChangeset(nodesToHighlight,true); // Generate the changeSet
        this.fillFilter(changeSet); // add the filter value
        this.nodes.add(changeSet); // adding nodes into network
        
        nodesIdToHighlight = [];
        if(nodesToHighlight) {
            nodesToHighlight.forEach(function(node) {
                nodesIdToHighlight.push(node.object_id + "#" + node.objectTypeScriptName);
            });
        }

        edgesIdToHighlight = [];
        if(edgesToHighlight) {
            edgesToHighlight.forEach(function(edge) {
                edgesIdToHighlight.push(edge.id + "#" + edge.objectTypeScriptName);
            });
        }

        if(this.networkUI) {
            this.colorNodes(nodesIdToHighlight);
            this.colorEdges(nodesIdToHighlight);
            this.colorUnZipEdges(nodesIdToHighlight,edgesIdToHighlight);
        }
    };



    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));