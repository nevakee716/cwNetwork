/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */

/*global cwAPI, jQuery */
(function (cwApi, $) {
  "use strict";
  if (cwApi && cwApi.cwLayouts && cwApi.cwLayouts.cwLayoutNetwork) {
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

    menuAction5.title = $.i18n.prop("remove_node");
    menuAction5.eventName = "RemoveNode";
    menuActions.push(menuAction5);
    var menuAction = {};
    menuAction.title = $.i18n.prop("add_closes_nodes");
    menuAction.eventName = "AddClosesNodes";
    menuActions.push(menuAction);
    var menuAction4 = {};
    menuAction4.title = $.i18n.prop("remove_closes_nodes");
    menuAction4.eventName = "RemoveClosesNodes";
    menuActions.push(menuAction4);
    var menuAction2 = {};
    menuAction2.title = $.i18n.prop("add_all_nodes_from");
    menuAction2.eventName = "AddAllNodesFrom";
    menuActions.push(menuAction2);
    var menuAction3 = {};
    menuAction3.title = $.i18n.prop("add_all_nodes_to");
    menuAction3.eventName = "AddAllNodesTo";
    menuActions.push(menuAction3);
    var menuAction6 = {};
    menuAction6.title = $.i18n.prop("add_all_connected_nodes");
    menuAction6.eventName = "AddAllConnectedNodes";
    menuActions.push(menuAction6);

    var self = this;
    this.menu = [];
    for (var iAction in menuActions)
      (function (iAction) {
        var eventName = menuActions[iAction].eventName;
        var menu = {
          title: menuActions[iAction].title,
          action: function (elm, d, i) {
            var newEvent = document.createEvent("Event");
            var data = {};
            data.elm = elm;
            data.d = d;
            data.i = i;
            newEvent.data = data;
            newEvent.initEvent(eventName, true, true);
            container.dispatchEvent(newEvent);
          },
        };
        self.menu.push($.extend(true, {}, menu));
      })(iAction);
    this.networkUI.on("oncontext", vis.contextMenu(this.menu));
  };

  cwLayoutNetwork.prototype.lookForObjects = function (id, scriptname, child) {
    var childrenArray = [];
    var element;
    var nextChild;
    if (child.objectTypeScriptName === scriptname && child.object_id == id) {
      return child;
    }
    for (var associationNode in child.associations) {
      if (child.associations.hasOwnProperty(associationNode)) {
        for (var i = 0; i < child.associations[associationNode].length; i += 1) {
          nextChild = child.associations[associationNode][i];
          element = this.lookForObjects(id, scriptname, nextChild);
          if (element !== null) {
            return element;
          }
        }
      }
    }
    return null;
  };

  cwLayoutNetwork.prototype.openObjectPage = function (id, scriptname) {
    var object = this.lookForObjects(id, scriptname, this.copyObject);
    if (object) {
      location.href = this.singleLinkMethod(scriptname, object);
    }
  };

  cwLayoutNetwork.prototype.openPopOut = function (id, scriptname) {
    var object = {};
    object.object_id = id;
    if (this.popOut[scriptname]) {
      cwApi.cwDiagramPopoutHelper.openDiagramPopout(object, this.popOut[scriptname]);
    }
  };

  cwLayoutNetwork.prototype.openPopOutFromEdge = function (edge) {
    var id, scriptname, object;
    var from = edge.from.split("#");
    scriptname = from[1];
    if (this.popOut[scriptname + "_edge"]) {
      id = from[0];
      object = this.lookForObjects(id, scriptname, this.copyObject);

      if (cwApi.customLibs.popWorldMap === undefined) cwApi.customLibs.popWorldMap = {};
      cwApi.customLibs.popWorldMap.to = to;

      cwApi.cwDiagramPopoutHelper.openDiagramPopout(object, this.popOut[scriptname + "_edge"]);
      return;
    }
    if (edge.labels && edge.labels.length > 0) {
      var outputs = edge.labels.sort(function (a, b) {
        if (a.direction === "from" && b.direction === "from") return b.label - a.label;
        else if (a.direction === "to" && b.direction === "to") return b.label - a.label;
        else if (a.direction === "to" && b.direction === "from") return false;
        else if (a.direction === "from" && b.direction === "to") return true;
      });
      cwApi.customLibs.utils.createPopOutFormultipleObjects(
        outputs.map(function (l) {
          l.objectTypeScriptName = l.scriptname;

          l.properties = {};
          l.properties.name = l.label;
          l.name = l.label;
          l.object_id = l.id;
          return l;
        })
      );
      return;
    }
    scriptname = edge.scriptname;
    if (this.popOut[scriptname]) {
      id = edge.object_id;
      object = this.lookForObjects(id, scriptname, this.copyObject);
      if (object) {
        cwApi.cwDiagramPopoutHelper.openDiagramPopout(object, this.popOut[scriptname]);
      }
      return;
    }
  };

  cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
})(cwAPI, jQuery);
