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
                    if(this.behaviour.or === true) {
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
        if(this.behaviour.add === true) {
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

    cwLayoutNetwork.prototype.setExternalFilterToValue = function (filtername,ids) {
        var self = this,values = [];
        if(self.externalFilters && self.externalFilters[filtername]) {
            ids.forEach(function(id) {
                if(self.externalFilters[filtername].filterField[id]) {
                    values.push(self.externalFilters[filtername].filterField[id].name); 
                }
            });  
            $('select.selectNetworkExternal_' + self.nodeID + "." + filtername.replaceAll(" ","_")).selectpicker('val',values);            
        }
    };

    cwLayoutNetwork.prototype.externalfilterModifyBehaviour = function (elem) {
        if(this.behaviour.absolute == true) {
            this.behaviour.add = false ;
            this.behaviour.absolute = false;
            this.behaviour.highlight = true;
        } else if(this.behaviour.add == true) {
            this.behaviour.absolute = true;
            this.behaviour.add = true;
            this.behaviour.highlight = false;
        } else {
            this.behaviour.add = true;
            this.behaviour.absolute = false;
            this.behaviour.highlight = false;
        }
        this.externalfilterUpdateBehaviourTitle(elem.target);
    };
    cwLayoutNetwork.prototype.externalfilterUpdateBehaviourTitle = function (elem) {
        if(elem === undefined) elem = document.getElementById("cwLayoutNetworkButtonsBehaviour" + this.nodeID);
        if(this.behaviour.absolute == true) {
            elem.innerText = $.i18n.prop('behaviour_absolute');
        } else if(this.behaviour.add == true) {
            elem.innerText = $.i18n.prop('behaviour_add');
        } else {
            elem.innerText = $.i18n.prop('behaviour_highlight');
        }
    };


    cwLayoutNetwork.prototype.updateExternalFilterInformation = function (external) {
        var output = {};
        if(external && external.behaviour && external.externalFilters) {
            this.behaviour = external.behaviour;
            this.externalfilterUpdateBehaviourTitle();
            for(var extF in external.externalFilters) {
                if(this.externalFilters.hasOwnProperty(extF)) {
                    this.externalFilters[extF].selectedId = external.externalFilters[extF].selectedId; 
                }
                this.setExternalFilterToValue(extF,external.externalFilters[extF].selectedId);
            }
            this.setAllExternalFilter();

        } 



    };        
      

    cwLayoutNetwork.prototype.getExternalFilterInformation = function (disposition) {
        var output = {};
        output.behaviour = this.behaviour;
        output.externalFilters = {};
        for(var extF in this.externalFilters) {
            if(this.externalFilters.hasOwnProperty(extF)) {
                output.externalFilters[extF] = {};
                output.externalFilters[extF].selectedId = this.externalFilters[extF].selectedId; 
            }
        } 
        return output;
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