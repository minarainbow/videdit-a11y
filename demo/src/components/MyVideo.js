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
            var currIndex, nextIndex, currSpan, nextSpan, currEnd, nextStart;
            var sequences = []
            var seq1 = [0, 30000]
            sequences.push(seq1)
            for (var i = 0; i < children.length - 1; i++) {
                currSpan = children[i];
                nextSpan = children[i + 1]
                currIndex = parseInt(currSpan.getAttribute("word-index"));
                nextIndex = parseInt(nextSpan.getAttribute("word-index"));
                const currEndTrim = currSpan.getAttribute("trim-end");
                const nextStartTrim = nextSpan.getAttribute("trim-start");
                // if jump is needed (because a sentence in between was deleted)
                if (nextIndex > currIndex + 1) {
                    currEnd = parseFloat(currSpan.getAttribute("data-end"));
                    nextStart = parseFloat(nextSpan.getAttribute("data-start"));
                    sequences[sequences.length - 1][1] = currEnd
                    sequences.push([nextStart, 30000])
                }
            }
            return sequences

        }, [])

    const sequences = span2Sequence(props.children)

    // if (sequences.length > 1) {
    //     console.log(sequences[0][0]*30, sequences[0][1]*30);
    //     console.log(sequences[1][0]*30, sequences[1][1]*30);
    // }

    return (
        <Series>
            {sequences.map((item, i) => (
                <Series.Sequence key={i} durationInFrames={parseInt(item[1] * 30) - parseInt(item[0] * 30)} offset={-3}>
                    <Video src={resolvedUrls[0]} startFrom={parseInt(item[0] * 30)}
                           endAt={parseInt(item[1] * 30)}/>
                </Series.Sequence>
            ))}
        </Series>
    );
}