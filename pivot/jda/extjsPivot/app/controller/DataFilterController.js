//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.controller.DataFilterController',
	{
		extend : 'Ext.app.Controller',
		id : 'datafiltercontroller',
		requires : ['JdaPivotApp.view.datafilter.DataFilterConfigWindow'],
		models : [ 'datafilter.DataFilters','datafilter.DataFilterMeasures','datafilter.DataFilterTargetMeasures','datafilter.DataFilterTypes','datafilter.DataFilterDomains','datafilter.DataFilterDomainDimensions','datafilter.DataFilterDomainLevels'],
		stores : [ 'datafilter.DataFilters','datafilter.DataFilterMeasures','datafilter.DataFilterTargetMeasures','datafilter.DataFilterTypes','datafilter.DataFilterDomains','datafilter.DataFilterDomainDimensions','datafilter.DataFilterDomainLevels', 'datafilter.DataFilterDurations'],
		refs : [ 
			{
				ref : 'dataFiltersDisplayPanel',
				selector : '#datafiltersdisplaypanel'
			},{
				ref : 'dataFiltersGrid',
				selector : '#dataFiltersGrid'
			},{
				ref : 'dataFilterConfigWindow',
				selector : '#datafilterconfigwindow'
			},{
				ref : 'buildDataFilterPanel',
				selector : '#builddatafilterpanel'
			},{
				ref : 'dataFilterInfoPanel',
				selector : '#datafilterinfopanel'
			},{
				ref : 'dataFilterExpressionPanel',
				selector : '#datafilterexpressionpanel'
			},{
				ref : 'dataFilterDomainsPanel',
				selector : '#datafilterdomainspanel'
			},{
				ref : 'dataFilterFormatCellPanel',
				selector : '#datafilterformatcellpanel'
			},{
				ref : 'saveAsNameDialog',
				selector : '#saveasnamedialog'
			},{
				ref : 'deleteConfirmDialog',
				selector : '#deleteconfirmdialog'
			},{
				ref : 'dataFilterDomainLevelsGrid',
				selector : '#datafilterconfigwindow #datafilterdomainspanel #dataFilterDomainLevelsGrid'
			},{
				ref : 'expressionMeasuresGrid',
				selector :  '#datafilterexpressionpanel #expressionMeasuresGrid'
			},{
				ref : 'targetMeasureCombo',
				selector :  '#datafilterformatcellpanel #targetMeasureCombo'
			}
		],
		init : function() {
			var me = this;
			me.isConfigWidnowOpen = false;
			 this.control({
				'#adddatafilterbtn' : {
					click : function() {
						me.showAddDataFilterConfigWindow();
					}
				},
				'#deletedatafilterbtn' : {
					click : function() {
						me.showDeleteDataFilterDialog();
					}
				},
				'#evaluatedatafilterbtn' : {
					click : function() {
						me.evaluateDataFilters();
					}
				},
				'#datafiltersavebtn' :{
					click : function() {
						me.saveDataFilterConfig(this.self.SAVE_DATA_FILTER_CONFIG);
					}
				},
				'#datafiltersaveasbtn': {
					click : function() {
						me.showDataFilterNameDialog(false);
					}
				},
				'#datafiltercancelbtn' :{
					click : function() {
						me.closeDataFilterConfigWindow();
					}
				},
				'#dataFiltersGrid dataview' : {
					drop : me.dropDataFilterRow
				},
				'#dataFiltersGrid': {
					cellclick :  me.dataFilterGridCellClick
	            },
				'#dataFiltersGrid #headerFilter': {
					checkchange :  function(columnRecord, rowIndex, isChecked, iRecord) {
						me.applyDataFilter(iRecord.get("id"), isChecked);
					}
	            },
	            '#dataFiltersGrid #headerFormatCell': {
					checkchange :  function(columnRecord, rowIndex, isChecked, iRecord) {
						me.applyCFRules(iRecord.get("id"), isChecked);
					}
	            },
	            '#dataFiltersGrid #headerFormatAncestors': {
	            	beforecheckchange :  function() {
	            		//for now we are not supporting this operation 
	            		return false;
					}
	            },
	            '#dataFiltersGrid #headerFormatDescendants': {
	            	beforecheckchange :  function() {
	            		//for now we are not supporting this operation
	            		return false;
					}
	            },
	            dataFilterDomainLevelsGrid: {
					beforeEdit: me.dataFilterDomainLevelsGridBeforeEdit,
					edit: me.dataFilterDomainLevelsGridAfterEdit,
					select : me.enableOrDisableDeleteButton,
                	deselect : me.enableOrDisableDeleteButton,
	            },
	            '#dataFilterDomainLevelsGrid #addDomainLevelBtn':{
	            	click : function(){
						me.getDataFilterDomainLevelsGrid().getStore().add({
							dimensionName:  ''
						});
	            	}
	            },
	            '#dataFilterDomainLevelsGrid #deleteDomainLevelBtn':{
	            	click : me.deleteDomainLevels
	            },
	            '#datafilterformatcellpanel #targetMeasureCombo boundlist' : {
	            	beforeitemclick:function(combo, record, item, index, e, eOpts){
 						if($(e.target).hasClass("x-tool-img")){
 							if(record.data.expanded){
 								this.collapseExpandedMeasure(record,combo.getStore());
 							}else{
 								this.exapandMeasure(record,combo.getStore());
 							}
 							return false;
 						}
 					}
	            },
	            expressionMeasuresGrid :{
	            	cellclick : function(grid, td, cellIndex, record, tr, rowIndex, e, eOpts){
	            		if($(e.target).hasClass("x-tool-img")){
 							if(record.data.expanded){
 								this.collapseExpandedMeasure(record,grid.getStore());
 							}else{
 								this.exapandMeasure(record,grid.getStore());
 							}
 							return false;
 						}
	            	}
	            },
	            '#datafilterconfigwindow #showFilterdMeasureCheck' : {
	            	change: function( checkbox, newValue, oldValue, eOpts){
	            		//attach this value to grid to be used by expand plugin	
	            		
	            		this.toggleFilter(this.getExpressionMeasuresGrid().getStore());
	            		this.toggleFilter(this.getTargetMeasureCombo().getStore(0));
	            	}
	            }
			 });
		},
		getPivotController : function(){
			return JdaPivotApp.getApplication().getPivotController()
		},
		
		enableOrDisableDataFilterPanel : function(){
			var pivotObj = this.getPivotController().getPivotWrapper().getPivot();
			var cube = pivotObj._getCubeDefinition();
            if(cube.availableScenarios && cube.availableScenarios.length > 1){
                this.getPivotController().getFiltersCard().disable();
                this.getPivotController().getFiltersbtn().disable();
            }else{
                this.getPivotController().getFiltersCard().enable();
                this.getPivotController().getFiltersbtn().enable();
            }
		},
		showAddDataFilterConfigWindow : function(cellContextInfo){
			var filtersConfigWin = Ext.widget('datafilterconfigwindow', {cellContextInfo : cellContextInfo,
				userAccessPermissions : this.getDataFiltersDisplayPanel().config.userAccessPermissions,
				viewFilterPermissions : this.getDataFiltersDisplayPanel().config.viewFilterPermissions,
				});
			filtersConfigWin.setTitle(this.getPivotController().getLocaleString('DataFilter.Config.AddFilter'));
			filtersConfigWin.show();
		},
		showDeleteDataFilterDialog : function(){
	    	var selectedFilters=this.getDataFiltersGrid().getView().getSelectionModel().getSelection();
	    	if(selectedFilters && selectedFilters.length > 0){
	    		var filterIds=[];
		    	var filterNames = [];
		    	Ext.each(selectedFilters, function (item) {
		    		if(item && item.data){
		    			filterIds.push(item.data.id);
			    		filterNames.push("</br>"+item.data.name);
		    		}
		    	});
		    	var deleteconfirmdialog = Ext.widget('deleteconfirmdialog', {
		    			scope : this,
		    			filterIds:filterIds,
		    			displayMessage:this.getPivotController().getLocaleString('DataFilter.DeleteConfirmMsg',filterNames),
		    			okCallbackFn : this.deleteDataFilters,
		    			cancelCallbackFn : this.closeDeleteConfirmDialog
		    	});
		    	deleteconfirmdialog.setTitle(this.getPivotController().getLocaleString('DataFilter.DeleteConfirmDialog.Title'));
		    	deleteconfirmdialog.show();
	    	}
		},
		deleteDataFilters : function(filterIds){
	    	var params = {};
	    	params.operation = this.self.DELETE_DATA_FILTERS;
	    	params.filterIds = filterIds;
	    	this.sendDataFilterRequest(params);
		},
		closeDeleteConfirmDialog : function(){
			this.getDeleteConfirmDialog().close();
		},
		showDataFilterNameDialog : function(skipValidation){
			var filterNameObj = this.getDataFilterInfoPanel().down('#name');
			var data = {};
	    	if(skipValidation || (this.validateDataFilterConfigWindow(filterNameObj, data, this.self.SAVEAS_DATA_FILTER_CONFIG) && this.validateExpression(data.expression))){
	    		var saveasnamedialog = Ext.widget('saveasnamedialog', {
	    			previousName : filterNameObj.getValue(),
	    			scope : this,
	    			saveAs : this.self.SAVEAS_DATA_FILTER_CONFIG,
	    			nameFieldLabel : this.getPivotController().getLocaleString('DataFilter.Config.Name'),
	    			saveCallbackFn : this.saveDataFilterConfig,
	    			cancelCallbackFn : this.closeSaveAsNameDialog,
	    		});
	    		saveasnamedialog.setTitle(this.getPivotController().getLocaleString('DataFilter.Button.SaveAs'));
	    		saveasnamedialog.show();
	    	}
		},
		closeSaveAsNameDialog : function(){
			this.getSaveAsNameDialog().close();
		},
		evaluateDataFilters : function(){
			var params = {};
	    	params.operation = this.self.EVALUATE_DATA_FILTERS;
	    	this.sendDataFilterRequest(params);
		},
		saveDataFilterConfig: function(operation) {
			var isValidRequest = true;
			var data = {};
			// config window basic information 
			var dataFilterInfoPanel = this.getDataFilterInfoPanel();
			var filterNameObj = (operation === this.self.SAVEAS_DATA_FILTER_CONFIG) ? this.getSaveAsNameDialog().down('#name'):dataFilterInfoPanel.down('[itemId=name]'); 
			isValidRequest = this.validateDataFilterConfigWindow(filterNameObj, data, operation);
			
	    	//Need to call re-evaluate related stuff when click on 'Save' of existing filter on update.
	        if(isValidRequest && data.id){
	        	var dataFiltersStore = Ext.StoreMgr.lookup('dataFiltersStore');
	          	var selectedFilterRec = dataFiltersStore.findRecord("id", data.id,0,false, true, true);
	        	if(selectedFilterRec && selectedFilterRec.data && (selectedFilterRec.data.activate || selectedFilterRec.data.formatCellActivate)){
	        		var existingFilterConfig = this.getDataFilterConfigWindow().getFilterConfig();
	        		var isModified = this.isDataFilterConfigModified(existingFilterConfig, data);
	        		if(isModified && selectedFilterRec.data.activate){
	        			data.activate = true;
	        		}
	        		if(selectedFilterRec.data.formatCellActivate){
	        			if(isModified){
	        				data.formatCellActivate = true;
	        			}else{
	        				data.formatCellActivate = this.isCFFilterConfigModified(existingFilterConfig, data);
	        			}
	        		}
	        	}
        	}
        	
	        if(isValidRequest){
	        	data.operation = operation;
	    		this.sendDataFilterRequest(data);
	    	}
		},
		validateDataFilterConfigWindow : function(filterNameObj, data, operation){
			
			var isValidRequest = true;
			if(!this.validateFilterName(filterNameObj)){
				isValidRequest = false;
			}else{
				//Basic information
		        data.name = filterNameObj.getValue();
		        if(operation !== this.self.SAVEAS_DATA_FILTER_CONFIG){
		    		if(filterNameObj.getId().indexOf("textfield") === -1){
		    			data.id=filterNameObj.getId();
		    		}
		    	}
				var expressionEditorObj = this.getDataFilterExpressionPanel().down('[itemId=expressionEditor]');
				var expression = expressionEditorObj.getValue();
				if(expression == null || expression.trim().length  == 0){
		        	isValidRequest = false;
					var expressionEditorObj = this.getDataFilterExpressionPanel().down('[itemId=expressionEditor]');
		        	this.getPivotController().showFieldError(expressionEditorObj, this.getPivotController().getLocaleString('DataFilter.Config.Validation.Expression.Required'));
		        	expressionEditorObj.focus();
				}else{
					//Expression information
			        data.expression = expression;
			        
			        var dataFilterInfoPanel = this.getDataFilterInfoPanel();
					var durationComboObj = dataFilterInfoPanel.down('[itemId=durationCombo]');
					if(durationComboObj){
			        	data.duration = durationComboObj.getValue();
			        }
					
					var typeComboObj = dataFilterInfoPanel.down('[itemId=typeCombo]');
					data.type = typeComboObj.getValue();
					
					var descriptionObj = dataFilterInfoPanel.down('[itemId=description]');
					data.description = descriptionObj.getValue();
			        
			        //Level information
			        isValidRequest = this.checkDomainLevels(data, isValidRequest);
					
			        var dataFilterFormatCellPanel = this.getDataFilterFormatCellPanel();
			        
			        //format cell information. View filter don't have CF.
					if(dataFilterFormatCellPanel.down('#formatCell').checked && data.type != _pns.Constants.dataFilterTypes.ViewFilter){
				    	var targetMeasureComboObj = dataFilterFormatCellPanel.down('#targetMeasureCombo');
				    	if(targetMeasureComboObj.getValue() == null || targetMeasureComboObj.getValue().trim().length  == 0){
				        	isValidRequest = false;
				        	this.getPivotController().showFieldError(targetMeasureComboObj, this.getPivotController().getLocaleString('DataFilter.Config.Validation.FormatCell.TargetMeasure.Required'));
				        	targetMeasureComboObj.focus();
						}else{
							data.targetMeasureId = targetMeasureComboObj.getValue();
							var bgcolor = dataFilterFormatCellPanel.down('#bgcolor');
					    	if(bgcolor.getValue() == null || bgcolor.getValue().trim().length  == 0){
					        	isValidRequest = false;
					        	this.getPivotController().showFieldError(bgcolor, this.getPivotController().getLocaleString('DataFilter.Config.Validation.FormatCell.BackgroundColor.Required'));
					        	bgcolor.focus();
							}else{
								data.cellBgColor = bgcolor.getRGB();
								var fontcolor = dataFilterFormatCellPanel.down('#fontcolor');
						    	if(fontcolor.getValue() == null || fontcolor.getValue().trim().length  == 0){
						        	isValidRequest = false;
						        	this.getPivotController().showFieldError(fontcolor, this.getPivotController().getLocaleString('DataFilter.Config.Validation.FormatCell.FontColor.Required'));
						        	fontcolor.focus();
								}else{
									data.cellFontColor = fontcolor.getRGB();
								}
							}
						}
				    	if(isValidRequest){
				    		data.formatAncestors = dataFilterFormatCellPanel.down('#formatAncestors').checked;
					    	data.formatDescendants = dataFilterFormatCellPanel.down('#formatDescendants').checked;
				    	}
					}
				}
			}
	        return isValidRequest;
		},
		validateFilterName : function(fitlerNameObj){
			var resourceKey = null;
			if(fitlerNameObj){
				var pivotObj = this.getPivotController().getPivotWrapper().getPivot();
				var dataFitlerConfig =pivotObj && pivotObj.getDataFilterConfig();
				var filterName = fitlerNameObj.getValue();
				var filterNameMaxLenght = 255;
				if(dataFitlerConfig && dataFitlerConfig.options && dataFitlerConfig.options.filterNameMaxLength){
					filterNameMaxLenght = dataFitlerConfig.options.filterNameMaxLength;
				}
				if(filterName.trim().length === 0){
					resourceKey = 'DataFilter.Config.Validation.FilterName.Required';
				}else if(filterName.length > filterNameMaxLenght){
					resourceKey = 'DataFilter.Config.Validation.FilterName.LengthExceed';
				}else if(dataFitlerConfig.validators.checkInvalidCharacters === undefined){
					var temp = filterName;
					if((filterName.replace(/#|@|\$|%|\^|&|~|<|>/g,'*') !== temp))
					{
						resourceKey = 'DataFilter.Config.Validation.FilterName.InvalidCharacter';
					}
				} else if(!dataFitlerConfig.validators.checkInvalidCharacters(filterName)){
					resourceKey = 'DataFilter.Config.Validation.FilterName.InvalidCharacter';
				}
				
				if(resourceKey == null){
					return true;
				}else{
					this.getPivotController().showFieldError(fitlerNameObj, this.getPivotController().getLocaleString(resourceKey));
					fitlerNameObj.focus();
					return false;
				}
			}
		},
		closeDataFilterConfigWindow : function(){
			this.isConfigWidnowOpen = false;
			this.getDataFilterConfigWindow().close();
		},
		checkDomainLevels : function(data, isValidRequest){
			var levelInfos = [];
	        var dimensionLevels = {};
	        var dimensionGroupByLevel = {};
	        var domainLevelsStore = this.getDataFilterDomainLevelsGrid().getStore();
	        var errorMessage = this.getPivotController().getLocaleString('DataFilter.Config.Validation.Domain.Required');
	        if(domainLevelsStore.data.length > 0){
				for(var i=0;i<domainLevelsStore.data.length;i++){
					var domainData = domainLevelsStore.getAt(i).data;
					var dimensionName = domainData.dimensionName;
					var levelId = domainData.levelId;
					if(dimensionName){
						if(levelId){
							errorMessage = "";
							//we can add only one hierarchy level AND/OR multiple attributes 
							if(!domainData.groupByLevel && dimensionLevels[domainData.dimensionName] === true){
								//If it's second hierarchy level will come inside this condition
								errorMessage = this.getPivotController().getLocaleString('DataFilter.Config.Validation.Domain.SingleLevelInDimension',domainData.dimensionDisplayName);
								break;
							}else if(dimensionGroupByLevel[domainData.dimensionName] && dimensionGroupByLevel[domainData.dimensionName].includes(domainData.levelId)){
								//if it's a duplicate attribute then displaying error message
								errorMessage = this.getPivotController().getLocaleString('DataFilter.Config.Validation.Domain.DuplicateAttInDimension',domainData.dimensionDisplayName);
								break;
							}
							levelInfos.push(domainData.dimensionName +'~' +  domainData.levelId);
							!domainData.groupByLevel && (dimensionLevels[domainData.dimensionName] = !domainData.groupByLevel);
							!dimensionGroupByLevel[domainData.dimensionName] && (dimensionGroupByLevel[domainData.dimensionName] = []);
							dimensionGroupByLevel[domainData.dimensionName].push(domainData.levelId);
						}else{
							errorMessage = this.getPivotController().getLocaleString('DataFilter.Config.Validation.Domain.Required');
							break;
						}
					}
				}
			}
	        if(errorMessage){
				var domainLevelsErrMsgPanel = this.getDataFilterDomainLevelsGrid().up('panel').down('[itemId=domainLevelsErrMsgPanel]');
				domainLevelsErrMsgPanel && domainLevelsErrMsgPanel.show();
				var element = domainLevelsErrMsgPanel.down('[xtype=displayfield]');
				element && element.setValue(errorMessage);
				isValidRequest = false;
			}
	        data.levelInfos = levelInfos;
	        return isValidRequest;
		},
		isDataFilterConfigModified : function(existingFilterConfig, updatedFilterConfig){
			var isFilterConfigModified = false;
			//Setting data filter flag true on change of duration/expression/levelInfos
			if(existingFilterConfig.duration != updatedFilterConfig.duration ||
			   existingFilterConfig.expression != updatedFilterConfig.expression ||
			   existingFilterConfig.levelInfos.length != updatedFilterConfig.levelInfos.length
			  ){
				isFilterConfigModified = true;
			}else{
				var existingLevelInfos = [];
				existingFilterConfig.levelInfos.forEach(function(domainData) {
					existingLevelInfos.push(domainData.dimensionName +'~' +  domainData.levelId);
				});
				if(!(_.isEqual(existingLevelInfos, updatedFilterConfig.levelInfos))){
					isFilterConfigModified = true;
				}
			}
			return isFilterConfigModified;
		},
		isCFFilterConfigModified : function(existingFilterConfig, updatedFilterConfig){
			var isFilterConfigModified = false;
			if(existingFilterConfig.formatCell.targetMeasureId != updatedFilterConfig.targetMeasureId ||
			   existingFilterConfig.formatCell.formatAncestors != updatedFilterConfig.formatAncestors ||
			   existingFilterConfig.formatCell.formatDescendants != updatedFilterConfig.formatDescendants){
				isFilterConfigModified = true;
			}
			return isFilterConfigModified;
		},

		getAllDataFilters: function(){
			var pivotObj = this.getPivotController().getPivotWrapper().getPivot();
			var cube = pivotObj._getCubeDefinition();
			if(!(cube && cube.availableScenarios && cube.availableScenarios.length > 1 )){
				var params = {
						operation : this.self.GET_ALL_DATA_FILTERS
				};
				this.sendDataFilterRequest(params);	 
			}
		},
		validateExpression : function(expresionValue){
			var params = {
					operation : this.self.VALIDATE_EXPRESSION
				};
			params.expression = expresionValue;
			this.sendDataFilterRequest(params);
		},
		applyDataFilter : function(id, isChecked){
			var params = {};
	    	params.operation = this.self.APPLY_DATA_FILTERS;
	    	params.id = id;
	    	params.activate = isChecked;
	    	this.sendDataFilterRequest(params);
		},
		applyCFRules : function(id, isChecked, selectAllFilterIds){
			var params = {};
			params.operation = this.self.APPLY_CF_RULES;
	    	//params.activate = isChecked;
			params.formatCellActivate = isChecked;
	    	params.id = id;
	    	var filterIds = [];
			if(isChecked){
				var dataFiltersStore = Ext.StoreMgr.lookup('dataFiltersStore');
    			for(var i = 0; i < dataFiltersStore.data.items.length; i++){
    				if(dataFiltersStore.data.items[i].data.formatCellActivate){
    					filterIds.push(dataFiltersStore.data.items[i].data.id);
    				}
    			}
			}else{
				if(selectAllFilterIds){
					filterIds = selectAllFilterIds;
				}else{
					filterIds.push(id);
				}
			}
			params.filterIds = filterIds;
	    	this.sendDataFilterRequest(params);
		},
		dropDataFilterRow : function(node, data, overModel, dropPosition, opts) {
            var selectedRec = data.event.record;
            if(data.event.record.disabled){
                var selectedRowIndex = data.event.recordIndex;
                var droppedRowIndex = data.event.position.rowIdx;
                var dataFiltersStore = this.getDataFiltersGrid().getStore();
                if(selectedRowIndex > droppedRowIndex && dropPosition === "after"){
                    dataFiltersStore.insert(droppedRowIndex+1,selectedRec);
                }else if(selectedRowIndex < droppedRowIndex && dropPosition === "before"){
                    dataFiltersStore.removeAt(selectedRowIndex);
                    dataFiltersStore.insert(droppedRowIndex - 1,selectedRec);
                }else{
                    dataFiltersStore.removeAt(selectedRowIndex);
                    dataFiltersStore.insert(droppedRowIndex,selectedRec);
                }
            }
            selectedRec.data.formatCellActivate && this.applyCFRules(selectedRec.id, true, true);
        },
		dataFilterGridCellClick:function(iView, iCellEl, iColIdx, iRecord, iRowEl, iRowIdx, iEvent) {
			if (iColIdx == 1) {
				var selFilterId = iRecord.get("id");
				if(selFilterId){
					var params = {
							operation : this.self.GET_DATA_FILTER_BY_ID,
							id : selFilterId,
					};
					if(!this.isConfigWidnowOpen){
						this.sendDataFilterRequest(params);
						this.isConfigWidnowOpen = true;
					}
				}
			}
		},
		dataFilterDomainLevelsGridBeforeEdit:function(editor, e, options) {
			var pivotObj = this.getPivotController().getPivotWrapper().getPivot();
			e.grid.getStore().sorters.clear();
	        var field = e.field;
	        var combo = e.grid.columns[e.colIdx-1].getEditor(e.record);
	        var store = combo.getStore();
	        if(field == "dimensionDisplayName") {
	        	var dimensionName = e.record.get("dimensionName");
	        	var selectedDimensionRec = null;;
	        	Ext.each(store.getData().getSource().items, function (item) {
	                if(item && item.data && item.data.name == dimensionName){
	                	selectedDimensionRec = item;
	                }
	            });
	        	var vm = combo.getViewModel();
	            if(dimensionName != null && dimensionName != "" && selectedDimensionRec) {
	                vm.set('emptyText', selectedDimensionRec.get("displayName"));
	                combo.lastSelectedDimension = dimensionName;
	                combo.setValue(dimensionName);
	                combo.select(dimensionName);
	            } else {
	            	vm.set('emptyText', pivotObj.getLocaleString('DataFilter.Config.Domain.SelectDimension'));
	            	combo.lastSelectedDimension = null;
	                combo.reset();
	            }
	        } else if(field == "levelDisplayName"){
	        	var vm = combo.getViewModel();
	        	if(e.record.data.dimensionName){
	        		var levelId = e.record.get("levelId");
	    			var dataFilterDomainLevelsStore = Ext.StoreMgr.lookup('dataFilterDomainLevelsStore');
	    			dataFilterDomainLevelsStore.removeAll();
	            	var dimensionLevels = this.getLevelsByDimensionName(e.record.data.dimensionName);
	            	dataFilterDomainLevelsStore.loadData(dimensionLevels, false);
	            	if(levelId != null && levelId != "") {
	                    vm.set('emptyText', e.record.get("levelDisplayName"));
	                    combo.lastSelectedLevelId = levelId;
	                    combo.lastSelLevelDisplayName = e.record.get("levelDisplayName");
	                    combo.setValue(levelId);
	                    combo.select(levelId);
	                } else {
	                    vm.set('emptyText', pivotObj.getLocaleString('DataFilter.Config.Domain.SelectLevel'));
	                    combo.lastSelectedLevelId = null;
	                    combo.reset();
	                }
	        	}else{
	        		vm.set('emptyText', pivotObj.getLocaleString('DataFilter.Config.Domain.SelectLevel'));
	                combo.lastSelectedLevelId = null;
	                combo.reset();
	                store.clearData();
	                store.removeAll();
	        	}
	        }
		},

		getLevelsByDimensionName:function(dimensionName) {
			var pivotObj = this.getPivotController().getPivotWrapper().getPivot();
			var cube = pivotObj._getCubeDefinition();
			var dimensionLevels = [];
			var availableFacets = cube.availableFacets;
			for(var i = 0; i < availableFacets.length; i ++){
				var facetInfo = availableFacets[i];
				if(facetInfo.name ==  dimensionName){
					for(var x = 0; x < facetInfo.availableLevels.length; x++){
						dimensionLevels.push({
							dimensionName : facetInfo.name,
							levelId : facetInfo.availableLevels[x].attributeId,
							levelName : facetInfo.availableLevels[x].attributeName,
							groupByLevel : facetInfo.availableLevels[x].groupByLevel
						});
				  	}
				}
			}
			return dimensionLevels;
		 },
		dataFilterDomainLevelsGridAfterEdit : function(editor, e, options){
			var selectedEditor = e.grid.columns[e.colIdx-1].getEditor(e.record);
			var selectedDisplayVal = selectedEditor.getDisplayValue();
			var field = e.field;
			if(field == "dimensionDisplayName") {
				var dimensionName = null;
				var dimensionDisplayName = null;
				var dataFilterDomainDimensionsStore = Ext.StoreMgr.lookup('dataFilterDomainDimensionsStore');
				var selectedDimensionRec = dataFilterDomainDimensionsStore.findRecord("name", e.value,0,false, true, true);
				if(selectedDimensionRec){
					dimensionName = e.value;
					dimensionDisplayName = selectedDisplayVal;
				}else{
					dimensionName = selectedEditor.lastSelectedDimension;
					selectedDimensionRec = dataFilterDomainDimensionsStore.findRecord("name", dimensionName,0,false, true, true);
					dimensionDisplayName = selectedDimensionRec && selectedDimensionRec.data.displayName;
				}
				
				var prevSelectedDim = e.record.get('dimensionName');
				if(dimensionName != prevSelectedDim)
				{
					e.record.set("levelId", null);
					e.record.set("levelDisplayName", null);
				}
				e.record.set("dimensionName", dimensionName);
                e.record.set("dimensionDisplayName", dimensionDisplayName);
			} else if(field == "levelDisplayName") {
				var levelId = null;
				var levelName = null;
				var groupByLevel = null;
				var selectedLevelRec = selectedEditor.getStore().findRecord("levelId", e.value,0,false, true, true);
				if(selectedLevelRec){
					levelId = e.value;
					levelName = selectedLevelRec.data.levelName;
					groupByLevel = selectedLevelRec.data.groupByLevel;
				}else{
					levelId = selectedEditor.lastSelectedLevelId;
					selectedLevelRec = selectedEditor.getStore().findRecord("levelId", levelId,0,false, true, true);;
					levelName = selectedLevelRec && selectedLevelRec.data.levelName;
					groupByLevel = selectedLevelRec && selectedLevelRec.data.groupByLevel;
				}
				if(levelName == null && selectedEditor.lastSelLevelDisplayName){
					levelName = selectedEditor.lastSelLevelDisplayName;// Level is not in combo, set the old value for display purpose
				}else{
					var dataFilterDomainsPanel = this.getDataFilterDomainsPanel();
					if( dataFilterDomainsPanel.dimWithInvldLevel && dataFilterDomainsPanel.dimWithInvldLevel.length > 0){
						//Dimension with invalid level were cased delete if it is corrected
						for(var ind in dataFilterDomainsPanel.dimWithInvldLevel){
							var obj = dataFilterDomainsPanel.dimWithInvldLevel[ind];
							if(obj.dimension == e.record.get("dimensionDisplayName")){
								dataFilterDomainsPanel.dimWithInvldLevel.splice(ind, 1);
								break;
							}
						}
						dataFilterDomainsPanel.enableOrDisableSaveButton();//Check if save button can be enabled
					}
				}
				e.record.set("levelId", levelId);
				e.record.set("levelDisplayName", levelName);
				e.record.set("groupByLevel", groupByLevel);
			}
		},
		deleteDomainLevels : function(){
	        var selectedRecords = this.getDataFilterDomainLevelsGrid().getSelectionModel().getSelection();
	        var dataFilterDomainsPanel = this.getDataFilterDomainsPanel();
	        if (selectedRecords.length > 0) {
	        	var dataFilterDomainDimensionsStore = Ext.StoreMgr.lookup('dataFilterDomainDimensionsStore');
		        Ext.each(selectedRecords, function (selectedItem) {
		        	if( dataFilterDomainsPanel.dimWithInvldLevel && dataFilterDomainsPanel.dimWithInvldLevel.length > 0){
						//Dimension with invalid level were cashed, delete if it is corrected
						for(var ind in dataFilterDomainsPanel.dimWithInvldLevel){
							var obj = dataFilterDomainsPanel.dimWithInvldLevel[ind];
							if(obj.dimension == selectedItem.get("dimensionDisplayName")){
								dataFilterDomainsPanel.dimWithInvldLevel.splice(ind, 1);
								break;
							}
						}
					}
		    	});
		        this.getDataFilterDomainLevelsGrid().getStore().remove(selectedRecords);
		        dataFilterDomainsPanel.enableOrDisableSaveButton();//Check if save button can be enabled
	        }		
    	},
    	enableOrDisableDeleteButton : function(selectionModel, record){
    		var selectedFilters=selectionModel.getSelected();
    		var deleteHierarchyLevelBtn = this.getDataFilterDomainLevelsGrid().down('#deleteDomainLevelBtn');
	   	    if((selectedFilters && selectedFilters.length > 0)){
	   	    	deleteHierarchyLevelBtn.enable();
	   	    }else{
	   	    	deleteHierarchyLevelBtn.disable();
	   	    }
	   	 },
		sendDataFilterRequest: function(params) {
			var pivotObj = this.getPivotController().getPivotWrapper() && this.getPivotController().getPivotWrapper().getPivot();
			if(pivotObj && pivotObj.getDataFilterConfig() && pivotObj.getDataFilterConfig().options){
				pivotObj.getDataFilterConfig().options.executeAction(params);
			}else{
				pivotObj && pivotObj.executeDataFilter(params);
			}
		},
		displayAppliedDataFilters : function(dataFilters){
			var pivotObj = this.getPivotController().getPivotWrapper() && this.getPivotController().getPivotWrapper().getPivot();
			var appliedDataFilters = [];
			var privateFilters = [];
			var userAccessPermissions = this.getDataFiltersDisplayPanel().config.userAccessPermissions;
			var viewFilterPermissions = this.getDataFiltersDisplayPanel().config.viewFilterPermissions;
			var isEvalButtonEnabled = false;
			Ext.each(dataFilters, function (dataFilter) {
				if(dataFilter.activate){
					isEvalButtonEnabled = true;
					var filterName = dataFilter.name;
					filterName += (dataFilter.type  == _pns.Constants.dataFilterTypes.Public) ? (" (" + pivotObj.getLocaleString("DataFilter.Config.Type.P") + ") " ):"";
					var disableStatus = (dataFilter.type  == _pns.Constants.dataFilterTypes.Public ? (userAccessPermissions && !userAccessPermissions.canExecute) :
										 (dataFilter.type  == _pns.Constants.dataFilterTypes.ViewFilter ? (viewFilterPermissions && !viewFilterPermissions.canExecute) : false));
					
					var filterItem = {
	            		text: filterName,
	            		iconCls:'j-pvt-datafilter-removeFilter-img',
	            		id : dataFilter.id,
	            		margin:'0 0 0 10',
	            		disabled: disableStatus,
	            		handler: function(comp, item) {
	            			if(item.event.target.classList.contains("j-pvt-datafilter-removeFilter-img")){
	            				this.up('menu').remove(comp);
	            				var dataFilterController = JdaPivotApp.getApplication().getDataFilterController();
	            				dataFilterController.removeDataFilter(comp.id);
	            			}
	                    }
		            }
					appliedDataFilters.push(filterItem);
				}
				dataFilter.formatCellActivate && (isEvalButtonEnabled = true);
			});
			var appliedDataFiltersDiv = $("#appliedDataFiltersDiv");
            if(appliedDataFiltersDiv && appliedDataFiltersDiv.length){
                appliedDataFiltersDiv.empty();
                Ext.create('Ext.Button', {
                    renderTo: 'appliedDataFiltersDiv',
                    text : pivotObj && pivotObj.getLocaleString('DataFilter.Toolbar.AppliedFilters'),
                    tooltip : pivotObj && pivotObj.getLocaleString('DataFilter.Tooltip.AppliedFilters'),
                    disabled: (appliedDataFilters.length  < 1),
                    menu:{
                        plain:true,
                        items: appliedDataFilters
                    },
                }).show();
            }
            this.enableOrDisableEvaluateButton(isEvalButtonEnabled);
		},
		enableOrDisableEvaluateButton : function(isEvalButtonEnabled){
			var pivotObj = this.getPivotController().getPivotWrapper() && this.getPivotController().getPivotWrapper().getPivot();
			var evaluatedatafilterbtn = this.getDataFiltersDisplayPanel().down('#evaluatedatafilterbtn');
      	   	isEvalButtonEnabled ? evaluatedatafilterbtn.enable() : evaluatedatafilterbtn.disable();
      	   	
			if(pivotObj && pivotObj.getDataFilterConfig() && pivotObj.getDataFilterConfig().hooks && pivotObj.getDataFilterConfig().hooks.enableOrDisableEvaluateButton){
				pivotObj.getDataFilterConfig().hooks.enableOrDisableEvaluateButton(isEvalButtonEnabled);
			}
		},
		removeDataFilter : function(filterId){
    		this.applyDataFilter(filterId, false);
    		var dataFiltersStore = Ext.StoreMgr.lookup('dataFiltersStore');
    		var selectedFilterRec = dataFiltersStore.findRecord("id", filterId,0,false, true, true);
			if(selectedFilterRec){
				selectedFilterRec.data.activate = false;
				selectedFilterRec.commit();
			}
		},
		getAppliedDataFilters : function(){
			var dataFilters = [];
       		var dataFiltersStore = Ext.StoreMgr.lookup('dataFiltersStore');
       		Ext.each(dataFiltersStore.data.items, function (item) {
       			if(item.data.activate){
       				dataFilters.push(item.data);
       			}
			});
       		return dataFilters;
		},
		reloadPivot : function(keepExpand, addNewAxisChilds){
			var pivotObject = this.getPivotController().getPivotWrapper().getPivot();
				if(pivotObject.isDataAvailable){
					pivotObject._getExpandPivotRequest(null,false,true, addNewAxisChilds);
				}else{
					pivotObject.emptyPivotView();
					pivotObject.loadPivotData();
				}
		},
		handleResponse : function(response, request) {
			var pivotObject = this.getPivotController().getPivotWrapper().getPivot();
			if(request && request.params){
				var operation = request.params.operation;
				if(operation === this.self.SAVE_DATA_FILTER_CONFIG || operation === this.self.SAVEAS_DATA_FILTER_CONFIG){
					
					if(response.result && response.result.saveOrUpdateStatus) {
						//if save or update status is true means it saved successfully in to DB and memory
						if(operation === this.self.SAVEAS_DATA_FILTER_CONFIG){
							this.getSaveAsNameDialog().close();
			            }
						this.closeDataFilterConfigWindow();
						if(operation === this.self.SAVE_DATA_FILTER_CONFIG){
							if(response.result.dataFilters[0].activate){
								if(response.result.applyFiltersStatus){
									this.reloadPivot();
								}else{//Filter is already applied, modify the filter config, on Save, if no data is available, then below code will execute.
									this.displayDataNotAvailable(pivotObject, dataFilters);
								}
							}else if(response.result.applyFiltersStatus){
								pivotObject.refreshSegmentData();
							}
						}
						this.getAllDataFilters();
					}else{
						//if save or update status is false means it has some errors
						if(!response.result.dataFilterNameUnique){
							// if data filter name is not unique name then showing error on field.
							var datafilterinfopanel = this.getDataFilterInfoPanel();
							var filterNameObj = (operation === this.self.SAVEAS_DATA_FILTER_CONFIG) ? this.getSaveAsNameDialog().down('#name'):(datafilterinfopanel && datafilterinfopanel.down('[itemId=name]'));
							//Placed setTimeout due to _parse:onHideOverlaySpinner executing after 100ms. 
							var that = this;
							setTimeout(function() {
								filterNameObj && that.getPivotController().showFieldError(filterNameObj, pivotObject.getLocaleString("DataFilter.Config.Validation.FilterName.NotUnique"));
								filterNameObj && filterNameObj.focus();
			                }, 100);	
						}else if(!response.result.validateExpressionStatus){
							if(operation === this.self.SAVEAS_DATA_FILTER_CONFIG && response.result.dataFilterNameUnique){
								this.getSaveAsNameDialog().close();
				            }
							var datafilterexpressionpanel = this.getDataFilterExpressionPanel();
							var expressionEditorObj =this.getDataFilterExpressionPanel().down('[itemId=expressionEditor]');
							this.getPivotController().showFieldError(expressionEditorObj, response.result.failureExpressionMessage);
						}else{
							// Generic error
							 extJSPivotAlert(pivotObject,"wrn",response.result.failureExpressionMessage);
						}
					}
				}else if(operation === this.self.GET_ALL_DATA_FILTERS){
					var dataFilters = response.result.dataFilters;
					var dataFiltersStore = Ext.StoreMgr.lookup('dataFiltersStore');
					var newDataFilters = [];
					dataFiltersStore.removeAll();
					var userAccessPermissions = this.getDataFiltersDisplayPanel().config.userAccessPermissions;
					var viewFilterPermissions = this.getDataFiltersDisplayPanel().config.viewFilterPermissions;
					Ext.each(dataFilters, function (dataFilter) {
						if(dataFilter && (dataFilter.type  == _pns.Constants.dataFilterTypes.Private || dataFilter.type  == _pns.Constants.dataFilterTypes.ViewFilter || (userAccessPermissions && userAccessPermissions.canRead))){
							newDataFilters.push(dataFilter);
						}
					});
					dataFiltersStore.loadData(newDataFilters, false);
					this.displayAppliedDataFilters(newDataFilters);
					//loading all cf rules
					pivotObject && pivotObject.loadCFDefinitionsToDocument(dataFilters)
				}else if(operation === this.self.APPLY_DATA_FILTERS || operation === this.self.APPLY_CF_RULES
						|| operation ===  this.self.EVALUATE_DATA_FILTERS){
	                if(!response.result.validateExpressionStatus && response.result.failureExpressionMessage){
	                	var dataFiltersStore = Ext.StoreMgr.lookup('dataFiltersStore');
	                	var appliedCFRuleIds = response.result.appliedCFRuleIds;
	                	var filterIds = request.params.filterIds;
	                	var unAppliedCFRuleIds = filterIds && appliedCFRuleIds && filterIds.filter(function(filterId) {
	                		return !appliedCFRuleIds.includes(filterId);
	                	});
	                	if(unAppliedCFRuleIds && unAppliedCFRuleIds.length > 0){
	                		for(var i=0;i<unAppliedCFRuleIds.length;i++){
		                		var selectedFilterRec = dataFiltersStore.findRecord("id", unAppliedCFRuleIds[i],0,false, true, true);
			                	if(selectedFilterRec){
			                		if(operation === this.self.APPLY_CF_RULES){
			                			selectedFilterRec.data.formatCellActivate = false;
			                		}else{
			                			selectedFilterRec.data.activate = false;
			                		}
									selectedFilterRec.commit();
								}	
		                	}	
	                	}
	                    extJSPivotAlert(pivotObject,"wrn",response.result.failureExpressionMessage);
	                    //The below code for when we apply select all functionality and some filters applied and some filters not applied then we need to call get segment data.
	                    if(operation === this.self.APPLY_CF_RULES && request.params.filterIds && request.params.filterIds.length > 1){
	                    	this.enableOrDisableEvaluateButton(true);
	               			pivotObject.refreshSegmentData();
	                    }
	               }else {
	            	 	var dataFilters = [];
	            	   	var isEvalButtonEnabled = false;
	               		var dataFiltersStore = Ext.StoreMgr.lookup('dataFiltersStore');
	               		Ext.each(dataFiltersStore.data.items, function (item) {
	               			if(item.data.activate || item.data.formatCellActivate){
	               				isEvalButtonEnabled = true;
	               			}
							dataFilters.push(item.data);
						});
	               		
	               		if(response.result.applyFiltersStatus){
	               			if(operation === this.self.APPLY_CF_RULES){
	               				this.enableOrDisableEvaluateButton(isEvalButtonEnabled);
	               				pivotObject.refreshSegmentData();
	               			}else{
	               				this.displayAppliedDataFilters(dataFilters);
	               				this.reloadPivot(undefined, !request.params.activate);
	               			}
	               		}else{
	               			this.displayDataNotAvailable(pivotObject, dataFilters);
	               		}
	               }
				}
				else if(operation === this.self.DELETE_DATA_FILTERS){
					this.closeDeleteConfirmDialog(this);
					this.reloadPivot();
					this.getAllDataFilters();
				}else if(operation ===  this.self.GET_DATA_FILTER_BY_ID){
					var dataFilters = response.result.dataFilters;
					var filtersConfigWin = Ext.widget('datafilterconfigwindow', {filterConfig : dataFilters[0],
						userAccessPermissions : this.getDataFiltersDisplayPanel().config.userAccessPermissions,
						viewFilterPermissions : this.getDataFiltersDisplayPanel().config.viewFilterPermissions
					});
					filtersConfigWin.setTitle(pivotObject.getLocaleString('DataFilter.Config.EditFilter'));
					filtersConfigWin.show();
				}else if(operation === this.self.VALIDATE_EXPRESSION){
					if(response.result.validateExpressionStatus){
						this.showDataFilterNameDialog(true);
					}else{
						var datafilterexpressionpanel = this.getDataFilterExpressionPanel();
						var expressionEditorObj = datafilterexpressionpanel.down('[itemId=expressionEditor]');
						this.getPivotController().showFieldError(expressionEditorObj, response.result.failureExpressionMessage);
	                	expressionEditorObj.focus();
					}
				}
			}
		},
		displayDataNotAvailable: function(pivotObject, dataFilters){
			pivotObject.emptyPivotView();
			$(".resizableColumnApplied") && $(".resizableColumnApplied").empty();
			pivotObject.isDataAvailable = false;
			dataFilters && this.displayAppliedDataFilters(dataFilters);
			extJSPivotAlert(pivotObject,"info", this.getPivotController().getLocaleString('DataFilter.DataNotAvailable'));
		},
	    toggleFilter : function(store){
	    	//var dataFilterTargetMeasuresStore = Ext.StoreMgr.lookup('dataFilterTargetMeasuresStore');

			var expandedMeaures = [];
			store.each(function(record){
				if(record.data.expanded){
					expandedMeaures.push(record);
				}
			},this);
		
			for(var ind =0; ind< expandedMeaures.length; ind++){
				this.collapseExpandedMeasure(expandedMeaures[ind],store,this.getDataFilterConfigWindow().down('#showFilterdMeasureCheck').getValue());
				this.exapandMeasure(expandedMeaures[ind],store);
			}
	    },
	    exapandMeasure : function(record,store){
	    	var pivotController = JdaPivotApp.getApplication().getPivotController();
			var pivotObj = pivotController.getPivotWrapper().getPivot();
			var subMeasures = pivotObj.getSubMeasuresForMeasure(record.get('id'), this.getDataFilterConfigWindow().down('#showFilterdMeasureCheck').getValue());
			
			var subMeasureRecordArr = [];
			for(var mInd=0;  subMeasures && (mInd < subMeasures.length); mInd++){
				var tmpRecord = Ext.create(record.$className, {
					id   :subMeasures[mInd].id,
					name : subMeasures[mInd].label,
					displayName : subMeasures[mInd].label,
					hasChildren : subMeasures[mInd].hasChildren,
					subMeasure : true
				});
				
				subMeasureRecordArr.push(tmpRecord);
				
			}
			
			record.data.expanded = true;
			record.childRecordCount = subMeasureRecordArr.length;
			var rowIndex =  store.indexOf(record);
			//refresh the icon
			store.remove(record);
			store.insert(rowIndex,record )
			//adding sub measures
			store.insert(rowIndex+1,subMeasureRecordArr );
	    },
	    collapseExpandedMeasure:function(record,store){
	    
	    	var rowIndex =  store.indexOf(record);
	    	if(record.data.expanded){
				record.data.expanded = false;
				//Change icon to collapse
				store.remove(record);
				store.insert(rowIndex,record )
				//Change icon to collapse
				
				store.removeAt(rowIndex + 1,record.childRecordCount);

			}
	    },
		setDisableFilterActions : function(flag){
			
			//Disable action columns and evaluate and delete buttons
			
			this.getDataFiltersDisplayPanel().disableFilterActionsFlg = flag;
			this.getDataFiltersGrid().getSelectionModel().setLocked(flag);
			
			if(flag){
				this.getDataFiltersDisplayPanel().down('#deletedatafilterbtn').disable();
				this.getDataFiltersGrid().suspendEvents();
				this.enableOrDisableEvaluateButton(false);
			}else{
				var isEvalButtonEnabled = false;
				var dataFiltersStore = Ext.StoreMgr.lookup('dataFiltersStore');
				Ext.each(dataFiltersStore.data.items, function (item) {
					if(item.data.activate || item.data.formatCellActivate){
						isEvalButtonEnabled = true;
						return false;
					}
				});
				this.enableOrDisableEvaluateButton(isEvalButtonEnabled);
				this.getDataFiltersDisplayPanel().enableOrDisableDeleteButton(this.getDataFiltersGrid().getSelectionModel());
				this.getDataFiltersGrid().resumeEvents();
			}
			this.getDataFiltersGrid().getView().refresh();
		},
		statics : {
			SAVE_DATA_FILTER_CONFIG:'saveDataFilterConfig',
			GET_ALL_DATA_FILTERS:'getAllDataFilters',
			APPLY_DATA_FILTERS:'applyDataFilters',
			DELETE_DATA_FILTERS:'deleteDataFilters',
			VALIDATE_EXPRESSION:'validateExpression',
			GET_DATA_FILTER_BY_ID:'getDataFilterById',
			SAVEAS_DATA_FILTER_CONFIG:'saveAsDataFilterConfig',
			EVALUATE_DATA_FILTERS:'evaluateDataFilters',
			APPLY_CF_RULES:'applyCFRules',
		}
});
