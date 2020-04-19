from operator import itemgetter as i
from functools import cmp_to_key
from python.constants import Constants
from python.file import FileHandler
from python.template import Template


class WWE:
    def __init__(self):
        championships = FileHandler.read_json('championships')
        self.primary_championships = championships['primary']
        self.secondary_championships = championships['secondary']
        self.tertiary_championships = championships['tertiary']
        self.tag_team_championships = championships['tag_team']
        self.women_championships = championships['women']
        self.women_tag_team_championships = championships['women_tag_team']
        self.single_championships = \
            self.primary_championships + \
            self.secondary_championships + \
            self.tertiary_championships
        self.male_championships = self.single_championships + self.tag_team_championships
        self.female_championships = self.women_championships + self.women_tag_team_championships
        self.male_wrestlers = {}
        self.female_wrestlers = {}

    def calculate_points(self):
        for wrestler, data in self.male_wrestlers.items():
            p = sum([data[c] for c in self.primary_championships])
            s = sum([data[c] for c in self.secondary_championships])
            t = sum([data[c] for c in self.tertiary_championships])
            tt = sum([data[c] for c in self.tag_team_championships])
            data['primary'] = p
            data['secondary'] = s
            data['tertiary'] = t
            data['tag_team'] = tt
            data['points'] = 3 * p + 2 * s + t + tt
            data['total'] = p + s + t + tt

        for wrestler, data in self.female_wrestlers.items():
            p = sum([data[c] for c in self.women_championships])
            tt = sum([data[c] for c in self.women_tag_team_championships])
            data['primary'] = p
            data['tag_team'] = tt
            data['points'] = 2 * p + tt
            data['total'] = p + tt

    @staticmethod
    def add_championship_to_wrestler(wrestlers, wrestler, template, championship):
        if wrestler not in wrestlers:
            wrestlers[wrestler] = dict(template)
        wrestlers[wrestler][championship] += 1

    def evaluate_single_championship(self, event, wrestlers, template, championships):
        for championship in championships:
            if championship in event and event[championship] != '':
                wrestler = event[championship]
                self.add_championship_to_wrestler(wrestlers, wrestler, template, championship)

    def evaluate_tag_team_championship(self, event, wrestlers, template, championships):
        for championship in championships:
            if championship in event and event[championship] != '':
                x = event[championship].split('/')
                wrestler1, wrestler2 = x[0], x[1]
                self.add_championship_to_wrestler(wrestlers, wrestler1, template, championship)
                self.add_championship_to_wrestler(wrestlers, wrestler2, template, championship)

    def evaluate(self):
        events = FileHandler.read_csv('events')
        male_template = Template.male(self.male_championships)
        female_template = Template.female(self.female_championships)
        for row in events:
            print('Evaluating event: ', row['Event'])
            self.evaluate_single_championship(row, self.male_wrestlers, male_template, self.single_championships)
            self.evaluate_single_championship(row, self.female_wrestlers, female_template, self.women_championships)
            self.evaluate_tag_team_championship(row, self.male_wrestlers, male_template, self.tag_team_championships)
            self.evaluate_tag_team_championship(row, self.female_wrestlers, female_template,
                                                self.women_tag_team_championships)

    @staticmethod
    def get_sorted_arr_from_obj(wrestler_obj: dict, columns: list) -> list:
        wrestler_arr = []
        for wrestler, data in wrestler_obj.items():
            obj = {'wrestler': wrestler}
            for k, v in data.items():
                obj[k] = v
            wrestler_arr.append(obj)

        comparers = [
            ((i(col[1:].strip()), -1) if col.startswith('-') else (i(col.strip()), 1))
            for col in columns
        ]

        def cmp(a, b):
            return (a > b) - (a < b)

        def comparer(left, right):
            comparer_iter = (
                cmp(fn(left), fn(right)) * mult
                for fn, mult in comparers
            )
            return next((result for result in comparer_iter if result), 0)
        return sorted(wrestler_arr, key=cmp_to_key(comparer))

    def process(self):
        self.evaluate()
        self.calculate_points()
        male_wrestlers_arr = self.get_sorted_arr_from_obj(self.male_wrestlers, Constants.sort_male_fields)
        female_wrestlers_arr = self.get_sorted_arr_from_obj(self.female_wrestlers, Constants.sort_female_fields)

        FileHandler.write_csv('male', male_wrestlers_arr)
        FileHandler.write_csv('female', female_wrestlers_arr)


if __name__ == "__main__":
    wwe = WWE()
    wwe.process()
