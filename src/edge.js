/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */

/*global jQuery */
(function(cwApi, $) {

  "use strict";
  // constructor
  var edge = function(fromUuid,toUuid, fromId, toId,fromGroup,toGroup,direction,arrowColour) {
    this.fromUuid = fromUuid;
    this.toUuid = toUuid;
    this.fromGroup = fromGroup;
    this.toGroup = toGroup;
    this.fromId = fromId;
    this.toId = toId;    
    this.direction = direction;
    this.arrowColour = arrowColour;
  };


  //permet de lire les propriétés de l'asso et de choisir quoi afficher en fonction du champs custom
  edge.prototype.getVisData = function() {
    var edgeVis = {};
    edgeVis.from = this.fromUuid;
    edgeVis.to = this.toUuid; 
    if(this.direction) {
      edgeVis.arrows = this.direction;  
      if(this.direction.indexOf('to') === -1) {
        edgeVis.color = {inherit:'from'};
      } else {
        edgeVis.color = {inherit:'to'};        
      }
    } else {
        edgeVis.color = {inherit:'to'};        
    }   
    return edgeVis;
  };

  //permet de lire les propriétés de l'asso et de choisir quoi afficher en fonction du champs custom
  edge.prototype.getEdge = function() {
    var edgeVis = {};
    edgeVis.fromId = this.fromId;
    edgeVis.toId = this.toId; 
    edgeVis.fromGroup = this.fromGroup;
    edgeVis.toGroup = this.toGroup;   
    edgeVis.fromUuid = this.fromUuid;
    edgeVis.toUuid = this.toUuid; 
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