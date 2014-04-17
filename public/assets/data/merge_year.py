 # encoding=UTF-8
import gdal
from subprocess import call
from subprocess import Popen
import os
from os import *
from os.path import *
from osgeo import osr, gdal
import io
import csv
import sys
import unicodecsv


coincileMap={}
anio2012=[]
revisedData=[]


def main():
	global revisedData
	global anio2012
	outputcsv = io.open('merge_2012.csv','r',encoding='utf-8')
	rows=csv.reader(outputcsv)
	for row in rows:
		depre=row[12]
		provre=row[13]
		codDep=row[-5]
		codProv=row[-4]
		anio=row[18]

		if(anio!='2012'):
			if(provre not in coincileMap):
				coincileMap[provre]={}
			if(depre not in coincileMap[provre]):
				print (codProv,codDep)
				coincileMap[provre][depre]=(codProv,codDep)

			revisedData+=[row]
		else:
			anio2012+=[row]
		

	for row in anio2012:
		depre=row[12]
		provre=row[13]
		codDep=row[-5]
		codProv=row[-4]
		anio=row[18]

		if(codDep=='' and codProv==''):
			if provre in coincileMap and depre in coincileMap[provre]:
				row[-4]=coincileMap[provre][depre][0]
				row[-5]=coincileMap[provre][depre][1]	

		else:
			print 'not found'

		revisedData+=[row]

	outputcsv = io.open('result-merge2012.csv','wb')
	writer = csv.writer(outputcsv, delimiter=',', quotechar='"', quoting=csv.QUOTE_ALL)
	writer.writerow(['File', 'atenmed', 'codmuer', 'id_muerte', 'embmujer', 'fecdef', 'edad', 'unieda', 'grupedad', 'ocloc', 'depoc', 'provoc', 'depre', 'provre', 'paire', 'asociad', 'finstruc', 'MAT', 'anio', 'codmuera', 'muervio', 'sexo', 'codigo_residencia', 'id', 'codDep', 'codprov', 'codigo_ocurrencia', 'kml', 'fecnac'])
	for data in revisedData:
		writer.writerow(data)
	
	




main()

