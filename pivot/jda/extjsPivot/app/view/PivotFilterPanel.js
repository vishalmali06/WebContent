//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
/*
 * File: app/view/PivotFilterPanel.js
 *
 */

Ext.define('JdaPivotApp.view.PivotFilterPanel', {
	extend : 'Ext.panel.Panel',
	requires : [ 'Ext.grid.Panel', 'Ext.data.Store', 'Ext.ux.CheckColumn',
			'JdaPivotApp.model.Filter', 'Ext.toolbar.Spacer' ],
	alias : 'widget.pivotfilter',
	config : {
		allStores : [],
		filterItemEmpty:true
	},
	
	layout : {
		// layout-specific configs goes here
		type : 'accordion',
		align: 'stretch', 
		titleCollapse : true,
		animate : true,
		activeOnTop : false,
		fill : false,
		multi : true
	},
	defaults : {
		overflowY : 'auto'
	},
	//autoScroll : true,
	scrollable : true,
	//cls : 'j-pvt-filter-panel',
	/**
	 * This will be called during component initialization.
	 * 
	 */
	initComponent : function() {
		var me = this;
		//me.addEvents('renderFilterPanel', 'filterBy');
		me.on({
			renderFilterPanel : me.createFilterAccordion,
			filterBy : me.filterBy
		});
		/* me.addDocked(me.getToolBar()); */
		me.callParent(arguments);
	},
	/**
	 * During Resize call 
	 * @param width
	 * @param height
	 * @param oldWidth
	 * @param oldHeight
	 */
	onResize : function(width, height, oldWidth, oldHeight){
		this.callParent(arguments);
		pivotlog('pivotFilterPanel onResize %o',arguments);
	},
	/**
	 * This will be called after component initialized and rendered
	 */
	afterRender : function() {
		this.callParent(arguments);
		this.addDocked(this.getToolBar());
	},
	hasFilterItem:function(){
		
		return this.getFilterItemEmpty() ? false : true;
	},
	/**
	 * Creates new accordion for each filter
	 * 
	 * @param filter -
	 *            gives filter information which has to be added
	 */
	createFilterAccordion : function(filter) {
		var me = this;
		me.removeAll();
		me.allStores = [];
		var params = {};
		var controller = JdaPivotApp.getApplication().getPivotController();
		var pivotObj = controller.getPivotWrapper().getPivot();
		if (filter && filter.length > 0)
			for ( var i = 0; i < filter.length; i++) {
				params[filter[i].id] = filter[i].name;
				// me.add(me.getFilterGrid(filter[i]));
			}
		pivotObj.sendGenericRequest(_pns.getPivotPackagePrefix()
				+ 'protocol.GetFilterDataRequest', params,
				me._call_onGetFilterOptions);
	},
	/***************************************************************************
	 * Filter the all the stores based on the type ahead filter text. This
	 * function will be called on keyup event of type ahead filter
	 * 
	 * @param filterText-
	 *            text to be searched
	 */
	filterBy : function(filterText) {
		// create case-insensitive regular expression
		var regEx = new RegExp(filterText, "i");
		var emptyStrRegEx = /^\s?$/;
		var emptyStr = false;
		// check if empty string is available then show all the values
		if (filterText.match(emptyStrRegEx)) {
			emptyStr = true;
		}
		// Iterate all the filter stores to filter the options based on type
		// ahead filter
		for ( var i = 0; i < this.allStores.length; i++) {
			var store = this.allStores[i];
			if (emptyStr) {
				// clear filters if user clear the type ahead filter
				// we can identify it by using regEx comparison for empty string
				store.clearFilter();
			} else {
				store.filterBy(function(record, id) {
					return record.get('name').search(regEx) >= 0;
				});
			}
		}
	},
	/**
	 * Call back function called after getting response for getFilterOptions
	 * request
	 * 
	 * @param pivotObj -
	 *            pivot Object
	 * @param response -
	 *            json response
	 * @param request -
	 *            json request
	 */
	_call_onGetFilterOptions : function(pivotObj, response, request) {
		pivotlog("Filter Response %o", response);
		var pivotFilter = JdaPivotApp.getApplication().getPivotController()
				.getPivotFilter();
		var result = response;
		var isEmpty = _.isEmpty(result);
		pivotFilter.setFilterItemEmpty(isEmpty);
		var filter, options;
		for (filter in result) {
			options = result[filter];
			pivotFilter.add(pivotFilter.getFilterGrid(filter, options));
		}
	},
	/**
	 * Create new store for each grid
	 * 
	 * @param filter -
	 *            filter name / id used in store id
	 * @param options -
	 *            data (filter options
	 * @returns store
	 */
	createStore : function(filter, options) {
		var store = Ext.create('Ext.data.Store', {
			model : 'JdaPivotApp.model.Filter',
			storeId : filter,
			data : options

		});
		this.allStores.push(store);
		// insert always select all as first row
		var selectAll = {
			name : 'Select All',
			checked : false,
			type:this.self.ROOT_CHECKBOX,
			id:this.self.ROOT_ID
		};
		store.insert(0, selectAll);
		return store;
	},
	/**
	 * Get checked all records from all the grids
	 */
	getCheckedAllRecords:function(){
		var result=[];
		var filter={};
		var me=this;
		var stores = me.getAllStores();
		for ( var i = 0; i < stores.length; i++) {
			filter={};
			// Find records with checked=true, don't select the select all
			var records = stores[i].queryBy(function(record,id) {
				return id !== me.self.ROOT_ID && record.get('checked') === true ? true : false;
			});
			// Collect id's of those records
			var ids = [];
			records.each(function(record) {
				ids.push(record.get('id'));
			});
			
			if(ids.length>0){
				filter.attributeId=this.allStores[i].storeId;
				filter.values=ids;
				filter.method="exact";
				result.push(filter);
			}
			
		}
		return result;
	},
	getCheckedRecords:function(){
		
	},
	/**
	 * select/ unselect all check box when user has clicked on select all
	 * 
	 * @param store -
	 *            store information
	 * @param checked -
	 *            checked status
	 */
	selectAll : function(store, checked) {
		var allRecords = store.snapshot || store.data;
		allRecords.each(function(record) {
			record.set('checked', checked);
			//TODO:on editing 
			// change commit to  record.beginEdit(),  record.set() , record.endEdit()
			record.commit();
			
			
		});
	},
	onChange : function(store, column, recordIndex, checked) {

	},
	/**
	 * Return grid structure to be added to accordion for provided filter
	 * options
	 * 
	 * @param filter
	 *            filter name or id
	 * @param options
	 *            filter options
	 * @returns grid - javascript object
	 */
	getFilterGrid : function(filter, options) {
		var me = this;

		var grid = {
			title : "Filter by " + filter,
			items : [ {
				overflowY : 'auto',
				//layout : 'vbox',
				layout : 'fit',
				type: 'vbox',
				maxHeight : 200,
				xtype : 'grid',
				store : me.createStore(filter, options),
				hideHeaders : true,
				columns : [ {
					flex : 0.1,
					xtype : 'checkcolumn',
					text : 'Filter',
					dataIndex : 'checked',
					listeners : {
						checkchange : function(column, recordIndex, checked) {
							// if select all is checked then call goes to select
							// all function
							// to check/ uncheck all records
							var store = this.up('grid').getStore();
							if (recordIndex == 0) {
								me.selectAll(store, checked);
							} else if (checked === false) {
								store.getAt(0).set('checked', false);
							}
						}
					}
				}, {
					flex : 0.9,
					text : 'Name',
					dataIndex : 'name'

				}, ],
			} ]
		};

		return grid;
	},
	/**
	 * Create new docked toolbar
	 * 
	 * @param pivotObj
	 * @returns ext toolbar
	 */
	getToolBar : function(pivotObj) {
		return Ext.widget('toolbar', {
			dock : 'bottom',
			cls : 'j-pvt-styling-header',
			items : [ {
				xtype : 'tbspacer',
				flex : 0.06
			}, {
				type : 'button',
				text : 'Apply',
				itemId : 'filterSubmitbtn',
				ui : 'j-primary-button',
				cls : 'j-pvt-styling-button j-pvt-primary-button',
			}, {
				type : 'button',
				text : 'Cancel',
				itemId : 'filterCancelbtn',
				ui : 'j-standard-button',
				cls : 'j-pvt-styling-button j-pvt-button',
			}, {
				xtype : 'tbspacer',
				flex : 0.94
			}, ]
		});
	},
	statics : {
		ROOT_CHECKBOX:'root',
		ROOT_ID:'pvt-filter-select-all'
	}

});