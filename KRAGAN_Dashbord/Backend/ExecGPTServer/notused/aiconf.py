import os
from .db import get_db


def save_config(org_id=None, api_key=None):
    result = { 'error': None }
    print('save_config')
    print('org_id: ', org_id)
    print('api_key: ', api_key)


    db = get_db()
    try:
        cursor = db.execute(
            'INSERT INTO config (org_id, api_key) VALUES (?, ?) ON CONFLICT DO NOTHING',
            (org_id, api_key)
        )
        db.commit()
        if cursor.rowcount == 0:
            cursor = db.execute(
                'SELECT id FROM config WHERE org_id = ?',
                (org_id,)
            )
            existing_config = cursor.fetchone()
            if existing_config:
                config_id = existing_config['id']
                result['message'] = 'Config already exists'
                result['config_id'] = config_id
            else:
                result['error'] = 'Error while inserting config.'
        else:
            result['message'] = 'Config created successfully'
            result['config_id'] = config_id

    except db.IntegrityError:
        result['error'] = 'Error while inserting config.'

    return result


def update_config(config_id=None, org_id=None, api_key=None):
    result = {}
    if config_id is None:
        result['error'] = 'config_id is required.'
    elif not org_id and not api_key:
        result['error'] = 'Nothing to update. Please provide either org_id or api_key.'

    # if result['error'] is not None:
    if 'error' in result:
        return result

    db = get_db()
    try:
        placeholders = []
        values = []

        if org_id:
            placeholders.append('org_id = ?')
            values.append(org_id)
        if api_key:
            placeholders.append('api_key = ?')
            values.append(api_key)

        if placeholders:
            query = 'UPDATE config SET {} WHERE id = ?'.format(', '.join(placeholders))
            values.append(config_id)

            db.execute(query, values)
            db.commit()

            result['message'] = 'Config updated successfully'
            result['config_id'] = config_id
    except db.IntegrityError:
        result['error'] = 'Error while updating config.'

    return result


def get_config():
    db = get_db()
    config = db.execute(
        'SELECT * FROM config'
    ).fetchone()
    return config
