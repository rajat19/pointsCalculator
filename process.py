import csv
import json


class FileHandling:
    @staticmethod
    def read_json(filename):
        f = open(filename, mode='r')
        data = json.load(f)
        f.close()
        return data
    
    @staticmethod
    def read_csv(filename) -> dict:
        f = open(filename, mode='r')
        csv_reader = csv.DictReader(f)
        data = []
        for row in csv_reader:
            data.append(row)
        f.close()
        return data

    @staticmethod
    def write_csv(filename: str, data: list, fieldnames: list):
        with open(filename, mode='w') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)

class WWE:
    def __init__(self):
        championships = FileHandling.read_json('championships.json')
        self.events = FileHandling.read_csv('mini.csv')
        self.primary_championships = championships['primary']
        self.secondary_championships = championships['secondary']
        self.tertiary_championships = championships['tertiary']
        self.tag_team_championships = championships['tag_team']
        self.women_championships = championships['women']
        self.women_tag_team_championships = championships['women_tag_team']
        self.single_championships = [
            self.primary_championships,
            self.secondary_championships,
            self.tertiary_championships
        ]

    def process(self):
        for row in self.events:
            


if __name__ == "__main__":
    wwe = WWE()
    wwe.process()