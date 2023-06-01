# Boss Randomization
The Boss data is first parsed from a JSON file into a JSON object in randomizer.js. That object is the source of data for the rest of the file.



# Character Randomization
Character data are stored in JSON strings in local storage. They can be exported into CSV files and transferred like such.

## Character Profiles
Character Profiles start as an empty page.

## Randomizing Algorithm
Characters are split into two sets -> Characters Owned and Characters Banned. All characters in neither set are considered Characters Not Owned.
- Characters Owned contains all Characters Banned, if bans are turned on during randomizing, the program uses Characters Owned - Characters Banned as the sample set. 


