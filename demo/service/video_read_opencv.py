import numpy as np
import cv2
cap = cv2. VideoCapture('example.mp4')
while(cap. isOpened()):
    ret, frame = cap. read()