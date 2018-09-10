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

    cwLayoutNetwork.prototype.getAssociationDisplayString = function(item){
        var assoNodeID,assoItem = {},l, getDisplayStringFromLayout = function(layout,assoItem){
            return layout.displayProperty.getDisplayString(assoItem);
        };
        try {
            assoItem.name = item.iName;
            assoItem.objectTypeScriptName = item.iObjectTypeScriptName;
            assoItem.properties = item.iProperties;

            assoNodeID = this.viewSchema.NodesByID[item.nodeID].IntersectionSchemaNodeId;
            if (!this.layoutsByNodeId.hasOwnProperty(assoNodeID)){
                var layoutOptions = this.viewSchema.NodesByID[assoNodeID].LayoutOptions;
                this.layoutsByNodeId[assoNodeID] = new cwApi.cwLayouts[this.viewSchema.NodesByID[assoNodeID].LayoutName](layoutOptions, this.viewSchema);
            } 
            return getDisplayStringFromLayout(this.layoutsByNodeId[assoNodeID],assoItem);
        } catch(e) {
            return;
        }
        
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
                    } else if(nextChild.objectTypeScriptName === this.definition.capinetworkScriptname && nextChild.properties.configuration) {
                        this.addNetwork(nextChild,child);
                    } else { // adding regular node
                        element = {}; 
                        element.name = this.multiLine(nextChild.name,this.multiLineCount);
                        element.customDisplayString = this.multiLine(this.getItemDisplayString(nextChild),this.multiLineCount);
                        element.object_id = nextChild.object_id;
                        element.objectTypeScriptName = nextChild.objectTypeScriptName;
                        if(nextChild.properties.icon && nextChild.properties.color) {
                            element.icon = {};
                            element.icon.code = nextChild.properties.icon;
                            element.icon.color = nextChild.properties.color;
                        }
                        else element.icon = null;

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
                            element.edge.unique = false;
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
                        } else { // association properties
                            if(nextChild.iProperties) {
                                element.edge = {};
                                
                                element.edge.label = this.multiLine(this.getAssociationDisplayString(nextChild),this.multiLineCount);
                                if(nextChild.iProperties && nextChild.iProperties.uniqueidentifier) {
                                    element.edge.unique = false;
                                    element.edge.id = nextChild.iProperties.uniqueidentifier;
                                    element.edge.objectTypeScriptName = nextChild.iObjectTypeScriptName;
                                    if(this.assignEdge.hasOwnProperty(nextChild.nodeID)) {
                                        element.edge.objectTypeScriptName = this.assignEdge[nextChild.nodeID];
                                    } else {
                                        element.edge.objectTypeScriptName = nextChild.iObjectTypeScriptName;
                                    }
                                  
                                } else {
                                    element.edge.unique = true;
                                    element.edge.id = child.object_id;  
                                }
                                


                            } 
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
        filtersGroup.forEach(function(filterGroup) {
            Object.keys(filterGroup).map(function(filterKey, index) {
                self.externalFilters[filterKey].addNodeToFields(filterGroup[filterKey],father);  
            });
        });   
        return childrenArray;
    };

    cwLayoutNetwork.prototype.multiLine = function(name,size) {
        if(name && size !== "" && size > 0) {
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

            return multiLineName.trim() ;            
        } else {
            return name;
        }


    };

   // obligatoire appeler par le system
    cwLayoutNetwork.prototype.drawAssociations = function (output, associationTitleText, object) {
        try {
            if(!cwAPI.isIndexPage() && object.objectTypeScriptName === this.definition.capinetworkScriptname && object.properties.configuration) {
                this.networkDisposition = JSON.parse(object.properties.configuration.replaceAll("\\",""));
            }

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
    
            if(isData) output.push('<div class="cw-visible cwLayoutNetwork" id="cwLayoutNetwork' + this.nodeID + '">'); 
            else output.push('<div id="cwLayoutNetwork' + this.nodeID + '">');
    
            output.push('<div id="cwLayoutNetworkFilter' + this.nodeID + '" class="bootstrap-iso"></div>');
            output.push('<div class="bootstrap-iso" id="cwLayoutNetworkAction' + this.nodeID + '">');
            if(this.physicsOption && this.hidePhysicsButton === false) output.push('<button class="bootstrap-iso" id="cwLayoutNetworkButtonsPhysics' + this.nodeID + '">' + $.i18n.prop('disablephysics') + '</button>');
            output.push('<button class="bootstrap-iso" id="cwLayoutNetworkDeselectAll' + this.nodeID + '">' + $.i18n.prop('deselectall') + '</button>');
            output.push('<button class="bootstrap-iso" id="cwLayoutNetworkSelectAll' + this.nodeID + '">' + $.i18n.prop('selectall') + '</button>');
            if(this.edgeOption && this.hideEdgeButton === false) output.push('<button class="bootstrap-iso" id="cwLayoutNetworkButtonsZipEdge' + this.nodeID + '">' + $.i18n.prop('unzip_edge') + '</button>');
            if(this.removeLonely) output.push('<button class="bootstrap-iso" id="cwLayoutNetworkButtonsLonelyNodes' + this.nodeID + '">' + $.i18n.prop('remove_lonely_node') + '</button>');
            output.push('<button class="bootstrap-iso" id="cwLayoutNetworkButtonsBehaviour' + this.nodeID + '">' + $.i18n.prop('behaviour_highlight') + '</button>');



            output.push('<button id="cwLayoutNetworkButtonsDownload' + this.nodeID + '"><i class="fa fa-download" aria-hidden="true"></i></button>');
            output.push('</div>');
            output.push('<div id="cwLayoutNetworkCanva' + this.nodeID + '"></div></div>');
            this.object = this.originalObject.associations;
        } catch(e) {
            return ;
        }   
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