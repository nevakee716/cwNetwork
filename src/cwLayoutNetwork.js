/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */



/*global cwAPI, jQuery */
(function (cwApi, $) {
    "use strict";
    // constructor
    var cwLayoutNetwork = function (options, viewSchema) {
        cwApi.extend(this, cwApi.cwLayouts.CwLayout, options, viewSchema); // heritage
        cwApi.registerLayoutForJSActions(this); // execute le applyJavaScript après drawAssociations

        this.hiddenNodes = [];
        this.complementaryNode = [];
        this.externalFilters = [];
        this.nodeFiltered = [];
        this.popOut = [];
        this.specificGroup = [];
        this.directionList = [];
        this.groupToSelectOnStart = [];
        this.objects = {};
        this.layoutsByNodeId = {};
        this.clusters = [];
        this.init = true;
        this.clustered = false;
        this.edgeZipped = true;
        this.multiLineCount = this.options.CustomOptions['multiLineCount'];
        this.getspecificGroupList(this.options.CustomOptions['specificGroup']);        
        this.getPopOutList(this.options.CustomOptions['popOutList']);
        this.getHiddenNodeList(this.options.CustomOptions['hidden-nodes']);
        this.getComplementaryNodeList(this.options.CustomOptions['complementaryNode']);
        this.getFontAwesomeList(this.options.CustomOptions['iconGroup']);
        this.getdirectionList(this.options.CustomOptions['arrowDirection']);
        this.getGroupToSelectOnStart(this.options.CustomOptions['groupToSelectOnStart']);
        this.getExternalFilterNodes(true,this.options.CustomOptions['filterNode']);
        this.edgeOption = true;
        this.clusterOption = false;
        this.physicsOption = true;        
        this.removeLonely = true;
        this.CDSNodesOption = true;
        this.CDSFilterOption = false;
        this.nodeOptions = {"CDSFilterOption" : this.CDSFilterOption,"CDSNodesOption" : this.CDSNodesOption};
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
                    this.directionList[optionSplit[0]] = optionSplit[1].replaceAll("'","").replaceAll('"','');
                }
            }
        }
    };

    cwLayoutNetwork.prototype.getFontAwesomeList = function(options) {
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
                    } else { //shape
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

        this.groupsArt = groups;
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



    cwLayoutNetwork.prototype.getComplementaryNodeList = function(options) {
        if(options) {

            var optionList = options.split(",");
            var optionSplit;
            for (var i = 0; i < optionList.length; i += 1) {
                if(optionList[i] !== "") {
                    this.complementaryNode.push(optionList[i]);
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
        // complmentary node
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
        if(this.physicsOption) output.push('<button id="cwLayoutNetworkButtonsPhysics' + this.nodeID + '"> Disable Physics</button>');
        if(this.clusterOption) output.push('<button id="cwLayoutNetworkButtonsCluster' + this.nodeID + '"> Cluster Nodes</button>');
        if(this.edgeOption) output.push('<button id="cwLayoutNetworkButtonsZipEdge' + this.nodeID + '"> Unzip Edges</button>');
        if(this.removeLonely) output.push('<button id="cwLayoutNetworkButtonsLonelyNodes' + this.nodeID + '"> Remove Lonely Nodes</button>');
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

    cwLayoutNetwork.prototype.applyJavaScript = function () {
        if(this.init) {
            this.init = false;
            var self = this;
            var libToLoad = [];

            if(cwAPI.isDebugMode() === true) {
                if(self.network) self.createNetwork();                    
            } else {
                libToLoad = ['modules/bootstrap/bootstrap.min.js','modules/bootstrap-select/bootstrap-select.min.js','modules/vis/vis.min.js','modules/d3/d3.min.js'];
                // AsyncLoad
                cwApi.customLibs.aSyncLayoutLoader.loadUrls(libToLoad,function(error){
                    if(error === null) {
                        libToLoad = ['modules/visNetworkMenu/visNetworkMenu.min.js']; 
                        cwApi.customLibs.aSyncLayoutLoader.loadUrls(libToLoad,function(error){
                            if(error === null) {
                                if(self.network) self.createNetwork();    
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


// Building network
    cwLayoutNetwork.prototype.createNetwork = function () {  

    
        function addStyleString(str) {
            var node = document.createElement('style');
            node.innerHTML = str;
            document.body.appendChild(node);
        }

        var networkContainer = document.getElementById("cwLayoutNetworkCanva" + this.nodeID);
        var filterContainer = document.getElementById("cwLayoutNetworkFilter" + this.nodeID);
        var actionContainer = document.getElementById("cwLayoutNetworkAction" + this.nodeID);        
        var objectTypeNodes = this.network.getObjectTypeNodes();
        var ObjectTypeNode,externalfilter;
        var mutex= true;
        var i = 0;


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
        this.networkOptions = {
            groups : this.groupsArt,
            physics: {
                barnesHut: {
                  springLength: 150
                },
                minVelocity: 0.75,
            },
            interaction: {
                keyboard: true
            }
        };


        // Adding filter for all selector group
        for (ObjectTypeNode in objectTypeNodes) {
            if (objectTypeNodes.hasOwnProperty(ObjectTypeNode)) {
                filterContainer.appendChild(objectTypeNodes[ObjectTypeNode].getFilterObject(this.nodeID,this.groupsArt));
                i = i + 1;
            }
        }

        // Adding filter for filtering by external association
        var i = 0;
        for (externalfilter in this.externalFilters) {
            if (this.externalFilters.hasOwnProperty(externalfilter)) {
                filterContainer.appendChild(this.externalFilters[externalfilter].getFilterObject("selectNetworkExternal_" + this.nodeID));
                i = i + 1;
            }
        }

        // Adding filter search
        actionContainer.insertBefore(this.network.getSearchFilterObject(this.nodeID),actionContainer.firstChild);


        // Adding filter options
        //filterContainer.appendChild(this.network.getFilterOptions());
        //give bootstrap select to filter
        $('.selectNetworkPicker_' + this.nodeID).selectpicker(); 
        $('.selectNetworkExternal_' + this.nodeID).selectpicker(); 
        $('.selectNetworkSearch_' + this.nodeID).selectpicker(); 


        // set height
        var titleReact = document.querySelector(".page-title").getBoundingClientRect();        
        var topBarReact = document.querySelector(".page-top").getBoundingClientRect();
        var actionReact = actionContainer.getBoundingClientRect();
        var filterReact = filterContainer.getBoundingClientRect();                
        var canvaHeight  = window.innerHeight - titleReact.height - actionReact.height - filterReact.height - topBarReact.height;
        networkContainer.setAttribute('style','height:' + canvaHeight + 'px');
        
        var self = this;


        // Event for filter
        // Network Node Selector
        $('select.selectNetworkPicker_' + this.nodeID).on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
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
                        self.setAllExternalFilter();
                    }
                } else {  // select or deselect all node
                    if($(this).context[0]) {
                        var changeSet = self.network.SetAllAndGetNodesObject($(this).context[0].selected,group);
                        if($(this).context[0].selected === true) {
                            nodes.add(changeSet);
                        } else {
                            nodes.remove(changeSet);
                        }
                        if(self.networkUI) {
                            self.colorAllNodes();
                            self.colorAllEdges();                        
                        }
                        self.setExternalFilterToNone(); 
                    }
                }
            }
        });

        // External Filter
        $('select.selectNetworkExternal_' + this.nodeID).on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
            var group = $(this).context['id'];
            var filterName = $(this).context.getAttribute('filterName');
            var nodesArray,id,nodeId,i,changeSet;
            
            var allNodes;
            
            if(clickedIndex !== undefined && $(this).context.hasOwnProperty(clickedIndex)) {
                id = $(this).context[clickedIndex]['id'];
                self.externalFilters[filterName].selectedId = id;
                if(id !== "0") { // On ne selectionne pas la case "None"
                    self.filterExternalAssociation(filterName,id);
                } else {
                    if(self.networkUI) {
                        self.colorAllNodes();
                        self.colorAllEdges();                        
                    }
                }
            }
        });

        // Event for filter
        // Move On a Node
        $('select.selectNetworkSearch_' + this.nodeID).on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
            if(mutex) { 
                var changeSet,id,nodeId,i;
                var groupArray = {};
                if(clickedIndex !== undefined && $(this).context.hasOwnProperty(clickedIndex)) {
                    id = $(this).context[clickedIndex]['id'];
                    var options = {
                      position: self.networkUI.getPositions()[id],
                      scale: 2,
                      offset: {x:0,y:0},
                      animation: true // default duration is 1000ms and default easingFunction is easeInOutQuad.
                    };
                    self.networkUI.moveTo(options);
                    
                    options = {"nodes": [id]};
                    self.networkUI.setSelection(options);
                } 
                $(this).selectpicker('val',"" ); 
            }
        });

       
        // Action for button
        if(this.clusterOption) {
            var clusterButton = document.getElementById("cwLayoutNetworkButtonsCluster" + this.nodeID); 
            clusterButton.addEventListener('click', this.clusterByHubsize.bind(this));              
        }
        if(this.physicsOption){
            var physicsButton = document.getElementById("cwLayoutNetworkButtonsPhysics" + this.nodeID);
            physicsButton.addEventListener('click', this.stopPhysics.bind(this)); 
        }

        if(this.edgeOption){
            var zipEdgeButton = document.getElementById("cwLayoutNetworkButtonsZipEdge" + this.nodeID);
            zipEdgeButton.addEventListener('click', this.edgeZipButtonAction.bind(this)); 
            this.createUnzipEdge();
        }

        if(this.removeLonely){
            var removeLonelyButton = document.getElementById("cwLayoutNetworkButtonsLonelyNodes" + this.nodeID);
            removeLonelyButton.addEventListener('click', this.removeLonelyButtonAction.bind(this)); 
        }


        
        // fill the search filter
        data.nodes.on("add", this.addSearchFilterElement.bind(this));
        data.nodes.on("remove", this.removeSearchFilterElement.bind(this));

        // Activate Starting groups
        this.activateStartingGroup();

        // initialize your network!/*# sourceMappingURL=bootstrap.min.css.map */
        this.networkUI = new vis.Network(networkContainer, data, this.networkOptions);

        // Creation du menu et binding
        this.createMenu(networkContainer);
        networkContainer.addEventListener('AddClosesNodes', this.AddClosesNodes.bind(this));  
        networkContainer.addEventListener('AddAllNodesFrom', this.AddAllNodesFrom.bind(this)); 
        networkContainer.addEventListener('AddAllNodesTo', this.AddAllNodesTo.bind(this)); 

        // Interaction Click
        this.networkUI.on("click", function (params) {
            if(params.hasOwnProperty('nodes') && params.nodes.length === 1) {
                if (self.networkUI.isCluster(params.nodes[0]) == true) {
                    self.networkUI.openCluster(params.nodes[0]);
                } else {
                    var split = params.nodes[0].split("#");
                    self.openPopOut(split[0],split[1]);
                }
            } else if(params.hasOwnProperty('edges') && params.edges.length === 1) {
                var edge = self.edges.get(params.edges[0]);
                self.openPopOutFromEdge(edge);
            };
        });

        this.networkUI.on("doubleClick", function (params) {
            if(params.hasOwnProperty('nodes') && params.nodes.length === 1) {
                var split = params.nodes[0].split("#");
                self.openObjectPage(split[0],split[1]);
            }
        });

        var stop = false;
        this.networkUI.on("stabilizationIterationsDone", function () {
            window.setTimeout(function (params) {
                self.networkUI.fit();
                self.networkUI.removeEventListener("startStabilizing");
                //networkContainer.style["visibility"] = "visible";
                //$('.cwloading').hide(); 
            }, 1000);
        });

 

        this.networkUI.on("startStabilizing", function (params) {
            //$('.cwloading').show(); 
            //networkContainer.style["visibility"] = "hidden";
        });



    };


    // Adding element to the search filter
    cwLayoutNetwork.prototype.addSearchFilterElement = function (event, properties, senderId) {

        var self = this;
        var html = "";
        properties.items.forEach(function(elem) {
            var node = self.nodes.get(elem);
            var label;
            if(self.CDSFilterOption) label = node.label;
            else label = node.name;
            if(self.groupsArt && self.groupsArt[node.group] && self.groupsArt[node.group].unicode) {
                html += '<option class="fa" id=' + node.id + '>&#x' + self.groupsArt[node.group].unicode + " " + label + '</option>'; 
            } else {
               html += '<option class="fa" id=' + node.id + '>' + label + '</option>'; 
            }
        });
        $('select.selectNetworkSearch_' + this.nodeID)
            .append(html)
            .selectpicker('refresh');
    };

    // Remove element to the search filter
    cwLayoutNetwork.prototype.removeSearchFilterElement = function (event, properties, senderId) {
        var self = this;
        properties.oldData.forEach(function(elem) {
            $('select.selectNetworkSearch_' + self.nodeID)
                .find('[id="' + elem.id +'"]').remove();
        });       
        $('select.selectNetworkSearch_' + self.nodeID).selectpicker('refresh');
    };

    // Adding group at start
    cwLayoutNetwork.prototype.activateStartingGroup = function (event) {
    	var self = this;
        this.groupToSelectOnStart.forEach(function(group) {
            $('.selectNetworkPicker_' + self.nodeID + "." + group.replaceAll(" ","_")).selectpicker('selectAll');
        });
    };


    cwLayoutNetwork.prototype.stopPhysics = function (event) {
        if(this.networkUI.physics.options.enabled == true) {
            this.networkOptions.physics.enabled = false;
            event.target.innerHTML = "Enable Physics";
        }
        else {
            this.networkOptions.physics.enabled = true;
            event.target.innerHTML = "Disable Physics";
        }
        this.networkUI.setOptions(this.networkOptions);

    };

    
    cwLayoutNetwork.prototype.edgeZipButtonAction  = function (event) {
        var self = this;
        if(this.edgeZipped == true) {
            event.target.innerHTML = "Zip Edges";
            this.edgeZipped = false;
            this.edges.forEach(function(edge) {
                if(edge.zipped === true && edge.labels.length > 0) {
                    edge.hidden = true;
                    edge.physics = false;    
                } else if (edge.zipped === false) {
                    edge.hidden = false;
                    edge.physics = true;
                }  
                self.edges.update(edge);         
            }); 
        } else {
            event.target.innerHTML = "unZip Edges";
            this.edgeZipped = true;
            this.edges.forEach(function(edge) {
                if(edge.zipped === true && edge.labels.length > 0) {
                    edge.hidden = false;
                    edge.physics = true;    
                } else if (edge.zipped === false) {
                    edge.hidden = true;
                    edge.physics = false;
                }  
                self.edges.update(edge);         
            });            
        }
        this.networkUI.redraw();

    };

    cwLayoutNetwork.prototype.createUnzipEdge  = function (event) {
        var self = this;
        this.edges.forEach(function(edge) {
            if(edge.zipped) {
                edge.labels.forEach(function(zipEdge) {
                    var newEdge = $.extend(true, {}, edge);
                    newEdge.zipped = false;
                    newEdge.hidden = true;
                    newEdge.physics = false;
                    newEdge.arrows = zipEdge.direction;
                    newEdge.label = zipEdge.label;   
                    newEdge.scriptname = zipEdge.scriptname;  
                    newEdge.id = edge.id + "#" + zipEdge.uuid;  
                    newEdge.object_id = zipEdge.id;
                    newEdge.width = 1;           
                    self.edges.add(newEdge);
                });                 
            }    
        }); 
    };

    cwLayoutNetwork.prototype.removeLonelyButtonAction  = function (event) {
        var self = this;
        this.nodes.forEach(function(node) {
            var ncs = self.networkUI.getConnectedNodes(node.id);
            if(ncs.length == 0) {
                self.nodes.remove(node.id);
                self.network.hide(node.id.split("#")[0],node.group);
                $('select.selectNetworkPicker_' + self.nodeID + "." + node.group.replaceAll(" ","_")).each(function( index ) { // put values into filters
                    if($(this).val()) {
                        $(this).selectpicker('val',$(this).val().filter(item => item !== node.name));
                    }
                });
            }
        });       
    };


    Array.prototype.diff = function(a) {
        return this.filter(function(i) {return a.indexOf(i) < 0;});
    };

    cwLayoutNetwork.prototype.clusterByHubsize = function(event) {
        var maxConnected = 4;
        var distFactor = 10000;
        var data = {
            nodes: this.nodes,
            edges: this.edges
        };
        var self = this;
        var biggest = "";
        this.networkUI.setData(data);


        var ncs,nodesToConnect = {};
        // created
        this.nodes.forEach(function(node) {
            ncs = self.networkUI.getConnectedNodes(node.id);
            if(ncs.length >= maxConnected - 1) {
                nodesToConnect[node.id] = ncs;
            }
        });
        var cc = 1;
        var nodesToConnectNew,nodeToDelete = [];

        // remove lonely node 
        while(cc !== 0) {
            cc = 0;
            nodesToConnectNew = {};
            for(var n in nodesToConnect) {
                if(nodesToConnect.hasOwnProperty(n)){
                    var ntd = [];
                    nodesToConnect[n].forEach(function(nc) {
                        if(!nodesToConnect.hasOwnProperty(nc)) {
                            ntd.push(nc);
                            cc = cc + 1;
                        }
                    }); 
                    nodesToConnect[n] = nodesToConnect[n].diff(ntd);
                    if(nodesToConnect[n].length >= maxConnected - 1) {
                        nodesToConnectNew[n] = nodesToConnect[n];
                    }
                }
            }
            nodesToConnect = nodesToConnectNew;
        }

        var point,dist,center,distanceMax,nodesCount,cluster,nodePositions = self.networkUI.getPositions();
        
        
        // cluster by distance
        var loop = true;
        while(loop) {
            cluster = [];
            biggest = {};
            biggest.size = 0;
            nodesCount = 0;
            //determine  biggest
            for(var n in nodesToConnect) {
                if(nodesToConnect.hasOwnProperty(n)){
                    if(nodesToConnect[n].length > biggest.size) {
                        biggest.size = nodesToConnect[n].length;
                        biggest.id = n;
                        nodesCount +=1;
                    }
                }
            }
        
            distanceMax = (nodesCount *distFactor) * nodesCount * distFactor;
            center = nodePositions[biggest.id];
            // position
            for(var n in nodesToConnect) {
                if(nodesToConnect.hasOwnProperty(n)){
                    point = nodePositions[n];
                    dist = (center.x - point.x)*(center.x - point.x) + (center.y - point.y)* (center.y - point.y)
                    if(dist < distanceMax)  cluster.push(n);
                }
            }
            cluster.forEach(function(c) {
                delete nodesToConnect[c];
            })
            if(cluster.length < 2) loop = false;
            else {
                this.clusters.push(cluster);
            }
        }
       

        var step = 50;

        this.clusters.forEach(function(cluster){
            self.createCluster(cluster,step);
        });

        this.networkUI.on("afterDrawing", function (ctx) {
            self.clusters.forEach(function(cluster){
                var nodePosition = self.networkUI.getPositions();
                nodePosition = nodePosition[cluster.toString()];
                var n,x,y;
                
                var dist = Math.sqrt(cluster.length)*50;
                var xAdd=0,yAdd=0;

                for (var i = 0; i < cluster.length; i++) {
                    if(xAdd >= dist) {
                        xAdd = 0;
                        yAdd += step; 
                    }
                    n = self.nodes.get(cluster[i]);
                    x = nodePosition.x + xAdd - step/2;
                    y = nodePosition.y + yAdd - step/2;
                    xAdd += step;
                    self.networkUI.moveNode(n.id,x,y);
                }
            }); 
        });
    };

    // dealing with adding node with the menu
    cwLayoutNetwork.prototype.createCluster = function (group,step) {
        var self = this;
        var node = {id: group.toString(),  label: '',shape: 'square',size: Math.sqrt(group.length) *step / 2,physics:false };
        // var node = {id: group.toString(),  label: '',shape: 'square',size:0,physics:false };
        this.nodes.add(node);
        this.nodes.forEach(function(node) {
            if(group.indexOf(node.id) !== -1) {
                node.physics = false;
                self.nodes.remove(node.id);
                self.nodes.add(node)
            }

        });
       // this.networkUI.redraw(group);
    };


// dealing with adding node with the menu
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
                group = node.group.replace("Hidden","");
            }
        });
        nodeID = nodeID.split("#")[0];
        changeSet = this.network.getVisNode(nodeID,group,option,true); // get all the node self should be put on
        this.fillFilter(changeSet); // add the filter value
        this.nodes.add(changeSet); // adding nodes into network
        this.setAllExternalFilter();
    };

    cwLayoutNetwork.prototype.setAllExternalFilter = function () {
        for(var extF in this.externalFilters) {
            if(this.externalFilters.hasOwnProperty(extF)) {
                if(this.externalFilters[extF].selectedId !== 0) { // On ne selectionne pas la case "None"
                    this.filterExternalAssociation(this.externalFilters[extF].label,this.externalFilters[extF].selectedId); 
                } 
            }
        }
    };


    cwLayoutNetwork.prototype.setExternalFilterToNone = function () {
        $('select.selectNetworkExternal_' + this.nodeID).selectpicker('val','None'); 
        for(var extF in this.externalFilters) {
            if(this.externalFilters.hasOwnProperty(extF)) {
                this.externalFilters[extF].selectedId = 0; 
            }
        }
    };

    cwLayoutNetwork.prototype.filterExternalAssociation = function (filterName,id) {
        var changeSet,nodesToHighlight,nodesIdToHighlight,edgesToHighlight,edgesIdToHighlight,updateArray;
        
        edgesToHighlight = this.externalFilters[filterName].getEdgesToBeFiltered(id); // on recupere les nodes qui sont associés à la data filtré
        nodesToHighlight = this.externalFilters[filterName].getNodesToBeFiltered(id); // on recupere les nodes qui sont associés à la data filtré
        changeSet = this.network.ActionAndGetChangeset(nodesToHighlight,true); // Generate the changeSet
        this.fillFilter(changeSet); // add the filter value
        this.nodes.add(changeSet); // adding nodes into network
        
        nodesIdToHighlight = [];
        if(nodesToHighlight) {
            nodesToHighlight.forEach(function(node) {
                nodesIdToHighlight.push(node.object_id + "#" + node.objectTypeScriptName);
            });
        }

        edgesIdToHighlight = [];
        if(edgesToHighlight) {
            edgesToHighlight.forEach(function(edge) {
                edgesIdToHighlight.push(edge.id + "#" + edge.objectTypeScriptName);
            });
        }

        if(this.networkUI) {
            this.colorNodes(nodesIdToHighlight);
            this.colorEdges(nodesIdToHighlight);
            this.colorUnZipEdges(nodesIdToHighlight,edgesIdToHighlight);
        }
    };


//manage color of the edge

    cwLayoutNetwork.prototype.getEdgeColorFromGroup = function (group) {
        var color = {};
        if(this.networkUI.groups.groups[group].icon) {
           color.color = this.networkUI.groups.groups[group].icon.color;
        } else {
            if(this.networkUI.groups.groups[group].color.hasOwnProperty("border")) {
                color.color = this.networkUI.groups.groups[group].color.border;    
            } else {
                color.color = this.networkUI.groups.groups[group].color;    
            }  
        } 
        color.highlight = color.color;
        color.hover = color.color;
        return color;
    };



    cwLayoutNetwork.prototype.colorNodes = function (idsToHighlight) {
        var updateArray = [];
        var self = this;
        this.nodes.forEach(function(node) {
            if(idsToHighlight.indexOf(node.id) === -1) {
                if(node.group.indexOf("Hidden") === -1) {
                    node.group = node.group + "Hidden";
                }
            } else {
                node.group = node.group.replace("Hidden","");     
            }
            if(self.networkUI.groups.groups[node.group]) {
                if(self.networkUI.groups.groups[node.group].icon) {
                    node.color = self.networkUI.groups.groups[node.group].icon.color;
                } else {
                    node.color = self.networkUI.groups.groups[node.group].color;  
                }  
            } 
            updateArray.push(node); 
        });
        this.nodes.update(updateArray);
    };

    cwLayoutNetwork.prototype.colorUnZipEdges = function (nodesIdToHighlight,edgesIdToHighlight) {
        var updateArray = [];
        var self = this;
        var allNodes = this.nodes.get({returnType:"Object"});
        this.edges.forEach(function(edge) {
            if(edge.zipped === false){
                var nodeID;
                // select the node that the edge will inherit
                if(nodesIdToHighlight.indexOf(edge.to) !== -1 && nodesIdToHighlight.indexOf(edge.from) !== -1 && edgesIdToHighlight.indexOf(edge.object_id + "#" + edge.scriptname) === -1) {
                    edge.color = self.getEdgeColorFromGroup(allNodes[edge.to].group + "Hidden");
                }
                updateArray.push(edge);               
            }
        });
        this.edges.update(updateArray);
    };

    cwLayoutNetwork.prototype.colorEdges = function (nodesIdToHighlight) {
        var updateArray = [];
        var self = this;
        var allNodes = self.nodes.get({returnType:"Object"});
        self.edges.forEach(function(edge) {
            var nodeID;
            // select the node that the edge will inherit
            if(nodesIdToHighlight.indexOf(edge.to) === -1) {
                nodeID =  edge.to;
            } else {
                nodeID =  edge.from; 
            }
            if(allNodes.hasOwnProperty(nodeID)) {
                edge.color = {};
                edge.color = self.getEdgeColorFromGroup(allNodes[nodeID].group);
            }
            updateArray.push(edge);               
        });
        this.edges.update(updateArray);
    };

    cwLayoutNetwork.prototype.colorAllNodes = function () {
        var updateArray = [];
        var self = this;
        this.nodes.forEach(function(node) {
            node.group = node.group.replace("Hidden",""); 
            if(self.networkUI.groups.groups[node.group].icon) {
                node.color = self.networkUI.groups.groups[node.group].icon.color;
            } else {
                node.color = self.networkUI.groups.groups[node.group].color;    
            } 
            updateArray.push(node); 
        });
        this.nodes.update(updateArray);
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

    cwLayoutNetwork.prototype.colorAllEdges = function () {
        var nodeID;
        var self = this;
        var updateArray = [];
        var allNodes = this.nodes.get({returnType:"Object"});
        this.edges.forEach(function(edge) {
            nodeID =  edge.from;
            if(allNodes.hasOwnProperty(nodeID)) {
                edge.color = self.getEdgeColorFromGroup(allNodes[nodeID].group);
            } else {
                edge.color = {inherit:'from'};  
            }
            updateArray.push(edge);
        });
        this.edges.update(updateArray);
    };


    cwLayoutNetwork.prototype.fillFilter = function (changeSet) {
        var groupArray = {};
        for (i = 0; i < changeSet.length; i += 1) { // put all nodes into groups
            if(!groupArray.hasOwnProperty(changeSet[i].group)) {
                groupArray[changeSet[i].group] = [];
            }
            groupArray[changeSet[i].group].push(changeSet[i].label.replace(/\n/g," "));
        }

        $('select.selectNetworkPicker_' + this.nodeID).each(function( index ) { // put values into filters
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