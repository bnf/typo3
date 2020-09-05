import $ from '../../../../core/Resources/Public/JavaScript/Contrib/jquery.esm.js';
import __import_moment from '../../../../core/Resources/Public/JavaScript/Contrib/moment.esm.js';
import Md5 from './Hashing/Md5.esm.js';
import DocumentSaveActions from './DocumentSaveActions.esm.js';
import Severity from './Severity.esm.js';
import Modal from './Modal.esm.js';

var FormEngineValidation = {
  rulesSelector: "[data-formengine-validation-rules]",
  inputSelector: "[data-formengine-input-params]",
  markerSelector: ".t3js-formengine-validation-marker",
  groupFieldHiddenElement: ".t3js-formengine-field-group input[type=hidden]",
  relatedFieldSelector: "[data-relatedfieldname]",
  errorClass: "has-error",
  lastYear: 0,
  lastDate: 0,
  lastTime: 0,
  USmode: 0,
  passwordDummy: "********"
};
FormEngineValidation.initialize = function () {
  $(document).find("." + FormEngineValidation.errorClass).removeClass(FormEngineValidation.errorClass);
  FormEngineValidation.initializeInputFields().promise().done(function () {
    $(document).on("change", FormEngineValidation.rulesSelector, function () {
      FormEngineValidation.validate();
      FormEngineValidation.markFieldAsChanged($(this));
    });
    FormEngineValidation.registerSubmitCallback();
  });
  var today = new Date();
  FormEngineValidation.lastYear = FormEngineValidation.getYear(today);
  FormEngineValidation.lastDate = FormEngineValidation.getDate(today);
  FormEngineValidation.lastTime = 0;
  FormEngineValidation.USmode = 0;
  FormEngineValidation.validate();
};
FormEngineValidation.initializeInputFields = function () {
  return $(document).find(FormEngineValidation.inputSelector).each(function () {
    var config = $(this).data("formengine-input-params");
    var fieldName = config.field;
    var $field = $("[name=\"" + fieldName + "\"]");
    if ($field.data("main-field") === undefined) {
      $field.data("main-field", fieldName);
      $field.data("config", config);
      FormEngineValidation.initializeInputField(fieldName);
    }
  });
};
FormEngineValidation.setUsMode = function (mode) {
  FormEngineValidation.USmode = mode;
};
FormEngineValidation.initializeInputField = function (fieldName) {
  var $field = $("[name=\"" + fieldName + "\"]");
  var $humanReadableField = $("[data-formengine-input-name=\"" + fieldName + "\"]");
  var $mainField = $("[name=\"" + $field.data("main-field") + "\"]");
  if ($mainField.length === 0) {
    $mainField = $field;
  }
  var config = $mainField.data("config");
  if (typeof config !== "undefined") {
    var evalList = FormEngineValidation.trimExplode(",", config.evalList);
    var value = $field.val();
    for (var i = 0; i < evalList.length; i++) {
      value = FormEngineValidation.formatValue(evalList[i], value, config);
    }
    if (value.length && $humanReadableField.attr("type") !== "password") {
      $humanReadableField.val(value);
    }
  }
  $humanReadableField.data("main-field", fieldName);
  $humanReadableField.data("config", config);
  $humanReadableField.on("change", function () {
    FormEngineValidation.updateInputField($(this).attr("data-formengine-input-name"));
  });
  $humanReadableField.on("keyup", FormEngineValidation.validate);
  $humanReadableField.attr("data-formengine-input-initialized", "true");
};
FormEngineValidation.formatValue = function (type, value, config) {
  var theString = "";
  var parsedInt, theTime;
  switch (type) {
    case "date":
      if (value.toString().indexOf("-") > 0) {
        var date = __import_moment.utc(value);
        if (FormEngineValidation.USmode) {
          theString = date.format("MM-DD-YYYY");
        } else {
          theString = date.format("DD-MM-YYYY");
        }
      } else {
        parsedInt = value * 1;
        if (!parsedInt) {
          return "";
        }
        theTime = new Date(parsedInt * 1000);
        if (FormEngineValidation.USmode) {
          theString = theTime.getUTCMonth() + 1 + "-" + theTime.getUTCDate() + "-" + this.getYear(theTime);
        } else {
          theString = theTime.getUTCDate() + "-" + (theTime.getUTCMonth() + 1) + "-" + this.getYear(theTime);
        }
      }
      break;
    case "datetime":
      if (value.toString().indexOf("-") <= 0 && !parseInt(value)) {
        return "";
      }
      theString = FormEngineValidation.formatValue("time", value, config) + " " + FormEngineValidation.formatValue("date", value, config);
      break;
    case "time":
    case "timesec":
      var dateValue;
      if (value.toString().indexOf("-") > 0) {
        dateValue = __import_moment.utc(value);
      } else {
        parsedInt = parseInt(value);
        if (!parsedInt && value.toString() !== "0") {
          return "";
        }
        dateValue = __import_moment.unix(parsedInt).utc();
      }
      if (type === "timesec") {
        theString = dateValue.format("HH:mm:ss");
      } else {
        theString = dateValue.format("HH:mm");
      }
      break;
    case "password":
      theString = value ? FormEngineValidation.passwordDummy : "";
      break;
    default:
      theString = value;
  }
  return theString;
};
FormEngineValidation.updateInputField = function (fieldName) {
  var $field = $("[name=\"" + fieldName + "\"]");
  var $mainField = $("[name=\"" + $field.data("main-field") + "\"]");
  if ($mainField.length === 0) {
    $mainField = $field;
  }
  var $humanReadableField = $("[data-formengine-input-name=\"" + $mainField.attr("name") + "\"]");
  var config = $mainField.data("config");
  if (typeof config !== "undefined") {
    var evalList = FormEngineValidation.trimExplode(",", config.evalList);
    var newValue = $humanReadableField.val();
    var i;
    for (i = 0; i < evalList.length; i++) {
      newValue = FormEngineValidation.processValue(evalList[i], newValue, config);
    }
    var formattedValue = newValue;
    for (i = 0; i < evalList.length; i++) {
      formattedValue = FormEngineValidation.formatValue(evalList[i], formattedValue, config);
    }
    $mainField.val(newValue);
    $humanReadableField.val(formattedValue);
  }
};
FormEngineValidation.validateField = function ($field, value) {
  value = value || $field.val() || "";
  var rules = $field.data("formengine-validation-rules");
  var markParent = false;
  var selected = 0;
  var returnValue = value;
  var $relatedField;
  var minItems;
  var maxItems;
  if (!$.isArray(value)) {
    value = FormEngineValidation.ltrim(value);
  }
  $.each(rules, function (k, rule) {
    if (markParent) {
      return false;
    }
    switch (rule.type) {
      case "required":
        if (value === "") {
          markParent = true;
          $field.closest(FormEngineValidation.markerSelector).addClass(FormEngineValidation.errorClass);
        }
        break;
      case "range":
        if (value !== "") {
          if (rule.minItems || rule.maxItems) {
            $relatedField = $(document).find("[name=\"" + $field.data("relatedfieldname") + "\"]");
            if ($relatedField.length) {
              selected = FormEngineValidation.trimExplode(",", $relatedField.val()).length;
            } else {
              selected = $field.val();
            }
            if (typeof rule.minItems !== "undefined") {
              minItems = rule.minItems * 1;
              if (!isNaN(minItems) && selected < minItems) {
                markParent = true;
              }
            }
            if (typeof rule.maxItems !== "undefined") {
              maxItems = rule.maxItems * 1;
              if (!isNaN(maxItems) && selected > maxItems) {
                markParent = true;
              }
            }
          }
          if (typeof rule.lower !== "undefined") {
            var minValue = rule.lower * 1;
            if (!isNaN(minValue) && value < minValue) {
              markParent = true;
            }
          }
          if (typeof rule.upper !== "undefined") {
            var maxValue = rule.upper * 1;
            if (!isNaN(maxValue) && value > maxValue) {
              markParent = true;
            }
          }
        }
        break;
      case "select":
        if (rule.minItems || rule.maxItems) {
          $relatedField = $(document).find("[name=\"" + $field.data("relatedfieldname") + "\"]");
          if ($relatedField.length) {
            selected = FormEngineValidation.trimExplode(",", $relatedField.val()).length;
          } else {
            selected = $field.find("option:selected").length;
          }
          if (typeof rule.minItems !== "undefined") {
            minItems = rule.minItems * 1;
            if (!isNaN(minItems) && selected < minItems) {
              markParent = true;
            }
          }
          if (typeof rule.maxItems !== "undefined") {
            maxItems = rule.maxItems * 1;
            if (!isNaN(maxItems) && selected > maxItems) {
              markParent = true;
            }
          }
        }
        break;
      case "group":
        if (rule.minItems || rule.maxItems) {
          selected = $field.find("option").length;
          if (typeof rule.minItems !== "undefined") {
            minItems = rule.minItems * 1;
            if (!isNaN(minItems) && selected < minItems) {
              markParent = true;
            }
          }
          if (typeof rule.maxItems !== "undefined") {
            maxItems = rule.maxItems * 1;
            if (!isNaN(maxItems) && selected > maxItems) {
              markParent = true;
            }
          }
        }
        break;
      case "inline":
        if (rule.minItems || rule.maxItems) {
          selected = FormEngineValidation.trimExplode(",", $field.val()).length;
          if (typeof rule.minItems !== "undefined") {
            minItems = rule.minItems * 1;
            if (!isNaN(minItems) && selected < minItems) {
              markParent = true;
            }
          }
          if (typeof rule.maxItems !== "undefined") {
            maxItems = rule.maxItems * 1;
            if (!isNaN(maxItems) && selected > maxItems) {
              markParent = true;
            }
          }
        }
        break;
      case "null":
        break;
    }
  });
  if (markParent) {
    $field.closest(FormEngineValidation.markerSelector).addClass(FormEngineValidation.errorClass);
    FormEngineValidation.markParentTab($field);
  }
  return returnValue;
};
FormEngineValidation.processValue = function (command, value, config) {
  var newString = "";
  var theValue = "";
  var theCmd = "";
  var a = 0;
  var returnValue = value;
  switch (command) {
    case "alpha":
    case "num":
    case "alphanum":
    case "alphanum_x":
      newString = "";
      for (a = 0; a < value.length; a++) {
        theChar = value.substr(a, 1);
        var special = theChar === "_" || theChar === "-";
        var alpha = theChar >= "a" && theChar <= "z" || theChar >= "A" && theChar <= "Z";
        var num = theChar >= "0" && theChar <= "9";
        switch (command) {
          case "alphanum":
            special = 0;
            break;
          case "alpha":
            num = 0;
            special = 0;
            break;
          case "num":
            alpha = 0;
            special = 0;
            break;
        }
        if (alpha || num || special) {
          newString += theChar;
        }
      }
      if (newString !== value) {
        returnValue = newString;
      }
      break;
    case "is_in":
      if (config.is_in) {
        theValue = "" + value;
        config.is_in = config.is_in.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        var re = new RegExp("[^" + config.is_in + "]+", "g");
        newString = theValue.replace(re, "");
      } else {
        newString = theValue;
      }
      returnValue = newString;
      break;
    case "nospace":
      returnValue = ("" + value).replace(/ /g, "");
      break;
    case "md5":
      if (value !== "") {
        returnValue = Md5.hash(value);
      }
      break;
    case "upper":
      returnValue = value.toUpperCase();
      break;
    case "lower":
      returnValue = value.toLowerCase();
      break;
    case "int":
      if (value !== "") {
        returnValue = FormEngineValidation.parseInt(value);
      }
      break;
    case "double2":
      if (value !== "") {
        returnValue = FormEngineValidation.parseDouble(value);
      }
      break;
    case "trim":
      returnValue = String(value).trim();
      break;
    case "datetime":
      if (value !== "") {
        theCmd = value.substr(0, 1);
        returnValue = FormEngineValidation.parseDateTime(value, theCmd);
      }
      break;
    case "date":
      if (value !== "") {
        theCmd = value.substr(0, 1);
        returnValue = FormEngineValidation.parseDate(value, theCmd);
      }
      break;
    case "time":
    case "timesec":
      if (value !== "") {
        theCmd = value.substr(0, 1);
        returnValue = FormEngineValidation.parseTime(value, theCmd, command);
      }
      break;
    case "year":
      if (value !== "") {
        theCmd = value.substr(0, 1);
        returnValue = FormEngineValidation.parseYear(value, theCmd);
      }
      break;
    case "null":
      break;
    case "password":
      break;
    default:
      if (typeof TBE_EDITOR.customEvalFunctions !== "undefined" && typeof TBE_EDITOR.customEvalFunctions[command] === "function") {
        returnValue = TBE_EDITOR.customEvalFunctions[command](value);
      }
  }
  return returnValue;
};
FormEngineValidation.validate = function () {
  $(document).find(FormEngineValidation.markerSelector + ", .t3js-tabmenu-item").removeClass(FormEngineValidation.errorClass).removeClass("has-validation-error");
  $(FormEngineValidation.rulesSelector).each(function () {
    var $field = $(this);
    if (!$field.closest(".t3js-flex-section-deleted, .t3js-inline-record-deleted").length) {
      var modified = false;
      var currentValue = $field.val();
      var newValue = FormEngineValidation.validateField($field, currentValue);
      if ($.isArray(newValue) && $.isArray(currentValue)) {
        if (newValue.length !== currentValue.length) {
          modified = true;
        } else {
          for (var i = 0; i < newValue.length; i++) {
            if (newValue[i] !== currentValue[i]) {
              modified = true;
              break;
            }
          }
        }
      } else if (newValue.length && currentValue !== newValue) {
        modified = true;
      }
      if (modified) {
        $field.val(newValue);
      }
    }
  });
  $(document).trigger("t3-formengine-postfieldvalidation");
};
FormEngineValidation.markFieldAsChanged = function ($field) {
  var $paletteField = $field.closest(".t3js-formengine-palette-field");
  $paletteField.addClass("has-change");
};
FormEngineValidation.trimExplode = function (delimiter, string) {
  var result = [];
  var items = string.split(delimiter);
  for (var i = 0; i < items.length; i++) {
    var item = items[i].trim();
    if (item.length > 0) {
      result.push(item);
    }
  }
  return result;
};
FormEngineValidation.parseInt = function (value) {
  var theVal = "" + value, returnValue;
  if (!value) {
    return 0;
  }
  returnValue = parseInt(theVal, 10);
  if (isNaN(returnValue)) {
    return 0;
  }
  return returnValue;
};
FormEngineValidation.parseDouble = function (value) {
  var theVal = "" + value;
  theVal = theVal.replace(/[^0-9,\.-]/g, "");
  var negative = theVal.substring(0, 1) === "-";
  theVal = theVal.replace(/-/g, "");
  theVal = theVal.replace(/,/g, ".");
  if (theVal.indexOf(".") === -1) {
    theVal += ".0";
  }
  var parts = theVal.split(".");
  var dec = parts.pop();
  theVal = Number(parts.join("") + "." + dec);
  if (negative) {
    theVal *= -1;
  }
  theVal = theVal.toFixed(2);
  return theVal;
};
FormEngineValidation.ltrim = function (value) {
  var theVal = "" + value;
  if (!value) {
    return "";
  }
  return theVal.replace(/^\s+/, "");
};
FormEngineValidation.btrim = function (value) {
  var theVal = "" + value;
  if (!value) {
    return "";
  }
  return theVal.replace(/\s+$/, "");
};
FormEngineValidation.parseDateTime = function (value, command) {
  var today = new Date();
  var values = FormEngineValidation.split(value);
  var add = 0;
  switch (command) {
    case "d":
    case "t":
    case "n":
      FormEngineValidation.lastTime = FormEngineValidation.convertClientTimestampToUTC(FormEngineValidation.getTimestamp(today), 0);
      if (values.valPol[1]) {
        add = FormEngineValidation.pol(values.valPol[1], FormEngineValidation.parseInt(values.values[1]));
      }
      break;
    case "+":
    case "-":
      if (FormEngineValidation.lastTime === 0) {
        FormEngineValidation.lastTime = FormEngineValidation.convertClientTimestampToUTC(FormEngineValidation.getTimestamp(today), 0);
      }
      if (values.valPol[1]) {
        add = FormEngineValidation.pol(values.valPol[1], FormEngineValidation.parseInt(values.values[1]));
      }
      break;
    default:
      var index = value.indexOf(" ");
      if (index !== -1) {
        var dateVal = FormEngineValidation.parseDate(value.substr(index, value.length), value.substr(0, 1));
        FormEngineValidation.lastTime = dateVal + FormEngineValidation.parseTime(value.substr(0, index), value.substr(0, 1), "time");
      } else {
        FormEngineValidation.lastTime = FormEngineValidation.parseDate(value, value.substr(0, 1));
      }
  }
  FormEngineValidation.lastTime += add * 24 * 60 * 60;
  return FormEngineValidation.lastTime;
};
FormEngineValidation.parseDate = function (value, command) {
  var today = new Date();
  var values = FormEngineValidation.split(value);
  var add = 0;
  switch (command) {
    case "d":
    case "t":
    case "n":
      FormEngineValidation.lastDate = FormEngineValidation.getTimestamp(today);
      if (values.valPol[1]) {
        add = FormEngineValidation.pol(values.valPol[1], FormEngineValidation.parseInt(values.values[1]));
      }
      break;
    case "+":
    case "-":
      if (values.valPol[1]) {
        add = FormEngineValidation.pol(values.valPol[1], FormEngineValidation.parseInt(values.values[1]));
      }
      break;
    default:
      var index = 4;
      if (values.valPol[index]) {
        add = FormEngineValidation.pol(values.valPol[index], FormEngineValidation.parseInt(values.values[index]));
      }
      if (values.values[1] && values.values[1].length > 2) {
        if (values.valPol[2]) {
          add = FormEngineValidation.pol(values.valPol[2], FormEngineValidation.parseInt(values.values[2]));
        }
        var temp = values.values[1];
        values = FormEngineValidation.splitSingle(temp);
      }
      var year = values.values[3] ? FormEngineValidation.parseInt(values.values[3]) : FormEngineValidation.getYear(today);
      var usMode = FormEngineValidation.USmode ? 1 : 2;
      var month = values.values[usMode] ? FormEngineValidation.parseInt(values.values[usMode]) : today.getUTCMonth() + 1;
      usMode = FormEngineValidation.USmode ? 2 : 1;
      var day = values.values[usMode] ? FormEngineValidation.parseInt(values.values[usMode]) : today.getUTCDate();
      var theTime = __import_moment.utc();
      theTime.year(parseInt(year)).month(parseInt(month) - 1).date(parseInt(day)).hour(0).minute(0).second(0);
      FormEngineValidation.lastDate = theTime.unix();
  }
  FormEngineValidation.lastDate += add * 24 * 60 * 60;
  return FormEngineValidation.lastDate;
};
FormEngineValidation.parseTime = function (value, command, type) {
  var today = new Date();
  var values = FormEngineValidation.split(value);
  var add = 0;
  switch (command) {
    case "d":
    case "t":
    case "n":
      FormEngineValidation.lastTime = FormEngineValidation.getTimeSecs(today);
      if (values.valPol[1]) {
        add = FormEngineValidation.pol(values.valPol[1], FormEngineValidation.parseInt(values.values[1]));
      }
      break;
    case "+":
    case "-":
      if (FormEngineValidation.lastTime == 0) {
        FormEngineValidation.lastTime = FormEngineValidation.getTimeSecs(today);
      }
      if (values.valPol[1]) {
        add = FormEngineValidation.pol(values.valPol[1], FormEngineValidation.parseInt(values.values[1]));
      }
      break;
    default:
      var index = type === "timesec" ? 4 : 3;
      if (values.valPol[index]) {
        add = FormEngineValidation.pol(values.valPol[index], FormEngineValidation.parseInt(values.values[index]));
      }
      if (values.values[1] && values.values[1].length > 2) {
        if (values.valPol[2]) {
          add = FormEngineValidation.pol(values.valPol[2], FormEngineValidation.parseInt(values.values[2]));
        }
        var temp = values.values[1];
        values = FormEngineValidation.splitSingle(temp);
      }
      var sec = values.values[3] ? FormEngineValidation.parseInt(values.values[3]) : today.getUTCSeconds();
      if (sec > 59) {
        sec = 59;
      }
      var min = values.values[2] ? FormEngineValidation.parseInt(values.values[2]) : today.getUTCMinutes();
      if (min > 59) {
        min = 59;
      }
      var hour = values.values[1] ? FormEngineValidation.parseInt(values.values[1]) : today.getUTCHours();
      if (hour >= 24) {
        hour = 0;
      }
      var theTime = __import_moment.utc();
      theTime.year(1970).month(0).date(1).hour(hour).minute(min).second(type === "timesec" ? sec : 0);
      FormEngineValidation.lastTime = theTime.unix();
  }
  FormEngineValidation.lastTime += add * 60;
  if (FormEngineValidation.lastTime < 0) {
    FormEngineValidation.lastTime += 24 * 60 * 60;
  }
  return FormEngineValidation.lastTime;
};
FormEngineValidation.parseYear = function (value, command) {
  var today = new Date();
  var values = FormEngineValidation.split(value);
  var add = 0;
  switch (command) {
    case "d":
    case "t":
    case "n":
      FormEngineValidation.lastYear = FormEngineValidation.getYear(today);
      if (values.valPol[1]) {
        add = FormEngineValidation.pol(values.valPol[1], FormEngineValidation.parseInt(values.values[1]));
      }
      break;
    case "+":
    case "-":
      if (values.valPol[1]) {
        add = FormEngineValidation.pol(values.valPol[1], FormEngineValidation.parseInt(values.values[1]));
      }
      break;
    default:
      if (values.valPol[2]) {
        add = FormEngineValidation.pol(values.valPol[2], FormEngineValidation.parseInt(values.values[2]));
      }
      var year = values.values[1] ? FormEngineValidation.parseInt(values.values[1]) : FormEngineValidation.getYear(today);
      FormEngineValidation.lastYear = year;
  }
  FormEngineValidation.lastYear += add;
  return FormEngineValidation.lastYear;
};
FormEngineValidation.getYear = function (timeObj) {
  if (timeObj === null) {
    return null;
  }
  return timeObj.getUTCFullYear();
};
FormEngineValidation.getDate = function (timeObj) {
  var theTime = new Date(FormEngineValidation.getYear(timeObj), timeObj.getUTCMonth(), timeObj.getUTCDate());
  return FormEngineValidation.getTimestamp(theTime);
};
FormEngineValidation.pol = function (foreign, value) {
  return eval((foreign == "-" ? "-" : "") + value);
};
FormEngineValidation.convertClientTimestampToUTC = function (timestamp, timeonly) {
  var timeObj = new Date(timestamp * 1000);
  timeObj.setTime((timestamp - timeObj.getTimezoneOffset() * 60) * 1000);
  if (timeonly) {
    return FormEngineValidation.getTime(timeObj);
  } else {
    return FormEngineValidation.getTimestamp(timeObj);
  }
};
FormEngineValidation.getTimestamp = function (timeObj) {
  return Date.parse(timeObj) / 1000;
};
FormEngineValidation.getTime = function (timeObj) {
  return timeObj.getUTCHours() * 60 * 60 + timeObj.getUTCMinutes() * 60 + FormEngineValidation.getSecs(timeObj);
};
FormEngineValidation.getSecs = function (timeObj) {
  return timeObj.getUTCSeconds();
};
FormEngineValidation.getTimeSecs = function (timeObj) {
  return timeObj.getHours() * 60 * 60 + timeObj.getMinutes() * 60 + timeObj.getSeconds();
};
FormEngineValidation.markParentTab = function ($element) {
  var $panes = $element.parents(".tab-pane");
  $panes.each(function () {
    var $pane = $(this);
    var id = $pane.attr("id");
    $(document).find("a[href=\"#" + id + "\"]").closest(".t3js-tabmenu-item").addClass("has-validation-error");
  });
};
FormEngineValidation.splitSingle = function (value) {
  var theVal = "" + value;
  var result = {
    values: [],
    pointer: 3
  };
  result.values[1] = theVal.substr(0, 2);
  result.values[2] = theVal.substr(2, 2);
  result.values[3] = theVal.substr(4, 10);
  return result;
};
FormEngineValidation.splitStr = function (theStr1, delim, index) {
  var theStr = "" + theStr1;
  var lengthOfDelim = delim.length;
  var sPos = -lengthOfDelim;
  if (index < 1) {
    index = 1;
  }
  for (var a = 1; a < index; a++) {
    sPos = theStr.indexOf(delim, sPos + lengthOfDelim);
    if (sPos == -1) {
      return null;
    }
  }
  var ePos = theStr.indexOf(delim, sPos + lengthOfDelim);
  if (ePos == -1) {
    ePos = theStr.length;
  }
  return theStr.substring(sPos + lengthOfDelim, ePos);
};
FormEngineValidation.split = function (value) {
  var result = {
    values: [],
    valPol: [],
    pointer: 0,
    numberMode: 0,
    theVal: ""
  };
  value += " ";
  for (var a = 0; a < value.length; a++) {
    var theChar = value.substr(a, 1);
    if (theChar < "0" || theChar > "9") {
      if (result.numberMode) {
        result.pointer++;
        result.values[result.pointer] = result.theVal;
        result.theVal = "";
        result.numberMode = 0;
      }
      if (theChar == "+" || theChar == "-") {
        result.valPol[result.pointer + 1] = theChar;
      }
    } else {
      result.theVal += theChar;
      result.numberMode = 1;
    }
  }
  return result;
};
FormEngineValidation.registerSubmitCallback = function () {
  DocumentSaveActions.getInstance().addPreSubmitCallback(function (e) {
    if ($("." + FormEngineValidation.errorClass).length > 0) {
      Modal.confirm(TYPO3.lang.alert || "Alert", TYPO3.lang["FormEngine.fieldsMissing"], Severity.error, [{
        text: TYPO3.lang["button.ok"] || "OK",
        active: true,
        btnClass: "btn-default",
        name: "ok"
      }]).on("button.clicked", function () {
        Modal.dismiss();
      });
      e.stopImmediatePropagation();
    }
  });
};

export default FormEngineValidation;
