/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */

/*global cwAPI, jQuery */
(function (cwApi, $) {
    "use strict";

    // constructor
    var cwLayoutNetwork = function (options, viewSchema) {
        cwApi.extend(this, cwApi.cwLayouts.CwLayout, options, viewSchema); // heritage
        cwApi.registerLayoutForJSActions(this); // execute le applyJavaScript après drawAssociations

        this.hiddenNodes = [];
        this.popOut = [];
        this.specificGroup = [];
        this.directionList = [];
        this.init = true;
        this.getspecificGroupList(this.options.CustomOptions['specificGroup']);        
        this.getPopOutList(this.options.CustomOptions['popOutList']);
        this.getHiddenNodeList(this.options.CustomOptions['hidden-nodes']);
        this.getFontAwesomeList(this.options.CustomOptions['iconGroup']);
        this.getdirectionList(this.options.CustomOptions['arrowDirection']);
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
                    groups[optionSplit[0]].shape = 'icon';
                    groups[optionSplit[0]].icon = {};
                    groups[optionSplit[0]].icon.face = 'FontAwesome';
                    groups[optionSplit[0]].icon.code = unescape('%u' + optionSplit[1]);
                    if(optionSplit[2]) {
                       groups[optionSplit[0]].icon.color = optionSplit[2];   
                    }
                     groups[optionSplit[0]].icon.size = '50';                                     
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

    cwLayoutNetwork.prototype.simplify = function (child) {
        var childrenArray = [];
        var element;
        var nextChild;
        for (var associationNode in child.associations) {
            if (child.associations.hasOwnProperty(associationNode)) {
                for (var i = 0; i < child.associations[associationNode].length; i += 1) {
                    nextChild = child.associations[associationNode][i];
                    if(this.hiddenNodes.indexOf(associationNode) !== -1) {
                        childrenArray = childrenArray.concat(this.simplify(nextChild));
                    } else {
                        element = {}; 
                        element.name = this.multiLine(nextChild.name,7);
                        element.object_id = nextChild.object_id;
                        element.objectTypeScriptName = nextChild.objectTypeScriptName;
                        if(this.specificGroup.hasOwnProperty(associationNode)) {
                            element.group = this.specificGroup[associationNode];
                        } else {
                            element.group = cwAPI.mm.getObjectType(nextChild.objectTypeScriptName).name;                           
                        }

                        if(this.directionList.hasOwnProperty(associationNode)) {
                            element.direction = this.directionList[associationNode];
                        }

                        element.children = this.simplify(nextChild);
                        childrenArray.push(element);   
                    }
                }
            } 
        }
        return childrenArray;
    };

    cwLayoutNetwork.prototype.multiLine = function(name,size) {
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
            var that = this;
            var libToLoad = [];

            if(cwAPI.isDebugMode() === true) {
                that.createNetwork();
            } else {
                libToLoad = ['modules/bootstrap/bootstrap.min.js','modules/bootstrap-select/bootstrap-select.min.js','modules/vis/vis.min.js'];
                // AsyncLoad
                cwApi.customLibs.aSyncLayoutLoader.loadUrls(libToLoad,function(error){
                    if(error === null) {
                        that.createNetwork();                
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
        var ObjectTypeNode;
        var mutex= true;
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
        var data = {
            nodes: nodes,
            edges: edges
        };
        var options = {
            groups : this.groupsIcon,
            //interaction:{hover:true}
        };

        filterContainer.appendChild(this.network.getFilterAllGroups());

        var i = 0;
        for (ObjectTypeNode in objectTypeNodes) {
            if (objectTypeNodes.hasOwnProperty(ObjectTypeNode)) {
                filterContainer.appendChild(objectTypeNodes[ObjectTypeNode].getFilterObject());
                //nodes.add({id: 1000+ i , x: x, y: y + i*step, label: ObjectTypeNode, group: ObjectTypeNode, value: 1, fixed: true, physics:false});
                i = i + 1;
            }
        }
        filterContainer.appendChild(this.network.getFilterOptions());
        
        $('.selectNetworkPicker').selectpicker();
        $('.selectNetworkOptions').selectpicker();    
        $('.selectNetworkAllGroups').selectpicker();  
        // initialize your network!/*# sourceMappingURL=bootstrap.min.css.map */
        this.networkUI = new vis.Network(networkContainer, data, options);
        var that = this;


        // Network Live Option
        $('select.selectNetworkOptions').on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
            if(clickedIndex !== undefined) {
                var id = $(this).context[clickedIndex]['id'];
                if(newValue === false) {
                    that.network.DeActivateOption(id);
                } else {
                    that.network.ActivateOption(id);
                }
            }
        });

        // Network All node selector
        $('select.selectNetworkAllGroups').on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
            mutex = false;
            if(clickedIndex !== undefined) {
                var id = $(this).context[clickedIndex]['id'];
                if(newValue === true) {
                    $('.selectNetworkPicker.' + $(this).context[clickedIndex]['id']).selectpicker('selectAll');
                    var changeNodesArray = that.network.SetAllAndGetNodesObject(true,$(this).context[clickedIndex].value);
                    nodes.add(changeNodesArray);
                } else {                  
                    $('.selectNetworkPicker.' + $(this).context[clickedIndex]['id']).selectpicker('deselectAll');
                    var changeNodesArray = that.network.SetAllAndGetNodesObject(false,$(this).context[clickedIndex].value);
                    nodes.remove(changeNodesArray);
                }
            } else {
                if($(this).context[0]) { 
                    if($(this).context[0].selected === true) {
                        $('.selectNetworkPicker').selectpicker('selectAll');
                        var changeNodesArray = that.network.SetAllAndGetNodesObject(true);
                        nodes.add(changeNodesArray);
                    } else {
                        $('.selectNetworkPicker').selectpicker('deselectAll');
                        var changeNodesArray = that.network.SetAllAndGetNodesObject(false);
                        nodes.remove(changeNodesArray);
                    }
                }
            }
            mutex = true;
        });

        // Network Node Selector
        $('select.selectNetworkPicker').on('changed.bs.select', function (e, clickedIndex, newValue, oldValue) {
            if(mutex) { 
                var group = $(this).context['id'];
                var scriptname = $(this).context.getAttribute('scriptname');
                var nodesArray,id,nodeId,i;
                var groupArray = {};
                var globValues = $('select.selectNetworkAllGroups').val();

                if(clickedIndex !== undefined && $(this).context.hasOwnProperty(clickedIndex)) {
                    id = $(this).context[clickedIndex]['id'];
                    nodeId = id + "#" + scriptname;
                    if(newValue === false) { // hide a node
                        nodes.remove(nodeId);
                        that.network.hide(id,group);
                    } else { // add one node
                        that.network.show(id,group);
                        nodesArray = that.network.getVisNode(id,group); // get all the node that should be put on
                        for (i = 0; i < nodesArray.length; i += 1) { // put all nodes into groups
                            if(!groupArray.hasOwnProperty(nodesArray[i].group)) {
                                groupArray[nodesArray[i].group] = [];
                            }
                            groupArray[nodesArray[i].group].push(nodesArray[i].label.replace(/\n/g," "));
                        }

                        $('select.selectNetworkPicker').each(function( index ) { // put values into filters
                            if($(this).val()) {
                                $(this).selectpicker('val',$(this).val().concat(groupArray[$(this).context.name]));
                            } else {
                                $(this).selectpicker('val',groupArray[$(this).context.name] ); 
                            }
                            // check if global filter should be fullfill
                            if($(this).val() && $(this).context.length === $(this).val().length) {
                                if(globValues === null) {
                                    $('select.selectNetworkAllGroups').selectpicker('val',$(this).context.getAttribute('name'));
                                    globValues = [$(this).context.getAttribute('name')];  
                                } else {
                                    globValues.push($(this).context.getAttribute('name'));
                                    $('select.selectNetworkAllGroups').selectpicker('val',globValues); 
                                }
                            }
                        });

                        nodes.add(nodesArray); // adding nodes into network
                        that.networkUI.selectNodes([nodesArray[0].id]);
                    }
                } else {  // select or deselect all node
                    if($(this).context[0]) {
                        var changeNodesArray = that.network.SetAllAndGetNodesObject($(this).context[0].selected,group);
                        if($(this).context[0].selected === true) {
                            nodes.add(changeNodesArray);
                        } else {
                            nodes.remove(changeNodesArray);
                        }
                    }

                }

                // changement d'état pour le filtre global
                // on check si on a toutes les valeurs
                if($(this).val() && $(this).context.length === $(this).val().length) {
                    if(globValues === null) {
                        $('select.selectNetworkAllGroups').selectpicker('val',$(this).context.getAttribute('name'));    
                    } else {
                        globValues.push($(this).context.getAttribute('name'));
                        $('select.selectNetworkAllGroups').selectpicker('val',globValues); 
                    }
                } else {
                    // si certaines valeurs sont cochées
                    if(globValues !== null) { 
                        var value = $(this).context.getAttribute('name');
                        globValues = globValues.filter(function(item) { 
                            return item !== value;
                        });
                        $('select.selectNetworkAllGroups').selectpicker('val',globValues); 
                    }
                }
            }

        });


        this.networkUI.on("click", function (params) {
            if(params.hasOwnProperty('nodes') && params.nodes.length === 1) {
                var split = params.nodes[0].split("#");
                that.openPopOut(split[0],split[1]);


            }
        });
        this.networkUI.on("doubleClick", function (params) {
            if(params.hasOwnProperty('nodes') && params.nodes.length === 1) {
                var split = params.nodes[0].split("#");
                that.openObjectPage(split[0],split[1]);
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