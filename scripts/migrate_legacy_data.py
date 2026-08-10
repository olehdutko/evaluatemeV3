import os
import re
import uuid
from datetime import datetime
import mysql.connector
from urllib.parse import urlparse, unquote

def parse_mysql_url(url: str):
    parsed = urlparse(url)
    return {
        'host': parsed.hostname,
        'port': parsed.port or 3306,
        'user': unquote(parsed.username),
        'password': unquote(parsed.password),
        'database': parsed.path.lstrip('/'),
    }

SOURCE_URL = os.getenv('SOURCE_DATABASE_URL', 'mysql://evaluateme_dev:nK8%23vL2%24wQ9%26pM4%2AxC6%21tR5%40jH7%23eF3%24@192.168.1.132:3306/evaluateme_db')
TARGET_URL = os.getenv('DATABASE_URL')
if not TARGET_URL:
    raise RuntimeError('DATABASE_URL env var is required')

src = parse_mysql_url(SOURCE_URL)
tgt = parse_mysql_url(TARGET_URL)

source = mysql.connector.connect(**src)
target = mysql.connector.connect(**tgt)

now = datetime.utcnow().isoformat(timespec='milliseconds')

def make_slug(name: str, existing: set, fallback_id):
    base = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip('-') or str(fallback_id)
    slug = base
    suffix = 1
    while slug in existing:
        slug = f'{base}-{suffix}'
        suffix += 1
    existing.add(slug)
    return slug

try:
    sc = source.cursor(dictionary=True)
    tc = target.cursor()

    # Clean target tables in correct order
    tc.execute('SET FOREIGN_KEY_CHECKS = 0')
    tc.execute('TRUNCATE TABLE answers')
    tc.execute('TRUNCATE TABLE questions')
    tc.execute('TRUNCATE TABLE technologies')
    tc.execute('SET FOREIGN_KEY_CHECKS = 1')
    target.commit()

    # Import technologies
    tech_map = {}
    used_slugs = set()
    sc.execute('SELECT Technology_id, Technology, is_active FROM Technologies ORDER BY Technology_id')
    technologies = sc.fetchall()
    print(f'Importing {len(technologies)} technologies...')
    for row in technologies:
        new_id = str(uuid.uuid4())
        tech_map[row['Technology_id']] = new_id
        name = row['Technology']
        slug = make_slug(name, used_slugs, row['Technology_id'])
        tc.execute(
            'INSERT INTO technologies (id, name, slug, description) VALUES (%s, %s, %s, %s)',
            (new_id, name, slug, None)
        )
    target.commit()

    # Import questions
    question_map = {}
    sc.execute('SELECT ID, text, Test_id, BookChapter, Justification FROM Questions ORDER BY ID')
    questions = sc.fetchall()
    print(f'Importing {len(questions)} questions...')
    for idx, row in enumerate(questions):
        new_id = str(uuid.uuid4())
        question_map[row['ID']] = new_id
        test_id = tech_map.get(row['Test_id'])
        if not test_id:
            print(f'Warning: question {row["ID"]} references unknown Test_id {row["Test_id"]}')
            continue
        content = (row['text'] or '').strip()
        tc.execute(
            'INSERT INTO questions (id, testId, content, type, orderIndex, score, createdAt, updatedAt) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)',
            (new_id, test_id, content, 'single', idx, 1, now, now)
        )
    target.commit()

    # Import answers
    sc.execute('SELECT QuestionID, AnswerID, Answer, Correct FROM Answer ORDER BY AnswerID')
    answers = sc.fetchall()
    print(f'Importing {len(answers)} answers...')
    order_counter = {}
    for row in answers:
        question_id = question_map.get(row['QuestionID'])
        if not question_id:
            print(f'Warning: answer {row["AnswerID"]} references unknown QuestionID {row["QuestionID"]}')
            continue
        order_counter[question_id] = order_counter.get(question_id, 0) + 1
        new_id = str(uuid.uuid4())
        tc.execute(
            'INSERT INTO answers (id, questionId, content, isCorrect, orderIndex, createdAt) VALUES (%s, %s, %s, %s, %s, %s)',
            (new_id, question_id, (row['Answer'] or '').strip(), bool(row['Correct']), order_counter[question_id], now)
        )
    target.commit()

    # Counts
    for tbl in ['technologies', 'questions', 'answers']:
        tc.execute(f'SELECT COUNT(*) FROM {tbl}')
        print(f'{tbl}: {tc.fetchone()[0]}')
finally:
    sc.close()
    tc.close()
    source.close()
    target.close()
