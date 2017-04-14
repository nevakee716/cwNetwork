| **Name** | **cwLayoutNetworkt** | **Version** | 
| --- | --- | --- |
| **Updated by** | Mathias PFAUWADEL | 2.0 |


## Patch Notes

* 2.0 : Adding group, icon, Impact, globalFilter, arrow
* 1.0 : 1st version working

## TBD

* SearchText Box
* More Options
* Custom Display String Support


## Description 
Allow you to display objects and their associations in a network. The layout provide the same interaction than diagram, simple click for popOUT and double click to go on the objectPage. This layout can be use on IndexPage of ObjectPage.

## Screen Shot
The layout will scan all of your hierarchy tree, and put it in a network.
You can use filter to choose which item to display

<img src="https://raw.githubusercontent.com/nevakee716/cwNetwork/master/screen/1.jpg" alt="Drawing" style="width: 95%;"/>

## Node setup

### On indexPage

<img src="https://raw.githubusercontent.com/nevakee716/cwNetwork/master/screen/2.jpg" alt="Drawing" style="width: 95%;"/>

### On ObjectPage With the Object of the object Page on the network

<img src="https://raw.githubusercontent.com/nevakee716/cwNetwork/master/screen/2.png" alt="Drawing" style="width: 95%;"/>
The network layout should be use alone in a view.

## Options

### Hidden Nodes : 

Set the ID of the nodes you don't want to appear in the tree, the children will be display instead. (Can be use for application flux See exemples below)

### popOutList :

List the popOut that you want to be used. (ex:scriptname1,popOutName1#scriptname2,popOutName2)
<img src="https://raw.githubusercontent.com/nevakee716/cwNetwork/master/screen/3.jpg" alt="Drawing" style="width: 95%;"/>

### Specific Group List :

Group are the different filter box of the network, by default object are sort in to different group by scriptname (name of the group is the name of the objectype).
If you want objects of a node to be in a different group use this option : NodeID,GroupName#NodeID2,GroupName2#(ex:processus_niveau_3_20004_410243396,Processus Electronique#processus_niveau_3_20004_2025026472,Processus Informatique)

PS : If an object is present twice in the JSON object, one time in a group and one time in another group, it will be display twice in the network.

### Assign Icon to Group :

You can assign a FontAwesome Icon to a group. Use NameGroup,FontAwesomeUnicode,color||NameGroup2,FontAwesomeUnicode2,color2. For exemple, Organisation,f1ad,#f0a30a
<img src="https://raw.githubusercontent.com/nevakee716/cwNetwork/master/screen/4.png" alt="Drawing" style="width: 95%;"/>

### Arrow Direction :

Select the direction of each node. For exemple, processus_niveau_2_20006_883051288,'to'#processus_niveau_2_20005_1079817132,'from'
Use to, if you want the arrow that arrive to this node.
Use from, if you want the arrow to leave from this node.

<img src="https://raw.githubusercontent.com/nevakee716/cwNetwork/master/screen/5.png" alt="Drawing" style="width: 95%;"/>


## Live Options

### Selection

When you first go on the network Page, the network is empty, you need to choose in the different filter the nodes you want to display

### Impact Options

In the filter Option, you can choose the impact of the node display. By default, the impact is 0 and there is no direction selected. Which mean when you add a node, it will only add this node. If you choose Impact Minimum and direction from, when you add one node, it will also display the direct connected node where the direction of the arrow is from.
You can choose both direction, if you want to display all the node.

If you choose maximum range, it will display all the nodes that are connected (in the selected direction)

<img src="https://raw.githubusercontent.com/nevakee716/cwNetwork/master/screen/6.png" alt="Drawing" style="width: 95%;"/>

If a link has no specifed direction, it will be considerer by the Impact Manager as the direction of the JSON Object




















