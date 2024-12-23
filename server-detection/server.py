import time
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS, cross_origin
import cv2
import os
from ultralytics import YOLO
import logging
import torch

logging.getLogger("ultralytics").setLevel(logging.WARNING)

print(f"Cuda available: {torch.cuda.is_available()}")  # Debe retornar True si hay una GPU.

app = Flask(__name__)
CORS(app)

socketio = SocketIO(
    app, 
    cors_allowed_origins="*", 
    ping_timeout=30,  # Tiempo máximo (en segundos) para esperar un "pong"
    ping_interval=10  # Intervalo (en segundos) para enviar un "ping"
)

VIDEO_DIR = "data/videos/"
os.makedirs(VIDEO_DIR, exist_ok=True)

# Cargar modelo YOLOv8
model = YOLO("yolov8n.pt", verbose=False)
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"device used {device}")

# Diccionario para rastrear el estado de conexión de los clientes
client_connections = {}

@socketio.on("connect")
def handle_connect():
    client_connections[request.sid] = True
    print(f"user {request.sid} connected")
    emit("succes_connect", {"id": f"{request.sid}"})

@socketio.on("disconnect")
def handle_disconnect():
    client_connections[request.sid] = False
    print(f"user {request.sid} disconnected")
    emit("disconnect", {"id": f"{request.sid}"})

@socketio.on("keep_alive")
def handle_keep_alive(data):
    print(f"Keep-alive recibido: {data['message']}, usuario: {request.sid}")

@socketio.on('process_video')
def process_video(data):
    filename = data['filename']
    file_path = os.path.join(VIDEO_DIR, filename)

    if not os.path.exists(file_path):
        socketio.emit('error', {"message": "Video not found"})
        return

    print(f"Transmitiendo {filename} a {request.sid}")
    # Procesar el video con OpenCV
    cap = cv2.VideoCapture(file_path)
    cap.set(cv2.CAP_PROP_FPS, 15)  # Reducir FPS si no necesitas tiempo real completo
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)  # Cambiar a resoluciones más bajas
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = 0
    interval = 3  # Procesar un frame cada 5
    try:
        while cap.isOpened():
            # Verificar si el cliente aún está conectado
            if not client_connections.get(request.sid, False):
                print(f"Transmisión cancelada para el cliente {request.sid}")
                break

            ret, frame = cap.read()
            if not ret:
                print("frame no leído -> exit")
                break
            
            frame_count += 1
            if frame_count % interval == 0:
                # Momento actual del frame en segundos
                frame_time = frame_count / fps

                # Detección de objetos con YOLOv8
                processed_frame, metadata = detect_objects_with_metadata(frame, frame_time, frame_count)

                # Convertir frame para envío
                _, buffer = cv2.imencode('.jpg', processed_frame)
                frame_data = buffer.tobytes()
                socketio.emit('frame', {"frame": frame_data, "metadata": metadata}, to=request.sid)
                time.sleep(0)  # Controlar la tasa de envío de frames

    except Exception as e:
        print(f"Error durante la transmisión: {e}")
    finally:
        cap.release()
        socketio.emit('end_of_video', to=request.sid)
        print(f"Transmisión finalizada para el cliente {request.sid}")

        # print("Metadata generada:", metadata_list)

def detect_objects_with_metadata(frame, frame_time, frame_count):
    # Detectar objetos en el frame usando YOLOv8
    results = model.predict(source=frame, save=False, save_txt=False, conf=0.25, device=device, stream=True)
    metadata = {
        "frame_index": frame_count,
        "frame_time": frame_time,
        "detections": []
    }

    for result in results:
        for box in result.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())  # Coordenadas del bounding box
            confidence = float(box.conf[0])  # Confianza
            class_id = int(box.cls[0])  # Clase detectada
            label = model.names[class_id]

            # Agregar detección al metadata
            metadata["detections"].append({
                "class_id": class_id,
                "label": label,
                "confidence": confidence,
                "bounding_box": {"x1": x1, "y1": y1, "x2": x2, "y2": y2}
            })

            # Dibujar el bounding box en el frame
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(frame, f"{label}: {confidence:.2f}", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    return frame, metadata

# if __name__ == '__main__':
#     socketio.run(app, debug=True, host="0.0.0.0", port=5000)