/*
    
    
*/
var moment = require('moment');
var Parser = require('../parser').Parser;
var ParsedResult = require('../../result').ParsedResult;

var PATTERN = new RegExp('(\\W|^)' + 
    '(?:(?:\\,|\\(|\\（)\\s*)?' + 
    '(?:(this|last|next)\\s*)?' +
    '(воскресенье|вс|понедельник|пн|вторник|вт|вт|среда|ср|четверг|чт|чт|пятница|пт|суббота|сб)' +
    '(?:\\s*(?:\\,|\\)|\\）))?' + 
    '(?:\\s*(this|last|next)\\s*week)?' + 
    '(?=\\W|$)', 'i');
var DAYS_OFFSET = { 'воскресенье': 0, 'вс': 0, 'понедельник': 1, 'пн': 1,'вторник': 2, 'вт':2, 'вт':2, 'среда': 3, 'ср': 3,
    'четверг': 4, 'чт':4, 'чт': 4, 'чт': 4,'пятница': 5, 'пт': 5,'суббота': 6, 'сб': 6,}

var PREFIX_GROUP = 2;
var WEEKDAY_GROUP = 3;
var POSTFIX_GROUP = 4;

exports.Parser = function RUWeekdayParser() {
    Parser.call(this);

    this.pattern = function() { return PATTERN; }
    
    this.extract = function(text, ref, match, opt){ 
        console.log(match);
        var index = match.index + match[1].length;
        var text = match[0].substr(match[1].length, match[0].length - match[1].length);
        var result = new ParsedResult({
            index: index,
            text: text,
            ref: ref,
        });
        
        var dayOfWeek = match[WEEKDAY_GROUP].toLowerCase();
        var offset = DAYS_OFFSET[dayOfWeek];
        if(offset === undefined) return null;
        
        var startMoment = moment(ref);
        var prefix = match[PREFIX_GROUP];
        var postfix = match[POSTFIX_GROUP];

        if (prefix || postfix) {
            var norm = prefix || postfix;
            norm = norm.toLowerCase();
            
            if(norm == 'last')
                startMoment.day(offset - 7)
            else if(norm == 'next')
                startMoment.day(offset + 7)
            else if(norm== 'this')
                startMoment.day(offset);
        } else{
            var refOffset = startMoment.day();

            if (Math.abs(offset - 7 - refOffset) < Math.abs(offset - refOffset)) {
                startMoment.day(offset - 7);
            } else if (Math.abs(offset + 7 - refOffset) < Math.abs(offset - refOffset)) {
                startMoment.day(offset + 7);
            } else {
                startMoment.day(offset);
            }
        }

        result.start.assign('weekday', offset);
        result.start.imply('day', startMoment.date())
        result.start.imply('month', startMoment.month() + 1)
        result.start.imply('year', startMoment.year())
        return result;
    }
}

