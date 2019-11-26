//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================

/**
 * This plugin is intended to use for grids which has measure as store.
 * Expand capability will be added to row which has dataIndex and expandValue matches
 */
Ext.define('Ext.grid.plugin.RowExpand', {
    extend: 'Ext.plugin.Abstract',
     
    alias: 'plugin.jdarowexpand',
    expandIconClass: 'x-tool-img',
    config: {
        
        columnInd:null,
        dataIndex:null,
        expandValue:null
       
    },
    init: function (grid) {
    	//Enable the plug-in feature only if at least one record is present satisfying the matching condition
    	var pivotController = JdaPivotApp.getApplication().getPivotController();
		var pivotObj = pivotController.getPivotWrapper().getPivot();
		this.grid = grid;
		if(pivotObj.hasExpandableMeasure()){
			grid.columns[this.config.columnInd].renderer = this.renderer;
			grid.columns[this.config.columnInd].scope = this;
		}
    },
 
    destroy: function() {
       
        this.callParent();
    },
    
 
    renderer : function(value,cell, record, dataIndex, column){
    	if(record.get(this.config.dataIndex) == this.config.expandValue){
    		
    		if(record.data.expanded){
    			var pos = -255;
    		} else{
    			pos = -240;
    		}
    		value =  '<div class="'+this.expandIconClass+' x-tool-tool-el" '+
    		'style="background-position: 0 '+pos+'px;display:inline-block;position:relative;top:3px;cursor: pointer;">'+
    		'</div><div style="display:inline-block; padding: 0 0 0 5px">'+value+'</div>';
    	}else{
    		value =  '<span style="padding: 0 0 0 '+(record.data.subMeasure ? '30px' : '20px')+'">'+value+'</span>';
    	}
    	return value;
    },
    
   
});