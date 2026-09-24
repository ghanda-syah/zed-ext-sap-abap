; ==========================================
; ABAP Outline Queries for Zed Editor
; ==========================================
; Defines code structure for the Outline panel

; Class definitions
(class_definition
  name: (identifier) @name) @item

; Interface definitions
(interface_definition
  name: (identifier) @name) @item

; Method definitions
(method_definition
  name: (identifier) @name) @item

; Method implementations
(method_implementation
  name: (identifier) @name) @item

; Form routines
(form_definition
  name: (identifier) @name) @item

; Function module definitions
(function_module
  name: (identifier) @name) @item

; Report/Program declarations
(report_statement
  name: (identifier) @name) @item

; Type definitions
(type_definition
  name: (identifier) @name) @item

; Data declarations (top-level)
(data_definition
  name: (identifier) @name) @item

; Constants
(constant_definition
  name: (identifier) @name) @item

; Event blocks
(at_selection_screen_statement) @item

(start_of_selection_statement) @item

(end_of_selection_statement) @item

(initialization_statement) @item

(top_of_page_statement) @item

(end_of_page_statement) @item
