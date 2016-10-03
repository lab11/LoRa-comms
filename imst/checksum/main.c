// Samuel Rohrer < rohrer@umich.edu >
// 9/27/16
// main.c
// -- function to calculate checksum to verify that it is correct

#include "CRC16.h"
#include <stdio.h>
#include <stdlib.h>

int main() {
    
  // replicate ping message calculation  
  UINT8 datum[2] = { 1, 1 };
  UINT8 *data = &datum[0];
  UINT16 length = 4;
    
  //use the CRC calc function
  UINT16 result = CRC16_Calc(data, length, CRC16_INIT_VALUE);
  printf("result: %i\n", result);

  UINT8 msb = (result & 0xFF00) >> 8 ;
  UINT8 lsb = (result & 0xFF);

  printf("msb: %i, lsb: %i \n", msb, lsb);
 
  // test ping using correct CRC values
  UINT8 newmsg[4] = {1, 1, msb, lsb};
  length = 4;
  printf("bool: %i\n", CRC16_Check(&newmsg[0], length, CRC16_INIT_VALUE)); 
    
  // test response value to ping
  length = 5;
  UINT8 testmsg[5] = {1, 2, 0, 160, 175};
  printf("check val from LR studio: %i\n", CRC16_Check(&testmsg[0], length, CRC16_INIT_VALUE));

  return 0;
}
