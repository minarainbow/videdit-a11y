import json
import re
videoID = 'ZaQtx54N6iU'

def group_sentences(json):
    # initialize variables
    sent_list = []
    sent = ""
    sent_start = 0
    sent_end = 0
    word_end = 0
    sent_index = 0
    word_index = 0
    new_sent = True
    word_list = []
    splitter = [".", "!", "?"]
    punct_pattern = re.compile("[" + re.escape("".join(splitter)) + "]")

    for result in json["results"]:
        if len(result["alternatives"][0]) == 0:
            continue
        for word in result["alternatives"][0]["words"]:
            
            # splitter 
            if re.search(punct_pattern, word["word"]):
                if new_sent:
                    sent = ""
                    sent_start = round(float(word["startTime"][:-1]), 2)
                word_list.append(
                    {"word_index": word_index, "sent_index": sent_index, "word": word["word"], "start": word_end, "end": round(float(word["endTime"][:-1]), 2)}
                )
                word_end = round(float(word["endTime"][:-1]), 2)
                word_index = word_index +1
                sent = sent + word["word"] 
                sent_list.append(
                    {"sent_index": sent_index, "start": sent_end, "end": round(float(word["endTime"][:-1]), 2), "sent": sent, "type": "narration", "words": word_list}
                )

                sent_index = sent_index +1
                sent_end = round(float(word["endTime"][:-1]), 2)
                # reset
                word_list = []
                sent = ""
                new_sent = True

            # long phrase followed by comma
            elif "," in word["word"] and len(word_list) >= 3:
                word_list.append(
                    {"word_index": word_index, "sent_index": sent_index, "word": word["word"], "start": word_end, "end": round(float(word["endTime"][:-1]), 2)}
                )
                word_end = round(float(word["endTime"][:-1]), 2)
                word_index = word_index +1
                sent = sent + word["word"] 
                sent_list.append(
                    {"sent_index": sent_index, "start": sent_end, "end": round(float(word["endTime"][:-1]), 2), "sent": sent, "type": "narration", "words": word_list}
                )
                sent_index = sent_index +1
                sent_end = round(float(word["endTime"][:-1]), 2)
                # reset
                word_list = []
                sent = ""
                new_sent = True
            
            # last word is the end of a sentence
            elif new_sent:
                # add pause
                sent_start = round(float(word["startTime"][:-1]), 2)
                if sent_start - sent_end > 3:
                    sent_list.append(
                        {"sent_index": sent_index, "start": sent_end, "end": sent_start, "sent": "Pause: " + str(round(sent_start-sent_end, 2)) + "seconds", "type": "pause", "words": [{
                            "end": sent_start,
                            "sent_index": sent_index,
                            "start": sent_end,
                            "word": "Pause: " + str(round(sent_start-sent_end, 2)) + "seconds", 
                            "word_index": word_index
                        }]}
                    )
                    sent_index = sent_index+1
                    sent_end = sent_start
                    word_end = sent_start
                    word_index = word_index+1
                # else
                word_list.append(
                    {"word_index": word_index, "sent_index": sent_index, "word": word["word"], "start": word_end, "end": round(float(word["endTime"][:-1]), 2)}
                )
                word_end = round(float(word["endTime"][:-1]), 2)
                word_index = word_index +1
                sent = word["word"] + " "
                new_sent = False

            else:
                word_list.append(
                    {"word_index": word_index, "sent_index": sent_index, "word": word["word"], "start": word_end, "end": round(float(word["endTime"][:-1]), 2)}
                )
                word_end = round(float(word["endTime"][:-1]), 2)
                word_index = word_index +1
                sent = sent + word["word"] + " "
        
    return(sent_list)


with open(videoID + '/' + videoID + '-google-stt.json', "r") as read_file:
    stt = json.load(read_file)
    json_list = group_sentences(stt)

    with open(videoID + '/' + videoID + '-aligned-sents.json', "w") as write_file:
        json.dump(json_list, write_file, indent=2, sort_keys=True)







# below is outdated (for CMU Sphinx output)
def old_group_sentences(json):
    # initialize variables
    json_list = []
    sent = ""
    sent_start = 0
    sent_end = 0
    sent_index = 0
    new_sent = True
    grouped_words = []
    splitter = [".", "!", "?"]
    punct_pattern = re.compile("[" + re.escape("".join(splitter)) + "]")

    for word in json["words"]:
        # splitter 
        if re.search(punct_pattern, word["word"]):
            if new_sent:
                sent = ""
                sent_start = word["start"]
                sent_index = sent_index+1
            sent = sent + word["word"] 
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
            sent = sent + word["word"] 
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
                sent = sent 
                sent_end = word["end"]
                json_list.append(
                    {"index": sent_index, "start": sent_start, "end": sent_end, "sent": sent, "type": "narration"}
                )

            sent_index = sent_index+1
            sent = "Pause: " + str(round(word["end"] - word["start"], 2)) + "sec"
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
                sent = ""
            else:
                sent = word["word"].replace("{p}", "") + " "
            new_sent = False

        else:
            grouped_words.append(word["word"])
            if word["word"] == "{p}":
                pass
            else:
                sent = sent + word["word"].replace("{p}", "") + " "
    return(json_list)

# with open(videoID + '/' + videoID + '-aligned.json', "r") as read_file:
#     stt = json.load(read_file)
#     json_list = group_sentences(stt)

#     with open(videoID + '/' + videoID + '-aligned-sents.json', "w") as write_file:
#         json.dump(json_list, write_file, indent=2, sort_keys=True)