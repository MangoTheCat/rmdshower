
find_theme <- function(theme) {

  ## builtin-themes
  if (theme %in% c("ribbon", "material", "earl2016")) {
    find_builtin_theme(theme)

  } else {
    find_theme_package(theme)
  }
}

## This is temporary, and will be removed later

find_builtin_theme <- function(theme) {
  system.file("node_modules", paste0("shower-", theme), package = "rmdshower")
}

#' @importFrom utils installed.packages

find_theme_package <- function(theme) {
  theme_pkg <- paste0("rmdshower.", theme)
  if (! theme_pkg %in% rownames(installed.packages())) {
    stop("Cannot find theme package ", theme_pkg)
  }

  system.file(package = theme_pkg)
}
