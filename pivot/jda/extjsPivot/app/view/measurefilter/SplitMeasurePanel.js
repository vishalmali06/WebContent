//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.view.measurefilter.SplitMeasurePanel', {
	extend : 'Ext.panel.Panel',
	alias  : 'widget.splitmeasurepanel',
	itemId : 'splitmeasurepanel',
	layout: 'anchor',
	config : {
		filterConfig : null,
	},
	initComponent : function() {
		var me = this;
		var pivotObj = JdaPivotApp.getApplication().getPivotController().getPivotWrapper().getPivot();
		var filterConfig = me.getFilterConfig();
		me.items=  [
			{
		    	xtype: 'combo',
		    	emptyText: pivotObj.getLocaleString('MeasureFilter.Config.SelectMeasure'),
			    store : 'splitMeasuresStore',
			    displayField: 'name',
				valueField: 'id',
				value : (filterConfig) ? filterConfig.splitMeasureId : '',
				fieldLabel: pivotObj.getLocaleString('MeasureFilter.Config.SelectMeasure')+ "*",
			    labelSeparator 	: '',
				itemId: 'splitMeasureCombo',
				editable : true,
				growToLongestValue: true,
                grow: true,
			    queryMode: 'local',
                typeAhead: true,
			    anchor : "50%",
				padding	: '5 0 0 0',
				listConfig: {
			        getInnerTpl: function() {
			    		var splitMeasureCombo =me.down('#splitMeasureCombo');
			    		var charLength = ((splitMeasureCombo.getWidth()-8)/8);
			        	return '<div title="{name}">{[Ext.util.Format.ellipsis(values.name, "'+charLength+'")]}</div>';
		            }
				},
			},{
				xtype:'container',
				layout:'column',
				items:[
					{
					xtype: 'radiogroup',
					itemId: 'measureSelection',
					padding	   : '10 0 0 0',
					columnWidth : .52,
		            layout : {
		                type  : 'hbox',
		                align : 'stretch'
		            },
		            items: [
		                	{
			                    boxLabel  : pivotObj.getLocaleString('MeasureFilter.Config.SelectSubMeasure'),
			                    inputValue: 'submeasures',
			                    name :  'subMeasureSelectionType',
			                    checked : (filterConfig) ? !filterConfig.criteriaSelection : true,
		                	}, {
			                    boxLabel  : pivotObj.getLocaleString('MeasureFilter.Config.EnterSubMeasureCriteria'),
			                    inputValue: 'submeasurescriteria',
			                    name :  'subMeasureSelectionType',
			                    padding	   : '0 0 0 40',
			                    checked : (filterConfig) ? filterConfig.criteriaSelection : false,
		                	}
	                	],
					},{
				xtype: 'panel',
				width: '100%',
				itemId:'subMeasureErrMsgPanel',
				hidden:true,

				columnWidth : .48,
				layout: {
					type: 'hbox',
		            align: 'stretch',
		            pack: 'start'
				},
				border: false,
				bodyStyle: 'background-color: #D68001; color: #FFFFFF;',
				// margin: 2,
				padding: '12 0 0 0',
				bodyPadding: '0 0 0 0',
				items:[{
		           xtype: 'displayfield',
		           //fieldStyle:'overflow: initial;',
				   value : "",
				   cls: 'text-wrapper',
		           padding: '2 0 2 5',
		           flex:1,
				   fieldCls: 'ellipsis',
				   renderer : function(value){
					return '<span title="'+value+'"/>'+value+'</span>';
				   }
				}]
		    }]},
		    {
	            xtype: 'pivotitemselector',
	            filterConfig :filterConfig,
	            hidden : (filterConfig) ? filterConfig.criteriaSelection : false,
	            border:false,
		    },
		    {
	            xtype: 'submeasurescriteriapanel',
	            filterConfig : filterConfig,
	            hidden : (filterConfig) ? !filterConfig.criteriaSelection : true,
	            border:false,
		    },
		]
		me.callParent(arguments);
	},
   
});