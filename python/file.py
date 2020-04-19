import csv
import json
from typing import List


class FileHandler:
    @staticmethod
    def read_json(filename: str) -> dict:
        filepath = './data/{filename}.json'.format(filename=filename)
        f = open(filepath, mode='r')
        data = json.load(f)
        f.close()
        return data

    @staticmethod
    def read_csv(filename: str) -> list:
        filepath = './data/{filename}.csv'.format(filename=filename)
        f = open(filepath, mode='r')
        csv_reader = csv.DictReader(f)
        data = []
        for row in csv_reader:
            data.append(row)
        f.close()
        return data

    @staticmethod
    def write_csv(filename: str, data: List[dict]):
        fieldnames = data[0].keys()
        filepath = './out/{filename}.csv'.format(filename=filename)
        with open(filepath, mode='w') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)
        print('update csv done')
