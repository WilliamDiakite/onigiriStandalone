import json
import os
import pandas as pd
import traceback
import json
import shutil
import csv
import ijson
import pickle

from heavy import compute_all_suggestions

from uuid import uuid4
from flask import Flask, request, jsonify
from flask_cors import CORS
from celery import Celery

from pprint import pprint
from collections import defaultdict


# Init server
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Config celery
celery = Celery('server', backend='rpc://', broker='pyamqp://guest@localhost//')
celery.conf.update(app.config)

# Global
SESSIONS = []
FILTER = defaultdict(list)


def add_user(session_name, nb):
    global SESSIONS

    for i in range(len(SESSIONS)):
        if session_name in SESSIONS[i]:
            session = SESSIONS[i]
            session['nb_user'] += nb

            if session['nb_user'] == 0:
                del SESSIONS[i]

            else:
                SESSIONS[i] = session

            break

def find_session(session_name):
    global SESSIONS

    for i in range(len(SESSIONS)):
        if session_name in SESSIONS[i]:
            return SESSIONS[i]

    return None


@app.route('/check-session/', methods=['POST'])
def check_session():
    """
    # TODO: search for special characters
    """
    session = eval(request.data)

    session_path = './sessions/{}'.format(session)
    print('testing session name', session_path)
    print(os.getcwd())
    if os.path.isdir(session_path):
        return jsonify({'sessionExists': True})
    else:
        print('folder does not exists')
        return jsonify({'sessionExists': False})


@app.route('/create-session/', methods=['POST'])
def create_session():
    global SESSIONS
    print('\n\n\n\n')
    try:
        shutil.rmtree('./sessions/townyd')
        print('retry session removed')
    except:
        pass

    # Check incoming data
    load = eval(request.data)
    session = load['session']
    data = load['load']

    print(list(data[0].keys()))

    with open('test_load.json', 'w') as f:
        json.dump(load, f, ensure_ascii=False)

    # Create new session
    path = 'sessions/%s/' % session
    os.mkdir(path)

    # Store the data
    dfs = []
    for f in data:
        f_path = path + f['name']

        # Save files as csv for later join
        with open(f_path, 'w', encoding='utf-8') as fo:
            fo.write(f['content'])

        dfs.append({
            'name': f['name'],
            'options': f['options']
        })

    # Compute suggestions and get the names of datasets
    sugg = compute_all_suggestions(dfs, path)

    print('APPENDING NEW SESSION')
    SESSIONS.append({session: sugg, 'nb_user': 0})

    return jsonify('create session ok')


def load_suggestions(session_name):

    session_path = './sessions/%s/' % session_name
    sfile = './sessions/%s/suggestions.json' % session_name
    mfile = './sessions/%s/matched.csv' % session_name

    if os.path.isdir(session_path):
        with open(sfile, 'rb') as fs:
            suggestions = pickle.load(fs)
            print('LEN OF LOADED SUGG BEFORE FILTER', len(suggestions))
            try:
                with open(mfile) as fm:
                    read = list(set([l.split(',')[0] for l in fm.readlines()]))
                    print(read)
            except Exception as e:
                print('there was an exception when loading matched data', e)
                return suggestions
            suggestions = [s for s in suggestions
                            if not any(id in [str(v) for v in s[s['options']['id']]]
                                        for id in read)]
            print('LEN OF LOADED SUGG AFTER FILTER', len(suggestions))
            return suggestions
    else:
        print('load_session returning NONE')
        return None


@app.route('/load-session/', methods=['POST'])
def load_session():
    global SESSIONS

    session_name = eval(request.data)
    session_path = './sessions/' + session_name

    print('LOADING SESSION', session_name)

    # Session exists
    if os.path.isdir(session_path):

        # Session already loaded
        if any(session_name in s for s in SESSIONS):
            add_user(session_name, 1)
            return jsonify('session_already_loaded')

        # Session not loaded
        else:
            suggestions = load_suggestions(session_name)
            SESSIONS.append({session_name: suggestions, 'nb_user': 1})
            return jsonify('session_loaded')

    # Session does not exist
    else:
        return jsonify('must_create_session')

    return jsonify('must_create_session')


@app.route('/get-suggestion/', methods=['POST'])
def get_suggestion():
    global SESSIONS

    session_name = eval(request.data)
    fname = './sessions/%s/suggestions.json' % session_name

    # search for requested session
    for i in range(len(SESSIONS)):
        if session_name in SESSIONS[i]:
            session = SESSIONS[i]
            suggestions = session[session_name]
            print('SUGGESTION LEN', len(suggestions))

            try:
                # Get a suggestion
                suggestion = suggestions.pop()

                # Update session
                session[session_name] = suggestions
                SESSIONS[i] = session

                # Return match to client
                print('SENDING SUGGESTION')
                tot = len(suggestions)
                return jsonify({'suggestion': suggestion,
                                'nbuser': session['nb_user'],
                                'total': tot})

            except IndexError:
                return jsonify('no more possible match')
        else:
            print('session is not loaded anymore')
            return jsonify('null')


@app.route('/add-match/', methods=['POST'])
def add_match():
    global FILTER

    data = eval(request.data)
    print('\n', data, '\n')

    write_new_match.apply_async(args=[data['match'], data['type'], data['session']])

    return jsonify('match ok')


@celery.task
def write_new_match(match, type, session):
    path = './sessions/%s/matched.csv' % session
    with open(path, 'a') as f:
        for m in match:
            line = '%s, %s, %s' % (str(m[0]), str(m[1]), type)
            print('writing', line)
            f.write(line)
            f.write('\n')


@app.route('/leave/', methods=['POST'])
def leave():
    global SESSIONS

    print(request.data)
    session_name = request.data

    for i in range(len(SESSIONS)):
        if session_name in SESSIONS[i]:

            print('dealing with leaving user')
            session = SESSIONS[i]

            print('NB USER BERFORE:', session['nb_user'])
            session['nb_user'] += -1
            print('NB USER AFTER:', session['nb_user'])

            if session['nb_user'] == 0:
                print('[ + ] Unloading session')
                del SESSIONS[i]

            else:
                SESSIONS[i] = session

    return jsonify('user_leave')

if __name__ == '__main__':
    app.run(debug=True)
