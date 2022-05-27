import math
import json

videoID = 'ZaQtx54N6iU'

with open(videoID + '/' + videoID + '-aligned-sents.json', "r") as read_file:
    sentences = json.load(read_file)
    json_list = []

    for sent in sentences:
        if sent["new_heading"] or sent["type"] == "pause" or sent["moving"]:
            json_list.append(sent)


with open(videoID + '/' + videoID + '-navigations.json', "w") as write_file:
    json.dump(json_list, write_file, indent=2, sort_keys=True)