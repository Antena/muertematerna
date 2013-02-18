#!/bin/bash

echo SHP to Topojson for province of Id $1...
echo Building GeoJSON...
ogr2ogr -f GeoJSON -where ID_1=$1 provinces/departments.json ARG_adm2.shp
echo Building Topojson...
topojson -p -o provinces/$2 provinces/departments.json
echo Cleaning up...
rm provinces/departments.json
cp provinces/$2 ../../public/assets/data/
