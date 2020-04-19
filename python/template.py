from python.constants import Constants


class Template:
    @staticmethod
    def male(championships: list):
        obj = {}
        for field in Constants.male_fields:
            obj[field] = 0
        for championship in championships:
            obj[championship] = 0
        return obj

    @staticmethod
    def female(championships: list):
        obj = {}
        for field in Constants.female_fields:
            obj[field] = 0
        for championship in championships:
            obj[championship] = 0
        return obj
