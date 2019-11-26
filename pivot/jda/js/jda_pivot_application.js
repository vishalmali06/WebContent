//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
/*jshint smarttabs: true */
$(function()
{
    _pns.pivot.pivotPackagePrefix = 'com.jda.common.pivot.broker.';
    _pns.localeResourcePrefix = _pns.localeResourcePrefix || '';
    _pns.getPivotPackagePrefix = function(){return _pns.pivotPackagePrefix;};
    _pns.getPivotLocaleString = function() {
        return _pns._getPivotLocaleString.apply({localeStrs:_pns.localeStrs}, [{prefix:_pns.localeResourcePrefix,args:arguments}].concat(arguments));
    };

debugCustomActionMethod = function(pivotObj, userData)
{
    alert("Dialog(" + JSON.stringify(userData) + ") function called");
};

_pns.ApplicationPivotUtilities = function ApplicationPivotUtilities(pivotObject,handler,config){
	//var that=this; // The this refers to the handler class
	var  pivotUtilities={
			// You need to explicitly enable the comment and graph capabilities. Default was set to false.
				comment:{
					enable:false,
					flyout:{
						position:"right",
						top:0
					},
					options:{
						 user:"",
						 anchorToParent:true,
						 subMaxLength:255,
						 descMaxLength:255,
						 enableReasonCodeSupport:false,
						 defaultReasonCode : "None",
						 imgPath : pivotObject.getImgPath(),
						 mandatory : ['subject','description'],
						 optional :[/*'subject','description'*/],
						 isReadOnly:false,
						 executeAction:function(e,data){
							pivotObject.executeComment(e,data);
						 },
						 getLocaleString:function(text){
							 if(arguments && arguments.length == 3){
								 return pivotObject.getLocaleString(text, arguments[1], arguments[2]);	 
							 }
						    return pivotObject.getLocaleString(text);
						 },
						 getFormattedDate:function(date){
							var formattedDate = null;
							
							return formattedDate;
						 },
						 getCellFormattedValue:function(cellId, content){
							 return pivotObject.getCellFormattedValue(content, pivotObject.getDecimalFromCellId(cellId));
						 },
						 getPivotObj:function(){
							 return pivotObject;
						 },
					},
					validators:{
						/*text:function(text){
							if((text.replace(/#|@|\$|%|\^|&|~/g,'*')!==text))
							{
								return {msg : pivotObject.getLocaleString('Comment.InvalidCharacter')};
							}
							return false;	
						},	
						subject:function(text){
							if(text.length>20){
								
								return {msg: pivotObject.getLocaleString('Comment.LengthExceed')};
							}
							return false;
						},
						description:function(text){
							if(text.length>50){
								return {msg: pivotObject.getLocaleString('Comment.LengthExceed')};
							}
							return false;
						},*/
						},
					hooks:{
						beforeEdit:function(comment){
							pivotlog("commentBeforeEdit  -->"+comment.cmtId);
						},
						afterEdit:function(comment, cell){
							pivotlog("commentAfterEdit  -->"+comment.cmtId);
						},
						onEditCancel:function(){
							pivotlog("comment cancel Edit  -->");
						},
						beforeSave:function(comment){
							pivotlog("comment before save  -->"+comment.cmtSubj);
						},
						afterSave:function(comment, cell){
							pivotlog("comment after save  -->"+comment.cmtSubj);
						},
						beforeDelete:function(cmtId){
							pivotlog("comment before delete  -->"+cmtId);
						},
						afterDelete:function(cmtId){
							pivotlog("comment After Delete   -->"+cmtId);
						}
					}
				},
				graph:{
					enable:false,
					flyout:{
						position:"bottom"
					},
					options:{
						anchorToParent:true,
						imgPath : pivotObject.getImgPath(),
						interactiveToSettings:true,// get interactive response when graph settings changes occurs 
						delayTimeout:500,	
						settingsCollapse:false,
						clickContextCallBack : function(params){
							
						},
						chartProperties:{	
							minLabelChars: 11,
							yAxisLabelSeparator: "/"
						},
						widgetProperties:{
							noCellValue: "N/A",
							Value: "Value",
							Measure:"Measure",
							topLevelName:"TOP LEVEL",
							Scenario:"Scenario",
						},
						executeAction:function(e,data){
							pivotObject.executeGraph(e,data);
						},
						getLocaleString:function(text, param1, param2){
						    return pivotObject.getLocaleString(text, param1, param2);
						},
						graphNameMaxLength:255,
					},
					validators:{
						checkInvalidCharacters: function (graphName){
							 var temp = graphName;
							 if((graphName.replace(/#|@|\$|%|\^|&|~|<|>/g,'*') !== temp)){
									return false;
							 }else{
									return true;
							 }
						}
					},
					hooks:{
						afterSave : function(){
						},
						afterDelete : function(){

						}
					}
				},
				cf:{
					enable:false,
					flyout:{
						position: "right",
			            positionFixed: false,
			            width: 500,
			            top: 40,
			            textOrientation: "tb"
					},
					options:{
						 anchorToParent:true,
						 imgPath : pivotObject.getImgPath(),
						 executeAction:function(e,data){
								pivotObject.executeCF(e,data);
							},
						 getLocaleString:function(text){
						    return pivotObject.getLocaleString(text);
						 },
						 getFormattedDate:function(date){
							var formattedDate = null;

							return formattedDate;
						 }
					},
				},
                datafilter:{
                    enable:false,
                    options:{
                    	filterNameMaxLength:255,
                    	imgPath : pivotObject.getImgPath(),
                    	executeAction:function(data){
							pivotObject.executeDataFilter(data);
						 },
						 blackListFacets : [/*'Calendar'*/],
						 //filterSelectAllOption: false,
						 formatCellSelectAllOption: false,
                    },
                    validators:{
						checkInvalidCharacters: function (filterName){
							 var temp = filterName;
							 if((filterName.replace(/#|@|\$|%|\^|&|~|<|>/g,'*') !== temp)){
									return false;
							 }else{
									return true;
							 }
						}
					},
                    hooks:{
                    	enableOrDisableEvaluateButton : function(enable){
                    		if(enable){
                    			 $("#evaluateDataFiltersDiv").prop("disabled", false);
                    		}else{
                    			 $("#evaluateDataFiltersDiv").prop("disabled", true);
                    		}
                    	},
                    	getAppliedDataFilters : function(){
                    		pivotObject.getDataFilterController().getAppliedDataFilters();
                    	},
                    	removeDataFilter : function(filterId) {
                    		pivotObject.getDataFilterController().removeDataFilter(filterId);
                        }
                    }
               },
               measurefilter:{
            	   enable:false,
                   options:{
                   	filterNameMaxLength:255,
                   	imgPath : pivotObject.getImgPath(),
                   	executeAction:function(data){
							pivotObject.executeMeasureFilter(data);
						 },
                   },
                   validators:{
						checkInvalidCharacters: function (filterName){
							 var temp = filterName;
							 if((filterName.replace(/#|@|\$|%|\^|&|~|<|>/g,'*') !== temp)){
									return false;
							 }else{
									return true;
							 }
						}
					},
                   hooks:{
                   }
               },
	};
	
	//$(config,pivotUtilities);
	return pivotUtilities;
};

_pns.ApplicationPivotHandlers = function ApplicationPivotHandlersF(pivotObject,config)
{
    var itemLoc = 10000;
    config = config || {};
    var pivotUtil = new _pns.ApplicationPivotUtilities(pivotObject,this,config);
    config.pivotUtil = pivotUtil;
     // Overriding command configuration sample code
    /*config.commandConfig={
    		GetSegmentDataRequest:{
    			enableLongPolling:false,
    			pollingTimeout:2000,
    			showDialog:true
    		}
    };*/
    var pivotHandlers =
        {
            supportMultiSort: true,
            supportPersistentChangeHighlight: false,
            cellTemplate : 'BasicCellTemplate',            
            statusBarDivId : "demandWorkSheetStatusBar",
            renderers:{
                tooltip:{
/*                    measure:function(measureOjb)
                    {
                        // For examples purposes
                          return JSON.stringify(measureOjb);
                      //  return "My tooltip measure";
                    }
*/                }
            },
            hooks : {
                beforeEdit : function(id, cellContent, newLockMode)
                {
                    /*
                     * var cellIdDescriptionObj=this.getCellIdDescriptionObj(id);
                     * 
                     * if (cellContent.content!=='__Nv__') { //If there is a value half it before start editing
                     * cellContent.content=""+MathUtilities.parseFloat(cellContent.content)/2; }
                     */
                    return true;
                },
                afterEdit : function(id, newContent, cellContent)
                {
                    /*
                     * // Reduce the entered value by 10% before sending it to server.
                     * newContent.value=""+MathUtilities.parseFloat(newContent.value)*1.15;
                     */
                    return true;
                },
				
				// after multi edit, before sending to the server 
				// only invoked when the pivot is in multi-edit mode
				afterMultiEdit : function(id, newContent, cellContent)
				{
					// Locate the buttons by their IDs, and enable all 
					// of them. (Here is an example of using jQuery on
					// a pair of buttons for each command)
			   
//					var $enableCalculate=$("#pivotCalculateMultiEdit");
//					var $disableCalculate=$("#pivotCalculateMultiEditDisabled");
//					var $enableUndo =$("#pivotUndoMultiEdit");
//					var $disableUndo=$("#pivotUndoMultiEditDisabled");
//					var $enableAllUndo =$("#pivotUndoAllMultiEdit");
//					var $disableAllUndo=$("#pivotUndoAllMultiEditDisabled");
//					
//					if($enableCalculate) { $enableCalculate.show(); }
//					if($disableCalculate) { $disableCalculate.hide(); }
//					if($enableUndo) { $enableUndo.show(); }
//					if($disableUndo) { $disableUndo.hide(); }
//					if($enableAllUndo) { $enableAllUndo.show(); }
//					if($disableAllUndo) { $disableAllUndo.hide(); }
					
					//MDAP-2571-Changes not reflected on cells when CalcEngine.Calculate() method is called in multiEdit true mode in code
					if(newContent && newContent.lock && newContent.lock == _pns.Constants.PhysLock){
                		var _selectedCellDiv = pivotObject._locateCellDiv(id);
                		pivotObject.toggleLock(_selectedCellDiv,_pns.Constants.PhysLock);
                	 }
					
					return true;
				},

				// after undo or after undo all, after returned from server
				// only invoked when the pivot is in multi-edit mode
				afterUndoEdit : function(event)
				{
					// Only disable the buttons after all the pending changes
					// are undone. Otherwise, no need to adjust the states of 
					// the buttons (keep them enabled).
					if(event.undoAll){
						// Locate the buttons by their IDs, and disable all 
						// of them. (Here is an example of using jQuery on
						// a pair of buttons for each command)
						
//						var $enableCalculate=$("#pivotCalculateMultiEdit");
//						var $disableCalculate=$("#pivotCalculateMultiEditDisabled");
//						var $enableUndo =$("#pivotUndoMultiEdit");
//						var $disableUndo=$("#pivotUndoMultiEditDisabled");
//						var $enableAllUndo =$("#pivotUndoAllMultiEdit");
//						var $disableAllUndo=$("#pivotUndoAllMultiEditDisabled");
//
//						if($enableCalculate) { $enableCalculate.hide(); }
//						if($disableCalculate) { $disableCalculate.show(); }
//						if($enableUndo) { $enableUndo.hide(); }
//						if($disableUndo) { $disableUndo.show(); }
//						if($enableAllUndo) { $enableAllUndo.hide(); }
//						if($disableAllUndo) { $disableAllUndo.show(); }
					}
					
					return true;
				},

				// after calculate, after returned from the server
				// only invoked when the pivot is in multi-edit mode
				afterCalculate : function(event)
				{
					// Locate the buttons by their IDs, and disable all 
					// of them. (Here is an example of using jQuery on
					// a pair of buttons for each command)
					
//					var $enableCalculate=$("#pivotCalculateMultiEdit");
//					var $disableCalculate=$("#pivotCalculateMultiEditDisabled");
//					var $enableUndo =$("#pivotUndoMultiEdit");
//					var $disableUndo=$("#pivotUndoMultiEditDisabled");
//					var $enableAllUndo =$("#pivotUndoAllMultiEdit");
//					var $disableAllUndo=$("#pivotUndoAllMultiEditDisabled");
//
//					if($enableCalculate) { $enableCalculate.hide(); }
//					if($disableCalculate) { $disableCalculate.show(); }
//					if($enableUndo) { $enableUndo.hide(); }
//					if($disableUndo) { $disableUndo.show(); }
//					if($enableAllUndo) { $enableAllUndo.hide(); }
//					if($disableAllUndo) { $disableAllUndo.show(); }

					return true;
				},
                afterCommit : function(event)
                {
                    return true;
                },
                afterPublish : function(event)
                {
                    return true;
                },
                afterGetStatus : function(status)
                {
                    return true;
                },
                afterUpdate : function(changedValues, changedCellId)
                {
                    pivotlog('Post update. Changeds values are: %o',changedValues);
                },
                afterPaste : function(changedValues)
                {
                    pivotlog('After paste operation.');
                    if(changedValues && changedValues.length > 0){
                    	for(var i=0;i<changedValues.length;i++){
                        	var changedValue = changedValues[i];
                        	pivotlog('Old value: %o \t New value: %o',changedValue.oldValue,changedValue.newValue);
                        }
                    }
                },
                refreshPivotSettings : function(event)
                {
                    return true;
                },
                drawScenarioLabel : function(scenarioLabel)
                {
                    return true;
                },

                onSuccessImportExcel : function(numberOfUpdatedCells, warningMessages, fileName) {
                	var importSummary = "";
                	for(var i=0; i<warningMessages.length; i++){
                		if(warningMessages[i].measureName)
                			importSummary  += warningMessages[i].measureName + " ";
                		
                		importSummary  += warningMessages[i].reason + " ";
                		if(warningMessages[i].memberDetails){
                			var memberDetails = warningMessages[i].memberDetails;
                			for(var j=0; j<memberDetails.length; j++){
                				if(j > 0){
                					importSummary += "-";
                				}
                        		importSummary  += memberDetails[j].dimensionName + ":";
                        		importSummary  += memberDetails[j].memberName;
                    		}   
                			importSummary  +=  "\n";	
                		}
            		}   
                	alert(fileName + " " + pivotObject.getLocaleString('ImportExcel.Successful') + "\n" + 
                		  pivotObject.getLocaleString('ImportExcel.TotalUpdatedCells')  + ": " +numberOfUpdatedCells+ "\n" + 
                		  pivotObject.getLocaleString('ImportExcel.AlertSummary') +"\n"+  importSummary);
                },
                onFailureImportExcel : function(numberOfUpdatedCells, exceptionMessages, fileName) {
                	var importSummary = "";
                	for(var i=0; i<exceptionMessages.length; i++){
                		if(exceptionMessages[i].measureName)
                			importSummary  += exceptionMessages[i].measureName + " ";
                		
                		importSummary  += exceptionMessages[i].reason + " ";
                		if(exceptionMessages[i].memberDetails){
                			var memberDetails = exceptionMessages[i].memberDetails;
                			for(var j=0; j<memberDetails.length; j++){
                				if(j > 0){
                					importSummary += "-";
                				}
                        		importSummary  += memberDetails[j].dimensionName + ":";
                        		importSummary  += memberDetails[j].memberName;
                    		}   
                			importSummary  +=  "\n";	
                		}
            		} 
                	alert(fileName + " " + pivotObject.getLocaleString('ImportExcel.Failed') + "\n" + 
                			pivotObject.getLocaleString('ImportExcel.TotalUpdatedCells')  + ": " +numberOfUpdatedCells + "\n" + 
                			pivotObject.getLocaleString('ImportExcel.ExceptionSummary') +"\n"+  importSummary);
                },
                 handleScenarios : function (scenarios){
                	 showScenarios(scenarios, pivotObject);
                 },
                 handleScenarioOperations : function (operation, scenarios){
                	 handleScenarioForOperations(operation, scenarios, pivotObject);
                 },
                 showScenarioExcpetionMessage : function (exceptionMessaage){
                	 alert(exceptionMessaage);
                 }
            },
            validators : {
                'all' : [ function(id, value, cellData)
                {
                    pivotlog('About to check all is empty');
                    if (value === "")
                    {
                        pivotlog('all is empty');

                        return {
                            msg : this.getLocaleString('error.empty')
                        };
                    }
                    return false;
                }, function(id, value, cellData)
                {
                    return false;
                } ],
                'double' : [ function(id, value, cellData)
                {
                
                	                	
                	if(!MathUtilities.isNumber(value)){
                		return {
                            msg : this.getLocaleString('error.number')
                        };
                	}                	
                    /***************************************************************************************************
                     * pivotlog('About to check double is negative'); if (value < 0) {
                     * 
                     * pivotlog('double is negative'); return { msg : this.getLocaleString('error.negative') }; }
                     */
                    return false;
                }, function(id, value, cellData)
                {
                    if (!(typeof (value) != "boolean" && !isNaN(MathUtilities.parse(value))))
                    {
                        pivotlog('value is not a number');
                        return {
                            msg : this.getLocaleString('error.number')
                        };

                    }
                    return false;
                }, function(id, value, cellData)
                {
                    var cellValueRange = [ -9999999999999.99, 9999999999999.99 ];
                    var maxVal = cellValueRange[1];
                    var minVal = cellValueRange[0];
                    if ((MathUtilities.parseFloat(value) > maxVal) || (MathUtilities.parseFloat(value) < minVal))
                    {
                        pivotlog('value is not in the range of %d and %d', minVal, maxVal);
                        return {
                            msg : this.getLocaleString('error.range', minVal, maxVal)
                        };
                    }
                    return false;
                } ],
                'integerrange' : [ function(id, value, cellData)
                             {	                	
                             	if(!MathUtilities.isNumber(value)){
                             		return {
                                         msg : this.getLocaleString('error.number')
                                     };
                             	}                	
                                 /***************************************************************************************************
                                  * pivotlog('About to check double is negative'); if (value < 0) {
                                  * 
                                  * pivotlog('double is negative'); return { msg : this.getLocaleString('error.negative') }; }
                                  */
                                 return false;
                             }, function(id, value, cellData)
                             {
                                 if (!(typeof (value) != "boolean" && !isNaN(MathUtilities.parse(value)) && MathUtilities.isInteger(value)))
                                 {
                                     pivotlog('value is not a number');
                                     return {
                                         msg : this.getLocaleString('error.number')
                                     };

                                 }
                                 return false;
                             }],
                'doublerange' : [
                 	function(id, value, cellData)
 	                {
 	                	if(!MathUtilities.isNumber(value)){
 	                		return {
 	                            msg : this.getLocaleString('error.number')
 	                        };
 	                	}                	
 	                    /***************************************************************************************************
 	                     * pivotlog('About to check double is negative'); if (value < 0) {
 	                     * 
 	                     * pivotlog('double is negative'); return { msg : this.getLocaleString('error.negative') }; }
 	                     */
 	                    return false;
 	                }, function(id, value, cellData)
 	                {
 	                    if (!(typeof (value) != "boolean" && !isNaN(MathUtilities.parse(value))))
 	                    {
 	                        pivotlog('value is not a number');
 	                        return {
 	                            msg : this.getLocaleString('error.number')
 	                        };
 	
 	                    }
 	                    return false;
 	                }, function(id, value, cellData)
 	                {
 	                    var cellValueRange = [ -9999999999999.99, 9999999999999.99 ];
 	                    var maxVal = cellValueRange[1];
 	                    var minVal = cellValueRange[0];
 	                    if ((MathUtilities.parseFloat(value) > maxVal) || (MathUtilities.parseFloat(value) < minVal))
 	                    {
 	                        pivotlog('value is not in the range of %d and %d', minVal, maxVal);
 	                        return {
 	                            msg : this.getLocaleString('error.range', minVal, maxVal)
 	                        };
 	                    }
 	                    return false;
 	                }
                ],
                'string' : [ function(id, value, cellData)
                {
                    return false;
                }, function(id, value, cellData)
                {
                    return false;
                } ],
                
                'duration' : [ function(id, value, cellData){
                				if(value){
                             		var formattedValue = this.stripNonDurations(value, true);//This will strip the invalid characters. If all are invalid, then return blank.
                             		//formattedValue is not defined or not equal to entered value(i.e. some/all are invalid characters), then it's an invalid value.
                             		if(!formattedValue || formattedValue != value){
										return {
									        msg : this.getLocaleString('error.number')
									    };
                             		}
                             	}
                                 return false;
                             }],

            },
            actions : {
                cellContextMenu : {
                    enable : false,
                    blackListItems : [/*'sorting','locking','dynnav','comment','datafilter',*/'RefreshAllData'],
                    getApplicableItems : function(pivotObject, cellNode,coreItems)
                    {
                        var allItems=[];
                        if (coreItems && _.isArray(coreItems))
                        {
                            allItems=coreItems.concat(this.getCustomItems());
                        }                            
                        var retVals = [];
                        if (cellNode)
                        {
                            var cellId = pivotObject.locateCell(cellNode[0]);
                            var cellLocation = new _pns.CellLocation(cellId);
                            var sortParams=pivotObject._getCubeDefinitionSortParams();
                            var isSortLocation=sortParams&&sortParams[0].compareSortLocation(cellLocation);
                            var populatedCellOperations=['unlockCell','temporaryLockCell','fixedLockCell'];
                            
                            for ( var iItem = 0; iItem < allItems.length; iItem++)
                            {
                                var item = allItems[iItem];
                                if (!$(cellNode).hasClass('naValue')&&(populatedCellOperations.indexOf(item.name)>-1))
                                {                                                                       
                                    var currVal = pivotObject.getValueFromAxisLocation(cellId);
                                    
                                    var isLocked = currVal.lock;
                                    
                                    if(!currVal.canLock || currVal.canLock === ""){
                                        // If the cell is unlockable, then no need for 
                                        // any of the locking-related menu items.
                                        continue;
                                    }
                                    
                                    if (!isLocked)
                                    {
                                        if (item.name == 'unlockCell')
                                        {
                                            continue;
                                        }
                                        if (item.name == 'temporaryLockCell' && currVal.canLock != 'TMP')
                                        {
                                            continue;
                                        }
                                        if (item.name == 'fixedLockCell' && currVal.canLock != 'PHY')
                                        {
                                            continue;
                                        }
                                        if ((!currVal.canLock) &&
                                                (item.name == 'temporaryLockCell' || item.name == 'fixedLockCell'))
                                        {
                                            continue;
                                        }
                                    }
                                    if (isLocked && (item.name !== 'unlockCell'))
                                    {
                                        continue;
                                    }
                                    retVals.push(item);                                
                                }
                                else if ((populatedCellOperations.indexOf(item.name)===-1)){
                                    if(item.name == 'datafilter' && pivotObject.data.cube.definition.availableScenarios && pivotObject.data.cube.definition.availableScenarios.length > 1){
                                    	item.enabled = false;
                                    }
                                    retVals.push(item); 
                                }
                            }
                        }
                        return retVals;
                    },
                    items : [ {
                        type : "item",
                        name : "RefreshAllData",
                        label : "Refresh Pivot Setting",
                        location : itemLoc++,
                        click : function(pivotObject, userData)
                        {
                            pivotObject.refreshAllSettings();
                        }
                    }, {
                        type : "item",
                        name : "temporaryLockCell",
                        label : _pns.getPivotLocaleString('lockType.TMP'),
                        location : itemLoc++,
                        click : function(userData)
                        {
                            var _selectedCellDiv = pivotObject._locateCellDiv(userData.id);
                            pivotObject.toggleLock(_selectedCellDiv, _pns.Constants.TempLock);
 //                           wsPublisher();
                            // debugCustomActionMethod(pivotObject,userData);
                        }
                    }, {
                        type : "item",
                        name : "unlockCell",
                        label : _pns.getPivotLocaleString('unlockCell'),
                        location : itemLoc++,
                        click : function(userData)
                        {
                            var _selectedCellDiv = pivotObject._locateCellDiv(userData.id);
                            pivotObject.toggleLock(_selectedCellDiv, "");
                            // debugCustomActionMethod(pivotObject,userData);
                        }
                    }, {
                        type : "item",
                        name : "fixedLockCell",
                        label : _pns.getPivotLocaleString('lockType.PHY'),
                        location : itemLoc++,
                        click : function(userData)
                        {
                            var _selectedCellDiv = pivotObject._locateCellDiv(userData.id);
                            if (pivotObject.isCellEditable(userData.id))
                            {
                                var currVal = pivotObject.data.getCellValFromCellId(userData.id);
                                currVal.translock = _pns.Constants.PhysLock;
                                pivotObject.startEdit(userData.id, currVal.translock);
                                // once the editing is started, the input field will
                                // handle furthur key strokes, so disarm the table.
                                // pivotObject._editDisarm();
                                // pivotObject.toggleLock(_selectedCellDiv,_pns.Constants.PhysLock,true);
                            }

                            // debugCustomActionMethod(pivotObject,userData);
                        }
                    },                    
                    {
                        type : "item",
                        name : "comment",
                        label : _pns.getPivotLocaleString('Comment.ShowComment'),
                        location : itemLoc++,
                        click : function(pivotObj, userData)
                        {  
                        	var controller = pivotObject.getPivotController();
                        	// open comment panel
                        	if(controller){
                        		
                        		controller.activateComment();
                        	}
                        	
                        }
                    },
                    {
                        type : "item",
                        name : "datafilter",
                        label : _pns.getPivotLocaleString('DataFilter.CellContext.AddNewFilter'),
                        location : itemLoc++,
                        click : function(pivotObj, userData)
                        {  
                        	if(pivotObject){
                        		pivotObject.showAddDataFilterConfigWindow(pivotObj.id);
                        	}
                        }
                    },
                    {
                        type : "item",
                        name : "measurefilter",
                        label : _pns.getPivotLocaleString('MesureFilter.CellContext.AddNewFilter'),
                        location : itemLoc++,
                        click : function(pivotObj, userData)
                        {  
                        	if(pivotObject){
                        		pivotObject.showAddMeasureFilterConfigWindow(pivotObj.id);
                        	}
                        }
                    }/***********************************************************************************************
                         * , { type : "item", name : "PriceStrategy", label : "Price Strategy", click :
                         * function(pivotObject,userData){
                         * pivotObject.sendGenericRequest('com.manu.scpoweb.common.pivot.broker.protocol.GenericSampleRequest',{'currentValue':userData.cell.content,'paramA':'valueA','paramB':'valueB','paramC':'paramC'},debugCustomActionMethod); } }
                         **********************************************************************************************/
                    ]
                },
                facetContextMenu : {
                    enable : false,
                    items : [],
                    blackListItems : [/*'moveToAxis','swapWithFacet','viewFacet','viewFacetLevel','anchorFacetMember'*/],
                    hooks:{
                    	hideSwapFacet:function(facet){
                    		//pivotlog("facet Object is %o ", facet);
                    		/*if(facet.name.toUpperCase() === "time".toUpperCase()){
                    			return true;
                    		}*/
                    		
                    		return false;
                    	},
                    	hideMoveFacet:function(facet){
                    		
                    	/*if(facet.name.toUpperCase() === "time".toUpperCase()){
                			return true;
                		}*/
                    		return false;
                    	},
                    	hideShowTotal:function(facet){
                    		/*if(facet.name == "Time"){
                    			return true;
                    		}*/
                    		return false;
                    	}                    	
                    }
                },
                measureContextMenu : {
                    enable : false,
                    items : [],
                    blackListItems : [/*'viewMeasure','moveMeasureToAxis','moveMeasureToAxis'*/],
                    hooks:{
                    	hideMeasure:function(measure){
                    		return false;
                    	}
                    }
                },
                selectionContextMenu : {
                    enable : false,
                    items : [],
                    blackListItems : [/***/]
                }
            }
        
        };
    $.extend(pivotHandlers,config);
    return pivotHandlers;
}

}); //End of wrapping onReady init


