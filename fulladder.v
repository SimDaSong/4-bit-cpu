module fulladder(a, b, cin, cout, res);
    input a,b,cin;
    output cout, res;

    wire t1, t2, t3;

    assign t1 = a ^ b;
    assign t2 = a & b;
    assign t3 = cin & t1;

    assign cout = t2 | t3; 
    assign res = cin ^ t1;
endmodule