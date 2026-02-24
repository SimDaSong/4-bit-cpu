`timescale 1ns / 1ps
`include "cpu.v"

module cpu_tb; 

reg[15:0] code;
reg clk, clr;
wire[3:0] a,b;

always begin
#5 clk = !clk;
end

cpu uut(code, clk, clr, a, b);

initial begin
    $dumpfile("cpu.vcd");
    $dumpvars(0, cpu_tb);

    clk=0; clr=1; clr=0;

    code=16'h1000; 
    #10; code=16'h1101; 
    #10; code=16'h1203; 
    #10; code=16'h1303; 
    #10; code=16'h3023; 
    #10; code=16'h2420; 
    #10; code=16'hf441; 
    #10; code=16'h3024; 
    #10; code=16'h7331; 
    #10; code=16'h3023; 
    #10; code=16'h4534; 
    #10; code=16'h3025; 
    #10; code=16'h5534; 
    #10; code=16'h3025; 
    #10; code=16'h6534; 
    #10; code=16'h3025; 
    #10; clr=1; clr=0;
    #10;
    $finish;
end
endmodule