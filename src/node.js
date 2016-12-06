/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */

/*global jQuery */
(function (cwApi, $) {

    "use strict";
    // constructor
    var node = function (id,scripname,uuid,label) {
        this.id = id;
        this.scripname = scripname;
        this.uuid = uuid;
        this.label = label;
    };


      //permet de lire les propriétés de l'asso et de choisir quoi afficher en fonction du champs custom
    node.prototype.getVisData = function () {
        return {'id': this.uuid, 'label': this.label, 'group': this.scripname};
    };

    cwApi.customLibs.node = node;
}(cwAPI, jQuery));