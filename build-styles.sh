#! /bin/bash

(
    cd inst/shower
    npm install

    for style in ribbon material mango; do
	(
	    cd node_modules/shower-$style
	    npm install
	)
    done
)
