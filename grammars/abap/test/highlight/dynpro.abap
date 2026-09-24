SET PF-STATUS 'STATUS_0100' OF PROGRAM 'ZMYPROG' EXCLUDING fcode.
"^ keyword
"   ^ keyword
"               ^ string
"                                       ^ string
"                                                          ^ variable

REPORT demo_dynpro_modify_simple .

LOOP AT SCREEN INTO DATA(screen_wa).
"       ^ constant.builtin
    MODIFY SCREEN FROM screen_wa.
"          ^ constant.builtin
ENDLOOP.

