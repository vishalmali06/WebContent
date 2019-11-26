//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.view.measurefilter.MeasureFiltersDisplayPanel',{
	extend : 'Ext.panel.Panel',
	alias : 'widget.measurefiltersdisplaypanel',
	itemId: 'measurefiltersdisplaypanel',
	layout : {
		type: 'vbox',
		align: 'fit',
	},
	config : {
		pivotObj:null,
		flyoutIsOpen:false,
		userAccessPermissions:null,
		imgPath : null,
	},
	cls: 'j-pvt-measurefilter-wrapper',
	bodyCls : 'j-pvt-measurefilter-panel-body',
	initComponent : function() {
		var me = this;
		me.pivotObj= JdaPivotApp.getApplication().getPivotController().getPivotWrapper().getPivot();
		me.items = [{
			xtype: 'gridpanel',
            store: 'measureFiltersStore',
            itemId: 'measureFiltersGrid',
            autoScroll: true,
            selModel: Ext.create('Ext.selection.CheckboxModel', {
            	listeners: {
            		beforeselect: function(selectionModel, record) {
            			var userAccessPermissions = me.config.userAccessPermissions;
            			var hasAccess = (record.data.type == _pns.Constants.measureFilterTypes.Private ) ? true : 
            							(record.data.type == _pns.Constants.measureFilterTypes.Public && userAccessPermissions ? userAccessPermissions.canDelete :false);
            							
                		return hasAccess;
                	},
                	select : me.enableOrDisableDeleteButton,
                	deselect : me.enableOrDisableDeleteButton,
            	},
            	renderer: function (value, metaData, record, rowIndex, colIndex, store, view) {
        			metaData.style = 'cursor: pointer';
        			var result = this.defaultRenderer(value);
        			if(record.data.type == _pns.Constants.measureFilterTypes.Public && me.config.userAccessPermissions && !me.config.userAccessPermissions.canDelete){
        				metaData.innerCls += ' ' + this.disabledCls;
                		record.disabled = true;
        			}
        			return result;
            	}
            }),
            width:'100%',
            height:'100%',
            layout : 'fit',
            cls : 'j-pvt-measurefilter-grid',
			bodyCls : 'j-pvt-measurefilter-grid-body',
			columns : {
				defaults : {
					menuDisabled : true,
					sortable : false
				},
				items : [
	            {
	            	header:"Name",
	                itemId :'headerName',
	                dataIndex: 'name',
	                flex: 0.2,
	                renderer : function(value, metaData, record, rowIndex, colIndex, store, view) {
	    		      	metaData.style = 'cursor: pointer';
	    		      	value = (record.data.type == _pns.Constants.measureFilterTypes.Private)? value : (value + " (" + me.pivotObj.getLocaleString("MeasureFilter.Config.Type.P") + ")");
	    		      	if(record.data.description){
	    		      		value += '&nbsp;&nbsp;<img src='+me.imgPath+'information_normal_14.png data-qtip="'+record.data.description+'">';
	    		      	}
	    		      	return value;
	    			},
	            },
	            {
	            	header:'Split Measure',
	                itemId :'headerSplitMeasure',
	                dataIndex: 'splitMeasureId',
	                flex: 0.2,
	            },
	            {
	            	xtype:'checkcolumn',
	                header: 'Filter', 
	                itemId :'headerApply',
	                align: 'center',
	                dataIndex: 'activate',
	                flex: 0.1,
	                renderer: function (value, metaData, record, rowIndex, colIndex, store, view) {
	                	metaData.style = 'cursor: pointer';
	                	
	                	var cssPrefix = Ext.baseCSSPrefix,
	                    cls = cssPrefix + 'grid-checkcolumn';
	                	 
	                	if ((record.data.type == _pns.Constants.measureFilterTypes.Public) && !(me.config.userAccessPermissions.canExecute)) {
	                		metaData.tdCls += ' ' + this.disabledCls;
	                    }
	                    if (value) {
	                        cls += ' ' + cssPrefix + 'grid-checkcolumn-checked';
	                    }
	                    return (new Ext.grid.column.CheckColumn).renderer(value);
	                },
	                listeners: {
	                	beforecheckchange: function (the, rowIndex, checked, eOpts) {
	                		var record = the.up('grid').getStore().getAt(rowIndex);
	                		return ((record.data.type == _pns.Constants.measureFilterTypes.Private) || 
	                				 (record.data.type == _pns.Constants.measureFilterTypes.Public && me.config.userAccessPermissions.canExecute));
	                	}
	              }
	            },
	        ]},
			
		}],
		me.dockedItems= {
            xtype: 'toolbar',
            id : 'measureFilterToolBar',
            padding: '3 10 5 15',
            items : [
	            		{
	 						type   : 'button',
	 						itemId : 'addmeasurefilterbtn',
	 						ui     : 'j-primary-button',
	 						margin: '0 0 0 5',
	 					},
	 					{
	 						type   : 'button',
	 						itemId : 'deletemeasurefilterbtn',
	 						ui     : 'j-standard-button',
	 						margin: '0 0 0 8',
	 						disabled: true,
	 					},
 					]
        },
        me.on({
			afterrender : function(me) {
				me.down('#addmeasurefilterbtn').setText(me.pivotObj.getLocaleString('MeasureFilter.Button.AddFilter'));
				me.down('#deletemeasurefilterbtn').setText(me.pivotObj.getLocaleString('Button.Delete'));
				
				//column header name
				me.down('#headerName').setText(me.pivotObj.getLocaleString('MeasureFilter.Header.Name'));
				
				//columns header Rule definition
				me.down('#headerSplitMeasure').setText(me.pivotObj.getLocaleString('MeasureFilter.Header.SplitMeasure'));
				
				//columns header Filter
				me.down('#headerApply').setText(me.pivotObj.getLocaleString('MeasureFilter.Header.Apply'));
								
				if(me.pivotObj && me.pivotObj.getMeasureFilterConfig() && me.pivotObj.getMeasureFilterConfig().options && me.pivotObj.getMeasureFilterConfig().options.imgPath){
					me.imgPath = me.pivotObj.getMeasureFilterConfig().options.imgPath;
				}
			}
		});
		me.callParent(arguments);
	},
	enableOrDisableDeleteButton : function(selectionModel, record){
		var selectedFilters=selectionModel.getSelected();
		var measureFilterController = JdaPivotApp.getApplication().getMeasureFilterController();
		var measurefiltersdisplaypanel = measureFilterController.getMeasureFiltersDisplayPanel();
		var deletemeasurefilterbtn = measurefiltersdisplaypanel.down('#deletemeasurefilterbtn');
    	if((selectedFilters && selectedFilters.length > 0)){
    		deletemeasurefilterbtn.enable();
		}else{
			deletemeasurefilterbtn.disable();
		}
	},
});