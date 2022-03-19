import skvideo.io
import skvideo.datasets
skvideo.setFFmpegPath("/Users/saelyne/opt/anaconda3/lib/python3.8/site-packages")

videogen = skvideo.io.vreader(skvideo.datasets.bigbuckbunny())
for frame in videogen:
    print(frame.shape)