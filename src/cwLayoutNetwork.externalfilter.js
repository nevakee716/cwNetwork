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

   cwLayoutNetwork.prototype.setAllExternalFilter = function () {

        // get the node/ edge to highlight for all filter
        var noID,present,n,e,changeSet,nodesToHighlight = [],edgesToHighlight = [],nodesIdToHighlight = [],edgesIdToHighlight = [],ntd,etd;
        
        noID = true;
        for(var extF in this.externalFilters) {
            if(this.externalFilters.hasOwnProperty(extF)) {
                if(this.externalFilters[extF].selectedId.length !== 0) {
                    noID = false;
                    n = this.externalFilters[extF].getNodesToBeFiltered();
                    e = this.externalFilters[extF].getEdgesToBeFiltered();
                    if(this.externalFilterBehaviour.or === true) {
                        if(n) nodesToHighlight = nodesToHighlight.concat(n);
                        if(e) edgesToHighlight = edgesToHighlight.concat(e);
                    } else {
                        if(n) {
                            if(nodesToHighlight.length === 0) nodesToHighlight = nodesToHighlight.concat(n);
                            else {
                                ntd = [];
                                nodesToHighlight.forEach(function(node) {
                                    present = false;
                                    n.forEach(function(nn) {
                                        if(nn.object_id == node.object_id && nn.group == node.group) present = true;
                                    });
                                    if(present === true) ntd.push(node);
                                });
                                nodesToHighlight = ntd;
                            }
                        }
                        if(e) {
                            if(edgesToHighlight.length === 0) edgesToHighlight = edgesToHighlight.concat(e);
                            else {
                                etd = [];
                                edgesToHighlight.forEach(function(edge) {
                                    present = false;
                                    e.forEach(function(ee) {
                                        debugger;
                                        if(ee.object_id == edge.object_id) present = true;
                                    });
                                    if(present === true) etd.push(edge);
                                });
                                edgesToHighlight = etd; 
                            }
                        }
                    }
                }
            }
        }
        
        if(noID) {
            this.colorAllNodes();
            this.colorAllEdges();  
            return;
        }
        if(this.externalFilterBehaviour.add === true) {
            changeSet = this.network.ActionAndGetChangeset(nodesToHighlight,true); // Generate the changeSet  
            this.fillFilter(changeSet); // add the filter value
            this.nodes.add(changeSet); // adding nodes into network
        }
        
        if(nodesToHighlight) {
            nodesToHighlight.forEach(function(node) {
                nodesIdToHighlight.push(node.object_id + "#" + node.objectTypeScriptName);
            });
        }

        if(edgesToHighlight) {
            edgesToHighlight.forEach(function(edge) {
                edgesIdToHighlight.push(edge.id + "#" + edge.objectTypeScriptName);
            });
        }

        if(this.networkUI) {
            this.colorNodes(nodesIdToHighlight);
            this.colorEdges(nodesIdToHighlight);
            if(edgesIdToHighlight.length > 0) this.colorUnZipEdges(nodesIdToHighlight,edgesIdToHighlight);
        }

    };

    cwLayoutNetwork.prototype.setExternalFilterToNone = function () {
        $('select.selectNetworkExternal_' + this.nodeID).selectpicker('val',''); 
        for(var extF in this.externalFilters) {
            if(this.externalFilters.hasOwnProperty(extF)) {
                this.externalFilters[extF].selectedId = []; 
            }
        }
    };


    cwLayoutNetwork.prototype.externalfilterModifyBehaviour = function (elem) {
        if(this.externalFilterBehaviour.absolute == true) {
            elem.target.innerText = "Highlight";
            this.externalFilterBehaviour.add = false ;
            this.externalFilterBehaviour.absolute = false;
        } else if(this.externalFilterBehaviour.add == true) {
            elem.target.innerText = "Absolute";
            this.externalFilterBehaviour.absolute = true;
            this.externalFilterBehaviour.add = true;
        } else {
            elem.target.innerText = "Addition";
            this.externalFilterBehaviour.add = true;
            this.externalFilterBehaviour.absolute = false;
        }
    };



    cwLayoutNetwork.prototype.addExternalFilterValue = function (filterName,id) {
        if(this.externalFilters[filterName].selectedId.indexOf(id) === -1) {
            this.externalFilters[filterName].selectedId.push(id);
        } 
    };


    cwLayoutNetwork.prototype.removeExternalFilterValue = function (filterName,id) {
        this.externalFilters[filterName].selectedId.splice(this.externalFilters[filterName].selectedId.indexOf(id), 1);
    };


    cwLayoutNetwork.prototype.addAllExternalFilterValue = function (filterName) {
        try {
            this.externalFilters[filterName].selectedId = Object.keys(this.externalFilters[filterName].filterField);
        }
        catch(e) {
            console.log(e);
        }
    };

    cwLayoutNetwork.prototype.removeAllExternalFilterValue = function (filterName) {
        try {
            this.externalFilters[filterName].selectedId = [];
        }
        catch(e) {
            console.log(e);
        }
    };


    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));