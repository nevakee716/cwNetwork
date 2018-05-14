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


    cwLayoutNetwork.prototype.addEventOnSave = function() {
        var buttonSave = document.getElementsByClassName("cw-edit-mode-button-edit")[0];
        if (buttonSave) {
            buttonSave.addEventListener("click", this.createChangeset.bind(this), false);
        }
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


     /*   if(this.networkConfiguration.nodes[node.object_id] === undefined) {
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
        node.associations[this.nodeID].items.push(newItem);
*/
    cwLayoutNetwork.prototype.getConfigurationAndAssociationObjectToNetwork = function(newObj) {

        var nodes, config, positions,newAssoItems = [],newAssoItemsObj = {};
        newObj.displayNames = {};
        newObj.displayNames.configuration = "Configuration";
     


        nodes = this.network.getAllNodeForSaving();
        config = {};
        config.nodes = {};
        positions = this.networkUI.getPositions();

        newObj.associations[this.nodeID].items.forEach(function(item) {
            newAssoItemsObj[item.targetObjectID] = item;
        });

        nodes.forEach(function(node) {
            
            if (positions.hasOwnProperty(node.id)) {
                config.nodes[node.id] = {};
                config.nodes[node.id].x = positions[node.id].x;
                config.nodes[node.id].y = positions[node.id].y;
                config.nodes[node.id].group = node.group;
                config.nodes[node.id].id = node.idShort;
                config.nodes[node.id].status = node.status;


                if(newAssoItemsObj[node.idShort]) {
                    newAssoItems.push(newAssoItemsObj[node.idShort]);
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
        newObj.properties.configuration = JSON.stringify(config);
        newObj.associations[this.nodeID].items = newAssoItems;


        return null;


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

    cwLayoutNetwork.prototype.directSave = function(oldObj) {
        var changeset, newObj;
        changeset = new cwApi.CwPendingChangeset(oldObj.objectTypeScriptName, oldObj.object_id, oldObj.name, true, 1);
        newObj = $.extend(true, {}, oldObj);

 
        this.getConfigurationAndAssociationObjectToNetwork(newObj);
        changeset.compareAndAddChanges(oldObj, newObj);

        cwApi.pendingChanges.clear();
        cwApi.pendingChanges.addChangeset(changeset);
        cwApi.pendingChanges.sendAsChangeRequest(undefined, function(response) {
            if (cwApi.statusIsKo(response)) {
                cwApi.notificationManager.addNotification($.i18n.prop('editmode_someOfTheChangesWereNotUpdated'), 'error');
            } else {
                cwApi.notificationManager.addNotification($.i18n.prop('editmode_yourChangeHaveBeenSaved'));
            }
        }, function(error) {
            cwApi.notificationManager.addNotification(error.status + ' - ' + error.responseText, 'error');
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