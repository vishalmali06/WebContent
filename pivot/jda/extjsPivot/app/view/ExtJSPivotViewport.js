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
 * File: app/view/ExtJSPivotViewport.js
 *
 */

Ext.define('JdaPivotApp.view.ExtJSPivotViewport', {
	/* extend : 'Ext.container.Container', */
	extend : 'Jda.ux.layout.JdaViewport',

	requires : [ 'Ext.layout.container.Card',
			'JdaPivotApp.view.PivotFilterPanel', 'Ext.layout.container.Border',
			'Jda.ux.layout.PivotWrapper', 'Jda.ux.layout.GraphWrapper','Jda.ux.layout.BusinessGraphWrapper','Jda.ux.layout.FiltersWrapper',
			'Jda.ux.layout.CommentWrapper', 'JdaPivotApp.view.CFWrapper'],
	config : {
		pivotConfig : null
	},
	itemId : 'pivotviewport',
	initComponent : function() {
		var me = this;
		var _pivotconfig = me.getPivotConfig();
		
		if(_pivotconfig.enabledCharts === 1){
			_pivotconfig.enabledCharts = true;
			_pivotconfig.enabledBusinessCharts = false;
		}else if(_pivotconfig.enabledCharts === 2){
			_pivotconfig.enabledCharts = false;
			_pivotconfig.enabledBusinessCharts = true;
		}
		
		if(_pivotconfig.enabledDataFilter){
			_pivotconfig.enabledStyling = false;
		}
		
		var southPanelHeight = _pivotconfig.southPanelHeight ? _pivotconfig.southPanelHeight : 300;
		// pivotlog(_pivotconfig);
		var buttons = [ {
			xtype : 'tbfill',
			flex : 2
		} ];
		var cards = [];
		if (_pivotconfig.enabledComments) {
			cards.push({
				title : 'Comments',
				header : false,
				layout : 'fit',
				itemId : 'commentcard',
				items : [ {
					xtype : 'commentwrapper',
					itemId : 'commentwrapper'
				} ]
			});
			buttons.push({
				type : 'button',
				flex : 1,
				text : 'Comments',
				itemId : 'commentbtn',
				ui: 'j-standard-button',
				cls : 'j-pvt-comments j-pvt-button j-pvt-toolbar-buttons'
			});
		}

		if (_pivotconfig.enabledCharts) {
			cards.push({
				title : 'Graph',
				header : false,
				layout : 'fit',
				itemId : 'graphcard',
				items : [ {
					xtype : 'graphwrapper',
					itemId : 'graphwrapper'

				} ]
			});
			buttons.push({
				type : 'button',
				flex : 1,
				text : 'Graph',
				itemId : 'graphbtn',
				ui: 'j-standard-button',
				cls : 'j-pvt-graph j-pvt-button j-pvt-toolbar-buttons'
			});
		}else  if (_pivotconfig.enabledBusinessCharts) {
			cards.push({
				title : 'Business Graph',
				header : false,
				layout : 'fit',
				itemId : 'businessgraphcard',
				items : [ {
					xtype : 'businessgraphwrapper',
					itemId : 'businessgraphwrapper'
				} ]
			});
			buttons.push({
				type : 'button',
				flex : 1,
				text : 'Business Graph',
				itemId : 'businessgraphbtn',
				ui: 'j-standard-button',
				cls : 'j-pvt-graph j-pvt-button j-pvt-toolbar-buttons'
			});
		}
		if (_pivotconfig.enabledStyling) {
			var styleItems = [];
			styleItems.push({
				xtype : 'cfwrapper',
				flex : 1
			});
			cards.push({
				title : 'Style',
				itemId : 'stylecard',
				layout : 'fit',
				header : false,
				items : styleItems,
				cls : 'j-pvt-styling-wrapper'
			});
			buttons.push({
				type : 'button',
				flex : 1,
				text : 'Style',
				itemId : 'stylebtn',
				ui: 'j-standard-button',
				cls : 'j-pvt-styling j-pvt-button j-pvt-toolbar-buttons'
			});
		}
		
        if (_pivotconfig.enabledDataFilter || _pivotconfig.enabledMeasureFilter) {
            cards.push({
                title : 'Filters',
                itemId : 'filterscard',
                layout : 'fit',
                header : false,
                cls : 'j-pvt-styling-wrapper',
                items : [ {
                    xtype 	: 'filterswrapper',
                    itemId	: 'filterswrapper',
                    pivotConfig : _pivotconfig,
                }]
            });
            buttons.push({
                type : 'button',
                flex : 1,
                text : 'Filters',
                itemId : 'filtersbtn',
                ui: 'j-standard-button',
                cls : 'j-pvt-styling j-pvt-button j-pvt-toolbar-buttons'
            });
        }
        
		buttons.push({
			xtype : 'tbfill',
			flex : 2
		});
		
		buttons.push({
			type : 'button',
// TODO GK: Remove comment to move to glyphs
//			glyph : 0xf103,
			border : 0,
// TODO GK: Add comment to move to glyphs. Comment next 2 line
			cls:'j-pvt-toolbar-buttons-close', 
			text:"<b>&nbsp;</b>", 
			itemId : 'closebtn',
			hidden : true
		});
		var items = [];
		var eastPanel ={
				region:'east',
				itemId:'pivotfilterpanel',	
				header:{
					xtype: 'header',
			        items: [{
			            xtype: 'textfield',
			            emptyText:'Type ahead filter',
			            enableKeyEvents:true,
			            itemId:'searchfiltertext',
			            padding:'2 0 0 16'
			            
			        }]
				},
				layout:'fit',
				/*width:275,*/
				
				flex:1,
				cls:'pvt-east-panel',
				collapsible : true,
				split : true,
				collapsed : true,
				items : [ {
					xtype:"pivotfilter",
					itemId:'pivotfilter',					
				} ]				
		};
		var centerPanel = {
			region : 'center',
			title : 'Main',
			header : false,
			collapsible : false,
			flex : 4,
			layout : 'fit',
			cls : 'pvt-center-panel',
			items : [ {
				xtype : 'pivotwrapper',
				itemId : 'pivotwrapper',
				pivotConfig:_pivotconfig
			} ]
		};
		if (_pivotconfig.enabledComments || _pivotconfig.enabledCharts
				|| _pivotconfig.enabledStyling || _pivotconfig.enabledBusinessCharts
				|| _pivotconfig.enabledDataFilter || _pivotconfig.enabledMeasureFilter)
			Ext.apply(centerPanel, {
				dockedItems : {
					xtype : 'toolbar',
					itemId: 'pivotUtilToolbar',
					/*
					 * layout : { type : 'hbox', pack : 'center' },
					 */
					dock : 'bottom',
					items : buttons,
					cls : 'pivot-util-toolbar'
				}
			});
       
		var pivotPanel = {
			xtype : 'panel',
			layout : 'border',
			defaults : {
				collapsible : true
			/* bodyStyle : 'padding:2px' */
			},
			split : {
				hidden : false
			},
			header : false,
			title : 'Visual Pivot',
			items : [ centerPanel]
		};
		if(_pivotconfig.attributeFilter){
			pivotPanel.items.push(eastPanel);
		}
		if (_pivotconfig.enabledComments || _pivotconfig.enabledCharts 
				|| _pivotconfig.enabledBusinessCharts || _pivotconfig.enabledStyling
				|| _pivotconfig.enabledDataFilter || _pivotconfig.enabledMeasureFilter)
			pivotPanel.items.push({
				region : 'south',
				collapsible : true,
				collapseMode : 'mini',
				hideCollapseTool : true,
				split : true,
				collapsed : true,
				cls : 'j-pvt-south-panel',
				/*flex : 2,*/
				itemId : 'pvtsouthpanel',
				layout : 'fit',
				header : false,
				weight:-100,
				height:southPanelHeight,
				/*minHeight:250,*/
				/*maxHeight:300,*/
				items : [ {
					xtype : 'container',
					itemId : 'southcontainer',
					layout : 'card',
					removePanelHeader : true,
					items : cards
				} ],
				listeners: {
			        afterrender: function(panel){
			        	$(".j-pvt-south-panel").siblings(".x-splitter.x-splitter-horizontal").dblclick(function() {
			        		  return false;
			          	});
			        }        
			    }
			});

		items.push(pivotPanel);
		me.items = items;
		me.callParent(arguments);
	}
});