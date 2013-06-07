#!/bin/bash
qjackctl -s &
zynaddsubfx -l zyn/amazon.xmz &
nodemon server/server.js
