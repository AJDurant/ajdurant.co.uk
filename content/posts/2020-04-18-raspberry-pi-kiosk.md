---
layout: post
title: Setting up a Raspberry Pi for a kiosk display
date: 2020-04-18
tags:
    - raspberry pi
    - kiosk
    - server
---
A while back I put together a dashboard display screen using a Raspberry Pi, recently I was doing it again and had to dig through to work out what I had done before. So now I have notes on going from scratch to having a working kiosk display with a Pi.

##First boot
You can configure a Pi to work headlessly, in this case without a keyboard and mouse, by putting your `wpa_supplicant.conf` and a file named `ssh` in the FAT32 boot partition on the SD card after imaging it. This will enable the Pi to connect to WiFi and be accessible by SSH without having to hook anything up to the Pi.

##WiFi
Not required if using Ethernet. This is all that is needed to configure WiFi, all network interfaces default to DHCP.

/etc/wpa_supplicant/wpa_supplicant.conf:
```
country=GB
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1

network={
    ssid="SSID_HERE"
    psk="PSK_HERE"
}
```

##Change the default password
`passwd`

##packages
Install minimal X packages, window manager, and browser.
```
apt-get update
apt-get dist-upgrade
apt-get install xserver-xorg xserver-xorg-legacy xinit x11-xserver-utils chromium-browser matchbox ttf-mscorefonts-installer xwit
Modify /etc/X11/Xwrapper.config to have allowed_users=anybody to enable running X.
```

##Power saving
These scripts/crons will turn the display on/off to save some energy.

`sudo crontab -e`
```
0 7 * * 1-5 /usr/local/bin/screenon
0 19 * * 1-5 /usr/local/bin/screenoff
```

/usr/local/bin/screenon:
```
#!/bin/bash
# turns on screen
tvservice -p
sleep 1
fbset -accel false
fbset -accel true
```

/usr/local/bin/screenoff:
```
#!/bin/bash
# turns off screen on pi
tvservice -o
chmod +x /usr/local/bin/screenon /usr/local/bin/screenoff
```

##Boot to browser
We use matchbox as a very lightweight window manager. Running `startx` as `pi` from `rc.local` runs the .xinitrc script which launches matchbox and chromium. The Pi should be configured to not load the desktop as we manage this ourselves.

/home/pi/.xinitrc:
```
#!/bin/sh
while true; do

    # Clean up previously running apps, gracefully at first then harshly
    killall -TERM chromium-browser 2>/dev/null;
    killall -TERM matchbox-window-manager 2>/dev/null;
    sleep 2;
    killall -9 chromium-browser 2>/dev/null;
    killall -9 matchbox-window-manager 2>/dev/null;

    # Clean out existing profile information
    rm -rf /home/pi/.cache;
    rm -rf /home/pi/.config;
    rm -rf /home/pi/.pki;

    # Disable DPMS / Screen blanking
    xset -dpms
    xset s off

    # Reset the framebuffer's colour-depth
    fbset -depth $( cat /sys/module/*fb*/parameters/fbdepth );

    # Hide the cursor (move it to the bottom-right, comment out if you want mouse interaction)
    xwit -root -warp $( cat /sys/module/*fb*/parameters/fbwidth ) $( cat /sys/module/*fb*/parameters/fbheight )

    # Start the window manager (remove "-use_cursor no" if you actually want mouse interaction)
    matchbox-window-manager -use_titlebar no -use_cursor no &

    # Start the browser
    /home/pi/browser.sh
done;
```

/home/pi/browser.sh:
```
#!/bin/sh
chromium-browser \
--remote-debugging-port=9222 \
--js-flags="--harmony-object-values-entries" \
--disable \
--disable-client-side-phishing-detection \
--disable-infobars \
--disable-java \
--disable-plugins \
--disable-save-password-bubble \
--disable-suggestions-service \
--disable-translate \
--no-first-run \
--safebrowsing-disable-auto-update \
--start-maximized \
--kiosk \
"https://ajdurant.co.uk"
```

/etc/rc.local: add this line before exit 0
```
su - pi -c 'startx' &
```

##Conclusion
With all that installed and configured, you now have a Pi that will boot up and load your webpage without any input. There is no particular effort here to ensure a secure system, as I was using these on closed networks, so you should do your own hardening as appropriate.
