import csv
import json
import pickle
import pandas as pd

from collections import defaultdict
from pprint import pprint
from time import time

def hashjoin(A, B, opts, fnames):

    def fingerprint(x, opt):
        return str(x[opt]).lower().split(' ')

    bucket = defaultdict(list)

    # Create buckets
    for b in B:

        # Get key
        key_b = fingerprint(b, opts[1]['match'])

        if key_b:

            # Add additional infos
            b['options'] = opts[1]
            b['__fname'] = fnames[1]

            # Store in buckets
            for k in key_b:
                bucket[k].append(b)

    i = 0
    for a in A:
        t = time()

        # Get keys
        key_a = fingerprint(a, opts[0]['match'])

        # adds additional infos
        a['options'] = opts[0]
        a['__fname'] = fnames[0]

        # Find candidates
        a['suggestions'] = []
        for k in key_a:

            # thanks to buckets
            if k in bucket:
                for c in bucket[k]:
                    if c not in a['suggestions']:
                        c['common'] = len(list(set(key_a) & set(fingerprint(c, opts[1]['match']))))
                        a['suggestions'].append(c)
                if time() - t > 1:
                    print(len(a['suggestions']))
                    print(key_a)
                    print()
                yield a




def compute_all_suggestions(data, session_path):

    fingerprints = []
    fnames = []
    opts = []

    for i in range(2):
        fnames.append(data[i]['name'])
        opts.append(data[i]['options'])

    print('[ + ] Searching for candidates in')
    fpa = session_path + fnames[0]
    fpb = session_path + fnames[1]
    print(fpa, ' and')
    print(fpb)

    a = pd.read_csv(fpa,
                    delimiter=',',
                    low_memory=False,
                    encoding='utf-8').drop_duplicates(subset=opts[0]['id']).fillna('nan').to_dict('records')
    b = pd.read_csv(fpb,
                    delimiter=',',
                    low_memory=False,
                    encoding='utf-8').drop_duplicates(subset=opts[1]['id']).fillna('nan').to_dict('records')

    if len(a) > len(b):
        result = list(hashjoin(a, b, opts, fnames))
    else:
        result = list(hashjoin(b, a, opts[::-1], fnames[::-1]))

    print('[ + ] Found %d matches' % len(result))

    pprint(result[:3])

    print('[ + ] Saving candidate file')
    fo = session_path + 'suggestions.json'
    with open(fo, 'wb') as f:
        pickle.dump(result, f)

    return result
