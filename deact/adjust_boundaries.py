import json

boundaries = [111, 120, 198, 202, 248, 251, 315, 325, 326, 345, 358, 362, 387, 420]
videoID = 'ZaQtx54N6iU'


with open(videoID + '/' + videoID + '-aligned-sents.json', "r") as read_file:
    sentences = json.load(read_file)
    json_list = []
    next_is_new = False
    vf_index = 0
    s_index = 0

    while s_index < len(sentences):
        s = sentences[s_index]

        # end checking visuals
        if vf_index == len(boundaries):
            s["new_heading"] = False
            s["moving"] = False
            json_list.append(s)
            s_index = s_index + 1
            continue
       
        vf = boundaries[vf_index]
        # new heading
        if next_is_new:
            s["new_heading"] = vf
            s["moving"] = False
            json_list.append(s)
            vf_index = vf_index + 1
            s_index = s_index + 1
            next_is_new = False
            continue
            
        elif s["start"] < vf and s["end"] > vf:
            if (s["start"]+s["end"])/2 < vf:
                next_is_new = True
                s["new_heading"] = False
                s["heading"] = vf
                s["moving"] = False
                json_list.append(s)
                s_index = s_index + 1
                continue
            else:
                s["new_heading"] = vf
                s["moving"] = False
                json_list.append(s)
                vf_index = vf_index + 1
                s_index = s_index + 1
                continue
        elif s["start"] > vf and s["end"] > vf:
            json_list[-2]["sent"] = "Camera moving: " + json_list[-2]["sent"]
            json_list[-2]["words"].insert(0, {
            "end": json_list[-2]["start"],
            "sent_index": json_list[-2]["sent_index"],
            "start": json_list[-2]["start"],
            "word": "Camera moving:",
            "word_index": None
            },)
            json_list[-2]["moving"] = True
            vf_index = vf_index + 1
            continue
        else:
            s["new_heading"] = False
            s["moving"] = False
            json_list.append(s)
            s_index = s_index + 1
            continue

json_list[0]["new_heading"] = 0

with open(videoID + '/' + videoID + '-aligned-sents.json', "w") as write_file:
    json.dump(json_list, write_file, indent=2, sort_keys=True)