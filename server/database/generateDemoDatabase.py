import csv
import random
from datetime import datetime

# Settings
languages = ['de', 'en', 'se']
entries_per_language = 10
hours = [f"{h:02}:00:00" for h in range(1, 24)]
words = list(range(0, 29))
today = datetime.today().strftime("%d.%m.%Y %H:%M")

# Create csv
filename = "database_demo.csv"
with open(filename, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f, quoting=csv.QUOTE_ALL)

    schedule_counter = 1
    for lang in languages:
        for i in range(1, entries_per_language + 1):
            row = []

            row.extend([
                f"schedule{schedule_counter:02}",
                lang,
                today,
                "markerIdentifier",
                f"Demo{lang.capitalize()}{i}"
            ])

            for j, hour in enumerate(hours, start=1):
                word_num = random.choice(words)
                order = ["word" + str(word_num), "color", "symbol"]
                random.shuffle(order)
                row.extend([f"markerTestTime{j}", hour, f"markerTestOrder{j}", ", ".join(order)])

            writer.writerow(row)
            schedule_counter += 1

print(f"CSV-File created: {filename}")
