	/*
	 * Init.js Javascript Library 0.9
	 *
	 * Avalanche 0.9 Beta
	 *
	 *	Copyright 2009 © Keithamus
	 *	This code is licensed under the MIT license.
	 *	For more details, see http://www.opensource.org/licenses/mit-license.php
		*
		* For more information, see http://code.google.com/p/avalanche-rt
		*
		* Date: Fri, 19th Feb 2010.
		*
	 */

//When DOM is ready...
$(document).ready( function() {

	//Create our settings object, we should set some defaults to stop potential bugs
	window.settings = {
		refresh_delay: 10000,
		default_sort: 'new_name',
		default_sort_by: 'asc',
		detail_pane_open: true,
		web_searches: [{
			name: 'Google',
			url: 'http://www.google.com/search?hl=en&q=%s+filetype:torrent&btnG=Search'
		}]
	};

	//Load our settings into our global settings object:
	//SIDE: We'd love to use getJSON, but getJSON silently fails - which is crap
	$.ajax({url:'prefs.json', dataType: 'json', success: function(data) {
		window.settings = $.extend(window.settings, data);
		//If the details pane has a setting telling it to close, close it.
		if(data.detail_pane_open==false || data.detail_pane_open=='false')
		{
			torrent.toggleDetailPane();
		}
		//If the default_filter_by setting is active, then filter to that group:
		if(data.default_filter_by) {
			$('a[href="#filterTorrentStatus/'+ data.default_filter_by+ '"]').click();
		}
		//Populate the search menu
		$.each(data.web_searches, function(i, search)
		{
			anchor = $('<a/>').click(torrent.setWebSearchString);
			anchor[0].href="#setWebSearchString/"+ search.url;
			anchor[0].innerHTML=search.name;
			$('#web_search_menu').append($('<li/>').append(anchor));
		});
		//Make the first search engine in the list the default.
		$('#web_search_menu a').first().click();
	}, error: function(req,status,error){
		torrent.openDialogue('error_popup');
		$('#error_details').text(
			'Error parsing prefs.json'+ "\n\n"+ status+ "\n\n"+ error).focus().select();
	}});

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