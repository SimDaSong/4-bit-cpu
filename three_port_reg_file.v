`include "decoder_3to8.v"
`include "mux_8to1.v"

module three_port_reg_file(data, load, clk, clr, addrD, addrA, addrB, a, b);
    input[3:0] data;
    input load, clk, clr;
    input[2:0] addrD, addrA, addrB;
    output[3:0] a, b;

    reg[3:0] reg1, reg2, reg3, reg4, reg5, reg6, reg7, reg8;
    wire[7:0] decoder; // reg로 선언하면 "error: cannot be driven by primitives or continuous assignment"
    wire[7:0] enable; // 1 bit enable 8개

    decoder_3to8 uut (addrD, decoder);

    assign enable = decoder & {load,load,load,load,load,load,load,load};

    always @ (posedge clr) 
    begin
      reg1 = 0;
      reg2 = 0;
      reg3 = 0;
      reg4 = 0;
      reg5 = 0;
      reg6 = 0;
      reg7 = 0;
      reg8 = 0;
    end

    always @ (posedge clk)
    begin
      case(enable)
        8'b00000001 : reg1 = data;
        8'b00000010 : reg2 = data;
        8'b00000100 : reg3 = data;
        8'b00001000 : reg4 = data;
        8'b00010000 : reg5 = data;
        8'b00100000 : reg6 = data;
        8'b01000000 : reg7 = data;
        8'b10000000 : reg8 = data;
      endcase
    end

    mux_8to1 A (reg1,reg2,reg3,reg4,reg5,reg6,reg7,reg8,addrA,a);
    mux_8to1 B (reg1,reg2,reg3,reg4,reg5,reg6,reg7,reg8,addrB,b);

endmodule