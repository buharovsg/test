// Пример эндпоинта для бэкенда (Node.js/Express)
// Этот файл показывает, как обработать запрос с call_id на сервере

const express = require('express');
const app = express();

// Middleware для парсинга JSON
app.use(express.json());

// Эндпоинт для приема call_id
app.post('/webhook/call-url', async (req, res) => {
  try {
    const { call_id } = req.body;

    // Валидация call_id
    if (!call_id) {
      return res.status(400).json({
        error: 'call_id is required',
        message: 'Поле call_id обязательно для заполнения'
      });
    }

    // Проверка формата UUID (опционально)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(call_id)) {
      return res.status(400).json({
        error: 'Invalid call_id format',
        message: 'call_id должен быть в формате UUID'
      });
    }

    // Здесь можно добавить логику:
    // - Сохранение call_id в базу данных
    // - Запрос данных о звонке из внешнего API
    // - Обработка и анализ звонка
    // - Отправка уведомлений и т.д.

    console.log('Received call_id:', call_id);

    // Пример: сохранение в базу данных (псевдокод)
    // await db.calls.create({ call_id, status: 'pending', created_at: new Date() });

    // Успешный ответ
    res.status(200).json({
      success: true,
      message: 'Call ID успешно получен',
      call_id: call_id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error processing call_id:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Произошла ошибка при обработке запроса'
    });
  }
});

// Альтернативный вариант: получение call_id из query параметров
app.get('/webhook/call-url', async (req, res) => {
  try {
    const call_id = req.query.call_id;

    if (!call_id) {
      return res.status(400).json({
        error: 'call_id is required',
        message: 'Параметр call_id обязателен'
      });
    }

    // Обработка call_id...
    console.log('Received call_id via GET:', call_id);

    res.status(200).json({
      success: true,
      call_id: call_id
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Пример для Python (Flask)
/*
from flask import Flask, request, jsonify
import re

app = Flask(__name__)

@app.route('/webhook/call-url', methods=['POST'])
def receive_call_id():
    try:
        data = request.get_json()
        call_id = data.get('call_id')
        
        if not call_id:
            return jsonify({
                'error': 'call_id is required',
                'message': 'Поле call_id обязательно для заполнения'
            }), 400
        
        # Проверка формата UUID
        uuid_pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        if not re.match(uuid_pattern, call_id, re.IGNORECASE):
            return jsonify({
                'error': 'Invalid call_id format',
                'message': 'call_id должен быть в формате UUID'
            }), 400
        
        # Обработка call_id...
        print(f'Received call_id: {call_id}')
        
        return jsonify({
            'success': True,
            'message': 'Call ID успешно получен',
            'call_id': call_id
        }), 200
        
    except Exception as e:
        print(f'Error: {e}')
        return jsonify({
            'error': 'Internal server error',
            'message': 'Произошла ошибка при обработке запроса'
        }), 500

if __name__ == '__main__':
    app.run(port=3000)
*/
