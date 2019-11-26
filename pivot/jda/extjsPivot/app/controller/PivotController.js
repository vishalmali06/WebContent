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
				'JdaPivotApp.controller.PivotController',
				{
					extend : 'Ext.app.Controller',
					id : 'pivotcontroller',
					views : [ 'ExtJSPivotViewport', 'CFWrapper' ],
					requires : [ 'Ext.data.Store', 'Ext.grid.Panel',
							'JdaPivotApp.view.RuleWindow','JdaPivotApp.view.CopyDialog','JdaPivotApp.view.BusinessGraphConfigWindow',
							'Ext.window.MessageBox','JdaPivotApp.view.businessgraph.ChartTitleDialog', 'JdaPivotApp.view.businessgraph.DeleteGraphDialog',
							'JdaPivotApp.view.ProcessingDialog','JdaPivotApp.view.businessgraph.DeleteItemDialog','JdaPivotApp.view.common.DeleteConfirmDialog',
							'JdaPivotApp.view.common.SaveAsNameDialog','JdaPivotApp.view.common.PivotItemSelector'],
					models : [ 'StyleRule', 'Pair' ,'Filter'],
					stores : [ 'StyleRule', 'Measures', 'BusinessGraphs'],
					refs : [ {
						ref : 'pivotViewPort',
						selector : '#pivotviewport'
					},{
						ref : 'pivotFilter',
						selector : '#pivotfilter'
					}, {
						ref : 'pivotWrapper',
						selector : '#pivotwrapper'
					}, {
						ref : 'commentWrapper',
						selector : '#commentwrapper'
					}, {
						ref : 'graphWrapper',
						selector : '#graphwrapper'
					}, {
						ref : 'businessGraphWrapper',
						selector : '#businessgraphwrapper'
					},{
						ref : 'commentCard',
						selector : '#commentcard'
					}, {
						ref : 'graphCard',
						selector : '#graphcard'
					},{
						ref : 'businessGraphCard',
						selector : '#businessgraphcard'
					}, {
						ref : 'styleCard',
						selector : '#stylecard'
					},  {
						ref : 'southContainer',
						selector : '#southcontainer'
					}, {
						ref : 'pivotSouthPanel',
						selector : '#pvtsouthpanel'
					}, {
						ref : 'commentbtn',
						selector : '#commentbtn'
					}, {
						ref : 'pivotUtilToolbar',
						selector : '#pivotUtilToolbar'
					},{
						ref : 'graphbtn',
						selector : '#graphbtn'
					}, {
						ref : 'businessgraphbtn',
						selector : '#businessgraphbtn'
					},{
						ref : 'validateBtn',
						selector : '#validateBtn'
					}, {
						ref : 'stylebtn',
						selector : '#stylebtn'
					}, {
						ref : 'closeBtn',
						selector : '#closebtn'
					}, {
						ref : 'styleRuleGrid',
						selector : '#stylerulegrid'
					}, {
						ref : 'ruleWindow',
						selector : '#rulewindow'
					}, {
						ref : 'ruleForm',
						selector : '#ruleform'
					},{
						ref : 'businessGraphConfigWindow',
						selector : '#businessgraphconfigwindow'
					},
					{
						ref : 'chartTitleDialog',
						selector : '#charttitledialog'
					},
					{
						ref : 'deleteGraphDialog',
						selector : '#deletegraphdialog'
					},
					{
						ref : 'ruleSaveBtn',
						selector : '#dialogsavebtn'
					}, {
						ref : 'messageWindow',
						selector : '#pvtMsgDialog'
					},{
						ref : 'searchFilterText',
						selector : '#searchfiltertext'
					},{
						ref : 'copyDialog',
						selector : '#copydialog'
					},{
						ref : 'copyDialogForm',
						selector : '#copydialogform'
					},{
						ref : 'editgraphconfigbtn',
						selector : '#editgraphconfigbtn'
					},
					{
						ref : 'processingDialog',
						selector : '#processingdialog'
					},
					{
						ref : 'filtersbtn',
						selector : '#filtersbtn'
					},
					{
						ref : 'filtersCard',
						selector : '#filterscard'
					},
					{
						ref : 'filtersWrapper',
						selector : '#filterswrapper'
					},
					],
					config : {
						action : 'addRule',
						expressionModified : false,
						refreshPivotData : false,
						imgPath : "",
						editedRule:{},
						panelExpanding:false
					},
					init : function() {
						var me = this;
						me.callParent(arguments);
						this
								.listen({
									controller : {
										'*' : {
											validaterule : this.validateRule
										}
									},
									component : {
										'#dimensionId' : {
											focus : function() {
												pivotlog("Dimension got focus in ");
											},
											blur : function() {
												pivotlog("Dimension got focus out ");
											}
										},
										'#commentbtn' : {
											click : this.activateComment
										},
										'#graphbtn' : {
											click : this.activateGraph
										},
										'#businessgraphbtn' : {
											click : this.activateBusinessGraph
										},
										'#stylebtn' : {
											click : this.activateStyle
										},
										
										'#addrulebtn' : {
											click : this.showRuleWindow
										},
										'#closebtn' : {
											click : this.hideSouthPanel
										},
										'#pvtsouthpanel' : {
											resize : function(me, width,
													height, oldWidth, oldHeight) {
												if (height < this.self.MIN_HEIGHT)
													me.setSize(width,this.self.MIN_HEIGHT);
												else{
													me.setSize(width,height);
												}
												//me.doLayout();
												me.updateLayout();
											},
											expand : function(panel) {
												this.getCloseBtn().show();
												this.setPanelExpanding(true);
											},
											collapse : function(panel) {												
												this.setPanelExpanding(false);
											}
										},
										'#stylerulegrid ' : {
											cellclick : this.showRule
										},
										'#stylerulegrid dataview' : {
											drop : function(node, data,
													overModel, dropPosition,
													opts) {
												var post = overModel.data.id;

												me
														.changeRulePriority(
																data.records[0].data.ruleId,
																post);
											}
										},
										'#rulewindow' : {
											beforeshow : this.prepareRuleWindow
										},
										'#dialogsavebtn' : {
											click : this.saveRule
										},
										'#dialogcancelbtn' : {
											click : this.cancelDialog
										},
										'#msgokbtn' : {
											click : function() {
												var data = me
														.getMessageWindow().data;
												me.deleteRule(data);

											}
										},
										'#msgcancelbtn' : {
											click : function() {
												me.getMessageWindow().close();
											}
										},
										'#expressionarea' : {
											change : function() {
												me.getValidateBtn().setIcon(me.getImgPath()+'commitOff.png');
												me.getValidateBtn().btnIconEl.addCls('j-cf-validate-rule');
												me.setExpressionModified(true);
												me.getRuleForm().validationSuccess=false;
												// this.validateRuleForm();
											}
										},
										'#pivotfilterpanel' :{										
											beforeexpand:function(){
												//me.getPivotFilter().getEl().dom.title = 'Requires Filter to be added';
												return me.getPivotFilter().hasFilterItem();
											}
										},
										'#searchfiltertext' :{
											keyup:{
												fn:function(e,opt,x,y,z){
													pivotlog(" key up " +e.value+" ----> "+e.rawValue);
													me.getPivotFilter().fireEvent('filterBy',e.value);
												},
												buffer: 1000
												
											}						
										},
										'#filterSubmitbtn':{
											click:function(){
												var records=me.getPivotFilter().getCheckedAllRecords();
												pivotlog("records %o",records);
												me.sendFilteredRecord(records);
											}
										},
										'#copydialogcopybtn' :{
											click : this.copyDataToClipboard
										},
										'#copydialogcancelbtn' :{
											click : function() {
												me.closeCopyDialog(true);
											}
										},
										'#addgraphconfigbtn' : {
											click : this.showBusinessGraphConfigWindow
										},
										'#businessgraphsavebtn' :{
											click : function() {
												me.saveBusinessGraphConfig(this.self.SAVE_GRAPH_CONFIG);
											}
										},
										'#businessgraphcancelbtn' :{
											click : function() {
												me.closeBusinessGraphConfigWindow();
											}
										},
										'#editgraphconfigbtn' :{
											click : function() {
												var selGraphId = Ext.getCmp('graphscombo').value;
												if(selGraphId){
													var params = {
															operation : this.self.EDIT_GRAPH_CONFIG,
															graphId : selGraphId
														};
													me.sendBusinessGraphRequest(params);
												}
											}
										},
										'#businessgraphsaveasbtn' :{
											click : function() {
												me.showChartTitleDialog(this.self.SAVEAS_GRAPH_CONFIG);
											}
										},
										'#charttitledialogsavebtn' :{
											click : function() {
												me.saveBusinessGraphConfig(this.self.SAVEAS_GRAPH_CONFIG);
											}
										},
										'#charttitledialogcancelbtn' :{
											click : function() {
												me.closeChartTitleDialog();
											}
										},
										'#businessgraphdeletebtn' :{
											click : function() {
												me.showDeleteGraphConfirmDialog();
											}
										},
										'#deletegraphdialogokbtn' :{
											click : function() {
												me.deleteBusinessGraphConfig(this.self.DELETE_GRAPH_CONFIG);
											}
										},
										'#deletegraphdialogcencelbtn' :{
											click : function() {
												me.closeDeleteGraphDialog();
											}
										},
										'#processingdialogcencelbtn' :{
											click : function() {
												me.cancelProcessingRequest();
											}
										},
										'#filtersbtn' : {
											click : this.activateFilters
										},
									}
								});
					},
					getDataFilterController : function(){
						return JdaPivotApp.getApplication().getDataFilterController()
					},
					showProcessingDialog:function(imageLoc, displayMsg, cancelBtnText){
						this.setExpressionModified(false);
						var processingDialog = Ext.widget('processingdialog', {
							imageLoc:imageLoc, 
							displayMsg:displayMsg,
							cancelBtnText :cancelBtnText
							});
						processingDialog.show();
					},
					hideProcessingDialog:function(){
						if(this.isProcessingDialogVisible()){
							this.getProcessingDialog().close();	
						}
					},
					cancelProcessingRequest:function(){
						var pivotObj = this.getPivotWrapper().getPivot();
						if(pivotObj.canCancelRequest()){
							pivotObj.triggerEvent('requestCancelled');
							pivotObj.sendAbortRequest();
                        }else{
                        	pivotObj.triggerEvent('loadCancelled');
                        }
						this.hideProcessingDialog();
					},
					isProcessingDialogVisible: function (){
						 return (Ext.getCmp('processingdialog')) ? Ext.getCmp('processingdialog').isVisible() : false;
					},
					getSouthPanelExpanding:function(){
						return this.getPanelExpanding();
					},
					sendFilteredRecord:function(records){
						this.getPivotWrapper().getPivot()._setPivotAxesRequest(records);
					},
					
					setValidateButtonState : function(valid) {
						var button = this.getRuleForm().down('#validateBtn');
						var glyph = valid ? 0xf00c : 0xf00d; 
						var color = valid ? 'green' : 'red'; 
						this.getValidateBtn().setGlyph(glyph);
						this.getValidateBtn().btnIconEl.setStyle({
							color : color
						});
					},
					validateRuleWinForm : function(scope) {
						var form = scope.getRuleForm();
						var inValid = scope.isEmpty(form.down('textfield'))
								|| scope.isUnique(form.down('textfield'),scope)
								|| scope.isEmpty(form.down('textarea'))
								|| scope.isEmpty(form.down('combo'))
								//|| !scope.isValidMeasure(form.down('combo').getValue(), form.down('combo').store.data.keys)
								|| !scope.isValidMeasure(form.down('combo').getValue(), form.down('combo').store)
								|| scope.isEmpty(form.down('#bgcolor'))
								|| scope.isEmpty(form.down('#fontcolor'))
								|| (form.validationSuccess == false)
								&& (scope.getAction() == scope.self.ADD_RULE_OPR)
								|| (form.validationSuccess == false)
								&& (scope.getAction() == scope.self.UPDATE_RULE_OPR)
								&& (scope.getExpressionModified());
						return !inValid;
					},
					showError : function(scope) {
						var form = scope.getRuleForm();
						if (scope.isEmpty(form.down('textfield')))
							scope.showFieldError(form.down('textfield'), scope
									.getLocaleString('CF.Validation.Title'));
						else if(scope.isUnique(form.down('textfield'),scope)){
							// Make rule title unique  Validate rule title against all rule names
							scope.showFieldError(form.down('textfield'), scope
									.getLocaleString('CF.Validation.TitleExist'));
						}
							
						if ((form.validationSuccess == false)) {
							if ((scope.getAction() == scope.self.ADD_RULE_OPR)
									|| ((scope.getAction() == scope.self.UPDATE_RULE_OPR) && (this
											.getExpressionModified())))
								scope
										.showFieldError(
												form.down('textarea'),
												scope
														.getLocaleString('CF.Validation.RuleValidate'));

						}
						if (scope.isEmpty(form.down('textarea')))
							scope
									.showFieldError(
											form.down('textarea'),
											scope
													.getLocaleString('CF.Validation.Definition'));
						if (scope.isEmpty(form.down('combo'))){
							scope.showFieldError(form.down('combo'), scope.getLocaleString('CF.Validation.Measure'));
						}else if(!scope.isValidMeasure(form.down('combo').getValue(), form.down('combo').store)){
							scope.showFieldError(form.down('combo'), scope.getLocaleString('CF.Validation.ValidMeasure'));
						}
						if (scope.isEmpty(form.down('#bgcolor')))
							scope
									.showFieldError(
											form.down('#bgcolor'),
											scope
													.getLocaleString('CF.Validation.Background'));
						if (scope.isEmpty(form.down('#fontcolor'))){
							scope.showFieldError(form.down('#fontcolor'), scope.getLocaleString('CF.Validation.FontColor'));
						}
					},
					showFieldError : function(field, msg) {
						field.setActiveError(msg);
						//field.doComponentLayout();
						field.updateLayout();
					},
					clearFieldError : function(field) {
						field.unsetActiveError();
						//field.doComponentLayout();
						field.updateLayout();
					},
					isEmpty : function(field) {
						return (field.getValue() == undefined || field
								.getValue() == '');
					},
					isUnique: function(field,scope){
						var fieldText = field.getValue();
						// if current action is update then need to check for both fieldText and edited rule are same.
						// this will avoid returning unique true when apply button is clicked
						if((scope.getAction() === this.self.UPDATE_RULE_OPR) && fieldText === scope.getEditedRule().ruleTitle){
							return false;
						}
						var isValid = scope.getStyleRuleGrid().getStore().find(this.self.RULE_TITLE,fieldText,0,false,true,true);
						return isValid >= 0;
					},
					isValidMeasure : function(selectedValue, storeValues){
						return storeValues.findRecord("name",selectedValue)==-1?false:true;
					},
					validateRule : function() {
						var expression = this.getRuleForm().getValues().expression;
						var params = {
							operation : this.self.VALIDATE_RULE_OPR,
							ruleExpression : expression
						};
						this.sendAjaxRequest(params, this.call_validation);
					},
					call_validation : function(response) {
						var res = response;//JSON.parse(response);
						var me =JdaPivotApp.getApplication().getPivotController();
						if(res.validateRule){
							me.getValidateBtn().setIcon(me.getImgPath()+'ok.png');
							me.getRuleForm().validationSuccess=true;
							me.clearFieldError(me.getRuleForm().down('textarea'));
						}else{
							me.getValidateBtn().setIcon(me.getImgPath()+'cancel.png');
						}
						if(res.reloadNeeded){
							me.logRuleWinError(me.getLocaleString('CF.ReloadRule'));
						}else{
							me.clearLog();
						}					
					},
					cancelDialog : function() {
						this.getRuleWindow().close();
					},
					changeRulePriority : function(ruleId, toPosition) {

						var params = {
							operation : this.self.CHANGEPRIORITY_RULE_OPR,
							ruleId : ruleId,
							toPosition : toPosition
						};

						this
								.sendAjaxRequest(params,
										this.call_renderDataToRule);
					},
					saveRule : function(me) {
						if (this.validateRuleWinForm(this)) {
							var rule = this.getRuleForm().getValues();
							var color = this.getRuleForm().down('#bgcolor')
									.getRGB();
							var fontColor = this.getRuleForm().down('#fontcolor')
							.getRGB();

							var params = {
								operation : this.getAction(),
								cellBgColor : color,
								cellFontColor: fontColor,
								ruleExpression : rule.expression,
								ruleTitle : rule.title,
								targetMeasures : [ rule.measure ]
								//scope : CFscope
							    
							};
							if (this.getAction() == this.self.UPDATE_RULE_OPR)
								params.ruleId = this.getRuleWindow()
										.getRuleId();
							this.sendAjaxRequest(params,
									this.call_RuleOperation);
						} else {
							this.showError(this);
						}
					},
					call_RuleOperation : function(response) {
						var me = JdaPivotApp.getApplication()
								.getPivotController();
						var resObj = response;// JSON.parse(response);
						if (resObj.method == me.self.ADD_RULE_OPR
								|| resObj.method == me.self.UPDATE_RULE_OPR) {
							me.getRuleWindow().close();
						}
						if (resObj.method == me.self.DELETE_RULE_OPR) {
							me.getMessageWindow().close();
						}
						me.viewAllRules(true);
					},
					viewAllRules : function(refreshNeeded) {
						// if(refreshNeeded){
						this.setRefreshPivotData(refreshNeeded ? true : false);
						// }
						var params = {
							operation : this.self.VIEW_RULES
						};
						this
								.sendAjaxRequest(params,
										this.call_renderDataToRule);
					},
					getLocaleString : function(key, args) {
						return this.getPivotWrapper().getPivot().getLocaleString(key, args);
					},
					sendAjaxRequest : function(params, callback) {
						var config = {
							callback : callback
						};
						var updateCfRequest = new jda.pivot.updateCfRequest(
								params, config);
						var pivot = this.getPivotWrapper().getPivot();
						pivot.data.pivotCommands[updateCfRequest.id] = updateCfRequest;
						pivot.data.feed
								.call(pivot, pivot.data.url, "jda_pivot_json",
										updateCfRequest._getPayload());
					},
					showRule : function(grid, td, cellIndex, record, tr, rowIndex) {
						if(this.getPivotWrapper().getPivot().getCFWrapper().config.canModify === false){
							return false;
						}
						pivotlog(record);
						var me = this;
						var recorddata = grid.getStore().getAt(rowIndex);
						
						if (cellIndex == 0) {
							this.editRule(record.data);
						} else if (cellIndex == 5) {
							var messageWindow = Ext
							.create(
									'Ext.window.Window',
									{
										title : me
												.getLocaleString('CF.MessageDialogTitle'),
										cls : 'j-pvt-rule-dialog',
										bodyCls : 'j-pvt-rule-dialog-body',
										itemId : 'pvtMsgDialog',
										modal : true,
										paddding : 10,
										bodyBorder: false,
										border: 0,
										closable : true,
										scope : me,
										layout: {type:'vbox'},
										items : [ {
											xtype : 'label',
											text : me
													.getLocaleString('CF.ConfirmDelete'),
											style : 'color : #5E5E5E;font-weight:bold;padding:20px;'
										} ],
										buttons :  [
													{
														xtype : 'tbspacer',
														flex : 0.25
													},
													{
														type : 'button',
														text : me
																.getLocaleString('CF.Delete'),
														itemId : 'msgokbtn',
														ui : 'j-primary-button',
														cls : 'j-pvt-styling j-pvt-primary-button',
													},
													{
														type : 'button',
														text : me
																.getLocaleString('CF.Cancel'),
														itemId : 'msgcancelbtn',
														ui : 'j-standard-button',
														cls : 'j-pvt-styling j-pvt-button',
													},
													{
														xtype : 'tbspacer',
														flex : 0.25
													} ]

									});
							messageWindow.data = record.data;//As data is read-only property, we have to set it with data = record.data.
							messageWindow.show();
							grid.getSelectionModel().select(rowIndex);
						}

					},
					editRule : function(data) {
						var measures = this.getPivotWrapper().getPivot()
								._getCubeDefinition().visiblemeasures;
						var canDisableRule = this.canDisableRule(measures,data.targetMeasureName);
						this.setExpressionModified(false);
						var bgcolor = data.cellBgColor + ';background-image:none;';
						var fontcolor = data.cellFontColor + ';background-image:none;';
						var ruleWin = Ext.widget('rulewindow', {
							ruleId : data.ruleId,
							ruleTitle : data.ruleTitle,
							measures : measures,
							measure : data.targetMeasureName,
							expression : data.ruleExpression,
							//color : data.cellBgColor,
							color : bgcolor,
							fontColor: fontcolor,
							ruleDisabled:canDisableRule });
//							visibleFacets : data.visibleFacets					});
						ruleWin.setTitle(this
								.getLocaleString('CF.EditRuleDialogTitle'));
						ruleWin.show();
						this.setAction(this.self.UPDATE_RULE_OPR);
						this.setEditedRule(data);
						//var form = this.getRuleForm().getForm();
						//pivotlog("form");
					},
					canDisableRule:function(measures,targetMeasure){
						for (var i = 0, len = measures.length; i < len; i++) {
							if(measures[i].label === targetMeasure)
								return false;
						}
						return true;
					},
					deleteRule : function(data) {
						var params = {
							operation : this.self.DELETE_RULE_OPR,
							ruleId : data.ruleId
						};
						this.sendAjaxRequest(params, this.call_RuleOperation);
					},
					onCellChange : function(cellId, intersection) {
						this.getGraphWrapper().fireEvent('onCellChange',
								cellId, intersection);
					},
					prepareRuleWindow : function(win) {

					},
					showRuleWindow : function() {
						this.setAction(this.self.ADD_RULE_OPR);
						this.setExpressionModified(false);
						var measures = this.getPivotWrapper().getPivot()
								._getCubeDefinition().visiblemeasures;
					//	var visibleFacets = this.getPivotWrapper().getPivot()._getCubeDefinition().visibleFacets;
						var ruleWin = Ext.widget('rulewindow', {
							measures : measures
						});
						ruleWin.setTitle(this
								.getLocaleString('CF.AddRuleDialogTitle'));
						ruleWin.show();
					},
					showBusinessGraphConfigWindow : function() {
						this.setAction(this.self.SHOW_GRAPH_CONFIG);
						this.setExpressionModified(false);
						var measures = this.getPivotWrapper().getPivot()._getCubeDefinition().visiblemeasures;
						var graphConfigWin = Ext.widget('businessgraphconfigwindow', {
						});
						graphConfigWin.setTitle(this.getLocaleString('BusinessGraph.BuildChart'));
						graphConfigWin.show();
					},
					activateComment : function() {
						this.showSouthPanel();
						this.updateSouthPanelButtonsWithCls(this.getCommentbtn());
						this.updatePivotFlyoutOpen(this.getCommentWrapper());
						this.getSouthContainer().getLayout().setActiveItem( this.getCommentCard());
						this.getCommentCard().updateLayout();
						this.setPanelExpanding(false);
					},
					activateGraph : function() {
						this.showSouthPanel();
						this.updateSouthPanelButtonsWithCls(this.getGraphbtn());
						this.updatePivotFlyoutOpen(this.getGraphWrapper());
						this.getSouthContainer().getLayout().setActiveItem(this.getGraphCard());
						this.getGraphCard().updateLayout();
						this.setPanelExpanding(false);
					},
					activateBusinessGraph : function() {
						this.showSouthPanel();
						this.updateSouthPanelButtonsWithCls(this.getBusinessgraphbtn());
						this.updatePivotFlyoutOpen(this.getBusinessGraphWrapper());
						this.getSouthContainer().getLayout().setActiveItem(this.getBusinessGraphCard());
						this.getBusinessGraphCard().updateLayout();
						this.loadBusinessGraphs();//Load saved business graphs.
						this.setPanelExpanding(false);
						var pivotObj = this.getPivotWrapper().getPivot();
						if(pivotObj.isCellContextGraphEnabled()){
							this.getBusinessGraphWrapper().config.selectedCell = pivotObj.getSelectedCell();
						}else{
							this.getBusinessGraphWrapper().config.selectedCell = null; // nullifying to make-sure no cell context available.
						}						
					},
					activateStyle : function() {
						this.showSouthPanel();
						this.updateSouthPanelButtonsWithCls(this.getStylebtn());
						this.updatePivotFlyoutOpen();
						var styleCard = this.getStyleCard();
						this.getSouthContainer().getLayout().setActiveItem(styleCard);
						this.getStyleCard().updateLayout();
						this.setPanelExpanding(false);
					},
					activateFilters : function() {
						this.showSouthPanel();
						this.updateSouthPanelButtonsWithCls(this.getFiltersbtn());
						this.updatePivotFlyoutOpen(this.getFiltersWrapper());
						this.getSouthContainer().getLayout().setActiveItem(this.getFiltersCard());
						this.getFiltersCard().updateLayout();
						this.setPanelExpanding(false);
					},
					updateSouthPanelButtonsWithCls :function(enableClsBtn) {
						var commentbtn = this.getCommentbtn();
						var stylebtn = this.getStylebtn();
						var graphbtn = this.getGraphbtn() || this.getBusinessgraphbtn();
						var filtersbtn = this.getFiltersbtn();
						
						commentbtn && commentbtn.hasCls('j-pvt-button-selected') && commentbtn.removeCls("j-pvt-button-selected");
						stylebtn && stylebtn.hasCls('j-pvt-button-selected') && stylebtn.removeCls("j-pvt-button-selected");
						graphbtn && graphbtn.hasCls('j-pvt-button-selected') && graphbtn.removeCls("j-pvt-button-selected");
						filtersbtn && filtersbtn.hasCls('j-pvt-button-selected') && filtersbtn.removeCls("j-pvt-button-selected");
							
						enableClsBtn && enableClsBtn.addCls("j-pvt-button-selected");
					},
					updatePivotFlyoutOpen:function(southPanelWrapper) {
						this.getCommentWrapper() && this.getCommentWrapper().fireEvent('pivotFlyoutClose');
						this.getGraphWrapper() && this.getGraphWrapper().fireEvent('pivotFlyoutClose');
						this.getBusinessGraphWrapper() && this.getBusinessGraphWrapper().fireEvent('pivotFlyoutClose');
						
						southPanelWrapper && southPanelWrapper.fireEvent('pivotFlyoutOpen');
					},
					call_renderDataToRule : function(response, request) {
						var me = JdaPivotApp.getApplication()
								.getPivotController();
						var resObj = response;// JSON.parse(response);
						me.getStyleRuleGrid().getStore().loadData(
								resObj.result, false);
						me.getPivotWrapper().getPivot()
								.loadStyleDefinitionsToDocument(resObj.result);
						if (me.getRefreshPivotData()) {
							me.getPivotWrapper().getPivot().refreshAllData();
						}
						// pivotlog(resObj.result);
						pivotlog(response);
					},
					showSouthPanel : function() {
						var southPanel = this.getPivotSouthPanel();
						southPanel.expand();
					},
					hideSouthPanel : function() {
						this.getPivotSouthPanel().collapse();
						this.getCloseBtn().blur();
						this.getCloseBtn().hide();
						this.updateSouthPanelButtonsWithCls();
						
						this.updatePivotFlyoutOpen();
						var pivotObj = this.getPivotWrapper().getPivot();
						if(pivotObj){
							pivotObj._debounceFocusedCell();
						}
					},
					logRuleWinError : function(message) {
						var label = this.getRuleForm().down('#errorlabel');
						if (message && message != '') {
							label.show();
							label.setText(message);
						} else
							label.hide();
					},
					clearLog : function() {
						var label = this.getRuleForm().down('#errorlabel');
						label.setText('');
						label.hide();
					},
					showCopyDialog : function(clipBoardText,dialogText,dialogImgLoc, processingRequest) {
						this.setAction(this.self.COPY_OPR);
						this.setExpressionModified(false);
						var copyDialog = Ext.widget('copydialog', {
							clipBoardText : clipBoardText,
							dialogText : dialogText,
							dialogImgLoc : dialogImgLoc,
							processingRequest : processingRequest
						});
						copyDialog.setTitle(this.getLocaleString('Copy'));
						copyDialog.show();
						setTimeout(function(){
							copyDialog.focus();
							if(processingRequest){
								if(copyDialog.down('#copydialogcancelbtn'))
									copyDialog.down('#copydialogcancelbtn').focus();
							}else{
								copyDialog.down('#copydialogcopybtn').focus();
							}
					    }, 100);
						if(processingRequest){
							setTimeout(function(){
								copyDialog.focus();
								if(copyDialog.down('#copydialogcancelbtn'))
									copyDialog.down('#copydialogcancelbtn').focus();
						    }, 2200);
						}
					},
					copyDataToClipboard : function() {
						var form = this.getCopyDialogForm();
						var clipBoardTextObj = Ext.ComponentQuery.query('[forId=clipBoardText]', form);
						this.getPivotWrapper().getPivot().writeDataToClipboard(clipBoardTextObj[0].text);
						JdaPivotApp.getApplication().getPivotController().getCopyDialog().close();
					},
					closeCopyDialog : function(isCancelBtnClick) {
						var form = this.getCopyDialogForm();
						var pivotObj = this.getPivotWrapper().getPivot();
						if(isCancelBtnClick){
							if(pivotObj.canCancelRequest()){
								pivotObj.triggerEvent('requestCancelled');
								pivotObj.sendAbortRequest();
                        	}else{
                        		pivotObj.triggerEvent('loadCancelled');
                        	}
						}
						setTimeout(function(){
					    	var baseCell = pivotObj.selectedCellsInfo.baseCell;
				      		if(baseCell){
				      			pivotObj.select(baseCell);
				      			pivotObj.updateFocusedCell();	
				      		}
					     }, 100);
						JdaPivotApp.getApplication().getPivotController().getCopyDialog().close();
					},
					closeBusinessGraphConfigWindow: function() {
						this.getBusinessGraphConfigWindow().close();
					},
					saveBusinessGraphConfig: function(operation) {
						var graphNameObj;
						if(operation === this.self.SAVEAS_GRAPH_CONFIG){
							var chartTitleDialog = this.getChartTitleDialog();
							graphNameObj = Ext.ComponentQuery.query('[itemId=graphName]', chartTitleDialog)[0];
		                }else{
		                	graphNameObj = Ext.ComponentQuery.query('[itemId=graphName]', this.getBusinessGraphConfigWindow())[0];
		                }

						var measures = this.getYAxisInfo();
						var xAxisInfo = this.getXAxisInfo();
							var legendFieldsInfo = this.getLegendFieldsInfo();
						
		            	var data = {};
		                data.measuresIds = measures;
		                data.xAxisInfo = xAxisInfo;
			                data.legendFieldsInfo = legendFieldsInfo;
		                data.operation = operation;
		                data.graphName =graphNameObj.getValue().trim();
		               
		                if(operation !== this.self.SAVEAS_GRAPH_CONFIG){
		                	if(graphNameObj.getId().indexOf("textfield") === -1){
		                		data.graphId=graphNameObj.getId();	
		                	}
		                }
		                
	                	if(this.validateBusinessGraphConfigWindow(graphNameObj,data)){
	                		this.sendBusinessGraphRequest(data);	
	                	}
					},
					validateBusinessGraphConfigWindow : function(graphNameObj, data){
						var businessGraphConfigWindow = this.getBusinessGraphConfigWindow();
						var isValidRequest = true;
						if(!businessGraphConfigWindow.validateGraphName(graphNameObj)){
							isValidRequest = false;
						}
						if(data.measuresIds.length  == 0){
		                	isValidRequest = false;
		                	var measureLeftInfoPanelBody = Ext.ComponentQuery.query('[itemId=measureLeftInfoPanel]',businessGraphConfigWindow)[0].body;
		                	measureLeftInfoPanelBody.setStyle('border','solid Red 1px');
		                	measureLeftInfoPanelBody.set({'data-errorqtip': this.getLocaleString('BusinessGraph.Build.Validation.YaxisLeft.Required')});
						}
						//Generally it won't come to below block. Scenario present in either legend fields or in X-Axis.That's why commented.
		                /*if (data.xAxisInfo.length == 0 && data.legendFieldsInfo.length == 0){
							isValidRequest = false;
							var facetInfoPanelBody = Ext.ComponentQuery.query('[itemId=facetInfoPanel]', businessGraphConfigWindow)[0].body;
							facetInfoPanelBody.setStyle('border','solid Red 1px');
							facetInfoPanelBody.set({'data-errorqtip': this.getLocaleString('BusinessGraph.Build.Validation.Xaxis.Required')});
						}*/
		                return isValidRequest;
					},
					previewGraph: function(operation) {
						var measures = this.getYAxisInfo();
						var xAxisInfo = this.getXAxisInfo();
						var legendFieldsInfo = this.getLegendFieldsInfo();
		            	var data = {};
		                data.measuresIds = measures;
		                data.xAxisInfo = xAxisInfo;
		                data.legendFieldsInfo = legendFieldsInfo;
		                data.operation = operation;
		                if(data.measuresIds.length > 0 && (data.xAxisInfo.length > 0 || data.legendFieldsInfo.length > 0)){
		                	this.sendBusinessGraphRequest(data);
		                }else{
		                	//hiding the preview governor exceeds message if any.
		                	this.getBusinessGraphWrapper()._hideGovernorExceededInfoMessage('governorMsgPanel-pivotBusinessGraphPreviewArea');
		                	Ext.getCmp('pivothighchartwidget-pivotBusinessGraphPreviewArea').drawChart(null);
		                }
					},
					
					getYAxisInfo: function(){
						var businessGraphConfigWindow = this.getBusinessGraphConfigWindow();
						var measureLeftInfo = Ext.ComponentQuery.query('[itemId=measureLeftInfoPanel]',businessGraphConfigWindow)[0];
						var measureRightInfo = Ext.ComponentQuery.query('[itemId=measureRightInfoPanel]',businessGraphConfigWindow)[0];
						var measures = [];
						for(var i = 0; i < measureLeftInfo.store.data.length; i++){
							var measureId = measureLeftInfo.store.getAt(i).data.id;
							var measureName = measureLeftInfo.store.getAt(i).data.name;
							var chartType = measureLeftInfo.store.getAt(i).data.chartType;
							measures.push(measureId+'~'+measureName+'~'+chartType+'~0');
							pivotlog("left measure " + i + " [" + measureId+ ","+measureName+ " ," +chartType +"]");
						}
						
						for(var i = 0; i < measureRightInfo.store.data.length; i++){
							var measureId = measureRightInfo.store.getAt(i).data.id;
							var measureName = measureRightInfo.store.getAt(i).data.name;
							var chartType = measureRightInfo.store.getAt(i).data.chartType;
							measures.push(measureId+'~'+measureName+'~'+chartType+'~1');
							pivotlog("right measure " + i + " [" + measureId+ ","+measureName+ " ," +chartType +"]");
						}
						return measures;
					},
					
					getXAxisInfo: function(){
						var businessGraphConfigWindow = this.getBusinessGraphConfigWindow();
						var facetInfo = Ext.ComponentQuery.query('[itemId=facetInfoPanel]', businessGraphConfigWindow)[0];	
						var xAxisInfo = [];
		                
						if(facetInfo.store.data.length > 0){
							for(var i=0;i<facetInfo.store.data.length;i++){
								xAxisInfo.push(facetInfo.store.getAt(i).data.dimensionName+'~' +  facetInfo.store.getAt(i).data.levelId);
							}
						}
		                return xAxisInfo;
					},
					getLegendFieldsInfo: function(){
						var pivotObj =  JdaPivotApp.getApplication().getPivotController().getPivotWrapper().getPivot();
						var cube = pivotObj._getCubeDefinition();
						
						var businessGraphConfigWindow = this.getBusinessGraphConfigWindow();
						var legendFieldsData = Ext.ComponentQuery.query('[itemId='+cube.scenariosDimensionKey+']', businessGraphConfigWindow)[0];	
						var legendFieldsInfo = [];
		                
						if(legendFieldsData.store.data.length > 0){
							for(var i=0;i<legendFieldsData.store.data.length;i++){
								legendFieldsInfo.push(legendFieldsData.store.getAt(i).data.dimensionName+'~' +  legendFieldsData.store.getAt(i).data.levelId);
							}
						}
		                return legendFieldsInfo;
					},
					sendBusinessGraphRequest: function(params) {
						var pivotObj = this.getPivotWrapper().getPivot();
						pivotObj.executeBusinessGraph(params);
					},
					loadBusinessGraphs: function(){
						var params = {
								operation : this.self.LOAD_BUSINESS_GRAPHS
							};
						this.sendBusinessGraphRequest(params);
					},
					_getGraphDataById: function(graphId){						
						var selectedCell = this.getBusinessGraphWrapper().config.selectedCell;
						var params = {
								operation : this.self.GET_GRAPH_DATA_BY_ID,
								graphId : graphId,
								selectedCell : selectedCell
							};
						this.sendBusinessGraphRequest(params);
					},
					showChartTitleDialog : function(operation) {
						var businessGraphConfigWindow = this.getBusinessGraphConfigWindow();
						var graphNameObj = Ext.ComponentQuery.query('[itemId=graphName]', businessGraphConfigWindow)[0];

						var measures = this.getYAxisInfo();
						var xAxisInfo = this.getXAxisInfo();

		            	var data = {};
		                data.measuresIds = measures;
		                data.xAxisInfo = xAxisInfo;

	                	if(this.validateBusinessGraphConfigWindow(graphNameObj, data)){
							this.setExpressionModified(false);
							var chartTitleDialog = Ext.widget('charttitledialog', {
								previousGraphName : graphNameObj.getValue()
							});
							chartTitleDialog.setTitle(this.getLocaleString('BusinessGraph.Button.SaveAs'));
							chartTitleDialog.show();	
	                	}
					},
					closeChartTitleDialog : function(){
						this.getChartTitleDialog().close();
					},
					showDeleteGraphConfirmDialog : function() {
						this.setExpressionModified(false);
						var delteGraphDialog = Ext.widget('deletegraphdialog', {});
						delteGraphDialog.setTitle(this.getLocaleString('BusinessGraph.GraphConfig.DeleteConfirmDialog.Title'));
						delteGraphDialog.show();
					},
					deleteBusinessGraphConfig : function(operation){
						var businessGraphConfigWindow = this.getBusinessGraphConfigWindow();
						var graphNameObj = Ext.ComponentQuery.query('[itemId=graphName]', businessGraphConfigWindow)[0];
							
			            var data = {};
			                data.measuresIds = this.getYAxisInfo();
			                data.xAxisInfo = this.getXAxisInfo();
			                data.operation = operation;
			                data.graphName =graphNameObj.getValue();
			                data.graphId=graphNameObj.getId();
			                this.sendBusinessGraphRequest(data);

					},
					closeDeleteGraphDialog : function(){
						this.getDeleteGraphDialog().close();
					},
					
					
					statics : {
						MIN_HEIGHT : 200,
						ADD_RULE_OPR : 'addRule',
						UPDATE_RULE_OPR : 'updateRule',
						VALIDATE_RULE_OPR : 'validateRule',
						DELETE_RULE_OPR : 'deleteRule',
						CHANGEPRIORITY_RULE_OPR : 'changeRulePriority',
						VIEW_RULES : 'viewAllRules',
						RULE_TITLE:'ruleTitle',
						COPY_OPR:'copy',
						SHOW_GRAPH_CONFIG:'showGraphConfig',
						SAVE_GRAPH_CONFIG:'saveGraphConfig',
						SAVEAS_GRAPH_CONFIG:'saveAsGraphConfig',
						LOAD_BUSINESS_GRAPHS: 'loadBusinessGraphs',
						GET_GRAPH_DATA_BY_ID: 'getGraphDataById',
						EDIT_GRAPH_CONFIG: 'editGraphConfig',
						DELETE_GRAPH_CONFIG: 'deleteGraphConfig',
						PREVIEW_GRAPH: 'previewGraph',
					}
				});
