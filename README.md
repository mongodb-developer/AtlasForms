# AtlasForms
Forms Based UI for MongoDB Atlas

## Introduction

Atlas forms is a Forms based, End user interface to allow users to Create, Find, Update, Delete and Link Records. It is similar to a Fourth Generation Language (4GL) in that it abstracts away all
database development where required and makes a Zero Coding solution to building an internal GUI
to interact with Data.

It differs from a 4GL in having no proprietery coding language - it si instead a skeleton application in modern Javascript running with serverless function on MongoDBs Atlas Developer Data PLatform. It is intended to be modified to fit rewuirements and has been designed to me modular and easily modified.

## Installation


## Code Overview

## Decision Log

_Here we note anything we made an explicit decision about in the design and why_

30/9/2022 - Initial version is only supporting two levels of depth, so arrays and objects only at the top level or objects in a top level array. It is hard to render lower nicely in a basic GUI and also just not a nice schema. Objects might get extended one more level though.

## Questions
  - How Best ot handle date fields, are date pickers good
  - How do we *best* handle date not datetime?
  - Will we add support for Range queries? If so how >5 in a text box
  - How *critical* are dropdown picklists
   
## Work in Progress / TODO / Ideas

- Listview
  - ~~Resize Column~~
  - ~~Show selected row~~
  - ~~Defaut to 99/N % wide~~
  - ~~dotpath hitlist columns~~
  - ~~Sort by Column~~
  - ~~Server side default columns~~
  - ~~Column name formatting~~
  - ~~BUG: Cannot resize smaller then content~~
  - ~~listview code in own js file~~
  
- Formview
  - Use Template Form
    - ~~Simple~~
    - ~~Nested~~
    - Arrays (Add, Remove)
      - ~~On an Empty form display a Single Empty array element~~
      
  - Query By Form
    - ~~Change capture~~
    - ~~Data Typing (Server End)~~
    - ~~Date Handling~~  
    - ~~Basic Data Typing (Client end?)~~
      - ~~Dates~~
      - ~~Numbers~~

  - New Record
    - Disable _id provision
    - ~~Create New~~


- Editing
  - Locking
  - ~~Change Determination~~
  - Array Editing (Add and Remove elements as needed)


- Authorization
  - Read (Field Based)
  - Update (Field Based)

- Don't fetch hole documents until clicked.
- *Make it look nicer*
- Mobile Layout CSS/swipes


*** MVP  ish at this point ***

- Listview
  - Choose Columns

- FormView
    - Better Layout (Will be an ongoing battle)
    - Controls
      - Numbers
      - Constraints & Validation 
        - On submit and on Change (Download JS to client??)
      - Picklist
          - Picklist Config?
          - Picklist Determination
    - Date Only Chooser

- Range Queries
- Fuzzy (Atlas) Search
- Printing (Stylesheet)
- Linking andd following links
- Charts?

*** V1 at this point for reInvent ***