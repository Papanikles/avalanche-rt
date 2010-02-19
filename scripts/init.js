	/*
	 *	Copyright © Keithamus
	 *	This code is licensed under the MIT license.
	 *	For more details, see http://www.opensource.org/licenses/mit-license.php
	 */

//Initialise our "torrent" object.
var torrent;

//When DOM is ready...
$(document).ready( function() {

	//Create our settings object, we should set some defaults to stop potential bugs
	window.settings = {
		refresh_delay: 10000,
		web_searches: [{
			name: 'Google',
			url: 'http://www.google.com/search?hl=en&q=%s+filetype:torrent&btnG=Search'
		}]
	};

	//Load our settings into our global settings object:
	$.getJSON('prefs.json', function(data) {
		window.settings = data;
		//Populate the search menu
		$.each(data.web_searches, function(i, search)
		{
			anchor = $('<a/>').click(torrent.setWebSearchString);
			anchor[0].href="#setWebSearchString/"+ search.url;
			anchor[0].innerHTML=search.name;
			$('#web_search_menu').append($('<li/>').append(anchor));
		});
	});

	//Load our remote class and torrent class
	new Remote();
	new Torrent();

	//Get the upload and download rates and display them in the statusbar:
	remote.getRate('upload',function(data)
	{
		$('#status_upload_max')[0].innerHTML =
			data.getRate == 0?'Unlimited':data.getRate+ ' KB/s';
	});

	remote.getRate('download',function(data)
	{
		$('#status_download_max')[0].innerHTML =
			data.getRate == 0?'Unlimited':data.getRate+ ' KB/s';
	});

});


//Some common functions we'll use alot:

/*
 * Math.formatbytes
 *
 * Change bytes into an appropriate human SI figure (like GB)
 *
 * @argument bytes {integer} The bytes to retun as SI figure.
 *
 * @returns {string} bytes as an SI figure (e.g "3.00 GB")
 */
Math.formatBytes = function(bytes)
{
	if(bytes==0) return '0 B';
	var size;
	var unit;

	// Size is 1 or more Terabytes (TB).
	if ( bytes >= 1099511627776 )
	{

		size = bytes / 1099511627776;
		unit = ' TB';

	// Size is 1 or more Gigabytes (GB).
 }
	else if ( bytes >= 1073741824 )
	{

		size = bytes / 1073741824;
		unit = ' GB';

	// Size is 1 or more Megabytes (MB).
	}
	else if ( bytes >= 1048576 )
	{

		size = bytes / 1048576;
		unit = ' MB';

	// Size is 1 or more Kilobytes (KB).
 }
	else if ( bytes >= 1024 )
	{

		size = bytes / 1024;
		unit = ' KB';

	// The size is less than one KB
	}
	else
	{

		size = bytes;
		unit = ' B';

	}

	size = size>0?size.toFixed(2):0;

	//Make it say 0 instead of 0.00
	if (size == 0.00) {
		size = 0;
	}

	return size + unit;
}

/*
 *   Converts seconds to more readable units (hours, minutes etc).
 *
 *   @param seconds {integer} The number of seconds to format
 *   @returns {string} Seconds into redable Days, Minutes, Hours.
 */
Math.formatSeconds = function(seconds)
{
	//Start with an empty result var:
	var result = '';

	//See if the result is months long
	var num = Math.floor(seconds / 2629743);
	if (num > 0) result += num+ ' month(s), ';

	//See if the result is weeks long:
	num = Math.floor((seconds % 2629743) / 604800);
	if (num > 0) result += num+ ' week(s), ';

	//See if the result is days long:
	num = Math.floor((seconds % 604800) / 86400);
	if (num > 0) result += num+ ' day(s), ';

	//See if the result is hours long (minus the days)
	num = Math.floor((seconds % 86400) / 3600);
	if (num > 0) result += num+ ' hour(s), ';

	//See if the result is minutes long (minus the hours)
	num = Math.floor((seconds % 3600) / 60);
	if (num > 0) result += num+ ' min(s), ';

 return result+ Math.floor((seconds % 3600) % 60)+ ' seconds';
}

/*
 * :icontains selector
 *
 * Just a quick new selector, same as ":contains" except it is case insensitive!
 *
 */
$.expr[':'].icontains = function(obj, index, meta, stack){
return (obj.textContent || obj.innerText || jQuery(obj).text() || '').toLowerCase().indexOf(meta[3].toLowerCase()) >= 0;
};