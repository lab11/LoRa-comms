// Samuel Rohrer
// 9/25/16
// ping.js: a simple ping of the SK-iM880B
//

const CRC16_INIT_VALUE = 0xFFFF
const CRC16_GOOD_VALUE = 0x0F47
const CRC16_POLYNOM = 0x8408

// require slip and serial port
var slip = require('slip');
var SerialPort = require('serialport');
var crc = require('crc');

// starting the slip decoder
var logMsg = function(msg) { console.log("A SLIP message was recieved!"); };
var decoder = new slip.Decoder({onMessage : logMsg});
// open the serial port
var port = new SerialPort('/dev/ttyUSB0',
                          {baudrate : 115200, parser : SerialPort.parsers.raw});

// ping is no data
var message = new Uint8Array([ 1, 1 ]);
var checksum = crc.crc16(message);
console.log("checksum crc16 is: " + checksum);
var checksum = crc.crc16ccitt(message);
console.log("checksum crc16ccitt is: " + checksum);
var checksum = crc.crc16modbus(message);
console.log("checksum crc16modbus is: " + checksum);
var checksum = crc.crc16kermit(message);
console.log("checksum crc16kermit is: " + checksum);
var checksum = crc.crc16xmodem(message);
console.log("checksum crc16xmodem is: " + checksum);

var crc16 = CRC16_Calc(message, 0, message.length, CRC16_INIT_VALUE);
console.log("crc16 is: " + crc16);
crc16 = ~ crc16;
console.log("crc16 invert is: " + crc16);

var msb = ((checksum & 65280) >> 8);
var lsb = (checksum & 255);
// var new_msg = new Uint8Array([ 1, 1, msb, lsb]);
var new_msg = new Uint8Array([ 1, 1, 22, 7 ]);
var encoded_msg = slip.encode(new_msg);
console.log('msg is: ' + encoded_msg);

port.on('data',
        function(data) { console.log('data: ' + decoder.decode(data)); });
port.on('open', function() { port.write(encoded_msg); });

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
  return crc;
}
