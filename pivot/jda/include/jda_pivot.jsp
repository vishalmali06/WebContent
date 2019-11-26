<!--=========================================================================================================	-->
<!--		Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.									-->
<!--		LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS			-->
<!--		SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION		-->
<!--		OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE		-->
<!--		SUCH AGREEMENT.																						-->
<!--		This product may be protected by one or more United States and foreign patents.						-->
<!--		For information on patents, see https://www.jda.com/legal/patents.									-->
<!--=========================================================================================================	-->
<%@page import="com.jda.common.pivot.common.PivotConstants"%>
<%
    String baseUrl = request.getContextPath()+"/common/pivot";
 	String ctxPath = request.getContextPath();

// this condition is required for MDAP reference implementation as it is not based on webworks. 
//FIXME : This appraoch will work for now, As of today all applications using PivotMDAP are on webworks. 
// Need to fix this as in future there could be applications which are not on webworks. 

if(!ctxPath.startsWith("/JDAPivot"))
 {
	 String emptyBaseUrl =System.getProperty("emptyBaseUrl");
	 if (Boolean.parseBoolean(emptyBaseUrl)){
		 if (!ctxPath.isEmpty())
			 ctxPath=ctxPath.substring(0, ctxPath.lastIndexOf("/"));
	 }else {
		 baseUrl = "../common/pivot";
		 ctxPath = "..";
	 }
 }  
 
%>

<jsp:include page="./pivot_templates.jsp"  flush="true"/>
<link rel="stylesheet" href="<%= baseUrl%>/jda/js/datatable/datatable_debug.css"/>
<link rel="stylesheet" href="<%= ctxPath%>/common/dhtmlx/dhtmlx-theme-platform.css" />
<link rel="stylesheet" href="<%= baseUrl%>/vendor/jquery/css/jda-theme/jquery-ui.min.css">

<link rel="stylesheet" href="<%= baseUrl%>/vendor/jquery/plugins/mbExtruder.css" media="all">
<link rel="stylesheet" href="<%= baseUrl%>/jda/themes/theme-pivot/stylesheets/jda_pivotGraph.css">
<link rel="stylesheet" href="<%= baseUrl%>/jda/themes/theme-pivot/stylesheets/jda_pivotBusinessGraph.css">
<link rel="stylesheet" href="<%= baseUrl%>/vendor/jquery/plugins/jquery.qtip.css">
<link rel="stylesheet" href="<%= baseUrl%>/vendor/jquery/plugins/spectrum.css">
<link rel="stylesheet" href="<%= baseUrl%>/jda/css/jda_pivot_application.css"/>
<link rel="stylesheet" href="<%= baseUrl%>/jda/css/jda_pivot_deployment_look_and_feel.css"/>
<link rel="stylesheet" href="<%= baseUrl%>/jda/themes/theme-pivot/stylesheets/jda-pivot-comment.css"/>
<link rel="stylesheet" href="<%= baseUrl%>/jda/themes/theme-pivot/stylesheets/jda-pivot-styling.css"/>
<link rel="stylesheet" href="<%= baseUrl%>/jda/themes/theme-pivot/stylesheets/jda-pivot-datafilter.css"/>
<link rel="stylesheet" href="<%= baseUrl%>/jda/themes/theme-pivot/stylesheets/jda-pivot-measurefilter.css"/>

<script src="<%= baseUrl%>/jda/extjsPivot/common/Override.js"></script>
<link rel="stylesheet" href="<%= ctxPath%>/common/ext-js/resources/theme-platform/jda-theme-all.css"/>

<%
String pivotMode = (String)request.getAttribute(PivotConstants.PIVOT_DISPLAY_MODE);
String pivotTheme = (String)request.getAttribute(PivotConstants.PIVOT_DISPLAY_THEME);  

if(pivotMode != null && !(pivotMode.equalsIgnoreCase(PivotConstants.PIVOT_DISPLAY_NORMAL))){
	if(pivotMode.equalsIgnoreCase(PivotConstants.PIVOT_DISPLAY_COMPACT)){
		if(pivotTheme != null && pivotTheme.equalsIgnoreCase(PivotConstants.PIVOT_DISPLAY_THEME_LUMINATE)){%>
			<link rel="stylesheet" href="<%=baseUrl%>/jda/themes/theme-pivot/stylesheets/jda-pivot-compact-luminate.css" />
		<%}else{ %>
			<link rel="stylesheet" href="<%=baseUrl%>/jda/themes/theme-pivot/stylesheets/jda-pivot-compact.css" />
		<%}
	}else if(pivotMode.equalsIgnoreCase(PivotConstants.PIVOT_DISPLAY_COMFORT)){
		if(pivotTheme != null && pivotTheme.equalsIgnoreCase(PivotConstants.PIVOT_DISPLAY_THEME_LUMINATE)){ %>
			<link rel="stylesheet" href="<%=baseUrl%>/jda/themes/theme-pivot/stylesheets/jda-pivot-comfort-luminate.css" />
		<%}else{ %>
			<link rel="stylesheet" href="<%=baseUrl%>/jda/themes/theme-pivot/stylesheets/jda-pivot-comfort.css" />
		<%}		
	}
}else{
	if(pivotTheme != null && pivotTheme.equalsIgnoreCase(PivotConstants.PIVOT_DISPLAY_THEME_LUMINATE)){ %>
		<link rel="stylesheet" href="<%=baseUrl%>/jda/themes/theme-pivot/stylesheets/jda-pivot-luminate.css" />
	<%}else{ %>
		<link rel="stylesheet" href="<%=baseUrl%>/jda/themes/theme-pivot/stylesheets/jda-pivot.css" />
	<%}
}%>

<script type="text/javascript">
	
	/* Ext JS configuration*/
	Ext.setGlyphFontFamily('FontAwesome');
	Ext.Loader.setConfig({
	    enabled: true,
	    disableCaching: false
	});
	Ext.Loader.setPath('Jda.ux.layout', "<%=baseUrl%>/jda/extjsPivot/ux/jda/layout");
	Ext.Loader.setPath('Jda.ux.plugin', "<%=baseUrl%>/jda/extjsPivot/ux/jda/plugin");
	Ext.Loader.setPath('PivotAppFolder', "<%=baseUrl%>/jda/extjsPivot/app");
	
</script>


<script src="<%= ctxPath%>/common/jquery/jquery-3.4.1.min.js"></script> 
<script src="<%= baseUrl%>/vendor/jquery/js/jquery-migrate-3.0.0.min.js"></script>

<script src="<%= baseUrl%>/vendor/jquery/js/jquery-ui.min.js"></script>
<script src="<%= baseUrl%>/vendor/underscore/underscore.js"></script>
<script src="<%= baseUrl%>/vendor/jquery/js/json2.js"></script>
<script src="<%= baseUrl%>/vendor/jquery/plugins/jquery.validate.min.js"></script>
<script src="<%= baseUrl%>/vendor/jquery/plugins/additional-methods.min.js"></script>
<script src="<%= baseUrl%>/vendor/jquery/plugins/jquery.qtip.js"></script>
<script src="<%= baseUrl%>/vendor/jquery/plugins/jquery.corner.js"></script>
<script src="<%= baseUrl%>/vendor/jquery/plugins/jquery.bpopup.min.js"></script>
<script src="<%= baseUrl%>/vendor/jquery/plugins/jquery.blockUI.js"></script>
<script src="<%= baseUrl%>/vendor/jquery/plugins/jquery.iframe-transport.js"></script>
<script src="<%= baseUrl%>/vendor/jquery/plugins/jquery.fileupload.js"></script>


<script src="<%= baseUrl%>/vendor/jquery/plugins/spectrum.js"></script>
<script src="<%= baseUrl%>/vendor/jquery/plugins/jquery.metadata.js"></script>

<script src="<%= baseUrl%>/jda/extjsPivot/ux/jda/plugin/RowExpandPlugin.js"> </script>
<script src="<%= baseUrl%>/jda/js/datatable/datatable_debug.js"> </script>
<script src="<%= baseUrl%>/jda/js/jda_utilities.js"></script>
<script src="<%= baseUrl%>/jda/js/jda_datatable.js"> </script>
<script src="<%= baseUrl%>/jda/js/jda_pivot_common.js"> </script>
<script class='jda-pivot-file'  src="<%= baseUrl%>/jda/js/jda_pivot.js"> </script>
<script src="<%= baseUrl%>/jda/js/jda_pivot_application.js"> </script>
<script type="text/javascript" src="<%= baseUrl%>/jda/js/jda_pivotGraph.js"></script>
<script type="text/javascript" src="<%= baseUrl%>/jda/js/jda_pivotComment.js"></script>
<script type="text/javascript" src="<%= baseUrl%>/vendor/jquery/plugins/jquery.hoverIntent.min.js"></script>
<script type="text/javascript" src="<%= baseUrl%>/vendor/jquery/plugins/jquery.mb.flipText.js"></script>
<script type="text/javascript" src="<%= baseUrl%>/vendor/jquery/plugins/mbExtruder.js"></script>
<script type="text/javascript" src="<%= baseUrl%>/vendor/jquery/plugins/jquery.layout_and_plugins.min.js"></script>
<script src="<%= ctxPath%>/common/ext-js/charts.js"></script>
<script type="text/javascript" src="<%= ctxPath%>/common/highstock/highstock.js"></script>
<script type="text/javascript" src="<%= ctxPath%>/common/highcharts/no-data-to-display.js"></script>
