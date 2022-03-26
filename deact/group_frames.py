import math
import json

window_size = 4
videoID = 'ZaQtx54N6iU'


def clean_set(objects):
    for i in range(len(objects)):
        objects[i] = objects[i].lower() 
    return set(objects)

def check_group_cond(new_f, prev_union):
    num_elems = len(new_f)
    intersection = new_f.intersection(prev_union)
    if num_elems > 3:
        if len(intersection) >= math.ceil(num_elems/2):
            return True
        return False
    elif num_elems > 0:
        if len(intersection) >= 1:
            return True
        return False
    else:
        if len(prev_union) <= 2:
            return True
        return False


def sliding_window(frames, window_size):
    if  len(frames) <= window_size:
        return frames

    group_index = 0
    outlier = []
    boundaries = []
    for i in range(len(frames) - window_size):
        # reset condition for new window
        is_group = False
        prev_union = set()

        new_f = clean_set(frames[i+window_size]["detected_objects"])

        for j in range(window_size):
            if i+j in outlier:
                continue
            prev_f = clean_set(frames[i+j]["detected_objects"])
            prev_union = prev_union.union(prev_f)
        if check_group_cond(new_f, prev_union):
            pass
        elif len(outlier) < 2:
            outlier.append(i+window_size)
        else:
            group_index = group_index+1
            if outlier[0] >= i+window_size -2:
                boundaries.append(outlier[0])
            elif outlier[1] >= i+window_size -2:
                boundaries.append(outlier[-1])
            else:
                boundaries.append(i+window_size)
            outlier = []
    return boundaries


with open(videoID + '/detection_results.json', "r") as json_file:
    frames = json.load(json_file)
    print(sliding_window(frames, window_size))