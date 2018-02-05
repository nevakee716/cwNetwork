/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */

/*global jQuery */
(function(cwApi, $) {

  "use strict";
  // constructor
  var edge = function(fromUuid,toUuid, fromId, toId,fromGroup,toGroup,direction,edgeInfo) {
    this.size = 1;
    this.labels = [];
    if(direction === undefined) direction = "to";
    if(direction.indexOf('from') === -1) {
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
    if(edgeInfo) {
      this.zipped = true;
      this.labels.push({"label" : edgeInfo.label,"id":edgeInfo.id,"scriptname":edgeInfo.objectTypeScriptName,"direction" : this.direction,"uuid":this.labels.length});     
    }
  };

  //permet de lire les propriétés de l'asso et de choisir quoi afficher en fonction du champs custom
  edge.prototype.addEdgeElement = function(direction,edgeInfo,reverse) {
    var newDirection = direction;
    if(edgeInfo) {
      this.zipped = true;
      if(reverse) {
        if(direction == "from") newDirection = "to";
        else newDirection = "from";     
      } 
      else if(newDirection === undefined ) newDirection = "to";
      this.labels.push({"label" : edgeInfo.label,"direction" : newDirection,"id":edgeInfo.id,"scriptname":edgeInfo.objectTypeScriptName,"uuid":this.labels.length}); 
    }

    if(direction) {
      if(direction === "from" || (direction === "to" && reverse)) {
        this.direction = 'to, from';
      }
      this.size = this.size + 3;
    }
  };


  //permet de lire les propriétés de l'asso et de choisir quoi afficher en fonction du champs custom
  edge.prototype.getVisData = function() {
    var edgeVis = {};
    edgeVis.id = this.fromUuid + "#" + this.toUuid;
    edgeVis.from = this.fromUuid;
    edgeVis.to = this.toUuid; 
    if(this.direction) {
      edgeVis.arrows = this.direction;     
    }  
    edgeVis.color = {inherit:'from'};  
    edgeVis.width = this.size;
    edgeVis.zipped = this.zipped;
    edgeVis.labels = this.labels;
    edgeVis.hidden = false;
    edgeVis.hideByZipping = false;
    edgeVis.physics = true; 
    edgeVis.font = {};
    edgeVis.font.size = 6;
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