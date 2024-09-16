#!/usr/bin/env bash

cd $(dirname $0)
cp 50-uhk60.rules /etc/udev/rules.d
udevadm control --reload-rules
udevadm trigger
udevadm settle
