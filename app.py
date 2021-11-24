from flask import Flask
from flask_socketio import SocketIO, send, emit
from flask import render_template
from flask_ngrok import run_with_ngrok
from pyngrok import ngrok
from flask_cors import CORS


import question_reader

app = Flask(__name__)

app.config['SECRET_KEY'] = 'secret'
socketio = SocketIO(app)
# CORS(app)
# run_with_ngrok(app)


@app.route("/")
def get_contestant():
    return render_template("contestant.html")


@app.route("/host")
def get_host():
    return render_template("host.html")


@app.route("/home_start")
def get_home_start():
    return render_template("home_start.html")


@socketio.on("message")
def handle_message(msg):
    print("message "+str(msg))
    data = msg
    # send(msg, broadcast=True)
    # data = {"q": "one", "0":4}
    send(data, broadcast=True)


@socketio.on('get_file_names')
def get_file_names():
    file_names = question_reader.get_file_names()
    print("Filenames: "+str(file_names))
    # sending back the questions list
    emit("get_file_names", file_names)


@socketio.on('get_question_set')
def get_question_set(file_name):
    questions_set = question_reader.read_question_set_file(file_name)
    print("No of questions: "+str(len(questions_set)))
    # sending back the questions list
    emit("get_question_set", questions_set)


@socketio.on('set_timer')
def set_timer(curr_timer):
    # print(curr_timer)
    # using events not namespace
    # if we don't specify broadcast it just replies back to the client which made this call
    # broadcast true will send to all the connected clients
    emit("curr_timer", curr_timer, broadcast=True)


@socketio.on("set_question")
def set_answer(question_obj):
    print("question : " + str(question_obj))
    emit("question", question_obj, broadcast=True)


@socketio.on("set_locked_answer")
def set_locked_answer(option_idx):
    print("locked answer: "+str(option_idx))
    emit("locked_answer", option_idx, broadcast=True)


@socketio.on("set_answer")
def set_answer(answer_obj):
    print("correct answer: " + str(answer_obj))
    emit("answer", answer_obj, broadcast=True)


@socketio.on("set_lifelines")
def set_lifelines(lifelines_obj):
    print("Lifelines: " + str(lifelines_obj))
    emit("lifelines", lifelines_obj, broadcast=True)


if __name__ == "__main__":
    # question_reader.get_file_names()
    # map_url = ngrok.connect(5000)
    # print(map_url)
    # to run as sudo, sudo venv/bin/python3.7 app.py
    # if we run at host "0.0.0.0" then we can access the server using it's ip
    # from other machines which are in the same network
    socketio.run(app, host="0.0.0.0", port=5000)

