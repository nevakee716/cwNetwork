/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */

/*global jQuery */
(function(cwApi, $) {

  "use strict";
  // constructor
  var edge = function(fromUuid,toUuid, fromId, toId,fromGroup,toGroup,direction,edgeInfo) {
    this.size = 1;
    this.labels = [];
    this.direction = {};
    this.direction.to = false;
    this.direction.from = false;

    if(direction == 'from') {
      this.fromUuid = toUuid;
      this.toUuid = fromUuid;
      this.fromGroup = toGroup; 
      this.toGroup = fromGroup;
      this.fromId = toId;
      this.toId = fromId; 
      this.direction.to = true;
      direction = 'to';
    } else {
      this.fromUuid = fromUuid;
      this.toUuid = toUuid;
      this.fromGroup = fromGroup;
      this.toGroup = toGroup;
      this.fromId = fromId;
      this.toId = toId;   
      if(direction == 'to') this.direction.to = true;
    }
    if(edgeInfo && edgeInfo.unique && this.checkIfAlreadyExist(edgeInfo.id)) {
      this.label = edgeInfo.label;
    } else {
      this.zipped = true;
      this.labels.push({"label" : edgeInfo.label,"id":edgeInfo.id,"scriptname":edgeInfo.objectTypeScriptName,"direction" : direction,"uuid":this.labels.length});     
    }
  };

  edge.prototype.checkIfAlreadyExist = function(uuid) {
    var notExist = false;
    this.labels.forEach(function(l) {
      if(l.id === uuid) return true;
    });
    return notExist;
  };


  //permet de lire les propriétés de l'asso et de choisir quoi afficher en fonction du champs custom
  edge.prototype.addEdgeElement = function(direction,edgeInfo,reverse) {
    var newDirection = direction;
    if(edgeInfo && !edgeInfo.unique) {
      this.zipped = true;
      if(reverse) {
        if(direction == "from") newDirection = "to";
        else newDirection = "from";     
      } 
      //else if(newDirection === undefined ) newDirection = "to";
      this.labels.push({"label" : edgeInfo.label,"direction" : newDirection,"id":edgeInfo.id,"scriptname":edgeInfo.objectTypeScriptName,"uuid":this.labels.length}); 
      this.size = this.size + 3;
    }

    if(direction === 'to' && reverse || direction === 'from' && !reverse) this.direction.from = true;
    else if(direction === 'from' && reverse || direction === 'to' && !reverse) this.direction.to = true;
    
  };


  //permet de lire les propriétés de l'asso et de choisir quoi afficher en fonction du champs custom
  edge.prototype.getVisData = function() {
    var edgeVis = {};
    edgeVis.id = this.fromUuid + "#" + this.toUuid;
    edgeVis.from = this.fromUuid;
    edgeVis.to = this.toUuid; 
    edgeVis.arrows = this.getDirection();     
    edgeVis.color = {inherit:'from'};  
    edgeVis.width = this.size;
    edgeVis.zipped = this.zipped;
    edgeVis.labels = this.labels;
    edgeVis.hidden = false;
    edgeVis.hideByZipping = false;
    edgeVis.physics = true; 
    edgeVis.font = {};
    edgeVis.font.size = 6;
    edgeVis.label = this.label;
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
    edge.direction = this.getDirection();   
    return edge;
  };

  //permet de lire les propriétés de l'asso et de choisir quoi afficher en fonction du champs custom
  edge.prototype.getDirection = function() {
    if(this.direction.to && this.direction.from) return 'to, from';
    else if(this.direction.to) return 'to';
    else if(this.direction.from) return 'from';
    return;
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