# Data Explorer
This is a tool which was designed for quick exploration of small-ish data sets.  It can read JSON and CSV files and all analysis is done locally in your browser.  No data is sent to the server.

You can see a deployed version of it here: https://data.zz9pza.co

The interface is pretty basic, just using styled-components and no libraries.  Visualisations are done using d3.

## Use case
The tool is designed to help you explore and understand data sets where the data can be classified into different categories based on filters.  It lets you understand how the population of data changes as you apply different filters and what the relationships between the filters are.  It is useful for answering questions like: "what happens if I turn this filter off, or change this filter?".

## Loading data
The tool accepts CSV and JSON files.  

### CSV
It expects conformance to RFC4180.  The first row should be the column names.

### JSON
It expects an array of objects which can be split over multiple lines.  The tool only looks at the first object attributes to get the column names, so it expects that each object which follows has the same attributes as the first.

## What it does
The application inspects the data and creates in-memory structures which allows for very fast filtering.  It currently only works with strings and is best suited to sets of data with small numbers of unique values per column.

There's an example below of the kind of output you can generate, showing the different visualisations based on filters as they are created.

## To do
I plan to extend the tool, including:

* support for b-tree indexes on columns which don't lend themselves to 'categorical' indexes, for example those with high entropy.
* support for on-the-fly category building e.g. numeric > and < relations
* support for dates
* extract raw data in CSV and JSON, and limiting the fields that are output
* 'clustering' diagram to show sets of data with different combinations of field values
