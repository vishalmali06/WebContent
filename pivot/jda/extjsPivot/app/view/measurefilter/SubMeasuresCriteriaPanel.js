//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.view.measurefilter.SubMeasuresCriteriaPanel', {
	extend : 'Ext.panel.Panel',
	alias  : 'widget.submeasurescriteriapanel',
	itemId : 'submeasurescriteriapanel',
	layout: {
		type: 'vbox',
	    align: 'stretch',
	},
	config : {
		filterConfig : null,
	},
	initComponent : function() {
		var me = this;
		var pivotObj = JdaPivotApp.getApplication().getPivotController().getPivotWrapper().getPivot();
		var filterConfig = me.getFilterConfig();
		
		me.items=  [
	    	{
	    		xtype: 'container',
	    		layout: {
	    			type: 'hbox',
	    		},
	    		items:[
		    		{
		    			xtype: 'combo',
		    			emptyText: pivotObj.getLocaleString('MeasureFilter.Config.SelectOperaor'),
					    store : 'criteriaOperatorsStore',
					 	displayField: 'name',
						valueField: 'id',
						value : (filterConfig) ? filterConfig.criteriaOperator : '',
						labelSeparator 	: '',
						itemId: 'operatorsCombo',
						editable : true,
						growToLongestValue: true,
		                grow: true,
					    queryMode: 'local',
		                typeAhead: true,
					    flex : 0.4,
						listConfig: {
					        getInnerTpl: function() {
					    		var operatorsCombo =me.down('#operatorsCombo');
					    		var charLength = ((operatorsCombo.getWidth()-8)/8);
					        	return '<div title="{name}">{[Ext.util.Format.ellipsis(values.name, "'+charLength+'")]}</div>';
				            }
						},
				    },
				    {
				    	xtype: 'textfield',
				    	emptyText: pivotObj.getLocaleString('MeasureFilter.Config.SearchText'),
					    value : (filterConfig) ? filterConfig.criteriaText : '',
					    itemId: 'criteriaText',
					    flex : 0.6,
					    padding:'0 1 5 10',
				    },
			    ]
	    	},
	    	{	
	    		xtype: 'label',
    			text: pivotObj.getLocaleString('MeasureFilter.Config.PreviewResults'),
    			padding : '10 0 0 0',
	    	},
	    	{
    			xtype: 'gridpanel',
    			hideHeaders:true,
    		  	rowLines: false,
    		  	padding : '10 1 0 0',
    		  	viewConfig: {
    		  		stripeRows: false,
    		  		copy: true,
    		  	},
                store: new JdaPivotApp.store.measurefilter.AvailableSubMeasures({storeId:'criteriaAvailableSubMeasuresStore'}),
                itemId: 'availbleSubMeasuresGrid',
                autoScroll: true,
    			columns : {
    				defaults : {
    					menuDisabled : true,
    					sortable : false
    				},
    				items : [
    	            {
    	                dataIndex: 'name',
    	                flex : 1,
    	            },
    	        ]},
    		},
    	]
		me.callParent(arguments);
	},
   
});