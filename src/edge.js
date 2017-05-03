/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */

/*global jQuery */
(function(cwApi, $) {

  "use strict";
  // constructor
  var edge = function(fromUuid,toUuid, fromId, toId,fromGroup,toGroup,direction,arrowColour) {
    this.size = 1;
    if(direction === undefined || direction.indexOf('from') === -1) {
      this.fromUuid = fromUuid;
      this.toUuid = toUuid;
      this.fromGroup = fromGroup;
      this.toGroup = toGroup;
      this.fromId = fromId;
      this.toId = toId;   
    } else {
      this.fromUuid = toUuid;
      this.toUuid = fromUuid;
      this.fromGroup = toGroup; 
      this.toGroup = fromGroup;
      this.fromId = toId;
      this.toId = fromId; 
    }
    this.direction = 'to';
    this.arrowColour = arrowColour;
  };

  //permet de lire les propriétés de l'asso et de choisir quoi afficher en fonction du champs custom
  edge.prototype.addDirection = function(direction,reserve) {

    if(direction) {
      if(direction === "'from'" || (direction === "'to'" && reserve)) {
        this.direction = 'to, from';
      }
      this.size = this.size + 1;
    }
  };


  //permet de lire les propriétés de l'asso et de choisir quoi afficher en fonction du champs custom
  edge.prototype.getVisData = function() {
    var edgeVis = {};
    edgeVis.from = this.fromUuid;
    edgeVis.to = this.toUuid; 
    if(this.direction) {
      edgeVis.arrows = this.direction;     
    }  
    edgeVis.color = {inherit:'to'};  
    edgeVis.width = this.size;
    return edgeVis;
  };

  //permet de lire les propriétés de l'asso et de choisir quoi afficher en fonction du champs custom
  edge.prototype.getEdge = function() {
    var edge = {};
    edge.fromId = this.fromId;
    edge.toId = this.toId; 
    edge.fromGroup = this.fromGroup;
    edge.toGroup = this.toGroup;   
    edge.fromUuid = this.fromUuid;
    edge.toUuid = this.toUuid; 
    edge.direction = this.direction; 
    return edge;
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