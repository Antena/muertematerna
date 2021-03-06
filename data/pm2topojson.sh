#!/bin/bash

echo SHP to Topojson for province of Id $1...
mkdir tmp
echo Building GeoJSON for province...
ogr2ogr -f GeoJSON -where ID_1=$1 tmp/departments.json ARG_adm/ARG_adm2.shp
echo Retrieving health centers using scrapper...
python Maternidades/establecimientos.py $2 tmp/maternidades.json
echo Building Topojson with departments and health centers...
topojson -p -o tmp/$3 tmp/departments.json tmp/maternidades.json
echo Cleaning up...
cp tmp/$3 ../public/assets/data/
rm -rf tmp
