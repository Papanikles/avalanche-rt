# Introduction #

Remember that, if you prefer, you can watch the installation video tutorials here:

<a href='http://www.youtube.com/watch?feature=player_embedded&v=qSUwEe__pik' target='_blank'><img src='http://img.youtube.com/vi/qSUwEe__pik/0.jpg' width='425' height=344 /></a>
<a href='http://www.youtube.com/watch?feature=player_embedded&v=H7Br9mc7rF4' target='_blank'><img src='http://img.youtube.com/vi/H7Br9mc7rF4/0.jpg' width='425' height=344 /></a>

# Setting up Dependencies #

If you didn't select lamp-server from the install, you'll need to install that now:

```
sudo tasksel install lamp-server
```

It will ask you for a MySQL password - so make sure to have one handy. MySQL is not needed for Avalanche, but is part of a LAMP Server stack. If you'd prefer not to install it, you can set up Apache and PHP manually:

```
sudo apt-get install apache2 apache2-mpm-prefork apache2-utils apache2.2-bin apache2.2-common libapache2-mod-php5
```

When Apache is installed, it will automatically start. Next thing to do is

So now we have confirmed Apache is working, we want to install our extra packages, rtorrent and php curl

```
sudo apt-get install rtorrent php5-curl libapache2-mod-scgi
```

Now we have all of our packages installed, we need to configure them:

### Configuring rTorrent ###

Download the example configuration for rtorrent

```
cd
wget "http://libtorrent.rakshasa.no/export/1135/trunk/rtorrent/doc/rtorrent.rc"
```

Now add a "." to the beginning of the file, so rtorrent can read it.

```
mv rtorrent.rc .rtorrent.rc
```

Open the file in your favourite editor, for example: nano

```
nano .rtorrent.rc
```

Add an SCGI handler port to the end of the file:

```
#SCGI Server
scgi_port = 127.0.0.1:5001
```

Near the top of the file, there is a line that says "downloads = ", find this (if you're using nano, press ctrl+w to search) and change it to:

```
downloads = ~/
```

Also, below this, there is a session directory, change this:

```
session = ~/.rtorrent
```

Save (In nano: ctrl+o, enter) and quit (In nano: ctrl+x). Now we need to make that .rtorrent session directory:

```
cd
mkdir .rtorrent
```

Rtorrent is now configured, you can test it by running "rtorrent".

### Configuring Apache ###

With Apache, we first need to make directories for our passwords:

```
sudo mkdir /etc/apache2/passwords-{available,enabled}
```

Now, navigate to that directory:

```
cd /etc/apache2/passwords-available
```

And make a password for rtorrent to use. Remember to replace 

&lt;USERNAME&gt;

 with your own username you wish to use:

```
sudo htpasswd -c rtorrentscgi "<USERNAME>"
```

So, if I wanted the username "rtorrentscgi" I'd use

```
sudo htpasswd -c rtorrentscgi "rtorrentscgi"
```

You'll be asked for a password for this user, enter one and remember it for later! We'll next make that password enabled:

```
cd ../passwords-enabled
sudo ln -s ../passwords-available/rtorrentscgi
```

Next, we're going to make a file for Apache to read, which will enable our rtorrent SCGI server:

```
sudo nano /etc/apache2/sites-available/rtorrentscgi
```

Put this in the file:

```
#Rtorrent SCGI
SCGIMount /RPC1 127.0.0.1:5001
	<LocationMatch "/RPC1">
		AuthType	Basic
		AuthName	"rtorrentscgi"
		AuthUserFile	/etc/apache2/passwords-enabled/rtorrentscgi
		Require		valid-user
		BrowserMatch	"MSIE"	AuthDigestEnableQueryStringHack=On
		Order		allow,deny
		Allow From	all
	</LocationMatch>
```

Save (in nano: ctrl+o, enter), and quit (in nano: ctrl+x). We'll want to enable that site, but also the SCGI plugin:

```
sudo a2enmod scgi && sudo a2ensite rtorrentscgi
```

We'll also want to restart apache now:

```
sudo apache2ctl restart
```

## Installing the Avalanche WebApp ##

Firstly, we want to get the latest Avalanche code which currently is 0.9 beta 4:

```
wget "http://avalanche-rt.googlecode.com/files/avalanche_rt_0_9_beta4.gz"
```

We'll also need to "untar" the archive file:

```
tar xzvf avalanche_rt_0_9_beta4.gz -C avalanche
```

Alternatively, if you want to use the SVN code, which is the latest cutting edge code, you can use:

```
svn checkout http://avalanche-rt.googlecode.com/svn/trunk/ avalanche
```

(You made need to install "subversion" (sudo apt-get install subversion) to do this)

Now we have a directory called "avalanche" with our code in it. Lets move it to /var/www where all of Apache's websites are kept:

```
mv avalanche/* /var/www
```

This will install to the root website. We'll also need to make the files executable:

```
sudo chmod 755 /var/www/* -R
```

Finally, you need to edit the settings.php to put in data that relates to YOUR server. For help, visit the Settings.php guide.

```
sudo nano /var/www/settings.php
```

Now everything appears to be set up, you can visit your server's IP to see. Your server's IP address can be quickly had using:

```
ip a|awk '/g/&&$0=$2'
```