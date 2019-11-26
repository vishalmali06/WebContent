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
* A repository for general javascript utilities.
*
* @version Revision: $Revision$
* @author Created By: Charles Korolevich, Last Updated By: $Author$
*/

// Prevent vpUtilities from being initialized/loaded more than once.
if (vpUtilitiesIsAlreadyInitialized == undefined) {
    var vpUtilitiesIsAlreadyInitialized = true;

/**
 * A set of general purpose utilities for dealing with sizing of elements.
 *
 * Usage:
 *      BrowserUtilities.isIE();
 */
var BrowserUtilities = {
    inRichShell : false,
    windowList : new Array(),

    /**
     * Checks if the browser is Internet Explorer.
     */
    isIE : function()
    {
        return(Math.max(navigator.userAgent.toLowerCase().indexOf('msie'), 0));
    },

};

/**
 * A set of Math related utility methods to strip leading zeros and check for various types of numbers.
 */
var MathUtilities = {
    ThousandSeparator : ',',
    DecimalSeparator : '.',
    ScriptDecimalSeparator : (1/2).toString().charAt(1),
    NumberFormat : '#,##0',
    CurrencyFormat : '#,##0',
    CurrencySymbol : '$',
    NegativeInParens : false,
    PadWithZeros : false,
    NumberOfDecimals : 0,

   /**
     * Format the given number using the NumberFormat.
     * @param number         The number to be formatted.
     * @param isCurrency     A flag indicating if the value is a currency.
     * @param overrideFormat A number format to use instead of the format from preferences.
     * @return  The string representation of the number.
     */
    format : function(number, isCurrency, overrideFormat, isIntegerColumn)
    {
        if ((number == null) || (StringUtilities.trim(String(number)).length == 0))
            return "";

        // number can come in as a string or a numeric. Parse here to ensure it's a numeric
        // (localization problems arise if we don't do this first)
        var numeric = MathUtilities.parse(number,isCurrency);

        var numberArray = [];
        var tmpNumberArray = [];
        var numberOfDecimals = MathUtilities.NumberOfDecimals;
        var padWithZeros = MathUtilities.PadWithZeros;
        var negativesInParens = MathUtilities.NegativeInParens;

        // check if using an override format instead of the default from preferences.
        if ((overrideFormat != undefined) && (overrideFormat != null)) {

            // If negatives are displayed in parens, then strip that from the format.
            var pos = overrideFormat.indexOf(';');
            var format = (pos > -1 ? overrideFormat.substring(0, pos) : overrideFormat);
            if (pos > -1) {
                negativesInParens = true;
            }

            // Get the number of decimal places and whether to pad with zeros.
            pos = format.indexOf(MathUtilities.DecimalSeparator);
            if (pos > -1) {
                numberOfDecimals = format.length - (pos + 1);
                padWithZeros = format.charAt((pos+1)) == '0';
            }else            
            	numberOfDecimals= 0;
        }

        // Make sure the number has the correct number of decimal values.
        var tmpNumber = new Number(numeric).toFixed(isIntegerColumn? 0 :(isCurrency ? (numberOfDecimals > 0 ? 2 : 0) : numberOfDecimals));
        tmpNumberArray = tmpNumber.toString().split('');

        // If not padding with zeros, remove any extra 0's and/or decimal separator.
        if( tmpNumber.indexOf(MathUtilities.ScriptDecimalSeparator) > -1) {
            for (var done=false; !done && !padWithZeros;) {
                var ct = tmpNumberArray.pop();
                if ((ct != '0') && (ct != MathUtilities.ScriptDecimalSeparator)) {
                    tmpNumberArray.push(ct);
                    done = true;
                } else if (ct == MathUtilities.ScriptDecimalSeparator)
                    done = true;
            }
        }

        // If the number is negative, add the closing paren to the temp array.
        if (negativesInParens && (tmpNumber < 0)) numberArray.push(')');

        // Add the decimal values to a temporary array in reverse order.
        var length = tmpNumberArray.length;
        var hasDecimals = (tmpNumberArray.join('').indexOf(MathUtilities.ScriptDecimalSeparator) > -1);
        if ((numberOfDecimals > 0) && (hasDecimals)) {
            for (var i=0; i < length; i++) {
                var ch = tmpNumberArray.pop();
                if (ch == MathUtilities.ScriptDecimalSeparator) {
                    numberArray.push(MathUtilities.DecimalSeparator);
                    break;
                } else
                    numberArray.push(ch);
            }
        }

        // Add the whole number values to the array in reverse order, adding in grouping
        // separator where appropriate.
        var count = 0;
        var currencySymbolAdded = false;
        length = tmpNumberArray.length;
        for (var j=0; j < length; j++) {
            var cq = tmpNumberArray.pop();
            if (cq == '-') {
                if (isCurrency) {
                    numberArray.push(MathUtilities.CurrencySymbol);
                    currencySymbolAdded = true;
                }
                if (negativesInParens)
                    numberArray.push('(');
                else
                    numberArray.push(cq);
            } else {
                if (count++ == 3) {
                    numberArray.push(MathUtilities.ThousandSeparator);
                    count = 1;
                }
                numberArray.push(cq);
            }
        }

        // If it is a currency, add the currency symbol.
        if (isCurrency && !currencySymbolAdded)
            numberArray.push(MathUtilities.CurrencySymbol);

        // Reverse the array to get it in the corect order.
        return numberArray.reverse().join('');
    },

    /**
     * Parse the given numberStr using the NumberFormat.
     * @param numberStr  The number string.
     * @param isCurrency A flag indicating if the value is a currency.
     * @return The parsed number.
     */
    parse : function(numberStr, isCurrency)
    {
        var val = String(numberStr);
        if (MathUtilities.NegativeInParens) {
            val = val.replace(/\(/g, "-");
            val = val.replace(/\)/g, "");
        }
        if (isCurrency)
            val = val.replace(MathUtilities.CurrencySymbol, "");

        return MathUtilities.parseFloat(val);
    },

    /**
     * Strip the thousands separator from the number.
     */
    stripSeparator : function(value)
    {
        var chars = '/\\' + MathUtilities.ThousandSeparator + '/g';
        return value.replace(eval(chars), "");
    },

    /**
     * Strip all leading zeros from the given string.
     *
     * @param value     The value to be cleaned.
     */
    stripLeadingZeros : function(value)
    {
      while (value) {
        if ((value.substring(0, 1) != "0") || (value.length == 1))
          break;
        value = value.substring(1, value.length);
      }
      return value;
    },
     /**
     * Parse the string value to get a float number.
     * @param value  The value to be parsed.
     */
    parseFloat : function(value)
    {
        var newVal = this.stripSeparator(value).replace(MathUtilities.DecimalSeparator, MathUtilities.ScriptDecimalSeparator);
        return parseFloat(newVal);
    },

    /**
     * Parse the string value to get an integer.
     * @param value  The value to be parsed.
     */
    parseInt : function(value)
    {
        return parseInt(value);
    },

    /**
     * Round the value passed in to the nearest precision.
     * @param value        The value to be rounded.
     * @param precision    The decimal precision to use.
     * @param padDecimals  A flag to indicate whether the returned value should be padded with zeros.
     * @return  A string representation fo the rounded number.
     */
    round : function(value, precision, padDecimals)
    {
        var prec = parseInt(precision);
        var tmp = Math.pow(10, prec);
        var val = parseInt(Math.round(value * tmp)) / tmp;
        if (prec == 0)
            return parseInt(val);
        else {
            var valStr = String(val);
            valStr = MathUtilities.stripSeparator(valStr.replace(MathUtilities.ScriptDecimalSeparator, MathUtilities.DecimalSeparator));
            var decimalPos = valStr.indexOf(MathUtilities.DecimalSeparator);
            if (decimalPos == -1) {
                valStr += MathUtilities.DecimalSeparator;
                decimalPos = valStr.length - 1;
            }
            if (padDecimals) {
                var actualDecimals = (valStr.length - 1) - decimalPos;
                var k = prec - actualDecimals;
                for (var i = 0; i < k; i++)
                    valStr += '0';
            }
            return valStr;
        }
    },
    
    /**
     * Validate that the parameter contains a integer or float value.
     */
    isNumber : function(value)
    {
        return !(isNaN(this.stripSeparator(value).replace(MathUtilities.DecimalSeparator, MathUtilities.ScriptDecimalSeparator)));
    },
    
    /**
     * Validate that the parameter contains an integer value.
     */
    isInteger : function(value)
    {
        var val = this.stripSeparator(value);
        var noleadingzeros = this.stripLeadingZeros(val);
        var tmp = parseInt(val, 10);
        var valid = true;
        if (isNaN(val) || (String(tmp) != String(noleadingzeros)))
            valid = false;
        return valid;
    },
    
};


/**
 * A set of String related utility methods to trim replace strings.
 */
var StringUtilities = {
    InvalidCharacters : '"',

    /**
     * Trim all leading spaces from the string.
     * @param str  The string to be trimmed.
     */
    ltrim : function(str)
    {
        while ((str != null) && (str.length > 0) && (str.substring(0, 1) == " ")) {
            str = str.substring(1, str.length);
        }
        return str;
    },

    /**
     * Trim all trailing spaces from the string.
     * @param str  The string to be trimmed.
     */
    rtrim : function(str)
    {
        while ((str != null) && (str.length > 0) && (str.substring(str.length - 1, str.length) == " ")) {
            str = str.substring(0, str.length - 1);
        }
        return str;
    },

    /**
     * Trim all leading and trailing spaces from the string.
     * @param str  The string to be trimmed.
     */
    trim : function(str)
    {
        var tmpstr = this.ltrim(str);
        return this.rtrim(tmpstr);
    },

};

/**
 * A set of Duration related utility methods.
 */
var DurationUtilities = {
    DurationFormat : 'DHM',
    DaySymbol : 'D',
    HourSymbol : 'H',
    MinuteSymbol : 'M',
    TranslatedDaySymbol : 'D',
    TranslatedHourSymbol : 'H',
    TranslatedMinuteSymbol : 'M',
    showSpaces : false,
    showLeadingZeros : false,
    includeDays : true,
    includeHours : true,
    includeMinutes : true,

    /**
     * Set the duration format to use.
     * @param format       The duration format pattern (i.e. DHM).
     * @param daySymbol    The symbol that represents a day.
     * @param hourSymbol   The symbol that represents an hour.
     * @param minuteSymbol The symbol that represents a minute.
     */
    setFormat : function(format, daySymbol, hourSymbol, minuteSymbol, translatedDaySymbol, translatedHourSymbol, translatedMinuteSymbol) {
        var pos = format.indexOf(':');
        DurationUtilities.DurationFormat = (pos > -1 ? format.substring(0, pos) : format);
        DurationUtilities.showSpaces = (format.indexOf('S') > -1);
        DurationUtilities.showLeadingZeros = (format.indexOf('Z') > -1);
        DurationUtilities.DaySymbol = daySymbol;
        DurationUtilities.HourSymbol = hourSymbol;
        DurationUtilities.MinuteSymbol = minuteSymbol;
        DurationUtilities.TranslatedDaySymbol = translatedDaySymbol;
        DurationUtilities.TranslatedHourSymbol = translatedHourSymbol;
        DurationUtilities.TranslatedMinuteSymbol = translatedMinuteSymbol;
        DurationUtilities.includeDays = (DurationUtilities.DurationFormat.indexOf(DurationUtilities.DaySymbol) > -1);
        DurationUtilities.includeHours = (DurationUtilities.DurationFormat.indexOf(DurationUtilities.HourSymbol) > -1);
        DurationUtilities.includeMinutes = (DurationUtilities.DurationFormat.indexOf(DurationUtilities.MinuteSymbol) > -1);
    },

    /**
     * Convert the given number of days into the equivalent number of minutes.
     * @param days  The number of days.
     * @return The number of minutes.
     */
    convertDaysToMinutes : function(days)  {
        return (parseInt(days) * (24 * 60));
    },

    /**
     * Convert the given number of hours into the equivalent number of minutes.
     * @param hours  The number of hours.
     * @return The number of minutes.
     */
    convertHoursToMinutes : function(hours)  {
        return (parseInt(hours) * 60);
    },

    /**
     * Convert the number of minutes into the equivalent number of whole days.
     * @param minutes  The number of minutes.
     * @return the number of days (as a whole number; no fractions).
     */
    convertMinutesToDays : function(minutes) {
        return Math.floor(parseInt(minutes) / (24 * 60));
    },

    /**
     * Convert the number of minutes into the equivalent number of whole hours.
     * @param minutes  The number of minutes.
     * @return the number of hours (as a whole number; no fractions).
     */
    convertMinutesToHours : function(minutes) {
        return Math.floor(parseInt(minutes) / 60);
    },

    /**
     * Format the given duration in the form specified by the DurationFormat.
     * @param duration       The duration (in minutes).
     * @param showAll        A flag to indicate if all duration components should be included if non-zero.
     * @param overrideFormat A duration format to use instead of the format from preferences.
     * @return The string representation of the duration.
     */
    format : function(duration, showAll, overrideFormat) {

        if ((duration == null) || (StringUtilities.trim(String(duration)).length == 0))
            return "";

        var minutes = parseInt(duration);
        var hours = 0;
        var days = 0;
        var negative = (minutes < 0);
        var returnVal = '';
        var includeDays = DurationUtilities.includeDays;
        var includeHours = DurationUtilities.includeHours;
        var includeMinutes = DurationUtilities.includeMinutes;
        var showSpaces = DurationUtilities.showSpaces;
        var showLeadingZeros = DurationUtilities.showLeadingZeros;

        if (negative)
            minutes = -(minutes);

        // check if using an override format instead of the default from preferences.
        if ((overrideFormat != undefined) && (overrideFormat != null)) {
            var pos = overrideFormat.indexOf(':');
            var format = (pos > -1 ? overrideFormat.substring(0, pos) : overrideFormat);
            showSpaces = (overrideFormat.indexOf('S') > -1);
            showLeadingZeros = (overrideFormat.indexOf('Z') > -1);
            includeDays = (format.indexOf(DurationUtilities.DaySymbol) > -1);
            includeHours = (format.indexOf(DurationUtilities.HourSymbol) > -1);
            includeMinutes = (format.indexOf(DurationUtilities.MinuteSymbol) > -1);
        }

        // Calculate the number of days.
        if (includeDays) {
            days = DurationUtilities.convertMinutesToDays(minutes);
            minutes = minutes - DurationUtilities.convertDaysToMinutes(days);
        }

        // Calculate the number of hours.
        if (includeHours) {
            hours = DurationUtilities.convertMinutesToHours(minutes);
            minutes = minutes - DurationUtilities.convertHoursToMinutes(hours);
        }

        // Build the formatted string.
        if (includeDays || (showAll && ((days != 0) || (showLeadingZeros && (days == 0))))) {
            returnVal += days + DurationUtilities.TranslatedDaySymbol;
        }
        if ((showSpaces) && (returnVal.length > 0))
            returnVal += ' ';

        if (includeHours || (showAll && ((hours != 0) || (showLeadingZeros && (hours == 0))))) {
            returnVal += hours + DurationUtilities.TranslatedHourSymbol;
        }
        if ((showSpaces) && (returnVal.length > 0) && (returnVal[returnVal.length-1] != ' '))
            returnVal += ' ';

        if (includeMinutes || (showAll && ((minutes != 0) || (showLeadingZeros && (minutes == 0))))) {
            returnVal += minutes + DurationUtilities.TranslatedMinuteSymbol;
        }

        if (negative && (returnVal.length > 0))
            returnVal = "-" + returnVal;

        return returnVal;
    },
    
    /**
     * Parse the given duration using the DurationFormat.
     * @param durationString  The duration string.
     * @return The parsed duration.
     */
    parse : function(durationString) {
        var days = 0;
        var hours = 0;
        var minutes = 0;

        if (durationString != null) {
            var negative = (durationString.indexOf("-") > -1);
            var tmpStr = durationString.toUpperCase().replace("/\\-/g","");
            var sections = tmpStr.match(/\d{1,}\D/g);

            // Parse the number of days, hours and minutes.
            if (sections != null) {
                for (var i=0; i <sections.length; i++) {
                    if (sections[i].indexOf(DurationUtilities.TranslatedDaySymbol) > -1) {
                        days = parseInt(sections[i]);
                    } else if (sections[i].indexOf(DurationUtilities.TranslatedHourSymbol) > -1) {
                        hours = parseInt(sections[i]);
                    } else if (sections[i].indexOf(DurationUtilities.TranslatedMinuteSymbol) > -1) {
                        minutes = parseInt(sections[i]);
                    }
                }
            }

            // Convert days and hours into minutes.
            hours += (days * 24);
            minutes += (hours * 60);

            if (negative)
                minutes = -(minutes);
        }

        return minutes;
    },


    
};


/**
 * A utility for adding informational and error messages to the message area at the top of the page.
 *
 * Usage:
 *      vpPageMessage.setInfo("Item was succesfully saved.");
 *   or
 *      vpPageMessage.setError("Unable to save the item.");
 */
var vpPageMessage = {

		/**
		 * Get the message area.
		 */
		getMsgArea : function()
		{
			return document.getElementById("vpMsgTbl");
		},
		/**
		 * Clear the contents of the message area.
		 */
		clear : function()
		{
			var div = this.getMsgArea();
			while ((div != null) && (div.rows.length > 0))
				div.deleteRow(0);
		},

		/**
		 * Clear the message area and add the error message.
		 * @param message   The error message to be set.
		 */
		setError : function(message)
		{
			this.clear();
			this.addError(message);
		},

		/**
		 * Clear the message area and add the informational message.
		 * @param message   The informational message to be set.
		 */
		setInfo : function(message)
		{
			this.clear();
			this.addInfo(message);
		}
};

} // end of initialization if
