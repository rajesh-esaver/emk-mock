## About
This is a mock game of KBC/EMK(Evaru Meelo Koteeswarulu) which is intended to play in area just like the actual game show.
<br/>
[Sample Game Played](https://www.youtube.com/watch?v=HI4OKulLlvM)

### Installing
Create python virtual environment:<br/>
python3 -m venv env <br/>
source env/bin/activate <br/>

Install packages:<br/>
pip install -r requirements.txt <br/>

### Running
python app.py <br>

Host needs to open: <br>
<base_url>/home_start<br>
<base_url>/host?file_name=template.csv

Contestant needs to open: <br>
<base_url>/

Audience can open: <br>
<base_url>/spectator

Url codes can be shown in: <br>
<base_url>/url_qr

### Questions Set
Create a CSV file with questions and options and place file under **questions_set/** directory <br/>
Sample question set file: **template.csv**


### Notes
- Other details can be found at **info.txt** file.