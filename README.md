# TnkStorage

This library is to provide a simple way of using indexed-db for typescript.
Perfect for simple object structure. Each table created has a schema of 
`{databasekey : string, entity : StorageEntity}`
Each database key is created by its self and this library handles problems such as class functions lost 
due to json retriaval from the database.

