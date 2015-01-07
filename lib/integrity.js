var exports = module.exports = {};

var checks = module.exports.checks = {};
var errors = module.exports.errors = {};

function altError(model, value) {
	return new Error("Value '" + value + "' does not conform the '" + model + "' model");
}

exports.verify = function(model, value) {
	if (typeof checks[model] != 'function') {
		throw new Error("Undefined check '" + model + "'");
	}

	var error = typeof errors[model] == 'function' ? errors[model](value) :
		altError(model, value);

	if (!checks[model]) {
		throw error();
	}
}

checks.id = function checkId(id) {
	return typeof data.ticket != 'undefined' &&
		!isNaN(id) && parseInt(Number(id)) == id &&
		!isNaN(parseInt(data.ticket, 10)) && id >= 0;
};

errors.id = function() {
	return new Error("The ticket field must have an integer value");
};

