//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.model.datafilter.DataFilters', {
    extend: 'Ext.data.Model',
    fields: [
        { name:'id', type:'string'},
        { name:'name', type:'string'},
        { name:'targetMeasure', type:'string', mapping : 'cellFormat.targetMeasureId'},
        { name:'expression', type:'string'},
        { name:'activate', type:'boolean'},
        { name:'formatCellActivate', type:'boolean'},
    ]

});