#### Running:
python app.py <br>
Update server url in static/js/constants.js(base_url) file

Host needs to open: <br>
<base_url>/home_start<br>
<base_url>/host?file_name=user_1.csv

Contestant needs to open: <br>
<base_url>/


#### events
######Contestant side:<br/>

question: to receive the current question

curr_timer: to receive the current time left for the question

locked_answer: to receive the current locked answer

answer: to receive the current answer(right/wrong)<br>
{is_answered_correctly: False, correct_option: A, amount_won: 100}

lifelines: to receive the list of lifelines 

######Host side:<br/>

set_question: to set the current question

set_timer: to send current timer update

set_locked_answer: to set the current locked answer

set_answer: to receive the current answer(right/wrong)<br>
{is_answered_correctly: False, correct_option: A, amount_won: 100}

set_lifelines: to receive the list of lifelines <br>
{
  "lines": [
    {
      "used": "False",
      "name": "Life Line 1"
    },
    {
      "used": "True",
      "name": "Life Line 2"
    },
    {
      "used": "True",
      "name": "Life Line 3"
    }
  ],
  "show_life_lines": "False"
}



