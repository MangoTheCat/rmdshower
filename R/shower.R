
#' R Markdown format for Shower presentations
#'
#' Shower is a vanilla HTML/CSS/JS presentation engine.
#'
#' @param theme Theme to use. The default theme is \sQuote{ribbon}.
#'   The \sQuote{material} theme is an alternative.
#' @param ratio Slide ratio to use. It can be \sQuote{4x3} or
#'   \sQuote{16x10}.
#' @param katex Whether to include KaTeX support. It is turned off
#'   by default. See \url{https://github.com/Khan/KaTeX} for more
#'   about KaTeX.
#' @param incremental \code{TRUE} to render slide bullets incrementally. Note
#'   that if you want to reverse the default incremental behavior for an
#'   individual bullet you can precede it with \code{>}. For example:
#'   \emph{\code{> - Bullet Text}}
#' @param ... Extra arguments, passed to \code{html_document_base}.
#'
#' @inheritParams rmarkdown::html_document
#'
#' @seealso \url{https://github.com/shower/shower}
#'
#' @importFrom rmarkdown pandoc_variable_arg pandoc_path_arg
#'   pandoc_highlight_args pandoc_options knitr_options_html
#'   html_document_base rmarkdown_format relative_to
#'   render_supporting_files output_format includes_to_pandoc_args
#' @export
#' @examples
#' \dontrun{
#' rmarkdown::render("presentation.Rmd")
#' }

shower <- function(
  theme = c("ribbon", "material"),
  ratio = c("4x3", "16x10"),
  katex = FALSE,
  incremental = FALSE,
  fig_width = 8,
  fig_height = 4.9,
  fig_retina = if (!fig_caption) 2,
  fig_caption = FALSE,
  smart = TRUE,
  self_contained = TRUE,
  highlight = "default",
  template = "default",
  css = NULL,
  includes = NULL,
  keep_md = FALSE,
  lib_dir = NULL,
  pandoc_args = NULL,
  ...) {

  if (! theme %in% c("ribbon", "material", "mango")) {
    stop("Unknown theme")
  }

  ratio <- match.arg(ratio)

  ## put common pandoc options here
  args <- c()

  if (identical(template, "default")) {
    default_template <- system.file(
      "rmarkdown/templates/shower/resources/default.html",
      package = "rmdshower"
    )
    args <- c(args, "--template", pandoc_path_arg(default_template))

  } else if (!is.null(template)) {
    args <- c(args, "--template", pandoc_path_arg(template))
  }

  if (incremental)
    args <- c(args, "--incremental")

  # slide level
  args <- c(args, "--slide-level", "1")

  # theme
  args <- c(args, "--variable", paste0("theme=", theme))

  # aspect ratio
  ratio <- c(args, "--variable", paste0("ratio=", ratio))

  # KaTeX?
  args <- c(args, if (katex) c("--variable", "katex=yes"))

  # content includes
  args <- c(args, includes_to_pandoc_args(includes))

  # additional css
  for (css_file in css) {
    args <- c(args, "--css", pandoc_path_arg(css_file))
  }

  pre_processor <- function(metadata, input_file, runtime, knit_meta, files_dir,
                            output_dir) {

    ## we don't work with runtime shiny
    if (identical(runtime, "shiny")) {
      stop("shower is not compatible with runtime 'shiny'",
           call. = FALSE)
    }

    ## use files_dir as lib_dir if not explicitly specified
    if (is.null(lib_dir))
      lib_dir <- files_dir

    ## extra args
    args <- c()

    shower_path <- system.file(package = "rmdshower")
    if (!self_contained || identical(.Platform$OS.type, "windows")) {
      shower_path <- relative_to(
        output_dir, render_supporting_files(shower_path, lib_dir)
      )
    }
    args <- c(
      args,
      "--variable",
      paste("shower-url=", pandoc_path_arg(shower_path), sep  ="")
    )

    ## highlight
    args <- c(args, pandoc_highlight_args(highlight, default = "pygments"))

    ## return additional args
    args
  }

  post_processor <- function(metadata, input_file, output_file, clean,
                             verbose) {

    ## Get lines from output file
    lines <- readLines(output_file)

    ## Change <li class="fragment"> elements, add a "next" class.
    ## Shower needs this for incremental lists

    lines <- sub(
      "<li class=\"fragment\"",
      "<li class=\"fragment next\"",
      lines,
      fixed = TRUE
    )

    ## Write it out
    writeLines(lines, output_file)

    output_file
  }

  output_format(
    knitr = knitr_options_html(fig_width, fig_height, fig_retina, keep_md),
    pandoc = pandoc_options(
      to = "revealjs",
      from = rmarkdown_format(if (fig_caption) "" else "-implicit_figures"),
      args = args
    ),
    keep_md = keep_md,
    clean_supporting = self_contained,
    pre_processor = pre_processor,
    post_processor = post_processor,
    base_format = html_document_base(
      smart = smart,
      lib_dir = lib_dir,
      self_contained = self_contained,
      mathjax = if (katex) "default" else NULL,
      pandoc_args = pandoc_args,
      ...
    )
  )

}
