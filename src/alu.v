`include "mux_4to1.v"

module alu(sub, afs, a, b, res);
    input sub;
    input[0:1] afs;
    input[0:3] a, b;
    output[0:3] res;

    wire[0:3] extendedSub, xorB, mux1, mux2, mux3, mux4; // reg로 선언하면 "error: cannot be driven by primitives or continuous assignment"
 
    assign extendedSub = {sub,sub,sub,sub};
    assign xorB = b ^ extendedSub;
    assign mux1 = a ^ b;
    assign mux2 = a & b;
    assign mux3 = a | b;
    assign mux4 = a + xorB + sub;

    mux_4to1 m2(mux1, mux2, mux3, mux4, afs, res);
endmodule