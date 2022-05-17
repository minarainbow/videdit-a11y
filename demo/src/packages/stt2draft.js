import generateEntitiesRanges from "./generateEntitiesRanges";

/**
 * groups words list from aligned transcript based on punctuation.
 * @todo To be more accurate, should introduce an honorifics library to do the splitting of the words.
 * @param {array} words - array of words objects from aligned transcript
 */

// const groupWordsInParagraphs = (scriptData) => {
//   const results = [];
//   let paragraph = { words: [], text: [], reviews: [] };

//   scriptData.forEach((word) => {
//     // adjusting time reference attributes from
//     // `start` `end` to `start` `end`
//     // for word object
//     const tmpWord = {
//       text: word.sent,
//       start: word.start,
//       end: word.end,
//       index: word.index,
//       heading: word.new_heading,
//       moving: word.moving,
//       type: word.type,
//     };
//     if (word.new_heading && paragraph.words.length) {
//       results.push(paragraph);
//       // reset paragraph
//       paragraph = { words: [], text: [], reviews: [] };
//       paragraph.words.push(tmpWord);
//       paragraph.text.push(word.sent + "\n");
//     } else {
//       paragraph.words.push(tmpWord);
//       paragraph.text.push(word.sent+ "\n");
//     }

//     if (word.moving || word.type === "pause") {
//       paragraph.reviews.push(tmpWord)
//     }
//   });
//   if (paragraph.words.length) {
//     results.push(paragraph);
//   }

//   return results;
// };

const stt2Draft = (scriptData) => {
  const results = [];
  const tmpWords = scriptData;
  // const wordsByParagraphs = groupWordsInParagraphs(tmpWords);
  const sentences = tmpWords;
  var scene_num = 0;
  sentences.forEach((sentence, i) => {
    const draftJsContentBlockParagraph = {
      text: sentence.sent,
      type: "sentence",
      data: {
        heading:
          sentence.new_heading || !i
            ? `Scene ${scene_num}: ` + sentence.new_heading
            : null,
        words: sentence.words,
        start: sentence.start,
        moving: sentence.moving,
        type: sentence.type,
      },
      // the entities as ranges are each word in the space-joined text,
      // so it needs to be compute for each the offset from the beginning of the paragraph and the length
      entityRanges: generateEntitiesRanges(sentence, "word"),
    };
    if (sentence.new_heading || !i) scene_num = scene_num + 1;
    // console.log(JSON.stringify(draftJsContentBlockParagraph,null,2))
    results.push(draftJsContentBlockParagraph);
  });

  return results;
};

export default stt2Draft;
