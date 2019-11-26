//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.view.businessgraph.PivotHighChartWidget', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.pivothighchartwidget',
	config : {
		chartId:'',
		containerId:'',
		graphOptions:'',
		isClickContextRequired:true,
		isCustomTooltipRequired:true,
		graphData: null
	},
	layout: 'fit',
    initComponent : function() {
		var me = this;
		if(!me.chartId || me.chartId.length == 0){
			me.chartId = 'highChartId';
		}
		if(!me.containerId || me.containerId.length == 0){
			me.containerId = 'highChartContainerId';
		}
		this.id = "pivothighchartwidget-"+me.chartId;
		me.chartId = 'ChartId-' + this.chartId;
		var highChartPanel = Ext.create("Ext.panel.Panel", {
		    id: me.containerId,
		    listeners: {
		    	 boxready: function() {
		    		 //do some stuff after box ready.
		    	 },
		    }
		});
		me.items =highChartPanel;
		me.callParent(arguments);
	},
	afterRender : function() {
		var me = this;
	},
	onResize : function(width, height, oldWidth, oldHeight, eOpts ) {
		var container = $('#' + this.containerId);
		var chart =  container && Highcharts && $("#"+container.attr('id')).highcharts();
		chart && chart.setSize(width, height);
		//Re-setting the chart xAxis properties when resize the window using splitter in graph preview panel/resize browser window and re-draw with new properties.
		//No need to call drawchart as other properties like tool tip/style won't change.
		var graphData = this.graphData;
		if(graphData){
			var container = $('#' + this.containerId);
			var containerDivId = container &&  container.attr('id');
			this.customizedXAxisProps(graphData);
			Highcharts && Highcharts.chart(containerDivId,graphData);
		}
	},
	setHighChartOptions : function(graphData) {
		var thousandSeparator = graphData.chartStyles.thousandSeparator;
		var decimalSeparator = graphData.chartStyles.decimalSeparator;
		if(thousandSeparator == undefined || thousandSeparator == null){
			thousandSeparator = ",";
		}
		if(decimalSeparator == undefined || decimalSeparator == null){
			decimalSeparator =  ".";
		}
		Highcharts && Highcharts.setOptions({
		    lang: {
		    	 thousandsSep:thousandSeparator,
		    	 decimalPoint:decimalSeparator,
		    }
		});
	},
	drawChart : function(graphData) {
		var container = $('#' + this.containerId);
		var containerDivId = container &&  container.attr('id');
		if(graphData && graphData != null){
			//Alter the graph data to remove un-intended data(i.e. null/no cell data) to be removed.
			graphData = this._alterGraphData(graphData);
			
			if(this.isClickContextRequired){
				this._addClickEvent(graphData);
			}
			this._showHideGovernorExceededMsg(graphData);
			this._showHideWarningMessage(graphData);
			if(graphData.chartStyles){
				var chartStyles = graphData.chartStyles;
				for (key in chartStyles) {
					this.setObjByString(graphData, key, chartStyles[key]);
				}
				//Setting additional chart styles if any. i.e Thousand separator/decimal separator etc...
		    	this.setHighChartOptions(graphData);
				
				delete graphData.chartStyles;
			}
			//settings for scrolling
			if(graphData){
				this.customizedXAxisProps(graphData);
			}
			
			//Do some custom stuff
			this.addAditionalHighChartStyles(graphData);
			
			//Customized tool tip
			this.addCustomizedToolTip(graphData, this.isCustomTooltipRequired);
			
			//To display 'No Data to display' message when no data available.
			if(graphData.series && graphData.series.length == 0){
				var noDataMsg="";
				if(this.graphOptions){
					noDataMsg = this.graphOptions.getLocaleString('BusinessGraph.Widget.ChartNoDataText');
				}
				Highcharts && Highcharts.setOptions({lang: {noData: noDataMsg}});
			}
			this.graphData = graphData;
			Highcharts && Highcharts.chart(containerDivId,graphData, this.yAxisLabelFormatter);
		}else{
			var chart =  containerDivId && Highcharts && $("#"+containerDivId).highcharts();
			chart && chart.destroy();
		}
	},
	addAditionalHighChartStyles: function(graphData){
		if(graphData && graphData.series && graphData.series.length > 0 && graphData.series[0].name == ""){
			if(!graphData.legend){
				graphData.legend = {}
			}
			graphData.legend.enabled = false;
		}
	},
	//Customized tool tip
	addCustomizedToolTip: function(graphData, isCustomTooltipRequired){
		if(graphData && graphData.series && graphData.series.length > 0){
			if(!graphData.tooltip){
				graphData.tooltip = {}
			}
			if(isCustomTooltipRequired){
				if(!graphData.tooltip.formatter){				
					graphData.tooltip.formatter = this.formatter;
				}
			}else{
				graphData.tooltip.formatter = this.legacyToolTipFormatter;
			}
			
		}
	},
	//Customized tool tip for legacy graphs.
	legacyToolTipFormatter: function() {
        return this.x+'<br/></span><span style="color:'+this.point.color+'">●</span> '+this.point.series.name+': <b>'+Highcharts.numberFormat(this.point.y, this.point.decimalPrecision)+'</b><br/>';
	},
	
	formatter: function() {
		var labelSeparator = ": ";
		var newLineDelimiter = "<br/>";
		var lvldelimiter = '@-@';
		var rootLevelStr = "ROOTLEVEL";
		var scenarios = "Scenarios";
		var noCellValue = "N/A";
		
		var that = Ext.ComponentQuery.query('pivothighchartwidget')[0];
		var valueStr, measureStr, scenarioStr, topLevelName, levelName, memberName;
		//get localized names for the labels display in tool tips. If localized labels not provided, then default values will be displayed.
		
		
		if(that && that.graphOptions){
			var graphOptions = that.graphOptions;
			if(graphOptions.getLocaleString){
				valueStr = graphOptions.getLocaleString('BusinessGraph.Widget.Tooltext.Value');
				measureStr = graphOptions.getLocaleString('BusinessGraph.Widget.Tooltext.Measure');
				scenarioStr = graphOptions.getLocaleString('BusinessGraph.Widget.Tooltext.Scenario');
				topLevelName = graphOptions.getLocaleString('TopLevelName');
			}
			if(graphOptions.widgetProperties){
				if(!valueStr){
					valueStr = graphOptions.widgetProperties.Value;
				}
				if(!measureStr){
					measureStr = graphOptions.widgetProperties.Measure;
				}
				if(!topLevelName){
					topLevelName = graphOptions.widgetProperties.topLevelName;
				}	
				if(!scenarioStr){
					scenarioStr = graphOptions.widgetProperties.Scenario;
				}
			}			
		}
		if(!valueStr){
			valueStr = "Value";
		}
		if(!measureStr){
			measureStr = "Measure";
		}
		if(!topLevelName){
			topLevelName = "TOP LEVEL";
		}	
		if(!scenarioStr){
			scenarioStr = "Scenario"
		}
		
		/*linkparams contain the info of the selected data point. which have the info in below order
		 * [dimensionNames, levelIds, memberIds, measureId, memberNames, measureName]
		 * dimensionNames, levelIds will be for 'navigate to pivot' from dash board and tool text preparation.
		 * memberIds, measureId will be used when call 'navigate to pivot' from dash board.
		 * memberNames, measureName will be for tool text preparation.
		 * */
		var params = this.point.linkParams.split(":#PS#:").filter(Boolean);
		var dimensions = params[0].split(":#SS#:").filter(Boolean);
		var levels = params[1].split(":#SS#:").filter(Boolean);
		var memberNames = params[4].split(":#SS#:").filter(Boolean);
		var memberSize = dimensions.length;
		/**For No Cell value the formattedValue set to 'N/A' programmatically.
		  If app team's provided a value for 'no cell value' through properties file, will display that value.
		  else default value 'N/A' will be displayed.**/
		if(params[5] == noCellValue){
			if(graphOptions){
				noCellValue = graphOptions.getLocaleString('BusinessGraph.Widget.Tooltext.NoCellValue');
				if(noCellValue){
					params[5] = noCellValue;
				}
			}			
		}
		
		var tooltext = valueStr;
		tooltext = tooltext.concat(labelSeparator, params[5], newLineDelimiter, measureStr, labelSeparator, params[6], newLineDelimiter);
		
		for(var i=0;i<memberSize;i++){
			levelName = levels[i];
			if(levelName != null){
				memberName = memberNames[i];
				if(levelName.indexOf(lvldelimiter) != -1){
					levelName = levelName.substr(levelName.lastIndexOf(lvldelimiter)+lvldelimiter.length);
				}else if(levelName.indexOf(rootLevelStr) != -1){//If levelName contains 'ROOTLEVEL', then we need to get the root level name for respective facet/dimension.i.e. All Location/All Product etc.
					if(that.graphOptions && that.graphOptions.facetRootLabels){
						var facetRootLabel = that.graphOptions.facetRootLabels[dimensions[i]]; 
						if(facetRootLabel){
							levelName = topLevelName;
							memberName = facetRootLabel;
        				}
					}
				}
    		}
			//If levelName is 'Scenarios' then we have to display as 'Scenario'.
			if(levelName == scenarios){
				tooltext = tooltext.concat(scenarioStr, labelSeparator);
			}else{
				tooltext = tooltext.concat(dimensions[i], labelSeparator, levelName, labelSeparator);
			}
			tooltext = tooltext.concat(memberName, newLineDelimiter);
		}		
        return tooltext;
    },
    //This function is mainly intended to add/modify the properties of xAxis like provide scrolling, customize labels etc...
    customizedXAxisProps: function(graphData){
		if(graphData.xAxis && graphData.xAxis.categories && graphData.series){
			var graphOptions = this.graphOptions;
			var STR_ELLIPSE = " ...";
			var STR_BLANK = "";
			var defaultMinLabelChars = 11;
			var defaultWidthForMinChars = 120;
			var minLabelChars = defaultMinLabelChars;
			var widthForMinChars = defaultWidthForMinChars;
			if(graphOptions && graphOptions.chartProperties && graphOptions.chartProperties.minLabelChars){
				minLabelChars = graphOptions.chartProperties.minLabelChars;
				//If not a number or less than 1, then consider default value. If it's a real number, then it's round to near number.
				//If minLabelChars less than defaultMinLabelChars i.e. 11, then it should be defaultMinLabelChars only. i.e. always display minimum 11 characters.
				if(isNaN(minLabelChars)){
					minLabelChars = defaultMinLabelChars;
				}else{
					minLabelChars = Math.floor(minLabelChars);
					if(minLabelChars < defaultMinLabelChars){
						minLabelChars = defaultMinLabelChars;
					}
				}
			}else{
				minLabelChars = defaultMinLabelChars;
			}
			// min label chars to display * no. of pixel occupied by each char.11 chars occupy approximately 120 px, 120/11 considering as pixel occupied by each char.
			widthForMinChars = Math.round(minLabelChars * (defaultWidthForMinChars/defaultMinLabelChars)); 
			
			var numDataSets = 0;
			var numvisibleplot = 1;
			
			var widgetWidth = this.getWidth();
			if(widgetWidth){
				//approx 120 pixel for each column bar to show minimum of 11 characters.
				numvisibleplot = Math.floor(widgetWidth/widthForMinChars)-1;
			}
			
			if(numvisibleplot < 1){
				numvisibleplot = 1;
			}
			
			if(!graphData.xAxis.scrollbar){
				graphData.xAxis.scrollbar = {}
			}
			var noCategories = graphData.xAxis.categories.length == 1 && graphData.xAxis.categories[0].trim() === STR_BLANK;
			if(noCategories){
				graphData.xAxis.tickPositions = [];
				if(!graphData.plotOptions){
					graphData.plotOptions = {};
				}
				if(!graphData.plotOptions.column){
					graphData.plotOptions.column = {};
					graphData.plotOptions.column.grouping = false;					
				}
			}
			
			if(graphData.xAxis.categories.length > numvisibleplot+1 || 
					(noCategories && graphData.series && graphData.series.length > numvisibleplot+1)){
				graphData.xAxis.scrollbar.enabled = true;
				graphData.xAxis.min= 0; // Set 0 to make the scroll bar at starting point.
				graphData.xAxis.max= numvisibleplot;
			}else{
				graphData.xAxis.scrollbar.enabled = false;
				if(graphData.xAxis.max){
					graphData.xAxis.max = graphData.xAxis.categories.length-1;
				}
			}
			//Labels customization.
			if(!graphData.xAxis.labels){
				graphData.xAxis.labels = {};
			}
			if(!graphData.xAxis.labels.formatter){				
				graphData.xAxis.labels.formatter = function() {
					var customLabel="";
					var newLineDelimiter = '<br>';
					var valueStr = this.value;
					if(valueStr.indexOf(newLineDelimiter) != -1){
						var values = valueStr.split(newLineDelimiter);
						for(var i = 0; i < values.length; i++){
							var value = values[i].length > minLabelChars ? values[i].substring(0, (minLabelChars-STR_ELLIPSE.length)) + STR_ELLIPSE : values[i];
							customLabel+=value+newLineDelimiter
						}
					}else{
						customLabel = valueStr.length > minLabelChars ? valueStr.substring(0, (minLabelChars-STR_ELLIPSE.length)) + STR_ELLIPSE : valueStr;
					}
					return customLabel;
			    }
			}
		}		
	},    
	setObjByString : function(obj, str, val) {
	    var keys, key;
	    //make sure str is a string with length
	    if (!str || !str.length || Object.prototype.toString.call(str) !== "[object String]") {
	        return false;
	    }
	    if (obj !== Object(obj)) {
	        //if it's not an object, make it one
	        obj = {};
	    }
	    keys = str.split(".");
	    while (keys.length > 1) {
	        key = keys.shift();
	        if (obj !== Object(obj)) {
	            //if it's not an object, make it one
	            obj = {};
	        }
	        if (!(key in obj)) {
	            //if obj doesn't contain the key, add it and set it to an empty object
	            obj[key] = {};
	        }
	        if(key != "yAxis"){
	        	obj = obj[key];
	        }else if(obj[key]){//If it's yAxis, then it would be an array, so styles should be set to all the elements.obj[key] should have at least one element in it.
	        	for(var i=0; i < obj[key].length; i++){
	        		obj[key][i][keys[0]] = val;
	        	}        	
	        }
	    }
	    return obj[keys[0]] = val;
	},
	_addClickEvent : function(graphData){
		var that = this;
		if(!graphData.plotOptions){
			graphData.plotOptions = {};
		}
		if(!graphData.plotOptions.series){
			graphData.plotOptions.series = {};
		}
		graphData.plotOptions.series.cursor = 'pointer',
		graphData.plotOptions.series.point = {
            events: {
                click: function (event) {
                	var params = this.linkParams.split(":#PS#:").filter(Boolean);
                	params.splice(0, 0, that);
                	that._handleClick.apply(this, params);
                }
            }
		}
	},
	_handleClick:function(that, dimensionNames, levelIds, memberIds, measureId){
		var dimensions = dimensionNames.split(":#SS#:").filter(Boolean);
		var levels = levelIds.split(":#SS#:").filter(Boolean);
		var members = memberIds.split(":#SS#:").filter(Boolean);
		var memberSize = dimensions.length;
		var xAxisValues = [];
		for(var i=0;i<memberSize;i++){
			var levelId = levels[i];
			var child = {
				dimensionName: dimensions[i],
				levelId: levelId,
				memberName: members[i],
				measureId: measureId
			};
			xAxisValues.push(child);
		}
		var clickContextParams= {};
		var xAxisMembersJSONObj = {};
		xAxisMembersJSONObj.xAxisMembers = xAxisValues;
		clickContextParams.xAxisInfo = xAxisMembersJSONObj;
		clickContextParams.pageX = event && event.x;
		clickContextParams.pageY = event && event.y;
		if(that && that.graphOptions && that.graphOptions.clickContextCallBack){
			that.graphOptions.clickContextCallBack(clickContextParams);
		}
	},
	_showHideGovernorExceededMsg :function(graphData){
		if(graphData && this.graphOptions && this.graphOptions.informationMessageCallBack){
			var governorExceededMessage;
			var hideMessage = true;
			if(graphData.numPlotItems > 0 ){
				hideMessage = false;
				governorExceededMessage = this._getGovernorIndicatorMessage(graphData.numPlotItems, graphData.totalItems);
			}
			this.graphOptions.informationMessageCallBack(governorExceededMessage, this.containerId, hideMessage);
		}		
	},
	_showHideWarningMessage:function(graphData){
		if(this.graphOptions && this.graphOptions.warningMessageCallBack){
			if(graphData.nonPlottedItems){
				if(this.graphOptions.getLocaleString){
					var warningMessage = this.graphOptions.getLocaleString('BusinessGraph.Widget.Warning.Message',graphData.nonPlottedItems);
					this.graphOptions.warningMessageCallBack(warningMessage, this.containerId, false);
				}	
			}else{
				this.graphOptions.warningMessageCallBack("", this.containerId, true);	
			}
		}
	},
	_getGovernorIndicatorMessage:function(numPlotItems, totalItems){
		var governorMessage = '';
		var graphOptions = this.graphOptions;
		if(graphOptions && graphOptions.getLocaleString){
			governorMessage = graphOptions.getLocaleString('BusinessGraph.Widget.Governor.Indicator.Message',numPlotItems);
		}
		if(graphOptions && governorMessage == '' && graphOptions.widgetProperties && graphOptions.widgetProperties.GovernorIndicatorMessage){
			governorMessage = graphOptions.widgetProperties.GovernorIndicatorMessage;
			if(governorMessage.indexOf("{0}") > -1){
				governorMessage = governorMessage.replace("{0}", numPlotItems);	
			}
		}
		return governorMessage;
	},
	/*
	 * _alterGraphData meant to remove un-intended data i.e.  null/no cell data. 
	 * If all data points of an index which is 
	 * Ex: 
	 * Series[0].data[i] --> null Series[1].data[i] --> null .... series[s].data[i] --> null, as all the data items are null, remove from the graphData.
	 * Series[0].data[i] --> not null Series[1].data[i] --> null .... series[s].data[i] --> null, keep all the items and plot on graph.
	 * */
	_alterGraphData: function(graphData){
		var xAxis = graphData.xAxis;
		if(xAxis){
			var categories = xAxis.categories;
			var series = graphData.series;
			if(categories && categories.length > 0 && series && series.length > 0){
				var dataLength = series[0].data.length;
				var isCategoryPresent = (categories.length > 1 || categories[0].trim().length > 0); // category will be blank when all the members on legend fields.
				for(var d = 0; d < dataLength; d++){
					var isAltered = true;
					for(var s = 0; s < series.length; s++){
						if(series[s].data[d]){
							/*remove series.data.x when at least one level is on x-axis. Because x value is used only when all the levels on legend fields to enable scroll.
							 * each data point treat as a different member if x has different values(display as individual members when all the members on legend)
							 * If x has same value for all the data points, only single item will be displayed. that's the reason deleting x from the graphData 
							 * when at least one level is on x-axis*/
							if(isCategoryPresent){
								delete series[s].data[d].x; // remove x from data object if at least one level is present in x-axis.
							}
							
                            if(!series[s].data[d].linkParams || (series[s].data[d].y != 0 || (series[s].data[d].y == 0 && series[s].data[d].linkParams.indexOf("N/A") == -1))){
								isAltered = false;
							}else if(graphData.numPlotItems > 0){
								graphData.numPlotItems--;
							}
						}						
					}
					//As removed the data item from the graph data, reducing the length of dataLength.
					//As we've splice the data items, i.e. as we've removed the data item and move the next item to previous index. reducing index count.
					//So for next iteration, it would pick the data item at 'd' position only.
					if(isAltered){
						this._removeBlankValues(series, categories, d);
						dataLength--;
						d--;
					}					
				}
			}
		}
		
		//TODO: Temporary fix to display range on y-Axis. If high charts provide any option to do that, need to remove the below function.
		graphData = this._customizedYAxisRange(graphData);
		
		//To avoid display of 'Chart Title' as hard coded, display it as blank.
		if (graphData && graphData.title === undefined) {
			graphData.title = {};
			graphData.title.text = "";
		}
		
		return graphData; 
	},
	_removeBlankValues: function(series, categories, d){
		for(var s = 0; s < series.length; s++){
			(series[s].data).splice(d,1);		
		}
		categories.splice(d,1);
	},
	/*
	 * TODO: Temporary fix to plot the range on y-axis when only one data point to be plotted for line graph.
		High chart is not providing options other than yAxis.min to set the range when one data point for line graph. We need to set the proper value to yAxis.min.
		As it's a single data point, yAxis.min set to half of the data point.
		Once high chart team provide any work around/solution, we can remove the below customized code.
		Implemented to fix MDAP-
		yAxis.min value will be set in below conditions.
		(i) Single measure selected on yAxis
			(a) */
	_customizedYAxisRange: function(graphData){
		var yAxis = graphData.yAxis;
		var series = graphData.series;
		if(yAxis && yAxis.length > 0 && series && series.length > 0){
			var yLeftMeasures = [];
			var yRightMeasures = [];
			/*Need to segregate left axis and right axis measures. 
			  Different ranges should be display when measures pull to both left and right axis based on measure values*/
			for(var y = 0; y < yAxis.length; y++){
				if(yAxis[y].opposite == true){
					yRightMeasures.push(yAxis[y]);
				}else{
					yLeftMeasures.push(yAxis[y]);
				}
			}
			var yAxisMin;
			if(yLeftMeasures.length > 0){
				yAxisMin = this._getyAxisMin(series, yLeftMeasures, 0);//To check only left axis measures. axis= 0 for leftAxisMeasures. So passing '0' as parameter.				
				if(yAxisMin){					
					for(var y= 0; y < yLeftMeasures.length; y++){
						graphData.yAxis[y].min = yAxisMin;
					}
				}
			}
			if(yRightMeasures.length > 0){
				//For right axis measures, series.yAxis = length of left axis measures. So passing it as parameter.
				yAxisMin = this._getyAxisMin(series, yRightMeasures, yLeftMeasures.length);
				if(yAxisMin){
					/*right axis measures will be after all left axis measures in our graphData.So start index as left axis length and end index is total length.
					 * yAxis.min need to set to all the measures on the axis.*/
					for(var y= yLeftMeasures.length; y < yAxis.length; y++){
						graphData.yAxis[y].min = yAxisMin;
					}
				}
			}
			
		}
		return graphData;
	},	
	_getyAxisMin: function(series, measuresArray, axisIndex){
		var dataValue;
		for(var s= 0; s < series.length; s++){
			if(series[s].yAxis == axisIndex){//Check the series members separately for each axisIndex. i.e. left axis first then right axis.
				if(series[s].data){
					for(var d = 0; d < series[s].data.length; d++){
						if(!dataValue){//Initiate the value for first data point. Once initiated, else block will be executed always.
							dataValue = series[s].data[d].y;
						}else if(dataValue  > series[s].data[d].y){//Set the minimum value to dataValue.
							dataValue = series[s].data[d].y; 
						}
					}					
				}
			}			
		}
		if(dataValue && dataValue != null){
			//To plot the range on y-Axis, for -ve numbers multiply with 1.5 to make sure the min value set to 1.5 times the -ve number.
			//For positive numbers, it should be half of the value, to set the min value.
			if(dataValue >= 0){
				dataValue = dataValue * 0.5;
			}else{
				dataValue = dataValue * 1.5;
			}
		}
		return dataValue;
	},	
	
	yAxisLabelFormatter: function(chart) {
		var graphOptions;
		var that = Ext.ComponentQuery.query('pivothighchartwidget')[0];
		if(that){
			graphOptions = that.graphOptions;
		}
		var firstLeft = "", firstRight = "", titleLeft = "", titleRight = "";
		var STR_SPACE = " ";
		var YAXIS_MEASURE_SEPARATOR = STR_SPACE+"/"+STR_SPACE; // Default value of measure separator is " / " on yAxis.
		if(graphOptions && graphOptions.chartProperties && graphOptions.chartProperties.yAxisLabelSeparator){
			YAXIS_MEASURE_SEPARATOR = STR_SPACE+graphOptions.chartProperties.yAxisLabelSeparator+STR_SPACE;
		}
		Highcharts && Highcharts.each(chart.yAxis, function(a) {
		    if (a.opposite === true && !firstLeft) {
		      firstLeft = a;
		    }else if (!a.opposite && !firstRight) {
		      firstRight = a;
		    }else if (a.opposite) {
		      titleLeft += a.axisTitle.textStr + YAXIS_MEASURE_SEPARATOR;
		      a.setTitle('');
		    }else if (!a.opposite) {
		      titleRight += a.axisTitle.textStr + YAXIS_MEASURE_SEPARATOR;
		      a.setTitle('');
		    }
		  });
		  
		  if(titleLeft && titleLeft.length > 0){
			  titleLeft = YAXIS_MEASURE_SEPARATOR + titleLeft.substring(0, titleLeft.length - YAXIS_MEASURE_SEPARATOR.length); // Removing last YAXIS_MEASURE_SEPARATOR from titleLeft
		  }
		  if(titleRight && titleRight.length > 0){
			  titleRight = YAXIS_MEASURE_SEPARATOR + titleRight.substring(0, titleRight.length - YAXIS_MEASURE_SEPARATOR.length); // Removing last YAXIS_MEASURE_SEPARATOR from titleRight
		  }
		  if(firstLeft){
			  var title = titleLeft;
			  if(firstLeft.axisTitle && firstLeft.axisTitle.textStr){
				  title = firstLeft.axisTitle.textStr + titleLeft;
			  }
			  firstLeft.setTitle({
				    text: title
			  });
		  }
		  if(firstRight){
			  var title = titleRight;
			  if(firstRight.axisTitle && firstRight.axisTitle.textStr){
				  title = firstRight.axisTitle.textStr + titleRight;
			  }
			  
			  firstRight.setTitle({
				    text: title
			  }); 
		  }
	},
});