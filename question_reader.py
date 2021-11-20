import csv

# No,Question,Option A,Option B,Option C,Option D,Correct Option,Amount For Correct Answer,Amount For Wrong Answer,
# Seconds Limit,Trivia,Safe Level


class QuestionSet:
    no_key = "No"
    question_key = "Question"
    option_a_key = "Option A"
    option_b_key = "Option B"
    option_c_key = "Option C"
    option_d_key = "Option D"
    correct_option_key = "Correct Option"
    amount_for_correct_answer = "Amount For Correct Answer"
    amount_for_wrong_answer = "Amount For Wrong Answer"
    seconds_limit = "Seconds Limit"
    trivia_key = "Trivia"
    safe_level_key = "Safe Level"

    def __init__(self):
        pass


def read_question_set_file(file_name):
    full_path = "questions_set/" + file_name
    print(full_path)
    csv_reader = csv.DictReader(full_path)
    line_count = 0
    for row in csv_reader:
        if line_count == 0:
            print(f'Column names are {", ".join(row)}')
            line_count += 1
        else:
            print(row)
        line_count += 1
