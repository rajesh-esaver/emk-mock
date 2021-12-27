# No,Question,Option A,Option B,Option C,Option D,Correct Option,Amount For Correct Answer,Amount For Wrong Answer,
# Seconds Limit,Trivia,Safe Level
import enum
import csv
import os
from os import listdir
from os.path import isfile, join


class QuestionSet:
    no_key = "No"
    question_key = "Question"
    option_a_key = "Option A"
    option_b_key = "Option B"
    option_c_key = "Option C"
    option_d_key = "Option D"
    correct_option_key = "Correct Option"
    amount_for_correct_answer_key = "Amount For Correct Answer"
    amount_for_wrong_answer_key = "Amount For Wrong Answer"
    seconds_limit = "Seconds Limit"
    trivia_key = "Trivia"
    safe_level_key = "Safe Level"

    json_question_key = "question"
    json_options_key = "options"
    json_correct_option_key = "correctOptionIndexes"
    json_win_amount_key = "winAmount"
    json_amount_won_for_wrong_key = "amountWonForWrong"
    json_trivia_key = "trivia"
    json_max_seconds_key = "maxSeconds"
    json_safe_level_key = "isSafeLevel"

    # constructor(question, options, correctOptionIdx, winAmount, amountWonForWrong, trivia, maxSeconds)
    def __init__(self, question, options, correct_option_indexes, win_amount, amount_won_for_wrong, trivia,
                 max_seconds, is_safe_level):
        self.question = question
        self.options = options
        self.correct_option_indexes = correct_option_indexes
        self.win_amount = win_amount
        self.amount_won_for_wrong = amount_won_for_wrong
        self.trivia = trivia
        self.max_seconds = max_seconds
        self.is_safe_level = is_safe_level

    def get_dict_format(self):
        return {
            QuestionSet.json_question_key: self.question,
            QuestionSet.json_options_key: self.options,
            QuestionSet.json_correct_option_key: self.correct_option_indexes,
            QuestionSet.json_win_amount_key: self.win_amount,
            QuestionSet.json_amount_won_for_wrong_key: self.amount_won_for_wrong,
            QuestionSet.json_trivia_key: self.trivia,
            QuestionSet.json_max_seconds_key: self.max_seconds,
            QuestionSet.json_safe_level_key: self.is_safe_level
        }


class OptionsEnum(enum.Enum):
    A = 0
    B = 1
    C = 2
    D = 3


def get_file_names():
    cwd = os.getcwd()
    cwd += "/questions_set"
    full_file_names = [os.path.join(cwd, f) for f in os.listdir(cwd) if os.path.isfile(os.path.join(cwd, f))]
    file_names = [os.path.basename(full_file_name) for full_file_name in full_file_names]
    # print(file_names)
    return file_names


def get_option_idx_by_name(option_name):
    option_idx = ""
    if option_name == OptionsEnum.A.name:
        option_idx = OptionsEnum.A.value
    elif option_name == OptionsEnum.B.name:
        option_idx = OptionsEnum.B.value
    elif option_name == OptionsEnum.C.name:
        option_idx = OptionsEnum.C.value
    elif option_name == OptionsEnum.D.name:
        option_idx = OptionsEnum.D.value
    return option_idx


def create_question_set(row):
    options = [row[QuestionSet.option_a_key], row[QuestionSet.option_b_key],
               row[QuestionSet.option_c_key], row[QuestionSet.option_d_key]]

    correct_options = row[QuestionSet.correct_option_key]
    correct_options = str(correct_options).split(",")
    correct_option_indexes = []
    for correct_option in correct_options:
        if correct_option.strip() == "":
            continue
        correct_option_idx = get_option_idx_by_name(correct_option.strip())
        if correct_option_idx != "":
            correct_option_indexes.append(correct_option_idx)
    # correct_option_idx = get_option_idx_by_name(row[QuestionSet.correct_option_key])

    questions_set = QuestionSet(row[QuestionSet.question_key],
                                options,
                                correct_option_indexes,
                                row[QuestionSet.amount_for_correct_answer_key],
                                row[QuestionSet.amount_for_wrong_answer_key],
                                row[QuestionSet.trivia_key],
                                row[QuestionSet.seconds_limit],
                                row[QuestionSet.safe_level_key])
    return questions_set


def read_question_set_file(file_name):
    full_path = "questions_set/" + file_name

    questions_set = []
    with open(full_path, mode='r', encoding='utf-16') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        line_count = 0
        for row in csv_reader:
            # if line_count == 0:
            #     # print(f'Column names are {", ".join(row)}')
            #     line_count += 1
            #     continue
            line_count += 1
            question_set = create_question_set(row)
            # print(question_set.get_dict_format())
            questions_set.append(question_set.get_dict_format())
    return questions_set

