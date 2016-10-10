iM880 Serial Communications
===========================
**Note**: This is for use with the WiMOD LR Base firmware (has been tested using v1.12) 

This script allows the iM880 to be configured, receive confirmed messages, and 
    send confirmed messages all over a serial port.
- The file `configuration.info` are the selected configuration parameters based
    on our use case.

Usage
--------

```javascript
var iM880 = require('iM880');

// call the constructor with a deviceID and deviceGroup
DEVICE_ID    = 0x04; // in range [0x0000, 0xFFFF)
DEVICE_GROUP = 0x10; // in range [0x00, 0xFF)
device = new iM880(DEVICE_ID, DEVICE_GROUP);

// callback for when constructor done and device configured
device.on('config-done', function(statusmsg) {
    // print the meaning of status byte
    console.log('Config status: ' + statusmsg);
    
    if( statusmsg == 'successful!' ){
        // make a packet and send it
        var msg = new Uint8Array([ 4, 67, 23, 12, 90, 100]);
        DEST_DEVICE_ID    = 0x09; // in range [0x0000, 0xFFFF)
        DEST_DEVICE_GROUP = 0x10; // in range [0x00, 0xFF)
        device.send(DEST_DEVICE_ID, DEST_DEVICE_GROUP, msg);
    }
});

// callback for reception of a confirmed message
device.on('rx-msg', function(rxmsg) {
    console.log(rxmsg);
});

// callback for when a transmit message completed and status
device.on('tx-msg-done', function(statusmsg) {
    console.log('Tx-status: ' + statusmsg);
}
```

Example `rx-msg` Packet
----------------------
**Note**: This message would be received by the other iM880 in the example 
        (`DEVICE_ID=0x09`, `DEVICE_GROUP=0x10`)

```
{
    destGroupAddr   : 16,
    destDeviceAddr  : 9,
    srcGroupAddr    : 16,
    srcDeviceAddr   : 4,
    payload         : [4, 67, 23, 12, 90, 100],
    receivedTime    : 2016-10-10T17:38:49.198Z
}
```

- `destGroupAddr`: Group address of destination device (iM880 receiving message).
- `destDeviceAddr`: Device address of destination device (iM880 receiving message).
- `srcGroupAddr`: Group address of source device (iM880 transmitting message).
- `srcDeviceAddr`: Device address of source device (iM880 transmitting message).
- `payload`: Message being sent.
- `receivedTime`: Timestamp message was received at.

