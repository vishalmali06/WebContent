//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.controller.MeasureFilterController',
	{
		extend : 'Ext.app.Controller',
		id : 'measurefiltercontroller',
		requires : ['JdaPivotApp.view.measurefilter.MeasureFilterConfigWindow'],
		models : [ 'measurefilter.MeasureFilters', 'Pair'],
		stores : [ 'measurefilter.MeasureFilters', 'measurefilter.MeasureFilterTypes','measurefilter.SplitMeasures','measurefilter.AvailableSubMeasures','measurefilter.SelectedSubMeasures','measurefilter.CriteriaOperators'],
		
		refs : [
					{
						ref : 'measureFiltersDisplayPanel',
						selector : '#measurefiltersdisplaypanel'
					},{
						ref : 'measureFiltersGrid',
						selector : '#measureFiltersGrid'
					},{
						ref : 'measureFilterConfigWindow',
						selector : '#measurefilterconfigwindow'
					},{
						ref : 'buildMeasureFilterPanel',
						selector : '#buildmeasurefilterpanel'
					},{
						ref : 'measureFilterInfoPanel',
						selector : '#measurefilterinfopanel'
					},{
						ref : 'pivotItemSelector',
						selector : '#pivotitemselector'
					},{
						ref : 'splitMeasurePanel',
						selector : '#splitmeasurepanel'
					},{
						ref : 'subMeasuresCriteriaPanel',
						selector : '#submeasurescriteriapanel'
					},{
						ref : 'saveAsNameDialog',
						selector : '#saveasnamedialog'
					},{
						ref : 'deleteConfirmDialog',
						selector : '#deleteconfirmdialog'
					},
					
				],
		init : function() {
			var me = this;
			me.isConfigWidnowOpen = false;
			this.control({
				'#measurefiltersdisplaypanel #addmeasurefilterbtn' : {
					click : function() {
						me.showMeasureFilterConfigWindow();
					}
				},
				'#measurefiltersdisplaypanel #deletemeasurefilterbtn' : {
					click : function() {
						me.showDeleteMeasureFilterDialog();
					}
				},
				'#measurefiltersdisplaypanel #measureFiltersGrid #headerName': {
					click : me.getMeasureFilterConfig
	            },
	            '#measurefiltersdisplaypanel #measureFiltersGrid #headerApply': {
	            	checkchange :  function(columnRecord, rowIndex, isChecked, iRecord) {
						me.applyMeasureFilter(iRecord.get("id"), isChecked);
					}
	            },
				'#measurefiltersavebtn' : {
					click : function() {
						me.saveMeasureFilterConfig(this.self.SAVE_MEASURE_FILTER_CONFIG);
					}
				},
				'#measurefiltersaveasbtn' : {
					click : function() {
						me.showMeasureFilterNameDialog();
					}
				},
				'#measurefiltercancelbtn' : {
					click : function() {
						me.closeMeasureFilterConfigWindow();
					}
				},
				'#splitmeasurepanel #splitMeasureCombo': {
					change : me.getSubMeasures
	            },
	            '#splitmeasurepanel #measureSelection': {
	            	change: me.hideAndShowSubMeasureSelection
	            },
	            '#availbleSubMeasuresSearch':{
	            	keyup: me.availbleSubMeasuresSearch
	            },
	            '#selectedSubMeasuresSearch':{
	            	keyup: me.selectedSubMeasuresSearch
	            },
	            '#moveAllItemsToRight': {
	            	click:me.moveAllItemsToRight
	            },
	            '#moveItemsToRight': {
	            	click: me.moveItemsToRight
	            },
	            '#moveItemsToLeft': {
	            	click: me.moveItemsToLeft
	            },
	            '#moveAllItemsToLeft': {
	            	click: me.moveAllItemsToLeft
	            },
	            '#operatorsCombo': {
					change : me.populateCriteriaSubMeasures 
	            },
	            '#criteriaText': {
	            	change : me.populateCriteriaSubMeasures
	            },
	            'measurefilterconfigwindow':{
					beforeclose : me.clearMeasureFilterConfigStores
					
				}
			 });
		},
		getPivotController : function(){
			return JdaPivotApp.getApplication().getPivotController()
		},
		showMeasureFilterConfigWindow : function(){
			var filtersConfigWin = Ext.widget('measurefilterconfigwindow', {
				userAccessPermissions : this.getMeasureFiltersDisplayPanel().config.userAccessPermissions,
			});
			filtersConfigWin.setTitle(this.getPivotController().getLocaleString('DataFilter.Config.AddFilter'));
			filtersConfigWin.show();
		},
		applyMeasureFilter : function(id, isChecked){
			var params = {};
	    	params.operation = this.self.APPLY_MEASURE_FILTER;
	    	params.id = id;
	    	params.activate = isChecked;
	    	this.sendMeasureFilterRequest(params);
		},
		showDeleteMeasureFilterDialog : function(){
	    	var selectedFilters=this.getMeasureFiltersGrid().getView().getSelectionModel().getSelection();
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
		    			displayMessage:this.getPivotController().getLocaleString('MeasureFilter.DeleteConfirmMsg',filterNames),
		    			okCallbackFn : this.deleteMeasureFilters,
		    			cancelCallbackFn : this.closeDeleteConfirmDialog
		    	});
		    	deleteconfirmdialog.setTitle(this.getPivotController().getLocaleString('MeasureFilter.DeleteConfirmDialog.Title'));
		    	deleteconfirmdialog.show();
	    	}
		},
		deleteMeasureFilters : function(filterIds){
	    	var params = {};
	    	params.operation = this.self.DELETE_MEASURE_FILTERS;
	    	params.filterIds = filterIds;
	    	this.sendMeasureFilterRequest(params);
		},
		closeDeleteConfirmDialog : function(){
			this.getDeleteConfirmDialog().close();
		},
		getMeasureFilterConfig : function(iView, iCellEl, iRowIdx, iColIdx, iEvent, iRecord){
			var selFilterId = iRecord.get("id");
			if(selFilterId){
				var params = {
						operation : this.self.GET_MEASURE_FILTER_BY_ID,
						id : selFilterId,
				};
				if(!this.isConfigWidnowOpen){
					this.sendMeasureFilterRequest(params);
					this.isConfigWidnowOpen = true;
				}
			}
		},
		saveMeasureFilterConfig :  function(operation){
			var isValidRequest = true;
			var data = {};
			
			// config window basic information 
			var pivotitemselector = this.getPivotItemSelector();
			var selectedSplitMeasuresGrid = pivotitemselector.down("#selectedSplitMeasuresGrid");
			selectedSplitMeasuresGrid.getStore().clearFilter();
			var measureFilterInfoPanel = this.getMeasureFilterInfoPanel();
			var filterNameObj = (operation === this.self.SAVEAS_MEASURE_FILTER_CONFIG) ? this.getSaveAsNameDialog().down('#name'):measureFilterInfoPanel.down('#name'); 
			isValidRequest = this.validateMeasureFilterConfigWindow(filterNameObj, data, operation);
			if(isValidRequest){
				data.operation = operation;
	    		this.sendMeasureFilterRequest(data);
	    	}
		},
		validateMeasureFilterConfigWindow : function(filterNameObj, data, operation){
			
			var isValidRequest = true;
			if(!this.validateFilterName(filterNameObj)){
				isValidRequest = false;
			}else{
				//Basic information
		        data.name = filterNameObj.getValue();
		        var dataFilterInfoPanel = this.getMeasureFilterInfoPanel();
		        data.type = dataFilterInfoPanel.down('#filterTypeCombo').getValue();
		        data.description = dataFilterInfoPanel.down('#description').getValue();
				
		        if(operation !== this.self.SAVEAS_MEASURE_FILTER_CONFIG){
		    		if(filterNameObj.configId){
		    			data.id=filterNameObj.configId;
		    		}
		    	}
		        var splitMeasurePanel = this.getSplitMeasurePanel();
				var splitMeasureComboObj = splitMeasurePanel.down('#splitMeasureCombo');
				var splitMeasureId = splitMeasureComboObj.getValue();
				if(splitMeasureId == null || splitMeasureId.trim().length  == 0){
		        	isValidRequest = false;
		        	this.getPivotController().showFieldError(splitMeasureComboObj, this.getPivotController().getLocaleString('MesureFilter.Config.Validation.SelectMeasure.Required'));
		        	splitMeasureComboObj.focus();
				}else{
					//Expression information
			        data.splitMeasureId = splitMeasureId;
					var measureSelection = splitMeasurePanel.down("#measureSelection").getValue();
					if(measureSelection['subMeasureSelectionType'] == "submeasurescriteria"){
						data.criteriaSelection = true;
					}
					
					if(data.criteriaSelection){
						var operatorsCombo = splitMeasurePanel.down("#operatorsCombo");
						criteriaOperator =  operatorsCombo.getValue();
						if(criteriaOperator == null || criteriaOperator.trim().length  == 0){
							isValidRequest = false;
							this.getPivotController().showFieldError(operatorsCombo, this.getPivotController().getLocaleString('MesureFilter.Config.Validation.SelectOperator.Required'));
							operatorsCombo.focus();
						}else{
							data.criteriaOperator =  criteriaOperator;
							var criteriaTextObj = splitMeasurePanel.down("#criteriaText");
							var criteriaText =  criteriaTextObj.getValue();
							if(criteriaText == null || criteriaText.trim().length  == 0){
								isValidRequest = false;
								this.getPivotController().showFieldError(criteriaTextObj, this.getPivotController().getLocaleString('MesureFilter.Config.Validation.SearchText.Required'));
								criteriaTextObj.focus();
							}else{
								data.criteriaText =  splitMeasurePanel.down("#criteriaText").getValue();
							}
						}
					}else{
						var subMeasureIds = [];
						var selectedSplitMeasuresGrid = splitMeasurePanel.down("#selectedSplitMeasuresGrid");
						var items = selectedSplitMeasuresGrid.getStore().getRange();
						for(var i = 0; i < items.length; i++){
							subMeasureIds.push(items[i].data.id);
						}
						if(subMeasureIds.length == 0){
							isValidRequest = false;
							var selectedSplitMeasuresGridBody = selectedSplitMeasuresGrid.body;
							selectedSplitMeasuresGridBody.setStyle('border','solid Red 1px');
							selectedSplitMeasuresGridBody.set({'data-errorqtip': this.getPivotController().getLocaleString('MesureFilter.Config.Validation.SelectSubMeasure.Required')});
						}else{
							data.subMeasureIds = subMeasureIds;
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
				var measureFitlerConfig =pivotObj && pivotObj.getMeasureFilterConfig();
				var filterName = fitlerNameObj.getValue();
				var filterNameMaxLenght = 255;
				if(measureFitlerConfig && measureFitlerConfig.options && measureFitlerConfig.options.filterNameMaxLength){
					filterNameMaxLenght = measureFitlerConfig.options.filterNameMaxLength;
				}
				if(filterName.trim().length === 0){
					resourceKey = 'MeasureFilter.Config.Validation.FilterName.Required';
				}else if(filterName.length > filterNameMaxLenght){
					resourceKey = 'MeasureFilter.Config.Validation.FilterName.LengthExceed';
				}else if(measureFitlerConfig.validators.checkInvalidCharacters === undefined){
					var temp = filterName;
					if((filterName.replace(/#|@|\$|%|\^|&|~|<|>/g,'*') !== temp))
					{
						resourceKey = 'MeasureFilter.Config.Validation.FilterName.InvalidCharacter';
					}
				} else if(!measureFitlerConfig.validators.checkInvalidCharacters(filterName)){
					resourceKey = 'MeasureFilter.Config.Validation.FilterName.InvalidCharacter';
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
		showMeasureFilterNameDialog : function(){
			var filterNameObj = this.getMeasureFilterInfoPanel().down('#name');
			var data = {};
			if(this.validateMeasureFilterConfigWindow(filterNameObj, data, this.self.SAVEAS_MEASURE_FILTER_CONFIG)){
	    		var saveasnamedialog = Ext.widget('saveasnamedialog', {
	    			previousName : filterNameObj.getValue(),
	    			scope : this,
	    			saveAs : this.self.SAVEAS_MEASURE_FILTER_CONFIG,
	    			nameFieldLabel : this.getPivotController().getLocaleString('MeasureFilter.Config.Name'),
	    			saveCallbackFn : this.saveMeasureFilterConfig,
	    			cancelCallbackFn : this.closeSaveAsNameDialog,
	    		});
	    		saveasnamedialog.setTitle(this.getPivotController().getLocaleString('MeasureFilter.Config.SaveAsName.Title'));
	    		saveasnamedialog.show();
	    	}
		},
		closeSaveAsNameDialog : function(){
			this.getSaveAsNameDialog().close();
		},
		clearMeasureFilterConfigStores : function(){
			//clear both grid stores
			var pivotitemselector = this.getPivotItemSelector();
    		var selectedSplitMeasuresGrid =  pivotitemselector.down('#selectedSplitMeasuresGrid');;
			selectedSplitMeasuresGrid.getStore().removeAll();
			selectedSplitMeasuresGrid.getStore().clearFilter();
			var availbaleSplitMeasuresGrid =  pivotitemselector.down('#availbaleSplitMeasuresGrid');;
			availbaleSplitMeasuresGrid.getStore().removeAll();
			availbaleSplitMeasuresGrid.getStore().clearFilter();
		},
		closeMeasureFilterConfigWindow : function(cellContextInfo){
			this.isConfigWidnowOpen = false;
			this.getMeasureFilterConfigWindow().close();
		},
		getSubMeasures :function(field, newValue, oldValue){
			this.populateSubMeasures(newValue);
			this.populateCriteriaSubMeasures();
		},
		hideAndShowSubMeasureSelection : function (field, newValue, oldValue){
			var splitmeasurepanel = this.getSplitMeasurePanel();
			if(newValue['subMeasureSelectionType'] == "submeasures"){
				splitmeasurepanel.down("#pivotitemselector").show();
				splitmeasurepanel.down("#submeasurescriteriapanel").hide();
			}else{
				splitmeasurepanel.down("#pivotitemselector").hide();
				splitmeasurepanel.down("#submeasurescriteriapanel").show();
			}
		},
		availbleSubMeasuresSearch : function(){
			var pivotitemselector = this.getPivotItemSelector();
			var availbleSubMeasuresSearch = pivotitemselector.down('#availbleSubMeasuresSearch');
    		var searchValue = availbleSubMeasuresSearch.getValue().toLowerCase();
    		var availbaleSplitMeasuresGrid =  pivotitemselector.down('#availbaleSplitMeasuresGrid');;
    		availbaleSplitMeasuresGrid.getStore().clearFilter();
    		availbaleSplitMeasuresGrid.getStore().filter([{
	            filterFn: function(item) {
	                if(searchValue == null || item.get("name").toLowerCase().indexOf(searchValue) > -1) {
	                    return true;
	                }
	                return false;
	            }
    		}]);
		},
		selectedSubMeasuresSearch :  function(){
			var pivotitemselector = this.getPivotItemSelector()
			var selectedSubMeasuresSearch = pivotitemselector.down('#selectedSubMeasuresSearch');
    		var searchValue = selectedSubMeasuresSearch.getValue().toLowerCase();
    		var selectedSplitMeasuresGrid =  pivotitemselector.down('#selectedSplitMeasuresGrid');;
    		selectedSplitMeasuresGrid.getStore().clearFilter();
    		selectedSplitMeasuresGrid.getStore().filter([{
	            filterFn: function(item) {
	                if(searchValue == null || item.get("name").toLowerCase().indexOf(searchValue) > -1) {
	                    return true;
	                }
	                return false;
	            }
    		}]);
		},
		moveAllItemsToRight: function(){
			var pivotitemselector = this.getPivotItemSelector()
			var availbaleSplitMeasuresGrid = pivotitemselector.down('#availbaleSplitMeasuresGrid');
			var selectedSplitMeasuresGrid = pivotitemselector.down('#selectedSplitMeasuresGrid');
			selectedSplitMeasuresGrid.getStore().add(availbaleSplitMeasuresGrid.getStore().getRange());
			availbaleSplitMeasuresGrid.getStore().removeAll();
		},
		moveItemsToRight: function(){
			var pivotitemselector = this.getPivotItemSelector();
			var availbaleSplitMeasuresGrid = pivotitemselector.down('#availbaleSplitMeasuresGrid');
			var selectedSplitMeasuresGrid = pivotitemselector.down('#selectedSplitMeasuresGrid');
			selectedSplitMeasuresGrid.getStore().add(availbaleSplitMeasuresGrid.getView().getSelectionModel().getSelection());
			availbaleSplitMeasuresGrid.getStore().remove(availbaleSplitMeasuresGrid.getView().getSelectionModel().getSelection());
		},
		moveItemsToLeft: function(){
			var pivotitemselector = this.getPivotItemSelector();
			var selectedSplitMeasuresGrid = pivotitemselector.down('#selectedSplitMeasuresGrid');
			var availbaleSplitMeasuresGrid = pivotitemselector.down('#availbaleSplitMeasuresGrid');
			//Check if selection contains some invalid records
			var recsToMove = selectedSplitMeasuresGrid.getView().getSelectionModel().getSelection();
			var invalidRecs = [];
			var invalidRecIds = [];
			recsToMove.forEach(function(rec){
				if(rec.data.invalid){
					invalidRecs.push(rec);
					invalidRecIds.push(rec.data.id);
				}
			});
			
			if(invalidRecs.length > 0 ){
				var measurefilterconfigwindow = pivotitemselector.up('measurefilterconfigwindow');
				var deleteItemDialog = Ext.widget('deleteitemdialog', {});
				var pivotObj =  JdaPivotApp.getApplication().getPivotController().getPivotWrapper().getPivot();
				deleteItemDialog.setTitle(pivotObj.getLocaleString('MeasureFilter.Config.DeleteMoveConfirm'));
				deleteItemDialog.down('label').setText(pivotObj.getLocaleString('MeasureFilter.Config.ContinueMoveItemConfirmMsg',"'"+invalidRecIds.join(", ")+"'"));
				var deleteitemdialogokbtn = deleteItemDialog.down('#deleteitemdialogokbtn');
				deleteItemDialog.show();
				deleteitemdialogokbtn.setText(pivotObj.getLocaleString('MeasureFilter.Config.DeleteMoveConfirm'));
				var deleteitemdialogcencelbtn = deleteItemDialog.down('#deleteitemdialogcencelbtn');
				deleteitemdialogokbtn.on('click', function(){
					selectedSplitMeasuresGrid.getStore().remove(invalidRecs);
					availbaleSplitMeasuresGrid.getStore().add(selectedSplitMeasuresGrid.getView().getSelectionModel().getSelection());
					selectedSplitMeasuresGrid.getStore().remove(selectedSplitMeasuresGrid.getView().getSelectionModel().getSelection());
					this.evaluateInvalidMeasuresMsg(measurefilterconfigwindow);
					deleteItemDialog.close();
				},this);
				deleteitemdialogcencelbtn.on('click', function(){
					deleteItemDialog.close();
				});
			}else{
				availbaleSplitMeasuresGrid.getStore().add(selectedSplitMeasuresGrid.getView().getSelectionModel().getSelection());
				selectedSplitMeasuresGrid.getStore().remove(selectedSplitMeasuresGrid.getView().getSelectionModel().getSelection());
			}
		},
		moveAllItemsToLeft: function(){
			var pivotitemselector = this.getPivotItemSelector();
			var selectedSplitMeasuresGrid = pivotitemselector.down('#selectedSplitMeasuresGrid');
			var availbaleSplitMeasuresGrid = pivotitemselector.down('#availbaleSplitMeasuresGrid');
			//Check if selection contains some invalid records
			var recsToMove = selectedSplitMeasuresGrid.getStore().getRange();
			var invalidRecs = [];
			var invalidRecIds = [];
			var validRecords = [];
			recsToMove.forEach(function(rec){
				if(rec.data.invalid){
					invalidRecs.push(rec);
					invalidRecIds.push(rec.data.id);
				}else{
					validRecords.push(rec);
				}
			});
			
			if(invalidRecs.length > 0 ){
				var deleteItemDialog = Ext.widget('deleteitemdialog', {});
				var pivotObj =  JdaPivotApp.getApplication().getPivotController().getPivotWrapper().getPivot();
				deleteItemDialog.setTitle(pivotObj.getLocaleString('MeasureFilter.Config.DeleteMoveConfirm'));
				deleteItemDialog.down('label').setText(pivotObj.getLocaleString('MeasureFilter.Config.ContinueMoveItemConfirmMsg',"'"+invalidRecIds.join(", ")+"'"));
				var deleteitemdialogokbtn = deleteItemDialog.down('#deleteitemdialogokbtn');
				deleteItemDialog.show();
				deleteitemdialogokbtn.setText(pivotObj.getLocaleString('MeasureFilter.Config.DeleteMoveConfirm'));
				var deleteitemdialogcencelbtn = deleteItemDialog.down('#deleteitemdialogcencelbtn');
				var pivotitemselector = this.getPivotItemSelector();
				var measurefilterconfigwindow = pivotitemselector.up('measurefilterconfigwindow');
				deleteitemdialogokbtn.on('click', function(){
					
				var availbaleSplitMeasuresGrid = pivotitemselector.down('#availbaleSplitMeasuresGrid');
				var selectedSplitMeasuresGrid = pivotitemselector.down('#selectedSplitMeasuresGrid');
					validRecords.length > 0 && availbaleSplitMeasuresGrid.getStore().add(validRecords);
					selectedSplitMeasuresGrid.getStore().removeAll();
					this.evaluateInvalidMeasuresMsg(measurefilterconfigwindow);
					deleteItemDialog.close();
				},this);
				deleteitemdialogcencelbtn.on('click', function(){
					deleteItemDialog.close();
				});
			}else{
				availbaleSplitMeasuresGrid.getStore().add(selectedSplitMeasuresGrid.getStore().getRange());
				selectedSplitMeasuresGrid.getStore().removeAll();
			}
		},
		populateCriteriaSubMeasures : function(){
			var splitMeasurePanel = this.getSplitMeasurePanel();
			var operatorsCombo= splitMeasurePanel.down("#operatorsCombo");
			var criteriaText= splitMeasurePanel.down("#criteriaText");
			var splitMeasureComboObj = splitMeasurePanel.down('#splitMeasureCombo');
			
			var searchValue = criteriaText.getValue();
			var operator = operatorsCombo.getValue(); 
			var splitMeasureId = splitMeasureComboObj.getValue();
			
			var criteriaAvailableSubMeasuresStore = Ext.StoreMgr.lookup('criteriaAvailableSubMeasuresStore');
    		criteriaAvailableSubMeasuresStore.removeAll();
    		
			if(splitMeasureId && searchValue && operator){
				var searchValue = searchValue.toLowerCase();
				var operator = operatorsCombo.getValue(); 
				var filterFn;
	    		if(operator == "contains"){
		            filterFn = function(item) {
		                return (item.get("name").toLowerCase().indexOf(searchValue) > -1);
		            }
	    		}else if(operator == "doesNotContain"){
		            filterFn = function(item) {
		                return (item.get("name").toLowerCase().indexOf(searchValue) <= -1);
		            }
	    		}else if(operator == "beginsWith"){
		            filterFn = function(item) {
		                return (item.get("name").toLowerCase().startsWith(searchValue));
		            }
	    		}else if(operator == "endsWith"){
		            filterFn= function(item) {
		                return (item.get("name").toLowerCase().endsWith(searchValue));
		            }
	    		}else if(operator == "notEqual"){
		            filterFn= function(item) {
		                return (item.get("name").toLowerCase() != searchValue);
		            }
	    		}
	    		criteriaAvailableSubMeasuresStore.clearFilter();
	    		criteriaAvailableSubMeasuresStore.filter([{
		            filterFn: filterFn
	    		}]);
	    		
	    		var subMeasures = this.getPivotController().getPivotWrapper().getPivot().getSubMeasuresForMeasure(splitMeasureId);
	    		var availableSubMeasures = [];
	    		for(subMeasureId in subMeasures){
	    			var subMeasureObj = subMeasures[subMeasureId];
	    			if(subMeasureObj.id){
	    				availableSubMeasures.push({
							id : subMeasureObj.id,
							name : (subMeasureObj.uIAttributes && subMeasureObj.uIAttributes.displayName) || subMeasureObj.label
						});	
	    			}
	    		}
	    		criteriaAvailableSubMeasuresStore.loadData(availableSubMeasures, false);
			}
		},
		getAllMeasureFilters: function(){
			var params = {
					operation : this.self.GET_ALL_MEASURE_FILTERS
			};
			this.sendMeasureFilterRequest(params);
		},
		sendMeasureFilterRequest: function(params) {
			var pivotObj = this.getPivotController().getPivotWrapper() && this.getPivotController().getPivotWrapper().getPivot();
			if(pivotObj && pivotObj.getMeasureFilterConfig() && pivotObj.getMeasureFilterConfig().options){
				pivotObj.getMeasureFilterConfig().options.executeAction(params);
			}else{
				pivotObj && pivotObj.executeMeasureFilter(params);
			}
		},
		reloadPivot : function(){
			var pivotObject = this.getPivotController().getPivotWrapper().getPivot();
			pivotObject.prepareSubmeasureExpandCache();
			pivotObject.reExpandSubmeasures(true); //forceRender = true
			
			
		},
		handleResponse : function(response, request) {
			if(request && request.params){
				var pivotObject = this.getPivotController().getPivotWrapper().getPivot();
				var operation = request.params.operation;
				if(operation === this.self.SAVE_MEASURE_FILTER_CONFIG || operation === this.self.SAVEAS_MEASURE_FILTER_CONFIG){
					
					if(response.result && response.result.saveOrUpdateStatus) {
						//if save or update status is true means it saved successfully in to DB and memory
						if(operation === this.self.SAVEAS_MEASURE_FILTER_CONFIG){
							this.getSaveAsNameDialog().close();
			            }
						this.closeMeasureFilterConfigWindow();
						if(operation === this.self.SAVE_MEASURE_FILTER_CONFIG && response.result.applyFiltersStatus){
							if(response.result.measureFilters[0].activate){
								this.reloadPivot();
		            	    }else{
		            	    	pivotObject.refreshSegmentData();
		            	    }
						}
						this.getAllMeasureFilters();
					}else{
						//if save or update status is false means it has some errors
						if(!response.result.measureFilterNameUnique){
							// if data filter name is not unique name then showing error on field.
							var measurefilterinfopanel = this.getMeasureFilterInfoPanel();
							var filterNameObj = (operation === this.self.SAVEAS_MEASURE_FILTER_CONFIG) ? this.getSaveAsNameDialog().down('#name'):(measurefilterinfopanel && measurefilterinfopanel.down('#name'));
							//Placed setTimeout due to _parse:onHideOverlaySpinner executing after 100ms. 
							var that = this;
							setTimeout(function() {
								filterNameObj && that.getPivotController().showFieldError(filterNameObj, pivotObject.getLocaleString("MeasureFilter.Config.Validation.FilterName.NotUnique"));
								filterNameObj && filterNameObj.focus();
			                }, 100);
						}
					}
				}else if(operation === this.self.GET_ALL_MEASURE_FILTERS){
					var measureFilters = response.result.measureFilters;
					var measureFiltersStore = Ext.StoreMgr.lookup('measureFiltersStore');
					var newMeasureFilters = [];
					measureFiltersStore.removeAll();
					var splitMeasureFilters = {};
					var userAccessPermissions = this.getMeasureFiltersDisplayPanel().config.userAccessPermissions;
					
					Ext.each(measureFilters, function (measureFilter) {
						if(measureFilter && (measureFilter.type  == _pns.Constants.measureFilterTypes.Private || (userAccessPermissions && userAccessPermissions.canRead))){
							newMeasureFilters.push(measureFilter);
						}
						if(measureFilter){
							if(!splitMeasureFilters[measureFilter.splitMeasureId]){
								splitMeasureFilters[measureFilter.splitMeasureId] = [];
							}
							splitMeasureFilters[measureFilter.splitMeasureId].push(measureFilter);
						}
						
					});
					if(Object.keys(splitMeasureFilters).length > 0){
						var cube = pivotObject._getCubeDefinition();
						cube.measureFilters = splitMeasureFilters;
					}
					measureFiltersStore.loadData(newMeasureFilters, false);
					//Since measure filters are getting reloaded refresh the submeasures in pivot
					this.reloadPivot();
					
				}else if(operation === this.self.APPLY_MEASURE_FILTER ){
	                if(response.result.applyFiltersStatus){
	                	var filterId = request.params.id;
						var measureFiltersStore = Ext.StoreMgr.lookup('measureFiltersStore');
						var selectedFilterRec = measureFiltersStore.findRecord("id", filterId,0,false, true, true);
						if(selectedFilterRec){
		                	var measureFilters = pivotObject._getCubeDefinition().measureFilters;
							var splitMeasureId = selectedFilterRec.data.splitMeasureId;
							var splitMeasureFilters = measureFilters && measureFilters[splitMeasureId];
							var splitMeasureFilter = splitMeasureFilters && splitMeasureFilters.find(function(splitMeasureFilter) {
								return splitMeasureFilter.id === filterId;
							});
							splitMeasureFilter && (splitMeasureFilter.activate = request.params.activate);
						}
	                	this.reloadPivot()
					}
				}
				else if(operation === this.self.DELETE_MEASURE_FILTERS){
					this.closeDeleteConfirmDialog(this);
					this.reloadPivot();
					this.getAllMeasureFilters();
				}else if(operation ===  this.self.GET_MEASURE_FILTER_BY_ID){
					var measureFilters = response.result.measureFilters;
					var filtersConfigWin = Ext.widget('measurefilterconfigwindow', {filterConfig : measureFilters[0],
						userAccessPermissions : this.getMeasureFiltersDisplayPanel().config.userAccessPermissions,
					});
					filtersConfigWin.setTitle(pivotObject.getLocaleString('MeasureFilter.Config.EditFilter'));
					filtersConfigWin.measureFilterRec = measureFilters[0];
					filtersConfigWin.show();
					this.getSubMeasures(null,measureFilters[0].splitMeasureId, null );
					// First validate if splitMeasureId is correct/valid
					if(pivotObject.getMeasure(measureFilters[0].splitMeasureId)){
							var invalidSubMeasrues = this.getInvalidSubMeasures(measureFilters[0]);
							if(invalidSubMeasrues && invalidSubMeasrues.length > 0){
							//As we have got some invalid Sub-Measures which has not been loaded on selected submeasures grid
							var selectedSubMeasuresStore = Ext.StoreMgr.lookup('selectedSubMeasuresStore');
							var invalidRecs = [];
							for(var inInd = 0; inInd<invalidSubMeasrues.length; inInd++){
								invalidRecs.push({
									id : invalidSubMeasrues[inInd],
									name : invalidSubMeasrues[inInd],
									invalid:true //keep the marker
								});
								if((inInd+1) % 3 == 0){
                                  invalidSubMeasrues[inInd]= "&#10"+invalidSubMeasrues[inInd] ;
								}
								
							}

							selectedSubMeasuresStore.loadData(invalidRecs, true);
							filtersConfigWin.down("#subMeasureErrMsgPanel").setVisible(true);
							filtersConfigWin.down("#subMeasureErrMsgPanel displayfield").
								setValue(pivotObject.getLocaleString('MeasureFilter.Config.InvalidSubMeasure',invalidSubMeasrues.join(",")));
						}
					}else{
						filtersConfigWin.down("#splitMeasureCombo").
							markInvalid(pivotObject.getLocaleString('MeasureFilter.Config.InvalidMeasure',measureFilters[0].splitMeasureId));
					}

				}
			}
		},
		getInvalidSubMeasures : function(selectedFilterRec){
			var pivotObject = this.getPivotController().getPivotWrapper().getPivot();
			var splitMeasureId = selectedFilterRec.splitMeasureId;
			var invalidSubMeasrues = [];
			var allSubmeasures = pivotObject.getSubMeasuresForMeasure(splitMeasureId,false);
			var filtersubMeasureIds = selectedFilterRec.subMeasureIds;
			for(var subMeasureInd = 0 ; filtersubMeasureIds && (subMeasureInd < filtersubMeasureIds.length); subMeasureInd++){
				var found = allSubmeasures.find(function(splitMeasureFilter) {
							return splitMeasureFilter.id === filtersubMeasureIds[subMeasureInd];
						});
				if(!found){
					invalidSubMeasrues.push(filtersubMeasureIds[subMeasureInd]);
				}
			}
			return invalidSubMeasrues;
		},
		evaluateInvalidMeasuresMsg : function(filtersConfigWin){
			var selectedSplitMeasuresGrid = filtersConfigWin.down('#selectedSplitMeasuresGrid');
			var recsToCheck = selectedSplitMeasuresGrid.getStore().getRange();
			var invalidSubMeasrues = [];
			recsToCheck.forEach(function(rec){
				if(rec.data.invalid){
					invalidSubMeasrues.push(rec.data.id);
				}
			});
			if(invalidSubMeasrues && invalidSubMeasrues.length > 0){
			var pivotObject =  JdaPivotApp.getApplication().getPivotController().getPivotWrapper().getPivot();
			//As we have got some invalid Sub-Measures which has not been loaded on selected submeasures grid
			filtersConfigWin.down("#subMeasureErrMsgPanel").setVisible(true);
			filtersConfigWin.down("#subMeasureErrMsgPanel displayfield").
				setValue(pivotObject.getLocaleString('MeasureFilter.Config.InvalidSubMeasure',invalidSubMeasrues.join(",")));
			}else{
				filtersConfigWin.down("#subMeasureErrMsgPanel").setVisible(false);
			}
		},
		populateSubMeasures : function(splitMeasureId){
			var availableSubMeasuresStore = Ext.StoreMgr.lookup('availableSubMeasuresStore');
			availableSubMeasuresStore.removeAll();
			var selectedSubMeasuresStore = Ext.StoreMgr.lookup('selectedSubMeasuresStore');
			selectedSubMeasuresStore.removeAll();
			
			var measurefilterconfigwindow = this.getMeasureFilterConfigWindow();
			var filterConfig = measurefilterconfigwindow.getFilterConfig();
			var selectedSubMeasureIds = filterConfig && filterConfig.subMeasureIds;
			var availableSubMeasures = [];
			var selectedSubMeasures = [];
			var subMeasures = this.getPivotController().getPivotWrapper().getPivot().getSubMeasuresForMeasure(splitMeasureId);
			if(subMeasures){
				for(var subMeasureId in subMeasures){
					var subMeasureObj = subMeasures[subMeasureId];
					if(subMeasureObj.id){
						var subMeasure = {
								id : subMeasureObj.id,
								name : (subMeasureObj.uIAttributes && subMeasureObj.uIAttributes.displayName) || subMeasureObj.label
						}
						if(selectedSubMeasureIds && selectedSubMeasureIds.includes(subMeasureObj.id)){
							selectedSubMeasures.push(subMeasure);
						}else{
							availableSubMeasures.push(subMeasure);
						}	
					}
				}
			}
			availableSubMeasuresStore.loadData(availableSubMeasures, false);
			selectedSubMeasuresStore.loadData(selectedSubMeasures, false);
		},
		populateMeasureFitlerStores : function(){
			var pivotObj = this.getPivotController().getPivotWrapper().getPivot();
			// loading measure filter type date
			var measureFilterTypesStore = Ext.StoreMgr.lookup('measureFilterTypesStore');
			measureFilterTypesStore.removeAll();
			var filterTypes = [];
			var measureFilterTypes = _pns.Constants.measureFilterTypes;
			for (var key in measureFilterTypes) {
				var displayValue = this.getPivotController().getLocaleString('MeasureFilter.Config.Type.' + key);
				filterTypes.push({
					id : measureFilterTypes[key],
					name : displayValue
				});
			}
			measureFilterTypesStore.loadData(filterTypes, false);
			
			
			// loading Split measures
			var cube = pivotObj._getCubeDefinition();
			var splitMeasuresStore = Ext.StoreMgr.lookup('splitMeasuresStore');
			splitMeasuresStore.removeAll();
			var measures= [];
			var splitMeasures = [];
			if(cube && cube.measures){
				var availableMeasures = cube.measures;
				for (var i = 0; i < availableMeasures.length; i++) {
					var measure = availableMeasures[i];
					if(measure.hasChildren){
						splitMeasures.push({
							id : measure.id,
							name : measure.uIAttributes.displayName,
						});	
					}
				}
			}
			splitMeasuresStore.loadData(splitMeasures, false);
			
			// loading criteria operators
			var criteriaOperatorsStore = Ext.StoreMgr.lookup('criteriaOperatorsStore');
			criteriaOperatorsStore.removeAll();
			
			var operators = [];
			var filterOperators = _pns.Constants.filterOperators;
			for (var key in filterOperators) {
				var displayValue = pivotObj.getLocaleString('Operators.' + key);
				operators.push({
					id : filterOperators[key],
					name : displayValue
				});
			}
			criteriaOperatorsStore.loadData(operators, false);
		},
		statics : {
			SAVE_MEASURE_FILTER_CONFIG : "saveMeasureFilterConfig",
			SAVEAS_MEASURE_FILTER_CONFIG : "saveAsMeasureFilterConfig",
			GET_ALL_MEASURE_FILTERS : "getAllMeasureFilters",
			DELETE_MEASURE_FILTERS : "deleteMeasureFilters",
			GET_MEASURE_FILTER_BY_ID : "getMeasureFilterById",
			GET_SUB_MEASURES : "getSubMeasures",
			APPLY_MEASURE_FILTER : "applyMeasureFilter",
		}
});
