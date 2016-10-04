// Samuel Rohrer
// 9/28/16
// configIMST.js
//  - configure the IMST with the parameters from configParams.imst

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

// require slip and serial port
var slip = require('slip');
var SerialPort = require('serialport');

// start the slip decoder
var logMsg = function(msg) { console.log('A SLIP message received: ' + msg); };
var decoder = new slip.Decoder({onMessage : logMsg});

// open the serial port
var port = new SerialPort('/dev/ttyUSB0',
                          {baudrate : 115200, parser : SerialPort.parsers.raw});

// start listening on the serial port
var currData;
port.on('data', function(data) { currData = decoder.decode(data); });

// call configIMST
configIMST(port, 1);

// function to configIMST
function configIMST(port, endpointID) {
  // ping the IMST to make sure alive
  makePacket(endpointID, DEVMGMT_MSG_PING_REQ, '', port);

  // reset the IMST for fresh settings (takes 200 ms)
//  makePacket(endpointID, DEVMGMT_MSG_PING_REQ, '', port);

  // configure the ISMT
  var config_msg = new Uint8Array(
      [ 0, 16, 16, 1, 1, 0, 0, 192, 228, 0, 0, 1, 5, 0, 1, 1000, 15, 15 ]);
  makePacket(endpointID, DEVMGMT_MSG_SET_RADIO_CONFIG_REQ, config_msg, port);
}

// function to make lora packet and send
function makePacket(endpointID, msgID, message, port) {
  // declare the packet
  const packet = new Uint8Array(message.length + 7);
  packet[0] = 0xC0;
  packet[1] = endpointID;
  packet[2] = msgID;

  for (var i = 0; i < message.length; i++) {
    packet[3 + i] = message[i];
  }
  var result = CRC16_Calc(packet, 1, 2 + message.length, CRC16_INIT_VALUE);
  packet[3 + message.length] = result & 0xFF;
  packet[3 + message.length + 1] = (result >> 8);
  var check = CRC16_Check(packet, 1, 4 + message.length, CRC16_INIT_VALUE);

  // check that checksum correct before adding final C0
  if (check) {
    packet[3 + message.length + 2] = 0xC0;
    packet = slip.encode(packet);
    port.on('open', function() { port.write(packet); });
  } else {
    console.log('Checksum check failed! Your message: ' + message +
                'will not be delivered');
  }
}

// --------------- CRC FUNCTIONS ------------------------------>
// CRC calculation
function CRC16_Calc(data, start, length, initVal) {
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
}

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
function CRC16_Check(data, start, length, initVal) {
  // calculate ones complement of CRC16
  var crc = CRC16_Calc(data, start, length, initVal);
  if (crc == CRC16_GOOD_VALUE)
    return true;
  return false;
}
