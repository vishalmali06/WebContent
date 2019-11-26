//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================

/*jshint smarttabs:true */
/*dhx.debug_jda = 1;*/
/**
 This is the name space containing the variables, objects and functions of the pivot
 @name jda.pivot
 @namespace
 */
// //////////////////////////////////////////////////
// General purpose pivot methods
// //////////////////////////////////////////////////
/** @namespace */
$(function()
{
	var pivotObjForRef=null;
	var selectedCellId = null;
    var singleScenarioSelection=true;
    var lastEventOnPivot = null;
    _pns._getPivotLocaleString = function() {
        var args = Array.prototype.slice.call(arguments, 0);
        var prefix="";
        var configObj=undefined;
        if (args.length&&(configObj=_.isObject(args[0])?args[0]:undefined)&&configObj.prefix) {
            prefix=configObj.prefix;
            args=configObj.args;
        }
        args[0] = this.localeStrs && this.localeStrs[prefix + args[0]];
        if (args[0] !== undefined)
            return getResourceString.apply(this, args);
        else
            return "";
    };
    /**
     * Create extjs container 
     */
    _pns.extJSPivot = function _pnsExtJSPivot(pivotConfig){
        var appFolder = Ext.Loader.getPath("PivotAppFolder");
    	var that = this;
    	/*var pivotObj=null;*/
    	Ext.application({
    		appFolder : appFolder,
    	    views: [
    	        'ExtJSPivotViewport'
    	    ],
    	    controllers:['PivotController','DataFilterController','MeasureFilterController'],
    	    name: 'JdaPivotApp',
    	    autoCreateViewPort:false,
    	    launch: function(){
    	     pivotlog("Launching extjs view port");
    	     Ext.create('JdaPivotApp.view.ExtJSPivotViewport',{
    	            renderTo: 'pivotLayer',
    	            layout:'fit',
    	            pivotConfig:pivotConfig
    	        });	 
    	     that.pivotObj = this.getPivotController().getPivotWrapper();
    	    },
    	    getPivotController : function() {
    			return this.getController('JdaPivotApp.controller.PivotController');
    		},
    		getDataFilterController : function() {
    			return this.getController('JdaPivotApp.controller.DataFilterController');
            },
            getMeasureFilterController : function(){
                return this.getController('JdaPivotApp.controller.MeasureFilterController');
            }
    	});
    	_pns.extjsPivotObj=true;
    	  	    
    	    that.getPivot = getPivot;
	    	that.destroyAndReload = destroyAndReload;
	    	that.destroy = destroy;
	    	//////////
	    	function getPivot(){
	    		return this.pivotObj ? this.pivotObj.getPivot() : undefined;
	    	}        
	    	function destroyAndReload(config){
	    		this.pivotObj.destroyAndReload(config);
	    	}
	    	function destroy(){
	    		this.pivotObj.destroyPivot();
	    	}        
    	
    };
   /* _pns.extJSPivot.prototype.getPivot =function(){
    	return this.pivotObj ? this.pivotObj.getPivot() : undefined;
    };
    _pns.extJSPivot.prototype.destroyAndReload =function(config){
    	 this.pivotObj.destroyAndReload(config);
    };
    _pns.extJSPivot.prototype.destroy =function(){
    	 this.pivotObj.destroyPivot();
    };*/
    /**
     * @constructor
     * @this {Pivot}
     * @param {string}
     *            The URL from which the pivot will get its data
     * @param {object}
     *            The configuration object containing the application specific logic
     * @param {object}
     *            The translation map used for localization by the pivot
     */
    _pns.pivot = function _pnsPivotF(baseUrl, configurationFn, _localeStr) {
        // Normalize the pivot config object 
        var configObj=_.isObject(baseUrl)?baseUrl:{
            baseUrl:baseUrl,
            configurationFn: configurationFn,
            localeStr: _localeStr
        };

        configObj.localeStr = configObj.localeStr || {};
        return (function(_config) {
            var pivotUrl = _config.pivotUrl,
                configurationFn = _config.configurationFn,
                localeStr = _config.localeStr;
            var datastore = new _pns.datastore();
            var settings = {
                view : "jdapivot",
                datastore : datastore,
                localeStrs : _config.localeStr,
                customPivotLogic : _config.configurationFn,
                /*   url : _config.baseUrl,*/
                /* config: _config,*/
                fixedRowHeight:false,
            };
            if (!_config.container) {
                delete _config.container;
            }
            var $pivotWrapper=null;
            if (configObj.container) {
                _config.$pivotWrapper=$(configObj.container).wrap($("<div>", {"class": "pivotWrapper"})).parent();
            }
            var retPivot = new jdapivot.ui(_.extend({},settings,_config), "pivotLayer");
            pivotObjForRef =retPivot;

            return retPivot;
        })(configObj);
    };


    /***********************************************************************************************************************
     * Specialized JDA Pivot Grid
     **********************************************************************************************************************/
    jdapivot.proto = function(){

        if (dhx.debug_proto)
            dhtmlx.log("Proto chain:"+arguments[0].name+"["+arguments.length+"]");

        var origins = arguments;
        var compilation = origins[0];
        var has_constructor = !!compilation._init;
        var construct = [];

        dhtmlx.assert(compilation,"Invalid mixing target");

        for (var i=origins.length-1; i>0; i--) {
            dhtmlx.assert(origins[i],"Invalid mixing source");
            if (typeof origins[i]== "function")
                origins[i]=origins[i].prototype;
            if (origins[i]._init)
                construct.push(origins[i]._init);
            if (origins[i].defaults){
                var defaults = origins[i].defaults;
                if (!compilation.defaults)
                    compilation.defaults = {};
                for (var def in defaults)
                    if (dhtmlx.isNotDefined(compilation.defaults[def]))
                        compilation.defaults[def] = defaults[def];
            }
            if (origins[i].type && compilation.type){
                for (var def in origins[i].type)
                    if (!compilation.type[def])
                        compilation.type[def] = origins[i].type[def];
            }

            for (var key in origins[i]){
                if (!compilation[key])
                    compilation[key] = origins[i][key];
            }
        }

        if (has_constructor)
            construct.push(compilation._init);


        compilation._init = function(){
            for (var i=0; i<construct.length; i++)
                construct[i].apply(this, arguments);
        };
        var result = function(config){
            this.$ready=[];
            dhtmlx.assert(this._init,"object without init method");
            this._init.apply(this,arguments);
            if (this._parseSettings)
                this._parseSettings(config, this.defaults);
            for (var i=0; i < this.$ready.length; i++)
                this.$ready[i].call(this);
        };
        result.prototype = compilation;

        compilation = origins = null;
        return result;
    };

    jdapivot.AtomDataLoader = jdapivot.proto({
        _init : function(config) {
            // prepare data store
            this.data = {};
            if (config && this._settings){
                this._settings.datatype = config.datatype || "jda_pivot_json";
                // this.$ready.push(this._load_when_ready);
            }
        },
        _load_when_ready : function() {
            this._ready_for_data = true;
        },
        // default after loading callback
        _onLoad : function(text, xml, loader) {
            // ignore data loading command if data was reloaded
            this._ajax_queue.remove(loader);

            var response = this.data.driver.toObject(text, xml);
            this.data._parse(response,this);
            // this.callEvent("onXLE", []);
            if (this._readyHandler){
                this.data.detachEvent(this._readyHandler);
                this._readyHandler = null;
            }

        },

        // loads data from external URL
        load : function(url, call, params) {
            if (url.$proxy){
                url.load(this, typeof call == "string" ? call : "json");
                return;
            }

            this.callEvent("onXLS", []);
            if ((typeof call == "string") && ((typeof arguments[3] == "function") || (jdapivot.isArray(arguments[3])))){ // GK:
                // The
                // third
                // parameter
                // can
                // be an
                // array
                // of
                // callbacks
                // or a
                // single
                // callback
                this.data.driver = dhtmlx.DataDriver[call];
                call = arguments[3];
            }
            else
                this.data.driver = dhtmlx.DataDriver.json;

            // load data by async ajax call
            // loading_key - can be set by component, to ignore data from
            // old async
            // requests
            var callback = [ {
                success : this._onLoad,
                error : this._onErrorLoad
            } ];

            if (typeof call != "string"){
                if (jdapivot.isArray(call))
                    callback.push.apply(callback, call);
                else
                    callback.push(call);
            }
            pivotlog("Sending URL %s" + url);
            if (typeof onUnloadWindowIdHandler == "function"){
                onUnloadWindowIdHandler();
            }
            return jdapivot.ajax(url, callback, this, params);
        }
    },jdapivot.Settings);
    delete this.on_click;

    jdapivot
        .protoUI(
        {
            name : "jdapivot",
            baseConfig : {
                view : "jdapivot",
                autowidth : false,
                autoheight : false,
                loadahead : 70,
                levelOffset : 10,
                branchIndent : 12,
                pollingTimeout : 30000,
                pollingTimeoutServerDelta:1000,
                spinnerWaitDuration:2000,
                prefetchRatio : undefined,
                preRenderRatio : undefined, 
                throttle : true,
                headerRowHeight : 26,
                datatype : "jda_pivot_json",
                post : true,
                requestType : "json",
                defaultDecimal : 2,
                leftSplit : 1,
                measureOnRow : false,
                multiselect : true,
                attributeArea:false,
                attributeFilter:false,
                attrMaxWidth:200,
                attrVisibleColumn:2,
                cancelPolling:false,
                enabledRootNodeConfig:false,
                sideFacetMaxWidth:70,
                memberSelector:false,// default MemberSelector false
                rowSelectorWidth:20,// row selector width 20 for row selection column
                select : "cell", // enable cell selection
                enabledCopyPaste: false,
                enabledCopyWithMetadata : false,
                copyGovernor:10000,
                exportGovernorRows:30000,
                exportGovernorCols:1000,
                doubleMeasureMinValue:-9999999999999.99,
                doubleMeasureMaxValue:9999999999999.99,
                exportRowsPerBatch: 2500,
                defaultGraphConfiguration:undefined,
                showGraphPanel:false,
                showCommentIndicator:false,
                cellCommentRelation:"UNRELATED",
                domainName : "N",
                dataDomainValueNameSeparator : " - ",
                textSetSeparator : ", ",
                enableCellContextGraph : false,
                showEllipsisOnMemberName : true, 
                keepOverlaySpinner : true, //Used to keep the 'loading page' popup till getSegmentData() completes and render the data on pivot.
            },
            _last_valid_render_x_pos : 0,
            _last_valid_render_y_pos : 0,
            fontSetting : [ 10, 11, 12 ],
           /* setUpPivotPreReq : setUpPivotPreReq(),*/
            _init : function(_config) {
                var that = this;
                var config = _.defaults(_config, this.baseConfig);
                /*setUpPivotPreReq();*/
                this.initScrollAreas();
                this.overrideRange=false;
                // //Facet Filter member. To be removed later
                this.facetsFilters = {};
                this.$pivotWrapper=config.$pivotWrapper;
                this.$_header = $(this._contentobj.firstChild);
                this.$_body = $(this._header.nextSibling);
                this.$_footer = $(this._body.nextSibling);
                this.$_viewobj=$(this._viewobj);
                this._contentobj.className += " pivotLayerElement";
                $(this.$view).show();

                // //////////////
                this.currentRequestId = undefined;
                this.rootId = _pns.Constants.rootId;
                this.customPivotLogic = (function() {
                    var pivotObject = that;
                    return new config.configurationFn(that);
                }());
                // Command configuartion
                var pivotCommandConfig =  _pns.utility.getDefaultCommandConfig();
                // override default command with application specific command
                $.extend(pivotCommandConfig,this.customPivotLogic.commandConfig);
                // setting overridden command
                this.customPivotLogic.commandConfig = pivotCommandConfig;
                
                _.extend(config,this.customPivotLogic);
                this._overrideConfig(config);
                this.compileTemplates();

                this.thumbnailHeight=90;
                this.thumbnailWidth=90;
                this.thumbnailsWidthPerCell=4;
                this.thumbnailsHeightPerCell=4;
                this.maxThumbnailsPerCell=this.thumbnailsWidthPerCell*this.thumbnailsHeightPerCell;
                //MDAP-767
                this.view_coordinates ={xr:undefined,yr:undefined};
                this._lastScrollY= undefined; // changes for key focus is not coming into view port data cells from out of view port
            	this._lastScrollX = undefined;// changes for key focus is not coming into view port data cells from out of view port 
            	this._doScroll = undefined; // changes for key focus is not coming into view port data cells from out of view port
            	
            	this.lastSelectedCellId= undefined;
                //this._settings.y_scroll=true;
                this._settings.rowHeight = $(this.$pivotWrapper).find('.pivotLayerElement').css('lineHeight') && parseInt($(this.$pivotWrapper).find('.pivotLayerElement').css('lineHeight').split('px')[0]);
                this._settings.scroll = true;
                this.multiSelectRange = {};
                this.multiSelectRangeCurrent = {};
                this._rowHeight = this._settings.rowHeight;
                this._lastVisibleMeasureId = -1;
                this.localeStrs = config.localeStrs;
                this.isMultiEditActive=config.multiEdit;
                this.multiEditValues={};
                this.lastEditedValues=new Map();
                this.statusDivId = undefined;
                this.highlightedChangedCells={};
                this._pivotselectorNode=[undefined,undefined];
                this.cssRulesDefined = false;
                this._last_valid_render_x_pos = 0;
                this._last_valid_render_x_dir = true;
                this._last_valid_render_y_dir = true;
                config.loadahead = config.loadahead || 0;
                config.prefetchRatio = config.prefetchRatio || 0.2;
                config.preRenderRatio = /*config.preRenderRatio ||*/ 0.2;
                this.axesNames = [ 'sideAxis', 'topAxis' ];

                config.levelOffset = config.showEllipsisOnMemberName ? 12 : config.levelOffset;

                this.adjustYScrollPosition = false;
                this.adjustXScrollPosition = false;
                // //////////////////
                // //SCPO Images used /////

                this.sortUpIconPath = "../common/manugistics/images/secondary/sortUp.gif";
                this.sortDownIconPath = "../common/manugistics/images/secondary/sortDown.gif";

                if (!this.$bodyDOMElement){
                    this.$bodyDOMElement = $(this.$view).find('.dhx_ss_body');
                }

                if (this.customPivotLogic){
                    this.cellValidators = this.customPivotLogic.validators;
                    this.statusBarDivId = this.customPivotLogic.statusBarDivId;
                    this.hooks = this.customPivotLogic.hooks;
                    _.each(this.customPivotLogic.actions, function(customContextMenu, contextName) {
                        that.setContextMenuCustomLogic(contextName, customContextMenu);
                    });

                }

                this.errorDialog =
                    $("<div id='pivotErrorLayer' ><span class='buttonClose b-close'><span>X</span></span><span class='pivotErrorLayerMsg'>Error Message</span><div class='accordion'>"+
                        "<h3>"+this.getLocaleString('Details')+"</h3><div class='pivotErrorLayerStacktraceWrap'><p class='pivotErrorLayerStacktrace'></p><div></div></div>").appendTo('body');

                $(".mainPivotStatusBar").find(".sortStatusElement").remove();
                $(".mainPivotStatusBar").find(".anchorStatusElement").remove();
               
                this.$statusBar =
                    $('#' + (this.statusBarDivId || 'pivotStatusBar')).addClass('mainPivotStatusBar');
                this.$sortStatusDiv =$("<div>", {"class": "sortStatusElement pivotStatusBarElement"}).append(
                        $('<span/>').text(this.getLocaleString("SortBy"))).appendTo(this.$statusBar)
                        .hide();
                this.$sortStatusDivContent =
                    $('<ul class="sortDivContent statusElementContent"/>').appendTo(this.$sortStatusDiv)
                        .wrap('<div class="statusBarContentWrapper"/>').sortable();

                this.$sortStatusDivContent.hover(function() {
                    $(this).toggleClass('.expandedStatusSection').css({
                        'z-index' : '101',
                        'max-width' : '30em',
                        'overflow' : 'visible',
                        'height' : 'auto',
                        'width' : 'auto'
                    }).find('.multiSortInd').hide();

                    $(this).find('.sortHoverAxisPath').show();
                }, function() {
                    $(this).toggleClass('.expandedStatusSection').css({
                        'z-index' : '',
                        'max-width' : '',
                        'overflow' : '',
                        'height' : ''
                    }).find('.multiSortInd').show();

                    $(this).find('.sortHoverAxisPath').stop().hide();
                });

                // Temporary for development
                /*
                 * this.$sortStatusDivContent.css({ 'z-index' : '100', 'max-width' : '30em', 'overflow' :
                 * 'visible', 'height' : 'auto', 'width' : 'auto' });
                 */
                this.$sortStatusDivContent.find('.sortHoverAxisPath').hide();

                this.$anchorStatusDiv = $("<div>", {"class": "anchorStatusElement pivotStatusBarElement"}).css({
                    'margin-left' : '13em'
                }).append($('<span/>').text('Anchors: ')).hide().appendTo(this.$statusBar);
                this.$anchorStatusDivContent =
                	$("<div>", {"class": "anchorDivContent statusElementContent"}).appendTo(
                        this.$anchorStatusDiv).wrap('<div class="statusBarContentWrapper"/>');
                this.$anchorStatusDivContent.hover(function() {
                    $(this).find('li').show();

                    $(this).toggleClass('.expandedStatusSection').css({
                        'z-index' : '100',
                        'max-width' : '30em',
                        'overflow' : 'visible'
                    });
                    // end hover in
                }, function() {
                    $(this).toggleClass('.expandedStatusSection').css({
                        'z-index' : '',
                        'max-width' : '',
                        'overflow' : ''
                    }).find('.multiSortInd').remove();
                    $(this).find('li:not(:first-child)').hide();

                    // end hover out
                });

                this.$anchorStatusDivContent.on('click', 'button', function(e) {
                    var anchorObj = $(this).data('anchorObj');
                    that.unAnchorFacet(anchorObj);
                    e.preventDefault ? e.preventDefault() : e.returnValue = false;
                    return false;
                });


                this._isUpdating = false;
                this.data.url = config.baseUrl;
                this.data.exportUrl =config.exportExcelUrl;
                this.data.pollingTimeout = config.pollingTimeout;
                this.data.pollingTimeoutServerDelta  = config.pollingTimeoutServerDelta ;
                this.data.pivotCommands = {};
                this.data.memberSelector={
                		0 :{},
                		1 :{}
                };
                this.pivotLockedLocked = "";
                this.registeredContextActions = {
                    "cellContextMenu" : {},
                    "facetContextMenu" : {},
                    "measureContextMenu" : {},
                    "selectionContextMenu" : {}
                };
                // Bind data model events to handlers
                this._bindEvents();

                this.lastExpandedNode = undefined;
                this.mapSegmentRequestsLoad = {};
                this.segmentDataRequestStack = [];
                this.segmentDataRequestStack.busy = false;
                this.semCheck = 0;
                this.initAxisPathTooltip();
                this._loadBackendData();
                
              //For Copy functionality
                this.selectedCellsInfo = {};
                this.cellSelForCopyIndicator = false;
                this.isDataCopied = false;
                this.copiedCellsInfo = {};
                this.copyStartTime = null;
                this.defaultExportGovernorRows = 1048574;
                this.defaultExportGovernorCols = 16382;
                this.clearEditConflictErrors = false;
                this.measureDomainValues = [];
                this.serverTextSetSeparator = ", ";
                this.enableCmtReasonCodeSupport = false;
                this.removeNonSegmentData = false;
                this.isDataAvailable = true;
                this.previousViewPort = undefined;
            },

            /**
             * Intialize the horizontal scroll area for three region side facet, attribute and data
             */
            initScrollAreas:function(){


                this.areas={};
                // Facet Area
                this.areas["facetArea"] = new _pns.area({
                    scope:this,
                    startIdx:0,
                    endIdx:-1,
                    scrollable: true,
                    initialWidth: 100,
                    id:'sideFacets'

                });
                // Attribute Area            
                this.areas["attributeArea"] = new _pns.area({
                    scope:this,
                    startIdx:-1,
                    endIdx:-1,
                    scrollable: true,
                    initialWidth: 100,
                    id:'attributesArea'
                });
                // Data Area
                this.areas["dataArea"] = new _pns.area({
                    scope:this,
                    startIdx:-1,
                    endIdx:-1,
                    scrollable: true,
                    initialWidth: 100,
                    id:'dataArea'

                });

            },

            /**
             * Returns can show attribute area on pivot screen based on the condition
             *  1. enable attributeArea on config
             *  2. measure on top
             */
            _showAttributeArea:function(){
                return this.config.attributeArea && this.areMeasuresOnTop();
            },

            /**
             * Override configuration for pivot Utilities Charts, comments and Styling
             * @param config - pivot configuration object
             *
             */
            _overrideConfig:function(config) {
                if (!config.pivotUtil) {
                    return;
                }
                if (config.hasOwnProperty('enabledCharts') && config.pivotUtil.hasOwnProperty('graph'))
                {
                	if(config.enabledCharts == 1){
                    	config.enabledCharts = true;
                    	config.enabledBusinessCharts = false;
            		}else if(config.enabledCharts == 2){
            			config.enabledCharts = false;
            			config.enabledBusinessCharts = true;
            		}
                	config.pivotUtil.graph.enable=config.enabledCharts;
                }
                if (config.hasOwnProperty('enabledComments')&&config.pivotUtil.hasOwnProperty('comment'))
                {
                    config.pivotUtil.comment.enable=config.enabledComments;
                }
                if (config.hasOwnProperty('enabledStyling')&&config.pivotUtil.hasOwnProperty('cf'))
                {
                    config.pivotUtil.cf.enable=config.enabledStyling;
                }
                
                if (config.hasOwnProperty('enabledDataFilter')&&config.pivotUtil.hasOwnProperty('datafilter'))
                {
                    config.pivotUtil.datafilter.enable=config.enabledDataFilter;
                }
                
                if (config.hasOwnProperty('enabledMeasureFilter')&&config.pivotUtil.hasOwnProperty('measurefilter'))
                {
                    config.pivotUtil.measurefilter.enable=config.enabledMeasureFilter;
                }
            },
            _getCorePivotEvents:function()
            {
                return {
                    'onCubeMetaDataChanged' : this._call_oncubemetadatachanged,
                    'onRecheckLoading'  : this._callonRecheckLoading,
                    'onRecheckQuickLoading' : this._callonRecheckQuickLoading,
                    'onRecheckQuickSaving'  : this._callonRecheckQuickSaving,
                    'onRecheckComitting'    : this._callonRecheckCommiting,
                    'onRecheckCommitCompleting' : this._callonRecheckCommitCompleting,
                    'onCommitCancelled' : this._callonCommitCancelled,
                    'onNodeNotResponsing'   : this._callonNodeNotResponsing,
                    'onErrorResponse'   : this._callonErrorResponse,
                    'onGetChildren' : this._call_ongetchildren,
                    'onReExpandHierarchies' : this._call_onReExpandHierarchies,
                    'onStoreUpdated'    : this._onStoreUpdated,
                    'onGetSegmentData'  : this._call_ongetsegmentdata,
                    'onGenericResponse' : this._call_onGenericResponse,
                    '_onFactsUpdated'   : this._call_onfactsupdated,
                    'onGetCellDetails'  : this._call_onGetCellDetails,
                    'onViewComment' : this._onViewComment,
                    'onGetComment'  : this._call_onGetCommentData,
                    'onAddComment'  : this._call_onAddComment,
                    'onAfterSelect' : this._onAfterSelect,
                    'onDeleteComment' : {context:this,scope:this,handlerFn:this._OnDeleteComment},
                    'onGetGraphData'    : this._onGetGraphData,
                    'onBusinessGraph'    : this._onBusinessGraph,
                    'onSaveGraphSetting'  : this._onSaveGraphSetting,
                    'onExportToExcel'     : this._onExportToExcel,
                    'onBeforeContextMenu' : {context:this,scope:this,handlerFn:this._handleOnBeforeContextMenu},
                    /*'onGetCFAddRuleresponse' : this._call_onGetCFAddRuleresponse,
                    'onGetCFViewUpdatingRuleresponse' : this._call_onGetCFViewUpdatingRuleresponse,
                    'onGetCFUpdateRuleresponse' : this._call_onGetCFUpdateRuleresponse,
                    'onGetCFViewRuleresponse' : this._call_onGetCFViewRuleresponse,
                    'onGetCFValidateRuleresponse' : this._call_onGetCFValidateRuleresponse,
                    'onGetCFViewAllRuleresponse' : this._call_onGetCFViewAllRuleresponse,
                    'onGetCFDeleteRuleresponse' : this._call_onGetCFDeleteRuleresponse,
                    'onGetCFChangeRulePriorityresponse' : this._call_onGetCFChangeRulePriorityresponse,*/
                    //'onShowOverlaySpinner' : this.showWaitCancelIndicator,
                    //'onHideOverlaySpinner' : this.hideWaitCancelIndicator,
                    'onShowOverlaySpinner' : this.showExtjsWaitCancelIndicator,
				    'onHideOverlaySpinner' : this.hideExtjsWaitCancelIndicator,
				    'onRequestProcessing':this._call_onRequestProcessing,
				    'onRequestCancelling':this._call_onCancellingRequest,
				    'initCheckRequest':this._initCheckRequest,
				    'initCancelRequest':this._initCancelRequest,
                    'renderPivot'   :this.renderPivot,
                    'nodeOnRecoveryMode':this._nodeOnRecoveryMode,
                    'previousCalculationInProgress':this._previousCalculationInProgress,
                    'noChildren':this._noChildren,
                    'onGetGraphDataError':this._onGetGraphDataErrorResponse,
                    'onDataFilter'    : this._onDataFilter,
                    'onMeasureFilter'    : this._onMeasureFilter,
                };
            },

            _bindEvents: function() {
                var defaultObj={
                    context:this.data,
                    scope:this
                };
                _.each(this._getCorePivotEvents(),function(handler,eventName){
                    var handlerAttr={};
                    handler=handler||function(){};
                    handlerAttr=_.isFunction(handler)?_.defaults({handlerFn:handler},defaultObj):handler;

                    handlerAttr.context.attachEvent(eventName, dhtmlx.bind(handlerAttr.handlerFn, handlerAttr.scope));
                },this);
            },

            _loadBackendData: function() {
                this.data.dp._onStoreUpdated = this._onStoreUpdated;
                this.data.dp._onViewComment = this._onViewComment;
                this._InitBlockUI();
                this._getcubeDefinitionRequest();

                // Let's have a get segment data watchdog task to make
                // sure the queue is not clogged. busy every 2000ms
                this.registerActions();
                //Register the rubberband
                this._registerRubberband();

                this._settings.standardColumnSizeChar = 12;
                this._settings.standardColumnSize = this.getStandardColumnSize();
                this._settings.standardCharSize = this.getStandardCharSize();
                this._settings.displayBuiltInLock = false;

            },
            compileTemplates: function(){
                var that=this,
                    cellTemplateClass=this.customPivotLogic.cellTemplate||'BasicCellTemplate';
                this.templates=this.templates||{};
                // Use mustache style templating in _underscore. For instance {{=myvar}} .
                _.templateSettings = {
                    evaluate:    /\{\{([\s\S]+?)\}\}/g,
                    interpolate: /\{\{=([\s\S]+?)\}\}/g,
                    escape: /\{\{-([\s\S]+?)\}\}/g,
                    variable : "rc"
                };
                $('.PivotTemplate').each(function(index,$template){
                    var templateName = $template.className.split(/\s+/)[0];
                    that.templates[templateName] = _.template($.trim($($template).html()));
                });

            },
            recompileTemplates: function() {
                this.compileTemplates(this.templates.mainElement);
            },

            getTemplates: function(){
                return this.templates;
            },

            getPageTopLeft: function(el) {
                var rect = el.getBoundingClientRect();
                var docEl = document.documentElement;
                return {
                    left: rect.left + (window.pageXOffset || docEl.scrollLeft || 0),
                    top: rect.top + (window.pageYOffset || docEl.scrollTop || 0)
                };
            },
            updateMultiSelected: function(targetSelector, intersectorsSelector,yr) {
                var that=this;
                /*                        if (!targetSelector.parent().length) {
                 return;
                 }
                 */                      
                yr = yr || this._get_y_range(this._settings.prerender === true);
                var intersectors = this.findIntersectors(targetSelector,intersectorsSelector);
                this.multiSelectRangeCurrent = {};
                //         pivotlog('updateMultiSelected %o',intersectors);
                var addedCells=this.locateCell(intersectors);

                this.$_viewobj.find('.multi-selected').removeClass('multi-selected');
                _.each(addedCells,function(_cell,idx){
                    var cell={row:_cell[0],column:_cell[1],section:_cell[2]};
                    this.multiSelectRangeCurrent[that.getCellIdStr(cell)]=cell;

                },this);
                this.renderMultiSelected(this.multiSelectRangeCurrent,yr);

                //   $(intersectors).map (function () {return this.toArray(); } ).addClass('multi-selected');
            },
            _getMultiEditStatus:function(row,col,datatype, content, decimalFormat){
                var key = this._prepareCellKey(row,col)
                if(this.isMultiEditActive){
                    var item =this.multiEditValues[key];
                    if(item){
                    	return this._areValuesTheSame(datatype, item.content, content, decimalFormat);
                    }
                }
                return false;
            },

            _hasPendingStatus:function(cellKey){
                return this.lastEditedValues.has(cellKey);
            },
            _prepareCellKey:function(row,col){
            	return row+"~"+col;
            },
            //comparing two(previous and current) values after rounding based on measure precision.
            _areFloatValuesTheSame: function(a,b,decimalFormat) {
                //return Math.abs(a-b)<=this.config.precision;
            	 decimalFormat = decimalFormat || this._settings.defaultDecimal;
            	 return (MathUtilities.round(a,decimalFormat) == MathUtilities.round(b,decimalFormat));
            },
            _areValuesTheSame: function(datatype, value1, value2, decimalFormat){
            	var theSame = false;
            	if(datatype == 'string'){
            		return value1 == value2;
            	}
            	else if(datatype == 'double'){
            		var v1 = (_.isString(value1)) ? MathUtilities.parseFloat(value1) : value1;
            		var v2 = (_.isString(value1)) ? MathUtilities.parseFloat(value2) : value2;
            		theSame = this._areFloatValuesTheSame(v1, v2, decimalFormat);
            	}
            	else if(datatype == 'doublerange'){
            		var min1 = value1.min;
            		var max1 = value1.max;
            		var min2 = value2.min;
            		var max2 = value2.max;
            		min1 =  (_.isString(min1)) ? MathUtilities.parseFloat(min1) : min1;
            		max1 =  (_.isString(max1)) ? MathUtilities.parseFloat(max1) : max1;
            		min2 =  (_.isString(min2)) ? MathUtilities.parseFloat(min2) : min2;
            		max2 =  (_.isString(max2)) ? MathUtilities.parseFloat(max2) : max2;
            		theSame = this._areFloatValuesTheSame(min1, min2, decimalFormat) && this._areFloatValuesTheSame(max1, max2, decimalFormat);
            	}
                else if(datatype == 'integerrange'){
                    var min1 = value1.min;
                    var max1 = value1.max;
                    var min2 = value2.min;
                    var max2 = value2.max;
                    min1 =  (_.isString(min1)) ? MathUtilities.parseInt(min1) : min1;
                    max1 =  (_.isString(max1)) ? MathUtilities.parseInt(max1) : max1;
                    min2 =  (_.isString(min2)) ? MathUtilities.parseInt(min2) : min2;
                    max2 =  (_.isString(max2)) ? MathUtilities.parseInt(max2) : max2;
                    theSame = min1 == min2 && max1 == max2;
                }
            	return theSame;
            },
            
            renderMultiSelected: function(newCells,yr) {
                if(!jQuery.isEmptyObject(this.multiSelectRange) || newCells){
	   				var that=this;
                    yr = yr|| this._get_y_range(this._settings.prerender === true);
                    newCells = newCells || {};
                    _.each(_.extend({},this.multiSelectRange,newCells),function(cell,key) {
                        $(that._locateCellDiv(cell,yr)).addClass('multi-selected');
                    },this);
                }
            },
            findIntersectors: function(targetSelector, intersectorsSelector) {
                var intersectors = [];

                var $target = $(targetSelector);
                var tAxis = $target.offset();
                pivotlog('tAxis.offset %o',tAxis);
                var t_x = [tAxis.left, tAxis.left + $target.outerWidth()];
                var t_y = [tAxis.top, tAxis.top + $target.outerHeight()];

                $(intersectorsSelector).each(function() {
                    var $this = $(this);
                    var thisPos = $this.offset();

                    var i_x = [thisPos.left, thisPos.left + $this.outerWidth()];
                    var i_y = [thisPos.top, thisPos.top + $this.outerHeight()];

                    if ( t_x[0] < i_x[1] && t_x[1] > i_x[0] &&
                        t_y[0] < i_y[1] && t_y[1] > i_y[0]) {
                        //   pivotlog('$this.offset %o',thisPos);
                        intersectors.push($this);
                    }

                });
                return intersectors;
            },
            _clearMultiSelection: function() {
                this.multiSelectRangeCurrent={};
                this.multiSelectRange={};
                this.selectedCellsInfo = {};
                this.cellSelForCopyIndicator = false;
                this.$_viewobj.find('.multi-selected').removeClass('multi-selected');
            },_clearCopiedData: function() {
                this.isDataCopied = false;
                this.copiedCellsInfo = {};
                $(this._viewobj).find('.copy-selection-top').removeClass('copy-selection-top');
                $(this._viewobj).find('.copy-selection-bottom').removeClass('copy-selection-bottom');
                $(this._viewobj).find('.copy-selection-left').removeClass('copy-selection-left');
                $(this._viewobj).find('.copy-selection-right').removeClass('copy-selection-right');
             },
            _registerRubberband: function() {
                var that=this;
                var throttledUpdate=_.throttle(function($selection,$container,yr){
                    if (that.isDragging) {
                        that.updateMultiSelected($selection,$container.find('.dhx_cell,.dhx_hcell, .draggableFacet'),yr);
                    }
                },300);
                var $container = this.$_viewobj;
                var $selection = $('<div>').addClass('selection-box');
                var dragThreshold = 2;
                $container.on('mousedown.multiselect', function(e) {
                    function doneDragging(e) {
                        pivotlog("mouseup.multiselect entered");
                        $container.off('mousemove.multiselect');
                        $container.off('mouseup.multiselect');
                        $container.off('mouseout.multiselect');
                        $selection.remove();
                        if (!that.isDragging) {
                            return;
                        }
                        pivotlog("mouseup.multiselect done selection");
                        $container.css( 'cursor', '' );
                        that.isDragging=false;
                        //      pivotlog('******e.offsetX=%s e.offsetY=%s e.clientX=%s e.clientY=%s e.pageX=%s e.pageY=%s ',e.offsetX,e.offsetY,e.clientX,e.clientY,e.pageX,e.pageY);
                        _.extend(that.multiSelectRange,that.multiSelectRangeCurrent);
                        if (Object.keys(that.multiSelectRange).length) {
                            that._handleOnBeforeContextMenu($(that._viewobj).find('.multi-selected'),e,null);
                        }

                        //   $container.find('');

                        e.preventDefault();
                        this.multiSelectRangeCurrent={};
                    }
                    // Run when mousedown.multiselect
                    pivotlog("mouse down multiselect");
                    var s = e.shiftKey;
                    var c = e.ctrlKey;
                    if (!(s||c)) {
                        return true;
                    }
                    e.preventDefault();
                    var yr=that._get_y_range(that._settings.prerender === true);
                    if (s)
                    {
                        that.multiSelectRange={};
                        that.$_viewobj.find('.multi-selected').removeClass('multi-selected');
                    }

                    var contLoc = that.getPageTopLeft($container[0]);
                    var contX = contLoc.left;
                    var contY = contLoc.top;

                    var click_x = e.clientX - contX;
                    var click_y = e.clientY - contY;
                    $container.css( 'cursor', 'pointer' );
                    //        pivotlog('click_y=%s click_x=%s e.offsetX=%s e.offsetY=%s e.clientX=%s e.clientY=%s e.pageX=%s e.pageY=%s ',click_y,click_x,e.offsetX,e.offsetY,e.clientX,e.clientY,e.pageX,e.pageY);

                    $selection.css({
                        'top':    click_y,
                        'left':   click_x,
                        'width':  0,
                        'height': 0
                    });
                    //     $selection.appendTo($container);

                    $container.on('mousemove.multiselect', function(e) {
                        // Run when mousemove.multiselect

                        var   move_y = e.clientY-contY,
                            move_x = e.clientX-contX,
                            width  = Math.abs(move_x - click_x),
                            height = Math.abs(move_y - click_y),
                            new_x, new_y;
                        if (that.isDragging&&!e.which) {
                            doneDragging(e);
                        }
                        // Check if buttons is no longer pressed. Common when the user leaves the pivot
                        // area and then comes back.
                        if (!(e.shiftKey||e.ctrlKey)|(height<dragThreshold&&width<dragThreshold)) {
                            that.isDragging = false;
                            return;
                        }
                        if (!that.isDragging) {
                            that.isDragging=true;
                            $selection.appendTo($container);
                        }

                        new_x = (move_x < click_x) ? (click_x - width) : click_x;
                        new_y = (move_y < click_y) ? (click_y - height) : click_y;

                        $selection.css({
                            'width': width,
                            'height': height,
                            'top': new_y,
                            'left': new_x
                        });
                        e.preventDefault();
                        if (that.isDragging) {
                            throttledUpdate($selection,$container,yr);
                        }


                    }).on('mouseup.multiselect', function(e) {
                        // Run when mouseup.multiselect
                        doneDragging(e);
                    }).on('mouseleave .multiselect', function(e) {
                        // Run when mouseup.multiselect
                        pivotlog('mouseleave .multiselect');
                        doneDragging(e);
                    });
                });

            },
            _contextMenus : {
                cellContextMenu : new _pns.MenuContext({
                    name : 'cellContextMenu',
                    onHide : function(id) {
                        this._isShowingContextMenu = false;
                        if (this.$menuCell){
                            var title = this.$menuCell.data('title');
                            this.$menuCell.attr('title', title);
                            delete this.$menuCell;
                        }
                    }
                }),
                facetContextMenu : new _pns.MenuContext({
                    name : 'facetContextMenu',
                    onHide : function(id) {
                        this._isShowingContextMenu = false;
                    }
                }),
                measureContextMenu : new _pns.MenuContext({
                    name : 'measureContextMenu',
                    onHide : function(id) {
                        this._isShowingContextMenu = false;
                    }
                }),
                selectionContextMenu : new _pns.MenuContext({
                    name : 'selectionContextMenu',
                    onHide : function(id) {
                        this._isShowingContextMenu = false;
                        if (this.$menuCell){
                            var title = this.$menuCell.data('title');
                            this.$menuCell.attr('title', title);
                            delete this.$menuCell;
                        }
                    }
                })
            },
            _create_scrolls : function() {
                var that = this;
                if (this._settings.autoheight || this._settings.scrollY === false)
                    this._scrollSizeY = 0;
                if (this._settings.autowidth || this._settings.scrollX === false)
                    this._scrollSizeX = 0;
                if (!this.x_scroll)
                // Setting the width and height of the horizontal scroll bars
                    this._getFacetsArea().setScroll(this._left_width,this._scrollSizeX);
                if(this._showAttributeArea()){
                    this._getAttributesArea().setScroll(this._dtableAttr_width,this._scrollSizeX);
                }
                this._getDataArea().setScroll(this._dtable_width,this._scrollSizeX);
             
                if (!this.y_scroll){
                    this._y_scroll = new jdapivot.ui.vscroll({
                        container : this._footer.nextSibling.nextSibling,
                        scrollHeight : 100,
                        scroll : "y",
                        scrollSize : this._scrollSizeY
                    });
                    jdapivot.eventRemoveType('scroll', this._y_scroll._viewobj);
                    this._y_scroll.mouseWheel(this._body);
                    dhtmlx.event(this._y_scroll._viewobj, "mousedown", function(e) {
                        if (that.isEditing() && !that.submitEdit()){
                            e.preventDefault ? e.preventDefault() : e.returnValue = false;
                            that._lastScrollY = this._y_scroll._viewobj.scrollTop;
                            setTimeout(function() {
                                that._y_scroll._viewobj.scrollTop = that._lastScrollY;
                                delete that._lastScrollY;
                            }, 100);
                            return false;
                        }
                    }, this);

                    this._y_scroll.attachEvent("onScroll", dhtmlx.bind(this._onscroll_y, this));
                    dhtmlx.event(this._y_scroll._viewobj, "scroll", function(e) {
                        if ((that.isEditing() && !that.submitEdit()) || that.canAdjustRange()){
                            e.preventDefault ? e.preventDefault() : e.returnValue = false;
                            e.stopPropagation ? e.stopPropagation() : e.returnValue = false;
                            that.adjustYScrollPosition=false;
                            return;
                        }

                        this._onscroll.apply(this._y_scroll, arguments);
                    }, this);
                    // this._y_scroll.attachEvent("onScroll", dhtmlx.bind(this._onscroll_y, this));
                }
                this._create_scrolls = function() {
                };
            },
            generateCSSRules : function() {
                $('head style[isPivotCSS]').remove();
                var facetsCSSRules = findCss('^\\s*\\.pivotLayerElement\\s+\\.gradientFacetLevels-(\\S+)$');
                var that = this;
                var newStyles=[];

                $.each(facetsCSSRules, function(facetName, cssRule) {
                    // The following will return the sent value if color name is not found
                    var cssColor = colorNameToHex(normalizeColorValue(cssRule.style.color), null);
                    var cssBackgroundColor =
                        colorNameToHex(cssRule.style.background,
                            normalizeColorValue(cssRule.style.backgroundColor||cssRule.style.background));
                    var shadingStep = 0.15;
                    var newCssColor = cssColor;
                    var newCssBackgroundColor = cssBackgroundColor;
                    var facetObj = that.getFacetFromFacetName(facetName);
                    var axisObj = that._getFacetAxis(facetObj);
                    if (!axisObj)
                        return true;
                    shadingStep = axisObj.index == 1 ? 0.20 : 0.08;
                    // If didn't find the facet go to the next one
                    if (!facetObj)
                        return true;
                    // Add root
                    var indexLevel = 0;

                    newStyles.push(that.getFacetLevelColorStyle(facetObj.getIDName(), indexLevel++,
                        cssColor ? newCssColor : getContrastYIQ(newCssBackgroundColor),
                        newCssBackgroundColor));
                    $.each(facetObj.facetLevels, function(facetLevelIndex, facetLevelObj) {
                        newCssBackgroundColor = changeColor(newCssBackgroundColor, shadingStep, false);
                        if (cssColor)
                            newCssColor = changeColor(newCssColor, shadingStep, true);
                        newStyles.push(that.getFacetLevelColorStyle(facetObj.getIDName(), indexLevel++,
                            cssColor ? newCssColor : getContrastYIQ(newCssBackgroundColor),
                            newCssBackgroundColor));
                    });


                });
                dhtmlx.html.addStyle(newStyles);

                this.cssRulesDefined = true;
            },
            getFacetLevelColorStyle : function(facetName, levelIndex, currColor, currBackground) {
                return (".pivotLayerElement .fname-" + facetName + " .facetLevel-" + levelIndex +
                    " { color:" + currColor + "; background-color:" + currBackground + ";}");
            },
            resizePivot : function(width,height) {
                // Check if we're running in the pivot context, if so make sure we're not in the midst of
                // resizing columns
                if (this.isResizingFacets && this.isResizingFacets())
                    return;
                this.cancelEdit();
                var $pivotView = this.$_viewobj;
//                        var $parent=$pivotView.parent();
                pivotlog('passed width %o,height %o',width,height);
                pivotlog('$pivotView %o',$pivotView);

                var $parent=this.$pivotWrapper.parent().show();
                pivotlog('$parent %o',$parent);
                var parentHeight=height||$parent.innerHeight();
                var parentWidth=width||$parent.innerWidth();
                var heightThreashold=100;
                var prevHeight=0;
                while (!height&&(parentHeight=$parent.innerHeight())<heightThreashold) {
                    prevHeight=parentHeight;
                    $parent=$parent.parent().show();
                    if ($parent.length==0) {
                        break;
                    }
                }
                parentHeight=parentHeight-prevHeight;
                var oldHeight=$pivotView.outerHeight();
                var oldWidth=$pivotView.outerWidth();

                width=parentWidth;//-(this.isCommentEnabled()?27:0);
                height=parentHeight;//-(this.isGraphEnabled()?27:0);
                pivotlog('parentHeight %o parentWidth %o  ',parentHeight,parentWidth);
                //     pivotlog('parentHeight %o parentWidth %o  new width %o new height %o old new width %o new height %o',parentHeight,parentWidth,width,height,oldWidth,oldHeight);
                this.$pivotWrapper.height(parentHeight).width(parentWidth);
                $pivotView.parent().height(height).width(width);
                this.resize(true);
                this.adjust();
                if(this.canAdjustChangedCols && this.isDataAvailable){
                	this._adjustChangedColumns();
                }
                this.render(0,'structureChange');
                /*if(this._hasSelectedCellInDOM(this._selectedCellDiv)){
                	this._selectExactCell(this._selectedCellDiv,true);
                	this.updateFocusedCell();
                 }*/
            },
            blockedLayers : {},
            getPivotAnchors : function() {
                var anchors = [];
                var availableFacets = this._getCubeDefinition().availableFacets;
                for ( var iFacet = 0; iFacet < availableFacets.length; iFacet++){
                    var currFacet = availableFacets[iFacet];
                    if (currFacet && currFacet.UIAttributes && currFacet.UIAttributes.Filters){
                        var anchorObj = {
                            facetId : currFacet.id,
                            facetName : currFacet.getDisplayName()
                        };
                        var anchor = currFacet.UIAttributes.Filters;
                        $.extend(anchorObj, anchor);
                        anchors.push(anchorObj);
                    }
                }
                return anchors;
            },
            unAnchorFacet : function(anchorObj) {
            	var cube = this._getCubeDefinition();
            	var anchorFacetIds = [];
            	if(!anchorObj){
            		//For clear all option, we need to check whether facet is in anchored facets list or not.
            		var pivotAnchors = this.getPivotAnchors();
            		if(pivotAnchors){
            			for(var i = 0; i < pivotAnchors.length;i++){
            				anchorFacetIds[i] = pivotAnchors[i].facetId;
            			}
            		}
            	}
                updatePivot: for ( var iAxis = 0; iAxis < this.axesNames.length; iAxis++){
                	var axis = cube[this.axesNames[iAxis]];
                    // We always skip the dummy facets
                    for ( var iFacet = 1; iFacet < axis.facets.length; iFacet++){
                        var facet = axis.facets[iFacet];
                        if (!facet.UIAttributes)
                            continue;
                        if (anchorObj){
                            if (facet.id == anchorObj.facetId){
                                facet.UIAttributes.Filters = null;
                                cube.visibleFacets.push(facet);
                                break updatePivot;
                            }
                        }
                        else{
                        	 // Clear all.anchorFacetIds contains the anchored facets.Check for the facet presence in anchorFacetIds. 
                        	//If not anchored, no need to add to visibleFacets, as it's hide.
                            facet.UIAttributes.Filters = null;
                            if(anchorFacetIds && anchorFacetIds.indexOf(facet.id) != -1){
                            	cube.visibleFacets.push(facet);
                            }
                        }
                    }

                }
            	//Check whether to display scenario or not.
            	if(this.getScenarioFacet()){
            		outer: for ( var iAxis = 0; iAxis < this.axesNames.length; iAxis++){
            			var axis = cube[this.axesNames[iAxis]];
            			for (var iFacet = 1; iFacet < axis.facets.length; iFacet++){
            				var facet = axis.facets[iFacet];
            				if (facet.name == cube.scenariosDimensionKey && cube.availableScenarios.length < 2 && 
            															(axis.facets.length > 2 || axis.hasMeasures)){
            					var index = cube.visibleFacets.indexOf(this.getScenarioFacet());
            					if(index != -1){
            						cube.visibleFacets.splice(index, 1);
            						break outer;
            					}            					
            				}
            			}
            		}
            	}
            	!this.isDataAvailable && (this.isDataAvailable = true)
                this._setPivotAxesRequest();
                if(anchorObj && anchorObj.facetName == cube.scenariosDimensionKey){
                	this.handleScenarios("loadScenarios", cube.availableScenarioIds,cube.availableScenarios);
                }
            },

            toggleLock : function(domElement, lockMode, newValue, skipBackendUpdate) {
                var el = $(domElement).closest(".dhx_cell");
                var lockIcon = el.find('.cell_lock');
                if (el.length){
                    /*el.effect("highlight", {
                        color : '#FC1B08'
                    }, 1000);*/
                    var pivotLocation = this.locateCell(el[0]);
                    this.unselect(pivotLocation.row, pivotLocation.column);
                    var value = this.getValueFromAxisLocation(pivotLocation);
                    var isChanged = (newValue !== undefined) && (value != newValue);
                    var lockModesCss = _pns.Constants.UiIconPrefix + value.lock;
                    // If we're in a global locking mode and the cell is
                    // currently locked in a different lock the what the
                    // mode is set to,
                    // we will not unlock the cell
                    if (lockMode && value.lock && (value.lock != lockMode))
                        return;
                    var removeLockModesCss = _pns.Constants.TempLockCSS + " " + _pns.Constants.PhysLockCSS;
                    if (!value.lock){
                        value.lock = lockMode;
                        lockIcon.removeClass(removeLockModesCss).addClass(
                                'ui-icon ui-icon-locked ' + lockModesCss);
                    }
                    else{
                        value.lock = "";
                        lockIcon.removeClass('ui-icon ui-icon-locked ' + removeLockModesCss);
                    }
                    var changesToSend = {
                        lock : value.lock,
                        value : value.content,
                        dtype : value.dtype
                    };
                    if (value.lock){
                        changesToSend[_pns.Constants.wasCellEdited] = isChanged;
                        changesToSend.value = (isChanged ? newValue : value.content) || value.content;
                    }
                    if (changesToSend.value === undefined){
                        delete changesToSend.value;
                    }
                    if((changesToSend.dtype == 'doublerange' || changesToSend.dtype == 'integerrange') && changesToSend.value instanceof Object){
                    	changesToSend.value = changesToSend.value.min;
                    }
                    if (lockMode == "TMP"){
                        // delete changesToSend.value;
                        // delete
                        // changesToSend[_pns.Constants.wasCellEdited];
                    }
                    //if the PHY locked cell is empty, treat it as zero and mark as cellEdited.
                    if(lockMode == "PHY" && changesToSend.value == "__Nv__"){
							changesToSend.value = 0;
							changesToSend[_pns.Constants.wasCellEdited] = true;
					}

                    if (!skipBackendUpdate)
                        this.data.updateCell(pivotLocation[0], pivotLocation[1], changesToSend);
                    this.updateCellhandlers();
                }

            },
            getStandardColumnSize : function() {
                var str = new Array(this._settings.standardColumnSizeChar + 1).join('M');
                return this._getSimpleHtmlWidth(str);
                //return this._getSandboxSize(str, true);
            },
            
            getStandardCharSize : function() {
                var str = new Array(this._settings.standardColumnSizeChar + 1).join('M');
                return this._getSimpleHtmlWidth(str)/str.length;
            },
            posToName : function(pos) {
                var colPos = this._columns[pos[1]];
                if(!colPos){
                    return colPos;
                }
                return [ this.data.order[pos[0]], colPos.id ];
            },
            _on_header_click : function(e) {
                var cell = this.locateCell(e || event);
                if (!cell)
                    return;
                var col = this._columns[cell[1]];
                if (!col || !col.sort)
                    return;

                var order = 'asc';
                if (col.id == this._last_sorted)
                    order = this._last_order == "asc" ? "desc" : "asc";
                if (col)
                    this._sort(col.id, order, col.sort);
            },

            locateCell : function(_node) {
                var that = this;
                var isArray=_.isArray(_node);
                var retVal=null;
                var retVals=[];
                var nodes = _node;
                if (_node === undefined)
                    return;
                if (!isArray) {
                    nodes = [$(_node.target || _node.srcElement || _node)];
                }

                // This is to check we're not going into a loop
                var prevNode = null;
                $.each(nodes,function(index,$node){
                    var node=$node[0];
                    var rowPath = null;
                    var columnPath = null;
                    var section = null;

                    var $foundElement=$node.closest('div.dhx_value, .topCellMember, .sideFacetMemberContainer, .measureCell ',that.$_viewobj);
                    if ($foundElement.hasClass('dhx_value')) {
                    	// this is a data cell
                        retVal = that.locate($foundElement[0]);
                         if (retVal) {
                        	 if($foundElement.hasClass('dhx_attr_cell')){
                        		 retVal.push(_pns.Constants.attrCellsSection);
                        	 }
                        	 else
                        	 {
                        		 retVal.push(_pns.Constants.dataCellsSection);
                        	 }
                         }

                    }
                    else if ($foundElement.hasClass('topCellMember')) {
                        // This is a top facet member cell
                        var colIdx = $node.closest('td[column]').attr('column');
                        var facetPrefix = _pns.Constants.hdrPrefix + _pns.Constants.facetIdPrefix;
                        var facetNode = $(node).closest('tr[id^="' + facetPrefix + '"]');
                        var facetRegex = /^hdr_fc(.+)/;
                        var facetIdArray = facetRegex.exec(facetNode.attr('id'));
                        var facetId = null;
                        if (!facetIdArray || !facetIdArray.length)
                            facetId = _pns.Constants.measureIdPrefix;
                        else
                            facetId = facetIdArray[1];

                        if (colIdx!==undefined && facetId !== undefined) {
                            retVal= [ node.id,
                                that._columns[colIdx].id,
                                _pns.Constants.topAxisFacetsSection,
                                facetId ];
                        }
                    }
                    else if ($foundElement.hasClass('sideFacetMemberContainer')) {
                        // This is a side facet member cell
                        rowPath = $foundElement.attr('rowPath');
                        var $cell=$foundElement.closest('.dhx_column');
                        if ($cell.length==0) {
                            return null;
                        }
                        columnPath = that._columns[$cell.attr('column')].id;
                        section = _pns.Constants.sideAxisFacetsSection;
                        retVal = [rowPath, columnPath, section];
                    }
                    else if ($foundElement.hasClass('measureCell')) {
                        // This is a measure cell
                        section = _pns.Constants.measuresDataSection;
                        rowPath = $foundElement.parent().attr('rowPath');
                        var $cell=$foundElement.closest('.dhx_column');
                        columnPath = that._columns[$cell.attr('column')] && that._columns[$cell.attr('column')].id;
                        retVal = [rowPath, columnPath, section];
                    } else {
                        // Not found 
                        retVal = null;
                    };

                    /**

                     **/
                    if (retVal)
                    {
                        if (!isArray) {
                            return false;
                        }
                        retVals.push(retVal);
                        retVal=null;

                    }
                });
                if (!isArray) {
                    return retVal;
                }
                else
                {
                    return retVals;
                }
            },
            locateColumn : function(node){
           	 var cdiv = node.parentNode;
                if (!cdiv)
                    return false;
                var column = cdiv.getAttribute("column") * 1;
                var currCol=this._columns[column];
                
                return currCol ? currCol.node : false;
           },
            locate : function(node) {
                var cdiv = node.parentNode;
                if (!cdiv)
                    return;
                var column = cdiv.getAttribute("column") * 1;
                var rowpath = node.getAttribute("data-rowaxispath").trim();
                var currCol=this._columns[column];
                if (currCol) {                       	
                	return [rowpath,currCol.id];		                  
                }                       
                return undefined;
            },
            getAxisFacetNode : function($element) {
                var pivotLocation = this.locateCell($element[0]);
                if (!pivotLocation)
                    return null;
                var col = this._columns[this.columnIndex(pivotLocation[1])];
                var row = this.data.item(pivotLocation[0]) || 0;

                var axisFacet = this._getAxisFacetFromRowCol(row, col, pivotLocation[2], pivotLocation[3]);
                return axisFacet;
            },
            registerActions : function() {
                var that = this;
                this.$_viewobj.find('.dhx_dtable').on('keyup keypress', function() {
                    return false;
                });
                that.$_viewobj.on('click', 'input.pivotRowSelector', function(event){
                	var target = event.target || event.srcElement;
                	var $parent =$(target).parent();
                	var newStatus = $(target).is(":checked")? 1 : 0;
                	var datarowpath =$parent.attr('rowselpath');
                	//that.setRowSelectorStatus($parent.attr('rowselpath'), newStatus);
                	$(target).attr("chbox",newStatus);
                	that.doRowSelection(datarowpath,newStatus);  
                	//that._check_rendered_cols(true,false,false);
                });
                that.$_viewobj.on('click', 'input.pivotColumnSelector', function(event){
                	var target = event.target || event.srcElement;
                	var $parent =$(target).parent();
                	var colPath = $parent.attr('colpath');                	
                	var newStatus = $(target).is(":checked") ? 1 : 0;
                	//target.className= "pivotColumnSelector chbox_"+newStatus;               	
                	$(target).attr("chbox",newStatus);
                	//that.setColSelectorStatus(colPath, newStatus);
                	that.doColSelection(colPath,newStatus);
                	
                });
             // changes for key focus is not coming into view port data cells from out of view port
                if(!that._doScroll)that._doScroll = true;
                $(that.$view).attr('tabindex', 0);
                $(that.$view).on('keydown', function(e) {
                    if (e.which == 13){
                        e.stopPropagation ? e.stopPropagation() : e.returnValue = false;
                        if (that.$activeEditor){
                            that._navigateByKey(e, that.$activeEditor.prop('cellId'));
                        }
                        return false;
                    }

                    if (e.ctrlKey) {
                        if (e.keyCode==86){
                        	pivotObjForRef._onpaste(e);//Calling _onCopy(e) directly to improve performance of paste operation in IE.
                            var selectedFocused = $(pivotObjForRef._viewobj).find('div.dhx_cell_select.dhx_value');
                            if(!pivotObjForRef.isCellAvailableInView(selectedFocused)){
                            	var cellId = {
                            			sideAxis:null,
                            			topAxis:null
                                };
                            	cellId.row = that.lastSelectedCellId.sideAxis;
                            	cellId.column = that.lastSelectedCellId.topAxis;
                            	that._y_scroll.scrollTo(that._lastScrollY);
                            	that._getDataArea().scrollTo(that._lastScrollX);
                            	setTimeout( function(){that._navigateByKey(e, cellId);},50);
                            }
                        // this._onpaste();
                        }else if (e.keyCode === 67){
                        	that._oncopy();
                        }
                        return true;
                    }
                 // changes for key focus is not coming into view port data cells from out of view port
                    else if(that._doScroll && ((e.which >= 37 && e.which <= 40) || e.which == 9 || e.which == 27)){                            	
                    	var cellId = {
                      	sideAxis:null,
                      	topAxis:null
                       };
                       cellId.row = that.lastSelectedCellId.sideAxis;
                       cellId.column = that.lastSelectedCellId.topAxis;
                       if((that.cellSelForCopyIndicator && selectedCellId) || e.shiftKey){
                    	if(e.shiftKey){                            		
                    		   that._y_scroll.scrollTo(that._lastScrollY);
                          	   that._getDataArea().scrollTo(that._lastScrollX);
                    		that._startEditOnKeyDown(event);
                    		return false;
                    	   }else{
                        	   cellId = selectedCellId;
                        	   that._lastScrollX = that.selectedCellsInfo.scrollX;
                        	   that._lastScrollY = that.selectedCellsInfo.scrollY;
                        	   that._clearMultiSelection();
                    	   }                            	   
                       }
                       that._y_scroll.scrollTo(that._lastScrollY);
                 	  that._getDataArea().scrollTo(that._lastScrollX);
                 	  setTimeout( function(){that._navigateByKey(e, cellId);
                 		  pivotlog(" After the setTimeout in registerAcctions");  
                 	  },50);
                    }
                    else if (that.$activeEditor){
                    	
                   	 var cellId = {
                       		 
                             	sideAxis:null,
                             	topAxis:null
                              };
                              //cellId = this.lastSelectedCellId;
                              cellId.row = that.lastSelectedCellId.sideAxis;
                              cellId.column = that.lastSelectedCellId.topAxis;
                   	
                   	that._navigateByKey(e, cellId);
                   	
                   }

                });

                var $pivotView = $(that.$view);

                // Register lightboxes
               //Cleaned up pretty photo related code.
                var facetMembersSelector = '.parentContainer';

                $pivotView
                    .on(
                    {
                        'click' : function(event) {
                            var s = event.shiftKey;
                            if (s) {
                                return;
                            }
                            var $cellWrapper = $(this);
                            var $thisChild = $cellWrapper.find(':first');

                            var pivotLocation = that.locateCell($thisChild[0]);
                            var col = that._columns[that.columnIndex(pivotLocation[1])];
                            var row = that.data.item(pivotLocation[0]) || 0;

                            var axisFacet =
                                that._getAxisFacetFromRowCol(row, col, pivotLocation[2],
                                    pivotLocation[3]);

                            var tweakedAxisPath = that.getTweakedAxisPath(axisFacet);

                            var clickedNode =
                                axisFacet.axis.getNode(axisFacet.facetIndex, tweakedAxisPath);
                           
                            // Update Expanding axis Facet information 
                            // It requires to collapse whenever user cancel 
                            // during get segment data          
                            that.lastExpandedNode ={
                            		1:axisFacet.axis,
                            		2:axisFacet.facetIndex,
                            		3:clickedNode
                            };
                            
                            if ($thisChild.hasClass('facet_member_expanded') || $thisChild.hasClass('measure_member_expanded')){
                                // Check we're not editing and we have an error
                                if (that.isEditing() && !that.submitEdit()){
                                    return;
                                }
                                // Collapsing
                                if($thisChild.hasClass('measure_member_expanded')){
                                	if(pivotLocation[2]=="measuresDataSection" || (pivotLocation.length==4 && pivotLocation[3]=="mr")){
                                    	if($cellWrapper.parent()&& $cellWrapper.parent()[0]){
                                    		that.data.clickedRowpath = $cellWrapper.parent()[0].getAttribute("rowpath") || $cellWrapper[0].id.replace(_pns.Constants.hdrPrefix,"");
                                         }
                                    	that._collapseMeasure(that.data.clickedRowpath);
                                    }
                                }else{
                                	that._collapse(axisFacet.axis, axisFacet.facetIndex, clickedNode);
                                }
                                that._maintainSelected();
                            }
                            else if ($thisChild.hasClass('facet_member_collapsed') || $thisChild.hasClass('measure_member_collapsed')){
                                // Check we're not editing and we have an error
                                if (that.isEditing() && !that.submitEdit()){
                                    return;
                                }
                                // Expanding
                                var mainNodeAxisPath =
                                    (axisFacet.axis.facets.length < tweakedAxisPath.length) ? tweakedAxisPath
                                        .slice(0, tweakedAxisPath.length - 1) : tweakedAxisPath;
                                col.realSize = null;
                                if($thisChild.hasClass('measure_member_collapsed')){
                                    if(pivotLocation[2]=="measuresDataSection" || (pivotLocation.length==4 && pivotLocation[3]=="mr")){
                                    	if($cellWrapper.parent()&& $cellWrapper.parent()[0]){
                                    		that.data.clickedRowpath = $cellWrapper.parent()[0].getAttribute("rowpath") || $cellWrapper[0].id.replace(_pns.Constants.hdrPrefix,"");
                                         }
                                    	that._expandMeasures(that._getAxisPathMeasureSplit(that.data.clickedRowpath)[1],axisFacet);
                                    }
                                }else{
                                	that._getChildrenHierarchy(axisFacet.axis.index, mainNodeAxisPath,
                                			axisFacet.facet.id, 1);
                                	
                                }

                            }
                            else{
                                return;
                            }
                            $thisChild.toggleClass('facet_member_collapsed facet_member_expanded');
                            if ($thisChild
                                .hasClass('facet_member_collapsed_highlight')|| $thisChild.hasClass('facet_member_expanded_highlight'))
                            {
                                $thisChild
                                    .toggleClass('facet_member_collapsed_highlight facet_member_expanded_highlight');
                            }

                        },
                        'mouseenter mouseleave' : function(event) {
                            var $cellWrapper = $(this);
                            var $thisChild = $cellWrapper.find(':first');
                            if ($thisChild.hasClass('pivot_member_name'))
                                return;
                            if ($thisChild.hasClass('facet_member_expanded')){
                                $thisChild.toggleClass('facet_member_expanded_highlight');
                            }else if($thisChild.hasClass('facet_member_collapsed')){
                                $thisChild.toggleClass('facet_member_collapsed_highlight');
                            }else if ($thisChild.hasClass('measure_member_expanded')){
                                $thisChild.toggleClass('measure_member_expanded_highlight');
                            }
                            else if($thisChild.hasClass('measure_member_collapsed')){
                                $thisChild.toggleClass('measure_member_collapsed_highlight');
                            }
                        }
                    }, facetMembersSelector);

                $('#pivotOKPrompt').click(function() {
                    that._unblockUI();
                });
                // When clicked on the lock mode we allow seting locks
                // on the the cell with their applicable locks
                $pivotView.on('click', $('span.ui-icon-locked:parent'),
                    function(event) {
                        // Run when a locked icon cell is clicked
                        if ((event.ctrlKey))
                            return true;
                        var cellLocation = that.locateCell(event.target);
                        if (cellLocation){
                            var currVal = that.getValueFromAxisLocation(cellLocation);
                            var section = cellLocation[2];
                            if ((_pns.Constants.topAxisFacetsSection != section) &&
                                that._getPivotLockedMode() &&
                                !(event.target.parentNode && $(event.target)
                                    .parents('jda_pivot_corner').length) &&
                                (!$(event.target).hasClass('naValue')) && currVal.canLock)
                            {
                                that.toggleLock(event.target, currVal.canLock);
                            }
                        }

                    }); // End click handler

                $pivotView.on('mouseup.coordinates', 'div.dhx_value', function(event) {
                    // Run when a mouseup with ctrl is done on a cell to display the cell coordinates
                    pivotlog('mouseup.coordinate');
                    if (that._isShowingContextMenu||that.isDragging)
                        return;

                    var target = event.target || event.srcElement;
                    var isClickCtrlDown = event.ctrlKey;
                    event.metaKey = false;
                    if (isClickCtrlDown){
                        event.preventDefault();
                        var text = that.getCellAxisLabel(target);
                        $(this).qtip({
                            content : text,
                            overwrite : false,
                            position : {
                                target : 'event',
                                my : 'left top',
                                at : 'right center',
                                viewport : $pivotView,
                                adjust: {
                                    x: 5
                                }
                            },
                            style : {
                            	tip: 'center',
                                classes : 'pivotCellTooltipStyle ui-tooltip-shadow'
                            },
                            show : {
                                event : event.type,
                                solo : true,
                                ready : true,
                                effect : function() {
                                    $(this).fadeTo(200, 0.95);
                                }
                            },
                            events : {
                                show : function(eventTip, api) {
                                    if (!eventTip.originalEvent.ctrlKey){
                                        // IE might throw an error calling preventDefault(), so use a try/catch
                                        // block.
                                        try{
                                            eventTip.preventDefault();
                                        }catch (e){
                                            eventTip.cancelBubble = true;
                                        }
                                        ;
                                    }

                                }
                            }

                        }, event);
                    }

                });


                $pivotView.on('mouseover','div.dhx_cell.dhx_value',function(event){
                    if (that._isShowingContextMenu||that.isDragging)
                        return;

                    var target = event.target || event.srcElement;
                    if(!$(target).find('.cmtRelation-SELF, .cmtRelation-ANCESTORS,.cmtRelation-DESCENDANTS').length)
                        return;
                    var cellLocation = that.locateCell(target);

                    var value = {};
                    value.cmt=true;
                    value.operation="read";
                    value.event="onHover";
                    var updateId = {
                        sideAxis : cellLocation[0],
                        topAxis : cellLocation[1]
                    };
                    var updateValue = {
                        "data" : value
                    };
                    that.data.callEvent("onViewComment", [ updateId, updateValue, "update" ]);

                });

/*
                $('body .pivotLayerElement div').on('paste',function(e){
                    pivotlog('body paste event %o',e);
                });// end click handler
                $pivotView.on('paste',function(e){
                    pivotlog('paste event %o',e);
                });*/// end click handler

                //              $pivotView[0].onpaste = this._onpaste;   
                //                 $pivotView[0].addEventListener ("paste", this._onpaste, false);

                $pivotView
                    .on(
                    'mouseover',
                    /*'.pivot_member_name, .topFacet, .sideFacet',*/
                    '.parentContainer',
                    function(event) {
                        if (that._isShowingContextMenu)
                            return;
                        $(this)
                            .qtip(
                            {
                                overwrite : false,
                                content : ' ',
                                position : {
                                    target : 'mouse',
                                    my : 'left top',
                                    at : 'right center',
                                    viewport : $pivotView,
                                    adjust: {
                                        x: 5
                                    }
                                },
                                show : {
                                    delay : 1000,
                                    event : event.type,
                                    ready : true,
                                    solo : true
                                },
                                style : {
                                	tip: 'center',
                                    classes : 'pivotCellTooltipStyle ui-tooltip-shadow'
                                },
                                hide : {
                                    when : {
                                        event : 'mousemove scroll mouseout mousewheel'
                                    },
                                    delay : 200
                                },
                                events : {
                                    show : function(eventTip, api) {
                                        var tooltipRenderers =
                                            that.customPivotLogic.renderers &&
                                            that.customPivotLogic.renderers.tooltip;
                                        var measureRenderer =
                                            tooltipRenderers &&
                                            tooltipRenderers.measure;
                                        var target = $(eventTip.originalEvent.target);
                                       // console.dir(target);
                                        pivotlog('Target is %o',target);
                                        var toolTipText = "";

                                        if (!target.length ||
                                            that._isShowingContextMenu ||
                                            that.isMeasureDrag)
                                        {
                                            eventTip.preventDefault();
                                            return;
                                        }
                                        var pivotLocation =
                                            that.locateCell(target.parent()[0]);

                                        if (!pivotLocation || _pns.Constants.measuresDataSection === pivotLocation[2]
                                        		|| _pns.Constants.measureIdPrefix == pivotLocation[pivotLocation.length-1] ){
                                            eventTip.preventDefault();
                                            return;
                                        }

                                        var col =
                                            that._columns[that
                                                .columnIndex(pivotLocation[1])];
                                        var row = that.data.item(pivotLocation[0]) || 0;


                                        var axisFacet =
                                            that._getAxisFacetFromRowCol(row, col,
                                                pivotLocation[2],
                                                pivotLocation[3]);
                                        if (!axisFacet)
                                            return;
                                        var axis = axisFacet.axis;
                                        var facetIndex = axisFacet.facetIndex;
                                        
                                        if(facetIndex == -1){
                                        	eventTip.preventDefault();
                                            return;
                                        }

                                        if (facetIndex == _pns.Constants.measureIdPrefix)
                                        {
                                            var measureObj =
                                                that
                                                    .getMeasure(_pns.axisPath
                                                        .getMeasureIdFromAxisPathStr(pivotLocation[0]));
                                            if (measureRenderer){
                                                toolTipText =
                                                    measureRenderer.apply(that,
                                                        [ measureObj ]);
                                            }
                                            else{
                                                toolTipText = measureObj ? measureObj.label: col.isAttr ? col.name:"";
                                            }
                                        }
                                        else{
                                            var facet = axisFacet.facet;
                                            var axisPath = axisFacet.axisPath;
                                            var clickedNode =
                                                axis.getNode(facetIndex, axisPath);
                                            if(clickedNode == undefined)
                                                return;
                                            var levelName = that.getLocaleString('TopLevelName');
                                            var clickedLevel =
                                                clickedNode.axisPath[facetIndex].length - 1;
                                            if (clickedLevel > 0)
                                                levelName = facet.visibleLevels[clickedLevel - 1].attributeName;

                                            // var
                                            // sandBoxWidth=that._getSandboxSize(target.text())+parseInt(target.css('text-indent'),10)-5;
                                            // var
                                            // visibleWidth=target.width();
                                            var targetText = target.text() || clickedNode.name;
                                            toolTipText = levelName + ':' +targetText;
                                        }

                                        api.set('content.text', toolTipText);
                                    }
                                }
                            }, event);

                    });

                $pivotView.on('mouseover', 'span.metaInfo', function(event) {

                    if (that._isShowingContextMenu)
                        return;
                    // Create the tooltip on a dummy div
                    // since we're sharing it between
                    // targets
                    $(this).qtip({
                        overwrite : false,
                        content : ' ',
                        position : {
                            target : 'event', // Use
                            // the
                            // triggering
                            // element
                            // as
                            // the
                            // positioning
                            // target
                            my : 'left top',
                            at : 'right center',
                            viewport : $pivotView,
                            adjust: {
                                x: 5
                            }
                        },
                        style : {
                        	tip: 'center',
                            classes : 'pivotCellTooltipStyle ui-tooltip-shadow'
                        },
                        show : {
                            delay : 500,
                            event : event.type,
                            ready : true,
                            solo : true
                        },
                        hide : {
                            when : {
                                event : 'mousemove'
                            },
                            delay : 500
                        },
                        events : {
                            show : function(eventTip, api) {
                                var toolTipText = "";
                                var target = $(eventTip.originalEvent.target);
                                if (!target.length || that._isShowingContextMenu || that.isMeasureDrag){
                                    eventTip.preventDefault();
                                    return;
                                }
                                $('.pivot-data-cell-tooltip') && $('.pivot-data-cell-tooltip').hide();
                                toolTipText = that.getCellError(target[0]) || $((target[0])).data('msg');
                                if(toolTipText){
                                	api.set('content.text', toolTipText);	
                                }else{
                                	 eventTip.preventDefault();
                                     return;
                            }
                        }
                        }
                    }, event);

                });
                
                //The below code used for import from excel
                $('#mdapImportExcel')[0] && $('#mdapImportExcel').fileupload({
                	//dataType: "text",
                	//forceIframeTransport: true,
                	autoUpload: true,
                	add : function(e, data) {
                		if ((/(\.|\/)(xls|xlsx)$/i).test(data.files[0].name)) {
                			data.submit();
                        }else{
                        	 alert(pivotObjForRef.getLocaleString('ImportExcel.ExcelFile'));
                        }
                	},
        	        submit: function (e, data) {
        	        	 data.url = pivotObjForRef.data.url;
        	        	 var searchString = data.url.split("?")[1];
        	        	 var params = searchString.split("&");
        	        	 var inputParams = {};
        	        	 for (var i = 0; i < params.length; i++) {
        	        	 var val = params[i].split("=");
        	        	  inputParams[unescape(val[0])] = unescape(val[1]);
        	        	 }
        	        	 data.formData = inputParams;
        	        },
        	        start : function (e){
        	        	if($('#WorksheetWaitCancelIndicatorDiv')){
        	        		_.delay(function(){
        	        			$('#WorksheetWaitCancelIndicatorDiv').hide();
    					     }, 50);
        	        	}
        	        },
        	        done: function (e, data) {
        	        	/*_.delay(function(){
        	        		pivotObjForRef.data.callEvent("onHideOverlaySpinner", []);
                        },100);*/
        	        	//TODO have to call the below method only if the file is successfully stored in session.
        	        	pivotObjForRef.sendImportFromExcelRequest();
        	        },
        	        fail: function (e, data) {
        	        	_.delay(function(){
        	        		pivotObjForRef.data.callEvent("onHideOverlaySpinner", []);
                        },100);
        	        	pivotlog("upload failed due to " + data.textStatus);
        	        }
        	    });
            },

            /*bringScrollToClientArea: function(cellDom,skipFullyInView) {
            	pivotlog('Starting bringScrollToClientArea');
                var $cellWrapper = $(cellDom).closest('.dhx_cell');
                if ($cellWrapper.length) {
                    var $areaContainer = $cellWrapper.parent().parent();
                    var parentClientHeight = $areaContainer[0].clientHeight;
                    var parentScrollTop = $areaContainer[0].scrollTop;
                    var parentViewEdge = parentScrollTop + parentClientHeight;
                    var cellPosition = $cellWrapper.position();
                    var cellHeight = $cellWrapper.outerHeight();
                    var cellBottomEdge = cellPosition.top + cellHeight;
                    if (parentViewEdge < cellBottomEdge && cellPosition.top < parentViewEdge) {
                    	var yVal= (cellBottomEdge - parentViewEdge)+parentScrollTop;
                    	pivotlog('bringScrollToClientArea yVal=%o',yVal);
                        this._adjustYScroll(yVal);
                    }
                }
            },*/
         // ****** Starting Copy Data To Clipboard Functionaly  ****** //
            _oncopy: function(e) {
            	pivotlog("start jda_pivot.js oncopy :"+pivotObjForRef.getFormatedTime());
            	pivotObjForRef.copyStartTime = new Date().getTime();
             	if(pivotObjForRef.isCopyPasteEnabled()){
             		
             		// check if selection for copy exceeds governor value
             		if(pivotObjForRef.selectedCellsInfo.baseCell && pivotObjForRef.selectedCellsInfo.currentCell) // for single cell selection baseCell and currentCell does not exist,
             																										// no need to check for governor as it is single cell copy 
             		{
                 		var rowColumnIndexes = pivotObjForRef.getIndexesForRectangleBox(pivotObjForRef.selectedCellsInfo.baseCell, pivotObjForRef.selectedCellsInfo.currentCell);
                  		                     		
                 		var rows = 1, cols = 1; 
            			if(rowColumnIndexes.endRowIndex != rowColumnIndexes.startRowIndex){
            				rows = Math.abs( rowColumnIndexes.endRowIndex - rowColumnIndexes.startRowIndex) + 1;
            			}
            			if(rowColumnIndexes.endColIndex != rowColumnIndexes.startColIndex){
            				cols = Math.abs( rowColumnIndexes.endColIndex - rowColumnIndexes.startColIndex )  +1 ; 
            			}
            			
            			pivotlog("selectedcellsCount : " + (rows *cols) + ", governorValue: " + pivotObjForRef.copyGovernor() );
            			
            			// if selection exceeds cancel Copy operation and return focus to currentCell to reduce selection
            			if(rows * cols > pivotObjForRef.copyGovernor())
            			{
            				var errorMessage = pivotObjForRef.getLocaleString('selectionRangeExceededError',pivotObjForRef.copyGovernor());
            				pivotObjForRef.triggerEvent('selectionExceededErr',{errorMessage:errorMessage});
            				
            				if (BrowserUtilities.isIE() ){
            					setTimeout( pivotObjForRef._select(pivotObjForRef.selectedCellsInfo.currentCell, false), 100 );
                           	 }else{
                           		pivotObjForRef._select(pivotObjForRef.selectedCellsInfo.currentCell, false);
                            }
            				pivotObjForRef.updateFocusedCell();
            				return;
            			}                      		
             		}
        			// Proceed with copy as passed Governor check
        			
             		if(!pivotObjForRef.selectedCellsInfo.baseCell && !pivotObjForRef.selectedCellsInfo.currentCell){
             			pivotObjForRef.cellSelForCopyIndicator=true;
             			pivotObjForRef.selectedCellsInfo.baseCell = pivotObjForRef.selectedCellsInfo.currentCell = pivotObjForRef.getSelected();
             			pivotObjForRef.selectedCellsInfo.scrollX = pivotObjForRef._getDataArea().getScrollLeft();
             			pivotObjForRef.selectedCellsInfo.scrollY = pivotObjForRef._y_scroll._viewobj.scrollTop;
       				}
             		pivotObjForRef.copyDataToClipboardFromPivot(e);
             	}else{
             		pivotlog('To copy the content from pivot, please enable the CopyPasteEnabled flag');	
             	}
             	pivotlog("end jda_pivot.js oncopy :"+pivotObjForRef.getFormatedTime());
            },
            copyDataToClipboardFromPivot: function(e) {
            	pivotlog("start jda_pivot.js copyDataToClipboardFromPivot :"+pivotObjForRef.getFormatedTime());
            	var selectedCellsInfo = pivotObjForRef.selectedCellsInfo;
              	var baseCell = selectedCellsInfo.baseCell;
              	var currentCell = selectedCellsInfo.currentCell;                      	
              	if(baseCell && currentCell){
              		var rowColumnIndexes = pivotObjForRef.getIndexesForRectangleBox(baseCell, currentCell);
              		var startRowIndex = rowColumnIndexes.startRowIndex;
                	var startColIndex = rowColumnIndexes.startColIndex;
                	var endRowIndex = rowColumnIndexes.endRowIndex;
                	var endColIndex = rowColumnIndexes.endColIndex;
              		
	                    var sideAxisPathsState = pivotObjForRef.data.order;
	                 	var topAxisPathsState = pivotObjForRef._columns;
	                 	var rowColumnData = [[]];
	                 	var rowIndex = 0;
	                 	var colIndex = 0;
	                 	//Copying members and facet names, if the below flag is set to true
	                 	if(pivotObjForRef.copyDataWithMetadata()){
	                 		rowColumnData = pivotObjForRef.prepareTopAxisMetadata(startColIndex, endColIndex);
	                 		rowIndex = rowColumnData.length;
	                 	}
	                 	for(var row = startRowIndex ; row <= endRowIndex; row++){
	                    	var rowItem = this.item(sideAxisPathsState[row]);
	                    	var rowArr = [];
	                    	var cellId ;
	                    	colIndex = 0;
	                    	if(pivotObjForRef.copyDataWithMetadata()){
		                    	for(var i = 0; i < this.getSideVisibleFacets().length; i++){
		                    		rowArr[colIndex++] = pivotObjForRef.getPrependingZeroValue(rowItem['fc'+this.getSideVisibleFacets()[i].id]);
		                    	}
		                    	if(!pivotObjForRef.areMeasuresOnTop()){
		                    		rowArr[colIndex++] = pivotObjForRef.getPrependingZeroValue(rowItem.mr);	
		                    	}
	                    	}
	                    	for(var col = startColIndex ; col <= endColIndex; col++){
	                    		var colObj = this._columns[col];
	                    		var rowObj = this.data.order[row];
	                    		var decimalPoints = null;
	                    		if (colObj && rowObj){
	                    			cellId = {
	                    					row : rowObj,
	                    					column : colObj.id
	                    			};
	                    			decimalPoints = pivotObjForRef.getDecimalFromCellId(cellId);
	                    		}
	                    		if(decimalPoints == null){
	                    			pivotlog("decimalPoints is null, so setting default decimal points");
	                    			decimalPoints = this._settings.defaultDecimal;
	                    		}
	                    		var colItem = rowItem[topAxisPathsState[col].id];
	                    		rowArr[colIndex++] = pivotObjForRef.getCellDefaultValue(this.data.getCellValFromCellId(cellId),decimalPoints);
			                }
	                    	rowColumnData[rowIndex] = rowArr;
	                    	rowIndex++;
	                    }
	                  pivotObjForRef.writeDataToClipboard(pivotObjForRef.prepareClipboardData(rowColumnData));
              	}else{
              		pivotlog('BaseCell and CurrentCell information is not available in selectedCellsInfo');
              	}
              	pivotlog("end jda_pivot.js copyDataToClipboardFromPivot :"+pivotObjForRef.getFormatedTime());
            },
              prepareTopAxisMetadata : function(startColIndex, endColIndex){
             	 var topAxisPathsState = pivotObjForRef._columns;
	                 var rowColumnData = [[]];
	                 var colIndex = -1;

	                 //Preparing dimension details
	                 for(var col = 0 ; col < topAxisPathsState.length; col++){
	                	if(topAxisPathsState[col].type == "header"){
	                		var colItem = topAxisPathsState[col];
                 		var colHeaders = colItem.header;
                 		colIndex++;
                 		var rowIndex = 0;
            			if(!pivotObjForRef.areMeasuresOnTop()){
                            var strIndex = 0;
            				if(this.getTopVisibleFacets().length == 1){
            					strIndex = 1;
            				}
            				for(var i = strIndex; i < colHeaders.length; i++){
        						var arr = pivotObjForRef.getExistingArrayFrom2D(rowColumnData, rowIndex);
        				  			arr[colIndex] = pivotObjForRef.getPrependingZeroValue(colHeaders[i]);
        				  			rowColumnData[rowIndex] = arr;
        				  			rowIndex++;
            				}
            			}else{
    						for(var topFacets = 0 ; topFacets < this.getTopVisibleFacets().length; topFacets++){
    							var dimensionName = "";
    							if(colIndex == this.getSideVisibleFacets().length-1 ){
    								dimensionName = this.getTopVisibleFacets()[topFacets].UIAttributes.displayName;
    							}
    							var arr = pivotObjForRef.getExistingArrayFrom2D(rowColumnData, rowIndex);	 	                    						
    							arr[colIndex] = pivotObjForRef.getPrependingZeroValue(dimensionName);
	           				  		rowColumnData[rowIndex] = arr;
	           				  		rowIndex++;
        					}
    						if(colHeaders.length > 1){
        						var arr = pivotObjForRef.getExistingArrayFrom2D(rowColumnData, rowIndex);
    							arr[colIndex] = pivotObjForRef.getPrependingZeroValue(colHeaders[1]);
        				  			rowColumnData[rowIndex] = arr;
        				  			rowIndex++;
            				}
                		}
	                	}else{
	                		break;
	                	}
	                }
	                //Preparing top header rows
	                if(topAxisPathsState.length > endColIndex){
                 	for(var col = startColIndex ; col <= endColIndex; col++){
             			var colItem = topAxisPathsState[col];
                		var colHeaders = colItem.header;
                		colIndex++;
                		var rowIndex = 0;
                		if(colHeaders){
                			//If TopVisibleFacets length is zero no need to copy first col header
                    		//If TopVisibleFacets length is one and measures on side  then also no need to copy first col header
                			var strIndex = 0;
                			if(this.getTopVisibleFacets().length === 0 || (this.getTopVisibleFacets().length === 1 && !pivotObjForRef.areMeasuresOnTop())){
           				  		strIndex = 1;
           				  	}
                			for(var i = strIndex; i < colHeaders.length; i++){
           				  		var arr = pivotObjForRef.getExistingArrayFrom2D(rowColumnData, rowIndex);
       				  			arr[colIndex] = pivotObjForRef.getPrependingZeroValue(colHeaders[i]);
       				  			rowColumnData[rowIndex] = arr;
       				  			rowIndex++;
                    		 }
                		}
                 	}
	                }
             	return rowColumnData;
              },
              getVisibleMeasureIds:function (){
            	  var measuresIDs = [];
            	  var visiblemeasures = pivotObjForRef.data.cube.definition.visiblemeasures;
            	  for(var i = 0; i < visiblemeasures.length; i ++ ){
            		  measuresIDs.push(visiblemeasures[i].id);
            	  }
            	  return measuresIDs;
              },
              prepareClipboardData:function (rowColumnData){
            	  var clipBoardText = "";
            	  for(var row = 0; row < rowColumnData.length; row++) {
    				    var rowData = rowColumnData[row];
    				    if(rowData.length > 0){
    				    	var count = 0;
          				    for(var col = 0; col < rowData.length; col++) {
          				    	var value = rowData[col];
          				    	if(value == undefined){
          				    		value = "";
          				    	}
    				    		if(count == 0){
    				    			clipBoardText += value;
    				  			}else{
    				  				clipBoardText += "\t" + value;	
    				  			}
    				    		count++;
          				    }
          				    if(row != (rowColumnData.length - 1)){
          				    	clipBoardText += "\n";  	
          				    }
    				    }
    				}
            	  return clipBoardText;
              },
              getCellDefaultValue: function (cellId, decimalPoints){
            	  var cellValue;
            	  if (cellId.content === undefined || cellId.content === '__Nv__' || cellId.content === '__Nc__'){
						cellValue = "";
       	 			} else{
					    cellValue = pivotObjForRef.getCellValue(cellId, decimalPoints);
					}
            	  return cellValue;
              },
              getPrependingZeroValue: function (memberValue){
            	  if (memberValue && memberValue.length > 0 && memberValue.trim().charAt(0) === "0"){
            		  if(memberValue.indexOf("/") > -1 && pivotObjForRef.isValidDate(memberValue.trim())){
            			  var dateArr = memberValue.split("/");
            			  for(var dateCount = 0 ; dateCount < dateArr.length; dateCount++){
            				  var date = dateArr[dateCount];
            				  if(date && date.length > 0 && date.trim().charAt(0) === "0"){
            					  memberValue = "'"+memberValue+"'";
            					  break;
            				  }
            			  }
            		  }else{
            			  memberValue = "'"+memberValue+"'";
            		  }
       	 			}
            	  //appedning double quotes before and after the text to determine the facet members 
            	  if(memberValue){
            		  memberValue = '"' +memberValue+ '"';
            	  }
            	  return memberValue;
              }, 
              isValidDate: function (value){
            	  var dateWrapper = new Date(value);
          	    return !isNaN(dateWrapper.getDate());
              },
              getIndexesForRectangleBox : function (baseCell, currentCell){
            	  var startRowIndex = pivotObjForRef.indexById(baseCell.row);
            	  var startColIndex = pivotObjForRef.columnIndex(baseCell.column);
                     var endRowIndex = pivotObjForRef.indexById(currentCell.row);
                  var endColIndex = pivotObjForRef.columnIndex(currentCell.column);
                   if(startRowIndex > endRowIndex){
                	   	startRowIndex = startRowIndex + endRowIndex;  
                	    endRowIndex = startRowIndex - endRowIndex;  
                	    startRowIndex = startRowIndex - endRowIndex;
                    }
                    if(startColIndex > endColIndex){
                    	startColIndex = startColIndex + endColIndex;  
                    	endColIndex = startColIndex - endColIndex;  
                     	startColIndex = startColIndex - endColIndex;
                    }
                    return {
                    	startRowIndex : startRowIndex,
                    	startColIndex : startColIndex,
                    	endRowIndex : endRowIndex,
                    	endColIndex : endColIndex,
                    };
              },
              getSelectedMeasureIndexes : function (baseCell, currentCell, measureIds){
            	  var rowColumnIndexes = pivotObjForRef.getIndexesForRectangleBox(baseCell, currentCell);
            	  var startRowIndex = rowColumnIndexes.startRowIndex;
            	  var startColIndex = rowColumnIndexes.startColIndex;
            	  var endRowIndex = rowColumnIndexes.endRowIndex;
            	  var endColIndex = rowColumnIndexes.endColIndex;
            	  
            	  var startingMeasure = "";
           	      var endingMeasure = "";
               	  if(pivotObjForRef.areMeasuresOnTop()){
               		  	var topAxisPathsState = pivotObjForRef._columns;
               	       	var fullAxisPathObj = topAxisPathsState[startColIndex].axisPath.slice(0);
                 		startingMeasure = fullAxisPathObj[fullAxisPathObj.length-1][0];
                 		
                 		fullAxisPathObj = topAxisPathsState[endColIndex].axisPath.slice(0);
                 		endingMeasure = fullAxisPathObj[fullAxisPathObj.length-1][0];  
						
               	  }else{
               		   var sideAxisPathsState = pivotObjForRef.data.order;
               		   var fullAxisPathObj = new _pns.axisPath(sideAxisPathsState[startRowIndex]);
               		   startingMeasure = fullAxisPathObj.getMeasureId();
                      
               		   fullAxisPathObj = new _pns.axisPath(sideAxisPathsState[endRowIndex]);
               		   endingMeasure = fullAxisPathObj.getMeasureId();
               	  }
            	  
               	  var startingMeasureIndex = 0;
				  var endingMeasureIndex = measureIds.length;
				  for(var i = 0; i  < measureIds.length; i++ ){
					  if(measureIds[i] === startingMeasure){
						  startingMeasureIndex = i;
						  break;
					  }
				  }
				  for(var i = 0; i  < measureIds.length; i++ ){
					  if(measureIds[i] === endingMeasure){
						  endingMeasureIndex = i;
						  break;
					  }
				  }
				  return {
					  startingMeasureIndex : startingMeasureIndex,
					  endingMeasureIndex : endingMeasureIndex,
                  };
              },
              getExistingArrayFrom2D: function(data, searchingIndex) {
            	  var arr = null;
			  			$.each( data, function(index,value){
    				  		if(index == searchingIndex){
    				  			arr = value;
    				  		}
    					});
			  			if(arr == null){
			  				arr = []
			  			}
			  			return arr;
              },
			writeDataToClipboard: function(inputText) {
				 pivotlog("start jda_pivot.js writeDataToClipboard :"+pivotObjForRef.getFormatedTime());
				 
				//loosing the selected cell focus after calling copy event, So handling with below code
				setTimeout(function(){
			    	var baseCell = pivotObjForRef.selectedCellsInfo.baseCell;
		      		if(baseCell){
		      			pivotObjForRef.select(baseCell);
		      			pivotObjForRef.updateFocusedCell();	
		      		}
			     }, 100);
				
				if (BrowserUtilities.isIE() ){
				 	window.clipboardData.setData('Text', inputText);
				 }else{
					 var cbta = document.createElement('textarea');
				     cbta.id = 'cliparea';
				     cbta.style.position = 'absolute';
				     cbta.style.left = '-1000px';
				     cbta.style.top = '-1000px';
				     cbta.value = inputText;
				     document.body.appendChild(cbta);
				     document.designMode = 'off';
				     cbta.focus();
				     cbta.select();
				     document.execCommand('copy');
				     setTimeout(function(){
			            document.body.removeChild(cbta);
				     }, 100);
				   }
				
				//Apply dotted css to copied data.
         		if(pivotObjForRef.selectedCellsInfo.baseCell){                     			
             		pivotObjForRef._clearCopiedData();
             		//Copy the selectedCellsInfo to copiedCellsInfo and then decoupled from selectedCellsInfo, so that copiedCellsInfo won't effect with further selection.
             		pivotObjForRef.copiedCellsInfo = jQuery.extend(true, {}, pivotObjForRef.selectedCellsInfo);
         			pivotObjForRef.copySelectedData();
         		}
         		if(pivotObjForRef.copyStartTime){
         			var endTime = new Date().getTime() ;
                 	pivotlog("Total time taken for copy operation : " + ( (endTime - pivotObjForRef.copyStartTime)/1000) + " seconds" );
         		}else{
         			pivotlog("Total time taken for copy operation : " + null);
         		}
         		pivotlog("end jda_pivot.js writeDataToClipboard :"+pivotObjForRef.getFormatedTime());
			},
			removeMetadataFromClipboardText : function(clipboardText){
				var sideVisibleFacets = this.getSideVisibleFacets();
				var topVisibleFacets = this.getTopVisibleFacets();
				var tobeRemoveRows = this.getTopVisibleFacets().length;
				var tobeRemoveCols = this.getSideVisibleFacets().length;
				if(pivotObjForRef.areMeasuresOnTop()){
					tobeRemoveRows += 1;
				}else{
					tobeRemoveCols += 1;
				}	
				
				var clipboardTextValues = [];
				var clipboardvalues = [];
				if(clipboardText.indexOf("\n") > -1){
					clipboardvalues = clipboardText.split("\n");
				}else{
					clipboardvalues = clipboardText.split(" ");
				}
				
				if(clipboardvalues[clipboardvalues.length-1] === ""){
					clipboardvalues.pop();
				}

				if(clipboardvalues.length > 0){
					for(var i=0; i< clipboardvalues.length;i++){
						if(i < tobeRemoveRows){
							continue;
						}
						var rowData = clipboardvalues[i].split("\t");
						rowData = rowData.slice(tobeRemoveCols);
						clipboardTextValues.push(rowData);
					} 
				}
				return clipboardTextValues;
			},
			//Applying dotted line css to copied area.					
			copySelectedData : function(){
				if(pivotObjForRef.copiedCellsInfo && pivotObjForRef.copiedCellsInfo.baseCell){
					pivotObjForRef.isDataCopied = true;
                    var baseCell = pivotObjForRef.copiedCellsInfo.baseCell;
                    var currentCell = pivotObjForRef.copiedCellsInfo.currentCell;
                    var rowColumnIndexes = pivotObjForRef.getIndexesForRectangleBox(baseCell, currentCell);
                    
                    var startRowIndex = rowColumnIndexes.startRowIndex;
                    var startColIndex = rowColumnIndexes.startColIndex;
                    var endRowIndex = rowColumnIndexes.endRowIndex;
                    var endColIndex =  rowColumnIndexes.endColIndex;
                    
                    var _selectedCellDiv1, _selectedCellDiv2;
                    if(startColIndex != -1){
                    	while(startColIndex <=  endColIndex){
                        	_selectedCellDiv1 = pivotObjForRef._locateCellDiv({
                                row : pivotObjForRef.data.order[startRowIndex],
                                column : pivotObjForRef._columns[startColIndex].id
                            });                        	
                        	_selectedCellDiv2 = pivotObjForRef._locateCellDiv({
                                row : pivotObjForRef.data.order[endRowIndex],
                                column : pivotObjForRef._columns[startColIndex].id
                            });                        	
                        	$(_selectedCellDiv1).addClass('copy-selection-top'); 
                        	$(_selectedCellDiv2).addClass('copy-selection-bottom'); 
                        	startColIndex++;
                        }
                        //Resetting startColIndex.
                        startColIndex = rowColumnIndexes.startColIndex;
                        while(startRowIndex <=  endRowIndex){
                        	_selectedCellDiv1 = pivotObjForRef._locateCellDiv({
                                row : pivotObjForRef.data.order[startRowIndex],
                                column : pivotObjForRef._columns[startColIndex].id
                            });                        	
                        	_selectedCellDiv2 = pivotObjForRef._locateCellDiv({
                                row : pivotObjForRef.data.order[startRowIndex],
                                column : pivotObjForRef._columns[endColIndex].id
                            });                        	
                        	$(_selectedCellDiv1).addClass('copy-selection-left'); 
                        	$(_selectedCellDiv2).addClass('copy-selection-right'); 
                        	startRowIndex++;
                        }
                    }
				}
			},
              // ****** Ending Copy Data To Clipboard Functionaly  ****** //
            _onpaste: function(e) {
            	pivotlog("start jda_pivot.js _onpaste :"+pivotObjForRef.getFormatedTime());
            	if(pivotObjForRef.isCopyPasteEnabled()){
            		pivotObjForRef._clearMultiSelection();//Remove the multi selection if any.
            		pivotObjForRef._clearCopiedData();//Remove the copied data area.
                    clipText = new GetDataFromClipboard();
                    clipText.getClipboardText(function callback(clipBoardtext) {
                    	pivotlog('At callback clip_text',clipBoardtext);
                    	//Getting clipboard values into an array of values.
                    	selectedCellId = pivotObjForRef.getSelected();
                    	var copiedValues = pivotObjForRef.getCopiedValues(clipBoardtext);
                    	if(copiedValues && copiedValues.length > 0  && copiedValues[0].length > 0 ){
                    		var pasteValidation = pivotObjForRef.validatePastedCells(selectedCellId, copiedValues);
                    		if(pasteValidation.isValidLevelPaste){
                    			if(pasteValidation.isValidValues){
                    				if(pasteValidation.isPastedCellsAreRendered){
                            			pivotObjForRef.PasteContent(selectedCellId, copiedValues);
                            		}else{
                            			//Caching copied cell values for pasting after out of view port server request.  
                            			pivotObjForRef.copiedValues = copiedValues;
                            			pivotObjForRef.getDataForNonRenderedPastedCells(selectedCellId, copiedValues);
                            		}
                    			}else{
                    				if(pasteValidation.cellId !== selectedCellId){
                    					selectedCellId = pasteValidation.cellId;
                    				}
                    			}	
                        	}
                        	if (BrowserUtilities.isIE() ){
                        		setTimeout(function(){pivotObjForRef._select(selectedCellId, false);},100);
                           	 }else{
                           		pivotObjForRef._select(selectedCellId, false);
                            }
                    	}else{
                    		pivotlog("No cells are copied for pasting");
                    	}
                    	pivotObjForRef.updateFocusedCell();
                    });
            	}
            	pivotlog("end jda_pivot.js _onpaste :"+pivotObjForRef.getFormatedTime());
            },
            getDataForNonRenderedPastedCells: function(cellId, copiedValues){
            	this._blockUI();
            	var totalPastedRows = copiedValues.length;
            	var totalPastedCols = totalPastedRows > 0  && copiedValues[0].length;
            	var totalPivotDataRows = this.data.order.length;
            	var totalPivotCols = this._columns.length;
            	var selectedCellRowIndex = this.indexById(cellId.row);
            	var selectedCellColIndex = this.columnIndex(cellId.column);
            		var xrRight = (selectedCellColIndex + totalPastedCols);
            		if( xrRight > totalPivotCols){
            			xrRight = totalPivotCols;
            		}
            		var xr ={
        						0 :selectedCellColIndex,
        						1: xrRight
        					};
            		
            		var yrBottom = (selectedCellRowIndex + totalPastedRows);
            		if( yrBottom > totalPivotDataRows){
            			yrBottom = totalPivotDataRows;
            		}
            		var yr = {
        						0 :selectedCellRowIndex,
        						1: yrBottom
        					};
            		var refreshPaths = this._getRefreshRangeData(true, yr, xr);
                     var sideAxisPaths = [];
                     var topAxisPaths = [];
                     if (refreshPaths){
                         var topAxisPathsStr = refreshPaths.topAxisPathsStr;
                         var sideAxisPathsStr = refreshPaths.sideAxisPathsStr;
                         for ( var key in sideAxisPathsStr){
                             var value = sideAxisPathsStr[key];
                             var axisPath = new _pns.axisPath(key);
                             sideAxisPaths.push({
                                 axisPath : axisPath.facetPaths
                             });
                         }
                         for ( var key in topAxisPathsStr){
                             var value = topAxisPathsStr[key];
                             var axisPath = new _pns.axisPath(key);
                             topAxisPaths.push({
                                 axisPath : axisPath.facetPaths
                             });
                         }
                     }
                	var params = {}; 
      				params.sideAxisPaths = sideAxisPaths;
                  	params.topAxisPaths = topAxisPaths;
                  	params.combiMeasuresIds = refreshPaths.combiMeasuresIds;
                  	var getSegmentDataRequest = new jda.pivot.getSegmentDataRequest(params);
                  	getSegmentDataRequest.callback = pivotObjForRef._call_getDataForNonRenderedPastedCells;
                  	pivotObjForRef.data.pivotCommands[getSegmentDataRequest.id] = getSegmentDataRequest;
                  	pivotObjForRef.data.feed.call(this, this.data.url, "jda_pivot_json", getSegmentDataRequest._getPayload());
            },
            validatePastedCells :  function(cellId, copiedValues){
            	var isValidLevelPaste = true;
            	var isPastedCellsAreRendered = true;
            	var isValidValue = true;
            	var dataColumnIds = this._getDataColumnIds();
				var nextRowCellId = cellId;     
				var selectedCellParent = this.getParentCellId(cellId);
				var selectedCellColIndex = dataColumnIds.indexOf(cellId.column);
				outer : for(var i=0; i<copiedValues.length;i++){
					var cellColIndex = selectedCellColIndex;
					if(i > 0){
						cellId = this._locateNextCell(nextRowCellId,"down", true);
						if(!cellId){
							break;
						}
						nextRowCellId = cellId;
					}
					var rowValues = copiedValues[i];
					if(rowValues.length > 0){
						for(var j=0; j<rowValues.length;j++){
							var originalCopiedValue = rowValues[j];
							var copiedValue = this.formatValue(originalCopiedValue);
							if(cellColIndex >= dataColumnIds.length){
								break;
							}
							if(j > 0){
								cellId = this._locateNextCell(cellId,"right", true);
								if(!cellId){
									break;
								}
							}
							//validating cell levels. incase of failure stop paste operation.
							var currentCellParent = this.getParentCellId(cellId);
							if(JSON.stringify(currentCellParent) != JSON.stringify(selectedCellParent)){
									var errorMessage = this.getLocaleString('invalidLevelPaste')
									this.triggerEvent('pasteContentFailed',{errorMessage:errorMessage});
									isValidLevelPaste = false;
									break outer;
							}
							cellColIndex++;
							if(copiedValue == "" ){
                				continue;
                			}
							//Validate the new value,incase of failure stop paste operation.
							var newValue = this.getNewCopiedValue(cellId, copiedValue);
							if(newValue && this.isCellValueEditable(cellId) && !this.isDataDomainMeasure(cellId) ){
                            	var isValidValue = this.isValidValue(cellId, newValue);
                            	if (!isValidValue){
                            		var errorMessage = this.getLocaleString('invalidValue', originalCopiedValue);
                        			this.triggerEvent('pasteContentFailed',{errorMessage:errorMessage});
                        			isValidValue = false;
                        			break outer;
                            	}
							}
							//out of view segement cells won't have value object. In that case, 
							//we need to make a getsegment data call with missing cell value pasted cell id's.
							var value = pivotObjForRef.item(cellId.row)[cellId.column];
							if(!value){
								isPastedCellsAreRendered = false;
							}
						}
					}
				}
				//For Invalid value we need to make the cell as selected cell.
				var pasteValidation = {
						isValidLevelPaste : isValidLevelPaste,
						isPastedCellsAreRendered : isPastedCellsAreRendered,
						isValidValues : isValidValue,
						cellId : cellId						
				};
				return pasteValidation;
            },
            _call_getDataForNonRenderedPastedCells : function(response, request) {
            	this._unblockUI();
            	this._call_refreshOnGetSegmentData(response, request);
            	var selectedCellId = pivotObjForRef.getSelected();
                pivotObjForRef.PasteContent(selectedCellId, pivotObjForRef.copiedValues);	
                if (BrowserUtilities.isIE() ){
                	setTimeout(function(){pivotObjForRef._select(selectedCellId, false);},100);
                }else{
                	pivotObjForRef._select(selectedCellId, false);
                }
                pivotObjForRef.updateFocusedCell();
            },
            getParentCellId : function(cellId){
            	var cellParent = { row: this.getSideAxisView().getParentAxisPathStr(new _pns.axisPath(cellId.row)),
				  		 column: this.getTopAxisView().getParentAxisPathStr(new _pns.axisPath(cellId.column))};
            	return cellParent;
            },
            //Get the clipboard data. Store the data as array[arrays] in copiedValues. Outer array contains row values and inner array contains column values(for each row)
            getCopiedValues : function(clipBoardtext){

            	var copiedValues = [];
            	var clipboardvalues = [];
            	if(clipBoardtext.indexOf("\n") > -1){
            		clipboardvalues = clipBoardtext.split("\n");
            	}else{
            		clipboardvalues = clipBoardtext.split(" ");
            	}
            	if(clipboardvalues[clipboardvalues.length-1] === ""){
            		clipboardvalues.pop();
            	}
            	if(clipboardvalues.length > 0){
            		if(clipBoardtext.indexOf('"') >= 0){
            			for(var i=0; i< clipboardvalues.length;i++){
            				var rowData = clipboardvalues[i].replace("\r\n", "").replace("\n", "").replace("\r", "");
            				var lastIndex = rowData.lastIndexOf('"') + 1;
            				if(lastIndex >= 0 && lastIndex != rowData.length){
            					copiedValues.push(rowData.substring(lastIndex+1).split("\t"));
            				}
            			}
            		}else{
            			for(var i=0; i< clipboardvalues.length;i++){
            				var rowData = clipboardvalues[i].split("\t");
            				copiedValues.push(rowData);
            			}
            		}
            	}
            	return copiedValues;

            },
            checkArrays : function( arrA, arrB) {
            	//check if lengths are different
                if(arrA.length !== arrB.length)
                	return false;
                for(var i=0;i<arrA.length;i++){
                	if(arrA[i].length !== arrB[i].length) 
                		return false;
                	 for(var j=0;j<arrA[i].length;j++){
                		 if((arrA[i][j] !== arrB[i][j]) || (arrA[i][j] && arrB[i][j] && arrA[i][j].trim() !== arrB[i][j].trim()) ){
                			 return false;
                		 }
                	 } 
                }
                return true;
            },

            // ****** Starting Import From Excel Functionaly  ****** //
            sendImportFromExcelRequest : function() {
                var viewRange = pivotObjForRef._getRefreshRangeData(true);
                var sideAxisPaths = [];
                var topAxisPaths = [];
                var measuresIDs = [];
                if (viewRange){
                    var topAxisPathsStr = viewRange.topAxisPathsStr;
                    var sideAxisPathsStr = viewRange.sideAxisPathsStr;
                    measuresIDs = viewRange.combiMeasuresIds;
                    for ( var key in sideAxisPathsStr){
                        var value = sideAxisPathsStr[key];
                        var axisPath = new _pns.axisPath(key);
                        sideAxisPaths.push({
                            axisPath : axisPath.facetPaths
                        });
                    }
                    for ( var key in topAxisPathsStr){
                        var value = topAxisPathsStr[key];
                        var axisPath = new _pns.axisPath(key);
                        topAxisPaths.push({
                            axisPath : axisPath.facetPaths
                        });
                    }
                }
  				
  				var viewSegment = {
  					topAxisPaths : topAxisPaths,
  					sideAxisPaths : sideAxisPaths
  				}
               	var params = {}; 
               	params.viewSegment = viewSegment;
               	params.combiMeasuresIds = measuresIDs;
               	params.doubleMeasureMinValue = pivotObjForRef.doubleMeasureMinValue();
               	params.doubleMeasureMaxValue = pivotObjForRef.doubleMeasureMaxValue();
           	
               	var importFromExcelRequest = new jda.pivot.importFromExcelRequest(params);
               	this.data.pivotCommands[importFromExcelRequest.id] = importFromExcelRequest;
               	//importFromExcelRequest.callback = pivotObjForRef._call_refreshOnGetSegmentData;
				pivotObjForRef.data.feed.call(this, pivotObjForRef.data.url, "jda_pivot_json", importFromExcelRequest._getPayload());
            },
            afterImportExcel : function (response){
            	setTimeout(function() {
            		if(response && response.metadata && response.metadata.statusCode ){
            			var totalUpdatedCells = response.metadata.totalUpdatedCells;
            			var importSummary = response.metadata.importSummary;
            			var fileName = response.metadata.fileName;
            			if(importSummary){
            				for(var i=0; i<importSummary.length; i++){
            					if(importSummary[i]){
            						//First we are looking for reasonDescription, if we are not finding then looking for resournce entry with reason code
            						if(importSummary[i].reasonDescription){
            							importSummary[i].reason = importSummary[i].reasonDescription;
            						}else if(importSummary[i].reasonCode){
                						var queryParams = importSummary[i].queryParams;
                						!queryParams && (queryParams = []);
                						var resourceBundleKey = _pns.Constants.cellUpdateErrorPrefix + importSummary[i].reasonCode;
                						var reasonDescription = pivotObjForRef.getLocaleString(resourceBundleKey, queryParams[0], queryParams[1], queryParams[2]);
                						if(!reasonDescription){
                							resourceBundleKey = _pns.Constants.cellImportErrorPrefix + importSummary[i].reasonCode;
                							reasonDescription = pivotObjForRef.getLocaleString(resourceBundleKey, queryParams[0], queryParams[1], queryParams[2]);
                						}
                						
                						!reasonDescription && (reasonDescription =  importSummary[i].reasonCode);
                						importSummary[i].reason = reasonDescription;
                						importSummary[i].reasonDescription = reasonDescription;
            						}
	            					var memberDetails = importSummary[i].memberDetails;
		                			for(var j=0; j<memberDetails.length; j++){
		                				var facetDetails = pivotObjForRef.getFacetFromFacetName(memberDetails[j].dimensionName);
		                				if(facetDetails){
		                					memberDetails[j].dimensionName = facetDetails.UIAttributes.displayName;
	    	                				if(memberDetails[j].memberName === ""){
	    	                					memberDetails[j].memberName = facetDetails.rootLabel;
	    	                				}
		                				}
		                    		}
            					}
                    		}
            			}
            			if(response.metadata.statusCode == "SCS" && pivotObjForRef.hooks.onSuccessImportExcel ){
            				pivotObjForRef.hooks.onSuccessImportExcel(totalUpdatedCells, importSummary, fileName);
            			}else if(pivotObjForRef.hooks.onFailureImportExcel){
            				pivotObjForRef.hooks.onFailureImportExcel(totalUpdatedCells, importSummary, fileName);
            			}
            		}
                }, 100);
            },
            // ****** Ending Import From Excel Functionaly  ****** //
            _call_onGetCellDetails : function(id, obj) {
              /*  this._getCellDetailsRequest(id, obj.data);*/
            },
            _onStoreUpdated : function(id, obj, operation) {
                if (this._ignore === true || !operation)
                    return true;
                /*var update = {
                    id : id,
                    data : obj.data
                };
                switch (operation)
                {
                    case 'update':
                        update.operation = "update";
                        break;
                    case 'add':
                        update.operation = "insert";
                        break;
                    case 'delete':
                        update.operation = "delete";
                        break;
                    default:
                        return true;
                }*/

                if ('value' in obj.data){
                    if (obj.data.value === '__Nv__'){
                        delete obj.data.value;
                    }
                    else if(obj.data.dtype == 'double'){
                        obj.data.value = parseFloat(obj.data.value);
                    }
                }

                this._getupdateFactsRequest(id, obj.data);

                return true;
            },


            _onViewComment : function(id, obj, operation) {
                if (this._ignore === true || !operation)
                    return true;
                /*var update = {
                    id : id,
                    data : obj.data
                };
                switch (operation)
                {
                    case 'update':
                        update.operation = "update";
                        break;
                    case 'add':
                        update.operation = "insert";
                        break;
                    case 'delete':
                        update.operation = "delete";
                        break;
                    case 'read':
                        update.operation = "read";
                        break;
                    default:
                        return true;
                }*/

                if ('value' in obj.data){
                    if (obj.data.value === '__Nv__'){
                        delete obj.data.value;
                    }
                    else if(obj.data.dtype == 'double'){
                        obj.data.value = parseFloat(obj.data.value);
                    }
                }

                if (obj.data.event == "onHover")
                {
                    var col = this._columns[this.columnIndex(id.topAxis)];
                    var row = this.data.item(id.sideAxis) || 0;

                    var currentDiv = this._locateCellDiv({
                        row : row.id,
                        column : col.id
                    });
                    var commentTitle = $(currentDiv).find('[class*="cmtRelation"]')[0].title;

                    // For MDAP Server
                    if (commentTitle)
                    {
                        $(currentDiv).attr("title",commentTitle);
                    }else
                    {
                    	// For Legacy environments
                        this._getupdateCommentRequest(id, obj.data);
                    }
                }

                // For cell selection comment related acrivities
                else
                {
                    this._getupdateCommentRequest(id, obj.data);
                }

                return true;
            },

            _onAfterSelect: function(data,preserve){

                if(data.section == _pns.Constants.attrCellsSection){
                	this._makeDefaultCellSelection();
                    return;
                }
                var rowVal = this.item(data.row);
                var currVal = rowVal && rowVal[data.column];

                var cellId = {
                    sideAxis :currVal.row,
                    topAxis : currVal.column
                };
                var intersection = this.getCellIntersection(cellId);
                this.lastSelectedCellId = cellId;
                // Trigger Event after cell selection
                this.triggerEvent('afterCellSelection',{intersection:intersection,cellId:cellId});

                if (this.isCommentEnabled()) {                    		
                	this.getCommentWrapper().fireEvent('pivotcellchanged',cellId,intersection);		
                }
                if (this.isGraphEnabled()) {
                	this.getGraphWrapper().fireEvent('cellchange',cellId,intersection);
                }
                if(this.isBusinessGraphEnabled() && this.getBusinessGraphWrapper() && this.getBusinessGraphWrapper().config.flyoutIsOpen){
                	this.getBusinessGraphWrapper().fireEvent('cellchange', this.getSelectedCell(), intersection);
                }
                this._lastScrollY= this._y_scroll._viewobj.scrollTop; // changes for key focus is not coming into view port data cells from out of view port
                this._lastScrollX = this._getDataArea().getScrollLeft(); // changes for key focus is not coming into view port data cells from out of view port
            },
            
            getSelectedCell : function(){
            	if(this.isCellContextGraphEnabled()){
            		var cellId = this.lastSelectedCellId;
                	if(cellId){
                		 return selectedCell = {
                                topAxisPath : 	new _pns.axisPath(cellId.topAxis),
                                sideAxisPath : new _pns.axisPath(cellId.sideAxis)
                            }	
                	}
            	}else{
            		this.getBusinessGraphWrapper().config.selectedCell = null; 
            	}
        		return null;
            },
            // Graph Data
            _onGetGraphData : function(response,request) {        
            	this.getGraphWrapper().fireEvent("plotChart",response.result.graphData);	
            },
            
            //Business Graph
            _onBusinessGraph : function(response,request) {
            	this.getBusinessGraphWrapper().fireEvent("handleResponse",response, request);
            },
            
            //Measure Data filters
            _onDataFilter : function(response,request) {
            	JdaPivotApp.getApplication().getDataFilterController().handleResponse(response, request);
            },
            
            //Measure Data filters
            _onMeasureFilter : function(response,request) {
            	JdaPivotApp.getApplication().getMeasureFilterController().handleResponse(response, request);
            },
            
            // Graph Setting
            _onSaveGraphSetting : function(response, request){
            	this.getGraphWrapper().fireEvent("saveNotification",response.result,request.params);
            	return true;
            },
            // Export to Excel
            _onExportToExcel : function(response, request){
            	var url = this.data.exportUrl;
            	pivotlog(" Exported data to excel :" + response.result);
            	var $excelIframe = $(this._viewobj).find("#pivotExportExcelIframe");
            	if($excelIframe.length == 0){
            		var $iframe = $('<iframe id="pivotExportExcelIframe" style="visibility:hidden;"></iframe>');
            		$(this._viewobj).append($iframe);
            		$iframe.attr("src",url);
            		$iframe.load();
            		
            	}else{
            		$excelIframe.attr("src",url);
            		$excelIframe.load();
            	}
            	return true;
            },
            // header/footer styles
            _get_header : function() {
                var rules = [];
                var el_header = this._append_tmp([ "ui-widget", "ui-widget-header" ]);
                var css_header =
                    this._get_styles(el_header, this._multiextend(this._bg, this._border, this._font));
                var border = this._replace_border(css_header);

                rules.push(this._make_css(".dhx_ss_header TR, .dhx_ss_footer TR", css_header));
                rules.push(this._make_css(".dhx_sel_hcell", {
                    "background-color" : css_header["background-color"]
                }));

                // css_header["background-color"] = "transparent";
                css_header["background-image"] = "none";
                rules.push(this._make_css(".dhx_ss_header TD, .dhx_ss_footer TD", css_header));

                rules.push(this._make_css(".dhx_ss_header td", {
                    "border-right" : border,
                    "border-bottom" : border
                }));
                rules.push(this._make_css(".dhx_ss_footer td", {
                    "border-right" : border,
                    "border-top" : border
                }));
                rules.push(this._make_css(
                    ".dhx_ss_right .dhx_column.dhx_first>div, .dhx_hs_right td.dhx_first", {
                        "border-left" : border
                    }));
                rules.push(this._make_css(".dhx_ss_left .dhx_column.dhx_last>div", {
                    "border-right" : border
                }));
                this._remove_tmp(el_header);
                return rules.join("\n\n");
            },
            _init_context_menus : function() {
            },

            /**
             * Get an area object given its index.
             * @param idx The requested area index. 0 is the side facets area, 1 is the data area.
             * @returns {_pns.area}
             * @private
             */
            _getArea : function(idx){
                var area=this.areas[idx];
                return area;
            },

            /**
             * Returns the data area
             * @returns {_pns.area} The area object holding the pivot's data
             * @private
             */
            _getDataArea : function(){
                var dataArea=this._getArea("dataArea");
                return dataArea;
            },

            /**
             * Returns the attributes area
             * @returns {_pns.area} The area object holding the pivot's attributes
             * @private
             */
            _getAttributesArea : function(){
                // if (this.areas.length>2) {
                return this._getArea("attributeArea");
                //} else {
                //return null;
                //}
            },
            _hasAttributeArea : function(){
            	
            	return this._getAttributesArea() && this._showAttributeArea() ? true : false;
            },
            /**
             * Returns the side facets area
             * @returns {_pns.area} The area object holding the pivot's side facet
             * @private
             */
            _getFacetsArea : function(){
                var facetsArea=this._getArea("facetArea");
                return facetsArea;
            },
            /**
             * Returns attribute start index
             */
            _getAttributeSplitIndex:function(){

                return this._getAttributesArea() ? this._getAttributesArea().getStartIdx() :null;
            },

            _getFacetSplitIndex:function(){
                return this._getFacetsArea().getEndIdx();
            },
            /**
             * Get the column index that marks the starting of the data
             * @returns {number}
             * @private
             */
            _getDataSplitIdx : function(){
                return this._getDataArea().getStartIdx();
            },


            /**
             * Checks if a colunn index is in the data area
             * @param columnIdx The inspect column index
             * @returns {boolean} true if the inspected index is in the data area, false otherwise
             * @private
             */
            _isInDataSection : function(columnIdx){

                var dataArea=this._getDataArea();
                return  (dataArea && dataArea.getStartIdx()<=columnIdx && columnIdx<=dataArea.getEndIdx());
            },



            _render_header_cell : function(columnIndex, rowIndex, startRange, endRange, isMeasureRow,
                                           parentValueMapping, width) {
                var docFragment = document.createDocumentFragment(),
                    cellElement = document.createElement("TD"),
                    $cellElement = $(cellElement),
                    colSpan = 1,
                    rowSpan = 1,
                    levelVerticalOffset = 0,
                    currColumn = this._settings.columns[columnIndex],
                    topRowCount = this.getHeaderRowCount(), // header
                    isDataArea = this._getDataSplitIdx() <= columnIndex,
                    hcss = '',
                    hid = '',
                    expansionCss = "",
                    positionStyle = "",
                    dataNodes = currColumn.dataNodes,
                    dataNodeIndex = rowIndex,
                    topAxisView = this.getTopAxisView(),
                    columnAxisPath = currColumn.axisPath,
                    isParentContainer = false,
                    isSortColumn = columnAxisPath && this._isSortColumn(columnAxisPath),
                    expansionIconElement = null,
                    lastMeasureId = this.getLastMeasureVisibleId(),
                    firstMeasureId = this.getFirstMeasureVisibleId(),
                    colSelectorDiv='';
                docFragment.appendChild(cellElement);
                cellElement.setAttribute('column', columnIndex);
                if (isMeasureRow){
                    dataNodeIndex = topAxisView.getFacets().length;
                }
                else if (isDataArea){
                    dataNodeIndex = topAxisView.getFacetNodeIndexFromVisibleIndex(dataNodeIndex);
                }
                var currNode = dataNodes && dataNodes[dataNodeIndex] ? dataNodes[dataNodeIndex] : null;
                if (currNode === null){
                    currNode = dataNodes && dataNodes[0] ? dataNodes[0] : null;
                }

                if (currColumn.header.length && currColumn.header.length < topRowCount){
                    currColumn.header[topRowCount - 1] = currColumn.header[0];
                }
                var currHeader =
                    (typeof currColumn.header == "string") ? currColumn.header : currColumn.header[rowIndex];
                if (currHeader === undefined){
                    currHeader =
                        (typeof currColumn.header == "string") ? currColumn.header : currColumn.header[0];
                }
                var hdrLabelElement = document.createTextNode(currHeader);

                if (startRange === 0){
                    if (rowIndex === 0){
                        if (!this.areMeasuresOnTop()){
                            if (columnIndex === 0){
                                // This is the filter drop zone
                                hid = "jda_pivot_corner";
                                // colSpan = Math.max(1,
                                // this.getSideVisibleFacets().length/*-(this.getTopVisibleFacets()?1:0)*/);
                                // rowSpan = Math.max(1, topRowCount - 1);

                               var hdrLabel = "";
                                isDroppableFilterZone = true;
                            }

                            if (columnIndex == endRange - 1){
                                hid = "jda_pivot_top_axis_facet_names";

                                // colSpan = 1;
                                // rowSpan = topRowCount;
                                // hdrLabel="FacetNames";

                                hdrLabelElement = this.getTopAxisFacetsHeaders();
                            }
                            else if (columnIndex !== 0){
                                return "";
                            }
                        }
                        else{
                            if (columnIndex === 0){
                                var hdrLabelElementInternal = document.createElement("DIV");
                                hdrLabelElement = document.createElement("DIV");
                                hdrLabelElement.style.cssText = "top:left;width:100%;height:100%;";
                                // The top axis facet names and the drop
                                // zone will share the cell
                                rowSpan = this.getTopVisibleFacets().length;
                                // The width of that cell will be the
                                // count side facets
                                colSpan = this.getSideVisibleFacets().length;
                                // hdrLabel="Shared Area";
                                currColumn.sharedColumn = false;
                                // hdrLabel = "<DIV style='top:left;width:100%;height:100%;'>";
                                hdrLabelElementInternal.style.cssText =
                                    "overflow: hidden;border-left-color: #a0a0a0;width:100%;padding-right:0px;color:white;";
                                hdrLabelElement.appendChild(hdrLabelElementInternal);
                                hdrLabelElementInternal.appendChild(this.getTopAxisFacetsHeaders());

                            }
                            if (columnIndex == endRange - 1){
                                hid = "jda_pivot_top_axis_facet_names";

                                colSpan = 1;
                                rowSpan = topRowCount - 1;

                                hdrLabelElement = this.getTopAxisFacetsHeaders();
                            }
                            else if (columnIndex !== 0){
                                return "";
                            }
                        }
                    }
                    else if (rowIndex == (topRowCount - 1) && (currColumn.id != _pns.Constants.measureIdPrefix))
                    {

                        hdrLabelElement =
                            document.createTextNode(this.getSideVisibleFacets()[columnIndex]
                                .getDisplayName());
                        // var hdrLabel = this.getSideVisibleFacets()[columnIndex].getDisplayName();
                        colSpan = 1;
                        rowSpan = 1;
                    }
                    else{
                        return "";
                    }
                }

                if (parentValueMapping){
                    colSpan = parentValueMapping[columnIndex].count;
                    if (parentValueMapping[columnIndex].sortedContent){
                        hcss += ' sortedContent';
                    }
                    if (!colSpan)
                        return "";
                }

                if (columnIndex == startRange && currColumn.isAttr)
                    hcss += " attr_first";

                if (columnIndex == startRange)
                    hcss += " dhx_first";
                if (columnIndex == endRange)
                    hcss += " dhx_last";
                if (isMeasureRow && !currColumn.isAttr){
                	var measureId = _pns.axisPath.getMeasureIdFromAxisPathStr(currColumn.id);
                    $cellElement.data('facetData', {
                        measureId : measureId
                    });
                    
                    if(currColumn.subMeasures && currColumn.isExpanded ){
                        lastMeasureId = currColumn.subMeasures[currColumn.subMeasures.length - 1];
                    }

                    hcss += " measureCell";
                    hcss += measureId === firstMeasureId ? " colBoundaryStart" : measureId === lastMeasureId ? " colBoundary":"";
                }

                if(currColumn.isAttr){

                    hcss+= " attributeArea";
                }

                if (!isMeasureRow){
                    // hcss+=" draggableFacet droppableFacet";
                }
                if (startRange === 0 && (columnIndex !== endRange)){
                    hcss += " sideFacet";
                }
                else{
                    hcss += " topFacet";
                }

                var topMarginStr = "";
                var topMargin = 0;
                // Show the expand/collapse icon as needed, but only for
                // the first row of header.
                // var arrowPositionStyle = "";
                if (currNode){
                    currNodeLevel = isMeasureRow ? 0 : currNode ? currNode.level : 0;
                    var currLevel = currNodeLevel;
                    // If it's the top most row we should consider the currlevel as starting in 0
                    if (currLevel > 0 && rowIndex === 0)
                        currLevel--;
                    // var arrowPosition =
                    // "background-position: " + arrowXPositionVal + "px " + arrowYPositionVal + "px;";
                    // arrowPositionStyle = "margin-left: " + arrowXPositionVal + "px;";
                    topMargin = 1 * levelVerticalOffset;
                    if(isMeasureRow && currNode.name){
                    	var tmpMeasure = this.getMeasure(currNode.id);
                    	if(tmpMeasure && tmpMeasure.hasChildren){
                    		currNode.hasFacetChildren = true;
                    	//TODO:	isExpanded = item.isExpanded ||  false;
                    	}
                    	
                    }
                    label = currNode.name;
                    if (topMargin){
                        topMarginStr = "position:relative;top:" + topMargin + "px;";
                    }
                }
                positionStyle = "position:relative;float:left;padding-right:1px;";

                var css = "";
                // It's not one of the top left ones
                if (startRange !== 0){
                    css = "dhx_hcell topCellMember";
                }
                if (currColumn.$select)
                    css += " dhx_sel_hcell";
                // adjust the top margin of the cells on the first
                // header row to show
                // the expanded hierarchies.
                if (startRange === 0){
                    ssheader = " dhx_ss_header_value ";
                }
                var additionalStyle = "";

                var height = this._rowHeight;

                if (startRange !== 0){
                    if (!isMeasureRow || this.hasExpandableMeasure()){
                        expansionIconElement = document.createElement("SPAN");
                        isParentContainer = true;
                        if (currNode && currNode.hasFacetChildren){

                            // expansionIconElement.style.cssText = arrowPositionStyle;
                            if (!(currNode.isExpanded)){

                            	if(isMeasureRow){
                            		expansionIconElement.className = "measure_member_collapsed";
                            	}else{
                            		expansionIconElement.className = "facet_member_collapsed";
                            	}
                            }
                            else{
                            	if(isMeasureRow){
                            		expansionIconElement.className = "measure_member_expanded";
                            	}else{
                            		expansionIconElement.className = "facet_member_expanded";
                            	}
                            }
                           
                        }
                        else{
                            expansionIconElement.className = "facet_member_spacer";
                        }
                        if (isDataArea){
                            var levelClass = "facetLevel-" + currNodeLevel;
                            hcss += " " + levelClass;
                        }
                    }
                    if (isSortColumn){
                        hcss += ' sortedContent';
                    }

                }
                tdHeight = height + topMargin;
                var tdHeightStr = null;
                var tdWidthStr = null;
                var facetClassess = "";
                if (this._columns[columnIndex] !== undefined && rowIndex == this._getLowestRowIndex(startRange))
                {
                    tdWidthStr = ";width:" + this._columns[columnIndex].width + "px;";
                }

                cellElement.style.cssText = tdHeightStr + tdWidthStr;
                cellElement.colSpan = colSpan;
                cellElement.setAttribute('column', columnIndex);

                if (hid){
                    cellElement.id = hid;
                }
                if (hcss){
                    cellElement.className = hcss;
                }
                if (rowSpan > 1){
                    cellElement.rowSpan = rowSpan;
                }
                else{

                    if (!currColumn.header[rowIndex])
                        currColumn.header[rowIndex] = "<span>" + hdrLabel + "</span>";
                    if (rowIndex < this.getTopVisibleFacets().length){
                        // It's a top facet name
                        facetClassess = " draggableFacet droppableFacet droppableMeasuresZone ";
                    }
                    else if (this.areMeasuresOnTop()){
                        // It's a measure
                        hcss += " draggableMeasures";
                    }

                }

                if (!this.areMeasuresOnTop() && isSortColumn){
                    facetClassess += ' sortedContent';
                }

                var heightStr = "";

                if (rowIndex == (topRowCount - 1) && (currColumn.id != _pns.Constants.measureIdPrefix)){
                    facetClassess = " draggableFacet droppableFacet ";
                }
                // html += ">";
                lockedSpan = "";
                var facetNameWrapperElement = document.createElement("DIV");
                if (expansionIconElement){
                    facetNameWrapperElement.appendChild(expansionIconElement);
                }
                cellElement.appendChild(facetNameWrapperElement);
                facetNameWrapperElement.id = this._getHeaderDivID(currColumn.id);
                facetNameWrapperElement.style.cssText = heightStr + topMarginStr + positionStyle;
                facetNameWrapperElement.className = css + (isParentContainer ? " parentContainer " : "");
                var memberNameElement = document.createElement("DIV");
                facetNameWrapperElement.appendChild(memberNameElement);
                memberNameElement.className = expansionCss + facetClassess;
                memberNameElement.style.cssText = additionalStyle;
                if(currColumn.isAttr){
                    memberNameElement.innerHTML = currColumn.name;
                }
                else{
                    memberNameElement.innerHTML = hdrLabelElement.textContent;
                }
                //disply tooltip if it's measure and showEllipsisOnMemberName is true
                if(isMeasureRow && this.showEllipsisOnMemberName()){
                	cellElement.title=memberNameElement.innerHTML;
                }
                return cellElement;
            },
            _getLowestRowIndex : function(startHeaderIndex) {
                return this.areMeasuresOnTop() ? this.getTopAxisView().getVisibleFacets().length : this
                    .getTopAxisView().getVisibleFacets().length - 1;
            },
            getNewTopAxisFacetsHeaders : function() {

                var docFragment = document.createDocumentFragment();
                var tbody = document.createElement("tbody");
                docFragment.appendChild(tbody);
                var topAxis = this.getTopVisibleFacets();
                var sideAxis = this.getSideVisibleFacets();
                var matrix = [];
                var measuresOnTop = this.areMeasuresOnTop();
                var iTopAxisLen = topAxis.length;
                var iSideAxisLen = sideAxis.length;
                var filler = undefined;
                var line;
                if (topAxis.length || sideAxis.length){
                    var rs = topAxis.length - 1 + (measuresOnTop ? 1 : 0);
                    var cs = sideAxis.length - 1 + (!measuresOnTop ? 1 : 0);
                    if (rs > 0 && cs > 0){
                        filler = {
                            isFiller : true,
                            rs : rs,
                            cs : cs,
                            axis : ""
                        };
                    }
                }
                for ( var iTop = 0; iTop < iTopAxisLen; iTop++){
                    line = [ {
                        facet : topAxis[iTop],
                        rs : 1,
                        cs : 1,
                        axis : "topFacet"
                    } ];
                    matrix.push(line);
                }
                if (iSideAxisLen){
                    if (!matrix.length || (measuresOnTop)){
                        line = [];
                        matrix.push(line);
                    }
                    else{
                        line = matrix[matrix.length - 1];
                    }

                    for ( var iSide = iSideAxisLen - 1; iSide >= 0; iSide--){
                        line.unshift({
                            facet : sideAxis[iSide],
                            rs : 1,
                            cs : 1,
                            axis : "sideFacet"
                        });
                    }
                }

                if (filler){
                    matrix[0].unshift(filler);
                }

                for ( var iLine = 0; iLine < matrix.length; iLine++){
                    var line = matrix[iLine];
                    trElem = document.createElement("tr");
                    tbody.appendChild(trElem);
                    for ( var iColumn = 0; iColumn < line.length; iColumn++){
                        var cell = line[iColumn];
                        var tdWidthStr = null;
                        var isFiller = cell.facet == undefined;
                        var assignedColIndex = iColumn;
                        tdElem = document.createElement("TD");
                        if (this._columns[iColumn] !== undefined && !isFiller){
                            assignedColIndex =
                                (iLine == this._getLowestRowIndex(0)) ? iColumn : matrix[matrix.length - 1].length - 1;
                            var width = this._columns[assignedColIndex].width;
                            tdWidthStr = ";width:" + width + "px;";
                        }

                        tdElem.style.cssText = tdWidthStr;
                        var displayName =
                            !isFiller ? (cell.facet.UIAttributes.displayName || cell.facet.name) : "&nbsp;";
                        var className =
                            !isFiller ? cell.axis +
                                " resizableColumn ui-resizable draggableFacet droppableFacet  ui-draggable ui-droppable" : "fillerCell";
                        tdElem.setAttribute('column', assignedColIndex);
                        var facet = cell.facet;
                        trElem.appendChild(tdElem);
                        tdElem.innerHTML = displayName;
                        tdElem.className = className;
                        if (facet){
                            $(tdElem).data('facetData', {
                                id : cell.facet.id,
                                visibleIndex : cell.facet.visibleIndex,
                                index : cell.facet.index
                            });
                        }
                        if (cell.rs > 1){
                            tdElem.rowSpan = cell.rs;
                        }
                        if (cell.cs > 0 && isFiller){
                            tdElem.colSpan = cell.cs;
                        }
                        this._addResizeHandlers(tdElem);
                    }
                }
                tbody.appendChild(trElem);
                return docFragment;
            },
            getTopAxisFacetsHeaders : function() {
                var topFacets = this.getTopVisibleFacets(), docFragment = document.createDocumentFragment(), headerElement =
                    document.createElement("DIV"), headerLabelElement, txtNode;
                docFragment.appendChild(headerElement);
                headerElement.style.cssText = "float:right;clear:both;width:100%;padding:0px;";
                for ( var topAxisIndex = 0; topAxisIndex < topFacets.length; topAxisIndex++){
                    headerLabelElement = document.createElement("DIV");
                    headerElement.appendChild(headerLabelElement);
                    var facetRowStyle = "padding-right:0px;white-space:nowrap;";
                    var facetRowClass = " draggableFacet droppableFacet droppableMeasuresZone";
                    var facetId =
                        _pns.Constants.hdrPrefix + _pns.Constants.facetIdPrefix +
                        topFacets[topAxisIndex].id;

                    if (topAxisIndex < topFacets.length){
                        facetRowClass += " topFacetNames";
                        facetRowStyle = "white-space:nowrap;";
                    }
                    headerLabelElement.className = facetRowClass;
                    headerLabelElement.style.cssText = facetRowStyle;
                    headerLabelElement.id = facetId;
                    txtNode = document.createTextNode(topFacets[topAxisIndex].getDisplayName());
                    headerLabelElement.appendChild(txtNode);
                }
                // hdrLabel += "</DIV>";
                return docFragment;
            },
            // because we using non-standard rendering model, custom
            // logic for mouse detection need to be used

            _mouseEvent : function(e, hash, name) {
                e = e || event;
                if(e.sameEvent){
                	return ; // Check for same event is called again. if return without continuing.
                }              
                var trg = e.target || e.srcElement;
                var s = e.shiftKey;
                var c = e.ctrlKey;
                if (s||c) {
                    return;
                }

                // define some vars, which will be used below
                var css = '';
                var id = null;
                var found = false;
                var section = "";
                var i = 0;
                var res = null;
                var location = null;
                // Check if it's a click on a data value cell
                var $cellElementSelector = $(trg);
                if(this.hasMemberSelectorCSS($cellElementSelector)){
                	return;
                }
                section = this._getSectionFromElement($cellElementSelector);
                if ($cellElementSelector.length){

                    var cellElement = $cellElementSelector[0];
                    if (!(e.ctrlKey)){
                        if (section.name === _pns.Constants.dataCellsSection)
                            location = this.locateCell(cellElement);
                        id = {
                            section : section.name,
                            axisIndex : section.axisId,
                            facetId : section.facetId,
                            facetIndex : section.facetIndex
                        };
                        if (location){
                            id.row = location[0];
                            id.column = location[1];
                            id.section =location[2] || section.name;
                            var $cell = $cellElementSelector.closest('.dhx_value');
                            cellElement = $cell[0];
                        }

                        var classList = cellElement.className.split(/\s+/);
                        for (i = 0; i < classList.length; i++){
                            css = classList[i];
                            if (css){ // check if pre-defined reaction for
                                // element's css name exists
                                css = css.split(" ");
                                css = css[0] || css[1]; // FIXME:bad
                                if (hash[css]){
                                    res = hash[css].call(this, e, id, cellElement);
                                    if (typeof res != "undefined" && res !== true)
                                        return;
                                    // prevents other listeners from being called
                                    // during cell selection to stop event bubbling  
                                    //e.stopImmediatePropagation();
                                    e.sameEvent=true;
                                }
                            }
                        }
                    }
                    else{
                        return false;
                    }

                    pivotlog("Mouse event " + name + " on cell object %o", location);
                    this.callEvent("on" + name, [ id, e, cellElement ]);
                    return true;
                }
                return found; // returns true if item was located and
                // event was triggered
            },
            _getSectionFromElement : function($trg) {

                var sectionName = _pns.Constants.measuresDataSection;
                var axisId = -1, topAxisId = 1, sideAxisId = 0, facetId = -1, hdrPrefix =
                    _pns.Constants.hdrPrefix + _pns.Constants.facetIdPrefix, facetPattern =
                    new RegExp(hdrPrefix + "(\\d+)"), column = null, facetIdStr = null, facetElement, facetData;

                if ($trg.closest('.measureCell', 'div.dhx_dtable').length){
                    sectionName = _pns.Constants.measuresDataSection;
                    axisId = this.areMeasuresOnTop() ? topAxisId : sideAxisId;
                }
                else if ($trg.closest('#jda_pivot_top_axis_facet_names, .topFacetNames', 'div.dhx_dtable').length)
                {
                    sectionName = _pns.Constants.topAxisFacetsSection;
                    axisId = topAxisId;
                    facetIdStr = $trg.closest('div[id^="' + hdrPrefix + '"]').attr('id');
                    facetId = facetPattern.exec(facetIdStr)[1];

                }
                else if ((facetElement = $trg.closest('td:data("facetData")', 'div.dhx_dtable')).length){
                    facetData = facetElement.data('facetData');
                    var isSideAxis = facetElement.hasClass("sideFacet");
                    sectionName =
                        isSideAxis ? _pns.Constants.sideAxisFacetsSection : _pns.Constants.topAxisFacetsSection;
                    axisId = isSideAxis ? sideAxisId : topAxisId;
                    /*
                     * column = $trg.closest('td[column]').attr('column'); facetIdStr = $('#leftHdrTable
                     * td[column="' + column + '"] div[id^="' + hdrPrefix + '"]').attr( 'id'); var arr =
                     * facetPattern.exec(facetIdStr); if (arr && arr.length == 2) facetId =
                     * facetPattern.exec(facetIdStr)[1];
                     */facetId = facetData.id;
                }
                else if ($trg.closest('.sideCellMember', 'div.dhx_dtable').length){
                    //pivotlog("################### EXPAND expand button clicked.....");
                    //this._settings.y_scroll=false;
                    sectionName = _pns.Constants.sideAxisMembersSection;
                    axisId = sideAxisId;
                    column = $trg.closest("div:data(facetData)");
                    if(column.data("facetData"))
                        facetId = column.data("facetData").id;
                }
                else if ($trg.closest('#centerHdrTable td:not(".measureCell")').length){
                    sectionName = _pns.Constants.topAxisMembersSection;
                    axisId = topAxisId;
                    facetIdStr = $trg.closest('tr[id^="' + hdrPrefix + '"]').attr('id');
                    facetId = facetPattern.exec(facetIdStr)[1];
                }
                else if ($trg.closest('.dhx_value', '.dhx_ss_center_scroll').length){
                    sectionName = _pns.Constants.dataCellsSection;
                }
                var retVal = {
                    name : sectionName,
                    axisId : axisId,
                    facetId : facetId
                };

                if (axisId > -1){
                    var facetIndex = this.data.cube.view[axisId].getFacetIndexFromId(facetId);
                    retVal.facetIndex = facetIndex;
                }

                return retVal;

            },

            // Get the cell description frothe cell's location
            getCellIdDescriptionObj : function(_cellId) {
                var cellId = $.extend(true, {}, _cellId);
                // Do some duck punching to change the object to what we expect
                if (_cellId.axesFacet && _cellId.axesFacet.axisPath && _cellId.axesFacet.facetIndex){
                    var axisSection = _cellId.axisIndex ? 'column' : 'row';
                    cellId[axisSection] = _cellId.axesFacet.axisPath;
                }
                var retVal = {};
                if (!cellId)
                    return null;

                var topAxis = this.getTopAxisView();
                var sideAxis = this.getSideAxisView();
                if (cellId.column){
                    var topAxisPathObj = new _pns.axisPath(cellId.column);
                    retVal.topAxisPath = topAxis.getAxisPathLabelObj(topAxisPathObj);
                }
                if (cellId.row){
                    var sideAxisPathObj = new _pns.axisPath(cellId.row);
                    retVal.sideAxisPath = sideAxis.getAxisPathLabelObj(sideAxisPathObj);
                }
                return retVal;

            },

            /***************************************************************************************************
             * Checks if the supplied measureID is visible
             *
             * @param {string}
             *            id The ID of the measure
             * @returns {object|null} The measure object if visible or null if invisible.
             */
            isMeasureVisible : function(id) {
                // This should be optimized
                for ( var index = 0; index < this._getCubeDefinition().visiblemeasures.length; index++){
                    var currMeasure = this._getCubeDefinition().visiblemeasures[index];
                    if (id === currMeasure.id)
                        return currMeasure;
                }
                return null;
            },

            /***************************************************************************************************
             * Returns the ID of the last visible measure
             *
             * @returns {string} The ID of the last visible measure
             */
            getLastMeasureVisibleId : function() {
                return this._getCubeDefinition().visiblemeasures[this._getCubeDefinition().visiblemeasures.length - 1].id;
            },
            /***************************************************************************************************
             * Returns the ID of the first visible measure
             *
             * @returns {string} The ID of the first visible measure
             */
            getFirstMeasureVisibleId : function() {
                return this._getCubeDefinition().visiblemeasures[0].id;
            },
            getDecimalFromCellId : function(cellId) {
            	var measure = this.getMeasureFromCellId(cellId);           	
            	  return  measure ? this.getDecimal(measure.id) : undefined;
            },
            getCellIdStr : function(cellId) {

                return _.isArray(cellId)?cellId[0]+" "+cellId[1]:cellId&&(cellId.row+" "+cellId.column);
            },
            getMeasureFromCellId : function(cellId) {
                return this.getMeasure(_pns.axisPath.getMeasureIdFromAxisPathStr(cellId.column) ||
                    _pns.axisPath.getMeasureIdFromAxisPathStr(cellId.row));
            },
            getMeasure : function(id) {
                // This should be optimized
                for ( var index = 0; index < this._getCubeDefinition().measures.length; index++){
                    var currMeasure = this._getCubeDefinition().measures[index];
                    if (id === currMeasure.id)
                        return currMeasure;
                }
                return  this._getCubeDefinition().subMeasures &&  this._getCubeDefinition().subMeasures[id];
            },
            getSubMeasuresForMeasure : function(splitMeasureId, filteredSubMeasures) {
            	var subMeasures = this._getCubeDefinition().subMeasuresMap &&  this._getCubeDefinition().subMeasuresMap[splitMeasureId];
            	if(filteredSubMeasures){
            		var measureFilters = this._getCubeDefinition().measureFilters
            		if(measureFilters && measureFilters[splitMeasureId]){
            			var spltMeasureFilters = measureFilters[splitMeasureId];
            			for(index in spltMeasureFilters){
            				var measureFilter = spltMeasureFilters[index];
            				if(measureFilter.activate){
            					if(measureFilter.criteriaSelection){
                					var criteriaOperator = measureFilter.criteriaOperator; 
                					var criteriaText = measureFilter.criteriaText;
                					criteriaText = criteriaText.toLowerCase();
                					subMeasures = subMeasures.filter(function(subMeasure) {
                						  var measureDispName = (subMeasure.uIAttributes.displayName || subMeasure.label);
                						  measureDispName = measureDispName.toLowerCase();
                						  if(criteriaOperator == "contains"){
                							  return measureDispName.indexOf(criteriaText) > -1;
                						  }else if(criteriaOperator == "doesNotContain"){
                							  return measureDispName.indexOf(criteriaText) <= -1;
                						  }if(criteriaOperator == "beginsWith"){
                							  return measureDispName.startsWith(criteriaText);
                						  }if(criteriaOperator == "endsWith"){
                							  return measureDispName.endsWith(criteriaText);
                						  }if(criteriaOperator == "notEqual"){
                							  return measureDispName != criteriaText;
                						  }else{
                							  return false;
                						  }
                					});
                				}else if(measureFilter.subMeasureIds){
                					var subMeasureIds = measureFilter.subMeasureIds;
                					subMeasures = subMeasures.filter(function(subMeasure) {
                						return subMeasureIds.includes(subMeasure.id);
                					});
    
                				}
            				}
            			}
            		}
            	}
            	return subMeasures;
            },
            /**
             * Checks if pivot definition has at least one expandable measure
             */
            hasExpandableMeasure : function(id) {
                // This should be optimized
                for ( var index = 0; index < this._getCubeDefinition().visiblemeasures.length; index++){
                   
                    if (this._getCubeDefinition().visiblemeasures[index].hasChildren)
                        return true;
                }
                return false;
            },
            isDataDomainMeasure : function(cellId) {
            	var measure = this.getMeasureFromCellId(cellId);
            	return measure && measure.uIAttributes && measure.uIAttributes.isDataDomain;
            },
            getDataDomainValues: function(cellData) {
            	var that = this;
            	var measure = this.getMeasureFromCellId(cellData);
            	var options = []; 
            	 if(this.measureDomainValues){
            		 var domainValues = this.measureDomainValues[measure.id];
            		 if(domainValues && domainValues.dispDomainOptions){
            			 return domainValues.dispDomainOptions;
            		 }
            	 }
            	return options;
            },
            prepareDisplayDomainOptions:function (domainValues, that){
            	var options = [];
            	if(domainValues){
            		for (var i = 0; i < domainValues.length; i++) {
            			var domainKeyValue = domainValues[i];
            			if(domainKeyValue){
            				for (var domainKey in domainKeyValue){
	            				var dispValue = domainKey;
	            				var domainValue = domainKeyValue[domainKey];
	            				if(that.domainName() == "N" && domainValue){
	            					dispValue = domainValue;
	            				}else if(that.domainName() == "NV" && domainValue){
	            					dispValue += that.dataDomainValueNameSeparator() +domainValue;
	            				}
	            				options.push({
	           					 "value":domainKey,
	           					 "display":dispValue
	           				 });
	            			}
            			}
            		}
            	}
            	return options;
            },
            prepareDisplayDomainValue :function (domainValues, that){
            	var displayDomainValues = {};
            	if(domainValues){
            		for (var i = 0; i < domainValues.length; i++) {
            			var domainKeyValue = domainValues[i];
            			if(domainKeyValue){
            				for (var domainKey in domainKeyValue){
	            				var dispValue = domainKey;
	            				var domainValue = domainKeyValue[domainKey];
	            				if(that.domainName() == "N" && domainValue){
	            					dispValue = domainValue;
	            				}else if(that.domainName() == "NV" && domainValue){
	            					dispValue += that.dataDomainValueNameSeparator() +domainValue;
	            				}
	            				displayDomainValues[domainKey] = dispValue;
	            			}
            			}
            		}
            	}
            	return displayDomainValues;
            },
            getDataDomainValueToDisplay: function(cellData) {
            	if(cellData.isMultiple && cellData.content == "Multiple"){
            		var localeDisplayString = this.getLocaleString("DataDomain.Multiple") || cellData.content;
            		cellData.display = localeDisplayString;
            		return localeDisplayString;
            	}
            	var measure = this.getMeasureFromCellId(cellData);
            	var dispValue = cellData.content;
            	var dispDomainValues = this.measureDomainValues[measure.id];
            	if(dispDomainValues && dispDomainValues.dispDomainValues && dispDomainValues.dispDomainValues[cellData.content]){
            		dispValue = dispDomainValues.dispDomainValues[cellData.content];
            		cellData.display = dispValue;
            	}
            	return dispValue;
            },
            changeTextSetSeparatorIfExists: function(cellData) {
            	var dispValue = cellData.content;
            	if(dispValue && this.serverTextSetSeparator !== this.textSetSeparator() && dispValue.indexOf(this.serverTextSetSeparator) !== -1){
            		dispValue  = dispValue.split(this.serverTextSetSeparator).join(this.textSetSeparator());
            		cellData.display = dispValue;
            	}
            	return dispValue;
            },
            flipVisibleMeasure : function(measureId, stateToSetTo) {
                var measure = this.getMeasure(measureId);
                var index = 0;
                // This should be optimized
                if (stateToSetTo){
                    this._getCubeDefinition().visiblemeasures.push(measure);
                }
                else{
                    for (index = 0; index < this._getCubeDefinition().visiblemeasures.length; index++){
                        if (measure.id === this._getCubeDefinition().visiblemeasures[index].id){
                            this._getCubeDefinition().visiblemeasures.splice(index, 1);
                            break;
                        }
                    }
                }

                var tempVisibleMeasures = [];
                for (index = 0; index < this._getCubeDefinition().measures.length; index++){
                    var currMeasure = this.isMeasureVisible(this._getCubeDefinition().measures[index].id);
                    if (currMeasure){
                        tempVisibleMeasures.push(currMeasure);
                    }
                }
                this._getCubeDefinition().visiblemeasure = tempVisibleMeasures;
                return;
            },
            flipVisibleFacet : function(facetId, stateToSetTo, axisIndexStr) {
                var viewDef = this._getCubeDefinition();
                var axisIndex = parseInt(axisIndexStr, 10);
                var facetResp = this.getFacetObjectFromCubeDefinition(facetId, axisIndex);
                // If didn't find it here for some reason find it in the other axis
                if (!facetResp){
                    axisIndex = 1 - axisIndex;
                    facetResp = this.getFacetObjectFromCubeDefinition(facetId, axisIndex);
                }
                var facet = facetResp.facet;
                // This should be optimized
                if (stateToSetTo){
                    // add to axis
                    this.removeFacetDefUIAttribute(facetId, "Filters");
                    facet = this.getFacetFromFacetId(facetId);
                    viewDef.visibleFacets.push(facet);
                }
                else{
                    for ( var i = 0; i < viewDef.visibleFacets.length; i++){
                        if (viewDef.visibleFacets[i].id == facetId){
                            viewDef.visibleFacets.splice(i, 1);
                            break;
                        }
                    }
                    // Remove from axis
                }

                return;
            },
            flipFacetTotalNode : function(facetId, stateToSetTo, axisIndexStr) {
                var axisIndex = parseInt(axisIndexStr, 10);
                var facetResp = this.getFacetObjectFromCubeDefinition(facetId, axisIndex);
                var facet = facetResp.facet;
                // This should be optimized
                // add to axis
                facet = this.getFacetFromFacetId(facetId);
                facet.showRoot = stateToSetTo;

                return;
            },
            getFacetObjectFromCubeDefinition : function(facetId, _axisIndex) {
                var axes = [ "sideAxis", "topAxis" ];
                var axesIndecesToSearch = [ _axisIndex ];
                if (_axisIndex === undefined)
                    axesIndecesToSearch = [ 0, 1 ];
                for ( var i = 0; i < axesIndecesToSearch.length; i++){
                    axisIndex = axesIndecesToSearch[i];
                    var viewDef = this._getCubeDefinition();
                    var axis = this.data.getAxisFromIndex(axisIndex);
                    var facetIndex = axis.getFacetIndexFromId(facetId);
                    var facet = null;
                    facet = viewDef[axes[axisIndex]].facets[facetIndex];
                    if (!facet)
                        continue;
                    return {
                        facet : facet,
                        index : facetIndex
                    };
                }
                return null;
            },
            flipVisibleFacetLevel : function(facetId, facetLevelId, stateToSetTo, axisIndexStr, contextView) {
                var viewDef = this._getCubeDefinition();
                var axisIndex = parseInt(axisIndexStr, 10);
                var index = 0;
                var axis = this.data.getAxisFromIndex(axisIndex);
                var facetIndex = axis.getFacetIndexFromId(facetId);
                var axes = [ "sideAxis", "topAxis" ];

                var facet = null;
                facet = axis.facets[facetIndex];
                var facetLevelIndex = facet.getFacetLevelIndexFromId(facetLevelId);
                var facetDef = viewDef[axes[axisIndex]].facets[facetIndex];
                var facetLevel = facet.facetLevels[facetLevelIndex];
                // This should be optimized
                if (stateToSetTo){
                    var futureVisibleLevels = [];
                    // add to facet. We need to add the facet level in
                    // the right location
                    for (index = 0; index < facet.facetLevels.length; index++){
                        var currLevel = facet.facetLevels[index];
                        if (currLevel.attributeId == facetLevel.attributeId ||
                            (facet.getLevelFacetStateInFacet(currLevel.attributeId)))
                        {
                            futureVisibleLevels.push(currLevel);
                        }
                    }
                    facetDef.visibleLevels = futureVisibleLevels;
                    facet.visibleLevels = futureVisibleLevels;
                }
                else{
                    // Remove from facet
                    // Find it in the visible ones.
                    var foundVisibleLevel = -1;
                    for (index = 0; index < facetDef.visibleLevels.length; index++){
                        if (facetDef.visibleLevels[index].attributeId == facetLevel.attributeId){
                            foundVisibleLevel = index;
                            break;
                        }
                    }
                    facetDef.visibleLevels.splice(foundVisibleLevel, 1);
                }
                if(contextView && facetDef.visibleLevels.length == 1 ){
                	 contextView.setItemDisabled('{"facetId":"'+facetDef.visibleLevels[0].dimensionId+'","facetLevelId":"'+facetDef.visibleLevels[0].attributeId+'"}');
				}
				else if(contextView && facetDef.visibleLevels.length == 2){
					contextView.setItemEnabled('{"facetId":"'+facetDef.visibleLevels[0].dimensionId+'","facetLevelId":"'+facetDef.visibleLevels[0].attributeId+'"}');
					contextView.setItemEnabled('{"facetId":"'+facetDef.visibleLevels[1].dimensionId+'","facetLevelId":"'+facetDef.visibleLevels[1].attributeId+'"}');
				}

                return;
            },
            clearSortHandler : function() {
                this._setCubeDefinitionSortParams([]);

                this._setPivotAxesRequest();
            },
            cleanupMenus : function() {
                var that = this;
                _.each(this.getContextMenus(), function(contextMenu, contextname) {
                    contextMenu.cleanup(that);
                });
                this._isShowingContextMenu = false;
            },
            getContextMenu : function(contextName) {
                return this._contextMenus[contextName];
            },
            getContextMenus : function() {
                return this._contextMenus;
            },
            addContextMenuItem : function(contextMenuStr, contextNode, item, parent) {
                var contextMenu = this.getContextMenu(contextMenuStr);
                // Check if it's a function returning us the definition of the menu item and execute it in the pivot context
                if (contextMenu && _.isFunction(contextMenu)) {
                    contextMenu = contextMenu.call(this,contextMenuStr, contextNode, item, parent);
                }
                var contextMenuView = this.getContextMenu(contextMenuStr);
                var topId = parent ? parent : contextMenuView.topId;

                var currItem = item;
                currItem.uiMenu = contextMenuView;
                if (currItem.radio){
                    contextMenuView.addRadioButton('child', topId, currItem.location, currItem.name, this
                            .getLocaleString(currItem.label), currItem.radio.groupName, currItem.radio.checked,
                        !currItem.enabled);

                }
                else if (currItem.checkbox){
                    contextMenuView.addCheckbox('child', topId, currItem.location, currItem.name, this
                        .getLocaleString(currItem.label), currItem.checkbox.checked, !currItem.enabled);

                }
                else{
                    contextMenuView.addNewChild(topId, currItem.location, currItem.name, this
                        .getLocaleString(currItem.label) ||
                        currItem.label, false);

                }
                contextMenu.addItem(currItem);

            },
            renderMenuContext : function(contextMenuStr, contextNode) {
                var contextMenuView = this.getContextMenuView(contextMenuStr);
                contextMenuView.render(this, contextNode);
            },
            getContextMenuView : function(contextName) {
                var context = this.getContextMenu(contextName);
                return context ? context.getView() : {};
            },
            getCellContextMenuView : function() {
                return this.getContextMenuView('CellContextMenu');
            },
            getFacetContextMenuView : function() {
                return this.getContextMenuView('FacetContextMenu');
            },
            getMeasuresContextMenuView : function() {
                return this.getContextMenuView('MeasuresContextMenu');
            },
            setContextMenuCustomLogic : function(contextName, customLogic) {
                var context = this.getContextMenu(contextName);
                if (context){
                    context.setCustomLogic(customLogic);
                }
            },
            getLocaleString : function() {
                var origArgs= Array.prototype.slice.call(arguments, 0);
                var retVal=_pns._getPivotLocaleString.apply(this, [{prefix:this.customPivotLogic.localeResourcePrefix,args:arguments}].concat(arguments));
                if (''==retVal||retVal==null||retVal===undefined&&console.trace) {
                    pivotlog("Missing label %o",origArgs);
                }
                return retVal;
            },
            /*Method to validate 'duration' type measure's value. Will strip the non-validated strings.
            	This function is similar to platform's DurationUtilities.stripNonDurations. But we've overridding this function because, in platform function,
            	There is a verification for value.type=='text'. Which won't apply in our case. So override it.*/
            stripNonDurations : function(value, allowNeg){
		        if (value != null) {
		            var symbols = DurationUtilities.TranslatedDaySymbol + DurationUtilities.TranslatedHourSymbol + DurationUtilities.TranslatedMinuteSymbol;
		            var chars = '/' + (allowNeg ? '\\-{0,1}' : '') + '\\d{1,}[' + symbols + ']\\s{0,1}/g';

		            // Remove any characters that don't match the specified.
		            //used new Function() to alternate to eval() to avoid security volnurabilities.
		            var str = (new Function('return ' + chars))(); 
		            var matches = value.toUpperCase().match(str);
		            return (matches != null ? matches.join('') : '');
		        }
		        return;
		    },

            handleContextMenuEvent : function(contextMenuStr, userData) {
                var retVal = true;
                var contextMenu = this.getContextMenu(contextMenuStr);
                var handlerSection = this.registeredContextActions[contextMenuStr];
                var contextMenu = this[contextMenuStr];
                userData.uiMenu = contextMenu;
                var actionName = userData && userData.action;
                if (contextMenu){
                    var action = contextMenu.getItem(actionName);
                    userData.actionItem = action;
                    /*
                     * if (currItem.radio) { } else if (currItem.checkbox) { } else
                     */if (action && action.click)
                        retVal = action.click(this, userData);
                }
                contextMenu.hide();
                return retVal;
            },
            switchMeasuresAxis : function() {
                var topMeasures = this.getTopAxisView().hasMeasures();
                this._getCubeDefinition().topAxis.hasMeasures = this.getSideAxisView().hasMeasures();
                this._getCubeDefinition().sideAxis.hasMeasures = topMeasures;

                // Make sure the sorts are cleared
                this._setCubeDefinitionSortParams([]);
                //
                this._getCubeDefinition().sortOrders = [];
                delete this._selectedCellDiv;
                this.lastSelectedCellId=undefined;
                this._setPivotAxesRequest();
                
                this._switchMeasureAxis = true;
                
                /*MDAP-2732 - When single scenario present on top/side and other facet is moved to the axis using context menu, 
                 * 		   should be hide scenario as it's single. To hide the scenario, we have to call load scenarios()*/
                var viewDef = this._getCubeDefinition();
                if(viewDef && viewDef.availableScenarios && viewDef.availableScenarios.length < 2 && this.isScenarioFacetVisible()){
	            	 this.handleScenarios("loadScenarios", viewDef.availableScenarioIds,viewDef.availableScenarios);
	             }

            },
            _onDeleteComment : function(){
                pivotlog('Deleting Comment');
                var value = {};
                value.cmt=true;
                value.hide=true;
                var updateId = {
                    sideAxis : ud.id.row,
                    topAxis : ud.id.column
                };
                var updateValue = {
                    "data" : value
                };
                that.data.callEvent("onStoreUpdated", [ updateId, updateValue, "delete" ]);
            },
            _handleOnBeforeContextMenu : function(id, e, node) {
                pivotlog("Luanching context menu");
                var scenariosDimensionKey = this._getCubeDefinition().scenariosDimensionKey;
                this.cleanupMenus();
                this.hideTooltips();
                if (this.isEditing() && this.dirtyInvalidEditCleanup() && !this.processValidation(this.$activeEditor)){
                	return;
                }
                this._select(id,false);
                this.updateFocusedCell()//Make sure the focused cell as selected cell.
                if($(node).closest('.attributeArea').length){
                    return;
                }
                var isAssigned, isLast = false, that = this, pos = dhtmlx.html.pos(e), menuIndex = 1000, items =
                        [], menuId = null, index = 0, localId = null, axesFacet =
                        this.getAxisFacetNode($(node)), otherAxisFacets, thisAxisFacets, contextMenuName = null,
                    /** @type jda.pivot.MenuContext */
                    contextMenu = null, contextMenuView = null, measureOnTop = this.areMeasuresOnTop();
                $node = $(node), $cellNode = $node.closest(".dhx_value"), $renderNode = $node,
                    pivotMenusEventHandlers = new _pns.eventHandlers(this);
                if (id instanceof jQuery) {
                    contextMenuName = "selectionContextMenu";
                }
                else
                {
                    if (id.axisIndex > -1){
                        thisAxisFacets = this._getCubeView()[id.axisIndex].getVisibleFacets();
                        otherAxisFacets = this._getCubeView()[1 - id.axisIndex].getVisibleFacets();
                    }
                    contextMenuName =
                        $cellNode.length ? "cellContextMenu" : $node.closest(".measureCell").length ? "measureContextMenu" : ($node
                            .hasClass("draggableFacet") ||
                            $node.closest('.sideCellMember').length &&
                            $node.find('.measureCell').length === 0 || id.isFacetHeader &&
                            $node.parentsUntil($(".dhx_dtable"),
                                ".pivotLayerElement .draggableFacet,.pivotLayerElement .sideFacet").length) ? "facetContextMenu" : null;
                }
                contextMenu = this.getContextMenu(contextMenuName);
                if (!contextMenu){
                    return;
                }

                contextMenuView = contextMenu.getView();
                contextMenuView.eventId={};
                // Hoist the event handler container object
                contextMenu.setEventHandlerConf(pivotMenusEventHandlers);
                topId = contextMenuView.topId;

                if (axesFacet){
                    id.axesFacet = axesFacet;
                    // Only if it's not the measures column
                    if (axesFacet.facet){
                        var facetNode = axesFacet.facet.getFacetParentNode(axesFacet.axis, axesFacet.axisPath);
                        id.axesFacet.facetNode = facetNode;
                    }
                    //pivotlog('Axes facet is %o', axesFacet);
                }

                if ($cellNode.length){
                	//Clearing any multi selection if right click on any of the cells.
                	this._clearMultiSelection();
                	
                    $renderNode = $cellNode;
                    var $dynNavigationItem = $(this.config.dynamicNavSelector);

                    var cell = that.item(id.row)[id.column];
                    var cellLocation = new _pns.CellLocation(id);
                    var ud = {
                        id : id,
                        cell : cell
                    };

                    var sortOrders = this._getCubeDefinitionSortParams();
                    var sortAscItem = undefined;
                    var sortDscItem = undefined;
                    var dhxWins = undefined;
                    //var myPop =undefined;
                    var foundCurrentOrder = undefined;
                    var doesSortExist = sortOrders && sortOrders.length; // If no sorts
                    if (doesSortExist){
                        // Check if the sort whom cell we click on already has a sort
                        foundCurrentOrder = _.find(sortOrders, function(sortElement, sortIndex) {
                            var isSameLocation = sortElement.compareSortLocation(cellLocation);
                            return isSameLocation;
                        });

                    }
                    
                    var isSubmeasure = false;
                    if(that.areMeasuresOnTop()){
                    	for(var ind in that._settings.columns){
                    		if(that._settings.columns[ind].id == id.column) {
                    			isSubmeasure = that._settings.columns[ind].isSubMeasure;
                    			break;
                    		}
                    	}
                    }else{
                		isSubmeasure = that.item(id.row).isSubmeasure;
                	}
                    
                    if (!isSubmeasure && (!doesSortExist || !foundCurrentOrder || foundCurrentOrder.getOrder() !== 0)){ //So sorting support for sub-measures
                        sortAscItem = {
                            type : "item",
                            name : "SortAsc",
                            label : that.getLocaleString('sortAsc', destMeasure),
                            location : 1,
                            repaint : false,
                            enabled : true,
                            data : {
                                action : "SortAsc",
                                sortContextAxis : 1
                                // Top Axis for now
                            },
                            click : contextMenu._generateHandlingFunction(function(pivotObject, userData) {
                                return that.sortPivotAction(ud, 0);
                            })
                        };
                    }
                    ;
                    if (!isSubmeasure && (!doesSortExist || !foundCurrentOrder || foundCurrentOrder.getOrder() !== 1)){ //So sorting support for sub-measures
                        sortDscItem = {
                            type : "item",
                            name : "SortDsc",
                            label : that.getLocaleString('sortDsc', destMeasure),
                            location : 2,
                            repaint : false,
                            enabled : true,
                            data : {
                                action : "SortDsc"
                            },
                            click : contextMenu._generateHandlingFunction(function(pivotObject, userData) {
                                return that.sortPivotAction(ud, 1);
                            })
                        };
                    }
                    ;
                    if ($dynNavigationItem.length){
                        var dynNavItem = {
                            type : 'item',
                            name : "DynNav",
                            label : that.getLocaleString('dynnav'),
                            location : 3,
                            enabled : true,
                            children : []
                        };
                        var dynNavItemCurrent =
                        {
                            type : 'item',
                            name : "dynNavItemCurrent",
                            label : that.getLocaleString('dynnav.current'),
                            location : 1,
                            enabled : true,
                            repaint : false,
                            data : _.extend({}, ud, {
                                $dynNavigationItem : $dynNavigationItem,
                                action : "dynNavItemCurrent",
                                plusChildren : false
                            }),
                            click : contextMenu
                                ._generateHandlingFunction(pivotMenusEventHandlers.dynNavHandler)
                        };
                        var dynNavItemCurrentPlusChildren = _.extend({}, dynNavItemCurrent, {
                            name : "dynNavItemCurrentPlusChildren",
                            location : 2,
                            data : _.extend({}, ud, {
                                $dynNavigationItem : $dynNavigationItem,
                                action : "dynNavItemCurrentPlusChildren",
                                plusChildren : true
                            }),
                            label : this.getLocaleString('dynnav.currentPlusChildren')
                        });
                        dynNavItem.children.push(dynNavItemCurrent, dynNavItemCurrentPlusChildren);
                        
                    }
                    if (!contextMenuView.checkEvent("onClick")){
                        contextMenuView.attachEvent("onClick", contextMenu
                            ._generateHandlingFunction(pivotMenusEventHandlers.cellMenuOnClick));

                    }
                    if (!contextMenuView.checkEvent("onCheckboxClick")){
                        contextMenuView.attachEvent("onCheckboxClick", contextMenu
                            ._generateHandlingFunction(pivotMenusEventHandlers.cellMenuOnCheckboxClick));

                    }
                    if (!contextMenuView.checkEvent("onRadioClick")){
                        contextMenuView.attachEvent("onRadioClick", contextMenu
                            ._generateHandlingFunction(pivotMenusEventHandlers.cellMenuOnRadioClick));
                    }
                    var clearHighlightedCellsItem=null;
                    if (Object.keys(this.highlightedChangedCells).length) {
                        clearHighlightedCellsItem = {
                            type : "item",
                            name : "ClearHighlighedCells",
                            label : that.getLocaleString('ClearHighlighedCells'),
                            location : 3,
                            repaint : false,
                            enabled : true,
                            data : {
                                action : "ClearHighlighedCells"
                            },
                            click : contextMenu._generateHandlingFunction(function(pivotObject, userData) {
                                return that.clearHighlightedCells(ud, 1);
                            })
                        };
                    }

                    items.push(sortAscItem, sortDscItem,dynNavItem,clearHighlightedCellsItem);

                    // Check this menu
                    /*
                     * that._isShowingContextMenu = true; that.$menuCell = $node; that.$menuCell.data('title',
                     * that.$menuCell.attr('title')); that.$menuCell.removeAttr('title');
                     * this.cellContextMenu._showContextMenu(pos.x - 5, pos.y - 5);
                     */
                    /*
                     * if ($($cellNode).find('.cell_lock').length && blackList.indexOf('locking') === -1) {
                     * this.setCustomContextMenuItemsView("cellContextMenu", $cellNode); }
                     */
                }
                else if (contextMenuName == 'measureContextMenu'){
                    var destMeasure = this.areMeasuresOnTop() ? "side" : "top";
                    thisAxisFacets = this._getCubeView()[id.axisIndex].getVisibleFacets();
                    var measureMenuHooks = contextMenu.getHooks();
                    var moveMeasureItem =
                    {
                        type : 'item',
                        name : "moveMeasureToAxis",
                        label : that.getLocaleString('moveMeasureToAxis', destMeasure),
                        location : menuIndex++,
                        enabled : thisAxisFacets.length > 0,
                        repaint : false,
                        clearSort : true,
                        data : $.extend({
                            action : "moveMeasureToAxis"
                        }, id),
                        click : contextMenu
                            ._generateHandlingFunction(pivotMenusEventHandlers.measureMenuMoveOnClick)
                    };

                    var viewMeasureItems = {
                        type : 'item',
                        name : "viewMeasure",
                        label : that.getLocaleString('viewMeasure'),
                        location : menuIndex++,
                        children : [],
                        enabled : true
                    };
                    /*
                     * this.measuresContextMenu.addNewChild(measuresTopId, 2, "viewMeasure", this
                     * .getLocaleString('viewMeasure'), false);
                     */
                    var visibleMeasureId =this._getCubeDefinition().visiblemeasures.length;

                    for (index = 0; index < this._getCubeDefinition().measures.length; index++){
                        var currMeasure = this._getCubeDefinition().measures[index];
                        var isMeasureVisible = this.isMeasureVisible(currMeasure.id);
                        var isEnabled = false;
                        if(measureMenuHooks && measureMenuHooks.hideMeasure(currMeasure)){
                        	isEnabled=true;
                        }
                        if(visibleMeasureId ==1 && isMeasureVisible){
                        	isEnabled=true;
                        }

                        menuId = JSON.stringify({
                            measure : currMeasure.id
                        });

                        var viewMeasureItem =
                        {
                            type : "item",
                            name : menuId,
                            label : currMeasure.label,
                            location : menuIndex++,
                            enabled : !isEnabled,
                            repaint : true,
                            clearSort : true,
                            data : {
                                action : "viewMeasure",
                                measure : currMeasure.id
                            },
                            checkbox : {
                                checked : isMeasureVisible
                            },
                            clickCheck : contextMenu
                                ._generateHandlingFunction(pivotMenusEventHandlers.measureViewClick)
                        };
                        viewMeasureItems.children.push(viewMeasureItem);
                    }
                    // If we have only one checked item lets not allow
                    // unchecking it.
                    if (viewMeasureItems.children == 1){
                        viewMeasureItems.children[0].enabled = false;
                    }
                    items.push(moveMeasureItem, viewMeasureItems);
                    // this.measuresContextMenu.attachEvent("onCheckboxClick",
                    // contextMenu._generateHandlingFunction(pivotMenusEventHandlers.measureMenuOnCheckboxClick));
                    if (!contextMenuView.checkEvent("onClick")){
                        contextMenuView.attachEvent("onClick", contextMenu
                            ._generateHandlingFunction(pivotMenusEventHandlers.measureMenuOnClick));

                    }
                    if (!contextMenuView.checkEvent("onCheckboxClick")){
                        contextMenuView.attachEvent("onCheckboxClick", contextMenu
                            ._generateHandlingFunction(pivotMenusEventHandlers.measureMenuOnCheckboxClick));

                    }
                    if (!contextMenuView.checkEvent("onRadioClick")){
                        contextMenuView.attachEvent("onRadioClick", contextMenu
                            ._generateHandlingFunction(pivotMenusEventHandlers.measureMenuOnRadioClick));
                    }
                }
                else if (contextMenuName == 'facetContextMenu'){
                    // Check if it's a facet name header
                    var isFacetNameHeader = $node.closest(".sideFacet:not(#jda_pivot_corner)").length;
                    // Find the actual current facet object
                    var currentFacetObject = null;
                    var moveToAxisLabel =
                            id.axisIndex === 0 ? this.getLocaleString('moveToTopAxis') : this
                        .getLocaleString('moveToSideAxis');
                    var thisAxisHasMeasures = this._getCubeView()[id.axisIndex].hasMeasures();
                    thisAxisFacets = this._getCubeView()[id.axisIndex].getVisibleFacets();
                    otherAxisFacets = this._getCubeView()[1 - id.axisIndex].getVisibleFacets();
                    var lastOneOnAxis = !((thisAxisFacets.length > 1) || (thisAxisHasMeasures));
                    for (index = 0; index < thisAxisFacets.length; index++){
                        if (thisAxisFacets[index].id === id.facetId){
                            currentFacetObject = thisAxisFacets[index];
                            break;
                        }
                    }
                    var facetMenuHooks = contextMenu.getHooks();
                    var moveFacetToAxisItem =
                    {
                        type : "item",
                        name : "moveToAxis",
                        label : moveToAxisLabel,
                        location : menuIndex++,
                        enabled : !lastOneOnAxis,
                        data : $.extend({
                            action : "moveToAxis"
                        }, id),
                        repaint : false,
                        clearSort : true,
                        click : contextMenu
                            ._generateHandlingFunction(pivotMenusEventHandlers.swapFacetAxisHandler)
                    };
                    // check this moveFacet to axis item can be placed on context menu based on
                    // application provided hooks value
                    if(facetMenuHooks && facetMenuHooks.hideMoveFacet(currentFacetObject)){
                    	moveFacetToAxisItem=undefined;
                    }
                    if (!isFacetNameHeader){
                        var expandToMemberItems = {
                            type : "item",
                            name : "expandTo",
                            label : that.getLocaleString('expandTo'),
                            location : menuIndex++,
                            enabled : true,
                            children : []
                        };

                        if (axesFacet){
                            var facetLevelsToExpandTo = [];
                            var facetLevelIdx = axesFacet.axisPath[axesFacet.facetIndex].length - 1;
                            for (index = facetLevelIdx; index < currentFacetObject.facetLevels.length; index++)
                            {
                                var currFacetLevel = currentFacetObject.visibleLevels[index];
                                facetLevelsToExpandTo.push(currFacetLevel);
                            }
                            if (facetLevelsToExpandTo.length){
                                for (index = 0; index < facetLevelsToExpandTo.length; index++){
                                    var currFacetLevel = facetLevelsToExpandTo[index];
                                    if (currFacetLevel === undefined)
                                        continue;
                                    menuId = "expandToFacetLevel-" + JSON.stringify({
                                        facetId : currentFacetObject.id,
                                        facetLevelId : currFacetLevel.attributeId
                                    });

                                    var expandToMemberItem =
                                    {
                                        type : "item",
                                        name : menuId,
                                        label : currFacetLevel.attributeName,
                                        location : menuIndex++,
                                        enabled : true,
                                        data : {
                                            axis : this._getCubeView()[id.axisIndex],
                                            facet : currentFacetObject,
                                            axisPath : axesFacet.axisPath,
                                            facetLevel : currFacetLevel,
                                            extraDepth : index + 1,
                                            action : 'expandToFacetLevel'
                                        },
                                        repaint : false,
                                        click : contextMenu
                                            ._generateHandlingFunction(pivotMenusEventHandlers.expandToFacetLevel)
                                    };

                                    expandToMemberItems.children.push(expandToMemberItem);

                                }
                            }

                        }
                    }
                   
                    // Set the swappable facets
                    var swapWithFacetItems = {
                        type : "item",
                        name : "swapWithFacet",
                        label : that.getLocaleString('swapWithFacet'),
                        location : menuIndex++,
                        enabled : true,
                        children : []
                    };

                    var axesFacets = [ thisAxisFacets, otherAxisFacets ];
                    var isOtherAxis = false;
                    for ( var iAxis = 0; iAxis < axesFacets.length; iAxis++){
                        var axisFacets = axesFacets[iAxis];
                        var axisIndex = !isOtherAxis ? id.axisIndex : 1 - id.axisIndex;
                        for (index = 0; index < axisFacets.length; index++){
                            // Skip ourself
                            var axisFacet = axisFacets[index];
                            if (axisFacet.id === id.facetId){

                                continue;
                            }
                            // check facet hide option 
                            // implementation done by application team
                            if(facetMenuHooks && facetMenuHooks.hideSwapFacet(axisFacet)){
                            	continue;
                            }
                            localId = $.extend({
                                swapToAxis : id.axisIndex,
                                swapToFacet : axisFacet.index,
                                action : "swapWithFacet"
                            }, id);
                            menuId = "swapWithFacet-" + axisIndex + "-" + localId.swapToFacet;
                            var swapWithFacetItem =
                            {
                                type : "item",
                                name : menuId,
                                label : axisFacet.getDisplayName(),
                                location : menuIndex++,
                                enabled : true,
                                repaint : false,
                                clearSort : true,
                                data : $.extend({
                                    swapToAxis : axisIndex,
                                    swapToFacet : axisFacet.index,
                                    action : "swapWithFacet"
                                }, id),
                                click : contextMenu
                                    ._generateHandlingFunction(pivotMenusEventHandlers.swapWithFacet)
                            };
                            swapWithFacetItems.children.push(swapWithFacetItem);
                        }
                        isOtherAxis = true;
                    }
                    // check for swap facet item from context menu can hide  
                    // implementation done by application team through hooks
                    if(facetMenuHooks && facetMenuHooks.hideSwapFacet(currentFacetObject,swapWithFacetItems)){
                    	swapWithFacetItems=undefined;
                    }
                    // Show\hide facets
                    var viewFacetItems = {
                        type : "item",
                        name : "viewFacet",
                        label : that.getLocaleString('viewMeasure'),
                        location : menuIndex++,
                        enabled : true,
                        children : []
                    };
                    
                   /* var showHideTotalLabel =
                    	currentFacetObject.showRoot == true ? this.getLocaleString('hideTotal') : this
                            .getLocaleString('showTotal');
                    	
                        var showHideTotalItem =
                        {
                            type : "item",
                            name : "showHideTotal",
                            label : showHideTotalLabel,
                            location : menuIndex++,
                            enabled : true,
                            data : currentFacetObject,
                            repaint : false,
                            click : contextMenu
                                ._generateHandlingFunction(pivotMenusEventHandlers.showHideTotal)
                        };*/                    	
                    	
                    items.push(moveFacetToAxisItem, expandToMemberItems, swapWithFacetItems, viewFacetItems);
                    //MDAP-2732 - Remove Show/Hide total for 'Scenario' facet.
                    if(currentFacetObject.name != scenariosDimensionKey && 
                    		this.config.enabledRootNodeConfig &&  !(facetMenuHooks && facetMenuHooks.hideShowTotal && facetMenuHooks.hideShowTotal(currentFacetObject)))
                    {	
                    	var showHideTotalLabel =
                    		currentFacetObject.showRoot == true ? this.getLocaleString('hideTotal') : this
                    				.getLocaleString('showTotal');

                    		var showHideTotalItem =
                    		{
                    				type : "item",
                    				name : "showHideTotal",
                    				label : showHideTotalLabel,
                    				location : menuIndex++,
                    				enabled : true,
                    				data : currentFacetObject,
                    				repaint : false,
                    				click : contextMenu
                    				._generateHandlingFunction(pivotMenusEventHandlers.showHideTotal)
                    		};


                    		 items.push(moveFacetToAxisItem, expandToMemberItems, swapWithFacetItems, viewFacetItems, showHideTotalItem); 		
                    }

                    // Not the most effective way of iterating
                    var sideAxis = this.getSideAxisView();
                    var topAxis = this.getTopAxisView();
                    var allFacets = sideAxis.getFacets().concat(topAxis.getFacets());
                    for (index = 0; index < allFacets.length; index++){
                        var currFacet = allFacets[index];
                        //Excluding 'scenarios' from view/hide of facets.
                        if (currFacet.isDummy() || currFacet.name == scenariosDimensionKey)
                            continue;
                        var facetId = currFacet.id;
                        isLast =
                            (sideAxis.isOnlyVisibleFacetInAxis(facetId) && !sideAxis.hasMeasures()) ||
                            (topAxis.isOnlyVisibleFacetInAxis(facetId) && !topAxis.hasMeasures());
                        isAssigned = (isLast !== null);
                        var isFacetVisible = currFacet.isVisible();
                        menuId = "view-" + _pns.Constants.facetIdPrefix + currFacet.id;

                        var viewFacetItem =
                        {
                            type : "item",
                            name : menuId,
                            label : currFacet.getDisplayName(),
                            location : menuIndex++,
                            enabled : !isLast,
                            repaint : true,
                            clearSort : true,
                            checkbox : {
                                checked : isFacetVisible
                            },
                            data : {
                                action : "viewFacet",
                                facetId : currFacet.id
                            },
                            clickCheck : contextMenu
                                ._generateHandlingFunction(pivotMenusEventHandlers.facetViewHandler)
                        };
                        viewFacetItems.children.push(viewFacetItem);
                    }

                    // Show\hide facets levels
                    var viewFacetLevelItems = {
                        type : "item",
                        name : "viewFacetLevel",
                        label : that.getLocaleString('viewFacetLevel'),
                        location : menuIndex++,
                        enabled : true,
                        children : []
                    };

                    for (index = 0; index < currentFacetObject.facetLevels.length; index++){
                        var currFacetLevel = currentFacetObject.facetLevels[index];
                        var facetLevelId = currFacetLevel.attributeId;
                        isLast = currentFacetObject.getLevelFacetStateInFacet(facetLevelId);
                        isAssigned = isLast !== null;

                        menuId = JSON.stringify({
                            facetId : currentFacetObject.id,
                            facetLevelId : facetLevelId
                        });

                        var viewFacetLevelItem =
                        {
                            type : "item",
                            name : menuId,
                            label : currFacetLevel.attributeName,
                            location : menuIndex++,
                            enabled : !isAssigned || !isLast.last,
                            checkbox : {
                                checked : isAssigned
                            },
                            repaint : true,
                            clearSort : true,
                            data : {
                                action : "viewFacetLevel",
                                facetId : currentFacetObject.id,
                                facetLevelId : facetLevelId
                            },
                            clickCheck : contextMenu
                                ._generateHandlingFunction(pivotMenusEventHandlers.flipVisibleFacetLevel)

                        };
                        viewFacetLevelItems.children.push(viewFacetLevelItem);

                    }

                    // Anchor a facet member
                    if (axesFacet && !isFacetNameHeader){
                        menuId = "anchorFacetMember";

                        var facetPath = axesFacet.axisPath[axesFacet.facetIndex];
                        // Check the if we clicked on the root node. If so there is no need to show the
                        // level
                        var facetLevelName = "";
                        if (facetPath.length > 1 && facetPath[facetPath.length - 1] != this.rootId){
                            facetLevelName =
                                currentFacetObject.visibleLevels[facetPath.length - 2].attributeName;
                        }
                        else{
                            facetLevelName = this.getLocaleString('TopLevelName');
                        }

                        var memberName = node.innerText;

                        var enableItem = !lastOneOnAxis;
                        var filterName = this.getLocaleString("anchorName", facetLevelName, memberName);
                        localId =
                            $.extend({
                                action : menuId,
                                filterName : filterName,
                                swapToAxis : 1 - id.axisIndex,
                                facetPath : facetPath,
                                facetLevelName : facetLevelName,
                                memberName : memberName,
                                facetPathDesc : this.getFacetLabelFromAxisLabel(this
                                    .getCellIdDescriptionObj(id), id.axisIndex, id.facetIndex)
                            }, id);

                        var anchorFacetMemberItem =
                        {
                            type : "item",
                            name : "anchorFacetMember",
                            label : that.getLocaleString('anchor', filterName),
                            location : menuIndex++,
                            enabled : enableItem,
                            data : localId,
                            repaint : false,
                            click : contextMenu
                                ._generateHandlingFunction(pivotMenusEventHandlers.anchorFacetMember)
                        };

                    }

                    // Show/hide facets
                    // contextMenuView.attachEvent("onCheckboxClick",
                    // contextMenu._generateHandlingFunction(pivotMenusEventHandlers.facetMenuOnCheckboxClick));
                    items.push(moveFacetToAxisItem, expandToMemberItems, viewFacetItems, viewFacetLevelItems,
                        anchorFacetMemberItem);
                    if (!(expandToMemberItems && expandToMemberItems.children && expandToMemberItems.children.length))
                    {
                        items = _.without(items, expandToMemberItems);
                    }
                    if (!contextMenuView.checkEvent("onClick")){
                        contextMenuView.attachEvent("onClick", contextMenu
                            ._generateHandlingFunction(pivotMenusEventHandlers.facetMenuOnClick));

                    }
                    if (!contextMenuView.checkEvent("onCheckboxClick")){
                        contextMenuView.attachEvent("onCheckboxClick", contextMenu
                            ._generateHandlingFunction(pivotMenusEventHandlers.facetMenuOnCheckboxClick));

                    }
                    if (!contextMenuView.checkEvent("onRadioClick")){
                        contextMenuView.attachEvent("onRadioClick", contextMenu
                            ._generateHandlingFunction(pivotMenusEventHandlers.facetMenuOnRadioClick));
                    }

                }
                else if (contextMenuName == 'selectionContextMenu'){
                    pivotlog("Register selectionContextMenu");
                    contextMenuView.contextHideAllMode=false;
                    if (!contextMenuView.checkEvent("onClick")){
                        contextMenuView.attachEvent("onClick", contextMenu
                            ._generateHandlingFunction(pivotMenusEventHandlers.selectionMenuOnClick));

                    }
                    if (!contextMenuView.checkEvent("onCheckboxClick")){
                        contextMenuView.attachEvent("onCheckboxClick", contextMenu
                            ._generateHandlingFunction(pivotMenusEventHandlers.selectionMenuOnCheckboxClick));

                    }
                    if (!contextMenuView.checkEvent("onRadioClick")){
                        contextMenuView.attachEvent("onRadioClick", contextMenu
                            ._generateHandlingFunction(pivotMenusEventHandlers.selectionMenuOnRadioClick));
                    }
                }
                items = _.uniq(items);
                contextMenu.addItem(items);
                this.$context = id;
                contextMenu.render(this, $renderNode, pos, id);
                if (that.clipboard) {
                    that.clipboard.glue($("tr[id$='copyPivotSelection']"));
                }


            },
            isScenarioFacetVisible : function(){
            	var obj = this.getScenarioFacet();
            	return (obj && obj.visibleIndex != -1) ? true : false;
            },
            
            getScenarioFacet : function(){
            	var visibleFacets = this._getCubeDefinition().visibleFacets;
            	var scenariosDimensionKey = this._getCubeDefinition().scenariosDimensionKey;
            	var obj = visibleFacets.filter(function ( obj ) {
            	    return obj.name === scenariosDimensionKey;
            	})[0];
            	return obj;
            },
            
            getTimeFacet : function(){
            	var availableFacets = this._getCubeDefinition().availableFacets;
            	//return availableFacets.find(obj => obj.timeFacet === true);
            	var obj = availableFacets.filter(function ( obj ) {
            	    return obj.timeFacet === true;
            	})[0];
            	return obj;
            },
            getFacetLabelFromAxisLabel : function(axisLabel, axisIndex, facetIndex) {
                var axisDataSectionName = axisIndex ? 'topAxisPath' : 'sideAxisPath';
                var retVal = {};
                var facetLevelsObj = axisLabel[axisDataSectionName][facetIndex];
                var facetLevelNames = facetLevelsObj.facetLevelNameObj;
                var facetLevelMembers = facetLevelsObj.facetLevelLabelObj;
                for ( var i = 0; i < facetLevelNames.length; i++){
                    retVal[facetLevelNames[i]] = facetLevelMembers[i];
                }
                return retVal;

            },
            sortPivotAction : function(userData, sortOrder) {
                var axisIndex = -1;
                // For now always send the top axis
                axisIndex = userData.sortContextAxis !== undefined ? userData.sortContextAxis : 1; // default
                // to 1

                this
                    .sortPivot(axisIndex, userData.id.column, this.getMeasureFromCellId(userData.id),
                    sortOrder,userData.id.row);
            },

            sortPivot : function(axidIndex, axisPath, measure, sortOrder,rowAxisPath) {

                if(measure == undefined || measure == null)
                    return;
                this._getCubeDefinition().topAxis.sortOrder = {};

                var axisPathObj = new _pns.axisPath(axisPath), sortAxisPathDescription =
                    [ measure.label, escape(this.getTopAxisView().getAxisPathSortLabel(axisPathObj, true, this)) ];
                this.addSortParam(axidIndex, axisPathObj.facetPaths, measure.id, sortOrder,
                    sortAxisPathDescription);
                this.data.cube.backup_definition = this.data.cube.backup_definition || {};
                this.data.cube.backup_definition.expansionParam = this.data.cube.backup_definition.expansionParam  || {};
                this.data.cube.backup_definition.expansionParam.sortTriggered = {};
                this.data.cube.backup_definition.colsDefs={};
                var sortLocation = this.data.cube.backup_definition.expansionParam.sortTriggered;
                sortLocation.column = axisPath;
                sortLocation.row = rowAxisPath;

                this._setPivotAxesRequest();

                return true;
            },
            clearHighlightedCells: function() {
                this.highlightedChangedCells = {};
                this.$_viewobj.find('.highlightedChangedCell').removeClass('highlightedChangedCell',1000);
                this.updateFocusedCell();
            },
            truncateSortParam :function(){
                var sortOrders = this._getCubeDefinitionSortParams() ? this._getCubeDefinitionSortParams() : [];
                if (sortOrders.length) {
                    sortOrders=[sortOrders[0]];
                }
                this._setCubeDefinitionSortParams(sortOrders);
            },
            addSortParam : function(axisIndex, facetPaths, measureId, sortOrder, sortDescription) {
                var sortOrders = undefined;
                var sortingFacetPaths = {}, axisFacets = this.getAxisFacets(axisIndex);
                _.each(axisFacets, function(facet, index) {
                  //  if (!facet.dummy){
                        sortingFacetPaths[facet.id] = facetPaths[index];
                  //  }
                });
                sortParam = {
                    sortingFacetPaths : sortingFacetPaths,
                    measureId : measureId,
                    order : sortOrder,
                    description : sortDescription,
                    shuffeledAxisIndex : 1 - axisIndex

                };
                this._augmentSortParam(sortParam);
                sortOrders = this._getCubeDefinitionSortParams() ? this._getCubeDefinitionSortParams() : [];
                if (this._isMultiSortSupported()){
                    var foundCurrentSortParam = this._getExistingSortContext(sortParam);
                    if (!foundCurrentSortParam){
                        sortOrders.push(sortParam);
                    }
                    else{
                        foundCurrentSortParam.setOrder(sortParam.getOrder());
                    }

                }
                else{
                    sortOrders = [ sortParam ];
                }
                ;
                this._setCubeDefinitionSortParams(sortOrders);

            },
            _isMultiSortSupported : function() {
                var multiSortSetting = this.customPivotLogic && this.customPivotLogic.supportMultiSort;
                return multiSortSetting && this.areMeasuresOnTop();
            },
            _getNamespace : function() {

            },
            _isPersistentChangeHighlightSupported: function() {
                return this.customPivotLogic && this.customPivotLogic.supportPersistentChangeHighlight===true;
            },
            setPersistentChangeHighlightSupported: function(enabled) {
                this.clearHighlightedCells();
                this.customPivotLogic.supportPersistentChangeHighlight=enabled;
            },
            getPivotCellTemplateForType: function(type) {
                return this.getTemplates()[type]||this.getPivotCellTemplateForType("simple-CellTemplate");
            },
            getPivotCellTemplateClassName: function() {
                return this.customPivotLogic.cellTemplate||'BasicCellTemplate';
            },

            togglePersistentChangeHighlightSupported: function() {
                this.setPersistentChangeHighlightSupported(!(this._isPersistentChangeHighlightSupported()));
            },
            _getExistingSortContext : function(sortParam) {
                var sortOrders = this._getCubeDefinitionSortParams() ? this._getCubeDefinitionSortParams() : [];
                var foundCurrentSortParam =
                    _.find(sortOrders, function(currSortParam, currSortParamIndex) {
                        var exists =
                            currSortParam.comparePathTo(sortParam) &&
                            currSortParam.compareMeasureTo(sortParam);
                        return exists;
                    });
                return foundCurrentSortParam;
            },
            _isSortColumn : function(_columnAxisPath) {
                var columnAxisPath = _columnAxisPath;
                var areMeasuresOnTop = this.areMeasuresOnTop();
                var measureId = undefined;
                if (areMeasuresOnTop){
                    columnAxisPath = _columnAxisPath.concat();
                    measureId = columnAxisPath.splice(-1, 1);
                }
                var sortColumn =
                	_.find(this._getCubeDefinitionSortParams(), function(element, index, list) {
                   	 var columnAxisPathConcat = columnAxisPath.concat(); 
                        
                   	var equal = _.isEqual(columnAxisPathConcat, element.sortAxisPathParam);
                   	if(equal)
                   	{	
                   		return _.isEqual(columnAxisPathConcat, element.sortAxisPathParam) &&
                               (!areMeasuresOnTop ? true : (measureId[0] == element.measureId));
                   	}
                   	else
                   	{
                   		var rootFound = _.find(columnAxisPathConcat, function(element,index,list) {
                   			return _.contains(element.concat(),"-999");
                   			
                   		});
                   		
                   		if(rootFound)
                   		{
                   				var newColumnAxis = [];
                   				_.each(columnAxisPathConcat,function(ele){
                   					newColumnAxis.push(_.without(ele,"-999"));
                   				});     
                   			    return _.isEqual(newColumnAxis, element.sortAxisPathParam) && (!areMeasuresOnTop ? true : (measureId[0] == element.measureId));
                   		}
                   		
                   	}
                   	
                   });
                return sortColumn !== undefined;
            },
            _isSortMeasure : function(measureId) {
                var sortColumn = _.find(this._getCubeDefinitionSortParams(), function(element, index, list) {
                    return measureId == element.measureId;
                });
                return sortColumn !== undefined;
            },
            // Add the functions to be used in an sort param object
            _augmentSortParam : function(sortParam) {
                // First check it's a sort param object
                var that = this;
                if (this._isSortParamObject(sortParam)){
                    sortParam.getPivotObject = function(sortParam) {
                        return that;
                    };
                    sortParam.isSortParamObject = function(sortParam) {
                        sortParam = sortParam || this;
                        return that._isSortParamObject(sortParam);
                    };
                    sortParam.sortContextAxisIndex = function() {
                        return 1 - this.shuffeledAxisIndex;
                    };
                    sortParam.compareSortLocation =
                        function(cellLocation) {
                            var sortContextAxis =
                                this.getPivotObject().getAxisView(this.sortContextAxisIndex()), locationAxisPath =
                                cellLocation.getAxisArray(this.sortContextAxisIndex());

                            // If this happens to be a cell ID we will convert it to cell location
                            cellLocation =
                                !_.isArray(cellLocation) ? cellLocation : new _pns.CellLocation(
                                    cellLocation);
                            var isEqualAxisPath =
                                _.any(this.sortingFacetPaths,
                                    function(facetSortParam, facetId) {
                                        var facetIndex =
                                            sortContextAxis.getFacetIndexFromId(facetId);
                                        var locationFacetPath = locationAxisPath[facetIndex];
                                    	// if root element is total then return false so that user can see Ascending option at UI
                                    	if(locationFacetPath.length == 2 && locationFacetPath[1] === '-999'){
                                    		return false;
                                        }                                        
                                        var isEqualFacetPath =
                                            _.isEqual(locationFacetPath, facetSortParam);
                                        return isEqualFacetPath;
                                    });
                            isEqualAxisPath =
                                isEqualAxisPath && cellLocation.getMeasureId() == this.getMeasureId();
                            return isEqualAxisPath;
                        };
                    sortParam.comparePathTo =
                        function(otherSortParam) {

                            return this.isSortParamObject(otherSortParam) &&
                                _.isEqual(this.sortingFacetPaths, otherSortParam.sortingFacetPaths);
                        };
                    sortParam.compareMeasureTo =
                        function(otherSortParam) {
                            return this.isSortParamObject(otherSortParam) &&
                                this.measureId == otherSortParam.getMeasureId();
                        };
                    sortParam.compareOrderTo = function(otherSortParam) {
                        return this.isSortParamObject(otherSortParam) && this.order == otherSortParam.order;
                    };
                    sortParam.getMeasureId = function() {
                        return this.measureId;
                    };
                    sortParam.compareTo =
                        function(otherSortParam) {
                            return this.isSortParamObject(otherSortParam) &&
                                this.order == otherSortParam.order &&
                                this.measureId == otherSortParam.getMeasureId() &&
                                _.isEqual(this.sortingFacetPaths, otherSortParam.sortingFacetPaths);
                        };
                    sortParam.getOrder = function() {
                        return this.order;
                    };
                    sortParam.setOrder = function(order) {
                        this.order = order;
                    };
                }
            },

            // Checks if it's a sort param object
            _isSortParamObject : function(sortParam) {
                return sortParam && sortParam.sortingFacetPaths && sortParam.measureId &&
                    sortParam.order !== undefined;
            },
            anchorFacetMembers : function(userData) {
                var facetDef = this.getFacetObjectFromCubeDefinition(userData.facetId);
                pivotlog('Anchoring facet id %d facetdef %o anchor %o', userData.facetId, facetDef, userData);

                var filterAttribute = {
                    filterName : userData.filterName,
                    facetPath : userData.facetPath,
                    facetPathDesc : userData.facetPathDesc,
                    facetLevelName : userData.facetLevelName,
                    memberName : userData.memberName,
                    facetName : userData.axesFacet.facet.name,
                };

                this.setFacetDefUIAttribute(userData.facetId, "Filters", filterAttribute);
               // facetDef.facet.showRoot = false;
                this.flipVisibleFacet(userData.facetId, false, userData.axisIndex);
                //Testing new anchor logic


                this._setPivotAxesRequest();
            },
            getFacetDefAttributes : function(facetId) {
                var facetDef = this.getFacetObjectFromCubeDefinition(facetId).facet;
                var UIAttributes = null;
                if (facetDef.UIAttributes === undefined){
                    UIAttributes = {};
                    facetDef.UIAttributes = UIAttributes;
                }
                else{
                    UIAttributes = facetDef.UIAttributes;
                }
                return UIAttributes;
            },
            getFacetDefUIAttribute : function(facetId, attributeName) {
                var UIAttributes = this.getFacetDefAttributes(facetId);
                var UIAttributeVal = UIAttributes[UIAttributes.attributeName];
                return UIAttributeVal;
            },

            setFacetDefUIAttribute : function(facetId, attributeName, value) {
                var UIAttributes = this.getFacetDefAttributes(facetId);
                var oldUIAttributeVal = UIAttributes[UIAttributes.attributeName];
                UIAttributes[attributeName] = value;
                return oldUIAttributeVal;
            },
            removeFacetDefUIAttribute : function(facetId, attributeName) {
                var UIAttributes = this.getFacetDefAttributes(facetId);
                var oldUIAttributeVal = UIAttributes[attributeName];
                if (oldUIAttributeVal)
                    delete UIAttributes[attributeName];
                return oldUIAttributeVal;
            },
            tempFlipText : function(elementSelector, newText, origText) {
                $(function() {
                    if (!origText){
                        origText = elementSelector.text();
                    }
                    elementSelector.text(origText);
                    elementSelector.fadeOut(200, function() {
                        $(this).text(newText).fadeIn(1500).fadeOut(200, function() {
                            $(this).text(origText).fadeIn(500);
                        });
                    });

                });
            },
            _handleClick : function(data, e) {
                if (data){
                    var rowId = data.row;
                    var element = e.target || e.srcElement;
                    var row = this.data.pull[rowId];
                    // In the case we clicked on a top facet we'll just
                    // use the rowId
                    row = row ? row : rowId;
                    var colElement = element.parentNode;
                    var colIndex = null;
                    while (colElement && ((colIndex = colElement.getAttribute("column")) === undefined)){
                        colElement = colElement.parentNode;
                    }
                    var col = this._settings.columns[colIndex];

                    var axisFacet = this._getAxisFacetFromRowCol(row, col, data.section);
                    if (axisFacet){
                        var axis = axisFacet.axis;
                        var facetIndex = axisFacet.facetIndex;
                        var facet = axisFacet.facet;
                        var axisPath = axisFacet.axisPath;
                        var axisId = axis.index;
                        var facetId = facet.id;

                        var clickedNode = axis.getNode(facetIndex, axisPath);
                        var isNodeExpanded = (clickedNode !== undefined) && clickedNode.isExpanded;
                        if (clickedNode.hasFacetChildren){
                            // So we can recalculate;
                            col.realSize = null;
                            if (!isNodeExpanded){
                                // If node is collapsed on top we can expand it
                                // on click
                                if (axisId == 1){
                                    this._markColumnsAsStale();
                                }
                                var mainNodeAxisPath =
                                    (axis.facets.length < axisPath.length) ? axisPath.slice(0,
                                            axisPath.length - 1) : axisPath;
                                this._getChildrenHierarchy(axisId, mainNodeAxisPath, facetId);

                            }
                            else{
                                this._collapse(axis, facetIndex, clickedNode);
                            }
                        }
                    }

                }
            },
            _getAxisFacetFromRowCol : function(row, col, section, topFacetId) {
                if (row !== undefined && col !== undefined && _pns.Constants.dataCellsSection != section && _pns.Constants.attrCellsSection != section){
                    var facetId = null;
                    var axisId = null;
                    var axisPath = null;
                    if (section == _pns.Constants.filterDropSection){

                    }
                    else if (section == _pns.Constants.measuresDataSection){
                    	axisId = 0;
                        facetId = col.id;
                        // Side axis
                        axisPath = row.axisPath;
                    }
                    else{
                        if (section == _pns.Constants.sideAxisFacetsSection){

                            axisId = 0;
                            facetId = col.id.replace(_pns.Constants.facetIdPrefix, "");
                            // Side axis
                            axisPath = row.axisPath;
                        }
                        else if (section == _pns.Constants.topAxisFacetsSection){
                            axisId = 1;
                            facetId = topFacetId;
                            // Top axis
                            axisPath = col.axisPath;
                        }
                    }
                    var axis = this.data.getAxisFromIndex(axisId);
                    var facetIndex = axis.getFacetIndexFromId(facetId);
                    var facet = axis.facets[facetIndex];
                    return {
                    	axis : axis,
                    	facetIndex : facetIndex,
                    	facet : facet,
                    	axisPath : axisPath
                    };
                }
            },
            getTweakedAxisPath : function(axisFacet){
            	 // We need to make sure that the axis path for this click resets the
                // facet path to the right to the root of the facet
                var tweakedAxisPath = [];
                var facetIndex = axisFacet.axisFacet || (axisFacet.facet && axisFacet.facet.index); 
                for ( var i = 0; i < axisFacet.axis.rootPath.length; i++){
                    if (i > facetIndex){
                        tweakedAxisPath.push(axisFacet.axis.rootPath[i].slice(0));
                    }
                    else{
                        tweakedAxisPath.push(axisFacet.axisPath[i].slice(0));
                    }
                }
                return tweakedAxisPath;
            },
            _removeColumnDataAndView : function(fromIdx, toIdx) {
                var keysToRemove = [];
                this.removeColumnDataRange(fromIdx, toIdx);
                var toBeRemovedIdx = [];
                for (var i = fromIdx; i <= toIdx; i++){
                    toBeRemovedIdx.push(i);
                    keysToRemove.push(this._columns[i].id);
                }
                this._hideColumns(toBeRemovedIdx);

                this._columns.splice(fromIdx, toIdx - fromIdx + 1);
                return keysToRemove;

            },
            _collapse : function(axis, facetIndex, collapsingNode, skipRender,measure) {
                // lastClickedSubNode This will sometimes be the last
                // measure on a row if applicable.
                var collapsingSubNode = null;
                var firstNode = null;
                var i, j = 0;
                // if (!this.areMeasuresOnTop())

                // Need to go to the last facet to know about the
                // measures
                firstNode = axis.getMeasuresParentNode(collapsingNode.axisPath);
                firstNode = firstNode ? firstNode : collapsingNode;
                collapsingSubNode = firstNode;
                if (axis.hasMeasures() && firstNode.measureNodes && firstNode.measureNodes.length>0)//Change here to get measure id
                    collapsingSubNode = firstNode.measureNodes[0];

                var clickedAxisPathStr = axis.getAxisPathIdStr(collapsingSubNode.axisPath);
                var currNodeIndex = null;
                if (axis.index === 0){
                    currNodeIndex = this.indexById(clickedAxisPathStr) + 1;
                }
                else{
                    currNodeIndex = parseInt(this.columnIndex(clickedAxisPathStr), 10) + 1;
                }
                var clickAxisPathArrayWithMeasure = collapsingSubNode.axisPath;

                var lastMeasure = this.getLastMeasureVisibleId();
                var axisOffset = 0;
                if (axis.hasMeasures()){
                    measureId = clickAxisPathArrayWithMeasure[clickAxisPathArrayWithMeasure.length - 1][0];
                    axisOffset = 1;

                }
                var axisPathObj =
                    new _pns.axisPath(clickAxisPathArrayWithMeasure.slice(0,
                            clickAxisPathArrayWithMeasure.length - axisOffset), lastMeasure);
                // var axisPathObj=new
                // _pns.axisPath(clickAxisPathArrayWithMeasure.slice(0,clickAxisPathArrayWithMeasure.length-1),this.getLastMeasureVisibleId());

                var lastDescendantAxisPath = axis.getLastDescendantAxisPath(this, facetIndex, axisPathObj);
                var lastCousinAxisPath = axis.getLastCousinAxisPath(this, facetIndex, axisPathObj);
                var lastDescendantIndex = currNodeIndex;
                if (lastDescendantAxisPath){
                    var lastDescendantAxisPathStr = axis.getAxisPathIdStr(lastDescendantAxisPath);
                    if (axis.index === 0)
                        lastDescendantIndex = this.indexById(lastDescendantAxisPathStr);
                    else
                        lastDescendantIndex = this.columnIndex(lastDescendantAxisPathStr);
                }
                if (lastCousinAxisPath){
                    var lastCousinAxisPathStr = axis.getAxisPathIdStr(lastCousinAxisPath);
                    if (axis.index === 0)
                        lastCousinIndex = this.indexById(lastCousinAxisPathStr);
                    else
                        lastCousinIndex = this.columnIndex(lastCousinAxisPathStr);
                }
                var startRemoveIndex = lastDescendantIndex;
                var keysToRemove = [];
                if (axis.index === 0){

                    var order = this.data.order;
                    var pull = this.data.pull;
                    for (i = lastCousinIndex; i > startRemoveIndex; i--){
                        keysToRemove.push(order[i]);
                    }
                    order.splice(startRemoveIndex + 1, lastCousinIndex - startRemoveIndex);
                    for (i = 0, j = keysToRemove.length; i < j; i++){
                        delete pull[keysToRemove[i]];
                    }
                }
                else{
                    // We need to go over the data to make sure we
                    // remove the right columns
                    keysToRemove = this._removeColumnDataAndView(startRemoveIndex + 1, lastCousinIndex);
                    collapsingNode.isExpanded = false;
                    /*if (!skipRender){
                        this._adjustChangedColumns();

                    }*/
                }

                // Clean facet's parents maps
                for (i = facetIndex + 1, j = axis.facets.length; i < j; i++){
                    var currFacet = axis.facets[i];
                    // var truncatedPath = currFacet.truncateAxisPathToFacet(axisPathObj.facetPaths);
                    // var truncatedPathStr = axis.getAxisPathIdStr(truncatedPath);
                    for ( var k = 0; k < keysToRemove.length; k++){
                        var pathParts =
                            this._getAxisPathMeasureSplit(keysToRemove[k])[0]
                                .split(_pns.Constants.axisPathSeperator);
                        var truncatedPath = currFacet.truncateAxisPathToFacet(pathParts);
                    }
                }
                // Clean measures map. We need to remove self entry and children's
                if (collapsingSubNode){
                    for ( var i = 0; i < keysToRemove.length; i++){
                        var noMeasurePathStr = this._getAxisPathMeasureSplit(keysToRemove[i])[0];
                        axis.removeMeasuresParentNode(noMeasurePathStr);
                    }

                }

                // clean own map
                collapsingNode.childrenMap = {};

                collapsingNode.isExpanded = false;
                axis.updateParentChild(collapsingNode.axisPath.slice(0, facetIndex+1), facetIndex, false, this);
                if (!skipRender){
                    //this._initPivotWhenNeeded(true);
                    this.data.callEvent("renderPivot",[false,true]);
                    /*
                     this._apply_headers();
                     this._adjustChangedColumns();
                     this.refresh();
                     this.render();
                     this.renderMultiSelected();
                     */

                }
            },
            _collapseMeasure :  function(measureRowPath,skipRender) {
            	
            	var keysToRemove = [];

            	if(this.areMeasuresOnTop()){
            		
            		for(var ind=0; ind < this._settings.columns.length ; ind++){
            			if(this._settings.columns[ind].id == measureRowPath && this._settings.columns[ind].isExpanded){
            				keysToRemove = 	this._removeColumnDataAndView(ind + 1, ind + this._settings.columns[ind].subMeasures.length);
            				this._settings.columns[ind].isExpanded = false;
            				this._settings.columns[ind].dataNodes[this._settings.columns[ind].dataNodes.length -1].isExpanded = false;
            				break;
            			}
            		}
            		
            	}else{
	            	var order = this.data.order;
	            	var startRemoveIndex = order.indexOf(measureRowPath);
	            	if(startRemoveIndex < 0){
	            		return;
	            	}
	
                    var pull = this.data.pull;
                    var subMeasures = (pull[measureRowPath].subMeasures && pull[measureRowPath].subMeasures);
                    if(subMeasures){
                    	for (var i = startRemoveIndex + 1; i <= startRemoveIndex + subMeasures.length;i++){
                    		if(subMeasures.indexOf(order[i]) > -1){
                    			keysToRemove.push(order[i]);
                    			delete pull[order[i]];
                    		}else{
                    			break;//All submeasures will be on order. Some submeasure may be hidden
                    		}
                    	}
                    }
	                order.splice(startRemoveIndex + 1, (i - 1) - startRemoveIndex ); // Remove elements from start index to one less then last value of i
	                pull[measureRowPath].isExpanded = false;
            	
            	}
                if (!skipRender){
                    this.data.callEvent("renderPivot",[false,true]);
                }
                if(this.data.expandDataObj) delete this.data.expandDataObj[measureRowPath];
            
            },
            _click_before_select : function(e, id) {
            	
            	//If the cell contains column,row information, then clear the multi selection. For facet members there won't be column/row, so on click of members, we won't remove multi selection.
            	if(id.column || id.row){
            		this._clearMultiSelection();
            	}                    	
            	selectedCellId = id;
            	
            	//MDAP-3638 - Fix for Locks and scroll operations resulting in UpdateFactsRequest loop. Verify JIRA for more info.
            	if(this._getPivotLockedMode() && this._hasSelectedCellInDOM(this._selectedCellDiv)){
            		return;
            	}
                var prevSelectedId = this.getSelected();
                var currTs = Date.now();
                var triggerEdit = false;
                // check if the selection has not changed
                if (this.$_viewobj.find('div.dhx_cell_select.dhx_value').length > 0 && prevSelectedId && prevSelectedId.row === id.row && prevSelectedId.column === id.column ) {
                	triggerEdit = true;
                }
                this.lastSelectedTimestamp = Date.now();
                var preserve = e.ctrlKey;
                var range = e.shiftKey;

                if (!this._settings.multiselect)
                    preserve = range = false;
                
             // Triggered Event before cell selection
                this.triggerEvent('beforeCellSelection',{id:id});  

                if (range && this._selected_areas.length){
                    var last = this._selected_areas[this._selected_areas.length - 1];
                    this._selectRange(id, last);
                }
                else{
                    if (preserve && this._selected_pull[this._select_key(id)])
                        this._unselect(id);
                    else{
                    	//this.bringScrollToClientArea(this._locateCellDiv(id));                    	
                        this._select(id, preserve,e);
                        currTs = Date.now();
                        pivotlog('_click_before_select this.lastSelectedId=%o this.lastSelectedTimestamp=%o  topAxisPath=%o',this.lastSelectedId,this.lastSelectedTimestamp);
                        if (triggerEdit){
                            this._startEditOnDblClick(e);
                        }
                        this.lastSelectedTimestamp = currTs;
                        this.lastSelectedId = id;

                    }
                }
                this.doScrollPartiallyVisibleCellToFull(id); // To make the partial cell also available for paste operation.
            },
            _maintainSelected : function(xr) {
                if (this._selectedCellDiv){
                	
                	var hasSelectedCellInDOM = this._hasSelectedCellInDOM(this._selectedCellDiv);
                	if(hasSelectedCellInDOM){
                		this.updateFocusedCell();
                	}else{                		
                		this._debounceSelectFirstCell();
                	}
                   
                }
            },
            
            _debounceSelectFirstCell : function(){
            	// make some delay of 1s to avoid double click.
            	(this._debounceSelectCell =
                    this._debounceSelectCell || _.debounce(this._selectFirstCell, 500))();
            	this._debounceSelectCell.apply(this);
            },
            _selectFirstCell: function(){
            	var $centerDiv=$(this._viewobj).find(".dhx_ss_center .dhx_column");
            	if($centerDiv.length && $centerDiv.length>0){
            		for(var i=0; i<$centerDiv.length; i++){
            			// get first column first cell
            			 var $firstDiv = $($centerDiv[i]).find("div");
            			 var location = this.locateCell($firstDiv[0]);                   			 
            			 if(location && this.isColumnPartiallyVisible(location[1]) == false){
            				 // check first div in column is not partially visible
            				 if(this.isRowPartiallyVisible(location[0]) == false){
            					 $($firstDiv[0]).hasClass("dhx_cell_select") || $firstDiv[0].click();
            					 return true;
            				 }
            				 else{
            					 $($firstDiv[1]).hasClass("dhx_cell_select") || $firstDiv[1].click();
            					 return true;
            				 }
            			 }                    			
            		}                   		
            	}     
            	return false;
            },
            _hasSelectedCellInDOM:function(selectedCell){ 
            	var cellInDOM = false;
             if(selectedCell && this.lastSelectedCellId){	
            	 var row = this.lastSelectedCellId.sideAxis;
            	 var col = this.lastSelectedCellId.topAxis;
            	 var rowId = this.data.pull[row];
            	 
            	 if(rowId  &&rowId[col]){
            		 cellInDOM = true;
            	 }                   	                    	             
             }
             return cellInDOM;
            },
            getSelectedCellAxisPath: function(needAxisArray){
                if(this._selectedCellDiv){
                    if (this._selectedCellDiv.parentNode === null){
                        var $selected = this.$_viewobj.find('div.dhx_value.' + StringUtilities.ltrim(this._select_css));
                        // %d',StringUtilities.ltrim(this._select_css),$selected.length);
                        var selector = $selected.attr('tabindex', 0).addClass('focusedCell');
                        if (selector.length){
                            this._selectedCellDiv = selector[0];
                        }
                    }
                    var  cell = this.locateCell($(this._selectedCellDiv));
                    var cellLocation=new _pns.CellLocation(cell);

                    var cellId = {
                        sideAxisPath : needAxisArray ? cellLocation.getSideAxisArray() : cellLocation.sideAxisPath,
                        topAxisPath :  needAxisArray ? cellLocation.getTopAxisArray() : cellLocation.topAxisPath
                    };

                    return cellId;
                }

                return undefined;
            },
            _clearSelectedDivInExpandMode:function(){
                var $selectedDiv = $(this._selectedCellDiv);
                if($selectedDiv){
                    var rowpath = $selectedDiv.attr("data-rowaxispath");
                    var $colDivs = this.$_viewobj.find(".dhx_ss_body .dhx_ss_center");
                    var hasSelectedDiv = $colDivs.find("[data-rowaxispath='"+rowpath+"']").hasClass("dhx_cell_select");
                    //var rowpath =$.contains(document.documentElement, $(selectedDiv));
                    if(!hasSelectedDiv){
                        this._clear_selection();
                        pivotlog(" Selected Div Cleared  for data-rowaxispath="+rowpath);
                        this._selectedCellDiv=undefined;
                        this._makeDefaultCellSelection();
                       /* if (this.isGraphEnabled()) {
              			  this.getGraphWrapper().fireEvent('cellchange',undefined,[]);
                       }
                       if (this.isCommentEnabled()) {
                      	  this.getCommentWrapper().fireEvent('pivotcellchanged',undefined,[]); 
                       }*/
              	}
                    }

                
            },
            _makeDefaultCellSelection:function(){
            	if (this.isGraphEnabled()) {
        			  this.getGraphWrapper().fireEvent('cellchange',undefined,[]);
                 }
                 if (this.isCommentEnabled()) {
                	 this.getCommentWrapper().fireEvent('pivotcellchanged',undefined,[]); 
                 }
            },
            _clear_selection:function() {
                var i = 0;

                for (i = 0; i < this._selected_rows.length; i++){
                    var row = this._selected_rows[i];
                    var item = this.item(row);
                    if (item){

                        var selectObj = item.$select;
                        for ( var index in selectObj){
                            if (selectObj.hasOwnProperty(index) && index != "$count"){
                                var col = index;
                                if (item[col]){
                                    delete item[col].$select;
                                }

                                var _selectedCellDiv = this._locateCellDiv({
                                    row : row,
                                    column : col
                                });
                                if (_selectedCellDiv)
                                    $(_selectedCellDiv).removeClass('dhx_cell_select');
                            }
                        }

                        item.$select = null;
                    }
                }
                var cols = this._settings.columns;
                if (cols)
                    for (i = 0; i < cols.length; i++){
                        cols[i].$select = null;
                    }
                // Make sure nothing is marked\
                this.$_viewobj.find('.dhx_cell_select').removeClass('dhx_cell_select');
                this._reinit_selection();
                return true;
                // this.callEvent("onAfterClearSelection",[]);
            },
            dirtyInvalidEditCleanup : function() {
                if ((!this.$activeEditor.parent().length)){
                    this.cancelEdit();
                    return false;
                }
                $(this.$activeEditor).focus();
                return true;
            },
            _select : function(data, preserve, e) {
                if (data.section == "sideAxisFacetsSection"){
                    return;
                }
                var rowVal = this.item(data.row);
                var currVal = rowVal && rowVal[data.column];
                // Check if already selected
                if (currVal && currVal.$select)
                    return;
              //  this.bringScrollToClientArea(this._locateCellDiv(data));

                if (this.isEditing()){
                    // Maybe a bit of a cleanup if required
                    if(this.hasCellRenderType()){
                        this.submitRenderCell();
                    }
                    else if (this.dirtyInvalidEditCleanup()){
                        var isValid = this.processValidation(this.$activeEditor);
                        if (!isValid)
                            return;
                        if (!this.submitEdit()){
                            this.cancelEdit();
                        }
                    }
                }
                var key = this._select_key(data);
                this._selected_pull[key] = true;
                // don't allow selection on unnamed columns
                if (key === undefined)
                    return;
                if (!data.column)
                    return;
                // If this is a facet cell we ignore the call
                if (data.column.substr(0, _pns.Constants.facetIdPrefix.length) == _pns.Constants.facetIdPrefix)
                {
                    return;
                }
                //If this is a attribute cell ignore the selection
                /* if(!(/^-1:-1/g).test(data.column)){
                 return;
                 }*/

                this.$_viewobj.find('div.dhx_cell_select').removeAttr('tabindex');
                data.id = key;
                if (!this.callEvent("onBeforeSelect", [ data, preserve ]))
                    return false;

                // ignore area, if it was already selected
                if (this._selected_pull[key] && preserve)
                    return;

                if (!preserve)
                    this._clear_selection();

                this._selected_areas.push(data);
                this._selected_pull[key] = true;
                if (data.row && data.column){
               	 	var item = this.item(data.row);
               	 var cell;
                 if(item){
                	 cell = item[data.column];
                 }
                    if(item && cell){
                    
		                //if(!currVal.render){
		                    this.callEvent("onAfterSelect", [ data, preserve ]);
		                    this.data.callEvent("onAfterSelect", [  data, preserve ]);
		               // }
	                // this._finalize_select(this._post_select(data));
	
	                    // This is a request for cell selection.
	                    this._post_select(data);
	                    cell.$select = true;
	                    this._finalize_select_cell(data, preserve);
                   }
                   // this.updateFocusedCell();
                }
                else{
                    this._finalize_select(this._post_select(data));
                }
                this.lastSelectedId=data;
                this.updateFocusedCell();

                return true;
            },
            getFacetFromFacetId : function(facetId) {
                var retVal = null;
                for ( var index = 0; index < this._getCubeDefinition().availableFacets.length; index++){
                    if (this._getCubeDefinition().availableFacets[index].id == facetId){
                        retVal = this._getCubeDefinition().availableFacets[index];
                        break;
                    }
                }
                return retVal;

            },
            getFacetFromFacetName : function(facetName) {
                var retVal = null;
                if (!facetName)
                    return;
                for ( var index = 0; index < this._getCubeDefinition().availableFacets.length; index++){
                    if (this._getCubeDefinition().availableFacets[index].getIDName().toLowerCase() == facetName.toLowerCase()){
                        retVal = this._getCubeDefinition().availableFacets[index];
                        break;
                    }
                }
                return retVal;

            },
            _getDataFroRowPath : function(sideAxisPathsArr,topAxisPathsArr,obj){
                    
            		var sideAxisPaths = [];
                    var topAxisPaths = [];
                    var measuresIDs = [[]];
                	for(var i =0; i<sideAxisPathsArr.length; i++){
                		measuresIDs[i]= this._getVisibleMeasuresIds();
                	}
                	
                    for ( var key=0; key < sideAxisPathsArr.length; key++){
                        var value = sideAxisPathsArr[key];
                        var axisPath = new _pns.axisPath(value);
                        sideAxisPaths.push({
                            axisPath : axisPath.facetPaths
                        });
                    }
                    ;
                    for ( var key=0; key < topAxisPathsArr.length; key++){
                        var value = topAxisPathsArr[key];
                        var axisPath = new _pns.axisPath(value);
                        topAxisPaths.push({
                            axisPath : axisPath.facetPaths
                        });
                    }
                    ;
                    
                    var params = {
                            attributeIds : [],
                            sideAxisPaths : sideAxisPaths,
                            topAxisPaths : topAxisPaths,
                            combiMeasuresIds : measuresIDs,
                            viewport : {
                                xr : {'0':3,'1':4},
                                yr : {'0':0,'1':24}
                            },
                            showCommentDogears: this.cellCommentRelation(),
                        };
                       
                        var getSegmentDataRequest = new jda.pivot.getSegmentDataRequest(params);
                        getSegmentDataRequest.callback = function(response,request){
                        	if(obj){
                        		obj.request = request;
                        		obj.response = response;
                        	}
                        };
                        var payload = getSegmentDataRequest._getPayload();
                        var cachedPayloadParams = JSON.stringify(params);
                        this.mapSegmentRequestsLoad[cachedPayloadParams] = "1";
                        this.data.pivotCommands[getSegmentDataRequest.id] = getSegmentDataRequest;
                        this.data.feed.call(this, this.data.url, "jda_pivot_json", payload);
                
            },
            // Splits the axis path string to the facets paths on ethe first element and the measure ID on the
            // other
            _getAxisPathMeasureSplit : function(axisPathStr) {
                if (!axisPathStr)
                    return [ null, null ];
                var tokens = axisPathStr.split(_pns.Constants.measurePathSeperator);
                return tokens;
            },
            _getMemberIndexFromAxisPath : function(axis, axisPath, facetId) {
                var retVal, i = 0;
                var rowIdStr = axis.getAxisPathIdStr(axisPath);
                // Check only if its not the root path
                if (rowIdStr){
                    // Side axis
                    if (axis.index === 0){
                        var orderCol = this.data.order;
                        // Not efficient search
                        for (i = 0, j = orderCol.length; i < j; i++){
                            // Todo check if this is the right way to
                            // identify the correct row or we need to
                            // append the first measure Id
                            if (orderCol[i].startsWith(rowIdStr)){
                                retVal = i;
                                break;
                            }
                        }
                    }
                    else{
                        // Top axis
                        var cols = this._settings.columns;
                        for (i = 0; i < cols.length; i++){
                            // cols[i];
                        }

                    }

                }
                return retVal;
            },
            _isDataColumn : function(columnIndex) {
                return this._columns[columnIndex].type == "data";
            },
            _render_header_and_footer : function() {
                if (this._settings.header){
                    this._header_height = this.$_viewobj.find(".dhx_ss_header").height();
                    this._render_header();
                }
                if (this._settings.footer){
                    this._footer_height =
                        (this._settings.headerRowHeight + 1) * this._normalize_headers("footer");
                    this._render_footer();
                }
            },
            _normalize_headers : function(collection) {
                var rows = 0;
                var i, j = 0;
                var data = null;
                var count = this._getTopAxisFacetCount(); // header
                // row count
                var isMeasure = this.areMeasuresOnTop();
                for (i = 0; i < this._columns.length; i++){
                    data = this._columns[i][collection];
                    var setSideMeasure = !this.areMeasuresOnTop() && this._columns[i].isMeasure;
                    // var
                    // isDataColumn=this._columns[i].type=="data"&&!this.areMeasuresOnTop();
                    var isDataColumn = this._isDataColumn(i);
                    if (!data || typeof data != "object" || !data.length){
                        if (dhtmlx.isNotDefined(data)){
                            if (collection == "header")
                                data = this._columns[i].id;
                            else
                                data = null;
                        }
                        data = [ data ];
                    }
                    for (j = 0; j < data.length; j++){
                        if (typeof data[j] != "object")
                        // data[j] = { text:data[j] };
                            if (isMeasure && count == j && !this._columns[i].corner){
                                data[j].isMeasure = true;
                            }
                            else if (this._columns[i].corner && j !== 0){
                                data[j].corner = true;
                            }
                            else if (this._columns[i].corner && j === 0){
                                data[j].filterDropZone = true;
                            }
                        if (setSideMeasure && data[j]){
                            data[j].isMeasure = true;
                        }
                        if (isDataColumn && data[j]){
                            data[j].corner = true;
                        }

                    }
                    rows = Math.max(rows, data.length);
                    this._columns[i][collection] = data;
                }

                for (i = 0; i < this._columns.length; i++){
                    data = this._columns[i][collection];
                    if (data.length < rows)
                        data[data.length - 1].rowspan = rows - data.length + 1;
                    for (j = data.length; j < rows; j++)
                        data[j] = null;
                }

                return rows;
            },
            _getNodeBox:function(rid, cid){
                var xs=0, xe=0, ye=0, ys=0;
                var i; var zone = 0;
                for (i = 0; i < this._columns.length; i++){
                    if (this._rightSplit == i || this._getDataSplitIdx() == i){
                        xs=0; zone++;
                    }
                    if (this._columns[i].id == cid)
                        break;
                    xs+=this._columns[i].width;
                }
                xe+=this._columns[i].width;

                for (i = 0; i < this.data.order.length; i++){
                    if (this.data.order[i] ==rid)
                        break;
                    ys+=this._getHeightByIndex(i);
                }
                ye+=this._getHeightByIndex(i);
                return [xs,xe,ys-this._scrollTop,ye, this._body.childNodes[zone]];
            },
            _render_header_section : function(sec, name) {
                // Remove all children
                var childNodes = sec.childNodes;
                // destroy resize handlers before removing element from dom
                this._destroyResizeHandlers(sec);
                for ( var i = 0, childCount = childNodes.length; i < childCount; i++){
                    var currSubSec = childNodes[i];
                    while (currSubSec.firstChild){
                        // destroy resize handlers before removing element from dom
                        //this._destroyResizeHandlers(currSubSec);
                        // The list is LIVE so it will re-index each call
                        currSubSec.removeChild(currSubSec.firstChild);
                    }

                }
                
                if(this.sideFacetMaxWidthReached)
                	this._addResizeHandlers(sec.childNodes[0]);
                
                var hasAttr =false;
                var nodeIdx=0;
                // Add Facet Header
                sec.childNodes[nodeIdx].appendChild(this._render_subheader(0, this._getFacetSplitIndex(),
                		this.sideFacetMaxWidthReached ?this._left_viewport_width : this._left_width, name,false));
                nodeIdx+=1;

                if(childNodes.length > 3){


                    this._addResizeHandlers(sec.childNodes[nodeIdx]);
                    // Add Attribute Header
                    sec.childNodes[nodeIdx].appendChild(this._render_subheader(this._getFacetSplitIndex(), this._getDataSplitIdx(),
                        this._attr_width, name,true));
                    $(sec.childNodes[nodeIdx]).children('.ui-resizable-handle').css("right",-(this._attrScrollLeft +10) + 'px');
                    nodeIdx+=1;
                    hasAttr=true;
                }
                // Add Data table Header
                sec.childNodes[nodeIdx].appendChild(this._render_subheader(this._getDataSplitIdx(),
                    this._getRightSplit(), this._dtable_width, name,false), sec);
                nodeIdx+=1;
                // Add Right side header
                sec.childNodes[nodeIdx].appendChild(this._render_subheader(this._getRightSplit(), this._columns.length,
                    this._right_width, name,false));

                this.refreshHeaderContent();
                var $attrHeader=null,attrHeight=0;
                var $leftHeader = this.$_header.find(".dhx_hs_left").height('auto');
                var $centerHeader = this.$_header.find(".dhx_hs_center").height('auto');
                if(hasAttr){
                    $attrHeader = this.$_header.find(".dhx_hs_attr").height('auto');
                    attrHeight = $attrHeader.find('table').height();

                }
                
                if(this.sideFacetMaxWidthReached){
                	//this._addResizeHandlers(sec.childNodes[0]);
                	// freeze top facet header which is part of measure 
                	if(this.areMeasuresOnTop() == false){
                		$leftHeader.find("td.topFacet > div.pivotColumnResizer").hide();
                		//$leftHeader.find("td.topFacet").css("position","absolute").css("left",this._left_freezeMsrCol+this._sideFacetScrollLeft);
                	}
                }else{
                	$leftHeader.find("td.topFacet > div.pivotColumnResizer").show();
                }
                
                var leftHeight = $leftHeader.find('table').height();
                var centerHeight = $centerHeader.find('table').height();
                this.widthLeftToResize = Math.max(0,$(sec.childNodes[2]).width()-this._settings.standardColumnSize);
                if (leftHeight > centerHeight){
                    $centerHeader.height(leftHeight);
                    $leftHeader.height(leftHeight);
                    if( hasAttr)
                        $attrHeader.height(leftHeight);
                }
                else if (leftHeight < centerHeight){
                    $leftHeader.height(centerHeight);
                    $centerHeader.height(centerHeight);
                    if( hasAttr)
                        $attrHeader.height(centerHeight);
                }

                // Make sure the top names have no padding on the sides
                this.$_viewobj.find(".topFacetNames").parentsUntil('tr').css({
                    'padding-right' : '0px',
                    'padding-left' : '0px'
                });

            },

            /**
             * Destroy resize handlers from each header column on side and top facet before element is removed
             * @param targetElement
             *                      column header element to destroy resizable
             */
            _destroyResizeHandlers:function(targetElement){

                if(targetElement){
                    pivotlog(" Running _destroyResizeHandlers %s",targetElement.id);
					if($(targetElement).hasClass(".resizableColumnApplied")){
						  $(targetElement).find(".resizableColumnApplied").removeClass("resizableColumnApplied")
					      .resizable('destroy');
					}
                }
            },
            /**
             * Add Resizing capabilities to each header on side and top facet. This function add jquery resizable to each column headers
             * @param targetElement
             *                      column header element to add resizable
             */
            _addResizeHandlers : function(targetElement) {
                // pivotlog("Running _applyResizeHandlers %s", new Date());

                var that = this;

                var handles = "";

                var $draggableElement = $(targetElement);
                //var col = parseInt($draggableElement.attr('column'));
                handles = "e";
                $($draggableElement).addClass('resizableColumnApplied').resizable({
                    resize : function(event, ui) {
                        ui.helper.parent().css('width', ui.size.width + 'px');
                    },
                    handles : handles,
                    ghost : true,
                    create : function(event, ui) {

                    },
                    start : function(event, ui) {
                        var currWidth = $(this).outerWidth();
                        $(ui.element).css("position","").css("top","").css("left","");
                        
                        if($(this).parent('div.dhx_ss_header').length===0) {
                            $(this).resizable('option','maxWidth',currWidth + that.widthLeftToResize);
                        }
                        event.stopImmediatePropagation();
                        that.isFacetBeingResized = true;

                    },
                    resize : function(event, ui) {
                        that.isFacetBeingResized = true;
                    },
                    stop : function(event, ui) {
                        if($(this).parent('div.dhx_ss_header').length){
                        	var tempWidth = that._getTableCellHeaderSize.call(this, event, ui);
                          if($(this).hasClass('dhx_hs_attr')){
                        	  that._isAttrResizing = true;
                        	  that._attr_width = tempWidth; 
                          }else{
                        	  that._left_resize_width = tempWidth;                       	  
                          }
                          
                            that._adjustChangedColumns();
                            that._check_rendered_cols(true,true,true,true);
                            that._isAttrResizing = false;
                            //that.resizePivot();
                        }
                        else{
                            var columnIndex = $(this).attr('column');
                            var col = that._columns[parseInt(columnIndex, 10)];
                            col.userSetWidth = that._getTableCellHeaderSize.call(this, event, ui);
                            that._resetRowHeights();
                            
                            //  that.data.callEvent("renderPivot",[false,true]);
                            //that._resetRowHeights();
                            that._renderStructureChange(false,col.isAttr);
                            //that.resizePivot();
                        }
                        
                        that.isFacetBeingResized = false;
                        that._left_resize_width = undefined;
                    	that._selectCell();
                    }
                }).find('.ui-resizable-handle').addClass("pivotColumnResizer");

            },           
            _getTableCellHeaderSize : function(event, ui) {
                return ui.size.width;
            },
            equalizeHeaders : function() {

            },
            /******************************** Pivot Selecting ROWS/ COLUMNS related CODE  *****************************************/
            /**
             * This function select all descendant members based on the new Status . If new status 1 then all will be selected or 0 all will be de-selected
             * 
             * */
            selectDescendant:function(axis,axisPathStr,newStatus,retVal){
            	var axisPath = new _pns.axisPath(axisPathStr);
            	// select current axis path to new status
            	this.setMemberSelectorStatus(axis.index,axisPathStr,newStatus);
            	if(retVal)
            	 retVal.push(axisPathStr);
            	// Get all possible children for current axis path 
            	// Each facet will have its own children. result will be map with facetIndex mapped with facet children
                var allChildren = axis.getAllChildren(this,axisPath);
            	var len = Object.keys(allChildren).length;           	        	
            	var memStatus = "";
            	// Iterate allchildren map to get descendant 
            	for(var i=1; i<=len; i++){
            		var grandChildren = allChildren[i];
            		 if(grandChildren.length >0 ){
            			 // Iterate for grandChildren to idenfity descendant
            			 for(index in grandChildren){  
            				   // select descenant of current children 
            		 	       this.selectDescendant(axis,grandChildren[index],newStatus,retVal);
            			 }
            		 }
            	}
            },
            /**
             * Select the all the parent[each facet parent] info ,set the new status to each parent, 
             * when got selected/unselected then do it for its descendants also
             * 
             * */
            selectAncestor:function(axis,axisPathStr,newStatus){            	
            	var axisPath = new _pns.axisPath(axisPathStr);
            	// Get all parent info as array.. it gives current axis path 
            	// parent( each facet parent info)
            	var allParent =  axis.getParentAxisPath(axisPath);
            	this.setMemberParentPath(axis.index,axisPathStr,allParent);
            	for(var j=0; j<allParent.length;j++){
            		var parent = allParent[j];
            		if( this.getMemberSelectorStatus(axis.index, parent) !== undefined){
            			var parentStatus = this.getParentStatus(axis,parent);
            			this.setMemberSelectorStatus(axis.index,parent,parentStatus);
            			// check box not partially selected then do selection to its descendants 
            			if(parentStatus!=2){
            				// now parent got either selected or unselected do same thing for its descendants
            			   this.selectDescendant(axis,parent,parentStatus);
            			 }
            			// select current axispath parent
            			 this.selectAncestor(axis,parent,parentStatus);
            			
            		}
            	}
            	
            },
            /**
             * Select all row based on current selection ( current rowpath + newStatus) 
             * 
             * */
            doRowSelection:function(rowpath, newStatus){  
            	// for row  axis should to side axis
            	var sideAxis = this.getSideAxisView();
            	var retVal =[];
            	// First select all descendants based on current status
            	this.selectDescendant(sideAxis,rowpath,newStatus,retVal);
            	for(var i=retVal.length-1; i>=0; i--){
            		// select ansector of selected descendants
            		this.selectAncestor(sideAxis,retVal[i],newStatus); 
            	}
            	var that = this;
            	// Do iteration to find change the checkbox status in UI
            	$(this._pivotselectorNode[0]).find("div").each(function(){
            		var rowSelPath = $(this).attr("rowselpath");
            		//pivotlog(rowSelPath);
            		var status = that.getMemberSelectorStatus(0,rowSelPath);
            		$(this).find(".pivotRowSelector").attr("chbox",status);
            		//Status-2 indicates all the childs are not selected for the parent.This value is 
            		//determined by MDAP internally.
            		if(status=="2")	{
            			$(this).find(".pivotRowSelector").prop("indeterminate",true);
            			$(this).find(".pivotRowSelector").prop("checked",true); 
            			}
            		else if (status=="1"){
            			$(this).find(".pivotRowSelector").prop("indeterminate",false);
            			$(this).find(".pivotRowSelector").prop("checked",true);  
            		}
            		else if(status=="0"){
            			$(this).find(".pivotRowSelector").prop("indeterminate",false);
            			$(this).find(".pivotRowSelector").prop("checked",false);
            		}		
            	});
            },
             /**
             * Select all col based on current selection ( current col path + newStatus) 
             * 
             * */
            doColSelection:function(colpath, newStatus){
            	// for column axis should to top axis
            	var topAxis = this.getTopAxisView();
            	var retVal =[];
            	this.selectDescendant(topAxis,colpath,newStatus,retVal);
            	for(var i=retVal.length-1; i>=0; i--){
            		this.selectAncestor(topAxis,retVal[i],newStatus); 
            	}
            	// Find all the members whichever has checkbox, Iterate each checkbox 
            	// Get the status from the memberSelector store. add it to UI
            	var topMem = this.getAvailableMember(topAxis.index);
            	var $colSelector = this.$_header.find("div.dhx_hs_center"); 
            	for(var i=0; i<topMem.length; i++){
            		var $col = $colSelector.find("div[colpath='"+topMem[i]+"']").find("input.pivotColumnSelector");
            		//this.setColSelectorStatus(childAxisPath[i], newStatus);
            		if($col.length > 0){
            			var status = this.getMemberSelectorStatus(topAxis.index,topMem[i]);        		
            			$col.attr("chbox",status);
            			//Status-2 indicates all the childs are not selected for the parent.This value is 
                		//determined by MDAP internally.
            			if(status=="2")	{
                			$col.prop("indeterminate",true);        			
                			}
                		else if (status=="1"){
                			$col.prop("indeterminate",false);
                			$col.prop("checked",true);  
                		}
                		else if(status=="0"){
                			$col.prop("indeterminate",false);
                			$col.prop("checked",false);  
                		}
            		}
            	}
            	
                        	
            },
            /**
             * Check it has row selection. IF only measure is in side axis view then no need to show row selection
             * */
            hasRowSelector:function(){
            	var hasRowSelector = false;
            	if(this.hasMemberSelector()){           		
            		if( this.getSideVisibleFacets().length == 0){
            			hasRowSelector = false;
            		}else{
            			hasRowSelector = true;
            		}                     		
            	}           	
            	return hasRowSelector;
            },
            /**
             * Check it has column selection. IF only measure is in top axis view then no need to show col selection
             * */
            hasColumnSelector:function(){
            	var hasColSelector = false;            	
            	if(this.hasMemberSelector()){           		
            		if( this.getTopVisibleFacets().length == 0){
            			hasColSelector = false;
            		}else{
            			hasColSelector = true;
            		}                     		
            	}           	
            	return hasColSelector;
            },
            /**
             * Utility method to identify the change of status. suppose user clicked on unselect box, we have to make it as select.
             * Based on status  
             * 	0-unselect 
             * 	1-select 
             * 	2-partial select
             * */
            getChangedStatus:function(status){
            	var code = parseInt(status);
            	var output =0;
            	switch(code){
            	case 0:
            		output =1;
            		break;
            	case 1:
            		 output =0;
            		 break;
            	case 2:
            		 output =1;
            		 break;
            	default:
            		output =0;
            	}
            	
            	return output ;
            },
            /**
             * Current status will get based on availability of members on UI
             * */
            getCurrentStatus : function(axisIndex,paths){
            	var memberSelector = this.getMemberSelector(axisIndex);
            	var memStatus ="";
            	for(var i=0; i<paths.length; i++){
            		if(memberSelector[paths[i]])            		
            		   memStatus+= memberSelector[paths[i]].status;
            	}
               var curStatus =0;

              	if(memStatus.indexOf("1")>=0 ){
              		curStatus=1;
              	}else if(memStatus.indexOf("0")>=0 || memStatus.length == 0){
              		curStatus=0;
              	}else if(memStatus.indexOf("2")>=0){
              		curStatus=2;
              	}
            	return curStatus ;
            },
            /**
             * Get the status of current Axispath, if current  axispath is considered to be parent. 
             *  Get current axispath  all children the check all members got selected. if all got selected then show as selected 
             *  if all got unselected then show as unselected. if any one selected others not then make it as partial 
             * */
            getParentStatus : function(axis,parentAxisPath){
            	var axisPath = new _pns.axisPath(parentAxisPath);           	
            	var allChildren = axis.getAllChildren(this,axisPath);
            	var len = Object.keys(allChildren).length;
            	var memStatus = "" ,count=0;
            	for(var i=1; i<=len; i++){
            		var child = allChildren[i];
            		var status = this.getAggrMemberStatus(axis,child);
            	    count += status;
            		memStatus +=status ;
            		
            	}
            	
            	var curStatus =0;

              	if(memStatus.indexOf("1")>=0 ){
              		curStatus=1;
                }else if(memStatus.indexOf("2")>=0){              	
              		curStatus=2;                	
              	}
              	                           	
            	return curStatus;
            },
            /**
             * This function internally called by getParentStatus . do aggregation for all children member status.
             * To decide parent status , we need to do some aggregation on all children status.
             * */
            getAggrMemberStatus : function(axis,paths){
            	var memberSelector = this.getMemberSelector(axis.index);
            	var msrId = this._getVisibleMeasuresIds()[0];
            	var msrStr = "";
            	var pull = this.data.pull;            	
            	//rowIdx will be the center row of the view port. yr[0] --> Starting row of pivot in view port. yr[1] --> ending row of pivot in view port.
            	// As center row have the expanded values, able to get the status of the cell.
            	if(axis.index == 1){
                    var yr=this._get_y_range(false);
                    var rowIdx=Math.floor((yr[0]+yr[1])/2);
                    pull = pull[this.data.order[rowIdx]];
            	}            	
            	if( (axis.index == 1 && this.areMeasuresOnTop()) ||
            		(axis.index == 0 && this.areMeasuresOnTop() == false)){
            		 msrStr = _pns.Constants.measurePathSeperator + msrId;
            	}           	            	
            	//var pull = this.data.pull[descendantAxisPath[i]+msrStr];
            	//this.areMeasuresOnTop() && axis.index == 1;
            	var memStatus = "";
            	for(var i=0; i<paths.length; i++){
            		if(pull[paths[i]+msrStr])
            		   memStatus+=memberSelector[paths[i]].status;            		
            	}
            	
              	var output =0;

              	if(memStatus.indexOf("2")>=0 || (memStatus.indexOf("1")>=0 && memStatus.indexOf("0")>=0)){
              		output=2;
              	}else if(memStatus.indexOf("1")>=0){
              		output=1;
              	}else if(memStatus.length==0){
              		output=3;
              	}
            	return output ;
            },
            /**
             * utility function to check current column/ row is checkbox related column
             * */
            hasMemberSelectorCSS:function($target){
            	if($target.hasClass("pivotColumnSelector") ||
            		$target.hasClass("columnselector") ||
            			$target.hasClass("pivotRowSelector")){
                	return true;
                }
            	return false;
            },
            /**
             * Get member selector store for given axis. for side or top axis seperate map is maintained
             */
            getMemberSelector : function(axis){            	
            	return this.data.memberSelector[axis];
            },
            setMemberParentPath :function(axis,path,parent){
            	var sel = this.getMemberSelector(axis)[path];
            	if(sel!=undefined){
            		sel.parent=parent;
            	}
            },
            /**
             * Set the member selector status for given axis, path, status
             * */
            setMemberSelectorStatus: function(axisIndex,path,status,parentPath){
            	var memSel = this.getMemberSelector(axisIndex)[path];// = status;
            	if( memSel!=undefined){
            		memSel.status = status;
	            	if(parentPath!=undefined){
	            		memSel.parent = parentPath;
	            	}
            	}
            },
            /**
             * Get all the members axispath available on data store for given axis
             **/
            getAvailableMember:function(axis){
            	var memSel = this.getMemberSelector(axis);
            	var members = _.keys(memSel);
            	return members;
            },
            /**
             *  If need to set same status to array of axis paths. then call setAllStatus will do it for you 
             */
            setAllStatus : function(axisIndex,paths,status){
            	for (index in paths){
            		this.setMemberSelectorStatus(axisIndex,paths[index],status);
            	}
            },
            /**
             *  used to get the status for current axispath.
             * */
            getMemberSelectorStatus:function(axis,path){
            	var isArray = _.isArray(path);
            	if(isArray){
            		return this.getCurrentStatus(axis,path);
            	}
            	var axisPath = this.getMemberSelector(axis)[path];
            	if (axisPath != undefined){
            		return axisPath.status;
            	}
            	return axisPath;
            },
            /**
             * Get selected member axispath for either top/side axis based on axis index.
             * */
            getSelectedMemberAxisPath:function(axisIndex){
            	var rowpaths = this.getMemberSelector(axisIndex);
            	var keys=[];
            	_.each( rowpaths, function( val, key ) {
            		  	if ( val.status == 1 ) {
            			    keys.push(key);
            			  }
            	});
            	var axisPath = [];
            	 _.each(keys,function(value,index){
	            		var obj = rowpaths[value];
	            		var parent = obj.parent;
	            		if( parent!== undefined && parent.length > 0){
	            			
	            			var foundPath =_.find(keys,function(val){
	            				 var hasParent =false; 
	            				 for(var parentIndex=0; parentIndex<parent.length; parentIndex++){
	            					  hasParent = parent[parentIndex] === val;
	            					  if(hasParent){
	            						  return hasParent;
	            					  }
	            				  }
	            				  return hasParent;
	            			});
	            			if(!foundPath){
	            				axisPath.push(new _pns.axisPath(value));
	            			}
	            			
	            		}else{
	            			axisPath.push(new _pns.axisPath(value));
	            		}            		
            	});
            	return axisPath;
            },
            /**
             * Condensed AxisPath is requried when sending expand pivot request object.
             * */
            getCondensedAxisPath:function(paths){
            	var retVal=[];
            	if(paths.length>0){
            		
            		for(var i=0; i<paths.length; i++){
            			retVal.push(_pns.axisPath.getCondensedAxisPath(paths[i],false));
            		}
            	}
            	return retVal;
            },
            /**
             * Add new header section for column
             * */
            addRowSelectionHeader:function(rootElement){
              
            	    var tbodyElem = rootElement.querySelector("tbody");
	            	var rowElements = tbodyElem.childNodes;
	            	
	            	if(this.hasRowSelector()){
	            		var rowEleHead = rootElement.querySelector("thead").firstChild;
		            	 //for table head
		            	var thElem= document.createElement("th");
		            	thElem.style.cssText = "width:20px;height:0px;";
		            	thElem.setAttribute('column', '-1');
		            	thElem.className='';          	
		            	rowEleHead.insertBefore( thElem, rowEleHead.firstChild );
		            	// for table body
		            	for(var i=0; i<rowElements.length;i++){
			            	var tdElem= document.createElement("TD");
			            	tdElem.style.cssText = "width:20px;";
			            	tdElem.setAttribute('column', '-1');
			            	tdElem.className='pivotRowSelectorHeader';
			            	tdElem.innerHTML='';
			            	rowElements[i].insertBefore( tdElem, rowElements[i].firstChild );
		            	}
	            	}
	            	if(this.hasColumnSelector()){
		            	// create empty header for table body
		            	var headerRow =  document.createElement("tr");
		            	headerRow.style.cssText='height:32px;';
		            	//Provided fix for MDAP-1509 : Seeing white space in Header of the Pivot.
		            	var length = rowElements.length;
		            	for(var j=0; j<rowElements[length-1].childNodes.length;j++){
		            		var tdElem= document.createElement("TD");
		            		headerRow.appendChild(tdElem);
		            	}
		            	tbodyElem.insertBefore(headerRow,rowElements[0]);
	            	}
            },
            _render_subheader : function(start, end, width, name,isAttr) {
                var html = "";
                var docfrag = document.createDocumentFragment();
                var topVisibleFacets = this.getTopAxisView().getVisibleFacets();
                var topAxisFacetCount = topVisibleFacets.length;
                var tableElement = null;
                var tableParent = docfrag;
                var i, j = 0;
                if (this._getRightSplit() === start){
                    return docfrag;
                }
                /*
                 * We need to wrap it in a div if it's the upper left header This is because we can do a
                 * resizable on a table.
                 */
                if (!start){
                    var tableWrapper = document.createElement("div");
                    tableWrapper.className = "sideFacetsHeaderWrapper headerTable";
                    docfrag.appendChild(tableWrapper);
                    tableParent = tableWrapper;
                }

                if (start == end)
                    return docfrag;
                var measureOnTop = this.areMeasuresOnTop();
                var count = topAxisFacetCount + (measureOnTop ? 1 : 0);
                if (count == 1 && start === 0){
                    count++;
                }

                var tblId = [ 'leftHdrTable', 'centerHdrTable','attrHdrTable' ];
                tableElement = document.createElement("table");
                tableParent.appendChild(tableElement);
                tableElement.id = (start === 0 ? tblId[0] : isAttr ? tblId[2] : tblId[1]);
                tableElement.style.cssText = "width:" + width + "px;";
                tableElement.cellspacing = "0";
                tableElement.cellpadding = "0";
                var tableHeight = this._settings.rowHeight * count;
                var headElement = document.createElement("thead");
                var rowElement = document.createElement("tr");
                tableElement.appendChild(headElement);
                headElement.appendChild(rowElement);
                rowElement.style.cssText = 'height:0px;';
                for (i = start; i < end; i++){
                    var headerElement = document.createElement("th");
                    headerElement.style.cssText = "width:" + (this._columns[i].width) + "px;height:0px;";
                    rowElement.appendChild(headerElement);
                }
                if (start === 0){
                    tableElement.appendChild(this.getNewTopAxisFacetsHeaders());
                    this.addRowSelectionHeader(tableElement);
                }
                else{
                    var setWidth = false;

                    var sortOrder = this._getCubeDefinition().topAxis.sortOrder;
                    var sortPath =
                        sortOrder ? (this.areMeasuresOnTop() ? new _pns.axisPath(sortOrder.axisPath,
                            sortOrder.measureId) : sortOrder.axisPath) : null;

                    for (j = 0; j < count; j++){
                        var facetId = "";
                        var facetName = "";
                        var measureLevel = false;
                        
                        var canAddTopAxisSelector = (j == topAxisFacetCount-1) && this.hasMemberSelector();
                        var topAxisSelectorElement = canAddTopAxisSelector ?  document.createElement("tr") : undefined;
                        if ((start !== 0) && (!isAttr) &&(j < topAxisFacetCount)){
                            facetId = topVisibleFacets[j].id;
                            facetName = topVisibleFacets[j].getIDName();
                        }
                        var axisPathIndex = this.getTopAxisView().getAxisPathIndexFromVisibleIndex(j);
                        if (facetId){
                            axisPathIndex = this.getTopAxisView().getAxisPathIndexFromVisibleIndex(j);
                        }
                        else{
                            measureLevel = true;
                        }

                        /*
                         * If we're in the data section of the columns, let's first create an array of values
                         * that have the same parents
                         */
                        var parentValueMapping = null;
                        var sibilingIndex = -1;
                        if (start !== 0 && !isAttr){
                            parentValueMapping = [];
                            for (i = start; i < end; i++){
                                parentValueMapping[i] = parentValueMapping[i] ? parentValueMapping[i] : {};
                                parentValueMapping[i].count = 1;
                                if (sibilingIndex == -1){
                                    sibilingIndex = i;
                                }
                                else{
                                    var thisNodes = this._settings.columns[i].dataNodes;
                                    var nodesLength = thisNodes.length;
                                    var sibilingNodes = this._settings.columns[sibilingIndex].dataNodes;
                                    var columnAxisPath = thisNodes[nodesLength - 1].axisPath;
                                    var isLocalSortColumn =
                                        columnAxisPath && this._isSortColumn(columnAxisPath);
                                    
                                    if (((measureLevel && (thisNodes[nodesLength - 1].name == sibilingNodes[nodesLength - 1].name)) 
                                    		&& (this.getMeasure(thisNodes[nodesLength - 1].id) && !this.getMeasure(thisNodes[nodesLength - 1].id).hasChildren)) ||
                                        (!measureLevel &&
                                            this._areValuesSameParents(thisNodes[axisPathIndex],
                                                sibilingNodes[axisPathIndex], axisPathIndex) && (thisNodes[axisPathIndex].name == sibilingNodes[axisPathIndex].name)))
                                    {
                                        parentValueMapping[sibilingIndex] =
                                            parentValueMapping[sibilingIndex] ? parentValueMapping[sibilingIndex] : {
                                                count : 0
                                            };
                                        parentValueMapping[i] =
                                            parentValueMapping[i] ? parentValueMapping[i] : {
                                                count : 0
                                            };
                                        parentValueMapping[sibilingIndex].count++;
                                        parentValueMapping[sibilingIndex].sortedContent =
                                            parentValueMapping[sibilingIndex].sortedContent ||
                                            parentValueMapping[i].sortedContent ||
                                            isLocalSortColumn;
                                        parentValueMapping[i].count = 0;
                                    }
                                    else{
                                        sibilingIndex = i;
                                    }
                                }
                            }
                        }
                        var rowElement = null;
                        var $rowElement = null;
                        var rowHtml = "";
                        var foundCols = false;
                        rowElement = document.createElement("tr");
                        $rowElement = $(rowElement);
                        var facetClass = "";
                        if (facetName){
                            facetClass = "topFacetRow " + _pns.Constants.facetNamePrefix + "-" + facetName;
                        }
                        rowElement.className = "pivotHdrRow " + facetClass;
                        rowElement.id = _pns.Constants.hdrPrefix + _pns.Constants.facetIdPrefix + facetId;
                        $rowElement.data("facetData", {
                            id : facetId,
                            visibleIndex : j,
                            index : this.getTopAxisView().getFacetIndexFromId(facetId)
                        });
                        tableElement.appendChild(rowElement);
                        if(isAttr && j !== count-1){
                            var emptyColWidth=0,colspan=0;
                            //var emptyColHeight=0;
                            for (i = start; i < end; i++){
                                emptyColWidth += this._columns[i].width + 2;
                                colspan+=1;
                                //emptyColHeight = $(this._columns[i].node).height();
                            }
                            var $attr_emptyRow = $("<td colspan='"+colspan+"' class='attr_emptyRow fillerCell' style='width:"+emptyColWidth+"px;'>&nbsp;</td>");
                            //$attr_emptyRow.height(this._rowHeight+1);
                            $attr_emptyRow.appendTo($rowElement);


                            continue;
                        }
                        for (i = start; i < end; i++){
                            var colWidth = -1;
                            if (!setWidth){
                                colWidth = this._columns[i].width + 2;
                            }
                            column = this._columns[i];
                            var header = (typeof column[name] == "string") ? column[name] : column[name][j];
                            if (i < end - 1){
                                nextHeader = this._columns[i + 1].header[j] || this._columns[i + 1].header[j];

                            }
                            else{
                                nextHeader = null;
                            }
                            axisPath = column.axisPath;
                            dataNodes = column.dataNodes;
                            if (!header){
                                // how could this happen?
                                header = {
                                    text : ""
                                };
                                // continue;
                            }
                            var isMeasure = header.isMeasure ? true : false;
                            // First <TD> . Lets add the <TR> first
                            var facetClass = "";
                            if (facetName){
                                facetClass = "topFacetRow " + _pns.Constants.facetNamePrefix + "-" + facetName;
                            }

                            isEmptyValue = false;

                            if (header.content){
                                header.contentId = headers.contentId || dhtmlx.uid();
                                header.columnId = this._columns[i].id;

                                dhtmlx.assert(this.headerContent[headers.content], "Unknown content type: " +
                                    header.content);

                                header.text = this.headerContent[headers.content].render.call(this, headers);
                                this._active_headers[headers.contentId] = headers;
                                this._has_active_headers = true;
                            }

                            // We are over a measure row if the measures are
                            // on top, we're NOT in the left section and
                            // we're at the lowest row of the header
                            var isMeasureRow = this.areMeasuresOnTop() && start && (j == topAxisFacetCount);
                            var colsElement =
                                this._render_header_cell(i, j, start, end, isMeasureRow,
                                    parentValueMapping, colWidth);
                            if (colsElement.setAttribute){
                                colsElement.setAttribute('column', i);
                            }
                            this._addResizeHandlers(colsElement);
                            colsElement.colspan = 1;
                            if (colsElement){
                                rowElement.appendChild(colsElement);
                                if(topAxisSelectorElement){
                                	  	var cloneEle = colsElement.cloneNode(true);
                                	var $cloneEle = $(cloneEle);
                                	var colPath = $cloneEle.find('.dhx_hcell').attr('id').replace('hdr_','');
                                	colPath = colPath.indexOf(_pns.Constants.measurePathSeperator) >=0 ? colPath.slice(0,colPath.indexOf(_pns.Constants.measurePathSeperator)) :colPath;
                                	var colStatus = this.getMemberSelectorStatus(1,colPath) == undefined ? 0 : this.getMemberSelectorStatus(1,colPath);
                                	//chbox_"+status+"' chbox='"+status+"
                                	var $chkbox = $('<div style="height:30px;position:relative;text-align:center;"><input class="pivotColumnSelector" style="position:relative;background:none;padding:0px;" type="checkbox" chbox="'+colStatus+'"></input></div>');
                                	$chkbox.addClass("columnselector");
                                	$chkbox.attr('colpath',colPath);
                                	$cloneEle.empty();
                                	$cloneEle.append($chkbox);
                                	cloneEle.className ='';
                                	//topAxisSelectorElement.style.cssText='height:32px;';
                                	topAxisSelectorElement.appendChild(cloneEle);
                                }
                            }
                            foundCols = true;
                        }
                        if (!setWidth){
                            if (start !== 0){
                                setWidth = true;
                            }
                        }
                        if(canAddTopAxisSelector){
                        	var trFirstElement =tableElement.firstChild.nextSibling;
                        	tableElement.insertBefore(topAxisSelectorElement, trFirstElement);
                        	//$(tableElement).prepend(topAxisSelectorElement);
                        }
                    }
                }

                return docfrag;
            },
            render : function(id, mode, details,isAttr) {
            	if(this._resizeRender)
                	return;
                this._render_initial();
                var that = this;
                if (!this._columns.length){
                    if (!this._settings.columns)
                        return;
                    this._define_structure();
                }
                var vScroll = $(this.$view).find('.dhx_vscroll_y')[0];
                if(vScroll){
                	var clientH = vScroll.clientHeight;
                    var clientS = vScroll.scrollHeight;
                    if (clientH == clientS){
                        /*
                         * Check if the UI is initialized yet
                         */
                        if (this._y_scroll === undefined)
                            return;
                        that._scrollTop = 0;
                        that._y_scroll.scrollTo(0);
                    }
                }
                if (!id || mode != "update"){
                    this._dtable_height = this._get_total_height();
                    this._set_split_sizes_y();
                }

                if (this._content_width) {
                    var isAttr = this._showAttributeArea();

                    if(mode === "structureChange"){
                        this._check_rendered_cols(true,true,isAttr,true);
                    }
                    else{
                        this._check_rendered_cols(false,true,isAttr,true);
                    }
                }
                // this._check_rendered_cols("structureChange"!=mode, true,isAttr);

              //Shift+ArrowKeys
                this.renderMultiSelected();
                if(this.isDataCopied){
                	this.copySelectedData();
                }
            },
            _set_split_sizes_x : function() {
                if (!this._columns.length)
                    return;
                if (dhx.debug_size)
                    dhtmlx.log("  - " + this.name + "@" + this._settings.id + " X sizing");
                // if attribute is enabled then body should have 4 nodes with addition of dhx_ss_attr div
             /*   var hasAttribute = this._body.childNodes.length > 3;*/
                var index = 0,
                    dataSplit=this._getFacetSplitIndex();
                var facet_width=0, facet_viewport=0;
                this._left_width = this.hasRowSelector() ? this.config.rowSelectorWidth : 0;
                this._attrMax_width=this.config.attrMaxWidth;
                this._attr_width = !this._attr_width || (this._attr_width <= this._attrMax_width && !this._isAttrResizing) ?
                        this._dtableAttr_width < this._attrMax_width ? this._dtableAttr_width : this._attrMax_width
                    : this._attr_width > this._dtableAttr_width ? this._dtableAttr_width : this._attr_width;
                this._right_width = 0;
                this._center_width = 0;

                while (index < dataSplit){
                    this._left_width += this._columns[index].width;
                    index++;
                }

                index = this._columns.length - 1;

                while (index >=this._getRightSplit()){
                    this._right_width += this._columns[index].width;
                    index--;
                }

                if (!this._content_width)
                    return;

                if (this._settings.autowidth && this.resize())
                    return;
               
                // Checking for side facet max width . If it side facet max width is defined then we need to show scroll bar for side facet region
                this.sideFacetMaxWidthReached= false;
                
                // check for facet width is number or text. proceed only if it has number
                if(_.isNumber(this.config.sideFacetMaxWidth)){
                	
                	this.canAdjustChangedCols = true;
                	
                        var sideFacetMaxWidth = Math.ceil((this._content_width  /100 ) * this.config.sideFacetMaxWidth);
                        // check for resizer width
                        if( this._left_resize_width && (this._left_resize_width < sideFacetMaxWidth) && this._left_resize_width >108) {
                        	sideFacetMaxWidth = this._left_resize_width;
                        }
                       	                        
                        if(this._left_width > sideFacetMaxWidth){
                        	this.sideFacetMaxWidthReached =true;
                        	this._left_viewport_width=facet_viewport=this._left_width;
                        	this._left_width =facet_width=sideFacetMaxWidth;   
                        	
                        }
                
                }
                
                // index to identify the child node
                var i=0;
                this._center_width =
                    this._content_width - this._right_width - this._left_width - this._attr_width - this._scrollSizeY;
                var viewportWidth =this._right_width + this._left_width +this._attr_width+ this._center_width;

                // Side width for Facet area 
                this._body.childNodes[i].style.width = this._left_width + "px";
                this._header.childNodes[i].style.width = this._left_width + "px";
                this._footer.childNodes[i].style.width = this._left_width + "px";
                this._body.childNodes[i].firstChild.style.width =  this.sideFacetMaxWidthReached ? this._left_viewport_width +"px": this._left_width+ "px";
                i+=1;

                // Set width for Attribute area 
              /*  if(hasAttribute){*/
                this._body.childNodes[i].style.width = this._attr_width + "px";
                this._header.childNodes[i].style.width = this._attr_width + "px";
                this._footer.childNodes[i].style.width = this._attr_width + "px";
                this._body.childNodes[i].firstChild.style.width = this._dtableAttr_width + "px";
                i+=1;
               /* }*/

                // Set width for data area 
                this._body.childNodes[i].style.width = this._center_width + "px";
                this._header.childNodes[i].style.width = this._center_width + "px";
                this._footer.childNodes[i].style.width = this._center_width + "px";
                this._body.childNodes[i].firstChild.style.width = this._dtable_width + "px";
                i+=1;

                // Set width for footer area
                this._body.childNodes[i].style.width = this._right_width + "px";
                this._header.childNodes[i].style.width = this._right_width + "px";
                this._footer.childNodes[i].style.width = this._right_width + "px";

                // Calculate body style
                this._body.style.width = viewportWidth;//this._right_width + this._left_width + this._attr_width + this._center_width;
                // Calculate header style             
                this._header.style.width = viewportWidth;//this._right_width + this._left_width + this._attr_width + this._center_width;

                var dataScrollWidth = this._content_width - this._scrollSizeY;
                var dataViewPortWidth =  this._dtable_width + this._left_width + this._right_width + this._attr_width;
                
                // Attribute area is available so we need to split horizontal scroll area to three. 
                // each for facet, attribute and data section
                if(this._attr_width > 0 || this.sideFacetMaxWidthReached){
                	
                	dataScrollWidth= this._center_width;
                	dataViewPortWidth = this._dtable_width;
                	 // Assigning default values to facet viewport and width
                	if(this.sideFacetMaxWidthReached === false)
                		facet_viewport=facet_width=this._left_width;
                }
                
                
                

                // set horizontal scroll position facet area
                var facetsArea = this._getFacetsArea();
                
                facetsArea.setScrollWidth(facet_width);
            	facetsArea.setViewportWidth(facet_viewport);
            	
                /*if(this.sideFacetMaxWidthReached){                     
                	facetsArea.setScrollWidth(this._left_width);
                	facetsArea.setViewportWidth(this._left_viewport_width);
                	dataScrollWidth = this._center_width;
                	dataViewPortWidth = this._dtable_width;
                	this._body.childNodes[0].firstChild.style.width = this._left_viewport_width + "px";
                	
                }else{
                	facetsArea.setScrollWidth(0);
                	facetsArea.setViewportWidth(0);
                	this._body.childNodes[0].firstChild.style.width = this._left_width + "px";
                }*/
               
                // set horizontal scroll position attribute area
                var attributesArea = this._getAttributesArea();
                if(!attributesArea.getScroll()){
                    attributesArea.setScroll(this._dtableAttr_width,this._scrollSizeX);
                }
                attributesArea.setScrollWidth(this._attr_width);
                attributesArea.setViewportWidth(this._dtableAttr_width);
              
                // Set horizontal scroll position for data area
                var dataArea = this._getDataArea();
                dataArea.setScrollWidth(dataScrollWidth);
                dataArea.setViewportWidth(dataViewPortWidth);

                
            },
            _set_split_sizes_y : function() {
            	if(this._y_scroll){
	                if (!this._columns.length || isNaN(this._content_height * 1))
	                    return;
	
	                var wanted_height =
	                    this._dtable_height + this._header_height + this._footer_height +
	                    (this._scrollSizeX ? this._scrollSizeX : 0);
	                if (this._settings.autoheight && this.resize())
	                    return;
	
	                this._y_scroll.sizeTo(this._content_height);
	//                        console.log('wanted_height=%o _content_height=%o   _scrollSizeX=%o   _header_height=%o  _footer_height=%o ',wanted_height,this._content_height,this._scrollSizeX,this._header_height,this._footer_height);
	                this._y_scroll.define("scrollHeight", wanted_height);
	                var height =
	                    this._content_height - this._scrollSizeX - this._header_height - this._footer_height;
	//                                console.log('_dtable_height=%o  height=%o   _content_height=%o   _scrollSizeX=%o   _header_height=%o  _footer_height=%o ',this._dtable_height,height,this._content_height,this._scrollSizeX,this._header_height,this._footer_height);
	                for ( var i = 0, j=this._body.childNodes.length; i < j; i++){
	                    this._body.childNodes[i].style.height = height + "px";
	                    if (this._settings.prerender)
	                        this._body.childNodes[i].firstChild.style.height = this._dtable_height + "px";
	                    else
	                        this._body.childNodes[i].firstChild.style.height = height + "px";
	                }
                
            	}
            },
            /**
             * Setting Margin-top for each top facet member to be visible on left while doing horizontal scrolling 
             */
            _setFloatingMemberHorizontal:function(){
            	// Get the side facet complete width . this will be the starting left position for topfacet
            	var sideFacetLeft = $(this._header.childNodes[0]).width();
            	var $colHeader = $(this._header.childNodes[2]).find(".topFacetRow");
            	
            	$colHeader.each(function(){
            		var that =this;
            		// make all children under <tr> to margin-left 0. This will help to reset back to orginal position
            		$(that).find(".dhx_hcell").css("margin-left",0);
            		
            		$(that).children().each(function(){
            			 var outerWidth=$(this).outerWidth();
            			 var leftPos=$(this).position().left;
            			 // Get the left position of <td> element and check whether it is fully visible or not 
            			 //if left position is -ve value then it this element has been reached  beyond side facet left .So this case we need to add with side facet left
                		if(leftPos <0){
                				leftPos = Math.abs(leftPos)+sideFacetLeft; 
                     	}else{
                     			leftPos = sideFacetLeft-leftPos;
                     	}
            			 // Check for <td> element scrolled (hidden) or visible on viewport
            			 if(leftPos<outerWidth){
            				 $(this).find(".dhx_hcell").css("margin-left",leftPos);
            				 return false;
            			 }
            			
            			
            		});
            	});
            },
            /**
             * freeze the measure header during horizontal scrolling on side facet area 
             */
            doFreezeMeasureHeader:function(){         
            	 if( (this.areMeasuresOnTop() == false) && this.sideFacetMaxWidthReached && this._isMsrScrollValid){
                    	var $leftHeader = this.$_header.find(".dhx_hs_left ").find("td.topFacet");
            			$leftHeader.find("div.pivotColumnResizer").hide();
            			$leftHeader.css("position","absolute").css("left",this._left_freezeMsrCol+this._sideFacetScrollLeft);
            			
            	 }
            },
            /**
             * freeze the measure column during horizontal scrolling on side facet area activated
             */
            doFreezeMeasureColumn:function(){
            	pivotlog("freezing measure column");
            	// Freezing is eligible when measure cols on side and side facet scroll has to be activated
                if( (this.areMeasuresOnTop() == false) && this.sideFacetMaxWidthReached){
        	   		var $leftPanelParent = this.$leftPanelScroll.parent();
            		var $measureCol = this.$leftPanelScroll.find(".dhx_last");
            		var msrColLeftPos =$measureCol.position().left;
            		var $leftHeader = this.$_header.find(".dhx_hs_left");
            		this._isMsrScrollValid =false;
            		if(this.canFreezeMeasureColumn($measureCol)){
            			this._isMsrScrollValid =true;
            			// In order to freeze the measure column. we have to fix the left position  for measure column
            			// Detach the side measure col from dhx_ss_center_scroll 
            			// Move to new wrapper dhx_ss_center_msr_scroll . This new wrapper will be fixed on right of side facet
            			$measureCol.detach();
            			// Freezing measure header
            			$leftHeader.find("td.topFacet > div.pivotColumnResizer").hide();
            			var leftParentWidth = $leftPanelParent.width();
            			var scrolledWidth= (this._left_viewport_width  - this._left_width);
            			//this._left_freezeMsrCol =0;
            			if(msrColLeftPos>scrolledWidth)
            				this._left_freezeMsrCol =  msrColLeftPos - scrolledWidth; 
            			$leftHeader.find("td.topFacet").css("position","absolute").css("left",this._left_freezeMsrCol+this._sideFacetScrollLeft);
            			// Freezing measure column 
            			// Wrapper is required in order to scroll top position sync  with other scroll top position body and left 
        				$msrScroll =$('<div></div>').addClass("dhx_ss_center_msr_scroll");
        				$msrScroll.css("left",leftParentWidth -$measureCol.width());
        				$msrScroll.width($measureCol.width()).height($leftPanelParent.height());
        				// set left position to zero. As our msr wrapper has its left position
        				$measureCol.css("left",0);
        				$msrScroll.append($measureCol);
        				$leftPanelParent.append($msrScroll);
            			
            		}                      		
                }
            	
            },
            /**
             * Check can measure column is eligible
             */
            canFreezeMeasureColumn : function($measureCol){
            	
            	if($measureCol.length>0 && $measureCol.hasClass("dhx_first") === false){
            		var msrColWidth = $measureCol.innerWidth();
            		var diff = this._left_width - msrColWidth;
            		
            		if(diff > 100){
            			return true;
            		}
            		
            	}
            	
            	return false;
            },
            /**
             * Setting Margin-top for each side facet member to be visible on top while doing vertical scrolling 
             */
            _setFloatingMemberVertical:function(){
            	var leftSplit =this._getFacetSplitIndex();
            	// Iterate the columns from 0 to leftspilt. if measures were on side then remove one column because that will be part of floating member
            	var sideFacetsLength = this.areMeasuresOnTop() ? leftSplit : leftSplit -1;
            	for (var i = 0; i < sideFacetsLength; i++){
            		// Iterate each column to get col node
            		 var col = this._columns[i];
            		 var $parentScroll = $(col.node);
            		 // Get complete column top position 
            		 var parentTop =Math.abs($parentScroll.position().top);
            		 // Iterate each div inside column div
            		 $(col.node).children().each(function(){
            			 // Get top position for current div
            			 var offset=$(this).position();
            			 var outerHeight=$(this).outerHeight();
            			 var height=$(this).height();
            			 var $facetMember= $(this).find(".facetMemberName");
            			 // To know how much postion element is moved top. add top position to height.
            			 // so that we know complete position it moved from parent
            			 outerHeight += offset.top;
            			 if(parentTop >offset.top && parentTop < outerHeight){
            				 // Div element which are not first child of column will come here
             				$facetMember.css("margin-top",parentTop-offset.top);
             				return false;
             			}
            			 else if(height > parentTop ){
            				 // Div element which first child of column will come here
            				$facetMember.css("margin-top",parentTop);
            				return false;
            			}
            			
            		 });
                }
            },
            
            /**
             * Render data area columns
             */
            _render_data_area:function(xr,yr,rangeRender,force){
                pivotlog("<------- Render Data Area ----->");
                var colLen = this._columns.length;
                var i=0;
                
                var areasDomElementes = this._body.childNodes;
                var preCleanScrollTops = [];
                for (var iArea=0;iArea<areasDomElementes.length;iArea++) {                	
                	preCleanScrollTops.push(areasDomElementes[iArea].firstChild ? this._body.childNodes[iArea].firstChild.scrollTop :0);
                }
                areasDomElementes[2].scrollLeft=xr.scrollLeft;
                this._header.childNodes[2].scrollLeft = xr.scrollLeft;
              
                var $centerlPanelParent = this.$centerPanelScroll.parent();
                var docfrag = document.createDocumentFragment();
                var centerPanelScroll = this.$centerPanelScroll[0];
                docfrag.appendChild(this.$centerPanelScroll[0]);
                
                var toBeRemovedIdx = [];
                for (i = xr[0];/*this._getLeftSplit();*/ i <this._getRightSplit(); i++){
                    toBeRemovedIdx.push(i);
                }
               
                this._hideColumns(toBeRemovedIdx,centerPanelScroll,true);

                /*var startCol=Math.min(xr[0], xr[1]);
                var endCol=Math.min(Math.max(xr[0], xr[1]), this._settings.columns.length - 1); 
                for (i =startCol; i <= endCol; i++)
                {*/

                for (i = xr[0]; i <= rangeRender.xr[1] && i < colLen; i++){
                    this._columns[i].attached = null;
                    this._renderColumn(i, rangeRender.yr, force);
                }   
                $centerlPanelParent[0].appendChild(docfrag);
                //We are calling below function from _onscroll_x.
                 //this._setFloatingMemberHorizontal();
                
               /* for (var iArea=0;iArea<areasDomElementes.length;iArea++) {
                	this._body.childNodes[iArea].firstChild.scrollTop=preCleanScrollTops[iArea];
                }*/
            },
            /**
             * Render facet area columns
             */
            _render_sideFacet_area:function(xr,yr,rangeRender,force){

                pivotlog("<------- Render Side Facet Area ----->");
                var colLen = this._columns.length;
                var i=0;
                var toBeRemovedIdx = [];
                var preCleanScrollTops = [];
                var areasDomElementes = this._body.childNodes;
                for (var iArea=0;iArea<areasDomElementes.length;iArea++) {
                	preCleanScrollTops.push(this._body.childNodes[iArea].firstChild.scrollTop);
                }
                var $leftPanelParent = this.$leftPanelScroll.parent();
                var docfrag = document.createDocumentFragment();
				var leftPanelScroll = this.$leftPanelScroll[0];
							
                // Checking for msr freeze column wrapper is found or not. 
              	 // if it is available we have to remove it for further proceeding
              	 var $leftMsrPanelParent = $leftPanelParent.find(".dhx_ss_center_msr_scroll");
              	 if($leftMsrPanelParent.length > 0){
              		$leftMsrPanelParent.remove();
              	 }
				 docfrag.appendChild(leftPanelScroll);
              	 
                for (i = 0; i <xr[0]; i++){
                    toBeRemovedIdx.push(i);
                }

                
                this._hideColumns(toBeRemovedIdx,this.$leftPanelScroll[0],true);


                for (i = 0; i < this._getFacetSplitIndex() && i < colLen; i++){
                    this._columns[i].attached = null;
                    this._renderColumn(i, rangeRender.yr, force);
                }

                $leftPanelParent[0].appendChild(docfrag);
                areasDomElementes = this._body.childNodes;
                /*for (var iArea=0;iArea<areasDomElementes.length;iArea++) {
                	this._body.childNodes[iArea].firstChild.scrollTop=preCleanScrollTops[iArea];
                }            */

                // Freeze the measure column. If it required
                // Generally it happend when side facet has separate horizontal scrollbar
                this.doFreezeMeasureColumn();
                if (this.showEllipsisOnMemberName()){
                    this.setWrapTextHeight();
                }
            },
            setWrapTextHeight:function () {
                $(".pivot_member_name_wrap_text").each(function(){
                    var parentHeight = $(this).closest(".sideFacetMemberContainer").height();
                    var parentWidth = $(this).closest(".sideFacetMemberContainer").width();
                    var currentSpanHeight = $(this).height();
                    if(currentSpanHeight > (parentHeight + 1)){
                        $(this).height(parentHeight);
                        $(this).closest(".facetMemberName").height(parentHeight-24);
                        var facetMemberEllipsisDiv = $(this).parent().siblings(".facetMemberEllipsisDiv");
                        facetMemberEllipsisDiv.css("display", "block").css("margin-left", (parentWidth-20)+"px");
                    }
                });
            },

            /**
             * Render Attribute area columns
             *
             */
            _render_attribute_area:function(yr,force){

            if(this._hasAttributeArea()){
                var xr =  this._get_attr_x_range(this._settings.prerender);
                //var yr = this._get_y_range(this._settings.prerender === true);
                var rangeRender = this._getRefreshRange(yr, xr, true,true);


                //var colLen = this._columns.length;
                var i=0;
                var toBeRemovedIdx = [];
                var $attrPanelParent = this.$attrPanelScroll.parent();

                for (i = xr[0]; i <this._getDataSplitIdx(); i++){
                    toBeRemovedIdx.push(i);
                }

                var preCleanScrollTops = [];
                var areasDomElementes = this._body.childNodes;
                for (var iArea=0;iArea<areasDomElementes.length;iArea++) {
                	preCleanScrollTops.push(this._body.childNodes[iArea].firstChild.scrollTop);
                }
                this._hideColumns(toBeRemovedIdx);


                var attrDocFrag =document.createDocumentFragment();
                attrDocFrag.appendChild(this.$attrPanelScroll[0]);

                for (i = xr[0]; i < xr[1]; i++){
                    this._columns[i].attached = null;
                    this._renderColumn(i, rangeRender.yr, force);
                }

                $attrPanelParent[0].appendChild(attrDocFrag);

                this._body.childNodes[1].scrollLeft=xr.scrollLeft;
                areasDomElementes = this._body.childNodes;
               /* for (var iArea=0;iArea<areasDomElementes.length;iArea++) {
                	this._body.childNodes[iArea].firstChild.scrollTop=preCleanScrollTops[iArea];
                }     */
                
              }
            },

            /**
             * Check For Rendering columns on function
             */
            _check_rendered_cols : function(rendersideFacetArea,renderDataArea,renderAttrArea,force) {
                pivotlog("#################### RENDERING STARTS #####################");
                var that = this;
                //var i=0;
                if (!this._columns.length)
                    return;

                /*if (force)
                 this._clearColumnCache();*/

                /*if (dhx.debug_render)
                    pivotlog("Render: " + this.name + "@" + this._settings.id);*/

                var xr = this._get_x_range(this._settings.prerender);
                var yr = this._get_y_range(this._settings.prerender === true);
                var rangeRender = this._getRefreshRange(yr, xr, true);
                /*if(this.canOverrideRange()){
                	this._renderToSelectedCell(xr,yr,rangeRender);
                }*/
                //pivotlog("_check_rendered_cols rangeRender %o",rangeRender);
                //var toBeRemovedIdx = [];
                if (!force && _.isEqual(rangeRender, this._lastRangeRender))
                {
                	return;
                }
                if (yr[1] == 0){
                    yr = this._get_y_range(true, 60);
                }
                if(rendersideFacetArea){
                    this._render_sideFacet_area(xr,yr,rangeRender,force);
                    if(this.hasMemberSelector()){
	                    $(this._pivotselectorNode[0]).find("div").each(function(){
	                		var rowSelPath = $(this).attr("rowselpath");
	                		//pivotlog(rowSelPath);
	                		//Status-2 indicates all the childs are not selected for the parent.This value is 
	                		//determined by MDAP internally.
	                		var status = that.getMemberSelectorStatus(0,rowSelPath);
	                		$(this).find(".pivotRowSelector").attr("chbox",status);
	                		
	                		if(status=="2")	{
	                			$(this).find(".pivotRowSelector").prop("indeterminate",true);
	                			$(this).find(".pivotRowSelector").prop("checked",true); 
	                			}
	                		else if (status=="1"){
	                			$(this).find(".pivotRowSelector").prop("indeterminate",false);
	                			$(this).find(".pivotRowSelector").prop("checked",true);  
	                		}
	                		else if(status=="0"){
	                			$(this).find(".pivotRowSelector").prop("indeterminate",false);
	                			$(this).find(".pivotRowSelector").prop("checked",false);
	                		}		
	                	});
                    }
                }
                if(renderDataArea){
                    this._render_data_area(xr,yr,rangeRender,force);
                    /*var startCol=Math.min(xr[0], xr[1]);
                    var endCol=Math.min(Math.max(xr[0], xr[1]), this._settings.columns.length - 1); 
                    for (i =startCol; i <= endCol; i++)
                        this._renderColumn(i, rangeRender.yr, force);*/
                    
                }
               
                if(renderAttrArea){

                    this._render_attribute_area(yr,force);
                }
                this._lastRangeRender = rangeRender;
               
                this._debounceRegisterFacetsDragAndDropHandler();
                if (!this._postCheckColumns){

                   // that.bringScrollToClientArea($(that._viewobj).find('div.focusedCell'),true);
                    this._postCheckColumns = _.throttle(function() {

                        // TODO: perform the correct server side check
                    	pivotlog('Throttled _postCheckColumns xr=%o',xr);
                        if(!that.isEditing()){
                            that.updateCellhandlers();
//                            that.updateFocusedCell();
                            that.dataNodeSwap = false;
                        }
                    }, 200);//Change value from 300 to 200 to make the better performance of right arrow key behavior when scrolling beyond view port.
                }
                this._postCheckColumns(rangeRender.xr);
                //this._postProcessing();
                this._check_load_next(yr, xr);
                if(this.hasMemberSelector()){
	                //Status-2 indicates all the childs are not selected for the parent.This value is 
	        		//determined by MDAP internally.
	                var topAxis = this.getTopAxisView();
	                var topMem = this.getAvailableMember(topAxis.index);
	            	var $colSelector = this.$_header.find("div.dhx_hs_center"); 
	            	for(var i=0; i<topMem.length; i++){
	            		var $col = $colSelector.find("div[colpath='"+topMem[i]+"']").find("input.pivotColumnSelector");
	            		//this.setColSelectorStatus(childAxisPath[i], newStatus);
	            		if($col.length > 0){
	            			var status = this.getMemberSelectorStatus(topAxis.index,topMem[i]);
	            			//$col.attr("chbox",this.getMemberSelectorStatus(topAxis.index,topMem[i]));
	            			$col.attr("chbox",status); 
	            			if(status=="2")	{
	                			$col.prop("indeterminate",true);         			
	                			}
	                		else if (status=="1"){
	                			$col.prop("indeterminate",false);
	                			$col.prop("checked",true);  
	                		}
	                		else if(status=="0"){
	                			$col.prop("indeterminate",false);
	                			$col.prop("checked",false);  
	                		}
	            		}
	            	}
                }
                $(".indeterminate").each(function(){
                    $(this)[0].indeterminate = true;
                });
                $(".disabledBoolean").each(function(){
                    $(this)[0].disabled = true;
                });
                
                // Configure tooltip for data cells
                $('.dhx_cell_odd,.dhx_cell_even,.measureCell').qtip({
                    content: {
                        text: false // Use each elements title attribute
                    },
                    show: {
                        delay: 400,
                    },
                    position: {
                        target: 'mouse',
                        adjust: {
                            x: 0,
                            y: 10,
                            mouse: false
                        }
                    },
                    style: {
                        classes: 'pivot-data-cell-tooltip',
                        tip: false
                    },
                    events:{
                    	show : function(eventTip, api){
                    		if($('.pivot-data-cell-tooltip').length > 1){
                    			$('.pivot-data-cell-tooltip').hide();
                    			$('.pivot-data-cell-tooltip').hover(function(el){
                    				$('.pivot-data-cell-tooltip').qtip('hide');
                    			});
                    		}
                    		if(eventTip.originalEvent.target.offsetWidth >= eventTip.originalEvent.target.scrollWidth ) {
                    			return false;
                    		}
	                		var target = $(eventTip.originalEvent.target);
	                		if(target[0] && target[0].className.indexOf('ui-icon-alert')>-1){
	               			 // Mouse is currntly on alert icon, let another qtip be shown
	                   			 eventTip.preventDefault();
	                   			 return false;
	                   		 }
                    	}
                    }
                });
                $('.cmtRelation-SELF, .cmtRelation-ANCESTORS,.cmtRelation-DESCENDANTS').qtip({
                    content: {
                        text: false // Use each elements title attribute
                    },
                    show: {
                        delay: 400,
                    },
                    position: {
                        target: 'mouse',
                        adjust: {
                            x: 0,
                            y: 10,
                            mouse: false
                        }
                    },
                    style: {
                        classes: 'pivot-data-cell-tooltip',
                        tip: false
                    },
                    events:{
                        show : function(eventTip, api){                             
                        if($('.pivot-data-cell-tooltip').length > 1){
                            $('.pivot-data-cell-tooltip').hide();
                            $('.pivot-data-cell-tooltip').hover(function(el){
                                $('.pivot-data-cell-tooltip').qtip('hide');
                            });
                        }
                        }
                    }
                });
                pivotlog("$$$$$$$$$$$$$$ RENDERING STOP $$$$$$$$$$$$$$$$$");
            },

            _sync_scroll:function(x,y,t){
                y += this._scrollTop;
                jdapivot.Touch._set_matrix(this._body.childNodes[1].firstChild, x, y, t);
                if (this._getDataSplitIdx())
                    jdapivot.Touch._set_matrix(this._body.childNodes[0].firstChild,0,y,t);
                if (this._settings.rightSplit)
                    jdapivot.Touch._set_matrix(this._body.childNodes[2].firstChild,0,y,t);
                if (this._settings.header)
                    jdapivot.Touch._set_matrix(this._header.childNodes[1].firstChild,x,0,t);
                if (this._settings.footer)
                    jdapivot.Touch._set_matrix(this._footer.childNodes[1].firstChild,x,0,t);
            },
            refreshAllSettings : function(preventRestore) {

                this._blockUI();
                this.removeAllNonHeaderData();
                if (this.data.cube&&preventRestore) {
                    delete this.data.cube.backup_definition;
                }
                this.clearAll();
                this._getcubeDefinitionRequest();
            },
            clearAllData : function() {
                /*
                 * instead of deleting one by one - just reset inner collections
                 */
                var columns = jdapivot.toArray(this._settings.columns);
                var dataSplit = this._getDataSplitIdx();
                var pull = this.data.pull;
                this.data.pull = {};
                this.data.order = jdapivot.toArray();
                this.data.memberSelector={
                		0 :{},
                		1 :{}
                };
                return;
                for ( var rowId in pull){
                    if (pull.hasOwnProperty(rowId)){
                        var item = pull[rowId];
                        for ( var i = dataSplit; i < columns.length; i++){
                            var cell = item[columns[i].id];
                            if (cell)
                                cell.isStale = true;
                        }
                    }
                }
                this.callEvent("onClearAll", []);
            },
            refreshAllData : function() {
                this._blockUI();
                this.removeAllNonHeaderData();
                this.render();
                var xr = this._get_x_range(this._settings.prerender);
                var yr = this._get_y_range(this._settings.prerender === true);
                this._check_load_next(yr, xr);

            },
            emptyPivotView : function(){
            	this._resetPivotView();
            	this._detachStaleColumns();
            },
            loadPivotData : function(){
            	//After applying data filter some times get children taking more time in that case we need to show processing popup.
            	//default showDialog is false for getchildren call.
                var getChildrenHierarchyRequest = new jda.pivot.getChildrenHierarchyRequest({});
                var commandConfig = this.getCommandConfig(getChildrenHierarchyRequest._getPayload()["@class"]);
            	var isCommandConfigChanged = false;
            	if(commandConfig && !commandConfig.showDialog){
            		isCommandConfigChanged = true; 
            		commandConfig.showDialog = true;
            	} 
                this.isDataAvailable = true;
            	var topAxis = this.data.cube.view[1] = new _pns.axis(this, this._getCubeDefinition().topAxis);
                var sideAxis = this.data.cube.view[0] = new _pns.axis(this, this._getCubeDefinition().sideAxis);
            	this._getRootChildrenHierarchy(true);
            	isCommandConfigChanged && (commandConfig.showDialog = false);
            },
            exportPivotData : function() {
            	//alert("called exportPivotData() in jda_pivot.js");
            	if(this.checkDefaultExportGovernor()){
            		this._exportToExcelRequest();
            	}
            },
            beginImportFromExcel : function() {
            	$('#mdapImportExcel').trigger(jQuery.Event( "click" ));
            },
            evaluateDataFilters : function() {
            	this.getDataFilterController().evaluateDataFilters();
            },
            showAddDataFilterConfigWindow : function(cellId){
           	 	var levelInfos=[];
                var view = this._getCubeView();
                var axisId = 0;

                var rowAxisPath = new _pns.axisPath(cellId.row);
                var colAxisPath = new _pns.axisPath(cellId.column);

				var axis = view[axisId];
                var rowAxis= axis.getAxisPathLabelObj(rowAxisPath, false, true);
                for(var rowfacet = 1; rowfacet<rowAxis.length; rowfacet++ ){
                	var facetLevelNameObj = rowAxis[rowfacet].facetLevelNameObj;
                	if(facetLevelNameObj && (facetLevelNameObj instanceof Array) && facetLevelNameObj.length > 0 && !(facetLevelNameObj.length == 1 && facetLevelNameObj[0] == "_Total_")){
                		levelInfos.push({
                			dimensionName : this.getFacetFromFacetId(facetLevelNameObj.slice(-1)[0].dimensionId).name,
                			levelId : facetLevelNameObj.slice(-1)[0].attributeId,
                		});
                	}
                }
                axis = view[axisId+1];
                var colAxis= axis.getAxisPathLabelObj(colAxisPath, false, true);
                for(var colfacet = 1; colfacet<colAxis.length; colfacet++ ){
                	var facetLevelNameObj = colAxis[colfacet].facetLevelNameObj;
                	if(facetLevelNameObj && (facetLevelNameObj instanceof Array) && facetLevelNameObj.length > 0 && !(facetLevelNameObj.length == 1 && facetLevelNameObj[0] == "_Total_")){
                		levelInfos.push({
                			dimensionName : this.getFacetFromFacetId(facetLevelNameObj.slice(-1)[0].dimensionId).name,
                			levelId : facetLevelNameObj.slice(-1)[0].attributeId,
                		});
                	}
                }
                this.getDataFilterController().showAddDataFilterConfigWindow(levelInfos);
            },

            showAddMeasureFilterConfigWindow : function(){
           	 	this.getMeasureFilterController().showMeasureFilterConfigWindow();
            },

            initGetSegmentData:function(needSegmentCall){
                var xr = this._get_x_range(this._settings.prerender);
                var yr = this._get_y_range(this._settings.prerender === true);
                if (yr[1] == 0){
                    yr = this._get_y_range(true, 60);
                }
                //this.mapSegmentRequestsLoad={};
                this._check_load_next(yr, xr, needSegmentCall);
            },

            /**
             * Check if the cell identified by the given ID is editable. GK: Fixing a null pointer boundry
             * condition.
             *
             * @param cellId
             *            {row : rowId , column: colId}
             * @returns {Boolean} true or false.
             */
            isValueEditable : function(value) {
                var writeStat = (value.write || "w").toLowerCase();
                if (value.lock || '__Nc__' == value.content || value.content === undefined || "r" == writeStat || value.isProtected)
                    return false;

                return true;
            },
            
            isCellAvailableInView:function(selectedNode){                   	
            	if(selectedNode.length && selectedNode.length >0){
            	 var location = this.locateCell(selectedNode);
            	 var xr = this._getViewCoordinates().xr; //this._get_x_range_locate_cell(this._settings.prerender, true);
            	 var yr = this._getViewCoordinates().yr;//this._get_y_range_locate_cell(this._settings.prerender === true);
            	 var rowId = this.indexById(location[0]);
            	 var colId = this.columnIndex(location[1]);
            	 if( (rowId >= yr[0] && rowId <=yr[1])  && 
            		 (colId >= xr[0] && colId <= xr[1]) ){                   		 
            		 return true;
            	 }
            	}
            	 return false;
            },
            isCellAvailableInViewByCellId:function(cellId){       
            	 var xr = this._getViewCoordinates().xr; //this._get_x_range_locate_cell(this._settings.prerender, true);
            	 var yr = this._getViewCoordinates().yr;//this._get_y_range_locate_cell(this._settings.prerender === true);
            	 var rowId = this.indexById(cellId.row);
            	 var colId = this.columnIndex(cellId.column);
            	 if( (rowId >= yr[0] && rowId <=yr[1])  && 
            		 (colId >= xr[0] && colId <= xr[1]) ){                   		 
            		 return true;
            	 }
            	 return false;
            },
            isColumnPartiallyVisible:function(colId){
            	var that = this;
            	var colIndex = that.columnIndex(colId);
            	var xr = that._getViewCoordinates().xr;//that._get_x_range_locate_cell(that._settings.prerender, true);
            	if((xr.partialColEnd == colIndex)  || (xr.partialColStart == colIndex)){                   		
            		return true;
            	}
            	return false;
            },
            isRowPartiallyVisible:function(rowId){
            	var that = this;
            	var rowIndex = that.indexById(rowId);
            	var yr = that._getViewCoordinates().yr;//that._get_y_range_locate_cell(this._settings.prerender === true);
            	if( (yr.partialColTop == rowIndex) || (yr.partialColBottom == rowIndex)){
            		return true;
            	}
            	return false;
            },
            doScrollPartiallyVisibleCellToFull:function(cellId, isEditMode){
            	var that = this;
            	var colIndex = that.columnIndex(cellId.column);
            	var rowIndex = that.indexById(cellId.row);
            	var xr =  that._getViewCoordinates().xr;//that._get_x_range_locate_cell(that._settings.prerender, true);
            	var yr =  that._getViewCoordinates().yr;//that._get_y_range_locate_cell(this._settings.prerender === true);
            	if( (xr.partialColEnd == colIndex)  || (xr.partialColStart == colIndex)){
            		
            		var scrollPos = (xr.partialColStart == colIndex) ? xr.partialScrollRight :Math.abs(xr.partialScrollLeft);
            			
            		scrollPos += that._getDataArea().getScrollLeft();
            		//if(dhx.env.isIE){
            		scrollPos =Math.ceil(scrollPos);
            		//}
            		
            		that._getDataArea().scrollTo(scrollPos);
            		if(isEditMode){
                		setTimeout(function(){
                			that.startEdit(cellId);
                			pivotlog(" <!---Editing partial cell done on partialColumn--->");
                		},1000);
            		}
            		return false;
            	}
            	
            	if( (yr.partialColTop == rowIndex) || (yr.partialColBottom == rowIndex)){
            		
            		var scrollTop = (yr.partialColTop == colIndex) ? yr.partialScrollTop : yr.partialScrollBottom;
            		
            		scrollTop+=that._y_scroll._viewobj.scrollTop;
            		//if(dhx.env.isIE){
            			scrollTop =Math.ceil(scrollTop);
            		//}
            		that._y_scroll.scrollTo(scrollTop);
            		if(isEditMode){
                		setTimeout(function(){
                			that.startEdit(cellId);
                			pivotlog(" <!---Editing partial cell done on partial row--->");
                		},2000);
            		}
            		return false;
            		
            	}
            	
            	
            	
            	return true;
            },

            isCellEditable : function(cellId) {
                var cellDiv = this._locateCellDiv(cellId);
                if (cellDiv && cellDiv.className && cellDiv.className.indexOf("dhx_cell") >= 0){
                    var colIndex = this.columnIndex(cellId.column);
                    var value = this.item(cellId.row)[cellId.column];
                    /*
                     * Only allows editing on a data cell. Identify a data cell by checking its class name
                     * ("dhx_cell" versus "dhx_hcell" in column header) and the data type of its column ("data"
                     * versus "header" in row header cells).
                     */
                    if (this._columns[colIndex].type == "data" || this._columns[colIndex].isAttr){
                        return this.isValueEditable(value);
                    }
                }
                return false;
            },
            isCellValueEditable : function(cellId){
            	if(cellId){
            		var colIndex = this.columnIndex(cellId.column);
                    var value = this.item(cellId.row)[cellId.column];
                    /*
					 * Only allows editing on a data cell. Identify a
					 * data cell by checking its class name ("dhx_cell"
					 * versus "dhx_hcell" in column header) and the data
					 * type of its column ("data" versus "header" in row
					 * header cells).
					 */
                    if (value && (this._columns[colIndex].type == "data" || this._columns[colIndex].isAttr)){
                        return this.isValueEditable(value);
                    }
            	}                    	
                return false;
            },
            
            /**
             * Locate the div DOM node that displays the data in the given cell id object
             */
            _locateCellDiv: function(cellId,yr,xr) {

                var cid = cellId.column;
                var rid = cellId.row;
                var colDiv = undefined;
                var section = cellId.section;
                var retVal = undefined;
                if(_pns.Constants.sideAxisFacetsSection == section){
                    var colIndex = this.columnIndex(cellId.column);

                    var $header=$(this._columns[colIndex].node).find('[rowpath="'+rid+'"]');
                    retVal=$header[0];
                } else if (_pns.Constants.topAxisFacetsSection != section) {
                   // yr = yr|| this._get_y_range(this._settings.prerender === true);
                    //       var xr = this._get_x_range(this._settings.prerender === true);
                    var rowIndex = this.indexById(cellId.row);
                    var colIndex = this.columnIndex(cellId.column);
                    colDiv = colIndex === -1 ? null : this._columns[colIndex].node;
                    retVal=$(colDiv).find('[data-rowaxispath="' + cellId.row + '"]').get(0);
                    //retVal=colDiv && colDiv.childNodes[rowIndex - yr[0]];

                } else  {

                    var $header=this.$_viewobj.find('.dhx_ss_header').find('[id="'+rid+'"]');
                    retVal=$header[0];
                }

                return retVal;
            },
            _getYScrollTop:function(yind){
            	 var t = 0,scrollTop=0;
                 while ( t< yind){// added as part of Gabe change on scrolling
                 //while (t > 0 && end<t){
                	 scrollTop += this._getHeightByIndex(t);
                     t++;
                 }
                 pivotlog("t position -->"+t+"scroll Top ::"+scrollTop);
                 
                 return scrollTop;
            },
            _getXScrollLeft:function(xind){
            	var t=this._getDataSplitIdx(),currColumn,size=0;
            	while(t<xind){
            		 currColumn = this._columns[xind];
                     if (!currColumn)
                         continue;
                     size += currColumn.width || currColumn.realSize;
                     t++;
            	}
            	/*this._getDataArea().scrollTo(size);*/
            	return size;
            },
            _scrollYToSelectedCell:function(rowId){
            	            	
            		this.panToRow(rowId,true);
            		this.adjustYScrollPosition=true;
            	
            },
            _scrollXToSelectedCell:function(colId){
            	
            	var scrollLeft = this._getXScrollLeft(colId[0]);
            	this._getDataArea().scrollTo(scrollLeft);
            	this.adjustXScrollPosition=true;
            },
            /**
             * modify the range values required for rendering columns according to last selected cell.
             * This is mainly required for viewing selected cell on Pivot Grid when opening graph panel.
             */
            _renderToSelectedCell:function(xr,yr,range){
            	var selectedCell = this.lastSelectedId;
            	if(selectedCell.section === _pns.Constants.dataCellsSection){            	
            		var rowIndex = this.indexById(selectedCell.row);
            		var colIndex = this.columnIndex(selectedCell.column);
            		// check selected cell row index is available in current view port. If it is 
            		// available then no need to do any changes to vertical scroll.
            		if(this.hasSelectedCellAvailableInRange(rowIndex,yr) == false || 
            			this.hasSelectedCellAvailableInRange(colIndex, xr) == false){
            			// adjust the yr range(min && max) values  according to selected cell row Index
            			var xr_mod = this._getAdjustedValues(colIndex,xr,this._getDataSplitIdx(),this._getRightSplit());
            			var yr_mod = this._getAdjustedValues(rowIndex,yr,0,this.dataCount());
            			var newRange = this._getRefreshRange(yr_mod,xr_mod,false);
            			range.xr = newRange.xr;
            			range.yr = newRange.yr;
            			this.adjustYScrollPosition=false;
            			this.adjustXScrollPosition=false;
                		this._scrollYToSelectedCell(selectedCell.row);
                		this._scrollXToSelectedCell(xr_mod);
            		}
            	 }
            },
            /**
             * Utility function to bring selected cell into Pivot Grid view.
             */
            bringSelectedCellToView:function(){
            	this.overrideRange=true;
            	var hasAttr =  this._showAttributeArea();
            	this._check_rendered_cols(true, true, hasAttr);
            	this.overrideRange=false;
            },
            canAdjustRange:function(){
            	return this.adjustYScrollPosition ? true :false;
            },
            hasSelectedCellAvailableInRange:function(cellIndex,ypos){
            	// check cell index is available between y min and y max values           	
            	return (cellIndex >= ypos[0] && cellIndex <= ypos[1]);            	
            },
            _getAdjustedValues:function(cellIndex,posValue,minValue,maxValue){
              /*  var end = this.dataCount();  */   
            	var adjustedValue = posValue;
            	if(this.hasSelectedCellAvailableInRange(cellIndex, posValue) == false){
		                var minRequiredDelta = this.getDelta(posValue);
		                var mid = Math.ceil(minRequiredDelta/2);
		                var min = cellIndex-mid;
		                var max = cellIndex+mid;
		                var temp=0;
		                while(max>maxValue){
		                	max--;
		                	temp++;
		                }
		                min-=temp;
		                while(min<minValue){
		                	min++;
		                	max= max<maxValue ? max+1 : max;
		                }   
		                
		                adjustedValue =[min,max];
            	}
		        return adjustedValue;
            },
            getDelta:function(range){
            	var delta = range[0] > range[1] ? range[0] - range[1] : range[1]-range[0];
            	 return delta;
            },
            _adjustRanges: function(range, direction, min, max) {
            	
                if (direction){
                    range[1] += (this._settings.loadahead * this._settings.prefetchRatio);
                }
                else{
                    range[0] -= (this._settings.loadahead * this._settings.prefetchRatio);
                }
                range[0] = Math.max(range[0], min);
                range[1] = Math.min(range[1], max);

            },
            _getPreRenderSize: function(range) {
            	var preRenderRatio = this._settings.preRenderRatio;
            	var size=Math.ceil((Math.abs(range[1]-range[0])+1)*preRenderRatio);
            	return size;
            },
            _getRefreshRange: function(yr, xr, isDOMBufferRange,isAttr) {
            	 var loadahead = this._settings.loadahead, 
             			prefetchRatio = this._settings.prefetchRatio;
                xr = _.clone(xr ||( !isAttr ? this._get_x_range(this._settings.prerender) : this._get_attr_x_range(this._settings.prerender)));
                yr = _.clone(yr || this._get_y_range(this._settings.prerender === true));
                //                   pivotlog('cloned yr %o',yr);
                var paging = this._settings.pager;
                var fetch = this._settings.datafetch;
             
                var y_direction = true;
                
/*                var y_direction =
                        yr.scrollTop > this._last_valid_render_y_pos ? true : yr.scrollTop < this._last_valid_render_y_pos ? false : this._last_valid_render_y_dir;
*/
                this._last_valid_render_y_pos = yr.scrollTop;
                this._last_valid_render_y_dir = y_direction;
                var x_direction =
                        xr.scrollLeft > this._last_valid_render_x_pos ? true : xr.scrollLeft < this._last_valid_render_x_pos ? false : this._last_valid_render_x_dir;
                this._last_valid_render_x_pos = xr.scrollLeft;
                this._last_valid_render_x_dir = x_direction;
                yr.dir = y_direction;
                xr.dir = x_direction;
                //Fix for MDAP-6213. Need xr.dir and yr.dir always. So moved the below code (if condition) to here.
                if (yr[0] === 0 && yr[1] === 0){
                    return {
                        yr : yr,
                        xr : xr
                    };
                }

                if (isDOMBufferRange){
                    var yEnd = this.dataCount();
                    var xEnd = this._columns.length;
                    //if (yr.dir){
                    var height= (Math.abs(yr[1]-yr[0])+1);
					var width= Math.abs(yr[1]-yr[0])+1;
					
					yr[1] = Math.min(yEnd -1 , yr[1] + this._getPreRenderSize(yr));
                   // }
                   // else{
                     //   yr[0] = Math.max(0, yr[0] - loadahead * prefetchRatio);
                    //}
                    if (xr.dir){
                    	 xr[1] = Math.min(xEnd -1, xr[1] + this._getPreRenderSize(xr));
                    }
                    else{
                    	xr[0] = Math.max(0, xr[0] - this._getPreRenderSize(xr));
                    }
                }
                //this.global_yr0= yr[0];
                //this.global_yr1= yr[1];
                return {
                    yr : yr,
                    xr : xr
                };
            },
            _getRefreshRangeData : function(refreshAllView, yr, xr) {
                var range = this._getRefreshRange(yr, xr, true);
                var refreshPaths = this._getMissingAxesData(range.yr, range.xr, refreshAllView);
                return refreshPaths;
            },
            _onscroll : function() {
                this._settings.scrollPos =
                    this._viewobj[this._settings.scroll == "x" ? "scrollLeft" : "scrollTop"];
                this.callEvent("onScroll", [ this._settings.scrollPos ]);
            }, 

            _yScrollAreas : function(value) {
                pivotlog('_yScrollAreas value=%o  this._scrollTop=%o this._y_scroll=%o',value,this._scrollTop,this._y_scroll);
                var conts = this._body.childNodes;
                for ( var i = 1; i < conts.length; i++){
                    conts[i].firstChild.scrollTop = value /*- this._scrollTop*/ ;
                }
                this._scrollTop = value;
                this._body.childNodes[0].firstChild.scrollTop = value;
                this._setFloatingMemberVertical();
            },

            _onscroll_y : function(value,throttleTime,_simple) {
                var that=this;
               
                if(this.canAdjustRange() == false ){              	
	                var hasAttr =  this._showAttributeArea();
	                throttleTime = throttleTime === undefined ? 100 : throttleTime;
	
	                if (!this._onscroll_y_throttle){
	                    this._onscroll_y_throttle = _.throttle(function(value,attr,simple) {
	                            that.hideTooltips();
	                            that._scrollTop = value;
	                        if (!simple) {
	                            if (that.isEditing() && !that.submitEdit()){
	                                return;
	                            }
	                        }
	                        that._doScroll = true;
	                        if (!that._settings.prerender) {
	                            that._check_rendered_cols(true,true,attr);
	                            that.renderMultiSelected();
	                            if(that.isDataCopied){
                            		that.copySelectedData();
                            	}
	                            if(that._hasSelectedCellInDOM(that._selectedCellDiv)){
	                                //that._selectExactCell(that._selectedCellDiv,true);
	                                that.updateFocusedCell();
	                              }
	                        }
	                        //that._yScrollAreas(value);
	                        /*that._debounceFocusedCell();*/
	                    },throttleTime,{leading:true});
	                };
	                this._onscroll_y_throttle(value,hasAttr,_simple);      
	                $(this.$view).focus(); 
               } 
            },
    
        
            _onscroll_x : function(value,index) {
                if (this.isEditing() && !this.submitEdit()){
                    return;
                }
                var that = this;
                //var is_attr = index === 1 ? true : false;
                // var is_data = index === 2 ? true : false;
                if (!this._onscroll_x_throttle){
                    this._onscroll_x_throttle = _.throttle(function(value,index) {
                       
                    	 that._body.childNodes[index].scrollLeft = value;
                    	switch(index){
                            case 0:
                                // For now don't do anything if the side facet area is scrolled
                            	that._sideFacetScrollLeft =value;
                        		$(that._header.childNodes[index]).children('.ui-resizable-handle').css("right",-(value +10) + 'px');
                        		that.doFreezeMeasureHeader();
                                break;
                            	//return;
                            case 1:
                                that._attrScrollLeft=value;break;
                            case 2:
                                that._scrollLeft =value;break;
                            default:
                        		pivotlog(" horizontal scroll index not available");
                        }
                    	that._doScroll = true; // changes for key focus is not coming into view port data cells from out of view port
                        if (that._settings.header){
                            that._header.childNodes[index].scrollLeft = value;
                            $(that._header.childNodes[index]).children('.ui-resizable-handle').css("right",-(value +10) + 'px');
                        }
                        if (that._settings.footer)
                            that._footer.childNodes[index].scrollLeft = value;
                        if(that.adjustXScrollPosition){
                        	that._check_rendered_cols(true,true,true,true);
                        	that.adjustXScrollPosition =false;
                        }
                        if (that._settings.prerender == false && that.adjustXScrollPosition == false )
                            that._check_rendered_cols(false,index === 2,index === 1,true);
                        
                        that.renderMultiSelected();
                        if(that.isDataCopied){
                        	that.copySelectedData();
                        }
                        that.hideTooltips();
                        that._setFloatingMemberHorizontal();
                        
                        //that._debounceApplyResizeHandler();
                    }, 300,{leading:true});
                }

               // if(!this._switchMeasureAxis)
               // {
                	this._onscroll_x_throttle(value,index);
                	$(this.$view).focus(); // changes for key focus is not coming into view port data cells from out of view port
               // }
                this._switchMeasureAxis =false;

            },
            _hideTooltips : function() {
                $('.qtip.pivotCellTooltipStyle').qtip('hide');
            },
            _check_load_next : function(_yr, _xr, needSegmentCall) {
              //  if (((_yr[0] + _yr[1]) === 0) || ((_xr[0] + _xr[1]) === 0))
                //    return;
                var that = this;
                var prevXr = null;
                var prevYr = null;
                var prevGetSegmentData = 0;
                var wait = 500;
                if (!this._check_load_next_throttle){
                    this._check_load_next_throttle =
                        _.throttle(function(yr, xr, needSegmentCall) {
                            that.hideTooltips();
                            var now = new Date;
                            var remaining = wait - (now - prevGetSegmentData);
                            if (remaining > 0 && (_.isEqual(xr, prevXr) && _.isEqual(xr, prevXr))){
                                remaining = now;
                                // return;
                            }
                            var missingDataAxesPathsStr;
                            if(needSegmentCall){
                            	 missingDataAxesPathsStr = that._getRefreshRangeData(true, yr, xr);
                            }else{
                            	 missingDataAxesPathsStr = that._getRefreshRangeData(false, yr, xr);
                            }
                           
                            if (missingDataAxesPathsStr){
                                var topAxisPathsStr = missingDataAxesPathsStr.topAxisPathsStr;
                                var sideAxisPathsStr = missingDataAxesPathsStr.sideAxisPathsStr;
                                var measuresIDs = missingDataAxesPathsStr.combiMeasuresIds;
                                var sideAxisPaths = [];
                                var topAxisPaths = [];
                                for ( var key in sideAxisPathsStr){
                                    var value = sideAxisPathsStr[key];
                                    var axisPath = new _pns.axisPath(key);
                                    sideAxisPaths.push({
                                        axisPath : axisPath.facetPaths
                                    });
                                }
                                ;
                                for ( var key in topAxisPathsStr){
                                    var value = topAxisPathsStr[key];
                                    var axisPath = new _pns.axisPath(key);
                                    topAxisPaths.push({
                                        axisPath : axisPath.facetPaths
                                    });
                                }
                                ;
                                var curr = that;
                                {
                                    var queue =
                                        that.segmentDataRequestStack.push(that.wrapFunction(
                                            that._getSegmentData, that, [ sideAxisPaths,
                                                topAxisPaths,
                                                measuresIDs,
                                                xr,
                                                yr ]));
                                    if (!that.segmentDataRequestStack.busy){
                                        that._callNextCommandInGetSegmentDataStack();
                                    }
                                    else{
                                        // Let's clear old commands that
                                        // might not be relevant anymore
                                        that.segmentDataRequestStack.shift();

                                    }
                                }
                            }
                        }, 100);
                }
                this._check_load_next_throttle(_yr, _xr, needSegmentCall);

            },
            isResizingFacets : function() {
                return this.isFacetBeingResized;
            },
            wrapFunction : function(fn, context, params) {
                return function() {
                    fn.apply(context, params);
                };
            },
            _check_rows : function(view, count, dir) {
                var start = view[1];
                var end = start + count;
                if (!dir){
                    start = view[0] - count;
                    end = view[0];
                }

                if (start < 0)
                    start = 0;
                end = Math.min(end, this.data.order.length - 1);

                var result = false;
                for ( var i = start; i < end; i++)
                    if (!this.data.order[i]){
                        if (!result)
                            result = {
                                start : i,
                                count : (end - start)
                            };
                        else{
                            result.last = i;
                            result.count = (i - start);
                        }
                    }
                if (result){
                    this._run_load_next(result, dir);
                    return true;
                }
            },
            _preserveMandatoryColuProps : function(oldCol, newCol) {
                if (oldCol && newCol){
                    newCol.wi;
                }
            },
            _set_columns_positions : function() {
                var left = this.hasRowSelector() ? this.config.rowSelectorWidth : 0;
                var attrLeft=0;
                for ( var i = 0; i < this._columns.length; i++){
                    if (i == this._getDataSplitIdx() || i ==this._getRightSplit())
                        left = 0;
                    if(this._columns[i].isAttr && this._columns[i].node){
                        this._columns[i].node.style.left = attrLeft + "px";
                        attrLeft += this._columns[i].width;
                        left=attrLeft;
                    }
                    else{
                        // The columns seem to be offsetted more to the left than the header table cells
                        this._columns[i].node.style.left = left + "px";
                        left += this._columns[i].width + (i >= this._getDataSplitIdx() ? 0 : 0);
                    }
                }
            },
            _adjustChangedColumns : function() {
                this._apply_headers();
                var cols = this._settings.columns;
                for ( var i = 0; i < cols.length; i++){
                    cols[i].headerOverrideWidth = true;
                    resize = this._adjustColumn(i, false, true) || this.resize();
                }
                this._set_columns_positions();
                this._set_split_sizes_x();
                this._render_header_and_footer();
            },
            _getRightSplit : function() {
                return (this._columns.length - this._settings.rightSplit);
            },
            _getLeftSplit : function() {
            	return (this._settings.leftSplit);
            }, 
            setColumnWidth:function(col, width, skip_update){
                if (isNaN(width)) return;
                if (width<this._settings.minColumnWidth)
                    width = this._settings.minColumnWidth;

                var old = this._columns[col].width;
                if (old !=width){
                    if (col>=this._getDataSplitIdx() && col<=this._getRightSplit())
                        this._dtable_width += width-old;

                    this._columns[col].width = width;
                    if (this._columns[col].node)
                        this._columns[col].node.style.width = width+"px";

                    if(!skip_update)
                        this._updateColsSizeSettings();
                    return true;
                }
                return false;
            },
            _apply_headers : function() {
                this._dtable_width = 0;
                this._dtableAttr_width=0;
                var isAttrColPixel=false;
                if( typeof(this.config.attrVisibleColumn) === "string" && this.config.attrVisibleColumn.indexOf("px") > 0){
                    isAttrColPixel=true;
                    this.config.attrMaxWidth = this.config.attrVisibleColumn.substring(0,this.config.attrVisibleColumn.indexOf("px"));
                }
                var i = 0;
                var n = null;

                for (i = this._columns.length - 1; i >= 0; i--){
                    var currCol = this._columns[i];
                    if (!currCol.node){
                        var temp = dhtmlx.html.create("DIV");
                        temp.style.width = currCol.width + "px";
                        currCol.node = temp;
                    }
                    else{
                        if (currCol.isStale){
                            currCol.node.innerHTML = '';
                            // this._columns.splice(i, 1);
                        }

                    }
                }

                //       this._getRightSplit() = this._columns.length - this._settings.rightSplit;
                var attrCol=1,attrVisibleCol =0;
                for (i = this._columns.length - 1; i >= 0; i--){
                    var currCol = this._columns[i];
                    if (i >= this._getDataSplitIdx() && i <this._getRightSplit())
                        this._dtable_width +=  currCol.width;
                    if(currCol.isAttr){
                        this._dtableAttr_width +=currCol.userSetWidth ?currCol.userSetWidth : currCol.width;
                        if(!isAttrColPixel && attrCol<=this.config.attrVisibleColumn){
                            attrVisibleCol += currCol.userSetWidth ?currCol.userSetWidth : currCol.width;
                            attrCol+=1;
                        }
                    }
                    if (currCol.template)
                        currCol.template = dhtmlx.Template(currCol.template);
                }

                if(attrVisibleCol > 0)
                    this.config.attrMaxWidth = attrVisibleCol;
                var marks = [];

                if (this._settings.rightSplit){
                    n = this._columns.length - this._settings.rightSplit;
                    marks[n] = " dhx_first";
                    marks[n - 1] = " dhx_last";
                }
                if (this._getDataSplitIdx()){
                    n = this._getDataSplitIdx();
                    marks[n] = " dhx_first";
                    marks[n - 1] = " dhx_last";
                }
                marks[0] = (marks[0] || "") + " dhx_first";
                var last_index = this._columns.length - 1;
                marks[last_index] = (marks[last_index] || "") + " dhx_last";

                for (i = 0; i < this._columns.length; i++){
                    var node = this._columns[i].node;
                    var $node = $(node);
                    // Reflow only if needed
                    // $node.addClass("dhx_column " + (this._columns[i].css || "") + (marks[i] || ''));
                    $node.attr("column", i);
                    node.className = "dhx_column " + (this._columns[i].css || "") + (marks[i] || '');
                }
                
                if(this.hasMemberSelector()){
                	if(this._pivotselectorNode[0] === undefined){
                		   var selNode = dhtmlx.html.create("DIV");
                           selNode.style.width =  this.config.rowSelectorWidth+"px";
                           selNode.setAttribute('column', '-1');
                           selNode.className='dhx_column rowselectorcolumn sideFacetColumn';          	
                           
                           this._pivotselectorNode[0] = selNode;
                	}
                	
                }
                
                this._set_columns_positions();

                if (!this._scrollLeft)
                    this._scrollLeft = 0;
                if (!this._sideFacetScrollLeft)
                	this._sideFacetScrollLeft = 0;
                if(!this._attrScrollLeft)
                    this._attrScrollLeft=0;
                if (!this._scrollTop)
                    this._scrollTop = 0;

                this._create_scrolls();
                var newSizeTo =
                    function(value) {
                        if (!this._settings.scrollSize){
                            this._viewobj.style.display = 'none';
                        }
                        else{
                            this._viewobj.style[this._settings.scroll == "x" ? "width" : "height"] =
                                value + "px";
                            this._viewobj.style[this._settings.scroll == "x" ? "height" : "width"] =
                                this._settings.scrollSize + 1 + "px";
                        }
                    };

                //          this._x_scroll.sizeTo = newSizeTo;
                this._y_scroll.sizeTo = newSizeTo;
                this._set_split_sizes_x();
                this._render_header_and_footer();
            },
            _get_total_height : function() {
                pivotlog('Getting total height.');
                var pager = this._settings.pager;
                var start = 0;
                var max = this.data.order.length;
                this._header_height =this.$_viewobj.find(".dhx_ss_header").height();

                if (pager){
                    start = pager.size * pager.page;
                    max = Math.min(max, start + pager.size);
                }

                if (this._settings.fixedRowHeight) {
                    return (max - start + 1) * (this._settings.rowHeight);
                }else{
                	return (max - start) * (this._settings.rowHeight);
            	}
            },
            _getRowHeightByType: function(rowData) {
                return this._settings.rowHeight;
            },
            _getHeightByIndex:function(index){
                var id = this.data.order[index];
                var height=0;
                if (!id) {

                    height = this._settings.rowHeight;
                } else
                {
                    var rowData=this.data.pull[id];
                    height = rowData.$height || this._getRowHeightByType(rowData) ||  this._settings.rowHeight;
                }
                //          pivotlog('index %d id %s height %d',index,id,height);
                return height;
            },

            _resetRowHeights:function() {
                pivotlog('Resetting row heights.');
                _.each(this.data.pull,function(row){
                    delete row.$height;
                });
            },
            isSubmitValueChanged : function(isRenderCell) {
            	var cellId = this.getEditingCell();
            	var oldRenderedVal;
            	var cellValueForCellId =  this.data.getCellValFromCellId(cellId);
            	if(cellValueForCellId){
            		
            		if(isRenderCell){
            			//if it's a render cell type then we need to consider old value from combo value.
            			oldRenderedVal =cellValueForCellId.content;
            		}else{
            			oldRenderedVal = this.renderedValue(cellValueForCellId, this.getDecimalFromCellId(cellId));
            		}
            	}else{
            		return false;
            	}
                var newContentValue = StringUtilities.trim(this.$activeEditor.val());
                var retVal = ((this.$activeEditor.prop('changed') === true) && (newContentValue != oldRenderedVal));
                pivotlog("before _activeEditor.changed=" + this.$activeEditor.attr('changed') + "  istrue=" +
                    (this.$activeEditor.prop('changed') === true) + " retval=" + retVal + " render diff=" + (newContentValue != oldRenderedVal));
                this.$activeEditor.prop('changed', retVal);
                return retVal;
            },
            clearAllErrors : function(err,warn,info) {
            	if(err == undefined){
            		err = true;
            	}
                var pull = this.data.pull;
                $.each(pull, function(key, row) {
                    $.each(row, function(rowId, cell) {
                        if (cell ){
                        	err && delete cell.failreason;
                        	warn && delete cell.warn;
                        	info && delete cell.info;
                        }
                    });
                });
                err && this.$_viewobj.find('.cell-err').remove();
            	warn && this.$_viewobj.find('.cell-warn').remove();
            	info && this.$_viewobj.find('.cell-info').remove();
            	
                this.triggerEvent('exceptionsCleared');
            },
            isEditInvalid : function() {
            	 var error = {};
                 if (!this.isEditing())
                     return false;
                 
                 // if it's the same value skip the check
                 if (!this.isSubmitValueChanged())
                     return false;
                 
                 var typesToCheck = [ 'all' ];
                 var cellId = this.getEditingCell();

                 var cellVal = null;
                 if (cellId){
                     cellVal = this.data.getCellValFromCellId(cellId);
                     if (cellVal && cellVal.dtype){
                         typesToCheck.push(cellVal.dtype);
                     }
                 }
                 var newContentValue = StringUtilities.trim(this.$activeEditor.val());
                 // Call the plugged custom validators
                 // We are expecting false if not invalid and and object with a message if invalid {msg:"It's an
                 // error"}
                if (this.cellValidators){
                    for ( var iType = 0; iType < typesToCheck.length; iType++){
                        var validatorFuncArr = this.cellValidators[typesToCheck[iType]];
                        if (validatorFuncArr){
                            for ( var iValidatorFunc = 0; iValidatorFunc < validatorFuncArr.length; iValidatorFunc++)
                            {
                                var validatorFunc = validatorFuncArr[iValidatorFunc];
                                if (validatorFunc){
                                    var isInvalid =
                                        validatorFunc.apply(this, [ cellId, newContentValue, cellVal ]);
                                    if (isInvalid){
                                        return isInvalid;
                                    }
                                }
                            }
                        }

                    }
                }

                return false;

            },
            getCellValue : function(cellData, decimalPoints)
            {
            	var value;
                switch (cellData.dtype)
                {
                    case 'string':
                        value = (this.isDataDomainMeasure(cellData))? this.getDataDomainValueToDisplay(cellData) : this.changeTextSetSeparatorIfExists(cellData);
                        break;
                    case 'integer':
                        value=this.getCellFormattedValue(cellData.content,0);
                        break;
                    case 'duration':
                    	value = this.getDurationCellFormattedValue(cellData.content);
                    	break;
                    case 'boolean':
                        cellData.isElement = true;
                        var className = "";
                        if (cellData.write === 'R') {
                            className = "disabledBoolean";
                        }
                        if(cellData.content.toLowerCase() == "both"){
                            className += " indeterminate";
                        }
                        value = $('<input>', {
                            type : "checkbox",
                            "checked" : cellData.content.toLowerCase() == "true",
                            'class' :    className
                        })[0].outerHTML;
                        break;
                    case 'double':
                        value=this.getCellFormattedValue(cellData.content,decimalPoints);
                        break;
                    case 'doublerange':  
                    	// if min == max, show single value, otherwise, show min - max
                    	var min = cellData.content.min;
                    	var max = cellData.content.max;
                    	if(this._areFloatValuesTheSame(min, max, decimalPoints)) {
                    		value = this.getCellFormattedValue(min, decimalPoints);
                    	} else {
                    		value = this.getCellFormattedValue(min,decimalPoints) + ' - ' + 
                    				this.getCellFormattedValue(max,decimalPoints);
                    	}
                    	break;
                    case 'integerrange':
                        // if min == max, show single value, otherwise, show min - max
                        var min = cellData.content.min;
                        var max = cellData.content.max;
                        if(min == max) {
                            value = this.getCellFormattedValue(min, 0);
                        } else {
                            value = this.getCellFormattedValue(min,0) + ' - ' +
                                this.getCellFormattedValue(max,0);
                        }
                        break;
                }
                return value;
            },
            renderedValue : function(cellData, decimalPoints) {
                var value = "";
                if (decimalPoints === undefined)
                    decimalPoints = this._settings.defaultDecimal;
                if (cellData.dtype){
                    if (cellData.content === undefined){
                        // this should not happen, but just to be safe
                        // we handle it as if the cell doesn't exist.
                        value = "N/A";
                    }
                    else if (cellData.content == '__Nc__'){
                        // the cell doesn't exist.
                        value = "N/A";
                    }
                    else if (cellData.content == '__Nv__' || cellData.content == ""){
                    	value = "";
                    } else{
                    	value = this.getCellValue(cellData,decimalPoints );
                    }
                }else{
                	value = "N/A";
                }
                return value;

            },
            hasTextAlignment:function(measureId){
            	
            	var measure = this.getMeasure(measureId);
                var textAlign =
                        measure && measure.uIAttributes && measure.uIAttributes.CELL_TEXT_ALIGN;
                                     
                return  (textAlign === null || textAlign === undefined) ? false : true ;
            },
            getTextAlignment: function(measureId) {
                var measure = this.getMeasure(measureId);
               
                textAlign = this.hasTextAlignment(measureId) ? "right" : measure.uIAttributes.CELL_TEXT_ALIGN ;
                
                return textAlign;

            },
            getDecimal : function(measureId) {
                var measure = this.getMeasure(measureId);
                var decimalFormat =
                    measure && measure.uIAttributes && measure.uIAttributes.MEASURE_DECIMAL_FORMAT;
                decimalFormat =
                    (decimalFormat === null || decimalFormat === undefined) ? this._settings.defaultDecimal : parseInt(
                        decimalFormat, 10);
                return decimalFormat;

            },
            isNegative : function(cellData) {

                return cellData&&cellData.dtype&&(cellData.dtype==='double'||cellData.dtype==='integer')&&cellData.content&&cellData.content.length>1&&cellData.content[0]=='-';
            },
            _renderColumn : function(index, yr, force) {
                //  console.dir(yr);
                var that=this,
                    col = this._columns[index],
                    groupCol = col.groupValues,
                    groupCss = "",
                    memberIdent = "",
                    item = null,
                    split_column = index < this._getDataSplitIdx() ? 0 : (index >=this._getRightSplit() ? 2 : 1),
                    columnsParent = split_column === 0 ? this.$leftPanelScroll : split_column === 1 ? this.$centerPanelScroll : this.$rightPanelScroll;

                if(col.isAttr){
                    columnsParent = this.$attrPanelScroll;
                    col.attached = null;
                    delete col.detach;
                    groupCol=false;
                }
                //columnsParent = col.isAttr ? this.$attrPanelScroll :columnsParent;
                // if columns not aligned during scroll - set correct
                // scroll top value for each column

//                        if (!this._settings.scrollAlignY && yr[2] != col._yr2)
//                            col.node.style.top = yr[2] + "px";

                if (!force && (col._yr0 == yr[0] && col._yr1 == yr[1]))
                    return;
                if (col.detach){
                    delete col.detach;
                    if (col.node){
                        var temp = document.createElement("DIV");
                        var currColParent = col.node.parentNode;
                        temp.style.cssText=col.node.style.cssText;
                        temp.style.width = col.width + "px";
                        temp.className =col.node.className;
                        if (currColParent){
                            currColParent.replaceChild(temp, col.node);
                        }
                        $(temp).attr("column", index);
                        col.node = temp;
                    }
                }
                if (!col.attached){

                    if (col.node !== undefined){
                        columnsParent.append(col.node);
                        col.attached = true;
                        col.split = split_column;
                    }
                }
                //                    if (this._settings.scrollAlignY && yr.scrollTop != col._yr2)
                //                        col.node.style.top = yr.scrollTop + "px";

                var html = "";
                var config = this._settings.columns[index];
                var isFacetColumn = config.type == "header";
                var isMeasureColumn = config.isMeasure;
                var isDataArea = this._getDataSplitIdx() <= index;
                var visibleSideFacets = this.getSideVisibleFacets();
                var select = config.$select;
                var currItem = null;
                var currVal = null;
                var groupDivPrefix = null;
                var css = "";
                var baseCss = "";
                var valueCss = "";

                var currDiv = "";
                var rowSelectorGroupDiv ="";
                var currGroupDiv = groupDivPrefix;
                var groupItemCounter = 0,
                    groupItemHeight = 0;
                var groupFirstItem = null;
                var groupItemsCounter = 0;
                var hasFacetChildren =
                    isFacetColumn && config.hasFacetChildren && config.hasFacetChildren[index];
                var lastMeasureId = this.getLastMeasureVisibleId();
                var firstMeasureId = this.getFirstMeasureVisibleId();
                var isColBoundry = false;
                var isColBoundryStart =false;
                var columnAxisPath = config.axisPath;
                //                    pivotlog('Rendering column index %d axispath %s',index,config.id);
                var sortOrders = this._getCubeDefinitionSortParams();
                var columnAxisPathStr =
                    columnAxisPath ? this.getTopAxisView().getAxisPathIdStr(columnAxisPath) : "";
                var isSortColumn = columnAxisPath && this._isSortColumn(columnAxisPath);
                var isDataArea = this._getDataSplitIdx() <= index;
                var currMeasureDecimal = null;
                var cellTextAlign = null;
                var currMeasureId = null;
                var nodeindex = index;
                var isAttrbuteArea =col.isAttr;
                var groupLevel = null;
                var sideAxisView = this.getSideAxisView();
                var canAddSelectorCol=false;
                var needIndentation = false;
                var $colNode = $(col.node);
                if (isFacetColumn && !isMeasureColumn){
                    var currFacet = visibleSideFacets[index];
                    nodeindex = sideAxisView.getFacetNodeIndexFromVisibleIndex(nodeindex);
                    $colNode.addClass("sideFacetColumn" + " " + _pns.Constants.facetNamePrefix + "-" +
                        currFacet.getIDName());
                    $colNode.data("facetData", {
                        id : currFacet.id,
                        index : sideAxisView.getFacetIndexFromId(currFacet.id)
                    });
                    if(this.hasMemberSelector()){
	                    var facetEndIndex = this._getFacetSplitIndex() -1;
	                    var expectedIndex = this.areMeasuresOnTop() ? facetEndIndex : facetEndIndex-1;
	                    canAddSelectorCol = (expectedIndex == index);
                    }	
                }

                if (this.areMeasuresOnTop()){
                    if (columnAxisPath){
                        currMeasureId = _pns.axisPath.getMeasureIdFromAxisPathStr(config.id);
                    	if(col.subMeasures && col.subMeasures.length > 0){
                    		lastMeasureId = col.subMeasures[col.subMeasures.length - 1];
                    		isColBoundry = false;
                    	}
                        isColBoundry = currMeasureId == lastMeasureId;
                        isColBoundryStart = currMeasureId == firstMeasureId;
                    }
                    //TODO: Handle expanded measueres
                }
                else if (isMeasureColumn){
                    nodeindex = sideAxisView.getFacets().length;
                    needIndentation = this.hasExpandableMeasure();
                }
                if (isColBoundry && col.node)
                    $colNode.addClass("colBoundry");
                
                if(isColBoundryStart && col.node)
                	$colNode.addClass("colBoundaryStart");
                
                for ( var i = yr[0]; i <= yr[1]; i++){
                    var isParentContainer = false;
                    baseCss = "dhx_cell";
                    var cellLevel = 0;
                    var rowAxisPath="";
                    //var isLastMeasure = false;
                    var dataAttribute = "";
                    var rowHeight=this._getHeightByIndex(i);
                    item = this.data.item(this.data.order[i]);
                    if (item){
                        rowAxisPath = item.id;
                    }
                    
                    var isRowBoundry = false;
                    var isTopMsrRow = false;
                    
                    if (!this.areMeasuresOnTop()){
                        if (item){
                            currMeasureId = _pns.axisPath.getMeasureIdFromAxisPathStr(item.id);
                            
                            //
                            //Since measuers are expnadable, check if last measures is expandaable 
                            //
                            if((currMeasureId == lastMeasureId) && item.isExpanded && item.subMeasures){
                            	lastMeasureId = item.subMeasures[item.subMeasures.length - 1];
                            	
                            }
                            isRowBoundry = currMeasureId == lastMeasureId;
                            isTopMsrRow = currMeasureId == firstMeasureId;
                            if (this._isSortMeasure(currMeasureId) &&
                                (isMeasureColumn || (isDataArea && isSortColumn)))
                            {
                                baseCss += " sortedContent";
                            }

                        }
                    }
                    else if (isSortColumn){
                        baseCss += " sortedContent";
                    }
                    if (currMeasureId){
                        currMeasureDecimal = this.getDecimal(currMeasureId);
                        cellTextAlign = this.hasTextAlignment(currMeasureId) ? this.getTextAlignment(currMeasureId) : null;
                    }
                    baseCss += isMeasureColumn ? " draggableMeasures" : !isDataArea && !isAttrbuteArea ? " facetMemberName" : "";

                    if (isMeasureColumn && !col.isAttr){
                        var dataObj = {
                            measureId : currMeasureId
                        };
                        dataAttribute = " data-facet-Data = '" + JSON.stringify(dataObj) + "' ";
                        baseCss+= ' measureCell';
                    }

                    if(isAttrbuteArea){
                        rowAxisPath=rowAxisPath;
                        baseCss+=" attributeArea dhx_attr_cell ";
                    }
                    css = baseCss;
                    groupCss = "dhx_cell dhx_cell_dimension";

                    if (this.areMeasuresOnTop()){
                        if (isFacetColumn){
                            groupCss += " droppableMeasuresZone";
                        }
                    }
                    isLastMeasure = (currMeasureId !== null & currMeasureId == lastMeasureId);
                    var expansionSpan = "";
                    if (hasFacetChildren){
                    	if (!config.expanded[index]){
                        	if(isMeasureColumn){
                        		expansionSpan = "<span  class='measure_member_collapsed'></span>";
                        	}else{
                        		expansionSpan = "<span  class='facet_member_collapsed'></span>";
                        	}
                        }else{
                        	if(isMeasureColumn){
                        		expansionSpan = "<span  class='measure_member_expanded'></span>";
                        	}else{
                        		expansionSpan = "<span  class='facet_member_expanded'></span>";
                        	}
                        }                        
                    }
                    if(!item)
                    	isParentContainer = true;


                    if (!groupCol || groupItemCounter !== 0){
                        if ((i - yr[0]) % 2 === 0){
                            css += " dhx_cell_even";
                        }
                        else{
                            css += " dhx_cell_odd";
                        }
                    }
                    if (item){

                        var dataNode = item.dataNodes ? item.dataNodes[nodeindex] : null;
                        var hasLocalFacetChildren = dataNode ? dataNode.hasFacetChildren : false;
                        var isExpanded = dataNode ? dataNode.isExpanded : false;
                       
                        if(!dataNode && item.mr ){
                        	var tmpMeasure = this.getMeasureFromCellId({column:item.id});
                        	if(tmpMeasure && tmpMeasure.hasChildren){
                        		hasLocalFacetChildren = true;
                        		isExpanded = item.isExpanded ||  false;
                        	}
                        }
                        var currNodeLevel = dataNode ? dataNode.level : 0;
                        var currLevel = currNodeLevel;
                        if (groupLevel == null){
                            groupLevel = 0;
                        }
                        // dataNodeLevel=dataNode?dataNode.axisPath[index].length-1:0;
                        var arrowXPositionVal = (isExpanded ? -1 : 2) + currLevel * this._settings.levelOffset;
                        var arrowYPositionVal = (isExpanded ? 3 : 2);
                        var arrowPosition = !isMeasureColumn?
                            "background-position: " + arrowXPositionVal + "px " + arrowYPositionVal +
                            "px;margin-left:" + arrowXPositionVal + "px;" : "";
                        currLevel = dataNode ? dataNode.level : 0;
                        memberIdent = "";
                        for ( var iSpacer = 0; iSpacer < currLevel; iSpacer++){
                            // memberIdent += "<div
                            // class='facet_member_spacer'>"+_pns.Constants.spacer+"</div>";
                        }

                        var cellData = this._getCellData(item, config, i);
                        var value = null;
                        var cellType = "";
                        var cellChangedHighlight = "";
                        var cellTBucket = "tBucket-";
                        var cellComment = "cmtRelation-";
                        var cellCommentTitle = "";
                        var cfclass ="";
                        //var cellRenderType = null;
                        var multiEditCSS="";
                        if (cellData){
                            if (!isFacetColumn) {
                                value = this.renderedValue(cellData, currMeasureDecimal);
                                cellChangedHighlight = this.highlightedChangedCells[this.getCellIdStr(cellData)]?"highlightedChangedCell":"";
                            }
                            else
                                value = cellData;
                            cellType = cellData.dtype;
                            cellTBucket += (cellData.tBucket) ? cellData.tBucket : "N";
                            cellComment += (cellData.cmtRelation) ? cellData.cmtRelation : "N";
                            cfclass = cellData.cssCFRuleId;
                            multiEditCSS = cellData.multiEdit? "multiEditHighlight":"";
                            cellCommentTitle = cellData.cmtTitle;
                            //cellRenderType = cellData.render; 
                        }
                        else{
                            value = "";
                            cellTBucket = "";
                            cellComment="";
                        }
                        if (isFacetColumn && hasLocalFacetChildren){
                        	if(isMeasureColumn){
                        		if (!isExpanded)
                                    expansionSpan = "<span class='measure_member_collapsed'></span>";
                                else
                                    expansionSpan = "<span class='measure_member_expanded'></span>";
                        	}else{
                        		if (!isExpanded)
                                    expansionSpan = "<span class='facet_member_collapsed'></span>";
                                else
                                    expansionSpan = "<span class='facet_member_expanded'></span>";
                        	}
                        }
                        if(isFacetColumn)
                        	isParentContainer = true;
                        if (isFacetColumn && !isMeasureColumn && !cellLevel){
                            cellLevel = currLevel;

                        }

                        // cell-selection
                        if ((!this._getPivotLockedMode() && ((cellData && cellData.$select && item.$select) || (item.$select && (item.$select.$row || item.$select[config.id])))) ||
                            select)
                            css += " " + this._select_css;

                        if (value == "N/A"){
                            css += " naValue";
                            value = "";
                            cellComment="";
                        }
                        var titleAttr = "";
                        if (cellType === 'string'){
                            titleAttr = " title='" + value + "' ";
                        }
                        if (!groupCol){
                            /*if (item.$height)
                             currDiv =
                             "<div title='" + value + "' class='" + css + "' style='height:" +
                             item.$height + "px' " + dataAttribute + ">" + value + "</div>";
                             else*/{
                                // This is an acual measure value
                                var cellInfoSpan = "";
                                var cellCommentSpan="";
                                var lockedSpan = "";
                                var cellLock =
                                    ((cellData && cellData.lock && cellData.lock !== 'IMPCT') ? cellData.lock : "");
                                var iconColorCss =
                                    cellLock ? (_pns.Constants.UiIconPrefix + cellLock.toLowerCase()) : "";
                                var lockVisibility = '';
                                if (!cellLock){
                                    lockVisibility = 'style="display:none"';
                                }
                                lockedSpan =
                                    '<span  ' + lockVisibility +
                                    ' class="cell_lock ui-icon ui-icon-locked ' + iconColorCss +
                                    '"></span>';
                                if (_pns.Constants.NA_Value != value && _pns.Constants.spacer != value){

                                    var cellInfoClass = "errorInd ";
                                    valueCss = "";
                                    var cellProtected = (cellData && cellData.isProtected) ? true : false;
                                    var cellwriteStatus =
                                        (((cellData && cellData.write) ? cellData.write : "w"))
                                            .toLowerCase();
                                    //
                                    if (this.isNegative(cellData)&&(MathUtilities&&MathUtilities.isRedForNegatives)||(MathUtilities===undefined)) {
                                        valueCss += " negative";
                                    }
                                    if ("w" != cellwriteStatus){
                                        valueCss += " wstat-" + cellwriteStatus;
                                    }
                                    else if (cellData !== undefined && cellProtected === false){
                                        css += " editabledata";
                                    }

                                    if(cellProtected === true){

                                        css +=" protectedcelldata";
                                    }

                                    if (cellTBucket){
                                        css += " " + cellTBucket;
                                    }
                                    if(cellComment){
                                        cellCommentSpan ="<span class=' "+cellComment+"'";
                                        if (cellCommentTitle) {
                                            cellCommentSpan += " title='"+cellCommentTitle+"'";
                                        }
                                        cellCommentSpan += "></span>";
                                    }
                                    if (cellChangedHighlight) {
                                        css+= " " + cellChangedHighlight;
                                    }
                                    css+=" "+multiEditCSS;
                                    valueCss += " cell_content";
                                    if (cellType){
                                        valueCss += " " + cellType;
                                    }
                                    if ((cellData !== undefined && cellData.failreason)){
                                        cellInfoClass += this._getErrorClasses();
                                    }

                                    if ((cellData !== undefined && cellData.info)){
                                        cellInfoClass += this._getInfoClasses();
                                    }
                                    
                                    if ((cellData !== undefined && cellData.warn)){
                                        cellInfoClass += this._getWarnClasses();
                                    }
                                    
                                    if (cellInfoClass){
                                        cellInfoSpan = "<span class='" + cellInfoClass + "'></span>";
                                    }
                                }
                                if (isRowBoundry){
                                    css += " rowBoundry";
                                }
                                if(isTopMsrRow){
                                	css +=" topMsrRow";
                                }
                                
                                var metaInfoSpan =
                                    "<span class='metaInfo'>" + lockedSpan + cellInfoSpan + "</span>"+ cellCommentSpan;
                                var thumbnailsWidthPerCell=Math.floor(config.width/ this.thumbnailWidth);
                                var thumbnailsHeightPerCell=Math.floor(item.$height/ this.thumbnailHeight);
                                // Prepare some of the custom props for easier handling on the templates
                                cellData = cellData ? cellData : {};
                                cellData.cmProps = cellData.cmProps ? cellData.cmProps : {};
                                cellData.cmProps.valueAppCss = cellData.cmProps.valueAppCss ? cellData.cmProps.valueAppCss : '';
                                cellData.cmProps.cellAppCss = cellData.cmProps.cellAppCss ? cellData.cmProps.cellAppCss : '';
                                if(cellData.cmProps.cellAppCss){
                                	cellData.cmProps.cellAppMsg = this.getLocaleString(cellData.cmProps.cellAppCss);
                                }else{
                                	cellData.cmProps.cellAppCss = '';
                                }
                                // Moved preprocessing code from cell template to here. As cell template adding extra text node to column
                                if (that.customPivotLogic&& that.customPivotLogic.cellRendererAppPreProcessor)
                                	that.customPivotLogic.cellRendererAppPreProcessor.apply(that,[cellData]);
                                
                                currDiv = this.getTemplates()[this.getPivotCellTemplateClassName()](
                                    {
                                        dataAttribute:dataAttribute,
                                        cellValue:value,
                                        cellRawData: cellData,
                                        currMeasureId:currMeasureId,
                                        isParentContainer:isParentContainer,
                                        css:css,
                                        cellHeight:item.$height,
                                        cellWidth: config.width,
                                        maxDisplayedThumbnailsWidth:this.thumbnailsWidthPerCell,
                                        maxDisplayedThumbnailsHeight:this.thumbnailsHeightPerCell,
                                        thumbnailHeight : this.thumbnailHeight,
                                        thumbnailWidth : this.thumbnailWidth,
                                        metaInfoSpan:metaInfoSpan,
                                        valueCss:valueCss,
                                        rowAxisPath:rowAxisPath,
                                        cellTemplate: this.getTemplates().cellTemplate,
                                        pivotObj:that,
                                        conditioinalformatclass:cfclass,
                                        textAlign:cellTextAlign
                                    }
                                );
                                //      console.log('currDiv is '+currDiv);
                                //     currDiv=this.getTemplates().cellTemplate({});
                                /*                                                
                                 currDiv =
                                 "<div  " + dataAttribute + " title='" + value + "'  " + titleAttr +
                                 " measure='" + currMeasureId + "' class='" +
                                 (isParentContainer ? " parentContainer " : "") + css + " " +
                                 "dhx_value label'>" + expansionSpan + metaInfoSpan +
                                 "<span class='" + valueCss + "'>" + value + "</span>" +
                                 "</div>";
                                 */
                            }
                            html += currDiv;
                        }
                        else{
                            // Side facet member names and measure cells (if measures are on the side
                            if (currVal &&
                                ((currVal != value) || !this._areValuesSameParents(item, currItem,
                                    nodeindex)))
                            {
                                if (groupItemsCounter % 2 === 0){
                                    groupCss += " dhx_cell_even";
                                }
                                else{
                                    groupCss += " dhx_cell_odd";
                                }
                                
                                if(lastMeasure){
                                	groupCss+= lastMeasure ;
                                }
                                if(firstMeasure){
                                	groupCss+= firstMeasure;
                                }
                                if (isFacetColumn&&!isMeasureColumn){
                                    groupCss += ' sideFacetMemberContainer';
                                }
                                
                                var titlteAttr = "";
                                if(isMeasureColumn && this.showEllipsisOnMemberName()){
                                	titlteAttr = " title='" + value + "'";
                                }
                                groupCss += " " + "facetLevel-" + groupLevel;
                                groupCss += " sideCellMember";
                                currGroupDiv += "</div>";
                                groupDivPrefix =
                                    "<div class='" + groupCss + "'" + titlteAttr+ " style=" + "'padding:0px;height:";
                                var rowSelPath=groupFirstItem.id;
                                //rowSelPath = rowSelPath.indexOf('$') >=0 ?  rowSelPath.slice(0,rowSelPath.indexOf('$')) : rowSelPath;
                                rowSelPath = rowSelPath.indexOf(_pns.Constants.measurePathSeperator) >=0 ?  rowSelPath.slice(0,rowSelPath.indexOf(_pns.Constants.measurePathSeperator)) : rowSelPath;
                                var status = this.getMemberSelectorStatus(0,rowSelPath) == undefined ? 0 : this.getMemberSelectorStatus(0,rowSelPath) ;
                                var rowPathAttr =   ' rowPath="' + groupFirstItem.id +'"'; 
                                rowSelectorGroupDiv += (groupDivPrefix + groupItemHeight+
                                        "px'  rowSelPath='"+rowSelPath + rowPathAttr + "' measures='" +
                                        groupItemCounter + "'><input class='pivotRowSelector' chbox='"+status+"' style= 'margin-left:1px;background:none;padding:1px;' type='checkbox'></input></div>");
                                html +=
                                    (groupDivPrefix + groupItemHeight/*this._settings.rowHeight * groupItemCounter*/ +
                                        "px' " + rowPathAttr + "' measures='" +
                                        groupItemCounter + "'>" + currGroupDiv);

                                groupFirstItem = null;
                                currGroupDiv = "";
                                groupItemsCounter++;
                                groupItemCounter = 0;
                                groupItemHeight = 0;
                                css = baseCss;
                            }
                            groupItemCounter++;
                            groupItemHeight+=rowHeight;
                            if (groupItemCounter == 1){
                                //  console.log('$height on rendering',item.$height);
                                if (item.$height&&isMeasureColumn)
                                    currDiv =
                                        "<div " + dataAttribute + " class='" + css + "' style='" +
                                        arrowPosition + ";height:" + item.$height + "px'>" +
                                        expansionSpan + "<span>" + value + "</span>" + "</div>";
                                else{
                                    //disply tooltip if it's measure and showEllipsisOnMemberName is true
                                	var memberNameSpan = "";
                                    var facetMemberEllipsisDiv = "";
                                    var margin = "";
                                    if(needIndentation && !expansionSpan){
                                    	margin = "margin-left : "+ (item.isSubmeasure ? "28px" : "18px");
                                    }
                                    if (this.showEllipsisOnMemberName()){
                                    	if(isMeasureColumn){
                                    		memberNameSpan = "<span class='pivot_member_name' style='"+ margin + ";' >" +  value + "</span>";
                                        }else{
                                        	memberNameSpan = "<span class='pivot_member_name_wrap_text' style='"+ margin + "';>" +  value + "</span>";
                                            facetMemberEllipsisDiv = "<div class='facetMemberEllipsisDiv facetLevel-" + currLevel+" '>...</div>";
                                            css = css.replace("dhx_cell","");
                                        }
                                     }else{
                                    	 memberNameSpan = "<span class='pivot_member_name' style='"+ margin + "';>" +  value + "</span>";
                                     }
                                    

                                    currDiv =
                                    	 "<div " + dataAttribute + " class='" + css + (isParentContainer ? " parentContainer " : "") +
                                         "' style='" + arrowPosition + "'>" + expansionSpan + memberNameSpan +
                                        "</div>";
                                }
                                currGroupDiv = currDiv + facetMemberEllipsisDiv;
                            }
                            currVal = value;
                            currItem = item;
                            groupLevel = currLevel;
                            lastMeasure = isMeasureColumn && (currMeasureId == lastMeasureId) ? " lastMeasureCell" :""; 
                            firstMeasure = isMeasureColumn && (currMeasureId == firstMeasureId) ?" firstMeasureCell":"";
                            if (!groupFirstItem)
                                groupFirstItem = item;

                        }
                    }
                    else{
                        // When do we reach this code?
                        currDiv = "<div class='" + css + "'></div>";
                        if (!this._data_request_flag)
                            this._data_request_flag = {
                                start : i,
                                count : yr[1] - i
                            };
                        else
                            this._data_request_flag.last = i;
                    }
                }

                // If we are grouping rows in a column, need to generate
                // the code for the
                // last cell.
                if (groupCol && currVal){
                	 groupCss = "dhx_cell dhx_cell_dimension";
                     if (this.areMeasuresOnTop()){
                         if (isFacetColumn){
                             groupCss += " droppableMeasuresZone";
                         }
                     }
                    if (groupItemsCounter % 2 === 0){
                        groupCss += " dhx_cell_even";
                    }
                    else{
                        groupCss += " dhx_cell_odd";
                    }
                    if (isFacetColumn&&!isMeasureColumn){
                        groupCss += ' sideFacetMemberContainer';
                    }
                    var titlteAttr = "";
                    if(isMeasureColumn && this.showEllipsisOnMemberName()){
                    	titlteAttr = " title='" + value + "'";
                    }
                    groupCss += " sideCellMember";
                    groupCss += " " + "facetLevel-" + currLevel;
                    if(lastMeasure)
                       groupCss += lastMeasure;
                    currGroupDiv += "</div>";
                    groupDivPrefix = "<div class='" + groupCss + "'"+ titlteAttr + " style=" + "'padding:0px;height:";
                    
                    var rowPathAttr =   ' rowPath="' + groupFirstItem.id +'"';
                    html +=
                        (groupDivPrefix + groupItemHeight/*this._settings.rowHeight * groupItemCounter*/ + "px' " +
                        		rowPathAttr + "' measures='" + groupItemCounter + "' >" + currGroupDiv);
                    var rowSelPath=groupFirstItem.id;
                    //rowSelPath = rowSelPath.indexOf('$') >=0 ?  rowSelPath.slice(0,rowSelPath.indexOf('$')) : rowSelPath;
                    rowSelPath = rowSelPath.indexOf(_pns.Constants.measurePathSeperator) >=0 ?  rowSelPath.slice(0,rowSelPath.indexOf(_pns.Constants.measurePathSeperator)) : rowSelPath;
                    var status = this.getMemberSelectorStatus(0,rowSelPath) == undefined ? 0 : this.getMemberSelectorStatus(0,rowSelPath);
                    rowSelectorGroupDiv +=
                        (groupDivPrefix + groupItemHeight/*this._settings.rowHeight * groupItemCounter*/ + "px'  rowSelPath='"+rowSelPath+
                        		rowPathAttr + "' measures='" + groupItemCounter + "' ><input class='pivotRowSelector' chbox='"+status+"' style= 'margin-left:1px;background:none;padding:1px;' type='checkbox'></input></div>" );
                    currGroupDiv = "";
                    groupItemsCounter++;

                    groupItemCounter = 0;
                    groupItemHeight = 0;
                    groupFirstItem = null;
                    css = baseCss;
                }
                if (!groupFirstItem)
                    groupFirstItem = item;
                if (col.node !== undefined)
                    col.node.innerHTML = html;
                if (canAddSelectorCol){
                	this._pivotselectorNode[0].innerHTML=rowSelectorGroupDiv;
                	columnsParent.prepend(this._pivotselectorNode[0]);
                }
//                        col.node.setAttribute('data-topaxispath',config.id);
                col._yr0 = yr[0];
                col._yr1 = yr[1];

            },
            _getCommentTitle:function(cmtTitle) {
            	if(this.enableCmtReasonCodeSupport){
            		var reasonCodes=this.data.cube.definition.commentReasonCodes;
            		for(var i = 0; i < reasonCodes.length; i++){
            			if(reasonCodes[i].code == cmtTitle){
            				cmtTitle =  reasonCodes[i].dispValue || reasonCodes[i].code;
            				break;
            			}
            		}
            	}
            	return cmtTitle;
            },
            _$getCellIndicator : function(cellDiv) {
                // var cellDiv=this
                // ._locateCellDiv(cellId);
                var $indCell = cellDiv.find('.errorInd');
                return $indCell;
            },
            applyErrorToCellIndicator : function(cellDiv, msg) {
                var $indCell = this._$getCellIndicator(cellDiv);
                $indCell.data('msg', msg);
                var value = this.getValueFromAxisLocation(this.locateCell(cellDiv[0]));
                // value.failreason=msg;
                $indCell.addClass(this._getErrorClasses());
            },
            clearErrorCellIndicator : function(cellDiv) {
                var $indCell = this._$getCellIndicator(cellDiv);
                $indCell.removeClass(this._getErrorClasses()).removeData('msg');
            },
            applyInfoToCellIndicator : function(cellDiv, msg) {
                var $indCell = this._$getCellIndicator(cellDiv);
                $indCell.data('msg', msg);
                var value = this.getValueFromAxisLocation(this.locateCell(cellDiv[0]));
                // value.failreason=msg;
                $indCell.addClass(this._getInfoClasses());
            },
            clearInfoCellIndicator : function(cellDiv) {
                var $indCell = this._$getCellIndicator(cellDiv);
                $indCell.removeClass(this._getInfoClasses()).removeData('msg');
            },
            clearWarnCellIndicator : function(cellDiv) {
                var $indCell = this._$getCellIndicator(cellDiv);
                $indCell.removeClass(this._getWarnClasses()).removeData('msg');
            },
            _getErrorClasses : function() {
                return "ui-icon ui-icon-red ui-icon-alert cell-err";
            },
            _getInfoClasses : function() {
                return "ui-icon ui-icon-blue ui-icon-alert cell-info";
            },
            _getWarnClasses : function() {
                return "ui-icon ui-icon-yellow ui-icon-alert cell-warn";
            },
            _getItemInternalWidth : function(dataNode) {
                var currLevel = dataNode ? dataNode.level : 0;
                var alignMember = this._settings.branchIndent + currLevel * this._settings.levelOffset;
                return alignMember;
            },
            _getMissingAxesData : function(yr, xr, refreshAll) {
                var retVal = {
                    topAxisPathsStr : {},
                    sideAxisPathsStr : {},
                    measuresIds : {},
                    combiMeasuresIds : [[]]
                };
                var pathParts = null;
                var item = null;
                //below xChanged and yChanged logic is not required, 
                //we are already adding loadahead(70 default) to getsegment data request params.
                //var yChanged = false;
                //var xChanged = false;
                var miniLoadAhead = this._settings.loadahead;
                var columns = this._columns;
                var order = this.data.order;
                var pull = this.data.pull;
                var topAxisPathsStr = retVal.topAxisPathsStr;
                var sideAxisPathsStr = retVal.sideAxisPathsStr;
                var measuresIds = retVal.measuresIds;
                var combiMeasuresIds = retVal.combiMeasuresIds;
                var measure = null;
                var pathNoMeasure = null;
                var xDir = xr.dir;
                var yDir = yr.dir;
                var startRow = yDir ? Math.max(0, yr[0]) : Math.min(yr[1], this.data.order.length);
                var endRow =
                    yDir ? Math.min(yr[1] + miniLoadAhead, this.data.order.length) : Math.max(0, yr[0] -
                        miniLoadAhead);
                var rowStep = yDir ? 1 : -1;
                var startCol = xDir ? Math.max(0, xr[0]) : Math.min(xr[1], this._columns.length - 1);
                var endCol = xDir ? Math.min(xr[1] + miniLoadAhead, this._columns.length) : Math.max(
                        this._getDataSplitIdx(), xr[0] - miniLoadAhead);
                var colStep = 1;
                if( startCol > endCol ){
                	var tmp = startCol;
                	startCol = endCol;
                	endCol = tmp + 1;
                } 
                var mreasureRowId = -1;
                for ( var i = startRow, j = endRow; yDir ? i < j : i >= j; i += rowStep){
                    var sideAxisPath = order[i];
                    if (sideAxisPath){
                        item = pull[sideAxisPath];
                        if (!item){
                            item = {};
                            pull[sideAxisPath] = item;
                            pathParts = this._getAxisPathMeasureSplit(sideAxisPath);
                            sideAxisPathsStr[sideAxisPath[0]] = "1";
                            /*if (!yChanged){
                                yChanged = true;
                                j = j + (rowStep * this._settings.loadahead);
                                j = yDir ? Math.min(j, this.data.order.length) : Math.max(0, j);
                            }*/
                            if (!this.areMeasuresOnTop()){
                                measuresIds[pathParts[1]] = "1";
                            	combiMeasuresIds[pathParts[1]] = "1";
                            }

                        }
                        for ( var i1 = startCol, j1 = endCol; i1 < j1; i1 += colStep){
                            var column = columns[i1];
                            var topAxisPath = column.id;
                            var value = item[topAxisPath];
                            if (refreshAll || !value || value.isStale){

                                /*if (!yChanged){
                                    yChanged = true;
                                    j = j + (rowStep * this._settings.loadahead);
                                    j =
                                        yDir ? Math.min(j, this.data.order.length) : Math.max(
                                            this._getDataSplitIdx(), j);
                                }
                                if (!xChanged){
                                    xChanged = true;
                                    j1 = j1 + (colStep * this._settings.loadahead);
                                    j1 =
                                        xDir ? Math.min(j1, this._columns.length) : Math.max(
                                            this._getDataSplitIdx(), j1);
                                }*/
                                pathParts = this._getAxisPathMeasureSplit(sideAxisPath);
                              
                                if(!this.areMeasuresOnTop() && !sideAxisPathsStr[pathParts[0]]){
                                	mreasureRowId++;
                                	combiMeasuresIds[mreasureRowId] = [];
                                }
                                sideAxisPathsStr[pathParts[0]] = "1";
                                if (!this.areMeasuresOnTop() && !combiMeasuresIds[mreasureRowId].includes(pathParts[1])){
                                    measuresIds[pathParts[1]] = "1";
                                    combiMeasuresIds[mreasureRowId].push(pathParts[1]);
                                }
                                pathParts = this._getAxisPathMeasureSplit(topAxisPath);
                                if(this.areMeasuresOnTop() && !topAxisPathsStr[pathParts[0]]){
                                	mreasureRowId++;
                                	combiMeasuresIds[mreasureRowId] = [];
                                }
                                topAxisPathsStr[pathParts[0]] = "1";
                                if (this.areMeasuresOnTop() && !combiMeasuresIds[mreasureRowId].includes(pathParts[1])){
                                    measuresIds[pathParts[1]] = "1";
                                    combiMeasuresIds[mreasureRowId].push(pathParts[1]);
                                }
                            }
                        }
                    }
                    else{
                        // When can we hit this point?
                        // this should be pre-populated

                    }
                }
                if (Object.size(retVal.topAxisPathsStr) === 0 && Object.size(retVal.sideAxisPathsStr) === 0){
                    return null;
                }
                else{
                    return retVal;
                }

            },
            _hideColumnOld : function(index) {
                var col = this._columns[index];
                $(col.node).remove();
                // col.node=null;
                // col.attached = false
                col.attached = false;

                if (this._body.childNodes[index])
                    this._body.childNodes[index].firstChild.innerHTML = "";
            },
            _hideColumns : function(indexCollection,upperDocumentFragment, _areSameParent) {
                var i = 0, 
					len = indexCollection.length, 
					toBeRemovedElements = [], 
					areSameParent = areSameParent === undefined ? true : _areSameParent, 
					parentElement = _areSameParent? upperDocumentFragment :undefined, 
					colNode = undefined;
					grandParentElement = undefined;
                for (i = 0; i < len; i++){
                    var indexToBeRemoved = indexCollection[i];
                    var col = this._columns[indexToBeRemoved];
                    if (!col){
                        continue;
                    }

                    col.attached = false;
                    //col.toRemove = true;
                    col._yr0 = -1;
                    col._yr1 = -1;
					colNode = col.node;
					if (!colNode) {
						continue;
					}
					if (!_areSameParent&&areSameParent) {
						if (parentElement === undefined){
							parentElement = colNode.parentElement;
							// It seems that we belong to a DocumentFragment - no need to compare parents
							if (!parentElement) {
								areSameParent = false;
							}
						}
						else{
							areSameParent = areSameParent && parentElement === colNode.parentElement;
						}
					}
					toBeRemovedElements.push(col.node);
                }
				if (!toBeRemovedElements.length&&!_areSameParent) {
					return;
				}
				if (!parentElement) {
					return;
				}
				if(this.hasMemberSelector()){
					toBeRemovedElements.push(parentElement.firstChild);
				}
				
                if (areSameParent&&upperDocumentFragment===undefined){
                    pivotlog("Removed columns have the same parent. total=%d", len);
                    $grandParentElement =  $(parentElement).parent();
                    $(parentElement).detach();
                }
                $(toBeRemovedElements).remove();
                if (areSameParent&&upperDocumentFragment === undefined&&$grandParentElement.length ){
                    $grandParentElement.append(parentElement);
                }
            },
            /*_hideColumns : function(indexCollection) {
                var i = 0, len = indexCollection.length, toBeRemovedElements = [], areSameParent = true, parentElement = null, $grandParentElement = null;
                for (i = 0; i < len; i++){
                    var indexToBeRemoved = indexCollection[i];
                    var col = this._columns[indexToBeRemoved];
                    if (!col){
                        continue;
                    }

                    col.attached = false;
                    col.toRemove = true;
                    col._yr0 = -1;
                    col._yr1 = -1;
                    if (parentElement === undefined){
                        parentElement = col.parentNode;
                    }
                    else{
                        areSameParent = areSameParent && col.node && parentElement === col.node.parentNode;
                    }
                    toBeRemovedElements.push(col.node);
                }
                if (areSameParent){
                    pivotlog("Removed columns have the same parent. total=%d", len);
                    $grandParentElement = $(parentElement).parent();
                    $(parentElement).detach();
                }
                $(toBeRemovedElements).remove();
                if (areSameParent){
                    $grandParentElement.append(parentElement);
                }
            },*/
            _hideColumn : function(index) {
                var col = this._columns[index];
                var $node = $(col.node);
                col.attached = false;
                col._yr0 = -1;
                col._yr1 = -1;
                if ($node.length){

                    // var temp = dhtmlx.html.create("DIV");
                    // temp.style.width = col.width + "px";
                    // col.node = temp;
                    $node.empty();

                }
            },
            _removeColumn : function(index) {
                var col = this._columns[index];
                if (!col.attached)
                    return;
                $(col.node).remove();
                // col.node=null;
                // col.attached = false
                col.attached = false;
                var currNode = this._body.childNodes[1].firstChild.childNodes[index];
                if (currNode)
                    currNode.innerHTML = "";
            },
            /**
             * Calculates the width of the column header width. It does not take into account the columns width
             * of the row under the header.
             *
             * @param id
             *            The ID or Index of the column
             * @force If true the function will not optimize according to the size of the text and force
             *        calculation
             * @private
             * @return {number} The width of the header's DOM element.
             */
            _getSandboxSize : function(text, force, offset) {
                var widthChecked =
                        force ? 0 : (this._settings.standardColumnSizeChar - offset /
                                ((this._settings.standardColumnSize / this._settings.standardColumnSizeChar)));

                if (!force && text !== undefined && widthChecked < text.length){
                    return this._settings.standardColumnSize;
                }
                if (!this.sandboxValue){
                    this.sandboxValue = {};
                }
                var size = this.sandboxValue[text];
                if (size === undefined || size === null){
                	// Let's do it based on EM for speed sake
					size=text?text.length*this._settings.standardCharSize:0;
                   /* this.sandBoxDiv.innerHTML = text;
                    size = this.sandBoxDiv.scrollWidth;*/
                    this.sandboxValue[text] = size;
                }
                return size;
            },
            _getSimpleHtmlWidth : function(text) {
				this.sandBoxDiv.innerHTML = text;
                var size = this.sandBoxDiv.scrollWidth;
				return size;
			},
            _getColumnHeaderSize : function(id) {
                var headerNode = this._getColumnHeaderNode(id);
                var max = 0;
                var that = this;
                if (headerNode){
                    this.$_viewobj.find('.draggableFacet', headerNode).each(function(index) {
                        max = Math.max(max, that._getSandboxSize($(this).innerHTML));
                    });

                }
                return max;

            },
          //Locate the next immediate cell.
            _locateNextCell : function(cellId, direction, allowBeyondviewPort) {
            	var xr, yr;
            	//to get the next immediate cell in beyond the view port. using for copy paste.
            	if(allowBeyondviewPort){
            		xr = this._get_x_range(true);
            		/*If full render, then xr contains (0,this_columns.length), but the value should be this_columns.length -1. 
            		 * But the value is using in scrolling, so not to distrub that, we are deducting the value -1 here*/
            		xr[0] = this._settings.leftSplit; //This is starting index of data column.
            		xr[1] = xr[1]-1;
                    yr = this._get_y_range(true);
            	}else{
            		xr = this._getViewCoordinates().xr;//this._get_x_range_locate_cell(this._settings.prerender, true);
                    yr = this._getViewCoordinates().yr;//this._get_y_range_locate_cell(this._settings.prerender === true);                         	
            	}                    	
                var nextCellId=null;
                var rowIndex = this.indexById(cellId.row);
                var colIndex = this.columnIndex(cellId.column);
                //var cellEditable = false;
                var topBound = yr[0];
                var bottomBound = yr[1];
                var rightBound = xr[1];
                var leftBound = xr[0];
                if (direction == "right"){
                    colIndex++; // advance to the cell to the right.
                    if (colIndex > rightBound){
                        rowIndex++;
                        if (rowIndex > bottomBound){
                            rowIndex = topBound;
                        }
                        colIndex = leftBound;
                    }
                }
                else if (direction == "left"){
                    colIndex--; // advance to the cell to the right.
                    if (colIndex < leftBound){
                        rowIndex--;
                        if (rowIndex < topBound){
                            rowIndex = bottomBound;
                        }
                        colIndex = rightBound;
                    }
                }
                else if (direction == "down"){
                    rowIndex++; // advance to the cell below.
                    if (rowIndex > bottomBound){
                        // wrap to the next column if we were at the last row.
                        colIndex++;
                        if (colIndex > rightBound){
                            colIndex = leftBound;
                        }
                        rowIndex = topBound;
                    }
                }
                else if (direction == "up"){
                    rowIndex--; // advance to the cell below.
                    if (rowIndex < topBound){
                        // wrap to the next column if we were at the last row.
                        colIndex--;
                        if (colIndex < leftBound){
                            colIndex = rightBound;
                        }
                        rowIndex = bottomBound;
                    }
                }
                var colObj = this._columns[colIndex];
                var rowObj = this.data.order[rowIndex];
                if (colObj && rowObj){
                    nextCellId = {
                        row : rowObj,
                        column : colObj.id
                    };
                }
                return nextCellId;            
            },
            //End 
            _locateNextEditableCell : function(cellId, direction) {
            	pivotlog('navigating to next editable position using navigation keys');
            	var nextCellId;
            	var safeGuardCounter = 0;
            	var cellEditable = false;
               do{
                    safeGuardCounter++;
					var tmpNextCellId = this._locateNextCell(cellId, direction);
					cellEditable = this.isCellEditable(tmpNextCellId);
                    if (cellEditable){
                         nextCellId = tmpNextCellId;
                    }else{
                    	cellId = tmpNextCellId; //If Non-Editable cell, then we need to set the value to next cell to update the row count in _locateNextCell() function.
                    }
                }while (!cellEditable && safeGuardCounter != 1000);

                return nextCellId;
            },
            //Locate next immediate cell.
            _locateNextImmediateCell : function(cellId, direction,noScroll) {
            	var xr = this._getViewCoordinates().xr;
                var yr = this._getViewCoordinates().yr;                 	
                var nextCellId=null;
                var rowIndex = this.indexById(cellId.row);
                var colIndex = this.columnIndex(cellId.column);
                var topBound = yr[0];
                var bottomBound = yr[1];
                var rightBound = xr[1];
                var leftBound = xr[0];
                var scrollIncrement = 5;
                var scrollPos,currentScrollPosition;
                
                var doScroll = true;
                if(noScroll){
                	doScroll = false;
                }
                
                
                if (direction == "right"){
                    colIndex++; // advance to the cell to the right.
                    if(colIndex >= this._columns.length){
                    	return cellId;//If reaches to end of the column, then always return that column.
                    }else if (colIndex > rightBound && doScroll){
                    	//scrollPos = Math.abs(this.getStandardColumnSize() * scrollIncrement);
                    	scrollPos = Math.abs(this._columns[colIndex].width);
						currentScrollPosition = this._getDataArea().getScrollLeft();
						scrollPos += currentScrollPosition;
						scrollPos =Math.ceil(scrollPos);
						this._getDataArea().scrollTo(scrollPos);
                    }
                }else if (direction == "left"){
                    colIndex--; // advance to the cell to the left.
                    if(colIndex < leftBound){
                    	if(!this._isDataColumn(colIndex)){//If reach to starting point of the pivot, then just return the starting cell itself.
                    		return cellId;
                    	}
                    	if(doScroll){
                    		//scrollPos = this.getStandardColumnSize() * (scrollIncrement * -1);
                    		scrollPos = Math.abs(this._columns[colIndex].width) * -1
                        	currentScrollPosition = this._getDataArea().getScrollLeft();
                        	scrollPos += currentScrollPosition;
    						scrollPos =Math.ceil(scrollPos);
    						this._getDataArea().scrollTo(scrollPos);
                    	}
                    }
                }else if (direction == "down"){
                    rowIndex++; // advance to the cell below.
                    if(rowIndex >= this.data.order.length){
                    	return cellId;
                    }
                    if (rowIndex > bottomBound && doScroll){
                    	scrollPos = this._rowHeight * scrollIncrement;
                    	currentScrollPosition = this._y_scroll._viewobj.scrollTop;
                    	scrollPos += currentScrollPosition;
						scrollPos =Math.ceil(scrollPos);
						this._y_scroll.scrollTo(scrollPos);
                    }
                }else if (direction == "up"){
                    rowIndex--; // advance to the cell up.
                    if(rowIndex < 0){
                    	return cellId;
                    }
                    if (rowIndex < topBound && doScroll){
                    	scrollPos = this._rowHeight * (scrollIncrement * -1);
                    	currentScrollPosition = this._y_scroll._viewobj.scrollTop;
                    	scrollPos += currentScrollPosition;
						scrollPos =Math.ceil(scrollPos);
						this._y_scroll.scrollTo(scrollPos);
                    }
                }
                var colObj = this._columns[colIndex];
                var rowObj = this.data.order[rowIndex];
                if (colObj && rowObj){
                    nextCellId = {
                        row : rowObj,
                        column : colObj.id
                    };
                }
                return nextCellId;            
            },
            //End 
            
            _getViewCoordinates:function(){
            	return this.view_coordinates;
            },

            _get_attr_x_range : function(full, cellFullyVisible) {
                var size = 0;
                if (full)
                    return [ 0, this._columns.length ];

                var t = this._attrScrollLeft;

                var xind = this._getAttributeSplitIndex();
                while (t > 0){
                    var currColumn = this._columns[xind];
                    size = currColumn.width || currColumn.realSize;

                    t -= size;
                    xind++;
                }
                if (t < 0 && cellFullyVisible){
                    xind++;
                }
                var xend = xind;
                if (t)
                    xind--;

                t += this._attr_width;
                while (t > 0 && xend <this._getDataSplitIdx() && this._columns[xend] !== undefined &&
                    this._columns[xend] !== null)
                {
                    var currColumn = this._columns[xend];
                    if (!currColumn)
                        continue;
                    size = currColumn.width || currColumn.realSize;
                    t -= size;
                    xend++;
                }
                if (cellFullyVisible && t !== 0){
                    xend--;
                }
                return {
                    0 : xind,
                    1 : xend,
                    scrollLeft : this._attrScrollLeft
                };
            },
            _get_x_range : function(full, cellFullyVisible) {
                var size = 0;
                // variables required for finding co-ordinates of complete visible cell in column 
                var xind_offset=0,xend_offset=0,partialColEnd=undefined,
                partialColStart=undefined,partialScrollLeft=0,partialScrollRight=0;  
                if (full)
                    return [ 0, this._columns.length ];

                var t = this._scrollLeft;

                var xind = xind_offset = this._getDataSplitIdx();
                while (t > 0){
                    var currColumn = this._columns[xind];
                    size = currColumn.width || currColumn.realSize;

                    t -= size;
                    if(t>=0){
                    	xind_offset++;
                    }
                    xind++;
                }
                if (t < 0 ){
                	partialColStart=xind_offset; // identify partially visible column on left
                	partialScrollRight=-(t+size);// identiry partially cell scroll left
                    xind_offset++;// varib
                    if(cellFullyVisible)
                	xind++;
                    
                }
                var xend_offset=xind_offset;
                var xend = xind;
                if (t)
                    xind--;

                t += this._center_width;
                var standardColumnSize = this._settings.standardColumnSize;
                while (t > 0 && xend <this._getRightSplit() && this._columns[xend] !== undefined &&
                    this._columns[xend] !== null)
                {
                    var currColumn = this._columns[xend];
                    if (!currColumn)
                        continue;
                    size = currColumn.width || currColumn.realSize;
                    //When we expand level we don't know the columns size, default it's taking 50, 
                    //instead of taking defult better check with standardColumnSize and take which is maximum. 
                    size = Math.max(standardColumnSize, size);
                    t -= size;
                    if(t>0){
                    	xend_offset++;
                    }

                    xend++;
                }
                if (t !== 0){
                	partialColEnd=xend_offset;
                	partialScrollLeft=t;
                	xend_offset--;
                	if(cellFullyVisible)
                    xend--;
                }                
                var xr_offset= {
                	 0:xind_offset,
                	 1:xend_offset,
               		 partialColEnd:partialColEnd,
               		 partialColStart:partialColStart,
               		 partialScrollLeft:partialScrollLeft,
               		 partialScrollRight:partialScrollRight
               		 };
                this.view_coordinates.xr = xr_offset;
                return {
                    0 : xind,
                    1 : xend,
                    scrollLeft : this._scrollLeft
                };
            },
         // returns info about y-scroll position
            _get_y_range : function(full, max) {
            	var t = this._scrollTop;
            	if(this._y_scroll){
            		t =this._scrollTop= this._y_scroll._viewobj.scrollTop;
            	}
                pivotlog("y_range scroll TOP>>  "+t);
                // variables required for finding co-ordinates of complete visible cell in row 
                var yind_offset=0,yend_offset=0,partialColBottom=undefined,
                partialColTop=undefined,partialScrollTop=0,partialScrollBottom=0;
                
                var start = 0;
                var end = this.dataCount();
                // pivotlog('Running _get_y_range start=%d
				// end=%d',start,end);
                var pager = this._settings.pager;
                if (pager){
                    start = pager.page * pager.size;
                    end = Math.min(end, start + pager.size);
                }

                if (full) {
                    return [ start, Math.min(end, max === undefined ? end : max) ];
                }
                var yind = yind_offset = start;
                while (t > 0 && yind<end){
                    t -= this._getHeightByIndex(yind);
                    yind++;
                    yind_offset++;
                }
                
                // how much of the first cell is scrolled out
                var xdef = yind > 0 ? -(this._getHeightByIndex(yind - 1) + t) : 0;
                var yend = yind;
                // adjust scroll position .. as we are not showing partial cell on top 
                // make complete cell visible on top. for this after our calcution we have to adjust the scroll postion as per
                // starting index yind.
                if(this._y_scroll){
                this._scrollTop= this._y_scroll._viewobj.scrollTop = this._y_scroll._viewobj.scrollTop+ Math.abs(t);
                }
                if (t<0){
                	//yind--;
                	yind_offset--;
                	partialColTop=yind_offset;
                	partialScrollTop=xdef;
                    //t+=xdef;//this._getHeightByIndex(yind)-t;
                    yind_offset++;
                }
                var yend_offset = yind_offset;
                
                tStart = t;
                t = this._body.offsetHeight;
                yend=Math.max(0,yend);
             //   pivotlog('this._body.offsetHeight %d t=%d yend=%d end=%o',this._body.offsetHeight,t,yend,end);

                while (t > 0 && end>=yend ){
                	var rHeight=this._getHeightByIndex(yend);
             //    pivotlog('t=%d rHeight=%d',t,rHeight);
                    t -= rHeight;  
                    if(t>=0){
                    	yend_offset++;
                    	yend++;
                    }

                }
                
                if(t<0){
                	
                	partialColBottom=yend_offset;
                	partialScrollBottom=t;
                	yend_offset--;
                }
                yend_offset = Math.max(-1,yend_offset);
                var yr_offset ={
                        0 : Math.max(yind_offset,0),
                        1 : Math.min(yend_offset,end-1),
                        scrollTop : this._scrollTop,
                        partialScrollTop:Math.abs(partialScrollTop),
                        partialScrollBottom:Math.abs(partialScrollBottom),
                        partialColTop:partialColTop,
                        partialColBottom:partialColBottom
                    };
                this.view_coordinates.yr = yr_offset;
                
                yend=Math.max(-1,yend);
            // pivotlog('yend %d end %d',yend,end);
                return {
                    0 : Math.max(yind,0),
                    1 : Math.min(yend,end-1),
                    scrollTop : this._scrollTop
                };
            },

            _getColumnSize : function(ind, headers) {
                var dataNode = null;
                var i = 0;
                var item = null;
                var text = null;
                var levelWidth = null;
                var isDataArea = this._getDataSplitIdx() <= ind;

                var config = this._settings.columns[ind];
                if (!config.node){
                    return Number.NaN;
                }
                // var max = Number.NEGATIVE_INFINITY;
                // Let's start with 30px
                var max = 30;
                // set minimum width of the column
                var max = this._settings.standardColumnSize;
                var currCol = this._columns[ind];
                var dataNodeIndex = -1;
                if (currCol.isMeasure){
                    dataNodeIndex = this.getSideAxisView().facets.length;
                }
                else if (!isDataArea){
                    dataNodeIndex = this.getSideAxisView().getFacetNodeIndexFromVisibleIndex(ind);
                }
                else{
                    dataNodeIndex = ind;
                }
                currCol.realSize = currCol.userSetWidth || currCol.realSize;
                if (currCol.realSize !== undefined && currCol.realSize !== null){
                    return currCol.realSize;
                }
                if ((currCol.adjust || !currCol.headerOverrideWidth) && currCol.node){
                    if (!isDataArea){
                    	 var measureCount=this._getCubeDefinition().visiblemeasures.length;
                         var isMeasureColumn = config.isMeasure;
                         var incrCounter = 1;
                         if(!this.areMeasuresOnTop() && !isMeasureColumn){
                        	 incrCounter = measureCount;
                         }
                        for (i = 0; i < this.data.order.length; i+=incrCounter){
                        	//MDAP-3306 - As this function intended to set the column length, as measures will repeat, 
                        	//no need to iterate all the columns when current column is measure column. Can break the loop once all the measures iterated.
//                        	if(isMeasureColumn && i >= measureCount){
//                        		break;
//                        	}
                        	//TODO: Above code is commented as with PDM splits measures length is no longer limited to only visible measures.
                        	//Still need to optimizie the loigc
                            item = this.item(this.data.order[i]);
                            if (item){
                                text = this._getValue(item, config, i);
                                if (!item.calcWidths){
                                    item.calcWidths = {};
                                }
                                var calcWidth = item.calcWidths[config.id];
                                dataNode = item.dataNodes ? item.dataNodes[dataNodeIndex] : null;
                                levelWidth = this._getItemInternalWidth(dataNode);
                                if (!calcWidth){
                                	calcWidth = (currCol.isMeasure)? (this._getSimpleHtmlWidth(text)+ (this.hasExpandableMeasure() ? 28 :0)) : this._getSandboxSize(text, true, levelWidth);
                                	//preparing memberName and measure width if showEllipsisOnMemberName is true  
                                	if(this.showEllipsisOnMemberName()){
                                		if(currCol.isMeasure){
                                			//maximum with of measure column is around 240(this._settings.standardColumnSize*2);
                                			calcWidth = Math.min(this._getSimpleHtmlWidth(text), this._settings.standardColumnSize*2);
                                		}else{
                                			calcWidth = Math.min(calcWidth, this._settings.standardColumnSize);
                                		}
                                	}
                                    item.calcWidths[config.id] = calcWidth;
                                }
                                max = Math.max(calcWidth + levelWidth, max);
                            }
                        }
                    }
                    /*
                     * text = this._getValue(item, config, i); dataNode = item.dataNodes ?
                     * item.dataNodes[item.dataNodes.length - (this.areMeasuresOnTop() ? 1 : 2)] : null;
                     * levelWidth = this._getItemInternalWidth(dataNode); var scrollDiv =
                     * this._getSandboxSize(text, false, levelWidth); max = Math.max(scrollDiv + levelWidth,
                     * max);
                     */var baseColWidth = 0;
                    var colWidth = 0;
                    var colNode = this._getColumnHeaderNode(currCol.id);
                    if (currCol.sharedColumn && colNode && colNode.firstChild){
                        var subColParentChildren = colNode.firstChild.firstChild.childNodes;
                        // var filterNode = subColParentChildren.item(0);
                        var facetNodes = subColParentChildren.item(0).firstChild.childNodes;
                        baseColWidth = this._getSandboxSize(facetNodes.innerHTML);
                        for ( var indexFctHdr = 0; indexFctHdr < facetNodes.length; indexFctHdr++){
                            var currentFacetNode = facetNodes.item(indexFctHdr);
                            if (currentFacetNode.calcWidth === undefined && currentFacetNode.calcWidth === null)
                            {
                                currentFacetNode.calcWidth = this._getSandboxSize(currentFacetNode.innerHTML);
                            }
                            colWidth =
                                Math
                                    .max(
                                    (currentFacetNode.calcWidth === undefined ? 0 : currentFacetNode.calcWidth),
                                    colWidth);
                        }
                        colWidth += baseColWidth;

                    }
                    else{
                        // colWidth = this._getColumnHeaderSize(currCol.id);
                    }
                    max = Math.max(colWidth, max);

                }

                headers = currCol.header;
                if (!jdapivot.isArray(headers)){
                    headers = [ {
                        text : headers
                    } ];
                }
                for (i = 0; i < headers.length; i++){
                	 var currHeader = headers[i];
                    if (currHeader){
                        var header = currHeader;
                        calcWidth = this._getSandboxSize(header);
                    	if(this.showEllipsisOnMemberName()){
                    		if(this.areMeasuresOnTop() && currCol.type === "data" && i == headers.length -1 ){
                    			calcWidth = Math.min(this._getSimpleHtmlWidth(header), calcWidth);
                    		}else{
                    			calcWidth = Math.min(calcWidth, this._settings.standardColumnSize);
                    		}
                    	}
                        max = Math.max(calcWidth + this._getItemInternalWidth(), max);
                    }
                }
                currCol.realSize = max;
                return currCol.realSize;
            },
            _getValue : function(item, config, i) {
                var value;

                if (config.template)
                    value = config.template(item, this.type, config, i);
                else{
                    var cell = item[config.id];
                    if (cell && cell.content !== undefined){
                        value = cell.content;
                    }
                    else{
                        value = cell;
                    }
                }

                if (value === dhx.undefined){
                    value = _pns.Constants.spacer;
                }
                else if (config.format && value !== "")
                    value = (value.toFixed(2));

                return value;
            },
            _getExpandedAxisPaths : function(axisId,keepState) {

                var retValStr = {};
                var retVal = [];
                // Top axis
                if (axisId === 1){
                    var hasMeasures = this.areMeasuresOnTop();
                    if(keepState && this.data.cube.backup_definition.state){
                    	hasMeasures = !this.data.cube.backup_definition.state.measureWereOnSide;
                    	if(this.data.cube.backup_definition.state.topVisibleFacets.length !== this.getTopAxisView().getVisibleFacets().length){
                        	return retVal;
                        }
                    }
                   
                	for ( var iCol = this._getDataSplitIdx(), length = this._columns.length; iCol < length; iCol++)
                    {
                        var currCol = this._columns[iCol];
                        var noMsrId = currCol.id.split(_pns.Constants.measurePathSeperator)[0];
                        if (!retValStr[noMsrId]){
                            retVal.push(_pns.axisPath.getCondensedAxisPath(currCol.axisPath, hasMeasures));
                            retValStr[noMsrId] = true;
                        }
                    }
                    
                }
                // Side axis
                else{
                    var hasMeasures = !(this.areMeasuresOnTop());
                    if(keepState && this.data.cube.backup_definition.state){
                    	hasMeasures = this.data.cube.backup_definition.state.measureWereOnSide;
                    	if(this.data.cube.backup_definition.state.sideVisibleFacets.length !== this.getSideAxisView().getVisibleFacets().length){
                    		return retVal;
                    	}
                    }
                    
                	for ( var iRow = 0, length = this.data.order.length; iRow < length; iRow++){
                        var currRow = this.data.item(this.data.order[iRow]);
                        var noMsrId = currRow.id.split(_pns.Constants.measurePathSeperator)[0];
                        if (!retValStr[noMsrId]){
                        	retVal.push(_pns.axisPath.getCondensedAxisPath(currRow.axisPath, hasMeasures));
                        	retValStr[noMsrId] = true;
                        }
                    }

                }
                return retVal;
            },
            _getCellData : function(item, config, i) {
                var cell = item[config.id];
                if (cell&&item&&item.id&&config&&config.id) {
                    cell.row = item.id;
                    cell.column = config.id;
                }
                return cell;
            },
            getValueFromAxisLocation : function(pivotLocation) {
                var id = {
                    row : pivotLocation[0],
                    column : pivotLocation[1]
                };
                var item = this.data.pull[id.row];
                if (item === undefined)
                    return {};
                var value = item[id.column];
                return value;

            },
            _getcubeDefinitionRequest: function() {
            	pivotlog("start jda_pivot.js _getcubeDefinitionRequest :"+this.getFormatedTime());
                var viewRequest = new jda.pivot.cubeRequest({

                });
                viewRequest.isCubeMetadataChanged = true;
                this.data.pivotCommands[viewRequest.id] = viewRequest;
                this.data.feed.call(this, this.data.url, "jda_pivot_json", viewRequest._getPayload());
                pivotlog("end jda_pivot.js _getcubeDefinitionRequest :"+this.getFormatedTime());
            },
            
            reloadPivotWithExpand: function() {
            	pivotlog("start jda_pivot.js reloadPivotWithExpand :"+this.getFormatedTime());
                var viewRequest = new jda.pivot.cubeRequest({

                });
                this.previousViewPort = this._getViewportRestoreCenter();
                this.prepareSubmeasureExpandCache();
                viewRequest.isCubeMetadataChanged = true;
                this.data.pivotCommands[viewRequest.id] = viewRequest;
                viewRequest.withExpand = true;
                this.data.feed.call(this, this.data.url, "jda_pivot_json", viewRequest._getPayload());
                pivotlog("end jda_pivot.js reloadPivotWithExpand :"+this.getFormatedTime());
            },
            
            panToRow:function(id,middle){
                pivotlog('pan to row id=%o',id);
                var ind = this.indexById(id);
                
                if (ind==null) {
                    return null;
                }
                
                if (!this._dtable_height){
                    this._dtable_height = this._get_total_height();
                }
                var dataHeight = this._dtable_height;
                var viewHeight = Math.min(this._content_height,dataHeight);

                var summ = 0;
                 for (var i = 0; i < ind; i++) {
                    summ+=this._getHeightByIndex(i);
                }
               
                 this._scrollTop = summ;
                this._y_scroll.scrollTo(summ);
                return true;
            },
            panToColumn:function(id,middle){
                var ind = this.columnIndex(id);
                if (ind==null) {
                    return null;
                }
                var summ = 0;
                if( this._center_width > this._dtable_width){

                    this._scrollLeft = summ;
                    this._getDataArea().scrollTo(summ);
                    return true;
                }

                var dataWidth = this._dtable_width;
                var viewWidth = this._center_width;
                for (var i = this._getDataSplitIdx(); i < ind; i++) {
                    var currColumn = this._columns[i];
                    var size = currColumn.width || currColumn.realSize;
                    summ+=size;
                }
                this._scrollLeft = summ;
                this._getDataArea().scrollTo(summ);

                return true;
            },
            showItem:function(id){
                return this.showIndex(this.indexById(id));
            },
            _getSurroundingPoints: function(centerLocation,maxAltPoints) {
                var allPoints=[];
                var points={};
                var key=null;
                var startingRowIndex = this.indexById(centerLocation.row);
                var startingColIndex = this.columnIndex(centerLocation.column);
                var centerPoint={column:centerLocation.column,row:centerLocation.row,x:startingColIndex,y:startingRowIndex};
                allPoints.push(centerPoint);
                points[key=JSON.stringify(centerPoint)]=centerPoint;
                //       pivotlog("center point %s",key);
                var maxX = this._columns.length-1;
                var minX = this._getDataSplitIdx();
                var minY = 0;
                var maxY = this.data.order.length-1;
                var steps = 12;
                var maxRadius = 10;

                var ratio = Math.PI/(steps/2);
                for (var iRadius=1;iRadius<=maxRadius&&maxAltPoints;iRadius+=0.1) {
                    for (var iAngle=0;iAngle<steps&&maxAltPoints;iAngle++) {
                        var xPoint=Math.max(Math.min(Math.floor(Math.sin(iAngle*ratio)*iRadius+startingColIndex),maxX),minX);
                        var yPoint=Math.max(Math.min(Math.floor(Math.cos(iAngle*ratio)*iRadius+startingRowIndex),maxY),minY);

                        var point={x:xPoint,y:yPoint,column:this.columnId(xPoint),row:this.idByIndex(yPoint)};
                        var key=JSON.stringify(point);
                        if (!points[key]) {
                            points[key]=point;
                            allPoints.push(point);
                            //        pivotlog("point %s",key);
                            maxAltPoints--;
                        }

                    }
                }
                return allPoints;
            },
            _getViewportRestoreCenter: function(){
                var xr=this._get_x_range(false);
                var yr=this._get_y_range(false);
                return {column:this.columnId(xr[0]),row:this.idByIndex(yr[0])};
            },
            _getColumnsStickyData: function() {
                var colsDefs={};
                _.each(this._columns,function(column,index){
                    if (column.userSetWidth!==undefined) {
                        colsDefs[column.id]={userSetWidth :column.userSetWidth };
                    }

                },this);
                return colsDefs;
            },
            _getExpandPivotParams: function(contextPoint,keepState) {
                var params = {}, topExpandedAxisPaths = this._getExpandedAxisPaths(1,keepState), sideExpandedAxisPaths =
                    this._getExpandedAxisPaths(0,keepState);
                params.sidePaths = sideExpandedAxisPaths;
                params.topPaths = topExpandedAxisPaths;
                params.showEmpty = false;
                this.previousViewPort || (this.previousViewPort = this._getViewportRestoreCenter());
                return params;
            },
            _getExpandPivotRequest: function(params,keepState,keepSubmeasureState, addNewAxisChilds) {
            	if(keepState){
            		params = this._getExpandPivotParams(null,keepState);
            	}else{
            		params = params || this._getExpandPivotParams();
            	}
            	if(keepSubmeasureState){
            		this.prepareSubmeasureExpandCache();
            	}
            	
            	if(addNewAxisChilds){
            		params.addNewAxisChilds = true;
            	}
            	
                delete params.sortTriggered;
                delete params.sortSent;

                var expandPivotRequest = new jda.pivot.expandPivotRequest(params);

                this.data.pivotCommands[expandPivotRequest.id] = expandPivotRequest;

                this._resetPivotView();
                this.data.feed.call(this, this.data.url, "jda_pivot_json", expandPivotRequest._getPayload());

            },
            prepareSubmeasureExpandCache: function(){
    			// cache expanded submeasures
            	if(this.hasExpandableMeasure()){
            		this.data.expandedSubmeasures =[];
            		
            		if(this.data.expandDataObj){
            			for(var key in this.data.expandDataObj){
            				this.data.expandedSubmeasures.push(key);
            			}
            		}

            	}
            },
            _getGetCellDetailsRequest: function(id, config) {

                var params={
                    topAxisPath         :id.topAxisPath,
                    sideAxisPath        :id.sideAxisPath,
                    measureId           :id.measureId,
                    baseAttributes:     {},
                    extraAttributes:        {},
                    blackListedAttributes   :   {}
                };
                var getCellDetailsRequest = new jda.pivot.getCellDetailsRequest(params,config);
                this.data.pivotCommands[getCellDetailsRequest.id] = getCellDetailsRequest;
                this.data.feed.call(this, this.data.url, "jda_pivot_json", getCellDetailsRequest._getPayload());
            },
            _getGetScenariosRequest: function(config) {

                var params={
                };
                var getScenariosRequest = new jda.pivot.getScenariosRequest(params, config);
                this.data.pivotCommands[getScenariosRequest.id] = getScenariosRequest;
                this.data.feed.call(this, this.data.url, "jda_pivot_json", getScenariosRequest._getPayload());
            },
            _getGetScenarioStatusRequest: function(config) {

                var params={
                };
                var getScenarioStatusRequest = new jda.pivot.getScenarioStatusRequest(params, config);
                this.data.pivotCommands[getScenarioStatusRequest.id] = getScenarioStatusRequest;
                this.data.feed.call(this, this.data.url, "jda_pivot_json", getScenarioStatusRequest._getPayload());
            },
            _getAddScenarioRequest: function(scenarioName, config) {

                var params={
                    scenarioName:   scenarioName,
                };
                var addScenarioRequest = new jda.pivot.addScenarioRequest(params, config);
                this.data.pivotCommands[addScenarioRequest.id] = addScenarioRequest;
                this.data.feed.call(this, this.data.url, "jda_pivot_json", addScenarioRequest._getPayload());
            },
            _getSetScenariosRequest: function(scenarioNames, config) {
                var params = {
                    scenarioName: scenarioNames
                };
                var setScenariosRequest = new jda.pivot.setScenariosRequest(params, config);
                this.data.pivotCommands[setScenariosRequest.id] = setScenariosRequest;
                this.data.feed.call(this, this.data.url, "jda_pivot_json", setScenariosRequest._getPayload());
            },
            
            _getDeleteScenarioRequest: function(scenarioName, config) {

                var params={
                    scenarioName:   scenarioName
                };
                var deleteScenarioRequest = new jda.pivot.deleteScenarioRequest(params, config);
                this.data.pivotCommands[deleteScenarioRequest.id] = deleteScenarioRequest;
                this.data.feed.call(this, this.data.url, "jda_pivot_json", deleteScenarioRequest._getPayload());
            },

            _call_onMultiEditResponse:function(response,request){
            	pivotlog("start jda_pivot.js _call_onMultiEditResponse :"+pivotObjForRef.getFormatedTime());

                var sideAxis = this.getSideAxisView();
                var topAxis = this.getTopAxisView();
               
                //var that = this;
                // updateFacts has a different structure. Will adjust as
                // needed.
                var sideAxisPaths = request.params.sideAxisPaths || request.params.viewSegment.sideAxisPaths;
                var topAxisPaths = request.params.topAxisPaths || request.params.viewSegment.topAxisPaths;

                var measuresIds = request.params.combiMeasuresIds;
                var pull = this.data.pull;
                var order = this.data.order;
                var iOrder = order.length;
                var values = response.result;
                var item = null;
                //this.purgeStaleData();
                var i, j, k = 0;
                var iteratedRowsPaths = {};
                var iteratedColsPaths = {};
                for (i = 0; i < sideAxisPaths.length; i++){
                    for (j = 0; j < topAxisPaths.length; j++){
                        for (k = 0; k < measuresIds[this.areMeasuresOnTop() ? j : i].length; k++){
                            // Let's build the top axis path
                            var currSideAxisPath =
                                !this.areMeasuresOnTop() ? sideAxis.getMeasureRowIdFromAxisPath(
                                    sideAxisPaths[i].axisPath, measuresIds[i][k]) : sideAxis
                                    .getMeasureRowIdFromAxisPath(sideAxisPaths[i].axisPath);
                            var currTopAxisPath =
                                this.areMeasuresOnTop() ? topAxis.getMeasureRowIdFromAxisPath(
                                    topAxisPaths[j].axisPath, measuresIds[j][k]) : topAxis
                                    .getMeasureRowIdFromAxisPath(topAxisPaths[j].axisPath);
                            // There should ALWAYS be an item member to
                            // put the data in.
                            item = pull[currSideAxisPath];
                            iteratedRowsPaths[currSideAxisPath] = 1;
                            /***********************************************************************************
                             * if (!(item=pull[currSideAxisPath])){ //if such ID already exists - update instead
                                     * of insert order[iOrder]=currSideAxisPath; item={}; pull[currSideAxisPath]=item; }
                             **********************************************************************************/
                            if (!item)
                                continue;
                            if (values.length !== 0){
                                var cell = item[currTopAxisPath];
                                iteratedColsPaths[currTopAxisPath] = 1;
                                var isNew = false;
                                var cellVal = values[i][j][k];
                                if (!cell){
                                    cell = {};
                                    item[currTopAxisPath] = cell;
                                    isNew = true;
                                }

                                // We don't want a non-editable and protected cell to appear
                                // as protected, so we only adjust the isProtected status if 
                                // the cell is editable.
                                if(cell.write != 'R') {
                                    if ('isProtected' in cellVal){
                                        cell.isProtected = cellVal.isProtected;
                                    } else {
                                        delete cell.isProtected;
                                    }
                                }

                                var cellKey =this._prepareCellKey(currSideAxisPath, currTopAxisPath);
                                if(this._hasPendingStatus(cellKey) && !cell.isProtected){
                                    cell.multiEdit =true;
                                    var lastEditedValue = this.lastEditedValues.get(cellKey)
                                    if(cell.dtype == 'doublerange' || cell.dtype == 'integerrange') {
                                    	// the user is allowed to edit a data range by replacing it
                                    	// with a single value.
                                    	cell.content.min = lastEditedValue;
                                    	cell.content.max = lastEditedValue;
                                    }else if(cell.dtype == 'string') {
                                    	cell.content = lastEditedValue;
                                        if (lastEditedValue.display === undefined) {
                                            delete cell.display;
                                        } else {
                                            cell.display = lastEditedValue.display;
                                        }
                                    }
                                    else {
                                    	cell.content=lastEditedValue;
                                    }
                                }
                            }

                        }
                    }

                }

                this.removeDataNotInSegment(iteratedRowsPaths, iteratedColsPaths);
                this.render();
                this._isUpdating = false;
                this.updateFocusedCell();
                
                var selectedCellId  = this.getSelected();
                if(!this.isCellEditable(selectedCellId)){
                	if(this.lastEventOnPivot && this.lastEventOnPivot.keyCode == 9){
                		selectedCellId = this._locateNextEditableCell(selectedCellId, "right");
                	}else{
                		selectedCellId = this._locateNextEditableCell(selectedCellId, "down");
                	}
                	this.select(selectedCellId.row, selectedCellId.column);
                    this.updateFocusedCell();
                };               
                pivotlog("end jda_pivot.js _call_onMultiEditResponse :"+pivotObjForRef.getFormatedTime());
            },

            getViewSegment:function(needMeasures){
                var viewRange = this._getRefreshRangeData(true);
                var sideAxisPaths = [];
                var topAxisPaths = [];
                var measuresIDs = [[]];
                if (viewRange){
                    var topAxisPathsStr = viewRange.topAxisPathsStr;
                    var sideAxisPathsStr = viewRange.sideAxisPathsStr;
                    measuresIDs = viewRange.combiMeasuresIds;
                    for ( var key in sideAxisPathsStr){
                        // var value = sideAxisPathsStr[key];
                        var axisPath = new _pns.axisPath(key);
                        sideAxisPaths.push({
                            axisPath : axisPath.facetPaths
                        });
                    }

                    for ( var key in topAxisPathsStr){
                        //var value = topAxisPathsStr[key];
                        var axisPath = new _pns.axisPath(key);
                        topAxisPaths.push({
                            axisPath : axisPath.facetPaths
                        });
                    }
                }

                var  viewSegment = {
                    topAxisPaths : topAxisPaths,
                    sideAxisPaths : sideAxisPaths
                };


                if(needMeasures){
                    viewSegment.measuresIds = measuresIDs;
                }
                return viewSegment;
            },
            _updateRenderCell:function(updateCellObj, updateCellId,callback){
                this._blockUI();
                this._isUpdating = true;
                var segment = this.getViewSegment(true);
                var visibleAttr = this._getVisibleAttributes();
                if(updateCellId){
                    var sideAxisPath = new _pns.axisPath(updateCellId.sideAxis);
                    var topAxisPath = new _pns.axisPath(updateCellId.topAxis);
                    var editCell={
                        topAxisPath : topAxisPath,
                        sideAxisPath : sideAxisPath
                    };
                    var editMeasureId = this.areMeasuresOnTop() ? topAxisPath.measure : sideAxisPath.measure;
                    if(this.isMultiEditActive){
                    	updateCellObj[_pns.Constants.transactionMode]=true;
                    }
                    var params = {
                        viewSegment : {
                            topAxisPaths : segment.topAxisPaths,
                            sideAxisPaths : segment.sideAxisPaths
                        },
                        combiMeasuresIds :updateCellId.measureId ? segment.measuresIds : visibleAttr,
                        editCell : editCell,

                        editMeasureIds : editMeasureId? editMeasureId : updateCellId.measureId,
                        value : updateCellObj,
                        updateMode : 'PROPORTIONAL'
                    };
                    var currVal="";
                    var item = this.data.pull[updateCellId.sideAxis];
                    if (item){
                    	currVal = item[updateCellId.topAxis];
                    }
                        
                    if(this.isMultiEditActive){
                    	this.lastEditedValues.clear();
                    	var key = this._prepareCellKey(updateCellId.sideAxis,updateCellId.topAxis);
                    	this.lastEditedValues.set(key,updateCellObj.value);
                    	this.isDataFilterEnabled() && this.getDataFilterController().setDisableFilterActions(true);
                        if (this.hooks.afterMultiEdit){
                            var retVal = this.hooks.afterMultiEdit.apply(this, [ updateCellId, updateCellObj, currVal ]);
                            if (!retVal)
                                return;
                        }

                    } else {
                        if (this.hooks.afterEdit){
                            var retVal = this.hooks.afterEdit.apply(this, [ updateCellId, updateCellObj, currVal ]);
                            if (!retVal)
                                return;
                        }
                    }
                    this._sendUpdateFactsRequest(params);
                }
            },
            _getMultiEditRequest:function(obj,updateCell){
                this._blockUI();
                this._isUpdating = true;
                var editMId=null;
                var edtCell=null;

                var segment = this.getViewSegment(true);

                if(updateCell){
                    var sideAxisPath = new _pns.axisPath(updateCell.sideAxis);
                    var topAxisPath = new _pns.axisPath(updateCell.topAxis);
                    edtCell={
                        topAxisPath : topAxisPath,
                        sideAxisPath : sideAxisPath
                    };
                    editMId = this.areMeasuresOnTop() ? topAxisPath.measure : sideAxisPath.measure;

                }

                var params = {
                    viewSegment : {
                        topAxisPaths : segment.topAxisPaths,
                        sideAxisPaths : segment.sideAxisPaths
                    },
                    combiMeasuresIds :segment.measuresIds,
                    editCell : edtCell,

                    editMeasureIds : editMId,
                    value : obj,
                    updateMode : 'PROPORTIONAL'
                };

                this._sendUpdateFactsRequest(params);
            },
           /* _getupdateFactsRequest: function(id, obj) {
                this._blockUI();
                this._isUpdating = true;

                var segment = this.getViewSegment(true);
                var sideAxisPath = new _pns.axisPath(id.sideAxis);
                var topAxisPath = new _pns.axisPath(id.topAxis);

                var params = {
                    viewSegment : {
                        topAxisPaths : segment.topAxisPaths,
                        sideAxisPaths : segment.sideAxisPaths
                    },
                    measuresIds : segment.measuresIds,
                    editCell : {
                        topAxisPath : topAxisPath,
                        sideAxisPath : sideAxisPath
                    },

                    editMeasureIds : this.areMeasuresOnTop() ? topAxisPath.measure : sideAxisPath.measure,
                    value : obj,
                    updateMode : 'PROPORTIONAL'
                    //cmt:commentText
                };

                var updateFactsRequest = new jda.pivot.updateFactsRequest(params);
                this.data.pivotCommands[updateFactsRequest.id] = updateFactsRequest;
                this.data.feed.call(this, this.data.url, "jda_pivot_json", updateFactsRequest._getPayload());

            },*/
            
          //UpdateFact and copy paste in one method.
            
            _getupdateFactsRequest: function(id, obj) {
         	   var params =  this._getUpdateCellInfo(id, obj);
         	   this._sendUpdateFactsRequest(params);
            },
            _sendUpdateFactsRequest : function(params){
            	var updateFactsRequest = new jda.pivot.updateFactsRequest(params);
                this.data.pivotCommands[updateFactsRequest.id] = updateFactsRequest;
                this.data.feed.call(this, this.data.url, "jda_pivot_json", updateFactsRequest._getPayload());
            },
            //Need to modified the method to re-use for copy+paste functionality as well.
            _getUpdateCellInfo: function(id, obj){
         	   this._blockUI();
                this._isUpdating = true;

                // var
                // measureId=(!this.areMeasuresOnTop())?axesArray[0].split(_pns.Constants.measurePathSeperator)[1]:axesArray[1].split(_pns.Constants.measurePathSeperator)[1];
                var sideAxis = id.sideAxis;                       
                if(!sideAxis){
             	   sideAxis = id.row;
                }
                var topAxis = id.topAxis;                       
                if(!topAxis){
             	   topAxis = id.column;
                }
                var sideAxisPath = new _pns.axisPath(sideAxis);
                var topAxisPath = new _pns.axisPath(topAxis);
                // ///////////////////////////////////////////////////////////////
                // /////////////// Check our view boundries
                // //////////////
                // ///////////////////////////////////////////////////////////////
                var viewRange = this._getRefreshRangeData(true);
                var sideAxisPaths = [];
                var topAxisPaths = [];
                var measuresIDs = [[]];
                if (viewRange){
                    var topAxisPathsStr = viewRange.topAxisPathsStr;
                    var sideAxisPathsStr = viewRange.sideAxisPathsStr;
                    measuresIDs = viewRange.combiMeasuresIds;
                    for ( var key in sideAxisPathsStr){
                        var value = sideAxisPathsStr[key];
                        var axisPath = new _pns.axisPath(key);
                        sideAxisPaths.push({
                            axisPath : axisPath.facetPaths
                        });
                    }
                    ;
                    for ( var key in topAxisPathsStr){
                        var value = topAxisPathsStr[key];
                        var axisPath = new _pns.axisPath(key);
                        topAxisPaths.push({
                            axisPath : axisPath.facetPaths
                        });
                    }
                    ;
                }
					
					var params = {
						viewSegment : {
							topAxisPaths : topAxisPaths,
							sideAxisPaths : sideAxisPaths
						},
						combiMeasuresIds : measuresIDs,
						editCell : {
							topAxisPath : topAxisPath,
							sideAxisPath : sideAxisPath
						},	
						editMeasureIds : this.areMeasuresOnTop() ? topAxisPath.measure : sideAxisPath.measure,
						value : obj,
						updateMode : 'PROPORTIONAL'
					};
					
					return params;
				
            },
            
            //End
            //Once we modified the above function to re-use for copy+paste functionality, we can remove this function.
            _getPastedCellsInfo: function(id, obj1, obj2){
         	   this._blockUI();
                this._isUpdating = true;
                var sideAxis = id.sideAxis;                       
                if(!sideAxis){
             	   sideAxis = id.row;
                }
                var topAxis = id.topAxis;                       
                if(!topAxis){
             	   topAxis = id.column;
                }
                var sideAxisPath = new _pns.axisPath(sideAxis);
                var topAxisPath = new _pns.axisPath(topAxis);
                // ///////////////////////////////////////////////////////////////
                // /////////////// Check our view boundries
                // //////////////
                // ///////////////////////////////////////////////////////////////
                var viewRange = this._getRefreshRangeData(true);
                var sideAxisPaths = [];
                var topAxisPaths = [];
                var measuresIDs = [];
                if (viewRange){
                    var topAxisPathsStr = viewRange.topAxisPathsStr;
                    var sideAxisPathsStr = viewRange.sideAxisPathsStr;
                    measuresIDs = viewRange.combiMeasuresIds;
                    for ( var key in sideAxisPathsStr){
                        var value = sideAxisPathsStr[key];
                        var axisPath = new _pns.axisPath(key);
                        sideAxisPaths.push({
                            axisPath : axisPath.facetPaths
                        });
                    }
                    ;
                    for ( var key in topAxisPathsStr){
                        var value = topAxisPathsStr[key];
                        var axisPath = new _pns.axisPath(key);
                        topAxisPaths.push({
                            axisPath : axisPath.facetPaths
                        });
                    }
                    ;
                }
					
					var params = {
						viewSegment : {
							topAxisPaths : topAxisPaths,
							sideAxisPaths : sideAxisPaths
						},
						combiMeasuresIds : measuresIDs,
						/*editCell : {
							topAxisPath : topAxisPath,
							sideAxisPath : sideAxisPath
						},*/	
						editMeasureIds : this.areMeasuresOnTop() ? topAxisPath.measure : sideAxisPath.measure,
						newValues : obj1,
						editCells : obj2,
						updateMode : 'PROPORTIONAL'
					};
					
					return params;
				
            },
            
            //End
            _getGraphDataRequest: function(data) {
                var sideAxisPath = new _pns.axisPath(data.cellId.sideAxis);
                var topAxisPath = new _pns.axisPath(data.cellId.topAxis);

                var params = {
                    measuresIds : data.availableMeasures,
                    selectedCell : {
                        topAxisPath : topAxisPath,
                        sideAxisPath : sideAxisPath
                    },
                    xAxisDimension : data.xaxis,
                    xAxisLevel : data.xaxisLevelId
                };

                var getGraphDataRequest = new jda.pivot.getGraphDataRequest(params);
                this.data.pivotCommands[getGraphDataRequest.id] = getGraphDataRequest;
                this.data.feed.call(this, this.data.url, "jda_pivot_json", getGraphDataRequest._getPayload());
            },
            _saveGraphSettingsRequest : function(data){
                var saveParams = {
                    measuresIds : data.availableMeasures,
                    xAxisDimension : data.xaxis,
                    xAxisLevel : data.xaxisLevelId,

                };
                var saveGraphSettingsRequest = new jda.pivot.saveGraphSettingRequest(saveParams);
                this.data.pivotCommands[saveGraphSettingsRequest.id] = saveGraphSettingsRequest;
                this.data.feed.call(this, this.data.url, "jda_pivot_json", saveGraphSettingsRequest._getPayload());
            },
            checkDefaultExportGovernor : function(){
            	if(this.exportGovernorRows() > this.defaultExportGovernorRows || this.exportGovernorCols() > this.defaultExportGovernorCols)
            	{
            		var errorMessage = this.getLocaleString('defaultExportGovernorExceededError',this.exportGovernorRows() ,this.exportGovernorCols(), 
            				this.defaultExportGovernorRows, this.defaultExportGovernorCols);
    				pivotObjForRef.triggerEvent('exportGovernorExceededErr',{errorMessage:errorMessage});
    				return false;	
            	}else{
            		return true;	
            	}
            },
            _exportToExcelRequest : function(data){

            	var params = {}; 
            	var topExpandedAxisPaths = this._getExpandedAxisPaths(1); 
            	var sideExpandedAxisPaths = this._getExpandedAxisPaths(0);
            	var sideAxisPathsState = this.data.order;
            	var topAxisPathsState = this._columns;

            	// Need to calculate header rows and cols based on 
            	// 1) facets on top/side 
            	// 2) measures on top/side
            	var headerRows= (this._getTopAxisFacetCount() + (this.areMeasuresOnTop() ? 1 : 0));
            	var totalRows = sideAxisPathsState.length + headerRows;
            	var totalCols = topAxisPathsState.length;
            	pivotlog("rows : " + totalRows + " cols: " +totalCols);
            	
            	if(totalRows > this.exportGovernorRows() || totalCols > this.exportGovernorCols())
            	{
            		var errorMessage = this.getLocaleString('ExportGovernorExceededError',this.exportGovernorRows() ,this.exportGovernorCols() );//pivotObjForRef.getLocaleString('selectionRangeExceededError',pivotObjForRef.copyGovernor());
    				pivotObjForRef.triggerEvent('exportGovernorExceededErr',{errorMessage:errorMessage});
    				
            	}
            	else{
            		var sideAxisPaths = [];
                	var topAxisPaths = [];
                	var iAxisPath = 0 ;
                	var measuresIDs = [[]];
                	var topAxisPathKeys={};
                	var sideAxisPathKeys={};
                	
                	var rowId = -1;
                	var areMeasuresOnTop = this.areMeasuresOnTop();
                	for (iAxisPath = 0 ; iAxisPath < sideAxisPathsState.length; iAxisPath++) {
                		var fullAxisPathObj = new _pns.axisPath(sideAxisPathsState[iAxisPath]);
                		var fullAxisPathObjFacets = fullAxisPathObj.facetPaths;
                		var sideDupId = null;
                		if (!areMeasuresOnTop) {
                			sideDupId=fullAxisPathObj.facetPaths;
                			if (sideDupId&&!sideAxisPathKeys[sideDupId]) {
                				sideAxisPathKeys[sideDupId]=1;
            					sideDupId = null;
            					rowId++;
            					measuresIDs[rowId] = []
            				}
                			var measure = fullAxisPathObj.getMeasureId();                        		
                			if (measure) {
                				measuresIDs[rowId].push(measure);
                			}
                		}
                		if (fullAxisPathObjFacets&&!sideDupId) {
                			sideAxisPaths.push(
                					{
                						axisPath : fullAxisPathObjFacets
                					}
                			);                       	                        		
                		}                        	
                	}

                	var colId = -1;
                	for (iAxisPath = 0 ; iAxisPath < topAxisPathsState.length; iAxisPath++) {
                		if (topAxisPathsState[iAxisPath].axisPath) {
                			var fullAxisPathObj = topAxisPathsState[iAxisPath].axisPath.slice(0);
                			var topDupId = null;
                			if (areMeasuresOnTop) {
                				topDupId = this._getAxisPathMeasureSplit(topAxisPathsState[iAxisPath].id)[0];
                				if (topDupId&&!topAxisPathKeys[topDupId]) {
                					topAxisPathKeys[topDupId]=1;
                					topDupId = null;
                					colId++;
                					measuresIDs[colId] = []
                				}
                				var measure = fullAxisPathObj[fullAxisPathObj.length-1][0];                        		
                				if (measure) {
                					measuresIDs[colId].push(measure);
                				}
                				fullAxisPathObj = fullAxisPathObj.slice(0,fullAxisPathObj.length-1);
                			}
                			if (fullAxisPathObj&&!topDupId) {
                				topAxisPaths.push(
                						{
                							axisPath : fullAxisPathObj
                						}
                				);                       	                        		
                			}                        	                  		
                		}
                	}

                	params.sideAxisPaths = sideAxisPaths,
                	params.topAxisPaths = topAxisPaths,
                	params.measuresIds = measuresIDs,

                	params.sidePaths = sideExpandedAxisPaths;
                	params.topPaths = topExpandedAxisPaths;
                	params.showEmpty = false;
                	params.exportRowsPerBatch = pivotObjForRef.exportRowsPerBatch();
                	params.userSettings = pivotObjForRef.getUserSettings(); 
                	
                	if(params.exportRowsPerBatch){
                		var exportToExcelRequest = new jda.pivot.exportToExcelRequest(params);
                    	var exportToExcelRequestPayload = exportToExcelRequest._getPayload();
                    	this.data.pivotCommands[exportToExcelRequest.id] = exportToExcelRequest;
                    	this.data.feed.call(this, this.data.url, "jda_pivot_json", exportToExcelRequestPayload);
                	}
            	}
            },
            _getupdateCommentRequest: function(id, obj) {
                this._blockUI();
               // this._isUpdating = true;
                var sideAxisPath = new _pns.axisPath(id.sideAxis);
                var topAxisPath = new _pns.axisPath(id.topAxis);

                /*if(obj.operation=="read")
                 {*/

                var singleTopAxis = [];
                var singleSideAxis = [];
                var measuresIDs = [];

                if(sideAxisPath.measure!=undefined)
                {
                    measuresIDs.push(sideAxisPath.measure);
                }
                else
                {
                    measuresIDs.push(topAxisPath.measure);
                }

                var axisPath;
                axisPath = new _pns.axisPath(id.sideAxis);
                singleSideAxis.push({
                    axisPath : axisPath.facetPaths
                });
                axisPath = new _pns.axisPath(id.topAxis);
                singleTopAxis.push({
                    axisPath : axisPath.facetPaths
                });

                var params = {
                    viewSegment : {
                        topAxisPaths : singleTopAxis,
                        sideAxisPaths : singleSideAxis
                    },
                    measuresIds : measuresIDs,
                    editCell : {
                        topAxisPath : topAxisPath,
                        sideAxisPath : sideAxisPath
                    },

                    editMeasureIds : this.areMeasuresOnTop() ? topAxisPath.measure : sideAxisPath.measure,
                    value : obj,
                    updateMode : 'PROPORTIONAL'
                    //cmt:commentText
                };
                //}

                var updateCommentRequest = new jda.pivot.updateCommentRequest(params);
                this.data.pivotCommands[updateCommentRequest.id] = updateCommentRequest;
                this.data.feed.call(this, this.data.url, "jda_pivot_json", updateCommentRequest._getPayload());

            },
            _resetPivotView : function() {
                this.clearAllData();
                // this.clearAll();
                this._markColumnsAsStale();
                this.resetViewPort();
            },
            
            _cleanUpPivotDefinition : function(){
            	 this.data.cube.backup_definition.expansionParam = this.data.cube.backup_definition.expansionParam || this._getExpandPivotParams();
                 this.data.cube.backup_definition.colsDefs = this.data.cube.backup_definition.colsDefs || this._getColumnsStickyData();
                 var colsDef=this.data.cube.backup_definition.colsDefs;
                 _.each(this._columns,function(column,index){
                     if (column.userSetWidth!==undefined) {
                         colsDef[column.id]={userSetWidth :column.userSetWidth };
                     }

                 },this);
                 this._resetPivotView();
                 // AjaxRequest.showWaitIndicator(this.getLocaleString('QuickLoading'));
                 delete this._getCubeDefinition().topAxis.visibleFacets;
                 delete this._getCubeDefinition().sideAxis.visibleFacets;
            },
            _setPivotAxesRequest : function(filter) {
            	
            	this._cleanUpPivotDefinition();
               
                var params={
                		  topAxis : this._getCubeDefinition().topAxis,
                          sideAxis : this._getCubeDefinition().sideAxis,
                          visiblemeasures : this._getCubeDefinition().visiblemeasures,
                          visibleFacets : this._getCubeDefinition().visibleFacets,
                          sortOrders : this._getCubeDefinitionSortParams()
                };
                if(filter && filter.length > 0){
                	params.filters = filter;
                }
                var setAxesRequest = new jda.pivot.setPivotAxes(params);
                
                
                this.data.pivotCommands[setAxesRequest.id] = setAxesRequest;
                this.data.feed.call(this, this.data.url, "jda_pivot_json", setAxesRequest._getPayload());
            },
            getPivotMdapBasePath : function() {
                this.pivotMdapBasePath=this.pivotMdapBasePath||(function(){
                    var retVal=$('Script.jda-pivot-file')[0] && $('Script.jda-pivot-file')[0].src.replace( /[^\/]*$/,'')+'../../';
                    return retVal;
                }());
                return this.pivotMdapBasePath;
            },
            getImgPath : function() {
                return this.getPivotMdapBasePath()+'/jda/images/';
            },
            getImgUrl : function(imageFileName) {
                return this.getImgPath()+imageFileName;
            },
            isShowWaitCancelIndicatiorVisible: function (){
                    	//return (this.$msgDiv!==undefined);
            	return this.getPivotController().isProcessingDialogVisible();
            },
            
            showWaitCancelIndicator : function(message) {
              //  console.log('*********************Location %o ',this.getPivotMdapBasePath());
                var that = this, $parent = $(dhtmlx.toNode((this.config.container || parent) || document.body)), imageLoc =
                    that.getImgUrl('animation_running.gif'), $img = $('<img />', {
                    'src' : imageLoc
                });

                var buttonText = this.getLocaleString("Cancel");
                this.$msgDiv = $("<div/>").append($img).append(message).appendTo("body").dialog({
                    modal : true,
                    dialogClass : "waitIndicator",
                    draggable : false,
                    width : '400',
                    position : [ 'center', 'middle' ],
                    show : 'fade',
                    buttons : {
                    	"Cancel" : function() {
                          if(that.canCancelRequest()){
                                that.triggerEvent('requestCancelled');
                                that.sendAbortRequest();
                            }else{
                                that.triggerEvent('loadCancelled');
                            }
                             $(this).remove();
                             delete that.$msgDiv;
                            
                        }
                    }
                });
                $('.ui-dialog-buttonpane button:contains(Cancel)').find('.ui-button-text').text(buttonText);
            },
            showExtjsWaitCancelIndicator: function(imageLoc, displayMsg, cancelBtnText){
            	this.getPivotController().showProcessingDialog(imageLoc, displayMsg, cancelBtnText);
            },
            hideWaitCancelIndicator : function() {
                if (this.$msgDiv){
                    this.$msgDiv.remove();
                    delete this.$msgDiv;
                }
                // document.getElementById('WorksheetWaitCancelIndicatorDiv').style.display = 'none';
            },
            hideExtjsWaitCancelIndicator : function(){
            	this.getPivotController().hideProcessingDialog();
            },
            _InitBlockUI : function() {
                // GK: Workaround for IE8 & IE9 IFRAME -
				// .FILTER(":FOCUS") - DOCUMENT.ACTIVEELEMENT RETURNS
				// UNSPECIFIED ERROR.
                document.documentElement.focus();
                //this.showWaitCancelIndicator(this.getLocaleString('Loading'));
                this.data.callEvent("onShowOverlaySpinner",[this.getImgUrl('loading_normal_24.gif'),this.getLocaleString('Loading'),this.getLocaleString("Cancel")]);

            },
            _blockUI : function() {
            	     onlyIfCallPending = (typeof onlyIfCallPending === 'undefined') ? false : onlyIfCallPending;
                 // We should block the wrapper of the pivot rather than a specific static element id
           //      this._blockUILayer('#pivotErrorLayer');
           // The fix below is a stop gap as we can have few pivot in the document but we want to block only our document. We should be blocking\unblocking the wrapper.
                     this._blockUILayer('div.pivotLayerElement',onlyIfCallPending);
            },
            _blockUILayer : function(selector,onlyIfCallPending) {
                onlyIfCallPending = (typeof onlyIfCallPending === 'undefined') ? false : onlyIfCallPending;
                var selectorObj = $(selector);
                var that = this;
                this.blockedLayers[selector] = selectorObj;
                _.delay(function(){
                  if (that.blockedLayers.length||(onlyIfCallPending&&!_.isEmpty(that.data.pivotCommands))) {
                      selectorObj.css('cursor', 'wait');
                  }  
                }, 500);
                
                //      selectorObj.bPopup();
            },
            _unblockUI : function() {
                //this.hideWaitCancelIndicator();
            	pivotObjForRef.data.callEvent("onHideOverlaySpinner", []);
                this._unblockUILayer('div.pivotLayerElement');
            },
            _unblockUILayer : function(selector) {
                var selectorObj = this.blockedLayers[selector];
                if (selectorObj){
                     //       selectorObj.unblock();
                            delete this.blockedLayers[selector];
                            selectorObj.css('cursor', '');
                }
                if (_.isEmpty(this.data.pivotCommands)) {
                	$('div.pivotLayerElement').css('cursor', '');
                }

            },

           /* _blockUILayer : function(selector,onlyIfCallPending) {
                onlyIfCallPending = (typeof onlyIfCallPending === 'undefined') ? false : onlyIfCallPending;
                var selectorObj = $(selector);
                var that = this;
                this.blockedLayers[selector] = selectorObj;
                _.delay(function(){
                    if (that.blockedLayers.length||(onlyIfCallPending&&!_.isEmpty(that.data.pivotCommands))) {
                        selectorObj.css('cursor', 'wait');
                    }
                }, 500);

                //      selectorObj.bPopup();
            },
            _unblockUI : function() {
                this.hideWaitCancelIndicator();
                this._unblockUILayer('div.pivotLayerElement');
            },
            _unblockUILayer : function(selector) {
                var selectorObj = this.blockedLayers[selector];
                if (selectorObj){
                    //       selectorObj.unblock();
                    delete this.blockedLayers[selector];
                    selectorObj.css('cursor', '');
                }
                if (_.isEmpty(this.data.pivotCommands)) {
                    $('div.pivotLayerElement').css('cursor', '');
                }

            },*/
            _errorBlockUI : function(data) {
            	var error = data.error;                    	
            	var customError = error.customError;
                var level = error.errorEnum.severity;
                var errorCode = error.errorEnum.code;
                var errorMsg = error.message;
                
            	if(customError){
            		level = customError.severity;
            		errorMsg = customError.message;
            		errorCode = customError.errorCode;
            	}
  
                var details = data.error.details;
                if (details)
                    errorMsg = (errorMsg + '\n' + details);
                errorMsg = errorMsg.replace(/\n/g, '<br>');
                var closeCSSColor = 'ui-icon-green';
                var msgColor = "#ef8c08";
                switch (level)
                {
                    case 'err':
                        msgColor = '#cd0a0a';
                        closeCSSColor = 'ui-icon-red';
                        break;
                    case 'wrn':
                        msgColor = '#ef8c08';
                        closeCSSColor = 'ui-icon-yellow';
                        break;
                    case 'inf':
                        this.triggerEvent('errorMsg',{msg:errorMsg});
                        this.resizePivot();
                        msgColor = '#228b22';
                        closeCSSColor = 'ui-icon-green';
                        return;
                }
                var $stackTracePanel=$('#pivotErrorLayer .accordion').accordion({
                    collapsible: true,
                    heightStyle:'fill',
                    active:false
                });
                var stackTrace=data.error.stackTrace;
                if (stackTrace){
                    stackTrace = stackTrace.replace(/\n/g, '<br>');
                    $stackTracePanel.show().find('.pivotErrorLayerStacktrace').html(stackTrace);
                }
                else
                {
                    $stackTracePanel.hide().find('.pivotErrorLayerStacktrace').text('');
                }
                $('#pivotErrorLayer .pivotErrorLayerMsg').html(errorMsg).css('color', msgColor);
                $('#pivotOKPrompt span').removeClass('ui-icon-red ui-icon-yellow ui-icon-green').addClass(
                    closeCSSColor);
                var selectorObj = this.blockedLayers['div.pivotLayerElement'] = $('div.pivotLayerElement');
                $('#pivotErrorLayer').bPopup({
                    appendTo :'body',
                    modalClose: false
                });
                $("#pivotErrorLayer .accordion").accordion("option", {
                    collapsible: true,
                    active: false
                });
            },
            _triggerMeasureOnlyAxisCall : function(axisId) {
                var currAxis = this._getCubeView()[axisId];
                var requestAxisPath = [];
                var axisFacets = currAxis.getFacets();
                requestAxisPath = currAxis.rootPath || currAxis.getRootPath(currAxis.facets.length);
                /*
                 * for ( var i = 0; i < axisFacets.length; i++) { requestAxisPath.push([ this.rootId ]); }
                 */
                var response = {
                    "result" : [ {
                        "id" : this.rootId,
                        "name" : "root",
                        "value" : "root",
                        "hasFacetChildren" : false
                    } ]
                };
                var request = {
                    "isMeasureOnlyAxis" : currAxis.isMeasureOnlyAxis(),
                    "isCubeMetadataChanged" : true,
                    "params" : {
                        "axisId" : axisId,
                        "axisPath" : requestAxisPath,
                        "showEmpty" : true,
                        "facetId" : currAxis.getFacets()[0].id
                    }
                };
                this._call_ongetchildren(response, request);
            },
            _getRootChildrenHierarchy : function(isCubeMetadataChanged) {
                this.rootLevelsInitialized = 0;
                $(this.$view).show();
                this.triggerEvent('initialized');
                var topVisibleFacets = this.getTopVisibleFacets();
                var nonRootFacetId = null;
                topVisibleFacets.map(function(value, key){
                    if(!(value.showRoot || nonRootFacetId)){
                        nonRootFacetId = value.id;
                    }
                });
                if ((topVisibleFacets.length === 0) ||(nonRootFacetId === null)){
                    // It's a measure only axis fake a request
                    this._triggerMeasureOnlyAxisCall(1);
                }
                else{
                    var firstTopFacet = topVisibleFacets[0];
                    this._getChildrenHierarchy(this.getTopAxisView().index, this.getTopAxisView()
                        .getRootLevelAxisPathParam(), nonRootFacetId, 1, isCubeMetadataChanged);
                }
            },
            triggerEvent: function(name, evt) {
                var that = this;
                var finalEvt = $.extend(jQuery.Event(name), evt,{pivot:that});
                this.getPivotContext().trigger(finalEvt);
            },
            /**************/
            /* Side pivot**/
            /**************/
            _markColumnsAsStale : function(areFacets, areData) {
                var headers = this._settings.columns;
                var headersCopy = this._columns;
                var dataSplit = this._getDataSplitIdx();
                var len = headers ? headers.length - 1 : -1;
                var endIdx = 0;
                if (!areFacets && areData){
                    endIdx = dataSplit;
                }

                if (areFacets && !areData){
                    len = dataSplit - 1;
                }

                for (; len >= endIdx; len--){
                    headers[len].isStale = true;
                }
                len = headersCopy ? headersCopy.length - 1 : -1;
                if (!areFacets && areData)
                    endIdx = dataSplit;
                if (!areFacets && areData)
                    len = dataSplit - 1;
                for (; len >= endIdx; len--){
                    headersCopy[len].isStale = true;
                }

            },
            _detachStaleColumns : function() {
                var headers = this._settings.columns;
                var headersCopy = this._columns;
                var len = headers ? headers.length - 1 : -1;
                for (; len >= 0; len--){
                    var header = headers[len];
                    if (header.isStale){
                        delete header.isStale;
                        header.attached = false;
                        if (header.node)
                            header.node.innerHTML = '';
                    }
                }
                var len = headersCopy ? headersCopy.length - 1 : -1;
                for (; len >= 0; len--){
                    var header = headersCopy[len];
                    if (header.isStale){
                        delete header.isStale;
                        header.attached = false;
                        if (header.node)
                            header.node.innerHTML = '';
                    }
                }
            },
            
            _getChildrenHierarchy : function(axisId, axisPath, facetId, depth, isCubeMetadataChanged) {
            	pivotlog("start jda_pivot.js _getChildrenHierarchy :"+pivotObjForRef.getFormatedTime());
                this.sandboxValue = {};
                this._blockUI(true);
                this.hideTooltips();
                
                var getChildrenHierarchyRequest = new jda.pivot.getChildrenHierarchyRequest({
                		axisId : axisId,
                		axisPath :  axisPath,
                		showEmpty : true ,
                		facetId : facetId,
        				depth : depth
                	});
              
                // Workaround IE8 timestamp wierdness
                if (this.data.pivotCommands[getChildrenHierarchyRequest.id]){
                    getChildrenHierarchyRequest.id++;
                }
                getChildrenHierarchyRequest.isCubeMetadataChanged = isCubeMetadataChanged === true;
                this.data.pivotCommands[getChildrenHierarchyRequest.id] = getChildrenHierarchyRequest;
                this.data.feed.call(this, this.data.url, "jda_pivot_json", getChildrenHierarchyRequest
                    ._getPayload());
                pivotlog("end jda_pivot.js _getChildrenHierarchy :"+pivotObjForRef.getFormatedTime());
            },
            _getSegmentData : function(sideAxisPaths, topAxisPaths, measures, xr, yr) {
            	pivotlog("start jda_pivot.js _getSegmentData :"+pivotObjForRef.getFormatedTime());
                this._blockUI(true);
                //   $(this.$view).parent().css('cursor', 'progress');
                this._isUpdating = true;
                this.semCheck++;
                var visibleAttr = this._getVisibleAttributes();
                var params = {
                    attributeIds : visibleAttr,
                    sideAxisPaths : sideAxisPaths,
                    topAxisPaths : topAxisPaths,
                    combiMeasuresIds : measures,
                    viewport : {
                        xr : xr,
                        yr : yr
                    },
                    showCommentDogears: this.cellCommentRelation(),
                };
                if(this.clearEditConflictErrors){
                	params.clearEditConflictErrors = this.clearEditConflictErrors
                }
                var getSegmentDataRequest = new jda.pivot.getSegmentDataRequest(params);
                getSegmentDataRequest.callback = this._call_refreshOnGetSegmentData;
                var payload = getSegmentDataRequest._getPayload();
                var cachedPayloadParams = JSON.stringify(params);
                // Could it be we're already waiting for a response on
                // the same request.
                var cachedPayloadParamas = this.mapSegmentRequestsLoad[cachedPayloadParams];
                if (!cachedPayloadParamas){
                    this.mapSegmentRequestsLoad[cachedPayloadParams] = "1";
                    this.data.pivotCommands[getSegmentDataRequest.id] = getSegmentDataRequest;
                    this.data.feed.call(this, this.data.url, "jda_pivot_json", payload);
                }
                pivotlog("end jda_pivot.js _getSegmentData :"+pivotObjForRef.getFormatedTime());
            },
            /**
             * Measure is getting expanded. Try to get from cache otherwise make server call to get submeasres
             */
            _expandMeasures : function(measureId,axisFacet,skipRender){
            	var subMeasures = this.getSubMeasuresForMeasure(measureId, true);
            	if(subMeasures){
            		this.onGetSubmeasures(subMeasures,this,axisFacet,skipRender);
            	}
            },
            /**
             * Add submeasures to expanded measure
             */
            onGetSubmeasures : function(subMeasures,pivotObj,axisFacet,skipRender){
            	if(pivotObj.areMeasuresOnTop()){
            		var isMeasureOnlyAxis = this.data.cube.view[1].getVisibleFacets().length==0;
            		 // Measures on Top is getting expanded
        			var data = pivotObj._settings.columns;
        			for(var index =0;  index < data.length; index++){
            		if(data[index].id == pivotObj.data.clickedRowpath){
            			
            			var newHeaderArray = [];
            			data[index].isExpanded = true;
            			data[index].subMeasures = []; // attach all submeasures for future use (i.e. last measure on column rendering)
            			for(var mInd=0;  mInd < subMeasures.length; mInd++){
            			
                			var newHeader = _.clone(data[index]);
                			
                			newHeader.isSubMeasure = true;
                			
                			newHeader.id = newHeader.id.split(_pns.Constants.measurePathSeperator)[0]+_pns.Constants.measurePathSeperator+subMeasures[mInd].id;
                			
                			newHeader.header = _.clone(newHeader.header);
                			
                			if(isMeasureOnlyAxis){
                				for(var headerInd=0; headerInd< newHeader.header.length; headerInd++  ){
                					newHeader.header[headerInd]= subMeasures[mInd].id;	
                				}
                			}else{
                				newHeader.header[newHeader.header.length-1]= subMeasures[mInd].id;	
                			}
                			
                			var axisMeasuerIndex = newHeader.axisPath.length - 1;
                			var axisPath = newHeader.axisPath.slice(0,axisMeasuerIndex);
                			axisPath.push([subMeasures[mInd].id]);
                			
                			newHeader.axisPath = axisPath;
                			
                			newHeader.dataNodes = _.clone(newHeader.dataNodes);
                			newHeader.dataNodes[axisMeasuerIndex].isExpanded = true;
                			newHeader.dataNodes[axisMeasuerIndex] = _.clone(newHeader.dataNodes[axisMeasuerIndex]);
                			
                			newHeader.dataNodes[axisMeasuerIndex].id = subMeasures[mInd].id;
                			newHeader.dataNodes[axisMeasuerIndex].name = subMeasures[mInd].label;
                			newHeader.dataNodes[axisMeasuerIndex].axisPath = axisPath;
                			
                			newHeader.dataNodes[axisMeasuerIndex].hasFacetChildren = false;
                			
                			var mesureNodeLength = newHeader.dataNodes[axisMeasuerIndex].parentNode.measureNodes.length;
                			var measureNode = _.clone(newHeader.dataNodes[axisMeasuerIndex].parentNode.measureNodes[mesureNodeLength-1]);
                			
                			measureNode.id = newHeader.id;
                			measureNode.name = subMeasures[mInd].label;
                			measureNode.axisPath =axisPath;
                			
                			data[index].subMeasures.push(_pns.axisPath.getMeasureIdFromAxisPathStr(measureNode.id) );
                			
                			newHeader.dataNodes[axisMeasuerIndex].parentNode.measureNodes.push(measureNode);
                			
                			delete newHeader.node;
                			newHeaderArray.push(newHeader);
            			}
            			
            			pivotObj._settings.columns.insertArray(index + 1, newHeaderArray);
            			pivotObj._columns = pivotObj._settings.columns;
            			
            			break; // Need not to continue
            			}
            		}
        			
            	}else{
            		var createdMemberCollection = _pns.utility.createSubmeasreStructure(subMeasures,pivotObj,pivotObj.data.clickedRowpath,axisFacet);
            		var memberArray = [];
            		for ( var memKey in createdMemberCollection){
            			var memVal = createdMemberCollection[memKey];
            			if (!(memKey in pivotObj.data.pull) ){
            				memberArray.push(memKey);
            				pivotObj.data.pull[memKey] = memVal; 
            				
            			}
            		}
            		pivotObj.data.order.insertArray(pivotObj.data.order.indexOf(pivotObj.data.clickedRowpath) + 1,memberArray);
            	}
            	pivotObj.data.expandDataObj = pivotObj.data.expandDataObj || {};
            	pivotObj.data.expandDataObj[pivotObj.data.clickedRowpath]=pivotObj.data.clickedRowpath;
            	pivotObj.data.clickedRowpath = undefined;
            	
            	if(!skipRender) pivotObj._initPivotWhenNeeded(true);
            },
            _buildAxisPathParam : function(facetsPathParams) {
                var retVal = jdapivot.toArray;
                for ( var i = 0; i < facetsPathParams.length; i++){
                    retVal.push({
                        id : facetsPathParams[i].id,
                        facetPath : facetsPathParams[i].facetPath,
                        showEmpty : facetsPathParams[i].showEmpty
                    });
                }
                return retVal;
            },
            _getVisibleMeasuresIds : function() {
                var retVal = [];
                for ( var index = 0; index < this._getCubeDefinition().visiblemeasures.length; index++){
                    retVal.push(this._getCubeDefinition().visiblemeasures[index].id);
                }
                return retVal;
            },
            _getTopAxisFacetCount : function() {
                return this._getCubeView()[1].getVisibleFacets().length;
            },
            _getFacetAxis : function(facet) {
                if (facet == undefined)
                    return false;
                facet = typeof facet === "object" ? facet : this.getFacetFromFacetId(facet);
                var retVal = null;
                var axisView = this._getCubeView()[1];
                $.each(axisView.getFacets(), function(index, facetObj) {
                    if (facetObj.id == facet.id){
                        retVal = axisView;
                        return false;
                    }
                });
                if (retVal)
                    return retVal;
                axisView = this._getCubeView()[0];
                $.each(axisView.getFacets(), function(index, facetObj) {
                    if (facetObj.id == facet.id){
                        retVal = axisView;
                        return false;
                    }
                });
                return retVal;
            },
            _getCubeDefinition : function() {
                return this.data.cube.definition;
            },
            _getCubeDefinitionUIAttributes : function() {
                return this._getCubeDefinition().uiAttributes;
            },
            _getCubeDefinitionUIAttribute : function(attributeName) {
                return this._getCubeDefinitionUIAttributes()[attributeName];
            },
            _setCubeDefinitionUIAttribute : function(attributeName, attributeValue) {
                return this._getCubeDefinitionUIAttributes()[attributeName] = attributeValue;
            },
            _getCubeDefinitionSortParams : function() {
                return this._getCubeDefinitionUIAttribute('sortParams');
            },
            _setCubeDefinitionSortParams : function(sortParams) {
                return this._setCubeDefinitionUIAttribute('sortParams', sortParams);
            },
            _getCubeView : function() {
                return this.data.cube.view;
            },
            _deleteAllSortParams:function(){
            	var sortParams = this._getCubeDefinitionSortParams();
            	if(sortParams && sortParams.length>0 ){
            		this.$sortStatusDivContent.empty();
            		delete this._getCubeDefinitionUIAttributes().sortParams; 
            	}
            },
            getSegmentData : function() {
                var getChildrenHierarchyRequest = new jda.pivot.getChildrenHierarchyRequest(this);
                this.data.pivotCommands[getChildrenHierarchyRequest.id] = this.getChildrenHierarchyRequest;
                this.data.feed.call(this, this.data.url, "jda_pivot_json", getChildrenHierarchyRequest
                    ._getPayload());
            },
            _renderStructureChange : function(skipRender,attr) {
                var data = {};              
                if (!skipRender) {
                	this._adjustChangedColumns();
                    this.render(0,'structureChange','',attr);
                    //this.renderMultiSelected();
                    this._clearMultiSelection();
                	this._clearCopiedData();//Remove the copied data area.
                	this._selectCell();
	      			this.updateFocusedCell();
                }
                this.dataNodeSwap = true;
                this.defferRendering=false;
                this._init_context_menus();
                // this._debounceApplyResizeHandler();
               // this.initAxisPathTooltip();
            },
            onColumnResized : function(e) {
                var columns = $(e.currentTarget).find("th");
                var msg = "columns widths: ";
                columns.each(function() {
                    msg += $(this).width() + "px; ";
                });

            },
            initAxisPathTooltip : function() {
            	var $body = $('body');
            	if($body.hasClass("facetTooltipDrawer") === false){
                    $('body')
                            .append(
                                    "<div class='facetTooltipDrawer' style='position: absolute;display: block;'>Test</div>");
                    $('body').append("<div class='commentsTooltipLayer' />");

                    $(".facetTooltipDrawer").height('0px').hide();
            	} 
                /*var that = this;
                $('body')
                    .append(
                    "<div class='facetTooltipDrawer' style='position: absolute;display: block;'>Test</div>");
                $('body').append("<div class='commentsTooltipLayer' />");

                $(".facetTooltipDrawer").height('0px').hide();
                // $('#draggableFacet').append("<div
                // id='sideAxisTooltip'>Test</div>");
                $('.dhx_hs_left').find('.sideFacet>:not(#hdr_mr)').each(function(index, element) {
                    // $(this).parent().corner("dog
                    // tr");
                    // $("<span class='commentTriangle'></span>").insertBefore($(this));
                    var grid = that;
                });*/
            },

            _loadInitialData : function() {
                this.data.feed.call(this, start, count, callback, null, null, exCols, startId);
            },
            _getVisibleAttributes:function(){
                var sideAxis = this.getSideAxisView();
                var attrs =[];
                // var visibleSideFacets = sideAxis.getVisibleFacets();
                var visibleAttributes = this._showAttributeArea() ? sideAxis.getVisibleAttributes() : null;
                var attrLength = visibleAttributes ? visibleAttributes.length :0;
                // Adding attribute information to attribute header
                for( var m=0; m<attrLength; m++){

                    attrs.push(visibleAttributes[m].id);

                }

                return attrs;
            },
            _facetNamesToHeaders : function() {
                var retVal = jdapivot.toArray();
                var sideAxis = this.getSideAxisView();
                var visibleSideFacets = sideAxis.getVisibleFacets();
                var visibleAttributes = this._showAttributeArea() ? sideAxis.getVisibleAttributes() : null;
                var topRowCount = this._getTopAxisFacetCount(); // header
                // row
                // count
                for ( var i = 0, j = visibleSideFacets.length; i < j; i++){
                    var obj = visibleSideFacets[i];
                    var columnDef =
                        new _pns.header(_pns.Constants.facetIdPrefix + obj.id, obj.getDisplayName(), true);
                    // If the measure are on top, we want the facet
                    // header to be in the lowest header row
                    var headerName = columnDef.header;
                    columnDef.header = [];
                    columnDef.header[0] = headerName;
                    columnDef.isAttr = false;
                    // if (topRowCount!=1)
                    // columnDef.header.splice(0,0,"Filter Drop Zone");
                    columnDef.header.unshift(" ");
                    for ( var k = 0; k < topRowCount - 2; k++){
                        columnDef.header.unshift(" ");

                    }

                    columnDef.corner = true;
                    columnDef.adjust = true;
                    retVal.push(columnDef);
                }

                var attrLength = visibleAttributes ? visibleAttributes.length :0;
                // Adding attribute information to attribute header 
                for( var m=0; m<attrLength; m++){

                    var attribute = visibleAttributes[m];

                    var attrColumnDef =
                        new _pns.attributeHeader(attribute.id,attribute.name,true,attribute.name);

                    var headerName = attrColumnDef.header;
                    attrColumnDef.header = [];
                    attrColumnDef.header[0] = headerName;
                    attrColumnDef.isAttr = true;
                    // if (topRowCount!=1)
                    // columnDef.header.splice(0,0,"Filter Drop Zone");
                    attrColumnDef.header.unshift(" ");
                    for ( var k = 0; k < topRowCount - 2; k++){
                        attrColumnDef.header.unshift(" ");

                    }

                    attrColumnDef.corner = true;
                    attrColumnDef.adjust = true;
                    retVal.push(attrColumnDef);

                }

                return retVal;
            },
            toggleSlide : function(element) {
                var pathText = "";
                var yr = this._get_y_range(this._settings.prerender === true);
                var topAxisPathStr = this.data.order[yr[0]];
                var topItem = this.data.item(topAxisPathStr);
                var now = new Date();
                if (topItem.dataNodes){
                    pathText = "";
                    for ( var index = 0; index < topItem.dataNodes.length; index++){
                        var facetText = "";
                        var currNode = topItem.dataNodes[index];
                        while (currNode){
                            facetText = currNode.name + facetText;
                            currNode = currNode.parentNode;
                            if (currNode){
                                facetText = "->" + facetText;
                            }
                        }
                        if (index !== 0){
                            pathText += "/";
                        }
                        pathText += facetText;
                    }
                }
                $('#facetTooltipDrawer').text(pathText);
            },
            _membersToHeaders : function(topAxisFacetMembers) {
                var retVal = jdapivot.toArray();
                topAxisFacetMembers = jdapivot.toArray(topAxisFacetMembers);
                topAxisFacetMembers.each(function(obj) {
                    var columnDef = new _pns.header(_pns.Constants.facetIdPrefix + obj.id, obj.name, false);

                    retVal.push(columnDef);
                }, this);
                return retVal;
            },
            _measurestoHeaders : function(measures) {
                var retVal = jdapivot.toArray();
                var topAxisFacetMembers = jdapivot.toArray(measures);
                topAxisFacetMembers.each(function(obj) {
                    var columnDef = new _pns.header(_pns.Constants.measureIdPrefix + obj.id, obj.name, true);
                    // Make sure similar parent rows are
                    // grouped
                    columnDef.groupValues = true;
                    retVal.push(columnDef);
                }, this);
                return retVal;
            },
            _areValuesSameParents : function(val1, val2, colIndex) {
                if (val1 === undefined || val2 === undefined || !val1.axisPath || !val2.axisPath)
                    return false;
                if (val1.level != val2.level)
                    return false;
                var retVal = val1.axisPath.length != val2.axisPath.length;
                if (colIndex !== undefined){
                    retVal = this._compareArrays(val1.axisPath[colIndex], val2.axisPath[colIndex]);
                    if (!retVal){
                        return false;
                    }
                }
                for ( var i = 0, j = val1.axisPath.length; (i < j) && (i < colIndex); i++){
                    retVal = this._compareArrays(val1.axisPath[i], (val2.axisPath[i]));
                    if (!retVal)
                        break;
                }
                return retVal;
            },
            _compareArrays : function(arr1, arr2) {
                if ((!arr1[0]) || (!arr2[0])){ // If either is not an array
                    return false;
                }
                if (arr1.length != arr2.length){
                    return false;
                }
                for ( var i = 0; i < arr1.length; i++){
                    if ((arr1[i] != arr2[i]))
                        return false;
                }

                return true;
            },
            getDimensions : function() {
                return this._getCubeDefinition().dimensions;
            },
            getMeasures : function() {
                return this._getCubeDefinition().measures;
            },
            getAxisFacets : function(index) {
                var axisName = this.axesNames[index];
                return axisName ? this._getCubeDefinition()[axisName].facets : [];
            },
            getSideAxisFacets : function() {
                return this._getCubeDefinition().sideAxis.facets;
            },
            getTopAxisFacets : function() {
                return this._getCubeDefinition().topAxis.facets;
            },
            getSideAxisView : function() {
                return this.data.cube.view[0];
            },
            getTopAxisView : function() {
                return this.data.cube.view[1];
            },
            getAxisView : function(index) {
                return this.data.cube.view[index];
            },
            getMeasuresAxisId : function() {
                return this.areMeasuresOnTop()?1:0;
            },
            getSideVisibleFacets : function() {
                return this.getSideAxisView().getVisibleFacets();
            },
            getTopVisibleFacets : function() {
                return this.getTopAxisView().getVisibleFacets();
            },
            areMeasuresOnTop : function() {
                return this.getTopAxisView().hasMeasures();
            },
            _getSegmentDataRequestPayload : function() {
                return false;
            },
            clearLocks : function() {
                this.sendClearLocksRequest(this._callOnLocksCleared);
            },
            sendCheckRequest:function(requestId,waitMillis,callbackHandler){
                    	  this.sendGenericRequest(_pns.getPivotPackagePrefix()+'protocol.CheckRequestRequest', {
                              'action' : 'isRequestDone',
                              'requestId':requestId,
                              'waitMillis':waitMillis
                          }, callbackHandler, false);
            },
            sendRequestCancelled:function(requestId,callbackHandler){
                    	  this.sendGenericRequest(_pns.getPivotPackagePrefix()+'protocol.CancelRequestRequest', {
                              'action' : 'cancelRequest',
                              'requestId':requestId                        
                          }, callbackHandler, false);
            },
            sendClearLocksRequest : function(callbackHandler) {
                this.sendGenericRequest(_pns.getPivotPackagePrefix()+'protocol.ClearLocksRequest', {
                    'action' : 'commit',
                    'isRetry' : false
                }, callbackHandler, false);
            },
            sendQuickLoadRequest : function(callbackHandler, isRetry, quickSaveId, quickSaveDesc) {
                isRetry = isRetry === undefined ? false : isRetry;
                this.sendGenericRequest(
                        _pns.getPivotPackagePrefix()+'protocol.QuickLoadRequest', {
                        'action' : 'quickLoad',
                        'isRetry' : isRetry,
                        'quickSaveId' : quickSaveId,
                        'quickSaveDesc' : quickSaveDesc
                    }, callbackHandler, isRetry);
            },
            sendQuickSaveRequest : function(callbackHandler, isRetry, quickSaveDesc) {
                isRetry = isRetry === undefined ? false : isRetry;

                this.sendGenericRequest(
                        _pns.getPivotPackagePrefix()+'protocol.QuickSaveRequest', {
                        'action' : 'quickSave',
                        'isRetry' : isRetry,
                        'quickSaveDesc' : quickSaveDesc
                    }, callbackHandler, isRetry);
            },
            sendCommitRequest : function(callbackHandler, isRetry) {
                isRetry = isRetry === undefined ? false : isRetry;

                this.sendGenericRequest(
                        _pns.getPivotPackagePrefix()+'protocol.CommitRequest', {
                        'action' : 'commit',
                        'isRetry' : isRetry
                    }, callbackHandler, isRetry);
            },
            sendCommitCompletingRequest : function(callbackHandler, isRetry) {
                isRetry = isRetry === undefined ? false : isRetry;

                this.sendGenericRequest(
                        _pns.getPivotPackagePrefix()+'protocol.CommitRequest', {
                        'action' : 'commit',
                        'isRetry' : isRetry,
                        'isForCommitCompletion' : true
                    }, callbackHandler, isRetry);
            },
            
            sendCancelRequest : function(callbackHandler, isRetry) {
                isRetry = isRetry === undefined ? false : isRetry;

                this.sendGenericRequest(
                		 _pns.getPivotPackagePrefix()+".protocol.CancelRequest", {
                        "action" : "cancel",
                        "isRetry" : isRetry
                    }, callbackHandler, isRetry);
            },
            sendGenericRequest : function(className, params, callbackSuccess, notblockUI) {
                params['@class'] = className;
                var genericRequest = new jda.pivot.getGenericRequest({
                    actionParameters : params
                });
                var payload = genericRequest._getPayload();
                genericRequest.callback = callbackSuccess;
                if (this.data.pivotCommands[genericRequest.id]){
                    genericRequest.id++;
                }
                this.data.pivotCommands[genericRequest.id] = genericRequest;

                this.data.feed.call(this, this.data.url, "jda_pivot_json", payload);
            },
            _feed : function(url, type, payload, callback) {
                // allow only single request at same time
            	var that=this;
                pivotlog("Feeding server request request with %o", payload);
               
                var commandConfig = this.getCommandConfig(payload["@class"]);
                /*if(commandConfig && commandConfig.enableLongPolling && payload){
                	payload.enableLongPolling = commandConfig.enableLongPolling;
                }*/
                var spinnerTimeout = commandConfig ? commandConfig.showDialog : undefined;
                var isSpinnerDefined = _.isNumber(spinnerTimeout);
                this.currentRequestId = payload["id"];
                if(spinnerTimeout || isSpinnerDefined){
                	var spinnerTime = isSpinnerDefined ? spinnerTimeout : that.config.spinnerWaitDuration;
                	_.delay(function(){
                    	if (that.data.pivotCommands[payload.id] !== undefined && !that.isShowWaitCancelIndicatiorVisible() && (spinnerTime!= Number.MAX_VALUE)) {
                    		//that.data.callEvent("onShowOverlaySpinner",[that.getLocaleString('Loading')]);
                    		that.data.callEvent("onShowOverlaySpinner",[that.getImgUrl('loading_normal_24.gif'),that.getLocaleString('Loading'),that.getLocaleString("Cancel")]);
                    	}
                    },spinnerTime);
                }
              
              
                if(url){
	                var loadURL = url + ((url.indexOf("?") == -1) ? "?" : "&");
	                var params = null;
	
	                params = {
	                        payload : payload,
	                        pollingTimeout : payload.pollingTimeout||this.data.pollingTimeout,
	                        pollingTimeoutServerDelta  : payload.pollingTimeoutServerDelta || this.data.pollingTimeoutServerDelta
	
	                    };
	                    
	                    if(commandConfig){
	                    	
	                    	params.pollingTimeout = commandConfig.pollingTimeout || this.data.pollingTimeout;
	                    	params.pollingTimeoutServerDelta  = commandConfig.pollingTimeoutServerDelta  || this.data.pollingTimeoutServerDelta;
	                    	payload.pollingTimeout = commandConfig.pollingTimeout || this.data.pollingTimeout;
	                    	payload.pollingTimeoutServerDelta = commandConfig.pollingTimeoutServerDelta || this.data.pollingTimeoutServerDelta;
	
	                    }
	                
	                 this.load(loadURL, "jda_pivot_json", params, [ function() {
	                    // after loading check if we have some
	                    // ignored requests
	
	                }, callback ]);
                }
            },
            _call_onGenericResponse : function(response, request) {
                if (request.callback){
                    request.callback.call(this, this, response.result, request);
                }
            },
            _getChildrenInsertLocation : function(axisId, axisPath, facetId) {
                // We need to figure out where to add the new members
                var currAxis = this.data.cube.view[axisId];
                var facetIndex = currAxis.getFacetIndexFromId(facetId);
                var axisPathObj = new _pns.axisPath(axisPath, this.getLastMeasureVisibleId());
                var lastDescendantAxisPath =
                    currAxis.isAxisRoot(axisPath, facetId) ? null : currAxis.getLastDescendantAxisPath(this,
                        facetIndex, axisPathObj);
                var lastDescendantIndex = -1;
                if (lastDescendantAxisPath){
                    var lastDescendantAxisPathStr = currAxis.getAxisPathIdStr(lastDescendantAxisPath);
                    lastDescendantIndex =
                        currAxis.isSideAxis() ? this.indexById(lastDescendantAxisPathStr) : this
                            .columnIndex(lastDescendantAxisPathStr);
                }
                return lastDescendantIndex;

            },
            _call_ongetchildren : function(response, request) {
            	pivotlog("start jda_pivot.js _call_ongetchildren :"+pivotObjForRef.getFormatedTime());
                var isCubeMetadataChanged = request.isCubeMetadataChanged;
                this.data.cube.isCubeMetadataChanged=isCubeMetadataChanged;

                /* if(!isCubeMetadataChanged){
                 this.showWaitCancelIndicator();
                 }*/

                var currAxis = this.data.cube.view[request.params.axisId];
                var facetId = request.params.facetId;
                var axisPath = request.params.axisPath ? request.params.axisPath : [ [ -1 ] ];
                var childMemebers = response.result;
                if (isCubeMetadataChanged && currAxis.index === 1 && this._settings.columns){
                    for ( var iCol = this._getDataSplitIdx(); iCol < this._settings.columns.length; iCol++){
                        this._settings.columns[iCol].toRemove = true;
                    }
                }
                this._populateChildren(currAxis, axisPath, facetId, childMemebers, isCubeMetadataChanged,request.params.forMeasure);
               /* if (isCubeMetadataChanged && currAxis.index === 1 && this._settings.columns){
                    for ( var iCol = this._settings.columns.length - 1; iCol >= this._getDataSplitIdx(); iCol--)
                    {
                        if (this._settings.columns[iCol].toRemove){
                            $(this._settings.columns[iCol].node).remove();
                            this._settings.columns.splice(iCol, 1);
                        }
                    }
                }*/
                this._initPivotWhenNeeded(isCubeMetadataChanged);
                pivotlog("end jda_pivot.js _call_ongetchildren :"+pivotObjForRef.getFormatedTime());
            },
            _call_onReExpandHierarchies : function(response, request) {
                this.rootLevelsInitialized = 0;
                var colsDefs=this._getColumnsStickyData()||{};
                this._removeColumnDataAndView(this._getDataSplitIdx(), this._settings.columns.length - 1);
                var axes = [ "sideRoot", "topRoot" ];
                var measureOnlyAxisResponse = [ {
                    "id" : this.rootId,
                    "name" : "root",
                    "value" : "root",
                    "hasFacetChildren" : false
                } ];

                var isCubeMetadataChanged = true;
                var viewport = request.viewport;
                for ( var axisId = 0; axisId < axes.length; axisId++){
                    var currAxis = this.data.cube.view[axisId];
                    var axisResponse = response.result[axes[axisId]];
                    var axisPath = currAxis.getRootLevelAxisPathParam();

                    var facetIndex = 1;
                    var currFacet = currAxis.facets[facetIndex];

                    if (axisId === 1 && this._settings.columns){
                        for ( var iCol = this._getDataSplitIdx(); iCol < this._settings.columns.length; iCol++)
                        {
                            this._settings.columns[iCol].toRemove = true;
                        }
                    }

                    var facetId = currAxis.facets[0].id;
                    var childMembers = [axisResponse]; // rootMember will never be an array.

                    if (childMembers && childMembers.length && currFacet){
                    	//Clear chached parents, otherwise it will retain old expand status
                    	for(var ind =0; ind < currAxis.facets.length ; ind++){
                    		currAxis.facets[ind]._parentFacetNodesMap = {};
                    	}
                        this._populateChildren(currAxis, axisPath, facetId, childMembers,
                            false);
                    }
                    else{
                        facetId = currAxis.facets[0].id;
                        this._populateChildren(currAxis, axisPath, facetId, measureOnlyAxisResponse,
                            isCubeMetadataChanged);

                    }

                    if (axisId === 1 && this._settings.columns){
                        for ( var iCol = this._settings.columns.length - 1; iCol >= this._getDataSplitIdx(); iCol--)
                        {
                            if (this._settings.columns[iCol].toRemove){
                                $(this._settings.columns[iCol].node).remove();
                                this._settings.columns.splice(iCol, 1);
                            }
                        }
                        _.each(this._settings.columns,function(column,index){
                            if (colsDefs&&colsDefs[column.id]){
                                column.width=column.userSetWidth=colsDefs[column.id].userSetWidth;
                            }
                        },this);
                    }
                }

                this.rootLevelsInitialized = 2;
                this.reExpandSubmeasures();
                this.data.callEvent("renderPivot",[true]);
               // this._adjustChangedColumns();
               // this._triggerFullRendering(true);
                this._moveToViewPort(this.previousViewPort);
                this.previousViewPort = undefined;
                
/*                var col=this.lastSelectedCellId.topAxis;
                var row=this.lastSelectedCellId.sideAxis;
                this.panToRow(row,true)&&this.panToColumn(col,true);
*/                
                if (this.data.cube.backup_definition) {
                    delete this.data.cube.backup_definition.expansionParam;
                }
            },
            reExpandSubmeasures: function(forceRender){
                if(this.data.expandedSubmeasures && this.data.expandedSubmeasures.length > 0){
                	for(var indx =0; indx < this.data.expandedSubmeasures.length; indx++ ){
            			
        			if(this.areMeasuresOnTop() ){
        				var pivotLocation = _pns.Constants.topAxisFacetsSection;
        				var row = 0;
        				
        				var dummyFacetPath = this.columnId( this._getDataSplitIdx()).split(_pns.Constants.axisPathSeperator)[0];                    
                        var oldDummyFacetPath = this.data.expandedSubmeasures[indx].split(_pns.Constants.axisPathSeperator)[0];
                        if(dummyFacetPath != oldDummyFacetPath){
                        	this.data.expandedSubmeasures[indx] = this.data.expandedSubmeasures[indx].replace(oldDummyFacetPath + _pns.Constants.axisPathSeperator, dummyFacetPath+_pns.Constants.axisPathSeperator);
                        }
						if( !this.columnIndex( this.data.expandedSubmeasures[indx])){
							continue;// can not restore state for this cahced submeasure path	
						}
        				var column = this._columns[this.columnIndex( this.data.expandedSubmeasures[indx])];
        				var compareObj = column; //Object to compare if alteration required 
        				this.data.clickedRowpath = this.data.expandedSubmeasures[indx];	
        			}else{
        				dummyFacetPath = this.data.order[0].split(_pns.Constants.axisPathSeperator)[0];
        				oldDummyFacetPath = this.data.expandedSubmeasures[indx].split(_pns.Constants.axisPathSeperator)[0];
        				if(dummyFacetPath != oldDummyFacetPath){
        					this.data.expandedSubmeasures[indx] = this.data.expandedSubmeasures[indx].replace(oldDummyFacetPath + _pns.Constants.axisPathSeperator, dummyFacetPath+_pns.Constants.axisPathSeperator);
        				}
						if( !this.data.pull[this.data.expandedSubmeasures[indx]]){
							continue;// can not restore state for this cahced submeasure path	
						}
        				pivotLocation = _pns.Constants.measuresDataSection;	
        				row = this.data.pull[this.data.expandedSubmeasures[indx]];
        				this.data.clickedRowpath = this.data.expandedSubmeasures[indx];	
        				column = this._columns[this.columnIndex(_pns.Constants.measureIdPrefix)];
        				compareObj = row;
        			}
    				
    				//Check if this split measure requires an alteration 
    				if(compareObj && compareObj.subMeasures){
    					var subMeasuresArray = this.getSubMeasuresForMeasure(this._getAxisPathMeasureSplit(this.data.expandedSubmeasures[indx])[1], true);
    					
    					if((subMeasuresArray.length == compareObj.subMeasures.length)){
    						for(var subInd=0; subInd<compareObj.subMeasures.length; subInd++ ){
    							if( compareObj.subMeasures[subInd] == subMeasuresArray[subInd].id
    									|| this._getAxisPathMeasureSplit(compareObj.subMeasures[subInd])[1] == subMeasuresArray[subInd].id){
    								//no problem here
    							}else{
    								this._collapseMeasure(this.data.clickedRowpath,true);//skipRender
    								break;
    							}
    						}
    						if(subInd == compareObj.subMeasures.length){
    							//There is no action requried for this splitMeasure
    							continue;
    						}
    					}else{
    						this._collapseMeasure(this.data.clickedRowpath,true);//skipRender
    					}
    				}

        			var facet = this._getAxisFacetFromRowCol(
        					row,
        					column,
        					pivotLocation);
        			
        			this._expandMeasures(this._getAxisPathMeasureSplit(this.data.expandedSubmeasures[indx])[1],facet,true);
                	}
                	this.data.expandedSubmeasures = [];// clear the cache
                	if(forceRender){
                		this.data.callEvent("renderPivot",[true]);
                	}
                }

            },
            _moveToViewPort: function(viewport) {
                if (viewport && viewport.row && viewport.column) {
                    var flipMeasures=false;
                    // We check if the viewport has measures on top or side
                    var viewPortHasMeasuresOnTop = viewport.column.split(_pns.Constants.measurePathSeperator).length>1;
                    flipMeasures= (viewPortHasMeasuresOnTop !== this.areMeasuresOnTop()) ;
                    var col=viewport.column;
                    var row=viewport.row;
                    if (flipMeasures) {
                        var pathWithMeasure=viewPortHasMeasuresOnTop?col.split(_pns.Constants.measurePathSeperator):row.split(_pns.Constants.measurePathSeperator);
                        var pathWithoutMeasure=viewPortHasMeasuresOnTop?row:col;
                        if (this.areMeasuresOnTop()) {
                            col=pathWithoutMeasure+_pns.Constants.measurePathSeperator+pathWithMeasure[1];
                            row=pathWithMeasure[0];
                        }else {
                            row=pathWithoutMeasure+_pns.Constants.measurePathSeperator+pathWithMeasure[1];
                            col=pathWithMeasure[0];
                        }
                    }else{  
                    	var visibleMeasuresIds = this._getVisibleMeasuresIds();
                    	if(this.areMeasuresOnTop()){
                    		var colPathArr = col.split(_pns.Constants.measurePathSeperator);
                    		if(visibleMeasuresIds.indexOf(colPathArr[1]) < 0){
                    			col = colPathArr[0] +_pns.Constants.measurePathSeperator+visibleMeasuresIds[0];
                    		}
                    	}else{
                    		var rowPathArr = row.split(_pns.Constants.measurePathSeperator);
                    		if(visibleMeasuresIds.indexOf(rowPathArr[1]) < 0){
                    			row = rowPathArr[0] +_pns.Constants.measurePathSeperator+visibleMeasuresIds[0];
                    		}
                    	}
                    }
                    
                    //replace dummy axis path, some times getting "-1" and some times getting "-1⦓-999"
                    var dummyFacetPath = this.data.order[0].split(_pns.Constants.axisPathSeperator)[0];
                    var oldDummyFacetPath = row.split(_pns.Constants.axisPathSeperator)[0];
                    if(dummyFacetPath != oldDummyFacetPath){
                    	row = row.replace(oldDummyFacetPath + _pns.Constants.axisPathSeperator, dummyFacetPath+_pns.Constants.axisPathSeperator);
                    }
                    dummyFacetPath = this.columnId( this._getDataSplitIdx()).split(_pns.Constants.axisPathSeperator)[0];                    
                    oldDummyFacetPath = col.split(_pns.Constants.axisPathSeperator)[0];
                    if(dummyFacetPath != oldDummyFacetPath){
                    	col = col.replace(oldDummyFacetPath + _pns.Constants.axisPathSeperator, dummyFacetPath+_pns.Constants.axisPathSeperator);
                    }
                    var valid = this.panToRow(row,true)&&this.panToColumn(col,true);
                    /*_.every(viewport,function(cell,index) {
                        var col=cell.column;
                        var row=cell.row;
                        if (flipMeasures) {
                            var pathWithMeasure=viewPortHasMeasuresOnTop?col.split(_pns.Constants.measurePathSeperator):row.split(_pns.Constants.measurePathSeperator);
                            var pathWithoutMeasure=viewPortHasMeasuresOnTop?row:col;
                            if (this.areMeasuresOnTop()) {
                                col=pathWithoutMeasure+_pns.Constants.measurePathSeperator+pathWithMeasure[1];
                                row=pathWithMeasure[0];
                            }
                            else {
                                row=pathWithoutMeasure+_pns.Constants.measurePathSeperator+pathWithMeasure[1];
                                col=pathWithMeasure[0];
                            }
                        }
                        var valid = this.panToRow(row,true)&&this.panToColumn(col,true);
                        return (!valid);
                    },this);*/
                }
            },
            _filterDuplicateEntries : function(currAxis, createdMemberCollection) {
                var transVal = {}, retVal = {};
                _.each(createdMemberCollection, function(value, key) {
                    var noInvisibleFacetsKey = "";
                    var keyArr = key.split(_pns.Constants.measurePathSeperator);
                    var keyMain = keyArr[0], keyMeasure = keyArr.length > 1 && keyArr[1];
                    var keyFacets = keyMain.split(_pns.Constants.axisPathSeperator);
                    var newKeyArr = [];
                    var newKeyStr = "";
                    var facetIdxToCheck = [ 0 ].concat(currAxis.visibleFacetsIdx);
                    _.each(facetIdxToCheck, function(facetIdx) {
                        newKeyArr.push(keyFacets[facetIdx]);
                    }, this);
                    newKeyStr =
                        newKeyArr.join(_pns.Constants.axisPathSeperator) +
                        (keyMeasure ? (_pns.Constants.measurePathSeperator + keyMeasure) : "");
                    if (!transVal[newKeyStr]){
                        transVal[newKeyStr] = {
                            key : key,
                            value : value
                        };
                    }
                }, this);
                _.each(transVal, function(fullValue, key) {
                    retVal[fullValue.key] = fullValue.value;
                }, this);
                return retVal;
            },
            _populateChildren : function(currAxis, axisPath, facetId, facetChildren, isCubeMetadataChanged) {
                this.data.cube.view = this.data.cube.view || {};
                var facetIndex = currAxis.getFacetIndexFromId(facetId);

                var iterate = 1;

                while (iterate--){
                    var expandingNode = currAxis.getNode(facetIndex, axisPath);
                    if (expandingNode&&expandingNode.isExpanded && !currAxis.isAxisRoot(expandingNode.axisPath,facetId)){
                        // collapse first if expanded
                        //var clickedAxisPathStr = currAxis.getAxisPathIdStr(expandingNode.axisPath);
                        this._collapse(currAxis, facetIndex, expandingNode, false);
                    }
                	var createdMemberCollection =
                		currAxis.setFacetMembers(axisPath, facetId, facetChildren, this
                				._getCubeDefinition().visiblemeasures, this);
                   
                    //we are not adding duplicates at the time of creating createdMemberCollection
                    //createdMemberCollection = this._filterDuplicateEntries(currAxis, createdMemberCollection);
                    var memberArray = [];
                    var cols = new jdapivot.toArray(this._columns);
                    var memberCollectionSize = Object.size(createdMemberCollection);
                    for ( var memKey in createdMemberCollection){
                        var memVal = createdMemberCollection[memKey];
                        if (!currAxis.isSideAxis() && memberCollectionSize > 0){
                            var labels = [];
                            if (!currAxis.isMeasureOnlyAxis()){
                                for ( var m = 0; m < memVal.dataNodes.length; m++){
                                    if (currAxis.hasMeasures() && (m + 1 == memVal.dataNodes.length)){
                                    }
                                    else{
                                        var visibleFacetId = currAxis.getVisibleFacetId(m);
                                        if (visibleFacetId > -1){
                                            labels.push(memVal.dataNodes[m].name);
                                        }
                                    }
                                }
                            }
                            var currGridMember =
                                new _pns.header(memKey, labels, false, memVal.axisPath, false,
                                    memVal.dataNodes);
                            currGridMember.type = "data";
                            if (memVal[_pns.Constants.measureIdPrefix]){
                                // If it's for the top axis
                                var measureLabel = {};
                                measureLabel.value = memVal[_pns.Constants.measureIdPrefix];
                                measureLabel.isMeasure = true;
                                currGridMember.header.push(measureLabel.value);
                            }

                            memberArray.push(currGridMember);
                            if (this._settings.columns){
                                currGridMember.axisPath = memVal.axisPath;
                            }
                            currGridMember.hasFacetChildren = memVal.hasFacetChildren;
                            currGridMember.expanded = currGridMember.expanded;
                        }else if (!(memKey in this.data.pull )){
                            
                        	memberArray.push(memKey);
                            this.data.pull[memKey] = memVal; 
                        }
                    } // End of adding a single collection of children
                } // End of loop for adding children recursivaly.

                var lastDescendantIndex =
                    isCubeMetadataChanged ? !currAxis.isSideAxis() ? this._getDataSplitIdx() : -1 : this
                        ._getChildrenInsertLocation(currAxis.index, axisPath, facetId);

                if (!currAxis.isSideAxis()){
                    if (this._settings.columns){
                    	
                        var brandNew = lastDescendantIndex == -1;
                        lastDescendantIndex = brandNew ? this._settings.columns.length : lastDescendantIndex;
                        var newIdx = lastDescendantIndex;
                        if (!brandNew && lastDescendantIndex >= this._getDataSplitIdx() &&
                            !isCubeMetadataChanged)
                        {
                            this._settings.columns.insertArray(lastDescendantIndex + 1, memberArray);
                            // This is insertion, all is NOT stale
                            for ( var i = 0; i < this._settings.columns.length; i++){
                                delete this._settings.columns[i].isStale;
                            }
                            newIdx++;
                        }
                        // We add all new columns
                        if (this._settings.columns.length == 0)
                            lastDescendantIndex = 0;

                        var upperBound = memberArray.length - 1 + newIdx;
                        var lowerBound = newIdx;
                        newIdx = upperBound;
                        var tmpIdx = memberArray.length - 1;
                        var movedToLeftNodes = [];
                        var movedToCenterNodes = [];
                        for (; newIdx >= lowerBound; newIdx--){
                            var newHeader = memberArray[tmpIdx--];
                            var header = this._settings.columns[newIdx];
                            if (!header){
                                header = this._settings.columns[newIdx] = newHeader;
                            }
                            else{

                                header.isStale = true;
                                // header.attached = false;
                            }
                            delete header.isStale;
                            // header.isStale = true;
                            var headerToBeAdded = newHeader;
                            if (typeof headerToBeAdded == 'string'){
                                headerToBeAdded = {
                                    memKey : newHeader
                                };
                            }
                            else if (typeof headerToBeAdded == 'object')
                                headerToBeAdded = $.extend(true, {}, newHeader);
                            headerToBeAdded.node = header.node;
                            headerToBeAdded.attached = header.attached;
                            headerToBeAdded.width = header.width;
                            this._settings.columns[newIdx] = headerToBeAdded;
                            delete this._settings.columns[newIdx].toRemove;
                            if (headerToBeAdded.type != header.type){
                                if (headerToBeAdded.type === 'data'){
                                    headerToBeAdded.detach = true;
                                    movedToCenterNodes.push(headerToBeAdded.node);
                                }
                                else{
                                    headerToBeAdded.detach = true;
                                    movedToLeftNodes.push(headerToBeAdded.node);
                                }
                            }
                        }
                        // Move the nodes that changed a panel
                        this._columns = this._settings.columns;
                    }
                }
                else{
                    // This is the first insert
                    if (lastDescendantIndex == -1)
                        this.data.order = jdapivot.toArray();
                    this.data.order.insertArray(lastDescendantIndex + 1, memberArray);
                }
            },
            _initPivotWhenNeeded : function(isCubeMetadataChanged) {
                if (this.rootLevelsInitialized < 2){
                    this.rootLevelsInitialized++;
                    if (this.rootLevelsInitialized == 1){
                        var sideVisibleFacets = this.getSideVisibleFacets();
                        var nonRootFacetId = null;
                        sideVisibleFacets.map(function(value,key){
                            if(!(value.showRoot || nonRootFacetId)){
                                nonRootFacetId = value.id;
                            }
                        });
                        if ((sideVisibleFacets.length === 0) || (nonRootFacetId === null)){
                            // It's a measure only axis fake a request
                            this._triggerMeasureOnlyAxisCall(0);
                        }
                        else{
                            this._getChildrenHierarchy(this.getSideAxisView().index, this.getSideAxisView()
                                    .getRootLevelAxisPathParam(),
                                nonRootFacetId, 1, isCubeMetadataChanged);

                        }
                    }
                    this._data_request_flag = true;
                }
                if(this.rootLevelsInitialized >1){
                	this.data.callEvent("renderPivot",[isCubeMetadataChanged]);
                }

            },          
            /**
             * Remove the columns whichever marked has toRemove flag set to true.
             * 
             */
            _removeColumns: function(){
            	if(this._settings.columns && this._settings.columns.length > 0)
            	for ( var iCol = this._settings.columns.length - 1; iCol >= this._getFacetSplitIndex(); iCol--)
                {
                    if (this._settings.columns[iCol].toRemove){
                        $(this._settings.columns[iCol].node).remove();
                        this._settings.columns.splice(iCol, 1);
                    }
                }
            },
            /**
             * It renders pivot structure during initial call to pivot view request.This function
             *  requires to adjust the offet width,height which will be set from calling resizePivot
             *  @param needResize boolean true/false to resize the pivot
             */
            _fullRender:function(){
                var start = (new Date).getTime();
                pivotlog("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Full Render starts " + start);



                this._removeColumns();
                this._resetRowHeights();
                if(this._isCubeDef){
                    this._resizeRender = true;
                    this.resizePivot();
                    this._resizeRender = false;
                    this._isCubeDef = false;
                }
                this._renderStructureChange();
                //this._debounceRegisterFacetsDragAndDropHandler();
                this.isLoading = true;
                this.defferRendering = false;
                this.triggerEvent("levelsReady");
                //this.updateFocusedCell();

                var diff = (new Date).getTime() - start;

                pivotlog("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ FULL RENDER Done  with "+diff +" ms");
            },
            /**
             * This function calls when pivot layout has been already set by fullRender function.
             * partial render includes rendering portion like side facet,top facet,data area. It will not call
             * resizePivot to adjust offset width or height.
             */
            _partialRender:function(){
                var start = (new Date).getTime();
                pivotlog("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ PARTIAL RENDER starts " + start);
                this._renderStructureChange();
                var diff = (new Date).getTime() - start;
                pivotlog("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ PARTIAL RENDER Done  with "+diff +" ms");
            },

            /**
             * Controller which decides which portion to render
             * @param mode - decides full/partial render
             */
            renderPivot :function(fullRender,partialRender){

                if(fullRender){
                    this._fullRender();
                } else if(partialRender){
                    this._partialRender();
                }
                else{
                    this.defferRendering =true;
                    this.initGetSegmentData();
                }

            },
            _nodeOnRecoveryMode: function(data, request){
            	pivotlog("Node is in Recovery Mode");
            	this._hideWaitIndicator();
            	this._unblockUI();
            	this.triggerEvent('nodeOnRecoveryMode',{message:data.error.message});
            	this.destroy();
            },
	    
            _previousCalculationInProgress: function(data, request){
            	pivotlog("Previous calculation is in progress. Please retry after it is completed.");
            	this._hideWaitIndicator();
            	this._unblockUI();
            	this.triggerEvent('previousCalculationInProgress',{message:data.error.message});
            },
            
            _onGetGraphDataErrorResponse: function(data,request){
            	pivotlog("Graph Loading failed");
	
            	this._hideWaitIndicator();
            	this._unblockUI();
            	this.getBusinessGraphWrapper().fireEvent('handleResponse',null,request); // TODO - Need to pass configurable error message to show in graph area for future
            },

            _noChildren: function(data, request){
            	pivotlog("Facet member has no children");
            	this._hideWaitIndicator();
            	this._unblockUI();
            	this.triggerEvent('noChildren',{message:data.error.message});
            	this.destroy();
            },
            getPivotContext: function() {
                return $(this.$view).parent();
            },
            _getSingleLevelFacetMemebers: function() {

            },
            _getVisibleAxisPaths : function() {

            },
            /**
             * Swaps between two facets of the of same\different axes
             *
             * @param axis1
             *            First axis to swap from
             * @param facet1
             *            Facet in the first axis to swap
             * @param axis2
             *            Axis to swap with
             * @param facet2
             *            Facet to swap with
             */
            _swapFacets : function(axis1, facet1, axis2, facet2) {
                var viewDef = this._getCubeDefinition();
                var axes = [ "sideAxis", "topAxis" ];
                var dropFacet = viewDef[axes[axis1]].facets[facet1];
                var droppedFacet = viewDef[axes[axis2]].facets[facet2];
                viewDef[axes[axis1]].facets[facet1] = droppedFacet;
                viewDef[axes[axis2]].facets[facet2] = dropFacet;
                // Clear sort
                if (axis1 != axis2)
                    this._getCubeDefinition().topAxis.sortOrder = null;
                // Make sure the sorts are cleared
                this._setCubeDefinitionSortParams([]);
                this.setCubeViewDefinition();
                /*MDAP-2732 - When single scenario present on top/side and other facet is moved to the axis using context menu, 
                 * 		   should be hide scenario as it's single. To hide the scenario, we have to call load scenarios()*/
                if(viewDef && viewDef.availableScenarios && viewDef.availableScenarios.length < 2 && this.isScenarioFacetVisible()){
	            	 this.handleScenarios("loadScenarios", viewDef.availableScenarioIds,viewDef.availableScenarios);
	            }
            },
            localClearAll : function() {
                this.resetViewPort();
                this.clearAll();
            },
            resetViewPort : function() {
                // First let's bring the scrolls to 0,0
                this._scrollLeft = 0;
                // side facet scroll to 0
                this._sideFacetScrollLeft=0;
                //this._attrScrollLeft =0;
                this._scrollTop = 0;
                // Check if the UI is initialized yet
                if (this._y_scroll === undefined)
                    return;
                this._y_scroll.scrollTo(this._scrollTop);
                this._getDataArea().scrollTo(this._scrollLeft);

            },
            setCubeViewDefinition : function() {
                // AjaxRequest.showWaitIndicator(this.getLocaleString('QuickLoading'));

                this._setPivotAxesRequest();
            },
            _getFacetLayerDetails : function(dropFacetID, droppedFacetID) {
                var retVal = {};
                var axes = [ "sideAxis", "topAxis" ];
                axesLoop: for ( var i = 0; i < axes.length; i++){
                    var axis = this._getCubeDefinition()[axes[i]];
                    for ( var j = 0; j < axis.facets.length; j++){
                        var facet = axis.facets[j];
                        if (dropFacetID == facet.id){
                            retVal.dropFacet = {};
                            retVal.dropFacet.index = j;
                            retVal.dropFacet.axis = axes[i];
                        }
                        else if (droppedFacetID == facet.id){
                            retVal.droppedFacet = {};
                            retVal.droppedFacet.index = j;
                            retVal.droppedFacet.axis = axes[i];
                        }
                        if (retVal.droppedFacet && retVal.dropFacet){
                            break axesLoop;
                        }

                    }
                }
                return retVal;
            },
            getElementHeaderData : function(element) {
                var elementData = null, $element = $(element);
                elementData = {

                };
                var $measureElement =
                    $element.hasClass("measureCell") ? $element : $element.find(".measureCell");

                if ($measureElement.hasClass("measureCell")){
                    var facetData = $measureElement.data("facetData");
                    var measureId = facetData.measureId;
                    elementData.measureId = measureId;
                    if (!this.areMeasuresOnTop()){
                        helperWidth = $element.width();
                        elementData.axisId = 0;
                    }
                    else{
                        elementData.axisId = 1;
                    }
                }
                else{
                    // It's a facet or a facet member being dragged
                    if ($element.hasClass("topFacet")){
                        elementData.axisId = 1;
                        var $dataElement =
                            $element.is("TD.droppableFacet") ? $element : $element
                                .closest('tr:data("facetData")');
                        var facetData = $dataElement.data("facetData");
                        if (facetData.id){
                            elementData.facetId = facetData.id;
                            elementData.facetIndex = facetData.index;
                        }
                    }
                    else if ($element.hasClass("sideFacet")){
                        elementData.axisId = 0;
                        var facetData = $element.data("facetData");
                        if (facetData.id){
                            elementData.facetId = facetData.id;
                            elementData.facetIndex = facetData.index;
                        }
                    }
                    else{
                        // it's a facet member
                        var $grandParent = $element.parent().parent().parent();
                        if ($grandParent.hasClass("topFacetRow")){
                            // Top facet member name
                            var facetData = $grandParent.data("facetData");
                            elementData.axisId = 1;
                            if (facetData.id){
                                elementData.facetId = facetData.id;
                                elementData.facetIndex = facetData.index;
                            }
                        }
                        else{
                            // Side facet member name
                            $grandParent = $element.parent();
                            var facetData = $grandParent.data("facetData");
                            elementData.axisId = 0;
                            if (facetData.id){
                                elementData.facetId = facetData.id;
                                elementData.facetIndex = facetData.index;
                            }
                        }
                    }
                }
                return elementData;
            },
            hideTooltips : function() {
                (this._debounceHideToolTips =
                    this._debounceHideToolTips ||
                    _.debounce(this._hideTooltips, 1000,true))();
                this._debounceHideToolTips.apply(this);
            },
            _debounceRegisterFacetsDragAndDropHandler : function() {
                (this._debouncedRegisterFacetsDragAndDropHandler =
                    this._debouncedRegisterFacetsDragAndDropHandler ||
                    _.debounce(this._registerFacetsDragAndDropHandler, 1000))();
                this._debouncedRegisterFacetsDragAndDropHandler.apply(this);
            },
            _debounceFocusedCell:function(){
            	var that = this;
            	return (_.debounce(function(){that.updateFocusedCell();},1000))();
            },
            /*_postProcessing:function(){
            	var that = this;
                (this._debouncePostProcessing =
                    this._debouncePostProcessing ||
                    _.debounce(function(){
                    	if(that._isNavigating == false){     	
                    		that.updateXScroll();
                    		that.updateYScroll();
                    	}
                    }, 100))();
                this._debouncePostProcessing.apply(this);
            },*/
            _registerFacetsDragAndDropHandler : function() {
                var that = this;
                var $dragDropSelector =
                    $('.pivotLayerElement .sideFacetsHeaderWrapper  :not(.draggableMeasures)>*>.draggableFacet, .pivotLayerElement .dhx_hs_center td,.pivotLayerElement .draggableMeasures, .pivotLayerElement .sideFacetMemberContainer');
                $dragDropSelector
                    .draggable({
                        cursor : 'move',
                        appendTo : this.$view,
                        containment : $('.pivotLayerElement'),
                        start : function(e, ui) {
                            if (e.shiftKey||e.ctrlKey) {
                                return false;
                            }
                        },
                        stop : function(event, ui) {
                            ui.helper.remove();
                        },
                        helper : function(event, ui) {
                            var $this = $(this), $parent = $this.closest('td'), color =
                                $parent.css('color'), backGroundColor = $parent.css('background'), draggedData =
                                that.getElementHeaderData(this), helperWidth = $parent.width();

                            if ($this.hasClass("draggableMeasures")){
                                backGroundColor = $this.parent().css('background');
                                if (!that.areMeasuresOnTop()){
                                    color = $this.css('color');
                                    helperWidth = $this.width();
                                }
                                else{
                                    backGroundColor = $this.css('backgroundColor');
                                    color = $parent.css('color');
                                }
                            }
                            else{
                                // It's a facet or a facet member being dragged
                                if (!($this.hasClass("sideFacet") || $this.hasClass("topFacet"))){
                                    // it's a facet member
                                    backGroundColor = $this.css('backgroundColor');
                                    var $grandParent = $this.parent().parent().parent();
                                    if ($grandParent.hasClass("topFacetRow")){
                                        // Top facet member name
                                        backGroundColor = $this.parent().parent().css('backgroundColor');

                                    }
                                    else{
                                        // Side facet member name
                                    }

                                    color = $this.css('color');
                                }
                            }
                            helperWidth = Math.min($this.width(), 120);

                            var helperCSS = {
                                'background' : backGroundColor,
                                'border' : '1px solid black',
                                'border-color' : $parent.css('border-color'),
                                'color' : color,
                                'position' : 'fixed',
                                'overflow' : 'hidden',
                                'padding' : "1px",
                                'padding-right' : '2px',
                                'padding-left' : '2px',
                                'white-space' : 'nowrap',
                                'opacity' : '0.5'
                            };
                            return $('<span id="facetDragHandle"/>').width(helperWidth).addClass(
                                'pivotDraggable').css(helperCSS).text($this.text()).data('facetData',
                                draggedData);
                            // return $(this).clone().addClass('pivotDraggable').css(helperCSS);
                        },
                        revert : 'invalid',
                        cursorAt : {
                            left : 0,
                            top : 0
                        }
                    });
                var currGrid = this;
                $dragDropSelector.droppable({
                    drop : function(event, ui) {
                    	 var draggedFacetData = ui.helper.data("facetData");
                         var dropContext = $(this);
                         var dropFacetData = that.getElementHeaderData(this);
                         setTimeout(function() {
                         	if(!(that.isEditing() && that.dirtyInvalidEditCleanup() && !that.processValidation(that.$activeEditor))){
                         		if (that.canBeMeasureDropped(draggedFacetData, dropFacetData)){
                         			// ui.helper.remove();
                         			that.measureDrop(draggedFacetData, dropFacetData);
                         		}
                         		else if (that.canBeFacetDropped(draggedFacetData, dropFacetData)){
                         			// ui.helper.remove();
                         			var result = that.facetDrop(draggedFacetData, dropFacetData);
                         		}
                         	}
                             that.paintFacetDropZone(ui, dropContext, false);
                         }, 50);
                    },
                    accept : $dragDropSelector,
                    out : function(event, ui) {
                        that.paintFacetDropZone(ui, $(this), false);

                    },
                    over : function(event, ui) {
                        var draggedFacetData = ui.helper.data("facetData");

                        var dropFacetData = that.getElementHeaderData(this);
                        if (that.canBeFacetDropped(draggedFacetData, dropFacetData) ||
                            that.canBeMeasureDropped(draggedFacetData, dropFacetData))
                        {
                            that.paintFacetDropZone(ui, $(this), true);
                        }

                    }
                });

            },
            canBeMeasureDropped : function(draggedFacetData, dropFacetData) {
                return ((draggedFacetData.measureId !== undefined) && (draggedFacetData.axisId !== undefined) &&
                        (dropFacetData.axisId !== undefined) && (draggedFacetData.axisId != dropFacetData.axisId) &&
                        this.canDropMeasure(draggedFacetData, dropFacetData));
            },
            
            canDropMeasure: function(draggedFacetData, dropFacetData){
            		var facet = this._getCubeView()[draggedFacetData.axisId].getVisibleFacets();
            		return facet && facet.length>0;
            },
            
            canBeFacetDropped : function(draggedFacetData, dropFacetData) {
                return ((draggedFacetData.facetId !== undefined && dropFacetData.facetId !== undefined) && (draggedFacetData.facetId !== dropFacetData.facetId)
                		&& this.canSwapFacet(draggedFacetData,dropFacetData));
            },
            
            canSwapFacet:function(dragFacetData,dropFacetData){
              	 var viewDef = this._getCubeDefinition();
                   var axes = [ "sideAxis", "topAxis" ];
                   var dragFacet = viewDef[axes[dragFacetData.axisId]].facets[dragFacetData.facetIndex];
                   var dropFacet = viewDef[axes[dropFacetData.axisId]].facets[dropFacetData.facetIndex];
                   var facetMenu = this.config ? this.config.actions.facetContextMenu.hooks : undefined;
                   
                   if(facetMenu && facetMenu.hideSwapFacet(dragFacet)){
                  	 return false;
                   }
                   if(facetMenu && facetMenu.hideSwapFacet(dropFacet)){
                  	 return false;
                   }
                   
                   return true;
              },
            measureDrop : function() {
                //this.clearAll();
                this.switchMeasuresAxis();
                return true;
            },
            facetDrop : function(draggedFacet, droppedFacet) {
                try{
                    var facetIndexes = {
                        dropFacet : {
                            index : droppedFacet.facetIndex,
                            axis : droppedFacet.axisId
                        },
                        droppedFacet : {
                            index : draggedFacet.facetIndex,
                            axis : draggedFacet.axisId
                        }
                    };
                    if (facetIndexes.droppedFacet !== undefined && facetIndexes.dropFacet !== undefined){
                        this._swapFacets(facetIndexes.droppedFacet.axis, facetIndexes.droppedFacet.index,
                            facetIndexes.dropFacet.axis, facetIndexes.dropFacet.index);
                        return true;
                    }
                }catch (err){

                }

            },
            paintFacetDropZone : function(ui, $droppable, enable) {
                var $draggable = ui.draggable;
                var dragFacetData = ui.helper.data("facetData");
                // var $hightlightElements = $draggable?$droppable.closest('.droppableFacet,
                // .sideCellMember').not($draggable.parents()):$droppable.closest('.droppableFacet,
                // .sideCellMember');
                var $hightlightElements = $droppable;
                if (enable)
                    $hightlightElements.addClass('hover').find('*').addClass('hover');
                else
                    $hightlightElements.removeClass('hover').find('*').removeClass('hover');
            },
            isHeaderDroppable : function(draggable, droppable) {
                var retVal = false;
                var $draggable = $(draggable);
                var $droppable = $(droppable);
                retVal =
                    $draggable.closest('#leftHdrTable, #centerHdrTable').length &&
                    $droppable.closest('#leftHdrTable, #centerHdrTable').length;
                return retVal;
            },
            _registerMeasuresDragAndDropHandler : function() {
            },
            _getOffsetRowsForOrderCollection : function() {
                return 1;
            },
            clearAllErrorsData : function() {
                var iOrder = order.length;

            },
            _populateAxesMembers : function(axesMembers, axesData) {

            },
            //The purpose of that is to periodically purge data that is not close to the current viewport.
            purgeStaleData : function() {
                var columns = jdapivot.toArray(this._settings.columns);
                var dataSplit = this._getDataSplitIdx();
                var pull = this.data.pull;
                var order = this.data.order;
                for ( var j = order.length - 1; j >= 0; j--){
                    var rowId = order[j];
                    if (pull.hasOwnProperty(rowId)){
                        var item = pull[rowId];
                        if (item.isStale){
                            delete pull[rowId];
                            order.splice(j, 1);
                        }
                        else{
                            for ( var i = dataSplit; i < columns.length; i++){
                                var cell = item[columns[i].id];
                                if (cell && cell.isStale)
                                    delete cell;
                            }

                        }
                    }
                }
            },
            // This method would handle responses from both
            // getSegmentData & updateFacts
            _hideWaitIndicator: function(){
                $("#"+this.config.waitDiv).hide();
                //AjaxRequest.hideWaitIndicator();
            },
            
             _doneLoadingImages: function(imageList) {
                this.mockImageList=imageList;
                //      console.log('Images loaded: %o', imageList);
                $.each( imageList, function( i, item ) {
                    //    console.log('* Image object: %o', item);
                });
                this._loadBackendData();
            },
            _call_onGetCommentData : function(response, request) {
                if (response.error)
                    return;
                else if(request.params.value.event ==="onHover"){

                    var sideAxis = this.getSideAxisView();
                    var topAxis = this.getTopAxisView();
                    var sideAxisPaths = request.params.sideAxisPaths || request.params.viewSegment.sideAxisPaths;
                    var topAxisPaths = request.params.topAxisPaths || request.params.viewSegment.topAxisPaths;
                    var measuresIds = request.params.measuresIds;
                    var currSideAxisPath =
                        !this.areMeasuresOnTop() ? sideAxis.getMeasureRowIdFromAxisPath(
                            sideAxisPaths[0].axisPath, measuresIds[0]) : sideAxis
                            .getMeasureRowIdFromAxisPath(sideAxisPaths[0].axisPath);
                    var currTopAxisPath =
                        this.areMeasuresOnTop() ? topAxis.getMeasureRowIdFromAxisPath(
                            topAxisPaths[0].axisPath, measuresIds[0]) : topAxis
                            .getMeasureRowIdFromAxisPath(topAxisPaths[0].axisPath);
                    var loc ={
                        row : currSideAxisPath,
                        column : currTopAxisPath
                    };
                    var currentDiv = this._locateCellDiv(loc);  //$(currentDiv).find('span.cmtRelation-SELF,span.cmtRelation-ANCESTORS,span.cmtRelation-DESCENDANTS').attr("title",toolTipComments);

                    var commentSize = response.result.length;
                    var toolTipComments;
                    var firstDescComment;

                    for(var i=0; i < commentSize; i++)
                    {
                        subject = response.result[i].subject;
                        relation = response.result[i].relationship;
                        if(relation === 'SELF')
                        {
                            if(response.result[i].reasonCode){
                            	toolTipComments = this._getCommentTitle(response.result[i].reasonCode);
                            }else{
                            	toolTipComments = subject;
                            }
                            break;
                        }
                        if (relation === 'DESCENDANTS' && !firstDescComment && $.trim($($(currentDiv).find('[class*="cmtRelation"]')[0]).attr('class')) == 'cmtRelation-DESCENDANTS')
                        {
                            firstDescComment = subject;
                        }
                    }
                    if(!toolTipComments){
                        if (firstDescComment) {
                            toolTipComments = firstDescComment;
                        } else {
                            toolTipComments = response.result[0].subject;
                        }
                    }
                    //this.commentToolTipText(toolTipComments);

                    this._isUpdating = false;
                    $(currentDiv).attr("title",toolTipComments);
                    /*var value = $(currentDiv).attr("title");
                     value = value + '\n' + toolTipComments;
                     $(currentDiv).attr("title",value);*/

                }
                else if (this.isCommentEnabled()) {
                   
                	this.getCommentWrapper().fireEvent('addaccordion',response.result,request.params.value);

                	/*var $pivotComment = $("#pivotCommentFlyout").find(".pivotComment");

                    $pivotComment.pivotAccordion("removeAccordion");

                    if(this.isCommentReadOnly()){
                     $pivotComment.pivotAccordion("option","isReadOnly",true);
                     }
                    var commentSize = response.result.length;
                    for(var i=0; i < commentSize; i++)
                    {
                        $pivotComment.pivotAccordion("addAccordion",response.result[i]);
                    }*/

                    //this.setCommentReadOnly(false);
                }
            },

            _call_onAddComment: function(response,request){
                var value={};
                value.cmt = true;
                value.operation = 'read';
                var sideAxis = this.getSideAxisView();
                var topAxis = this.getTopAxisView();
                var sideAxisPaths = request.params.editCell.sideAxisPath;
                var topAxisPaths = request.params.editCell.topAxisPath;
                var measureId = request.params.editMeasureIds;
                var sideAxisPath =!this.areMeasuresOnTop() ? sideAxis.getMeasureRowIdFromAxisPath(
                    sideAxisPaths.facetPaths, measureId) : sideAxis
                    .getMeasureRowIdFromAxisPath(sideAxisPaths.facetPaths);
                var topAxisPath =this.areMeasuresOnTop() ? topAxis.getMeasureRowIdFromAxisPath(
                    topAxisPaths.facetPaths, measureId) : topAxis
                    .getMeasureRowIdFromAxisPath(topAxisPaths.facetPaths);
                var loc ={
                    sideAxis:sideAxisPath,
                    topAxis:topAxisPath
                };
                this._getupdateCommentRequest(loc, value);
            },

            _call_ongetsegmentdata : function(response, request) {
            	if (request.callback){
                    request.callback.call(this, response, request);
                }else{
                	this._call_refreshOnGetSegmentData(response, request);
                }
			},
			_handleShowGraphPanel: function(){
				if(this.showGraphPanel()){
            		this.config.showGraphPanel = false;
            		if(this.isGraphEnabled()){
            			this.getPivotController().activateGraph();
            		}else if(this.isBusinessGraphEnabled()){
            			this.getPivotController().activateBusinessGraph();	
            		}
            	}else if (this.isBusinessGraphEnabled() && this.getBusinessGraphWrapper().config.flyoutIsOpen) {
                	this.getBusinessGraphWrapper().fireEvent('refreshGraphData');
                	
	            }
            	//Holding rootlevel names(Ex: All Product/All Location) in object to use in display tooltip, if cell context graph enabled.
				if(this.isBusinessGraphEnabled() && this.isCellContextGraphEnabled()){
        			var facetRootLabels = this.getBusinessGraphWrapper().graphConfig.options.facetRootLabels;
            		if(!facetRootLabels || Object.keys(facetRootLabels).length === 0){
            			facetRootLabels = {};
            	    	var availableFacets = this._getCubeDefinition().availableFacets;
            	    	for(var index=0; index < availableFacets.length;index++){
            	    		facetRootLabels[availableFacets[index].getIDName()] = availableFacets[index].rootLabel;
            	    	}
            			this.getBusinessGraphWrapper().graphConfig.options.facetRootLabels = facetRootLabels;	
        			}
	            }
			},
			_call_refreshOnGetSegmentData : function(response, request) {
				this.config && this.config.keepOverlaySpinner && (this.config.keepOverlaySpinner = false);
				
                if (response.error)
                    return;
                
                if(response.metadata.render){
                    this._call_onGetRenderTypeResponse(response,request);
                    retrn;
                }
                if(response.metadata.multiEdit){
                    this._call_onMultiEditResponse(response,request);
                    return;
                }
                pivotlog("start jda_pivot.js _call_refreshOnGetSegmentData :"+pivotObjForRef.getFormatedTime());
                this.lorem=null;
                //this.hideWaitCancelIndicator();
                this._hideWaitIndicator();
                this.hideExtjsWaitCancelIndicator();
               // this.updateFocusedCell();
                var sideAxis = this.getSideAxisView();
                var topAxis = this.getTopAxisView();
                var changedValues = [];
                var failedUpdates = [];
                var that = this;
                var previousMultiEditCount = 0;
                // updateFacts has a different structure. Will adjust as needed.
                var sideAxisPaths = request.params.sideAxisPaths || request.params.viewSegment.sideAxisPaths;
                var topAxisPaths = request.params.topAxisPaths || request.params.viewSegment.topAxisPaths;
                var attributesId = request.params.attributeIds && request.params.attributeIds.length >0 ? request.params.attributeIds :[];
                
                if(attributesId.length >0 ){
                    topAxisPaths.unshift("attribute");
                }
                
                if(request['@class'] === _pns.getPivotPackagePrefix()+"protocol.request.ImportFromExcelRequest"){
                	this.afterImportExcel(response);
                	if(response.metadata.statusCode !== "SCS" || (response.metadata.statusCode === "SCS"  && response.metadata.totalUpdatedCells === 0 )){
                		return;		
                	}
                }
                
                var measuresIds = request.params.combiMeasuresIds;
                var pull = this.data.pull;
                var order = this.data.order;
                var iOrder = order.length;
                var values = response.result;
                var item = null;
                //this.purgeStaleData();
                var i, j, k = 0,m = 0;
                var iteratedRowsPaths = {};
                var iteratedColsPaths = {};
                var hasAttr=false;
                for (i = 0; i < sideAxisPaths.length; i++){
                    for (j = 0; j < topAxisPaths.length; j++){
                        // for attribute area
                        if(j == 0 && attributesId.length>0){
                            //iteratedRowsPaths[currSideAxisPath] = 1;
                            for(m=0; m<attributesId.length;m++){

                                var currSideAxisPath =
                                    !this.areMeasuresOnTop() ? sideAxis.getMeasureRowIdFromAxisPath(
                                        sideAxisPaths[i].axisPath, measuresIds[k]) : sideAxis
                                        .getMeasureRowIdFromAxisPath(sideAxisPaths[i].axisPath);
                                var  currTopAxisPath = attributesId[m];

                                item = pull[currSideAxisPath];
                                iteratedRowsPaths[currSideAxisPath] = 1;

                                if (!item)
                                    continue;
                                if (values.length !== 0){
                                    iteratedColsPaths[currTopAxisPath] = 1;
                                    var cellVal = values[i][j][m];

                                    this._renderCell(item,currSideAxisPath,currTopAxisPath,cellVal);

                                }
                            }

                            continue;
                        }

                        // for data area
                        for (k = 0; k < measuresIds[this.areMeasuresOnTop() ? j : i].length; k++){
                            // Let's build the top axis path
                            var currSideAxisPath =
                                !this.areMeasuresOnTop() ? sideAxis.getMeasureRowIdFromAxisPath(
                                    sideAxisPaths[i].axisPath, measuresIds[i][k]) : sideAxis
                                    .getMeasureRowIdFromAxisPath(sideAxisPaths[i].axisPath);
                            var currTopAxisPath =
                                this.areMeasuresOnTop() ? topAxis.getMeasureRowIdFromAxisPath(
                                    topAxisPaths[j].axisPath, measuresIds[j][k]) : topAxis
                                    .getMeasureRowIdFromAxisPath(topAxisPaths[j].axisPath);
                            // There should ALWAYS be an item member to
                            // put the data in.
                            item = pull[currSideAxisPath];
                            iteratedRowsPaths[currSideAxisPath] = 1;
                            /***********************************************************************************
                             * if (!(item=pull[currSideAxisPath])){ //if such ID already exists - update instead
                                     * of insert order[iOrder]=currSideAxisPath; item={}; pull[currSideAxisPath]=item; }
                             **********************************************************************************/
                            if (!item)
                                continue;
                            if (values.length !== 0){
                                var cell = item[currTopAxisPath];
                                iteratedColsPaths[currTopAxisPath] = 1;
                                var isNew = false;
                                var cellVal = values[i][j][k];
                                if (!cell){
                                    cell = {};
                                    item[currTopAxisPath] = cell;
                                    isNew = true;
                                }
                                // Let put first all the default values from the server onto the cell

                                // We're being explicit in the
                                // properties we allow form the server
                                // so we don't overload the UI with info
                                var mandatoryAttr = {
                                    'dtype' : "",
                                    'value' : "",
                                    'content' : "",
                                    'lock' : "",
                                    'write' : "",
                                    'fail' : "",
                                    'cmtRelation' : "",
                                    'canLock' : ""
                                };
                                cellVal = cellVal || {};
                                
                                if ('value' in cellVal){
                                    var content = cellVal.value;
                                    cell.dtype = cellVal.dtype;
                                    var decimalFormat = this.getDecimal(measuresIds[k]);
                                    // if (typeof content != "number")
                                    // {
                                    // }
                                    // else
                                    content=_.isObject(cellVal.value)?cellVal.value:""+cellVal.value;

                                    if(cell.multiEdit){
                                        var multiEditStatus =this._getMultiEditStatus(currSideAxisPath,currTopAxisPath, cell.dtype, content, decimalFormat);
                                        changedValueAxis = {
                                            row : currSideAxisPath,
                                            column : currTopAxisPath,
                                            oldValue : cell.content,
                                            newValue : content
                                        };
                                        if(!multiEditStatus){
                                            changedValues.push(changedValueAxis);
                                        }else{
                                            delete this.highlightedChangedCells[this.getCellIdStr(changedValueAxis)];
                                        }
                                        previousMultiEditCount++;
                                    }

                                    // compare the received value for the cell with the current value in the cell, if they are different
                                    // save the cell position to the list of cells with changed values, which will be highlighted on the
                                    // next call to render.
                                    if(!isNew){
                                    	if(cellVal.dtype == 'doublerange' || cellVal.dtype == 'integerrange') {
                                      		if(cell && cell.content && content && !(this._areValuesTheSame(cellVal.dtype, cell.content, content, decimalFormat))) {
                                                  var multiEditStatus =this._getMultiEditStatus(currSideAxisPath,currTopAxisPath,cell.dtype, content, decimalFormat);
                                                  changedValueAxis = {
                                                      row : currSideAxisPath,
                                                      column : currTopAxisPath,
                                                      oldValue : cell.content,
                                                      newValue : content
                                                  };
                                                  if(!multiEditStatus){
                                                      changedValues.push(changedValueAxis);
                                                  }else{
                                                      delete this.highlightedChangedCells[this.getCellIdStr(changedValueAxis)];
                                                  }
                                      		}
                                      	} else {
                                      		if(!_.isObject(cellVal.value) && cell &&  ((cell.content != content) && 
                                      				!this._areValuesTheSame(cellVal.dtype, cell.content, content, decimalFormat)))
                                      		{
                                                  var multiEditStatus =this._getMultiEditStatus(currSideAxisPath,currTopAxisPath,cell.dtype, content, decimalFormat);
                                                  changedValueAxis = {
                                                      row : currSideAxisPath,
                                                      column : currTopAxisPath,
                                                      oldValue : cell.content,
                                                      newValue : content
                                                  };
                                                  if(!multiEditStatus){
                                                      changedValues.push(changedValueAxis);
                                                  }else{
                                                      delete this.highlightedChangedCells[this.getCellIdStr(changedValueAxis)];
                                                  }
                                      		}
                                      	}
                                    }
                                    
                                    cell.content = content;
                                    if (cell.dtype=='image'&&cell.content &&cell.content.length){
                                        this.defferRendering = true;
                                    }
                                }
                                if('cssCFRuleId' in cellVal){
                                	cell.cssCFRuleId=cellVal.cssCFRuleId;
                                }else{
                                	delete cell.cssCFRuleId;
                                }
                                if('render' in cellVal){
                                    cell.render=cellVal.render;
                                }else{
                                    delete cell.render;
                                }
                                // We don't want a non-editable and protected cell to appear
                                // as protected, so we only adjust the isProtected status if 
                                // the cell is editable.
                                if((cell.write == 'R' || cellVal.write == 'R')) {
                                    delete cellVal.isProtected;
                                }else if ('isProtected' in cellVal){
                                    cell.isProtected = cellVal.isProtected;
                                } else {
                                    delete cell.isProtected;
                                }

                                if( 'multiEdit' in cellVal){
                                    cell.multiEdit=true;
                                }else{
                                    delete cell.multiEdit;
                                }

                                if ('lock' in cellVal){
                                    cell.lock = cellVal.lock;
                                }
                                else{
                                    // If the server didn't return a "lock" entry for the
                                    // cell, then it is unlocked.
                                    cell.lock = "";
                                }
                                if ('write' in cellVal){
                                    cell.write = cellVal.write;
                                }
                                if ('canLock' in cellVal){
                                    cellVal.canLock = cellVal.canLock == "PHY~TMP" ? "PHY" : cellVal.canLock;
                                    cell.canLock = cellVal.canLock;
                                }
                                else{
                                    // If the server didn't return a 'canLock' entry for the
                                    // cell, then it is unlockable whatsoever.
                                    cell.canLock = "";
                                }
                                if ('cmtRelation' in cellVal){
                                    cell.cmtRelation = cellVal.cmtRelation;
                                }
                                else{
                                    cell.cmtRelation = "";
                                }
                                if ('cmtTitle' in cellVal){
                                    cell.cmtTitle = cellVal.cmtTitle;
                                }
                                else{
                                    cell.cmtTitle = "";
                                }
                                if ('fail' in cellVal){
                                    changedValueAxis = {
                                        loc : {
                                            row : currSideAxisPath,
                                            column : currTopAxisPath
                                        },
                                        reason : cellVal.fail
                                    };
                                    cell.failreason = changedValueAxis.reason;
                                    failedUpdates.push(changedValueAxis);
                                }
                                else{
                                    delete cell.failreason;
                                }

                                if ('info' in cellVal){
                                	 cell.info = cellVal.info;
                                }else{
                                	 delete cell.info;
                                }
                                
                                if ('warn' in cellVal){
                                	 cell.warn = cellVal.warn;
                                }else{
                                	 delete cell.warn;
                                }
                                
                                if ('cmProps' in cellVal){
                                    cell.cmProps = cellVal.cmProps;
                                }else{
                                    delete cell.cmProps;
                                }
                                
                                if ('cellIconTooltip' in cellVal){
                                    cell.cellIconTooltip = cellVal.cellIconTooltip;
                                }else{
                                    delete cell.cellIconTooltip;
                                }
                                
                                // Copy the rest of the attributes from the server
                                for ( var key in cellVal){
                                    if (cellVal.hasOwnProperty(key) && !(key in mandatoryAttr)){
                                        cell[key] = cellVal[key];
                                    }
                                }

                                var selected = cell && cell.$select;
                                item.$select = item.$select || selected;
                            }
                            else
                                item[currTopAxisPath] = {
                                    content : ""
                                };

                        }
                    }
                }
                if(attributesId.length >0 ){
                    topAxisPaths.shift();
                }
                if (request.params.viewSegment || request.params.clearEditConflictErrors || this.removeNonSegmentData){
                    this.removeDataNotInSegment(iteratedRowsPaths, iteratedColsPaths);
                    this.removeNonSegmentData = false;
                }
                // Remove the request from the getSegmentData request
                // map
                var payload = JSON.stringify(request.params);
                delete this.mapSegmentRequestsLoad[payload];
                this.semCheck--;
                //some times facet area is going forward/backward than request getsegment view port. If we are comming through scroll or
                //navigate by key then render facet area also, this not a expensive operation.
                var renderFacetArea = false;
                if(this.segmentDataRequestStack.busy){
                	this.segmentDataRequestStack.busy = false;
                	renderFacetArea = true;
                }
                /*if (request.params.viewport && request.params.viewport.yr && request.params.viewport.xr){
                	var xr = this._get_x_range(this._settings.prerender);
                    var yr = this._get_y_range(this._settings.prerender === true);
                    if(request.params.viewport.yr[0] != yr[0] || request.params.viewport.yr[1] != yr[1]  
                    || request.params.viewport.xr[0] != xr[0] ||request.params.viewport.xr[1] != xr[1]){
                    	this.defferRendering = true;
                    }
                }*/
                if (this.defferRendering){
                    //this._resetRowHeights();
                   // this._adjustChangedColumns();
                    //var hasAttr =  this._showAttributeArea();
                   // this.render(1,'structureChange','',hasAttr);
                	this._renderStructureChange(false);
                    this.defferRendering = false;
                }else if(renderFacetArea){
                	this.render(0,'structureChange');
                }else
                	this.render();
                
                this._unblockUI();
                this.lastExpandedNode = undefined;
                this._isUpdating = false;
                var $changedCells = $();
                var $multiEditCells=$();
                if (changedValues.length){

                    for (i = 0; i < changedValues.length; i++){
                        var val = changedValues[i];
                        var currDiv = this._locateCellDiv(val);
                        /*  if(val.multiEdit){
                         $multiEditCells=$multiEditCells.add($(currDiv));
                         }  
                         else{*/
                        $changedCells = $changedCells.add($(currDiv));
                        /* }*/
                        if (this._isPersistentChangeHighlightSupported()) {
                            this.highlightedChangedCells[this.getCellIdStr(val)]=1;
                        }
                    }
                    var $currentCells = $changedCells.filter('.tBucket-C');
                    var updateCellFunc = function(element) {
                        pivotlog('Highlight finished');
                        $currentCells.addClass('tBucket-C');
                        that.updateFocusedCell();
                    };
                    $currentCells.removeClass('tBucket-C');
                    if (this._isPersistentChangeHighlightSupported()) {
                        $changedCells.effect("highlight", {
                            'color' : '#00FFFF'
                        }, 2000).addClass('highlightedChangedCell', 1000, updateCellFunc);

                        // $multiEditCells.effect("highlight",{'color' : '#FDFD10'},2000).addClass('multiEditHighlight',1000,updateCellFunc);
                    } else {
                        $changedCells.effect("highlight", {
                            'color' : '#00FFFF'
                        }, 2000,updateCellFunc);
                    }

                }
	            if(failedUpdates.length){
	            	var highlightFunc = function() {
	                    var currDiv = that._locateCellDiv(this.loc);
	                    if (this.reason == _pns.Constants.failLock){
	                        $(currDiv).effect("highlight", {
	                            color : '#ff0000'
	                        }, 1000, function() {
	                            $(this).effect("highlight", {
	                                color : '#ff0000'
	                            }, 1000, function() {
	                                // that.updateFocusedCell();
	                            });
	                        });
	                    }
	                    else if (this.reason == _pns.Constants.failSecurity){
	                        $(currDiv).effect("highlight", {
	                            color : '#ff0000'
	                        }, 1000, function() {
	                            $(this).effect("highlight", {
	                                color : '#ffa500'
	                            }, 1000, function() {
	                                // that.updateFocusedCell();
	                            });
	                        });
	                    }
	                    that.updateFocusedCell();
	                };
	                $.each(failedUpdates, highlightFunc);
				}
                if ($(this.$view).parent().find('.cell-err').length || response.metadata.hasEditConflictErrors){
                    this.triggerEvent("exceptionsRaised");
                }else{
                    this.triggerEvent("exceptionsCleared");
                }
                this.updateFocusedCell();

                // invoke the hook if this is a response from undoing
                // the pending edits
                if(response.metadata.undoEdit) {
                    if (this.hooks.afterUndoEdit) {
                        var undoAll = false;
                        if(previousMultiEditCount == 1){
                            // this is the response for the undo command
                            // on the last editd cell.
                            undoAll = true;
                        }
                        var obj = {
                            ed:false,
                            undoAll:undoAll
                        };

                        this.hooks.afterUndoEdit.apply(this, [obj]);
                    }
                }

                // enable the buttons (Commit, Calculate, etc) as appropriate
                if (response.metadata.publish || response.metadata.commit || response.metadata.calculate) {
                    this.getScenarioStatus();
                }

                var isUpdateFactsRequest = (request['@class'] === _pns.getPivotPackagePrefix()+"protocol.UpdateFactsRequest");
                var isPasteCopiedContentRequest =  (request['@class'] === _pns.getPivotPackagePrefix()+"protocol.PasteCopiedContentRequest");
                if (this.isBusinessGraphEnabled() && this.getBusinessGraphWrapper().config.flyoutIsOpen && 
                		(isUpdateFactsRequest || isPasteCopiedContentRequest)) {
                	this.getBusinessGraphWrapper().fireEvent('refreshGraphData');
	            }else if(this.getSelected()){
	            	var cellId = {
	                         sideAxis :this.getSelected().row,
	                         topAxis : this.getSelected().column
	                     };
	            	 var intersection = this.getCellIntersection(cellId);
	            	if (this.isCommentEnabled() && this.getCommentWrapper().config.flyoutIsOpen) {		            	 
	                	 this.getCommentWrapper().fireEvent('pivotcellchanged', cellId, intersection);
		            }else if (this.isGraphEnabled() && this.getGraphWrapper() && this.getGraphWrapper().config.flyoutIsOpen 
		            												&& (isUpdateFactsRequest || isPasteCopiedContentRequest)) {
		            	this.getGraphWrapper().fireEvent('cellchange',cellId,intersection);
		            }
	            	
	            }
                // Run the post update handler.
                if(isUpdateFactsRequest){
                    var editCell = request.params && request.params.editCell;
                    var changedCellId = undefined;
                    if(editCell && editCell.sideAxisPath && editCell.topAxisPath){
                    	var currSideAxisPath = !this.areMeasuresOnTop() ? sideAxis.getMeasureRowIdFromAxisPath(editCell.sideAxisPath.facetPaths, editCell.sideAxisPath.measure) : sideAxis.getMeasureRowIdFromAxisPath(editCell.sideAxisPath.facetPaths);
                        var currTopAxisPath = this.areMeasuresOnTop() ? topAxis.getMeasureRowIdFromAxisPath(editCell.topAxisPath.facetPaths, editCell.topAxisPath.measure) : topAxis.getMeasureRowIdFromAxisPath(editCell.topAxisPath.facetPaths);
                        changedCellId = {
                        		row : currSideAxisPath,
                        		column : currTopAxisPath
                        }
                    }
                    this.hooks.afterUpdate && this.hooks.afterUpdate(changedValues, changedCellId);
                }
                // Run the post Paste handler.
                isPasteCopiedContentRequest && this.hooks.afterPaste && this.hooks.afterPaste(changedValues);
                                

                $(this.$view).parent().css('cursor', '');
                // clear selected cell when cube is not changed.
                /*if(this.data.cube.isCubeMetadataChanged === false){
                    this._clearSelectedDivInExpandMode();
                }*/

               /* //this._settings.y_scroll=true;
                // Follow up if this is an comment addition 
                if (request.params.value&&'add'==request.params.value.operation) {
                    this.data.callEvent("onAddComment", [ response, request ]);
                }*/
                !this._getPivotLockedMode() && this._selectCell();
                pivotlog("end jda_pivot.js _call_refreshOnGetSegmentData :"+pivotObjForRef.getFormatedTime());
            },
            _renderCell:function(item,currSideAxisPath,currTopAxisPath,cellVal){

                var cell = item[currTopAxisPath];
                // iteratedColsPaths[currTopAxisPath] = 1;
                var isNew = false;
                // var cellVal = values[i][j][k];
                if (!cell){
                    cell = {};
                    item[currTopAxisPath] = cell;
                    isNew = true;
                }
                // Let put first all the default values from the server onto the cell

                // We're being explicit in the
                // properties we allow form the server
                // so we don't overload the UI with info
                var mandatoryAttr = {
                    'dtype' : "",
                    'value' : "",
                    'content' : "",
                    'lock' : "",
                    'write' : "",
                    'fail' : "",
                    'cmtRelation' : "",
                    'canLock' : ""
                };
                if ('value' in cellVal){
                    var content = cellVal.value;
                    cell.dtype = cellVal.dtype;
                    // if (typeof content != "number")
                    // {
                    // }
                    // else
                    content=_.isObject(cellVal.value)?cellVal.value:""+cellVal.value;

                    /*if(cell.multiEdit){
                     var multiEditStatus =this._getMultiEditStatus(currSideAxisPath,currTopAxisPath,content);
                     changedValueAxis = {
                     row : currSideAxisPath,
                     column : currTopAxisPath,
                     oldValue : cell.content,
                     newValue : content
                     };
                     if(!multiEditStatus){
                     changedValues.push(changedValueAxis);
                     }else{
                     delete this.highlightedChangedCells[this.getCellIdStr(changedValueAxis)];
                     }
                     previousMultiEditCount++;
                     }

                     if (!isNew && !_.isObject(cellVal.value) &&
                     cell &&
                     ((cell.content != content) && !this._areValuesTheSame(MathUtilities
                     .parseFloat(cell.content) , MathUtilities
                     .parseFloat(content))))
                     {
                     var multiEditStatus =this._getMultiEditStatus(currSideAxisPath,currTopAxisPath,content);
                     changedValueAxis = {
                     row : currSideAxisPath,
                     column : currTopAxisPath,
                     oldValue : cell.content,
                     newValue : content
                     };
                     if(!multiEditStatus){
                     changedValues.push(changedValueAxis);
                     }else{
                     delete this.highlightedChangedCells[this.getCellIdStr(changedValueAxis)];
                     }
                     }*/
                    cell.content = content;
                    /*if (cell.dtype=='image'&&cell.content &&cell.content.length){
                     this.defferRendering = true;
                     }*/
                }

                if('render' in cellVal){
                    cell.render = cellVal.render;
                }else{
                    delete cell.render;
                }
                if('isProtected' in cellVal){
                    cell.isProtected=true;
                }
                else{
                    delete cell.isProtected;
                }

                if( 'multiEdit' in cellVal){
                    cell.multiEdit=true;
                }else{
                    delete cell.multiEdit;
                }

                if ('lock' in cellVal){
                    cell.lock = cellVal.lock;
                }
                else{
                    // If the server didn't return a "lock" entry for the
                    // cell, then it is unlocked.
                    cell.lock = "";
                }
                if ('write' in cellVal){
                    cell.write = cellVal.write;
                }
                if ('canLock' in cellVal){
                    cellVal.canLock = cellVal.canLock == "PHY~TMP" ? "PHY" : cellVal.canLock;
                    cell.canLock = cellVal.canLock;
                }
                else{
                    // If the server didn't return a 'canLock' entry for the
                    // cell, then it is unlockable whatsoever.
                    cell.canLock = "";
                }
                if ('cmtRelation' in cellVal){
                    cell.cmtRelation = cellVal.cmtRelation;
                }
                else{
                    cell.cmtRelation = "";
                }
                /*if ('fail' in cellVal){
                 changedValueAxis = {
                 loc : {
                 row : currSideAxisPath,
                 column : currTopAxisPath
                 },
                 reason : cellVal.fail
                 };
                 cell.failreason = changedValueAxis.reason;
                 failedUpdates.push(changedValueAxis);
                 }
                 else{
                 delete cell.failreason;
                 }*/

                // Copy the rest of the attributes from the server
                for ( var key in cellVal){
                    if (cellVal.hasOwnProperty(key) && !(key in mandatoryAttr)){
                        cell[key] = cellVal[key];
                    }
                }

                var selected = cell && cell.$select;
                item.$select = item.$select || selected;

            },
            _selectCell: function(){
            	
            	var cell = _.throttle(function(){
					this._maintainSelected();},2000);
            	if(this._selectedCellDiv){
            		cell.apply(this);              		
            		this._finalize_select_cell(this.getSelected()); //select the cell, which will internally check if it's a normal text box or dropdown(data domain).
            	}else{/*var cell = _.throttle(function(){
					this._maintainSelected();},2000);*/
                	var cell = _.throttle(function(){
						this._calculateSelectedCellScrollPosition();},2000);
                    	if(this._selectedCellDiv){
                    		cell.apply(this);              		
                    		this._finalize_select_cell(this.getSelected());//select the cell, which will internally check if it's a normal text box or dropdown(data domain).
                    	}else{
                    		this._debounceSelectFirstCell();
                    	}}
            },
            updateFocusedCell : function() {
                var that = this;
                if (that.$_viewobj.find(".cell_editor").length === 0){
                    var selectedFocused = that.$_viewobj.find('div.dhx_cell_select.dhx_value');
                    if(this.isCellAvailableInView(selectedFocused)){
                        $(that._viewobj).find('div.focusedCell').removeClass('focusedCell').removeAttr('tabindex');
                        
                        //Local function (to remove code duplication)
                        var selectCellFun = function(){
                        	selectedFocused.attr('tabindex', 0).addClass('focusedCell');
                        	selectedFocused.attr('tabindex', 0).is(":focus") || selectedFocused.attr('tabindex', 0).focus();
                        };
                       // time out is required for IE for tabIndex. if time out is not provided then pressing tab key
                        // wont work in IE
                        if(dhtmlx.env.isIE){
	                        setTimeout(selectCellFun,50);
                        }else{
                        	selectCellFun();
                        }
                        
                        this._markSelectedCell(selectedFocused);
                    }
                }
                else{
                	that.$_viewobj.find(".cell_editor").is(":focus") || that.$_viewobj.find(".cell_editor").focus();
                }
                //that._header.childNodes[1].scrollLeft = that._body.childNodes[1].scrollLeft;
            },
            /*updateYScroll : function() {
            	var that = this;
            	//that._y_scroll._viewobj.scrollHeight;
            	that._scrollTop = that._y_scroll._viewobj.scrollTop;
                var conts = that._body.childNodes;
                var scrollElement = null;
                var i = conts.length;
                while(i>0){
                	i--;
                	if(i==0 && (this.areMeasuresOnTop() == false) && this.sideFacetMaxWidthReached && conts[i].childNodes[1]){
                		conts[i].childNodes[1].scrollTop=that._scrollTop;
                	}
					var scrollElement = conts[i].firstChild;
					if (scrollElement) {
						scrollElement.scrollTop = that._scrollTop;
					}
                }
               
                that._setFloatingMemberVertical();
            },*/
            /*updateXScroll : function(){
            	var that = this;
            	that._scrollLeft = that._getDataArea().getScrollLeft();//that._x_scroll._viewobj.scrollLeft;
            	var conts = that._body.childNodes;
                var i = conts.length;
                while(i>0){
                	i--;
                	switch(i){
                	case 0:
                		conts[i].scrollLeft = that._sideFacetScrollLeft;
                		 that._header.childNodes[i].scrollLeft = that._sideFacetScrollLeft;
                         that._footer.childNodes[i].scrollLeft = that._sideFacetScrollLeft;
                		break;
                	case 1:
                		 conts[i].scrollLeft = that._attrScrollLeft;
                		 that._header.childNodes[i].scrollLeft = that._attrScrollLeft;
                		 that._footer.childNodes[i].scrollLeft = that._attrScrollLeft;
                		break;
                	case 2:
                		conts[i].scrollLeft = that._scrollLeft;
                		 that._header.childNodes[i].scrollLeft = that._scrollLeft;
                		 that._footer.childNodes[i].scrollLeft = that._scrollLeft;
                		break;
                	default:
                		conts[i].scrollLeft = that._scrollLeft;
                	 	that._header.childNodes[i].scrollLeft = that._scrollLeft;
                	 	that._footer.childNodes[i].scrollLeft = that._scrollLeft;
                		break;
                	
                	}
                	
                	
                }
                that._setFloatingMemberHorizontal();
            },*/
            getCellIntersection: function(cellLocation){
                var arr=[];
                var view = this._getCubeView();
                var axisId = 0;

                var measureId="";
                var rowAxisPath = new _pns.axisPath(cellLocation.sideAxis);
                var colAxisPath = new _pns.axisPath(cellLocation.topAxis);
                if(rowAxisPath.measure){
                    measureId =rowAxisPath.measure;
                }else if(colAxisPath.measure){
                    measureId=colAxisPath.measure;
                }

                var sideVisibleFacets = this.getSideVisibleFacets();
				var topVisibleFacets = this.getTopVisibleFacets();
				
				var axis = view[axisId];
                var rowAxis= axis.getAxisPathLabelObj(rowAxisPath, false, true);
                var facetObj=undefined;
                for(var rowfacet = 1; rowfacet<rowAxis.length; rowfacet++ ){
                	facetObj = axis.addFilterLevelName(rowfacet,rowAxis[rowfacet]);
                	this.addSingleScenarioNameToIntersection(facetObj);
                	arr.push(facetObj);
                }
                axis = view[axisId+1];
                var colAxis= axis.getAxisPathLabelObj(colAxisPath, false, true);
                for(var colfacet = 1; colfacet<colAxis.length; colfacet++ ){
                    facetObj = axis.addFilterLevelName(colfacet,colAxis[colfacet]);
                    this.addSingleScenarioNameToIntersection(facetObj);
                	arr.push(facetObj);
                }
                
                var msr =_.findWhere(this.data.cube.definition.visiblemeasures,{id:measureId});
                
                if(!msr){
                	msr = {label:measureId,id:measureId}
                }
                var msrID ={
                    facetLabel: "Measure",
                    facetLevelLabelObj: msr.label,
                    facetLevelNameObj: msr.id,
                };
                arr.push(msrID);
                
                return arr;
            },
            addSingleScenarioNameToIntersection : function(facetObj) {
            	 var cube = this._getCubeDefinition();
            	 if(facetObj && facetObj.facetLabel && facetObj.facetLevelLabelObj && facetObj.facetLabel == cube.scenariosDimensionKey &&
            			 cube.availableScenarios && cube.availableScenarios.length > 0){
             		var facet = this.getFacetFromFacetName(facetObj.facetLabel);
             		facet.UIAttributes.visible || (facetObj.facetLevelLabelObj = cube.availableScenarios[0]);
         		}
            },
            getCellAxisLabel : function(tooltipElement) {
                var pivotLocation = this.locateCell(tooltipElement);
                var view = this._getCubeView();
                var axisId = 0;
                var axis = view[axisId];
                var axisPath = new _pns.axisPath(pivotLocation[axisId]);

                var toolTipText = "<DIV class='pivotCellTooltip'>";
                toolTipText += axis.getAxisPathLabel(axisPath);
                axisId = 1;
                axis = view[axisId];
                axisPath = new _pns.axisPath(pivotLocation[axisId]);
                toolTipText += axis.getAxisPathLabel(axisPath);
                toolTipText += this.getLockLabel(pivotLocation);
                toolTipText += "</DIV>";
                return toolTipText;
            },

            getLockLabel : function(pivotLocation) {
                var retStr = "<DIV style='clear:both;float:left;'>";
                var lockVal = this.getValueFromAxisLocation(pivotLocation).lock;
                if (!lockVal){
                    return "";
                }

                retStr += this.getLocaleString(_pns.Constants.lockDescPrefix + lockVal);

                retStr += "</DIV>";
                return retStr;
            },
            getCellError : function(hoveredElement) {
            	var cellProp = 'failreason';	
            	if(hoveredElement.className.indexOf(this._getInfoClasses()) > 0){
            	var cellProp = 'info';	
            	}else if(hoveredElement.className.indexOf(this._getWarnClasses()) > 0){
            	 cellProp = 'warn';	
            	}
            	
                var pivotLocation = this.locateCell(hoveredElement);
                var value = this.getValueFromAxisLocation(pivotLocation);
                var retVal = null;
                if (value !== undefined) {
                    retVal = this.getLocaleString(_pns.Constants.cellUpdateErrorPrefix + value[cellProp]);
                    !retVal && (retVal = value['cellIconTooltip']);
                }
                !retVal && (retVal = value.failreason);
                return retVal;
            },
            getCellData : function(context)
            {
                var pivotLocation = this.locateCell(context);
                var value = this.getValueFromAxisLocation(pivotLocation);
                return value;
            },
            getFacetMemberComments : function(tooltipElement) {
                var toolTipText = "Test dim ";
                return toolTipText;
            },
            updateCellhandlers : function() {
                // Select all elements that are to share the same
                // tooltip
                var that = this;
                var lockedDivs = this.$_viewobj.find('#jda_pivot_corner>div>.ui-icon-locked');
                var unlockedDivs = this.$_viewobj.find('#jda_pivot_corner>div>.ui-icon-unlocked');
                lockedDivs.add(unlockedDivs).unbind('click');
                lockedDivs.click(function() {
                    var lockedMode = that._getPivotLockedMode();
                    if (lockedMode){
                        $(this).addClass('ui-icon-unlocked').removeClass(
                                'ui-icon-locked' + _pns.Constants.UiIconPrefix + lockedMode.toLowerCase())
                            .addClass();
                        that.setPivotLockedMode("");
                        that.updateCellhandlers();
                    }
                });
                unlockedDivs.click(function() {
                    var lockedMode = that._getPivotLockedMode();
                    if (!lockedMode){
                        $(this).addClass('ui-icon-locked ' + _pns.Constants.TempLockCSS).removeClass(
                            'ui-icon-unlocked');
                        that.setPivotLockedMode(_pns.Constants.TempLock);
                        that.updateCellhandlers();
                    }
                });
                var cellCheckBoxes = $('div.dhx_ss_body > div.dhx_ss_center  .dhx_cell.editabledata input[type="checkbox"]');
                cellCheckBoxes.click(function(evt){
                    var checkbox = evt.currentTarget;
                    var pivotLocation = that.locateCell(checkbox);
                    var currVal = that.getValueFromAxisLocation(pivotLocation);
                    var boolValue = checkbox.checked;

                    var newVal = {};
                    newVal.dtype = currVal.dtype;
                    newVal.value = boolValue;
                    newVal[_pns.Constants.wasCellEdited] = true;
                    
                    var cellId = {
                    		sideAxis :currVal.row,
                    		topAxis : currVal.column
                    };

                    if(that.isMultiEditActive){
                        var item = that.data.pull[currVal.row];
                        var cell = item[currVal.column];
                        var key = that._prepareCellKey(currVal.row,currVal.column);
                        that.multiEditValues[key]=that.getMultiEditValue(currVal, key);
                        newVal[_pns.Constants.transactionMode]=true;
                       
                        cell.content = boolValue ? "true" : "false";

                        that._getMultiEditRequest(newVal,cellId);
                        
                        that.isDataFilterEnabled() && that.getDataFilterController().setDisableFilterActions(true);

                        if (that.hooks.afterMultiEdit){
                            that.hooks.afterMultiEdit.apply(that, [ cellId, newVal, currVal ]);
                        }
                    }
                    else{
                    	 that._getupdateFactsRequest(cellId, newVal);
                    }
                });
                var valCels = this.$_viewobj.find('.dhx_value');
                valCels.click(function() {
                    that.$_viewobj.find('.commentsTooltipLayer').hide();
                });

                lockedDivs.add(valCels.not('.ui-icon-locked,.naValue')).unbind('hover');
                var lockMode = this._getPivotLockedMode();
                if (lockMode){
                    var that2 = this;
                    valCels.not('.ui-icon-locked,.naValue').hover(
                        function() {

                            var lockSpan = $(this).find('.cell_lock');
                            if (lockSpan.length){
                                var pivotLocation = that.locateCell(lockSpan[0]);
                                var value = that.getValueFromAxisLocation(pivotLocation);
                                if (!value.lock && value.canLock){
                                    var lockModeCss =
                                        _pns.Constants.UiIconPrefix + value.canLock.toLowerCase();
                                    lockSpan.addClass('ui-icon-locked ui-icon ' + lockModeCss).show();
                                }
                            }// end mouse in
                        },
                        function() {
                            var lockSpan = $(this).find('.cell_lock');
                            if (lockSpan.length){
                                var pivotLocation = that.locateCell(lockSpan[0]);
                                if (pivotLocation){
                                    var value = that.getValueFromAxisLocation(pivotLocation);
                                    if (!value.lock && value.canLock){
                                        var lockModeCss =
                                            _pns.Constants.UiIconPrefix + value.canLock.toLowerCase();
                                        lockSpan.removeClass('ui-icon-locked ui-icon ' + lockModeCss)
                                            .hide();
                                    }
                                }
                            }// end mouse out
                        });

                }else{
	            	 valCels.not('.ui-icon-locked,.naValue').hover(function() {
	                     var lockSpan = $(this).find('.cell_lock');
	                     if (lockSpan.length){
	                         var pivotLocation = that.locateCell(lockSpan[0]);
	                         if (pivotLocation){
	                             var value = that.getValueFromAxisLocation(pivotLocation);
	                             if (value && !value.lock && value.canLock){
	                                 var lockModeCss = _pns.Constants.UiIconPrefix + value.canLock.toLowerCase();
	                                 lockSpan.removeClass('ui-icon-locked ui-icon ' + lockModeCss).show();
	                             }
	                         }
	                     }
	            	});
                }

            },
            _getPivotLockedMode : function() {
                return this.pivotLockedLocked;
            },
            setPivotLockedMode : function(type) {
                return this.pivotLockedLocked = type;
            },

            /**
             * Call Back for update facts response. This will be called when update facts response metadata set as render
             *
             */
            _call_onGetRenderTypeResponse:function(response,request){

                pivotlog("% submit Render cell response");

                var sideAxis = this.getSideAxisView();
                var topAxis = this.getTopAxisView();
                var values = response.result;
                var pull = this.data.pull;
                var sideAxisPaths = request.params.sideAxisPaths || request.params.viewSegment.sideAxisPaths;
                var topAxisPaths = request.params.topAxisPaths || request.params.viewSegment.topAxisPaths;
                var attributesId = request.params.measuresIds && request.params.measuresIds.length >0 ? request.params.measuresIds :[];


                for (var i = 0; i < sideAxisPaths.length; i++){
                    for (var j = 0; j < topAxisPaths.length; j++){
                        // for attribute area
                        if(j == 0 && attributesId.length>0){
                            for(m=0; m<attributesId.length;m++){

                                var currSideAxisPath = sideAxis.getMeasureRowIdFromAxisPath(sideAxisPaths[i].axisPath);
                                var  currTopAxisPath = attributesId[m];

                                var item = pull[currSideAxisPath];

                                if (!item)
                                    continue;
                                if (values.length !== 0){
                                    var cellVal = values[i][j][m];

                                    var cell = item[currTopAxisPath];
                                    if(cell.display == cellVal.display){
                                        continue;
                                    }
                                    var changedValueAxis = {
                                        row : currSideAxisPath,
                                        column : currTopAxisPath,
                                        oldValue : cell.content,
                                        isMultipleChanged : cell.isMultiple !==  cellVal.isMultiple
                                    };
                                    // highlight the updated option
                                    this.highlightedChangedCells[this.getCellIdStr(changedValueAxis)]=1;
                                    cell.content = cellVal.value;
                                    if (cellVal.display === undefined) {
                                        delete cell.display;
                                    } else {
                                        cell.display = cellVal.display;
                                    }
                                    if (cellVal.isMultiple === undefined) {
                                        delete cell.isMultiple;
                                    } else {
                                        cell.isMultiple = cellVal.isMultiple;
                                    }
                                }
                            }

                            continue;
                        }
                    }
                }

                var hasAttr =  this._showAttributeArea();
                this.render(0,'','',hasAttr);

            },
            /**
             * Submit render type cell. When selected option has been selected
             */
            submitRenderCell:function(unselect){
                if(this.$activeEditor ){
                	var cellId = this.getEditingCell();
                    if(this.isSubmitValueChanged(true) && (this.$activeEditor.val() != "__Nv__")){
                        var newContentValue = this.$activeEditor.val();

                        var item = this.data.pull[cellId.row];
                        var cell = item[cellId.column];

                        var updateCellObj={
                            ed:true,
                            dtype:cell.dtype,
                            //render:this.$activeEditor.prop(_pns.Constants.renderType),
                            render:cell.render,
                            value:newContentValue
                        };
                        var updateCellId={
                            sideAxis:cellId.row,
                            topAxis:cellId.column
                        };

                        //if(this.$activeEditor.prop('attributeArea') === true){
                        updateCellId.measureId = cellId.column;
                        //}
                        // send update facts request for updating current selected cell
                        this._updateRenderCell(updateCellObj,updateCellId);
                        this.$activeEditor.remove();
                        this.$activeEditor = null;
                    }
                    else{
                        this.$activeEditor.remove();
                        this.$activeEditor = null;
                        var hasAttr =  this._showAttributeArea();
                        this.render(0,'','',hasAttr);
                        //this.bringScrollToClientArea(this._locateCellDiv(editingCellId));
                    }
                    this._renderColumn(this.columnIndex(cellId.column), this._get_y_range(false), true);
                }
            },
            /**
             * Check current selected cell has render type
             */
            hasCellRenderType:function(){

                if(this.$activeEditor && this.$activeEditor.prop(_pns.Constants.renderType)){
                    return true;
                }
                return false;
            },

            /**
             * Render cell as combo
             */
            onRenderTypeCombo:function(options, cellID){
                var that =this;
                if(options){
	                    var $cellDiv = $( that._locateCellDiv(cellID));
	                    var currCellValue = that.data.getCellValFromCellId(cellID);
	                    var comboVal = currCellValue.content;
	
	                    $cellDiv.css( 'cursor', 'default' );
	
	                    $cellDiv.addClass('editingCell').removeAttr('tabindex').find('.cell_content').remove();
	
	                    that.$activeEditor =
	                        $("<select></select>").prop({
	                            'tabindex' : 0,
	                            'render' : 'combo',
	                            'changed':false,
	                            'cellId' : cellID
	                        }).addClass("cell_editor dhx_table_cell").change(function(e){
	
	                            var target = e.srcElement || e.target;
	                            var text = target.value;
	                            target.changed =true;
	                            //that.$activeEditor.prop('changed',true);
	                            //pivotlog(text);
	                        });
	                    var hasSelected = false;
	                    _.each(options,function(option){
	                        var value, display;
	                        value = option.value === undefined ? option.display : option.value;
	                        display = option.display === undefined ? option.value : option.display;
	                        var isSelected = value===comboVal;
	                        hasSelected = hasSelected || isSelected;
	                        that.$activeEditor.append($('<option '+(isSelected?'selected':'')+'></option>').val(value).text(display));
	
	                    });
	                    
	                    if (currCellValue.isMultiple) {
	                        that.$activeEditor.prepend($('<option  selected="selected" class="hideMultipleOption"></option>').val(comboVal).text(currCellValue.display !== undefined ? currCellValue.display : that.getLocaleString('Multiple') ));
	                    }else if(!hasSelected){
	                    	that.$activeEditor.prepend($('<option  selected="selected" class="hideMultipleOption"></option>').val("").text(""));
	                    }
	
	                    if($cellDiv.hasClass('attributeArea')){
	                        that.$activeEditor.prop('attributeArea',true);
	                    }
	
	                    var $metaDiv=$cellDiv.find('.metaInfo');
	                    var $editorParent=that.$activeEditor.wrap($("<span>", {"class": "cell_editor_wrapper"})).parent().prepend($metaDiv).css("line-height", "18px");
	                    $cellDiv.html($editorParent);
	                    that.updateFocusedCell();
                }

            },
            /**
             * Render cell as combo
             */
            _call_onRenderTypeCombo:function(response,request,pivotData,pivotObj){
                var that =pivotObj;
                // Call Back function during get cell details response
                pivotlog("response result %o",response.result.combo);
                var options = response.result.combo;
                if(options){

                    var sideAxisPath = that.areMeasuresOnTop() ? that.getSideAxisView().getMeasureRowIdFromAxisPath(request.params.sideAxisPath) :
                        that.getSideAxisView().getAxisPathIdStr(request.params.sideAxisPath,request.params.measureId) ;
                    var topAxisPath = that.areMeasuresOnTop() ?  that.getTopAxisView().getMeasureRowIdFromAxisPath(request.params.topAxisPath,request.params.measureId) :
                        that.getTopAxisView().getAxisPathIdStr(request.params.topAxisPath); 

                    // Let's make sure in the time being we didn't click on some other cell
                   pivotlog('_call_onRenderTypeCombo this.lastSelectedId=%o sideAxisPath=%o  topAxisPath=%o',this.lastSelectedId,sideAxisPath,topAxisPath);
                    if (!this.lastSelectedId || (this.lastSelectedId.row === sideAxisPath && this.lastSelectedId.column === topAxisPath))
                    {
	                    var cellID = {
	                        row:sideAxisPath,
	                        column:topAxisPath,
	                        section:_pns.Constants.attrCellsSection
	                    };
	                    /* var item = that.item(cellID.row);
	                     var currVal = item[cellID.column];*/
	                    that.onRenderTypeCombo(options, cellID);
                }
              //      that._adjustYScroll($cellDiv.closest('.dhx_ss_center_scroll').scrollTop());
                }

            },
            /**
             * Start sending new request for selected cell.
             */
            startRenderCell : function(cellId, cellDIV){
                pivotlog("Entered jda_pivot.js startRenderCell ");

                var $cellDiv = $(cellDIV);
                var section = _pns.Constants.dataCellsSection;
                if($cellDiv.hasClass('editingCell') || $cellDiv.hasClass('editabledata') !== true ){
                    return;
                }else if(this.$activeEditor){

                    this.$activeEditor.remove();
                    this.$activeEditor = null;

                }

                $cellDiv.addClass('editingCell');
                $cellDiv.css( 'cursor', 'wait' );
                var that = this;
                var cellLocation=new _pns.CellLocation(cellId);
                var params={
                    topAxisPath         :cellLocation.getTopAxisArray(),
                    sideAxisPath        :cellLocation.getSideAxisArray(),
                    measureId           :cellLocation.getMeasureId() || cellId.column
                };
                // send new request to get list of option 
                this._getGetCellDetailsRequest(params,{callback: this._call_onRenderTypeCombo});



            },
            /**
             * Precondtion: Make sure the cellId points to a data cell before editing.
             *
             * @param cellId
             *            {row : rowId , column: colId}
             */
            startEdit : function(cellId, lockMode) {
                pivotlog("Entered jda_pivot.js startEdit");
                var $cellDiv = $(this._locateCellDiv(cellId)).addClass('editingCell');
                var decimalPoints = this.getDecimalFromCellId(cellId);
                var currVal = this.data.getCellValFromCellId(cellId);

                if (currVal.dtype == "boolean") {
                    // editing of booleans is handled in click callback for checkboxes
                    return;
                }

                if (this.hooks.beforeEdit){
                    var retVal = this.hooks.beforeEdit.apply(this, [ cellId, currVal, lockMode ]);
                    if (!retVal)
                        return;
                }

                var currentCellContent = this.renderedValue(this.data.getCellValFromCellId(cellId), decimalPoints);
                // prepare the editor
                if (currentCellContent === '__Nv__')
                    currentCellContent = "";
                var that = this;

                $cellDiv.removeAttr('tabindex').find('.cell_content').remove();

                this.$activeEditor =
                    $("<input type='text'></input>").prop({
                        'tabindex' : 0,
                        'lockMode' : lockMode,
                        'cellId' : cellId
                    }).addClass("cell_editor dhx_table_cell").val(currentCellContent).change(function(e) {
                        that._navigateByKey($(this), cellId);
                        e.preventDefault ? e.preventDefault() : e.returnValue = false;
                        return false;
                    }).keypress(function(e) {

                        if (e.keyCode == 10 || e.keyCode == 13)
                            e.preventDefault ? e.preventDefault() : e.returnValue = false;

                    });
                var $metaDiv=$cellDiv.find('.metaInfo');
                var $editorParent=this.$activeEditor.wrap($("<span>", {"class": "cell_editor_wrapper"})).parent().prepend($metaDiv).css("line-height", this._settings.rowHeight+"px");
                $cellDiv.html($editorParent);

                this.$activeEditor.select();
                this.updateFocusedCell();

            },
            processValidation : function(cellDiv) {
                if (this.$activeEditor.isValid)
                    return true;
                var invalidRes = this.isEditInvalid();
                if (invalidRes || invalidRes == '-'){
                    this.applyErrorToCellIndicator(cellDiv.closest(".dhx_cell"), invalidRes.msg);
                    $(this._selectedCellDiv).addClass("cell-invalid");
                    // this.revertEdit();
                    // this.cancelEdit();
                    this.triggerEvent('handleToolbar',{enable:false});
                    return false;
                }
                this.clearErrorCellIndicator(cellDiv.closest(".dhx_cell"));
                this.clearInfoCellIndicator(cellDiv.closest(".dhx_cell"));
                this.clearWarnCellIndicator(cellDiv.closest(".dhx_cell"));
                this.$activeEditor.isValid = true;
                this.triggerEvent('handleToolbar',{enable:true});
                return true;
            },
            // Handle double click on a cell after it is selected.
            _startEditOnDblClick : function(e) {
                // Validate and already editing
                e = e || window.event;
                var trg = e.target || e.srcElement;
                var cellDiv = $(trg).closest('.dhx_cell');
                var parentColumnDiv = $(cellDiv).closest('[column]');
                var cellIndex = cellDiv.index();
                /**
                 * var isValid=this.processValidation(cellDiv); if (!isValid) return;
                 */
                var cellId = undefined;
                while (parentColumnDiv.length){

                    var column = parentColumnDiv.attr("column");
                    if (column){
                        var index = cellIndex + this._columns[column]._yr0;
                        cellId = {
                            row : this.data.order[index],
                            column : this._columns[column].id,
                            section: _pns.Constants.dataCellsSection
                        };
                        break;
                    }

                    trg = trg.parentNode;
                }
                if(this.hasCellRenderType()){
                	if(this.$activeEditor && !cellDiv.hasClass("editingCell")){
                		var options = this.getDataDomainValues(cellId);
                		this.onRenderTypeCombo(options,cellId);
                    }
                    return;
                }
                if (this.isEditing() && !this.submitEdit()){
                    return;
                }
                pivotlog("Entered jda_pivot.js _startEditOnDblClick");
            

                if (cellId !== undefined){
                    if (this.isCellEditable(cellId) && this.doScrollPartiallyVisibleCellToFull(cellId, true)){
                        this.startEdit(cellId);
                    }
                }
            },
            // Handles first key stroke after the table is armed for
            // editing.
            _startEditOnKeyDown : function(e) {
            	/*if (e.shiftKey||(e.shiftKey&&event.keyCode!=9)||e.ctrlKey||this.isEditing() || this._isUpdating){
                	return;
            	}*/
	            if (e.ctrlKey||this.isEditing() || this._isUpdating){
	                return;
	            }

                pivotlog("Entered jda_pivot.js _startEditOnKeyDown");
                var cellId = this.getSelected();
                if (cellId === undefined){
                    return; // ignore if no selection
                }

                if (!cellId.row || !cellId.column){
                    // ignore if the selection wasn't on a cell.
                    return;
                }

                var event = window.event || keyEvent;
                var keyCode = event.charCode || event.keyCode;
                if (this._isKeyForNavigate(keyCode) && (!this._getPivotLockedMode() || keyCode != 13)){
                	if(e.shiftKey){
                		if(this.isCopyPasteEnabled()){
                			//this._selectCellForCopy(e, cellId);
                   		 var selectedNode = $(this._viewobj).find('div.dhx_cell_select.dhx_value');
                       		if(!this.isCellAvailableInView(selectedNode)){
                       			_.throttle(function(e, cellId){
                       					this._selectCellForCopy(e, cellId);
                       				},300);
                       		}else{
                       				this._selectCellForCopy(e, cellId);
                       		}
                		}else{
                			return;
                		}
                		
                		
                	}else{
                		if(this.cellSelForCopyIndicator){
                			cellId = selectedCellId;
                			this.cellSelForCopyIndicator = false;//Reset this value to it's original value.
                			this._refreshSelectedCellScrollPosition(this.selectedCellsInfo.scrollX,this.selectedCellsInfo.scrollY,cellId,e); //latest changes
                			this._clearMultiSelection();//Clear the selection and select the base cell as selected cell.
                		}
                		else{
                			this._navigateByKey(e, cellId);  // latest changes
                		}
                	}
                }
                else if (this._isKeyForPressed(keyCode) || (keyCode == 113)){ // F2 \
                    if (this.isCellEditable(cellId) && this.doScrollPartiallyVisibleCellToFull(cellId, true)){
                        pivotlog("At jda_pivot.js _startEditOnKeyDown entered to edit mode with key " +
                            keyCode + "  this._isKeyForPressed(keyCode) is " +
                            this._isKeyForPressed(keyCode));
                        this.startEdit(cellId);
                        // once the editing is started, the input field
                        // will
                        // handle furthur key strokes, so disarm the
                        // table.
                        // this._editDisarm();
                    }
                }
                else if (keyCode == 13) // Enter
                {
                    // Check if we're in lock mode. If so an enter
                    // consitutes a lock\unlock
                    if (this._getPivotLockedMode() && (event.target.parentNode.id != 'jda_pivot_corner')){
                        var currVal = this.data.getCellValFromCellId(cellId);
                        if (!currVal.canLock)
                            this.toggleLock(this._locateCellDiv(cellId), currVal.canLock);

                        e.preventDefault ? e.preventDefault() : e.returnValue = false;
                        return false;
                    }
                }
            },
            _navigateByKey : function(e, cellId) {
                this._isNavigating = true;
                // Work around undefined e.keyCode on IE 8.
                var event = (window.event ? window.event : e);
                this.lastEventOnPivot = event;
                var keyCode = event.charCode ? event.charCode : event.keyCode;
                var cellId2 = null;
                var currCellDiv = this._locateCellDiv(cellId);
                if (!currCellDiv){
                    dhtmlx.html.preventEvent(event);
                    this._isNavigating = false;
                    return;
                }
                var isEditing = this.isEditing();

                var xOffset = 0;
                var yOffset = 0;
                var movement = false;
                var isShiftDown = event.shiftKey;
                var rowIndex = this.indexById(cellId.row);
                var columnIndex = this.columnIndex(cellId.column);
                var startIndex = (this._getDataSplitIdx() ? this._getDataSplitIdx() : 0);
                switch (keyCode)// right arrow	39	left arrow	37	up arrow	38	down arrow	40 tab  9
                {
                    
                    case 38:
                      	 cellId2 = this._locateNextImmediateCell(cellId, "up");
                      	 break;
                    case 40:
                         cellId2 = this._locateNextImmediateCell(cellId, "down");
                    	 break;
                    case 13:
                    	 cellId2 = this._locateNextEditableCell(cellId, "down");
                         break;
                    case 9:
                        if (isShiftDown){
                            cellId2 = this._locateNextEditableCell(cellId, "left");
                        }
                        else{
                            cellId2 = this._locateNextEditableCell(cellId, "right");
                        }

                }
                if ((keyCode == 13 || keyCode == 40 || keyCode == 9  || keyCode == 38)){ // return or down arrow

                    pivotlog("At jda_pivot.js _navigateByKey entered processValidation " + isValid);
                    if (this.isEditing()){
                        var isValid = this.processValidation($(currCellDiv));
                        if (!isValid){
                            e.stopImmediatePropagation();
                            var that = this;
                            // Bring back the focus to the edited cell. So that user can modify the cell
                            // TODO : focus has been lost if we doesnt add delay of 200ms.Need to identify why delay is required
                        	_.delay(function(){
                        		if(!that.$_viewobj.find(".cell_editor").is(":focus")){
                        			that.$_viewobj.find('.cell_editor').focus();
                        		}
                        	},200);
                            return;
                        }
                    }
                    dhtmlx.html.preventEvent(event);
                    e.stopImmediatePropagation();
                    var currVal = this.data.getCellValFromCellId(cellId);
                    var cellLockMode = currVal.canLock;
                    if (this._getPivotLockedMode() == cellLockMode && keyCode == 13 && cellLockMode){
                        this.toggleLock(currCellDiv, cellLockMode);
                    }
                    if (cellId2){
                        if (this.isEditing() && !this.submitEdit()){
                            this._isNavigating = true;
                            e.stopImmediatePropagation();
                            this.cancelEdit();
                            this.updateFocusedCell();
                            selectedCellId = cellId2;
                            return;
                        }
                        this.unselect(cellId.row, cellId.column);
                    }
                }
                else if ((keyCode == 27)){ // escape
                	if(this.isEditing()){
                        dhtmlx.html.preventEvent(event);
                          var currVal=this.data.getCellValFromCellId(cellId);
                        if (currVal&& currVal.translock) {
                            delete currVal.translock;
                        }
                        this.cancelEdit();
                        this._isNavigating = false;
                        this.select(cellId.row, cellId.column);
                        this._adjustChangedColumns();
                        this._renderStructureChange();
                        this._syncFreezeColumnsHeight();
                    	}
                    	 //Remove dotted lines if any in the selection.
                        this._clearCopiedData();

                }
                else if (!isEditing && ((!isShiftDown && keyCode == 9) || keyCode == 39)){ // tab or right
                    // arrow
                    dhtmlx.html.preventEvent(event);
                    if(keyCode == 39){
                    	cellId2 = this._locateNextImmediateCell(cellId, "right");
                    }else{
                    	cellId2 = this._locateNextEditableCell(cellId, "right");
                    }
                    if (cellId2){
                        if (this.isEditing() && !this.submitEdit()){
                            this._isNavigating = true;
                            this.cancelEdit();
                            return;
                        }
                        this.unselect(cellId.row, cellId.column);
                        xOffset = this._columns[columnIndex].realSize;
                        movement = true;
                    }
                }
                else if (!isEditing && (keyCode == 37 || (isShiftDown && keyCode == 9))){ // left arrow or
                    // shift-tsb
                    dhtmlx.html.preventEvent(event);
                    if(keyCode == 37){
                    	cellId2 = this._locateNextImmediateCell(cellId, "left");
                    }else{
                    	cellId2 = this._locateNextEditableCell(cellId, "left");
                    }                    if (cellId2){
                        if (this.isEditing() && !this.submitEdit()){
                            this._isNavigating = true;
                            this.cancelEdit();
                            return;
                        }
                        this.unselect(cellId.row, cellId.column);
                        movement = true;
                        if (startIndex != columnIndex)
                            xOffset = -this._columns[columnIndex - 1].realSize;
                    }
                }

                if (movement && !cellId2)
                    cellId2 = cellId;
                if(cellId2 && !this._locateCellDiv(cellId2))
            	{
                	cellId2 = cellId;
            	}
                if (cellId2){
                    //this._clear_selection();                  
                    this.select(cellId2.row, cellId2.column);
                    this.updateFocusedCell();
                    selectedCellId = cellId2;
                }else if(!isEditing){
                	//this._clear_selection();
                    this.select(cellId.row, cellId.column);
                    this.updateFocusedCell();
                    selectedCellId = cellId;
                }
                if (!movement && this.$activeEditor){
                    this.$activeEditor.prop('changed', true);
                }
                this._isNavigating = false;
                this._lastScrollY= this._y_scroll._viewobj.scrollTop; // changes for key focus is not coming into view port data cells from out of view port
                this._lastScrollX = this._getDataArea().getScrollLeft(); // changes for key focus is not coming into view port data cells from out of view port
            },
            /* The selection should be happened just like in Excel.... So for each key we will have 4 combinations/4 cases.
             *  Ex: From selectedCell...click on right arrow key
             *  Current cell is  right side of the Selected Cell and click on right arrow key--> Select next immediate cell.
             *  Current cell is left side of the Selected Cell and click on right arrow key  --> UnSelect the immediate cell.
             *  Current cell is top to the Selected Cell and then click on right arrow key --> Select all the down cells till selected cell
             *  Current cell is down to the Selected Cell and then click on right arrow key  --> Select all the upper cells till selected cell
             *  So the overall combinations are 
             *  Left-Up ,  Left-down, Right-Up and Right - down for single key navigation. 
             *  
             * */
            _selectCellForCopy: function(e, cellId){
            	if(cellId){
            		if(!this.cellSelForCopyIndicator){
            			this.cellSelForCopyIndicator = true;
            			this.selectedCellsInfo.scrollX = this._getDataArea().getScrollLeft();
            			this.selectedCellsInfo.scrollY = this._y_scroll._viewobj.scrollTop;
            		}

            		var cellId2,direction,dataColumnIds,selectedColumnIndex = -1,selectedRowIndex = -1, rowIndex = -1, columnIndex = -1;
            		if(!this.selectedCellsInfo || !this.selectedCellsInfo.baseCell){
            			selectedCellId = cellId;
            		}
            		dataColumnIds = this._getDataColumnIds();
            		selectedColumnIndex = dataColumnIds.indexOf(selectedCellId.column); // initial cell ( where user started selection ) col Idx 
            		selectedRowIndex = this.indexById(selectedCellId.row); // initial cell ( where user started selection ) row Idx
            		columnIndex = dataColumnIds.indexOf(cellId.column); // current cell col Index
            		rowIndex = this.indexById(cellId.row); //  current cell row index

            		$(this._locateCellDiv(cellId)).addClass('multi-selected');//apply css changes to selected cell. 
            		this.multiSelectRange[this.getCellIdStr(cellId)] = cellId;

            		if(e.keyCode == 39 || e.keyCode == 37){//RIGHT or LEFT            				
            			e.keyCode == 37 ? direction = "left": direction = "right";
            			if((e.keyCode == 39 && columnIndex >= selectedColumnIndex) ||(e.keyCode == 37 && columnIndex <= selectedColumnIndex) ){            					
            				cellId = this._locateNextImmediateCell(cellId, direction);
            				$(this._locateCellDiv(cellId)).addClass('multi-selected');
            				this.multiSelectRange[this.getCellIdStr(cellId)] = cellId;
            				cellId2= cellId;
            				if(rowIndex < selectedRowIndex){
            					while(rowIndex < selectedRowIndex){
            						cellId2 = this._locateNextImmediateCell(cellId2, "down", true);							
            						$(this._locateCellDiv(cellId2)).addClass('multi-selected');
            						this.multiSelectRange[this.getCellIdStr(cellId2)] = cellId2;
            						rowIndex++;
            					}
            				}else{
            					while(rowIndex > selectedRowIndex){
            						cellId2 = this._locateNextImmediateCell(cellId2, "up",true);							
            						$(this._locateCellDiv(cellId2)).addClass('multi-selected');
            						this.multiSelectRange[this.getCellIdStr(cellId2)] = cellId2;
            						rowIndex--;
            					}
            				}							
            			}else{
            				$(this._locateCellDiv(cellId)).removeClass('multi-selected');
            				delete this.multiSelectRange[this.getCellIdStr(cellId)];
            				cellId2= cellId;
            				if(rowIndex < selectedRowIndex){
            					while(rowIndex < selectedRowIndex){
            						cellId2 = this._locateNextImmediateCell(cellId2, "down", true);							
            						$(this._locateCellDiv(cellId2)).removeClass('multi-selected');
            						delete this.multiSelectRange[this.getCellIdStr(cellId2)];
            						rowIndex++;
            					}
            				}else{
            					while(rowIndex > selectedRowIndex){
            						cellId2 = this._locateNextImmediateCell(cellId2, "up", true);							
            						$(this._locateCellDiv(cellId2)).removeClass('multi-selected');
            						delete this.multiSelectRange[this.getCellIdStr(cellId2)];
            						rowIndex--;
            					}
            				}
            				cellId = this._locateNextImmediateCell(cellId, direction);							
            			}
            		}else if(e.keyCode == 40 || e.keyCode == 38){//DOWN or UP
            			e.keyCode == 40 ? direction = "down": direction = "up";
            			if((e.keyCode == 40 && rowIndex >= selectedRowIndex) || (e.keyCode == 38 && rowIndex <= selectedRowIndex)){
            				cellId = this._locateNextImmediateCell(cellId, direction);
            				$(this._locateCellDiv(cellId)).addClass('multi-selected');
            				this.multiSelectRange[this.getCellIdStr(cellId)] = cellId;
            				cellId2 = cellId;
            				if(columnIndex > selectedColumnIndex){
            					while(columnIndex >= selectedColumnIndex){                    			
            						$(this._locateCellDiv(cellId2)).addClass('multi-selected');
            						this.multiSelectRange[this.getCellIdStr(cellId2)] = cellId2;
            						cellId2 = this._locateNextImmediateCell(cellId2, "left", true);                            			
            						columnIndex--;
            					}
            				}else{
            					while(columnIndex <= selectedColumnIndex){                    			
            						$(this._locateCellDiv(cellId2)).addClass('multi-selected');
            						this.multiSelectRange[this.getCellIdStr(cellId2)] = cellId2;
            						cellId2 = this._locateNextImmediateCell(cellId2, "right",true);
            						columnIndex++;
            					}
            				}                        		
            			}else{
            				$(this._locateCellDiv(cellId)).removeClass('multi-selected');  
            				delete this.multiSelectRange[this.getCellIdStr(cellId)];
            				cellId2 = cellId;
            				if(columnIndex >= selectedColumnIndex){
            					while(columnIndex >= selectedColumnIndex){                    			
            						$(this._locateCellDiv(cellId2)).removeClass('multi-selected');
            						delete this.multiSelectRange[this.getCellIdStr(cellId2)];
            						cellId2 = this._locateNextImmediateCell(cellId2, "left",true);
            						columnIndex--;
            					}
            				}else{
            					while(columnIndex <= selectedColumnIndex){                    			
            						$(this._locateCellDiv(cellId2)).removeClass('multi-selected');
            						delete this.multiSelectRange[this.getCellIdStr(cellId2)];
            						cellId2 = this._locateNextImmediateCell(cellId2, "right",true);
            						columnIndex++;
            					}
            				}                   			
            				cellId = this._locateNextImmediateCell(cellId, direction);
            			}
            		}                    	
            		if(cellId){
            			this._clear_selection();
            			this.select(cellId.row, cellId.column);
            			this.updateFocusedCell();
            		}
            		if(selectedCellId && cellId){
            			//this.selectedCellsInfo = {baseCell: selectedCellId, currentCell: cellId}; //latestchanges                    		
            			this.selectedCellsInfo.baseCell = selectedCellId;
            			this.selectedCellsInfo.currentCell = cellId;
            		}
            	}
            },
            revertEdit : function() {
                var that = this;
                if (this.isPivotVisible() && !this.$_viewobj.find('.cell_editor').is(":focus")){
                    this.$_viewobj.find('.cell_editor').focus();
                }
                var lastValid = $(this.$activeEditor).attr('lastValid');
                if (lastValid !== undefined){
                    pivotlog("At jda_pivot.js validateEdit reverting to last valid with value " + lastValid);
                    $(that.$activeEditor).val((lastValid !== null && lastValid !== undefined) ? lastValid : "");
                }
            },
            submitEdit : function() {
                if (this.isEditing() && this.dirtyInvalidEditCleanup()){
                	 pivotlog("start jda_pivot.js submitEdit :"+pivotObjForRef.getFormatedTime());
                	 var cellId = this.getEditingCell();
                	 if (this.isSubmitValueChanged() || this.$activeEditor.prop('lockMode')){
                        var newContentValue = this.$activeEditor.val();
                        if(newContentValue){
                        	newContentValue = newContentValue.trim(); //to avoid blank spaces if any. Also to avoid display NaN when make a pivot cell blank.
                        }

                        if(this.hasCellRenderType()){
                            this.submitRenderCell(true);
                            return true;
                        }

                        var isValid = this.processValidation(this.$activeEditor);
                        if (!isValid)
                            return;

                        var newVal = {};
                        cellId = (cellId ? cellId : this.getEditingCell());
                        // Make sure the actual value is the same
                        var currVal = this.data.getCellValFromCellId(cellId);
                        if(currVal.render){
                            this.submitRenderCell();
                            return;
                        }
                        if (currVal&&currVal.translock) {
                            currVal.lock = currVal.translock;
                            delete currVal.translock;
                        }
                        
                        if (currVal && ((MathUtilities.parse(currVal.content) != MathUtilities.parse(newContentValue)) || (newVal.lock != currVal.lock))) {
                        	
                        	if(currVal.dtype != 'string' && currVal.dtype != 'double' && currVal.dtype != 'doublerange' && 
                        			currVal.dtype != 'integer' && currVal.dtype != 'integerrange' && currVal.dtype != 'duration') {
                                pivotlog("ERROR: Unrecognized type for edited cell %s", currVal.dtype);
                        	}
                        	
                        	var decimalFormat = this.getDecimalFromCellId(cellId);
                        	if(currVal.dtype == 'string') {
                        		// the user just entered a new value for a text type measure.
                        		var valueChanged = !this._areValuesTheSame(currVal.dtype, currVal.content, newContentValue, decimalFormat);
                        		if(valueChanged|| (newVal.lock != currVal.lock)) {
                        			newVal.dtype = currVal.dtype;
                        			newVal.value = newContentValue;
                        			if(currVal.lock){
                        				newVal.lock = currVal.lock;
                        			}
                        		}
                        	}
                        	else if(currVal.dtype == 'double') {
                        		// the user just entered a new value for a text type measure.
                        		var valueChanged = !this._areValuesTheSame(currVal.dtype, currVal.content, newContentValue, decimalFormat);
                        		if(valueChanged || (newVal.lock != currVal.lock)) {
                        			newVal.dtype = currVal.dtype;
                        			if(newContentValue){
                        				newContentValue = ""+MathUtilities.parse(newContentValue);
                        			}
                        			newVal.value = newContentValue;
                        			if(currVal.lock){
                        				newVal.lock = currVal.lock;
                        			}
                        		}
                        	}
                            else if(currVal.dtype == 'doublerange'){
                                // the user just entered a new value for a double range type measure.
                                var newValue = {};
                                newValue.min = MathUtilities.parse(newContentValue);
                                newValue.max = MathUtilities.parse(newContentValue);
                                var valueChanged = this._areValuesTheSame(currVal.dtype, currVal.content, newValue, decimalFormat);
                                if(valueChanged || newVal.lock != currVal.lock){
                                    newVal.dtype = currVal.dtype;
                                    if(newContentValue){
                        				newContentValue = ""+MathUtilities.parse(newContentValue);
                        			}
                        			newVal.value = newContentValue;
                                    if(currVal.lock){
                                        newVal.lock = currVal.lock;
                                    }
                                }
                            }
                            else if(currVal.dtype == 'integerrange'){
                                // the user just entered a new value for an integer range type measure.
                                var newValue = {};
                                newValue.min = MathUtilities.parseInt(newContentValue);
                                newValue.max = MathUtilities.parseInt(newContentValue);
                                var valueChanged = this._areValuesTheSame(currVal.dtype, currVal.content, newValue, decimalFormat);
                                if(valueChanged || newVal.lock != currVal.lock){
                                    newVal.dtype = currVal.dtype;
                                    if(newContentValue){
                        				newContentValue = MathUtilities.parse(newContentValue);
                        			}
                        			newVal.value = newContentValue;
                                    if(currVal.lock){
                                        newVal.lock = currVal.lock;
                                    }
                                }
                            }else if(currVal.dtype == 'duration') {
                            	if(newContentValue){
                            		newContentValue = DurationUtilities.parse(newContentValue);
                            	}
                        		// the user just entered a new value for a text type measure.
                        		var valueChanged = !this._areValuesTheSame(currVal.dtype, currVal.content, newContentValue, decimalFormat);
                        		if(valueChanged || (newVal.lock != currVal.lock)) {
                        			newVal.dtype = currVal.dtype;
                        			if(newContentValue != ""){
                        				newContentValue = ""+MathUtilities.parse(newContentValue);
                        			}
                        			newVal.value = newContentValue;
                        			if(currVal.lock){
                        				newVal.lock = currVal.lock;
                        			}
                        		}
                            }else if(currVal.dtype == 'integer') {
                        		// the user just entered a new value for a text type measure.
                        		var valueChanged = !this._areValuesTheSame(currVal.dtype, currVal.content, newContentValue, decimalFormat);
                        		if(valueChanged || (newVal.lock != currVal.lock)) {
                        			newVal.dtype = currVal.dtype;
                        			if(newContentValue){
                        				newContentValue = ""+MathUtilities.parse(newContentValue);
                        			}
                        			newVal.value = newContentValue;
                        			if(currVal.lock){
                        				newVal.lock = currVal.lock;
                        			}
                        		}
                        	}
                        }
                        
                        if(this.isMultiEditActive){
                        	this.isDataFilterEnabled() && this.getDataFilterController().setDisableFilterActions(true);
                            if (this.hooks.afterMultiEdit){
                                var retVal = this.hooks.afterMultiEdit.apply(this, [ cellId, newVal, currVal ]);
                                if (!retVal)
                                    return;
                            }

                        } else {
                            if (this.hooks.afterEdit){
                                var retVal = this.hooks.afterEdit.apply(this, [ cellId, newVal, currVal ]);
                                if (!retVal)
                                    return;
                            }
                        }
                        // $(this._activeEditor).removeAttr('lastValid');
                        this.unselect(cellId.row, cellId.column);
                        var isChanged = this.isSubmitValueChanged();
                        newVal[_pns.Constants.wasCellEdited] = isChanged;

						//if the PHY locked cell is empty, treat it as zero and mark as cellEdited.
						if(this.$activeEditor.prop('lockMode')){
							if( !newVal.value || newVal.value == "NaN" || newVal.value == ""){
								newVal.value = 0;
								newVal[_pns.Constants.wasCellEdited] = true;
							}
						}

						if((this.enableCmtReasonCodeSupport || this.config.requireOldValueOnEditCell ) && currVal.content != '__Nc__'){
                      		if((currVal.content === '__Nv__')){
                      			newVal.oldValue = 0;
                      		}else if(newVal.dtype == 'doublerange' || newVal.dtype == 'integerrange'){
                      			newVal.oldValue  = currVal.content.min +" - "+ currVal.content.max;
                      		}else{
                      			newVal.oldValue  = currVal.content;
                      		}
                      	}
						  
                        if(this.isMultiEditActive){
                            var item = this.data.pull[cellId.row];
                            var cell = item[cellId.column];
                            /*cell.multiEdit =true;*/
                            var key = this._prepareCellKey(cellId.row,cellId.column);
                            this.lastEditedValues.clear();
                            this.lastEditedValues.set(key, newVal.value);
                            
                            this.multiEditValues[key]=this.getMultiEditValue(currVal, key);
                            newVal[_pns.Constants.transactionMode]=true;

                            var updateId = {
                                sideAxis : cellId.row,
                                topAxis : cellId.column
                            };
                            
                            this._getMultiEditRequest(newVal,updateId);
                        }
                        else{
                            this.data.updateCell(cellId.row, cellId.column, newVal);
                        }
                    }

                    this.$activeEditor.closest('.editingCell').removeClass('editingCell');

                    this.$activeEditor.remove();
                    this.$activeEditor = null;
                    this._renderColumn(this.columnIndex(cellId.column), this._get_y_range(false), true);
                    //this.render();
                    pivotlog("end jda_pivot.js submitEdit :"+pivotObjForRef.getFormatedTime());
                    return true;
                }
            },
            getMultiEditValue : function(currVal, key){
                var data={};
                if(currVal.multiEdit){
                    data = this.multiEditValues[key];
                }else{
                	if(_.isObject(currVal.content)) {
                		data.content = $.extend(true, {}, currVal.content);
                	} else {
                		data.content = currVal.content;
                	}
                }
                return data;
            },            
            /**
             * Description: get the total number of data columns.
             *
             */
            _getDataColumnIds : function(){
            	var totalPivotDataColumnIds  = [];
            	var noOfPivotColumns = this._columns.length;
            	for(var i=0; i < noOfPivotColumns; i++){
            		if(this._isDataColumn(i)){
            			totalPivotDataColumnIds.push(this._columns[i].id);
            		}
            	}
            	return totalPivotDataColumnIds;
            },
            
            /**
             * Description: Read the clip board data and paste the content on pivot starting from selectedcell.
             * Source(s) for copy the data : Excel, CSV, Demand 360.                     * 
             * Precondtion: Make sure the cellId points to a data cell before editing.
             *
             * @param cellId
             *            {row : rowId , column: colId}
             *      	copiedValues: array of clip board values.
             */
            PasteContent : function(cellId, copiedValues){
            	pivotlog("start jda_pivot.js PasteContent :"+pivotObjForRef.getFormatedTime());
            	var newValues = [];
            	var editCells = [];
            	var dataColumnIds = this._getDataColumnIds();
				var copiedValue,originalCopiedValue;
				var selectedCellId = cellId;
				this.lastEditedValues.clear();
				var nextRowCellId = cellId;
				var selectedCellColIndex = dataColumnIds.indexOf(cellId.column);
				for(var i=0; i<copiedValues.length;i++){
					var cellColIndex = selectedCellColIndex;
					/*For each new row, need to select the next immediate below cell to current selected cell.*/
					if(i > 0){
						cellId = this._locateNextCell(nextRowCellId,"down", true);
						if(!cellId){
							break;
						}
						nextRowCellId = cellId;
					}
					var rowValues = copiedValues[i];
					if(rowValues.length > 0){
						//Identified next cell to copy data and then validation check will take place.
						for(var j=0; j<rowValues.length;j++){
							originalCopiedValue = rowValues[j];
							copiedValue = this.formatValue(originalCopiedValue);
							if(cellColIndex >= dataColumnIds.length){
								break;
							}        							
							if(j > 0){
								cellId = this._locateNextCell(cellId,"right", true);
								if(!cellId){//If No cellId present further....break the loop...
									break;
								}
							}
							cellColIndex++;
							if(copiedValue == "" ){
                				continue;
                			}
            				var newValue = this.getNewCopiedValue(cellId, copiedValue);
							if(newValue && this.isCellValueEditable(cellId) && !this.isDataDomainMeasure(cellId) ){
								var parsedValue = "NaN";
								if(newValue.dtype != "duration"){
									parsedValue = MathUtilities.parse(newValue.value);
								}else{
									parsedValue = DurationUtilities.parse(newValue.value);
								}
                            	newValue.value = (isNaN(parsedValue)) ? newValue.value : ""+parsedValue;
                            	var sideAxisPath = new _pns.axisPath(cellId.row);
                                var topAxisPath = new _pns.axisPath(cellId.column); 
                                var editCell = {
                                	sideAxisPath: sideAxisPath,
                                	topAxisPath: topAxisPath
                                };
                                editCells.push(editCell);
                                newValues.push(newValue);
                                var key = this._prepareCellKey(cellId.row,cellId.column);
                                this.lastEditedValues.set(key,newValue.value);
                                var data={};
                                var currVal = this.data.getCellValFromCellId(cellId);
                                this.multiEditValues[key]=this.getMultiEditValue(currVal, key);
							}
						}
					}
				}
            	
				//Sending request to server
            	if(newValues.length > 0){
            		if(this.isMultiEditActive){
            			this.isDataFilterEnabled() && this.getDataFilterController().setDisableFilterActions(true);
                		if (this.hooks.afterMultiEdit){
                			this.hooks.afterMultiEdit.apply(this, [ selectedCellId, newValues[0]]);
                        }	
            		}
            		var params = this._getPastedCellsInfo(selectedCellId, newValues, editCells);
                	var pasteCopiedContentRequest = new jda.pivot.pasteCopiedContentRequest(params);
                	this.data.pivotCommands[pasteCopiedContentRequest.id] = pasteCopiedContentRequest;
    				this.data.feed.call(this, this.data.url, "jda_pivot_json", pasteCopiedContentRequest._getPayload());            				
            	}                    	
				return selectedCellId;
				pivotlog("end jda_pivot.js PasteContent :"+pivotObjForRef.getFormatedTime());
            },
            //Truncating special chars at first and last indexes(used to trim the currency symbols and percentages etc when do copy paste)
            formatValue : function(copiedValue) {    
            	copiedValue = copiedValue.trim();
            	if(copiedValue && copiedValue.length >0){
            		var pattern1 = /[^\w-.]/;  //non word characters in a string except . and -
            		var pattern2 = /\W/g; //non word characters in a string
            		//value within braces should be negative number. Ex: (200) should become -200. (-200) should be invalid number. (3,456.00) should become -3,456.00
            		//Pattern should obey formatting of values.
            		if(copiedValue.charAt(0) == "(" && copiedValue.charAt(copiedValue.length-1) == ")"){
            			copiedValue= "-"+copiedValue.substring(1, copiedValue.length-1); 
            		}
            		if(copiedValue.charAt(0).match(pattern1)){
                    	copiedValue= copiedValue.substring(1);
                    }else if(copiedValue.charAt(copiedValue.length-1).match(pattern2)){
                    	copiedValue= copiedValue.substring(0, copiedValue.length-1);
                    }
            	}	                    
                return copiedValue;
            },
            isValidValue: function(cellId, newValue){
            	this._clear_selection();//Clearing the previous cell selection.....
            	this._selectedCellDiv = this._locateCellDiv(cellId);
            	this._markSelectedCell(this._selectedCellDiv);
            	var typesToCheck = [ 'all' ];
                if (cellId){
                	if(newValue && newValue.dtype){
                		typesToCheck.push(newValue.dtype);
                	}
                }						
				if (this.cellValidators){
                    for ( var iType = 0; iType < typesToCheck.length; iType++){
                        var validatorFuncArr = this.cellValidators[typesToCheck[iType]];
                        if (validatorFuncArr){
                            for ( var iValidatorFunc = 0; iValidatorFunc < validatorFuncArr.length; iValidatorFunc++)
                            {
                                var validatorFunc = validatorFuncArr[iValidatorFunc];
                                if (validatorFunc){
                                    var isInvalid =
                                            validatorFunc.apply(this, [ cellId, newValue.value]);
                                    if (isInvalid){
                                    	 $(this._selectedCellDiv).addClass("cell-invalid");
                                        return false;                                            	
                                    }
                                }
                            }
                        }

                    }
                }
                return true;
          },
          getNewCopiedValue : function(cellId, copiedValue) {                
              var newValue = {};    
              copiedValue = StringUtilities.trim(copiedValue);
              var currentMeasure = this.getMeasureFromCellId(cellId);
            	if(currentMeasure.typeName != 'string' && currentMeasure.typeName != 'double' && currentMeasure.typeName != 'doublerange' 
            		&& currentMeasure.typeName != 'integerrange' && currentMeasure.typeName != 'float' && currentMeasure.typeName != 'duration') {
                    pivotlog("ERROR: Unrecognized type for edited cell %s", currentMeasure.typeName);
                    return;
            	}
        		if(currentMeasure.typeName == 'string' || currentMeasure.typeName == 'doublerange' || currentMeasure.typeName == 'integerrange' || currentMeasure.typeName == 'duration') {
            		newValue.dtype = currentMeasure.typeName;
        			newValue.value = copiedValue;
        			newValue[_pns.Constants.wasCellEdited] = "true"; //Required. ed=true is the parameter we will pass in request parametres.
            	}else if(currentMeasure.typeName == 'double' || currentMeasure.typeName == 'float') {
            		newValue.dtype = 'double';//for both the types, we are making the value data type as double as demand team is using only double data types.                    		
            		//newValue.value = ""+MathUtilities.parse(copiedValue);
            		newValue.value = copiedValue;
            		newValue[_pns.Constants.wasCellEdited] = "true"; //Required. ed=true is the parameter we will pass in request parametres.
            	}
        		
        		if(this.isMultiEditActive)                       
        			newValue[_pns.Constants.multiEdit] = "true";
        		
                return newValue;
            },
            _markSelectedCell : function(selectedNode) {
                var location = this.locateCell(selectedNode);
              
                if (!location){
                	return;
                }
               
                var axisMarker = _pns.Constants.selectedAxis;
                var colId = _pns.Constants.hdrPrefix + location[1];
                
                	$(selectedNode).hasClass(this._select_css) || $(selectedNode).addClass(this._select_css);
                	$('div[id="' + colId + '"]:last').parent().hasClass(this._select_css) || $('div[id="' + colId + '"]:last').parent().addClass(this._select_css);
                	$('div[rowpath="' + location[0] + '"]:last').hasClass(this._select_css) || $('div[rowpath="' + location[0] + '"]:last').addClass(this._select_css);

            },
            _finalize_select_cell : function(data, preserve) {
                // if (!this._getPivotLockedMode())
                {
                    if (data && data.row)
                        this._selected_rows.push(data.row);
                    if (!this._silent_selection){
                        if (!preserve && this._selectedCellDiv !== undefined){
                            // dhtmlx.html.removeCss(this._selectedCellDiv,
                            // this._select_css);
                        }

                        this.callEvent("onSelectChange", []);
                    }
                    if(data){
                    var item = this.item(data.row);
                    var currVal = item[data.column];
                    this._selectedCellDiv = this._locateCellDiv(data);
//                    this._adjustYScroll($(this._selectedCellDiv ).closest('.dhx_ss_center_scroll').scrollTop());
                    if (currVal && currVal.$select){
                        this._markSelectedCell(this._selectedCellDiv);
                        if(currVal.render==='combo'){
                            this.startRenderCell(data,this._selectedCellDiv);
                        }else if(this.isDataDomainMeasure(data) && this.isCellEditable(data) && !(window.event && window.event.shiftKey )){
                    		var options = this.getDataDomainValues(data);
                    		this.onRenderTypeCombo(options,data);
                        }
                        this.hooks.onCellSelect && this.hooks.onCellSelect.apply(this, [this.getSelected(), this.data.getCellValFromCellId(this.getSelected())]);
                    }
                    else{
                        dhtmlx.html.removeCss(this._selectedCellDiv, this._select_css);
                         }
                    }
                }
            },
           /* _adjustYScroll : function(yVal) {
            	yVal = yVal === undefined ? this._scrollTop : yVal;
                pivotlog('Launching _adjustYScroll yVal=%o this._y_scroll._settings.scrollPos=%o this._scrollTop=%o',yVal,this._y_scroll._settings.scrollPos,this._scrollTop);

                this._yScrollAreas(this._scrollTop);
                if (this._scrollTop !== yVal) {
                    this._y_scroll.scrollTo(yVal);
                }

                this._onscroll_y(yVal===undefined?this._y_scroll._viewobj.scrollTop:yVal,0,true);
            },*/
            _isRequestOverlappingCurrentView : function(request) {
                var reqXr = request.params.viewport.xr;
                var reqYr = request.params.viewport.yr;
                var yr = this._get_y_range(this._settings.prerender === true);
                var xr = this._get_x_range(this._settings.prerender === true);

                var x1 = reqXr[0];
                var y1 = reqYr[0];
                var w1 = Math.abs(reqXr[1] - reqXr[0]) + 1;
                var h1 = Math.abs(reqYr[1] - reqYr[0]) + 1;
                var y2 = yr[0];
                var x2 = xr[0];
                var w2 = Math.abs(xr[1] - xr[0]) + 1;
                var h2 = Math.abs(yr[1] - yr[0]) + 1;
                if (x2 < x1 || y1 < y2){
                    t1 = x1;
                    x1 = x2;
                    x2 = t1;
                    t2 = y1;
                    y1 = y2;
                    y2 = t2;
                    t3 = w1;
                    w1 = w2;
                    w2 = t3;
                    t4 = h1;
                    h1 = h2;
                    h2 = t4;
                }
                if (y2 + h2 < y1 || y1 + h1 < y2 || x2 + w2 < x1 || x1 + w1 < x2)
                    return false;
                else
                    return true;

            },
            
			/**
             * Can Cancel current Request
             */
            canCancelRequest:function(){
            	
            	if(this.config.cancelPolling && this.currentRequestId){
            		
            		var command = this.data.pivotCommands[this.currentRequestId];
            		
            		if(command && command['@class'] === _pns.getPivotPackagePrefix()+"protocol.PivotViewRequest"){
            			return false;
            		}
            		
            		return true;
            	}
            	
            	return false;
            	
            },
            /**
             * If application calls this function on cancelling UI dialog then it aborts the current xmlHttpRequest and initiate
             * CancelRequestRequest.
             */
            sendAbortRequest:function(){
            	// This function has been overidden by jda_datatable.js under dhx.ajax
            	
            },
            
            /**
             * Initialize check Request for last request which has been either timed out or return error response of REQUEST PROCESSING
             */
            _initCheckRequest:function(request){
            	pivotlog(" initiated Check Request %o",request);
            	var requestId = request.payload ? request.payload.id : request.id;
            	var checkRequestCommand = this.getCommandConfig(_pns.getPivotPackagePrefix()+'protocol.CheckRequestRequest');
            	var checkRequestPolling = checkRequestCommand.pollingTimeout || this.data.pollingTimeout;
            	this.sendCheckRequest(requestId,checkRequestPolling,this._call_onCheckingRequest);
            },
            /**
             * Initialize cancel request for last processing request
             */
            _initCancelRequest:function(request){
            	pivotlog(" initiated Cancel Request %o",request);
            	var requestId = request.payload.id ;
            	var actionParams =request.payload.params.actionParameters;
            	if(actionParams)
            		requestId = actionParams.requestId;
            	this.sendRequestCancelled(requestId,this._call_onCancellingRequest);
            },
            /**
             * If requestId is getsegment data then collapse the member whichever is expanded and
             * delete the pivot command for requestId
             */
            cancelRequest:function(requestId){
            	pivotlog(" cancelling request for id "+requestId);
                var requestObj = this.data.pivotCommands[requestId];
            	  
                if(requestObj["@class"] ===  _pns.getPivotPackagePrefix()+'protocol.GetSegmentDataRequest'){
                	var payload = JSON.stringify(requestObj.params);
                	// Get the last expanded node                            
                    var lastExpandedNode =this.lastExpandedNode;
           			if(lastExpandedNode){ 
           				// collapse the node whichever is last expanded
           				this._collapse(lastExpandedNode["1"],lastExpandedNode["2"],lastExpandedNode["3"]);
           				this.lastExpandedNode = undefined;                   		
           			}

                }
            	  
            	  
            	delete this.data.pivotCommands[requestId];
            },
			/**
             * Resend the requestId .Get the requestId information from pivot commands
             */
            resendRequest :function(requestId){
            	pivotlog(" Resending request for id "+requestId);
                  var requestObj = this.data.pivotCommands[requestId];
                if(requestObj){
                      var payload={
	                  	    		id:requestObj.id,
	                  	    		jsonrpc:requestObj.jsonrpc,
	                  	    		params:requestObj.params,
	                  	    		pollingTimeout:requestObj.pollingTimeout,
	                  	    		pollingTimeoutServerDelta:requestObj.pollingTimeoutServerDelta 
                      			  };
                      payload["@class"]=requestObj["@class"];
              	    
              	    // Resend the request again 
                      this.data.feed.call(this, this.data.url, "jda_pivot_json", payload);
                }else{
                	pivotlog(" Resending Failed Unable to get request params from pivotCommand for id "+requestId);
                }
                  
            },
            /**
             *  call back function for Error response with Error Code as REQUEST PROCESSING 
             *  this initiate call to send check request
             * 
             */
            _call_onRequestProcessing:function(data, request){
            	pivotlog(" call on request processing %o",request);
            	if(request){
            		this.data.pivotCommands[data.id]=request;
            		this._initCheckRequest(request);
            	}
            },
            /**
             * This function is used as call back function for CheckRequestRequest. It check for the request status
             *  status - done ( Then resend the checking request id)
             *  status - process( Send Check Request again until we det status done)
             */
            _call_onCheckingRequest:function(event,response,request){
            	
            	pivotlog(" on checking request :%o",response);
            	
            	var actionParams = request.params.actionParameters;
            	
            	if(response.requestStatus === "done"){
            		// Resend the request. Request processing has been done
            		this.resendRequest(actionParams.requestId);
            	}else{
            		// Request still running .Send check request again
            		this.sendCheckRequest(actionParams.requestId,actionParams.waitMillis,this._call_onCheckingRequest);
            	}
            	
            },
            /**
             * call back function for CancelRequestRequest. Internally calls cancelRequest when cancelled returns true
             * 
             */
            _call_onCancellingRequest: function(event,response,request){
            	pivotlog("Request Cancelled %o",response);

            		var actionParams = request.params.actionParameters;
            		
            	   if(response.cancelled){
            		
            		   this.cancelRequest(actionParams.requestId);
            		   
            	   }
            	   // As request is cancelled clear UI command Cache,segmentRequest Stack
            	   this.data.pivotCommands= {};
            	   this.mapSegmentRequestsLoad = {};
                   this.segmentDataRequestStack = [];
                   this.segmentDataRequestStack.busy = false;
                   this.semCheck = 0;
                   //this.isCancelInitiated = false;
            },
            
            _callNextCommandInGetSegmentDataStack : function() {
                var nextCommand = this.segmentDataRequestStack.pop();
                if (nextCommand){
                    // Launch the current command
                    this.segmentDataRequestStack.busy = true;
                    nextCommand();
                }
              //  pivotlog("@@@@@@@---- dequeuing queue. len=%d", this.segmentDataRequestStack.length);
            },
            _callonRecheckLoading : function() {
                pivotlog("Rechecking cube loading. Polling timeout %d milliseconds", this.data.pollingTimeout);
                this._getcubeDefinitionRequest();
            },

            _callonRecheckQuickLoading : function(data, request) {
                pivotlog("Rechecking cube session restore. Polling timeout %d milliseconds",
                    this.data.pollingTimeout);
                this.sendQuickLoadRequest(request.callback, true);
            },

            _callonRecheckQuickSaving : function(data, request) {
                pivotlog("Rechecking cube session saving. Polling timeout %d milliseconds",
                    this.data.pollingTimeout);
                this.sendQuickSaveRequest(request.callback, true);
            },
            _callonRecheckCommiting : function(data, request) {
                pivotlog("Rechecking cube commiting. Polling timeout %d milliseconds", this.data.pollingTimeout);

                this.sendCommitRequest(request.callback, true);
            },
            _callonRecheckCommitCompleting : function(data, request) {
                pivotlog("Rechecking cube commit completing. Polling timeout %d milliseconds",
                    this.data.pollingTimeout);
                var pct = data.result && data.result.pct;
                if (pct){
                    $('#vpMsgTbl .infomsgtext .commitProgressBar').progressbar("option", {
                        value : pct
                    });

                }
                this.sendCommitCompletingRequest(request.callback, true);
            },
            _callOnLocksCleared : function(data, request) {
                pivotlog("Locks cleared. Refreshing data.");
                this.refreshAllData();
            },
            _callonCommitCancelled : function(data, request) {
                pivotlog("Cancelled search ");
                this._hideWaitIndicator();
                if (request && request.callback){
                    request.callback.apply(this, [ this, data, request ]);
                }

                this._unblockUI();
            },
            _callonNodeNotResponsing : function() {
                pivotlog("SRE node is down or not responsing.");
                this._getcubeDefinitionRequest();
            },
            _callonErrorResponse : function(data, request) {
                pivotlog("Recieved server error %o", data.error.stackStace || data.error);
                this._hideWaitIndicator();
                if (request && request.callback){
                    request.callback.apply(this, [data, request ]);
                }

                if (this.rootLevelsInitialized < 2){
                    this.triggerEvent('loadFailed');
                    $(this.$view).hide();
                }
                else{
                    this.triggerEvent('initialized');
                }
                this.triggerEvent("clearMessages",{errorResponse:true});

                this._unblockUI();
                this._isUpdating = false;
                this._errorBlockUI(data);
//                this.resizePivot();
            },

            _call_oncubemetadatachanged : function(response, request, isCubeMetadataChanged) {
            	
            	pivotlog("start jda_pivot.js _call_oncubemetadatachanged :"+pivotObjForRef.getFormatedTime());
                if (!this.data.cube){
                    this.data.cube = {};
                }
                this._resetRowHeights();
                this._isCubeDef = (response.method === _pns.Constants.cubeView) ? true : false;
                this._reinit_selection();
                var that = this;
                var keepExpand = null;
                var state = undefined;
                isCubeMetadataChanged = isCubeMetadataChanged || request.isCubeMetadataChanged;
                if(request.withExpand){
                	var canRestoreView = this.canRestoreExpandState(this.data.cube.backup_definition, response.result);
                	keepExpand = true;
                	state = {measureWereOnSide:this.data.cube.backup_definition.sideAxis.hasMeasures,
                			sideVisibleFacets: this.getSideAxisView().getVisibleFacets(),
                			topVisibleFacets: this.getTopAxisView().getVisibleFacets()}
                }else{
                	keepExpand = false;
                	canRestoreView = this.canRestoreView(this.data.cube.backup_definition, response.result);
                }
                var expansionParam = null;
                var measureFilters = null;
                var subMeasures =  null;
                
                this.config.precision =  (response.metadata&&response.metadata.precision)||(0.001);
                var colsDefs = {};
                if (canRestoreView){
                	
                    expansionParam = this.data.cube.backup_definition.expansionParam;
                    colsDefs=this.data.cube.backup_definition&&this.data.cube.backup_definition.colsDefs;
                    
                    //Store backups for submeasures 
                    measureFilters = this.data.cube.definition.measureFilters;
                    subMeasures = this.data.cube.definition.subMeasures
                }
                this.data.cube.definition = response.result;
                pivotlog("Can restore view = %s", canRestoreView);
                this.data.cube.backup_definition = $.extend(true, {}, response.result);
                if(keepExpand){
                	this.data.cube.backup_definition.state = state;
                }
                this.data.cube.view = [];
                this.data.cube.loadingAxes = true;
                this.resetViewPort();
                response.result.topAxis.visibleFacets = response.result.visibleFacets;
                response.result.sideAxis.visibleFacets = response.result.visibleFacets;
                // Let's enhance the response facet objects
                response.result.availableFacets.concat(response.result.visibleFacets,
                    response.result.topAxis.facets, response.result.sideAxis.facets).forEach(
                    function(facetObj, facetObjIndex, array) {
                        var func = dhtmlx.bind(function() {
                            return this.name;
                        }, facetObj);
                        facetObj.getIDName = func;
                        func =
                            dhtmlx.bind(function() {
                                // Get the localized display name if avaliable. Otherwise return the
                                // name ID.
                                return (this.uiattributes && this.uiattributes.displayName) ||
                                    (this.UIAttributes && this.UIAttributes.displayName) ||
                                    this.getIDName();
                            }, facetObj);
                        facetObj.getDisplayName = func;
                    });
                // Enhancement finished
                var topAxis = this.data.cube.view[1] = new _pns.axis(this, response.result.topAxis);
                var sideAxis = this.data.cube.view[0] = new _pns.axis(this, response.result.sideAxis);
                var sortOrders = this._getCubeDefinitionSortParams();

                var sortOrderStr = this.getSortOrder() === 0 ? this.sortUpIconPath : this.sortDownIconPath;
                var isFirst = true;
                if (sortOrders && sortOrders.length){
                    that.$sortStatusDivContent.empty();
                   
                        _.each(
                        sortOrders,
                        function(sortOrder, sortOrderIndex) {

                            var sortContextAxisView =
                                sortOrder && that.getAxisView(1 - sortOrder.shuffeledAxisIndex), sortContextAxisViewRootPath =
                                sortContextAxisView.rootPath ||
                                sortContextAxisView
                                    .getRootPath(sortContextAxisView.facets.length), sortAxisPathParam =
                                sortContextAxisView &&
                                sortContextAxisView
                                    .getSortingParamAxisPathParam(sortOrder.sortingFacetPaths), sortParamDesc =
                                $('<DIV/>').text(unescape(sortOrder.description[0])), axisPathDesc =
                                $(unescape(sortOrder.description[1])).html(), $currLine;
                            if (sortAxisPathParam){
                                sortOrder.sortAxisPathParam = sortAxisPathParam;
                                _.each(sortOrder.sortingFacetPaths, function(facetPath, facetId) {
                                    var currFacetPath =
                                        facetPath.facetPath ? facetPath.facetPath : facetPath;
                                    var rootFacetPath =
                                        sortContextAxisViewRootPath[sortContextAxisView
                                            .getFacetIndexFromId(facetId)];
                                    sortOrder.sortingFacetPaths[facetId] =
                                        rootFacetPath.concat(currFacetPath);
                                });
                                that._augmentSortParam(sortOrder);
                            }

                            that.$sortStatusDiv.show();
                            that.$sortStatusDivContent
                                .append($currLine =
                                    $("<li/>")
                                        .data('sortOrderIndex', sortOrderIndex)
                                        .append(
                                        $('<SPAN/>')
                                            .append(
                                            generatejQueryButton(
                                                function(e) {
                                                    sortOrders
                                                        .splice(
                                                        $currLine
                                                            .data('sortOrderIndex'),
                                                        1);
                                                    that
                                                        ._setPivotAxesRequest();
                                                    e.preventDefault ? e
                                                        .preventDefault() : e.returnValue =
                                                        false;
                                                    $(that)
                                                        .find(
                                                        '.sortHoverAxisPath')
                                                        .stop()
                                                        .hide();
                                                    return false;

                                                },
                                                'ui-icon-red',
                                                'ui-icon-close'))
                                            .append(
                                            generatejQueryButton(
                                                function(e) {
                                                    var currSortOrderParam =
                                                        sortOrders[($currLine
                                                            .data('sortOrderIndex'))];
                                                    currSortOrderParam.order =
                                                        1 - currSortOrderParam.order;

                                                    that
                                                        ._setPivotAxesRequest();
                                                    e.preventDefault ? e
                                                        .preventDefault() : e.returnValue =
                                                        false;
                                                    $(that)
                                                        .find(
                                                        '.sortHoverAxisPath')
                                                        .stop()
                                                        .hide();
                                                    return false;

                                                },
                                                'ui-icon-red',
                                                sortOrder.order ? 'ui-icon-circle-triangle-s' : 'ui-icon-circle-triangle-n'))
                                            .buttonset()

                                    )
                                        .append(sortParamDesc)
                                        .append(
                                        $(
                                            '<div class="sortHoverAxisPath pivotCellTooltip"/>')
                                            .html(axisPathDesc).hide()));
                            if (sortOrders.length > 1 && isFirst){
                                $currLine.append("<span class='multiSortInd'>...</span>");
                            }
                            isFirst = false;
                        });

                    this.$sortStatusDivContent.show();
                }
                else{

                    this.$sortStatusDiv.hide();
                    this.$sortStatusDivContent.css({
                        'margin-left' : ''
                    });
                }

                // Look for anchor filters
                var anchors = [];

                this.$anchorStatusDiv.css({
                    'margin-left' : ((sortOrders && sortOrders.length) ? 13 : 2) + 'em'
                });
                var availableFacets = response.result.availableFacets;
                var $anchorsList = null;
                for ( var iFacet = 0; iFacet < availableFacets.length; iFacet++){
                    var currFacet = availableFacets[iFacet];
                    if (currFacet && currFacet.UIAttributes && currFacet.UIAttributes.Filters){
                        var anchorObj = {
                            facetId : currFacet.id,
                            facetName : currFacet.getDisplayName()
                        };
                        var anchor = currFacet.UIAttributes.Filters;
                        $.extend(anchorObj, anchor);
                        anchors.push(anchorObj);
                        if (anchors.length === 1){
                            this.$anchorStatusDivContent.empty();

                            $anchorsList =
                                $('<ol class="pivotButtonedList anchorsList" />').wrap('<span/>').appendTo(
                                    this.$anchorStatusDivContent).end();
                        }
                        else{

                        }
                        $('<li class="pivotButtonedList"/>').append(
                            $('<button>&nbsp;</button>').data('anchorObj', anchorObj).button({
                                icons : {
                                    primary : "ui-icon-close  ui-icon-red"
                                },
                                text : false
                            }).removeAttr("title")).append(
                            $('<span/>').text(this.getAnchorLabel(anchorObj))).appendTo($anchorsList);
                    }
                }

                if (anchors.length){
                    this.$anchorStatusDiv.show();
                    if (anchors.length > 1){
                        $('<li class="pivotButtonedList"/>').append($('<button>&nbsp;</button>').button({
                            icons : {
                                primary : "ui-icon-close"
                            },
                            text : false
                        }).removeAttr("title")).append($('<span/>').css({
                            'font-weight' : 'bold'
                        }).text(this.getLocaleString('ClearAllAnchors'))).appendTo($anchorsList);

                    }
                }
                else{
                    this.$anchorStatusDiv.hide();
                }

                // Leave just the visible facets
                var visibleFacets = this._getCubeDefinition().visibleFacets;

                for ( var colIndex = 0; colIndex < this._columns.length; colIndex++){
                    var currCol=this._columns[colIndex];
                    currCol.realSize = null;
                    currCol = true;

                }
                // initiallize seperate scroll areas for side facet, attribute and data area;
                //this.initScrollAreas();
                var headerRowCount = this.getHeaderRowCount();
                var visibleSideFacets = sideAxis.getVisibleFacets();
                var visibleTopFacets = topAxis.getVisibleFacets();


                var visibleAttrLength = this._showAttributeArea() ? sideAxis.getVisibleAttributes().length : 0;
                var frozenColumns = visibleSideFacets.length + visibleAttrLength;
                var measuresHeader = [];
                var topFacets = visibleTopFacets;
                var headerLabels = [];
                for ( var indexFacet = 0; indexFacet < headerRowCount; indexFacet++){
                    var facetname = null;
                    if (topFacets.length === 0){
                        facetname = "Measures";
                    }
                    else if (indexFacet >= topFacets.length){
                        facetname = topFacets[topFacets.length - 1].getDisplayName();
                    }
                    else{
                        facetname = topFacets[indexFacet].getDisplayName();
                    }

                    headerLabels.push(facetname);
                }
                if (!this.areMeasuresOnTop()){
                    frozenColumns++;
                    var currColumn =
                        new _pns.header(_pns.Constants.measureIdPrefix, headerLabels, true, null, true);
                    currColumn.adjust = true;
                    measuresHeader.push(currColumn);
                }

                //The following is redundant as it's zero by default
                var facetsArea = this._getFacetsArea();
                facetsArea.setStartIdx(0);
                facetsArea.setEndIdx(frozenColumns);
                facetsArea.setScrollIdx(0);

                // Attribute related changes
                if(this._showAttributeArea()){
                    var attributesArea = this._getAttributesArea();
                    attributesArea.setStartIdx(visibleSideFacets.length);
                    attributesArea.setEndIdx(frozenColumns);
                    facetsArea.setEndIdx(visibleSideFacets.length);
                    this.$attrPanelScroll = $(this.$view).find('.dhx_ss_attr>.dhx_ss_center_scroll');
                    attributesArea.setScrollIdx(1);
                }

                // Data Area 
                var dataArea = this._getDataArea();
                dataArea.setStartIdx(frozenColumns);
                dataArea.setScrollIdx(2);

                // Maintain sort settings for subsequent requests
                var sortBy = this._getCubeDefinition().sortBy;
                var sortByDescriptions = this._getCubeDefinition().sortByDescriptions;
                if (sortBy && sortBy.sortContexts.length){
                    var sortOrder = $.extend({}, sortBy.sortContexts[0]);
                    sortOrder.description = sortByDescriptions[0];
                    sortAxisPath = this.getAxisPathWithRootPadding(sortOrder.axisPath);
                    sortOrder.axisPath = sortAxisPath;
                    this._getCubeDefinition().topAxis.sortOrder = sortOrder;
                }

                // var $leftPanel = $(this.$view).find('.dhx_ss_left>.dhx_ss_center_scroll');
                this.$leftPanelScroll = $(this.$view).find('.dhx_ss_left>.dhx_ss_center_scroll');
                this.$rightPanelScroll = $(this.$view).find('.dhx_ss_right>.dhx_ss_center_scroll');
                this.$centerPanelScroll = $(this.$view).find('.dhx_ss_center>.dhx_ss_center_scroll');

                // var newHeaders = this._facetNamesToHeaders().concat(measuresHeader,
                // this._membersToHeaders(this.getTopAxisView()));
                var newHeaders = this._facetNamesToHeaders().concat(measuresHeader);
                if (!this._settings.columns){
                    this._settings.columns = jdapivot.toArray();
                }
                var len = newHeaders.length - 1;
                var movedToLeftNodes = [];
                for (; len >= 0; len--){
                    var newHeader = newHeaders[len];
                    var header = this._settings.columns[len];
                    if (!header)
                        header = this._settings.columns[len] = newHeader;
                    var headerToBeAdded = newHeader;
                    if (typeof headerToBeAdded == 'string'){
                        headerToBeAdded = {
                            headerToBeAdded : headerToBeAdded
                        };
                    }
                    else if (typeof headerToBeAdded == 'object')
                        headerToBeAdded = $.extend(true, {}, newHeader);
                    headerToBeAdded.node = header.node;
                    headerToBeAdded.width = header.width;
                    headerToBeAdded.attached = header.attached;
                    this._settings.columns[len] = headerToBeAdded;
                    // Did it move from the right panel to the left panel
                    if (headerToBeAdded.type != header.type){
                        headerToBeAdded.detach = true;
                    }
                }

                this._columns = this._settings.columns;
                _.each(this._columns,function(column,index){
                    if (colsDefs&&colsDefs[column.id]){
                        column.width=column.userSetWidth=colsDefs[column.id].userSetWidth;
                    }
                },this);
                this.segmentDataRequestStack = [];
                this.segmentDataRequestStack.busy = false;
                //setting all data domain values to local variable
	           	var cubeDefinition = this.data.cube.definition;
	            _.each(cubeDefinition.measureDomainValues,function(measureDataDomain,index){
	            	 if(measureDataDomain){
	            		 that.measureDomainValues[measureDataDomain.measureId] = {
	            				 "dispDomainOptions" : that.prepareDisplayDomainOptions(measureDataDomain.domainValues, that),
	            				 "dispDomainValues" : that.prepareDisplayDomainValue(measureDataDomain.domainValues, that)};
           			  }
                });
	            
	            // Attach data for submeasues
	            if(canRestoreView){
	            	// we can get submeasure iformatin from backup
	            	this.data.cube.definition.subMeasures = subMeasures;
	            	this.data.cube.definition.measureFilters = measureFilters;
	            }else{
	            	
	            	var subMeasuresMap = response.result.subMeasuresMap;
	            	this.data.cube.definition.subMeasuresMap = subMeasuresMap; 
	            	
	            	var subMeasures = {};
	            	if(subMeasuresMap){
	            		for (splitMeasureId in subMeasuresMap) {
	            			var splitSubMeasures = subMeasuresMap[splitMeasureId];
	            			for(var mInd=0;  mInd < splitSubMeasures.length; mInd++){
	            				subMeasures[splitSubMeasures[mInd].id]=splitSubMeasures[mInd];
	            			}
	            		}
	            	}
	            	
	            	this.data.cube.definition.subMeasures = subMeasures;    
	            	this.data.cube.backup_definition.subMeasures = subMeasures;// Keep the backup copy also
	            }
	            
	            var dataFilterStatus = response.result.dataFilterStatus;
                if(dataFilterStatus){
                     if(!dataFilterStatus.validateExpressionStatus && dataFilterStatus.failureExpressionMessage){
                         extJSPivotAlert(pivotObjForRef,"wrn",dataFilterStatus.failureExpressionMessage);
                    }else if(!dataFilterStatus.applyFiltersStatus){
                    	if(this.isDataFilterEnabled()){
                        	this.getDataFilterController().displayDataNotAvailable(this);
                        }
                        this._unblockUI();
                    }
                }
                
                //  this.generateCSSRules();
	            //If anchors are enabled using get children call instead of expand pivot call.
                if(this.isDataAvailable){
	                if (canRestoreView && this.getPivotAnchors().length === 0){
	                    this._getExpandPivotRequest(expansionParam,keepExpand);
	                }
	                else{
	                	if(request.withExpand){
	                		this._cleanUpPivotDefinition(); // Because we are not able to retain expand state, just clear the definition
	                	}
	                    this._getRootChildrenHierarchy(isCubeMetadataChanged);
	                }
                }
                
                if (!this.initializedPanels) {
                    this.initializePanels();
                    this.initializedPanels=true;
                }else if(!canRestoreView){
                	if(this.isDataFilterEnabled()){
                		//Load saved data filter configs.
                    	this.getDataFilterController().getAllDataFilters();
                	}
                	if(this.isMeasureFilterEnabled()){
                    	this.getMeasureFilterController().getAllMeasureFilters();
                    }
                	this.data.expandDataObj && (this.data.expandDataObj ={});
                }
                	
                if(this.isDataFilterEnabled()){
                	this.getDataFilterController().enableOrDisableDataFilterPanel();
                	this.getDataFilterController().setDisableFilterActions(response.result.hasOutstandingEdits);
                	 if (response.result.hasOutstandingEdits && this.hooks.afterGetStatus){
                     	this.hooks.afterGetStatus.apply(this, [{hasEdits:response.result.hasOutstandingEdits}]);
                     }
                }
                
                if(this.isMeasureFilterEnabled()){
                	this.getMeasureFilterController().populateMeasureFitlerStores();
                }
                
                if (this.isGraphEnabled()) {
                	this.getGraphWrapper().fireEvent("refreshSettings",this.data.cube.definition,this._isCubeDef);
                }
                if (this.isCommentEnabled()) {
                	this.getCommentWrapper().fireEvent('pivotcellchanged',undefined,[]);
                	if(this.getCommentWrapper().getConfiguration() 
                			&& this.getCommentWrapper().getConfiguration().options 
                			&& this.getCommentWrapper().getConfiguration().options.enableReasonCodeSupport){
                		this.enableCmtReasonCodeSupport = true;
                		this.getCommentWrapper().fireEvent('setReasonCodes',this.data.cube.definition.commentReasonCodes);	
                	}
                }
                if(this.hasFilterPanel()){
                	this.getFilterPanel().fireEvent('renderFilterPanel',this.getSideAxisView().getAllFilters());
                }
                pivotlog("end jda_pivot.js _call_oncubemetadatachanged :"+pivotObjForRef.getFormatedTime());
                !canRestoreView && this._handleShowGraphPanel();
            },
            
            getExpandedAxisPathState : function(axisId,hasMeasures){
                var retValStr = [];
                var retVal = [];
                // Top axis
                if (axisId === 1){
                    for ( var iCol = this._getDataSplitIdx(), length = this._columns.length; iCol < length; iCol++)
                    {
                        var currCol = this._columns[iCol];
                        var noMsrId = currCol.id.split(_pns.Constants.measurePathSeperator)[0];
                        if (retValStr.indexOf(noMsrId) === -1){
                            retVal.push(_pns.axisPath.getCondensedAxisPath(currCol.axisPath, hasMeasures));
                            retValStr.push(noMsrId);
                        }
                    }
                }
                // Side axis
                else{
                    for ( var iRow = 0, length = this.data.order.length; iRow < length; iRow++){
                        var currRow = this.data.item(this.data.order[iRow]);
                        var noMsrId = currRow.id.split(_pns.Constants.measurePathSeperator)[0];
                        if (retValStr.indexOf(noMsrId) === -1){
                            retVal.push(_pns.axisPath.getCondensedAxisPath(currRow.axisPath, hasMeasures));
                            retValStr.push(noMsrId);
                        }
                    }

                }
                return retVal;
            },
         	getFormatedTime : function () {
             	  var d = new Date();
             	  var s = d.getTime();
             	  var ms = s % 1000;
             	  s = (s - ms) / 1000;
             	  var secs = s % 60;
             	  s = (s - secs) / 60;
             	  var mins = s % 60;
             	  //var hrs = ((s - mins) / 60);
             	  var hrs = d.getHours();
             	  return  " " + hrs + ":" + mins + ':' + secs + '.' + ms;
         	},
            hasMemberSelector:function(){
            	return this.config.memberSelector;
            },
            isUtilOptionEnabled: function(utilFeature) {
                var pivotUtil = this.config.pivotUtil;
                if (!pivotUtil) {
                    return false;
                }
                var feature=pivotUtil[utilFeature];
                if (!feature) {
                    return false;
                }
                return feature.enable;
            },
            isCommentReadOnly:function(){
                var comment =this.config.pivotUtil.comment;
                return comment.options.isReadOnly;
            },
            setCommentReadOnly:function(isReadOnly){
                var comment =this.config.pivotUtil.comment;
                comment.options.isReadOnly=isReadOnly;
            },
            isCommentEnabled: function(){
                return this.isUtilOptionEnabled('comment');
            },
            isGraphEnabled: function(){
                return this.isUtilOptionEnabled('graph');
            },
            isBusinessGraphEnabled: function(){
            	return this.config.enabledBusinessCharts;
            },
            isCFEnabled: function(){
                return this.isUtilOptionEnabled('cf');
            },
            isFiltesEnabled : function(){
            	  return (this.isUtilOptionEnabled('datafilter') || this.isUtilOptionEnabled('measurefilter'));
            },
            isDataFilterEnabled: function(){
                return this.isUtilOptionEnabled('datafilter');
            },
            isMeasureFilterEnabled: function(){
                return this.isUtilOptionEnabled('measurefilter');
            },
            isCopyPasteEnabled: function(){
            	return this.config.enabledCopyPaste;
            },
            copyDataWithMetadata: function(){
            	return this.config.enabledCopyWithMetadata;
            },
            copyGovernor: function(){
            	return this.config.copyGovernor;
            },
            exportGovernorRows:function(){
            	return this.config.exportGovernorRows;
            },
            exportGovernorCols:function(){
            	return this.config.exportGovernorCols;
            },
            doubleMeasureMinValue:function(){
            	return this.config.doubleMeasureMinValue;
            },
            doubleMeasureMaxValue:function(){
            	return this.config.doubleMeasureMaxValue;
            },
            defaultGraphConfiguration:function(){
            	return this.config.defaultGraphConfiguration;
            },
            showGraphPanel:function(){
            	return this.config.showGraphPanel;
            },
            isCellContextGraphEnabled: function(){
            	return this.config.enableCellContextGraph;
            },
            exportRowsPerBatch:function(){
            	if(this.config.exportRowsPerBatch){
            		var exportRows = Math.abs(this.config.exportRowsPerBatch);
            		if(!isNaN(exportRows) && exportRows%1 === 0){
            			//For integer values only this block will execute. 
            			//Math.abs() will make the -ve number to positive. So verifying for -ve number using ParseInt().
            			exportRows = parseInt(this.config.exportRowsPerBatch)
            			return exportRows;
            		}else if(this.hooks.onFailureExportExcel){
            			this.hooks.onFailureExportExcel(this.config.exportRowsPerBatch);
            		}
            	}else{
            		return -1;
            	}
            },
            getUserSettings:function(){
            	var userSettings = { "isShowNegativeInRed":this.config.isShowNegativeInRed, "isShowNegativeInParentheses": this.config.isShowNegativeInParentheses};
            	return userSettings; // // TODO check if we can get it without app teams adding code, we are doint this for pivot grid today. 
            },
            showEllipsisOnMemberName :  function() {
				return this.config.showEllipsisOnMemberName;
			},
            getCommentConfig:function(){                   	
            	return this.config.pivotUtil.comment;
            },
            showCommentIndicator:function (){
            	return this.config.showCommentIndicator;
            },
            domainName:function(){
            	return this.config.domainName;
            },
            dataDomainValueNameSeparator:function(){
            	return this.config.dataDomainValueNameSeparator;
            },
            textSetSeparator:function(){
            	return this.config.textSetSeparator;
            },
            updateShowCommentIndicator:function (showCommentIndicator){
            	this.config.showCommentIndicator = showCommentIndicator;
            },
            cellCommentRelation:function (){
            	return this.config.cellCommentRelation;
            },
            updateCellCommentRelation:function (cellCommentRelation){
            	this.config.cellCommentRelation = cellCommentRelation;
            	this.removeNonSegmentData = true;
            },
            getGraphConfig:function(){
            	return this.config.pivotUtil.graph;
            },
            getDataFilterConfig:function(){
                return this.config.pivotUtil.datafilter;
            },
            getMeasureFilterConfig:function(){
                return this.config.pivotUtil.measurefilter;
            },
            getCFWrapper:function(){
            	return this.getPivotController().getStyleCard().down('cfwrapper');
            },
            getDataFiltersDisplayPanel:function(){
                return this.getDataFilterController().getDataFiltersDisplayPanel();
            },
            getFilterPanel:function(){
            	return this.getPivotController().getPivotFilter();
            },
            getCommentWrapper:function(){
            	return this.getPivotController().getCommentWrapper();
            },
            getGraphWrapper:function(){
            	return this.getPivotController().getGraphWrapper();
            },
            getBusinessGraphWrapper:function(){
            	return this.getPivotController().getBusinessGraphWrapper();
            },
            getFiltersWrapper:function(){
            	return this.getPivotController().getFiltersWrapper();
            },
            getPivotController:function(){
            	return JdaPivotApp.getApplication().getPivotController();
            },
            getDataFilterController:function(){
            	return JdaPivotApp.getApplication().getDataFilterController();
            },
            getMeasureFilterController:function(){
            	return JdaPivotApp.getApplication().getMeasureFilterController();
            },
            isPanelExpanding:function(){
            	return this.getPivotController().getSouthPanelExpanding();
            },
            hasFilterPanel:function(){
            	return this.config.attributeFilter;
            },
            canOverrideRange:function(){
            	var canOverride = true;
            	if(this.overrideRange == false){         		
            		canOverride = this.isPanelExpanding() && this.isGraphEnabled();
            	}           	
            	return canOverride;
            },
            /**
             * Get Command Configuration object
             */
            getCommandConfig:function(command){
            	
            	var commandConfig = this.config.commandConfig;
            	// Seperate className from package name
            	// com.jda.pivot.common.broker.protocol.pivotViewRequest here pivotViewRequest is key for commandConfig
            	var keys = command.split(_pns.Constants.classNameSeperator);
               if(keys.length >1){
            	   var key = keys[keys.length-1];
            		if(commandConfig){
            			return commandConfig[key];
            		}else{
            			return this.customPivotLogic.commandConfig ? this.customPivotLogic.commandConfig[key] :undefined;
            		}
               }
               
               return undefined;
                            
            },
            initializePanels: function(){
                var pivotUtil = this.config.pivotUtil;
                if (this.isCFEnabled())
                {
					this.getCFWrapper().fireEvent('rendergrid');
                }
                if (this.isCommentEnabled() === false) {
                    if (this.config.actions.cellContextMenu.blackListItems) {
                    	this.config.actions.cellContextMenu.blackListItems.push('comment');
                    }
                }
                if (this.isGraphEnabled()){
                	this.getGraphWrapper().fireEvent("initgraph");
                }
                
                
                var cube = this._getCubeDefinition();
                if (this.isDataFilterEnabled()){
                	var dataFilterController = this.getDataFilterController(); 
                	//Load saved data filter configs.
                	dataFilterController.getAllDataFilters();
			    	var userAccessPermissions = cube.userAccessPermissions && cube.userAccessPermissions.DATAFILTER;
			    	if(userAccessPermissions){
                        dataFilterController.getDataFiltersDisplayPanel().config.userAccessPermissions = this.getUserAccessPermissions(userAccessPermissions);
			    	}else{
			    		dataFilterController.getDataFiltersDisplayPanel().config.userAccessPermissions = null;
			    	}
			    	//View Filter Permissions.
			    	var viewFilterPermissions = cube.userAccessPermissions && cube.userAccessPermissions.VIEWFILTER;
			    	if(viewFilterPermissions){
			    		dataFilterController.getDataFiltersDisplayPanel().config.viewFilterPermissions = this.getUserAccessPermissions(viewFilterPermissions);
			    	}else{
			    		dataFilterController.getDataFiltersDisplayPanel().config.viewFilterPermissions = null;
			    	}
                }else if (this.config.actions.cellContextMenu.blackListItems) {
                	this.config.actions.cellContextMenu.blackListItems.push('datafilter');
                }
                
                if (this.isMeasureFilterEnabled()){
                	var measureFilterController = this.getMeasureFilterController(); 
                	var measureFilterUserAccessPermissions = cube.userAccessPermissions && cube.userAccessPermissions.MEASUREFILTER;
			    	if(measureFilterUserAccessPermissions){
			    		measureFilterController.getMeasureFiltersDisplayPanel().config.userAccessPermissions = this.getUserAccessPermissions(measureFilterUserAccessPermissions);
			    	}else{
			    		measureFilterController.getMeasureFiltersDisplayPanel().config.userAccessPermissions = null;
			    	}
                	this.getMeasureFilterController().getAllMeasureFilters();
                }else if (this.config.actions.cellContextMenu.blackListItems) {
                	this.config.actions.cellContextMenu.blackListItems.push('measurefilter');
                }
            },
            getUserAccessPermissions : function(userAccessPermissions){
            	return {
					"canCreate" : userAccessPermissions.indexOf("CREATE") > -1,
					"canRead" : userAccessPermissions.indexOf("READ") > -1,
					"canUpdate" : userAccessPermissions.indexOf("UPDATE") > -1,
					"canDelete" : userAccessPermissions.indexOf("DELETE") > -1,
					"canExecute" : userAccessPermissions.indexOf("EXECUTE") > -1
	    		}
            },
            /** 
             * Formatting for Duration type using application provided DurationUtilites JS
             * 
             * @param content : Duration value- numeric value in minutes 
             * @return: Formatted String representation of Duration
             */
            getDurationCellFormattedValue :function(content)
            {
            	 var value= Math.round(Number(content));
            	 if (DurationUtilities) {
            		 value = isNaN(value) ? value: DurationUtilities.format(value,false,DurationUtilities.DurationFormat);  // Value should be in Days/Hours/Min format.                  
                 } else {
                     value = isNaN(content) ? content: Number.toLocaleString(content);                                            
                 }
            	return value;
            },
            getCellFormattedValue: function(content,precision,padWithZero) {
                var value=content;
                padWithZero=padWithZero===undefined?true:padWithZero;
                if (MathUtilities) {
                    MathUtilities.NumberOfDecimals = precision;
                    MathUtilities.PadWithZeros = padWithZero;
                    value = isNaN(value) ? value:
                    	content == "" ? content:
                        MathUtilities.format(MathUtilities.round(content,
                            precision, true), false);

                } else {
                    value = isNaN(content) ? content: Number.toLocaleString(content);
                }
                return value;
            },
            canRestoreView : function(oldViewDef, newViewDef) {
                if (!oldViewDef||!oldViewDef.visibleFacets||!this.data.cube.backup_definition){
                    return false;
                }
                var retObj = true;
                var axes = [ "sideAxis", "topAxis" ];
                var oldViewAxisVisibleFacets = oldViewDef.visibleFacets;
                var newViewAxisVisibleFacets = newViewDef.visibleFacets;
                if (oldViewAxisVisibleFacets.length != newViewAxisVisibleFacets.length){
                	return false;
                }
                for ( var iFacet = 0, iFacetsLen = oldViewAxisVisibleFacets.length; iFacet < iFacetsLen; iFacet++)
                {
                    if (oldViewAxisVisibleFacets[iFacet].id != newViewAxisVisibleFacets[iFacet].id){
                        return false;
                    }
                    
                    if(oldViewAxisVisibleFacets[iFacet].showRoot != newViewAxisVisibleFacets[iFacet].showRoot){
                    	return false;
                    }                    
                    
                    var oldLevelLen=oldViewAxisVisibleFacets[iFacet].visibleLevels.length;
                    if (oldLevelLen!=newViewAxisVisibleFacets[iFacet].visibleLevels.length)
                    {
                    	return false;
                    }
                    for (var iLevel=0;iLevel<oldLevelLen;iLevel++) {
                        if (oldViewAxisVisibleFacets[iFacet].visibleLevels[iLevel].attributeName!=newViewAxisVisibleFacets[iFacet].visibleLevels[iLevel].attributeName) {
                            return false;
                        }
                    }
                }
                for ( var iAxis=0; iAxis < axes.length; iAxis++){
                    var axisName = axes[iAxis];
                    var oldViewAxisFacets = oldViewDef[axisName].facets;
                    var newViewAxisFacets = newViewDef[axisName].facets;
                    if (oldViewAxisFacets.length != newViewAxisFacets.length){
                        return false;
                    }
                    for ( var iFacet = 0, iFacetsLen = oldViewAxisFacets.length; iFacet < iFacetsLen; iFacet++){
                        if (oldViewAxisFacets[iFacet].id != newViewAxisFacets[iFacet].id){
                            return false;
                        }
                    }
                }
                return true;
            },
            getAxisPathWithRootPadding : function(axisPath) {
                var sortAxisPath = [ [ '-1' ] ];
                for ( var iAxisPath = 0; iAxisPath < axisPath.length; iAxisPath++){
                    // Make sure we re-add the root for each facet
                    sortAxisPath.push([ '-1' ].concat(axisPath[iAxisPath].facetPath));
                }
                return sortAxisPath;

            },
            getAnchorLabel : function(anchorObj) {
                return anchorObj.facetName + ":" + anchorObj.filterName;
            },
            getSortOrder : function() {
                if (this._getCubeDefinition().sortBy && this._getCubeDefinition().sortBy.sortContexts.length){
                    return this._getCubeDefinition().sortBy.sortContexts[0].order;
                }
                else{
                    return -1;
                }

            },
            getHeaderRowCount : function() {
                return Math.max((this._getTopAxisFacetCount() + (this.areMeasuresOnTop() ? 1 : 0)), 2);
            },
            _setAxisPivots : function(axisDef) {
                if (axisDef && axisDef.facets){
                    jdapivot.toArray(axisDef.facets).each(function(obj) {

                    }, this);
                }
            },
            removeAllNonHeaderData : function() {
                this.data.cube.backup_definition.expansionParam = this._getExpandPivotParams();
                this.data.cube.backup_definition.colsDefs = this._getColumnsStickyData();
                var columns = jdapivot.toArray(this._settings.columns);
                var dataSplit = this._getDataSplitIdx();
                this.clearHighlightedCells(); // Clear all highlighted cells
                var pull = this.data.pull;
                for ( var rowId in pull){
                    if (pull.hasOwnProperty(rowId)){
                        var item = pull[rowId];

                        for ( var i = dataSplit; i < columns.length; i++){
                            delete item[columns[i].id];
                        }
                    }
                }
                // this.data.pull = {}; // hash of IDs
                // this.data.order = jdapivot.toArray(); // order of IDs

            },
            removeDataNotInSegment : function(iteratedRowsPaths, iteratedColsPaths) {
                var columns = jdapivot.toArray(this._settings.columns);
                var dataSplit = this._getDataSplitIdx();
                var pull = this.data.pull;
                Object.keys(pull).forEach(function (rowId) {
                	var item = pull[rowId];
                	 var newItem = {};
                     Object.keys(item).forEach(function (colId) {
                         if(colId != "id" && (colId.indexOf(_pns.Constants.axisPathSeperator) != -1 || colId.indexOf(_pns.Constants.measurePathSeperator) != -1)){
                         	if(item[colId] && (colId in iteratedColsPaths) && (rowId in iteratedRowsPaths)){
                         		newItem[colId] = item[colId];
                         	}
                         }else{
                         	newItem[colId] = item[colId];
                         }
                     });
                     pull[rowId] = newItem;
                });
            },
            removeColumnDataRange : function(fromIndex, toIndex) {
                var removeSize = toIndex - fromIndex + 1;
                var pull = this.data.pull;
                for ( var rowId in pull){
                    if (pull.hasOwnProperty(rowId)){
                        var item = pull[rowId];
                        if (item){
                            for ( var colIndex = fromIndex; colIndex < toIndex + 1; colIndex++){
                                var currColId = this._columns[colIndex].id;
                                delete item[currColId];
                            }
                        }
                    }
                }
            },
            _call_onstructchanged : function(data) {
            	pivotlog("start jda_pivot.js _call_onstructchanged :"+pivotObjForRef.getFormatedTime());
                var parentCol = data.parentCol;
                var i, j = 0;
                var columnsData = data.columns;

                pivotlog("_call_onstructchanged called");
                var columns = jdapivot.toArray(this._settings.columns);
                this.segmentDataRequestStack = [];
                this.segmentDataRequestStack.busy = false;

                var colIndex = this.columnIndex(parentCol);
                var childrenIds = [];
                this._columns[colIndex].childrenIds = childrenIds;
                for (i = 0; i < columnsData.length; i++){
                    var currColumn = columnsData[i];
                    columns.insertAt(currColumn, colIndex + i + 1);
                    childrenIds.push(currColumn.id);
                    if (!currColumn.node){

                        var temp = dhtmlx.html.create("DIV");
                        temp.style.width = currColumn.width + "px";
                        currColumn.node = temp;
                    }
                }
                this._setColumnsRenderers(columnsData);
                var top = null;
                var left = null;
                var rowsData = data;
                for (i = 0; i < rowsData.length; i++){
                    var rowData = rowsData[i];
                    var id = rowsData.id;
                    if (id && pull[id]){
                        for ( var key in rowData){
                            if ((key != "id"))
                                this.pull[id][key] = rowData[key];
                        }
                    }
                }
                var xr = this._get_x_range(this._settings.prerender);
                var yr = this._get_y_range(this._settings.prerender === true);
                if (yr[1] == 0){
                    yr = this._get_y_range(true, 60);
                }
                this._truncateRange(yr[1] + 1, this.data.order.length);
                this._truncateRange(0, Math.max(yr[0], 0));

                this._apply_headers();
                // var reInsert=removeToInsertLater(this._body);
                for (i = 0; i < columnsData.length; i++){
                    this._renderColumn(colIndex + i + 1, yr, true);
                }
                // reInsert();
                // if (!this.isSideAxis())
                this._renderStructureChange();
                this._adjustChangedColumns();
                this._syncFreezeColumnsHeight();
                this.updateFocusedCell();
                pivotlog("end jda_pivot.js _call_onstructchanged :"+pivotObjForRef.getFormatedTime());
            },

            executeComment:function(event,data){
               /* var currentDiv = this._locateCellDiv({
                    row : data.cell.sideAxis,
                    column : data.cell.topAxis
                });
                // True for MDAP Server only
                var commentTitle = $(currentDiv).find('[class*="cmtRelation"]')[0].title;*/

            	// True for MDAP Server only
                var cellValue = this.getValueFromAxisLocation([data.cell.sideAxis,data.cell.topAxis]);
                var commentTitle = cellValue && cellValue.cmtTitle;

                if((data.value.operation === "update" && !commentTitle)||(data.value.operation === "read"))
                {
                    this._getupdateCommentRequest(data.cell, data.value);

                    //data.value.operation="read";
                    //this._getupdateCommentRequest(data.cell, data.value);
                }
                else
                    this._getupdateFactsRequest(data.cell, data.value);

            },

            executeGraph:function(event,data){
                if(data.operation === 'save')
                    this._saveGraphSettingsRequest(data);
                else
                    this._getGraphDataRequest(data);
            },
            
            executeBusinessGraph:function(params){
                var businessGraphRequest = new jda.pivot.businessGraphRequest(params)
                //businessGraphRequest.callback = pivotObjForRef._onBusinessGraph;
              	this.data.pivotCommands[businessGraphRequest.id] = businessGraphRequest;
				pivotObjForRef.data.feed.call(this, pivotObjForRef.data.url, "jda_pivot_json", businessGraphRequest._getPayload());
            },
            executeDataFilter:function(params){
                var dataFilterRequest = new jda.pivot.dataFilterRequest(params)
              	this.data.pivotCommands[dataFilterRequest.id] = dataFilterRequest;
				pivotObjForRef.data.feed.call(this, pivotObjForRef.data.url, "jda_pivot_json", dataFilterRequest._getPayload());
            },
            executeMeasureFilter:function(params,callback){
                var measureFilterRequest = new jda.pivot.measureFilterRequest(params,{callback:callback})
              	this.data.pivotCommands[measureFilterRequest.id] = measureFilterRequest;
				pivotObjForRef.data.feed.call(this, pivotObjForRef.data.url, "jda_pivot_json", measureFilterRequest._getPayload());
            },
            destroy:function(){
            	if(this.data.cube == null) {
            		// do nothing if the cube has already been destroyed. Ideally, the client code
            		// should never invoke destroy() twice, but having this logic here gives the
            		// client code more flexibility.
            		return;
            	}
            	
            	var $pivotContainer = this.$pivotWrapper.find(".upperPivotLayer");
            	// clear the cache
            	this.clearAll();
            	// clear the loaded cube 
            	this.data.cube=null;
            	// empty all the childrens
            	$pivotContainer.empty();
              
            },
            loadStyleDefinitionsToDocument: function (ruleDefs) {
                //Iterate through all Rule Items
                //And add them to the HTML doc dynamically
            	var cfRules={};
                for (var i = 0; i < ruleDefs.length; i++) {
                    var rule = ruleDefs[i];
                    //this.addStyleDefinitionsToDocument(rule);
                    //rule.ruleId = ".cfcss" + rule.ruleId;
                    var styleProperties = null;
                    var styleId = ".cfcss" + rule.ruleId;
                    var cssBackgroundColor = colorNameToHex(rule.cellBgColor, normalizeColorValue(rule.cellBgColor));
                    styleProperties = "\n { background:" + cssBackgroundColor + ";";
                    var cssFontColor = colorNameToHex(rule.cellFontColor, normalizeColorValue(rule.cellFontColor));      
                    styleProperties = styleProperties + " color:" + cssFontColor + ";}\n";
                    cfRules[styleId] = styleProperties;
                }
                this._refreshStylesElement(cfRules);
            },
            loadCFDefinitionsToDocument: function (ruleDefs) {
                //Iterate through all Rule Items
                //And add them to the HTML doc dynamically
            	var cfRules={};
                for (var i = 0; i < ruleDefs.length; i++) {
                	 var rule = ruleDefs[i];
                	if(rule.formatCell){
                		var formatCell = rule.formatCell;
                        var styleProperties = null;
                        var styleId = ".cfcss" + rule.id;
                        var cssBackgroundColor = colorNameToHex(formatCell.cellBgColor, normalizeColorValue(formatCell.cellBgColor));
                        styleProperties = "\n { background:" + cssBackgroundColor + ";";
                        var cssFontColor = colorNameToHex(formatCell.cellFontColor, normalizeColorValue(formatCell.cellFontColor));      
                        styleProperties = styleProperties + " color:" + cssFontColor + ";}\n";
                        cfRules[styleId] = styleProperties;
                	}
                }
                this._refreshStylesElement(cfRules);
            },
           // cfRules: {},
            _refreshStylesElement: function (cfRules) {
                var that = this;
                $('head .isPivotCFCSS').remove();
                var domText = '';
                $.each(cfRules, function (cssId, cssStyle) {
                    var fullCssRule = '.pivotLayerElement .dhx_value.label.dhx_cell';
                    fullCssRule = "\n" + fullCssRule + cssId;

                    domText = domText + fullCssRule + cssStyle;
                });
                this.addCFStyle(domText);
            },                   
            addCFStyle: function (rule) {
                //    pivotlog ("Adding rule %s",rule);
                var style = document.createElement("style");
                style.setAttribute("type", "text/css");
                style.setAttribute("class", "isPivotCFCSS");
                var theFirstChild = document.getElementsByTagName("head")[0].firstChild;
                document.getElementsByTagName("head")[0].insertBefore(style, theFirstChild);
                /*IE8*/
                //     if (style.styleSheet)
                //         style.styleSheet.cssText = rule;
                //     else
                style.appendChild(document.createTextNode(rule));

            },
            calculateMultiEdit:function(){
                var obj ={
                    ed:true,
                    calculate:true,
                    commit:false,
                    publish:false
                } ;
                this._getMultiEditRequest(obj);
            },
            commitMultiEdit:function(scenarioId) {
                var obj = {
                    ed: true,
                    calculate: true,
                    commit: true,
                    publish: false,
                    scenarioId: scenarioId
                };
                this._getMultiEditRequest(obj);
            },
            undoMultiEdit:function(isUndoAll){
                var obj ={
                    ed:false,
                    undoEdit:isUndoAll
                } ;

                this._getMultiEditRequest(obj);
            },
            getScenarioStatus:function(){

                this._getGetScenarioStatusRequest({callback: function(response, result){
                	
                	if(pivotObjForRef.isDataFilterEnabled()){
                		//set filter status
                        pivotObjForRef.getDataFilterController().setDisableFilterActions(response.result.hasEdits);
                    }
                    if (pivotObjForRef.hooks.afterGetStatus){
                    	pivotObjForRef.hooks.afterGetStatus.apply(pivotObjForRef, [response.result]);
                    }

                }});
            },
            publishScenario:function(scenarioId){
                var obj = {
                    ed: true,
                    calculate: true,
                    commit: true,
                    publish: true,
                    scenarioId: scenarioId
                };
                this._getMultiEditRequest(obj);
            },
            deleteScenario:function(scenarioName){

                if (scenarioName === "Live") {
                    alert("You cannot delete the Live scenario");
                } else {
                    var that = this;
                    this._getDeleteScenarioRequest(scenarioName, {
                        callback: function (response, result) {
                            that.handleScenarios("getScenarios", "");
                        }
                    });
                }
            },
            clearExceptions:function(){
        		this.clearEditConflictErrors = true;
        		this.initGetSegmentData(true);
        		this.clearEditConflictErrors = false;
        	},
        	refreshSegmentData:function(){
        		//If we changing below logic, Then we need to test After commit opration thought application.
        		var segment = this.getViewSegment(true);
        		var params = {
        				viewSegment : {
        					topAxisPaths : segment.topAxisPaths,
        					sideAxisPaths : segment.sideAxisPaths
        				},
        				combiMeasuresIds :segment.measuresIds
        		};
        		this._sendUpdateFactsRequest(params);
        	},
            handleScenarios:function(operation, scenarioIds, scenarioNames){
            	if(operation){
            		if(operation === "getScenarios"){
	            		 this._getGetScenariosRequest({callback: function(response, result){
	                     	if(pivotObjForRef.hooks.handleScenarios && response){
	                     		pivotObjForRef.hooks.handleScenarios(response.result);
	                     	}
	                     }});	
	            	}else if(operation === "addScenario"){
	            		  this._getAddScenarioRequest(scenarioIds, {callback: function(response, result){
	                          var success = response.result;
	                          Object.keys(success).forEach(function (key) {
	                              var value = success[key]

	                              if (key === "success") {
	                                  if (! value) {
	                                      alert("That name is already in use");
	                                      return;
	                                  }
	                              }
	                          })
	            		  }});
	            	}else if(operation === "loadScenarios"){
	            		  this._getSetScenariosRequest(scenarioIds.join("~"), {callback: function(response, result){
	            			  
	            			 pivotObjForRef.getScenarioStatus();
	            			 //MDAP-2133 - Jumpy Scroll observing when loading scenarios as dimensions.
	            			 //pivotObjForRef._getcubeDefinitionRequest();
	            			 pivotObjForRef.refreshAllSettings("true");

                             var scenarioLabel;
                             if(response && response.metadata && response.metadata.statusCode === "FLD"){
                            	 if(pivotObjForRef.hooks.showScenarioExcpetionMessage){
                            		 pivotObjForRef.hooks.showScenarioExcpetionMessage(response.metadata.message);	 
                            	 }
	            			  }else{
	            				  if (singleScenarioSelection) {
	                                  if (scenarioIds.length > 1) {
	                                      singleScenarioSelection = false;
	                                      scenarioLabel = "-Multiple-";
	                                  } else {
	                                      scenarioLabel = scenarioNames[0];
	                                  }
	                              } else {
	                                  if (scenarioIds.length == 1) {
	                                      singleScenarioSelection = true;
	                                      scenarioLabel = scenarioNames[0];
	                                  } else {
	                                      scenarioLabel = "-Multiple-";
	                                  }
	                              }
	                              if (pivotObjForRef.hooks.drawScenarioLabel){
	                            	  pivotObjForRef.hooks.drawScenarioLabel(scenarioLabel);
	                              }
	                              if (pivotObjForRef.hooks.refreshPivotSettings){
                                	  pivotObjForRef.hooks.refreshPivotSettings.apply(pivotObjForRef, [response.result]);
                                  }
	            			  }
	                      }});
	            	}
            	}
        	},
        	handleScenarioOperations:function(operation, scenarioId){
                if (scenarioId) {
                    if(operation === "Delete"){
                        this.deleteScenario(scenarioId)
                    }else if(operation === "Commit"){
                        this.commitMultiEdit(scenarioId)
                    }else if(operation === "Publish"){
                        this.publishScenario(scenarioId);
                    } else {

                    }
                } else {
                    this._getGetScenariosRequest({
                        callback: function (response, result) {
                            if (pivotObjForRef.hooks.handleScenarioOperations && response) {
                                pivotObjForRef.hooks.handleScenarioOperations(operation, response.result);
                            }
                        }
                    });
                }
        	},
        	 canRestoreExpandState : function(oldViewDef, newViewDef) {
                 if (!oldViewDef||!oldViewDef.visibleFacets||!this.data.cube.backup_definition){
                     return false;
                 }
                 var retObj = true;
                 var axes = [ "sideAxis", "topAxis" ];
                 var oldViewAxisVisibleFacets = oldViewDef.visibleFacets;
                 var newViewAxisVisibleFacets = newViewDef.visibleFacets;
                 for ( var iFacet = 0, iFacetsLen = Math.min(oldViewAxisVisibleFacets.length,newViewAxisVisibleFacets.length); iFacet < iFacetsLen; iFacet++)
                 {
                     if (oldViewAxisVisibleFacets[iFacet].id != newViewAxisVisibleFacets[iFacet].id){
                         return false;
                     }
                     
                     if(oldViewAxisVisibleFacets[iFacet].showRoot != newViewAxisVisibleFacets[iFacet].showRoot){
                     	return false;
                     }                    
                     
                     var oldLevelLen=oldViewAxisVisibleFacets[iFacet].visibleLevels.length;
                     if (oldLevelLen>newViewAxisVisibleFacets[iFacet].visibleLevels.length)
                     {
                     	return false;
                     }
                     for (var iLevel=0;iLevel<oldLevelLen;iLevel++) {
                         if (oldViewAxisVisibleFacets[iFacet].visibleLevels[iLevel].attributeName!=newViewAxisVisibleFacets[iFacet].visibleLevels[iLevel].attributeName) {
                             return false;
                         }
                     }
                 }
                 //Get the difference in visible top facets 
 	                if(oldViewDef[axes[1]].facets.length != newViewDef[axes[1]].facets.length){
 	                	retObj = {visibleTopFacets:[]};
 	                	retObj.visibleTopFacets = oldViewDef[axes[1]].facets.length - newViewDef[axes[1]].facets.length;
 	                }
                     var axisName = axes[0];//Check for sede axis
                     var oldViewAxisFacets = oldViewDef[axisName].facets;
                     var newViewAxisFacets = newViewDef[axisName].facets;
                     if (oldViewAxisFacets.length != newViewAxisFacets.length){
                     	return false;
                     }
                     for ( var iFacet = 0, iFacetsLen = oldViewAxisFacets.length; iFacet < iFacetsLen; iFacet++){
                         if (oldViewAxisFacets[iFacet].id != newViewAxisFacets[iFacet].id){
                             return false;
                         }
                     }
                
                 return retObj;
             }
        }, dhtmlx.MouseEvents, jdapivot.ui.jdatable, jdapivot.AtomDataLoader);

    _pns.datastore = jdapivot.proto({
        // has to be named as "DataStore" for the data processor to
        // be installed properly.
        name : "DataStore",
        facetPathSeperator : ".",
        axisPathSeperator : "-",
        _init : function(config) {
            this.name = "DataStore";
            this.cube = {
                view : {
                    topAxis : {
                        facets : []
                    },
                    sideAxis : {
                        facets : []
                    }
                }
            };

            jdapivot.extend(this, dhtmlx.EventSystem);

            this.dp = new jda_dataprocessor({
                master : this,
                url : this.url
            });
            this.setDriver("jda_pivot_json"); // default data
            // source is jda
            // json
            this.pull = {}; // hash of IDs
            this.order = jdapivot.toArray(); // order of IDs
            var that = this;

        },
        getCellValFromCellId : function(cellId) {
            var item = this.item(cellId.row);
            if (item !== undefined && cellId.column in item){
                var currVal = item[cellId.column];
                return currVal;
            }

        },
        validate : function(obj) {
            dhtmlx.assert(this.callEvent, "using validate for eventless object");
            var result = true;
            var rules = this._settings.rules;
            if (rules){
                var objrule = rules.$obj;
                if (!obj && this.getValues)
                    obj = this.getValues();
                if (objrule && !objrule.call(this, obj))
                    return false;

                var all = rules.$all;
                for ( var key in rules){
                    if (key.indexOf("$") !== 0){
                        dhtmlx.assert(rules[key], "Invalid rule for:" + key);
                        if (rules[key].call(this, obj[key], obj, key) && (!all || all.call(this, obj[key], obj, key))){
                            if (this.callEvent("onValidationSuccess", [ key, obj ]) && this._clear_invalid)
                                this._clear_invalid(key, obj);
                        }
                        else{
                            result = false;
                            if (this.callEvent("onValidationError", [ key, obj ]) && this._mark_invalid)
                                this._mark_invalid(key, obj);
                        }
                    }
                }
            }
            return result;
        },

        /**
         * Update the value in the cell identified by the given rowId and colId. Will do nothing if no such cell exists.
         *
         * @param rowId
         *            the row ID of the cell to be updated.
         * @param colId
         *            the column ID of the cell to be updated.
         * @param value
         *            the new value for the cell
         * @returns none.
         */
        updateCell : function(rowId, colId, value) {
            if (this.exists(rowId)){
                var item = this.item(rowId);
                if (colId in item){
                    if (('lock' in value) || ('value' in value)){
                        this._updateCell(rowId, colId, value);
                        // item[colId] = value;
                    }
                }
            }
        },
        _updateCell : function(rowId, colId, value) {
            var updateId = {
                sideAxis : rowId,
                topAxis : colId
            };
            /*var updateValue = {
                "data" : value
            };
            this.callEvent("onStoreUpdated", [ updateId, updateValue, "update" ]);
             */
            if ('value' in value){
                if (value.value === '__Nv__'){
                    delete value.value;
                } else if(value.value && value.dtype != 'string'){
                	value.value = parseFloat(value.value);
                }
            }
            pivotObjForRef._getupdateFactsRequest(updateId, value);
        },

        _getFacetNodeIdFromFacetPath : function(facetPath) {
            if (!jdapivot.isArray(facetPath)){
                facetPath = [ facetPath ];
            }
            var id = facetPath.join(this.facetPathSeperator);
            return id;
        },
        _getAxisNodeIdFromFacetPaths : function(facetPaths) {
            if (!jdapivot.isArray(facetPaths)){
                facetPaths = [ facetPaths ];
            }
            var facetsIds = jdapivot.toArray();
            for ( var i = 0; i < facetPaths.length; i++){
                facetsIds.push(this._getFacetNodeIdFromFacetPath(_getFacetNodeIdFromFacetPath[i]));
            }
            var id = facetsIds.join(this.axisPathSeperator);
            return id;
        },
        getAxisNameFromIndex : function(index) {
            return index === 0 ? "sideAxis" : "topAxis";
        },
        getAxisFromIndex : function(index) {
            return this.cube.view[index];
        },
        getAxis : function(nameOrIndex) {
            var axes = [ "sideAxis", "topAxis" ];
            if (typeof nameOrIndex == "number"){
                nameOrIndex = this.getAxisNameFromIndex(nameOrIndex);
            }
            var viewDef = this.cube.definition;
            return viewDef[nameOrIndex];

        },
        // Override super class
        // process incoming raw data
        _parse : function(data,pivotObj) {
        	var that=this;
        	this.callEvent("onParse", [ this.driver, data ]);
        
            var request = null;
            if (data && data.id){
                request = this.pivotCommands[data.id];
                if (request){
                    // In case it's a cancel, we need to notify a pending
    				// PivotViewSettings on
                    // the cancelation
                    if (data.method === _pns.Constants.cancelRequest){
                        $.each(this.pivotCommands, function(key, cmd) {
                            if (cmd['@class'] === _pns.getPivotPackagePrefix()+"protocol.PivotViewRequest"){
                                cmd.callback = request.callback;
                                return false;
                            }
                        });
                    }
                    delete this.pivotCommands[data.id];
                    // Let's not rush to hide the spinner in case there are some
    				// commands happening in a sequence.
                    // This will prevent flicker of the spinner
                    var commandConfig = pivotObj.getCommandConfig(request["@class"]);
                    var requestProcessing = data.error && data.error.errorEnum ? data.error.errorEnum.code !== -32704 : true;
                   _.delay(function(){
                    	if (commandConfig && commandConfig.showDialog && requestProcessing && pivotObj.config && !(pivotObj.config.keepOverlaySpinner)) {
                    		that.callEvent("onHideOverlaySpinner", [ data, request ]);
                    	}
                    	
                    },100);
                    
                }
            }
            if (data.error && data.error.errorEnum){
                // oh-oh
                switch (data.error.errorEnum.code)
                {
                    // Check if the node is not responding
                    case -32703:
                        this.callEvent("onNodeNotResponsing", [ data, request ]);
                        break;
                    // Check if the cube is still loading
                    case -32701:
                        this.callEvent("onRecheckLoading", [ data, request ]);
                        break;
                    // Check if the cube is still quick loading
                    case -32606:
                        this.callEvent("onRecheckQuickLoading", [ data, request ]);
                        break;
                    // Check if the cube is still quick saving
                    case -32608:
                        this.callEvent("onRecheckQuickSaving", [ data, request ]);
                        break;
                    // Check if the cube is still commiting
                    case -32610:
                        this.callEvent("onRecheckComitting", [ data, request ]);
                        break;
                    case -32618:
                        this.callEvent("onRecheckCommitCompleting", [ data, request ]);
                        break;
                    case -32616:
                    case -32620:
                        this.callEvent("onCommitCancelled", [ data, request ]);
                        break;
                    case -32704:
                    	this.callEvent("onRequestProcessing",[data,request]);
                    	break;
                    case -32622:
                    	this.callEvent("nodeOnRecoveryMode",[data,request]);
                    	break;
                    case -32623:
                    	this.callEvent("previousCalculationInProgress",[data,request]);
                    	break;
                    case -32604:
                    	this.callEvent("noChildren",[data,request]);
                    	break;
                    default:
                    	if(data && data.method && data.method === "businessGraph") // Check if error response is for business graph errors on server
                    		this.callEvent("onGetGraphDataError",[data,request]);
                    	else
                    		this.callEvent("onErrorResponse", [ data, request ]);
                }
            }
            else if (data && data.method && data.id){
                pivotlog("< ======= Got response from server ======== >");
                var params=[ data, request ];
                if (data.method == "setPivotAxes") {
    				params.push(true);
                }
                var callback=request&&request.getCallBack();
                if (callback) {
                	callback.apply(this,[data, request,this,pivotObj]);
                } else {
                    this.callEvent(this.responseMapping[data.method], params);
                }
            }
        },
        responseMapping : {
            'getCubeViewDefinition' : 'onCubeMetaDataChanged',
            'setPivotAxes' : 'onCubeMetaDataChanged',
            'expandAxis' : 'onReExpandHierarchies',
            'getChildren' : 'onGetChildren',
            'getSegmentData' : 'onGetSegmentData',
            'updateFacts' : 'onGetSegmentData',
            'getCellDetails' : 'onGetCellDetails',
            'updateComment' : 'onGetComment',
            'genericMethod' : 'onGenericResponse',
            'getGraphData'  : 'onGetGraphData',
            'saveGraphSetting' : 'onSaveGraphSetting',
            'exportToExcel'    : 'onExportToExcel',
            'PasteCopiedContent' : 'onGetSegmentData',
            'importFromExcel' : 'onGetSegmentData',
            'businessGraph' : 'onBusinessGraph',
            'dataFilter' : 'onDataFilter',
            'measureFilter' : 'onMeasureFilter',
        },
        //converts id to index
        idByIndex:function(index){
            return this.order[index];
        },
        //converts index to id
        indexById:function(id){
            var res = this.order.find(id);  //slower than idByIndex

            return res;
        },
        _drilldownColumn : function(data) {
            this.callEvent("onStructureChanged", [ data ]);
        }

    }, jdapivot.Settings, dhtmlx.DataStore);

    dhtmlx.DataDriver.jda_pivot_json =
    {
        // convert json string to json object if necessary
        toObject : function(data) {
            if (!data)
                data = "[]";
            if (typeof data == "string"){
                try{
                	data = JSON.parse(data);
                }catch (ex){
                    var redirectStr = "REDIRECT:";
                    var redirectLocation = data.indexOf(redirectStr);
                    if (redirectLocation === 0){
                        window.location = data.substring(redirectStr.length);
                    }
                    // Probably malformed server response
                    data =
                        JSON.parse('{"id":0,"jsonrpc":"2.0","error":{"errorEnum":{"code":-32603,"severity":"err"},"message":"Unexpected server response.\nPlease contact your administrator.","details":"' +
                                $.trim(data) + '"}}');
                }

            }
            if (data.columns && data.parenCol){
                var columns = data.columns;
                data.parentCol = data.parenCol;
            }
            if (data.data){
                var t = data.data;
                t.pos = data.pos;
                t.total_count = data.total_count;
                t.parentCol = data.parentCol;
                t.columns = data.columns;
                data = t;
            }

            return data;
        },

        // get array of records
        getRecords : function(data) {
            if (data && !jdapivot.isArray(data))
                return [ data ];
            return data;
        },

        // get hash of properties for single record
        getDetails : function(data) {
            return data;
        },

        // get count of data and position at which new data need to be inserted
        getInfo : function(data) {
            return {
                _size : (data.total_count || 0),
                _from : (data.pos || 0)
            };
        }
    };
    
    function GetDataFromClipboard() {
    	this.getClipboardText = function (callback) {
    		var cbText;
    		if (BrowserUtilities.isIE() ){
    			pivotlog("At IE");
    			cbText = window.clipboardData.getData('Text');
    			callback(cbText); 
    		}else{
    			var cbta = document.createElement('textarea');
    			cbta.id = 'cliparea';
    			cbta.style.position = 'absolute';
    			cbta.style.left = '-1000px';
    			cbta.style.top = '-1000px';
    			cbta.value = '';
    			document.body.appendChild(cbta);
    			document.designMode = 'off';
    			setTimeout(function(){
    				cbText=cbta.value;
    				callback(cbText);
    			}, 100);
    			cbta.focus();
    			cbta.select();
    		}
    	};
    }

}); //End of wrapping onReady init

//
// $Log$
// Revision 1.325  2017/04/17 12:38:58  rpelluri
// MDAP-3620 : Browser goes into error loop until running out of memory after clicking on graph
//
// Revision 1.324  2017/04/14 05:12:27  mmuddukrishna
// MDAP-3638 - Fix for Locks and scroll operations resulting in UpdateFactsRequest loop.
//
// Revision 1.323  2017/04/06 10:57:17  rpelluri
// MDAP-3644 : Clean up jquery ajax dead code in jda_pivot.js
//
// Revision 1.322  2017/02/23 14:05:20  rpudi
// MDAP-3520 : Testing : Test initial pivot load with 100 K SKU's with 20 measures and 200 columns.
//
// Revision 1.321  2017/02/17 09:14:37  rpudi
// MDAP-3435 : SBU1 Member Background color is changing when SBU0 members expanded .
//
// Revision 1.320  2017/02/16 10:04:45  rpudi
// MDAP-2661 : JDAPivot blue changes highlighting is very wrong
//
// Revision 1.319  2017/02/16 08:20:11  rpudi
// MDAP-3202 : Pivot UI : preformance issue with preparing getsegment data request after get child(expand tree) members request.
//
// Revision 1.318  2017/02/14 18:15:15  lkatzman
// Changes for mdap-2698 to show cell with both ancestor and descendant comments to use Desc dogear and tooltip
//
// Revision 1.317  2017/02/14 11:29:31  mmuddukrishna
// MDAP-2732-hiding single facet when move to side/drag n drop/swap facet, when the target axis has other facets/measures.
//
// Revision 1.316  2017/02/14 11:23:46  mmuddukrishna
// MDAP-2732-hiding single facet when move to side/drag n drop/swap facet, when the target axis has other facets.
//
// Revision 1.315  2017/02/14 07:20:44  mmuddukrishna
// Modified getTimeFacet() to resolve an issue in IE11. => is not identified in IE.
//
// Revision 1.314  2017/02/13 17:03:36  mmuddukrishna
// MDAP-2732-Disable Scenario Facet de-selection while in multi-scenario mode in Pivot
//
// Revision 1.313  2017/02/13 11:02:18  mmuddukrishna
// MDAP-3351 - Disable current option from related pages navigation if the selected cell have at least one facet(non-time and non-scenario facets) is at root(ALL)
//
// Revision 1.312  2017/02/10 13:36:07  rpudi
// MDAP-3411 : Worksheet forgets pivot position on first Save, remembers on subsequent
//
// Revision 1.311  2017/02/10 13:16:32  mmuddukrishna
// MDAP-2732 - Remove scenarios from hide/view facets. Revert back the old changes and fix for new functional change.
//
// Revision 1.310  2017/02/10 11:19:50  rpudi
// MDAP-2661 : JDAPivot blue changes highlighting is very wrong
//
// Revision 1.309  2017/02/08 13:22:20  rpudi
// MDAP-2728 : MDAP Defect : Applying physcial lock on no value cell is in locked mode is giving error
//
// Revision 1.307  2017/02/06 13:43:31  rpelluri
// MDAP-3482 : User preference 'Use red for negatives' not respected in pivot.
//
// Revision 1.306  2017/02/02 07:28:42  mmuddukrishna
// MDAP-2732-Disable Scenario Facet de-selection while in multi-scenario mode in Pivot
//
// Revision 1.305  2017/02/01 11:57:28  mmuddukrishna
// MDAP-2732-Disable Scenario Facet de-selection while in multi-scenario mode in Pivot
//
// Revision 1.304  2017/02/01 07:30:36  rpudi
// MDAP-3306 : Pivot UI errors out when performing search 10K SKU's without hierarchy
//
// Revision 1.303  2017/01/31 17:05:09  mmuddukrishna
// MDAP-2732-Disable Scenario Facet de-selection while in multi-scenario mode in Pivot
//
// Revision 1.302  2017/01/31 08:49:24  cvully
// MDAP-2236: Prevent a user from doing two calcs at one time in the same session.
//
// Revision 1.301  2017/01/25 15:24:51  rpudi
// MDAP-3306 : Pivot UI errors out when performing search 10K SKU's without hierarchy
//
// Revision 1.300  2017/01/20 14:14:48  mmuddukrishna
// MDAP-3306- Reverting the changes as these changes causing breakage of existing functionality.
//
// Revision 1.299  2017/01/20 12:37:24  rpudi
// MDAP-2832 : Unable to add comment to the selected cell which is below the comments panel/out of view port
//
// Revision 1.298  2017/01/19 13:25:04  rpudi
// MDAP-3404 : Invalid Members are displaying in the second dimension
//
// Revision 1.297  2017/01/12 16:03:43  mmuddukrishna
// MDAP-3306 - Pivot UI errors out when performing search 10K SKU's without hierarchy.
//
// Revision 1.296  2017/01/09 14:29:07  mmuddukrishna
// MDAP-3306 - Initial Check in for Pivot UI errors out when performing search 10K SKU's without hierarchy.
//
// Revision 1.295  2016/12/22 10:14:59  rpudi
// MDAP-2971 : Clear Exception button gets disabled if the levels holding exception is hidden only in first attempt.
// MDAP-3092 : Behavior of Clear Exceptions button after hiding the level which is holding an exception.
//
// Revision 1.294  2016/12/15 07:21:33  mmuddukrishna
// MDAP-3305 - To display error message when no children present for a facet.
//
// Revision 1.293  2016/12/14 13:47:39  rpudi
// MDAP-2951 : Business Graph: Graph request is calling for every getsegment data when we open graph tab.
//
// Revision 1.292  2016/12/13 13:23:27  rpudi
// MDAP-3188 : Boolean Type measure: Values edited for Boolean type measure are not retained after user moves out of view port.
//
// Revision 1.291  2016/12/13 08:59:19  rpudi
// MDAP-3191 : MDAP Defect :Alignment issue in Pivot
//
// Revision 1.290  2016/12/13 08:52:31  rpudi
// MDAP-3055 : Measure is not getting protected at out of view port .
//
// Revision 1.289  2016/12/13 07:31:21  mmuddukrishna
// MDAP-3189: Fix for the defect MDAP-3189
//
// Revision 1.288  2016/12/06 12:57:13  rpudi
// MDAP-3282 : Some values are not pasting in out of view port
//
// Revision 1.287  2016/11/30 08:35:38  rpudi
// MDAP-2751 : CLONE: D360: Measure name should Autofit in the Pivot
//
// Revision 1.286  2016/11/28 08:15:04  rpudi
// MDAP-2751 : CLONE: D360: Measure name should Autofit in the Pivot
//
// Revision 1.285  2016/11/28 05:29:56  rpudi
// MDAP-2751 : CLONE: D360: Measure name should Autofit in the Pivot
//
// Revision 1.284  2016/11/23 12:20:18  rpudi
// MDAP-3148 : Call getsegment for beyond view port and check editablity for paste : fixed issue for pasting empty values
//
// Revision 1.283  2016/11/22 16:19:32  rpudi
// MDAP-3212 : Copy Paste: Unable to paste value in same cell more than once.
//
// Revision 1.282  2016/11/21 09:46:18  rpudi
// MDAP-3148 : Call getsegment for beyond view port and check editablity for paste
//
// Revision 1.281  2016/11/08 17:06:21  rpudi
// MDAP-839 : Copy +Paste should support at Calc Engine and DMDAP
//
// Revision 1.280  2016/11/08 04:23:16  rpudi
// MDAP-839 : Copy +Paste should support at Calc Engine and DMDAP
//
// Revision 1.279  2016/11/07 05:12:26  rpudi
// MDAP-3122 : Clean up DHX customization from Pivot code
//
// Revision 1.278  2016/11/03 14:03:57  rpudi
// MDAP-3111 : Clear client-side cache and stop displaying pivot (or display empty pivot) when exception is thrown
//
// Revision 1.277  2016/11/02 08:06:06  rpudi
// MDAP-3122 : Clean up DHX customization from Pivot code,
// Removed override functions from datatable_debug.js those are available in dhtmlx.js.
//
// Revision 1.276  2016/10/21 05:01:12  rpudi
// MDAP-3062 : After drop3 adoption not able to see data in dhtmlx grids having dynamic loading when the same page as pivot in it.
//
// Revision 1.275  2016/10/19 14:56:25  rpudi
// MDAP-2898 : Unable to select any cells in pivot after exception for invalid values in a cell is cleared.
//
// Revision 1.274  2016/10/13 07:19:47  rpudi
// MDAP-2716 : Unable to select intersection cell after setting filter to dimensions.
//
// Revision 1.273  2016/10/07 05:50:37  rpudi
// MDAP-2955 : Exceptions Indicator which are out of view port are not cleared when clicked on clear exception button
//
// Revision 1.272  2016/09/28 13:42:00  rpudi
// MDAP-2692 : Support for data domains
//
// Revision 1.271  2016/09/28 08:36:20  rpudi
// MDAP-2692 : Support for data domains,
// Supporting TEXT Data type and SET Aggregation Type
//
// Revision 1.270  2016/09/27 09:24:37  rpudi
// MDAP-2692 : Support for data domains
//
// Revision 1.269  2016/09/25 17:47:40  rpudi
// MDAP-2692 : Support for data domains
//
// Revision 1.268  2016/09/23 10:17:05  rpudi
// MDAP-2692 : Support for data domains
//
// Revision 1.267  2016/09/13 13:14:04  rpudi
// MDAP-2626 : Lock indicators and editability
//
// Revision 1.266  2016/09/01 07:11:08  rpudi
// MDAP-2686 : Issue with applying temp lock with datatypes other than double type
//
// Revision 1.265  2016/08/24 11:26:45  rpudi
// MDAP-2686 : Issue with applying temp lock with datatypes other than double type
//
// Revision 1.264  2016/08/18 15:20:44  mmuddukrishna
// MDAP-2735-Unable to add comment for non aggr measures at total as level
//
// Revision 1.263  2016/08/11 11:31:31  rpelluri
// MDAP-2481 : Export data to Excel with D-MDAP ( negative number formatting based on user settings)
//
// Revision 1.262  2016/08/08 07:25:09  rpudi
// MDAP-2421 : Edited comment title is not displayed in Pivot
//
// Revision 1.261  2016/07/29 08:39:55  rpudi
// MDAP-2660 : MDAP Defect : Unable to save the comment after editing the comment
//
// Revision 1.260  2016/07/26 11:15:59  mmuddukrishna
// MDAP-2133-Jumpy scroll observed when scenario added as Dimension
//
// Revision 1.259  2016/07/26 09:31:30  rpudi
// MDAP-2636 : JS scripting performance improvement for UI
//
// Revision 1.258  2016/07/21 12:04:59  mmuddukrishna
// MDAP-2623-Applying temporary lock on a editable cell is shown black lock icon.
//
// Revision 1.257  2016/07/19 14:54:46  rpudi
// MDAP-2464 : Business Graph : Performance improvement for JSON data
//
// Revision 1.256  2016/07/19 12:17:10  cvully
// MDAP-2613: Incorporated the code review changes so that the default editor behavior is unchanged and internally send value as '0' when no physical lock value is set.
//
// Revision 1.255  2016/07/18 15:34:59  cvully
// MDAP-2613: NAN when physical lock is applied on total forecast without value when quick edit in ON
// MDAP-2614: Null pointer when physical lock is applied on total forecast without value when quick edit in OFF
//
// Revision 1.254  2016/07/14 06:26:44  rpudi
// MDAP-2500 : UI rendering/scrolling performance testing for 2016.1a.0.0
//
// Revision 1.253  2016/07/13 17:17:23  rpudi
// MDAP-2500 : UI rendering/scrolling performance testing for 2016.1a.0.0
//
// Revision 1.252  2016/06/28 14:26:27  mmuddukrishna
// MDAP-2592-CLONE: When trying to get the pivot grid to reload, the pivot grid code is crashing.
//
// Revision 1.251  2016/06/10 17:04:47  blivezey
// MDAP-2452 Range aggregators for Integer and Boolean data types
//
// Revision 1.249  2016/06/08 17:24:48  blivezey
// MDAP-2452 Range aggregators for Integer and Boolean data types
//
// Revision 1.248  2016/06/07 16:52:20  rpudi
// MDAP-2442 : D360 - Properties - 'Show' option for row and column facets is always displayed as checked/enabled
//
// Revision 1.247  2016/05/31 14:11:30  lkatzman
// Fix for mdap-2421
//
// Revision 1.246  2016/05/25 05:56:48  rpudi
// MDAP-2424 : Order of the dimensions is not same in the header and comment listing details
//
// Revision 1.245  2016/05/23 13:32:49  rpudi
// MDAP-2424 : Order of the dimensions is not same in the header and comment listing details
//
// Revision 1.244  2016/05/20 11:41:17  rpudi
// MDAP-2433 : cell value /Measure is getting protected when its variant measure value is not updated
//
// Revision 1.243  2016/05/20 10:34:07  rpudi
// get spinnerWaitDuration from pivotObject.config instead of pivotObject inside _feed call..
//
// Revision 1.242  2016/05/20 07:15:26  mmuddukrishna
// MDAP-2381-Support font color for Conditional formatting rule
//
// Revision 1.241  2016/05/19 09:19:19  rpudi
// MDAP-2405 : Edit and Delete buttons are not disabled instantly
//
// Revision 1.240  2016/05/18 14:21:22  rpudi
// Reading constants from pivot controller for business graphs
//
// Revision 1.239  2016/05/16 10:19:57  rpudi
// MDAP-2405 : Edit and Delete buttons are not disabled instantly
//
// Revision 1.238  2016/05/16 07:07:54  rpudi
// MDAP-2404 : Show comment dog ear based on show Parent and child comments toggle on Pivot grid
//
// Revision 1.237  2016/05/13 07:24:28  rpudi
// MDAP-2356 : Selected scenario is NOT reflecting in the business graph panel Under worksheet instance.
//
// Revision 1.236  2016/05/11 05:56:46  rpudi
// MDAP-1769 : D360 - On loading search, the very first cell in the pivot is coming up as editable
//
// Revision 1.235  2016/05/10 17:40:11  rpudi
// MDAP-1769 : D360 - On loading search, the very first cell in the pivot is coming up as editable
//
// Revision 1.234  2016/05/10 16:54:02  rpudi
// MDAP-1769 : D360 - On loading search, the very first cell in the pivot is coming up as editable
//
// Revision 1.233  2016/05/09 10:28:49  rpudi
// MDAP-2310 : Show comment dog ear should be configurable by app teams
//
// Revision 1.232  2016/05/04 14:25:36  rpudi
// MDAP-2310 : Show comment dog ear should be configurable by app teams
//
// Revision 1.231  2016/04/27 02:32:25  rpudi
// MDAP-2248 : Long polling for DMDAP, Now long polling enabled for all the request, If request is taking more time than polling time out then automatically the request will go under long polling enabled.
//
// Revision 1.230  2016/04/21 08:32:28  rpudi
// MDAP-2248 : Long polling for DMDAP
//
// Revision 1.229  2016/04/20 08:21:24  rpudi
// MDAP-2248 : Long polling for DMDAP
//
// Revision 1.228  2016/04/20 05:47:06  rpudi
// MDAP-2248 : Long polling for DMDAP
//
// Revision 1.227  2016/04/11 12:21:29  lkatzman
// Comment title performance improvement for mdap server environment
//
// Revision 1.226  2016/04/01 06:27:14  rpudi
// MDAP-2168 : Changes are not reflected on selected Business graph when values are edited in D360 grid
//
// Revision 1.225  2016/03/11 07:32:27  rpudi
// MDAP-1988 : UI changes to expand graph panel programatically
//
// Revision 1.224  2016/03/11 05:32:35  rpudi
// MDAP-1988 : UI changes to expand graph panel programatically
//
// Revision 1.223  2016/03/10 12:08:12  rpudi
// MDAP-2025 : copy data pop up is not displaying in chrome when copying huge data
//
// Revision 1.222  2016/03/10 08:44:54  rpudi
// MDAP-1959 : Default graph on launch of pivot
//
// Revision 1.221  2016/03/02 06:40:10  mmuddukrishna
// Added comments to code check ins.
//
// Revision 1.220  2016/02/29 11:14:08  mmuddukrishna
// MDAP-1895_Row Column selection is not working as expected
//
// Revision 1.219  2016/02/29 06:29:27  mmuddukrishna
// MDAP-1929: Provided hook to hideshowTotal
//
// Revision 1.218  2016/02/26 12:11:15  rpelluri
// MDAP-1900 : Port export to excel long polling and batching from 8.2 branch
//
// Revision 1.216  2016/02/25 05:01:37  mmuddukrishna
// MDAP-1929: Provided hook to hide showHideTotal
//
// Revision 1.215  2016/02/24 11:34:47  rpelluri
// MDAP-1910 : Fixed  "Cancel" button text for localization
//
// Revision 1.214  2016/02/24 10:04:27  rpelluri
// reverted back "Cancel" button text setting from locale as there is an issue
//
// Revision 1.213  2016/02/22 17:01:35  rpelluri
// MDAP-1910 : Removed hard coding for "Cancel" button in "showWaitCancelIndicator" dialog and reading from resource bundle
//
// Revision 1.212  2016/02/22 08:58:09  rpudi
// MDAP-1925 : When error out in getSegmentData, Exception is not propagating to UI.
//
// Revision 1.211  2016/02/10 18:42:57  blivezey
// MDAP-1709 - adding/removing the scenario dimension should not cause worksheet to be reloaded
//
// Revision 1.210  2016/02/04 11:02:30  rpudi
// Merging Graph and BusinessGraph, Now we can see only one Graph in Pivot.
//
// Revision 1.209  2016/01/29 09:22:28  rpudi
// MDAP-1779 : Popup a dialog when an exception is thrown
//
// Revision 1.208  2016/01/26 21:51:50  blivezey
// rename "LIVE" scenario to "Live"
//
// Revision 1.207  2016/01/26 16:49:16  blivezey
// rename "Base" scenario to "LIVE"
//
// Revision 1.206  2016/01/19 16:18:51  blivezey
// MDAP-1463 - Scenarios as a dimension
//
// Revision 1.205  2016/01/06 09:30:17  rpudi
// MDAP-1463 : Scenario Comparision - Scenarios as dimensions
//
// Revision 1.204  2016/01/05 22:31:35  blivezey
// Continued support for scenarios as a dimension in the pivot
//
// Revision 1.203  2016/01/05 00:20:42  blivezey
// Continued support for scenarios as a dimension in the pivot
//
// Revision 1.202  2016/01/04 05:23:01  rpudi
// sending multiple scenario names from client to server.
//
// Revision 1.201  2015/12/29 08:22:04  nvuppala
// MDAP-1725 : Conditional Formatting is not working with Platform Drop 6.
//
// Revision 1.200  2015/12/18 12:14:20  mmuddukrishna
// MDAP-1623-Code changes for "Ability to select a saved graph setting from graph UI using title and plot graph for the selected graph configuration"
//
// Revision 1.198  2015/12/16 05:46:59  rpudi
// MDAP-1721 : Measure is not hidden when measure check box is  unchecked in context  menu
//
// Revision 1.197  2015/12/15 10:34:32  rpudi
// MDAP-1622 : Save graph configuration.
//
// Revision 1.196  2015/12/09 04:51:12  rpudi
// MDAP-1641 : Dev : building layout for graph configuration to support measure and dimension levels drag drop
//
// Revision 1.195  2015/12/07 11:43:27  rpudi
// MDAP-1641 : Dev : building layout for graph configuration to support measure and dimension levels drag drop
//
// Revision 1.194  2015/11/25 04:29:42  nvuppala
// MDAP-1384 - The check box icon on the pivot for row/column selection is not consistent with the platform checkbox  - fixed styling issues
//
// Revision 1.193  2015/11/24 10:10:11  nvuppala
// MDAP-1384 - The check box icon on the pivot for row/column selection is not consistent with the platform checkbox  - fixed styling issues
//
// Revision 1.192  2015/11/24 08:49:56  nvuppala
// Fix implemented for MDAP-1509 : Seeing white space in Header of the Pivot.
//
// Revision 1.191  2015/11/23 06:41:07  nvuppala
// MDAP-1384 - The check box icon on the pivot for row/column selection is not consistent with the platform checkbox , MDAP-1607 CLONE: Partial selection check box is not shown in 9.0.1(working in 9.0 drop 5) -Added Review comments
//
// Revision 1.190  2015/11/20 08:14:21  nvuppala
// MDAP-1384 - The check box icon on the pivot for row/column selection is not consistent with the platform checkbox , MDAP-1607 CLONE: Partial selection check box is not shown in 9.0.1(working in 9.0 drop 5)
//
// Revision 1.189  2015/11/19 07:14:03  rpudi
// Removing ZeroClipboard.js file and references.
//
// Revision 1.188  2015/10/28 07:00:16  rpudi
// MDAP-1490 : Merge Import/Export changes to 9.1
//
// Revision 1.187  2015/09/06 06:55:34  mmuddukrishna
// MDAP-1206: Upgrade ExtJS6 Changes
//
// Revision 1.186  2015/09/02 20:07:57  blivezey
// Enhanced support for scenarios
//
// Revision 1.185  2015/08/17 19:36:27  blivezey
// Support for scenarios in PivotMDAP and JDAPivot
//
// Revision 1.184  2015/08/14 10:07:19  rpelluri
// Fixed MDAP- 1184 : Attribute values are not displaying in Legacy JDA Pivot application
// Made "attributeArea" default value as false
// For CalcEngine URL, enabled "attributeArea" and "attributeFilter"
//
// Revision 1.183  2015/08/11 14:30:14  rpelluri
//  Adding multiedit property to newValues in PasteCopiedContentRequest
//
// Revision 1.182  2015/08/06 10:13:00  rpelluri
// MDAP-1177 : selected cells selection is not disappearing when any selected cell member is expanded
//
// Revision 1.181  2015/08/06 06:46:36  rpelluri
// MDAP-100 - Flowcasting issue: Restrict swapping Time with other facets on PivotUI.
// Passing "swapWithFacetItems" param to "hideSwapFacet" hook
//
// Revision 1.180  2015/07/26 19:30:27  sweiss
// MDAP-1162: port changes from MDAP-Server-branch to tip
//
// Revision 1.179  2015/07/17 12:01:27  rpelluri
// long polling fix
//
// Revision 1.178  2015/07/09 10:22:25  mmuddukrishna
// Fix for performance issue with paste operation in IE when huge data is present.(MDAP-1125)
//
// Revision 1.177  2015/07/07 09:08:05  rpelluri
// MDAP-1137 : Port Copy & Paste feature to TIP (9.0.1)
//
// Revision 1.176  2015/06/30 07:12:11  rpelluri
// MDAP-1057 : CLONE: Long Polling enhancement: add extra parameter lag time on HTTP request with default value as 1 sec.
//
// Revision 1.175  2015/05/06 09:10:48  rpelluri
// MDAP-999 : CLONE: CAR : Navigation from one piece of pie to another and going to Page 2, the data from the first context is shown
//
// Revision 1.174  2015/05/05 13:35:38  rpelluri
// MDAP-999 : CLONE: CAR : Navigation from one piece of pie to another and going to Page 2, the data from the first context is shown
//
// Revision 1.173  2015/04/23 11:07:53  rpudi
// Fixing MDAP-954 Pivot Cell information (Ctrl + click on a cell) showing unnecessary details about dummy facets.
//
// Revision 1.172.2.1  2015/06/18 16:35:37  blivezey
// Separate calculate and commit
//
// Revision 1.172  2015/02/20 09:01:20  msamsudeen
// scrolling flickering issue
//
// Revision 1.171  2015/02/20 06:58:44  msamsudeen
// related to issue flickering on temp lock
//
// Revision 1.170  2015/02/19 14:27:38  msamsudeen
// Check-in to MDAP-636 story
//
// Revision 1.169  2015/02/17 09:04:51  mmuddukrishna
// Fixes for MDAP-794,MDAP-797,MDAP-798 issues.
//
// Revision 1.168  2015/02/16 09:54:13  mmuddukrishna
// Fix for MDAP-782: Editing cell not working as expected on partially visible cell in horizontal and vertical area.(into 9.0.0 version)
//
// Revision 1.167  2015/02/05 08:35:01  rpelluri
// MDAP-771 : Porting changes for total context-menu, backward compatibility fixes to 9.0
//
// Revision 1.166  2015/01/23 12:38:19  rpelluri
// MDAP-737 : CLONE: On mouse hovering tool tip is not displaying on last level members
//
// Revision 1.165  2015/01/22 11:58:57  rpelluri
// MDAP-737 : CLONE: On mouse hovering tool tip is not displaying on last level members
//
// Revision 1.164  2014/12/29 13:22:43  msamsudeen
// modification related to phantom js suggested by gabe
//
// Revision 1.163  2014/12/24 09:38:10  msamsudeen
// issue on misalignment during moving measure on top or side
//
// Revision 1.162  2014/12/24 09:06:03  msamsudeen
// Defect Fixed :MDAP-703
//
// Revision 1.161  2014/12/24 06:20:26  msamsudeen
// checking related to misalignment issue
//
// Revision 1.160  2014/12/23 10:57:30  msamsudeen
// scroll alignment issue
//
// Revision 1.159  2014/12/23 08:45:49  msamsudeen
// graph apply settings issue fixed and horizontal scroll issues
//
// Revision 1.158  2014/12/22 15:11:58  msamsudeen
// MDAP-655 story check-in and added configuration for attribute filter
//
// Revision 1.157  2014/12/18 13:28:10  rpelluri
// MDAP-464 : Merge CE branch to Tip
//
// Revision 1.31.2.91  2014/12/11 08:37:29  msamsudeen
// Defect Fixed:MDAP-682
//
// Revision 1.31.2.90  2014/12/10 11:56:24  rtadaka
// Issue fix for MDAP-633: if root element is total then return false so that user can see Ascending option at UI
//
// Revision 1.31.2.89  2014/12/09 09:49:26  msamsudeen
// Defect Fixed: MDAP 663
//
// Revision 1.31.2.88  2014/12/09 07:04:47  msamsudeen
// Defect Fixed - MDAP 671,683,684,685
//
// Revision 1.31.2.87  2014/12/05 09:16:23  msamsudeen
// Defect fixed MDAP-635
//
// Revision 1.31.2.86  2014/12/04 09:48:57  rpelluri
// MDAP:676: Fixed NPE
//
// Revision 1.31.2.85  2014/12/01 12:53:11  msamsudeen
// Defect Fixes MDAP 660, 669, paste is taking long time in ie related issue
//
// Revision 1.31.2.84  2014/11/28 10:49:25  rpelluri
// MDAP-662: CE branch: User should not perform another action when chars are entered into the cell
//
// Revision 1.31.2.83  2014/11/28 05:50:43  misong
// Restore some lost code that supports the editing of STRING type cell value
//
// Revision 1.31.2.82  2014/11/28 05:30:15  misong
// restore some lost code that supports the rendering and editing of RANGE type cell value
//
// Revision 1.31.2.81  2014/11/28 05:05:08  misong
// Merge from tip: restore the lost function to display cell value of DURATION type.
//
// Revision 1.31.2.80  2014/11/26 10:55:26  rpelluri
// MDAP-659: Measure value is not highlighted when measure is sorted
//
// Revision 1.31.2.79  2014/11/26 10:29:49  rpelluri
// MDAP-658: CE branch : Unable to hide any level members in Time dimension (time facet displaying in column)
//
// Revision 1.31.2.78  2014/11/26 08:55:36  rpelluri
// MDAP-657 : CE branch : Default cell selection is not displaying  when user selects any low level cell and clicks on drill up button.
//
// Revision 1.31.2.77  2014/11/21 07:05:26  msamsudeen
// Defect fixed Select a cell  with single click shows input (edit) box
//
// Revision 1.31.2.76  2014/11/20 11:58:18  rpelluri
// MDAP-650: CE Merge: merge Export to excel reference app code and delta from TIP for total nodes
//
// Revision 1.31.2.75  2014/11/19 13:24:40  msamsudeen
// updating code changes on ce from branch from tip
//
// Revision 1.31.2.74  2014/11/18 11:59:19  msamsudeen
// Merged UI code from tip ( added new folder datatable inside jda)
//
// Revision 1.31.2.73  2014/11/07 13:46:48  msamsudeen
// Merged code from Tip[ Includes story  MDAP-622,MDAP-627]
//
// Revision 1.31.2.72  2014/10/27 05:52:47  rpelluri
// Total node is not displaying when filter is removed
//
// Revision 1.31.2.71  2014/08/10 04:21:48  misong
// Allow application to customize the label text for the Total node
//
// Revision 1.31.2.70  2014/08/08 16:45:20  misong
// Allows the destroy() function to be called multiple times on the same cube.
//
// Revision 1.31.2.69  2014/08/05 10:48:22  msamsudeen
// defect Fixing MDAP-434 and MDAP-435
//
// Revision 1.31.2.68  2014/07/25 15:44:11  msamsudeen
// pivot UI side changes for filter
//
// Revision 1.31.2.67  2014/07/25 14:35:36  msamsudeen
// Backported code from tip
//
// Revision 1.31.2.66  2014/07/18 20:21:48  misong
// Allow the user to edit string type measure values
//
// Revision 1.31.2.65  2014/07/17 13:19:02  misong
// Support for the rendering and editing of double measure with RANGE aggregation type.
//
// Revision 1.31.2.64  2014/07/15 07:34:09  rtadaka
// MDAP-388:- Provide a control to enable/disable Totals at Context Menu for facet
//
// Revision 1.31.2.63  2014/07/15 01:51:44  gkohen
// Implement MDAP-409 - Application teams should have the ability to define on-the-fly menu items
//
// Revision 1.31.2.57  2014/07/08 12:50:10  angkumar
// Bug fix: Change in drop down value in attribute data throwing error in ie9 and ie10
//
// Revision 1.31.2.56  2014/07/08 12:27:59  angkumar
// An update to defect MDAP 329. Viewport request was not correct so entire attribute area was not getting refreshed.
//
// Revision 1.31.2.55  2014/07/07 11:52:57  angkumar
// Bug Fix:-MDAP 329 -After attribute value change, need to update entire pivot view
//
// Revision 1.31.2.54  2014/07/01 10:34:11  angkumar
// Modified the regular expression to select the correct node during expansion and collapsing of levels
//
// Revision 1.31.2.53  2014/07/01 07:05:57  angkumar
// Checked for some more conditions when expanding a facet more than 1 level
//
// Revision 1.31.2.52  2014/07/01 06:39:25  angkumar
// Fixed a bug in which expanding a facet more than 1 level was not working
//
// Revision 1.31.2.51  2014/06/30 10:27:06  angkumar
// Bug Fix (MDAP 242 ) Expanding Latin America automatically expands Central sales---Total Issue
//
// Revision 1.31.2.50  2014/06/30 09:17:16  angkumar
// Reverting back to previous version  1.31.2.47
//
// Revision 1.31.2.47  2014/06/27 12:38:17  angkumar
// Fixed a bug in which all facet is set to Total and only two measure are in view and removing one of the measure not showing any data. Reason: Segment Request was not happening.
//
// Revision 1.31.2.46  2014/06/26 14:58:48  angkumar
// Provided support for Optional Total Facet which was not working in ExpandPivotView Request
//
// Revision 1.31.2.45  2014/06/25 16:10:49  gkohen
// Make sure the scroll height is updated when expanding side members (related to NGR-2675)
//
// Revision 1.31.2.44  2014/06/20 20:46:29  gkohen
// Apply resize limitations - change #3.
//
// Revision 1.31.2.43  2014/06/20 20:07:58  gkohen
// Apply resize limitations - change #2.
//
// Revision 1.31.2.42  2014/06/20 19:17:14  gkohen
// Cleanup the reverting back to icons. Added comments to switch back to glyphs. Limit resize of the pivot to max available.
//
// Revision 1.31.2.41  2014/06/17 20:20:17  gkohen
// Follow-up with Pivot UI changes to support i18n for attribute values that are from data domain
//
// Revision 1.31.2.40  2014/06/17 19:32:57  gkohen
// Follow-up with Pivot UI changes to support i18n for attribute values that are from data domain
//
// Revision 1.31.2.39  2014/06/14 00:25:13  gkohen
// Resolve rendering issue reported on the line build + Pivot combo bug fixes
//
// Revision 1.31.2.38  2014/06/13 19:50:13  gkohen
// Correct an issue where having 3 or more facet on top was causing the pivot to hang.
// Add quick key navigation for selecting pivot type in the pivot sample page.
//
// Revision 1.31.2.37  2014/06/07 17:32:49  misong
// Bug fix: User can't edit a text measure with values from data domain
//
// Revision 1.31.2.36  2014/06/05 19:20:57  gkohen
// Resolve an issue with a leftover wait cursor.
//
// Revision 1.31.2.35  2014/06/05 16:19:18  gkohen
// Resolve an issue where special characters could not be rendered in pivot cells.
//
// Revision 1.31.2.33  2014/05/15 18:10:41  misong
// MDAP-295 Pivot cannot display language-specific special chars in column headers.
//
// Revision 1.31.2.32  2014/05/15 17:48:05  misong
// Show attributes defined at multiple levels as a single column in pivot.
//
// Revision 1.31.2.31  2014/05/09 13:59:35  gkohen
// Apply attributes styling to the pivot.
//
// Revision 1.31.2.30  2014/05/09 05:08:53  msamsudeen
// Defect Fixed
// 1. Added seperators for Attribute area
// 2. Removed Green border on selected cell
// 3. Selected cell on side measure is not higlighting during cell selection
// 4. Added Red Stroke to cell during invalid charaters entered
// 5. Fixing the width to 100% and changing box-sizing to border box  for  input/ combo to fit within the cell.
//
// Revision 1.31.2.29  2014/05/05 10:39:03  msamsudeen
// Defect fixed MDAP-271 - Attribute Width Calculation
// Defect fixed MDAP-268
//
// Revision 1.31.2.28  2014/04/21 13:20:09  angkumar
// Added configuration for optional facet Total
//
// Revision 1.31.2.27  2014/04/14 09:54:31  msamsudeen
// Modified getSelectedCellAxisPath. As it is not returning the selected axis path because of issue with selectedDiv.
//
// Revision 1.31.2.26  2014/04/11 12:10:14  msamsudeen
// Defect fixed related to rendering cell as combo box  not working on multi- dimension atttribute .This defect has been fixed
//
// Revision 1.31.2.25  2014/04/10 12:02:10  msamsudeen
// Support given for Rendering cell as combo box.
// 1. Added Render type as combo for cell data info
// 2. Sending new request  when cell has render property added to cell data
// 3. Updating selected value by sending update Facts Request
//
// Revision 1.31.2.24  2014/04/08 14:14:21  gkohen
// New DCS 1.0 SASS branding
//
// Revision 1.31.2.23  2014/04/04 19:27:08  gkohen
// Pivot configuration was not respecting application config. Identified performance issue.
//
// Revision 1.31.2.22  2014/04/04 15:27:18  gkohen
// Add extra verification the the OnResize is not calling the pivot before it's initialized.
//
// Revision 1.31.2.21  2014/04/04 00:58:02  gkohen
// 1. Remove need to resize pivot after error.
// 2. Show error DOM element regardless if the pivot is showing.
// 3. Delegate ExtJS onDestroy to the pivot destroy.
// 4. Remove console.log in favor to pivotlog.
//
// Revision 1.31.2.20  2014/04/01 09:46:18  angkumar
// MDAP-176 : Provided the support for resizng attribute area
//
// Revision 1.31.2.19  2014/03/27 13:52:22  msamsudeen
// Fixed Horizontal scrolling issue setting scroll left value inside focused cell
//
// Revision 1.31.2.18  2014/03/27 13:30:30  msamsudeen
// Added separate function to get selected cell axis path  and view segment from pivot js
//
// Revision 1.31.2.17  2014/03/21 12:34:35  msamsudeen
// Measure on side and editing a cell shows error on browser console. This issue (related to rendering attribute area )has been fixed
//
// Revision 1.31.2.16  2014/03/17 22:59:28  gkohen
// Correctly report missing localized labels in the console.
//
// Revision 1.31.2.15  2014/03/17 05:17:40  msamsudeen
// Defect Fix MDAP 178,179
// 1. MDAP-178 -unable to increase the second attribute column  dragging towards right
// 2.MDAP-179 -Measure values for the first column are not displaying.
//
// Revision 1.31.2.14  2014/03/13 22:26:23  misong
// Temporary fix for a bug in _render_attribute_area that prevents the user from scrolling the pivot vertically.
//
// Revision 1.31.2.13  2014/03/13 10:14:00  msamsudeen
// 1.Added Resizing handler to attribute column.
// 2.Modified check_rendered_col to have different types of renderers like data,sidefacet and attribute
// 3.Fixed issues related to css on attribute columns
//
// Revision 1.31.2.12  2014/02/20 14:43:36  msamsudeen
// Issue fixed for resizing height not changing for attribute empty header on column. Now removed height added &nbsp; to td element
//
// Revision 1.31.2.11  2014/02/20 13:21:21  msamsudeen
// Issue fixed Empty grid showing when swapping facet with attribute visible
//
// Revision 1.31.2.10  2014/02/19 10:04:18  msamsudeen
// 1.Server side support for Member Attribute on column
// 2.Scrolling support for Attribute area on Pivot UI
//
// Revision 1.31.2.9  2014/02/14 15:08:26  msamsudeen
// support for member attribute on column. Pivot UI Changes
//
// Revision 1.31.2.8  2014/02/13 03:03:34  gkohen
// Set initial areas for independent scrolling. Preparation for pivot attributes presentation.
//
// Revision 1.1.2.1  2014/02/10 22:22:29  gkohen
// Hold a CVS backup.
//
// Revision 1.31.2.7  2014/02/04 22:32:17  misong
// Merge from trunk up to tag Drop4-rel-8-1-0-0-0129_0555
//
// Revision 1.66  2014/01/29 10:26:00  msamsudeen
// Drop4 related Changes: Revert back rendering logic . Now it renders 3 time when cube load first time. If drill down happens then pivot renders 1 time instead of 3.
//
// Revision 1.65  2014/01/29 05:00:23  rpelluri
// Reverting back to Rev 1.63 to fix CSPA issue that they are not able to open pivot.
//
// Revision 1.63  2014/01/27 10:37:00  angkumar
// Not able to navigate to last column using right arrow key
//
// Revision 1.31.2.6  2014/01/25 03:05:35  misong
// - Change cell field from "protected" to "isProtected" to avoid potential conflicts with language-specific reserved keywords.
// - Show a protected and non-editable cell as non-editable.
//
// Revision 1.62  2014/01/24 15:11:01  gkohen
// Check for null node before expanding.
//
// Revision 1.61  2014/01/24 14:17:08  angkumar
// Bug fix-MDAP-46
//
// Revision 1.60  2014/01/24 14:08:12  msamsudeen
// Improving performance by removing render() function inside _triggerfullRendering.
//
// Revision 1.59  2014/01/23 10:22:21  msamsudeen
// Issue Fixed - MDAP-80
//
// Revision 1.58  2014/01/22 10:43:01  msamsudeen
// Fixed issue MDAP-84 defects raised by allocation workbench
//
// Revision 1.31.2.5  2014/01/22 03:33:35  misong
// Clean up API for Multi-Edit support
//
// Revision 1.31.2.4  2014/01/20 13:57:09  msamsudeen
// Calc Engine MultiEdit feature
//
// Revision 1.57  2014/01/21 15:57:51  msamsudeen
// checking isReloadable or not in Conditional Formatting code
//
// Revision 1.31.2.3  2014/01/20 02:46:18  msamsudeen
// UI support for calcEngine
//
// Revision 1.56  2014/01/17 11:27:24  angkumar
// Issues fixed- MDAP-63/DMD-8758, MDAP-64/DMD-8586, Black screen appears when exception is thrown from server side instead of showing the exception
//
// Revision 1.55  2014/01/14 08:56:23  msamsudeen
// Issue fixed MDAP-77. if one visible measure is available then that should be in disabled state not in enabled state during MeasureContext menu.
//
// Revision 1.54  2014/01/13 12:30:39  msamsudeen
// Support for conditonal Formatting on pivot UI
//
// Revision 1.31.2.2  2014/01/11 04:21:47  misong
// Merge from trunk up to tag Drop3-rel-8-1-0-0-1208_2100
//
// Revision 1.53  2014/01/09 09:06:23  msamsudeen
// added dynamicNavSelector
//
// Revision 1.52  2014/01/06 10:14:37  msamsudeen
// Defects Fixed MDAP-4 , MDAP-47
//  1. When a "Anchor" on a level is removed, measures text is getting overlapped with item/loc hierarchy for few seconds
//  2. Expand All is showing when comment accordion is in expand state.
//
// Revision 1.51  2014/01/02 15:42:41  angkumar
// Provided support for string boolean integer datatype
//
// Revision 1.50  2013/12/23 12:21:02  msamsudeen
// 1.Added destroy method  which will destroy pivot and its utilities like comment,graph.
// 2. Bug Fixes NGR-597,NGR-443 related to scrolling
// 3.Support given for hooks in comment.
//
// Revision 1.49  2013/12/13 05:44:14  msamsudeen
// Resolve an issue where when drilling down to a leaf level member, the gradient color is not respected on IE.
//
// Revision 1.31.2.1  2013/12/12 14:18:02  gkohen
// Resolve an issue where when drilling down to a leaf level member, the gradient color is not respected.
//
// Revision 1.48  2013/12/10 10:12:17  msamsudeen
// Added a method to clear selected cell  if available inside expand mode during collapse facet level.
//
// Revision 1.47  2013/12/06 06:27:06  msamsudeen
// added resize method to graph, comment. Whenever pivot resize method calls comment and graph resize also happen.
//
// Revision 1.46  2013/12/06 03:13:13  gkohen
// Make sure the ExtJS wrapper works properly with the resize method.
//
// Revision 1.45  2013/12/05 14:36:05  angkumar
// Displayd notification message while saving graph settings.
//
// Revision 1.44  2013/12/04 15:20:24  msamsudeen
// Find issues on graph while resizing pivot.
// removed calling graph resize method inside resize pivot. Using window window as earlier need to find better way of resizing after drop3.
//
// Revision 1.43  2013/12/04 14:38:05  msamsudeen
// Removed read only option for comment when context menu show comment is clicked which is workaround for show comment.
// Created resize method for  pivot accordion and pivot graph.Calling those method inside resizePivot. Earlier we are using window resize now it is removed.
//
// Revision 1.42  2013/12/04 14:20:24  gkohen
// Make sure tooltips do not show up in the top left after drilling down and they track the mouse movement. Also handled an odd NPE.
//
// Revision 1.41  2013/12/04 13:24:06  gkohen
// 1. Resolve DMD-6037 - Values are shown at upper level cells for the values changed at the physical level cells.
// 2. Automatically select a cell that as been right-clicked, similar to Excel.
//
// Revision 1.40  2013/12/04 08:39:22  msamsudeen
// Make comment accordion as read only when context menu show comment is clicked.
// Fixed issue showing right axis max and min value during data plot in graph
//
// Revision 1.39  2013/12/04 07:02:21  angkumar
// Code Cleanup for sending request for saving graph settings
//
// Revision 1.38  2013/12/02 23:15:14  misong
// Added callback handler for saving graph settings.
//
// Revision 1.37  2013/12/02 10:44:41  rpelluri
// Save graph settings
// 1. Added new method in CubeViewI for save graph settings
// 2.  New Action/Request/Response for save graph setting
// reverted pivotNodeI changes as we do not need that for graph settings.
// 3.  clean up to use CubeViewI instead of BaseCubeView object for getGraphData request
//
// Revision 1.36  2013/11/29 14:18:11  msamsudeen
// Moved to FusionChart code to pivotGraph Widget.
// Added FusionChart  JQuery Plugin
// Support given for application team to modify chart properties
//
// Revision 1.35  2013/11/28 10:36:10  rpelluri
// Saving graph settings
//
// Revision 1.34  2013/11/27 10:20:50  rpelluri
// Moving getGraphData method to CubeViewI
//
// Revision 1.33  2013/11/27 07:27:49  msamsudeen
// 1.Changes related to showing filtered level name on intersection for comment & graph.
// 2.Fixed issue  when changing cube definition graph settings value are refreshed it should refresh.
//
// Revision 1.32  2013/11/20 13:59:19  msamsudeen
//    1.Moved  Graph , Comment UI Plugin to Widget Factory.
//  2.Graph UI changes
//
// Revision 1.31  2013/11/11 13:13:52  gkohen
// Resolve an issue where an exception is through on collapse.
//
// Revision 1.30  2013/11/11 02:31:48  gkohen
// Resolve initial rendering issue where not all the rows where shown on an initial large row set (>400)
//
// Revision 1.29  2013/11/08 06:13:22  gkohen
// Resolve flyout overlapping pivot and pivot resizing as well as zoom issues.
//
// Revision 1.28  2013/11/07 08:36:12  msamsudeen
// Issue Fixed (Unable to see measure value when moving facets from row to column).
//
// Revision 1.27  2013/11/06 20:46:29  gkohen
// Apply padding to allow for flyouts flaps.
//
// Revision 1.26  2013/11/06 13:20:35  misong
// ClearLocks cmd was failing due to problem with generic request.
//
// Revision 1.25  2013/11/06 11:55:55  gkohen
// Restore pivot editor's error notification capabilities.
//
// Revision 1.24  2013/11/04 15:47:35  misong
// Make the gradient background work for facet names with dash '-' characters in it.
//
// Revision 1.23  2013/11/04 03:58:36  misong
// Shorten the key for comment and comment ID in CellDataInfo.
//
// Revision 1.22  2013/11/04 02:57:34  misong
// Make sure the cell value is no-cell or no-value when needed even if the value type is not double.
//
// Revision 1.21  2013/11/01 22:40:08  gkohen
// Refactoring to allow PivotMDAP UI function in all reference implementation & SCPO
//
// Revision 1.20  2013/11/01 02:00:39  gkohen
// Resolve resizing and image indicator loading.
//
// Revision 1.19  2013/10/31 23:08:51  misong
// Address problems found when integrate with SCPO applications.
//
// Revision 1.18  2013/10/30 13:39:59  msamsudeen
// moved user field  inside  pivotutil.comment.options.
//
// Revision 1.17  2013/10/29 17:58:14  gkohen
// 1. Add ExtJS4 pivot wrapper.
// 2. Move the Comment/Graph initialization into the pivot from the global scope.
// 3. Add configuration object initialization mechanism to the pivot for overriding basic app behavior upon instantiation.
// 4. Allow turn comments/charts when initializing the pivot using enabledCharts and enabledComments configuration flags.
// 5. Automatically enable/disable "Show comments" menu item when comments are enabled disabled.
//
// More changes need to be done to the graph and comments plug-ins to make sure that they do not contaminate the global scope and can be applied to multiple elements on the document.
//
// Revision 1.16  2013/10/28 20:54:51  misong
// Fix the inconsistency in the order for displaying comment cell position.
//
// Revision 1.15  2013/10/27 17:27:29  msamsudeen
// added if condition to check comment enable/disable
//
// Revision 1.14  2013/10/25 20:04:39  misong
// Support non-numeric facet ID.
//
// Revision 1.13  2013/10/25 13:18:23  gkohen
// Remove limitation of numeric IDs to measures.
//
// Revision 1.12  2013/10/24 16:21:28  msamsudeen
// Changes Related to comment and graph UI
//  * Modified Look and Feel for Comment and Graph,
//
// Revision 1.11  2013/10/24 14:06:53  gkohen
// Fix facet gradient resolution in Firefox.
//
// Revision 1.10  2013/10/24 11:40:03  gkohen
// Resolve wrong gradient rendering when ESC key is pressed on cell.
//
// Revision 1.9  2013/10/22 23:11:47  gkohen
// Re-factor cell element search and fix pivot restore issue found by Mingjian.
//
// Revision 1.8  2013/10/22 10:38:49  misong
// Clean up comment code to get ready for refactoring.
//
// Revision 1.7  2013/10/21 15:39:55  gkohen
// Set the location of the web pivot files.
//
// Revision 1.5  2013/10/19 19:39:58  gkohen
// Add correct letter case directory.
//
// Revision 1.3  2013/10/19 17:25:00  gkohen
// Move back pivot to the original location.
//
// Revision 1.1  2013/10/19 16:07:51  gkohen
// Moving pivot common to the correct location.
//
// Revision 1.1  2013/10/19 15:44:05  gkohen
// Re-commit the web content
//
// Revision 1.2  2013/10/16 18:39:39  misong
// Merge in the latest from JDAPivot for Drop 2.
//
// Revision 1.21  2013/10/16 18:30:15  gkohen
// Adjust comment field widths to handle fluid layout/propagate addition of comments.
//
// Revision 1.20  2013/10/16 00:31:01  gkohen
// Merge the Image Pivot and Charts/Comments UI source  bases.
//
// Revision 1.24  2013/10/15 00:00:12  gkohen
// Resolve image rendering issues. As well as enabling Image pivot on IE.
//
// Revision 1.22  2013/10/12 15:01:48  gkohen
// Remove logging messages.
//
// Revision 1.21  2013/10/12 14:59:25  gkohen
// Resolve image scrolling issues.
//
// Revision 1.20  2013/10/12 06:01:53  gkohen
// Interim checking regarding some scrolling issues.
//
// Revision 1.19  2013/10/11 19:47:17  gkohen
// Activate additional properties in the lightbox and make sure the item details are changed as the user changes an item.
//
// Revision 1.18  2013/10/11 15:45:16  misong
// Fix the problem with moving facets to opposite axis.
//
// Revision 1.17  2013/10/10 21:57:40  gkohen
// Make sure the lightbox comes up only once a response from the server is received.
//
// Revision 1.16  2013/10/10 19:41:58  gkohen
// Add trigger calling for calling getCellDetails from the UI.
//
// Revision 1.15  2013/10/09 17:24:06  gkohen
// Remove callback delay bringing up the light box.
//
// Revision 1.14  2013/10/09 14:58:21  gkohen
// Add loading sync.
//
// Revision 1.73  2013/10/07 13:46:19  gkohen
// Apply additional cells rendering logic.
//
// Revision 1.72  2013/09/26 14:46:47  gkohen
// Add support to cell templating.
//
// Revision 1.71  2013/09/25 15:30:03  gkohen
// Remove double cell rendering
//
// Revision 1.70  2013/08/19 22:09:07  misong
// DEF790187: Measures Decimal Point definition is not honored in the worksheet
//
// Revision 1.69  2013/08/06 16:30:09  gkohen
// Resolve Demand DEF799604 - [Worksheet]: On hit of Esc button physical lock is getting applied.
//
// Revision 1.68  2013/08/06 09:36:01  gkohen
// Enable cell editors to parse according to SCPO settings.
//
// Revision 1.65  2013/07/23 14:52:24  gkohen
// Delegate application specific locale prefix.
// Revision 1.19  2013/10/11 13:37:47  msamsudeen
// added measure name on intersection for adding comment
//
// Revision 1.18  2013/10/11 05:28:53  msamsudeen
// added code for showing comment,graph when facet moved from row to column or column to row
//
// Revision 1.17  2013/10/10 10:34:55  msamsudeen
// Removed hardcoded values from graph setting and bring setting info from cube definition
//
// Revision 1.16  2013/10/10 08:01:25  bpotturi
// Added Graph related code
//
// Revision 1.15  2013/10/09 13:57:17  msamsudeen
// support given for view intersection name while adding comment in pivot accordion
//
// Revision 1.14  2013/10/09 07:54:40  msamsudeen
// Moved  pivot accordion and pivot graph related files  to  pivot /jda folder
//
// Revision 1.13  2013/10/07 09:10:02  angkumar
// Modify ajax request sequense for comments and fixes issues related to tooltip while hovering on dogear
//
// Revision 1.12  2013/10/01 11:53:54  msamsudeen
// code clean up
//
// Revision 1.11  2013/10/01 09:26:43  msamsudeen
// added date to pivot accordion and support given for global configuration
//
// Revision 1.10  2013/09/30 14:34:33  angkumar
// Added support to extruder flyout and provide functionality of dynamic request of comments while hovering on dogear
//
// Revision 1.9  2013/09/25 09:35:40  msamsudeen
// Added Event Handling to Pivot Accordion. Changes related to pivot accordion event handling
//
// Revision 1.8  2013/09/16 10:35:14  angkumar
// *** empty log message ***
//
// Revision 1.6  2013/09/15 04:11:57  misong
// Merge in recent changes to the Pivot UI on SCPO TIP
//
// Revision 1.5  2013/09/13 13:24:07  angkumar
// *** empty log message ***
//
// Revision 1.4  2013/09/13 10:20:16  angkumar
// *** empty log message ***
//
// Revision 1.3  2013/09/13 05:11:31  angkumar
// *** empty log message ***
//
// Revision 1.2  2013/09/12 11:30:42  angkumar
// *** empty log message ***
//
// Revision 1.64  2013/07/19 20:41:58  gkohen
// Re-enable column resizers.
//
// Revision 1.63  2013/07/19 18:25:39  gkohen
// Decouple command packages and localized strings from the pivot.
//
// Revision 1.62  2013/07/16 15:55:24  gkohen
// 1. Force the pivot classes to be in scope before any instantiation of it is requested.
// 2. Fix dynamic navigation menu items issue (DEF798347).
//
// Revision 1.61  2013/07/15 22:00:04  gkohen
// Apply SCPO Epsilon(TRIVQTY) to value calculation consideration.
//
// Revision 1.60  2013/07/12 20:05:12  gkohen
// Resolve issue  DEF797884 - [Worksheet]: Subcategory level value is displayed two times after pivot refresh.
//
// Revision 1.59  2013/07/11 16:33:51  gkohen
// Pivot now respecting SCPO numeric formatting.
//
// Revision 1.58  2013/07/09 23:23:25  gkohen
// [Worksheet]: Separator in User preferences -> General Settings is not respected in worksheet
//
// Revision 1.57  2013/07/09 20:27:43  gkohen
// Resolve DEF797727 - WorkSheet : Styling Issue (Small Empty Box) While Showing Validation Messages For WorksheetDFUSearchLimit & Missing Hierarchy Level Names  In Pivot.
//
// Revision 1.56  2013/07/09 19:17:14  gkohen
// Resolve DEF797727 - WorkSheet : Styling Issue (Small Empty Box) While Showing Validation Messages For WorksheetDFUSearchLimit & Missing Hierarchy Level Names  In Pivot.
//
// Revision 1.55  2013/07/08 23:33:05  gkohen
// Preserve resized column sizes upon view restore.
//
// Revision 1.54  2013/07/03 20:45:42  misong
// DEF797495:  Pivot is not loading after we perform a copy operation
//
// Revision 1.53  2013/07/03 12:38:47  gkohen
// Decouple the last WebWork VPMessage to the a fired event handled by demand specific logic.
//
// Revision 1.52  2013/06/26 18:27:25  gkohen
// Resolve anchoring issues resulting from bug #DEF796780 - Error while performing operations in pivot.
//
// Revision 1.51  2013/06/25 22:24:39  misong
// DEF796780:  Error while performing operations in pivot
//
// Revision 1.50  2013/06/25 19:09:41  gkohen
// Add utility method to get filters/anchors
//
// Revision 1.49  2013/06/25 16:54:41  gkohen
// Decouple Demand worksheet logic from the Pivot.
//
// Revision 1.48  2013/06/20 18:08:58  gkohen
// Pivot Init decoupling and sort issue resolution.
//
// Revision 1.22.2.3.2.11.2.30  2013/06/12 13:57:20  gkohen
// Allow restore if just the measures have been altered.
//
// Revision 1.47  2013/06/12 13:48:14  gkohen
// Allow restore if just the measures have been altered.
//
// Revision 1.46  2013/06/12 12:17:26  gkohen
// Resolve Demand DEF796195 - [Worksheet]: Un-Expected Error when we hide level in time dimension.
// In addition prepare logic for future copy/paste operations.
//
// Revision 1.45  2013/06/03 13:49:28  rgundu
// DEF795008:   [Fulfillment] Getting expand to size option when item is already expanded till the lowest level i.e. Size when done right click.And when we click on the Size Pivot is getting hanged.
//
// Revision 1.44  2013/05/30 19:15:50  gkohen
// Allow live update of the highlighting mode.
//
// Revision 1.43  2013/05/30 15:44:10  gkohen
// Resolve an issue re-initializing the pivot which was triggering expansion restoration.
//
// Revision 1.42  2013/05/30 11:19:13  gkohen
// Resolve init boundary condition.
//
// Revision 1.22.2.3.2.11.2.26  2013/05/30 11:17:54  gkohen
// Resolve init boundary condition.
//
// Revision 1.22.2.3.2.11.2.25  2013/05/30 01:49:06  gkohen
// Maintain highlighted changed cells.
//
// Revision 1.41  2013/05/30 01:41:05  gkohen
// Maintain highlighted changed cells.
//
// Revision 1.40  2013/05/29 19:27:40  gkohen
// Make sure changed cells highlight stick around until subsequent edits.
//
// Revision 1.39  2013/05/29 17:29:22  gkohen
// Full implementation of expansion restoration a view re-focus.
//
// Revision 1.38  2013/05/28 14:45:49  gkohen
// Resolve DEF794239 - No data pulled in worksheet if no I/O levels are mentioned in UDM.
// The expansion restoration was not properly working when removing/adding measures from the configuration dialog.
//
// Revision 1.22.2.3.2.11.2.22  2013/05/28 14:44:08  gkohen
// Resolve DEF794239 - No data pulled in worksheet if no I/O levels are mentioned in UDM.
// The expansion restoration was not properly working when removing/adding measures from the configuration dialog.
//
// Revision 1.22.2.3.2.11.2.21 2013/05/24 21:24:26 gkohen
// 1. Expansion restoration in the case of sort and moving/hiding measures.
// 2. Resolve Demand DEF795011 - RE: Getting Expand to option in the right click when done at Size level.
// 3. Resolve Demand DEF795010 - Sub-options are not in line with the right click parent options in Pivot.
//
// Revision 1.37 2013/05/24 21:12:12 gkohen
// 1. Expansion restoration in the case of sort and moving/hiding measures.
// 2. Resolve Demand DEF795011 - RE: Getting Expand to option in the right click when done at Size level.
// 3. Resolve Demand DEF795010 - Sub-options are not in line with the right click parent options in Pivot.
//
// Revision 1.35 2013/05/22 21:24:13 gkohen
// Interim commit of expansion restoration logic.
//
// Revision 1.34 2013/05/22 13:26:31 rgundu
// Fixed issue DEF795008: Getting expand to size option when item is already expanded till the lowest level i.e. Size
// when done right click.And when we click on the Size Pivot is getting hanged.
//
// Revision 1.33 2013/05/15 17:46:12 gkohen
// Concentrate all imports in include jsp
//
// Revision 1.32 2013/05/15 16:51:33 gkohen
// Add indication to multi-sort.
//
// Revision 1.31 2013/05/15 15:25:18 gkohen
// Resolve Demand DEF794607 - When submitting an erroneous value the warning icon is obstructed by the text field.
//
// Revision 1.30 2013/05/13 16:28:08 gkohen
// 1. Resolve :
// a. DEF794400: [Demand] [Worksheet]: Expand and Collapse icons are displayed in pivot
// b. Right most facet is not highlighted when a cell is selected in pivot
// 2. Decouple callbacks to the WebWORKS handlers and use event subscribers instead on the application side.
//
// Revision 1.29 2013/05/13 15:53:58 gkohen
// 1. Resolve :
// a. DEF794400: [Demand] [Worksheet]: Expand and Collapse icons are displayed in pivot
// b. Right most facet is not highlighted when a cell is selected in pivot
// 2. Decouple callbacks to the WebWORKS handlers and use event subscribers instead on the application side.
//
// Revision 1.28 2013/05/09 18:41:50 gkohen
// CSS and 3rd party libraries dynamic loading.
//
// Revision 1.27 2013/05/08 15:32:06 gkohen
// 1. Resolve a value update issue where setting a lock on the left most cell after scrolling back and forth was
// resulting in an exception.
// 2. Resolve pivot and DHX CSS errors.
// 3. Code cleanup.
//
// Revision 1.26 2013/05/08 01:30:27 gkohen
// Add support to clear locks action.
//
// Revision 1.25 2013/05/03 19:35:04 gkohen
// Potentially resolve bug #DEF793114.
//
// Revision 1.22.2.3.2.11.2.16 2013/05/03 19:33:19 gkohen
// Potentially resolve bug #DEF793114.
//
// Revision 1.22.2.3.2.11.2.15 2013/05/03 16:00:39 gkohen
// Start of decoupling of pivot from implementing apps.
//
// Revision 1.24 2013/05/03 15:59:01 gkohen
// Start of decoupling of pivot from implementing apps.
//
// Revision 1.23 2013/05/01 20:16:08 gkohen
// Merge common pivot code changes from Demand QH.
//
// Revision 1.22.2.3.2.11.2.14 2013/04/30 20:18:25 gkohen
// Interim check-in for view restoration feature.
//
// Revision 1.22.2.3.2.11.2.13 2013/04/30 18:39:40 gkohen
// Resolve DEF793763: [Demand] Application specific menu items where not filtered by the menu black list.
//
// Revision 1.22.2.3.2.11.2.12 2013/04/29 18:25:24 gkohen
// 1. Make sure resizing the top facet name cells is getting the right size.
// 2. Turn off debug messages by default.
//
// Revision 1.22.2.3.2.11.2.11 2013/04/29 17:17:26 gkohen
// Resolve DEF788323: [Demand] [Worksheet]: Pivot is not properly displayed when the browser zoom is increased /
// decreased.
//
// Revision 1.22.2.3.2.11.2.10 2013/04/25 20:41:53 gkohen
// Properly adjust column sizes.
//
// Revision 1.22.2.3.2.11.2.9 2013/04/25 18:54:46 gkohen
// Resolve demand issue - DEF793503: [Demand] Lock items in context menu are no available. Add fix to D&D.
//
// Revision 1.22.2.3.2.11.2.8 2013/04/25 18:50:37 gkohen
// Resolve demand issue - DEF793503: [Demand] Lock items in context menu are no available.
//
// Revision 1.22.2.3.2.11.2.7 2013/04/24 21:31:46 gkohen
// Add missing re-attachment of HTML DOM elements after scrolling.
//
// Revision 1.22.2.3.2.11.2.6 2013/04/24 19:38:37 gkohen
// 1. Measure only headers were not properly working with sorting.
// 2. Pivot was accessing global localized string instead of it's own contained member.
// 3. Pluggable actions were not properly executed in the pivot.
// 4. Customized black-listed items were not considered in the pivot.
//
// Revision 1.22.2.3.2.11.2.5 2013/04/23 19:38:34 gkohen
// Resolve Demand Issue - DEF793303: [Demand] Large number of columns slowing down pivot considerably.
//
// Revision 1.22.2.3.2.11.2.4 2013/04/23 16:28:12 gkohen
// 1. Make sure that polling timeout is respected in all requests.
// 2. Remove global function 'loadTable' in favor of module patterned _pns.pivot
//
// Revision 1.22.2.3.2.11.2.3 2013/04/22 21:57:21 gkohen
// Addition to DEF793113. Align headers properly.
//
// Revision 1.22.2.3.2.11.2.2 2013/04/22 20:50:28 gkohen
// 1. Resolve column resizing and border collapsing issue.
// 2. Resolve Demand Issue - DEF793113: [Demand] [Worksheet]: Done button is not highlighted when the invalid illegal
// character is removed.
//
// Revision 1.22.2.3.2.11.2.1 2013/04/19 13:39:21 gkohen
// Multiple Sort change. Pivot action refactoring.
//
// Revision 1.22.2.3.2.11 2013/03/23 01:13:47 gkohen
// 1. Make sure that some server errors are properly logged in the console.
// 2. Make sure object only errors are handled gracefully by the logger.
//
// Revision 1.22.2.3.2.10 2013/03/20 22:35:48 gkohen
// Make sure data pre-fetching is set properly.
//
// Revision 1.22.2.3.2.9 2013/03/20 20:20:22 gkohen
// Include additional off screen rendering.
//
// Revision 1.22.2.3.2.8 2013/03/20 19:32:28 gkohen
// Optimize pivot rendering and memory usage by using off browser DOM composition.
//
// Revision 1.22.2.3.2.7 2013/03/18 15:20:38 gkohen
// Fix some issues related to measure drag and drop I?ve noticed on Friday?s demo (Dragging from side to top got the
// dragged measure obstructed by the header members).
//
// Revision 1.22.2.3.2.6 2013/03/18 14:20:39 gkohen
// The pivot is now handling screen size changes dynamically by using HTML5 media query which dynamically sets font
// sizes for screen in various resolutions.
// Previously we had to put a polling hook to try and test for the window size which was more resource hungry.
//
// Revision 1.22.2.3.2.5 2013/03/15 16:59:16 gkohen
// Follow-up render bug check-in.
//
// Revision 1.22.2.3.2.4 2013/03/15 16:55:46 gkohen
// Resolve Demand DEF790688 - Having a measures on top only pivot breaks rendering. Also make the transition of facets
// to/from axes less "choppy"
//
// Revision 1.22.2.3.2.3 2013/03/15 00:49:42 gkohen
// Resolve Defect DEF782402(Commit icon is not disabled in tab2 when commit is in progress in tab in worksheet).
//
// Revision 1.22.2.3.2.2 2013/03/14 15:39:35 gkohen
// Display commit error/canceling notification in the UI.
//
// Revision 1.22.2.3.2.1 2013/03/13 09:05:16 smendu
// Moved the changes from rel-8-0-0-0-DEMAND_WORKSHEET-branch to this branch.
//
// Revision 1.22.2.3 2013/03/08 16:23:13 gkohen
// Resolve Demand Issue - DEF786026: [Demand] Worksheet: Resize handle on top axis only covers top half of cell.
//
// Revision 1.22.2.2 2013/03/06 23:30:24 gkohen
// Resolve issue Demand Issue - DEF784865: [Demand] Scrolling makes Column headers and values out of synch if cell is
// selected and scrolled off page.
//
// Revision 1.22.2.1 2013/03/04 21:31:14 gkohen
// Resolve an issue where the warning icon is hidden when needed (Change a parent on locked children or bad input).
//
// Revision 1.22 2013/02/27 22:59:50 gkohen
// Apply a fix to issues of disappearing expansion icons.
//
// Revision 1.21 2013/02/27 18:13:32 gkohen
// Fix for DEF787380: Properties label in Worksheet->Properties screen is displayed in English with non-English locale
//
// Revision 1.20 2013/02/27 00:41:50 gkohen
// Fix for DEF789265: Save session input cannot handle punctuation in name, stalls indefinitely
//
// Revision 1.19 2013/02/26 19:36:12 gkohen
// Current period cells are no highlighting when changed.
//
// Revision 1.18 2013/02/26 18:41:11 gkohen
// Resolve initial rendering and gradient levels issues.
//
// Revision 1.17 2013/02/26 14:59:35 gkohen
// Make sure we use the new throttle function.
//
// Revision 1.16 2013/02/26 14:53:25 gkohen
// Fix max/min height for the tooltips and fix slow throttling for X-Scrolling on IE.
//
// Revision 1.15 2013/02/26 11:42:50 gkohen
// Resolve issue 788769. Make sure the coordinates tooltip shows on Ctrl-Click. In addition an issue where the cell
// warning icon was not properly showing in the FF workbench.
//
// Revision 1.14 2013/02/13 13:41:29 rgundu
// Added extra attribute filterPathDesc to the filterAttribute
//
// Revision 1.13 2013/02/13 02:26:54 gkohen
// Resolve issue with rendering expanded top facets.
//
// Revision 1.12 2013/02/12 20:04:21 gkohen
// Use "Top Level" localized form.
//
// Revision 1.11 2013/02/12 19:46:23 gkohen
// Resolve an issue preventing filtering on a member of the remaining top facet if measures are on top.
//
// Revision 1.10 2013/02/12 14:50:31 gkohen
// Enrich the pivot filter object.
//
// Revision 1.9 2013/02/12 14:25:21 gkohen
// Add support for measure tool-tip rendering. More plug-in rendering capability to be there post 8.0
//
// Revision 1.8 2013/02/12 12:54:30 gkohen
// Add a pivot method to retrieve the list of currently assign anchor objects(AKA filters).
//
// Revision 1.7 2013/02/11 20:24:06 gkohen
// Resolve Demand Issue - DEF784865: [Demand] Scrolling makes Column headers and values out of synch if cell is selected
// and scrolled off page.
//
// Revision 1.6 2013/02/11 17:42:52 gkohen
// Resolve an issue where the pre-edit hook resulted in a JS error on editing when filtering was applied.
//
// Revision 1.5 2013/02/11 17:00:04 gkohen
// Resolve a issue where hiding a facet level from the pivot and then right clicking a member did not show the context
// menu.
//
// Revision 1.4 2013/02/11 16:14:04 gkohen
// Handle localized values.
//
// Revision 1.3 2013/02/11 14:21:14 gkohen
// Handling pivot freezing problems.
//
// Revision 1.2 2013/02/08 16:35:04 gkohen
// Commit new worksheet EAR structure -Part 2
//
// Revision 1.1 2013/02/08 16:25:19 gkohen
// Commit new worksheet EAR structure.
//
// Revision 1.1 2013/02/07 17:18:32 misong
// Get the pivot going again with files at common location.
//
// Revision 1.270 2013/02/06 20:33:49 gkohen
// Timestamp
//
// Revision 1.269 2013/02/06 17:53:08 gkohen
// 1. Resolve anchoring to a measures only facet
// 2. Old Jackson JAR removal.
//
// Revision 1.268 2013/02/06 16:23:14 gkohen
// Resolve scroll + collapse issue.
//
// Revision 1.267 2013/02/05 22:51:05 gkohen
// Correct an issue with the Y scroll.
//
// Revision 1.266 2013/02/05 20:37:46 gkohen
// Make sure the jQuery wrap function works correctly.
//
// Revision 1.265 2013/02/05 18:58:06 gkohen
// check if e.stopPropagation() is supported by the browser.
//
// Revision 1.264 2013/02/05 18:54:43 gkohen
// Make sure preventDefault is properly checked for IE.
//
// Revision 1.263 2013/02/05 18:47:05 gkohen
// Code Check-In: Resolve DEF786025: [Demand] Value not committed without hitting return in edited cell.
// We will also perform a validation and veto the action when we try to:
// 1. Expand
// 2. Collapse
// 3. Scroll
// 4. Commit
// 5. Save
//
// Revision 1.262 2013/02/05 15:20:59 gkohen
// 1. Apply progress tracking to the commit action(DEF786891 ).
// 2. Make sure top members show tool tip (DEF787049).
// 3. Make sure we properly response to property changes after using a prompted search (DEF786887)
// 4. Make sure you cannot expand/collapse if you are in the midst of editing an invalid value cell (Needs to be
// extended to other actions).
// 5. Apply minification scripts of vendor library (first step of moving UI to common area).
//
// Revision 1.261 2013/02/04 12:48:04 gkohen
// Resolve Demand Issue - DEF786026: [Demand] Worksheet: Resize handle on top axis only covers top half of cell.
//
// Revision 1.260 2013/02/01 01:59:10 gkohen
// Expand to level + Cosmetic changes
//
// Revision 1.259 2013/01/31 16:54:06 gkohen
// Resolve collapse rendering issue.
//
// Revision 1.258 2013/01/30 16:47:45 misong
// Replace lock/unlock button images.
//
// Revision 1.257 2013/01/30 01:45:52 gkohen
// Resolve DEF786028: [Demand] Error icons on all cells.
//
// Revision 1.256 2013/01/30 01:07:03 gkohen
// Make sure the tooltip does not linger on scroll.
//
// Revision 1.255 2013/01/29 22:59:50 gkohen
// Speed up facet swap.
//
// Revision 1.254 2013/01/29 20:15:25 gkohen
// Resolve issue DEF785986: [Demand] WS SORT: Dimension Member Not Highlighting With Bold & Italic Characters After Sort
// Applied In WorkSheet.
//
// Revision 1.253 2013/01/29 17:05:20 gkohen
// Code sync.
//
// Revision 1.252 2013/01/29 16:25:20 gkohen
// Correct selection highlight of gradient cells.
//
// Revision 1.251 2013/01/29 12:18:55 gkohen
// Interim check-in - rendering optimization.
//
// Revision 1.250 2013/01/29 01:59:27 gkohen
// Resolve issue where next level gradient CSS rule was not properly used in IE + Interim checkin of pivot render
// re-wiring.
//
// Revision 1.243 2013/01/25 19:19:51 misong
// DEF782828: WS Locks: Right Click Menu Option Showing Temporary Lock On Total Forecast.Aggr Cell Even Though Physical
// Lock Applied On Total Forecast:
//
// Revision 1.242 2013/01/24 21:05:46 gkohen
// Repair an issue where if you click on a facet member cell not on the label, the anchor menu item did not become
// visible.
//
// Revision 1.241 2013/01/24 20:48:05 gkohen
// Resolve logging infinite recursion in IE9 causing IE to crash.
// We shall now use the less powerful (Not recursively drill down) console.dir that will list 1 level in depth of the
// object. In extreme cases of diagnosis, the CSG team can remove the firebug lite import comment to enable firebug.
// This is crucial for serviceability.
//
// Revision 1.240 2013/01/23 19:58:08 gkohen
// 1. Correct Demand Issue - DEF785702: [Demand] WorkSheet : Hand Icon Not Showing When A User Placed Mouse On A Url
// Linked (Mouse Click) Icons In WorkSheet.
// 2. Correct double click when switching from one selected cell to another.
//
// Revision 1.239 2013/01/22 16:27:31 gkohen
// Apply resize and permission changes.
//
// Revision 1.238 2013/01/22 15:50:38 gkohen
// Make sure we properly resize when dragging the left size of the not defunct drop zone.
//
// Revision 1.237 2013/01/22 15:32:53 gkohen
// Revamp pivot column resizing. All columns are resizable. Resizing dragging is now smoother. Facet area resizing is
// more intuitive in resize calc.
//
// Revision 1.236 2013/01/21 20:42:01 gkohen
// Resolve S1 DEF783964 & DEF783711
//
// Revision 1.235 2013/01/21 16:03:33 gkohen
// Make sure we have a logic that assigns the correct text color to match the facet level background.
//
// Revision 1.234 2013/01/18 21:17:14 gkohen
// Add support to dynamic nav. current/current & children.
//
// Revision 1.233 2013/01/18 18:28:05 misong
// Refactor pivot broker code to common.
//
// Revision 1.232 2013/01/18 14:57:16 gkohen
// Resolve an issue where a cell was wrongly grouped if a node has the same name as the parent (In the last facet).
//
// Revision 1.231 2013/01/18 02:48:02 gkohen
// Remove the level depicting bullets.
//
// Revision 1.230 2013/01/18 02:30:48 gkohen
// Resolve rest of top collapse issue: Demo of gradient facet levels.
//
// Revision 1.229 2013/01/17 23:17:28 gkohen
// Correct previous issue with expanding top facets. First attemnt at color gradients.
//
// Revision 1.228 2013/01/17 19:14:51 gkohen
// Resolve issue DEF785182: Grid expansion and collapse is not working correctly.
//
// Revision 1.227 2013/01/16 19:08:21 gkohen
// Interim checkin for dyn-nav & gradient colors.
//
// Revision 1.226 2013/01/16 16:03:11 gkohen
// Demo feedback:
// 1. Make sure that the expand/collapse actions are clickable around the label area as well as the expansion/collapse
// triangle.
// 2. Indent leaf branches.
//
// Revision 1.225 2013/01/16 13:57:31 gkohen
// Add ability to blacklist individual pivot items.
//
// Revision 1.224 2013/01/15 20:27:01 gkohen
// Add context sensitive pivot invocation of dynamic navigation.
//
// Revision 1.223 2013/01/15 15:26:25 gkohen
// Complete sorting feature:
// 1. Sorted columns, measures and rows will be styled differently (right now its italic,bold). The styling will be
// applied even to spanning parent column headers.
// 2. The sort status bar will allow removing the sort as well as flipping the sort order.
// 3. Align sort status bar elements.
//
// Revision 1.221 2013/01/10 20:08:41 gkohen
// Fix an issue where if a hierarchy level name (not description) has an underscore, the show/hide menu checkbox would
// fail.
//
// Revision 1.220 2013/01/10 16:56:10 gkohen
// Resolve Demand Issue - DEF784535: [Demand] Worksheet Sort Context Not Cleared When Facet Moved to Different Axis
//
// Revision 1.219 2013/01/08 19:19:08 misong
// Remove dependencies on demand code in core broker classes.
//
// Revision 1.218 2013/01/08 18:08:58 gkohen
// Change screen resolution detection logic.
//
// Revision 1.217 2013/01/07 22:01:31 gkohen
// Correct measure column width calculation + Resolve facet swapping bug.
//
// Revision 1.216 2013/01/07 16:42:46 gkohen
// After Update custom logic callback
//
// Revision 1.215 2013/01/07 15:48:29 gkohen
// Rendering changes:
// 1. Make sure we respect the frameworks's thousands grouping, default decimal point location, zero padding and
// negative parenthesis.
// 2. Override the above decimal digits with the measure specific format.
// 3. Show tool-tip for the number full value (Useful in the case of large numbers that get truncated on initial
// rendering).
//
// Revision 1.214 2013/01/04 16:29:36 gkohen
// Resolve S1 Demand Issue - DEF783829: [Demand] WorkSheet > Drill up/down in worksheet cause incorrect scrolling.
//
// Revision 1.213 2013/01/02 18:56:53 gkohen
// Code clean-up + Resolve Demand Issue - DEF783915: [Demand] Large values turn to x.xxxx small values when editing
//
// Revision 1.212 2012/12/31 15:45:42 gkohen
// Resolve issues:
// 1. Demand Issue - DEF782856: [Demand] [Worksheet]: Values modified in one tab gets reflected in tab2 after save
// session is done in worksheet
// 2. Demand Issue - DEF782402: [Demand] [Worksheet]: Commit icon is not disabled in tab2 when commit is in progress in
// tab in worksheet
//
// Revision 1.211 2012/12/28 19:57:11 gkohen
// Resolve Demand Issue - DEF780382: [Demand] WS Locks : Unlock Menu Option Coming Even though Locks Not Exists On A
// Cell.
//
// Revision 1.210 2012/12/28 14:19:08 gkohen
// Resolve issue DEF783647 [Worksheet]: Separators are not shown in worksheet .
//
// Revision 1.209 2012/12/27 19:12:46 gkohen
// Optimize browser DOM painting.
//
// Revision 1.208 2012/12/21 20:36:24 gkohen
// 1. Refactor pluggable logic to a central location.
// 2. Add before and after edit hooks (with the ability to veto editing or sending to server).
// 3. Hooks above allow to change the cell values before starting to edit and before submitting to server.
// 4. Need to add JSDoc (similar to JavaDoc) documentation to the sample pluggable code.
//
// Revision 1.207 2012/12/20 22:20:34 gkohen
// Make sure client side validators get meta information about the cell edited.
// These can include anything send from the server's getSegmentData such as the cell type, locks, editability and such.
//
// Revision 1.206 2012/12/19 20:09:01 gkohen
// Activate anchors and sorting.
//
// Revision 1.205 2012/12/19 13:12:30 gkohen
// Make sure the this. CellValidators exists before checking custom validators.
//
// Revision 1.204 2012/12/18 14:21:50 gkohen
// Resolve issues related to anchoring pivot rendering.
//
// Revision 1.202 2012/12/17 17:14:29 gkohen
// PMG Feedback.
//
// Revision 1.201 2012/12/17 12:39:34 gkohen
// Resolve DEF782830 - Worksheet : Measure Cell Existing Data (Value) Going Out When A User Double Click Onit For
// Edition In WorkSheet.
//
// Revision 1.200 2012/12/16 14:46:28 gkohen
// Add UI side validation pluggable logic.
//
// Revision 1.199 2012/12/14 20:56:55 gkohen
// Color scheme support
//
// Revision 1.198 2012/12/13 19:52:02 gkohen
// 1. Bug fixes.
// 2. Re-branding quick-save/load to session.
//
// Revision 1.197 2012/12/12 23:22:41 gkohen
// 1. Changed the broker commands to send exceptions response using the stackTrace member of the error object. There is
// an additional 'details' member for sending additional info.
// 2. Made sure the commit is reporting back errors if the initial command to initiate the commit has failed (got no job
// ID).
//
// Revision 1.196 2012/12/12 20:23:09 gkohen
// 1. Fix an issue swapping facets.
// 2. Add status bar placerholder.
// 3. Add sort status flyout to the statusbar including information about the sort context and order.
//
// Revision 1.195 2012/12/11 00:52:19 gkohen
// First version of anchor\filtering pivot members.
//
// Revision 1.194 2012/12/10 22:14:01 misong
// Hook up the UI and back end for Sort By Measure.
//
// Revision 1.193 2012/12/10 12:43:24 gkohen
// 1. Make sure the levels shown for the anchor context menu is correct.
// 2. Correct the facet names header border style.
//
// Revision 1.192 2012/12/10 03:12:11 gkohen
// These changes include behind the scenes a more pluggable pivot event sub-system to allow plugging new events,
// handlers, enablement, state and type (regular, checkbox & radio). This was done in preparation to triggering
// filtering (might end up being called ?anchor?) and pivot sort-by-measure.
//
// Revision 1.191 2012/12/07 23:10:42 gkohen
// Right click on a data cell was creating an exception.
//
// Revision 1.190 2012/12/07 20:47:25 gkohen
// Resolve measure axis swapping and D&D errors.
//
// Revision 1.189 2012/12/06 17:30:13 gkohen
// Resolve some drag and drop facet/measure issues.
//
// Revision 1.1` 2012/12/05 21:42:50 gkohen
// 1. Resolve DEF781805: [Demand] [Worksheet]: Edited value is not accepted after we hit Enter in worksheet.
// 2. Resolve DEF780860: [Demand] [Worksheet]: General tab UI in worksheet properties is dis-ordered.
// 3. Resolve DEF781805: [Demand] [Worksheet]: Edited value is not accepted after we hit Enter in worksheet.
// 4. Resolve DEF779408: [Demand] [Worksheet]: Re-entering values in an editable measure is not accepting values in
// worksheet.
// 5. Resolve DEF781118: [Demand] [Worksheet]: Worksheet is getting freeze when a value is enter after changing decimal
// after digits.
// 6. Resolve DEF780180: [Demand] [Worksheet]: Status message to shown that worksheet is loading should be displayed in
// worksheet.
// 8. Resolve DEF781845: [Demand] [Worksheet]: Spelling mistake in the error message when no facet is selected in
// worksheet properties.
// 9. Demo feedback: Need to change the title of the quick save dialog to ?Quick Save?
// 10. Demo feedback: Can drop ?Quick Save Description? to just Description after title change.
// 11. Demo feedback: ? Add quick save file name to the header when we re-load it.
// 12. Selected cell will be highlighted regardless if it's an N/A cell or writable.
//
// Revision 1.186 2012/12/05 00:02:19 gkohen
// Resolve some editing event glitches.
//
// Revision 1.185 2012/12/03 19:00:07 gkohen
// 1. Resolve boundary condition of shown headers when all facets are on top and measures are on the side.
// 2. Make the autosave file description be locale aware.
//
// Revision 1.184 2012/11/30 23:42:14 gkohen
// No Facet-Axes.
// Validation rules changed to check if an axis as either a visible facet or the measures(Changed both in the pivot and
// general tab).
// Still some kinks to iron out such as displaying the facet names when having measures on the side and all facets are
// on the top.
//
// Revision 1.183 2012/11/29 20:21:50 gkohen
// 1. Allow tab isolation for pivot calls.
// 2. Change loading message look & feel.
// 3. Make sure implicitly locks are not shown as temporary locks in the UI.
// 4. Resolve DEF781237 [Demand] [Worksheet]: Exception icons that are not in focus are not getting cleared out when
// clicked on clear Exceptions icon in worksheet
// 5. Make warning icons translucent to save space and show cell content.
//
// Revision 1.182 2012/11/28 16:33:43 gkohen
// Implement client side cancel upon search.
//
// Revision 1.181 2012/11/27 19:41:11 gkohen
// Correct styling issue stemming from drop 14. Change loading message for future support of cancel command.
//
// Revision 1.180 2012/11/26 17:39:22 alaird
// changes for proper handling of commit popup and actual commit completion
//
// Revision 1.179 2012/11/26 17:22:23 gkohen
// Allow setting the snapshot description upon quick-saving.
//
// Revision 1.178 2012/11/22 18:41:46 gkohen
// Multiple choice quick load support.
//
// Revision 1.177 2012/11/20 17:22:13 gkohen
// Code Check-In: Demand Stored Measures getAllStoredMeasures was not populating decimal format
//
// Revision 1.176 2012/11/20 13:56:18 gkohen
// Allow cell editor to use arrows rather than making inter-cell navigation.
// Make sure measure formatting is properly working when measures on top.
//
// Revision 1.175 2012/11/19 23:02:18 gkohen
// Make sure measures location is saved on the general tab.
//
// Revision 1.174 2012/11/19 19:26:33 gkohen
// Make sure we don't set ed flag to true on phy. lock when not touching the cell value.
//
// Revision 1.173 2012/11/19 18:47:26 gkohen
// Resolve critical issue - DEF780527: [Demand] [worksheet]: Unable to enter new value in an editable measure in
// worksheet.
// Enable measures format.
//
// Revision 1.172 2012/11/17 15:21:48 gkohen
// Made code a bit more formatted, removed commented code.
// In addition:
// 1. Cell content was being bumped up one selecting or editing a cell ?corrected.
// 2. Cell values right padding was excessive. They are now more right-aligned.
// 3. When measures on top, the separators were not continuous ? corrected.
//
// Revision 1.171 2012/11/17 02:02:43 gkohen
// Fix an issue where physical lock request was not sent if the cell's numeric value was unchanged.
//
// Revision 1.170 2012/11/17 00:55:09 gkohen
// Add aditional lock handling
//
// Revision 1.169 2012/11/17 00:12:05 gkohen
// Add correction to lock behavior.
//
// Revision 1.168 2012/11/16 16:34:54 gkohen
// Allow a no-visible facet axis feature.
//
// Revision 1.167 2012/11/14 19:57:49 gkohen
// Make sure we can move measures back from the top to the side.
//
// Revision 1.166 2012/11/14 19:13:54 gkohen
// Remove a glitch in the column calculation.
//
// Revision 1.165 2012/11/14 17:21:27 gkohen
// Interim commit for no-facet axis.
//
// Revision 1.164 2012/11/13 19:27:57 gkohen
// Add "Clear Exceptions" action.
//
// Revision 1.163 2012/11/13 17:53:33 gkohen
// New flag needs to be added to Worksheet properties for handling negatives. The flag can is named "Treat Negatives as
// Zero" and its default value is true. This will be used in disaggregation.
//
// Revision 1.162 2012/11/12 21:41:59 gkohen
// 1. Interim check-in for having axis with no facets (only measures).
// 2. Resolve Demand Issue - DEF780070: [Demand] [Worksheet]: Quick load is not working when you re-arrange the pivot in
// worksheet
//
// Revision 1.161 2012/11/09 16:45:54 gkohen
// 1. Resolve issue DEF779408: [Demand] [Worksheet]: Re-entering values in an editable measure is not accepting values
// in worksheet.
// 2. Display a message whule the pivot configuration is being changed (Hide/Show/Move facets/measures etc.)
// 3. Temporarily disable the DFU attributes in the general tab.
//
// Revision 1.160 2012/11/09 02:51:37 gkohen
// Resolve issue DEF779864: [Demand] [Worksheet]: Related pages icon is not shown when quick load icon is clicked in
// worksheet.
//
// Revision 1.159 2012/11/09 02:30:36 gkohen
// Resolve sev. 0 bug not allowing to swap measures to the other axis.
//
// Revision 1.158 2012/11/07 17:32:39 gkohen
// Make sure the pivot area is properly sized upon a message error.
//
// Revision 1.157 2012/11/05 17:02:55 gkohen
// Make sure the measure value separator lines are applied to the values area only.
// Resolve issue DEF779533: [Demand] [Worksheet]: Line seperator is shown in facet in worksheet .
//
// Revision 1.156 2012/11/05 16:49:14 gkohen
// The intent of the arrow navigation is to stay within the current visible view port. The reason is that we navigate to
// the next editable cell. That is not known until a value is returned from the server. The arrow navigation would also
// support wrap to beginning/end of view navigation.
//
// Revision 1.155 2012/11/02 19:03:18 gkohen
// Revert the UI to render values in 2 decimal point precision - prep for next step
//
// Revision 1.154 2012/10/31 20:21:50 gkohen
// Add initial implementation of exception reporting in the pivot.
//
// Revision 1.153 2012/10/30 19:00:33 gkohen
// Informational pivot messages will be displayed using the SCPO message line(using SCPO blue style).
//
// Revision 1.152 2012/10/29 16:26:56 gkohen
// Resolve demand issue - DEF779036: [Demand] [Worksheet]: Level name is shown in the top in worksheet.
// In addition, make sure that the axes highlighting is the functioning correctly.
//
// Revision 1.151 2012/10/29 12:33:29 gkohen
// Resolve issues:
// 1. DEF778207: [Demand] [Worksheet]: Unable to select any cell after selecing a editable measure without value in
// worksheet pivot.
// 2. DEF779039: [Demand] [Worksheet]: Measure types should be sorted in worksheet data tab
//
// Revision 1.150 2012/10/26 00:39:39 gkohen
// Resolve issue DEF778483 : [Worksheet]: Measures list is not displayed in the content view when the selected measures
// are greater than 29.
// The DHTMLX3 _showPolygon was positioning the menu off screen when showing the context menu for the lowest measures in
// the pivot. That function had to be overridden to offset in the right position.
//
// Revision 1.149 2012/10/25 20:39:35 gkohen
// Resolve an issue where a child and parent of the time dimension where merged to the same cell if the time facet was
// on the side. Try the "06/01/2012" member.
//
// Revision 1.148 2012/10/25 13:24:03 gkohen
// From the demo:
// Make sure IE shows highlighted axis.
// Remove slanted background from the filter drop zone.
// Change cell boundary to solid.
//
// Revision 1.147 2012/10/24 16:47:26 gkohen
// Initial effort to move to SCPO color scheme.
//
// Revision 1.146 2012/10/24 15:42:19 gkohen
// Correct an issue with axis highlight.
//
// Revision 1.145 2012/10/24 15:37:54 gkohen
// 1. Highlighting of inner most axes members when selecting a cell.
// 2. Performance improvement on scrolling.
// 3. Correct messages typos.
//
// Revision 1.144 2012/10/23 20:50:23 gkohen
// Make the cell separators fainter.
//
// Revision 1.143 2012/10/23 19:36:32 gkohen
// Resolve issue moving facets from top to side when the measures are on top.
//
// Revision 1.142 2012/10/23 19:09:52 gkohen
// Correct call to the back-end commit logic.
// Add initial support for cell separators.
//
// Revision 1.141 2012/10/23 12:40:25 gkohen
// Add initial support for pivot commit.
//
// Revision 1.140 2012/10/23 01:40:01 gkohen
// Show facet level name and member name when hovering over a facet member (Instead of Alt-Click).
//
// Revision 1.139 2012/10/22 23:19:55 gkohen
// Resolve the following issues:
// 1. Columns were not adjusting properly upon resolution change or resize.
// 2. DEF778480: [Demand] [Worksheet]: When time facet is selected in properties, the last selected facet is also
// selected in worksheet
//
// Revision 1.138 2012/10/22 11:59:33 gkohen
// Resolve the following issues:
// DEF778519: [Demand] Worksheet: UI > Instance Name not able see when pulling worksheet and a search
// DEF778483: [Demand] [Worksheet]: Measures list is not displayed in the content view when the selected measures are
// greater than 29
//
// Revision 1.137 2012/10/19 21:18:41 gkohen
// Resolve issues:
// DEF778415: [Demand] [Worksheet]: Right Click on loc facet is not showing the content view
// Demand DEF778417 - [Worksheet]: Hidden measure is shown as selected in the content menu in worksheet [ttid:
// 1003,677027]
// DEF778188: [Worksheet]: Techincal error page is displayed when a facet is hidden in worksheet
// DEF778189: [Worksheet]: Inappropriate error when alphabets are enterd in duration in worksheet properties
//
// Revision 1.136 2012/10/18 16:12:46 gkohen
// Resolve issues related to select box width and error message dialogs.
//
// Revision 1.135 2012/10/18 01:27:09 gkohen
// Rewrite logic to make sure it is a valid JavaScript Code.
//
// Revision 1.134 2012/10/17 11:41:35 gkohen
// Resolve issue DEF778181 - [Worksheet]: IE crashes while loading pivot in
// worksheet.
//
// Revision 1.133 2012/10/16 00:56:25 gkohen
// First round of functional quick save/load.
//
// Revision 1.132 2012/10/12 18:40:55 gkohen
// Initial version of the quick save and quick load actions.
//
// Revision 1.131 2012/10/12 02:56:52 gkohen
// Make sure that the regular behavior of providing a cell value on lock\unlock
// is kept.
//
// Revision 1.130 2012/10/11 23:26:30 gkohen
// Add initial buttons for the quick save\load.
//
// Revision 1.129 2012/10/09 16:16:32 gkohen
// 1. Add capabilities for parameterized locale string.
// 2. Add a refreshAllSettings method to refresh pivot setting from DB.
// 3. Addition of new labels as part of the localized pivot.
//
// Revision 1.128 2012/10/09 14:04:15 gkohen
// Fix the issue where we have a cells with RO attribute where shown in as non
// DFU cells(slanted background).
//
// Revision 1.127 2012/10/09 13:51:30 gkohen
// Fix an issue where ESC key was not canceling an edit.
//
// Revision 1.126 2012/10/08 20:47:43 gkohen
// Resolve DEF777100: [Demand] [Worksheet]: Facets are not moved from top to
// side in worksheet.
//
// Revision 1.125 2012/10/08 20:19:42 alaird
// fix for DEF777337 - Demand WorkSheet If any editable PDM or UDM is loaded,
// and doesn't have any data in DB, then respective rows in Worksheet are
// uneditable
//
// Revision 1.124 2012/10/08 19:53:35 alaird
// partial fix for DEF777337 - Demand WorkSheet If any editable PDM or UDM is
// loaded, and doesn't have any data in DB, then respective rows in Worksheet
// are uneditable
//
// Revision 1.123 2012/10/06 00:31:16 gkohen
// Resolve the following issues:
// 1. Demand DEF777095 - [Worksheet]: IE becomes un responsive when we hide a
// measure after expanding time hierarchy
// 2. Demand DEF777097 - [Worksheet]: IE becomes unresponsive and pivot is not
// loading when we unhide a measure when measures are on top
// 3. Demand DEF772282 - [Worksheet]: Measures are not moved to Side from top
// 4. Demand DEF777063 - [Worksheet]: Navigation and editing is not working
// correctly
//
// Revision 1.122 2012/10/04 20:34:32 gkohen
// Resolve issue DEF777119-[Worksheet]: Lock type is not shown in intersection
// information when physical lock / temporary lock exits.
//
// Revision 1.121 2012/10/04 01:38:50 gkohen
// Fix an issue navigating after update in IE9.
//
// Revision 1.120 2012/10/04 01:20:37 gkohen
// Restore and enhance key navigation and editing.
// Ability to navigate the pivot with the keyboard.
// Right - Enter/Tab/Right Arrow
// Left - Shift-Tab/Left Arrow
// Down - Enter/Down Arrow
// Up - Up Arrow.
// Start typing when a cell is selected and edit mode is triggered.
// On edit mode, tabbing or pressing Enter will submit the value.
// ESC will cancel the edit.
//
// Revision 1.119 2012/10/03 19:58:59 gkohen
// Resolve an issue where the worksheet was not coming up and editing was not
// being handled..
//
// Revision 1.118 2012/10/03 01:24:53 gkohen
// Rendering issue fix and resolution of DEF771108, DEF772282, DEF772935.
//
// Revision 1.117 2012/10/02 12:42:30 gkohen
// Adding support for external pivot refresh.
//
// Revision 1.116 2012/10/02 00:18:52 gkohen
// Lock type usage, error messages severity rendering, hierarchy member
// alignment, tighiting of cell editing logic & bug fixes
//
// Revision 1.114 2012/09/29 02:43:19 gkohen
// Change some error messages handling and error dialog style.
//
// Revision 1.113 2012/09/29 01:51:21 gkohen
// Change some error messages handling and error dialog style.
//
// Revision 1.112 2012/09/29 00:08:16 gkohen
// Externalize the lock mode toggle icon to the toolbar.
//
// Revision 1.111 2012/09/28 01:22:08 gkohen
// Pivot now sends a flag to the server indicating if a cell has changed during
// phy. locking.
//
// Revision 1.110 2012/09/26 15:30:58 gkohen
// Resolve wrong handling of long polling of the isSearchDone state.
//
// Revision 1.109 2012/09/25 15:44:05 gkohen
// Make sure the correct top facet is sent to the server on GetChildrenRequest
//
// Revision 1.108 2012/09/19 16:05:14 gkohen
// Data not in the view was remaining stale.
//
// Revision 1.107 2012/09/18 12:22:10 gkohen
// Remove "Show total" option.
//
// Revision 1.106 2012/09/18 01:00:51 gkohen
// Lengthen failure highlight time.
//
// Revision 1.105 2012/09/18 00:52:26 gkohen
// Render update failures.
//
// Revision 1.104 2012/09/17 14:05:39 gkohen
// Make sure that the cell's lock update request is sent regardless of changes
// in it's numeric value.
//
// Revision 1.103 2012/09/14 12:32:26 gkohen
// Remove an odd comma bothering IE9.
//
// Revision 1.102 2012/09/13 20:15:24 gkohen
// Fix a null assignment.
//
// Revision 1.101 2012/09/13 19:41:13 gkohen
// Apply initial changes for the cell editability rendering.
//
// Revision 1.100 2012/09/13 17:44:29 gkohen
// Fix DEF771672 - WorkSheet Locks : User Able To Apply Temporary Locks On N.A
// (No Value) Measure Cells Also make sure we can show\hide measures through the
// context menu.
//
// Revision 1.99 2012/09/12 18:14:39 gkohen
// Fix DEF771853: Internet Explorer Crashers when you change the Time hierarchy
// in worksheet
//
// Revision 1.97 2012/09/10 16:36:11 gkohen
// Add unlocking options.
//
// Revision 1.96 2012/09/10 11:51:48 gkohen
// Make sure the user can't lock N/A cells in lock mode.
//
// Revision 1.95 2012/09/08 02:15:43 gkohen
// Fix an issue expanding the time facet.
//
// Revision 1.94 2012/09/08 02:03:16 gkohen
// Initial setting of the physical lock.
//
// Revision 1.93 2012/09/07 12:27:12 gkohen
// Fix Demand DEF771672 - WorkSheet Locks : User Able To Apply Temporary Locks
// On N.A (No Value) Measure Cells Also.
//
// Revision 1.92 2012/09/05 18:05:21 misong
// Update the new pivot API.
//
// Revision 1.91 2012/09/04 22:31:16 gkohen
// Add support for updateFacts
//
// Revision 1.89 2012/09/04 18:19:25 gkohen
// Comment out comments demo.
//
// Revision 1.88 2012/08/31 22:38:55 gkohen
// Update first hookup of locks to the backend.
//
// Revision 1.87 2012/08/31 22:35:05 gkohen
// Update first hookup of locks to the backend.
//
// Revision 1.86 2012/08/31 19:34:02 gkohen
// Update data column widths.
//
// Revision 1.85 2012/08/23 19:08:50 gkohen
// Add proof of concept of worksheet general properties.
//
// Revision 1.84 2012/08/19 13:29:54 gkohen
// Add a refreshAllData method to invalidate all segment data in the pivot.
//
// Revision 1.83 2012/08/18 02:00:10 gkohen
// Add support for coordinates tooltip when Alt-Clicking a cell.
//
// Revision 1.82 2012/08/16 14:47:25 gkohen
// Add tooltips to truncated member names.
//
// Revision 1.81 2012/08/02 14:41:17 gkohen
// Make sure the the upper facet label is properly aligned even after resizing
// the columns.
//
// Revision 1.80 2012/08/02 14:23:27 gkohen
// Fix an issue moving measures to top.
//
// Revision 1.79 2012/08/01 23:22:44 gkohen
// Align expansion arrows.
//
// Revision 1.78 2012/07/31 22:13:10 gkohen
// Change the level name display to Alt-Click.
//
// Revision 1.77 2012/07/31 21:59:03 gkohen
// Add ability to show level name on CTRL-click.
//
// Revision 1.76 2012/07/31 18:15:19 gkohen
// Fix an issue where facet swapping is creating a race condition.
//
// Revision 1.75 2012/07/27 19:29:32 gkohen
// Fix an issue related to the usage of hasFacetChildren
//
// Revision 1.74 2012/07/27 16:59:16 gkohen
// Add ability to double click column separators to revert the column width to
// adjust to content.
//
// Revision 1.73 2012/07/26 20:14:14 gkohen
// Resolve an issue where a whole header section resize wasn't working in IE.
//
// Revision 1.72 2012/07/26 02:32:51 gkohen
// Fix resizing all facets bug.
//
// Revision 1.71 2012/07/26 01:51:25 gkohen
// Initial checking of column resize.
//
// Revision 1.70 2012/07/20 21:07:13 gkohen
// Fix bugs related to cell updating,
//
// Revision 1.69 2012/07/20 19:40:15 gkohen
// Fix a data update error.
//
// Revision 1.68 2012/07/20 18:55:59 gkohen
// Make sure selection is not available in the side facets.
//
// Revision 1.67 2012/07/20 17:09:24 gkohen
// Allow a more generic pluggable command pattern.
//
// Revision 1.66 2012/07/19 23:00:28 gkohen
// Fix a selection issue.
//
// Revision 1.65 2012/07/19 18:34:13 gkohen
// Apply the pluggable context menu for cells - take 2.
//
// Revision 1.64 2012/07/19 18:24:51 gkohen
// Apply the pluggable context menu for cells.
//
// Revision 1.63 2012/07/19 14:05:55 gkohen
// Resolve an issue where the unLockUI was not being executed.
//
// Revision 1.62 2012/07/18 03:18:07 gkohen
// Fix some issues related to editing/selection and editing feedback.
//
// Revision 1.61 2012/07/15 14:38:34 gkohen
// Fix editor issue.
//
// Revision 1.60 2012/07/14 23:10:15 gkohen
// Add initial support for hiding total node.
//
// Revision 1.59 2012/07/14 01:43:37 gkohen
// Tweak pivot area calculation.
//
// Revision 1.58 2012/07/13 12:39:07 gkohen
// SSanity checkin.
//
// Revision 1.57 2012/07/12 20:26:45 gkohen
// Fix first column width issue.
//
// Revision 1.56 2012/07/12 19:18:29 gkohen
// Fix an issue related to IE scrolling.
//
// Revision 1.54 2012/07/09 12:21:45 gkohen
// Add better tooltip handling.
//
// Revision 1.53 2012/07/06 12:10:49 gkohen
// Throttle the 'check_load_next' function.
//
// Revision 1.52 2012/07/06 11:18:44 gkohen
// Add function throttling on scroll.
//
// Revision 1.51 2012/07/05 19:27:34 gkohen
// Fix spanning column rendering.
//
// Revision 1.50 2012/07/04 21:20:04 gkohen
// Fix issue collapsing columns and moving measures.
//
// Revision 1.49 2012/07/02 12:09:02 gkohen
// Resolve an issue related to multiple hidden levels.
//
// Revision 1.48 2012/07/02 11:33:30 gkohen
// Resolve an issue related to multiple hidden levels.
//
// Revision 1.47 2012/07/02 01:06:25 gkohen
// Add support to show hide pivot levels.
//
// Revision 1.46 2012/06/29 19:26:09 gkohen
// Add initial support for facet level visibility setting.
//
// Revision 1.45 2012/06/28 23:51:01 gkohen
// Fix some rendering issues and add pull out panels. Finally, changed the color
// scheme.
//
// Revision 1.44 2012/06/25 20:08:14 gkohen
// Add poper rendering to editing cells.
//
// Revision 1.43 2012/06/25 16:32:56 gkohen
// Add sample comments as well as fixing the cell editor trigger.
//
// Revision 1.42 2012/06/20 10:48:18 gkohen
// Optimized column width calculation.
//
// Revision 1.41 2012/06/19 20:06:04 gkohen
// Fix JS issue showing a facet.
//
// Revision 1.40 2012/06/19 17:40:18 gkohen
// Add ability to hide a facet.
//
// Revision 1.39 2012/06/18 20:00:57 gkohen
// Add error handling to the pivot.
//
// Revision 1.38 2012/06/15 20:42:06 gkohen
// Fix issue with moving measure toa new axis.
//
// Revision 1.37 2012/06/15 15:09:50 gkohen
// Add UI blocker to refreshing measures visibility.
//
// Revision 1.36 2012/06/15 15:04:55 gkohen
// Fix reentrant call upon changing measures visibility.
//
// Revision 1.35 2012/06/14 23:27:45 gkohen
// Allow enabling\disabling measures.
//
// Revision 1.34 2012/06/14 15:37:53 gkohen
// Resolve a painting issue with IE9.
//
// Revision 1.33 2012/06/13 20:58:30 gkohen
// Update fact update logic.
//
// Revision 1.32 2012/06/13 20:08:38 gkohen
// Add long polling support.
//
// Revision 1.31 2012/06/11 00:01:33 gkohen
// Adjust column widths.
//
// Revision 1.30 2012/06/07 15:08:12 gkohen
// Inidital version of cell editing on pivot.
//
// Revision 1.29 2012/06/06 23:39:32 gkohen
// Fix columns width issue.
//
// Revision 1.28 2012/06/06 23:09:30 gkohen
// Make sure we can move measures with context menu.
//
// Revision 1.27 2012/06/05 15:21:54 gkohen
// Fix filter drop zone cell width.
//
// Revision 1.26 2012/06/05 13:38:56 gkohen
// Facet names on top.
//
// Revision 1.25 2012/06/01 13:09:21 gkohen
// Optimize expansion/collapse performance.
//
// Revision 1.24 2012/05/30 14:38:06 gkohen
// Finalize changes for IE9 and update JQuery.
//
// Revision 1.23 2012/05/30 01:42:46 gkohen
// Resolve IE8 related issues. Still need to resolve IE8 crash on D&D.
//
// Revision 1.22 2012/05/23 19:33:08 gkohen
// Tweak look and feel of headers.
//
// Revision 1.21 2012/05/22 20:27:51 gkohen
// Shrink padding of cells.
//
// Revision 1.20 2012/05/22 17:39:50 gkohen
// Adjust columns widths.
//
// Revision 1.19 2012/05/22 17:16:02 gkohen
// Make sure we shrink columns as needed when collapsing members.
//
// Revision 1.18 2012/05/22 14:51:46 gkohen
// Add debug information for cell clicking.
//
// Revision 1.17 2012/05/22 14:19:40 gkohen
// Apply not style to blocking UI.
//
// Revision 1.16 2012/05/22 12:58:27 gkohen
// Commit UI blocker.
//
// Revision 1.15 2012/05/21 20:48:13 gkohen
// Add warning about exception.
//
// Revision 1.14 2012/05/21 20:36:06 gkohen
// Make sure headers properly show on IE8.
//
// Revision 1.13 2012/05/21 19:32:36 gkohen
// Make sure the pivot throws an exception on internal server errors.
//
// Revision 1.12 2012/05/21 19:13:55 gkohen
// Make sure data is right aligned.
//
// Revision 1.11 2012/05/21 11:34:30 gkohen
// Add capacility to add facet to axes. Add context menus.
//
// Revision 1.10 2012/05/18 19:36:55 gkohen
// Add multi facet top axis
//
// Revision 1.9 2012/05/17 17:49:11 gkohen
// Drop a null pointer exception when dropping a facet off screen.
//
// Revision 1.8 2012/05/17 17:46:30 gkohen
// Fix race conditions when swapping facets.
//
// Revision 1.7 2012/05/17 12:17:40 gkohen
// Make sure that the measures axis orientation is send and received from the broker rather than locally on the browser.
//
// Revision 1.6 2012/05/16 20:16:55 gkohen
// Apply bug fix to properly collapse rows that are expanded in more than one facet.
//
// Revision 1.5 2012/05/16 18:53:09 gkohen
// Add support for panel pivot view as well as resizing.
//
// Revision 1.4 2012/05/16 15:50:39 gkohen
// Resolve scroll and expansion rendering issues.
//
// Revision 1.3 2012/05/15 20:11:32 gkohen
// Resolve IE related issues.
//
// Revision 1.2 2012/05/15 16:05:34 gkohen
// Add support for moving facets.
//
// Revision 1.1 2012/05/14 21:05:26 gkohen
// Add support for set axes facets.
//
//
