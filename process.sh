#!/bin/zsh

usage() {
  echo "
  Usage:
  sh [ -l LANGUAGE ] process.sh
  languages that can be used
  1) js
  2) py
  3) go
  4) c
  5) php
  6) ts
  " 1>&2
}

while getopts l:h: option
do
  case "${option}"
    in
    l) LANGUAGE=${OPTARG};;
    h | *) usage exit 1;;
  esac
done

case $LANGUAGE in
"js")
  node javascript/process.js;;
"py")
  python3 -m python.process;;
"php")
  php php/process.php;;
*)
  echo "language is incorrect"
esac


