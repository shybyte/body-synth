#!/bin/bash
qjackctl -s &
zynaddsubfx -l zyn/myzyn.xmz &
nodemon server/server.js
