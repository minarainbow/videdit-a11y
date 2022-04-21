import subprocess
import argparse
import os, sys

def detectFrames(videoID):

    sys.path.insert(0, 'third_party/CenterNet2/projects/CenterNet2/')
    os.system('python3 demo.py' + ' --config-file configs/Detic_LCOCOI21k_CLIP_SwinB_896b32_4x_ft4x_max-size.yaml' + ' --input ' + '../' + videoID + '/frames/' + ' --vocabulary custom' + ' --custom_vocabulary `cat '+ '../' + str(videoID)+'/nouns.txt`' + ' --confidence-threshold  0.3' + ' --opts MODEL.WEIGHTS models/Detic_LCOCOI21k_CLIP_SwinB_896b32_4x_ft4x_max-size.pth' )

if __name__=="__main__":
    
    a = argparse.ArgumentParser()
    a.add_argument("--videoID", help="videoID")
    args = a.parse_args()
    detectFrames(args.videoID)
    