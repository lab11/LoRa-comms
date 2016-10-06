#!/usr/bin / env mode
/*
 *
 * configure iM880B
 */

// Lora Constants
const DEVMGMT_ID = 0x01;
const DEVMGMT_MSG_PING_REQ = 0x01;
const DEVMGMT_MSG_PING_RSP = 0x02;
const DEVMGMT_MSG_GET_DEVICE_INFO_REQ = 0x03;
const DEVMGMT_MSG_GET_DEVICE_INFO_RSP = 0x04;
const DEVMGMT_MSG_GET_FW_INFO_REQ = 0x05;
const DEVMGMT_MSG_GET_FW_INFO_RSP = 0x06;
const DEVMGMT_MSG_RESET_REQ = 0x07;
const DEVMGMT_MSG_RESET_RSP = 0x08;
const DEVMGMT_MSG_SET_OPMODE_REQ = 0x09;
const DEVMGMT_MSG_SET_OPMODE_RSP = 0x0A;
const DEVMGMT_MSG_GET_OPMODE_REQ = 0x0B;
const DEVMGMT_MSG_GET_OPMODE_RSP = 0x0C;
const DEVMGMT_MSG_SET_RTC_REQ = 0x0D;
const DEVMGMT_MSG_SET_RTC_RSP = 0x0E;
const DEVMGMT_MSG_GET_RTC_REQ = 0x0F;
const DEVMGMT_MSG_GET_RTC_RSP = 0x10;
const DEVMGMT_MSG_SET_RADIO_CONFIG_REQ = 0x11;
const DEVMGMT_MSG_SET_RADIO_CONFIG_RSP = 0x12;
const DEVMGMT_MSG_GET_RADIO_CONFIG_REQ = 0x13;
const DEVMGMT_MSG_GET_RADIO_CONFIG_RSP = 0x14;
const DEVMGMT_MSG_RESET_RADIO_CONFIG_REQ = 0x15;
const DEVMGMT_MSG_RESET_RADIO_CONFIG_RSP = 0x16;
const DEVMGMT_MSG_GET_SYSTEM_STATUS_REQ = 0x17;
const DEVMGMT_MSG_GET_SYSTEM_STATUS_RSP = 0x18;
const DEVMGMT_MSG_SET_RADIO_MODE_REQ = 0x19;
const DEVMGMT_MSG_SET_RADIO_MORE_RSP = 0x1A;
const DEVMGMT_STATUS_OK = 0x00;                // Operation successful;
const DEVMGMT_STATUS_ERROR = 0x01;             // Operation failed;
const DEVMGMT_STATUS_CMD_NOT_SUPPORTED = 0x02; // Command is not supported;
const DEVMGMT_STATUS_WRONG_PARAMETER = 0x03;
// CRC constants
const CRC16_INIT_VALUE = 0xFFFF;
const CRC16_GOOD_VALUE = 0x0F47;
const CRC16_POLYNOM = 0x8408;
// RadioLink constants
const RADIOLINK_MSG_SEND_U_DATA_REQ = 0x01;
const RADIOLINK_MSG_SEND_U_DATA_RSP = 0x02;
const RADIOLINK_MSG_U_DATA_RX_IND = 0x04;
const RADIOLINK_MSG_U_DATA_TX_IND = 0x06;
const RADIOLINK_MSG_SEND_C_DATA_REQ = 0x09;
const RADIOLINK_MSG_SEND_C_DATA_RSP = 0x0A;
const RADIOLINK_MSG_C_DATA_RX_IND = 0x0C;
const RADIOLINK_MSG_C_DATA_TX_IND = 0x0E;

// SET STATES HERE
const INIT = 0x00;
const WAIT_INIT_ACK = 0x01;
const WAIT_CONFIG_ACK = 0x02;
const WAIT_CMD = 0x03;
var STATE = [ INIT, WAIT_INIT_ACK, WAIT_CONFIG_ACK, WAIT_CMD ];
// require events and slip and serial port
var slip = require('slip');
var SerialPort = require('serialport');
var events = require('events');
var util = require('util');

var iM880 = function() {
  this.port = new SerialPort(
      '/dev/ttyUSB0', {baudrate : 115200, parser : SerialPort.parsers.raw});
  this.decoder = new slip.Decoder({});
  this.currState = INIT;
};

util.inherits(iM880, events.EventEmitter);

// configure method
iM880.prototype.configure = function(endpointID) {
  var that = this;
  this.port.on('open', function() {
    // make ping packet
    var packet = that.makePacket(endpointID, DEVMGMT_MSG_PING_REQ, '');
    that.port.write(packet);
    that.currState = WAIT_INIT_ACK;
  });
  this.port.on('data', function(data) {
    data = that.decoder.decode(data);

    switch (that.currState) {
    case WAIT_INIT_ACK:
      if (data) {
        if ((data[1] == DEVMGMT_MSG_PING_RSP) &&
            that.CRC16_Check(data, 0, data.length, CRC16_INIT_VALUE)) {
          console.log('iM880B pinged!');
          var config_msg = new Uint8Array([
            0x01, 0,    0x10, 0x10, 0,    0x01, 0,    0x03, 0,
            0xD5, 0xC8, 0xE4, 0,    0x04, 0x01, 0x05, 0,    0x01,
            0x03, 0xE8, 0x0F, 0x0F, 0,    0,    0,    0
          ]);
          var packet = that.makePacket(
              endpointID, DEVMGMT_MSG_SET_RADIO_CONFIG_REQ, config_msg);

          that.port.write(packet);
          that.currState = WAIT_CONFIG_ACK;
        }
      }
      break;
    case WAIT_CONFIG_ACK:
      if (data) {
        if ((data[1] == DEVMGMT_MSG_SET_RADIO_CONFIG_RSP) &&
            that.CRC16_Check(data, 0, data.length, CRC16_INIT_VALUE)) {
          console.log('iM880B configured!');
          that.currState = WAIT_CMD;
        }
      }
      break;
    case WAIT_CMD:
      break;
    default:
      currState = WAIT_CMD;
    }

  });
};

// send method
iM880.prototype.send = function() { console.log('send a message!'); };

// function to make lora packet and send
iM880.prototype.makePacket = function(endpointID, msgID, message) {
  // declare the packet
  const packet = new Uint8Array(message.length + 6);
  packet[0] = 0xC0;
  packet[1] = endpointID;
  packet[2] = msgID;

  for (var i = 0; i < message.length; i++) {
    packet[3 + i] = message[i];
  }
  var result = this.CRC16_Calc(packet, 1, 2 + message.length, CRC16_INIT_VALUE);
  packet[3 + message.length] = result & 0xFF;
  packet[4 + message.length] = (result >> 8);
  var check = this.CRC16_Check(packet, 1, 4 + message.length, CRC16_INIT_VALUE);

  // check that checksum correct before adding final C0
  if (check) {
    packet[5 + message.length] = 0xC0;
    packet = slip.encode(packet);
    return packet;
  } else {
    console.log('Checksum check failed! Your message: ' + message +
                'will not be delivered');
    return 0;
  }
};

// --------------- CRC FUNCTIONS ------------------------------>
// CRC calculation
iM880.prototype.CRC16_Calc = function(data, start, length, initVal) {
  // init crc
  var crc = initVal;
  // iterate over all bytes
  for (var i = 0; i < length; i++) {
    var bits = 8;
    var byte = data[start + i];
    // iterate over all bits per byte
    while (bits--) {
      if ((byte & 1) ^ (crc & 1)) {
        crc = (crc >> 1) ^ CRC16_POLYNOM;
      } else {
        crc >>= 1;
      }
      byte >>= 1;
    }
  }
  return (~crc & 65535);
};

//------------------------------------------------------------------------------

// CRC16_Check
//
//------------------------------------------------------------------------------
//!
//! @brief calculate & test CRC16
//!
//------------------------------------------------------------------------------
//!
//! This function checks a data block with attached CRC16
//!
//! <!------------------------------------------------------------------------->
//! @param[in] data pointer to data block
//! @param[in] length number of bytes (including CRC16)
//! @param[in] initVal CRC16 initial value
//! <!------------------------------------------------------------------------->
//! @retVal true CRC16 ok -> data block ok
//! @retVal false CRC16 failed -> data block corrupt
//------------------------------------------------------------------------------
iM880.prototype.CRC16_Check = function(data, start, length, initVal) {
  // calculate ones complement of CRC16
  var crc = this.CRC16_Calc(data, start, length, initVal);
  if (crc == CRC16_GOOD_VALUE)
    return true;
  return false;
};

module.exports = new iM880();
