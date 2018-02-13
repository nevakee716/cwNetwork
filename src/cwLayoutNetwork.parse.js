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

    cwLayoutNetwork.prototype.getItemDisplayString = function(item){
        var l, getDisplayStringFromLayout = function(layout){
            return layout.displayProperty.getDisplayString(item);
        };
        if (item.nodeID === this.nodeID){
            return this.displayProperty.getDisplayString(item);
        }
        if (!this.layoutsByNodeId.hasOwnProperty(item.nodeID)){
            if (this.viewSchema.NodesByID.hasOwnProperty(item.nodeID)){
                var layoutOptions = this.viewSchema.NodesByID[item.nodeID].LayoutOptions;
                this.layoutsByNodeId[item.nodeID] = new cwApi.cwLayouts[item.layoutName](layoutOptions, this.viewSchema);
            } else {
                return item.name;
            }
        }
        return getDisplayStringFromLayout(this.layoutsByNodeId[item.nodeID]);
    };

    cwLayoutNetwork.prototype.simplify = function (child,father,hiddenNode) {
        var childrenArray = [];
        var filterArray = [];
        var filtersGroup = [];
        var filteredFields = [];
        var groupFilter = {};
        var element,filterElement,groupFilter;
        var nextChild;
        var self = this;
        for (var associationNode in child.associations) {
            if (child.associations.hasOwnProperty(associationNode)) {
                for (var i = 0; i < child.associations[associationNode].length; i += 1) {
                    nextChild = child.associations[associationNode][i];
                    if(this.nodeFiltered.hasOwnProperty(associationNode)) { // external Filter Node
                        filterElement = {}; 
                        filterElement.name = child.associations[associationNode][i].name; 
                        filterElement.object_id = child.associations[associationNode][i].object_id; 
                        
                        this.nodeFiltered[associationNode].forEach(function(groupFilterName) {
                            self.externalFilters[groupFilterName].addfield(filterElement.name,filterElement.object_id);
                            if(groupFilter[groupFilterName]) {
                                groupFilter[groupFilterName].push(filterElement.object_id);
                            } else {
                                groupFilter[groupFilterName] = [filterElement.object_id];
                            }
                            filtersGroup.push(groupFilter);
                        });
                    } else if(this.hiddenNodes.indexOf(associationNode) !== -1) { // jumpAndMerge when hidden
                        childrenArray = childrenArray.concat(this.simplify(nextChild,father,true));
                    } else { // adding regular node
                        element = {}; 
                        element.name = this.multiLine(nextChild.name,this.multiLineCount);
                        element.customDisplayString = this.multiLine(this.getItemDisplayString(nextChild),this.multiLineCount);
                        element.object_id = nextChild.object_id;
                        element.objectTypeScriptName = nextChild.objectTypeScriptName;

                        // on check si l'element appartient deja a un group
                        if(!this.objects.hasOwnProperty(element.object_id + "#" + element.objectTypeScriptName)) {
                            if(this.specificGroup.hasOwnProperty(associationNode)) { // mise en place du groupe
                                element.group = this.specificGroup[associationNode];
                            } else {
                                element.group = cwAPI.mm.getObjectType(nextChild.objectTypeScriptName).name;                           
                            }
                            this.objects[element.object_id + "#" + element.objectTypeScriptName] = element.group;                           
                        } else {
                            element.group = this.objects[element.object_id + "#" + element.objectTypeScriptName];
                        }
                        
                        if(hiddenNode) { //lorsqu'un node est hidden ajouter les elements en edges
                            element.edge = {};
                            element.edge.label = this.multiLine(this.getItemDisplayString(child),this.multiLineCount);
                            element.edge.id = child.object_id;
                            element.edge.objectTypeScriptName = child.objectTypeScriptName;
                            element.filterArray = filterArray; 
                            filtersGroup.forEach(function(filterGroup) {
                                Object.keys(filterGroup).map(function(filterKey, index) {
                                    // On ajoute le edge et les éléments pères, fils
                                    self.externalFilters[filterKey].addEdgeToFields(filterGroup[filterKey],element.edge);
                                    self.externalFilters[filterKey].addNodeToFields(filterGroup[filterKey],father); 
                                    self.externalFilters[filterKey].addNodeToFields(filterGroup[filterKey],element); 
                                });
                            });
                        } else {
                            filtersGroup.forEach(function(filterGroup) {
                                Object.keys(filterGroup).map(function(filterKey, index) {
                                    self.externalFilters[filterKey].addNodeToFields(filterGroup[filterKey],father);  
                                });
                            });
                                                     
                        }

                        if(this.directionList.hasOwnProperty(associationNode)) { // ajout de la direction
                            element.direction = this.directionList[associationNode];
                        }

                        element.children = this.simplify(nextChild,element);
                        childrenArray.push(element);   
                    }
                }
            } 
        }

        return childrenArray;
    };

    cwLayoutNetwork.prototype.multiLine = function(name,size) {
        if(size !== "" && size > 0) {
            var nameSplit = name.split(" "); 
            var carry = 0;
            var multiLineName = "";
            for (var i = 0; i < nameSplit.length -1; i += 1) {
                if(nameSplit[i].length > size || carry + nameSplit[i].length > size) {
                    multiLineName += nameSplit[i] + "\n";
                    carry = 0;
                } else {
                    carry += nameSplit[i].length + 1;
                    multiLineName += nameSplit[i] + " ";
                }
            }
            multiLineName = multiLineName + nameSplit[nameSplit.length - 1];

            return multiLineName ;            
        } else {
            return name;
        }


    };

   // obligatoire appeler par le system
    cwLayoutNetwork.prototype.drawAssociations = function (output, associationTitleText, object) {
        this.originalObject  = $.extend({}, object);
        var simplifyObject, i, assoNode = {} , isData = false;
        // keep the node of the layout
        assoNode[this.mmNode.NodeID] = object.associations[this.mmNode.NodeID];
        // complementary node
        this.complementaryNode.forEach(function(nodeID) {
            if(object.associations[nodeID]) {
                assoNode[nodeID] = object.associations[nodeID];
            }
        });

        this.originalObject.associations = assoNode;     
        var simplifyObject = this.simplify(this.originalObject);
        if(simplifyObject.length > 0) isData = true;
        if(!cwAPI.isIndexPage()) {
            simplifyObject = this.addObjectOfObjectPage(simplifyObject,object);
        }      
       
        this.network = new cwApi.customLibs.cwLayoutNetwork.network();
        this.network.searchForNodesAndEdges(simplifyObject,this.nodeOptions);

        if(isData) output.push('<div class="cw-visible" id="cwLayoutNetwork' + this.nodeID + '">'); 
        else output.push('<div id="cwLayoutNetwork' + this.nodeID + '">');

        output.push('<div id="cwLayoutNetworkFilter' + this.nodeID + '" class="bootstrap-iso"></div>');
        output.push('<div class="bootstrap-iso" id="cwLayoutNetworkAction' + this.nodeID + '">');
        if(this.physicsOption) output.push('<button class="bootstrap-iso" id="cwLayoutNetworkButtonsPhysics' + this.nodeID + '"> Disable Physics</button>');
        if(this.clusterOption) output.push('<button class="bootstrap-iso" id="cwLayoutNetworkButtonsCluster' + this.nodeID + '"> Cluster Nodes</button>');
        if(this.edgeOption) output.push('<button class="bootstrap-iso" id="cwLayoutNetworkButtonsZipEdge' + this.nodeID + '"> Unzip Edges</button>');
        if(this.removeLonely) output.push('<button class="bootstrap-iso" id="cwLayoutNetworkButtonsLonelyNodes' + this.nodeID + '"> Remove Lonely Nodes</button>');
        output.push('<button id="cwLayoutNetworkButtonsDownload' + this.nodeID + '"><i class="fa fa-download" aria-hidden="true"></i></button>');
        output.push('</div>');
        output.push('<div id="cwLayoutNetworkCanva' + this.nodeID + '"></div></div>');
        this.object = this.originalObject.associations;
    };

    cwLayoutNetwork.prototype.addObjectOfObjectPage = function (simplifyObject,object) {
        var rootID,element = {}; 
        element.name = this.multiLine(object.name,this.multiLineCount);
        element.customDisplayString = this.multiLine(this.getItemDisplayString(object),this.multiLineCount);
        element.object_id = object.object_id;
        element.objectTypeScriptName = object.objectTypeScriptName;

        if(this.viewSchema.rootID && this.viewSchema.rootID.length > 0) {
            rootID = this.viewSchema.rootID[0];
        }

        // on check si l'element appartient deja a un group
        if(!this.objects.hasOwnProperty(element.object_id + "#" + element.objectTypeScriptName)) {
            if(this.specificGroup.hasOwnProperty(rootID)) { // mise en place du groupe
                element.group = this.specificGroup[rootID];
            } else {
                element.group = cwAPI.mm.getObjectType(object.objectTypeScriptName).name;                           
            }
            this.objects[element.object_id + "#" + element.objectTypeScriptName] = element.group;                           
        } else {
            element.group = this.objects[element.object_id + "#" + element.objectTypeScriptName];
        }
          if(this.directionList.hasOwnProperty(rootID)) { // ajout de la direction
            element.direction = this.directionList[rootID];
        }
        element.children = simplifyObject;

        return [element];

    };
    
    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));