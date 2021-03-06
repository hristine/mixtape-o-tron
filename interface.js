var nestapikey = "LHDCAIKGCIJUU8PO3",
	nest = nest.nest(nestapikey),
	songsTemplate = Handlebars.compile([
		'{{#each results }}',
		'<li data-song-id="{{ id }}" data-artist-id="{{ artist_id }}" class="song">',
			'<span class="deets" style="float: left">',
				'<span class="includeSong">&#8679;</span><span class="removeSong">&#215;</span>',
				'<b>{{ title }}</b> - {{ artist_name }} ',
			'</span>',
			'<button class="moreSongs">More Song Suggestions</button>',			
			'<button class="moreArtists">More Artist Suggestions</button>',
		'</li>',
		'{{/each }}'
	].join('')),
	termsTemplate = Handlebars.compile([
		'{{# each terms }}',
		'<option value="{{ name }}">{{ name }}</option>',
		'{{/each }}'
	].join('')),
	artistsTemplate = Handlebars.compile([
		'{{# each artists }}',
		'<div data-artist-id="{{ id }}" class="artistName">{{ name }}</div>',
		'{{/each }}'
	].join('')),
	songLookup = {};

function listMoreSongs(error, results) {
	jQuery('#foundit').empty().append(songsTemplate({results: results}));
	jQuery.each(results, function (_, song) {
		songLookup[song.id] = song;
	});
}
function findMoreSongs() {
	var args = {
		bucket: ['audio_summary','song_type']
	};
	jQuery('.criteria').each(function () {
		if (jQuery(this).val()) {
			args[jQuery(this).attr('name')] = jQuery(this).val();
		}
	});
	nest.searchSongs(args, listMoreSongs);
}

function findSimilarSongs() {
	var songId = jQuery(this).parents('li').attr('data-song-id'),
		song = songLookup[songId];

	var args = {
		bucket: ['audio_summary','song_type'],
		min_energy: song.audio_summary.energy * 0.8,
		max_energy: Math.min(song.audio_summary.energy * 1.2, 1),
		min_tempo: song.audio_summary.tempo * 0.8,
		max_tempo: Math.min(song.audio_summary.tempo * 1.2, 500),
		artist: song.artist_name
	};
	nest.searchSongs(args, listMoreSongs);
}

function listSimilarArtists(error, results) {
	jQuery('#artists')
		.empty()
		.append(artistsTemplate({artists: results.artists}));
}
function findSimilarArtists() {
	var artistId = jQuery(this).parents('li').attr('data-artist-id'),
		artist = nest.artist({id: artistId});
	artist.similar(listSimilarArtists);
}
function addArtistToCriteria() {
	jQuery('.criteria[name="artist"]').val(jQuery(this).text());
	// These are mutually exclusive.
	jQuery('.criteria[name="mood"]').val('');
	jQuery('.criteria[name="style"]').val('');
	findMoreSongs();
}

function moveSongToPlaylist() {
	var elt = jQuery(this).parents('li');
	jQuery('#keepit').append(elt);
	jQuery('#keepit .none').hide();
}
function removeSongFromPlaylist() {
	jQuery(this).parents('li').remove();
	if (jQuery('#keepit').children().length === 1) {
		jQuery('#keepit .none').show();
	}
}

function checkCriteria() {
	if (jQuery(this).is('select')) {
		jQuery('.criteria[name="artist"]').val('');
		jQuery('.criteria[name="title"]').val('');
	} else {
		jQuery('select[name="mood"], select[name="style"]').val('');
	}
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
	jQuery('select, input')
		.on('change', checkCriteria);
	jQuery("#foundit")
		.on('click', '.includeSong', moveSongToPlaylist)
		.on('click', '.moreArtists', findSimilarArtists)
		.on('click', '.moreSongs', findSimilarSongs);
	jQuery('#keepit')
		.on('click', '.moreArtists', findSimilarArtists)
		.on('click', '.removeSong', removeSongFromPlaylist)
		.on('click', '.moreSongs', findSimilarSongs);
	jQuery('#artists')
		.on('click', '.artistName', addArtistToCriteria);

});