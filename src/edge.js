/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */

/*global jQuery */
(function (cwApi, $) {

    "use strict";
    // constructor
    var edge = function (fromUuid,toUuid) {
      this.fromUuid = fromUuid;
      this.toUuid = toUuid;
    };


      //permet de lire les propriétés de l'asso et de choisir quoi afficher en fonction du champs custom
    edge.prototype.getVisData = function () {
        return {"from": this.fromUuid,"to": this.toUuid};
    };

    if(!cwApi.customLibs) {
        cwApi.customLibs = {};
    }
    cwApi.customLibs.edge = edge;
}(cwAPI, jQuery));