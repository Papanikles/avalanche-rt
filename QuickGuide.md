# Main Interface #

The main interface of Avalanche has a similar look to Clutch, the web interface to the popular bit torrent client Transmission. The top "**header menu**"_(1)_ contains the main action buttons. The lower "**filter bar**"_(2)_ is used to narrow down the list of torrents to a desired few. Below this is the "**torrent list**"_(3)_ which contains the list of torrents. To the right of this, you have the "**details pane**"_(4)_, which can be toggled on and off, and finally, the "**status bar**"_(5)_ resides at the bottom.

![http://avalanche-rt.googlecode.com/files/quick1.png](http://avalanche-rt.googlecode.com/files/quick1.png)

## 1. Header Menu ##

![http://avalanche-rt.googlecode.com/files/quick2.png](http://avalanche-rt.googlecode.com/files/quick2.png)

The **header menu** has the Open, Remove, Resume, Pause, Resume All, Pause All and Details buttons. On the far right is the web search bar. These are all self explanatory, with a few caveats;

  * The Remove, Resume and Pause buttons will pause the list of selected torrents
  * The Resume All and Pause All buttons will effect the **entire** list of torrents they can
  * The Details button will toggle on and off the **details pane**


_You can access some of these buttons using the short cut codes: **O** for Open, **Delete** for Remove, **R** for Resume, **P** for Pause._

### Web Search Bar ###

![http://avalanche-rt.googlecode.com/files/quick3.png](http://avalanche-rt.googlecode.com/files/quick3.png)

The web search bar allows you to search the web for torrents using the most popular torrent sites. The default site is set to Google. Typing in this box and pressing **Enter/Return** will open a new window with the search query, using the desired engine. Clicking the binoculars icon to the right of the text box will bring up a list of search engines to pick from. Clicking one of these will set the search engine to use.

_Pressing **W** will focus the web search box, pressing **Enter/Return** will submit the search. Pressing **Escape** clears the search box and exits the search._

## 2. Filter Bar ##

![http://avalanche-rt.googlecode.com/files/quick4.png](http://avalanche-rt.googlecode.com/files/quick4.png)

The filter bar allows you to change the list of torrents displayed in the **torrent list**. There are 5 main buttons (All, Downloading, Seeding, Paused, Complete) as well as a filter search box. It is important to know that the 4 latter filter buttons do not overlap in their lists, to explain:

  * The All button will show the entire list of torrents
  * The Downloading button will only show torrents that have been started. This included inactive torrents (i.e torrents that are in a "downloading" state, but are going at 0kbps.
  * The Seeding button will only show torrents that are started, and finished. Once again, this includes finished torrents that are started but are seeding at 0kbps.
  * The Paused button filters torrents that are incomplete and paused (i.e torrents here will not download until started, and are not finished)
  * The Complete button will show torrents that are Completed **and paused**. (i.e torrents that aren't paused, downloading or seeding).

_You can switch filter modes by pressing the **left** and **right** keys._

### The Filter Search ###

![http://avalanche-rt.googlecode.com/files/quick5.png](http://avalanche-rt.googlecode.com/files/quick5.png)

The filter search allows you to search among the names of your torrents. This happens live (just type and it will search filtering). For example, if you have three torrents named "Ubuntu\_10.04", "Ubuntu\_9.10" and "Fedora\_12", typing "F" will only show Fedora, while typing "U" will show both Ubuntu torrents. To filter the ubuntu torrents down to one, you'd need to use "Ubuntu\_1" or "Ubuntu\_9". This filters torrents that "contain" the filter bar text, so, as a shorter version, you could type "buntu\_9" or even "9".

_You can focus the filter search by pressing **F**. You can exit the filter search by pressing **Esc**, this will clear the search bar, returning you to the full list of torrents. Finally, pressing F2 with a selected torrent will enable you to rename the torrent to a more suitable name._

## 3. Torrent List ##

![http://avalanche-rt.googlecode.com/files/quick6.png](http://avalanche-rt.googlecode.com/files/quick6.png)

The torrent list is the most important part of the interface! Each torrent has four rows of information. The first row is the torrents name, second is the size information, which includes the size downloaded, the total size, the percentage completed, how much has been uploaded and the upload ratio. The third row is a visual progress bar, which is coloured Blue for in progress, Green for completed and Orange for hashing. The fourth row contains current download information, such as the amount of peers connected versus the total peers, the download speed and upload speed. Each torrent also includes an in-line button, next to the progress bar, which will pause or resume the torrent depending on the current status.

_You can navigate through torrents by pressing the **Up** and **down** keys. You can toggle a torrents pause/resume status by using the **Space bar** key. You can hold the **Ctrl** key, and use the left mouse button to select multiple torrents, and hold the **Shift** key, and use the left mouse button to select a range of torrents._

## 4. Details Pane ##

![http://avalanche-rt.googlecode.com/files/quick7.png](http://avalanche-rt.googlecode.com/files/quick7.png)

The details pane is perhaps the most complex part of Avalanche. It displays information based on the last selected torrent, and is split into four sections, **General**, **Files**, **Peers** and **Trackers**.

  * General shows the torrents information including name, hash, size information, peer/seed information and where it is saved on the disk
  * Files shows the list of files the torrent will download. This is sorted into folders. You can set priority of individual files, or entire folders between Off, Normal and High. Off will skip the files completely.
  * Peers shows the list of peers. It shows the IP address of the peer, the program they're using, and the total upload and download speed. It also shows icons for flags, for example if the peer is encrypted a Padlock icon will be shown.
  * Trackers shows a list of trackers the torrent is connected to. It gives you a summary of the peers found and connected to the torrent, and allows you to toggle the tracker on or off. It is best to disable trackers that time out or error, to see if the first enabled tracker is producing an error, check the General tab.

## 5. Status Bar ##

The status bar summarises information about your torrent client. It shows you the total downloaded torrents, and how they're sorted (the default is "Sorted by _Name_"). If you click the method in which they are sorted, a menu will popup that will allow you to change this:

![http://avalanche-rt.googlecode.com/files/quick8.png](http://avalanche-rt.googlecode.com/files/quick8.png)

Changing the sort method will effect every filter group. The first time you click a sort button, it will sort in _Ascending_ order (A-Z). Clicking the sort method again will change the sort method to _Descending_ (Z-A), the icon on the right of the sort method will change to reflect this.

Similarly, on the right of the status bar, a summary of the total speeds (with total cap allowance) is displayed (e.g 25kbps of _Unlimited_). If you click the total cap allowance button, it will allow you to change the cap, a default set of caps have been provided, ranging from 5kbps to 200kbps, and an Unlimited cap (no cap). Clicking any one of these will set it. Also provided is a text box to allow you to set a custom cap, and number can be placed in here - but please note a "0" is counted as Unlimited. Press enter in this box to set the cap.

![http://avalanche-rt.googlecode.com/files/quick9.png](http://avalanche-rt.googlecode.com/files/quick9.png)

_Pressing **D** or **U** will open the dialogues for Download and Upload caps respectively, from this point you can type a number and press **Enter/Return** to accept. Pressing **Escape** closes the menu_


~ Fin ~