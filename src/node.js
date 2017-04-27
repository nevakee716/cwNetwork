/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */

/*global jQuery */
(function (cwApi, $) {

    "use strict";
    // constructor
    var node = function (id,label,status,filterArray) {
        this.id = id;
        this.label = label;
        this.status = status;
        this.filterArray = filterArray;
    };

    node.prototype.getLabel = function () {
        return this.label;
    };

    node.prototype.getStatus = function () {
        return this.status;
    };

    node.prototype.setStatus = function (status) {
        if(this.status === status) {
            return false;
        }
        this.status = status;
        return true;
    };

    node.prototype.getId = function () {
        return this.id;
    };

      //permet de lire les propriétés de l'asso et de choisir quoi afficher en fonction du champs custom
    node.prototype.getVisData = function () {
        return {'id': this.id, 'label': this.label};
        //'shape': 'image', 'image': 'data:image/png;base64,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'};
        //
    };

    node.prototype.getVisDataIfDeactivated = function () {
        if(this.status === false) {
            this.status = true;
            return {'id': this.id, 'label': this.label};            
        } else {
            return null;
        }
    };

    if (!cwApi.customLibs) {
        cwApi.customLibs = {};
    }
    if (!cwApi.customLibs.cwLayoutNetwork) {
        cwApi.customLibs.cwLayoutNetwork = {};
    };
    if (!cwApi.customLibs.cwLayoutNetwork.node) {
        cwApi.customLibs.cwLayoutNetwork.node = node;
    }

}(cwAPI, jQuery));