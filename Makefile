IVERILOG = iverilog
VVP     = vvp
GTKWAVE = gtkwave

SRC_DIR = src
SRC     = $(SRC_DIR)/cpu_tb.v
OUT     = cpu.vvp
VCD     = cpu.vcd

.PHONY: build run wave clean

build:
	$(IVERILOG) -I $(SRC_DIR) -o $(OUT) $(SRC)

run: build
	$(VVP) $(OUT)

wave: run
	$(GTKWAVE) $(VCD)

clean:
	rm -f $(OUT) $(VCD)
