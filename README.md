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


## Work in Progress / TODO / Ideas

- Listview
  - ~~Resize Column~~
  - ~~Show selected row~~
  - ~~Defaut to 99/N % wide~~
  - ~~dotpath hitlist columns~~
  - ~~Sort by Column~~
  - ~~Server side default columns~~
  - ~~Column name formatting~~
  - ~~BUG: Cannot resize smaller then content ~~
  - ~~listview code in own js file~~
  
- Formview
  - Use Template Form
    - ~~Simple~~
    - ~~Nested~~
    - Arrays
      - On an Empty form display a Single Empty array element
      - Should the contents be nested in the template or the template be nested in the contents?

Monday

  - Query By Form
  - New Record

Tuesday
- Editing
  - Locking
  - Change Determination
  - Array Editing

Wed/Later

- Authorization
- Mobile Layout
- 
*** MVP At this point ***

  Listview
  - Choose Columns
  - 
- Controls
  - Numbers
  - Constraints & Validation
    - On submit and on Change (Download JS to client??)
  - 
  - Picklist
      - Picklist Config?
      - Picklist dtermination
- Date Only Chooser
- Fuzzy (Atlas) Search
- Printing
- Links
- Charts?

