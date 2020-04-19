class Constants:
    male_fields = ['total', 'points', 'primary', 'secondary', 'tertiary', 'tag_team']
    female_fields = ['total', 'points', 'primary', 'tag_team']
    sort_male_fields = ['-'+field for field in male_fields]
    sort_female_fields = ['-'+field for field in female_fields]
