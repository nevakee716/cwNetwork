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

     cwLayoutNetwork.prototype.createMenu = function (container) {
        var menuActions = [];
        var menuAction5 = {};
        menuAction5.title = "Remove Node";
        menuAction5.eventName = "RemoveNode";
        menuActions.push(menuAction5);
        var menuAction = {};
        menuAction.title = "Add Closes Nodes";
        menuAction.eventName = "AddClosesNodes";
        menuActions.push(menuAction);
        var menuAction4 = {};
        menuAction4.title = "Remove Closes Nodes";
        menuAction4.eventName = "RemoveClosesNodes";
        menuActions.push(menuAction4);
        var menuAction2 = {};
        menuAction2.title = "Add All Nodes From";
        menuAction2.eventName = "AddAllNodesFrom";
        menuActions.push(menuAction2);
        var menuAction3 = {};
        menuAction3.title = "Add All Nodes To";
        menuAction3.eventName = "AddAllNodesTo";
        menuActions.push(menuAction3);

        var self = this;
        this.menu = [];
        for(var iAction in menuActions) (function(iAction) {
            var eventName = menuActions[iAction].eventName;
            var menu = {
                title: menuActions[iAction].title,
                action: function(elm, d, i) {
                    var newEvent = document.createEvent('Event');
                    var data = {};
                    data.elm = elm;
                    data.d = d;
                    data.i = i;
                    newEvent.data = data;
                    newEvent.initEvent(eventName, true, true);
                    container.dispatchEvent(newEvent);
                }
            };
            self.menu.push($.extend(true, {}, menu));
        }) (iAction);
        this.networkUI.on("oncontext", vis.contextMenu(this.menu)); 
    };






    cwLayoutNetwork.prototype.lookForObjects = function (id,scriptname,child) {
        var childrenArray = [];
        var element;
        var nextChild;
        if(child.objectTypeScriptName === scriptname && child.object_id == id) {
            return child;
        }
        for (var associationNode in child.associations) {
            if (child.associations.hasOwnProperty(associationNode)) {
                for (var i = 0; i < child.associations[associationNode].length; i += 1) {
                    nextChild = child.associations[associationNode][i];
                    element = this.lookForObjects(id,scriptname,nextChild);
                    if(element !== null) {
                        return element;
                    } 
                }
            }
        }
        return null;
    };


    cwLayoutNetwork.prototype.openObjectPage = function(id,scriptname) {
        var object = this.lookForObjects(id,scriptname,this.originalObject);
        if(object) {
            location.href = this.singleLinkMethod(scriptname, object);
        }
    };

    cwLayoutNetwork.prototype.openPopOut = function(id,scriptname) {
        var object = this.lookForObjects(id,scriptname,this.originalObject);
        if(this.popOut[scriptname]) {
            cwApi.cwDiagramPopoutHelper.openDiagramPopout(object,this.popOut[scriptname]);
        }
    };

    cwLayoutNetwork.prototype.openPopOutFromEdge = function(edge) {
        var id,scriptname,object;
        var from = edge.from.split("#");
        scriptname = from[1];
        if(this.popOut[scriptname + "_edge"]) {
            id = from[0];
            object = this.lookForObjects(id,scriptname,this.originalObject);

            if(cwApi.customLibs.popWorldMap === undefined) cwApi.customLibs.popWorldMap = {};
            cwApi.customLibs.popWorldMap.to = to;

            cwApi.cwDiagramPopoutHelper.openDiagramPopout(object,this.popOut[scriptname + "_edge"]);
            return;
        }
        scriptname = edge.scriptname;
        if(this.popOut[scriptname]){
            id = edge.object_id;
            object = this.lookForObjects(id,scriptname,this.originalObject);
            if(object) {
                cwApi.cwDiagramPopoutHelper.openDiagramPopout(object,this.popOut[scriptname]);                
            }
            return;  
        }
    };


    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));