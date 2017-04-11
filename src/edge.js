/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */

/*global jQuery */
(function(cwApi, $) {

  "use strict";
  // constructor
  var edge = function(fromUuid, toUuid,direction) {
    this.fromUuid = fromUuid;
    this.toUuid = toUuid;
    this.direction = direction;
  };


  //permet de lire les propriétés de l'asso et de choisir quoi afficher en fonction du champs custom
  edge.prototype.getVisData = function() {
    var edgeVis = {};
    edgeVis.from = this.fromUuid;
    edgeVis.to = this.toUuid; 
    if(this.direction) {
      edgeVis.arrows = this.direction;       
    }   
    return edgeVis;
  };


  if (!cwApi.customLibs) {
    cwApi.customLibs = {};
  }
  if (!cwApi.customLibs.cwLayoutNetwork) {
    cwApi.customLibs.cwLayoutNetwork = {};
  };
  if (!cwApi.customLibs.cwLayoutNetwork.edge) {
    cwApi.customLibs.cwLayoutNetwork.edge = edge;
  };


}(cwAPI, jQuery));