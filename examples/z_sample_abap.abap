*&---------------------------------------------------------------------*
*& Report  Z_SAMPLE_ABAP
*&---------------------------------------------------------------------*
*& Description: Sample ABAP program to test Zed syntax highlighting
*&---------------------------------------------------------------------*
REPORT z_sample_abap.

" Type definitions
TYPES: BEGIN OF ty_employee,
         id        TYPE i,
         name      TYPE string,
         department TYPE string,
         salary    TYPE p DECIMALS 2,
       END OF ty_employee.

" Data declarations
DATA: lt_employees TYPE TABLE OF ty_employee,
      ls_employee  TYPE ty_employee,
      lv_total     TYPE p DECIMALS 2,
      lv_count     TYPE i.

" Constants
CONSTANTS: gc_department TYPE string VALUE 'IT',
           gc_min_salary TYPE p DECIMALS 2 VALUE '50000.00'.

*----------------------------------------------------------------------*
* CLASS lcl_employee_manager DEFINITION
*----------------------------------------------------------------------*
CLASS lcl_employee_manager DEFINITION.
  PUBLIC SECTION.
    METHODS:
      constructor IMPORTING iv_department TYPE string,
      add_employee IMPORTING is_employee TYPE ty_employee,
      get_total_salary RETURNING VALUE(rv_total) TYPE p,
      display_all.

  PRIVATE SECTION.
    DATA: mt_employees TYPE TABLE OF ty_employee,
          mv_department TYPE string.
ENDCLASS.

*----------------------------------------------------------------------*
* CLASS lcl_employee_manager IMPLEMENTATION
*----------------------------------------------------------------------*
CLASS lcl_employee_manager IMPLEMENTATION.

  METHOD constructor.
    mv_department = iv_department.
  ENDMETHOD.

  METHOD add_employee.
    APPEND is_employee TO mt_employees.
  ENDMETHOD.

  METHOD get_total_salary.
    LOOP AT mt_employees INTO DATA(ls_emp).
      rv_total = rv_total + ls_emp-salary.
    ENDLOOP.
  ENDMETHOD.

  METHOD display_all.
    DATA(lv_count) = lines( mt_employees ).

    WRITE: / |Department: { mv_department }|.
    WRITE: / |Employee Count: { lv_count }|.
    WRITE: / '----------------------------'.

    LOOP AT mt_employees INTO DATA(ls_emp).
      WRITE: / |{ ls_emp-id } - { ls_emp-name } - { ls_emp-salary }|.
    ENDLOOP.

    " Calculate average
    IF lv_count > 0.
      DATA(lv_avg) = get_total_salary( ) / lv_count.
      WRITE: / |Average Salary: { lv_avg }|.
    ENDIF.
  ENDMETHOD.

ENDCLASS.

*----------------------------------------------------------------------*
* START-OF-SELECTION
*----------------------------------------------------------------------*
START-OF-SELECTION.

  " Create manager instance
  DATA(lo_manager) = NEW lcl_employee_manager( gc_department ).

  " Add employees
  lo_manager->add_employee( VALUE #( id = 1 name = 'Ahmad' department = gc_department salary = '75000.00' ) ).
  lo_manager->add_employee( VALUE #( id = 2 name = 'Siti'  department = gc_department salary = '82000.00' ) ).
  lo_manager->add_employee( VALUE #( id = 3 name = 'Budi'  department = gc_department salary = '68000.00' ) ).

  " Display results
  lo_manager->display_all( ).

  " Select from database (example)
  SELECT * FROM sflight
    INTO TABLE @DATA(lt_flights)
    WHERE carrid = 'SQ'
    ORDER BY fldate.

  IF sy-subrc = 0.
    LOOP AT lt_flights INTO DATA(ls_flight).
      WRITE: / ls_flight-carrid, ls_flight-connid, ls_flight-fldate.
    ENDLOOP.
  ELSE.
    WRITE: / 'No flights found.'.
  ENDIF.

  " TRY/CATCH example
  TRY.
      DATA(lv_result) = 100 / 0.
    CATCH cx_sy_zerodivide INTO DATA(lx_error).
      WRITE: / |Error: { lx_error->get_text( ) }|.
  ENDTRY.

  " Function module call
  CALL FUNCTION 'POPUP_TO_CONFIRM'
    EXPORTING
      titlebar      = 'Confirmation'
      text_question = 'Do you want to continue?'
    IMPORTING
      answer        = DATA(lv_answer).
