/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */



/*global cwAPI, jQuery */
(function (cwApi, $) {
    "use strict";
    if(cwApi && cwApi.cwLayouts && cwApi.cwLayouts.cwLayoutNetwork) {
      var cwLayoutNetwork = cwApi.cwLayouts.cwLayoutNetwork;
    } else {
    // constructor
        var cwLayoutNetwork = function (options, viewSchema) {
            cwApi.extend(this, cwApi.cwLayouts.CwLayout, options, viewSchema); // heritage
            cwApi.registerLayoutForJSActions(this); // execute le applyJavaScript après drawAssociations
            this.construct(options);
        };
    }



    cwLayoutNetwork.prototype.getdirectionList = function(options) {
        if(options) {
            var optionList = options.split("#");
            var optionSplit;
            for (var i = 0; i < optionList.length; i += 1) {
                if(optionList[i] !== "") {
                    var optionSplit = optionList[i].split(",");
                    this.directionList[optionSplit[0]] = optionSplit[1].replaceAll("'","").replaceAll('"','');
                }
            }
        }
    };

    cwLayoutNetwork.prototype.getFontAwesomeList = function(options) {
        
        var self = this;
        function getColorForNode(color) {
            var colorObj = {};
            colorObj.border = color;
            colorObj.background = color;
            colorObj.highlight = {};
            colorObj.highlight.border = self.LightenDarkenColor(color,-50);
            colorObj.highlight.background = self.LightenDarkenColor(color,-50);
            return colorObj;
        }


        function string_as_unicode_escape(str){
            return str.split("").map(function(s){
                return "\\u"+("0000" + s.charCodeAt(0).toString(16)).slice(-4);
            }).join("");
        }

        var groups = {};

        if(options) {
            var optionList = options.split("||");
            var optionSplit;
            for (var i = 0; i < optionList.length; i += 1) {
                if(optionList[i] !== "") {
                    var optionSplit = optionList[i].split(",");
                    groups[optionSplit[0]] = {};
                    if(optionSplit[1] === "icon") {
                        groups[optionSplit[0]].shape = 'icon';
                        groups[optionSplit[0]].icon = {};
                        groups[optionSplit[0]].icon.face = 'FontAwesome';
                        groups[optionSplit[0]].icon.code = unescape('%u' + optionSplit[2]);
                        groups[optionSplit[0]].unicode = optionSplit[2];
                        if(optionSplit[3]) {
                            groups[optionSplit[0]].icon.color = optionSplit[3];   
                            groups[optionSplit[0]].color = getColorForNode(optionSplit[3]);
                        }
                        groups[optionSplit[0]].icon.size = '40'; 
                        groups[optionSplit[0]].font = {background: '#FFFFFF'}  ; 
                        groups[optionSplit[0]].background = {background: '#FFFFFF'}  ; 
                    } else if(optionSplit[1] === "image" || optionSplit[1] === "circularImage" ) {
                        groups[optionSplit[0]].shape = optionSplit[1];
                        groups[optionSplit[0]].image = optionSplit[2];
                        if(optionSplit[3]) {
                            groups[optionSplit[0]].color = getColorForNode(optionSplit[3]);
                        }
                    } else { //shape
                        groups[optionSplit[0]].shape = optionSplit[1];
                        if(optionSplit[2]) {
                            groups[optionSplit[0]].color = {};
                            if(optionSplit[3]) {
                                groups[optionSplit[0]].color.border = optionSplit[3];
                                groups[optionSplit[0]].color.highlight = {};
                                groups[optionSplit[0]].color.highlight.border = optionSplit[3];
                                groups[optionSplit[0]].color.highlight.background = optionSplit[3];
                            } else {
                                groups[optionSplit[0]].color.border = this.LightenDarkenColor(optionSplit[2],50);
                                groups[optionSplit[0]].color.highlight = {};
                                groups[optionSplit[0]].color.highlight.border = this.LightenDarkenColor(optionSplit[2],-50);
                                groups[optionSplit[0]].color.highlight.background = this.LightenDarkenColor(optionSplit[2],-50);
                            }
                            groups[optionSplit[0]].color.background = optionSplit[2];

                        }                
                    }
                                 
                }
            }
        }
        this.groupsArt = groups;
    };


    cwLayoutNetwork.prototype.getOption = function(options, name, splitter1,splitter2) {
        options = this.options.CustomOptions[options];

        if(splitter2) this[name] = {};
        else this[name] = [];

        if (options) {
            var optionList = options.split(splitter1);
            var optionSplit;
            for (var i = 0; i < optionList.length; i += 1) {
                if (optionList[i] !== "") {
                    if(splitter2) {
                        optionSplit = optionList[i].split(splitter2);
                        this[name][optionSplit[0]] = optionSplit[1];
                    } else {
                        this[name].push(optionList[i]);                    
                    }
                }
            }
        }
    };


    cwLayoutNetwork.prototype.getStartingCluster = function(options) {
        try {
            if(options) {
                this.clusterByGroupOption.head = options.split("#")[0];
                this.clusterByGroupOption.child = options.split("#")[1].split(",");
            }           
        } catch(e) {
            console.log(e);
        }

    };


    cwLayoutNetwork.prototype.getExternalFilterNodes = function(nodesOptions,filterBehaviour) {
        var i,optionList = nodesOptions.split("#");
        for (i = 0; i < optionList.length; i += 1) {
            if(optionList[i] !== "") {
                var optionSplit = optionList[i].split(":");
                if(this.externalFilters.hasOwnProperty(optionSplit[1])) {
                    this.externalFilters[optionSplit[1]].addNodeID(optionSplit[0]); 
                    if(this.nodeFiltered[optionSplit[0]] === undefined) {
                        this.nodeFiltered[optionSplit[0]] = [optionSplit[1]];
                    } else {
                        this.nodeFiltered[optionSplit[0]].push(optionSplit[1]);
                    }
                } else {
                    this.externalFilters[optionSplit[1]] = new cwApi.customLibs.cwLayoutNetwork.externalAssociationFilter(true,optionSplit[0],optionSplit[1]); 
                    this.nodeFiltered[optionSplit[0]] = [optionSplit[1]];
                }
            }
        }

        if(filterBehaviour) {
            this.behaviour.highlight = false;
            this.behaviour.add = false;
            this.behaviour.absolute = false;

            if(filterBehaviour === "highlight") this.behaviour.highlight = true;
            if(filterBehaviour === "add") this.behaviour.add = true;
            if(filterBehaviour === "absolute") this.behaviour.absolute = true;
        }
    };
  

    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));