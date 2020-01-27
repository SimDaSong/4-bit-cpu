module mux_4to1 (a, b, c, d, sel, out);             // 4-bit output based on input sel
    input[3:0] a,b,c,d;
    input[1:0] sel;
    output[3:0] out;

   // When sel[1] is 0, (sel[0]? b:a) is selected and when sel[1] is 1, (sel[0] ? d:c) is taken
   // When sel[0] is 0, a is sent to output, else b and when sel[0] is 0, c is sent to output, else d
   assign out = sel[1] ? (sel[0] ? d : c) : (sel[0] ? b : a); 
 
endmodule

// 출처: https://www.chipverify.com/verilog/verilog-4to1-mux