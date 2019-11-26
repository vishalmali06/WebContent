//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('Jda.ux.layout.FiltersWrapper', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.filterswrapper',
    requires : ['JdaPivotApp.view.datafilter.DataFiltersDisplayPanel','JdaPivotApp.view.measurefilter.MeasureFiltersDisplayPanel','Jda.ux.plugin.SelectAllCheckColumnHeader'],
    enableTabScroll: true,
    deferredRender:false,
    border: false,
    config :{
    	pivotConfig : null,
    },
    initComponent : function() {
    	var me = this;
    	me.on({
			initFilters:me.initFilters,
		});
    	me.callParent(arguments);
    },
    initFilters : function() {
		var me = this;
		var tabItems = [];
    	if(me.getPivotConfig().enabledDataFilter){
    		tabItems.push({
                xtype:'datafiltersdisplaypanel',
                itemId : 'datafiltersdisplaypanel',
                title: "Data Filters",
                border: false,
            });
    	}
    	if(me.getPivotConfig().enabledMeasureFilter){
    		tabItems.push({
			 	xtype:'measurefiltersdisplaypanel',
	            itemId : 'measurefiltersdisplaypanel',
	            title: "Measure Filters",
	            border: false,
            });
    	}
    	me.add(tabItems);
	},
});