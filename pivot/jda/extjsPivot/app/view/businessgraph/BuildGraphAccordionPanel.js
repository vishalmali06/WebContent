//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.view.businessgraph.BuildGraphAccordionPanel', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.buildgraphaccordionpanel',
	itemId : 'buildgraphaccordionpanel',
	config : {
		selectedMeasures: null,
		selectedFacets: null
	},
	split: true,
	layout: {
        type: 'accordion',
        titleCollapse: true,
        animate: true,
        fill : true,
        align: 'stretch',
        autoHeight: true,
    },
   
	initComponent : function() {
		var me = this;
		var pivotObj =  JdaPivotApp.getApplication().getPivotController().getPivotWrapper().getPivot();
		var cube = pivotObj._getCubeDefinition();
		
		var accrodionPanelItems = [];
		
		//Start Measure Accordion
		var measures = me.getAvailableMeasures(cube, me.getSelectedMeasures());
		var graphableFacets = me.getGraphableFacets(cube);
		var hideCollapseTool = graphableFacets.length > 0 ? false:true;
		var measuresDragStore  = Ext.create('Ext.data.Store', {
			model: 'MeasureDataObject',
			data: measures
		});
		
		//Arranging Ascending order by measure name 
		measuresDragStore.sort('name', 'ASC');
		
		Ext.define('MeasureDataObject', {
		    extend: 'Ext.data.Model',
		    fields: ['id','name','chartType'],
		});
		
		var measureDragColumns = [
		                	        {text: "id", flex: 0, 	dataIndex: 'id', hidden: true},
		                	        {text: "name", flex: 1, dataIndex: 'name', sortable: true, menuDisabled: true,
		                	        	 renderer: function(value, metaData, record) {
		                	        	        metaData.tdAttr = 'data-qtip="' + value + '"';
		                	        	        return value;
		                	        	 },
		                	        },
		                	        {text: "chartType", flex: 0, dataIndex: 'chartType',  hidden: true },
		                	        
		                	     ];
		  
	    var measuresDragGrid = Ext.create('Ext.grid.Panel', {
		  	hideHeaders:true,
		  	rowLines: false,
		  	viewConfig: {
	        	 stripeRows: false,
	        	 copy: true,
	             plugins: {
	                 ptype: 'gridviewdragdrop',
	                 dragGroup: 'measuresDragGrid',
                	 dragZone: {
                         onBeforeDrag: me.onBeforeDrag
                     },
	             },
	             getRowClass: me.getRowClass
	         },
	         store            : measuresDragStore,
	         columns          : measureDragColumns,
	         title 			  : pivotObj.getLocaleString('BusinessGraph.Build.Measures.Title'),
	         id				  : 'measuresDragGrid',
	         itemId			  : 'measuresDragGrid',
	         hideCollapseTool : hideCollapseTool,
	        
            /* header: {
                 autoEl: {
                     'data-qtip': pivotObj.getLocaleString('BusinessGraph.Build.Measures.Title')
                 }
             },*/
	         listeners: {
	        	 afterrender : me.setPanelHeaderToolTip
	         }
	       //TODO : platform is going to fix this issue, other wise if we enable below code Expan/Collapse Panel also will be localization(MDAP-2508)
	        /* listeners: {
	        	 expand: me.expandPanel,
	        	 collapse: me.collapsePanel,
	        	 afterrender :function(panel) {
	        		 if($(panel.header.getEl().dom).find('.x-tool.x-box-item.x-tool-default').children().hasClass("x-tool-collapse-top")){
	        			 var collapseText = pivotObj.getLocaleString('BusinessGraph.Build.AccordionPanel.TT.Collapse');
	        			 collapseText && $(panel.header.getEl().dom).find('.x-tool.x-box-item.x-tool-default').attr('data-qtip',collapseText);	 
	        		 }
	             }
	         }*/
	     });
		accrodionPanelItems.push(measuresDragGrid);
		//End Measure Accordion

		  
		//Start Facets Accordion
		Ext.define('FacetDataObject', {
		    extend: 'Ext.data.Model',
		    fields: ['dimensionName','levelName']
		});
		var facetDragColumns = [
				  		   	        {text: "dimensionName", flex: 0, dataIndex: 'dimensionName',  hidden: true, },
				  		   	        {text: "levelId", flex: 0, dataIndex: 'levelId',  hidden: true, },
				  		   	        {text: "levelName", flex: 1, dataIndex: 'levelName', sortable: false, menuDisabled: true,
				  		   	        	renderer: function(value, metaData, record) {
				  		   	        		metaData.tdAttr = 'data-qtip="' + value + '"';
				  		   	        		return value;
				  		   	        	},
				  		   	        }
				  		   	        ];
		
		selectedFacets = me.getSelectedFacets();
		
		for(var i = 0; i < graphableFacets.length; i ++){
			var facetInfo = graphableFacets[i];
  			var dimensionLevels=me.getDimensionLevels(facetInfo,selectedFacets);
  			var facetDragStore  = Ext.create('Ext.data.Store', {
  				model: 'FacetDataObject',
  				data: dimensionLevels
  			});
  			
  			var facetDragGrid = Ext.create('Ext.grid.Panel', {
  			  	hideHeaders:true, 
  			  	rowLines: false,
  		        viewConfig: {
  		        	stripeRows: false,
  		        	copy: true,
  		             plugins: {
  		                 ptype: 'gridviewdragdrop',
  		                 dragGroup: 'facetGridDDGroup',
  		                 dragZone: {
                           onBeforeDrag: me.onBeforeDrag
  		                 },
  		             },
  		             getRowClass: me.getRowClass,
  		        },
  		        store            : facetDragStore,
  		        columns          : facetDragColumns,
  		        title 			 : facetInfo.UIAttributes.displayName,
  		        itemId			 : facetInfo.name,
  		      listeners: {
	        	    afterrender : me.setPanelHeaderToolTip
  		      }
  		     });
  			
  			accrodionPanelItems.push(facetDragGrid);
	  	}
		
	   me.items= accrodionPanelItems;
	   me.callParent(arguments);
	},
	getAvailableMeasures:function(cube, selectedMeasures){
		var measures= [];
		if(cube && cube.measures){
			var availableMeasures = cube.measures;
			for (var i = 0; i < availableMeasures.length; i++) {
				var measure = availableMeasures[i];
				if(measure && measure.uIAttributes && measure.uIAttributes.isGraphable){
					var measureName = measure.uIAttributes.displayName;
					var measureId = measure.id;
					var disabled = false;
					if (selectedMeasures && selectedMeasures.indexOf(measureId) > -1) {
						disabled = true;
					}
					measures.push({
						id : measure.id,
						name : measureName,
						//chartType : pivotObj.getLocaleString('BusinessGraph.Build.GraphType.Line'),
						chartType : 'Line',
						disabled : disabled
					});
				}
			}
		}
		return measures;
	},
	getDimensionLevels:function(facetInfo, selectedFacets){
		var dimensionLevels = [];
		for(var x = 0; x < facetInfo.availableLevels.length; x++){
				var levelId = facetInfo.availableLevels[x].attributeId;
				var disabled = false;
				if(selectedFacets && selectedFacets.indexOf(levelId) > -1){
					disabled = true;
				}
				dimensionLevels.push({
					dimensionName : facetInfo.name,
					levelId : facetInfo.availableLevels[x].attributeId,
					levelName : facetInfo.availableLevels[x].attributeName,
					disabled:disabled
				});
	  	}
		return dimensionLevels;
	},
	getGraphableFacets: function(cube){
		var graphableFacets = [];
		var counter = 0;
		var availableFacets = cube.availableFacets;
		for(var i = 0; i < availableFacets.length; i ++){
			var facetInfo = availableFacets[i];
			//Not Adding Scenario as facet
			if(facetInfo.name ==  cube.scenariosDimensionKey){
				continue;
			}
			if(facetInfo && !facetInfo.dummy && facetInfo.UIAttributes && facetInfo.UIAttributes.isGraphable){
				graphableFacets[counter] = facetInfo;
				counter++;
			}
		}
		return graphableFacets;
	},
	
	onBeforeDrag:function(data, e) {
		return ($(data.item).find('tbody tr:first').hasClass('custom-row-disabled')) ? false: true;
    },
    getRowClass:function(record, index, rowParams, store) {
    	return record.get("disabled") ? "custom-row-disabled" : "";
    },
    setPanelHeaderToolTip : function(panel){
    	var panelHeader = panel.header.getEl().dom && $(panel.header.getEl().dom).find('.x-title.x-panel-header-title');
    	if(panelHeader){
    		panelHeader.attr('data-qtip',panel.title);
    	}
    },
   /* expandPanel:function(c){
    	var pivotObj =  JdaPivotApp.getApplication().getPivotController().getPivotWrapper().getPivot();
		var collapseText = pivotObj.getLocaleString('BusinessGraph.Build.AccordionPanel.TT.Collapse');
		collapseText && $(this.getEl().dom).find('.x-tool.x-box-item.x-tool-default').attr('data-qtip',collapseText);
    },
    collapsePanel:function(c){
    	var pivotObj =  JdaPivotApp.getApplication().getPivotController().getPivotWrapper().getPivot();
		var expandText = pivotObj.getLocaleString('BusinessGraph.Build.AccordionPanel.TT.Expand');
		expandText && $(this.getEl().dom).find('.x-tool.x-box-item.x-tool-default').attr('data-qtip',expandText);
    },*/
});