# Convert database tables to excel and pdf files
### Version
1.0.0

### Overview
Index.js file has two functions which generate the files in excel and pdf formats and return their name.

#####  Required npm modules :
  - mongodb (database driver, could be something else
  - mongo-xlsx (for excel conversion)
  - phantom (for pdf conversion)
  - fs (for writing in a file)
 
##### Functions take three arguments:
  - Array of documents of a given collection
  - collection name (the generated file will be of this name + .pdf or .xlsx)
  - callback
  - Example for converting into excel format: 
    ```sh
     convert_to_excel(items, collection_name, function(file_name){
         /*Do something with filename*/
     });
     ```
  - Example for converting into pdf format: 
    ```sh
     convert_to_pdf(items, collection_name, function(file_name){
         /*Do something with filename*/
     });
     ```
##### Usage
Use require for importing this file in your file and use the above mentioned functions

