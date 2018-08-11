/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */



/*global cwAPI, jQuery */
(function(cwApi, $) {
    "use strict";
    if (cwApi && cwApi.cwLayouts && cwApi.cwLayouts.cwLayoutNetwork) {
        var cwLayoutNetwork = cwApi.cwLayouts.cwLayoutNetwork;
    } else {
        // constructor
        var cwLayoutNetwork = function(options, viewSchema) {
            cwApi.extend(this, cwApi.cwLayouts.CwLayout, options, viewSchema); // heritage
            cwApi.registerLayoutForJSActions(this); // execute le applyJavaScript après drawAssociations
            this.construct(options);
        };
    }


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
            node.associations[this.nodeID].associationScriptName = this.definition.capinetworkToAnyAssociationScriptname;
            node.associations[this.nodeID].displayName = this.definition.capinetworkToAnyAssociationDisplayName;           
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
        filterObject.setAttribute('data-size','5');


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
    
    cwLayoutNetwork.prototype.addEventOnSave = function() {
        var buttonSave = document.getElementsByClassName("cw-edit-mode-button-edit")[0];
        if (buttonSave) {
            buttonSave.addEventListener("click", this.createChangeset.bind(this), false);
        }
    };



    cwLayoutNetwork.prototype.createAddButton = function() {
        var buttonAdd = document.createElement('button');
        buttonAdd.addEventListener("click", this.createChangesetWithCreation.bind(this), false);
        buttonAdd.innerHTML = '<i class="fa fa-plus" aria-hidden="true"></i>';
        return buttonAdd;
    };



    cwLayoutNetwork.prototype.saveIndexPage = function() {
        this.directSave(this.networkConfiguration.selected.obj);
    };



    cwLayoutNetwork.prototype.getConfiguration = function() {
        var nodes, config, positions;

        nodes = this.network.getAllNodeForSaving();
        config = {};
        config.nodes = {};
        positions = this.networkUI.getPositions();
        nodes.forEach(function(node) {
            config.nodes[node.id] = {};
            if (positions.hasOwnProperty(node.id)) {
                config.nodes[node.id].x = positions[node.id].x;
                config.nodes[node.id].y = positions[node.id].y;
            }
            config.nodes[node.id].group = node.group;
            config.nodes[node.id].id = node.idShort;
            config.nodes[node.id].status = node.status;
        });
        return JSON.stringify(config);
    };

    cwLayoutNetwork.prototype.createChangeset = function() {

        this.indirectSave();
    };


    cwLayoutNetwork.prototype.createChangesetWithCreation = function(event) {
        var networkName;
        if (event.currentTarget.parentElement && event.currentTarget.parentElement.firstElementChild && event.currentTarget.parentElement.firstElementChild.value !== "") {
            this.directSaveNewNetwork(event.currentTarget.parentElement.firstElementChild.value);
        }

    };



    cwLayoutNetwork.prototype.getConfigurationAndAssociationObjectToNetwork = function(newObj) {

        var linkTypeLabels, nodes, config, positions, newAssoItems = [],
            newAssoItemsObj = {}, self = this;
        newObj.displayNames = {};
        newObj.displayNames[this.definition.capinetworkConfigurationScriptname] = this.definition.capinetworkConfigurationDisplayname;
        newObj.displayNames[this.definition.capinetworkCreateOnViewScriptname] = this.definition.capinetworkCreateOnViewDisplayName;
        

        nodes = this.network.getAllNodeForSaving();
        config = {};
        config.nodes = {};
        config.external = this.getExternalFilterInformation();
        config.clusters = this.clusters;
        config.clusterByGroupOption = {};
        config.clusterByGroupOption.head = $('select.selectNetworkClusterByGroup_' + this.nodeID + "_head").val();
        config.clusterByGroupOption.child = $('select.selectNetworkClusterByGroup_' + this.nodeID + "_child").val();

        config.linkType = [];
        for (var s in this.edgeConfiguration) {
            if (this.edgeConfiguration.hasOwnProperty(s) && this.edgeConfiguration[s].show === true) {
                config.linkType.push(s);
            }
        }
        
        config.camera = {};
        config.camera.position = this.networkUI.getViewPosition();
        config.camera.scale = this.networkUI.getScale();

        positions = this.networkUI.getPositions();
        
        if (newObj.associations) {
            newObj.associations[this.nodeID].items.forEach(function(item) {
                newAssoItemsObj[item.targetObjectID + item.targetObjectTypeScriptName] = item;
            });
        } else {
            newAssoItems = [];
            newObj.associations = {};
            newObj.associations[this.nodeID] = {};

        }


        nodes.forEach(function(node) {
            if (positions.hasOwnProperty(node.id)) {
                config.nodes[node.id] = {};
                config.nodes[node.id].x = positions[node.id].x;
                config.nodes[node.id].y = positions[node.id].y;
                config.nodes[node.id].group = node.group;
                config.nodes[node.id].id = node.idShort;
                config.nodes[node.id].status = node.status;

                if (newAssoItemsObj[node.idShort + node.objectTypeScriptName]) {
                    newAssoItems.push(newAssoItemsObj[node.idShort + node.objectTypeScriptName]);
                } else {
                    var assoItem = {};
                    assoItem.name = node.name;

                    assoItem.intersectionObjectUID = "";
                    assoItem.isNew = "false";
                    assoItem.targetObjectTypeScriptName = node.objectTypeScriptName;
                    assoItem.targetObjectID = node.idShort;
                    newAssoItems.push(assoItem);
                }
            }
        });
        newObj.properties[this.definition.capinetworkConfigurationScriptname] = JSON.stringify(config);
        newObj.associations[this.nodeID].items = newAssoItems;

        var view = cwAPI.getCurrentView();
        if(view && view.cwView) {
            view = view.cwView;
        }

        newObj.properties[this.definition.capinetworkCreateOnViewScriptname] = view;

        return config;


    };



    cwLayoutNetwork.prototype.indirectSave = function(init) {
        if (init === undefined) init = false;
        var id = this.originalObject.objectTypeScriptName + "_" + this.originalObject.object_id + "_configuration";
        if (cwApi.customLibs.edits === undefined) cwApi.customLibs.edits = {};
        if (cwApi.customLibs.edits[id] === undefined) cwApi.customLibs.edits[id] = {};
        if (init === true) {
            cwApi.customLibs.edits[id].initValue = this.getConfiguration();
        } else {
            cwApi.customLibs.edits[id].value = this.getConfiguration();
        }
        cwApi.customLibs.edits[id].display = "Network";
    };


    cwLayoutNetwork.prototype.directSaveNewNetwork = function(networkName) {
        var newObj = {};
        var newNewObj = {};
        var self = this;
        var config;
        newObj.properties = {};
        newObj.properties.name = networkName;
        config = this.getConfigurationAndAssociationObjectToNetwork(newObj);
        var asso = $.extend(true, {}, newObj.associations);
        newObj.associations = {};
        newNewObj = $.extend(true, {}, newObj);
        newNewObj.associations = asso;

        cwAPI.CwEditSave.setPopoutContentForGrid(cwApi.CwPendingChangeset.ActionType.Create, null, newObj, 0, this.definition.capinetworkScriptname, function(elem) {
            if (elem && elem.status == "Ok") {
                newObj.associations[self.nodeID] = {};
                newObj.associations[self.nodeID].items = [];
                newObj.associations[self.nodeID].associationScriptName = self.definition.capinetworkToAnyAssociationScriptname;

                newObj.object_id = elem.id;
                newNewObj.object_id = elem.id;
                cwAPI.CwEditSave.setPopoutContentForGrid(cwApi.CwPendingChangeset.ActionType.Update, newObj, newNewObj, newObj.object_id, self.definition.capinetworkScriptname, function(response) {
                    if (!cwApi.statusIsKo(response)) {
                        self.createdSaveObjFromReponse(newNewObj,response,networkName,config);

                        var html = '<option id="' + response.id + '">' + networkName + '</>';
                        $('.selectNetworkConfiguration_' + self.nodeID).append(html)
                                                       .selectpicker("refresh");

                        $("div.selectNetworkConfiguration_" + self.nodeID + " > option").remove();
                        $('.selectNetworkConfiguration_' + self.nodeID).val(networkName).selectpicker("refresh");

                    } 
                });
            }


        });

    };

    cwLayoutNetwork.prototype.createdSaveObjFromReponse = function(obj,response,networkName,config) {
        var r,self = this;

        this.networkConfiguration.nodes[response.id] = {};
        this.networkConfiguration.nodes[response.id].configuration = config;
        obj.objectTypeScriptName = this.definition.capinetworkScriptname;
        obj.name = networkName;

        var targetId,targetIds = {};
        for(var i in response.intersectionObjectProperties) {
            if(response.intersectionObjectProperties.hasOwnProperty(i)) {
                r = response.intersectionObjectProperties[i];
                if(targetIds[r.targetObjectID]) {
                    window.location.reload();
                } else {
                    targetIds[r.targetObjectID] = true;
                }
                var isPresent = false;
                obj.associations[self.nodeID].items.forEach(function(n) {
                    if(r.targetObjectID === n.targetObjectID) {
                        isPresent = true;
                        n.intersectionObjectUID = r.uid;
                    }
                });
            }
        } 

        obj.associations[this.nodeID].associationScriptName = this.definition.capinetworkToAnyAssociationScriptname;
        obj.associations[this.nodeID].displayName = this.definition.capinetworkToAnyAssociationDisplayName;
        obj.associations[this.nodeID].nodeID = self.nodeID;

        this.networkConfiguration.nodes[response.id].obj = obj;
        this.networkConfiguration.nodes[response.id].label = networkName;
        this.networkConfiguration.selected = this.networkConfiguration.nodes[response.id];
        

    };

    cwLayoutNetwork.prototype.directSave = function(oldObj) {
        var config,changeset, newObj;
        var self = this;
        changeset = new cwApi.CwPendingChangeset(oldObj.objectTypeScriptName, oldObj.object_id, oldObj.name, true, 1);
        newObj = $.extend(true, {}, oldObj);

        config = this.getConfigurationAndAssociationObjectToNetwork(newObj);
        //changeset.compareAndAddChanges(oldObj, newObj);

        cwAPI.CwEditSave.setPopoutContentForGrid(cwApi.CwPendingChangeset.ActionType.Update, oldObj, newObj, oldObj.object_id, oldObj.objectTypeScriptName, function(response) {
            if (!cwApi.statusIsKo(response)) {
                self.createdSaveObjFromReponse(newObj,response,newObj.properties["name"],config);
            } 
        });
    };



    cwApi.cwEditProperties.cwEditProperty.prototype.getValueFromEditModeInDOM = function(isInitialValueLoad) {
        var data = this.getDataForUpdate();
        data = this.getValueFromEditModeInDOMCustom(data, isInitialValueLoad);
        this.getValueFromCustomLayout(data, isInitialValueLoad);
        return data;
    };

    cwApi.cwEditProperties.cwEditProperty.prototype.getValueFromCustomLayout = function(data, isInitialValueLoad) {
        var id = this.objectTypeScriptName + "_" + this.objectID + "_" + this.scriptName;
        if (cwApi.customLibs.edits && cwApi.customLibs.edits[id]) {
            if (isInitialValueLoad) {
                data.v = cwApi.customLibs.edits[id].initValue;
            } else {
                data.v = cwApi.customLibs.edits[id].value;
            }
            data.displayValue = cwApi.customLibs.edits[id].display;
        };
    };

    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));