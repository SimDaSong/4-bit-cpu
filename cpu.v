`include "alu.v"
`include "three_port_reg_file.v"

module cpu(code, clk, clr, a, b);
    input[15:0] code;
    input clk, clr;
    output[3:0] a,b;

    wire we,dwe,sub;
    wire[1:0] rss,afs;
    wire[2:0] addrA, addrB, addrD;
    wire[3:0] data, opcode, aluRes, tmpA, tmpB, muxRes;
    reg[6:0] instDecoder;

    // code에서 data들 분리
    assign data = code[3:0];
    assign addrB = code[2:0];
    assign addrA = code[6:4];
    assign addrD = code[10:8];
    assign opcode = code[15:12];

    // opcode 분석
    always @ (*)
    begin
      case(opcode)
        4'd1 : instDecoder = 7'h01;
        4'd2 : instDecoder = 7'h09;
        4'd3 : instDecoder = 7'h02;
        4'd4 : instDecoder = 7'h05;
        4'd5 : instDecoder = 7'h15;
        4'd6 : instDecoder = 7'h25;
        4'd7 : instDecoder = 7'h35;
        4'd15 : instDecoder = 7'h75;
        default : instDecoder = 0;        
      endcase
    end

    assign we = instDecoder[0];
    assign dwe = instDecoder[1];
    assign rss = instDecoder[3:2];
    assign afs = instDecoder[5:4];
    assign sub = instDecoder[6];

    // 3 port reg file
    mux_4to1 uud (data, aluRes, a, a, rss, muxRes);    
    three_port_reg_file uut2 (muxRes, we,clk,clr,addrD,addrA,addrB,a,b);
  
    // alu
    assign tmpA = a;
    assign tmpB = b;
    alu uut (sub, afs, tmpA, tmpB, aluRes);
endmodule