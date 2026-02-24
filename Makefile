IVERILOG = iverilog
VVP     = vvp
GTKWAVE = gtkwave

SRC     = cpu_tb.v
OUT     = cpu.vvp
VCD     = cpu.vcd

.PHONY: build run wave clean

build:
	$(IVERILOG) -o $(OUT) $(SRC)

run: build
	$(VVP) $(OUT)

wave: run
	$(GTKWAVE) $(VCD)

clean:
	rm -f $(OUT) $(VCD)
