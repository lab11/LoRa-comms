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

// require slip and serial port
var slip = require('slip');
var SerialPort = require('serialport');

// start the slip decoder
var logMsg = function(msg) { console.log("A SLIP message received!"); };
var decoder = new slip.Decoder({onMessage : logMsg});

// open the serial port
var port = new SerialPort('/dev/ttyUSB0',
                          {baudrate : 115200, parser : SerialPort.parsers.raw});

// function to configIMST
function configIMST(port, decoder, endpointID) {
  // ping the IMST to make sure alive
  // assuming endpointID=1, checksum = 22,7
  var ping_msg = new Uint8Array([ endpointID, DEVMGMT_MSG_PING_REQ, 22, 7 ]);

  // reset the IMST for fresh settings (takes 200 ms)
  // assuming endpointID=1, checksum=32,98
  var reset_msg = new Uint8Array([ endpointID, DEVMGMT_MSG_RESET_REQ, 32, 98 ]);

  // configure the ISMT
  var config_msg = new Uint8Array([
    endpointID, DEVMGMT_MSG_SET_RADIO_CONFIG_REQ,
    0,          16,
    16,         1,
    1,          0,
    0,          192,
    228,        0,
    0,          1,
    5,          0,
    1,          1000,
    15,         15
  ]);
}

// function to make lora packet and send
function makePacket(endpointID, msgID, message) {}
