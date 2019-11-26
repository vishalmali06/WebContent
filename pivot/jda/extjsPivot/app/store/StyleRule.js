//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.store.StyleRule', {
	 extend:'Ext.data.Store',
	 model: 'JdaPivotApp.model.StyleRule',
	 storeId:'rulestore',
	 data : [ /*{
				"ruleId" : 1,
				"ruleTitle" : "R1",
				"targetMeasures" : [ "BUDGETCOSTPLAN" ],
				"ruleExpression" : "{BUDGETCOSTPLAN} > 6000",
				"cellBgColor" : "rgb(255, 159, 159)",
				"toPosition" : 1,
				"id" : 1,
				"priority" : 1,
				"targetMeasureName" : "BUDGETCOSTPLAN",
				"ruleDefinition" : "{BUDGETCOSTPLAN} > 6000",
				"cellBackgroundColor" : "rgb(255, 159, 159)"
			}*/ ]
	,
	 proxy: {
	        type: 'memory',
	        reader: {
	            type: 'json',
	        }
	    }
 }); 