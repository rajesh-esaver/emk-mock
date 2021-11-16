from flask import Flask
from flask_socketio import SocketIO, send, emit
from flask import render_template


app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret'
socketio = SocketIO(app)


@app.route("/")
def get_contestant():
    return render_template("contestant.html")


@app.route("/host")
def get_host():
    return render_template("host.html")


@socketio.on("message")
def handle_message(msg):
    print("message "+str(msg))
    data = msg
    # send(msg, broadcast=True)
    # data = {"q": "one", "0":4}
    send(data, broadcast=True)


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
    # send("locked_answer", option_idx, broadcast=True)


@socketio.on("set_answer")
def set_answer(answer_obj):
    print("correct answer: " + str(answer_obj))
    emit("answer", answer_obj, broadcast=True)


if __name__ == "__main__":
    socketio.run(app)
