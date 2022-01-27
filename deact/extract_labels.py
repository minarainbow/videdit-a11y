import spacy

nlp = spacy.load("en_core_web_md")
path = './ZaQtx54N6iU/ZaQtx54N6iU.txt'
with open(path, 'r') as file_to_read:
    subtitle = file_to_read.read()
    doc = nlp(subtitle)
noun_labels = []
verb_labels = []

for token in doc:
    if token.tag_.startswith('NN'):
        noun_labels.append(token.lemma_)
    elif token.tag_.startswith('VB'):
        verb_labels.append(token.lemma_)

with open('./ZaQtx54N6iU/nouns.txt', 'w') as f:
    f.write(','.join(noun_labels))

