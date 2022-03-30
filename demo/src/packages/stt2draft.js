import generateEntitiesRanges from "./generateEntitiesRanges";

/**
 * groups words list from aligned transcript based on punctuation.
 * @todo To be more accurate, should introduce an honorifics library to do the splitting of the words.
 * @param {array} words - array of words objects from aligned transcript
 */

const groupWordsInParagraphs = (scriptData) => {
  const results = [];
  let paragraph = { words: [], text: [], reviews: [] };

  scriptData.forEach((word) => {
    // adjusting time reference attributes from
    // `start` `end` to `start` `end`
    // for word object
    const tmpWord = {
      text: word.sent,
      start: word.start,
      end: word.end,
      index: word.index,
      heading: word.new_heading,
      moving: word.moving,
      type: word.type,
    };
    if (word.new_heading && paragraph.words.length) {
      results.push(paragraph);
      // reset paragraph
      paragraph = { words: [], text: [], reviews: [] };
      paragraph.words.push(tmpWord);
      paragraph.text.push(word.sent);
    } else {
      paragraph.words.push(tmpWord);
      paragraph.text.push(word.sent);
    }

    if (word.moving || word.type === "pause") {
      paragraph.reviews.push(tmpWord)
    }
  });
  if (paragraph.words.length) {
    results.push(paragraph);
  }
  

  return results;
};

const stt2Draft = (autoEdit2Json) => {
  const results = [];
  const tmpWords = autoEdit2Json
  const wordsByParagraphs = groupWordsInParagraphs(tmpWords);
  wordsByParagraphs.forEach((paragraph, i) => {
    const draftJsContentBlockParagraph = {
      text: paragraph.text.join(" "),
      type: "paragraph",
      data: {
        heading: `Heading ${i+1}: ` + paragraph.words[0].heading,
        words: paragraph.words,
        start: paragraph.words[0].start,
        reviews: paragraph.reviews,
      },
      // the entities as ranges are each word in the space-joined text,
      // so it needs to be compute for each the offset from the beginning of the paragraph and the length
      entityRanges: generateEntitiesRanges(paragraph.words, "text"),
    };
    // console.log(JSON.stringify(draftJsContentBlockParagraph,null,2))
    results.push(draftJsContentBlockParagraph);
  });

  return results;
};

export default stt2Draft;
