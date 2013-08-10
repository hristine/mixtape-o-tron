
var nestapikey = "LHDCAIKGCIJUU8PO3",
	nest = nest.nest(nestapikey),
	songsTemplate = Handlebars.compile([
		'{{#each results }}',
		'<li data-song-id="{{ id }}" class="song"><b>{{ title }}</b> - {{ artist_name }}</li>',
		'{{/each }}'
	].join('')),
	termsTemplate = Handlebars.compile([
		'{{# each terms }}',
		'<option value="{{ name }}">{{ name }}</option>',
		'{{/each }}'
	].join(''));

function listMoreSongs(error, results) {
	jQuery('#foundit').empty().append(songsTemplate({results: results}));
}
function findMoreSongs() {
	var args = {};
	jQuery('.criteria').each(function () {
		if (jQuery(this).val()) {
			args[jQuery(this).attr('name')] = jQuery(this).val();
		}
	});
	nest.searchSongs(args, listMoreSongs);
}

function moveSongToPlaylist() {
	var elt = jQuery(this);
	jQuery('#keepit').append(elt);
	jQuery('#keepit .none').hide();
}

function loadTerms(termType) {
	var args = {
		api_key:nestapikey,
		type: termType
	};
	function listTerms (data) {
		var elt = jQuery('[name="' + termType + '"]');
		elt.append(termsTemplate({terms: data.response.terms}));
	}

	jQuery.get('http://developer.echonest.com/api/v4/artist/list_terms', args, listTerms);
}

jQuery(document).ready(function () {
	loadTerms('mood');
	loadTerms('style');
	jQuery('#doSearch').click(findMoreSongs);
	jQuery("#foundit").on('click', '.song', moveSongToPlaylist);
});