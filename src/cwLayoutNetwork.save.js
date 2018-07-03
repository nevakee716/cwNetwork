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

        var nodes, config, positions, newAssoItems = [],
            newAssoItemsObj = {};
        newObj.displayNames = {};
        newObj.displayNames.configuration = "Configuration";
        newObj.displayNames.createoncwview = "Create on view";
        

        nodes = this.network.getAllNodeForSaving();
        config = {};
        config.nodes = {};
        config.external = this.getExternalFilterInformation();


        positions = this.networkUI.getPositions();
        
        if (newObj.associations) {
            newObj.associations[this.nodeID].items.forEach(function(item) {
                newAssoItemsObj[item.targetObjectID] = item;
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
                

                if (newAssoItemsObj[node.idShort]) {
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

        var view = cwAPI.getCurrentView();
        if(view && view.cwView) {
            view = view.cwView;
        }

        newObj.properties.createoncwview = view;

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


    cwLayoutNetwork.prototype.directSaveNewNetwork = function(networkName) {
        var newObj = {};
        var newNewObj = {};
        var self = this;
        newObj.properties = {};
        newObj.properties.name = networkName;
        this.getConfigurationAndAssociationObjectToNetwork(newObj);
        var asso = $.extend(true, {}, newObj.associations);
        newObj.associations = {};
        newNewObj = $.extend(true, {}, newObj);
        newNewObj.associations = asso;
        //changeset.compareAndAddChanges(oldObj, newObj);

        cwAPI.CwEditSave.setPopoutContentForGrid(cwApi.CwPendingChangeset.ActionType.Create, null, newObj, 0, "capinetwork", function(elem) {
            if (elem && elem.status == "Ok") {
                newObj.associations[self.nodeID] = {};
                newObj.associations[self.nodeID].items = [];
                newObj.associations[self.nodeID].associationScriptName = "CAPINETWORKTOASSONETWORKANYOBJECTTOANYOBJECT";

                newObj.object_id = elem.id;
                newNewObj.object_id = elem.id;
                cwAPI.CwEditSave.setPopoutContentForGrid(cwApi.CwPendingChangeset.ActionType.Update, newObj, newNewObj, newObj.object_id, "capinetwork", function() {

                });
            }


        });

    };



    cwLayoutNetwork.prototype.directSave = function(oldObj) {
        var changeset, newObj;
        changeset = new cwApi.CwPendingChangeset(oldObj.objectTypeScriptName, oldObj.object_id, oldObj.name, true, 1);
        newObj = $.extend(true, {}, oldObj);

        this.getConfigurationAndAssociationObjectToNetwork(newObj);
        //changeset.compareAndAddChanges(oldObj, newObj);

        cwAPI.CwEditSave.setPopoutContentForGrid(cwApi.CwPendingChangeset.ActionType.Update, oldObj, newObj, oldObj.object_id, oldObj.objectTypeScriptName, function() {

        });

        /*
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
        });*/
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