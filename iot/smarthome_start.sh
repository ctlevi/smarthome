#!/bin/sh
# Store this as executable in /etc/init.d and it will run at startup
cd /home/pi/iot;
/bin/su -c "/usr/local/bin/npm run start" - pi;