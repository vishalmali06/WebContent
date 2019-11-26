//=========================================================================================================
//			Copyright <1995-2018> JDA Software Group, Inc. All rights reserved.
//			LICENSE OF THIS PROGRAM IS ONLY ENTITLED TO ACCESS THE CONFIGURATION(S) SPECIFIED IN ITS
//			SOFTWARE LICENSE AGREEMENT WITH JDA.  ACCESS OF ANY OTHER CONFIGURATION IS A DIRECT VIOLATION
//			OF THE TERMS OF THE SOFTWARE LICENSE AGREEMENT, AND JDA RETAINS ALL ITS LEGAL RIGHTS TO ENFORCE
//			SUCH AGREEMENT.
//			This product may be protected by one or more United States and foreign patents.
//			For information on patents, see https://www.jda.com/legal/patents.
//=========================================================================================================
Ext.define('JdaPivotApp.model.StyleRule', {
    extend: 'Ext.data.Model',
    fields: [
        { name:'ruleId', type:'int'},
        { name: 'ruleTitle',  type: 'string'},
        { name: 'targetMeasures',   type: 'auto'},
        { name: 'ruleExpression', type: 'string'},
        { name: 'cellBgColor', type: 'string'},
        { name: 'cellBgColor', type: 'string'},
        { name: 'cellFontColor', type: 'string'},
        { name: 'id', type: 'int'},
        { name: 'priority', type: 'int'},
        { name: 'ruleDefinition', type: 'string'},
        { name: 'targetMeasureName', type: 'string'},
        { name: 'toPosition', type: 'int'}       
    ]

});