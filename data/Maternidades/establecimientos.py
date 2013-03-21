# encoding: utf-8

# install dependencies:
#  pip install xmltodict, requests
# needs establecimientos_neo.csv on the cwd (downloaded from google spreadsheet)

import csv, xmltodict, requests, sys, json

from collections import *
from itertools import *


same = lambda x:x  # identity function
add = lambda a,b:a+b
_tuple = lambda x:(x,)  # python actually has coercion, avoid it like so

def flattenDict(dictionary, keyReducer=add, keyLift=_tuple, init=()):

    # semi-lazy: goes through all dicts but lazy over all keys
    # reduction is done in a fold-left manner, i.e. final key will be
    #     r((...r((r((r((init,k1)),k2)),k3))...kn))

    def _flattenIter(pairs, _keyAccum=init):
        atoms = ((k,v) for k,v in pairs if not isinstance(v, Mapping))
        submaps = ((k,v) for k,v in pairs if isinstance(v, Mapping))
        def compress(k):
            return keyReducer(_keyAccum, keyLift(k))
        return chain(
            (
                (compress(k),v) for k,v in atoms
            ),
            *[
                _flattenIter(submap.items(), compress(k))
                for k,submap in submaps
            ]
        )
    return dict(_flattenIter(dictionary.items()))

class DictUnicodeProxy(object):
    def __init__(self, d):
        self.d = d
    def __iter__(self):
        return self.d.__iter__()
    def get(self, item, default=None):
        i = self.d.get(item, default)
        if isinstance(i, unicode):
            return i.encode('utf-8')
        return i


def get_establecimiento(sissa_id):
    url = 'https://sisa.msal.gov.ar/sisa/services/rest/establecimiento/' + sissa_id
    print >>sys.stderr, "REQUESTING: %s" % url
    r = requests.get(url)
    if r is None: return {}
    try:
        body = r.text
    except TypeError:
        return {}
    if body is None: return {}
    body = body.encode('utf-8')

    return dict([('_'.join(k),v) for k,v in flattenDict(xmltodict.parse(body)).items()])
    

def main(csv_file):
    features = []
    for row in list(csv.reader(open(csv_file, 'rU')))[1:]:
        est = get_establecimiento(row[0])
        est['Partos'] = row[1]
        est['CONE_Q'] = row[2]
        est['CONE_A'] = row[3]
        est['CONE_S'] = row[4]
        est['CONE_PM'] = row[5]
        est['CONE_PN'] = row[6]
        est['CONE_RMN'] = row[7]
        est['CONE_T'] = row[8]

        geometry = { 'type' : 'Point', 'coordinates' : [float(est['Establecimiento_coordenadasDeMapa_latitud']),float(est['Establecimiento_coordenadasDeMapa_longitud'])] }
        feature = { 'type' : 'Feature', 'properties' : est, 'geometry' : geometry }
        features.append(feature)

    result = { 'type' : 'FeatureCollection', 'features' : features}
    print json.dumps(result, sort_keys=True, indent=4, separators=(',', ': '))

    print "Writing ouput file..."
    outfile = open(sys.argv[2], 'w')
    outfile.write(json.dumps(result))
    outfile.close()
    print "Done."


if __name__ == '__main__':
    if len(sys.argv) < 3:
        sys.exit("Usage: python establecimientos.py [input_csv] [output_filename]")
    main(sys.argv[1])

    
