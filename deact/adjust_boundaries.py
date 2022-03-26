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

        if vf_index == len(boundaries):
            s["new_heading"] = False
            s["moving"] = False
            json_list.append(s)
            s_index = s_index + 1
            continue
       
        vf = boundaries[vf_index]
        
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
            json_list[-2]["moving"] = True
            vf_index = vf_index + 1
            continue
        else:
            s["new_heading"] = False
            s["moving"] = False
            json_list.append(s)
            s_index = s_index + 1
            continue

with open(videoID + '/' + videoID + '-aligned-sents.json', "w") as write_file:
    json.dump(json_list, write_file, indent=2, sort_keys=True)