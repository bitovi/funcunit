/*funcunit*/
var syn = require('syn');
var FuncUnit = require('./browser/core.js');
require('./browser\\adapters/adapters.js');
require('./browser/open.js');
require('./browser/actions.js');
require('./browser/getters.js');
require('./browser/traversers.js');
require('./browser/queue.js');
require('./browser/waits.js');
window.FuncUnit = window.S = window.F = FuncUnit;
module.exports = FuncUnit;