#! /bin/bash

(
    cd inst

    for style in ribbon material earl2016; do
	(
	    cd node_modules/shower-$style
	    npm install
	)
    done

    npm install
)
