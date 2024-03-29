# 4-bit-cpu

> I made a 4 bit cpu referring to the https://electronics.stackexchange.com/questions/367541/how-to-write-a-program-for-4-bit-cpu-made-in-logisim. <br> I had a problem copying the circuit shown on the page, so I fixed the circuit, and I filled the table of *Table 2-Program PROM Bit Map* in that page. Instruction is also what I envisioned.

## Project Stack

* logisim
* verilog

## Project Overview

### Instruction Set

<img src="images/Instruction-Set.png"></img>

### Instruction Opcode

<img src="images/Instruction-Operation-Code(opcode).png" width="90%"></img>

### Instruction

```
LD $0,0				  // 1000
LD $1,1		// $1=1		// 1101
LD $2,3		// $2=3		// 1203

LD $3,3		// $3=3		// 1303
DISP $2,$3	// DISP '3'	// 3023

MOV $4,$2    	// $4=3		// 2420
SUB $4,$4,$1 	// $4=2		// F441
DISP $2,$4	// DISP '2'	// 3024

ADD $3,$3,$1	// $3=4		// 7331
DISP $2,$3	// DISP '4'	// 3023

XOR $5,$3,$4	// $5=6		// 4534
DISP $2,$5	// DISP '6'	// 3025

AND $5,$3,$4	// $5=0		// 5534
DISP $2,$5	// DISP '0'	// 3025

OR $5,$3,$4	// $5=6		// 6534
DISP $2,$5	// DISP '6'	// 3025
```
Insturction.txt

### Logisim

<img src="images/logisim_main.png"></img>


### Verilog

<img src="images/verilog_cpu_tb.png"></img>
