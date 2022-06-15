import React, {useCallback, useEffect, useState} from "react";
import { Video, Series, OffthreadVideo, getInputProps } from "remotion";


const resolveRedirect = async (video) => {
  const res = await fetch(video);
  return res.url;
};

const preload = async (video) => {
  const url = await resolveRedirect(video);
//   console.log(url);
  const link = document.createElement("link");
  link.rel = "preload";
  link.href = url;
  link.as = "video";

  document.head.appendChild(link);
};

export default (props)=> {

    const [resolvedUrls, setResolvedUrls] = useState(["http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"])

    useEffect(() => {
        Promise.all([
            resolveRedirect(
                "https://storage.googleapis.com/videdita11y/sample.mp4"
            )
        ]).then((vids) => {
            vids.forEach((vid) => preload(vid));
            setResolvedUrls(vids);
        });
    }, [])

    const span2Sequence = useCallback((children)=>
    {
        var currIndex, nextIndex, currSpan, nextSpan, currStart, currEnd, nextStart, nextEnd, currSpeed, nextSpeed, currDuration;
        var sequences = []
        var seq1 = [0, 30000, 30000, 1]
        sequences.push(seq1)
        for (var i=0; i < children.length - 1; i++){
            currSpan = children[i];
            nextSpan = children[i+1]
            currIndex = parseInt(currSpan.getAttribute("word-index"));
            nextIndex = parseInt(nextSpan.getAttribute("word-index"));
            currSpeed = currSpan.getAttribute("data-playback");
            nextSpeed = nextSpan.getAttribute("data-playback");
            // currEndTrim = currSpan.getAttribute("trim-end");
            // nextStartTrim = nextSpan.getAttribute("trim-start");
            // if jump is needed (because a sentence in between was deleted)
            if (nextIndex > currIndex + 1  || currSpeed != nextSpeed) {
                currEnd = parseFloat(currSpan.getAttribute("data-end"));
                nextStart = parseFloat(nextSpan.getAttribute("data-start"));
                nextEnd = parseFloat(nextSpan.getAttribute("data-end"));
                currDuration = (currEnd - sequences[sequences.length-1][0]) / currSpeed;
                sequences[sequences.length-1][1] = currEnd;
                sequences[sequences.length-1][2] = currDuration;
                sequences[sequences.length-1][3] = currSpeed;
                sequences.push([nextStart, 30000, 30000, nextSpeed]);
            }
            
        }
        return sequences

    }, []);

    const sequences = span2Sequence(props.children)

        // if (sequences.length > 1) {
        //     console.log(sequences[0][0]*30, sequences[0][1]*30);
        //     console.log(sequences[1][0]*30, sequences[1][1]*30);
        // }

        return (
            <Series>
                    {sequences.map((item) => (
                    <Series.Sequence durationInFrames={parseInt(item[1]*29.97) - parseInt(item[0]*29.97)} offset={-10}>
                        <OffthreadVideo src={resolvedUrls[0]} startFrom={parseInt(item[0]*29.97)} endAt={parseInt(item[1]*29.97)} playbackRate={parseFloat(item[3])}/>
                    </Series.Sequence>
                    ))}
                </Series>
        );
    }
