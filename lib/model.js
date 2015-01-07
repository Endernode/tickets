var integrity = require('./integrity');
var Promise = require('bluebird');
var merge = require('merge');

var Tickets = module.exports = function(knex) {
	if (!(this instanceof Tickets)) {
		return new Tickets(knex);
	}

	this.knex = knex;
};

Tickets.prototype.now = function() {
	return ~~(Date.now() / 1000);
};

Tickets.prototype.meta = function(id) { // TODO: if its not an object, make it one (do this for the other functions that are HTTPGET orientated too)
	integrity.verify('id', id);

	return Promise.all([
		this.knex.select().from('tickets').where('id', id).limit(1),
		this.knex.select('author as starter', 'postdate as opendate').from('replies').where('ticket', id).orderBy('postdate', 'asc').limit(1),
		this.knex.select('newstatus as status').from('replies').where('ticket', id).whereNotNull('newstatus').orderBy('postdate', 'desc').limit(1),
		this.knex.select('postdate as lastdate').from('replies').where('ticket', id).orderBy('postdate', 'desc').limit(1),
		this.knex.count('id as replies').from('replies').where('ticket', id).limit(1)
	]).then(function(info) {
		return merge.apply(null, Array.prototype.concat.apply([], info));
	});
};

Tickets.prototype.replies = function(id) {
	integrity.verify('id', id);

	return this.knex.select().from('replies').where('ticket', id).orderBy('postdate', 'asc');
};

Tickets.prototype.full = function(id) {
	integrity.verify('id', id);

	return Promise.all([
		this.meta(id),
		this.replies(id)
	]).then(function(items) {
		items[0].replies = items[1];
		return items[0];
	});
};

Tickets.prototype.create = function(data) {
	integrity.verify('id', data.ticket);
	// TODO: more integrity checks

	return knex('tickets').insert(data, 'id').then(function(ids) {
		return knex('replies').insert(data);
	});
};

Tickets.prototype.reply = function(data) {
	integrity.verify('id', data.ticket);
	// TODO: more integrity checks

	return this.knex('replies').insert(data).then(function() {
		return data.ticket;
	});
};

Tickets.prototype.status = function(data) {
	// under construction, derp

	data.postdate = data.postdate || this.now();

	//return this.knex('replies').insert({ author: 123, ticket: ticket, newstatus: "closed", postdate: postdate });
};

