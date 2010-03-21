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

	window.currentVersion = 'r43';

	//Create our settings object, we should set some defaults to stop potential bugs
	window.settings = {
		refresh_delay: 10000,
		default_sort: 'new_name',
		default_sort_by: 'asc',
		detail_pane_open: true,
		detail_pane_width: 332,
		default_language: 'en-gb',
		release_channel: 'stable',
		web_searches: [{
			name: 'Google',
			url: 'http://www.google.com/search?hl=en&q=%s+filetype:torrent&btnG=Search'
		}]
	};

	window.lang = { open_title: 'Open Torrent' }

	//Load our settings into our global settings object:
	//SIDE: We'd love to use getJSON, but getJSON silently fails - which is crap
	$.ajax({url:'prefs.json', dataType: 'json', success: function(data) {
		window.settings = $.extend(window.settings,data);
		//We should get our language variables:
		//Load our language variable:
		$.ajax({url:'lang/'+ (window.settings.default_language || 'en-gb')+ '.json', dataType: 'json',
			success: function(data)
			{
				window.lang = data;
				$('#version').text(window.currentVersion+ ' '+ window.settings.release_channel);
				//Change the toolbar texts to match that of the language file:
				$('#header_open a').text(window.lang.toolbar_open);
				$('#header_remove a').text(window.lang.toolbar_remove);
				$('#header_resume a').text(window.lang.toolbar_resume);
				$('#header_pause a').text(window.lang.toolbar_pause);
				$('#header_resume_all a').text(window.lang.toolbar_resumeall);
				$('#header_pause_all a').text(window.lang.toolbar_pauseall);
				$('#header_prefs a').text(window.lang.toolbar_prefs);
				$('#header_about a').text(window.lang.toolbar_about);
				//Right click menu
				$('#torrent_context_menu .pause a').text(window.lang.toolbar_pause);
				$('#torrent_context_menu .resume a').text(window.lang.toolbar_resume);
				$('#torrent_context_menu .remove a').text(window.lang.toolbar_remove);
				$('#torrent_context_menu .rename a').text(window.lang.toolbar_rename);

				//Details Pane
				$('#details_general span').text(window.lang.details_general).attr('title',window.lang.details_general);
				$('#details_files span').text(window.lang.details_files).attr('title',window.lang.details_files);
				$('#details_files_contain .labellist li').text(window.lang.details_no_files);
				$('#details_peers span').text(window.lang.details_peers).attr('title',window.lang.details_peers);
				$('#details_peers_contain .labellist li').text(window.lang.details_no_peers);
				$('#details_trackers span').text(window.lang.details_trackers).attr('title',window.lang.details_trackers);
				$('#details_trackers_contain .labellist li').text(window.lang.details_no_trackers);
				$('#details_header_name').text(window.lang.details_header_name);
				$('#details_general_contain h3').text(window.lang.details_general);
				$('#details_files_contain h3').text(window.lang.details_files);
				$('#details_peers_contain h3').text(window.lang.details_peers);
				$('#details_trackers_contain h3').text(window.lang.details_trackers);
				$('#general_contain_title').text(window.lang.details_general_contain_title);
				$('#general_real_name').text(window.lang.details_general_real_name);
				$('#general_label').text(window.lang.details_general_label);
				$('#general_created_on').text(window.lang.details_general_created_on);
				$('#general_hash').text(window.lang.details_general_hash);
				$('#general_tracker').text(window.lang.details_general_tracker);
				$('#general_health').text(window.lang.details_general_health);
				$('#general_private').text(window.lang.details_general_private);
				$('#general_transfer').text(window.lang.details_general_transfer);
				$('#general_time_remaining').text(window.lang.details_general_time_remaining);
				$('#general_downloaded').text(window.lang.details_general_downloaded);
				$('#general_uploaded').text(window.lang.details_general_uploaded);
				$('#general_down_speed').text(window.lang.details_general_down_speed);
				$('#general_up_speed').text(window.lang.details_general_up_speed);
				$('#general_seeds').text(window.lang.details_general_seeds);
				$('#general_peers').text(window.lang.details_general_peers);
				$('#general_wasted').text(window.lang.details_general_wasted);
				$('#general_share_ratio').text(window.lang.details_general_share_ratio);
				$('#general_disk').text(window.lang.details_general_disk);
				$('#general_free_disk').text(window.lang.details_general_free_disk);
				$('#general_torrentspercent').text(window.lang.details_general_torrentspercent);
				$('#general_savedin').text(window.lang.details_general_savedin);

				//Status bar
				$('#status_torrent_text').text(window.lang.statusbar_torrentsOrderedBy);
				$('#status_torrent_text').text(window.lang.statusbar_torrentsOrderedBy);
				$('#status_speeds .of').text(window.lang.statusbar_speedOf);

				//Priority Menu
				$('a[href="#setPriority/3"]').text(window.lang.priorities[3]);
				$('a[href="#setPriority/2"]').text(window.lang.priorities[2]);
				$('a[href="#setPriority/1"]').text(window.lang.priorities[1]);
				$('a[href="#setPriority/0"]').text(window.lang.priorities[0]);
				$('a[href="#setRate/download/Unlimited"]').text(window.lang.statusbar_UnlimitedSpeed);

				$('a[href="#setOrder/new_name"]').text(window.lang.sortmenu_Name);
				$('a[href="#setOrder/percent_done"]').text(window.lang.sortmenu_Percent);
				$('a[href="#setOrder/uploaded"]').text(window.lang.sortmenu_Uploaded);
				$('a[href="#setOrder/downloaded"]').text(window.lang.sortmenu_Downloaded);
				$('a[href="#setOrder/share_ratio"]').text(window.lang.sortmenu_Ratio);
				$('a[href="#setOrder/seeders_connected"]').text(window.lang.sortmenu_Seeds);
				$('a[href="#setOrder/peers_connected"]').text(window.lang.sortmenu_Peers);
				$('a[href="#setOrder/priority"]').text(window.lang.sortmenu_Priority);
				$('a[href="#setOrder/label"]').text(window.lang.sortmenu_Label);
				$('a[href="#setOrder/time_remaining"]').text(window.lang.sortmenu_ETA);

				//Open Dialogue
				$('#open_url_tab').text(window.lang.open_url_tab);
				$('#open_file_tab').text(window.lang.open_file_tab);
				$('#open_magnet_tab').text(window.lang.open_magnet_tab);
				$('#open_dialogue label[for="torrent_upload_start"]').text(window.lang.open_torrentstart);
				$('#open_dialogue label[for="torrent_upload_label"]').text(window.lang.open_torrentlabel);
				$('#dialogue_open_torrent').text(window.lang.open_openbutton);
				$('#open_dialogue button.close').text(window.lang.open_closebutton);
				$('#open_dialogue button.reset').text(window.lang.open_openanotherbutton);

				//Remove Dialogue
				$('#dialogue_remove_torrent').text(window.lang.remove_removebutton);
				$('#remove_dialogue .buttonset .close').text(window.lang.remove_closebutton);
				$('#remove_dialogue .buttonset.done .close').text(window.lang.remove_closebuttondone);

				//About Dialogue
				$('#about_version_label').text(window.lang.about_version);
				$('#about_license').text(window.lang.about_license);
				$('#about_testers').text(window.lang.about_testers);
				$('#about_translators').text(window.lang.about_translators);
				$('#about_oscredit').text(window.lang.about_oscredit);
				$('#about_dialogue .buttonset .close').text(window.lang.about_closebutton);
				$('#about_dialogue .buttonset .update').text(window.lang.about_updatebutton);
				$('#about_dialogue .buttonset .donate').text(window.lang.about_donatebutton);

			},
			error: function(req,status,error)
			{
				torrent.openDialogue('error_popup');
				$('#error_details').text(
					'Error parsing lang/'+ (window.settings.default_language || 'en-gb')+
						'.json'+ "\n\n"+ status+ "\n\n"+ error).focus().select();
			}
		});

		//If the details pane has a setting telling it to close, close it.
		if(data.detail_pane_open==false || data.detail_pane_open=='false')
		{
			torrent.toggleDetailPane();
		}
		//Also do we have a width for the detail pane? If so, set it:
		else if(data.detail_pane_width && data.detail_pane_width>303)
		{
			data.detail_pane_width = parseInt(data.detail_pane_width);
			$('#details_container').width(data.detail_pane_width);
			$('#toggleDetailPane').css('right',data.detail_pane_width+9);
			$('#details_container .tabs').css('padding-left', (data.detail_pane_width / 2) -
				($('#details_container .tabs li').first().outerWidth() * 2) - 14);

			$('#torrent_container,#filter_bar').css(
				'margin-right',data.detail_pane_width+18+ 'px');
		}

		if(data.default_zoom==2) { torrent.zoomTorrents(null,'out'); }
		else if(data.default_zoom==1) { torrent.zoomTorrents(null,'out',2); }

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
		$('#status_upload_max').text(
			data.getRate == 0?window.lang.statusbar_UnlimitedSpeed:data.getRate+ ' KB/s');
	});

	remote.getRate('download',function(data)
	{
		$('#status_download_max').text(
			data.getRate == 0?window.lang.statusbar_UnlimitedSpeed:data.getRate+ ' KB/s');
	});

	$(window).resize(function()
	{
		$('#toggleDetailPane span').css(
			'margin-top',($('#toggleDetailPane').outerHeight(true)/2)-6)
	});

	$(window).resize();

});