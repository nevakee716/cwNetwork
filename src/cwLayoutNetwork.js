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
        this.clusterByGroupOption = {};
        this.clusterByGroupOption.head = "";
        this.clusterByGroupOption.child = [];
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
        this.physics = true;
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

        this.createFilterObjects(filterContainer);


        // Adding filter search
        actionContainer.insertBefore(this.network.getSearchFilterObject(this.nodeID),actionContainer.firstChild);


        // Adding filter options
        //filterContainer.appendChild(this.network.getFilterOptions());
        //give bootstrap select to filter
        $('.selectNetworkPicker_' + this.nodeID).selectpicker(); 
        $('.selectNetworkExternal_' + this.nodeID).selectpicker(); 
        $('.selectNetworkSearch_' + this.nodeID).selectpicker(); 
        $('.selectNetworkClusterByGroup_' + this.nodeID + '_child').selectpicker(); 
        $('.selectNetworkClusterByGroup_' + this.nodeID + '_head').selectpicker(); 

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
                        self.removeNodes([nodeId]);
                    } else { // add one node
                        self.network.show(id,group);
                        changeSet = self.network.getVisNode(id,group); // get all the node self should be put on
                        nodes.add(changeSet); // adding nodes into network
                        self.setAllExternalFilter();
                        self.updatePhysics();
                    }
                } else {  // select or deselect all node
                    if($(this).context[0]) {
                        var changeSet = self.network.SetAllAndGetNodesObject($(this).context[0].selected,group);
                        if($(this).context[0].selected === true) {
                            nodes.add(changeSet);
                            self.updatePhysics();
                        } else {
                            self.removeNodes(changeSet);
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


        // Cluster Group Filter Head
        $('select.selectNetworkClusterByGroup_' + this.nodeID + "_head").on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
            var group = $(this).context['id'];
            if(clickedIndex !== undefined && $(this).context.hasOwnProperty(clickedIndex)) {
                self.clusterByGroupOption.head = $(this).selectpicker('val').replaceAll("_"," ");;
                self.clusterByGroup();
            }
        });

        // Cluster Group Filter Child
        $('select.selectNetworkClusterByGroup_' + this.nodeID + "_child").on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
            if(clickedIndex !== undefined && $(this).context.hasOwnProperty(clickedIndex)) {
                self.clusterByGroupOption.child = [];
                if($(this).selectpicker('val') && $(this).selectpicker('val').length > 0) {
                    $(this).selectpicker('val').forEach(function(c) {
                        self.clusterByGroupOption.child.push(c.replaceAll("_"," "));
                    });                    
                } else {
                    self.clusterByGroupOption.child = [];
                }
                self.clusterByGroup();
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
                $(this).selectpicker('val',""); 
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
        var downloadButton = document.getElementById("cwLayoutNetworkButtonsDownload" + this.nodeID);
        downloadButton.addEventListener('click', this.downloadImage.bind(this)); 



        
        // fill the search filter
        data.nodes.on("add", this.addSearchFilterElement.bind(this));
        data.nodes.on("remove", this.removeSearchFilterElement.bind(this));

        // Activate Starting groups
        this.activateStartingGroup();

        // initialize your network!/*# sourceMappingURL=bootstrap.min.css.map */
        this.networkUI = new vis.Network(networkContainer, data, this.networkOptions);

        // Creation du menu et binding
        this.createMenu(networkContainer);
        networkContainer.addEventListener('RemoveNode', this.RemoveNodeEvent.bind(this));  
        networkContainer.addEventListener('AddClosesNodes', this.AddClosesNodes.bind(this));  
        networkContainer.addEventListener('RemoveClosesNodes', this.RemoveClosesNodes.bind(this));  
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

    // Create Filter selector
    cwLayoutNetwork.prototype.createFilterObjects = function (filterContainer) {


        filterContainer.className += " LayoutNetork_filterSection";

        var externalfilter,objectTypeNode,objectTypeNodes = this.network.getObjectTypeNodes();

        var filterGroupObject = document.createElement("div");
        filterGroupObject.className = "LayoutNetork_filterGroup";


        var filterGroupObjectTitle = document.createElement("div");
        filterGroupObjectTitle.innerHTML  = "Objects Filters";
        var filterGroupObjectFilters = document.createElement("div");
        

        var i = 0;
        // Adding filter for all selector group
        for (objectTypeNode in objectTypeNodes) {
            if (objectTypeNodes.hasOwnProperty(objectTypeNode)) {
                filterGroupObjectFilters.appendChild(objectTypeNodes[objectTypeNode].getFilterObject(this.nodeID,this.groupsArt));
                i += 1;
            }
        }
        if(i > 0) {
            filterGroupObject.appendChild(filterGroupObjectTitle);
            filterGroupObject.appendChild(filterGroupObjectFilters);
            filterContainer.appendChild(filterGroupObject);
        }

        i = 0;
        
        var associationFilterObject = document.createElement("div");
        associationFilterObject.className = "LayoutNetork_filterGroup";

        var associationFilterObjectTitle = document.createElement("div");
        associationFilterObjectTitle.innerHTML = "External Association Filters";
        
        var associationFilterObjectFilters = document.createElement("div");
        for (externalfilter in this.externalFilters) {
            if (this.externalFilters.hasOwnProperty(externalfilter)) {
                associationFilterObjectFilters.appendChild(this.externalFilters[externalfilter].getFilterObject("selectNetworkExternal_" + this.nodeID));
                i += 1;
            }
        }
        if(i > 0) {
            associationFilterObject.appendChild(associationFilterObjectTitle);
            associationFilterObject.appendChild(associationFilterObjectFilters);
            filterContainer.appendChild(associationFilterObject);
        }

        var clusterFilterObject = document.createElement("div");
        clusterFilterObject.className = "LayoutNetork_filterGroup";

        var clusterFilterObjectTitle = document.createElement("div");
        clusterFilterObjectTitle.innerHTML = "Cluster by Groups";

        var clusterFilterObjectFilterHead = document.createElement("div");
        clusterFilterObjectFilterHead = this.network.getFilterClusterByGroupHead("selectNetworkClusterByGroup_" + this.nodeID);
        var clusterFilterObjectFilterChilds = document.createElement("div");
        clusterFilterObjectFilterChilds = this.network.getFilterClusterByGroupChilds("selectNetworkClusterByGroup_" + this.nodeID);   

        clusterFilterObject.appendChild(clusterFilterObjectTitle);
        clusterFilterObject.appendChild(clusterFilterObjectFilterHead);
        clusterFilterObject.appendChild(clusterFilterObjectFilterChilds);
        filterContainer.appendChild(clusterFilterObject);

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
        if(this.physics == true) {
            this.physics = false;
            event.target.innerHTML = "Enable Physics";
        }
        else {
            this.physics = true;
            event.target.innerHTML = "Disable Physics";
        }
        this.updatePhysics();
    };

    cwLayoutNetwork.prototype.updatePhysics = function () {
        var self = this,changeset = [];
        
        if(this.physics == true) {
            this.nodes.forEach(function(node) {
                node.physics = !(node.cluster); 
                changeset.push(node);
                self.nodes.update(node);
            });
        }
        else {
            this.nodes.forEach(function(node) {
                node.physics = false;
                changeset.push(node);
                
            });
        }
        self.nodes.update(changeset);
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
                    edge.hideByZipping = true;  
                } else if (edge.zipped === false) {
                    edge.hidden = false;
                    edge.physics = true;
                    edge.hideByZipping = false;
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
                    edge.hideByZipping = false;
                } else if (edge.zipped === false) {
                    edge.hidden = true;
                    edge.physics = false;
                    edge.hideByZipping = true;
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
                    newEdge.hideByZipping = true;
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
        var self = this,changeSetNode = [];
        this.nodes.forEach(function(node) {
            var ncs = self.networkUI.getConnectedNodes(node.id);
            if(ncs.length == 0) {
                changeSetNode.push(node.id);
            }
        });   
        self.removeNodes(changeSetNode);  

    };

    cwLayoutNetwork.prototype.RemoveNodeEvent  = function (event) {
        var nodeID = event.data.d.nodes[0];
        this.removeNodes([nodeID]);
    };

    cwLayoutNetwork.prototype.removeNodes = function (nodesID) {
        var self = this,changeSetNode = [];

        nodesID.forEach(function(nodeID) {
            var node;
            if(nodeID.hasOwnProperty("id")) {
                node = self.nodes.get(nodeID.id);
            } else {
                node = self.nodes.get(nodeID);
            }
            if(node) {
                if(node.cluster) {
                    var newClusters = [];
                    self.clusters.forEach(function(cluster){
                        if(cluster.head === node.id) {
                            self.disableCluster(cluster);
                        } else {
                            cluster.nodes = cluster.nodes.filter(item => item !== node.id);
                            var connectedEdge = self.networkUI.getConnectedEdges(node.id);
                            connectedEdge.forEach(function(edgeID) {
                                var edge = self.edges.get(edgeID);
                                if(edge.cluster == true) {
                                    edge.cluster = false;
                                    edge.hidden = edge.hideByZipping;
                                    self.edges.update(edge);                    
                                }
                            });

                            if(cluster.nodes.length === 0) {
                                self.disableCluster(cluster);
                            } else {
                                newClusters.push(cluster);
                            }                  
                        }
                    });
                    self.clusters = newClusters;
                }
                changeSetNode.push(node.id);
                self.network.hide(node.id.split("#")[0],node.group.replace("Hidden",""));
                $('select.selectNetworkPicker_' + self.nodeID + "." + node.group.replaceAll(" ","_").replace("Hidden","")).each(function( index ) { // put values into filters
                    if($(this).val()) {
                        $(this).selectpicker('val',$(this).val().filter(item => item !== node.name.replaceAll("\n"," ")));
                    }
                });
            }
        });
        self.nodes.remove(changeSetNode);
    };



    Array.prototype.diff = function(a) {
        return this.filter(function(i) {return a.indexOf(i) < 0;});
    };

    cwLayoutNetwork.prototype.clusterByHubsize = function(event) {
        var maxConnected = 4;
        var distFactor = 1000;
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
            cluster = {};
            cluster.nodes = [];
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
                    dist = (center.x - point.x)*(center.x - point.x) + (center.y - point.y)* (center.y - point.y);
                    if(dist < distanceMax)  cluster.nodes.push(n);
                }
            }
            cluster.nodes.forEach(function(c) {
                delete nodesToConnect[c];
            });
            if(cluster.nodes.length < 2) loop = false;
            else {
                this.clusters.push(cluster);
            }
        }
    
        this.activateClusterEvent();
    };





    cwLayoutNetwork.prototype.clusterByGroup = function() {
        this.disableGroupClusters();
        if(this.clusterByGroupOption.head == "" || this.clusterByGroupOption.child.length < 1) {
            return;
        }

        var cluster,nodeInCluster = {},heads = [];
        var self = this;
        var i = 0;



        var nodes = this.nodes.get();
        nodes.sort(function(a, b) {
            return self.networkUI.getConnectedNodes(b.id).length - self.networkUI.getConnectedNodes(a.id).length;
        });

        nodes.forEach(function(node) {
            if(node.group === self.clusterByGroupOption.head && !nodeInCluster.hasOwnProperty(node.id)) {
                var ncs = self.networkUI.getConnectedNodes(node.id);
                if(ncs.length > 0) {
                    cluster = {};
                    cluster.head = node.id;
                    cluster.nodes = [];
                    heads.push(node.id);
                    ncs.forEach(function(nc) {
                        if(heads.indexOf(nc) === -1) {
                            if(self.clusterByGroupOption.child.indexOf(self.nodes.get(nc).group) !== -1) { // if in child group
                                if(nodeInCluster.hasOwnProperty(nc)) { // if node already cluster
                                    if(nodeInCluster[nc].connectedNode < ncs.length) {
                                        cluster.nodes.push(nc);
                                        self.clusters[nodeInCluster[nc].i].nodes = self.clusters[nodeInCluster[nc].i].nodes.filter(item => item !== nc);
                                        nodeInCluster[nc] = {}; 
                                        nodeInCluster[nc].i = i;
                                        nodeInCluster[nc].connectedNode = ncs.length;
                                    }
                                } else { // if node not clusterized
                                  nodeInCluster[nc] = {};  
                                  nodeInCluster[nc].connectedNode = ncs.length;
                                  nodeInCluster[nc].i = i;
                                  cluster.nodes.push(nc);
                                }
                            }
                        }
                    });
                    self.clusters.push(cluster);
                    i++;
                }
            }
        });

        var filteredClusters = [];
        self.clusters.forEach(function(cluster){ // remove cluster which are empty
            if(cluster.nodes.length > 0) filteredClusters.push(cluster);
        });
        this.clusters = filteredClusters;
        this.activateClusterEvent();
    };

    cwLayoutNetwork.prototype.disableGroupClusters = function () {
        var node,self = this;
        self.clusters.forEach(function(cluster){
            self.disableCluster(cluster);
        });

        this.clusters = [];
    };

    cwLayoutNetwork.prototype.disableCluster = function (cluster) {
        var self = this,changeSetNode = [],changeSetEdge = [];
        cluster.nodes.forEach(function(nodeID) {
            node = self.nodes.get(nodeID);
            node.cluster = false;
            node.physics = self.physics;
            changeSetNode.push(node);

            var connectedEdge = self.networkUI.getConnectedEdges(node.id);
            connectedEdge.forEach(function(edgeID) {
                var edge = self.edges.get(edgeID);
                if(edge.cluster == true) {
                    edge.cluster = false;
                    edge.hidden = edge.hideByZipping;
                    changeSetEdge.push(edge);                   
                }
            });
        });

        if(cluster.head) {
            var node = this.nodes.get(cluster.head);
            node.physics = this.physics;
            node.cluster = false;
            node.size = undefined;
            node.shape = undefined;
            changeSetNode.push(node);
        }
        this.edges.update(changeSetEdge); 
        this.nodes.update(changeSetNode);
    };


    cwLayoutNetwork.prototype.activateClusterEvent = function () {
        var connectedEdge,head,node,self = this,changeSetNode=[],changeSetEdge=[];
        self.clusters.forEach(function(cluster){
            cluster.nodes.forEach(function(nodeID) {
                node = self.nodes.get(nodeID);
                node.physics = false;
                node.cluster = true;
                changeSetNode.push(node);
                self.nodes.update(node);
            });

            // hide connection inside the cluster
            cluster.nodes.forEach(function(nodeID) {
                connectedEdge = self.networkUI.getConnectedEdges(nodeID);
                connectedEdge.forEach(function(edgeID) {
                    var edge = self.edges.get(edgeID);
                    if((edge.from === nodeID && cluster.nodes.indexOf(edge.to) !== -1) || (edge.to === nodeID && cluster.nodes.indexOf(edge.from) !== -1)) {
                        edge.hidden = true;
                        edge.cluster = true;
                        changeSetEdge.push(edge);
                    }
                });
            });


            // reshape the head and hide connection between head and cluster node
            if(cluster.head) {
                head = self.nodes.get(cluster.head);
                head.physics = false;
                var group = self.networkUI.groups.get(head.group);
                if(!group || group.shape != "icon") {
                    head.shape = "square";
                }
                head.size = 0;
                head.cluster = true;
                changeSetNode.push(head);
                connectedEdge = self.networkUI.getConnectedEdges(head.id);
                cluster.nodes.forEach(function(nodeID) {
                    connectedEdge.forEach(function(edgeID) {
                        if(edgeID.indexOf(nodeID) !== -1) {
                            var edge = self.edges.get(edgeID);
                            edge.hidden = true;
                            edge.cluster = true;
                            changeSetEdge.push(edge);
                        }
                    });
                });
            }
        });
        this.edges.update(changeSetEdge);
        this.nodes.update(changeSetNode);

        function LightenDarkenColor(col, amt) {
          
            var usePound = false;
          
            if (col[0] == "#") {
                col = col.slice(1);
                usePound = true;
            }
         
            var num = parseInt(col,16);
         
            var r = (num >> 16) + amt;
         
            if (r > 255) r = 255;
            else if  (r < 0) r = 0;
         
            var b = ((num >> 8) & 0x00FF) + amt;
         
            if (b > 255) b = 255;
            else if  (b < 0) b = 0;
         
            var g = (num & 0x0000FF) + amt;
         
            if (g > 255) g = 255;
            else if (g < 0) g = 0;
         
            return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
          
        }



        this.networkUI.on("beforeDrawing", function (ctx) {
            self.clusters.forEach(function(cluster){
                var nodePosition = self.networkUI.getPositions(cluster.nodes[0]);
                nodePosition = nodePosition[cluster.nodes[0]];
                var n = cluster.nodes.length;
                var ystep= 60;
                var labelmargin = 40;
                var xmargin= 60;
                var ymargin= 10;
                var headerOffset = 0;

                var group = self.networkUI.groups.get(self.nodes.get(cluster.head).group);
                if(group.shape === "icon") headerOffset = 20;

                for(i=1;i < n;i++) {
                   self.networkUI.moveNode(cluster.nodes[i],nodePosition.x,nodePosition.y+ystep*(i));
                }
                self.networkUI.moveNode(cluster.head,nodePosition.x,nodePosition.y-ymargin*2-labelmargin - headerOffset);

                ctx.strokeStyle = group.color.border;
                ctx.lineWidth = 2;
                if(group.shape === "icon") ctx.fillStyle = LightenDarkenColor(group.color.background,100);
                else  ctx.fillStyle = group.color.background;
                ctx.rect(nodePosition.x-xmargin, nodePosition.y-ymargin*2-labelmargin,2*xmargin,ystep*n+labelmargin);
                ctx.fill();
                ctx.stroke();
            }); 
        });
    };



    cwLayoutNetwork.prototype.downloadImage = function (event) {

        function downloadURI(uri, name) {
            var link = document.createElement("a");
            link.download = name;
            link.href = uri;
            link.click();
        }

        try {
            this.networkUI.fit();
            var container = document.getElementById("cwLayoutNetworkCanva" + this.nodeID);
            var oldheight = container.offsetHeight; 
            var scale = this.networkUI.getScale(); // change size of the canva to have element in good resolution
            container.style.width = (container.offsetWidth * 2/scale ).toString() + "px";
            container.style.height = (container.offsetHeight * 2/scale ).toString() + "px";
            this.networkUI.redraw();
            downloadURI(container.firstElementChild.firstElementChild.toDataURL('image/png'),cwAPI.getPageTitle() + ".png");
            this.networkUI.on("afterDrawing",function (ctx) {});
            container.style.height = oldheight + "px";
            container.style.width = "";
            
            this.networkUI.redraw();
            this.networkUI.fit();
        }
        catch (e) {
            console.log(e);
        }




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



    // dealing with adding node with the menu
    cwLayoutNetwork.prototype.RemoveClosesNodes = function (event) {
        var nodeID = event.data.d.nodes[0];
        var connected = this.networkUI.getConnectedNodes(nodeID);
        if(connected) {
            connected.push(nodeID);
            this.removeNodes(connected);
        } else {
            this.removeNodes([nodeID]);
        }
        
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
        this.updatePhysics();
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