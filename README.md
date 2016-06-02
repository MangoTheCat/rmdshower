
# rmdshower

> R Markdown Template for the Shower Presentation Engine

[![Project Status: Active - The project has reached a stable, usable state and is being actively developed.](http://www.repostatus.org/badges/latest/active.svg)](http://www.repostatus.org/#active)
[![Linux Build Status](https://travis-ci.org/MangoTheCat/rmdshower.svg?branch=master)](https://travis-ci.org/MangoTheCat/rmdshower)
[![](http://www.r-pkg.org/badges/version/rmdshower)](http://www.r-pkg.org/pkg/rmdshower)
[![CRAN RStudio mirror downloads](http://cranlogs.r-pkg.org/badges/rmdshower)](http://www.r-pkg.org/pkg/rmdshower)

## Installation

```r
devtools::install_github("mangothecat/rmdshower")
```

## Usage

Use the `rmdshower::shower` format in the `Rmd` header, and then just
call `rmarkdown::render()` as usual:

```markdown
---
title: "Shower Presentations with R Markdown"
author: "Gábor Csárdi"
output:
  rmdshower::shower_presentation:
    self_contained: false
    katex: true
    ratio: 16x10
---
```

## More information

* See http://rmarkdown.rstudio.com/ for more about R Markdown.
* There is a long example Rmd document in the
  [`inst/examples`](./inst/examples/skeleton.Rmd) directory.
* The HTML output of this document is at
  http://mangothecat.github.io/rmdshower/skeleton.html
* The shower homepage is at https://github.com/shower/shower
* Our own Mango template is at
  http://mangothecat.github.io/rmdshower/mango.html

## License

MIT © Mango Solutions, R Studio, Vadim Makeev
