from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import pickle
import numpy as np
from tensorflow.keras.preprocessing.sequence import pad_sequences

app = Flask(__name__)
# IMPORTANTE: CORS permite que tu APK/React hable con este servidor
CORS(app) 

# 1. CARGAR ARTEFACTOS
print("Cargando modelo...")
model = tf.keras.models.load_model('modelo_intenciones.h5')

with open('tokenizer.pickle', 'rb') as f:
    tokenizer = pickle.load(f)

with open('label_mapping.pickle', 'rb') as f:
    mapping_data = pickle.load(f)
    id_to_label = mapping_data['id_to_label']

MAX_LEN = 50 # Debe coincidir con tu entrenamiento

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        texto = data.get('command', '')
        
        if not texto:
            return jsonify({'error': 'No text provided'}), 400

        # 2. PREPROCESAR
        seq = tokenizer.texts_to_sequences([texto])
        pad_seq = pad_sequences(seq, maxlen=MAX_LEN, padding="post", truncating="post")
        
        # 3. PREDECIR
        probs = model.predict(pad_seq, verbose=0)
        pred_id = probs.argmax(axis=1)[0]
        intencion = id_to_label[pred_id]
        confianza = float(probs[0][pred_id])
        
        print(f"Comando: '{texto}' -> Intención: {intencion} ({confianza:.2%})")

        return jsonify({
            'intencion': intencion,
            'confianza': confianza
        })
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # host='0.0.0.0' es VITAL para que el APK pueda conectar desde el celular
    app.run(host='0.0.0.0', port=5000, debug=True)
