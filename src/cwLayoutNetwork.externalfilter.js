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
            elem.target.innerText = "Behaviour : Highlight";
            this.externalFilterBehaviour.add = false ;
            this.externalFilterBehaviour.absolute = false;
            this.externalFilterBehaviour.highlight = true;
        } else if(this.externalFilterBehaviour.add == true) {
            elem.target.innerText = "Behaviour : Absolute";
            this.externalFilterBehaviour.absolute = true;
            this.externalFilterBehaviour.add = true;
            this.externalFilterBehaviour.highlight = false;
        } else {
            elem.target.innerText = "Behaviour : Addition";
            this.externalFilterBehaviour.add = true;
            this.externalFilterBehaviour.absolute = false;
            this.externalFilterBehaviour.highlight = false;
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



    cwLayoutNetwork.prototype.addNetwork = function (node,father) {
        if(this.networkConfiguration === undefined) {
            this.networkConfiguration = {};
            this.networkConfiguration.selected = {};
            this.networkConfiguration.nodes = {};
        }
        if(this.networkConfiguration.nodes[node.object_id] === undefined) {
            this.networkConfiguration.nodes[node.object_id] = {};
            this.networkConfiguration.nodes[node.object_id].label = node.name;
            this.networkConfiguration.nodes[node.object_id].configuration = JSON.parse(node.properties.configuration.replaceAll("\\",""));
            this.networkConfiguration.nodes[node.object_id].obj = node;
            node.associations = {};
            node.associations[this.nodeID] = {};
            node.associations[this.nodeID].associationScriptName = "CAPINETWORKTOASSONETWORKANYOBJECTTOANYOBJECT";
            node.associations[this.nodeID].displayName = "Present on Network";           
            node.associations[this.nodeID].items = []; 
            node.associations[this.nodeID].nodeId = this.nodeID;
        } 
        var newItem = {};
        newItem.name = father.name;
        newItem.intersectionObjectUID = node.iProperties.uniqueidentifier;
        newItem.targetObjectID = father.object_id;
        newItem.isNew = "false";
        newItem.targetObjectTypeScriptName = father.objectTypeScriptName;
        this.networkConfiguration.nodes[node.object_id].obj.associations[this.nodeID].items.push(newItem);

    };


    cwLayoutNetwork.prototype.getNetworkConfigurationFilterObject = function (classname) {
        var filterObject;
        var object;
        var id;

        filterObject = document.createElement("select");
        filterObject.setAttribute('data-live-search','true');
        filterObject.setAttribute('data-actions-box','true');
        filterObject.setAttribute('data-size','5');
       //filterObject.setAttribute('data-width','fit');
        
        filterObject.className = classname + " Network";
        filterObject.setAttribute('filterName',"Network");


        object = document.createElement("option");
        object.setAttribute('id',0);
        object.textContent = "None";
        filterObject.appendChild(object);

        for (id in this.networkConfiguration.nodes) {
            if (this.networkConfiguration.nodes.hasOwnProperty(id)) {
                object = document.createElement("option");
                object.setAttribute('id',id);
                object.textContent = this.networkConfiguration.nodes[id].label;
                filterObject.appendChild(object);
            }                                                                                                                                                                                                                                                                                                                                                                                                            
        }

        return filterObject;
    };



    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));