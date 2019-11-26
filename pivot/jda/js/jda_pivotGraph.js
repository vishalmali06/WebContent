//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
/**
 * Pivot Graph Widget
 * 		It gives flexibility to plot different types chart for available measures in Pivot
 * 
 * Dependency JS
 *       jquery.layout.latest.js(layout creation)
 *   	 jquery.UI( toggle button creation, widget factory )
 *   	 highstock.js (to plot different types of chart)
 *   
 * @author Mohamed Faizel
 * @created  26-09-1013 (basic UI)
 * @modified 20-11-2013 (moved to widget factory)
 */

(function($,document,window){
    
  $.widget("jda.pivotGraph", {
	 
	  // variable  to check request send or not
	  canSendRequest:true,
	  /**
	   * Default text. It can be override by application which it inherits
	   */ 
	  options:{
		  
		  		imgPath:"common/pivot/jda/images/",
			    cellId:undefined,
			    intersection:"",
			    graphData:undefined,
			    availableFacets:undefined,
			    availableMeasures:undefined,
			    reloadGraphSettings:false,
			    backupCube:undefined,
			    interactiveToPivot:true,
				interactiveToSettings:true,
			    cellChange:false,
			    flyoutIsOpen:false,
				graphTypes:"Line~Area~Column",
				graphSetting:undefined,
				gridMaxHeight:160,
				delayTimeout:1000,
				canModify:true,
				scenariosDimensionKey:undefined,
	  },
	  
	  /**
	   * Set selected cell information
	   * @param cellId axispath understand by pivot object
	   */
	  _setCellId:function(cellId){		  
		  this.options.cellId=cellId;
		  if(this.options.interactiveToPivot && this.options.flyoutIsOpen){
			  this.options.cellChange=true;
			  this._sendGraphRequest();
		  }
		  this.options.cellChange=false;		
	  },
	 
      /**
       * initialize pivot Graph with default value.
       */
	  _init:function(options){
    	  var $self =$(this.element);
    	  this._buildGraphLayout($self);
    	  //Creating Pivot High chart widget
    	  var $grapharea = $("#pvt-graph-grapharea");
    	  if($grapharea && $grapharea.length > 0){
    		  var pivothighchartwidget = Ext.create('JdaPivotApp.view.businessgraph.PivotHighChartWidget', {
    	  		    renderTo:$grapharea[0].id,
    	  		    chartId :'pivotGraphArea',
    	  		    containerId :'pivotGraphArea',	        
    	  		    isClickContextRequired:false,
    		        isCustomTooltipRequired:false
    	    	  });  
    	  }
    	  
      },
      
      /**
       * Resize Graph Layout based on given width and height..
       * We are using only width not height.
       * @param width width of pivot 
       * @param height height of pivot
       */
      resize:function(width,height){
    	  var $self =$(this.element);
    	  $self.width(width);
    	  $self.height(height);
    	  this._trigger("resize");
    	  this.resizeGrid(width, height);
      },
      /**
       * Adjust Grid height
       */
      resizeGrid:function(width,height){
    	var $root = $(this.element).find('.ui-layout-west');
    	var xaxisHeight = this.getActualHeight($root.find('.graphXAxis'),$root)  ;
    	//xaxisHeight = xaxisHeight < 65 && height >350 ? 75 : 66;
    	//this.getActualHeight($root.find('.commitSettings'));
    	var buttonHeight =35;// static height for buttons
    	var $yaxis = $root.find('.graphYAxis');    
    	// New Height calculation panel height - x-axis height + button area height
    	var newHeight = height -(xaxisHeight+buttonHeight);
    	$yaxis.height(newHeight);
    	
    	var yaxisHeight = this.getActualHeight($yaxis,$root);
    	var gridHeight = yaxisHeight - this.getActualHeight($yaxis.find('.graphYAxisHeader'),$root);
    	
    	$yaxis.find('.graphSettingsGrid').height(gridHeight);
    	
    	var headerHt =  this.getActualHeight($yaxis.find('.settingsHeaderGrid'),$root);
    	
    	$yaxis.find('.scrollGrid').css("max-height",gridHeight-headerHt);
    	
    	/*pivotlog("ResizeHeight --->"+height+" xaxisHeight -->"+xaxisHeight +" yaxisHeight --->"+ yaxisHeight + " buttonHeight ---->"+buttonHeight
    			+"newHeight --->"+newHeight);*/ 	
    	// For Center panel
    	
    	var $centerPanel = $(this.element).find("#pvt-graph-grapharea");
    	$centerPanel.height(height-34);
    	
    	this._resizePivotHighchartWidget($(this.element));
    	
      },
      
      /**
       * Get the actual height of elements. if west pane were hidden it tries to make it visible then make height calculation.
       * After that make it to hidden. This way we get actual height of hidden elements.
       */
      getActualHeight:function($element ,$root){
    	 // var $root = $(this.element).find(".ui-layout-west");
    	  var actualHeight =0;
    	  // if west pane is hidden 
    	  if($root.is(':hidden')){
    		  // make visibility hidden and display as block
    		  $root.css({'visibility':'hidden', 'display':'block'});
    	     // get the actual height 
    		  actualHeight = $element.height();
    	  	// make it visibility visible and display none	
    	      $root.css({'visibility':'visible', 'display':'none'});
    	  }else{
    		  actualHeight = $element.height();
    	  }
    	//  pivotlog(" actual Height -->"+$element.prop('class')+" ---> "+actualHeight);
    	  
    	  return Math.ceil(actualHeight);
      },
      /**
       * Build layout for Graph 
       *  	center pane -> for high chart
       *  	west pane 	-> for graph settings
       *  Uses jquery layout plugin
       * @param $self --> Jquery object $(.pivotGraph) 
       */
      _buildGraphLayout:function($self){
    	  var windowWidth =  $(window).width();
    	  pivotlog("Intialize Graph width :"+windowWidth);
    	  $self.css("width",windowWidth);
    	  var pivotGraphUI = this;
    	  var $pivotGraph=$('<div><div class="graphHeader"></div><div class="errorHeader" ></div><div  id="pvt-graph-grapharea"></div></div>');
    	  $pivotGraph.addClass("ui-layout-center");
    	  var $pivotGraphSetting=$("<div>", {"class": "ui-layout-west"});
    	  $self.append($pivotGraph).append($pivotGraphSetting);
    	 
    	  var $layout =$self.layout({
    		  defaults: {
    			  size:					"auto",
    			  resizerClass:			"resizer"    			
    		  },

    		  west:{
    			  size:"35%",
    			  togglerAlign_closed: "top" ,
// TODO GK: Add comment to move to glyphs. Comment next 2 lines
//    			  togglerContent_open: "<span class='graphCollapseImg fa fa-angle-double-left  fa-lg' />",
//    			  togglerContent_closed: "<span class='expandImgDiv fa fa-angle-double-right  fa-lg'/>",					
// TODO GK: Remove comment to move to glyphs. Uncomment next 2 lines.
    			  togglerContent_open: "<img class='graphCollapseImg ' src='"+pivotGraphUI.options.imgPath+"button-slide-in.png'/>",
    			  togglerContent_closed: "<div class='expandImgDiv'><img class='graphExpandImg 'src='"+pivotGraphUI.options.imgPath+"graph-slide-out.png'/></div>",					
    			  onresize_end:function(){
    				  
    				  var arg = arguments;
    				  if(arg && arg.length > 2 && arg[2].size <35){
    					  // To maintain minimum width making the resizing west panel to minimum width of 50
    					  $layout._sizePane('west',50,false,false,true);
    		    	  }
    			  },
    			  onopen_end: function () {
    				  pivotGraphUI._resizePivotHighchartWidget($self);
    			  },
    			  onclose_end: function () {
    				  pivotGraphUI._resizePivotHighchartWidget($self);
    			  },
				  spacing_closed: 25
    		  },
				   
    		  slidable:  false,
    		  resizable: false,
    		  applyDefaultStyles:false
    	  });    	  
    	  
    	  $self.on("pivotgraphresize",function(e){    		 
    		  $layout.resizeAll();
    	  });
    	  
    	  if(this.options.settingsCollapse){
    		  $layout.close('west');
    	  }
    	  $self.on("click",".graphSettingsHeaderImg",function(e){
    		 $layout.toggle('west');
    		 pivotGraphUI._resizePivotHighchartWidget($self);
    	  });
    	  
      },
      pivotflyoutopen : function(){	 
		  this.options.flyoutIsOpen=true;
		  this._sendGraphRequest();		  
		  this._trigger("resize");
		  this._gridMaxHeightReached();
      },
      pivotflyoutclose : function(){
    	  this.options.flyoutIsOpen=false;
    	  this.destroyPivotHighchartsObj();
      },
      
      /**
       * Draw High Chart based on given json data. 
       * @param graphJsonData
       */      
      drawChart:function(graphJsonData){
    	  var pivothighchartwidget = Ext.getCmp('pivothighchartwidget-pivotGraphArea');
    	  this._resizePivotHighchartWidget($(this.element));
      	  if(pivothighchartwidget && graphJsonData){
    		  this._loadHighChartProperties(graphJsonData, pivothighchartwidget);
    		  pivothighchartwidget.drawChart(graphJsonData);
    	  }
      },
      
      /**
       * Load high chart properties
       */
      _loadHighChartProperties:function(graphData, pivothighchartwidget){
    	  if(!graphData.chartStyles){
    		  graphData.chartStyles = {};
    	  }
    	  var chartStyles = {
					"title.xaxis.margin":16,
					"chart.shadow":false,
					"chart.plotBorderWidth":0,
					"yAxis.alternateGridColor":"#F7F7F7",
					"tooltip.animation":false,
					"colors":["#007AB4","#C90A5A","#961D9C","#E85600","#004F71","#598100","#DB72E0","#54C2EC","#2073BC","#FF9E36","#249F33","#6F51A1","#42B9FF","#FFEB3B","#6CE07A","#9C27B0"],
					"chart.spacing":[16,16,16,16],
					"xAxis.gridLineWidth":1,
					"chart.backgroundColor":"#FFFFFF",
					"chart.plotBorderThickness":0,
					"tooltip.shadow":true,
					"xAxis.gridLineColor":"#E9E9E9",
					"legend.shadow":true,
					"chart.style.fontSize":12,
					"plotOptions.series.animation":false,
					"credits.enabled":false,
					"xAxis.alternateGridColor":"",
					"legend.enabled":true,
					"yAxis.gridLineWidth":1,
					"chart.style.fontFamily":"Roboto, arial, sans-serif",
					"label.rotation":false,
					"yAxis.gridLineColor":"#E3E3E3",
					"title.yaxis.margin":16,
					"tooltip.backgroundColor":"#FFFFFF",
					"legend.borderWidth":0,
					"chart.borderColor":"#545454",
					"thousandSeparator":",",
					"decimalSeparator":".",
    	  };
    	  $.extend(graphData.chartStyles,chartStyles);
    	  $.extend(graphData.chartStyles,this.options.chartProperties);
      },
      
      _resizePivotHighchartWidget:function($self){
    	  var $graphArea = $self.find("#pvt-graph-grapharea");	
    	  var pivothighchartwidget = Ext.getCmp('pivothighchartwidget-pivotGraphArea');
    	  if(pivothighchartwidget && $graphArea){
    		  pivothighchartwidget.setHeight($graphArea.height());
    		  pivothighchartwidget.setWidth($graphArea.width());  
    	  }
      },
      /**
       * Load Graph settings based on cube definition 
       * @param cube -> cube definition from pivot object 
       */
      refreshSettings:function(cube,applySettings){
    	  var pivotGraph = this;
    	  pivotGraph._setCellId(undefined);
    	  pivotGraph._setIntersection([]);
    	  this.options.availableFacets=cube.availableFacets;
    	  this.options.availableMeasures=cube.visiblemeasures;
    	  this.options.graphSetting = cube.graphSetting;
    	  // reloadGraphSettings
    	  if(this.options.flyoutIsOpen)
    		  this._reloadGraphSettings(true, true);
    	   // apply previously saved setting
    	// if(applySettings)
    		  this._applySavedSetting(this.options.graphSetting);
      },
      
      /**
       * Check level is modified (Includes Disabling level, filtering level)
       * @param $level
       * @param dimension
       * @returns {Boolean}
       */
      _isLevelsModified:function($level,dimension){
    	  var prevLevel = $level.find("option").length;
    	  var availableLevel = this._getAvailableLevel(this.options.availableFacets, dimension);
    	  
    	  if(prevLevel != availableLevel.length){
    		  return true;
    	  }
    	  return false;
      },
      
      /**
       * Check settings reloadable 
       * @returns
       */
      _isSettingsReloadable:function(){
    	  return this.options.reloadGraphSettings;
      },
      
      /**
       * Reload Graph Settings based on changes made to cube. (Includes Filter level, disable/enable level,measure)
       * @param xaxis
       * @param yaxis
       */
      _reloadGraphSettings:function(){
    	  	var $root =$(this.element).find('.ui-layout-west');
    	  	
    	  	
    	  	var $xaxis = $root.find('.xaxisDimensionSelector');
    	  	var $dimSelector =$xaxis.find('.dimensionSelector');
    	  	var $levelSelector =$xaxis.find('.dimensionLevelSelector');
    	  	var dimName = $dimSelector.find('.dropDownSelector').text();
    	  	//if(this._isLevelsModified($levelSelector,dimName)){
    			  //var currentSelection = $levelSelector.find('.dropDownSelector').text();;
    			  $levelSelector.empty();
    			  this._loadFacetLevel($levelSelector, this.options.availableFacets, dimName);//,currentSelection);
    	  	//}
    	  	
    	  	
    	  	var $yaxis =$root.find('div.graphYAxis > div.graphSettingsGrid > div.scrollGrid');
    	  	this._loadModifiedMeasures($yaxis,this.options.availableMeasures);
      },
              
      /**
       * returns datatype is invalid or valid .Current support for double,float,int,duration 
       * @param type - datatype
       * @returns {Boolean}
       */
      _hasInValidType:function(type){
    	  
    	  if( (type.toUpperCase() === "FLOAT") || 
    			  (type.toUpperCase() === "DOUBLE") || 
    			  (type.toUpperCase() === "INTEGER")){
    		  return false;
    	  }
    	  return true;
      },
      /**
       * This method will make the graph settings consistent while adding or removing measures from pivot
       */
      _loadModifiedMeasures: function(target,measures){
    	  var $grid=target.find('.settingsGrid');
    	  $grid.detach();
    	  var $row,gridClass;
    	  var backUpMeasure=[];
    	  var availableMeasures=[];
    	  var that=this,i=0;
    	  
		  _.each(measures,function(value){
			 
			 if(that._hasInValidType(value.typeName)){
				 return;
			 }
			 backUpMeasure.push(value.id); 
			 availableMeasures.push(value.id);
			 var msrRowId = "measureRow"+value.id;
			 
			 if(!($grid.find("[id='"+msrRowId+"']").length)){
				 //gridClass= i%2==0?"gridEvenData":"gridOddData";
				 $row = $('<tr></tr>').prop("id","measureRow"+value.id).addClass("gridData");

	    		 // 1st column Checkbox selection
	    		 $("<td class='chxBox'></td>").append("<input id='measureSelector' type='checkbox'></input>").appendTo($row);
	    		 
	    		 // 2nd column show Toggle Button axis selection
	    		 $toggleButton=$("<td></td>");
	    		 that._getToggleButton($toggleButton,i);
	    		 $toggleButton.appendTo($row);	
	    		 
	    		 // 3rd column shows Measure Names 
	    		 $("<td></td>").prop("id",value.id).prop("title",value.label).addClass("msrName").text(value.label).appendTo($row);
	    		 
	    		 // 4th column shows graph type
	    		 $graphTypeSelector = $('<span class="graphTypeSelector pvt-Disable" disabled></span>');
	    		 that._loadOptions($graphTypeSelector,that.options.graphTypes.split("~"));
	    		 $("<td class='graphTypes'></td>").append($graphTypeSelector).appendTo($row);	    		 
	    		 $row.appendTo($grid);
			  }
			 i+=1;
		  });
		  //this.options.backupCube.availableMeasures=backUpMeasure;
		  var j=-1;
		  $.each($grid.find('.msrName'),function(i,value){
			  var $parent = $(value).parents('.gridData');
			  $parent.removeClass('gridEvenData').removeClass('gridOddData');
			  j+=1;
			  if(availableMeasures.indexOf(value.id)===-1){
				  $parent.remove();
				  j-=1;
			  }
			  gridClass= j%2==0?"gridEvenData":"gridOddData";
			  
			  $parent.addClass(gridClass);
		  });
		  target.append($grid);
		  this._delayMeasureCheck(this);
		  //var scrollGrid = target.height();
		  this._gridMaxHeightReached();
      },
      
      _gridMaxHeightReached:function(){
    	  var maxheight =this.options.gridMaxHeight;
    	  var $scrollGrid=$(this.element).find("div.scrollGrid");
    	  var scrollHeight = $scrollGrid.height();
    	  var $root =$(this.element).find("table.settingsHeaderGrid");
    	  var $tr = $root.find("tr");
    	  var $dummy =$tr.find("th.dummyColumn");
    	  if(scrollHeight>=maxheight){
    		
    		  if($dummy.hasClass("dummyColumn") === false){
    			  $tr.append("<th class='dummyColumn'></th>");
    		  }
    	  }
    	  else{
    		  if($dummy.hasClass("dummyColumn")){
    			  $dummy.remove();
    		  }
    		  
    	  }
    	  
      },
      /**
       * This method call cell selection is made on pivot
       * @param cellId -> new cell id 
       * @param intersection -> intersection details to set intersection information on top of graph
       */
      onCellChange:function(cellId,intersection){
    	  this._hideError();
    	  this._setCellId(cellId);
    	  this._setIntersection(intersection);
      },
      /**
       * Build YAxis region for graph Settings
       * @param $root -> $(".ui-layout-west") 
       */
      _buildYAxis:function($root){
    	    var $yaxis =$("<div>", {"class": "graphYAxis"});
    	  	var $yaxisHeader = $("<div>", {"class": "graphYAxisHeader"}).append($('<span></span>').text(this.options.getLocaleString("Graph.YaxisHeader"))); 	
            var $yaxisDisplay =$("<div>", {"class": "graphSettingsGrid"});   
            // Load Grid information based on available measures from cube definition
            this._loadGridValues($yaxisDisplay,this.options.availableMeasures);
            $yaxis.append($yaxisHeader);
            $yaxis.append($yaxisDisplay);
            $root.append($yaxis);
      },
      /**
       * Build XAxis region for graph Settings
       * @param $root -> $(".ui-layout-west") 
       */
      _buildXAxis:function($root){
    	    var $xaxis =$("<div>", {"class": "graphXAxis"});
    		var $xaxisHeader = $("<div>", {"class": "graphXAxisHeader"}).append($('<span></span>').text(this.options.getLocaleString("Graph.XaxisHeader")));
// TODO GK: Add comment to move to glyphs. Comment next 1 line.
      	  	var $graphSettingImg =$('<span title="'+this.options.getLocaleString("Graph.Tooltip.SlideIn")+'"class="graphSettingsHeaderImg"></span>'); //$('<img  title="'+this.options.getLocaleString("Graph.Tooltip.SlideIn")+'" class="graphSettingsHeaderImg" src="'+this.options.imgPath+"graph-slide-in.png"+'"></img>');
// TODO GK: Remove comment to move to glyphs. Uncomment next 1 line.
      	  	/*var $graphSettingImg =$('<span  title="'+this.options.getLocaleString("Graph.Tooltip.SlideIn")+'" class="graphSettingsHeaderImg fa fa-angle-double-left fa-lg"></span>');*/
      	  	$xaxisHeader.append($graphSettingImg);
    	   	var $xaxisContent =$("<div>", {"class": "graphXAxisContent"});
    	    var $dimensionSelector = $("<span>", {"class": "dimensionSelector"});
    	    var $dimensionLevelSelector = $("<span>", {"class": "dimensionLevelSelector"});
    	    // Identify the time facet from cube definition
    	    var timeFacet = this._getTimeFacet(this.options.availableFacets);
    	    // load dimension  & level name on drop down.  
    	    this._loadFacet($dimensionSelector,this.options.availableFacets,timeFacet);
    	    this._loadFacetLevel($dimensionLevelSelector,this.options.availableFacets,timeFacet);
    	    // create table for xaxis region
    	    var $xaxisTableContent = $("<div>", {"class": "xaxisDimensionSelector"});
    	    var $dimension =$('<div><span>'+this.options.getLocaleString("Graph.SelectDimension")+'</span></div>');
    	    $dimension.addClass("dimensionFont xaxisLabel");
    	    var $level =$('<div><span>'+this.options.getLocaleString("Graph.DisplayLevel")+'</span></div>');
    	    $level.addClass("levelFont xaxisLabel");
    	    var $dimSel =$("<div>", {"class": "dimSelector xaxisSelector"}).append($dimensionSelector);
    	    var $lvlSel =$("<div>", {"class": "lvlSelector xaxisSelector"}).append($dimensionLevelSelector);
    	    $("<div>", {"class": "dimRow"}).append($dimension).append($dimSel).append($level).append($lvlSel).appendTo($xaxisTableContent);
    	   
    	    $xaxisContent.append($xaxisTableContent);
    	    $xaxis.append($xaxisHeader).append($xaxisContent);
    	    $root.append($xaxis);
    	     	  
      },
      
      /**
       * Build Graph Setting on West pane of Layout
       * @param root $(".ui-layout-west");
       */
      buildGraphSettings:function(cube){
    	  var $pivotGraphSetting=$(this.element).find('.ui-layout-west');
    	  $pivotGraphSetting.empty();
    	  var pivotGraph = this;
    	  this.options.availableFacets=cube.availableFacets;
    	  this.options.availableMeasures=cube.visiblemeasures;
    	  var availableFacet =cube.availableFacets;
    	  pivotGraph.options.scenariosDimensionKey = cube.scenariosDimensionKey;
    	  //	var visibleMeasure =cube.definition.visiblemeasures;
    	  	var backupCube ={
    	  			availableFacets : availableFacet,
    	  			availableMeasures :undefined
    	  	};
    	  	pivotGraph.options.backupCube=backupCube;


    	  	var $commitSetting=$("<div>", {"class": "commitSettings"});
         
          	// Error Header show validation error message 
    	   	var $notificationHeader =$("<div>", {"class": "notificationHeader"});
    	   	// Reset, Save button
    	   	var $saveButton =$('<input type="button"  class="saveSetting j-pvt-primary-button"/>');
    	   	$saveButton.prop("value",this.options.getLocaleString("Graph.Save"));
    		//Some users may not have permision to modify saved graph or adding new graph
    	   	if(this.options.canModify && cube.uiAttributes &&  cube.uiAttributes.canModifyGraph === false){
    	   		this.options.canModify = cube.uiAttributes.canModifyGraph;
    	   	}
    	   	var that = this;
	   		setTimeout(function(){ 
	   			var $saveButton = $(".saveSetting");
	   			if($saveButton){
	   				if(that.options.canModify){
		    	   		$saveButton.removeAttr("disabled");
		    	   		$saveButton.removeClass("pvtTransparent");
		    	   	}else{
		    	   		$saveButton.prop("disabled",true);
		    	   		$saveButton.addClass("pvtTransparent");
		    	   	}	
	   			}
			  }, 500);
    	   	var $clearButton=$('<input type="button"  class="clearSetting j-pvt-button"/>');
    	   	$clearButton.prop("value",this.options.getLocaleString("Graph.Clear"));
    	   
    	   	$commitSetting.append($saveButton).append($clearButton).append($notificationHeader);
    	   	

    	   	// build x axis layer
    	   	this._buildXAxis($pivotGraphSetting);
    	   	// build y axis layer
    	   	this._buildYAxis($pivotGraphSetting);
    	   	
    	   	
    	   	$pivotGraphSetting.append($commitSetting);
    	   	// bind save and clear button
    	   	this._bindEvent($saveButton, this._events.saveButton);
    	    this._bindEvent($clearButton, this._events.clearButton);
    	    //this.pivotflyoutopen();
    	      	    
      },
      
      /**
       * Load Grid Values based on available measures
       */
      _loadGridValues:function(target,measures){
    	 var pivotGraph=this;
    	 var $scrollGrid=$("<div>", {"class": "scrollGrid"});
    	 var $grid=$('<table class="settingsGrid"></table>').appendTo($scrollGrid);
    	 var $gridHeaderTable=$('<table class="settingsHeaderGrid"></table>');
    	 var $gridTbody =$('<tbody></tbody>');
    	 var $gridHeader=$('<tr class="gridHeader"></tr>').appendTo($gridHeaderTable);
    	 

    	 	$('<th class="chxBox"><input id="gridSelectAll" type="checkbox"/></th>').appendTo($gridHeader);
    		$('<th class="axis">'+this.options.getLocaleString("Graph.DisplayAxis")+'</th>').appendTo($gridHeader);
    	 	$('<th class="msrValue">'+this.options.getLocaleString("Graph.MeasureValues")+'</th>').appendTo($gridHeader);
    		$('<th class="graphTypes">'+this.options.getLocaleString("Graph.GraphType")+'</th>').appendTo($gridHeader);

    	 
    	 target.append($gridHeaderTable);
    	 $grid.append($gridTbody);
    	 var gridClass="";
    	 var backUpMeasure=[]; 
    	 /*var w1,w2,w3,w4;*/
		 var $graphTypeSelector,$row=undefined,$toggleButton;
		 // Grid row data
    	 for(var i=0; i<measures.length;i++){
    	 	 if(this._hasInValidType(measures[i].typeName)){
    			continue; 
    		 }
    		 gridClass= i%2==0?"gridEvenData":"gridOddData";
    		 $row = $('<tr></tr>').prop("id","measureRow"+measures[i].id).addClass("gridData").addClass(gridClass);
    		 //$row = $('<tr id="measureRow' + measures[i].id + '" class="gridData '+gridClass+'"></tr>');
    		 
    		 // 1st column Checkbox selection
    		 $("<td class='chxBox'></td>").append("<input id='measureSelector' type='checkbox'></input>").appendTo($row);
    		 
    		 // 2nd column show Toggle Button axis selection
    		 $toggleButton=$("<td  class='axis'></td>");
    		 this._getToggleButton($toggleButton,i);
    		 $toggleButton.appendTo($row);	
    		 
    		 // 3rd column shows Measure Names 
    		 $("<td></td>").prop("id",measures[i].id).prop("title",measures[i].label).addClass("msrName").text(measures[i].label).appendTo($row);
    		 
    		//$("<td id='"+measures[i].id+"' title='"+measures[i].label+"'class='msrName'>"+measures[i].label+"</td>").appendTo($row);
    		 backUpMeasure.push(measures[i].id);
    		 
    		 // 4th column shows graph type
    		 $graphTypeSelector = $('<span class="graphTypeSelector pvt-Disable" disabled></span>');
    		 this._loadOptions($graphTypeSelector,pivotGraph.options.graphTypes.split("~"));
    		 $("<td class='graphTypes'></td>").append($graphTypeSelector).appendTo($row);
    		 
    		 $row.appendTo($gridTbody);
    		 gridRow=i;
    	 }
    	 //this.options.backupCube.availableMeasures=backUpMeasure;
    	 
    	 
    	 target.append($scrollGrid);
    	 
    	 // var interactiveSettings = this.options.interactiveToSettings;
    	 
    	 // Click Event on Select all check box
    	 $gridHeaderTable.on("click","#gridSelectAll",function(e){
    		 var target = e.srcElement || e.target;
    		 var isChecked =target.checked;
    		 if(isChecked === true){
    			 pivotGraph._hideValidationError();
    		 }
    		 var $measure = $grid.find("td #measureSelector");
    		 $measure.prop("checked",isChecked);
			 var gridRow = $grid.find("tr.gridData");
			 for ( var i = 0; i < gridRow.length; i++) {			 
				 pivotGraph._selectGridRow($(gridRow[i]), isChecked);
			}
			 //if(interactiveSettings){
				 // interactive option any check is happening on graph settings			   
				 pivotGraph._sendGraphRequest();
			 //}
    	 });
    	 
    	 // Click Event for grid row check box
    	 $grid.on("click","input#measureSelector",_.debounce(function(){
    		  	pivotGraph._delayMeasureCheck(this);
    		  },this.options.interactiveToSettings && this.options.delayTimeout,false));
      },
      
      /**
       * Delay Measure check
       * @param that
       */
      _delayMeasureCheck : function(that){
    	  //hide ValidationError
    	  this._hideValidationError();
    	  var $grid=$(this.element).find('table.settingsGrid');
    	  var $gridHeader =$(this.element).find('table.settingsHeaderGrid');
    	  var $selectAll = $gridHeader.find("#gridSelectAll");
		  var checkedMeasure = $grid.find('input#measureSelector:checked');
		  var gridRow = $grid.find("tr.gridData");
		  if(checkedMeasure.length === gridRow.length)
			$selectAll.prop("checked",true);
		  else
			$selectAll.prop("checked",false);
		  for( var i = 0; i < gridRow.length; i++) {			 
    			  this._selectGridRow($(gridRow[i]), $(gridRow[i]).find('#measureSelector').prop('checked'));
    	  }
 		  this._sendGraphRequest();
      },
      

      /**
       * Update the UI to reflect the setting that was prevously saved on the server.
       * 
       * @param setting saved setting
       */
      _applySavedSetting:function(setting){
    	  if(setting == undefined){
    		  return;
    	  }
    	  // set flag to avoid setting request during toggle button click
    	  this.canSendRequest = false;
    	  
    	  var $root =$(this.element);

		  var $dimSelector =$root.find('.dimensionSelector');
		  // dimension selector select dimension values
		  var $dropDown = $dimSelector.find('.dropDownSelector');
		  var text = $dropDown.text();
		  var $dimListValue = $dimSelector.find("#"+setting.xAxisDimension+"");
		  
		  $dropDown.html($dropDown.html().replace(text,$dimListValue.text()));
		  
		  $dropDown.data('dataId',$dimListValue.data('dataId'));
		  // dimension level selection
		  var $levelSelector =$root.find('.dimensionLevelSelector');
		  $levelSelector.empty();
		  this._loadFacetLevel($levelSelector,this.options.availableFacets,setting.xAxisDimension);
		  
		  // selecting saved level for dimension
		  $dropDown = $levelSelector.find('.dropDownSelector');
		  text = $dropDown.text();
		  
		  var dimLevel = setting.xAxisLevel;
		  // For referenec app level is of form "#LEVEL#@-@Product@-@Product@SBU
		  // application team may or may not follow same convention
		  if(dimLevel.search("@") >0 )
			  dimLevel = dimLevel.slice(dimLevel.lastIndexOf("@")+1,dimLevel.length);
		  var $levelListValue =  $levelSelector.find('#'+dimLevel+"");
		  // checking whether level options available on current view
		  if($levelListValue.length>0)
		  {
		  		$dropDown.html($dropDown.html().replace(text,dimLevel));
				$dropDown.data('dataId',setting.xAxisLevel);
		  }
		  
		  
    	  var measureConfigs = setting.measuresIds;
    	  for(var i = 0; i < measureConfigs.length; i ++){
    		  var measureConfig = measureConfigs[i];
    		  var tokens = measureConfig.split("~");
    		  var measureId = tokens[0];
    		  var measureGraphType = tokens[1];
    		  var measureOnLeft = (tokens[2] == '0');
    		  var msrRowId = "measureRow"+measureId;
 			 
    		  var $measureRow = $root.find("[id='"+msrRowId+"']");
    		  // check whether current measure is available on screen. 
    		  // If it is available then proceed, then go for next measure.
    		  if($measureRow && $measureRow.hasClass("gridData")){
    		  
	    		  // enable the row for the measure
				  this._selectGridRow($measureRow, true);
				  
	    		  // set the measure axis
	    		  var $toggle =$measureRow.find(".toggleButton");
	    		  if(measureOnLeft){
	    			  var $leftButton = $toggle.find(".leftAxisButton");
	    			  $leftButton.click();
	    		  } else {
	    			  var $rightButton = $toggle.find(".rightAxisButton");
	    			  $rightButton.click();
	    		  }
	    		  
	    		  // set the measure graph type
		      	  var $graphType =$measureRow.find(".graphTypeSelector");	
	      	      
	    		  $dropDown = $graphType.find('.dropDownSelector');
	    		  text = $dropDown.text();
	    		  $dropDown.html($dropDown.html().replace(text,measureGraphType));
	
				  // select the measure
	    		  $measureRow.find("td #measureSelector").prop("checked", true);
    		  }
    	  }
    	  this.canSendRequest = true;
    	  this._delayMeasureCheck(this);
    	  //this._postProcessCheck();
      },
      
      /**
       * Create Toggle Button 
       * @param target
       * @param id
       */
      /*_getToggleButton:function($target,id){
    	  
    	  var pivotGraph =this;
    	  var $toggleButton=$("<div class='toggleButton'></div>");
    	 
    	  var $leftButton=$('<img src="'+this.options.imgPath+'toggle-left'+'.png" class="leftAxisButton"  title ="'+pivotGraph.options.getLocaleString("Graph.Tooltip.rightAxis")+'"/>');
		  var $rightButton=$('<img src="'+this.options.imgPath+'toggle-right'+'.png" class="rightAxisButton"  title ="'+pivotGraph.options.getLocaleString("Graph.Tooltip.leftAxis")+'"/>');
		  
		  var $toggleDisable=$('<img src="'+this.options.imgPath+'toggle-disable'+'.png" class="toggleDisable"/>');
		  
		 $toggleDisable.appendTo($toggleButton);
		 $leftButton.appendTo($toggleButton);
		 $rightButton.appendTo($toggleButton);
		 

    	  $target.append($toggleButton);
    	  pivotGraph._bindEvent($leftButton,pivotGraph._events.toggleLeft);
    	  pivotGraph._bindEvent($rightButton,pivotGraph._events.toggleRight);
    	  $leftButton.click();
      },*/
      _getToggleButton:function($target,id){
    	  
    	  var pivotGraph =this;
    	  var $toggleButton=$("<div class='toggleButton'></div>");
    	  $("<input type='radio' id='leftAxis"+id+"' class='left' name='radio"+id+"' checked='true'></input>" +
    	  		"<label title ='"+pivotGraph.options.getLocaleString("Graph.Tooltip.leftAxis")+"' class='ui-icon leftAxisButton left' for='leftAxis"+id+"'></label>").appendTo($toggleButton);
    	  $("<input type='radio' id='rightAxis"+id+"' class='right' name='radio"+id+"'></input>" +
    	  		"<label title ='"+pivotGraph.options.getLocaleString("Graph.Tooltip.rightAxis")+"' class='ui-icon rightAxisButton right' for='rightAxis"+id+"'></label>").appendTo($toggleButton);
    	  
    	  var $leftButton = $toggleButton.find(".leftAxisButton");
    	  var $rightButton =$toggleButton.find(".rightAxisButton");
    	  
    	  $leftButton.text("");
    	  $rightButton.text("");
    	  $target.append($toggleButton);
    	  
    	 
    	  $toggleButton.controlgroup();
    	  
    	  pivotGraph._bindEvent($leftButton,pivotGraph._events.toggleLeft);
    	  pivotGraph._bindEvent($rightButton,pivotGraph._events.toggleRight);
    	  $leftButton.click();
      },
      
      /**
       * Reset Grid Values to default
       * @param $grid jquery object
       * @param widget
       */
      _unSelectAllGrid:function($grid,widget){
    	  var $gridHeader =$(this.element).find("table.settingsHeaderGrid");
    	  var $selectAll = $gridHeader.find("input#gridSelectAll");
    	      $selectAll.prop("checked",false);
    	  var $measure = $grid.find("td #measureSelector");
 		 	  $measure.prop("checked",false);
 		 	$grid.find('span.graphTypeSelector').val('');
			 var gridRow = $grid.find("tr.gridData");
			 var $toggle;
			 for ( var i = 0; i < gridRow.length; i++) {	
				 $toggle = $(gridRow[i]).find('.toggleButton');
				 $toggle.find('input:first-child').prop("checked",true);				 
				 widget._selectGridRow($(gridRow[i]), false);
				 $toggle.controlgroup("refresh");
			}
		
			 
      },
      
      /**
       * Select row in Grid  includes focus when checkbox checked.
       * @param $row
       * @param isChecked
       */
      _selectGridRow:function($row,isChecked){
    	   
    		// var $row= $rowData.parent().parent();
    	    var $toggler =$row.find("td > div.toggleButton");
    	    var $graphType =$row.find("td.graphTypes >span.graphTypeSelector");
    		var $activeToggle = $toggler.find(".toggleFocus");
    		
    		if($activeToggle.length == 0){
    			$activeToggle = $toggler.find(".ui-state-active");
    		}
			
			if(isChecked === false){
				$activeToggle.removeClass("toggleFocus");
				 $row.removeClass("gridFocus");
				 $graphType.prop("disabled",true).addClass("pvt-Disable");
				 $toggler.controlgroup( "option", "disabled", true );

			}else{
				$activeToggle.addClass("toggleFocus");
				 $row.addClass("gridFocus");
				 $graphType.prop("disabled",false).removeClass("pvt-Disable");
				 $toggler.controlgroup( "option", "disabled", false );
			}
    	
      },
      
      /**
       * Set intersection information on graph header
       * @param intersection
       */
      _setIntersection:function(intersection){
    		//var intr="Intersection:  ";
    	    var intr = this.options.getLocaleString("Graph.Intersection")+":  " ;
			var spt=[];
			this.options.intersection=intersection;
			var xAxisDimension = $('.graphXAxisContent .dimensionSelector').find('.dropDownSelector').text();;
			intersection = $.grep(intersection,function(dimensions){
				return !(dimensions.facetLabel===xAxisDimension);
			});
			
			// Order the members that make up the intersection 
			// by the dimension names, with the measure name
			// always at the end.
			intersection.sort(function(a,b){
				if(a.facetLabel == "Measure"){
					return 1;
				}
				if(b.facetLabel == "Measure"){
					return -1;
				}
				if(a.facetLabel < b.facetLabel){
					return -1;
				}
				if(a.facetLabel > b.facetLabel){
					return 1;
				}
				return 0;
			});
			var intrLength =intersection.length;
			for(var i=0; i<intrLength-1;i++){
				spt = intersection[i].facetLevelLabelObj.toString().split(",");
				var hierarchy = [intersection[i].facetLabel].concat(intersection[i].facetLevelLabelObj).toString().replace(/,/g,'  ');
				if(spt.length==1 && spt[0].length==0){
					spt[0]=this.options.getLocaleString("TotalMemberName");
				}
					
				if(i==intrLength-2)
					intr+= '<span title="'+hierarchy+'">'+spt[spt.length-1]+'</span>';
				else
					intr += '<span title="' + hierarchy+'">'+spt[spt.length-1]+'</span>'+" <span class='intersectionDelimiter'></span> ";
			}

			intr+=" ";
 			var $graphHeader = $(".ui-layout-center").find(".graphHeader");
 			$graphHeader.html(intr);
      },
      
      /**
       * Get all Available measures which are selected. This method is called before sending graph request to identify 
       * selected measure 
       * @returns {Array}
       */
      _getAvailableMeasure:function(){
    	  var msr =[];
    	  var $grid = $(this.element).find("div.graphYAxis div.graphSettingsGrid table.settingsGrid");
    	  var children=$grid.find("tr.gridData input#measureSelector:checked");
    	  var measure="";
    	  var isDual=false;
    	  var $row;
    	  for(var i=0;i<children.length;i++){
    		  
    		     $row = $(children[i]).parent().parent();
    		     isDual= $row.find(".toggleButton .toggleFocus").hasClass("rightAxisButton");
    		     measure+=$row.find("td.msrName").prop("id")+"~";
    		     measure+=$row.find("td .dropDownSelector").text()+"~";
    	
    		  if(isDual){
    			measure+="1";  
    		  }
    		  else{
    			  measure+="0";
    		  }
    		  msr.push(measure);
    		  measure="";
    	  }
    	  return msr;
      },
      

      /**
       * Load options for select element
       */
      _loadOptions:function(target,options){
    	  var $spanDiv = $("<div class='dropDownSelector'></div>");
    	  var $img = $('<img  title="'+this.options.getLocaleString("Graph.Tooltip.DropDown")+'" class="dropDownImg" src="'+this.options.imgPath+"dropDown.png"+'"></img>');
    	  $spanDiv.append($img);
    	  var ul = $('<ul class="dropDownList"></ul>');
    	  $spanDiv.html($spanDiv.html() + this.options.getLocaleString("Graph.GraphType."+options[0]));
    	  for (var i = 0; i < options.length; i++) {
    		  
    		 // var $option = $('<li>'+options[i]+'</li>');
    		  var $option = $('<li>'+this.options.getLocaleString("Graph.GraphType."+options[i])+'</li>');
    		  ul.append($option);
    		 //$('<option></option>').val(options[i]).text(options[i]).appendTo(target);
		  }
    	  target.append($spanDiv);
    	  target.append(ul);
    	  this._bindEvent(ul, this._events.graphTypeList);
    	  this._bindEvent(target, this._events.dropDownLeave);
    	  this._bindEvent($spanDiv, this._events.graphTypeSelect);
    	  this._bindEvent($img, this._events.graphTypeSelect);
      },
      
      /**
       * Load Facet names to select box (x-axis dimension selector)
       * @param target
       * @param options
       * @param defaultFacet
       */
      _loadFacet:function(target,options,defaultFacet){
    	  var $spanDiv = $("<div class='dropDownSelector'></div>");
    	  var $img = $('<img  class="dropDownImg" src="'+this.options.imgPath+"dropDown.png"+'"></img>');
    	  $spanDiv.append($img);
    	  var ul = $('<ul class="dropDownList"></ul>'); 
    	  for (var i = 2; i < options.length; i++) {
    		 if(options[i].name ==  this.options.scenariosDimensionKey){
    			  continue;
    		 } 
    		 var $option = $('<li>'+options[i].getDisplayName()+'</li>');
    		 $option.data('dataId',options[i].name).prop("id",options[i].name);
    		 
    		 if(options[i].getDisplayName() === defaultFacet){
    			 $option.addClass("selected");
    			 $spanDiv.html($spanDiv.html()+options[i].getDisplayName());
    			 $spanDiv.data('dataId',options[i].name);
    		 }
    		 
    		 ul.append($option);
    	  }    	  
    	  target.append($spanDiv);
    	  target.append(ul);
    	  this._bindEvent(ul, this._events.dropDownList);
    	  this._bindEvent(target, this._events.dropDownLeave);
    	  this._bindEvent($spanDiv, this._events.dropDownSelect);
    	  this._bindEvent($img, this._events.dropDownSelect);
      },
      
      /**
       * Load hierarchy level based on dimension selection
       * @param target
       * @param options
       * @param optionName
       */
      _loadFacetLevel:function(target,options,optionName,selectedLevel){

    	  var spanDiv = $("<div class='dropDownSelector'></div>");
    	  var ul = $('<ul class="dropDownList"></ul>'); 
    	  spanDiv.append($('<img  title="'+this.options.getLocaleString("Graph.Tooltip.DropDown")+'" class="dropDownImg" src="'+this.options.imgPath+"dropDown.png"+'"></img>'));
    	  var levels =this._getAvailableLevel(options, optionName);
    	  spanDiv.html(spanDiv.html() + levels[0].attributeName);
    	  spanDiv.data('dataId',levels[0].attributeId);
    	  for (var i = 0; i < levels.length; i++) {
    		  	var $option = $('<li>'+levels[i].attributeName+'</li>');
    		  	$option.data('dataId',levels[i].attributeId);
    		  	$option.prop('id',levels[i].attributeName);
    		  	ul.append($option);
    	  }    	  
    	  target.append(spanDiv);
    	  target.append(ul);
    	  this._bindEvent(ul, this._events.dropDownList);
    	  this._bindEvent(target, this._events.dropDownLeave);
    	  this._bindEvent(spanDiv, this._events.dropDownSelect);
      },
      
      /**
       * Identify time facet name from available facet
       * @param availableFacet
       * @returns
       */
      _getTimeFacet:function(availableFacet){
    	  // 0 - side dummy facet . 1 - top dummy facet..
    	  for (var i = 2; i < availableFacet.length; i++) {
    		  
    		  if(availableFacet[i].timeFacet){
    			  return availableFacet[i].getDisplayName();
    			  
    		  }
    		 
 		  }
    	  // if time facet not available then pick first facet.
    	 return availableFacet[2].getDisplayName(); 
    	  
      },
      
      _getAvailableLevel:function(options,optionName){
    	  var filterLevel =undefined;
    	  var levels =undefined;
    	  for (var i = 2; i < options.length; i++) {
    		  if(options[i].getDisplayName() === optionName || options[i].name === optionName){
    			  if(options[i].UIAttributes.Filters){
    				  // Checking for level filtered or not. 
    				  //If so we need to show appropriate levels in dropdown
    				  filterLevel=options[i].UIAttributes.Filters.facetLevelName;
    				  levels= this._getFilteredLevel(options[i].visibleLevels, filterLevel);
    				  break;
    			  }
    			  levels = options[i].visibleLevels;
    			  break;
    		  }
 		  }
    	  
    	  return levels;
      },
    
      _getFilteredLevel:function(levels,filterLevel){
    	  var newLevel= new Array();
    	  var canAdd= this.options.getLocaleString("TopLevelName") === filterLevel ? true :false;
    	  // this.options.getLocaleString("TotalMemberName")
    	  for(var i=0,j=0; i<levels.length;i++){
    		  if(levels[i].attributeName === filterLevel){
    			  canAdd=true;
    			  newLevel[j]=levels[i];
    			  //break;
    		  }

    		  if(canAdd){
    			  newLevel[j]=levels[i];
    			  j++;
    		  }
    	  }
    	  return newLevel;
      },
      /**
       * create graph request based on current selection on graph settings.
       */
      _sendGraphRequest:function(){
    	  
    	  if(!this.options.cellChange && !this.options.interactiveToSettings){
    		  // not interactive to settings
    		  return;
    	  }
    	
    	  var data={};
    	  var $root =$(this.element).find(".ui-layout-west");
    	  var $xaxis =$root.find(".graphXAxis >.graphXAxisContent > .xaxisDimensionSelector");
    	  var $graphArea = $(this.element).find("#pvt-graph-grapharea");	
    	  data.xaxis= $xaxis.find(".dimensionSelector").find('.dropDownSelector').data('dataId');
    	  data.xaxisLevelId=$xaxis.find(".dimensionLevelSelector").find('.dropDownSelector').data('dataId');
    	  data.xaxisLevelName=$xaxis.find(".dimensionLevelSelector").find('.dropDownSelector').text();
    	  data.availableMeasures=this._getAvailableMeasure();
    	  data.operation= 'view';
    	  data.cellId = this.options.cellId;

    	  if(data.cellId === undefined){
    		  // check cell is selected in pivot
    		  this.destroyPivotHighchartsObj();
    		  $graphArea.hide();
    		  //$graphArea.empty();
    		  this._showError(this.options.getLocaleString('Graph.SelectCellToProceed'));
    		  return;
    	  }else if(data.availableMeasures.length === 0){
    		  // check measure is selected in graph settings
    		  this.destroyPivotHighchartsObj();
    		  $graphArea.hide();
    		  this._showError(this.options.getLocaleString('Graph.MeasureNotFound'));
    		  return;
    	  }else if($graphArea.is(':hidden')){
    		  $graphArea.show();
    	  }
    	  this._hideError();
    	  this.options.graphData = data;
    	  // Execute Action (creating new request for graphData in pivot Object)
    	  this.options.executeAction(undefined,data);
    	  
       },
       
       _saveGraphSettingsRequest : function(){
    	   var $xaxis =$(this.element).find(".graphXAxis >.graphXAxisContent > .xaxisDimensionSelector");
    	   
    	   var data={};
    	   data.operation='save';
    	   data.xaxis= $xaxis.find(".dimensionSelector").find('.dropDownSelector').data("dataId");
    	   //data.xaxisLevelId=$xaxis.find(".dimensionLevelSelector").find('.dropDownSelector').text();
    	   data.xaxisLevelId=$xaxis.find(".dimensionLevelSelector").find('.dropDownSelector').data("dataId");
    	   data.availableMeasures=this._getAvailableMeasure();
    	   if(data.availableMeasures && data.availableMeasures.length ==0){
    		   this._showValidationError();
    	   }else{
    		   this._hideValidationError();
    		   this.options.executeAction(undefined,data); 
    	   }
       },
       /**
        * Bind appropriate events to selector
        * @param selector
        * @param events
        */
	    _bindEvent: function(selector,events) {
		       var widget = this;
		            $.each(events, function(eventName, callback) {
		            	try {
		                $(selector).bind(eventName, function(e) {
		                    callback.apply(this, [e, widget]);
		                });
		              
		            }catch(e){};});
		    },
	  /**
	   * Show Validation Error
	   */	    
	  _showValidationError:function(){
		  var $root =$(this.element).find('.ui-layout-west');
		  var $notificationDiv = $root.find(".notificationHeader");
		  $notificationDiv.empty();
		  var validationMsg = this.options.getLocaleString('Graph.Validation_Failed');
		  $("<span>", {"class": "errorText"}).html('<span>'+validationMsg+'</span>').appendTo($notificationDiv);
		  $('<span ><img class="warningImg" src="'+this.options.imgPath+'warning.png"/></span>').appendTo($notificationDiv);
		  $root.find(".saveSetting").prop("disabled",true);
		  $root.find(".saveSetting").addClass("pvtTransparent");
	  },
	  /**
	   * Hide Validation Error on graph Settings
	   */
	  _hideValidationError:function(){
		  var $root =$(this.element).find('.ui-layout-west');
		  $root.find(".notificationHeader").empty();
		  if(this.options.canModify){
			  $root.find(".saveSetting").removeAttr("disabled");
			  $root.find(".saveSetting").removeClass("pvtTransparent");  
		  }
	  },
      /**
       * Show validation error
       * @param errorMsg
       */
      _showError:function(errorMsg){
    	  var $graphError = $(this.element).find('.ui-layout-center .errorHeader');
    	  $graphError.show();
    	  $graphError.empty();
    	  $('<span ><img class="warningImg" src="'+this.options.imgPath+'warning.png"/></span>').appendTo($graphError);
    	  $("<span>", {"class": "errorText"}).html('<span>'+errorMsg+'</span>').appendTo($graphError);
      },
      showNotification:function(status,savedSettings){
    	  var $notificationDiv = $(this.element).find(".ui-layout-west .notificationHeader");
		  $notificationDiv.empty();
		  var notification = status ? this.options.getLocaleString('Graph.Save_Successful'):this.options.getLocaleString('Graph.Save_Failed');
		  var imgName = status ? 'ok':'cancel';
		  $('<span class="notificationText">'+notification+'</span>').appendTo($notificationDiv);
		  $('<span ><img class="notificationImg" src="'+this.options.imgPath+imgName+'.png"/></span>').appendTo($notificationDiv);
		  
		  if(status){
			  // Save the settings if status has true flag
			  this.options.graphSetting=savedSettings;
		  }
		  setTimeout(function(){ 
			  $notificationDiv.empty();
		  }, 1000);
      },
      /**
       * clear settings panel 
       */
      clearAll:function(){
    	  	var widget = this;
    		var $root =$(widget.element).find('.ui-layout-west');
			var $xaxis =$root.find('.graphXAxis');
			var $yaxis =$root.find('.graphYAxis');
			   		   
			var $dimSelector =$xaxis.find('.dimensionSelector');
		    var $dimLevelSelector=$xaxis.find('.dimensionLevelSelector');
		    
		    //We reach here when no saved graph settings, reset X-Axis dimension and level to default values as on initial load
		    
		    $dimSelector.empty();
		    $dimLevelSelector.empty();
		    var xAxisDimension = widget._getTimeFacet(widget.options.availableFacets);
		    widget._loadFacet($dimSelector,widget.options.availableFacets,xAxisDimension);
		    widget._loadFacetLevel($dimLevelSelector,widget.options.availableFacets,xAxisDimension);
		    
		    var $grid =$yaxis.find("table.settingsGrid");
		    // reset all graphType inside grid 
		    var $graphType = $grid.find('span.graphTypeSelector');
		   
		    for(var i=0; i<$graphType.length;i++){
		    	$($graphType[i]).empty();
		    	widget._loadOptions($($graphType[i]),widget.options.graphTypes.split("~"));		    	
		    }
		    
		    // reset to default values in grid 
		    widget._unSelectAllGrid($grid,widget);
		   
		    // Hide Error div
		    widget.onCellChange(widget.options.cellId,widget.options.intersection);
		    // clear error message
		    widget._hideValidationError();
      },
      /**
       * Hide Validation error
       */
      _hideError:function(){
    	  var $root =$(this.element);
    	  var $errorDiv = $root.find('.errorHeader');
    	  $errorDiv.hide();
      },
	      
       /**
        * Event Handler
        */
      _events : {
    	 
  		    toggleLeft:{
  		    	click:function(e,widget){
  		    		var target = e.srcElement || e.target;	
  		    		var $parent = $(target).parents(".toggleButton");
  		    		var $target = $parent.find(".leftAxisButton");
  		    		var $gridRow = $parent.parent().parent();
  		    		
  		    		if($gridRow.hasClass("gridFocus")){ 
  			    		$target.addClass("toggleFocus");
  	  		    		$parent.find(".rightAxisButton").removeClass("toggleFocus");
    	    			 if(widget.canSendRequest){
    	    			    widget._sendGraphRequest();
    	    			    //widget._postProcessCheck();
    	    			 }
  			    	  }
  		    		
  		    	}
  		    },
  		    toggleRight:{
  		    	click:function(e,widget){
  		    		 var target = e.srcElement || e.target;	
  		    		 var $parent = $(target).parents(".toggleButton");
  			    	 var $target = $parent.find(".rightAxisButton");
  			    	 
  			    	 var $gridRow = $parent.parent().parent();
  			    	
  			    	  if($gridRow.hasClass("gridFocus")){ 
  			    		$target.addClass("toggleFocus");
  	  		    		$parent.find(".leftAxisButton").removeClass("toggleFocus");
  	  		    		 if(widget.canSendRequest){
    	    			  widget._sendGraphRequest();
  	  		    		 // widget._postProcessCheck();
  	  		    		 }
  			    	  }
  		    	}
  		    },	
    	  		
    	  			dropDownSelect : {
    	  				click : function(e, widget){
    	  					var target = e.srcElement || e.target;
    	  					var $target = ($(target).parent('.dimensionSelector').length || $(target).parent().parent('.dimensionSelector').length) ? $(target).parents('.dimensionSelector') : $(target).parents('.dimensionLevelSelector');
    	  					var dropDown = $target.find('ul');
	  						dropDown.width($target.find('.dropDownSelector').outerWidth());
	  						dropDown.find('li').height($target.find('.dropDownSelector').height());
	  						dropDown.css({"display" : "block"});
	  						var targetRect = target.getBoundingClientRect();
	  						dropDown.css({'top': targetRect.bottom});
    	  					
    	  				}
    	  			},
    	  			// 	Event for Dimension Selection and Dimension Level Selection
    	  			dropDownList :{
    	  				click : function(e, widget){
    	  					var target = e.srcElement || e.target;
    	  					//Fix for MDAP-1898.Should not select any value when click the mouse button and do not release it and scroll down till Column and release the button.
    	  					if(target && target.className != 'dropDownList'){
    	  						var $grandParent = $(target).closest(".xaxisDimensionSelector");
        	  					var $parent = $(target).closest('.xaxisSelector');
        	  					var targetDiv = $parent.find('.dropDownSelector');
        	  					var text = targetDiv.text();
        	  					targetDiv.html(targetDiv.html().replace(text,$(target).text()));
    	  						$parent.find('.dropDownSelector').data('dataId',$(target).data('dataId'));
    	  						$parent.find('.dropDownList').hide();
    	  						
    	  						widget._setIntersection(widget.options.intersection);
    							
    							
    							if($parent.hasClass('dimSelector')){
    	  							var dimensionLevel = $grandParent.find('.dimensionLevelSelector');
    	  							dimensionLevel.empty();
    	  							var selectedValue = $grandParent.find('.dimensionSelector .dropDownSelector').text();
    	  							// Load Level for current dimension
    	  							widget._loadFacetLevel(dimensionLevel,widget.options.availableFacets,selectedValue);
    							}    							
    							widget._sendGraphRequest();
    	  					}
    	  				}
    	  			},
				  	
    	  		// Event for Graph Type selection on grid(line,column,area)
					graphTypeSelect :{
						click : function(e, widget){
    	  					var target = e.srcElement || e.target;
    	  					var targetRect = target.getBoundingClientRect();
    	  					var $target =  $(target).closest('.graphTypeSelector');
    	  					
    	  					if($(target).closest('tr').hasClass('gridFocus')){
    	  						var dropDown = $target.find('ul');
    	  						dropDown.width($target.find('.dropDownSelector').outerWidth());    	  						
    	  						dropDown.css({"display" : "block"});
    	  						dropDown.css({"position" : "fixed"});
    	  						dropDown.css({'top': targetRect.bottom});
    	  						
        	  					var dropDownRect = $target.find('.dropDownSelector')[0].getBoundingClientRect();
    	  						dropDown.css({'left': dropDownRect.left});
    	  						var rect = dropDown.find('li').last()[0].getBoundingClientRect();
    	  						var visible = rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
    	  				        				rect.right <= (window.innerWidth || document.documentElement.clientWidth); /*or $(window).width() */
    	  						if(!visible){
    	  							dropDown.css({'top': 'auto'});
    	  							dropDown.css({'bottom':window.innerHeight-targetRect.top});  	  						}
    	  					}
    	  					return;
    	  				}
					},
					graphTypeList : {
    	  				click : function(e, widget){
    	  					var target = e.srcElement || e.target;
    	  					//Fix for MDAP-1898.Should not select any value when click the mouse button and do not release it and scroll down till Column and release the button.
    	  					if(target && target.className != 'dropDownList'){
    	  						var $parent = $(target).closest('span.graphTypeSelector');
        	  					var targetDiv = $parent.find('.dropDownSelector');
        	  					var text = targetDiv.text();
        	  					targetDiv.html(targetDiv.html().replace(text,$(target).text()));
    	  						$parent.find('.dropDownList').hide();
    	  						widget._setIntersection(widget.options.intersection);
    							widget._sendGraphRequest();
    	  					}
    	  				}
					},
					
					dropDownLeave : {
						mouseleave:function(e, widget){
    	  					var target = e.srcElement || e.target;
	  						$(target).parent().parent().find('ul').hide();
						},
					},
					// Event for Reset button
					clearButton:{
						click: function(e,widget){
						
							widget.clearAll();
							widget._applySavedSetting(widget.options.graphSetting);
						}
					},
					// Event for save button
					saveButton:{
						click:function(e,widget){
							//create new graph request
							 widget._saveGraphSettingsRequest();
						}
					}

		},
		
		/**
		 * Destroy Graph
		 */
		destroy:function(){
		  var $graphArea = $(this.element).find("#pvt-graph-grapharea");
		  this.destroyPivotHighchartsObj();
		  $graphArea.empty();
		  $(this.element).remove();					 
		},
		destroyPivotHighchartsObj : function (){
			$("#pivotGraphArea").highcharts() && $("#pivotGraphArea").highcharts().destroy();
		},
		
		/**
		 * This method used for only JS test cases to get reference of this object to validate data.
		 */
		getPivotGraphObj : function(){
			this._trigger( "pivotGraphObject", null, { value: this } );
		},
  });
      
})(jQuery,document,window);