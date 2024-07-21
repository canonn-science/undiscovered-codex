# Undiscovered Codex   

This allows users to display codex entries that they have not yet scanned on a region map.

unless you are completing a region at a time, this is not terribly useful because you'll find that nearly all regions have something in them. 

Left click on a system to see its name.
Right click to see the stats for the codex entry

The javascript loads [RegionMap.svg](https://github.com/klightspeed/EliteDangerousRegionMap)  into memory so that it can be manipulated by javascript. 

With the map loaded into memory, it then downloads a csv file of coordinates from the Canonn data dumps using the category and entryid parameters and displays the location of the entries as they are fetched so that the pages is rendered as data is loaded.

Examples:

* [LCU No Fool Like Ine](https://canonn-science.github.io/undiscovered-codex/?cmdr=LCU%20No%20Fool%20Like%20One)
 

# Credits

[RegionMap.svg](https://github.com/klightspeed/EliteDangerousRegionMap) supplied by CMDR Bravada Cadelanne from his repository [EliteDangerousRegionMap](https://github.com/klightspeed/EliteDangerousRegionMap)
