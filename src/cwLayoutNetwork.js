/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */



/*global cwAPI, jQuery */
(function (cwApi, $) {
    "use strict";
    // constructor
    var cwLayoutNetwork = function (options, viewSchema) {
        cwApi.extend(this, cwApi.cwLayouts.CwLayout, options, viewSchema); // heritage
        cwApi.registerLayoutForJSActions(this); // execute le applyJavaScript après drawAssociations

        this.hiddenNodes = [];
        this.externalFilters = [];
        this.nodeFiltered = [];
        this.popOut = [];
        this.specificGroup = [];
        this.directionList = [];
        this.groupToSelectOnStart = [];
        this.objects = {};
        this.layoutsByNodeId = {};
        this.init = true;
        this.multiLineCount = this.options.CustomOptions['multiLineCount'];
        this.getspecificGroupList(this.options.CustomOptions['specificGroup']);        
        this.getPopOutList(this.options.CustomOptions['popOutList']);
        this.getHiddenNodeList(this.options.CustomOptions['hidden-nodes']);
        this.getFontAwesomeList(this.options.CustomOptions['iconGroup']);
        this.getdirectionList(this.options.CustomOptions['arrowDirection']);
        this.getGroupToSelectOnStart(this.options.CustomOptions['groupToSelectOnStart']);
        this.getExternalFilterNodes(true,this.options.CustomOptions['filterNode']);
    };


    cwLayoutNetwork.prototype.getPopOutList = function(options) {
        if(options) {
            var optionList = options.split("#");
            var optionSplit;

            for (var i = 0; i < optionList.length; i += 1) {
                if(optionList[i] !== "") {
                    var optionSplit = optionList[i].split(",");
                    this.popOut[optionSplit[0]] = optionSplit[1];
                }
            }
        }
    };

    cwLayoutNetwork.prototype.getGroupToSelectOnStart = function(options) {
        if(options) {
            this.groupToSelectOnStart = options.split(",");
        }
    };

    cwLayoutNetwork.prototype.getdirectionList = function(options) {
        if(options) {
            var optionList = options.split("#");
            var optionSplit;

            for (var i = 0; i < optionList.length; i += 1) {
                if(optionList[i] !== "") {
                    var optionSplit = optionList[i].split(",");
                    this.directionList[optionSplit[0]] = optionSplit[1];
                }
            }
        }
    };

    cwLayoutNetwork.prototype.getFontAwesomeList = function(options) {
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
                        if(optionSplit[3]) {
                            groups[optionSplit[0]].color = {};
                            groups[optionSplit[0]].color.border = optionSplit[3];
                            groups[optionSplit[0]].color.background = optionSplit[3];
                            groups[optionSplit[0]].color.highlight = {};
                            groups[optionSplit[0]].color.highlight.border = optionSplit[3];
                            groups[optionSplit[0]].color.highlight.background = optionSplit[3];
                            groups[optionSplit[0]].icon.color = optionSplit[3];   
                        }
                        groups[optionSplit[0]].icon.size = '40'; 
                        groups[optionSplit[0]].font = {background: '#FFFFFF'}  ; 
                        groups[optionSplit[0]].background = {background: '#FFFFFF'}  ; 
                    } else {
                        groups[optionSplit[0]].shape = optionSplit[1];
                        if(optionSplit[2]) {
                            groups[optionSplit[0]].color = {};
                            if(optionSplit[3]) {groups[optionSplit[0]].color.border = optionSplit[3];}
                            else {groups[optionSplit[0]].color.border = optionSplit[2];}
                            groups[optionSplit[0]].color.background = optionSplit[2];
                            groups[optionSplit[0]].color.highlight = {};
                            groups[optionSplit[0]].color.highlight.border = optionSplit[2];
                            groups[optionSplit[0]].color.highlight.background = optionSplit[2];
                        }                
                    }
                                 
                }
            }
        }

        this.groupsIcon = groups;
    };

    cwLayoutNetwork.prototype.getspecificGroupList = function(options) {
        if(options) {
            var optionList = options.split("#");
            var optionSplit;

            for (var i = 0; i < optionList.length; i += 1) {
                if(optionList[i] !== "") {
                    var optionSplit = optionList[i].split(",");
                    this.specificGroup[optionSplit[0]] = optionSplit[1];
                }
            }
        }
    };

    cwLayoutNetwork.prototype.getHiddenNodeList = function(options) {
        if(options) {

            var optionList = options.split(",");
            var optionSplit;
            for (var i = 0; i < optionList.length; i += 1) {
                if(optionList[i] !== "") {
                    this.hiddenNodes.push(optionList[i]);
                }
            }
        }
    };


    cwLayoutNetwork.prototype.getExternalFilterNodes = function(nodeType,customOptions) {
        var optionList = customOptions.split("#");
        for (var i = 0; i < optionList.length; i += 1) {
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
    };

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
                            self.externalFilters[groupFilterName].addNodesTofield([filterElement.object_id],father);
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
                        element.name = this.multiLine(this.getItemDisplayString(nextChild),this.multiLineCount);
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
                        
                        if(hiddenNode) { //lorsqu'un node est hidden ajouter le filtrage aussi au fils
                            element.filterArray = filterArray; 
                            filtersGroup.forEach(function(filterGroup) {
                                Object.keys(filterGroup).map(function(filterKey, index) {
                                    self.externalFilters[filterKey].addNodesTofield(filterGroup[filterKey],element);
                                });
                            });

                        };

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
        this.originalObject  = object;
        this.network = new cwApi.customLibs.cwLayoutNetwork.network(this.groupsIcon);
        this.network.searchForNodesAndEdges(this.simplify(object));
        output.push('<div id="cwLayoutNetwork"><div id="cwLayoutNetworkFilter" class="bootstrap-iso"></div><div id="cwLayoutNetworkCanva"></div></div>');
        this.object = object.associations;
    };


    cwLayoutNetwork.prototype.applyJavaScript = function () {
        if(this.init) {
            this.init = false;
            var self = this;
            var libToLoad = [];

            if(cwAPI.isDebugMode() === true) {
                self.createNetwork();
            } else {
                libToLoad = ['modules/bootstrap/bootstrap.min.js','modules/bootstrap-select/bootstrap-select.min.js','modules/vis/vis.min.js','modules/d3/d3.min.js'];
                // AsyncLoad
                cwApi.customLibs.aSyncLayoutLoader.loadUrls(libToLoad,function(error){
                    if(error === null) {
                        libToLoad = ['modules/visNetworkMenu/visNetworkMenu.min.js']; 
                        cwApi.customLibs.aSyncLayoutLoader.loadUrls(libToLoad,function(error){
                            if(error === null) {
                                self.createNetwork(); 
                            } else {
                                cwAPI.Log.Error(error); 
                            }
                        });            
                    } else {
                        cwAPI.Log.Error(error);
                    }
                });
            }
        }
    };


    cwLayoutNetwork.prototype.createNetwork = function () {  

        var networkContainer = document.getElementById("cwLayoutNetworkCanva");
        var filterContainer = document.getElementById("cwLayoutNetworkFilter");
        var objectTypeNodes = this.network.getObjectTypeNodes();
        var ObjectTypeNode,externalfilter;
        var mutex= true;
        var i = 0;
        // set height
        var canvaHeight = window.innerHeight - networkContainer.getBoundingClientRect().top;
        networkContainer.setAttribute('style','height:' + canvaHeight + 'px');

        // legend
        var x = - networkContainer.clientWidth / 2 + 70;
        var y = - networkContainer.clientHeight / 2 + 150;
        var step = 70;
        
        // provide the data in the vis format
        var nodes = new vis.DataSet(); //this.network.getVisNodes());
        var edges = new vis.DataSet(this.network.getVisEdges()); //this.network.getVisEdges());
        this.nodes = nodes;
        this.edges = edges;

        var data = {
            nodes: nodes,
            edges: edges
        };
        var options = {
            groups : this.groupsIcon,
            physics: {
                barnesHut: {
                  springLength: 130
                },
                minVelocity: 0.75
            }
        };

/*        var options = {
            groups : this.groupsIcon,
            layout: {
                hierarchical: {
                    direction: "UD"
                }
            },
            edges: {
                smooth: true
            }
        };*/

        // Adding filter for all selector group
        for (ObjectTypeNode in objectTypeNodes) {
            if (objectTypeNodes.hasOwnProperty(ObjectTypeNode)) {
                filterContainer.appendChild(objectTypeNodes[ObjectTypeNode].getFilterObject());
                i = i + 1;
            }
        }

        // Adding filter for filtering by external association
        var i = 0;
        for (externalfilter in this.externalFilters) {
            if (this.externalFilters.hasOwnProperty(externalfilter)) {
                filterContainer.appendChild(this.externalFilters[externalfilter].getFilterObject("selectNetworkExternal"));
                i = i + 1;
            }
        }


        // Adding filter options
        //filterContainer.appendChild(this.network.getFilterOptions());
        
        //give bootstrap select to filter
        $('.selectNetworkPicker').selectpicker(); 
        $('.selectNetworkExternal').selectpicker(); 

        // initialize your network!/*# sourceMappingURL=bootstrap.min.css.map */
        this.networkUI = new vis.Network(networkContainer, data, options);
        var self = this;


        // Network Node Selector
        $('select.selectNetworkPicker').on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
            if(mutex) { 
                var group = $(this).context['id'];
                var scriptname = $(this).context.getAttribute('scriptname');
                var changeSet,id,nodeId,i;
                var groupArray = {};
                var globValues = $('select.selectNetworkAllGroups').val();

                if(clickedIndex !== undefined && $(this).context.hasOwnProperty(clickedIndex)) {
                    id = $(this).context[clickedIndex]['id'];
                    nodeId = id + "#" + scriptname;
                    if(newValue === false) { // hide a node
                        nodes.remove(nodeId);
                        self.network.hide(id,group);
                    } else { // add one node
                        self.network.show(id,group);
                        changeSet = self.network.getVisNode(id,group); // get all the node self should be put on
                        nodes.add(changeSet); // adding nodes into network
                        self.networkUI.selectNodes([changeSet[0].id]); //select the origin node
                    }
                } else {  // select or deselect all node
                    if($(this).context[0]) {
                        var changeSet = self.network.SetAllAndGetNodesObject($(this).context[0].selected,group);
                        if($(this).context[0].selected === true) {
                            nodes.add(changeSet);
                        } else {
                            nodes.remove(changeSet);
                        }
                        self.colorAllEdges(nodes,edges); // on recolorise tous les noeuds
                        self.setExternalFilterToNone(); 
                    }
                }
            }
        });

        // External Filter
        $('select.selectNetworkExternal').on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
            var group = $(this).context['id'];
            var filterName = $(this).context.getAttribute('filterName');
            var nodesArray,id,nodeId,i,changeSet;
            var globValues = $('select.selectNetworkAllGroups').val();
            var nodesToHighlight,idsToHighlight,updateArray;
            var allNodes;
            
            if(clickedIndex !== undefined && $(this).context.hasOwnProperty(clickedIndex)) {
                id = $(this).context[clickedIndex]['id'];
                if(id !== "0") {
                    nodesToHighlight = self.externalFilters[filterName].getNodesToBeFiltered(id);
                    changeSet = self.network.ActionAndGetChangeset(nodesToHighlight,true);
                    self.fillFilter(changeSet); // add the filter value
                    nodes.add(changeSet); // adding nodes into network
                    idsToHighlight = [];
                    nodesToHighlight.forEach(function(node) {
                        idsToHighlight.push(node.object_id + "#" + node.objectTypeScriptName);
                    });
                    self.colorNodes(nodes,idsToHighlight);
                    self.colorEdges(nodes,edges,idsToHighlight);
                } else {
                    self.colorAllNodes(nodes);
                    self.colorAllEdges(nodes,edges); 
                }
            }
        });

        this.networkUI.on("click", function (params) {
            if(params.hasOwnProperty('nodes') && params.nodes.length === 1) {
                var split = params.nodes[0].split("#");
                self.openPopOut(split[0],split[1]);
            }
        });
        this.networkUI.on("doubleClick", function (params) {
            if(params.hasOwnProperty('nodes') && params.nodes.length === 1) {
                var split = params.nodes[0].split("#");
                self.openObjectPage(split[0],split[1]);
            }
        });

        // Creation du menu et binding
        this.createMenu(networkContainer);
        networkContainer.addEventListener('AddClosesNodes', this.AddClosesNodes.bind(this));  
        networkContainer.addEventListener('AddAllNodesFrom', this.AddAllNodesFrom.bind(this)); 
        networkContainer.addEventListener('AddAllNodesTo', this.AddAllNodesTo.bind(this)); 

        // Activate Starting groups
        this.activateStartingGroup();
    };





    cwLayoutNetwork.prototype.activateStartingGroup = function (event) {
        this.groupToSelectOnStart.forEach(function(group) {
            $('.selectNetworkPicker.' + group).selectpicker('selectAll');
        });
    };

    cwLayoutNetwork.prototype.AddClosesNodes = function (event) {
        var option = {};
        option.ImpactTo = true;
        option.ImpactFrom = true;
        option.rangeMin = true;
        option.rangeMax = false;
        option.NoOrigin = true;
        this.AddNodesToNetwork(event,option);
    };

    cwLayoutNetwork.prototype.AddAllNodesFrom = function (event) {
        var option = {};
        option.ImpactTo = false;
        option.ImpactFrom = true;
        option.rangeMin = false;
        option.rangeMax = true;
        option.NoOrigin = true;
        this.AddNodesToNetwork(event,option);
    };

    cwLayoutNetwork.prototype.AddAllNodesTo = function (event) {
        var option = {};
        option.ImpactTo = true;
        option.ImpactFrom = false;
        option.rangeMin = false;
        option.rangeMax = true;
        option.NoOrigin = true;
        this.AddNodesToNetwork(event,option);
    };

    cwLayoutNetwork.prototype.AddNodesToNetwork = function (event,option) {
        var nodeID = event.data.d.nodes[0];
        var group,changeSet;
        this.nodes.forEach(function(node) { 
            if(node.id === nodeID) {
                group = node.group;
            }
        });
        nodeID = nodeID.split("#")[0];
        changeSet = this.network.getVisNode(nodeID,group,option,true); // get all the node self should be put on
        this.fillFilter(changeSet); // add the filter value
        this.nodes.add(changeSet); // adding nodes into network
    };


    cwLayoutNetwork.prototype.colorNodes = function (nodes,idsToHighlight) {
        var updateArray = [];
        var self = this;
        nodes.forEach(function(node) {
            if(idsToHighlight.indexOf(node.id) === -1) {
                if(node.group.indexOf("Hidden") === -1) {
                    node.group = node.group + "Hidden";
                }
            } else {
                node.group = node.group.replace("Hidden","");     
            }
            if(self.networkUI.groups.groups[node.group].icon) {
                node.color = self.networkUI.groups.groups[node.group].icon.color;
            } else {
                node.color = self.networkUI.groups.groups[node.group].color;    
            } 
            updateArray.push(node); 
        });
        nodes.update(updateArray);
    };


    cwLayoutNetwork.prototype.colorEdges = function (nodes,edges,idsToHighlight) {
        var updateArray = [];
        var self = this;
        var allNodes = nodes.get({returnType:"Object"});
        edges.forEach(function(edge) {
            var nodeID;
            if(idsToHighlight.indexOf(edge.from) === -1)
            {   
                nodeID =  edge.from;
            } 
            else if(idsToHighlight.indexOf(edge.to) === -1) {
                nodeID =  edge.to;
            } else {
                nodeID =  edge.from; 
            }
            if(allNodes.hasOwnProperty(nodeID)) {
                if(self.networkUI.groups.groups[allNodes[nodeID].group].icon) {
                    edge.color = self.networkUI.groups.groups[allNodes[nodeID].group].icon.color;
                } else {
                    edge.color = self.networkUI.groups.groups[allNodes[nodeID].group].color;    
                } 
            }

            updateArray.push(edge);
        });
        edges.update(updateArray);
    };

    cwLayoutNetwork.prototype.colorAllNodes = function (nodes) {
        var updateArray = [];
        var self = this;
        nodes.forEach(function(node) {
            node.group = node.group.replace("Hidden",""); 
            if(self.networkUI.groups.groups[node.group].icon) {
                node.color = self.networkUI.groups.groups[node.group].icon.color;
            } else {
                node.color = self.networkUI.groups.groups[node.group].color;    
            } 
            updateArray.push(node); 
        });
        nodes.update(updateArray);
    };

    cwLayoutNetwork.prototype.createMenu = function (container) {
        var menuActions = [];
        var menuAction = {};
        menuAction.title = "Add Closes Nodes";
        menuAction.eventName = "AddClosesNodes";
        menuActions.push(menuAction);
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

    cwLayoutNetwork.prototype.colorAllEdges = function (nodes,edges) {
        var nodeID;
        var self = this;
        var updateArray = [];
        var allNodes = nodes.get({returnType:"Object"});
        edges.forEach(function(edge) {
            nodeID =  edge.from;
            if(allNodes.hasOwnProperty(nodeID)) {
                if(self.networkUI.groups.groups[allNodes[nodeID].group].icon) {
                    edge.color = self.networkUI.groups.groups[allNodes[nodeID].group].icon.color;
                } else {
                    edge.color = self.networkUI.groups.groups[allNodes[nodeID].group].color;    
                } 
            }
            updateArray.push(edge);
        });
        edges.update(updateArray);
    };

    cwLayoutNetwork.prototype.setExternalFilterToNone = function () {
        $('select.selectNetworkExternal').selectpicker('val','None'); 
    };

    cwLayoutNetwork.prototype.fillFilter = function (changeSet) {
        var groupArray = {};
        for (i = 0; i < changeSet.length; i += 1) { // put all nodes into groups
            if(!groupArray.hasOwnProperty(changeSet[i].group)) {
                groupArray[changeSet[i].group] = [];
            }
            groupArray[changeSet[i].group].push(changeSet[i].label.replace(/\n/g," "));
        }

        $('select.selectNetworkPicker').each(function( index ) { // put values into filters
            if($(this).val()) {
                $(this).selectpicker('val',$(this).val().concat(groupArray[$(this).context.name]));
            } else {
                $(this).selectpicker('val',groupArray[$(this).context.name] ); 
            }
        });
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



    cwApi.cwLayouts.cwLayoutNetwork = cwLayoutNetwork;
}(cwAPI, jQuery));