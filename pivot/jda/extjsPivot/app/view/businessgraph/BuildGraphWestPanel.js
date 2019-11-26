//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.view.businessgraph.BuildGraphWestPanel', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.buildgraphwestpanel',
	itemId : 'buildgraphwestpanel',
	id : 'buildgraphwestpanel',
	requires: ['Ext.data.*','Ext.grid.*','Ext.dd.*','Ext.panel.*','JdaPivotApp.view.businessgraph.BuildGraphAccordionPanel'],
	config : {
		graphData: '',
		leftInfoPanelRowIdx:-1,
		rightInfoPanelRowIdx:-1
	},
	layout: {
		type: 'hbox',
		align: 'stretch'
	},
	initComponent : function() {
		var me = this;
		Ext.override(Ext.selection.RowModel, {
			preventFocus: true
		});

		var pivotObj =  JdaPivotApp.getApplication().getPivotController().getPivotWrapper().getPivot();
		var cube = pivotObj._getCubeDefinition();
		var scenarioFieldName = cube.scenariosDimensionKey;
		
		Ext.define('MeasureDataObject', {
			extend: 'Ext.data.Model',
			fields: ['id','name','chartType']
		});

		Ext.define('FacetLevelDropObject', {
			extend: 'Ext.data.Model',
			fields: ['dimensionName','levelId', 'levelName']
		});	 
		Ext.define('LegendsDataObject', {
			extend: 'Ext.data.Model',
			fields: ['dimensionName','levelId', 'levelName']
		});

		var xAxisData = [];
		var leftYAxisData = [];
		var rightYAxisData = [];
		var selectedMeasures = [];
		var selectedFacets = [];
		var graphData = me.getGraphData();
		if (graphData) {
			if (graphData.xaxis) {
				for (var i = 0; i < graphData.xaxis.length; i++) {
					var dimensionName = graphData.xaxis[i].dimensionName;
					var levelId = graphData.xaxis[i].levelName;
					var levelName = levelId.substring(levelId.lastIndexOf("@") + 1);
					if(levelName == scenarioFieldName){
						if(this.isScenarioExist(cube)){
							levelName = 'Scenario';
						}else{
							levelName = undefined;
						}
					}
					if(levelName){
						var data = [ dimensionName, levelId, levelName ];
						xAxisData.push(data);
						selectedFacets.push(levelId);	
					}
				}
			}
			if (graphData.yaxis) {
				for (var i = 0; i < graphData.yaxis.length; i++) {
					 var measureName = graphData.yaxis[i].measureName;
					 var measure = pivotObj.getMeasure(graphData.yaxis[i].measureId);
	           		 if(measure &&  measure.uIAttributes  &&  measure.uIAttributes.displayName){
	           			 measureName = measure.uIAttributes.displayName;
	           		 }
					var data = [
					            graphData.yaxis[i].measureId,
					            measureName,
					            graphData.yaxis[i].graphType ];
					if (graphData.yaxis[i].axisType === "0") {
						leftYAxisData.push(data);
					} else {
						rightYAxisData.push(data);
					}
					selectedMeasures.push(graphData.yaxis[i].measureId);
				}
			}
		}

		// the chart type store
		var chartTypeStore = new Ext.data.SimpleStore({
			fields: [ 'id', 'label' ,'icon'],
			data: [
			       [ 'Line', pivotObj.getLocaleString('BusinessGraph.Build.GraphType.Line'), 'chart-type-line' ],
			       [ 'Area', pivotObj.getLocaleString('BusinessGraph.Build.GraphType.Area'), 'chart-type-area'],
			       [ 'Column', pivotObj.getLocaleString('BusinessGraph.Build.GraphType.Column'), 'chart-type-column' ]
			      ]
		});

		var legendsData = [];
		//If No graph data present or graphData.legendFields is blank, then add 'Scenarios' to legend fields.
		//If graph data present(generally for 'edit' data, if 'Scenarios' present in legend fields, will be added to legend fields.)
		if (graphData.legendFields) {
			for (var i = 0; i < graphData.legendFields.length; i++) {
				var dimensionName = graphData.legendFields[i].dimensionName;
				var levelId = graphData.legendFields[i].levelName;
				var levelName = levelId.substring(levelId.lastIndexOf("@") + 1);
				if(levelName == scenarioFieldName){
					if(this.isScenarioExist(cube)){
						levelName = 'Scenario';
					}else{
						levelName = undefined;
					}
				}
				if(levelName){
					var data = [ dimensionName, levelId, levelName ];
					legendsData.push(data);
					selectedFacets.push(levelId);	
				}
			}
		}else if(selectedFacets && selectedFacets.indexOf(scenarioFieldName) == -1 && this.isScenarioExist(cube)){
			var legendfields = [scenarioFieldName,scenarioFieldName, 'Scenario'];
			legendsData.push(legendfields);
		}
		var measureDropcolumns = [
		                          {text: "Id", flex: 0, dataIndex: 'id', hidden: true, },
		                          {text: "Measure", flex: 0.45, dataIndex: 'name', sortable: false, menuDisabled: true, tdCls: 'custom-tagfield-column-1',
		                        	  renderer: function(value, metaData, record) {
		                        		  metaData.tdAttr = 'data-qtip="' + value + '"';
				  		   	        	  return value;
				  		   	        	}
				  		   	      },
		                          {text: "image", flex: 0.05, sortable: false, menuDisabled: true, tdCls: 'custom-tagfield-column-2' },
		                          { // show graph type column as widget column
		                        	      dataIndex: 'chartType',
		                                  xtype: 'widgetcolumn',
		                                  flex:0.5,
		                                  tdCls: 'custom-tagfield-column-1',
		                                  widget: {
		                                      xtype: 'combo',
		                                      store: chartTypeStore,
			                        		  displayField: 'label',
			                        		  itemId:'chartTypeId',
			                        		  valueField: 'id',
			                        		  editable:false,
			                        		  typeAhead:true,
			                        		  forceSelection:true,
			                        		  autoSelect: false,
			                        		  allowBlank:false,
			                        		  enableKeyEvent:false,
			                        		  listeners: {
			                        			  /*change: function( obj, newValue, oldValue, eOpts )
			                        			  {
			                        				  if( oldValue != null )
			                        				  {
				                        				  if(Ext.ComponentQuery.query('[itemId=measureLeftInfoPanel]')[0].store.getAt(Ext.getCmp('buildgraphwestpanel').getLeftInfoPanelRowIdx()) )
				                        				  {
				                        					  Ext.ComponentQuery.query('[itemId=measureLeftInfoPanel]')[0].store.getAt(Ext.getCmp('buildgraphwestpanel').getLeftInfoPanelRowIdx()).data.chartType=newValue;
				                        					  //Ext.ComponentQuery.query('[itemId=measureLeftInfoPanel]')[0].view.refresh();
				                        				  }
				                        				  
				                        				  if(Ext.ComponentQuery.query('[itemId=measureRightInfoPanel]')[0].store.getAt(Ext.getCmp('buildgraphwestpanel').getRightInfoPanelRowIdx()) )
				                        				  {
				                        					  Ext.ComponentQuery.query('[itemId=measureRightInfoPanel]')[0].store.getAt(Ext.getCmp('buildgraphwestpanel').getRightInfoPanelRowIdx()).data.chartType=newValue;
				                        					  //Ext.ComponentQuery.query('[itemId=measureRightInfoPanel]')[0].view.refresh();
				                        				  }
				                        				  JdaPivotApp.getApplication().getPivotController().previewGraph("previewGraph");
			                        				  }
			                        			  },*/
			                        			  select: function(combo, records, eOpts) {
			                        				  if(Ext.ComponentQuery.query('[itemId=measureLeftInfoPanel]')[0].store.getAt(Ext.getCmp('buildgraphwestpanel').getLeftInfoPanelRowIdx()) )
			                        				  {
			                        					  Ext.ComponentQuery.query('[itemId=measureLeftInfoPanel]')[0].store.getAt(Ext.getCmp('buildgraphwestpanel').getLeftInfoPanelRowIdx()).data.chartType=records.data.id;
			                        					  //Ext.ComponentQuery.query('[itemId=measureLeftInfoPanel]')[0].view.refresh();
			                        				  }
			                        				  
			                        				  if(Ext.ComponentQuery.query('[itemId=measureRightInfoPanel]')[0].store.getAt(Ext.getCmp('buildgraphwestpanel').getRightInfoPanelRowIdx()) )
			                        				  {
			                        					  Ext.ComponentQuery.query('[itemId=measureRightInfoPanel]')[0].store.getAt(Ext.getCmp('buildgraphwestpanel').getRightInfoPanelRowIdx()).data.chartType=records.data.id;
			                        					  //Ext.ComponentQuery.query('[itemId=measureRightInfoPanel]')[0].view.refresh();
			                        				  }
			                        				  JdaPivotApp.getApplication().getPivotController().previewGraph("previewGraph");
			                        			    },
			                        			  renderer: function(value) {
					                        		  var idx;
					                        		  if(!value)
					                        			  idx = chartTypeStore.find('label', pivotObj.getLocaleString('BusinessGraph.Build.GraphType.Column'));
					                        		  else
					                        			  idx = chartTypeStore.find('label', value);
					                        		  var rec = chartTypeStore.getAt(idx);
					                        		  return rec.get('id');  
					                        	  }
			                        		  },
			                        		  
			                        	  
		                                  }
		                          },
		                        	  
		                          	
		                          ];

		var facetDropColumns = [
			                        {text: "dimensionName", flex: 0, dataIndex: 'dimensionName',  hidden: true, },
			                        {text: "levelId", flex: 0, dataIndex: 'levelId',  hidden: true, },
			                        {text: "levelName", flex: 0.9, dataIndex: 'levelName', sortable: false, menuDisabled: true, tdCls: 'custom-tagfield-column-1',
			                        	  renderer: function(value, metaData, record) {
					  		   	        		metaData.tdAttr = 'data-qtip="' + value + '"';
					  		   	        		return value;
					  		   	        	}
			                        },
			                        {text: "image", flex: 0.1, sortable: false, menuDisabled: true, tdCls: 'custom-tagfield-column-2',
				                        renderer: function(value, metaData, record){
			                        		if(record.data.dimensionName == scenarioFieldName){
			                        			metaData.tdStyle = 'background-color: #F5F5F5;background-image:none;cursor:default;';
			                        			return value;
			                        		}
			                        		
			                        	}
									 }                     
		                        ];
		var measuresLeftDropStore = Ext.create('Ext.data.ArrayStore', {
			model: 'MeasureDataObject',
			data: leftYAxisData
		});

		var measuresRightDropStore = Ext.create('Ext.data.ArrayStore', {
			model: 'MeasureDataObject',
			data: rightYAxisData
		});

		var measuresLeftDropGrid = Ext.create('Ext.grid.Panel', {
			hideHeaders:true,
			rowLines: false,
			viewConfig: {
				stripeRows: false,
				plugins: {
					ptype: 'gridviewdragdrop',
					containerScroll: true,
					dragGroup: 'measuresDragGrid',
					dropGroup: 'measuresDragGrid'
				},
				listeners: {
					cellclick: me.measureCellClick,
					beforedrop: me.measureBeforeDrop,
					drop: me.measureDrop
				}
			},
			plugins: {
				ptype: 'cellediting',
				clicksToEdit: 1
			},
			header: {
				autoEl: {
					'data-qtip': pivotObj.getLocaleString('BusinessGraph.Build.YAxisLeft.Title')
				}
			},
			store            : measuresLeftDropStore,
			columns          : measureDropcolumns,
			columnLines	   : false,
			title            : pivotObj.getLocaleString('BusinessGraph.Build.YAxisLeft.Title'),
			itemId 		   : 'measureLeftInfoPanel',
			id 		   	   : 'measureLeftInfoPanel'
		});

		var measuresRightDropGrid = Ext.create('Ext.grid.Panel', {
			hideHeaders:true,
			rowLines: false,
			viewConfig: {
				stripeRows: false,
				plugins: {
					ptype: 'gridviewdragdrop',
					containerScroll: true,
					dragGroup: 'measuresDragGrid',
					dropGroup: 'measuresDragGrid'
				},
				listeners: {
					cellclick: me.measureCellClick,
					beforedrop: me.measureBeforeDrop,
					drop: me.measureDrop
				}
			},
			plugins: {
				ptype: 'cellediting',
				clicksToEdit: 1
			},
			header: {
				autoEl: {
					'data-qtip': pivotObj.getLocaleString('BusinessGraph.Build.YAxisRight.Title')
				}
			},
			store            : measuresRightDropStore,
			columns          : measureDropcolumns,
			title            : pivotObj.getLocaleString('BusinessGraph.Build.YAxisRight.Title'),
			itemId 		  : 'measureRightInfoPanel',
			id 		      : 'measureRightInfoPanel'
		});

		var facetsDropStore = Ext.create('Ext.data.ArrayStore', {
			model: 'FacetLevelDropObject',
			data: xAxisData
		});

		var legendFieldsStore = Ext.create('Ext.data.ArrayStore', {
			model: 'LegendsDataObject',
			data: legendsData
		});

		var facetsDropGrid = Ext.create('Ext.grid.Panel', {
			hideHeaders:true,
			rowLines: false,
			viewConfig: {
				stripeRows: false,
				plugins: {
					ptype: 'gridviewdragdrop',
					containerScroll: true,
					dragGroup: 'facetGridDDGroup',
					dropGroup: 'facetGridDDGroup'
				},
				listeners: {
					cellclick: me.facetLevelCellClick,
					drop: me.facetLevelDrop
				}
			},
			header: {
				autoEl: {
					'data-qtip': pivotObj.getLocaleString('BusinessGraph.Build.XAxis.Title')
				}
			},
			store            : facetsDropStore,
			columns          : facetDropColumns,
			title            : pivotObj.getLocaleString('BusinessGraph.Build.XAxis.Title'),
			itemId 		  : 'facetInfoPanel',
			id 		      : 'facetInfoPanel'
		});
		var legendFieldsGrid;
			legendFieldsGrid = Ext.create('Ext.grid.Panel', {
			  	hideHeaders:true, 
			  	rowLines: false,
		        viewConfig: {
		        	stripeRows: false,
		             plugins: {
		                 ptype: 'gridviewdragdrop',
		                 containerScroll: true,
		                 dragGroup: 'facetGridDDGroup',
		                 dropGroup: 'facetGridDDGroup'
		             },
		        },
		        listeners: {
		        	cellclick: me.facetLevelCellClick,
					drop: me.facetLevelDrop
				},
				header: {
					autoEl: {
						'data-qtip': pivotObj.getLocaleString('BusinessGraph.Build.LegendFields.Title')
					}
				},
		        store            : legendFieldsStore,
		        columns          : facetDropColumns,
		        title 			 : pivotObj.getLocaleString('BusinessGraph.Build.LegendFields.Title'),
		        itemId			 : scenarioFieldName
		});
		var dropPanel = Ext.create('Ext.panel.Panel', {
			border : false,
			defaults:{
				border:0,
			},
			layout: {
	    	    type: 'vbox',
	    	    align: 'stretch',
	    	    pack  : 'start',
	    	},
	    	padding : '0 10 0 0',
	    	cls: 'split-panel-separation',
			items: [{
				items : measuresLeftDropGrid,
				padding : '0 0 10 0',
				cls: 'split-panel-separation',
			},{
				items :  measuresRightDropGrid,
				padding : '0 0 10 0',
				cls: 'split-panel-separation',
			},
			{
				items :  facetsDropGrid,
				padding : '0 0 10 0',
				cls: 'split-panel-separation',
			},
			{
				items :  legendFieldsGrid,
				cls: 'split-panel-separation',
			}],
  		listeners: {
  			afterlayout: function () {
  				var totalpanels = 3;
  				if(this.query('#'+cube.scenariosDimensionKey)[0]){
  					totalpanels = 4;
  				}
  				var itemHeight = ((Ext.getCmp("businessGraphDropPanel").getHeight()-30)/totalpanels);
  				this.query('#measureLeftInfoPanel')[0].setHeight(itemHeight);
  				this.query('#measureRightInfoPanel')[0].setHeight(itemHeight);
  				this.query('#facetInfoPanel')[0].setHeight(itemHeight);
  				if(this.query('#'+cube.scenariosDimensionKey)[0]){
  					this.query('#'+cube.scenariosDimensionKey)[0].setHeight(itemHeight);
  				}
  		    }
  		}
		});

		me.items=  [{
			flex : 0.5,
			xtype : 'buildgraphaccordionpanel',
			selectedMeasures: selectedMeasures,
			selectedFacets: selectedFacets,
			padding : '0 10 0 0',
			cls: 'split-panel-separation',
		},
		{
			flex : 0.5,
			border : false,
			items : dropPanel,
			id : 'businessGraphDropPanel'
		}
		];
		me.callParent(arguments);
	},
	isScenarioExist:function(cube){
		//If scenario not present in facets then not adding scenario to legend field.
		var availableFacets = cube.availableFacets;
		for(var i = 0; i < availableFacets.length; i ++){
			if(!availableFacets[i].dummy && availableFacets[i].name == cube.scenariosDimensionKey){
				return true;
			}
		}
		return false;
	},
	measureCellClick:function(iView, iCellEl, iColIdx, iRecord, iRowEl, iRowIdx, iEvent) {
		if(iColIdx == 2 && !iEvent.keyCode){
			var measuresDragGrid = Ext.getCmp('measuresDragGrid');
			var itemIndex = iView.getStore().data.indexOf(iRecord);
			var removedRecIndex = measuresDragGrid.getStore().indexOf(iRecord);
			//If measure is not available at right side then we need to ask for confirmation for delete operation. 
			if(removedRecIndex != -1){
				iView.getStore().removeAt(itemIndex);
				var removedGridRec = measuresDragGrid.getStore().data.items[removedRecIndex];
				removedGridRec.set('disabled', false);
				removedGridRec.commit();
				JdaPivotApp.getApplication().getPivotController().previewGraph("previewGraph");	
			}else{
				Ext.getCmp('buildgraphwestpanel').showDeleteItemDilog(iView, itemIndex);
			}
		}
		else if(iColIdx == 3 && !iEvent.keyCode)
		{
			if( iView.grid.id == "measureLeftInfoPanel")
			{
				Ext.getCmp('buildgraphwestpanel').leftInfoPanelRowIdx=iRowIdx;
				Ext.getCmp('buildgraphwestpanel').rightInfoPanelRowIdx=-1;
			}
			else
			{
				Ext.getCmp('buildgraphwestpanel').rightInfoPanelRowIdx=iRowIdx;
				Ext.getCmp('buildgraphwestpanel').leftInfoPanelRowIdx=-1;
			}
		}
	},
	measureBeforeDrop:function (node, data, dropRec, dropPosition) {/*
		 var recordId = data.records[0].id;
		 var itemDropped = true;
		 var measuresDropGrid = Ext.getCmp('measureLeftInfoPanel');
		 var recordId = data.records[0].id;
		 for(var i = 0; i < measuresDropGrid.getStore().data.items.length ; i++){
			 if(measuresDropGrid.getStore().data.items[i].id === recordId){
				itemDropped = false;
				break;
		  	 }
		 }	
		 measuresDropGrid = Ext.getCmp('measureRightInfoPanel');
		 for(var i = 0; i < measuresDropGrid.getStore().data.items.length ; i++){
			 if(measuresDropGrid.getStore().data.items[i].id === recordId){
				itemDropped = false;
				break;
		  	 }
		  }	
		 return itemDropped;
	 */},
	 measureDrop:function(node, data, dropRec, dropPosition) {

		 var measuresDragGrid = Ext.getCmp('measuresDragGrid');

		 var draggedRecIndex = measuresDragGrid.getStore().indexOf(data.records[0]);
		 if(draggedRecIndex != -1){
			 var draggedGridRec = measuresDragGrid.getStore().data.items[draggedRecIndex];
			 draggedGridRec.set('disabled', true);
			 draggedGridRec.commit();
			// Removing errorqtip if already added error field
			 var measureLeftInfoPanelBody = Ext.getCmp('measureLeftInfoPanel').body;
			 measureLeftInfoPanelBody && measureLeftInfoPanelBody.setStyle('border','');
			 measureLeftInfoPanelBody && measureLeftInfoPanelBody.set({'data-errorqtip': ''});

			 JdaPivotApp.getApplication().getPivotController().previewGraph("previewGraph");
		 }
	 },
	 
	 facetLevelDrop:function(node, data, dropRec, dropPosition, iView) {
		 
		 var pivotObj =  JdaPivotApp.getApplication().getPivotController().getPivotWrapper().getPivot();
		 var cube = pivotObj._getCubeDefinition();
		 var scenarioFieldName = cube.scenariosDimensionKey;
		 
		 var itemId = data.records[0].data.dimensionName;
		 
		 if(itemId && itemId != scenarioFieldName){
				 var facetDragGrid = Ext.ComponentQuery.query('[itemId='+itemId+']')[0];
				 if(facetDragGrid){
					 var draggedRecIndex = facetDragGrid.getStore().indexOf(data.records[0]);
					 var draggedGridRec = facetDragGrid.getStore().data.items[draggedRecIndex];
					 if(draggedGridRec){
						 draggedGridRec.set('disabled', true);
						 draggedGridRec.commit();
					 }
				 }
				 // Removing errorqtip if already added error field
				 var facetInfoPanelBody = Ext.getCmp('facetInfoPanel').body;
				 facetInfoPanelBody && facetInfoPanelBody.setStyle('border','');
				 facetInfoPanelBody && facetInfoPanelBody.set({'data-errorqtip': ''});
		 }else{
			 var facetDropGrid = Ext.ComponentQuery.query('[itemId=facetInfoPanel]')[0];
			 var row = facetDropGrid.getSelectionModel().getSelection()[0];
		 }
		JdaPivotApp.getApplication().getPivotController().previewGraph("previewGraph");
	 },
	 
	 facetLevelCellClick:function(iView, iCellEl, iColIdx, iRecord, iRowEl, iRowIdx, iEvent) {
		 if(iColIdx == 3 ){
			 var pivotObj =  JdaPivotApp.getApplication().getPivotController().getPivotWrapper().getPivot();
			 var cube = pivotObj._getCubeDefinition();
			 var dimensionName = iRecord.data.dimensionName;
			 if(dimensionName != cube.scenariosDimensionKey){
				 var itemIndex = iView.getStore().data.indexOf(iRecord);
				 var facetDropGrid = Ext.ComponentQuery.query('[itemId='+dimensionName+']')[0];
				 var recordId = iRecord.data.levelName;
				 var itemFound = false;
				 if(facetDropGrid){
					 for(var i = 0; i < facetDropGrid.getStore().data.items.length ; i++){
						 if(facetDropGrid.getStore().data.items[i].data.levelName === recordId){
							 iView.getStore().removeAt(itemIndex);
							 var draggedGridRec = facetDropGrid.getStore().data.items[i];
							 draggedGridRec.set('disabled', false);
							 draggedGridRec.commit();
							 itemFound = true;
							 break;
						 }
					 }
				 }
				 
				 if(!itemFound){
					 Ext.getCmp('buildgraphwestpanel').showDeleteItemDilog(iView, itemIndex);
				 }else{
					 JdaPivotApp.getApplication().getPivotController().previewGraph("previewGraph");	 
				 }
			 }
		 }
	 },
	 
	 legendFieldBeforeDrop: function (node, data, dropRec, dropPosition) {
			var dragFlag = false;
			var pivotObj =  JdaPivotApp.getApplication().getPivotController().getPivotWrapper().getPivot();
			var cube = pivotObj._getCubeDefinition();
			 
			if(data.records[0].data.dimensionName == cube.scenariosDimensionKey){
				dragFlag = true;
			}
			return dragFlag;
	 },
	 
	 showDeleteItemDilog:function(iView, itemIndex ){
		var deleteItemDialog = Ext.widget('deleteitemdialog', {});
		var pivotObj =  JdaPivotApp.getApplication().getPivotController().getPivotWrapper().getPivot();
		deleteItemDialog.setTitle(pivotObj.getLocaleString('BusinessGraph.GraphConfig.DeleteItemDialog.Title'));
		deleteItemDialog.show();
		var deleteitemdialogokbtn = deleteItemDialog.down('#deleteitemdialogokbtn');
		var deleteitemdialogcencelbtn = deleteItemDialog.down('#deleteitemdialogcencelbtn');
		deleteitemdialogokbtn.on('click', function(){
			iView.getStore().removeAt(itemIndex);
			deleteItemDialog.close();
			JdaPivotApp.getApplication().getPivotController().previewGraph("previewGraph");	
		});
		deleteitemdialogcencelbtn.on('click', function(){
			deleteItemDialog.close();
		});
	 }
});