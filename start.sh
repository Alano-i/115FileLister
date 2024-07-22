#!/bin/sh
user=115FileLister
PUID=${PUID:-0}
PGID=${PGID:-0}
#create user if not exists
if id -u $user >/dev/null 2>&1 ;then
  echo "$user exists"
else
  echo "create $user(${PUID}): $user(${PGID})"
  useradd -U -d /data -s /bin/false $user
  usermod -G users $user
  groupmod -o -g "$PGID" $user
  usermod -o -u "$PUID" $user
fi

base_path='/app'

chown -R $user:$user /app

supervisord -c /app/supervisord.conf