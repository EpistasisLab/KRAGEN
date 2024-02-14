from ..db.db import get_db


def create_chat(title):
    result = {}
    db = get_db()
    query = 'INSERT INTO chat (title) VALUES (?)'
    try:
        cursor = db.execute(query, (title,))
        db.commit()
        result['message'] = 'Chat created successfully'
        result['chat_id'] = cursor.lastrowid
    except Exception as e:
        result['error'] = str(e)

    return result


def update_chat(title, chat_id):
    result = {}
    db = get_db()
    query = 'UPDATE chat SET title = ? WHERE id = ?'
    try:
        db.execute(query, (title, chat_id))
        db.commit()
        result['message'] = 'Chat updated successfully'
    except Exception as e:
        result['error'] = str(e)

    return result


def delete_chat(chat_id):
    result = {}
    db = get_db()
    query = 'DELETE FROM chat WHERE id = ?'
    try:
        db.execute(query, (chat_id,))
        db.commit()
        result = delete_chatlogs_by_chat_id(chat_id)
    except Exception as e:
        result['error'] = str(e)

    return result

def get_chat_title(chat_id):
    print("CHAT_ID: ", chat_id)
    result = {}
    db = get_db()
    query = """
            SELECT * FROM chat WHERE id = ?
        """
    try:
        title = db.execute(query, (chat_id,)).fetchone()
        # title = db.execute(query).fetchone()
        print("TITLE: ", dict(title))
        
        if title:
            dict_data = dict(title)
            print("DICT_DATA: ", dict_data)
            result['title'] = dict_data['title']
        else:
            result['error'] = 'Chat not found'
    except Exception as e:
        result['error'] = str(e)

    return result

def update_chat_title(chat_id, title):
    result = {}
    try:
        db = get_db()
        # UPDATE 쿼리를 실행하여 title 업데이트
        query = "UPDATE chat SET title = ? WHERE id = ?"
        db.execute(query, (title, chat_id))
        db.commit()

        # 업데이트된 title 조회
        updated_title = db.execute("SELECT title FROM chat WHERE id = ?", (chat_id,)).fetchone()
        print("UPDATED_TITLE: ", dict(updated_title))
        if updated_title:
            result['title'] = updated_title[0]
        else:
            result['error'] = 'Chat not found'
    except Exception as e:
        result['error'] = str(e)

    return result



def get_chat(chat_id):
    result = {}
    db = get_db()
    query = 'SELECT * FROM chatlog WHERE chat_id = ?'
    try:
        row = db.execute(query, (chat_id,)).fetchone()
        if row is None:
            result['error'] = f'No chat with id {chat_id} exists'
        else:
            result['chat'] = dict(row)
            result['message'] = 'Chat retrieved successfully'
    except Exception as e:
        result['error'] = str(e)

    return result


def get_chatlogs(chat_id):
    result = {}
    db = get_db()
    query = 'SELECT * FROM chatlog WHERE chat_id = ? ORDER BY id DESC'
    try:
        rows = db.execute(query, (chat_id,)).fetchall()

        entries = [dict(row) for row in rows]

        result['chatlogs'] = entries
        result['message'] = 'Chatlogs retrieved successfully'
    except Exception as e:
        result['error'] = str(e)

    return result


def add_chatlog(chatlog):
    result = {}
    db = get_db()
    query = 'INSERT INTO chatlog '
    parameters = []
    query += '('
    query += 'chat_id'
    parameters.append(chatlog['chat_id'])
    if 'who' in chatlog:
        query += ', who'
        parameters.append(chatlog['who'])
    if 'message' in chatlog:
        query += ', message'
        parameters.append(chatlog['message'])
    if 'message_type' in chatlog:
        query += ', message_type'
        parameters.append(chatlog['message_type'])
    if 'execution_id' in chatlog:
        query += ', execution_id'
        parameters.append(chatlog['execution_id'])
    if 'src_code' in chatlog:
        query += ', src_code'
        parameters.append(chatlog['src_code'])
    query += ')'
    query += ' VALUES ('
    for i in range(len(parameters)):
        query += '?,'
    query = query[:-1] + ')'

    try:
        cursor = db.execute(query, parameters)
        db.commit()
        result['chat_id'] = cursor.lastrowid
        result['message'] = 'Chat entry added successfully'
    except Exception as e:
        result['error'] = str(e)

    return result


def update_chatlog(chatlog):
    result = {}
    db = get_db()
    query = 'UPDATE chatlog SET'
    parameters = []
    if 'chat_id' in chatlog:
        query += ' chat_id = ?,'
        parameters.append(chatlog['chat_id'])
    if 'who' in chatlog:
        query += ' who = ?,'
        parameters.append(chatlog['who'])
    if 'message' in chatlog:
        query += ' message = ?,'
        parameters.append(chatlog['message'])
    if 'message_type' in chatlog:
        query += ' message_type = ?,'
        parameters.append(chatlog['message_type'])
    if 'execution_id' in chatlog:
        query += ' execution_id = ?,'
        parameters.append(chatlog['execution_id'])
    if 'src_code' in chatlog:
        query += ' src_code = ?,'
        parameters.append(chatlog['src_code'])
    query = query[:-1] + ' WHERE id = ?'
    parameters.append(chatlog['chatlog_id'])

    try:
        db.execute(query, parameters)
        db.commit()
        result['message'] = 'Chat entry updated successfully'
    except Exception as e:
        result['error'] = str(e)

    return result


def delete_chatlogs_by_chat_id(chat_id):
    result = {}
    db = get_db()
    query = 'DELETE FROM chatlog WHERE chat_id = ?'
    try:
        db.execute(query, (chat_id,))
        db.commit()
        result['message'] = 'Chat entries deleted successfully'
    except Exception as e:
        result['error'] = str(e)

    return result


# count how many different chatids there are
def count_chatids():
    result = {}
    db = get_db()
    query = 'SELECT COUNT(DISTINCT chat_id) FROM chatlog'
    try:
        row = db.execute(query).fetchone()
        result['count'] = row[0]
        result['message'] = 'Chatids counted successfully'
    except Exception as e:
        result['error'] = str(e)

    return result

# return all chatids
def get_chatids():
    result = {}
    db = get_db()
    query = 'SELECT DISTINCT chat_id FROM chatlog'
    try:
        rows = db.execute(query).fetchall()
        result['chatids'] = [row[0] for row in rows]
        result['message'] = 'Chatids retrieved successfully'
    except Exception as e:
        result['error'] = str(e)

    return result