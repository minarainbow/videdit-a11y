import json
import re
videoID = 'ZaQtx54N6iU'

def group_sentences(json):
    # initialize variables
    json_list = []
    sent = "{"
    sent_start = 0
    sent_end = 0
    sent_index = 0
    new_sent = False
    grouped_words = []
    splitter = [".", "!", "?"]
    punct_pattern = re.compile("[" + re.escape("".join(splitter)) + "]")

    for word in json["words"]:
        # splitter 
        if re.search(punct_pattern, word["word"]):
            if new_sent:
                sent = "{"
                sent_start = word["start"]
                sent_index = sent_index+1
            sent = sent + word["word"] + "}"
            sent_end = word["end"]
            json_list.append(
                {"index": sent_index, "start": sent_start, "end": sent_end, "sent": sent, "type": "narration"}
            )
            # reset
            grouped_words = []
            sent = ""
            new_sent = True

        # long phrase followed by comma
        elif "," in word["word"] and len(grouped_words) >= 3:
            sent = sent + word["word"] + "}"
            sent_end = word["end"]
            json_list.append(
                {"index": sent_index, "start": sent_start, "end": sent_end, "sent": sent, "type": "narration"}
            )
            # reset
            grouped_words = []
            sent = ""
            new_sent = True

        # long pause: push piled words and new pause separately
        elif word["word"] == "{p}" and word["end"]-word["start"] >= 3:
            if not new_sent:
                sent = sent + "}"
                sent_end = word["end"]
                json_list.append(
                    {"index": sent_index, "start": sent_start, "end": sent_end, "sent": sent, "type": "narration"}
                )

            sent_index = sent_index+1
            sent = "{P: " + str(round(word["end"] - word["start"], 2)) + "sec}"
            json_list.append(
                {"index": sent_index, "start": word["start"], "end": word["end"], "sent": sent, "type": "pause"}
            )
            # reset
            grouped_words = []
            sent = ""
            new_sent = True
        
        # last word is the end of a sentence
        elif new_sent:
            sent_start = word["start"]
            sent_index = sent_index+1
            grouped_words.append(word["word"])
            if word["word"] == "{p}":
                sent = "{"
            else:
                sent = "{" + word["word"].replace("{p}", "") + " "
            new_sent = False

        else:
            grouped_words.append(word["word"])
            if word["word"] == "{p}":
                pass
            else:
                sent = sent + word["word"].replace("{p}", "") + " "
    return(json_list)

with open(videoID + '/' + videoID + '-aligned.json', "r") as read_file:
    stt = json.load(read_file)
    json_list = group_sentences(stt)

    with open(videoID + '/' + videoID + '-aligned-sents.json', "w") as write_file:
        json.dump(json_list, write_file, indent=2, sort_keys=True)