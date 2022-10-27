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



## Coding Standards

  - All Server Side non private functions return ok(boolean) and message(string) which should be an end user
appropriate message.
  - variuable and function nameing are camelCase
  - Things that can fail are wrapped in try catch
  - ES6 syntax wherever possible
  - Multiline comments should be in a single multiline-comment
  - Use TODO: for things we need to get back to
  - 
  
## Questions
  - How do we *best* handle date not datetime?

## IMPORTANT BUGS to fix

   - Server conversion of NUmbers is converting all to double!!
   - Last listview column needs to fill to end.
   - Do we handle arrays of non string scalars? - test that and fix as required
   - Edit/Select contents, press delete (Empty field) - doesn't work, have to replace with a space.
   - Enter Jaws in movies title, change to Airbnb & Jaws value is in neighbourhood owner!


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
    - ~~Arrays (Add, Remove)~~
      - ~~On an Empty form display a Single Empty array element~~
      
  - Query By Form
    - ~~Change capture~~
    - ~~Data Typing (Server End)~~
    - ~~Date Handling~~  
    - ~~Basic Data Typing (Client end?)~~
      - ~~Dates~~
      - ~~Numbers~~

  - New Record
    - ~~Disable manual _id provision~~
    - ~~Create New~~


- Editing
  - ~~Locking~~
  - ~~Cancel~~
  - ~~Commit~~
  - ~~Download hitlist only~~
  - ~~Update hitlist on edit~~
  -  ~~Combine Cancel Edit and Commit Edit into one function each end~~
  - ~~Array Editing (Add and Remove elements as needed)~~
  - ~~Need to be able to add Array Elements when Creating a Document (and Querying?)~~
    - ~~Needs to handle Query when sending multiepl array elements ... Implicit AND $elemMAtch~~


- Authorization [John Working on This now]
  - ~~User Details (and user editing?)~~
  - ~~Concepts of 'UserAdmin'~~
  - ~~Pre Operation Trigger - allows cancellation or modification.~~
  - ~~Read (Field Based)~~
  - ~~Update (Field Based)~~

- ~~*Picklists* ~~
  - ~~Picklist Config~~
  - ~~Picklist Determination~~
  
- ~~*Make it look nicer*~~~

- Basic Import (Luce)
  - Ask for db.collection, Name, URL, Fields for Listview on form
  - Empty existing if it exists (use $out in aggregation)
  - Load the data
  - May have 16MB limit for now!
  -  
- ~~DocTypeSchema should be in doctype record~~

- ~~Range Queries (> and < support)~~
- ~~Fuzzy (Atlas) Search~~
  
- Linking 
  - Follow Links
  - Add Links

- Generate demo setup - full set of picklists, bootstrap functions?
- Error Handling review, Refactor, lint,tidy code
- All Strings in a consts class, inc errors and fieldnames
- 
*** V1 at this point for reInvent ***


- Mobile Layout CSS/swipes

- Listview
  - Choose Columns from Cient

- FormView
    - ~~Better Layout (Will be an ongoing battle)~~
    - Formview rememeber personal layout changes
    - Controls
      - ~~Numbers~~
      - boolean support (button/box)
      - Constraints & Validation 
        - On submit and on Change (Download JS to client??)

    - Date Only Chooser
- Printing (Stylesheet)
- Charts?
- Acessability