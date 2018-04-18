# How to Use Casewise Packet Manager

Cpm allows you to create, publish and install custom layouts
this documents can be found in pdf form at https://gitprint.com/wiki/casewise/cpm/Home.md

# Warning

Before starting, please remove from your evolve layout that are present in the marketplace. Then reinstall properly via offline or online install.

All the command should be run as administrator

# Install Custom Layout (Online)

## Install CWPM

* Install [node.js](https://nodejs.org/en/), use LTS version
* open command console
* type : npm install -g cwpm  

if you have some problem, try to disable your anti-virus


## Update CWPM 

New features of cwpm are added everyweek, and you want to be update, it's strongly advised to run this command everyweek.
* open command console
* type : npm update -g 

## Install Layout

the list of existing custom layouts with evolve version can be found here 
https://github.com/casewise/evolve-layouts/blob/master/README.md
Follow the following steps to add a custom layout to evolve

* via windows command go in C:\Casewise\Evolve\Site\bin or the corresponding installation folder of Evolve by typing cd C:\Casewise\Evolve\Site\bin
* if it's the 1st time you use cpm install
  * Remove the file C:\Casewise\Evolve\Site\bin\evolve.json
  * type cpm --install
  * then change the version of evolve in C:\Casewise\Evolve\Site\bin\evolve.json to match your evolve
* Type : cpm --install Layout_Name (this will install the layout into Marketplace/libs)
* Type : cpm --install (this will update your existing layouts and list the layouts availables)
* if there is a problem delete evolve.json 

The C:\Casewise\Evolve\Site\bin\evolve.json containes now all of your layout, if you migrates, you can copy the this file, then execute cpm --install on your new plateform, and it will install all of your layout

# Install Custom Layout (Offline Installation)

## Downloading zip package

* Go https://github.com/casewise/evolve-layouts/tree/master/dist
* Select the zip file of the layout you want to install
* for exemple Network-v0.4.0-evolve-v4.0.zip

## Installation offline

* unzip the zip file
* Put the contenant of Evolve in Casewise\Evolve
* Put the contenant of src in Casewise\Evolve\Site\bin\webDesigner\custom\Marketplace\libs\LAYOUT_or_Specific_NAME\src
* Put the contenant of external in Casewise\Evolve\Site\bin\webDesigner\js\external
* Put the contenant of modules in Casewise\Evolve\Site\bin\webDesigner\libs\modules
* Put the contenant of fonts in Casewise\Evolve\Site\bin\webDesigner\fonts
* Put the contenant of angularHTMLayout in Casewise\Evolve\Data\Common\html\
* Put the contenant of theme in Casewise\Evolve\Site\bin\webDesigner\themes

# Create a Custom Layout 

* look at the networkLayout as exemple structure
* if you need to load external libraries like D3js, look at networkLayout as exemple

# Publish a custom layout 

Required:
* clone this repository in the folder of your choice

In your custom layout folder:

* Fill in package.json mandatory fields : name, version, evolve-version
* It's strongly advised to fields non-mandatory fields : wiki,repository and description
* cpm --package (level of modification patch|minor|major)
* cpm --register (path of evolve-layouts repository)
* commit and push the modifications in evolve-layouts repository


# Contact info
For any comment/bug/question, you can send an email to franceconsultingservicesteam@erwin.com