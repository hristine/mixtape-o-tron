var nest = nest.nest("LHDCAIKGCIJUU8PO3"),
	songsTemplate = Handlebars.compile([
		'{{#each results }}',
		'<li data-song-id="{{ id }}" class="song"><b>{{ title }}</b> - {{ artist_name }}</li>',
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

jQuery(document).ready(function () {
	jQuery('#doSearch').click(findMoreSongs);
	jQuery("#foundit").on('click', '.song', moveSongToPlaylist);
});