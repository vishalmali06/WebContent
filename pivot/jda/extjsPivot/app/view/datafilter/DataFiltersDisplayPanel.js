//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.view.datafilter.DataFiltersDisplayPanel',{
	extend : 'Ext.panel.Panel',
	alias : 'widget.datafiltersdisplaypanel',
	itemId: 'datafiltersdisplaypanel',
	layout : {
		type: 'vbox',
		align: 'fit',
	},
	config : {
		pivotObj:null,
		flyoutIsOpen:false,
		userAccessPermissions:null,
		viewFilterPermissions:null,
		imgPath : null,
	},
	cls: 'j-pvt-datafilter-wrapper',
	bodyCls : 'j-pvt-datafilter-panel-body',
	initComponent : function() {
		var me = this;
		me.pivotObj = JdaPivotApp.getApplication().getPivotController().getPivotWrapper().getPivot();
		//adding plug ins 
		var dataFilterConfig = me.pivotObj && me.pivotObj.getDataFilterConfig();
		var filterSelectAllOption = dataFilterConfig && dataFilterConfig.options && dataFilterConfig.options.filterSelectAllOption;
		var formatCellSelectAllOption = dataFilterConfig && dataFilterConfig.options && dataFilterConfig.options.formatCellSelectAllOption;
		var filterSelectAllPulgin = {};
		var formatCellSelectAllPulgin = {};
		if(filterSelectAllOption){
			filterSelectAllPulgin = {
             	ptype: 'selectallcheckcolumnheader',
				checked: false, // initial state of the checkbox,
             }
		}
		
		if(formatCellSelectAllOption){
			formatCellSelectAllPulgin = {
             	ptype: 'selectallcheckcolumnheader',
				checked: false, // initial state of the checkbox,
             }
		}
		me.items = [{
			xtype: 'gridpanel',
            store: 'dataFiltersStore',
            itemId: 'dataFiltersGrid',
            autoScroll: true,
            selModel: Ext.create('Ext.selection.CheckboxModel', {
            	listeners: {
            		beforeselect: function(selectionModel, record) {
            			var userAccessPermissions = me.config.userAccessPermissions;
            			var viewFilterPermissions = me.config.viewFilterPermissions;
            			var hasAccess = (record.data.type == _pns.Constants.dataFilterTypes.Private ) ? true : 
            							(record.data.type == _pns.Constants.dataFilterTypes.Public && userAccessPermissions ? userAccessPermissions.canDelete : 
            							record.data.type == _pns.Constants.dataFilterTypes.ViewFilter && viewFilterPermissions ? viewFilterPermissions.canDelete : false);
            							
                		return hasAccess;
                	},
                	select : me.enableOrDisableDeleteButton,
                	deselect : me.enableOrDisableDeleteButton,
            	},
        		renderer: function (value, metaData, record, rowIndex, colIndex, store, view) {
        			metaData.style = 'cursor: pointer';
        			var result = this.defaultRenderer(value);
        			var disableFilterActionsFlg = this.up('#datafiltersdisplaypanel').disableFilterActionsFlg;
        			
        			if(disableFilterActionsFlg || record.data.type == _pns.Constants.dataFilterTypes.Public && me.config.userAccessPermissions && !me.config.userAccessPermissions.canDelete){
        				metaData.innerCls += ' ' + this.disabledCls;
                		record.disabled = true;
        			}else if(record.data.type == _pns.Constants.dataFilterTypes.ViewFilter && !(me.config.viewFilterPermissions && me.config.viewFilterPermissions.canDelete)){
        				metaData.innerCls += ' ' + this.disabledCls;
                		record.disabled = true;
        			}
        			return result;
        		}  
            }),
            width:'100%',
            height:'100%',
            layout : 'fit',
            cls : 'j-pvt-datafilter-grid',
			bodyCls : 'j-pvt-datafilter-grid-body',
			columns : {
				defaults : {
					menuDisabled : true,
					sortable : false
				},
				items : [
	            {
	            	header:'Name',
	                itemId :'headerName',
	                dataIndex: 'name',
	                flex: 0.2,
	                renderer : function(value, metaData, record, rowIndex, colIndex, store, view) {
	                	metaData.style = 'cursor: pointer';
	                	value = (record.data.type == _pns.Constants.dataFilterTypes.Private)? value : (record.data.type == _pns.Constants.dataFilterTypes.ViewFilter) ? 
	                															(value + " (" + me.pivotObj.getLocaleString("DataFilter.Config.Type.V") + ")") : (value + " (" + me.pivotObj.getLocaleString("DataFilter.Config.Type.P") + ")");
	                	if(record.data.description){
	                		value += '&nbsp;&nbsp;<img src='+me.imgPath+'information_normal_14.png data-qtip="'+record.data.description+'">';
	                	}
	                	var disableFilterActionsFlg = this.up('#datafiltersdisplaypanel').disableFilterActionsFlg;
	                	if(disableFilterActionsFlg){
	                		metaData.tdCls += ' ' + this.disabledCls;
	                	}
	                	return value;
					},
	            },
	            {
	            	header:'Rule definition',
	            	itemId :'headerRuleDefinition',
	                dataIndex: 'expression',
	                flex: 0.3,
	                renderer: function(value){
	                    return Ext.String.htmlEncode(value);
	                }
	            },
	            {
	            	xtype:'checkcolumn',
	            	header: (me.pivotObj && me.pivotObj.getLocaleString('DataFilter.header.Filter') ) || "Filters",
	                itemId :'headerFilter',
	                align: 'center',
	                dataIndex: 'activate',
	                flex: 0.1,
	                //plugins: filterSelectAllPulgin,
	                renderer: function (value, metaData, record, rowIndex, colIndex, store, view) {
	                	metaData.style = 'cursor: pointer';
	                	
	                	var cssPrefix = Ext.baseCSSPrefix,
	                    cls = cssPrefix + 'grid-checkcolumn';
	                	var disableFilterActionsFlg = this.up('#datafiltersdisplaypanel').disableFilterActionsFlg;
	                	
	                	if (disableFilterActionsFlg || (record.data.type == _pns.Constants.dataFilterTypes.Public) && !(me.config.userAccessPermissions.canExecute) ||
	                		((record.data.type == _pns.Constants.dataFilterTypes.ViewFilter) && !(me.config.viewFilterPermissions && me.config.viewFilterPermissions.canExecute))) {
	                		metaData.tdCls += ' ' + this.disabledCls;
	                		record.disabledFilters = true;
	                    }
	                    if (value) {
	                        cls += ' ' + cssPrefix + 'grid-checkcolumn-checked';
	                    }
	                    return (new Ext.grid.column.CheckColumn).renderer(value);
	                },
	                listeners: {
	                	beforecheckchange: function (the, rowIndex, checked, eOpts) {
	                		var record = the.up('grid').getStore().getAt(rowIndex);
	                		return ((record.data.type == _pns.Constants.dataFilterTypes.Private) || 
	                				 (record.data.type == _pns.Constants.dataFilterTypes.Public && me.config.userAccessPermissions.canExecute) ||
	                				 (record.data.type == _pns.Constants.dataFilterTypes.ViewFilter && me.config.viewFilterPermissions && me.config.viewFilterPermissions.canExecute));
	                	}
	              }
	            },
	            {
	            	xtype:'checkcolumn',
	            	header: (me.pivotObj && me.pivotObj.getLocaleString('DataFilter.header.FormatCell') )|| "Format Cell",
	                itemId :'headerFormatCell',
	                align: 'center',
	                dataIndex: 'formatCellActivate',
	                flex: 0.1,
	                dataFilterController : JdaPivotApp.getApplication().getDataFilterController(),
	                plugins: formatCellSelectAllPulgin,
	                renderer: function (value, metaData, record, rowIndex, colIndex, store, view) {
	                	metaData.style = 'cursor: pointer';
	                	var cssPrefix = Ext.baseCSSPrefix,
	                    cls = cssPrefix + 'grid-checkcolumn';
	                	var disableFilterActionsFlg = this.up('#datafiltersdisplaypanel').disableFilterActionsFlg;
	                	
	                	if (disableFilterActionsFlg || !record.data.formatCell || ((record.data.type == _pns.Constants.dataFilterTypes.Public) && !(me.config.userAccessPermissions.canExecute))) {
	                		metaData.tdCls += ' ' + this.disabledCls;
	                		record.disabledFormatCell= true;
	                    }
	                    if (value) {
	                        cls += ' ' + cssPrefix + 'grid-checkcolumn-checked';
	                    }
	                    return (new Ext.grid.column.CheckColumn).renderer(value);
	                }
	            },
	            {
	                header: 'Format', 
	                align: 'center',
	                itemId :'headerFormat',
	                flex: 0.1,
	                renderer: function (value, metaData, record, rowIndex, colIndex, store, view) {
	                	if (record.data.formatCell) {
	                		var formatCell = record.data.formatCell;
	                		metaData.style += " background:"+formatCell.cellBgColor+"; color:"+formatCell.cellFontColor+";";
		                    return "1234";	
	                    }else{
	                    	return "";
	                    }
	                }
	            },
	            {
	            	xtype:'checkcolumn',
	                header: 'Format Ancestors', 
	                itemId :'headerFormatAncestors',
	                align: 'center',
	                flex: 0.1,
	                renderer: function (value, metaData, record, rowIndex, colIndex, store, view) {
	                	
	                	value = record.data.formatCell && record.data.formatCell.formatAncestors;
	                	
	                	var cssPrefix = Ext.baseCSSPrefix,
	                    cls = cssPrefix + 'grid-checkcolumn';
	                	 
	                	if (!(record.data.formatCell)) {
	                		metaData.tdCls += ' ' + this.disabledCls;
	                    }
	                    if (value) {
	                        cls += ' ' + cssPrefix + 'grid-checkcolumn-checked';
	                    }
	                    return (new Ext.grid.column.CheckColumn).renderer(value);
	                }
	            },
	            {
	            	xtype:'checkcolumn',
	                header: 'Format Descendants',
	                itemId :'headerFormatDescendants',
	                align: 'center',
	                flex: 0.1,
	                renderer: function (value, metaData, record, rowIndex, colIndex, store, view) {
	                	
	                	value = record.data.formatCell && record.data.formatCell.formatDescendants;
	                	var cssPrefix = Ext.baseCSSPrefix,
	                    cls = cssPrefix + 'grid-checkcolumn';
	                	
	                	if (!(record.data.formatCell)) {
	                		metaData.tdCls += ' ' + this.disabledCls;
	                    }
	                	if (value) {
	                        cls += ' ' + cssPrefix + 'grid-checkcolumn-checked';
	                    }
	                    return (new Ext.grid.column.CheckColumn).renderer(value);
	                }
	            },
	        ]},
	        viewConfig: {
				plugins : {
					ptype : 'gridviewdragdrop',
					dragGroup: 'dataFilterDragGrid',
					dropGroup: 'dataFilterDragGrid',
					//dragText : me.pivotObj.getLocaleString('DataFilter.Tooltip.DragAndDrop')
					dragText : 'Drag and Drop to change rule priority'
				}
			},
		}],
		me.dockedItems= {
            xtype: 'toolbar',
            id : 'dataFilterToolBar',
            padding: '3 10 5 15',
            items : [
	            		{
	 						type   : 'button',
	 						itemId : 'adddatafilterbtn',
	 						ui     : 'j-primary-button',
	 						margin: '0 0 0 5',
	 					},
	 					{
	 						type   : 'button',
	 						itemId : 'deletedatafilterbtn',
	 						ui     : 'j-standard-button',
	 						margin: '0 0 0 8',
	 						disabled: true,
	 					},
	 					{
	 						type   : 'button',
	 						itemId : 'evaluatedatafilterbtn',
	 						ui     : 'j-standard-button',
	 						margin: '0 0 0 8',
	 						disabled: true,
	 					},
 					]
        },
        
        me.on({
			afterrender : function(me) {
				me.setTitle(me.pivotObj.getLocaleString('DataFilter.Title'));
				me.down('#adddatafilterbtn').setText(me.pivotObj.getLocaleString('DataFilter.Button.AddFilter'));
				me.down('#deletedatafilterbtn').setText(me.pivotObj.getLocaleString('DataFilter.Button.Delete'));
				me.down('#evaluatedatafilterbtn').setText(me.pivotObj.getLocaleString('DataFilter.Button.Evaluate'));
				
				//column header name
				me.down('#headerName').setText(me.pivotObj.getLocaleString('DataFilter.header.Name'));
				
				//columns header Rule definition
				me.down('#headerRuleDefinition').setText(me.pivotObj.getLocaleString('DataFilter.header.RuleDefinition'));
				
				//columns header Filter
				//me.down('#headerFilter').setText(" ");
				
				//columns header Format Cell
				var formatCellSelectAllOption = dataFilterConfig && dataFilterConfig.options && dataFilterConfig.options.formatCellSelectAllOption;
				formatCellSelectAllOption && me.down('#headerFormatCell').setText(" ");
				
				//columns header Format
				me.down('#headerFormat').setText(me.pivotObj.getLocaleString('DataFilter.header.Format'));
				
				//columns header Format Ancestors
				me.down('#headerFormatAncestors').setText(me.pivotObj.getLocaleString('DataFilter.header.FormatAncestors'));
				
				//columns header Format Descendants
				me.down('#headerFormatDescendants').setText(me.pivotObj.getLocaleString('DataFilter.header.FormatDescendants'));
				
				if(me.pivotObj && me.pivotObj.getDataFilterConfig() && me.pivotObj.getDataFilterConfig().options && me.pivotObj.getDataFilterConfig().options.imgPath){
					me.imgPath = me.pivotObj.getDataFilterConfig().options.imgPath;
				}
			}
		});
		me.callParent(arguments);
	},
	enableOrDisableDeleteButton : function(selectionModel, record){
		var selectedFilters=selectionModel.getSelected();
		var dataFilterController = JdaPivotApp.getApplication().getDataFilterController();
		var datafiltersdisplaypanel = dataFilterController.getDataFiltersDisplayPanel();
		var deletedatafilterbtn = datafiltersdisplaypanel.down('#deletedatafilterbtn');
    	if((selectedFilters && selectedFilters.length > 0)){
    		deletedatafilterbtn.enable();
		}else{
			deletedatafilterbtn.disable();
		}
	},
});