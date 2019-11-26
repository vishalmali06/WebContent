//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext
		.define(
				'JdaPivotApp.view.CFWrapper',
				{
					extend : 'Ext.panel.Panel',
					requires : [ 'Ext.grid.Panel', 'Ext.data.Store','Ext.data.Model',
							'JdaPivotApp.model.StyleRule',
							'JdaPivotApp.store.StyleRule',
							'Ext.grid.plugin.DragDrop', 'Ext.util.Point',
							'Ext.grid.column.Action', 'Ext.toolbar.Spacer'],
					alias : 'widget.cfwrapper',
					config : {
						cellId : null,
						intersection : null,
						setting : {},
						options : {},
						pivotObj : null,
						canModify:true,
					},
					layout : 'fit',
					cls : 'j-pvt-styling-panel',
					bodyCls : 'j-pvt-styling-panel-body',
					initComponent : function() {
						var me = this;
						//me.addEvents('rendergrid');
						me.on({
							rendergrid : me.attachGrid
						});
						me.callParent(arguments);
					},
					attachGrid : function() {
						var me = this;
						var pivotObj = JdaPivotApp.getApplication()
								.getPivotController().getPivotWrapper()
								.getPivot();
						
						var cube = pivotObj._getCubeDefinition();
						if(cube && cube.uiAttributes && cube.uiAttributes.canModifyCFRules === false){
							this.config.canModify = cube.uiAttributes.canModifyCFRules;
						}
						
						if (!me.down('grid'))
							me.add(me.getRuleGrid(pivotObj, this.config.canModify));

						if (me.getDockedItems('toolbar[dock="top"]')
								&& me.getDockedItems('toolbar[dock="top"]').length < 1)
							me.addDocked(me.getToolBar(pivotObj, this.config.canModify));
						JdaPivotApp.getApplication().getPivotController()
								.viewAllRules(false);
					},
					renderCellFormat : function(val) {
					},
					getRuleGrid : function(pivotObj, canModify) {
						return {
											xtype: 'grid',
											store: Ext.data.StoreManager.lookup('rulestore'),
											itemId : 'stylerulegrid',
											//selModel : 'MULTI',
											selModel: {
								                mode: 'MULTI'
								            },
											viewConfig:{
												overflowX: 'hidden'
											},
											selType : 'rowmodel',
											cls : 'j-pvt-styling-grid',
											bodyCls : 'j-pvt-styling-grid-body',
											selectedItemCls : '',
											//forceFit : true, // causing issue when continuous click on conditional formating.
											columns : {
												defaults : {
													menuDisabled : true,
													sortable : false
												},
												items : [
														{
															text : pivotObj
																	.getLocaleString('CF.RuleTitle'),// 'Title',
															dataIndex : 'ruleTitle',
															renderer : function(
																	val, meta) {
																meta.style = 'color:#002299';
																meta.style = 'padding-left: 10px;';
																if(canModify){
																	meta.style = 'cursor: pointer';
																}
																return val;
															},
															flex:0.15
														},
														{
															text : pivotObj
																	.getLocaleString('CF.TargetMeasures'),// 'Target
																											// Measures',
															dataIndex : 'targetMeasures',
															flex : 0.20
														},
														{
															text : pivotObj
																	.getLocaleString('CF.RuleDefinitions'),// 'Rule
																											// Definition',
															dataIndex : 'ruleDefinition',
															flex : 0.42
														},
														{
															text : pivotObj
																	.getLocaleString('CF.CellFormat'),
															dataIndex : 'cellBgColor',
															renderer : function(
																	val) {
																return '<div style="border:1px; background-color:'
																		+ val
																		+ '">&nbsp;</div>';
															},
															flex : 0.15
														},
														{
															text : pivotObj.getLocaleString('CF.fontColor'),
															dataIndex : 'cellFontColor',
															renderer : function(
																	val) {
																return '<div style="border:1px; background-color:'
																		+ val
																		+ '">&nbsp;</div>';
															},
															flex : 0.15
														},
														{
															xtype : 'actioncolumn',
															items : [ {
																xtype : 'button',
																iconCls:'j-cf-grid-delete',
																disabled: !canModify,
																tooltip : pivotObj
																		.getLocaleString('CF.DeleteRule')
															} ],
															flex:0.01
														} ]
											},
											viewConfig : {
												plugins : {
													ptype : 'gridviewdragdrop',
													dragText : pivotObj
															.getLocaleString('CF.DragAndDrop')
												}
											},
											 listeners: {
											        beforedrop: function (node, data, dropRec, dropPosition) {
											           return  (canModify) ?  true:false;
											        }
											 },
											flex : 0.88
										};
					},
					getToolBar : function(pivotObj, canModify) {
						return Ext
								.widget(
										'toolbar',
										{
											dock : 'top',
											cls : 'j-pvt-styling-header',
											items : [
													{
														xtype : 'tbspacer',
														flex : 0.06
													},
													{
														type : 'button',
														text : pivotObj
																.getLocaleString('CF.AddRule'),
														itemId : 'addrulebtn',
														ui : 'j-primary-button',
														cls : 'j-pvt-styling-button j-pvt-primary-button',
														disabled: !canModify,
													}, {
														xtype : 'tbspacer',
														flex : 0.94
													}, ]
										});
					}

				});