| **Name** | **cwLayoutNetwork** | **Version** | 
| --- | --- | --- |
| **Updated by** | Mathias PFAUWADEL | 6.0 |


## Patch Notes

* 6.0 : Allow Duplicate item, Changing saving system (not compatible with 5.0 capinetwork)
* 5.1 : Traduction Menu
* 5.0 : Adding Image, Save, Link Type
* 4.1 : Can now select multiple element in externalFilter
* 4.0 : Cluster, Download Image, display association custom display string
* 3.9 : External Association Filter work with zippedEdges
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
* Edition


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

## Options in the evolve Designer


### MultiLines Count : 

Enter the limit number of caracter where you will return line for the label of the node of the network

### Hidden Nodes : 

Set the ID of the nodes you don't want to appear in the tree, the children will be display instead. (Can be use for application flux See exemples below)

### popOutList :

List the popOut that you want to be used. (ex:scriptname1,popOutName1#scriptname2,popOutName2)
<img src="https://raw.githubusercontent.com/nevakee716/cwNetwork/master/screen/3.jpg" alt="Drawing" style="width: 95%;"/>

### Specific Group List :

Group are the different filter box of the network, by default object are sort in to different group by ObjectType(name of the group is the name of the objectype).
If you want objects of a node to be in a different group use this option : NodeID,GroupName#NodeID2,GroupName2#(ex:processus_niveau_3_20004_410243396,Processus Electronique#processus_niveau_3_20004_2025026472,Processus Informatique)

PS : If an object is present twice in the JSON object, one time in a group and one time in another group, it will only appear in the first group. So if you need to have different icon according to category or other, define all your node for them with filter and add a 3rd node after with all the objet without filter. 

Be carefull when using the complementary node, the node will be place in the order of the complementary node and always after the regular node.

### Group To Select On Start

List the groups you want to display when the network is started. Use comma separator

### Assign Icon or Shape to Group :

You can assign a shape (ellipse, circle, database, box, diamond, dot, star, triangle, triangleDown, square
) to a group.
Use NameGroup,shape,color,borderColor(optionnal)||NameGroup2,shape2,color2,borderColor2(optionnal)

You can also assign a FontAwesome Icon to a group.(go to this website to find the code https://fontawesome.com/v4.7.0/) Use NameGroup,icon,FontAwesomeUnicode,color||NameGroup2,icon,FontAwesomeUnicode2,color2.

You can also assign image. (the color is used for the edge color)
Use NameGroup,image,imageURL,color

You can mix Icon and shape like that : 
Flux,icon,f0ec,#FF8C00||Application,icon,f10a,#4F90C1||Entité,box,#FF8C00,#4F90C1

<img src="https://raw.githubusercontent.com/nevakee716/cwNetwork/master/screen/4.png" alt="Drawing" style="width: 95%;"/>

You can assign specific icon and color to item if you don't have group shape, just need to use a property with scriptname icon and color and check it in evolve designer

### Arrow Direction :

This option allows you to set arrows between nodes. The syntax is the following:  
node_id,'direction'  
You can use symbol # as a separator to set a list of directions.  
The direction can be 'to' or 'from'.  
For exemple, processus_niveau_2_20006_883051288,'to'#processus_niveau_2_20005_1079817132,'from'  
Use to, if you want the arrow that arrive to this node.
Use from, if you want the arrow to leave from this node.
If you don't a direction to a node, it will be display without arrow.
<img src="https://raw.githubusercontent.com/nevakee716/cwNetwork/master/screen/5.png" alt="Drawing" style="width: 95%;"/>

### Filter Association:

Select Evolve Nodes that will be use to filter your nodes. 
nodeID:Label of the filter
For exemple : entite_20022_1066555881:Entity Filter
(Can be use for application flux See exemples below)
spliter is #

PS : the filter node should always be in first,

### Filter Association Behaviour

This option will define the way your action(add close node, add connected node..., and also association filter) will work 
add : this will add the selected node to your network
highlight : this will highlight the selected node
absolute : this will only display the selected node

### Complementary Node :

<img src="https://raw.githubusercontent.com/nevakee716/cwNetwork/master/screen/ComplementaryNode.png" alt="Drawing" style="width: 95%;"/>

If you want to add a side Node, use this option
For exemple, if you are on the objectPage of an application, you want to display sent and received flux.
Put the network under the associationNode of the sent flux, then add the node id of the received flux in this option. Use comma as a splitter

### Activate Cluster

Activate the cluster option, that allow you to cluster element according to the group.
PS : the cluster doesn't duplicate the object, and it try to put the element in the bigger cluster. 
To move a cluster click on the first element

### Hide Cluster Menu

Hide the cluster menu, you can still init the cluster

### Cluster To Select On Start

List the cluster you want to apply when the network started. The syntax is Head#Child,Child2.


### Activate UnzipEdge Option

Activate the button to unzip edge

### Hide Zip Edge At Start

Hide the button to zip or unzip edge

### Edge Zip at Start

Zip the edge on start

### Remove Lonely Objects

Activate the option to remove lonely object. When you click on the button, it will delete from the network the node that have no connection.

### Enable Edit

You can load capinetwork  (node position, link selected, cluster, external filter ...)
Contributor only can save or create a capinetwork . 

<img src="https://raw.githubusercontent.com/nevakee716/cwNetwork/master/screen/networkEditionButton.jpg" alt="Drawing" style="width: 95%;"/>

When you create a new network, it will create a new object and associate it with the object of your objectPage.

To use this option you need to have your metamodel ready : 
Create a new objectType : CW API NETWORK with 3 properties : Configuration (memoText), Label (string) and Create On View (string)
Create also an association between CW API NETWORK and Any Objects
Inside C:\Casewise\Evolve\Site\bin\webDesigner\custom\Marketplace\libs\Network\src\cwLayoutNetwork.js
Fill theses variable with the scriptname of your model 

<img src="https://raw.githubusercontent.com/nevakee716/cwNetwork/master/screen/networkScriptname.jpg" alt="Drawing" style="width: 95%;"/>

Inside your evolve configuration 
You need to put the association to capinetwork to the main object if you are on an objectPage 
On an Indexpage, you need to add a new capinetwork node with a filter(createOnCWview = indexpage.nodeIDofTheNetworkLayout)
(don't forget to use complementary node if needed)

<img src="https://raw.githubusercontent.com/nevakee716/cwNetwork/master/screen/networkEvolveConfig.jpg" alt="Drawing" style="width: 95%;"/>


### Load the First Cw Api Network of the list

If you check this option, the network layout will load the first capinetwork of the list


### Edge Color

You can assign a color to an Edge Type following this structure

````
{
	"flux": {
		"label": "Flux Applicatif",
		"color": "#CCCC00"
	},
	"locationhasblackcoreconnectivity": {
		"color": "#000000",
		"label": "Black Connectivity"
	}
}
````

Edge Type is by default the associationTypeScriptname or the objectTypeScriptName(in case of hiddenNode)
To use association in the EdgeType, you need to add the intersection node, and select the uuid.

<img src="https://raw.githubusercontent.com/nevakee716/cwNetwork/master/screen/edgeIntersectionNode.jpg" alt="Drawing" style="width: 95%;"/>



### Edge Type To Select on Start

List the link Type you want to select On Start. Splitter is a comma

### Assign associationNodeId to EdgeType

In the same way, you assign group with Node, you can do that with the EdgeType
For exemple : 
emplacement_20196_1480647536,toto#emplacement_20196_148043224,tata

### Duplicate the nodeIDS

Put the ID of the node that will be duplicate, so when the network parse your json tree, if the object already exist it will create a new node.

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

### Remove Node
This will remove the node

### Remove Close Nodes
This will remove all the node that are directly connected to the object

### Add All Connected Nodes

this will add all node that are connected directly and indirectly to the selected node

## Behaviour Button
By clicking, on the button you can change the behaviour of the external association filter : 
* Absolute : disable all node, then add the node of the external filter
* Addition : Add the node of the external filter
* Highlight : Hightlight the node of the external filter

## Download Button
You can click on the download button <i class="fa fa-download" aria-hidden="true"></i>, to download a png of the network
(on huge network, it work only with edge)


## Exemple : Application Map

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


## Exemple : Organisation Map

<img src="https://raw.githubusercontent.com/nevakee716/cwNetwork/master/screen/9.png" alt="Drawing" style="width: 95%;"/>

## Exemple : Using Custom Display String to display RACI on the network

<img src="https://raw.githubusercontent.com/nevakee716/cwNetwork/master/screen/ex3Screen.png" alt="Drawing" style="width: 95%;"/>
<img src="https://raw.githubusercontent.com/nevakee716/cwNetwork/master/screen/ex3Config1.png" alt="Drawing" style="width: 95%;"/>
<img src="https://raw.githubusercontent.com/nevakee716/cwNetwork/master/screen/ex3Config2.png" alt="Drawing" style="width: 95%;"/>

don't forget to enable this unzip edge, cause label of the edge will be only visible if edge are unzip







