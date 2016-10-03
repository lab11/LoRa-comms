// Samuel Rohrer < rohrer@umich.edu >
// 9/27/16
// main.c
// -- function to calculate checksum to verify that it is correct

#include "CRC16.h"
#include <stdio.h>
#include <stdlib.h>

#define WIMODLR_HCI_MSG_HEADER_SIZE 2
#define WIMODLR_HCI_MSG_PAYLOAD_SIZE 280
#define WIMODLR_HCI_MSG_FCS_SIZE 2

typedef struct {
  // payload info
  UINT16 length;
  UINT8 SapID;
  UINT8 MsgID;
  UINT8 Payload[WIMODLR_HCI_MSG_PAYLOAD_SIZE];
  UINT8 CRC16[WIMODLR_HCI_MSG_FCS_SIZE];
} TWiMODLR_HCIMessage;

TWiMODLR_HCIMessage TxMessage;

int main() {

  TxMessage.SapID = 1;
  TxMessage.MsgID = 1;
  TxMessage.length = 0;

  // use the CRC calc function
  // UINT16 result = CRC16_Calc(data, length, CRC16_INIT_VALUE);
  UINT16 result = CRC16_Calc(&TxMessage.SapID,
                             TxMessage.length + WIMODLR_HCI_MSG_HEADER_SIZE,
                             CRC16_INIT_VALUE);

  result = ~result;
  printf("result: %i\n", result);

  UINT8 msb = (result & 0xFF00) >> 8;
  UINT8 lsb = (result & 0xFF);

  TxMessage.Payload[TxMessage.length++] = lsb;
  TxMessage.Payload[TxMessage.length++] = msb;

  printf("msb: %i, lsb: %i \n", msb, lsb);

  printf("checksum is correct (1=yes): %i\n",
         CRC16_Check(&TxMessage.SapID,
                     TxMessage.length + WIMODLR_HCI_MSG_HEADER_SIZE,
                     CRC16_INIT_VALUE));

  return 0;
}
