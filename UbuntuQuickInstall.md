# Introduction #

Please don't use this unless you're super confident you know what you're doing. And don't blame me if you mess things up because you didn't look at all the commands and what they're doing!


# Commands #

Triple click any of these commands to select the whole string and paste it into your server, press enter to execute. Please make sure to vet the code before you enter it!

```
echo "Setting up Apache, PHP with SCGI and CURL" && sudo apt-get update && apt-get install apache2 apache2-mpm-prefork apache2-utils apache2.2-bin apache2.2-common libapache2-mod-php5 libapache2-mod-scgi rtorrent php5-curl -y --force-yes && sudo a2enmod scgi && sudo mkdir /etc/apache2/passwords-{available,enabled} && cd /etc/apache2/passwords-available/ && echo "Enter your password for rtorrentscgi to use" && sudo htpasswd -c rtorrentscgi "rtorrentscgi" && cd ../passwords-enabled/ && sudo ln -s ../passwords-available/rtorrentscgi && echo -e "#Rtorrent SCGI\nSCGIMount /RPC1 127.0.0.1:5001\n<LocationMatch "/RPC1">\nAuthType	Basic\nAuthName	"rtorrentscgi"\nAuthUserFile	/etc/apache2/passwords-enabled/rtorrentscgi\nRequire		valid-user\nBrowserMatch	"MSIE"	AuthDigestEnableQueryStringHack=On\nOrder		allow,deny\nAllow From	all\n</LocationMatch>" | sudo tee /etc/apache2/sites-available/rtorrentscgi && sudo a2enmod scgi && sudo a2ensite rtorrentscgi && sudo apache2ctl restart && echo "Setting up rtorrent now..." && cd && wget "http://libtorrent.rakshasa.no/export/1135/trunk/rtorrent/doc/rtorrent.rc" && mv rtorrent.rc .rtorrent.rc && echo -e "\n#SCGI Server\nscgi_port = 127.0.0.1:5001\ndirectory = ~/\nsession = ~/.rtorrent" >> .rtorrent.rc && mkdir .rtorrent
```

And set up Avalanche using the current release:
```
cd && wget "http://avalanche-rt.googlecode.com/files/avalanche_rt_0_9_beta4.gz" && tar zxvf avalanche_rt_0_9_beta4.gz -C avalanche && sudo mv avalanche/* /var/www/ && sudo chmod 755 /var/www/* -R && sudo nano /var/www/settings.php
```

OR set up Avalanche using SVN:
```
sudo apt-get install subversion -y --force-yes && svn checkout http://avalanche-rt.googlecode.com/svn/trunk/ avalanche && sudo mv avalanche/* /var/www/ && sudo chmod 755 /var/www/* -R && sudo nano /var/www/settings.php
```


If you need help setting up settings.php, please refer to the Settings.php Guide