//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.store.measurefilter.SplitMeasures', {
	 extend:'Ext.data.Store',
	 model: 'JdaPivotApp.model.Pair',
	 storeId:'splitMeasuresStore',
	 proxy: {
	        type: 'memory',
	        reader: {
	            type: 'json',
	        }
	 },
	 sorters: [{
		 property:   'name',
		 direction:  'ASC',
	 }],
 });