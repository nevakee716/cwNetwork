/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */

/*global jQuery */
(function (cwApi, $) {

    "use strict";
    // constructor
    var externalAssociationFilter = function (policy,nodeID,label) {
        this.policy = policy;
        this.filterField = {};
        this.label = label;
        this.nodesID = [nodeID];

    };

    externalAssociationFilter.prototype.addNodeID = function (nodeID) {
        this.nodesID.push(nodeID);
    };

    externalAssociationFilter.prototype.addfield = function (name,id) {
        if(!this.filterField.hasOwnProperty(id)) {
            this.filterField[id] = {};
            this.filterField[id].name = name;
            this.filterField[id].state = false;
        }
    };

    externalAssociationFilter.prototype.addEdgeToFields = function (Ids,edge) {
        var that = this;
        Ids.forEach(function(id) {
            if(!that.filterField[id].filteredEdges) {
               that.filterField[id].filteredEdges = []; 
            }
            if(that.filterField[id].filteredEdges.indexOf(edge) === -1) {
                that.filterField[id].filteredEdges.push(edge);
            }            
        });
    };


    externalAssociationFilter.prototype.addNodeToFields = function (Ids,element) {
        var that = this;
        Ids.forEach(function(id) {
            if(!that.filterField[id].filteredNodes) {
               that.filterField[id].filteredNodes = []; 
            }
            if(that.filterField[id].filteredNodes.indexOf(element) === -1) {
                that.filterField[id].filteredNodes.push(element);
            }            
        });
    };

    externalAssociationFilter.prototype.show = function (id) {
        if(this.filterField.hasOwnProperty(id)) {
            this.filterField[id].state = true;
        }
    };

    externalAssociationFilter.prototype.hide = function (id) {
        if(this.filterField.hasOwnProperty(id)) {
            this.filterField[id].state = false;
        }
    };

    externalAssociationFilter.prototype.areAllUnselected = function () {
        var id;
        for (id in this.filterField) {
            if (this.filterField.hasOwnProperty(id)) {
                if(this.filterField[id].state === true) {
                    return false;
                }
            }
        }
        return true;   
    };


    externalAssociationFilter.prototype.getFields = function (state) {
        var result = [];
        var id;
        for (id in this.filterField) {
            if (this.filterField.hasOwnProperty(id) && this.filterField[id].state === state) {
                result.push(id);
            }
        }    
        return result;
    };

    externalAssociationFilter.prototype.isObjectMatching = function (object,policy) {
        var i;
        var state = undefined; // if there are no filter check state stay undefined and return false
        var id;
        var isFieldInObject;
       
        // go throught all filter fields that are true
        for (id in this.filterField) {
            if (this.filterField.hasOwnProperty(id) && this.filterField[id].state === true) {
                
                //init
                if(state === undefined) {
                    state = policy;
                }

                isFieldInObject = false;
                for (i = 0; i < object.length; i += 1) {
                    if(object[i].object_id == id) {
                        isFieldInObject = true;
                    }
                }
                if(isFieldInObject === !policy) {
                    state = !policy;
                }
            }
        }    

        if(state === false || state === undefined) {
            return !this.policy;
        }

        return this.policy;
    };

    externalAssociationFilter.prototype.getNodesToBeFiltered = function (id) {
        if (this.filterField.hasOwnProperty(id)) {
           return this.filterField[id].filteredNodes;
        }
    };

    externalAssociationFilter.prototype.getEdgesToBeFiltered = function (id) {
        if (this.filterField.hasOwnProperty(id)) {
           return this.filterField[id].filteredEdges;
        }
    };
    



    externalAssociationFilter.prototype.setAllState = function (value) {
        var id;
        for (id in this.filterField) {
            if (this.filterField.hasOwnProperty(id)) {
               this.filterField[id].state = value;
            }
        }   
    };


    externalAssociationFilter.prototype.getFilterObject = function (classname) {
        var filterObject;
        var object;
        var id;

        filterObject = document.createElement("select");
        //filterObject.setAttribute('multiple','');
        filterObject.setAttribute('title',this.label);
        filterObject.setAttribute('data-live-search','true');
        filterObject.setAttribute('data-selected-text-format','count > 2');
        filterObject.setAttribute('data-actions-box','true');
        filterObject.setAttribute('data-size','5');
       //filterObject.setAttribute('data-width','fit');
        
        filterObject.className = classname + " " + this.label;
        filterObject.setAttribute('filterName',this.label);

        //Creation du None
        object = document.createElement("option");
        object.setAttribute('id',0);
        object.textContent = 'None';
        filterObject.appendChild(object);

        for (id in this.filterField) {
            if (this.filterField.hasOwnProperty(id)) {
                object = document.createElement("option");
                object.setAttribute('id',id);
                object.textContent = this.filterField[id].name;
                filterObject.appendChild(object);
            }                                                                                                                                                                                                                                                                                                                                                                                                            
        }

        return filterObject;
    };





    if(!cwApi.customLibs) {
        cwApi.customLibs = {};
    }
    if(!cwApi.customLibs.cwLayoutNetwork){
        cwApi.customLibs.cwLayoutNetwork = {};
    };
    if(!cwApi.customLibs.cwLayoutNetwork.externalAssociationFilter){
        cwApi.customLibs.cwLayoutNetwork.externalAssociationFilter = externalAssociationFilter;
    };


}(cwAPI, jQuery));