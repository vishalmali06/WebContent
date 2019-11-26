//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.view.datafilter.DataFilterDomainsPanel', {
	extend : 'Ext.panel.Panel',
	alias  : 'widget.datafilterdomainspanel',
	itemId : 'datafilterdomainspanel',
	config: {
		levelInfos: null,
	},
	padding:'10 0 0 0',
	initComponent: function() {
		var me = this;
		
		var pivotController = JdaPivotApp.getApplication().getPivotController();
		var pivotObj = pivotController.getPivotWrapper().getPivot();
		me.pivotObj = pivotObj;
		
		var cube = pivotObj._getCubeDefinition();
		
		var dataFilterDomainsStore = Ext.StoreMgr.lookup('dataFilterDomainsStore');
		dataFilterDomainsStore.removeAll();
		
		var dataFitlerConfig = pivotObj.getDataFilterConfig();
		var blackListFacets = dataFitlerConfig && dataFitlerConfig.options && dataFitlerConfig.options.blackListFacets; 
		
		var selectedLevels = [];
		me.dimWithInvldLevel = [];
		if(me.levelInfos && cube && cube.availableFacets){
			var facets = cube.availableFacets;
			for(var j = 0; j < me.levelInfos.length; j++ ){
				var levelInfo = me.levelInfos[j];
				outerloop : for (var i = 0; i < facets.length; i++) {
					var facetInfo = facets[i];
					var existingLevelName = me.getLevelNameFromId(levelInfo.levelId,facetInfo.availableLevels) ;
					if(levelInfo.dimensionName ==  facetInfo.name && !(blackListFacets && blackListFacets.includes(facetInfo.name)) ){
						for(var x = 0; x < facetInfo.availableLevels.length; x++){
							var levelName = facetInfo.availableLevels[x].attributeName;
							if(existingLevelName == levelName){
						        selectedLevels.push({
						        	dimensionName : facetInfo.name,
						        	dimensionDisplayName : facetInfo.UIAttributes.displayName,
						        	levelId : facetInfo.availableLevels[x].attributeId,
						        	levelDisplayName : levelName,
						        	groupByLevel : facetInfo.availableLevels[x].groupByLevel
								});
						        break outerloop;
							}
					  	}
						if(x == facetInfo.availableLevels.length){//Level not found
                            me.dimWithInvldLevel.push({
                                dimension : facetInfo.UIAttributes.displayName,
                                level : existingLevelName
                            });
					        selectedLevels.push({
					        	dimensionName : facetInfo.name,
					        	dimensionDisplayName : facetInfo.UIAttributes.displayName,
					        	levelId : levelInfo.levelId,
					        	levelDisplayName : existingLevelName
							});
						}
					}
				}	
			}
		}
		dataFilterDomainsStore.loadData(selectedLevels, false);
		
		
		var availbleFacets= [];
		if(cube && cube.availableFacets){
			var facets = cube.availableFacets;
			for (var i = 0; i < facets.length; i++) {
				var facetInfo = facets[i];
				//Not Adding Scenario as facet
				if(facetInfo.name ==  cube.scenariosDimensionKey){
					continue;
				}
				if(facetInfo && !facetInfo.dummy && !(blackListFacets && blackListFacets.includes(facetInfo.name) )){
					availbleFacets.push({
						id : facetInfo.id,
						name : facetInfo.name,
						displayName : facetInfo.UIAttributes.displayName,
					});
				}
			}
		}
		
		
		var dataFilterDomainDimensionsStore = Ext.StoreMgr.lookup('dataFilterDomainDimensionsStore');
		dataFilterDomainDimensionsStore.removeAll();
		dataFilterDomainDimensionsStore.loadData(availbleFacets, false);
		var msgStrArr = [];
		if(me.dimWithInvldLevel.length > 0){
            Ext.each(me.dimWithInvldLevel,function(val){
                msgStrArr.push(pivotObj.getLocaleString('DataFilter.Domain.InvalidLevelInDimension',val.dimension,val.level));
            });
		}
		me.items =  [
			{
				xtype: 'panel',
				width: '100%',
				itemId:'levelsErrMsgPanel',
				hidden:me.dimWithInvldLevel.length == 0,
				layout: {
					type: 'hbox',
		            align: 'stretch',
		            pack: 'start'
				},
				border: false,
//					style: 'border-style: solid; border-width: 1px; border-color: #D68001;',
				bodyStyle: 'background-color: #D68001; color: #FFFFFF;',
				margin: 2,
				padding: '0 0 0 0',
				bodyPadding: '0 0 0 0',
				items:[{
		           xtype: 'displayfield',
		           fieldStyle:'overflow: initial;',
		           value : msgStrArr.join(","),
		           padding: '2 0 2 5',
		           flex:1,
		           fieldCls: 'ellipsis'
				}]
		    },{
				xtype: 'panel',
				width: '100%',
				itemId:'domainLevelsErrMsgPanel',
				hidden:true,
				layout: {
					type: 'hbox',
		            align: 'stretch',
		            pack: 'start'
				},
				border: false,
				bodyStyle: 'background-color: #D68001; color: #FFFFFF;',
				margin: 2,
				padding: '0 0 0 0',
				bodyPadding: '0 0 0 0',
				items:[{
		           xtype: 'displayfield',
		           fieldStyle:'overflow: initial;',
		           value : "",
		           padding: '2 0 2 5',
		           flex:1,
		           fieldCls: 'ellipsis'
				}]
		    },
			{
			xtype: 'gridpanel',
			itemId: 'dataFilterDomainLevelsGrid',
			store: 'dataFilterDomainsStore',
			selModel: Ext.create('Ext.selection.CheckboxModel', {
            }),
			autoScroll: true,
			height: 150,
			header: {
				xtype: 'header',
				titlePosition: 2,
				padding: "5 5 5 0",
				items: [{
					xtype: 'button',
					margin: "0 8 0 0",
					text: pivotObj.getLocaleString('DataFilter.Button.AddLevel'),
		        	ui : 'j-primary-button',
		        	itemId: "addDomainLevelBtn",
			  },{
					xtype: 'button',
					text: pivotObj.getLocaleString('DataFilter.Button.Delete'),
					itemId: "deleteDomainLevelBtn",
					ui : 'j-standard-button',
					disabled:true,
			  }]
			},
			plugins: [
				Ext.create('Ext.grid.plugin.CellEditing', {
					clicksToEdit : 1
				})
			],
			columns: [
				{	
					header: pivotObj.getLocaleString('DataFilter.Config.Domain.Title.DimensionName'),
					flex: 1,
					dataIndex: 'dimensionDisplayName',
					autoSizeColumn: true,
				 	editor: {
						xtype: 'combobox',
		                store:  'dataFilterDomainDimensionsStore',
		                name: 'exprDimension',
		                itemId: 'exprDimension',
		                editable: true,
		                queryMode: 'local',
		                typeAhead: true,
		                forceSelection: true,
		                emptyText : pivotObj.getLocaleString('DataFilter.Config.Domain.SelectDimension'),
		                disabledCls: 'ext-disabled-field',
		                displayField: 'displayName',
		                valueField: 'name',
		                viewModel: {},
		                bind: {
		                    emptyText: '{emptyText}'
		                },
		                listeners : {
							"expand" : function(comp) {
								if (comp.lastSelectedDimension != null && comp.lastSelectedDimension != "") {
									comp.select(comp.lastSelectedDimension);
									comp.expand();
								}
								return true;
							}
						}
					},
					renderer: function (value, metaData, record, rowIndex, colIndex, store, view) {
						  metaData.tdStyle = 'background-color: #ffedd8; color: #000000';
						  if (value == null || value == "") {
							  return pivotObj.getLocaleString('DataFilter.Config.Domain.SelectDimension');
						  }
						  return value;
					}
				},
				{
					header: pivotObj.getLocaleString('DataFilter.Config.Domain.Title.HierarchyLevel'),
					flex: 1,
					dataIndex: 'levelDisplayName',
					autoSizeColumn: true,
					editor: {
						xtype: 'combobox',
		                store: 'dataFilterDomainLevelsStore',
		                name: 'exprDomainLevel',
		                itemId: 'exprDomainLevel',
		                editable: true,
		                queryMode: 'local',
		                typeAhead: true,
		                forceSelection: true,
		                emptyText : pivotObj.getLocaleString('DataFilter.Config.Domain.SelectLevel'),
		                disabledCls: 'ext-disabled-field',
		                displayField: 'levelName',
		                valueField: 'levelId',
		                viewModel: {},
		                bind: {
		                    emptyText: '{emptyText}'
		                },
		                listeners : {
							"expand" : function(comp) {
								if(comp.lastSelectedLevelId != null && comp.lastSelectedLevelId != "") {
									comp.select(comp.lastSelectedLevelId);
									comp.expand();
								}
								return true;
							}
						}
					},
					renderer: function (value, metaData, record, rowIndex, colIndex, store, view) {
						metaData.tdStyle = 'background-color: #ffedd8; color: #000000';
						if(value == null || value == "") {
							return pivotObj.getLocaleString('DataFilter.Config.Domain.SelectLevel');
						}
						return value;
					}
				}
			],
			listeners: {
				render:function(grid){
					me.enableOrDisableSaveButton();
				}
			},
		}];
		
	    this.callParent(arguments);
	},
	getLevelNameFromId : function(levelId,availableLevels){
		for(var ind=0; ind < availableLevels.length; ind++){
			if(levelId==availableLevels[ind].attributeId){
				return availableLevels[ind].attributeName;
			}
		}
		return levelId.substr(levelId.lastIndexOf("@")+1);
		
			
	},
	 enableOrDisableSaveButton : function(){
		 if( this.dimWithInvldLevel &&  this.dimWithInvldLevel.length > 0){
			 this.up("#datafilterconfigwindow").down("#datafiltersavebtn").disable();
			 this.up("#datafilterconfigwindow").down("#datafiltersaveasbtn").disable();
			 
		 }else{
			 this.up("#datafilterconfigwindow").down("#datafiltersavebtn").enable();
			 this.up("#datafilterconfigwindow").down("#datafiltersaveasbtn").enable();
		 }
	 }
});