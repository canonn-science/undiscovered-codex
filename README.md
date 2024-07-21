# Codex-Regions
Prototype for displaying codex entries on a region map.

The javascript loads [RegionMap.svg](https://github.com/klightspeed/EliteDangerousRegionMap)  into memory so that it can be manipulated by javascript. 

With the map loaded into memory, it then downloads a csv file of coordinates from the Canonn data dumps using the category and entryid parameters and displays the location of the entries as they are fetched so that the pages is rendered as data is loaded.

Examples:

* [Stratum Tectonicas - Green Regions](https://canonn-science.github.io/Codex-Regions/?entryid=2420703&hud_category=Biology)
* [Tubus Conifer - Turquoise Regions](https://canonn-science.github.io/Codex-Regions/?entryid=2430108&hud_category=Biology)
 

# Credits

[RegionMap.svg](https://github.com/klightspeed/EliteDangerousRegionMap) supplied by CMDR Bravada Cadelanne from his repository [EliteDangerousRegionMap](https://github.com/klightspeed/EliteDangerousRegionMap)
