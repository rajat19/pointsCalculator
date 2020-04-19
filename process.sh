#!/bin/zsh

usage() {
  echo "
  Usage:
  sh [ -l LANGUAGE ] [ -h help] process.sh
  languages that can be used
  1) js
  2) py
  3) go
  4) c
  5) php
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
  python3 python/process.py;;
*)
  echo "language is incorrect"
esac


