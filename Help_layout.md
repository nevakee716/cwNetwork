| **Name** | **cwLayoutNetwork** | **Version** | 
| --- | --- | --- |
| **Updated by** | Mathias PFAUWADEL | 3.8 |


## Patch Notes

* 3.8 : Adding 2 buttons to zip and unzip Edge and to disable physics
* 3.7 : Network is now correctly zoom at start 
* 3.6 : Adding Focus on (that all you to zoom on a node of the network)
* 3.5 : Adding Legend (only for fontawesome icon)
* 3.4 : Working with the LayoutMap
* 3.3 : Adding Complementary Item
* 3.2 : Can be display in a tab for objectPage and Indexpage (this change the evolveNode Structure, please update your evolve designer configuration)
* 3.1 : Correct double item, adding shape option, correct edge color
* 3.0 : RightClick, Highlight by External, merging (with bigger size) arrow if several associations
* 2.0 : Adding group, icon, Impact, globalFilter, arrow
* 1.0 : 1st version working

## To be Done

* More Options
* Add Translations i18n like Data/Common/i18n


## Description 
Allow you to display objects and their associations in a network. The layout provide the same interaction than diagram, simple click for popOUT and double click to go on the objectPage. This layout can be use on IndexPage of ObjectPage.

In case of several association, the layout will display only one edge between node, if arrow are in different way, it will display both. The size of the edge will depend of the number of association.

## Screen Shot
The layout will scan all of your hierarchy tree, and put it in a network.
You can use filter to choose which item to display

<img src="https://raw.githubusercontent.com/nevakee716/cwNetwork/master/screen/1.jpg" alt="Drawing" style="width: 95%;"/>

## Node setup

### IndexPage

<img src="https://raw.githubusercontent.com/nevakee716/cwNetwork/master/screen/2.jpg" alt="Drawing" style="width: 95%;"/>

### ObjectsPage with Tab

<img src="https://raw.githubusercontent.com/nevakee716/cwNetwork/master/screen/nodeSetup.png" alt="Drawing" style="width: 95%;"/>

## Options

### Hidden Nodes : 

Set the ID of the nodes you don't want to appear in the tree, the children will be display instead. (Can be use for application flux See exemples below)

### popOutList :

List the popOut that you want to be used. (ex:scriptname1,popOutName1#scriptname2,popOutName2)
<img src="https://raw.githubusercontent.com/nevakee716/cwNetwork/master/screen/3.jpg" alt="Drawing" style="width: 95%;"/>

### Specific Group List :

Group are the different filter box of the network, by default object are sort in to different group by ObjectType(name of the group is the name of the objectype).
If you want objects of a node to be in a different group use this option : NodeID,GroupName#NodeID2,GroupName2#(ex:processus_niveau_3_20004_410243396,Processus Electronique#processus_niveau_3_20004_2025026472,Processus Informatique)

PS : If an object is present twice in the JSON object, one time in a group and one time in another group, it will only appear in the first group

### Group To Select On Start

List the groups you want to display when the network is started. Use comma separator

### Assign Icon or Shape to Group :

You can assign a shape (ellipse, circle, database, box, diamond, dot, star, triangle, triangleDown, square
) to a group.
Use NameGroup,shape,color,borderColor(optionnal)||NameGroup2,shape2,color2,borderColor2(optionnal)

You can also assign a FontAwesome Icon to a group.(go to this website to find the code http://fontawesome.io/icons/) Use NameGroup,icon,FontAwesomeUnicode,color||NameGroup2,icon,FontAwesomeUnicode2,color2. 

You can mix Icon and shape like that : 
Flux,icon,f0ec,#FF8C00||Application,icon,f10a,#4F90C1||Entité,box,#FF8C00,#4F90C1

<img src="https://raw.githubusercontent.com/nevakee716/cwNetwork/master/screen/4.png" alt="Drawing" style="width: 95%;"/>

### Arrow Direction :

This option allows you to set arrows between nodes. The syntax is the following:  
node_id,'direction'  
You can use symbol # as a separator to set a list of directions.  
The direction can be 'to' or 'from'.  
For exemple, processus_niveau_2_20006_883051288,'to'#processus_niveau_2_20005_1079817132,'from'  
Use to, if you want the arrow that arrive to this node.
Use from, if you want the arrow to leave from this node.

<img src="https://raw.githubusercontent.com/nevakee716/cwNetwork/master/screen/5.png" alt="Drawing" style="width: 95%;"/>

### Filter Node :

Select Evolve Nodes that will be use to filter your nodes. 
nodeID:Label of the filter
For exemple : entite_20022_1066555881:Entity Filter
(Can be use for application flux See exemples below)

PS : the filter node should always be in first

### Complementary Node :

<img src="https://raw.githubusercontent.com/nevakee716/cwNetwork/master/screen/ComplementaryNode.png" alt="Drawing" style="width: 95%;"/>

If you want to add a side Node, use this option
For exemple, if you are on the objectPage of an application, you want to display sent and received flux.
Put the network under the associationNode of the sent flux, then add the node id of the received flux in this option. Use comma as a splitter

## Focus On

<img src="https://raw.githubusercontent.com/nevakee716/cwNetwork/master/screen/focusOn.png" alt="Drawing" style="width: 95%;"/>

This menu allow you to zoom on a object prevent on the network, it will go to his position, zoom on it, and select it.

## Button Action

Disable / Enable Physics : Allow to disable the physics and freely move the node

Zip/ UnZip Edges: Allow to unmerge the edges, in case of hidden nodes, this will disable the name od the hidden object on the edge.

## RightClick Action

You can rightClick on a node to display : 
<img src="https://raw.githubusercontent.com/nevakee716/cwNetwork/master/screen/6.png" alt="Drawing" style="width: 95%;"/>

### Add Closes Nodes
This will add on the network, the node that are connected to the selected node 

### Add All Nodes From
This will add on the network, the node that have a path (even indirect) that leave from the selected Node

### Add All Nodes To
This will add on the network, the node that have a path (even indirect) that go in the selected Node

## Application Map

Here we have the following metamodel : 

Application connected to flux connected to Application
and flux connected to Entity
On the network, we want to display the Application and display the flux as arrow (depending if the flux is emit or receive)

For that, we use the following configuration : 
<img src="https://raw.githubusercontent.com/nevakee716/cwNetwork/master/screen/7.png" alt="Drawing" style="width: 95%;"/>

ApplicationHidden correspond to the icon and the colour that the unhighlighted node will take.

<img src="https://raw.githubusercontent.com/nevakee716/cwNetwork/master/screen/8.png" alt="Drawing" style="width: 95%;"/>
 
You can now go in the Entity Filter and highlight only the node that are connected to a flux that use the selected entity.

PS : if you selected an entity, and all the node connected to the entity are not on the network yet, the entity will add them


## Organisation Map

<img src="https://raw.githubusercontent.com/nevakee716/cwNetwork/master/screen/9.png" alt="Drawing" style="width: 95%;"/>







