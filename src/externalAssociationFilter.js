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
        this.groups = [];
        this.selectedId = [];

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
        var self = this;
        Ids.forEach(function(id) {
            if(!self.filterField[id].filteredNodes) {
               self.filterField[id].filteredNodes = []; 
            }
            if(self.filterField[id].filteredNodes.indexOf(element) === -1) {
                self.filterField[id].filteredNodes.push(element);
            }
            if(self.groups.indexOf(element.group) === -1)    self.groups.push(element.group);         
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


   

    function ArrNoDupe(a) {
        var r = [],temp = {};
        for (var i = 0; i < a.length; i++) {
            if(!temp.hasOwnProperty(a[i].id)) {
                temp[a[i].id] = true;
                r.push(a[i]);
            }
        }
        return r;
    }

    function ArrNoDupeEdge(a) {
        var r = [],temp = {};
        for (var i = 0; i < a.length; i++) {
            if(!temp.hasOwnProperty(a[i].id + "#" + a[i].objectTypeScriptName)) {
                temp[a[i].id + "#" + a[i].objectTypeScriptName] = true;
                r.push(a[i]);
            }
        }
        return r;
    }

    externalAssociationFilter.prototype.getNodesToBeFiltered = function () {
        var result = [],self = this;
        if(this.selectedId.length === 0) return [];
        this.selectedId.forEach(function(e) {
            result = result.concat(self.filterField[e].filteredNodes);
        });
        return ArrNoDupe(result);
    };

    externalAssociationFilter.prototype.getEdgesToBeFiltered = function () {
        var result = [],self = this;
        if(this.selectedId.length === 0) return [];
        this.selectedId.forEach(function(e) {
            if(self.filterField[e].hasOwnProperty("filteredEdges")) {
                result = result.concat(self.filterField[e].filteredEdges);
            }
            
        });
        return ArrNoDupeEdge(result);

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
        filterObject.setAttribute('multiple','');
        filterObject.setAttribute('title',this.label);
        filterObject.setAttribute('data-live-search','true');
        filterObject.setAttribute('data-selected-text-format','static');
        filterObject.setAttribute('data-actions-box','true');
        filterObject.setAttribute('data-size','5');
       //filterObject.setAttribute('data-width','fit');
        
        filterObject.className = classname + " " + this.label.replaceAll(" ","_");
        filterObject.setAttribute('filterName',this.label);



        var array = [];
        for (id in this.filterField) {
            if (this.filterField.hasOwnProperty(id)) {
                var element = {};
                element.id = id;
                element.label = this.filterField[id].name;
                array.push(element);
            }                                                                                                                                                                                                                                                                                                                                                                                                            
        }
        array.sort(function (a, b) {
            var nameA=a.label.toLowerCase(), nameB=b.label.toLowerCase();
            if (nameA < nameB) //sort string ascending
                return -1;
            if (nameA > nameB)
                return 1;
            return 0; //default return value (no sorting)
        });

        array.forEach(function(element) {
            object = document.createElement("option");
            object.setAttribute('id',element.id);
            object.textContent = element.label;
            filterObject.appendChild(object);
        });


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