#!/usr/bin / env node

var iM880 = require('./iM880');

// set the endpoint ID
DEVICE_ID = 0x04;
DEVICE_GROUP = 0x10;

// call the construction with and endpointID
device = new iM880(DEVICE_ID, DEVICE_GROUP);
// wait for config-done message and print endpointID
var msg = new Uint8Array([ 0x10, 0x00, 0x09, 9, 8, 10, 67 ]);
device.on('config-done', function(statusbyte) {
  // print the ID of the endpoint
  if (!statusbyte) {
    console.log('Configuration successful!');
  } else {
    console.log('Configuration unsuccesful, error code: ' + statusbyte);
  }
  // send a message
  // 0xFF and 0xFFFF set the radio to broadcast to all addresses
  device.send(0xFF, 0xFFFF, msg);
});

// listen for new messages and print them
device.on('rx-msg', function(data) {
  // print rx message without slip encoding or checksum
  console.log('Received message: ' + data);
});

// listen for transmit done events
device.on('tx-msg-done', function(data) {
  // print out tx msg
  console.log('Tx-status: ' + data);
});
