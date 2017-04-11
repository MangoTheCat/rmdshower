---
title: "Creating Custom rmdshower Themes"
author: "Gábor Csárdi"
date: "`r Sys.Date()`"
output: rmarkdown::html_vignette
vignette: >
  %\VignetteIndexEntry{Creating Custom rmdshower Themes}
  %\VignetteEngine{knitr::rmarkdown}
  %\VignetteEncoding{UTF-8}
---

```{r, include = FALSE}
knitr::opts_chunk$set(comment = "#>", collapse = TRUE)
```

# Introduction

Starting from version 2.1.0 `rmdshower` is able to use custom shower
themes, defined in separate R packages.

# Theme packages

The name of the theme package must have an `rmdshower.` prefix (note the
dot!), and it must be installed on the system.

An example theme package is at
https://github.com/MangoTheCat/rmdshower.mango, this contains the Mango
theme. I suggest that you use this package as a template. Most files of
the package are generic, and need no modifications.

The `/node` directory is the source code of theme, and `/inst/package` is
the installed theme. `/inst/package` is generated automatically by node.js,
and should not be modified directly.

The style files are written in [SCSS](http://sass-lang.com/), and are in
`/node/styles`. Other assets are in other directories within `/node`.

To generate `/inst/package` from `/node`, call the `update.sh` script.
It needs to have node.js installed, and it installs the required `npm`
packages automatically, these are specified in `/node/package.json`.
Ideally you would modify `package.json` to define a new `npm` package,
but this is not strictly necessary.

A `/inst/style-override.css` file can be used to override the generated
CSS styles. This file is included last in the final HTML document.

The `/inst` directory might also contain an example Rmd file, and the other
assets needed for it.

# Using theme packages

To use a theme package in an Rmd file, you can simply refer to its name in
the `theme` parameter of the YAML header, and `rmdshower` will look up the
package and insert the appropriate CSS and other files in the output:

```
---
title: "Shower Presentations with R Markdown"
author: "Gábor Csárdi"
output:
  rmdshower::shower_presentation:
    theme: mango
---
```
