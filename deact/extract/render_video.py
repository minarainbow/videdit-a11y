from bs4 import BeautifulSoup
from numpy import clip
from moviepy.editor import *

####### CHANGE THE FILE NAME BELOW #######
html_file = "./example.html"
original_video = VideoFileClip("./sample.mp4")
output_video_name = "merged.mp4"
##########################################

with open(html_file) as fp:
    soup = BeautifulSoup(fp, 'html.parser')

# Save all start and end timestamps
timestamps = []
for sentence in soup.find_all('div', {'class' : 'sentence'}):
    for word in sentence.find_all('span',  {"data-start" : True}):
        start = word["data-start"]
        end = word["data-end"]
        speed = word["data-playback"]
        timestamps.append((start, end, speed))
# print (timestamps)

# Merge timestamps
merged_timestamps = []
new = True
for i in range (len(timestamps)-1):
    if new:
        start = timestamps[i][0]
        speed = timestamps[i][2]
    if timestamps[i][1] == timestamps[i+1][0] and timestamps[i][2] == timestamps[i+1][2]:
        end = timestamps[i+1][1]
        new = False
    else:
        merged_timestamps.append((start, end, speed))
        new = True
merged_timestamps.append((start, timestamps[-1][1], timestamps[-1][2]))
# print (merged_timestamps)

# Cut and merge videos according to merged_timestamps
# https://codingdeekshi.com/python-3-moviepy-script-to-split-video-and-merge/
# loading video dsa gfg intro video
clips = []
for segment in merged_timestamps:
    clip = original_video.subclip(float(segment[0]), float(segment[1]))
    clip = clip.fx(vfx.speedx, float(segment[2]))
    clips.append(clip)
final = concatenate_videoclips(clips)
#writing the video into a file / saving the combined video
final.write_videofile(output_video_name)